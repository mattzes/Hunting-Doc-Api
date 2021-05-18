const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyRefreshToken } = require('../handler/verify');
const { registerValidation, loginValidation } = require('../validations/user');

//Create a jwt access token
const createAccessToken = user => {
  const access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15min',
  });
  return access_token;
};

//Create a jwt refresh token
const createRefreshToken = user => {
  const refresh_token = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  });
  return refresh_token;
};

// * Register User incl. validation
router.post('/register', async (req, res) => {
  //Validate the data
  const { error, value } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Check if the user already exists
  const emailExist = await User.findOne({ email: value.email });
  if (emailExist) return res.status(400).json({ ok: false, message: 'An User with this Email already exists.' });
  const usernameExist = await User.findOne({ username: value.username });
  if (usernameExist)
    return res.status(400).json({
      ok: false,
      message: 'An User with this Username already exists.',
    });

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
    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error while save data to DB' });
  }
});

// * Login
router.post('/login', async (req, res) => {
  //Validate the data
  const { error, value } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Check if the user exists
  const user = await User.findOne({ username: value.username });
  if (!user) return res.status(400).json({ ok: false, message: 'The username or password is wrong.' });

  //Check if the password ist correct
  const validPass = await bcrypt.compare(value.password, user.password);
  if (!validPass) return res.status(400).json({ ok: false, message: 'The username or password is wrong.' });

  //Create tokens
  let userJSON = user.toJSON();
  ['refresh_tokens', 'password', '__v'].forEach(e => delete userJSON[e]);
  const refresh_token = createRefreshToken(userJSON);
  const access_token = createAccessToken(userJSON);

  //Check max logins on different devices
  if (user.refresh_tokens.length >= 10) return res.status(403).json({ ok: false, message: 'Max logins reached' });

  //Push new refresh token to DB
  try {
    user.refresh_tokens.push(refresh_token);
    user.save();
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Error while save data to DB' });
  }

  //Delete old refresh token if no refresh token isset check all tokens in dp if expired
  const { cookies } = req;
  if (cookies.refresh_token) {
    try {
      await user.updateOne({
        $pull: { refresh_tokens: cookies.refresh_token },
      });
    } catch (error) {
      return res.status(500).json({ ok: false, message: 'Error while save data to DB' });
    }
  } else {
    for (i = 0; i < user.refresh_tokens.length; i++) {
      try {
        const verified = jwt.verify(user.refresh_tokens[i], process.env.REFRESH_TOKEN_SECRET);
      } catch (error) {
        try {
          await user.updateOne({
            $pull: { refresh_tokens: user.refresh_tokens[i] },
          });
        } catch (error_1) {
          return res.status(500).json({ ok: false, message: 'Error while save data to DB' });
        }
      }
    }
  }

  //Set cookies
  res
    .cookie('refresh_token', refresh_token, {
      httpOnly: true,
      //secure: true, // TODO: enable secure for https only
      domain: process.env.DOMAIN,
      path: '/api/auth',
    })
    .cookie('access_token', access_token, {
      httpOnly: true,
      //secure: true, // TODO: enable secure for https only
      domain: process.env.DOMAIN,
      path: '/api',
      expires: new Date(Date.now() + 899700),
    })
    .json({ ok: true });
});

// * Refresh access token with refreh token
router.post('/refresh_token', verifyRefreshToken, async (req, res) => {
  //Find user
  const user = await User.findById(req.user._id);

  //Create tokens
  const current_refresh_token = req.user.refresh_token;
  ['refresh_token', 'iat', 'exp'].forEach(e => delete req.user[e]);
  const refresh_token = createRefreshToken(req.user);
  const access_token = createAccessToken(req.user);

  //Push new refresh token to DB
  try {
    user.refresh_tokens.push(refresh_token);
    user.save();
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Error while save data to DB' });
  }

  //Delete old refresh token in DB
  try {
    await user.updateOne({
      $pull: { refresh_tokens: current_refresh_token },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Error while save data to DB' });
  }

  //Set cookies
  res
    .cookie('refresh_token', refresh_token, {
      httpOnly: true,
      //secure: true, // TODO: enable secure for https only
      domain: process.env.DOMAIN,
      path: '/api/auth',
    })
    .cookie('access_token', access_token, {
      httpOnly: true,
      //secure: true, // TODO: enable secure for https only
      domain: process.env.DOMAIN,
      path: '/api',
      expires: new Date(Date.now() + 899700),
    })
    .json({ ok: true });
});

// * Logout
router.post('/logout', verifyRefreshToken, async (req, res) => {
  //Delete refreh token in DB
  const user = await User.findById(req.user._id);
  try {
    await user.updateOne({
      $pull: { refresh_tokens: req.user.refresh_token },
    });
  } catch (error_1) {
    return res.status(500).json({ ok: false, message: 'Error while save data to DB' });
  }

  //Set cookies wich expires instantly
  res
    .cookie('refresh_token', '', {
      httpOnly: true,
      //secure: true, // TODO: enable secure for https only
      domain: process.env.DOMAIN,
      path: '/api/auth',
      expires: new Date(Date.now()),
    })
    .cookie('access_token', '', {
      httpOnly: true,
      //secure: true, // TODO: enable secure for https only
      domain: process.env.DOMAIN,
      path: '/api',
      expires: new Date(Date.now()),
    })
    .json({ ok: true });
});

// * Force logout
router.delete('/force_logout', verifyRefreshToken, async (req, res) => {
  //Delete all refreh tokens in DB
  const user = await User.findById(req.user._id);
  try {
    await user.updateOne({
      $set: { refresh_tokens: [] },
    });
  } catch (error_1) {
    return res.status(500).json({ ok: false, message: 'Error while save data to DB' });
  }

  //Set cookies wich expires instantly
  res
    .cookie('refresh_token', '', {
      httpOnly: true,
      //secure: true, // TODO: enable secure for https only
      domain: process.env.DOMAIN,
      path: '/api/auth',
      expires: new Date(Date.now()),
    })
    .cookie('access_token', '', {
      httpOnly: true,
      //secure: true, // TODO: enable secure for https only
      domain: process.env.DOMAIN,
      path: '/api',
      expires: new Date(Date.now()),
    })
    .json({ ok: true });
});
module.exports = router;
