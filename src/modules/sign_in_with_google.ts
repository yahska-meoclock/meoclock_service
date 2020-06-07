

import passport from 'passport';
import express from 'express';

const googleAuth = express.Router()


googleAuth.get('/google/begin-auth', passport.authenticate("google", {
  scope: ['https://www.googleapis.com/auth/plus.login'],
  session: false
}), function(req, res) {
  console.log("User ", req.user)
  res.json(req.user);
});

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
googleAuth.get('/google/redirect', function(req, res) {
    console.log("User ", req.user)
    res.json(req.user);
});



export default googleAuth