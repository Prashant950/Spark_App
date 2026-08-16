const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sendSMSOTP = async (phoneNumber, otp) => {
  try {
    // If in development mode without active Twilio credits:
    console.log(`[DEV OTP]: Generated OTP for ${phoneNumber} is ${otp}`);

    if (process.env.NODE_ENV === "production") {
      await client.messages.create({
        body: `Your Spark Verification Code is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
    }
    return true;
  } catch (error) {
    console.error("Twilio SMS Error:", error);
    return false;
  }
};

module.exports = { sendSMSOTP };