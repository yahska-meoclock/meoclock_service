

import passport from 'passport';
import express, {Request, Response} from 'express';
const {google} = require('googleapis')
import CryptoJS from "crypto-js"
import urlencode from "urlencode"
import shortid from "shortid"
import redis from "../connections/redis"

const googleAuth = express.Router()


googleAuth.post('/google/begin-auth', (req: Request, res: Response)=>{
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://service.meoclocks.com/google/redirect'
  );
  
  const scopes = [
    'https://www.googleapis.com/auth/plus.login'
  ];

  const authState = shortid.generate()
  const userTempId = req.body.tempId
  console.log("Auth State ", authState)
  console.log("Temp Id ", userTempId)
  redis.hset("authing_user_google", authState, userTempId)

  const authorizationUrl = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    state: authState,
    scope: scopes
  });

  res.status(303).json({redirect: authorizationUrl})
});

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
googleAuth.get('/google/redirect', async function(req, res) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://service.meoclocks.com/google/redirect'
  );
  const {code, state} = req.params
  console.log("State ", state)
  const {tokens} = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens); 
  const userTempId = await redis.hget("authing_user_google", state)
  const secret = CryptoJS.AES.encrypt(tokens.access_token, userTempId!).toString()
  const urlSafeSecret = urlencode(secret)
  res.redirect(`https://www.meoclocks.com/linking/google/${urlSafeSecret}`)
});



export default googleAuth