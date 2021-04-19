const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
require("dotenv/config");

app.use(bodyParser.json());

//Import Routes
const userRoute = require("./routes/user");
const entrysRoute = require("./routes/entrys");

// Middleware
app.use(express.json());
// Route Middleware
app.use("/api/user", userRoute);
app.use("/api/entrys", entrysRoute);

//Connect to DB
mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log("DB connected!")
);

//START APP ON PORT 3000
app.listen(3000, () => console.log("Server Up and running on Port 3000"));
