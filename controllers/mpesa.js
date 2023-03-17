const axios = require('axios');
const ErrorResponse = require("../utils/errorResponse");
const Mpesa = require("../models/Mpesa");

// @desc    Initiate mpesa payment
exports.stkpush = async (req, res, next) => {
  const { phone, amount } = req.body;

  // Check if phone number and amount is provided
  if (!phone || !amount) {
    return next(new ErrorResponse("Please provide an phone number and amount", 400));
  }

  // Generate a transaction ID
  const transaction_id = `MPESA${Date.now()}`;

  // Save the STK Push request to the database
  const stkPush = new Mpesa({
    phone,
    amount,
    transaction_id
  });

  await stkPush.save();

  // Generating a timestamp
  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);

  const businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;

  const endpoint = process.env.MPESA_ENDPOINT;
  const callbackurl = process.env.MPESA_CALLBACK_URL;

  const password = new Buffer.from(businessShortCode + passkey + timestamp).toString(
    "base64"
  );
  
  const token = req.token;

  try {
    const result = await axios.post(
      endpoint,
      {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: `254${phone.substring(1)}`, // replace with test phone number
        PartyB: businessShortCode,
        PhoneNumber: `254${phone.substring(1)}`, // replace with test phone number
        CallBackURL: `${callbackurl}`,
        AccountReference: `254${phone.substring(1)}`,
        TransactionDesc: "Test",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!result) {
      return next(new ErrorResponse("STK Push request Failed", 400));
    }

    stkPush.status = 'Initiated';
    stkPush.save();
    
    console.log(result.data);

    res.status(200).json({
      success: true,
      data: "STK Push request initiated",
    });
  } catch (err) {
    next(err);
  }   
};

// @desc    Receive the result of the transaction via callback url
exports.stkcallback = async (req, res, next) => {

  const { Body: { stkCallback: { ResultCode, ResultDesc, CallbackMetadata } } } = req.body;
  const { Item: [{ Name, Value }] } = CallbackMetadata;

  try {
    // Find the STK Push transaction in the database using the transaction ID
    Mpesa.findOne({ transaction_id: Value }, (err, stkPush) => {
        if (err || !stkPush) {
            console.error(err);
            return next(new ErrorResponse("Something went wrong during Processing", 500));
        }

        // Update the status of the STK Push transaction based on the result code
        if (ResultCode === 0) {
        stkPush.status = 'Completed';
        } else {
        stkPush.status = 'Failed';
        }
        stkPush.save();

        // Send a response to M-Pesa to confirm receipt of the callback
        res.status(200).json({ success: true, data: "Callback received" });
    });
  } catch (err) {
    next(err);
  }
};