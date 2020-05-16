import {Request, Response, NextFunction} from "express"

const localAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log("Middleware reached")
    if(req.isAuthenticated()) {
        next()
    }else {
        console.log("Redirecting")
        res.status(401).send("Unauthorized")
    }
}

export default localAuthMiddleware