import express, { Request, Response } from 'express';
import CRUD from '../connections/nosql_crud' 

const TimelineRouter = express.Router()

TimelineRouter.post("/timeline", async (req: Request, res: Response)=>{
    try {
        const {timelineName, group} = req.body
        const createdGroup = await CRUD.post("timelines", {
            timelineName: timelineName,
            groups: [group],
            user: req.user!
        })
        res.status(200).json(createdGroup)
    } catch(error){
        res.status(500).send(error)
    }
})

// TimelineRouter.get("/groups", async (req: Request, res: Response)=>{
//     try {
//         const groups = await CRUD.getSpecific("groups", {
//             user: req.user!
//         })
//         const participatedGroups = await CRUD.getSpecific("groups", {
//             selectedUsers: {$elemMatch:{$eq:req.user!}}
//         })
//         res.status(200).json({owned: groups, participated: participatedGroups})
//     } catch(error){
//         res.status(500).send(error)
//     }
// })

export default TimelineRouter