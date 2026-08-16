const express = require("express");
const router = express.Router();
const { sendOTP, verifyOTP } = require("../controllers/authController");
const { sendEmailOTPController, verifyEmailOTPController } = require("../controllers/authController");

// PUBLIC ROUTES
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/send-email-otp", sendEmailOTPController);
router.post("/verify-email-otp", verifyEmailOTPController);

module.exports = router;