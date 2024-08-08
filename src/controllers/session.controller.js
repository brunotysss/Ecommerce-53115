const express = require('express');
const passport = require('passport');
const { getCurrentSession } = require('../controllers/session.controller');

const router = express.Router();

router.get('/current', passport.authenticate('jwt', { session: false }), getCurrentSession);

module.exports = router;