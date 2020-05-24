
import express, { Request, Response } from 'express';
//@ts-ignore
import appleSignin from "apple-signin"
import shortid from "shortid"
import CryptoJS from "crypto-js"
import { generateToken } from "../utils"
import CRUD from "../connections/nosql_crud"
import redis from "../connections/redis"
import wss from '../connections/websocket';

const appleAuthRoute = express.Router()

appleAuthRoute.post("/apple/begin-auth", async (req, res)=>{
    const authState = shortid.generate()
    const userTempId = req.body.tempId
    redis.hset("authing_user", authState, userTempId)
    const options = {
        clientID: process.env.CLIENT_ID, // identifier of Apple Service ID.
        redirectUri: 'https://service.meoclocks.com/apple/redirect',
        state: authState, // optional, An unguessable random string. It is primarily used to protect against CSRF attacks.
        scope: "email" // optional, default value is "email".
    };
    
    const authorizationUrl = appleSignin.getAuthorizationUrl(options)+"&response_mode=form_post";
    res.status(303).json({redirect: authorizationUrl})
})

appleAuthRoute.post("/apple/redirect", async (req: Request, res: Response)=>{
    const clientSecret = appleSignin.getClientSecret({
        clientID: process.env.CLIENT_ID, // identifier of Apple Service ID.
        teamId: process.env.TEAM_ID, // Apple Developer Team ID.
        privateKeyPath: process.env.APPLE_PRIVATE_KEY_FILE, // path to private key associated with your client ID.
        keyIdentifier: process.env.KEY_ID // identifier of the private key.    
    });

    const options = {
        clientID: process.env.CLIENT_ID, // identifier of Apple Service ID.
        redirectUri: 'https://service.meoclocks.com/apple/redirect', // use the same value which you passed to authorisation URL.
        clientSecret: clientSecret
    };

    const tokenResponse = await appleSignin.getAuthorizationToken(req.body.code, options).catch((error: Error) => {
        console.log("Could not get Auth token")
        return res.status(500).json({
            success: false,
            error: error
        })
    });
    console.log("Token Response "+tokenResponse)
    const verificationResult = await appleSignin.verifyIdToken(tokenResponse.id_token, process.env.CLIENT_ID).catch((error:any) => {
        // Token is not verified
        console.log("Token not verified")
        return res.status(500).json({
            success: false,
            error: error
        })
    })
    const token = await generateToken(verificationResult.sub)
    const userTempId = await redis.hget("authing_user", req.body.state)
    const secret = CryptoJS.AES.encrypt(token, userTempId!)
    return res.redirect(`https://www.meoclocks.com/linking/apple/${secret}`)
})


appleAuthRoute.get("/apple/retrieve", async (req: Request, res: Response)=>{
    const token = CRUD.getSpecific("temp_tokens", {id: req.body.tempToken})
    //CRUD.deleteSpecific("temp_tokens", {})
})


export default appleAuthRoute