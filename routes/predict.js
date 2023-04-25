const express = require("express");
const router = express.Router();
const {predictPrice  } = require("../controllers/predict");
const { onlyAdmin } = require("../middleware/auth");

router.route("/").post(onlyAdmin, predictPrice);

module.exports = router;