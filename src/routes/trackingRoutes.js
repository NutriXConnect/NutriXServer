const express = require("express");
const router = express.Router();
const {
  getTrackingForUser,
  createTrackingForUser,
  trackMeal,
} = require("../controllers/trackingController");
const { authenticate, authorize } = require("../utils/authentication");
const { trackingLimiter } = require("../utils/rateLimiter");

router.get("/", trackingLimiter, authenticate, getTrackingForUser);
router.post("/", authenticate, createTrackingForUser);
router.patch(
  "/meal",
  trackingLimiter,
  authenticate,
  authorize(["user", "superadmin"]),
  trackMeal
);

module.exports = router;
