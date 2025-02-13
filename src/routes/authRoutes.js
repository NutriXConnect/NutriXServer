const express = require("express");
const {
  login,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controllers/authController");
const { authLimiter } = require("../utils/rateLimiter");

const router = express.Router();

router.post("/login", authLimiter, login);
router.get("/logout", authLimiter, logout);
router.patch("/forgot-password", authLimiter, forgotPassword);
router.patch("/reset-password/:userId", authLimiter, resetPassword);

module.exports = router;
