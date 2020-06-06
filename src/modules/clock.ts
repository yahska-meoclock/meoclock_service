import express, { Request, Response } from 'express';
import nosql_crud, { getAll, post, getSpecific, deleteEntity, patch } from '../connections/nosql_crud' 

const clockRoute = express.Router()

/**
 * Get my new o'clock
 * Properties:
 *  Name:
 *  Description:
 *  SubClocks:
 *  Deadline:
 *  Sponsors:
 *  Dependents:
 *  Audience:
 *  Challengers:
 *  Supervisors:
 *  Expired:
 *  Achieved:
 *  Failed:
 * {name:"task_1", description:"task description", subclocks:[], deadline:1593561600, sponsors:[], dependents:[], audience:[], challengers:[], supervisors:[], expired:[], achieved:false}
 */
 clockRoute.get('/clock/:groupId?', async (req: Request, res: Response)=>{
     //TODO
     try {
        const {groupId} = req.params
        if(groupId){
            let result  = await getSpecific("clocks", {group: groupId})
            res.status(200).send(result)
        } else {
           let result = await getAll("clocks")
           res.status(200).send(result)
        }
     } catch(e) {
        res.status(500).send(e)
     }
 })

 /**
 * DELETE existing o'clock
 */
 clockRoute.delete('/clock', async (req: Request, res: Response)=>{
     if(req.body.id){
         try {
             console.log("Deleting clock ", req.body.id)
            const deleteResult = await deleteEntity("clocks", {_id: req.body.id})
            res.status(200).send()
         } catch(e) {
             console.log(e)
             res.status(500).send(e)
         }
     }
     return res.status(400).send()
 })

clockRoute.post('/clock', async(req: Request, res: Response)=>{
    //TODO
    console.log("Posting Clock")
    if(req.body.clockName && req.body.deadline){
        let result = await post("clocks", {
            name:req.body.clockName, 
            description:req.body.description, 
            deadline:req.body.deadline, 
            owner: req.user,
            sponsors: req.body.sponsors, 
            dependents: req.body.dependents, 
            dependencies:req.body.dependencies, 
            audience:req.body.audience, 
            challengers:req.body.challengers, 
            supervisors:req.body.supervisors, 
            group: req.body.group, 
            timeline: req.body.timeline, 
            expired:false, 
            achieved:false,
            isPublic: false,
            asks: req.body.asks || null
        })
        res.status(200).send(result)
    }else {
        res.status(500).send()
    }
})

/**
 * PATCH existing o'clock
 */
clockRoute.patch('/clock', async(req: Request, res: Response)=>{
    //TODO
    try {
        if(req.body.data.filter && req.body.data.patch) {
            const requestFilter = req.body.data.filter
            const processedFilter = Object.keys(req.body.data.filter).reduce((acc: any, f, k)=>{
                if(f=="id") acc["_id"] = requestFilter["id"]
                else acc[f] = requestFilter[f]
                return acc
            },{})
            let result = await patch("clocks", processedFilter, req.body.data.patch)
            res.status(200).send(result)
        }
        res.status(400).send()
    }catch(e) {
        res.status(500).send(e)
    }
    
    
})



export default clockRoute