import fs from 'fs'
import jwt from 'jsonwebtoken'
import express, { Request, Response } from 'express';
import axios from "axios"
import querystring from "querystring"
//@ts-ignore
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
    const timeNow = Math.floor(Date.now() / 1000);

    const claims = {
        iss: process.env.TEAM_ID,
        iat: timeNow,
        exp: timeNow + 15777000,
        aud: "https://appleid.apple.com",
        sub: process.env.CLIENT_ID,
    };

    const header = { alg: 'ES256', kid: process.env.CLIENT_ID };
    const key = fs.readFileSync(process.env.APPLE_PRIVATE_KEY_FILE??"");

    const token = jwt.sign(claims, key, { algorithm: 'ES256', header });
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
    // const options = {
    //     clientID: process.env.CLIENT_ID, // identifier of Apple Service ID.
    //     redirectUri: 'https://www.meoclocks.com/apple/redirect', // use the same value which you passed to authorisation URL.
    //     clientSecret: clientSecret
    // };

    // appleSignin.getAuthorizationToken(req.body.code, options).then((tokenResponse: any) => {
    //     console.log(tokenResponse);
    // }).catch((error: Error) => {
    //     console.log(Error);
    // });
    console.log(req.body)
    if(!req.body.access_token){
        const requestBody = {
            grant_type: 'authorization_code',
            code: req.body.code,
            redirect_uri: "www.meoclocks.com/apple/redirect",
            client_id: process.env.CLIENT_ID,
            client_secret: clientSecret
        }
        console.log(requestBody)
        axios.request({
            method: "POST",
            url: "https://appleid.apple.com/auth/token",
            data: querystring.stringify(requestBody),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
           }).then(response => {
            return res.json({
             success: true,
             data: response.data
            })
           }).catch(error => {
            return res.status(500).json({
             success: false,
             error: error.response.data
            })
        })
    }
})

export default authRoute


/*
{
meoclock_backend    |   access_token: 'a3dc991dff4924e7fa43492463a471f3d.0.nzsw.yk0l2pnwZfZZtpuG7d2-rw',
meoclock_backend    |   token_type: 'Bearer',
meoclock_backend    |   expires_in: 3600,
meoclock_backend    |   refresh_token: 'r2e60604424cd482ebc499d9e8708809b.0.nzsw.63MwYtGX-QUqZ6kWp8AcTQ',
meoclock_backend    |   id_token: 'eyJraWQiOiI4NkQ4OEtmIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoiY29tLm1lb2Nsb2Nrcy5jbGllbnQiLCJleHAiOjE1ODg2NDM2OTgsImlhdCI6MTU4ODY0MzA5OCwic3ViIjoiMDAwOTI2LmIzN2E5NGRkNmY2ZDRmZGY4MDYxZTIwMTA5NGQ2YTJlLjIzMDIiLCJhdF9oYXNoIjoiREg0ZlNuUmI5aEtxTk5qeE5rQTdLUSIsImVtYWlsIjoiZ2lxN2t3cjJkY0Bwcml2YXRlcmVsYXkuYXBwbGVpZC5jb20iLCJlbWFpbF92ZXJpZmllZCI6InRydWUiLCJpc19wcml2YXRlX2VtYWlsIjoidHJ1ZSIsImF1dGhfdGltZSI6MTU4ODY0MzA5Nywibm9uY2Vfc3VwcG9ydGVkIjp0cnVlfQ.bRqCCFjGHgeMPJ5BgK54id5uEOKRofU8hgdXQZpileyrPYa0E3swatS8pGLjNuf47JW9uQJSdbIymj5MgYYTkTa1XLz58bvY05blJL1rd8fIfAWN4zA97ITNcTp73P7Sbzd5yk_ICBBo1CccQWjKviHcRCbxX13kmBLIQ_dWuBDAHzyjp0rnvGayRm7Vxvxa8r4w8h_n3mW6d1uSsgIOk-xQsw2egcz4JWnqLLAquCVTqVzW6XFPbP9E3ue13q1FsRqTMmJxGH1baPcCBZTLLQDKJjJhekytbbWaM-Nh9_QNKsbwi8PyEP61uqRxfEw4P9CPNmOPmn7eJGhdSEMHfg'
*/