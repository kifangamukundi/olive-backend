const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  }
});
paymentSchema.statics.getPaymentsByBooking = function(bookingId) {
    return this.find({ booking: bookingId });
};

paymentSchema.statics.getTotalRevenue = function(startDate, endDate) {
return this.aggregate([
    {
    $match: {
        paymentDate: {
        $gte: startDate,
        $lte: endDate
        }
    }
    },
    {
    $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" }
    }
    }
]);
};

paymentSchema.statics.getPaymentsByGuest = function(guestId) {
    return this.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "booking",
          foreignField: "_id",
          as: "booking"
        }
      },
      {
        $unwind: "$booking"
      },
      {
        $match: {
          "booking.guest": guestId
        }
      },
      {
        $project: {
          _id: 1,
          booking: "$booking._id",
          amount: 1,
          paymentDate: 1
        }
      }
    ]);
};
  
    
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
