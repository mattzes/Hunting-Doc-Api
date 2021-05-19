const express = require('express');
const router = express.Router();
const { uploadShootingImages } = require('../handler/upload');
const { verifyAccessToken } = require('../handler/verify');
const { shootingValidation } = require('../validations/shooting');
const { idValidation } = require('../validations/genericValidation');
const Shooting = require('../models/shooting');

// TODO: include management for images in every route or maybe a specific route

// * Add a schooting
router.post('/add', verifyAccessToken, uploadShootingImages, async (req, res) => {
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
router.get('/getOne', verifyAccessToken, async (req, res) => {
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
router.get('/getAll', verifyAccessToken, async (req, res) => {
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

// * Update a shooting
router.patch('/patch', verifyAccessToken, async (req, res) => {
  //Validate ID
  const id = idValidation({ _id: req.body._id });
  if (id.error) return next({ status: 400, msg: id.error.details[0].message });

  //Validate Data
  delete req.body._id;
  req.body.user_id = req.user._id.toString();
  const data = shootingValidation(req.body);
  if (data.error) return next({ status: 400, msg: data.error.details[0].message });

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
router.delete('/delete', verifyAccessToken, async (req, res) => {
  //Validate ID
  const { error, value } = idValidation(req.body);
  if (error) return next({ status: 400, msg: error.details[0].message });

  //Delete a shooting
  try {
    await Shooting.findByIdAndDelete(value._id);
    res.json({ ok: true });
  } catch (error) {
    return next({ status: 500, msg: error.message });
  }
});

module.exports = router;
