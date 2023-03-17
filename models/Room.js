const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: String,
  amenities: [String],
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

roomSchema.statics.findByCapacity = function (capacity) {
    return this.find({ capacity: { $gte: capacity } });
};

roomSchema.statics.findByPriceRange = function (minPrice, maxPrice) {
    return this.find({ price: { $gte: minPrice, $lte: maxPrice } });
};

roomSchema.statics.getAvailableRooms = function () {
    return this.find({ isAvailable: true });
};

roomSchema.methods.bookRoom = function (roomId) {
    this.isAvailable = false;
    return this.save();
};
  
  
  

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
