import { Request, Response } from 'express';
import express from 'express';
import mySql, { Query } from 'mysql';
import { getMySqlConnection } from './connections/mysql';

const app = express();
const port = 3002;

class MarketProduct {
    productName: string;
    productPriceDollars: number;

    constructor(productName: string, productPriceDollars: number){
        this.productName = productName;
        this.productPriceDollars = productPriceDollars;
    }
}

app.get('/', async (req: Request, res: Response) => {
    const connection = getMySqlConnection();
    const results = connection?.query('select * from market_values_dollars;', (err, rows)=>{
        if(err) {
            res.status(500).send()
        }
        //@ts-ignore
        res.status(201).send(rows.map(r => {
            const marketProduct:MarketProduct = new MarketProduct(r.product_name, r.product_price_dollars);
            return marketProduct;
        }))
        console.log('The solution is: ', rows[0]);
    });
    
})

/**
 * Create my new o'clock
 * Properties:
 *  Name:
 *  Deadline:
 *  Sponsors:
 *  Dependents:
 *  Audience:
 *  AntiSponsors:
 */
app.post('/clock', async(req: Request, res: Response)=>{
    //TODO
})

/**
 * PATCH existing o'clock
 */
app.patch('/clock', async(req: Request, res: Response)=>{
    //TODO
})

/**
 * DELETE existing o'clock
 */
app.delete('/clock', async(req: Request, res: Response)=>{
    //TODO
})


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))