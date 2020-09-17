import express, { Request, Response } from 'express';
import CRUD from '../connections/nosql_crud' 

const GroupRouter = express.Router()

GroupRouter.post("/group", async (req: Request, res: Response)=>{
    try {
        const {groupName, selectedUsers} = req.body
        const isExisting = await CRUD.getSpecific("groups",{
            groupName: groupName,
            user: req.user
        })
        if(isExisting.length==0){
            const createdGroup = await CRUD.post("groups", {
                groupName: groupName,
                selectedUsers: selectedUsers,
                user: req.user!
            })
        }else {
            res.status(401).send("Your group with same name already exists")
        }
        
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
           $or: [{selectedUsers: {$elemMatch:{$eq:req.user!}}}, {user: req.user!}]
        })
        res.status(200).json({owned: groups, participated: participatedGroups})
    } catch(error){
        res.status(500).send(error)
    }
})

GroupRouter.delete("/groups/:groupId", async (req: Request, res: Response)=>{
    try {
        const { groupId } = req.params;
        if(groupId) {
            const group = await CRUD.get("groups", groupId)
            //@ts-ignore
            if (group.user._id.toString()==req.user!._id.toString()){
                await CRUD.deleteEntity("groups", {
                    _id: group._id
                })
                res.send(200).send("Deleted Successfully")
            }else{
                res.status(500).send("Not an owner")
            } 
        } else {
            res.status(401).send("Group Not Found")
        }
    } catch(error) {
        res.status(500).send(error)
    }
})

export default GroupRouter