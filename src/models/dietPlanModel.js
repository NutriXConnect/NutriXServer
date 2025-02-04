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
  plans: [
    {
      date: { type: Date, required: true },
      meals: [
        {
          time: { type: String, required: true }, // e.g., "breakfast", "lunch"
          foodItems: [{ type: String, required: true }], // List of food items
          calories: { type: Number },
          notes: { type: String },
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
