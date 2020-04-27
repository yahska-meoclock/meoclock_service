import express, { Request, Response } from 'express';
import { getAll } from '../connections/nosql_crud' 

const clockRoute = express.Router()

class User {
    name:string = "";
}

class Clock {
    name: string = "unnamed";
    description: string = "";
    subclocks: [Clock?] = [];
    deadline: Number = 0;
    sponsors: [User?] = [];
    dependents: [User?] = [];
    dependencies: [User?] = [];
    audience: [User?] = [];
    challengers: [User?] = [];
    supervisors: [User?] = [];
    expired: Boolean = false;
    achieved: Boolean = false;
}

const clocks = [
    "5ea716ce849900bbb269bbd5"
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
 */
 clockRoute.get('/clock', async (req: Request, res: Response)=>{
     //TODO
     let result = await getAll("clocks")
     res.status(200).send(result)
 })

clockRoute.post('/clock', async(req: Request, res: Response)=>{
    //TODO
    console.log("Posting Clock")
    res.status(200).send({test:"abc"})
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