const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyAccessToken = (req, res, next) => {
  const accessToken = req.headers['x-access-token'];

  if (!accessToken) return next({ status: 401, msg: 'no access token' });
  try {
    const verified = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return next({ status: 401, msg: error.message });
  }
};

const verifyRefreshToken = async (req, res, next) => {
  const { cookies } = req;
  const refreshToken = cookies['refresh-token'];
  if (!refreshToken) return next({ status: 401, msg: 'no refresh token' });
  try {
    const verified = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    req.user = verified;
    req.user.refreshToken = refreshToken;
    try {
      const user = await User.findOne({ _id: req.user._id });
      if (!user.refreshTokens.includes(refreshToken)) return next({ status: 403, msg: 'stolen token' });
    } catch (error) {
      return next({ status: 500, msg: 'failed to find user' });
    }
    next();
  } catch (error) {
    return next({ status: 401, msg: error.message });
  }
};

const verifyAdmin = async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id });
  if (!user.scopes.isAdmin) return next({ status: 401, msg: 'Access Denied' });
  next();
};

module.exports.verifyAccessToken = verifyAccessToken;
module.exports.verifyRefreshToken = verifyRefreshToken;
module.exports.verifyAdmin = verifyAdmin;
