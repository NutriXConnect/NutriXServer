const UserModel = require("../models/userModel");
const {
  createFactory,
  getFactory,
  getByIdFactory,
  updateFactory,
  deleteFactory,
} = require("../utils/crudFactory");

const createUser = createFactory(UserModel);
const getUsers = getFactory(UserModel);
const getUserById = getByIdFactory(UserModel);
const updateUser = updateFactory(UserModel);
const deleteUser = deleteFactory(UserModel);

const deleteAllOrders = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await UserModel.findById(userId);
    delete user.orders;
    user.orders = [];
    await user.save();
    res.status(204).json({ message: "All orders deleted successfully" });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  deleteAllOrders,
};
