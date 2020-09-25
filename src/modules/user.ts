import express, { Request, Response } from 'express';
import CRUD, { post, patch, patchAddToSet } from '../connections/nosql_crud' 
import querystring from 'querystring'
import { EDESTADDRREQ } from 'constants';

const userRouter = express.Router()


userRouter.get("/user/self", async (req: Request, res: Response)=>{
    res.status(200).json({user: req.user})
})

userRouter.get("/users/:username?", async (req: Request, res: Response)=>{
    if(req.params.username){
        const users = await CRUD.getSpecific("users", {username:{$regex: `^${req.params.username}`}})
        console.log("Users ", users)
        res.status(200).json(users.slice(0,3))
    } else {
        res.status(400).json([])
    }
})

userRouter.get("/other/:userId", async (req: Request, res: Response)=>{
    try {
        if(req.params.userId){
            const clocks = await CRUD.getSpecific("clocks", {owner: req.params.userId})
            res.status(200).json(clocks)
        } else {
            res.status(400).send()
        }
    } catch(e) {
        res.status(500).send("Could not get User profile")
    }
})

export default userRouter