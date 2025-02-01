const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

dotenv.config();

const { SENDGRID_API_KEY, SENDER_EMAIL } = process.env;

const techDetails = {
  host: "smtp.sendgrid.net",
  port: 465,
  secure: true,
  auth: {
    user: "apikey",
    pass: SENDGRID_API_KEY,
  },
};

const transporter = nodemailer.createTransport(techDetails);

const otpTemplateStr = fs.readFileSync(
  path.join(__dirname, "../templates", "otp.html"),
  "utf-8"
);

let finalOTPTemplate = "";

const sendEmailerHelper = async (otp, userName, to) => {
  try {
    finalOTPTemplate = otpTemplateStr
      .replace("#{USER_NAME}", userName)
      .replace("#{OTP}", otp);

    const text = `Hi, ${userName}, your OTP for forgot Password is ${otp}`;

    const emailObj = {
      to: to,
      from: SENDER_EMAIL,
      subject: "Reset Password OTP Verification",
      text: text,
      html: finalOTPTemplate,
    };

    await transporter.sendMail(emailObj);
    console.log("Email sent successfully!");
    return true;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

module.exports = sendEmailerHelper;
