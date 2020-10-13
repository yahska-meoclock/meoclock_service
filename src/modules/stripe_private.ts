import express, { Request, Response } from 'express';
import { uuid } from 'uuidv4'
import redis from "../connections/redis"
import CRUD, { appGet, get, getAll, post, getSpecific, deleteEntity, patch } from '../connections/nosql_crud' 
const stripe = require('stripe')('sk_test_FWOmLs9sKd65HmDQ4tKrUFzr');

// const paymentIntent = await stripe.paymentIntents.create({
//     payment_method_types: ['card'],
//     amount: 1000,
//     currency: 'usd',
//   }, {
//     stripeAccount: '{{CONNECTED_STRIPE_ACCOUNT_ID}}',
// });

const stripeRouterPrivate = express.Router()

/*
    References:
    https://stripe.com/docs/connect/collect-then-transfer-guide
    https://stripe.com/docs/connect/standard-accounts

*/
stripeRouterPrivate.get("/get-stripe-auth-link", async (req: Request, res: Response)=>{
    const state = uuid();
    //@ts-ignore
    redis.hset("authing_stripe", state, req.user!._id)
    //@ts-ignore
    const args = new URLSearchParams({state, client_id: process.env.STRIPE_CLIENT_ID, redirect_uri:"https://db20e3ec0352.ngrok.io/stripe/authorize-oauth"})
    const url = `https://connect.stripe.com/express/oauth/authorize?${args.toString()}`;
    return res.send({url});
})


stripeRouterPrivate.post("/account/express", async (req: Request, res: Response)=>{
    try {
        const account = await stripe.accounts.create({
            type: 'express',
            capabilities:{
                transfers: {requested: true},
                card_payments: {requested: true}
            }
        });
        const accountLinks = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: 'https://5be99a601447.ngrok.io/stripe/reauth',
            return_url: 'https://5be99a601447.ngrok.io/stripe/return',
            type: 'account_onboarding',
        });
        //@ts-ignore
        post("stripe", {stripeAccount: account.id, accountLinks: accountLinks, userId: req.user!.appId})
        res.status(200).send(accountLinks.url) 
    } catch (e) {
        return res.status(500).send(e)
    }
})

stripeRouterPrivate.get("/stripe/reauth", async (req: Request, res: Response)=>{
    try {
        console.log("Stripe reauth ", req)
    } catch(e) {
        return res.status(500).send(e)
    }
})

stripeRouterPrivate.get("/stripe/return", async (req: Request, res: Response)=>{
    try {
        console.log("Stripe return ", req)
    } catch(e) {
        return res.status(500).send(e)
    }
})

stripeRouterPrivate.get("/account/links", async (req: Request, res: Response)=>{
    try {
        //@ts-ignore
        const account: any = await appGetOne("stripe", req.user!.appId)
        if(account){
            const accountLinks = await stripe.accountLinks.create({
                account: account.id,
                refresh_url: 'https://5be99a601447.ngrok.io/stripe/reauth',
                return_url: 'https://5be99a601447.ngrok.io/stripe/return',
                type: 'account_onboarding',
            });

            res.status(200).send(accountLinks.url)
        }
    } catch (e) {
        return res.status(500).send(e)
    }
})

stripeRouterPrivate.post("/stripe/payment", async (req: Request, res: Response) => {
    try {

        
        const paymentIntent = await stripe.paymentIntents.create({
            payment_method_types: ['card'],
            amount: 1000,
            currency: 'usd',
            application_fee_amount: 123,
            transfer_data: {
              destination: '{{CONNECTED_STRIPE_ACCOUNT_ID}}',
            },
        });
    } catch (e) {
        return res.status(500).send(e)
    }
})

stripeRouterPrivate.post("/stripe/sponsor", async(req: Request, res: Response) => {
    try {
        const {amount, sponsored} = req.body
        if(amount && sponsored){
            let destinationAccountId = await CRUD.getSpecific("stripe", {userId: sponsored})
            destinationAccountId=destinationAccountId[0]
            const paymentIntent = await stripe.paymentIntents.create({
                payment_method_types: ['card'],
                amount: amount*100,
                currency: 'usd',
                application_fee_amount: 100,
                transfer_data: {
                  destination: destinationAccountId.stripeAccount,
                },
            });
            return res.status(200).send(paymentIntent.client_secret)
        } else {
            res.sendStatus(400)
        }
    } catch(e){
        return res.status(500).send(e)
    }
})

export default stripeRouterPrivate

