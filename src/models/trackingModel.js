const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const trackingSchemaObj = {
  user: {
    type: Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  trackingDay: {
    type: Date,
    required: true,
  },
  mealPlans: [
    {
      name: { type: String, required: true },
      time: { type: String, required: true },
      meals: [
        {
          meal: {
            type: Schema.Types.ObjectId,
            ref: "MealItemModel",
            required: true,
          },
          tracked: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
  ],
  totalMealsTracked: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalMealsInTheDay: {
    type: Number,
    required: true,
  },
};

const trackingSchema = new mongoose.Schema(trackingSchemaObj, {
  timestamps: true,
});

trackingSchema.index({ user: 1, trackingDay: 1 }, { unique: true });

const TrackingModel = mongoose.model("TrackingModel", trackingSchema);

module.exports = TrackingModel;
