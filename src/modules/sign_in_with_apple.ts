import fs from 'fs'
import jwt from 'jsonwebtoken'
import express, { Request, Response } from 'express';
import axios from "axios"
import querystring from "querystring"

import appleSignin from "apple-signin"

const authRoute = express.Router()

interface AppleAuthKeyCollection {
    keys: [AppleAuthKey]
}
interface AppleAuthKey  {
   kty:string,
   kid:string,
   use:string,
   alg:string,
   n:string,
   e:string
}
interface AxiosAuthKeyResult {
    data: AppleAuthKeyCollection
}

const getClientSecret = () => {
    const privateKey = fs.readFileSync(process.env.APPLE_PRIVATE_KEY_FILE??"", {encoding:"utf8"});
    const timeNow = Math.floor(Date.now() / 1000);
    const token = jwt.sign(
    {
        issuer: process.env.TEAM_ID,
        iat: timeNow,
        exp: timeNow + 15777000,
        aud: 'https://appleid.apple.com',
        sub: process.env.CLIENT_ID
    }, privateKey, 
    {
        algorithm:"ES256",
        header:{
            alg:"ES256",
            kid:process.env.KEY_ID
        }
    })
    console.log(token)
    return token
}

authRoute.get("/auth/apple", (req: Request, res: Response)=>{
    //console.log(getClientSecret())
    res.status(200).send("auth apple get ")
})
authRoute.post("/auth/apple", (req: Request, res: Response)=>{
    //console.log(getClientSecret())
    res.status(200).send("auth apple post")
})

authRoute.post("/apple/redirect", async (req: Request, res: Response)=>{
    //const clientSecret = getClientSecret()
    const clientSecret = appleSignin.getClientSecret({
        clientID: process.env.CLIENT_ID, // identifier of Apple Service ID.
        teamId: process.env.TEAM_ID, // Apple Developer Team ID.
        privateKeyPath: process.env.APPLE_PRIVATE_KEY_FILE, // path to private key associated with your client ID.
        keyIdentifier: process.env.KEY_ID // identifier of the private key.    
    });
    const options = {
        clientID: process.env.CLIENT_ID, // identifier of Apple Service ID.
        redirectUri: 'https://www.meoclocks.com/apple/redirect', // use the same value which you passed to authorisation URL.
        clientSecret: clientSecret
    };

    appleSignin.getAuthorizationToken(req.body.code, options).then((tokenResponse: any) => {
        console.log(tokenResponse);
    }).catch((error: Error) => {
        console.log(Error);
    });
    // console.log(req.body)
    // const requestBody = {
    //     grant_type: 'authorization_code',
    //     code: req.body.code,
    //     redirect_uri: "www.meoclocks.com/auth/apple",
    //     client_id: process.env.CLIENT_ID,
    //     client_secret: clientSecret
    // }
    // console.log(requestBody)
    // axios.request({
    //     method: "POST",
    //     url: "https://appleid.apple.com/auth/token",
    //     data: querystring.stringify(requestBody),
    //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    //    }).then(response => {
    //     return res.json({
    //      success: true,
    //      data: response.data
    //     })
    //    }).catch(error => {
    //     return res.status(500).json({
    //      success: false,
    //      error: error.response.data
    //     })
    // })
})

export default authRoute