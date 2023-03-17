const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

exports.getPaymentsRoute = async (req, res, next) => {
    try {
      const payments = await Payment.find();
      res.status(200).json({ success: true, message: "Success", data: { payments: payments } });
    } catch (err) {
      next(err);
    }
  };
  
  exports.getPaymentDetailsRoute = async (req, res, next) => {
    try {
      const payment = await Payment.findById(req.params.paymentId);
      if (!payment) {
        return res.status(404).json({ success: false, message: "Payment not found" });
      }
      res.status(200).json({ success: true, message: "Success", data: { payment: payment } });
    } catch (err) {
      next(err);
    }
  };
  
  exports.createPaymentRoute = async (req, res, next) => {
    const { amount, method, bookingId } = req.body;
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      const payment = await Payment.create({
        amount,
        method,
        booking: booking._id,
      });
      res.status(201).json({ success: true, message: "Success", data: { payment: payment } });
    } catch (err) {
      next(err);
    }
  };
  
  exports.updatePaymentRoute = async (req, res, next) => {
    const { amount, method } = req.body;
    try {
      const payment = await Payment.findByIdAndUpdate(
        req.params.paymentId,
        { amount, method },
        { new: true }
      );
      if (!payment) {
        return res.status(404).json({ success: false, message: "Payment not found" });
      }
      res.status(200).json({ success: true, message: "Success", data: { payment: payment } });
    } catch (err) {
      next(err);
    }
  };
  