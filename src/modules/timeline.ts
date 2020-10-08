import express, { Request, Response } from 'express';
import CRUD from '../connections/nosql_crud' 

const TimelineRouter = express.Router()

TimelineRouter.post("/timeline", async (req: Request, res: Response)=>{
    try {
        const {timelineName, group} = req.body
        const createdTimeline = await CRUD.post("timelines", {
            timelineName: timelineName,
            groups: [group],
            user: req.user!,
            createdAt: new Date()
        })
        const timelines = await CRUD.getSpecific("timelines", {groups: {$elemMatch:{$eq:group}}})
        res.status(200).send(timelines)
    } catch(error){
        res.status(500).send(error)
    }
})

TimelineRouter.get("/timelines", async (req: Request, res: Response)=>{
    try {
        const {timelines} = req.body
        console.log(timelines + " Timelines")
        const fetchedTimelines = await CRUD.getSpecific("timelines", {_id: {$in: timelines}})
        res.status(200).send(fetchedTimelines)
    } catch(error) {
        res.status(500).send(error)
    }
})

TimelineRouter.get("/timeline/:id?", async (req: Request, res: Response)=>{
    try {
        const {id} = req.params
        const timeline = await CRUD.getSpecific("timelines", {_id: id})
        res.status(200).send(timeline)
    } catch(error) {
        res.status(500).send(error)
    }
})

TimelineRouter.get("/timeline/group/:group?", async (req: Request, res: Response)=>{
    try {
        const {group} = req.params
        const timelines = await CRUD.getSpecific("timelines", {groups: {$elemMatch:{$eq:group}}})
        res.status(200).send(timelines)
    } catch(error) {
        res.status(500).send(error)
    }
})

export default TimelineRouter