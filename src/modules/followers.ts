import express, { Request, Response } from 'express';
import CRUD, { get, post, patch, patchAddToSet, appGet } from '../connections/nosql_crud' 

const FollowerRoute = express.Router()


FollowerRoute.post("/follow/user", async(req: Request, res: Response)=>{
    try {
        if(req.body.followedUser) {
            //@ts-ignore
            await patchAddToSet("followers", {appId: req.user!.appId}, {followed: req.body.followedUser})
            //@ts-ignore
            const followers = await appGet("followers", req.user!.appId)
            res.status(200).json(followers)
        }else{
            res.sendStatus(400)
        }
    }catch(e) {
        console.log(e)
        res.status(500).send(e) 
    }
})

FollowerRoute.get("/followers/:userId", async(req: Request, res: Response)=>{
    try {
        if(req.params.userId) {
            const followers = await appGet("followers", req.params.userId)
            res.status(200).json(followers.followed)
        }else{
            res.sendStatus(400)
        }
    }catch(e) {
        console.log(e)
        res.status(500).send(e) 
    }
})

export default FollowerRoute