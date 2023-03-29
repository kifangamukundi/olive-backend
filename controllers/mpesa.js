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

    // Save the STK Push request to the database
    const stkPush = new Mpesa({
      phone,
      amount,
      status: 'Initiated',
      transaction_id: result.data.CheckoutRequestID,
    });

    await stkPush.save();
    
    res.status(200).json({ sucess: true, message: "STK Push request successful", data:{mpesa: result.data} });
  } catch (err) {
    next(err);
  }   
};

exports.stkcallback = async (req, res, next) => {
  console.log("callback was called");
  console.log(req.body)

  // Extract the relevant data from the request body
  const { Body: { stkCallback: { ResultCode, ResultDesc, CallbackMetadata } = {} } = {} } = req.body;

  try {
    if (ResultCode === "0") {
      // Handle success case
      if (!CallbackMetadata) {
        // If CallbackMetadata is missing, log an error and return a 500 response
        console.error("CallbackMetadata is missing");
        return res.status(500).json({ success: false, error: "CallbackMetadata is missing" });
      }
      console.log({CallbackMetadata: CallbackMetadata})
      // Extract the data from the CallbackMetadata object
      const { Item: [{ Name: amountName, Value: amountValue }, { Name: receiptName, Value: receiptValue }, { Name: dateName, Value: dateValue }, { Name: phoneName, Value: phoneValue }] } = CallbackMetadata;

      // Find the STK Push transaction in the database using the transaction ID
      const mpesa = await Mpesa.findOne({ transaction_id: req.body.Body.stkCallback.CheckoutRequestID });

      if (!mpesa) {
        // If the STK Push transaction is not found, log an error and return a 500 response
        console.error("STK Push transaction not found");
        return res.status(500).json({ success: false, error: "STK Push transaction not found" });
      }

      // Update the status of the STK Push transaction based on the result code
      mpesa.status = 'Completed';
      mpesa.amount = amountValue;
      mpesa.receipt_number = receiptValue;
      mpesa.transaction_date = dateValue;
      mpesa.phone_number = phoneValue;
      mpesa.ResultDesc = ResultDesc;

      await mpesa.save();

      // Send a response to M-Pesa to confirm receipt of the callback
      res.status(200).json({ success: true, data: "Callback received" });
    } else {
      // Handle failure case
      // Find the STK Push transaction in the database using the transaction ID
      const mpesa = await Mpesa.findOne({ transaction_id: req.body.Body.stkCallback.CheckoutRequestID });

      if (!mpesa) {
        // If the STK Push transaction is not found, log an error and return a 500 response
        console.error("STK Push transaction not found");
        return res.status(500).json({ success: false, error: "STK Push transaction not found" });
      }

      // Update the status of the STK Push transaction based on the result code
      mpesa.status = 'Failed';
      mpesa.ResultDesc = ResultDesc;
      await mpesa.save();

      // Send a response to M-Pesa to confirm receipt of the callback
      res.status(200).json({ success: true, data: "Callback received" });
    }
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
    res.status(200).json({ sucess: true, message: "Query received", data:{mpesa: result.data} });
  } catch (err) {
    next(err)
  }
};