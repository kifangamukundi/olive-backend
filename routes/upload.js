const express = require("express");
const router = express.Router();
const { imageUpload, imageDeletion } = require("../controllers/upload");
const { onlyAdmin } = require("../middleware/auth");

router.route("/new-media").post(imageUpload);
router.route("/delete-media").post(imageDeletion);

module.exports = router;