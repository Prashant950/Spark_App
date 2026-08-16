// const nodemailer = require("nodemailer");

// // Transporter Config
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS, // App Password yaha use hoga
//   },
// });

// // Send Email OTP Function
// const sendEmailOTP = async (toEmail, otp) => {
//   try {
//     const mailOptions = {
//       from: `"Spark App" <${process.env.EMAIL_USER}>`,
//       to: toEmail,
//       subject: "Spark - Your Verification Code",
//       html: `
//         <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0D0B14; color: #ffffff; border-radius: 10px;">
//           <h2 style="color: #FF4081;">Spark Dating App</h2>
//           <p>Your OTP code for email verification is:</p>
//           <h1 style="background: #1A1726; padding: 10px; border-radius: 8px; display: inline-block; color: #00E5FF; letter-spacing: 4px;">${otp}</h1>
//           <p style="color: #A1A1AA; font-size: 12px; margin-top: 20px;">This OTP will expire in 5 minutes.</p>
//         </div>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`OTP Email sent successfully to ${toEmail}`);
//     return true;
//   } catch (error) {
//     console.error("Email sending error:", error);
//     return false;
//   }
// };

// module.exports = { sendEmailOTP };
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // 465 port ke liye true
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 16-digit App Password
  },
  tls: {
    rejectUnauthorized: false, 
  },
});

const sendEmailOTP = async (toEmail, otp) => {
  try {
    const mailOptions = {
      from: `"Spark App" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Spark - Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0D0B14; color: #ffffff; border-radius: 10px;">
          <h2 style="color: #FF4081;">Spark Dating App</h2>
          <p>Your OTP code for email verification is:</p>
          <h1 style="background: #1A1726; padding: 10px; border-radius: 8px; display: inline-block; color: #00E5FF; letter-spacing: 4px;">${otp}</h1>
          <p style="color: #A1A1AA; font-size: 12px; margin-top: 20px;">This OTP will expire in 5 minutes.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email Sent Info:", info.response);
    return true;
  } catch (error) {
    // Exact Nodemailer error console me dekhne ke liye:
    console.error("Nodemailer Detailed Error:", error);
    return false;
  }
};

module.exports = { sendEmailOTP };