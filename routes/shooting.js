const express = require('express');
const router = express.Router();
const { uploadShootingImage, uploadShootingAvatar } = require('../handler/upload');
const { verifyAccessToken } = require('../handler/verify');
const { shootingValidation } = require('../validations/shooting');
const { idValidation } = require('../validations/genericValidation');
const Shooting = require('../models/shooting');
const fs = require('fs');
const path = require('path');

const moveFiles = (oldPath, newPath, files) => {
  let avatar;
  let images;

  if (files.avatar && path.join(oldPath, files.avatar)) {
    try {
      if (!fs.existsSync(newPath)) fs.mkdirSync(newPath, { recursive: true });
      fs.renameSync(path.join(oldPath, files.avatar), path.join(newPath, files.avatar));
      avatar = files.avatar;
    } catch (error) {
      return { error: { status: 500, msg: 'Failed while saving avatar' } };
    }
  }
  if (files.images) {
    try {
      if (!fs.existsSync(newPath)) fs.mkdirSync(newPath, { recursive: true });
      files.images.map(image => {
        let imagePath = path.join(oldPath, image);
        if (fs.existsSync(imagePath)) {
          fs.renameSync(imagePath, path.join(newPath, image));
          images.push(image);
        }
      });
    } catch (error) {
      return { error: { status: 500, msg: 'Failed while saving images' } };
    }
  }
  // Clear path after moving - prevent file overflow
  try {
    if (fs.existsSync(oldPath)) fs.rmdirSync(oldPath, { recursive: true });
  } catch (error) {}
  return { avatar: avatar, images: images };
};

// * Add schooting data
router.post('/data', verifyAccessToken, async (req, res, next) => {
  //Validate the data
  req.body.user_id = req.user._id.toString();
  let { error, value } = shootingValidation(req.body);
  if (error) return next({ status: 400, msg: error.details[0].message });

  //Create a new Shooting
  let shooting = new Shooting(value);

  //Move files from tmp to images destination
  if (shooting.avatar || shooting.images) {
    let oldPath = path.join(process.env.ABSOLUTE_FILE_PATH_TMP, value.user_id);
    let newPath = path.join(process.env.ABSOLUTE_FILE_PATH, value.user_id, shooting._id.toString());
    movedFiles = moveFiles(oldPath, newPath, shooting);
    if (movedFiles.error) return next(movedFiles.error);
    shooting.avatar = movedFiles.avatar;
    shooting.images = movedFiles.images;
  }

  //Save the shooting
  try {
    await shooting.save();
    res.status(201).json(shooting).end();
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }
});

// * Patch schooting data
router.patch('/data', verifyAccessToken, async (req, res, next) => {
  //Validate the data
  req.body.user_id = req.user._id.toString();
  if (!req.body._id) return next({ status: 404, msg: '_id is required' });
  let { error, value } = shootingValidation(req.body);
  if (error) return next({ status: 400, msg: error.details[0].message });

  //Find and update the shooting
  let { _id, user_id, delAvatar, delImages, ...updateData } = value;
  let updatedShooting;
  try {
    await Shooting.findOneAndUpdate({ _id: value._id, user_id: value.user_id }, updateData);
    updatedShooting = await Shooting.findById(_id);
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }

  //Move files from tmp to images destination
  let newPath = path.join(process.env.ABSOLUTE_FILE_PATH, value.user_id, updatedShooting._id.toString());
  if (updatedShooting.avatar || updatedShooting.images) {
    let oldPath = path.join(process.env.ABSOLUTE_FILE_PATH_TMP, value.user_id);
    let files = { avatar: value.avatar, images: value.images };
    movedFiles = moveFiles(oldPath, newPath, files);
    if (movedFiles.error) next(movedFiles.error);
    updatedShooting.avatar = movedFiles.avatar;
    updatedShooting.images.push(movedFiles.images);
  }

  //Save the shooting
  try {
    await updatedShooting.save();
    res.status(201).json({ updatedShooting }).end();
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }

  if (delAvatar) fs.rmSync(path.join(newPath, delAvatar), { force: true, maxRetries: 5, retryDelay: 30000 });
  if (delImages)
    delImages.map(image => {
      fs.rmSync(path.join(newPath, image), { force: true, maxRetries: 5, retryDelay: 30000 });
    });
});

// * Get one shooting by shooting ID
router.get('/data', verifyAccessToken, async (req, res, next) => {
  //Validate ID
  let { error } = idValidation(req.body);
  if (error) return next({ status: 400, msg: error.details[0].message });

  //Find one shooting
  try {
    let shooting = await Shooting.findOne({ _id: req.body._id, user_id: req.user._id });
    if (shooting) {
      res.send(shooting);
    } else {
      return next({ status: 406, msg: 'No Shooting with ID: ' + req.body._id + 'found' });
    }
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }
});

// * Get all shootings for specific user
router.get('/data/all', verifyAccessToken, async (req, res, next) => {
  //Validate IDs
  let { error, value } = idValidation({ _id: req.user._id.toString() });
  if (error) return next({ status: 400, msg: error.details[0].message });

  //Find all shootings for specific user
  try {
    let shootings = await Shooting.find({ user_id: value._id });
    if (shootings.length != 0) {
      res.send(shootings);
    } else {
      return next({ status: 406, msg: 'No shootings found for user ID: ' + req.user._id });
    }
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }
});

// * Delete a shooting
router.delete('', verifyAccessToken, async (req, res, next) => {
  //Validate ID
  let { error, value } = idValidation(req.body);
  if (error) return next({ status: 400, msg: error.details[0].message });

  // Delete files
  try {
    let shooting = await Shooting.findOne({ _id: value._id, user_id: req.user._id });
    try {
      fs.rmdirSync(path.join(process.env.ABSOLUTE_FILE_PATH, req.user._id.toString(), shooting._id.toString()));
    } catch (error) {
      return next({ status: 500, msg: 'failed while deleting images' });
    }
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }

  //Delete a shooting
  try {
    await Shooting.findOneAndDelete({ _id: value._id, user_id: req.user._id });
    res.status(200).json({ ok: true });
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }
});

// * Upload an avatar in tmp folder (can also be used as a patch with delAvatar key in req.body)
router.post('/avatar', verifyAccessToken, uploadShootingAvatar, (req, res, next) => {
  //Set timer to delete file if its wont be saved after 1h
  setTimeout(() => {
    fs.rmSync(path.join(process.env.ABSOLUTE_FILE_PATH_TMP, req.user._id, req.body.avatar), { force: true });
  }, 3600000);

  res.status(201).json({ avatarName: req.body.avatar }).end();

  if (req.body.delAvatar)
    fs.rmSync(path.join(process.env.ABSOLUTE_FILE_PATH_TMP, req.user._id, req.body.delAvatar), { force: true });
});

// * Upload an image in tmp folder
router.post('/image', verifyAccessToken, uploadShootingImage, (req, res, next) => {
  setTimeout(() => {
    fs.rmSync(path.join(process.env.ABSOLUTE_FILE_PATH_TMP, req.user._id, req.body.image), { force: true });
  }, 3600000);

  res.status(201).json({ imageName: req.body.image });
});

// * Delete an image in tmp folder
router.delete('/image', verifyAccessToken, (req, res, next) => {
  fs.rmSync(path.join(process.env.ABSOLUTE_FILE_PATH_TMP, req.user._id, req.body.delImage), { force: true });

  res.send('test').end();
});

module.exports = router;
