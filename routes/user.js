const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("../validations");

// Get infromation about user with id
router.get("/", (req, res) => {
  res.send("On user route");
});

// Register User incl. validation
router.post("/register", async (req, res) => {
  //Validate the data
  const { error, value } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Check if the user already exists
  const emailExist = await User.findOne({ email: value.email });
  if (emailExist)
    return res.status(400).send("An User with this Email already exists.");
  const usernameExist = await User.findOne({ username: value.username });
  if (usernameExist)
    return res.status(400).send("An User with this Username already exists.");

  //Hash the passwords
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(value.password, salt);

  //Create a new User
  const user = new User({
    username: value.username,
    password: hashPassword,
    email: value.email,
  });

  //save the user to db
  try {
    const savedUser = await user.save();
    res.status(201).json({ userID: savedUser._id });
  } catch (error) {
    res.status(500).send(error);
  }
});

//Login
router.post("/login", async (req, res) => {
  //Validate the data
  const { error, value } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Check if the user exists
  const user = await User.findOne({ username: value.username });
  if (!user) return res.status(400).send("The username or password is wrong.");

  //Check if the password ist correct
  const validPass = await bcrypt.compare(value.password, user.password);
  if (!validPass)
    return res.status(400).send("The username or password is wrong.");

  //Create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token).send();
});

module.exports = router;
