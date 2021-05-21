const express = require('express');
const router = express.Router();
const { uploadShootingImages } = require('../handler/upload');
const { verifyAccessToken } = require('../handler/verify');
const { shootingValidation } = require('../validations/shooting');
const { idValidation } = require('../validations/genericValidation');
const Shooting = require('../models/shooting');
const fs = require('fs');

// * Add a schooting
router.post('/add', verifyAccessToken, uploadShootingImages, async (req, res, next) => {
  //Validate the data
  req.body.user_id = req.user._id.toString();
  const { error, value } = shootingValidation(req.body);
  if (error) return next({ status: 400, msg: error.details[0].message });

  //Create a new Shooting
  const shooting = new Shooting(value);

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
  if (req.body != {}) return next({status: 400, msg: "body has to be empty"})
  
  const shooting;
  try {
    shooting = await Shooting.findById(req.params.id);
    if (!shooting) return next({stauts: 400, msg: "No shooting found with ID: " + req.params.id})
  } catch (error) {
    return next({status: 500, msg: error.message})
  }  
})

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
      data.value.delImages.forEach(async e => {
        fs.unlinkSync(process.env.ABSOLUTE_FILE_PATH + id.value._id + '/' + e);
        await shooting.updateOne({
          $pull: { images: e },
        });
      });
      delete data.value.delImages;
    }
    if (data.value.delAvatar) {
      fs.unlinkSync(process.env.ABSOLUTE_FILE_PATH + id.value._id + '/' + data.value.delAvatar);
      await shooting.updateOne({
        $unset: { avatar: '' },
      });
      delete data.value.delAvatar;
    }
  } catch (error) {
    return next({ status: 500, msg: 'failed while deleting old data' });
  }

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
      fs.unlinkSync(process.env.ABSOLUTE_FILE_PATH + shooting._id + '/' + shooting.avatar);
      shooting.images.forEach(e => fs.unlinkSync(process.env.ABSOLUTE_FILE_PATH + shooting._id + '/' + e));
    } catch (error) {
      return next({ status: 500, msg: 'failed while deleting files' });
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
