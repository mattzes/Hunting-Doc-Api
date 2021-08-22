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
app.use(cors(config.corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/auth', authRoute);
app.use('/api/shooting', shootingRoute);
app.use(clientError);

// * Connect to DB
const db = mongoose.connection;

db.on('connecting', function () {
  console.log('connecting to MongoDB...');
});
db.on('error', function (error) {
  console.error('Error in MongoDb connection: ' + error);
  mongoose.disconnect();
});
db.on('connected', function () {
  console.log('MongoDB connected!');
});
db.once('open', function () {
  console.log('MongoDB connection opened!');
});
db.on('reconnected', function () {
  console.log('MongoDB reconnected!');
});
db.on('disconnected', function () {
  console.log('MongoDB disconnected!');
  mongoose.connect(process.env.DB_CONNECTION_DEV, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
});

mongoose.connect(process.env.DB_CONNECTION_DEV, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// * START APP ON PORT 3000
app.listen(process.env.PORT, () => console.log('Server Up and running on Port: ' + process.env.PORT));
