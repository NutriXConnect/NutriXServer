const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UnitEnum = {
  GRAMS: "g",
  MILLILITERS: "ml",
  PIECES: "pcs",
  CUPS: "cups",
  TABLESPOONS: "tbsp",
  TEASPOONS: "tsp",
  OUNCES: "oz",
  POUNDS: "lbs",
};

const mealItemSchemaObj = {
  name: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
    enum: Object.values(UnitEnum),
    default: UnitEnum.GRAMS,
  },
  nutritionalContent: {
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    protein: {
      type: Number,
      required: true,
      min: 0,
    },
    fiber: {
      type: Number,
      required: true,
      min: 0,
    },
    fats: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
};

const mealItemSchema = new Schema(mealItemSchemaObj, {
  timestamps: true,
});
// Create the model
const MealItemModel = mongoose.model("MealItemModel", mealItemSchema);

module.exports = {
  MealItemModel,
  UnitEnum,
};
