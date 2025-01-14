const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/userModel");
const {
  createFactory,
  getFactory,
  getByIdFactory,
  updateFactory,
  deleteFactory,
} = require("../utils/crudFactory");

dotenv.config();

const { SECRET_KEY } = process.env;

const createUser = createFactory(UserModel);
const getUsers = getFactory(UserModel);
const getUserById = getByIdFactory(UserModel);
const updateUser = updateFactory(UserModel);
const deleteUser = deleteFactory(UserModel);

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      next({
        statusCode: 401,
        message: "Authentication failed. User not found",
      });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      next({
        statusCode: 401,
        message: "Authentication failed. Wrong password",
      });
    }
    jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      SECRET_KEY,
      { algorithm: "HS256" },
      (err, data) => {
        if (err) {
          console.log(err);
          throw new Error(err.message);
        }
        res.cookie("token", data, {
          maxAge: 30 * 60 * 1000,
          httpOnly: true,
        });
        res.status(200).json({ email: user.email, name: user.name });
      }
    );
  } catch (error) {
    next({ statusCode: 500, message: "Internal server error" });
  }
  return;
};
module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
};
