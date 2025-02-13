const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const dietitianRoutes = require("./routes/dietitianRoutes");
const orderRoutes = require("./routes/orderRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const trackingRoutes = require("./routes/trackingRoutes");
const { generalLimiter } = require("./utils/rateLimiter");
const { default: helmet } = require("helmet");

const app = express();

dotenv.config();

const { PORT, DB_USER, DB_PASSWORD } = process.env;

const port = PORT;

const dbURL = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.2ogy90k.mongodb.net/NutriXConnect?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(dbURL).then((connection) => {
  console.log("db is connected");
});

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CORS_ORIGIN_PROD
        : process.env.CORS_ORIGIN_DEV,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(generalLimiter);
app.use(helmet());

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dietitian", dietitianRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/track", trackingRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    statusCode,
    message,
  });
});

app.listen(port, () => {
  console.log(`server is running at ${port}`);
});
