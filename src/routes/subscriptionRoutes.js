const express = require("express");
const { authenticate, authorize } = require("../utils/authentication");
const {
  getSubscriptions,
  getDietitianSubscriptions,
  getSubscriptionPageDetails,
  updateSubscriptionDates,
} = require("../controllers/subscriptionController");

const router = express.Router();

router.get("/", authenticate, authorize(["admin"]), getSubscriptions);
router.get(
  "/users",
  authenticate,
  authorize(["dietitian"]),
  getDietitianSubscriptions
);
router.get(
  "/page",
  authenticate,
  authorize(["dietitian", "admin", "superadmin"]),
  getSubscriptionPageDetails
);
router.patch(
  "/dates/:id",
  authenticate,
  authorize(["dietitian", "admin", "superadmin"]),
  updateSubscriptionDates
);

module.exports = router;
