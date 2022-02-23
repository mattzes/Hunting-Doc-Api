const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { clientError } = require('./handler/error');
require('dotenv/config');

// * Import Routes
const statusRoute = require('./routes/status');
const authRoute = require('./routes/auth');
const shootingRoute = require('./routes/shooting');
const shootingFilesRoute = require('./routes/shootingFiles');

// * Middleware
app.use(
  // view all options at https://expressjs.com/en/resources/middleware/cors.html#configuration-options
  cors({
    origin: process.env.ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTION'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/status', statusRoute);
app.use('/api/auth', authRoute);
app.use('/api/shooting', shootingRoute);
app.use('/shooting', shootingFilesRoute);
app.use(clientError);

// * Connect to DB
const db = mongoose.connection;

db.on('connecting', () => {
  console.log('connecting to MongoDB...');
});
db.on('error', error => {
  console.error('Error in MongoDb connection: ' + error);
  mongoose.disconnect();
});
db.on('connected', () => {
  console.log('MongoDB connected!');
});
db.once('open', () => {
  console.log('MongoDB connection opened!');
});
db.on('reconnected', () => {
  console.log('MongoDB reconnected!');
});
db.on('disconnected', () => {
  console.log('MongoDB disconnected!');
  mongoose.connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
});

mongoose.connect(process.env.DB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// * START APP ON PORT 3000
app.listen(process.env.PORT, () => console.log('Server Up and running on Port: ' + process.env.PORT));
