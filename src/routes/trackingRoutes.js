const express = require("express");
const router = express.Router();
const {
  getTrackingForUser,
  createTrackingForUser,
  trackMeal,
} = require("../controllers/trackingController");
const { authenticate, authorize } = require("../utils/authentication");

router.get("/", authenticate, getTrackingForUser);
router.post("/", authenticate, createTrackingForUser);
router.patch(
  "/meal",
  authenticate,
  authorize(["user", "superadmin"]),
  trackMeal
);

module.exports = router;
