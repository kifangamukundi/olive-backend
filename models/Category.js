const mongoose = require('mongoose');

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

module.exports = mongoose.model('Category', categorySchema);