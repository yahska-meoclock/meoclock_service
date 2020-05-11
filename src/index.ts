require('dotenv').config()
import express, { Request, Response, NextFunction } from 'express';
import mySql, { Query } from 'mysql';
import { getMySqlConnection } from './connections/sql';
import ClockRouter from './modules/clock'
import AuthRouter from './modules/sign_in_with_apple'
import GoogleRouter from './modules/sign_in_with_google'
import listEndpoints from 'express-list-endpoints'
import bodyParser from 'body-parser'
import passport from 'passport';
import { createJWTStrategy } from './modules/jwt-strategy';
import {createGoogleAuthStrategy} from "./modules/google_auth_strategy"
import User from "./definitions/user"
import { generateHash } from './utils';
import CRUD from './connections/nosql_crud';
// import passport from 'passport';
// var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


//REFER: https://gist.github.com/joshbirk/1732068

const app = express();
const port = process.env.SERVER_PORT;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())
app.use(passport.initialize())
passport.use(createJWTStrategy())
passport.use(createGoogleAuthStrategy())
app.get('/', async (req: Request, res: Response) => {
    //const connection = getMySqlConnection();
    // const results = connection?.query('select * from market_values_dollars;', (err, rows)=>{
    //     if(err) {
    //         res.status(500).send()
    //     }
    //     //@ts-ignore
    //     res.status(201).send(rows.map(r => {
    //         const marketProduct:MarketProduct = new MarketProduct(r.product_name, r.product_price_dollars);
    //         return marketProduct;
    //     }))
    //     console.log('The solution is: ', rows[0]);
    // });
    res.status(200).sendFile("index.html", {root:"src"})
})

app.get("/logged-in", (req: Request, res: Response)=>{
    res.status(200).json(req.user)
})

app.get("/errr", (req: Request, res: Response)=>{
    res.status(500).json("Could not authenticate")
})

app.use(AuthRouter)
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
