const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  phoneNumber: { type: String },
  email: { type: String },
  otp: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Auto-expire in 5 minutes
});

module.exports = mongoose.model("OTP", otpSchema);