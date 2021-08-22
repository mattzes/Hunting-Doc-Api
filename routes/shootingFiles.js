const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../handler/verify');
const path = require('path');
const fs = require('fs');

// * Serve a tmp avatar
router.get('/tmp/avatar/:name', verifyAccessToken, (req, res, next) => {
  let file = path.join(process.env.ABSOLUTE_FILE_PATH_TMP, req.user._id, req.params.name);

  if (fs.existsSync(file)) {
    res.status(200).sendFile(file);
  } else {
    next({ status: 404, msg: 'File does not exist!' });
  }
});

// * Serve an avatar
router.get('/avatar/:shootingId/:name', verifyAccessToken, (req, res, next) => {
  let file = path.join(process.env.ABSOLUTE_FILE_PATH, req.user._id, req.params.shootingId, req.params.name);

  if (fs.existsSync(file)) {
    res.status(200).sendFile(file);
  } else {
    next({ status: 404, msg: 'File does not exist!' });
  }
});

module.exports = router;
