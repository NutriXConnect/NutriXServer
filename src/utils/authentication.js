const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

const { SECRET_KEY } = process.env;

const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    next({
      statusCode: 401,
      message:
        "Access denied. No token provided. Please logout and login again.",
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    next({
      statusCode: 401,
      message: err.message,
    });
  }
};

const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    next({
      statusCode: 403,
      message: "You are not authorized to access this feature.",
    });
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
};
