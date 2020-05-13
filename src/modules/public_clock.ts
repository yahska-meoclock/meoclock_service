import express, { Request, Response } from 'express';
import { getSpecific } from '../connections/nosql_crud' 

const publicClockRoute = express.Router()

publicClockRoute.get("/public/clocks", async (req: Request, res: Response)=>{
    let result = await getSpecific("clocks", {public: true})
     res.status(200).send(result)
})

export default publicClockRoute