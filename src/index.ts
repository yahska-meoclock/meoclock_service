require('dotenv').config()
import express, { Request, Response, NextFunction } from 'express';
import ClockRouter from './modules/clock'
import AppleAuthRouter from './modules/sign_in_with_apple'
import GoogleAuthRouter from './modules/sign_in_with_google'
import listEndpoints from 'express-list-endpoints'
import bodyParser from 'body-parser'
import passport from 'passport';
import { createJWTStrategy } from './modules/jwt-strategy';
import {createGoogleAuthStrategy} from "./modules/google_auth_strategy"
import localAuth from "./modules/sign_in_with_local"
import publicClockRoute from "./modules/public_clock"
import UserRouter from "./modules/user"
import GroupRouter from "./modules/group"
import TimelineRouter from "./modules/timeline";
import localAuthMiddleware from "./modules/local_auth_middleware"
import wss from "./connections/websocket"
import schedule from "node-schedule"
import CRUD from "./connections/nosql_crud"

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
app.enable('strict routing')
const port = process.env.SERVER_PORT;

app.use(cors())

wss.on('connection', (ws:any) => {
  ws.on('message', (message:any) => {
      const parsedMessage = JSON.parse(message)
      if(parsedMessage.tempId){
        ws.id = parsedMessage.tempId
      }
  })
  ws.send('ho!')
})

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())
app.use(passport.initialize())
passport.use(createJWTStrategy())
passport.use(createGoogleAuthStrategy())

app.get('/', async (req: Request, res: Response) => {
    console.log("Sending home")
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
app.use(GoogleAuthRouter)
app.use(passport.authenticate('jwt', {session: false}))
app.use(localAuthMiddleware)
app.use(ClockRouter)
app.use(UserRouter)
app.use(GroupRouter)
app.use(TimelineRouter)

schedule.scheduleJob("* * 0 * *", async ()=>{
  console.log("Executing")
  const allClocks = await CRUD.getSpecific("clocks", {expired: false})
  let expiredClocks: any[] = []
  allClocks.forEach((clock: any)=>{
    if(clock.deadline > new Date() && !clock.achieved) {
      expiredClocks.push(clock._id)
    }
  })
  CRUD.expirePatch("clocks", expiredClocks, {expired: true})
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port} \n`))
listEndpoints(app).forEach((e)=>console.log(e))
