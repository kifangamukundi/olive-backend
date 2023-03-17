const mongoose = require('mongoose');
const Booking = require('./Booking');

const guestSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

guestSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'guestId'
});

guestSchema.methods.getTotalSpent = async function () {
  const bookings = await Booking.find({ guestId: this._id });
  const totalSpent = bookings.reduce((total, booking) => total + booking.totalPrice, 0);
  return totalSpent;
};

const Guest = mongoose.model('Guest', guestSchema);

module.exports = Guest;
