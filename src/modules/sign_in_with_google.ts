

import passport from 'passport';
import express, {Request, Response} from 'express';
const {google} = require('googleapis')
import CryptoJS from "crypto-js"
import urlencode from "urlencode"
import shortid from "shortid"
import redis from "../connections/redis"
const url  = require("url")
import axios from "axios"
import Axios from 'axios';
import NodeRSA from 'node-rsa'
import jwt from 'jsonwebtoken'
import userRouter from './user';
const {OAuth2Client} = require('google-auth-library');
import CRUD from "../connections/nosql_crud"
import User from '../definitions/user'
import { generateToken } from "../utils"

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
async function verify(token: string) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
  return userid
}

const googleAuth = express.Router()
const PUBLIC_KEY_PATH = "https://www.googleapis.com/oauth2/v3/certs"
const TOKEN_ISSUER = "accounts.google.com"

const getGooglePublicKey = async (kid: string) => {
  const url = new URL(PUBLIC_KEY_PATH);
  console.log(" Kid ", kid)
  const result = await Axios.get(url.toString());
  const key = result.data.keys.filter((pk: any)=>pk.kid==kid)[0];
  console.log(" Key ", key)
  const pubKey = new NodeRSA();
  pubKey.importKey({ n: Buffer.from(key.n, 'base64'), e: Buffer.from(key.e, 'base64') }, 'components-public');
  return pubKey.exportKey('public');
};

const verifyIdToken = async (idToken: string, clientID: string, key:string) => {
  const applePublicKey: jwt.Secret = await getGooglePublicKey(key);
  console.log("Apple Key ", applePublicKey)
  const jwtClaims:any = jwt.verify(idToken, applePublicKey, { algorithms: ['RS256'] });

  if (jwtClaims.iss !== TOKEN_ISSUER) throw new Error('id token not issued by correct OpenID provider - expected: ' + TOKEN_ISSUER + ' | from: ' + jwtClaims.iss);
  if (clientID !== undefined && jwtClaims.aud !== clientID) throw new Error('aud parameter does not include this client - is: ' + jwtClaims.aud + '| expected: ' + clientID);
  if (jwtClaims.exp < (Date.now() / 1000)) throw new Error('id token has expired');

  return jwtClaims;
};

googleAuth.post('/google/begin-auth', (req: Request, res: Response)=>{
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT
  );
  
  const scopes = [
    'https://www.googleapis.com/auth/plus.login',
    'openid',
    'profile',
    'email'
  ];
  //GOOGLE_OAUTH_REDIRECT="https://service.meoclocks.com/google/redirect"
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
    process.env.GOOGLE_OAUTH_REDIRECT
  );
  const {code, state} = url.parse(req.url,true).query;
  console.log("State ", state, " Url ", req.query, " Code ", code)
  const tokenResult = await oauth2Client.getToken(code)
  const tokens = tokenResult.tokens
  try{
    const decodedJwt = jwt.decode(tokens.id_token,{json: true, complete: true})
    const verificationResult = await verify(tokens.id_token)
    console.log("Verification result ", verificationResult, "Decoded ", decodedJwt)
  }catch(e) {
    res.status(500).send(e)
  }
  const result = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`)
  const userinfo = result.data
  const user:User = {
    id: null,
    username: userinfo.email,
    passwordHash: "",
    token: null,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    googleEmail: userinfo.email,
    appleEmail: null,
    appleAccessToken: null,
    googleAccessToken: tokens.access_token,
    appleRefreshToken: null,
    googleRefreshToken: tokens.refresh_token,
    signupEmail: req.body.signupEmail
  }

  CRUD.post("user", user)
  let token = await generateToken(userinfo.email)
  console.log("User Info ", userinfo, " Token Result ", tokenResult)
  const userTempId = await redis.hget("authing_user_google", state)
  const secret = CryptoJS.AES.encrypt(token, userTempId!).toString()
  const urlSafeSecret = urlencode(secret)
  res.redirect(`http://localhost:8080/linking/google/${urlSafeSecret}`)
});



export default googleAuth