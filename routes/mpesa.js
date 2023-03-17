const express = require("express");
const router = express.Router();
const { getAccessToken } = require("../middleware/mpesa");

// Controllers
const {
  stkpush,
  stkcallback,
} = require("../controllers/mpesa");

router.route("/stkpush").post(getAccessToken, stkpush);
router.route("/stkpush/callback").post(stkcallback);

module.exports = router;
