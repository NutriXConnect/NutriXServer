const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/userRoutes");

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

app.use("/api/user", userRoutes);

app.use((err, res) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: statusCode,
    message: message,
  });
});

app.listen(port, () => {
  console.log(`server is running at ${port}`);
});
