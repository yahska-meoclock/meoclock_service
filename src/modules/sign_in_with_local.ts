import express, { Request, Response } from 'express';
import User from '../definitions/user'
import CRUD from "../connections/nosql_crud"
import { generateHash, generateToken } from "../utils"

const localAuth = express.Router()



localAuth.post("/try-login", async (req: Request, res: Response)=>{
    const {username, password} = req.body
    if(!username || !password) {
        return res.status(500).send()
    }
    try{
        let user = await CRUD.getSpecific("user", {username})
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
            user: {username: user.username},
            token:token
        })
    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})

localAuth.post("/signup", async (req: Request, res: Response)=>{
    console.log("Signing Up")
    try{
        if(!req.body.username || !req.body.password) {
            return res.status(500).send()
        }
        let existing_user = await CRUD.getSpecific("user", {username: req.body.username})
        existing_user = existing_user[0]
        if(existing_user){
            return res.status(400).send("User alerady exists")
        }
        let token = await generateToken(req.body.username)
        const user:User = {
            id: null,
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
            signupEmail: req.body.signupEmail
        }
        
        CRUD.post("user", user)
        res.status(200).send(user)
        return
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
    

})


export default localAuth