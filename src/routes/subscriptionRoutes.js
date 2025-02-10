const express = require("express");
const { authenticate, authorize } = require("../utils/authentication");
const {
  getSubscriptions,
  getDietitianSubscriptions,
  getSubscriptionPageDetails,
  updateSubscriptionDates,
  createDietPlan,
  updateMealToDietPlan,
  updateSubsciptionStatus,
  getUserSubscriptionDetails,
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
  "/user",
  authenticate,
  authorize(["user"]),
  getUserSubscriptionDetails
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
router.post(
  "/diet-plan",
  authenticate,
  authorize(["dietitian", "admin", "superadmin"]),
  createDietPlan
);
router.put(
  "/meals",
  authenticate,
  authorize(["dietitian", "admin", "superadmin"]),
  updateMealToDietPlan
);

router.patch(
  "/status",
  authenticate,
  authorize(["dietitian", "admin", "superadmin"]),
  updateSubsciptionStatus
);
module.exports = router;
