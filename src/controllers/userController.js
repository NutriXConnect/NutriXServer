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

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
