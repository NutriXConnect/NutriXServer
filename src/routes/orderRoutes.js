const express = require("express");
const {
  createOrder,
  verifyPaymentController,
  getProfileOrdersList,
} = require("../controllers/orderController");
const { authenticate } = require("../utils/authentication");
const router = express.Router();

// Order routes
router.post("/verify", verifyPaymentController);
router.post("/:planId", authenticate, createOrder);

router.get("/profile-orders", authenticate, getProfileOrdersList);
module.exports = router;
