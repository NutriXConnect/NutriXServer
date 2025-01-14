const mongoose = require("mongoose");

const fitnessSchemaObj = {
  age: {
    type: Number,
    required: true,
  },

  height: {
    type: Number,
    required: false,
  },

  weight: {
    type: Number,
    required: false,
  },

  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "other"],
  },

  others: {
    type: String,
    required: false,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
};

const fitnessSchema = new mongoose.Schema(fitnessSchemaObj, {
  timestamps: true,
});

const FitnessDetailsModel = mongoose.model(
  "FitnessDetailsModel",
  fitnessSchema
);

module.exports = FitnessDetailsModel;
