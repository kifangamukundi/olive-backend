const mongoose = require('mongoose');
const Room = require("../models/Room");

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please a title"],
    unique: true,
  },
  slug: {
    type: String,
    required: [true, "Please a slug"],
    unique: true,
  },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
});

categorySchema.pre('remove', async function (next) {
  try {
    // Remove category reference from related rooms
    const Room = mongoose.model('Room');
    await Room.updateMany({ categories: this._id }, { $pull: { categories: this._id } });
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Category', categorySchema);