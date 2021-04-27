const express = require("express");
const router = express.Router();
const { verifyAccessToken, verifyAdmin } = require("../helpers/verify");
const { shootingValidation } = require("../validations/shooting");
const Shooting = require("../models/shooting");

router.get("/", verifyAccessToken, verifyAdmin, (req, res) => {
  res.send(req.user);
});

// * Add a schooting
router.post("/add", verifyAccessToken, async (req, res) => {
  //Validate the data
  const { error, value } = shootingValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Create a new Shooting
  const shooting = new Shooting(value);

  //Save the shooting
  try {
    const savedShooting = await shooting.save();
    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
