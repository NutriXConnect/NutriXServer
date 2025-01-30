const express = require("express");
const {
  createOrder,
  verifyPaymentController,
} = require("../controllers/orderController");
const { authenticate } = require("../utils/authentication");
const router = express.Router();

// Order routes
router.post("/verify", verifyPaymentController);
router.post("/:planId", authenticate, createOrder);

module.exports = router;
