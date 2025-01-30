const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchemaObj = {
  userId: {
    type: Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  dietitianId: {
    type: Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  planDetails: {
    planId: {
      type: Schema.Types.ObjectId,
      ref: "PlanModel",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  razorpayOrderId: {
    type: String,
    required: false,
  },
  /*paymentDetails: {
    transactionId: String,
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentDate: Date,
  }, */
  totalAmount: {
    type: Number,
    required: true,
  },
};
const orderSchema = new Schema(orderSchemaObj, { timestamps: true });

const OrderModel = mongoose.model("OrderModel", orderSchema);

module.exports = OrderModel;
