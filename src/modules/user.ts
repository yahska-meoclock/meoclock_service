import express, { Request, Response } from 'express';
import CRUD, { post, patch, patchAddToSet, getAll, getSpecific } from '../connections/nosql_crud' 

const userRouter = express.Router()

interface PublicUserProfile {
    appId: string,
    firstName: string,
    lastName: string,
    pictureUrl: string,
    username: string
}

userRouter.get("/user/self", async (req: Request, res: Response)=>{
    //@ts-ignore
    const {appId, firstName, lastName, pictureUrl, username, token} = req.user 
    res.status(200).json({user:{
        appId,
        firstName,
        lastName,
        pictureUrl,
        username,
        token
    }})
})

userRouter.get("/users/:username?", async (req: Request, res: Response)=>{
    if(req.params.username){
        const users = await CRUD.getSpecific("users", {username:{$regex: `^${req.params.username}`}})
        const publicUser = users.slice(0,3).map((user:any)=>{
            const {appId, firstName, lastName, pictureUrl, username, token} = user
            return {appId, firstName, lastName, pictureUrl, username, token}
        })
        res.status(200).json(publicUser)
    } else {
        res.status(400).json([])
    }
})

userRouter.get("/other/:userId", async (req: Request, res: Response)=>{
    try {
        if(req.params.userId){
            const clocks = await CRUD.getSpecific("clocks", {owner: req.params.userId})
            const user = await CRUD.appGetOne("users", req.params.userId)
            const {appId, firstName, lastName, pictureUrl, username, token} = user
            res.status(200).json({user: {appId, firstName, lastName, pictureUrl, username, token}, clocks})
        } else {
            res.status(400).send()
        }
    } catch(e) {
        res.status(500).send("Could not get User profile")
    }
})

userRouter.get("/user/:userId", async (req: Request, res: Response)=>{
    try {
        if(req.params.userId){
            const user = await CRUD.appGetOne("users",req.params.userId)
            const isStripeConnected = await CRUD.getSpecific("stripe", {userId: req.params.userId})
            user.isStripeConnected = isStripeConnected
            const {appId, firstName, lastName, pictureUrl, username, token} = user
            res.status(200).json({user: {appId, firstName, lastName, pictureUrl, username, token}})
        } else {
            res.status(400).send()
        }
    } catch(e) {
        res.status(500).send("Could not get User profile")
    }
})

userRouter.get("/promises/user", async (req: Request, res: Response)=>{
    try {
        //@ts-ignore
        const promises = await getSpecific("promises", {promisee: req.user!.appId})

        return res.status(200).send(promises)
    } catch (e) {
        res.status(500).send("Could not load User promises")
    }
})
export default userRouter