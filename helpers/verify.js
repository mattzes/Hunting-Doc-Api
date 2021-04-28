const jwt = require("jsonwebtoken");
const User = require("../models/user");

const verifyAccessToken = async (req, res, next) => {
  const { cookies } = req;
  const accessToken = cookies.accessToken;
  if (!accessToken) return res.status(401).send("Access Denied");
  try {
    const verified = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = await User.findById(verified.user_id);
    next();
  } catch (error) {
    console.log(error);
    res.status(400).send("Invalid token");
  }
};

const verifyAdmin = (req, res, next) => {
  const admin = req.user.admin;
  if (!admin) return res.status(401).send("Access Denied");
  next();
};

module.exports.verifyAccessToken = verifyAccessToken;
module.exports.verifyAdmin = verifyAdmin;
