const mongoose = require('mongoose');
const Category = require("../models/Category");

const roomSchema = new mongoose.Schema({
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
  summary: {
    type: String,
    required: [true, "Please the summary"],
  },
  content: {
    type: Object,
    required: [true, "Please a content"],
  },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  roomType: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType' },
  defaultImage: {
    secure_url: {
      type: String,
      required: false,
      default: "default_secure_url"
    },
    public_id: {
      type: String,
      required: false,
      default: "default_public_id"
    }
  },
  otherImages: [{
    secure_url: {
      type: String,
      required: false
    },
    public_id: {
      type: String,
      required: false
    }
  }],
  capacity: {
    type: Number,
    required: [true, "Capacity required"],
  },
  price: {
    type: Number,
    required: [true, "Price required"],
  },
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

roomSchema.pre('remove', async function(next) {
  try {
    // Remove the reference to the parent RoomType from this Room
    await this.model('RoomType').updateOne(
      { _id: this.roomType },
      { $pull: { rooms: this._id } }
    );
    next();
  } catch (error) {
    next(error);
  }
});
  
roomSchema.pre('remove', async function(next) {
  const room = this;
  try {
    const categories = await Category.find({ rooms: room._id });
    categories.forEach(category => {
      category.rooms.pull(room._id);
      category.save();
    });
    next();
  } catch (err) {
    next(err);
  }
});

roomSchema.post('save', async function(room) {
  try {
    if (room._processing || !room.categories) {
      return;
    }
    room._processing = true;
    const categoriesToAddTo = room.categories;
    await Category.updateMany(
      { _id: { $in: categoriesToAddTo } },
      { $addToSet: { rooms: room._id } }
    );
  } catch (err) {
    console.log(err);
  }
});

roomSchema.pre('save', async function(next) {
  const room = this;
  try {
    if (room._processing || room.isNew || !room.isModified('categories')) {
      return next();
    }
    room._processing = true;
    room.categories = [...new Set(room.categories)];
    const originalRoom = await room.constructor.findById(room._id);
    const categoriesToRemoveFrom = originalRoom.categories.filter(c => !room.categories.includes(c));
    await Category.updateMany(
      { _id: { $in: categoriesToRemoveFrom } },
      { $pull: { rooms: room._id } }
    );
    next();
  } catch (err) {
    next(err);
  }
});


const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
