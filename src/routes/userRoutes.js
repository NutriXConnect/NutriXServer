const express = require("express");

const { createUser, deleteUser } = require("../controllers/userController");
const { authenticate, authorize } = require("../utils/authentication");

const router = express.Router();

router.post("/", createUser);
router.delete(
  "/:id",
  authenticate,
  authorize(["admin", "superadmin"]),
  deleteUser
);

module.exports = router;
