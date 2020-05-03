import fs from 'fs'
import jwt from 'jsonwebtoken'
import express, { Request, Response } from 'express';
import axios from "axios"
import querystring from "querystring"

const authRoute = express.Router()

const getClientSecret = () => {
    const privateKey = fs.readFileSync(process.env.APPLE_PRIVATE_KEY_FILE??"");
    const headers = {
        kid: process.env.KEY_ID,
        typ: undefined
    }

    const claims = {
        iss:process.env.TEAM_ID,
        aud:"https://appleid.apple.com",
        sub:process.env.CLIENT_ID
    }

    const token = jwt.sign(claims, privateKey, {
        algorithm: 'ES256',
        header: headers,
        expiresIn: '24h'
    })
    console.log(token)
    return token
}

authRoute.get("/auth/apple", (req: Request, res: Response)=>{
    console.log(getClientSecret())
    res.status(200).send(getClientSecret())
})

authRoute.post("/apple/redirect", (req: Request, res: Response)=>{
    const clientSecret = getClientSecret()
    const requestBody = {
        grant_type: 'authorization_code',
        code: req.body.code,
        redirect_uri: "www.meoclocks.com/logged-in",
        client_id: process.env.CLIENT_ID,
        client_secret: clientSecret,
        scope: "name email"
    }

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
})

export default authRoute