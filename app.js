const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const config = require('./config');
const { clientError } = require('./handler/error');
require('dotenv/config');

// * Import Routes
const authRoute = require('./routes/auth');
const shootingRoute = require('./routes/shooting');

// * Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(config.corsOptions));
app.use(cookieParser());
app.use('/api/auth', authRoute);
app.use('/api/shooting', shootingRoute);
app.use(clientError);

// * Connect to DB
mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  () => console.log('DB connected!')
);

// * START APP ON PORT 3000
app.listen(process.env.PORT, () => console.log('Server Up and running on Port: ' + process.env.PORT));
