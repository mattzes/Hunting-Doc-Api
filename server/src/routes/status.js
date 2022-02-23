const express = require('express');
const router = express.Router();

router.get('', (req, res, next) => {
  res.json({ staus: 'ok' });
});

module.exports = router;
