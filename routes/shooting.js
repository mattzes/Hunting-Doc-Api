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
  if (files.avatar) {
    try {
      if (!fs.existsSync(newPath)) fs.mkdirSync(newPath, { recursive: true });
      fs.renameSync(path.join(oldPath, files.avatar), path.join(newPath, files.avatar));
    } catch (error) {
      return { error: { status: 500, msg: 'Failed while saving avatar' } };
    }
  }
  if (files.images) {
    try {
      if (!fs.existsSync(newPath)) fs.mkdirSync(newPath, { recursive: true });
      files.images.forEach(image => {
        fs.renameSync(path.join(oldPath, image), path.join(newPath, image));
      });
    } catch (error) {
      return { error: { status: 500, msg: 'Failed while saving images' } };
    }
  }
  // Clear path after moving - prevent file overflow
  try {
    if (fs.existsSync(oldPath)) fs.rmdirSync(oldPath, { recursive: true });
  } catch (error) {}
  return;
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
    error = moveFiles(oldPath, newPath, shooting);
    if (error) next(error);
  }

  //Save the shooting
  try {
    await shooting.save();
    res.status(201).json({ ok: true }).end();
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
  let { _id, user_id, ...updateData } = value;
  let updatedShooting;
  try {
    await Shooting.findOneAndUpdate({ _id: value._id, user_id: value.user_id }, updateData);
    updatedShooting = await Shooting.findById(_id);
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }

  //Move files from tmp to images destination
  if (updatedShooting.avatar || updatedShooting.images) {
    let files = { avatar: value.avatar, images: value.images };
    let oldPath = path.join(process.env.ABSOLUTE_FILE_PATH_TMP, value.user_id);
    let newPath = path.join(process.env.ABSOLUTE_FILE_PATH, value.user_id, updatedShooting._id.toString());
    error = moveFiles(oldPath, newPath, files);
    if (error) next(error);
  }

  //Save the shooting
  try {
    await updatedShooting.save();
    res.status(201).json({ updatedShooting }).end();
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }
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
    res.json({ ok: true });
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }
});

// * Upload an avatar in tmp folder
router.post('/avatar', verifyAccessToken, uploadShootingAvatar, (req, res, next) => {
  //Set timer to delete file if its wont be saved after 1h
  setTimeout(() => {
    fs.rmSync(path.join(process.env.ABSOLUTE_FILE_PATH_TMP, req.user._id, req.body.avatar), { force: true });
  }, 3600000);

  res.status(201).json({ avatarName: req.body.avatar }).end();
});

router.get('/avatar', verifyAccessToken, async (req, res, next) => {
  // Validate data
  if (req.body != {}) return next({ status: 400, msg: 'body has to be empty' });

  try {
    let shooting = await Shooting.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!shooting) return next({ stauts: 400, msg: 'No shooting found with ID: ' + req.params.id });
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }
});

module.exports = router;
