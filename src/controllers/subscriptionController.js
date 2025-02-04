const FitnessDetailsModel = require("../models/fitnessDetailsModel");
const OrderModel = require("../models/orderModel");
const SubscriptionModel = require("../models/subscriptionModel");
const UserModel = require("../models/userModel");

const createSubscription = async (razorpayOrderId) => {
  try {
    const order = await OrderModel.findOne({ razorpayOrderId });
    if (!order) {
      throw new Error("Order not found!");
    }
    console.log(order);

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

    if (subscriptions.lenght < 1) {
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
      .populate("user", "name email mobile");

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
module.exports = {
  createSubscription,
  getSubscriptions,
  getDietitianSubscriptions,
  getSubscriptionPageDetails,
  updateSubscriptionDates,
};
