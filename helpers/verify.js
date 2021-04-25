const jwt = require("jsonwebtoken");

function verifyAccessToken(req, res, next) {
  const { cookies } = req;
  const accessToken = cookies.accessToken;
  if (!accessToken) return res.status(401).send("Access Denied");
  try {
    const verified = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    next();
  } catch (error) {
    console.log(error);
    res.status(400).send("Invalid token");
  }
}

module.exports.verifyAccessToken = verifyAccessToken;
