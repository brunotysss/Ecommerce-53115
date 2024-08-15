/*const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const UserService = require('../services/user.service');
const bcrypt = require('bcrypt');
*/
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt as ExtractJWT } from 'passport-jwt';
import UserService from '../services/user.service.js';
import bcrypt from 'bcrypt';

const cookieExtractor = req => {
  let token = null;
  if (req && req.cookies) {
    console.log("Cookies recibidas:", req.cookies);  // Verifica si las cookies llegan

    token = req.cookies['jwt'];
    console.log("JWT Token from cookie:", token);  // Imprime el token para ver si está presente

  }
  return token;
};

passport.use(
  'login',
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = await UserService.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }
        const validate = await bcrypt.compare(password, user.password);
        if (!validate) {
          return done(null, false, { message: 'Wrong password' });
        }
        return done(null, user, { message: 'Logged in successfully' });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
      secretOrKey: process.env.JWT_SECRET // Usar el secreto desde .env
    },
    async (jwtPayload, done) => {
      try {
        const user = await UserService.getUserById(jwtPayload.id);
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);


const initializePassport = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserService.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

// Exporta la función directamente
export default initializePassport;