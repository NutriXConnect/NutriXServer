const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subscriptionSchemaObj = {
  user: {
    type: Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  dietitian: {
    type: Schema.Types.ObjectId,
    ref: "DietitianModel",
    required: true,
  },
  order: {
    type: Schema.Types.ObjectId,
    ref: "OrderModel",
    required: true,
  },
  plan: {
    type: Schema.Types.ObjectId,
    ref: "PlanModel",
    required: true,
  },
  status: {
    type: String,
    enum: ["created", "started", "inprogress", "completed"],
    default: "created",
  },
  durationInMonths: {
    type: Number,
    required: true,
  },
  subscriptionStartDate: {
    type: Date,
  },
  subscriptionEndDate: {
    type: Date,
  },
  dietPlanCreatedAt: {
    type: Date,
  },
  paymentStatus: {
    type: String,
    enum: ["paid", "refunded", "partially_refunded"],
    default: "paid",
  },
  dietPlan: {
    type: Schema.Types.ObjectId,
    ref: "DietPlanModel",
  },
};

const subscriptionSchema = new mongoose.Schema(subscriptionSchemaObj, {
  timestamps: true,
});

// Pre-save middleware to calculate end date when start date is set
subscriptionSchema.pre("save", function (next) {
  if (this.subscriptionStartDate == null) {
  } else if (isNaN(new Date(this.subscriptionStartDate))) {
    return next(new Error("Invalid subscriptionStartDate"));
  } else {
    const startDate = new Date(this.subscriptionStartDate);
    // Add durationInMonths * 30 days to the start date
    const daysToAdd = (this.durationInMonths || 0) * 30;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysToAdd); // Add the days

    this.subscriptionEndDate = endDate;
  }
  next();
});

// Instance method to check if subscription is active
subscriptionSchema.methods.isActive = function () {
  const now = new Date();
  return (
    this.status === "in-progress" &&
    this.subscriptionStartDate &&
    this.subscriptionEndDate &&
    now >= this.subscriptionStartDate &&
    now <= this.subscriptionEndDate
  );
};

const SubscriptionModel = mongoose.model(
  "SubscriptionModel",
  subscriptionSchema
);

module.exports = SubscriptionModel;
