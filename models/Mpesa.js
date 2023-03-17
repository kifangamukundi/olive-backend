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
    required: [true, "Please provide transaction Id"],
  },
  status: {
    type: String,
    default: 'Pending',
  },
  
//   Other dynamic fields
},
{
    timestamps: true
});

// Methods here

const Mpesa = mongoose.model("Mpesa", MpesaSchema);

module.exports = Mpesa;
