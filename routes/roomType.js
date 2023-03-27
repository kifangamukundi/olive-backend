const express = require("express");
const router = express.Router();
const { getAllRoomTypesRoute, createRoomTypeRoute, deleteRoomType } = require("../controllers/roomType");
const { onlyAdmin } = require("../middleware/auth");

router.route("/").get(getAllRoomTypesRoute);
router.route("/").post(onlyAdmin, createRoomTypeRoute);
router.route("/:id").delete(onlyAdmin, deleteRoomType);

module.exports = router;