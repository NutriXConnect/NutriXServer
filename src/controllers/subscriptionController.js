const DietPlanModel = require("../models/dietPlanModel");
const FitnessDetailsModel = require("../models/fitnessDetailsModel");
const { MealItemModel } = require("../models/mealItemModel");
const OrderModel = require("../models/orderModel");
const SubscriptionModel = require("../models/subscriptionModel");
const UserModel = require("../models/userModel");

const createSubscription = async (razorpayOrderId) => {
  try {
    const order = await OrderModel.findOne({ razorpayOrderId });
    if (!order) {
      throw new Error("Order not found!");
    }

    const subscription = await SubscriptionModel.create({
      user: order.userId,
      dietitian: order.dietitianId,
      order: order._id,
      plan: order.planDetails.planId,
      durationInMonths: order.planDetails.duration,
    });
    if (subscription) {
      const user = await UserModel.findById(subscription.userId);
      user.isSubscribed = true;
      await user.save();
    }
  } catch (error) {
    console.log(
      "Unable to create a subscription. Please mail contact@nutrixconnect.com"
    );
  }
};

const getSubscriptions = async (req, res, next) => {
  const dietitianId = req.user._id;
  try {
    const subscriptions = await SubscriptionModel.find({
      dietitian: dietitianId,
    });
    if (!subscriptions) {
      res.status(404).json({ message: "No subscriptions found!" });
    }
    res.status(200).json(subscriptions);
  } catch (error) {
    next(error);
  }
};

const getDietitianSubscriptions = async (req, res, next) => {
  const dietitianId = req.user._id;
  try {
    const subscriptions = await SubscriptionModel.find({
      dietitian: dietitianId,
    })
      .select("status _id")
      .populate("user", "name age gender mobile email avatar");

    if (subscriptions.length < 1) {
      res.status(404).json({ message: "No subscriptions found!" });
    }
    const users = [];
    for (idx in subscriptions) {
      const user = subscriptions[idx].user;

      const profile = await FitnessDetailsModel.findOne({ user: user._id });
      users.push({
        _id: user._id,
        name: user.name,
        age: user.age,
        gender: user.gender,
        mobile: user.mobile,
        email: user.email,
        avatar: user.avatar,
        height: profile.height,
        weight: profile.weight,
        subscriptionId: subscriptions[idx]._id,
        subscriptionStatus: subscriptions[idx].status,
      });
    }
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getSubscriptionPageDetails = async (req, res, next) => {
  const subscriptionId = req.query.subscription;
  try {
    const subscription = await SubscriptionModel.findById(subscriptionId)
      .populate("order")
      .populate("plan")
      .populate("user", "name email mobile")
      .populate({
        path: "dietPlan",
        populate: {
          path: "mealPlan.meals",
          model: "MealItemModel",
        },
      });

    const userProfile = await FitnessDetailsModel.findOne({
      user: subscription.user._id,
    });

    const response = {
      ...subscription.toObject(), // Convert Mongoose document to a plain object
      user: {
        ...subscription.user.toObject(),
        height: userProfile?.height || null,
        weight: userProfile?.weight || null,
      },
    };
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const updateSubscriptionDates = async (req, res, next) => {
  const subscriptionId = req.params.id;
  const { startDate } = req.body;
  try {
    const subscription = await SubscriptionModel.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found!" });
    }
    subscription.subscriptionStartDate = startDate;
    await subscription.save();
    const updatedSubscription = await SubscriptionModel.findById(
      subscriptionId
    ).select("subscriptionStartDate subscriptionEndDate");
    res.status(200).json(updatedSubscription);
  } catch (error) {
    next(error);
  }
};
const createDietPlan = async (req, res, next) => {
  const dietitian = req.user._id;
  const { subscription, user } = req.body;
  try {
    const diet = await DietPlanModel.create({
      subscription: subscription,
      dietitian: dietitian,
      user: user,
    });
    if (!diet) {
      return res.status(404).json({ message: "Diet Plan not created!" });
    }

    await SubscriptionModel.findByIdAndUpdate(subscription, {
      dietPlan: diet._id,
    });
    res.status(201).json(diet);
  } catch (error) {
    next(error);
  }
};
const updateMealToDietPlan = async (req, res, next) => {
  const { mealPlan, dietPlanId } = req.body;
  try {
    const dietPlan = await DietPlanModel.findById(dietPlanId);
    if (!dietPlan) {
      return res.status(404).json({ message: "Diet Plan not found!" });
    }
    const mealItemIds = await createMealItemModel(mealPlan);
    let mealPlanIdx = dietPlan.mealPlan.findIndex(
      (slot) => slot.time === mealPlan.time
    );
    delete mealPlan.meals;
    mealPlan.meals = [...mealItemIds];
    if (mealPlanIdx === -1) {
      dietPlan.mealPlan.push(mealPlan);
      console.log("dietPlan.mealPlan: ", JSON.stringify(dietPlan.mealPlan));
    } else {
      if (mealPlan.meals.length > 0) {
        dietPlan.mealPlan[mealPlanIdx].meals = [...mealPlan.meals];
      } else {
        dietPlan.mealPlan.splice(mealPlanIdx, 1);
      }
    }
    await dietPlan.save();
    console.log("dietPlan saved: ", JSON.stringify(dietPlan));
    res.status(200).json(dietPlan);
  } catch (error) {
    next(error);
  }
};

const createMealItemModel = async (mealPlan) => {
  let mealItemsIds = [];
  for (let mealItemIdx in mealPlan.meals) {
    const mealItemObj = {
      name: mealPlan.meals[mealItemIdx].name,
      quantity: mealPlan.meals[mealItemIdx].quantity,
      unit: mealPlan.meals[mealItemIdx].unit,
      nutritionalContent: {
        calories: mealPlan.meals[mealItemIdx].calories,
        fats: mealPlan.meals[mealItemIdx].fats,
        protein: mealPlan.meals[mealItemIdx].protein,
        fiber: mealPlan.meals[mealItemIdx].fiber,
      },
    };
    const mealItem = await MealItemModel.create(mealItemObj);
    mealItemsIds.push(mealItem._id);
  }
  return mealItemsIds;
};

const updateSubsciptionStatus = async (req, res, next) => {
  const { subscriptionId, status } = req.body;
  try {
    const subscription = await SubscriptionModel.findByIdAndUpdate(
      subscriptionId,
      { status },
      { new: true }
    )
      .populate("order")
      .populate("plan")
      .populate("user", "name email mobile")
      .populate({
        path: "dietPlan",
        populate: {
          path: "mealPlan.meals",
          model: "MealItemModel",
        },
      });
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found!" });
    }
    res.status(200).json(subscription);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createSubscription,
  getSubscriptions,
  getDietitianSubscriptions,
  getSubscriptionPageDetails,
  updateSubscriptionDates,
  createDietPlan,
  updateMealToDietPlan,
  updateSubsciptionStatus,
};
