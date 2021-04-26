const mongoose = require("mongoose");

const ImagesSchema = mongoose.Schema({
  data: {
    type: Buffer,
    required: true,
    contentType: String,
  },
  name: {
    type: String,
    required: true,
    min: 5,
    max: 32,
  },
  shooting_id: {
    type: ObjectId,
    required: true,
  },
});

module.exports = mongoose.model("Images", ImagesSchema);
