const mongoose = require("mongoose");

const dietitianProfileSchemaObj = {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  startingPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  clientsServed: {
    type: Number,
    required: true,
    default: 1,
  },
  plans: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlanModel",
      required: false,
      default: [],
    },
  ],
};

const dietitianProfileSchema = new mongoose.Schema(dietitianProfileSchemaObj, {
  timestamps: true,
});

const DietitianProfileModel = mongoose.model(
  "DietitianProfileModel",
  dietitianProfileSchema
);

module.exports = DietitianProfileModel;
