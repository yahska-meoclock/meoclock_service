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
        res.status(200).json({"title": "local_auth_token", "token":token})
    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})

localAuth.post("/signup", (req: Request, res: Response)=>{
    console.log("Signing Up")
    try{
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
            googleRefreshToken: null,
            signupEmail: req.body.signupEmail
        }
        CRUD.post("user", user)
        res.status(200).send(user)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
    

})


export default localAuth