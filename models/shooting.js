const mongoose = require('mongoose');

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
    enum: ['m', 'w', 'unknown'],
    maxLength: 7,
  },
  weight: {
    type: Number,
  },
  age: {
    type: Number,
  },
  date: {
    type: String,
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
    default: undefined,
  },
  hit_position: {
    type: [Number],
    default: undefined,
  },
  found_position: {
    type: [Number],
    default: undefined,
  },
  distance: {
    type: Number,
  },
  weapon: {
    type: String,
    maxLength: 64,
  },
  images: {
    type: [String],
    default: undefined,
  },
  avatar: {
    type: String,
  },
});

module.exports = mongoose.model('Shooting', SchootingSchema);
