const express = require("express");
const {
  getDietitianListings,
  getDietitianProfile,
  createDietitian,
  createPlans,
  updateDietitianProfile,
  getPlans,
  updatePlan,
  deletePlan,
} = require("../controllers/dietitianController");
const { authenticate, authorize } = require("../utils/authentication");

const router = express.Router();

router.get("/listings", authenticate, getDietitianListings);
router.get("/profile", authenticate, getDietitianProfile);
router.post(
  "/profile",
  authenticate,
  authorize(["admin", "superadmin"]),
  createDietitian
);
router.patch("/profile", authenticate, updateDietitianProfile);
router.post(
  "/plans",
  authenticate,
  authorize(["dietitian", "admin"]),
  createPlans
);
router.get(
  "/plans",
  authenticate,
  authorize(["dietitian", "admin", "superadmin"]),
  getPlans
);
router.put(
  "/plan/:id",
  authenticate,
  authorize(["dietitian", "admin", "superadmin"]),
  updatePlan
);

router.delete(
  "/plan/:id",
  authenticate,
  authorize(["dietitian", "admin", "superadmin"]),
  deletePlan
);

module.exports = router;
