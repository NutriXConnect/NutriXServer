const express = require("express");
const {
  createOrder,
  verifyPaymentController,
  getProfileOrdersList,
} = require("../controllers/orderController");
const { authenticate } = require("../utils/authentication");
const { orderLimiter } = require("../utils/rateLimiter");
const router = express.Router();

// Order routes
router.post("/verify", verifyPaymentController);
router.post("/:planId", orderLimiter, authenticate, createOrder);

router.get("/profile-orders", orderLimiter, authenticate, getProfileOrdersList);

module.exports = router;
