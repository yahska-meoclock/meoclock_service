
import express, { Request, Response } from 'express';
//@ts-ignore
import appleSignin from "apple-signin"
import shortid from "shortid"
import CryptoJS from "crypto-js"
import urlencode from "urlencode"
import { generateToken } from "../utils"
import CRUD from "../connections/nosql_crud"
import redis from "../connections/redis"
import wss from '../connections/websocket';
import Axios from 'axios';
import NodeRSA from 'node-rsa'
import jwt from 'jsonwebtoken'
import User from '../definitions/user'

const appleAuthRoute = express.Router()

const ENDPOINT_URL = 'https://appleid.apple.com';
const DEFAULT_SCOPE = 'email';
const TOKEN_ISSUER = 'https://appleid.apple.com';

const getApplePublicKey = async (kid: string) => {
    const url = new URL(ENDPOINT_URL);
    url.pathname = '/auth/keys';
    console.log(" Kid ", kid)
    const result = await Axios.get(url.toString());
    const key = result.data.keys.filter((pk: any)=>pk.kid==kid)[0];
    console.log(" Key ", key)
    const pubKey = new NodeRSA();
    pubKey.importKey({ n: Buffer.from(key.n, 'base64'), e: Buffer.from(key.e, 'base64') }, 'components-public');
    return pubKey.exportKey('public');
  };
  
  const verifyIdToken = async (idToken: string, clientID: string, key:string) => {
    const applePublicKey: jwt.Secret = await getApplePublicKey(key);
    console.log("Apple Key ", applePublicKey)
    const jwtClaims:any = jwt.verify(idToken, applePublicKey, { algorithms: ['RS256'] });
  
    if (jwtClaims.iss !== TOKEN_ISSUER) throw new Error('id token not issued by correct OpenID provider - expected: ' + TOKEN_ISSUER + ' | from: ' + jwtClaims.iss);
    if (clientID !== undefined && jwtClaims.aud !== clientID) throw new Error('aud parameter does not include this client - is: ' + jwtClaims.aud + '| expected: ' + clientID);
    if (jwtClaims.exp < (Date.now() / 1000)) throw new Error('id token has expired');
  
    return jwtClaims;
  };

appleAuthRoute.post("/apple/begin-auth", async (req, res)=>{
    const authState = shortid.generate()
    const userTempId = req.body.tempId
    console.log("Auth State ", authState)
    console.log("Temp Id ", userTempId)
    redis.hset("authing_user_apple", authState, userTempId)
    const options = {
        clientID: process.env.APPLE_CLIENT_ID, // identifier of Apple Service ID.
        redirectUri: 'https://service.meoclocks.com/apple/redirect',
        state: authState, // optional, An unguessable random string. It is primarily used to protect against CSRF attacks.
        scope: "email" // optional, default value is "email".
    };
    
    const authorizationUrl = appleSignin.getAuthorizationUrl(options)+"&response_mode=form_post";
    res.status(303).json({redirect: authorizationUrl})
})

appleAuthRoute.post("/apple/redirect", async (req: Request, res: Response)=>{
    const clientSecret = appleSignin.getClientSecret({
        clientID: process.env.APPLE_CLIENT_ID, // identifier of Apple Service ID.
        teamId: process.env.APPLE_TEAM_ID, // Apple Developer Team ID.
        privateKeyPath: process.env.APPLE_PRIVATE_KEY_FILE, // path to private key associated with your client ID.
        keyIdentifier: process.env.APPLE_KEY_ID // identifier of the private key.    
    });

    const options = {
        clientID: process.env.APPLE_CLIENT_ID, // identifier of Apple Service ID.
        redirectUri: 'https://service.meoclocks.com/apple/redirect', // use the same value which you passed to authorisation URL.
        clientSecret: clientSecret
    };

    const tokenResponse = await appleSignin.getAuthorizationToken(req.body.code, options).catch((error: Error) => {
        console.log("Could not get Auth token")
        res.status(500).json({
            success: false,
            error: error
        })
    });
    console.log("Token Response "+tokenResponse.id_token)
    const decodedJwt = jwt.decode(tokenResponse.id_token,{json: true, complete: true})
    console.log("Claims ", decodedJwt)
    const verificationResult = await verifyIdToken(tokenResponse.id_token, process.env.APPLE_CLIENT_ID||"", decodedJwt!.header.kid).catch((error:any) => {
        // Token is not verified
        console.log("Token not verified")
        res.status(500).json({
            success: false,
            error: error
        })
    })

    const user:User = new User()

    CRUD.post("users", user)
    const token = await generateToken(verificationResult.sub)
    const userTempId = await redis.hget("authing_user_apple", req.body.state)
    const secret = CryptoJS.AES.encrypt(token, userTempId!).toString()
    const urlSafeSecret = urlencode(secret)
    res.redirect(`https://www.meoclocks.com/linking/apple/${urlSafeSecret}`)
})


appleAuthRoute.get("/apple/retrieve", async (req: Request, res: Response)=>{
    const token = CRUD.getSpecific("temp_tokens", {id: req.body.tempToken})
    //CRUD.deleteSpecific("temp_tokens", {})
})


export default appleAuthRoute