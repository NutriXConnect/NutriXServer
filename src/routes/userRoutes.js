const express = require("express");

const {
  createUser,
  login,
  deleteUser,
} = require("../controllers/userController");
const { authenticate, authorize } = require("../utils/authentication");

const router = express.Router();

router.post("/", createUser);
router.post("/login", login);
router.delete(
  "/:id",
  authenticate,
  authorize(["admin", "superadmin"]),
  deleteUser
);

module.exports = router;
