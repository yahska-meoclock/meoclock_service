import express, { Request, Response } from 'express';
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const stripeRouterPublic = express.Router()

//code=ac_HWpxUhep0Th1fmnl2RfPjtuaRLW7UBzE
stripeRouterPublic.get("/stripe/authorize-oauth", async (req: Request, res: Response)=>{
    const {code, state} = req.query;

    stripe.oauth.token({
        grant_type: 'authorization_code',
        code: 'ac_HWpxUhep0Th1fmnl2RfPjtuaRLW7UBzE'
    }).then((response: any)=>{
        const connected_account_id = response.stripe_user_id;
        console.log("Connected account ", connected_account_id)
        res.redirect(301, "www.meoclocks.com/profile")
    }, (err: any) => {
        if (err.type === 'StripeInvalidGrantError') {
            return res.status(400).json({error: 'Invalid authorization code: ' + code});
        } else {
            return res.status(500).json({error: 'An unknown error occurred.'});
        }
    })
})

export default stripeRouterPublic