import express from 'express';
import passport from 'passport';
import { getCurrentSession } from '../controllers/session.controller.js';

const router = express.Router();

router.get('/current', passport.authenticate('jwt', { session: false }), getCurrentSession);

export default router;
