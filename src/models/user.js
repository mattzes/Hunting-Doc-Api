const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minLength: 6,
      maxLength: 32,
    },
    firstName: {
      type: String,
      required: true,
      maxLength: 32,
    },
    lastName: {
      type: String,
      required: true,
      maxLength: 32,
    },
    initials: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 2,
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
      isAdmin: {
        type: Boolean,
        default: undefined,
      },
    },
    refreshTokens: {
      type: [String],
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model('User', UserSchema);
