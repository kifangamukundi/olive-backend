const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
const ErrorResponse = require("../utils/errorResponse");
const Room = require("../models/Room");
const Category = require("../models/Category");
const Booking = require("../models/Booking");

exports.createRoom =async (req, res, next) => {
  const { title, summary, slug, categories, content, defaultImage, otherImages, price, capacity} = req.body;

  try {
    const room = await Room.create({
      title,
      summary,
      slug,
      content,
      defaultImage,
      otherImages,
      categories,
      price,
      capacity
    });
    
    await Promise.all(
      categories.map(categoryId =>
        Category.findByIdAndUpdate(
          categoryId,
          { $addToSet: { rooms: room._id } },
          { new: true }
        )
      )
    );

    res.status(201).json({ sucess: true, message: "Success", data:{room: room} });
  } catch (err) {
    next(err);
  }
};

exports.getAllRooms = async (req, res, next) => {

  try {
    const rooms = await Room.find().populate({
      path: 'categories',
      select: 'title slug _id'
    });

    if (rooms.length === 0) {
      return next(new ErrorResponse("No rooms found", 404));
    }
    
    res.status(200).json({ sucess: true, message: "Success", data:{rooms: rooms} });
  } catch (err) {
    next(err);
  }
};

exports.getRoomById = async (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse("Invalid room ID", 400));
  }

  try {
    const room = await Room.findById({_id:id});

    if (room == null) {
      return next(new ErrorResponse("No room found", 404));
    }

    res.status(200).json({ sucess: true, message: "Success", data:{room: room} });
  } catch (err) {
    next(err);
  }
};

exports.updateRoom = async (req, res, next) => {
  const id = req.params.id;
  const { capacity, price, isAvailable, title, summary, categories, slug, content, defaultImage, otherImages } = req.body;

  try {
    const room = await Room.findById(id);

    if (!room) {
      return next(new ErrorResponse("No room found", 404));
    }

    await Category.updateMany({ _id: { $in: room.categories } }, { $pull: { rooms: id } });
    room.categories = [];

    if (capacity != null) {
      room.capacity = capacity;
    }
    if (price != null) {
      room.price = price;
    }
    if (isAvailable != null) {
      room.isAvailable = isAvailable;
    }
    if (title != null) {
      room.title = title;
    }

    if (summary != null) {
      room.summary = summary;
    }

    if (slug != null) {
      room.slug = slug;
    }

    if (content != null) {
      room.content = content;
    }
    
    if (defaultImage != null) {
      room.defaultImage = defaultImage;
    }

    if (otherImages != null) {
      room.otherImages = otherImages;
    }

    if (categories != null) {
      room.categories = categories;
      await Promise.all(
        categories.map(categoryId =>
          Category.findByIdAndUpdate(
            categoryId,
            { $addToSet: { rooms: room._id } },
            { new: true }
          )
        )
      );
    }

    const updatedRoom = await room.save();
    res.status(200).json({ success: true, message: "Success", data:{ room: updatedRoom } });
  } catch (err) {
    next(err);
  }
};

exports.deleteRoom = async (req, res, next) => {
  const { id } = req.params;

  try {
    const room = await Room.findById({_id:id});

    if (room == null) {
      return next(new ErrorResponse("No room found", 404));
    }

    const cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };

    cloudinary.config(cloudinaryConfig);

    await cloudinary.uploader.destroy(room.defaultImage.public_id);

    for (const image of room.otherImages) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    const categoryIds = room.categories;
    await Promise.all(
      categoryIds.map((categoryId) =>
        Category.findByIdAndUpdate(categoryId, {
          $pull: { rooms: id },
        })
      )
    );

    await room.remove();

    res.status(200).json({ sucess: true, message: "Success", data:{room: room} });
  } catch (err) {
    next(err);
  }
};

exports.getAvailableRooms = async (req, res, next) => {
    const { checkin, checkout } = req.query;
  
    try {
      const rooms = await Room.find({
        _id: {
          $nin: await Booking.getRoomsBookedBetweenDates(checkin, checkout),
        },
      });
  
      res.status(200).json({ success: true, message: "Available rooms found", data: { rooms: rooms } });
    } catch (err) {
      next(err);
    }
};
  
  
  