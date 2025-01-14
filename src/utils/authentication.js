const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

const { SECRET_KEY } = process.env;

const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ message: "Invalid token." });
  }
};

const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Forbidden. You do not have the required role." });
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
};
