const mongoose = require("mongoose");

const planSchemaObj = {
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number, // Example in months
    required: true,
  },
};
const planSchema = new mongoose.Schema(planSchemaObj, { timestamps: true });

const PlanModel = mongoose.model("PlanModel", planSchema);

module.exports = PlanModel;
