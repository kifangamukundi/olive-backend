const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
const ErrorResponse = require("../utils/errorResponse");
const Room = require("../models/Room");
const Booking = require("../models/Booking");

exports.createRoom = async (req, res, next) => {
    const { name, type, price, maxOccupancy, description, photos } = req.body;
  
    try {
      const room = await Room.create({
        name,
        type,
        price,
        maxOccupancy,
        description,
        photos,
      });
  
      res.status(201).json({ success: true, message: "Room created", data: { room: room } });
    } catch (err) {
      next(err);
    }
};

exports.getAllRooms = async (req, res, next) => {
    try {
        const rooms = await Room.find();

        res.status(200).json({ success: true, message: "Rooms found", data: { rooms: rooms } });
    } catch (err) {
        next(err);
    }
};

exports.getRoomById = async (req, res, next) => {
    const roomId = req.params.id;
  
    try {
      const room = await Room.findById(roomId);
  
      if (!room) {
        return res.status(404).json({ success: false, message: "Room not found", data: {} });
      }
  
      res.status(200).json({ success: true, message: "Room found", data: { room: room } });
    } catch (err) {
      next(err);
    }
};

exports.updateRoom = async (req, res, next) => {
    const roomId = req.params.id;
    const update = req.body;
  
    try {
      const room = await Room.findByIdAndUpdate(roomId, update, { new: true });
  
      if (!room) {
        return res.status(404).json({ success: false, message: "Room not found", data: {} });
      }
  
      res.status(200).json({ success: true, message: "Room updated", data: { room: room } });
    } catch (err) {
      next(err);
    }
};

exports.deleteRoom = async (req, res, next) => {
    const roomId = req.params.id;
  
    try {
      const room = await Room.findByIdAndDelete(roomId);
  
      if (!room) {
        return res.status(404).json({ success: false, message: "Room not found", data: {} });
      }
  
      res.status(200).json({ success: true, message: "Room deleted", data: { room: room } });
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
  
  
  