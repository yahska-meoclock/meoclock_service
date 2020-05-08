

import passport from 'passport';
import express from 'express';

const googleAuth = express.Router()


//googleAuth.get('/google/auth', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
googleAuth.get('/google/redirect', 
  function(req, res) {
    res.json(req.user);
  });



export default googleAuth