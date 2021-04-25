const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../helpers/verify");

router.get("/", verifyAccessToken, (req, res) => {
  res.json({
    posts: { title: "this is a title", description: "this is a description" },
  });
});

module.exports = router;
