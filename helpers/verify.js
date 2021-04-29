const jwt = require("jsonwebtoken");
const User = require("../models/user");

const verifyAccessToken = (req, res, next) => {
  const { cookies } = req;
  const access_token = cookies.access_token;
  if (!access_token)
    return res.status(403).json({ ok: false, message: "no access token" });
  try {
    const verified = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ ok: false, message: "invalid access token" });
  }
};

const verifyRefreshToken = async (req, res, next) => {
  const { cookies } = req;
  const refresh_token = cookies.refresh_token;
  if (!refresh_token)
    return res.status(401).json({ ok: false, message: "no refresh token" });
  try {
    const verified = jwt.verify(
      refresh_token,
      process.env.REFRESH_TOKEN_SECRET
    );
    req.user = verified;
    const user = await User.findOne({ _id: req.user._id });
    if (!user.refresh_tokens.includes(refresh_token))
      return res.status(403).json({ ok: false, message: "stolen token" });
    next();
  } catch (error) {
    res.status(403).json({ ok: false, message: "invalid refresh token" });
  }
};

const verifyAdmin = (req, res, next) => {
  const scopes = req.user.scopes;
  if (!scopes.includes("admin"))
    return res.status(401).json({ ok: false, message: "Access Denied" });
  next();
};

module.exports.verifyAccessToken = verifyAccessToken;
module.exports.verifyRefreshToken = verifyRefreshToken;
module.exports.verifyAdmin = verifyAdmin;
