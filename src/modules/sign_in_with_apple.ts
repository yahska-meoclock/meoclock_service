import fs from 'fs'
import jwt from 'jsonwebtoken'
import express, { Request, Response } from 'express';

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

export default authRoute