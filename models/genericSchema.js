const mongoose = require("mongoose");

const pointSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

module.exports.pointSchema = pointSchema;
