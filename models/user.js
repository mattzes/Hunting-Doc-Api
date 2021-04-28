const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLength: 6,
    maxLength: 32,
  },
  password: {
    type: String,
    required: true,
    minLength: 58,
    maxLength: 62,
  },
  email: {
    type: String,
    required: true,
    minLength: 6,
  },
  scopes: {
    type: [String],
    default: undefined,
  },
  refresh_tokens: {
    type: [String],
    default: undefined,
  },
});

module.exports = mongoose.model("User", UserSchema);
