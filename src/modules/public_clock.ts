import express, { Request, Response } from 'express';
import CRUD, { getSpecific, post } from '../connections/nosql_crud' 
import shortid from "shortid"

const publicClockRoute = express.Router()

publicClockRoute.get("/public/clocks", async (req: Request, res: Response)=>{
    let result = await getSpecific("clocks", {isPublic: true})
     res.status(200).send(result)
})

publicClockRoute.get("/public/ownership/:clockId", async (req: Request, res: Response)=>{
    try {
        const {clockId} = req.params
        let clock = await CRUD.appGetOne("clocks", clockId)
        const owner = clock.owner
        const ownerRecord = await CRUD.appGetOne("users", owner)
        return res.status(200).send({clockName: clock.name, ownerFirstName: ownerRecord.firstName, ownerLastName: ownerRecord.lastName})
    } catch(e){
        res.status(500).send(e)
    }
    
})


export default publicClockRoute