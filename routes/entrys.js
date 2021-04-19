const express = require("express");
const router = express.Router();
const verify = require("./verifyToken");

router.get("/", verify, (req, res) => {
  res.json({
    posts: { title: "this is a title", description: "this is a description" },
  });
});

module.exports = router;
