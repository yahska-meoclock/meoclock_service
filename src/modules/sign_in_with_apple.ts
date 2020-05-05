import fs from 'fs'
import jwt from 'jsonwebtoken'
import express, { Request, Response } from 'express';
import axios from "axios"
import querystring from "querystring"
import {AppleAuthKey, AppleAuthKeyCollection, AxiosAuthKeyResult}
//@ts-ignore
import appleSignin from "apple-signin"

const authRoute = express.Router()

authRoute.post("/apple/redirect", async (req: Request, res: Response)=>{
    //const clientSecret = getClientSecret()
    const clientSecret = appleSignin.getClientSecret({
        clientID: process.env.CLIENT_ID, // identifier of Apple Service ID.
        teamId: process.env.TEAM_ID, // Apple Developer Team ID.
        privateKeyPath: process.env.APPLE_PRIVATE_KEY_FILE, // path to private key associated with your client ID.
        keyIdentifier: process.env.KEY_ID // identifier of the private key.    
    });
    console.log(clientSecret)
    const options = {
        clientID: process.env.CLIENT_ID, // identifier of Apple Service ID.
        redirectUri: 'https://www.meoclocks.com/apple/redirect', // use the same value which you passed to authorisation URL.
        clientSecret: clientSecret
    };

    appleSignin.getAuthorizationToken(req.body.code, options).then((tokenResponse: any) => {
        console.log("GOT token response")
        appleSignin.verifyIdToken(tokenResponse.id_token, process.env.CLIENT_ID).then((result:any) => {
            console.log("Token verified")
            const userAppleId = result.sub;
            return res.status(200).send(result)
        }).catch((error:any) => {
            // Token is not verified
            return res.status(500).json({
                         success: false,
                         error: error
                        })
        });
    }).catch((error: Error) => {
        return res.status(500).json({
                     success: false,
                     error: error
                    })
    });
})

export default authRoute