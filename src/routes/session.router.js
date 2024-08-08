const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/current', authenticate, (req, res) => {
  res.json(req.user);
});

module.exports = router;
