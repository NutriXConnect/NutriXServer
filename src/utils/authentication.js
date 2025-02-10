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
  // If req.user.role is an array, check if any of the user's roles match the authorized roles.
  const userRoles = req.user.role;
  const authorized = userRoles.some((role) => roles.includes(role));

  // If no valid role is found, return a 403 response
  if (!authorized) {
    return next({
      statusCode: 403,
      message: "You are not authorized to access this feature.",
    });
  }

  // If authorized, call next() to move to the next middleware
  next();
};

module.exports = {
  authenticate,
  authorize,
};
