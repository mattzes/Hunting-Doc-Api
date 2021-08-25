const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../handler/verify');
const path = require('path');
const fs = require('fs');

// * Serve a tmp file
router.get('/tmp/file/:name', verifyAccessToken, (req, res, next) => {
  let file = path.join(process.env.ABSOLUTE_FILE_PATH_TMP, req.user._id, req.params.name);

  if (fs.existsSync(file)) {
    res.status(200).sendFile(file);
  } else {
    next({ status: 404, msg: 'File does not exist!' });
  }
});

// * Serve a static file
router.get('/file/:shootingId/:name', verifyAccessToken, (req, res, next) => {
  let file = path.join(process.env.ABSOLUTE_FILE_PATH, req.user._id, req.params.shootingId, req.params.name);

  if (fs.existsSync(file)) {
    res.status(200).sendFile(file);
  } else {
    next({ status: 404, msg: 'File does not exist!' });
  }
});

module.exports = router;
