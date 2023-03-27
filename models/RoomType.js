const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
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

roomTypeSchema.pre('remove', async function(next) {
    try {
        // Remove the reference to this room type from all rooms
        await this.model('Room').updateMany(
        { roomType: this._id },
        { $unset: { roomType: '' } }
        );
        next();
    } catch (error) {
        next(error);
    }
    });
module.exports = mongoose.model('RoomType', roomTypeSchema);