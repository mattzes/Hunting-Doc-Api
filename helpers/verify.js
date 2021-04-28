const jwt = require("jsonwebtoken");
const User = require("../models/user");

const verifyAccessToken = (req, res, next) => {
  const { cookies } = req;
  const access_token = cookies.access_token;
  if (!access_token) return res.status(401).send("No access token");
  try {
    const verified = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send("Invalid access token");
  }
};

const verifyRefreshToken = async (req, res, next) => {
  const { cookies } = req;
  const refresh_token = cookies.refresh_token;
  if (!refresh_token) return res.status(401).send("Access Denied");
  try {
    const verified = jwt.verify(
      refresh_token,
      process.env.REFRESH_TOKEN_SECRET
    );
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send("Invalid token. May somone stole your token");
  }
};

const verifyAdmin = (req, res, next) => {
  const scopes = req.user.scopes;
  if (!scopes.includes("admin")) return res.status(401).send("Access Denied");
  next();
};

module.exports.verifyAccessToken = verifyAccessToken;
module.exports.verifyRefreshToken = verifyRefreshToken;
module.exports.verifyAdmin = verifyAdmin;
