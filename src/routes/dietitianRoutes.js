const express = require("express");
const {
  getDietitianListings,
  getDietitianProfile,
  createDietitian,
  createPlans,
} = require("../controllers/dietitianController");
const { authenticate, authorize } = require("../utils/authentication");

const router = express.Router();

router.get("/listings", authenticate, getDietitianListings);
router.get("/profile/:id", authenticate, getDietitianProfile);
router.post(
  "/profile",
  authenticate,
  authorize(["admin", "superadmin"]),
  createDietitian
);
router.post(
  "/plans",
  authenticate,
  authorize(["dietitian", "admin"]),
  createPlans
);

module.exports = router;
