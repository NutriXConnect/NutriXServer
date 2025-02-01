const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const otpGenerator = require("../utils/otpGenerator");

const UserModel = require("../models/userModel");
const sendEmailerHelper = require("../emails/dynamicEmailSender");

dotenv.config();

const { SECRET_KEY } = process.env;

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      next({
        statusCode: 404,
        message:
          "Email not found. Please enter correct email address or sign up.",
      });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      next({
        statusCode: 401,
        message: "Authentication failed. Wrong password",
      });
    }
    jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      SECRET_KEY,
      { algorithm: "HS256" },
      (err, data) => {
        if (err) {
          throw new Error(err.message);
        }
        res.cookie("token", data, {
          maxAge: 30 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          path: "/",
        });
        res.status(200).json({
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        });
      }
    );
  } catch (error) {
    next({ statusCode: 500, message: error.message });
  }
  return;
};

const logout = async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    path: "/",
  });
  res.status(200).json({
    message: "user logged out successfully",
  });
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      next({ statusCode: 404, message: "Email not found! Please try again" });
    }

    const otp = otpGenerator();

    const emailSent = await sendEmailerHelper(otp, user.name, email);

    if (!emailSent) {
      next({
        statusCode: 500,
        message: "Failed to send email. Please try again!",
      });
    }

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Sent an otp to your email",
      userId: user.id,
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const { otp, password } = req.body;

    const user = await UserModel.findById(userId);

    if (!user) {
      next({ statusCode: 404, message: "User not found!" });
    }

    if (otp && otp === user.otp) {
      let currentTime = Date.now();

      if (currentTime < user.otpExpiry) {
        user.password = password;
        delete user.otp;
        delete user.otpExpiry;

        await user.save();

        res.status(200).json({
          status: "success",
          message: "Password has been updated Successfully!",
        });
      } else {
        next({ statusCode: 400, message: "OTP has expired. Please try again" });
      }
    } else {
      next({ stausCode: 400, message: "Invalid otp. Please try again" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  forgotPassword,
  resetPassword,
};
