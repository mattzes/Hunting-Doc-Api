const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 6,
    max: 32,
  },
  password: {
    type: String,
    required: true,
    max: 1024,
  },
  email: {
    type: String,
    required: true,
    min: 6,
  },
});

module.exports = mongoose.model("User", UserSchema);
