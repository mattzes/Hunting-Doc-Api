const mongoose = require("mongoose");
const pointSchema = require("./genericSchema");

const SchootingSchema = mongoose.Schema({
  user_id: {
    type: ObjectId,
    required: true,
    maxLength: 24,
  },
  animal_species: {
    type: String,
    maxLength: 32,
  },
  gender: {
    type: String,
    enum: ["m", "w"],
    minLength: 1,
    maxLength: 1,
  },
  weight: {
    type: Number,
  },
  age: {
    type: Number,
  },
  date: {
    type: Date,
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
    type: pointSchema,
  },
  hit_position: {
    type: pointSchema,
  },
  found_position: {
    type: pointSchema,
  },
  distance: {
    type: Number,
  },
  weapon: {
    type: String,
    maxLength: 64,
  },
});

module.exports = mongoose.model("ShootingSchema", SchootingSchema);
