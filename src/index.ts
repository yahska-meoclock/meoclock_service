require('dotenv').config()
import express, { Request, Response } from 'express';
import mySql, { Query } from 'mysql';
import { getMySqlConnection } from './connections/sql';
import ClockRouter from './modules/clock'
import AuthRouter from './modules/sign_in_with_apple'
import GoogleRouter from './modules/sign_in_with_google'
import listEndpoints from 'express-list-endpoints'
import bodyParser from 'body-parser'
import passport from 'passport';
import { createJWTStrategy } from './modules/jwt-strategy';
// import passport from 'passport';
// var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const app = express();
const port = process.env.SERVER_PORT;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

passport.use(createJWTStrategy())

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

app.use(AuthRouter)
app.use(GoogleRouter)
app.use(passport.authenticate(["jwt", "google"]))
app.use(ClockRouter)

app.listen(port, () => console.log(`Example app listening at http://localhost:${port} \n`))
listEndpoints(app).forEach((e)=>console.log(e))
