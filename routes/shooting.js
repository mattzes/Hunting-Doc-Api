const express = require('express');
const router = express.Router();
const { uploadShootingImages } = require('../handler/upload');
const { verifyAccessToken } = require('../handler/verify');
const { shootingValidation } = require('../validations/shooting');
const { idValidation } = require('../validations/genericValidation');
const Shooting = require('../models/shooting');
const fs = require('fs');
const path = require('path');

const moveFiles = (oldPath, newPath, shooting) => {
  if (shooting.avatar) {
    try {
      if (!fs.existsSync(newPath)) fs.mkdirSync(newPath, { recursive: true });
      fs.renameSync(path.join(oldPath, shooting.avatar), path.join(newPath, shooting.avatar));
    } catch (error) {
      return { error: { status: 500, msg: 'Failed while saving avatar' } };
    }
  }
  if (shooting.images) {
    try {
      if (!fs.existsSync(newPath)) fs.mkdirSync(newPath, { recursive: true });
      shooting.images.forEach(image => {
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

// * Add a schooting
router.post('/add', verifyAccessToken, uploadShootingImages, async (req, res, next) => {
  //Validate the data
  req.body.user_id = req.user._id.toString();
  const { error, value } = shootingValidation(req.body);
  if (error) return next({ status: 400, msg: error.details[0].message });

  //Create a new Shooting
  const shooting = new Shooting(value);

  //Move files
  let oldPath = path.join(process.env.ABSOLUTE_FILE_PATH_TMP, req.user._id);
  let newPath = path.join(process.env.ABSOLUTE_FILE_PATH, req.user._id, shooting._id.toString());
  const move = moveFiles(oldPath, newPath, shooting);
  if (move) next(move.error);

  //Save the shooting
  try {
    await shooting.save();
    res.status(201).json({ ok: true }).end();
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }
});

// * Get one shooting by shooting ID
router.get('/one', verifyAccessToken, async (req, res, next) => {
  //Validate ID
  const { error } = idValidation(req.body);
  if (error) return next({ status: 400, msg: error.details[0].message });

  //Find one shooting
  try {
    const shooting = await Shooting.findById(req.body._id);
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
router.get('/all', verifyAccessToken, async (req, res, next) => {
  //Validate IDs
  const { error, value } = idValidation({ _id: req.user._id.toString() });
  if (error) return next({ status: 400, msg: error.details[0].message });

  //Find all shootings for specific user
  try {
    const shootings = await Shooting.find({ user_id: value._id });
    if (shootings.length != 0) {
      res.send(shootings);
    } else {
      return next({ status: 406, msg: 'No shootings found for user ID: ' + req.user._id });
    }
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }
});

router.get('/avatar/:id', verifyAccessToken, async (req, res, next) => {
  // Validate data
  if (req.body != {}) return next({ status: 400, msg: 'body has to be empty' });

  try {
    const shooting = await Shooting.findById(req.params.id);
    if (!shooting) return next({ stauts: 400, msg: 'No shooting found with ID: ' + req.params.id });
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }
});

// * Update a shooting
router.patch('/patch', verifyAccessToken, uploadShootingImages, async (req, res, next) => {
  //Validate ID
  const id = idValidation({ _id: req.body._id });
  if (id.error) return next({ status: 400, msg: id.error.details[0].message });

  //Validate Data
  delete req.body._id;
  req.body.user_id = req.user._id.toString();
  const data = shootingValidation(req.body);
  if (data.error) return next({ status: 400, msg: data.error.details[0].message });

  //Delete files
  try {
    const shooting = await Shooting.findById(id.value._id);
    if (data.value.delImages) {
      data.value.delImages.forEach(async image => {
        fs.unlinkSync(path.join(process.env.ABSOLUTE_FILE_PATH, req.user._id, id.value._id, image));
        await shooting.updateOne({
          $pull: { images: image },
        });
      });
      delete data.value.delImages;
    }
    if (data.value.delAvatar) {
      fs.unlinkSync(path.join(process.env.ABSOLUTE_FILE_PATH, req.user._id, id.value._id, data.value.delAvatar));
      await shooting.updateOne({
        $unset: { avatar: '' },
      });
      delete data.value.delAvatar;
    }
  } catch (error) {
    return next({ status: 500, msg: 'failed while deleting old data' });
  }

  //Move files
  let oldPath = path.join(process.env.ABSOLUTE_FILE_PATH_TMP, req.user._id);
  let newPath = path.join(process.env.ABSOLUTE_FILE_PATH, req.user._id, shooting._id);
  const { error_1 } = moveFiles(oldPath, newPath, shooting);
  if (error_1) next(error_1);

  //Patch a shooting
  try {
    await Shooting.findByIdAndUpdate(id.value._id, data.value);
    const updatedShooting = await Shooting.findById(id.value._id);
    res.json(updatedShooting);
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }
});

// * Delete a shooting
router.delete('/delete', verifyAccessToken, async (req, res, next) => {
  //Validate ID
  const { error, value } = idValidation(req.body);
  if (error) return next({ status: 400, msg: error.details[0].message });

  // Delete files
  try {
    const shooting = await Shooting.findById(value._id);
    try {
      fs.rmdirSync(path.join(process.env.ABSOLUTE_FILE_PATH, req.user._id, shooting._id));
    } catch (error) {
      return next({ status: 500, msg: 'failed while deleting images' });
    }
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }

  //Delete a shooting
  try {
    await Shooting.findByIdAndDelete(value._id);
    res.json({ ok: true });
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }
});

module.exports = router;
