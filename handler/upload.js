const multer = require('multer');
const fs = require('fs');
const config = require('../config');
require('dotenv');

// * Specifie the upload path for images
const shootingImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      let dir = process.env.ABSOLUTE_FILE_PATH + req.user._id.toString();
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      cb(null, dir);
    } catch (error) {
      cb({ status: 500, msg: 'failed to store images in destination' });
    }
  },
  filename: function (req, file, cb) {
    let filetype = file.originalname.split('.');
    let filename = Date.now().toString() + '.' + filetype[filetype.length - 1];
    if (!req.body.images) req.body.images = [];
    req.body.images.push(filename);
    cb(null, filename);
  },
});

const shootingFileFilter = (req, file, cb) => {
  if (new RegExp(config.allowedFileTypes).test(file.originalname)) {
    cb(null, true);
  } else {
    cb({ status: 415, msg: 'file type is not allowed' });
  }
};

// * set the upload with multer
const uploadShootingImages = multer({
  limits: {
    fileSize: config.shootingFileSize,
    files: config.maxShootingFiles,
  },
  fileFilter: shootingFileFilter,
  storage: shootingImageStorage,
}).array('images');

module.exports.uploadShootingImages = uploadShootingImages;
