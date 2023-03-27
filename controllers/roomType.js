const mongoose = require('mongoose');
const ErrorResponse = require("../utils/errorResponse");
const RoomType = require("../models/RoomType");

exports.getAllRoomTypesRoute = async (req, res, next) => {

  try {
    const roomtypes = await RoomType.find();

    if (roomtypes.length === 0) {
      return next(new ErrorResponse("No types found", 404));
    }
    
    res.status(200).json({ sucess: true, message: "Success", data:{roomtypes: roomtypes} });
  } catch (err) {
    next(err);
  }
};

exports.createRoomTypeRoute =async (req, res, next) => {
    const { title, slug } = req.body;
  
    try {
        const titleExists = await RoomType.findOne({ title });
        if (titleExists) {
          return next(new ErrorResponse("Room type already exists", 409));
        }

      const slugExists = await RoomType.findOne({ slug });
      if (slugExists) {
        return next(new ErrorResponse("Room type already exists", 409));
      }
      const roomType = await RoomType.create({
        title,
        slug,
      });
  
      await roomType.save();
  
      res.status(201).json({ sucess: true, message: "Success", data:{roomType: roomType} });
    } catch (err) {
      next(err);
    }
  };

  exports.deleteRoomType = async (req, res, next) => {
    const { id } = req.params;
  
    try {
      const roomType = await RoomType.findById(id);
  
      if (!roomType) {
        return next(new ErrorResponse("room type not found", 404));
      }
  
      await roomType.remove();
  
      res.status(200).json({ success: true, message: "room type deleted successfully" });
    } catch (err) {
      next(err);
    }
  };