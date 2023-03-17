const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "Please provide first name"],
  },
  lastname: {
    type: String,
    required: [true, "Please provide last name"],
  },
  mobilenumber: {
    type: String,
    required: [true, "Please provide mobile number"],
    unique: true,
  },
  isactive: {
    type: Boolean,
    default: false,
  },
  islocked: {
    type: Boolean,
    default: false,
  },
  isadmin: {
    type: Boolean,
    default: false,
  },
  ispartner: {
    type: Boolean,
    default: true,
  },
  email: {
    type: String,
    required: [true, "Please provide email address"],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  accountActivationToken: String,
  accountActivationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// General Token
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Access Token
UserSchema.methods.getSignedJwtAccessToken = function () {
  return jwt.sign({ id: this._id, 
                    firstname: this.firstname,
                    lastname: this.lastname,
                    email: this.email,
                    mobilenumber: this.mobilenumber,
                    isactive: this.isactive,
                    islocked: this.islocked,
                    isadmin: this.isadmin,
                    ispartner: this.ispartner 
                  }, process.env.ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_EXPIRE,
  });
};

// Refresh Token
UserSchema.methods.getSignedJwtRefreshToken = function () {
  return jwt.sign({ id: this._id, email: this.email, }, process.env.REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRE,
  });
};

UserSchema.methods.getAccountActivationToken = function () {
  const activationToken = crypto.randomBytes(20).toString("hex");

  // Hash token (private key) and save to database
  this.accountActivationToken = crypto
    .createHash("sha256")
    .update(activationToken)
    .digest("hex");

  // Set token expire date
  this.accountActivationExpire = Date.now() + 10 * (60 * 1000); // Ten Minutes

  return activationToken;
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token (private key) and save to database
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set token expire date
  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000); // Ten Minutes

  return resetToken;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
