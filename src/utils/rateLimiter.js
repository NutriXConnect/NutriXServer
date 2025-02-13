const { default: rateLimit } = require("express-rate-limit");

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again after 15 mins.",
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 10 requests per windowMs
  message: "Too many login attempts, please try again after 1 minute.",
});

const orderLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many order requests, please try again after 1 minute.",
});

const trackingLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minute
  max: 20, // limit each IP to 20 requests per windowMs
  message: "Too many tracking requests, please try again after 2 minute.",
});

module.exports = { generalLimiter, authLimiter, orderLimiter, trackingLimiter };
