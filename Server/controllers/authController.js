const OTP = require("../models/OTP");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendSMSOTP } = require("../services/otpService");
const { sendEmailOTP } = require("../services/emailService");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Send OTP to Mobile Number
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ message: "Phone number is required" });

  const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP

  await OTP.deleteMany({ phoneNumber }); // Clear existing OTPs
  await OTP.create({ phoneNumber, otp: generatedOTP });

  await sendSMSOTP(phoneNumber, generatedOTP);

  res.status(200).json({ success: true, message: "OTP sent successfully" });
};

// @desc    Verify OTP & Login/Register User
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  const validOTP = await OTP.findOne({ phoneNumber, otp });
  if (!validOTP) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  let user = await User.findOne({ phoneNumber });
  if (!user) {
    user = await User.create({ phoneNumber });
  }

  await OTP.deleteMany({ phoneNumber }); // Clean up

  res.status(200).json({
    success: true,
    token: generateToken(user._id),
    user,
  });
};

exports.sendEmailOTPController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 1. Generate 6-digit random OTP
    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Clear previous OTPs for this email & Save new OTP in DB
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp: generatedOTP });

    // 3. Call Nodemailer function
    const emailSent = await sendEmailOTP(email, generatedOTP);

    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: "OTP sent to your email successfully!",
      });
    } else {
      return res.status(500).json({ message: "Failed to send email OTP" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.verifyEmailOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // 1. Check if valid OTP exists in DB for this email
    const validOTP = await OTP.findOne({ email, otp });

    if (!validOTP) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // 2. Find User by Email, or Create New User if doesn't exist
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        phoneNumber: `email_user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        isVerified: true,
        location: {
          type: "Point",
          coordinates: [0, 0], // Default longitude, latitude to fix 2dsphere index error
        },
      });
    } else {
      user.isVerified = true;
      await user.save();
    }

    // 3. Clear used OTP from Database
    await OTP.deleteMany({ email });

    // 4. Return JWT Token & User Profile
    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      token: generateToken(user._id),
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};