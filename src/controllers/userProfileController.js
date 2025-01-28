const FitnessDetailsModel = require("../models/fitnessDetailsModel");
const UserModel = require("../models/userModel");

const updateUserProfileDetails = async (req, res, next) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      req.body.personal,
      {
        new: true,
      }
    ).select("name email age mobile gender avatar -_id");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    let fitnessDetails = await FitnessDetailsModel.findOne({
      user: req.user._id,
    });

    let fitnessDetailsPromise;
    if (fitnessDetails) {
      fitnessDetailsPromise = FitnessDetailsModel.findByIdAndUpdate(
        fitnessDetails._id,
        req.body.fitness,
        { new: true }
      );
    } else {
      fitnessDetailsPromise = FitnessDetailsModel.create({
        user: req.user._id,
        ...req.body.fitness,
      });
    }
    fitnessDetails = await fitnessDetailsPromise.select("height weight -_id");

    return res
      .status(200)
      .json({ personal: updatedUser, fitness: fitnessDetails });
  } catch (error) {
    next(error);
  }
};

const getUserProfileByUserId = async (req, res, next) => {
  try {
    // Fetch user profile from database based on email
    const userId = req.user._id;
    const user = await UserModel.findById(userId).select(
      "name email age mobile gender avatar -_id"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    const userProfile = await FitnessDetailsModel.findOne({ user: userId });

    return res.status(200).json({
      personal: user,
      fitness: userProfile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateUserProfileDetails,
  getUserProfileByUserId,
};
