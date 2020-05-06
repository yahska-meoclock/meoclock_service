

import passport from 'passport';
import express, { Request, Response } from 'express';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const googleAuth = express.Router()

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID??"",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET??"",
  callbackURL: "https://www.meoclocks.com/google/redirect"
},
function(accessToken: any, refreshToken: any, profile: any, done: any) {
  console.log(accessToken, refreshToken, profile, done)
}
));

googleAuth.get('/google/auth',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
googleAuth.get('/google/redirect', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });



export default googleAuth