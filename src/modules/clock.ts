import express, { Request, Response } from 'express';
import CRUD, { get, getAll, post, getSpecific, deleteEntity, patch, appGetOne, postMany } from '../connections/nosql_crud' 
import schedule from "node-schedule"
import shortid from "shortid"
import redis from "../connections/redis"
import Comment from "../definitions/comment"
import logger from '../utilities/logger';
import { isOwner, getClocksWithOwners } from '../utilities/clock_utilities';

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
                   owner: req.user!.appId
                },
                {
                    $or:[{achieved:true}, {expired:true}]
                }
            ]
        })
        let clocksWithOwners = await getClocksWithOwners(result)
        res.status(200).send(clocksWithOwners)
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
                    owner: req.user.appId
                },
                {
                    group: null
                }
            ]
        })
        let clocksWithOwners = await getClocksWithOwners(result)
        res.status(200).send(clocksWithOwners)
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
                   owner: req.user!.appId
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
     //@ts-ignore
     if(req.body.appId && await isOwner(req.body.appId, req.user.appId)){
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
        const job: any = schedule.scheduleJob(`j-${appId}`, new Date(req.body.deadline), async function(appId: string){
            console.log("Clock expired")
            //@ts-ignore
            await patch("clocks", {appId: appId, achieved: false}, {expired: true})
        }.bind(null, appId))
        redis.hset("clock_expiry_jobs", appId, `j-${appId}`)
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
        //@ts-ignore
        if(req.body.appId && await isOwner(req.body.appId, req.user.appId)){

            let result = await patch("clocks", {appId:req.body.appId}, {achieved: true})
            let clock = await appGetOne("clocks", req.body.appId)
            let sponsors = await getSpecific("comments", {clock:req.body.appId, donation:{$gt:0}})
            const records = sponsors.reduce((acc: any, value: any, k: number)=>{
                //@ts-ignore
                const user = {appId: req.user!.appId, firstName: req.user!.firstName, lastName: req.user!.firstName}
                const donation = value.donation
                //@ts-ignore
                const promisee = value.commenter!.userId
                const clockElement = {appId: value.clock, name:clock.name}
                if (acc.mapping[user.appId]!=undefined){
                    acc.collection[acc.mapping[user.appId]].donation = acc.collection[acc.mapping[user.appId]].donation + donation
                } else {
                    acc.mapping[user.appId] = acc.collection.length
                    acc.collection.push({user, donation, promisee, clockElement})  
                }
                return acc
            }, {mapping:{},collection:[]})
            if(records.collection.length > 0){
                postMany("promises", records.collection)
            }
            const jobName = await redis.hget("clock_expiry_jobs", req.body.appId)
            //@ts-ignore
            if(jobName) {
                var my_job = schedule.scheduledJobs[jobName as string];
                if(my_job) my_job.cancel()
                
            }
            redis.hdel("clock_expiry_jobs", req.body.appId)
            res.status(200).send(result)
        }else{
            res.status(400).send("")
        }
    }catch(e) {
        console.log(e)
        res.status(500).send(e)
    }
})

/**
 * Get specific clock with clock id
 */
clockRoute.get("/clock/self/:clockId", async (req: Request, res: Response) => {
    try {
        const { clockId } = req.params;
        const clock = await appGetOne("clocks", clockId)
        if(clock){
            return res.json(clock)
        } else {
            return res.sendStatus(404)
        }
    } catch(e) {
        logger.error(e)
        res.status(500).send(e)
    }
})

clockRoute.get("/clock/expire-check/:appId", async (req: Request, res: Response)=>{
    try {
        const { appId } = req.params
        const clock = await appGetOne("clocks", appId)
        if(clock){
            return res.json({expired: clock.expired}).send(200)
        }else{
            return res.sendStatus(404)
        }
    } catch(e) {
        res.status(500).send(e)
    }
})

clockRoute.post("/public/clocks", async (req: Request, res: Response)=>{
    if(req.user && req.body.clockName && req.body.deadline){
        console.log("User ", req.user)
        const appId = `c-${shortid.generate()}`
        let result = await post("clocks", {
            name:req.body.clockName, 
            description:req.body.description, 
            deadline:req.body.deadline, 
            appId: appId,
            owner: req.user!,
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
            isPublic: true,
            asks: req.body.asks || null,
            created: (new Date()).toISOString()
        })
        res.status(200).send(result)
    }else {
        res.status(500).send()
    }
})

clockRoute.get("/comment/clock/:clockId", async(req:Request, res: Response)=>{
    try {
        const {clockId} = req.params
        const comments = await CRUD.getSpecific("comments", {clock: clockId})
        res.status(200).send(comments)
    } catch (err) {
        logger.error(err)
    }

})

clockRoute.post("/comment/clock/:clockId", async(req: Request, res: Response)=>{
    if(req.body.clock && req.body.commenter && req.body.donation>=0) {
        const comment = new Comment()
        const commenter = req.body.commenter
        comment.comment = req.body.comment || ""
        comment.donation = req.body.donation
        comment.clock = req.body.clock
        //@ts-ignore
        comment.commenter = {userId:commenter.appId, picture: commenter.pictureUrl, firstName: commenter.firstName, lastName: commenter.lastName}
        const result = await CRUD.post("comments", comment)
        res.status(200).send(result.ops[0])
    } else {
        res.sendStatus(400)
    }
})

export default clockRoute