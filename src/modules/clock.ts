import express, { Request, Response } from 'express';
import nosql_crud, { get, getAll, post, getSpecific, deleteEntity, patch, appGetOne } from '../connections/nosql_crud' 
import schedule from "node-schedule"
import shortid from "shortid"
import redis from "../connections/redis"
import CRUD from '../connections/nosql_crud' 

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

 clockRoute.get('/history/clock', async (req: Request, res: Response) => {
     try {
         console.log("Getting history")
        let result = await getSpecific("clocks", {
            $and:[
                {
                   //@ts-ignore
                   user: req.user!._id
                },
                {
                    $or:[{achieved:true}, {expired:true}]
                }
            ]
        })
        console.log("Result ", result)
        res.status(200).send(result)
     } catch (e) {
        res.status(500).send(e)
     }
 })

clockRoute.get('/ungrouped/clock', async (req: Request, res: Response) => {
    try {
        console.log("Getting ungrouped")
        //@ts-ignore
        let result = await getSpecific("clocks", {
            $and:[
                {
                    //@ts-ignore
                    owner: req.user._id
                },
                {
                    group:{$eq: null}
                }
            ]
        })
        console.log("Result ", result)
        res.status(200).send(result)
    } catch (e) {
       res.status(500).send(e)
    }
})

clockRoute.get("/grouped/clock", async (req: Request, res: Response)=>{
    try {
       let result = await getSpecific("clocks", {
           $and:[
               {
                   //@ts-ignore
                   owner: req.user!._id
               },
               {
                   group:{$ne: null}
               }
           ]
       })

       console.log("Result ", result)
       res.status(200).send(result)
    } catch (e) {
       res.status(500).send(e)
    }
})



 /**
 * DELETE existing o'clock
 */
 clockRoute.delete('/clock', async (req: Request, res: Response)=>{
     if(req.body.appId){
         try {
            const deleteResult = await deleteEntity("clocks", {appId: req.body.appId})
            redis.hdel("clock_expiry_jobs", req.body.appId)
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
    console.log("Posting Clock for ", req.user)
    if(req.body.clockName && req.body.deadline){
        const appId = `c-${shortid.generate()}`
        let result = await post("clocks", {
            name:req.body.clockName, 
            description:req.body.description, 
            deadline:req.body.deadline, 
            appId: appId,
            //@ts-ignore
            owner: req.user!.appId,
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
            asks: req.body.asks || null,
            created: (new Date()).toISOString()
        })
        const job: any = schedule.scheduleJob(new Date(req.body.deadline), async function(appId: string){
            console.log("Clock expired")
            //@ts-ignore
            await patch("clocks", {appId: appId, achieved: false}, {expired: true})
        }.bind(null, appId))
        redis.hset("clock_expiry_jobs", appId, job)
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

/**
 * Achieve clock
 */
clockRoute.patch("/clock/achieve", async (req: Request, res: Response)=>{
    try {
        if(req.body.appId){
            let result = await patch("clocks", {appId:req.body.appId}, {achieved: true})
            res.status(200).send(result)
            const job = await redis.hget("clock_expiry_jobs", req.body.appId)
            //@ts-ignore
            if(job) job.cancel()
            redis.hdel("clock_expiry_jobs", req.body.appId)
        }else{
            res.status(400).send("")
        }
    }catch(e) {
        res.status(500).send(e)
    }
})

/**
 * Get specific clock with clock id
 */
clockRoute.get("/clock/:clockId", async (req: Request, res: Response) => {
    try {
        const { clockId } = req.params;
        const clock = await appGetOne("clocks", clockId)
        if(clock){
            return res.json(clock).sendStatus(200)
        } else {
            return res.sendStatus(404)
        }
    } catch(e) {
        res.status(500).send(e)
    }
})


export default clockRoute