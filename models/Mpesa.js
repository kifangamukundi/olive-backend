const mongoose = require("mongoose");

const MpesaSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, "Please provide phone number"],
  },
  amount: {
    type: Number,
    required: [true, "Please provide an amount"],
  },
  transaction_id: {
    type: String,
  },
  status: {
    type: String,
    default: 'Pending',
  },
  receipt_number: {
    type: String,
  },
  transaction_date: {
    type: Date,
  },
  phone_number: {
    type: String,
  },
  ResultDesc: {
    type: String,
  },
  
//   Other dynamic fields
},
{
    timestamps: true
});

// Methods here

const Mpesa = mongoose.model("Mpesa", MpesaSchema);

module.exports = Mpesa;
