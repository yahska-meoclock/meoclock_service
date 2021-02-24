import express, { Request, Response } from 'express';
import shortid from "shortid"
import redis from "../connections/redis"
import User from '../definitions/user'
import CRUD, { patch } from "../connections/nosql_crud"
import { generateHash, generateToken } from "../utils"
import {Storage} from "@google-cloud/storage";
import Multer from "multer";
import logger from '../utilities/logger';
import axios from 'axios';
const {format} = require('util');

//@ts-ignore
const storage = new Storage({keyFileName: process.env.GOOGLE_APPLICATION_CREDENTIALS})
const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
    },
});

const localAuth = express.Router()
//@ts-ignore
const bucket = storage.bucket(process.env.PROFILE_PICTURES_BUCKET)


localAuth.post("/try-login", async (req: Request, res: Response)=>{
    const {username, password} = req.body
    if(!username || !password) {
        return res.status(500).send()
    }
    try{
        let user = await CRUD.getSpecific("users", {username})
        user = user[0]
        if(!user){
            return res.status(500).send("User not found")
        }
        const computedHash = generateHash(password)
        if(user!.passwordHash != computedHash){
            return res.status(500).send("Password Incorrect")
        }
        let token = await generateToken(username)
        res.status(200).json({
            user: {firstName: user.firstName, lastName: user.lastName, pictureUrl: user.pictureUrl, appId: user.appId, username: user.username},
            token:token
        })
    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})

localAuth.post("/signup", multer.single('file'), async (req: Request, res: Response)=>{
    console.log("Signing Up")
    try{
        if(!req.body.username || !req.body.password) {
            return res.status(400).send()
        }
        let isUsernameTaken = await redis.sismember("members", req.body.username)
        if(isUsernameTaken) {
            return res.status(400).send("Username not available")
        }
        let existing_user = await CRUD.getSpecific("users", {username: req.body.username})
        existing_user = existing_user[0]
        if(existing_user){
            return res.status(400).send("User alerady exists")
        }
        if (process.env.MODE=="production"){
            const captchaToken = req.body.token
            const captchaScore = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET_KEY}&response=${captchaToken}`);
            logger.log("info", "Bot Score for "+req.body.username+ " "+captchaScore)
            if(captchaScore.data.score<0.5) {
                return res.send(401).send()
            }
        }
        let token = await generateToken(req.body.username)
        const userAppId = `u-${shortid.generate()}`

        const user:User = {
            id: null,
            appId: userAppId,
            username: req.body.username,
            passwordHash: generateHash(req.body.password),
            token: token,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            googleEmail: null,
            appleEmail: null,
            appleAccessToken: null,
            googleAccessToken: null,
            appleRefreshToken: null,
            googleRefreshToken: null,
            signupEmail: req.body.signupEmail,
            pictureUrl: null,
            active: false
        }
        if(process.env.MODE=="production" && req.file){
            logger.log("info", "Uploading Profile Image")
            const blobName = `pp-${userAppId}-${req.file.originalname}`
            const cloudFileName = `https://storage.googleapis.com/${bucket.name}/${blobName}`
            const blob = bucket.file(blobName)
            const blobStream = blob.createWriteStream({
                resumable: false,
            });
            
            blobStream.on('error', (err: any) => {
                console.log("Error occurred ", err)
            });
        
            blobStream.on('finish', () => {
                // The public URL can be used to directly access the file via HTTP.
                const publicUrl = format(
                    cloudFileName
                );
                user.pictureUrl=publicUrl
            });
            blobStream.end(req.file.buffer);
        }
        redis.sadd("members", req.body.username)
        CRUD.post("users", user)
        CRUD.post("followers", {appId: userAppId, followed: []})
        res.status(200).send(user)
        return
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

localAuth.get("/is-available/:username?", async  (req: Request, res: Response)=>{
    const {username} = req.params
    if(username && username.length>0){
        let isUsernameTaken = await redis.sismember("members", username)
        if(isUsernameTaken) {
            return res.status(200).send(false)
        } else {
            return res.status(200).send(true)
        }
    } 
})

localAuth.patch("/user/verification/:verificationCode",  async (req: Request, res: Response)=>{
    try {
        const {verificationCode} = req.params
        const userId = redis.hget("verification", verificationCode)
        await patch("users", {appId: userId}, {active: true})
    } catch(e) {
        res.status(500).send("verification failed")
    }
})


export default localAuth