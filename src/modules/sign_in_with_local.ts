import jwt from 'jsonwebtoken'
import express, { Request, Response } from 'express';
import crypto from "crypto"
import User from '../definitions/user'
import fs from "fs"
import { compileFunction } from 'vm';
import CRUD from "../connections/nosql_crud"

const localAuth = express.Router()

const generateToken = async (subject: string)=>{
    let payload = {
        iss: process.env.JWT_ISSUER,
        sub: subject,
        aud: process.env.JWT_AUDIENCE,
        exp: Math.floor(Date.now() / 1000) + 60 * 60
    };
    const secret = fs.readFileSync(process.env.SECRETS_PATH+"/private.pem")
    const token = await jwt.sign(payload, secret)
    return token
}

const generateHash = (p: string) => {
    const hash = crypto.createHash('sha256');
    hash.update(p);
    return hash.digest('hex');
}

localAuth.post("/try-login", async (req: Request, res: Response)=>{
    const {username, password} = req.body
    if(!username || !password) {
        return res.status(500).send()
    }

    let user = await CRUD.getSpecific("user", {username})
    user = user[0]
    if(!user){
        return res.status(500).send()
    }
    const computedHash = generateHash(password)
    if(user!.passwordHash != computedHash){
        return res.status(500).send()
    }
    let token = await generateToken(username)
    res.cookie("local_auth_token", token, {httpOnly: false, expires: new Date(Date.now()+(1000*60*60*24*2))})
})

localAuth.post("/sign-up", (req: Request, res: Response)=>{
    if(!req.body.username || !req.body.password) {
        return res.status(500).send()
    }
    const user:User = {
        username: req.body.username,
        passwordHash: generateHash(req.body.password),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        googleEmail: null,
        appleEmail: null,
        appleAccessToken: null,
        googleAccessToken: null,
        appleRefreshToken: null,
        googleRefreshToken: null
    }
    CRUD.post("user", user)
})


export default localAuth