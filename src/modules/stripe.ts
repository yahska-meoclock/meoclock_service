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

export default stripeRouter

