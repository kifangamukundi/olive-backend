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
        // CallBackURL: `${callbackurl}`,
        CallBackURL: "https://96c7-105-161-195-62.eu.ngrok.io/api/mpesa/stkpush/callback",
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
    
    res.status(200).json({ sucess: true, message: "STK Push request successful", data:{mpesa: result.data} });
  } catch (err) {
    next(err);
  }   
};

// @desc    Receive the result of the transaction via callback url
exports.stkcallback = async (req, res, next) => {
  console.log("callback was called")
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

// checking for processing results
exports.stkpushquery = async (req, res, next) => {
  const {CheckoutRequestID} = req.body;

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

  const querypoint = process.env.MPESA_QUERY_ENDPOINT;

  const password = new Buffer.from(businessShortCode + passkey + timestamp).toString(
    "base64"
  );
  
  const token = req.token;
  try {
    const result = await axios.post(
      querypoint,
      {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: CheckoutRequestID,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(result)
    res.status(200).json({ sucess: true, message: "Query received", data:{mpesa: result.data} });
  } catch (err) {
    next(err)
  }
};