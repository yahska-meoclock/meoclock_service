import express, { Request, Response } from 'express';
import { uuid } from 'uuidv4'
import redis from "../connections/redis"
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const stripeRouter = express.Router()

stripeRouter.get("/get-stripe-auth-link", async (req: Request, res: Response)=>{
    const state = uuid();
    //@ts-ignore
    redis.hset("authing_stripe", state, req.user!._id)
    //@ts-ignore
    const args = new URLSearchParams({state, client_id: process.env.STRIPE_CLIENT_ID})
    const url = `https://connect.stripe.com/express/oauth/authorize?${args.toString()}`;
    return res.send({url});
})

stripeRouter.get("/stripe/authorize-oauth", async (req: Request, res: Response)=>{
    const {code, state} = req.query;

    stripe.oauth.token({
        grant_type: 'authorization_code',
        code
    }).then((response: any)=>{
        const connected_account_id = response.stripe_user_id;
        console.log("Connected account ", connected_account_id)
        res.redirect(301, "/profile")
    }, (err: any) => {
        if (err.type === 'StripeInvalidGrantError') {
            return res.status(400).json({error: 'Invalid authorization code: ' + code});
        } else {
            return res.status(500).json({error: 'An unknown error occurred.'});
        }
    })
})

export default stripeRouter

