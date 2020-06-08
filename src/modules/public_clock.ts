import express, { Request, Response } from 'express';
import { getSpecific, post } from '../connections/nosql_crud' 

const publicClockRoute = express.Router()

publicClockRoute.get("/public/clocks", async (req: Request, res: Response)=>{
    let result = await getSpecific("clocks", {isPublic: true})
     res.status(200).send(result)
})

publicClockRoute.post("/public/clocks", async (req: Request, res: Response)=>{
    if(req.body.clockName && req.body.deadline){
        console.log("User ", req.user)
        let result = await post("clocks", {
            name:req.body.clockName, 
            description:req.body.description, 
            deadline:req.body.deadline, 
            owner: null,
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
            asks: req.body.asks || null
        })
        res.status(200).send(result)
    }else {
        res.status(500).send()
    }
})

export default publicClockRoute