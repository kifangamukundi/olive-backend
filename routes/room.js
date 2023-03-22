const express = require("express");
const router = express.Router();
const { getAllRooms, createRoom, updateRoom, deleteRoom, getRoomById, getAvailableRooms } = require("../controllers/room");
const { onlyAdmin } = require("../middleware/auth");

router.route("/").get(onlyAdmin, getAllRooms);
router.route("/:id").get(getRoomById);
router.route("/available").get(getAvailableRooms);
router.route("/").post(onlyAdmin, createRoom);
router.route("/:id").patch(onlyAdmin, updateRoom);
router.route("/:id").delete(onlyAdmin, deleteRoom);

module.exports = router;