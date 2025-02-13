const DietPlanModel = require("../models/dietPlanModel");
const SubscriptionModel = require("../models/subscriptionModel");
const TrackingModel = require("../models/trackingModel");

const getTrackingForUser = async (req, res, next) => {
  const userId = req.user._id;
  let { user, date } = req.query;
  const today = new Date(date).toISOString().split("T")[0]; // Get today in YYYY-MM-DD format
  if (!user) user = userId;

  try {
    let tracking = await TrackingModel.findOne({
      user,
      trackingDay: today,
    }).populate("mealPlans.meals.meal");

    if (!tracking) {
      return createTrackingForUser(req, res, next);
    }

    return res.status(200).json(tracking);
  } catch (error) {
    next(error);
  }
};

const createTrackingForUser = async (req, res, next) => {
  const userId = req.user._id;
  let { user, date } = req.query;
  const today = new Date(date).toISOString().split("T")[0]; // Get today in YYYY-MM-DD format
  if (!user) user = userId;

  try {
    const subscription = await SubscriptionModel.findOne({
      user: user,
      status: "inprogress",
    });

    if (!subscription) {
      return res.status(400).json({
        message:
          "No active subscription found for this user. Please connect with your dietitian.",
      });
    }

    if (
      new Date(date) < new Date(subscription.subscriptionStartDate) ||
      new Date(date) > new Date(subscription.subscriptionEndDate)
    ) {
      return next({
        statusCode: 400,
        message: "No subscription is active on the selected date",
      });
    }

    if (new Date(date) > new Date()) {
      return res.status(400).json({
        message: "Selected date is in the future. Please select a past date.",
      });
    }

    const dietPlan = await DietPlanModel.findOne({
      subscription: subscription._id,
    }).populate("mealPlan.meals");

    if (!dietPlan || !dietPlan.mealPlan) {
      return res
        .status(400)
        .json({ message: "No meal plan found for the active subscription." });
    }

    let totalMealsInTheDay = 0;
    const mealPlans = dietPlan.mealPlan.map((mealPlan) => {
      totalMealsInTheDay += mealPlan.meals.length;

      return {
        name: mealPlan.name,
        time: mealPlan.time,
        meals: mealPlan.meals.map((meal) => ({
          meal: meal._id,
          tracked: false,
        })),
      };
    });

    const newTracking = await TrackingModel.create({
      user: userId,
      trackingDay: today,
      mealPlans,
      totalMealsInTheDay,
    });

    const tracking = await TrackingModel.findById(newTracking._id).populate(
      "mealPlans.meals.meal"
    );

    return res.status(201).json(tracking);
  } catch (error) {
    next(error);
  }
};
const trackMeal = async (req, res, next) => {
  const { trackingId, mealPlanId, mealId, tracked } = req.body;

  try {
    const tracking = await TrackingModel.findByIdAndUpdate(
      trackingId,
      {
        $set: {
          "mealPlans.$[mealPlan].meals.$[meal].tracked": tracked,
        },
      },
      {
        arrayFilters: [{ "mealPlan._id": mealPlanId }, { "meal.meal": mealId }],
        new: true,
      }
    );

    if (tracked) {
      tracking.totalMealsTracked++;
    } else {
      tracking.totalMealsTracked--;
    }
    await tracking.save();

    if (!tracking) {
      return res.status(404).json({ message: "Tracking not found." });
    }

    const updatedTracking = await TrackingModel.findById(trackingId).populate(
      "mealPlans.meals.meal"
    );

    return res.status(200).json(updatedTracking);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTrackingForUser,
  createTrackingForUser,
  trackMeal,
};
