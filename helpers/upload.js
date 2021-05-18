const multer = require('multer');
const fs = require('fs');
const { path } = require('path');
require('dotenv');

// * Specifie the upload path for images
const multer_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dir = process.env.ABSOLUTE_IMAGES_PATH + req.user._id.toString();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    let filename = Date.now().toString() + '.jpg';
    if (!req.body.images) req.body.images = [];
    req.body.images.push(filename);
    cb(null, filename);
  },
});

// * set the upload with multer
const upload = multer({
  storage: multer_storage,
});

module.exports.upload = upload;
