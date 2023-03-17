const express = require("express");
const router = express.Router();

// Controllers
const {
  login,
  register,
  accountActivation,
  forgotPassword,
  resetPassword,
  refreshToken,
} = require("../controllers/auth");

router.route("/register").post(register);

router.route("/activate-account/:activationToken").put(accountActivation);

router.route("/login").post(login);

router.route("/forgot-password").post(forgotPassword);

router.route("/reset-password/:resetToken").put(resetPassword);
router.route("/refresh").post(refreshToken);

module.exports = router;
