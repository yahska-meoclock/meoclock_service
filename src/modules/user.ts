import express, { Request, Response } from 'express';
import CRUD from '../connections/nosql_crud' 
import querystring from 'querystring'

const userRouter = express.Router()

userRouter.get("/users/:username", async (req: Request, res: Response)=>{
    console.log(req.params.username)
    const users = await CRUD.getSpecific("user", {username:{$regex: `^${req.params.username}`}})
    console.log("Users ", users)
    res.status(200).json(users.slice(0,5))

})


export default userRouter