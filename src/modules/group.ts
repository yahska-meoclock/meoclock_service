import express, { Request, Response } from 'express';
import CRUD from '../connections/nosql_crud' 

const GroupRouter = express.Router()

GroupRouter.post("/group", async (req: Request, res: Response)=>{
    try {
        const {groupName, selectedUsers} = req.body
        const createdGroup = await CRUD.post("groups", {
            groupName: groupName,
            selectedUsers: selectedUsers,
            user: req.user!
        })
        res.status(200).json()
    } catch(error){
        res.status(500).send(error)
    }
})

GroupRouter.get("/groups", async (req: Request, res: Response)=>{
    try {
        const groups = await CRUD.getSpecific("groups", {
            user: req.user!
        })
        const participatedGroups = await CRUD.getSpecific("groups", {
            selectedUsers: {$elemMatch:{$eq:req.user!}}
        })
        res.status(200).json({owned: groups, participated: participatedGroups})
    } catch(error){
        res.status(500).send(error)
    }
})

export default GroupRouter