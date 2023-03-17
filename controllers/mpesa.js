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

// Other helper functions

// LIPA NA M-PESA ONLINE API also know as M-PESA express (STK Push)
// https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest

// Request
// {    
//   "BusinessShortCode":"174379",    
//   "Password": "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMTYwMjE2MTY1NjI3",    
//    "Timestamp":"20160216165627",    
//    "TransactionType": "CustomerPayBillOnline",    
//   "Amount":"1",    
//  "PartyA":"254708374149",    
//   "PartyB":"174379",    
//  "PhoneNumber":"254708374149",    
//  "CallBackURL":"https://mydomain.com/pat",    
//  "AccountReference":"Test",    
//  "TransactionDesc":"Test"
// }

// Response
// {    
//   "MerchantRequestID": "29115-34620561-1",    
//   "CheckoutRequestID": "ws_CO_191220191020363925",    
//   "ResponseCode": "0",    
//   "ResponseDescription": "Success. Request accepted for processing",    
//   "CustomerMessage": "Success. Request accepted for processing"
// }

// Callback Response Success
// {    
//   "Body": {        
//      "stkCallback": {            
//         "MerchantRequestID": "29115-34620561-1",            
//         "CheckoutRequestID": "ws_CO_191220191020363925",            
//         "ResultCode": 0,            
//         "ResultDesc": "The service request is processed successfully.",            
//         "CallbackMetadata": {                
//            "Item": [{                        
//               "Name": "Amount",                        
//               "Value": 1.00                    
//            },                    
//            {                        
//               "Name": "MpesaReceiptNumber",                        
//               "Value": "NLJ7RT61SV"                    
//            },                    
//            {                        
//               "Name": "TransactionDate",                        
//               "Value": 20191219102115                    
//            },                    
//            {                        
//               "Name": "PhoneNumber",                        
//               "Value": 254708374149                    
//            }]            
//         }        
//      }    
//   }
// }

// Callback Response Fail
// {    
//   "Body": {
//      "stkCallback": {
//         "MerchantRequestID": "29115-34620561-1",
//         "CheckoutRequestID": "ws_CO_191220191020363925",
//         "ResultCode": 1032,
//         "ResultDesc": "Request cancelled by user."
//      }
//   }
// }


// Lipa Na MPesa Online Query API - API to check the status of a Lipa Na M-Pesa Online Payment.
// https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query

// request
// {
//   "BusinessShortCode": "174379",
//   "Password": "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMTkwOTIzMDc0MTIw",
//   "Timestamp": "20190923074120",
//   "CheckoutRequestID": "ws_CO_260520211133524545"
// }

// Response
// {
//   "ResponseCode": "0",
//   "ResponseDescription":"The service request has been accepted successsfully",
//   "MerchantRequestID":"22205-34066-1",
//   "CheckoutRequestID":"ws_CO_13012021093521236557",
//   "ResultCode": "0",
//   "ResultDesc":"The service request is processed successfully."
// }
