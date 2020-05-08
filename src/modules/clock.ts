import express, { Request, Response } from 'express';
import { getAll, post } from '../connections/nosql_crud' 

const clockRoute = express.Router()

const clocks = [
    "5eb56e6bc1d63f013e30c456"
]

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
 * {name:"task_1", description:"task description", subclocks:[], deadline:1593561600, sponsors:[], dependents:[], audience:[], challengers:[], supervisors:[], expired:[], achieved:false}
 */
 clockRoute.get('/clock', async (req: Request, res: Response)=>{
     //TODO
     let result = await getAll("clocks")
     res.status(200).send(result)
 })

clockRoute.post('/clock', async(req: Request, res: Response)=>{
    //TODO
    console.log("Posting Clock")
    let result = await post("clocks", {name:"task_1", description:"task description", subclocks:[], deadline:1593561600, sponsors:[], dependents:[], dependencies:[], audience:[], challengers:[], supervisors:[], expired:false, achieved:false})
    console.log("Result ", result)
    res.status(200).send(result)
})

/**
 * PATCH existing o'clock
 */
clockRoute.patch('/clock', async(req: Request, res: Response)=>{
    //TODO
    console.log("Patching Clock")
    res.status(200).send()
})

/**
 * DELETE existing o'clock
 */
clockRoute.delete('/clock', async(req: Request, res: Response)=>{
    //TODO
    console.log("Delete Clock")
    res.status(200).send()
})

export default clockRoute