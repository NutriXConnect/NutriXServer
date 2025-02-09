const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dietPlanSchemaObj = {
  subscription: {
    type: Schema.Types.ObjectId,
    ref: "SubscriptionModel",
    required: true,
  },
  dietitian: {
    type: Schema.Types.ObjectId,
    ref: "DietitianModel",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  mealPlan: [
    {
      name: { type: String, required: true },
      time: { type: String, required: true },
      meals: [
        {
          type: Schema.Types.ObjectId,
          ref: "MealItemModel",
          required: true,
        },
      ],
    },
  ],
  status: {
    type: String,
    enum: ["pending", "active", "completed"],
    default: "pending",
  },
};

const dietPlanSchema = new mongoose.Schema(dietPlanSchemaObj, {
  timestamps: true,
});

const DietPlanModel = mongoose.model("DietPlanModel", dietPlanSchema);

module.exports = DietPlanModel;
