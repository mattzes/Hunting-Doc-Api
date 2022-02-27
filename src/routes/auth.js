const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyRefreshToken, verifyAccessToken } = require('../handler/verify');
const { registerValidation, loginValidation } = require('../validations/user');
require('dotenv/config');

//Create a jwt access token
const createAccessToken = user => {
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15min',
  });
  return accessToken;
};

//Create a jwt refresh token
const createRefreshToken = user => {
  if (user.rememberMe) {
    return {
      token: jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '178d',
      }),
      expiresIn: 15292800000, //177 days in milliseconds
    };
  } else {
    return {
      token: jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '1d',
      }),
      expiresIn: 86040000, //23.9 hours in milliseconds
    };
  }
};

const getCookieSettings = expiresIn => {
  return {
    httpOnly: true,
    path: '/api/auth/refresh-token',
    secure: process.env.SECURE_COOKIE,
    domain: process.env.DOMAIN,
    maxAge: expiresIn,
  };
};

// * Register User incl. validation
router.post('/register', async (req, res, next) => {
  //Validate the data
  const { error, value } = registerValidation(req.body);
  if (error) return next({ status: 400, msg: error.details[0].message });

  //Check if the user already exists
  const emailExist = await User.findOne({ email: value.email });
  if (emailExist) return next({ status: 400, msg: 'An User with this Email already exists.' });
  const usernameExist = await User.findOne({ username: value.username });
  if (usernameExist) return next({ status: 400, msg: 'An User with this Username already exists.' });

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
    res.status(201).end();
  } catch (error) {
    return next({ status: 500, msg: 'Error while save data to DB' });
  }
});

// * Login
router.post('/login', async (req, res, next) => {
  //Validate the data
  const { error, value } = loginValidation(req.body);
  if (error) return next({ status: 400, msg: error.details[0].message });

  //Check if the user exists
  const user = await User.findOne({ username: value.username });
  if (!user) return next({ status: 403, msg: 'The username or password is wrong.' });

  //Check if the password ist correct
  const validPass = await bcrypt.compare(value.password, user.password);
  if (!validPass) return next({ status: 403, msg: 'The username or password is wrong.' });

  //Create tokens
  let userJSON = user.toJSON();
  userJSON.rememberMe = value.rememberMe;
  ['refreshTokens', 'password', '__v'].forEach(e => delete userJSON[e]);
  const refreshToken = createRefreshToken(userJSON);
  const accessToken = createAccessToken(userJSON);

  //Push new refresh token to DB
  try {
    user.refreshTokens.push(refreshToken.token);
    user.save();
  } catch (error) {
    return next({ status: 500, msg: 'Error while save data to DB' });
  }

  //Set cookies
  res
    .cookie('refresh-token', refreshToken.token, getCookieSettings(refreshToken.expiresIn))
    .json({ accessToken: accessToken });

  //Delete expired refresh tokens
  for (i = 0; i < user.refreshTokens.length; i++) {
    try {
      const verified = jwt.verify(user.refreshTokens[i], process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      try {
        await user.updateOne({
          $pull: { refreshTokens: user.refreshTokens[i] },
        });
      } catch (error_1) {}
    }
  }
});

// * Refresh access token with refreh token
router.post('/refresh-token', verifyRefreshToken, async (req, res, next) => {
  //Find user
  const user = await User.findById(req.user._id);

  //Create tokens
  const currentRefreshToken = req.user.refreshToken;
  ['refreshToken', 'iat', 'exp'].forEach(e => delete req.user[e]);
  const refreshToken = createRefreshToken(req.user);
  const accessToken = createAccessToken(req.user);

  //Push new refresh token to DB
  try {
    user.refreshTokens.push(refreshToken.token);
    user.save();
  } catch (error) {
    return next({ status: 500, msg: 'Error while save data to DB' });
  }

  //Delete old refresh token in DB
  try {
    await user.updateOne({
      $pull: { refreshTokens: currentRefreshToken },
    });
  } catch (error) {
    return next({ status: 500, msg: 'Error while save data to DB' });
  }

  //Set cookies
  res
    .cookie('refresh-token', refreshToken.token, getCookieSettings(refreshToken.expiresIn))
    .status(200)
    .json({ accessToken: accessToken });
});

// * Logout
router.post('/logout', verifyAccessToken, async (req, res, next) => {
  //Delete refreh token in DB
  const user = await User.findById(req.user._id);
  try {
    await user.updateOne({
      $pull: { refreshTokens: req.user.refreshToken },
    });
  } catch (error_1) {
    return next({ status: 500, msg: 'Error while save data to DB' });
  }

  //Set cookies wich expires instantly
  res
    .cookie('refresh-token', '', { expires: new Date(Date.now()) })
    .status(200)
    .end();
});

// * Force logout
router.delete('/force-logout', verifyAccessToken, async (req, res, next) => {
  //Delete all refreh tokens in DB
  const user = await User.findById(req.user._id);
  try {
    await user.updateOne({
      $set: { refreshTokens: [] },
    });
  } catch (error) {
    return next({ status: 500, msg: 'Error while save data to DB' });
  }

  //Set cookies wich expires instantly
  res
    .cookie('refresh-token', '', { expires: new Date(Date.now()) })
    .status(200)
    .end();
});

module.exports = router;
