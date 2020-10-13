import express, { Request, Response } from 'express';
import CRUD from '../connections/nosql_crud' 
import shortid from "shortid"

const TimelineRouter = express.Router()

TimelineRouter.post("/timeline", async (req: Request, res: Response)=>{
    try {
        const {timelineName, group} = req.body
        const appId = `t-${shortid.generate()}`
        const createdTimeline = await CRUD.post("timelines", {
            timelineName: timelineName,
            groups: [group],
            appId: appId,
            user: req.user!,
            createdAt: new Date()
        })
        res.status(200).send(createdTimeline.ops[0])
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

TimelineRouter.delete("/timeline/:timelineId", async (req: Request, res: Response)=>{
    try {
        const { timelineId } = req.params
        const deleteResult = await CRUD.deleteEntity("timelines", {appId: timelineId})
        const clockDelete = await CRUD.deleteEntity("clocks", {timeline: timelineId})
        res.sendStatus(200)
    } catch(error) {
        res.status(500).send(error)
    }
})

export default TimelineRouter