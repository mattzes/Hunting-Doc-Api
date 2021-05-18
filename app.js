const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv/config');

const corsOptions = {
  origin: process.env.DOMAIN,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
};

// * Import Routes
const authRoute = require('./routes/auth');
const shootingRoute = require('./routes/shooting');

// * Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());
// Route Middleware
app.use('/api/auth', authRoute);
app.use('/api/shooting', shootingRoute);

// * Connect to DB
mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  () => console.log('DB connected!')
);

// * START APP ON PORT 3000
app.listen(process.env.PORT, () => console.log('Server Up and running on Port: ' + process.env.PORT));
