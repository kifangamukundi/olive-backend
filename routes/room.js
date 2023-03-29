const express = require("express");
const router = express.Router();
const { getAllRooms, 
    createRoom, 
    updateRoom, 
    deleteRoom, 
    getRoomById,
    getRoomCount,
    getAverageRoomPrice,
    getRoomsByCategory,
    getAvailableRooms } = require("../controllers/room");
const { onlyAdmin } = require("../middleware/auth");

// analytics
router.route("/room-count").get(onlyAdmin, getRoomCount);
router.route("/average-room-price").get(onlyAdmin, getAverageRoomPrice);
router.route("/rooms-by-category").get(onlyAdmin, getRoomsByCategory);
router.route("/available-rooms").get(getAvailableRooms);

router.route("/").get(onlyAdmin, getAllRooms);
router.route("/:id").get(getRoomById);
router.route("/").post(onlyAdmin, createRoom);
router.route("/:id").patch(onlyAdmin, updateRoom);
router.route("/:id").delete(onlyAdmin, deleteRoom);

module.exports = router;