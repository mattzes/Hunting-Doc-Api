const mongoose = require("mongoose");

const SchootingSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    maxLength: 24,
  },
  animal_species: {
    type: String,
    maxLength: 32,
  },
  gender: {
    type: String,
    enum: ["m", "w", "unknown"],
    maxLength: 7,
  },
  weight: {
    type: Number,
  },
  age: {
    type: Number,
  },
  date: {
    type: Number,
    required: true,
  },
  hunting_ground: {
    type: String,
    maxLength: 64,
  },
  raised_hide: {
    type: String,
    maxLength: 64,
  },
  comment: {
    type: String,
    maxLength: 400,
  },
  shooting_position: {
    type: [Number],
  },
  hit_position: {
    type: [Number],
  },
  found_position: {
    type: [Number],
  },
  distance: {
    type: Number,
  },
  weapon: {
    type: String,
    maxLength: 64,
  },
});

module.exports = mongoose.model("Shooting", SchootingSchema);
