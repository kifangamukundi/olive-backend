const mongoose = require('mongoose');
const Room = require('./Room');

const bookingSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  guestName: {
    type: String,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

bookingSchema.statics.getBookingsForRoom = async function (roomId) {
    const bookings = await this.find({ roomId });
    return bookings;
  };
  
  bookingSchema.statics.getTotalRevenue = async function () {
    const bookings = await this.find({});
    const totalRevenue = bookings.reduce((total, booking) => total + booking.totalPrice, 0);
    return totalRevenue;
  };
  
  bookingSchema.methods.calculateTotalPrice = async function () {
    const room = await Room.findById(this.roomId);
    const numDays = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
    const totalPrice = room.pricePerNight * numDays;
    this.totalPrice = totalPrice;
  };

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
