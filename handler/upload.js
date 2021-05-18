const multer = require('multer');
const fs = require('fs');
require('dotenv');

// * Specifie the upload path for images
const shootingImageStorage = multer.diskStorage({
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
const uploadShootingImages = multer({
  storage: shootingImageStorage,
});

module.exports.uploadShootingImages = uploadShootingImages;
