require('dotenv').config()
import express, { Request, Response, NextFunction } from 'express';
import ClockRouter from './modules/clock'
import AppleAuthRouter from './modules/sign_in_with_apple'
import GoogleRouter from './modules/sign_in_with_google'
import listEndpoints from 'express-list-endpoints'
import bodyParser from 'body-parser'
import passport from 'passport';
import { createJWTStrategy } from './modules/jwt-strategy';
import {createGoogleAuthStrategy} from "./modules/google_auth_strategy"
import localAuth from "./modules/sign_in_with_local"
import publicClockRoute from "./modules/public_clock"

var whitelist = ['https://www.meoclocks.com', 'https://meoclocks.com', 'http://localhost:9000', 'http://127.0.0.1:9000']
var corsOptions = {
    origin: function (origin:string, callback:Function) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: true,
    optionsSuccessStatus: 204
}
var cors = require('cors')

//REFER: https://gist.github.com/joshbirk/1732068

const app = express();
const port = process.env.SERVER_PORT;

app.use(cors())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())
app.use(passport.initialize())
passport.use(createJWTStrategy())
passport.use(createGoogleAuthStrategy())
app.get('/', async (req: Request, res: Response) => {
    res.status(200).sendFile("index.html", {root:"src"})
})

app.get("/logged-in", (req: Request, res: Response)=>{
    res.status(200).json(req.user)
})

app.get("/errr", (req: Request, res: Response)=>{
    res.status(500).json("Could not authenticate")
})

app.use(publicClockRoute)
app.use(localAuth)
app.use(AppleAuthRouter)
app.use(GoogleRouter)
app.use(passport.authenticate('jwt', {session: false}))
app.use((req: Request, res: Response, next: NextFunction)=> {
    if(!req.isAuthenticated()){
        app.use(passport.authenticate("google", {
            scope: ['https://www.googleapis.com/auth/plus.login'],
            successRedirect:"/logged-in",
            failureRedirect:"/errr",
            session: false
        }))
    }
    next()
})
app.use(ClockRouter)

app.listen(port, () => console.log(`Example app listening at http://localhost:${port} \n`))
listEndpoints(app).forEach((e)=>console.log(e))
