const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchemaObj = {
  name: {
    type: String,
    required: true,
  },

  age: {
    type: Number,
    required: true,
  },

  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "other"],
  },

  mobile: {
    type: String,
    required: false,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    required: true,
    enum: ["user", "dietitian", "admin", "superadmin"],
    default: "user",
  },

  resetPasswordRequired: {
    type: Boolean,
    required: true,
    default: false,
  },

  avatar: {
    type: String,
    required: false,
  },

  otp: {
    type: String,
    required: false,
  },

  otpExpiry: {
    type: Date,
    required: false,
  },
  orders: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "OrderModel",
    required: false,
    default: [],
  },
};

const userSchema = new mongoose.Schema(userSchemaObj, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model("UserModel", userSchema);

module.exports = UserModel;
