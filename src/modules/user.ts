import express, { Request, Response } from 'express';
import CRUD from '../connections/nosql_crud' 
import querystring from 'querystring'

const userRouter = express.Router()


userRouter.get("/user/self", async (req: Request, res: Response)=>{
    res.status(200).json({user: req.user})
})

userRouter.get("/users/:username?", async (req: Request, res: Response)=>{
    if(req.params.username){
        const users = await CRUD.getSpecific("user", {username:{$regex: `^${req.params.username}`}})
        console.log("Users ", users)
        res.status(200).json(users.slice(0,5))
    }
    res.status(200).json([])
})


export default userRouter