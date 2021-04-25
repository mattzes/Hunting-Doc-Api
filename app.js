const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv/config");

const corsOptions = {
  origin: process.env.DOMAIN,
};

// * Import Routes
const authRoute = require("./routes/auth");
const shootingsRoute = require("./routes/shootings");

// * Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
// Route Middleware
app.use("/api/auth", authRoute);
app.use("/api/shootings", shootingsRoute);

// * Connect to DB
mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log("DB connected!")
);

// * START APP ON PORT 3000
app.listen(process.env.PORT, () =>
  console.log("Server Up and running on Port: " + process.env.PORT)
);
