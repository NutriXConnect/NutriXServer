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
        statusCode: 401,
        message: "Authentication failed. User not found",
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
          console.log(err);
          throw new Error(err.message);
        }
        res.cookie("token", data, {
          maxAge: 30 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "None",
          path: "/",
        });
        res
          .status(200)
          .json({ email: user.email, name: user.name, avatar: user.avatar });
      }
    );
  } catch (error) {
    next({ statusCode: 500, message: "Internal server error" });
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
      return res.status(404).json({
        status: "failure",
        message: "User not found!",
      });
    }

    const otp = otpGenerator();

    await sendEmailerHelper(otp, user.name, email);

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
      return res.status(404).json({
        status: "failure",
        message: "User not found!",
      });
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
      }
    } else {
      res.status(400);
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
