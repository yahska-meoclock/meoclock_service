require('dotenv').config()
import express, { Request, Response } from 'express';
import mySql, { Query } from 'mysql';
import { getMySqlConnection } from './connections/sql';
import ClockRouter from './modules/clock'
import AuthRouter from './modules/sign_in_with_apple'
// import passport from 'passport';
// var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const app = express();
const port = process.env.SERVER_PORT;

class MarketProduct {
    productName: string;
    productPriceDollars: number;

    constructor(productName: string, productPriceDollars: number){
        this.productName = productName;
        this.productPriceDollars = productPriceDollars;
    }
}

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
    res.status(200).send("Welcome")
})

app.use(ClockRouter)
app.use(AuthRouter)

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))