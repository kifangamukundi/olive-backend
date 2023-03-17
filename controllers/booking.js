const Booking = require("../models/Booking");
const Room = require("../models/Room");

exports.getAllBookings = async (req, res, next) => {
    try {
    const bookings = await Booking.find();
    res.status(200).json({ success: true, message: "Success", data: { bookings } });
    } catch (err) {
    next(err);
    }
};

exports.getBookingById = async (req, res, next) => {
    const { bookingId } = req.params;
    try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.status(200).json({ success: true, message: "Success", data: { booking } });
    } catch (err) {
    next(err);
    }
};

exports.createBooking = async (req, res, next) => {
    const { roomId, guestId, checkInDate, checkOutDate, totalPrice } = req.body;
    try {
    const booking = await Booking.create({
    room: roomId,
    guest: guestId,
    checkInDate,
    checkOutDate,
    totalPrice,
    });
    await Room.findByIdAndUpdate(roomId, { $addToSet: { bookings: booking._id } });

    res.status(201).json({ success: true, message: "Success", data: { booking } });
    } catch (err) {
        next(err);
    }
};

exports.updateBooking = async (req, res, next) => {
    const { bookingId } = req.params;
    const { checkInDate, checkOutDate } = req.body;
    try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
    }
    booking.checkInDate = checkInDate || booking.checkInDate;
    booking.checkOutDate = checkOutDate || booking.checkOutDate;

    await booking.save();

    res.status(200).json({ success: true, message: "Success", data: { booking } });
    } catch (err) {
        next(err);
    }
};
    
exports.cancelBooking = async (req, res, next) => {
    const { bookingId } = req.params;
    try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
    }
    await Room.findByIdAndUpdate(booking.room, { $pull: { bookings: booking._id } });
    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({ success: true, message: "Success", data: null });
    } catch (err) {
        next(err);
    }
};