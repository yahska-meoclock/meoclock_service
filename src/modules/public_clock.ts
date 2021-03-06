import express, { Request, Response } from 'express';
import { getSpecific, post } from '../connections/nosql_crud' 
import shortid from "shortid"

const publicClockRoute = express.Router()

publicClockRoute.get("/public/clocks", async (req: Request, res: Response)=>{
    let result = await getSpecific("clocks", {isPublic: true})
     res.status(200).send(result)
})


export default publicClockRoute