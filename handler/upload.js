const multer = require('multer');
const fs = require('fs');
const config = require('../config');
const path = require('path');
require('dotenv');

// * Specifie the upload path for images
const shootingImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      let dir = path.join(process.env.ABSOLUTE_FILE_PATH_TMP, req.user._id.toString());
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      cb(null, dir);
    } catch (error) {
      cb({ status: 500, msg: 'failed to store image in destination' });
    }
  },
  filename: function (req, file, cb) {
    let filetype = file.originalname.split('.');
    let filename = Date.now().toString() + '.' + filetype[filetype.length - 1];
    switch (file.fieldname) {
      case 'image':
        req.body.image = filename;
        break;
      case 'avatar':
        filename = 'avatar_' + filename;
        req.body.avatar = filename;
        break;
    }
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

// * set the upload for image with multer
const uploadShootingImage = multer({
  limits: {
    fileSize: config.shootingFileSize,
  },
  fileFilter: shootingFileFilter,
  storage: shootingImageStorage,
}).fields([{ name: 'image', maxCount: 1 }]);

// * set the upload for avatar with multer
const uploadShootingAvatar = multer({
  limits: {
    fileSize: config.shootingFileSize,
  },
  fileFilter: shootingFileFilter,
  storage: shootingImageStorage,
}).fields([{ name: 'avatar', maxCount: 1 }]);

module.exports.uploadShootingImage = uploadShootingImage;
module.exports.uploadShootingAvatar = uploadShootingAvatar;
