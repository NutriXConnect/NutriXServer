const { default: mongoose } = require("mongoose");
const DietitianProfileModel = require("../models/dietitianModel");
const OrderModel = require("../models/orderModel");
const UserModel = require("../models/userModel");
const razorpayInstance = require("../utils/razorpay");
const PlanModel = require("../models/planModel");

const crypto = require("crypto");

const createOrder = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const userId = req.user._id;
    const { dietitianId, status } = req.body;

    const user = await UserModel.findById(userId);
    // const user = await UserModel.findOne({ email: userId });
    if (!user) {
      next({ statusCode: 404, message: "User not found!" });
    }

    const dietitian = await DietitianProfileModel.findOne({
      userId: new mongoose.Types.ObjectId(dietitianId),
    }).select("plans");

    if (!dietitian || !dietitian.plans.some((plan) => plan.equals(planId))) {
      next({
        statusCode: 404,
        message: "Plan not found or Dietitian not found",
      });
    }

    const plan = await PlanModel.findById(planId);
    if (!plan) {
      next({ statusCode: 404, message: "Plan not found" });
    }

    const orderObj = await OrderModel.create({
      userId: user._id,
      dietitianId,
      status,
      planDetails: {
        planId: plan._id,
        name: plan.name,
        duration: plan.duration,
        price: plan.price,
      },
      totalAmount: plan.price,
    });

    user.orders.push(orderObj["_id"]);
    await user.save();

    const amount = plan.price;
    const currency = "INR";
    const payment_capture = 1;

    let options = {
      amount: amount * 100,
      currency,
      receipt: orderObj["_id"],
      payment_capture,
    };

    const paymentOrderObj = await razorpayInstance.orders.create(options);

    orderObj.razorpayOrderId = paymentOrderObj.id;

    await orderObj.save();
    res.status(200).json({
      id: paymentOrderObj.id,
      currency: paymentOrderObj.currency,
      amount: paymentOrderObj.amount,
    });
  } catch (error) {
    next(error);
  }
};

const verifyPaymentController = async (req, res) => {
  try {
    if (!process.env.WEBHOOK_SECRET) {
      throw new Error("Webhook secret key is not defined!");
    }

    const { body, headers } = req;
    const event = body.event;
    const payment = body.payload.payment ? body.payload.payment.entity : null;

    const freshSignature = crypto
      .createHmac("sha256", process.env.WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest("hex");

    const razorpaySignature = headers["x-razorpay-signature"];

    if (!razorpaySignature) {
      throw new Error("x-razorpay-signature is not being set in the headers");
    }

    switch (event) {
      case "order.paid": {
        await updateOrderStatus(payment.order_id, "completed");
        break;
      }
      case "payment.authorized": {
        await updateOrderStatus(payment.order_id, "confirmed");
        break;
      }
      // Add more later
    }

    if (freshSignature === razorpaySignature) {
      return res.status(200).json({
        message: "ok",
      });
    } else {
      throw new Error("Invalid Razorpay Signature");
    }
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (razorpayOrderId, status) => {
  const order = await OrderModel.findOneAndUpdate(
    { razorpayOrderId },
    { status },
    { new: true }
  );
  if (!order) {
    next({ statusCode: 404, message: "Order not found!" });
  }
  return;
};

module.exports = {
  createOrder,
  verifyPaymentController,
};
