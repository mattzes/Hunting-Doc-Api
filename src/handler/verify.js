const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyAccessToken = (req, res, next) => {
  const authorization = req.headers.authorization.split(' ');
  const access_token = authorization[1];
  const bearer = authorization[0];

  if (bearer != 'Bearer') return next({ status: 403, msg: 'invalid authorization header' });
  if (!access_token) return next({ status: 403, msg: 'no access token' });
  try {
    const verified = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return next({ status: 403, msg: 'invalid access token' });
  }
};

const verifyRefreshToken = async (req, res, next) => {
  const { cookies } = req;
  const refresh_token = cookies.refresh_token;
  if (!refresh_token) return next({ status: 401, msg: 'no refresh token' });
  try {
    const verified = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
    req.user = verified;
    req.user.refresh_token = refresh_token;
    try {
      const user = await User.findOne({ _id: req.user._id });
      if (!user.refresh_tokens.includes(refresh_token)) return next({ status: 403, msg: 'stolen token' });
    } catch (error) {
      return next({ status: 500, msg: 'failed to find user' });
    }
    next();
  } catch (error) {
    return next({ status: 403, msg: 'invalid refresh token' });
  }
};

const verifyAdmin = (req, res, next) => {
  const scopes = req.user.scopes;
  if (!scopes.includes('admin')) return next({ status: 401, msg: 'Access Denied' });
  next();
};

module.exports.verifyAccessToken = verifyAccessToken;
module.exports.verifyRefreshToken = verifyRefreshToken;
module.exports.verifyAdmin = verifyAdmin;
