const mongoose = require("mongoose");

const fitnessSchemaObj = {
  height: {
    type: Number,
    required: false,
  },

  weight: {
    type: Number,
    required: false,
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
