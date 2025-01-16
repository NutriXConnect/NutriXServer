const express = require("express");
const {
  login,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.get("/logout", logout);
router.patch("/forgot-password", forgotPassword);
router.patch("/reset-password/:userId", resetPassword);

module.exports = router;
