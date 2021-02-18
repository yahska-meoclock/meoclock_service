import express, { Request, Response } from 'express';
import { uuid } from 'uuidv4'
import redis from "../connections/redis"
import shortid from "shortid"
import CRUD, { appGet, get, getAll, post, getSpecific, deleteEntity, patch } from '../connections/nosql_crud' 
import logger from '../utilities/logger';
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
        //@ts-ignore
        const stripeAccount = await CRUD.getSpecific("stripe", {userId: req.user!.appId})

        const account = await stripe.accounts.create({
            type: 'express',
            business_type: "individual",
            capabilities:{
                transfers: {requested: true},
                card_payments: {requested: true}
            },
            business_profile:{
                mcc:5734,
                name:"meoclocks",
                support_url:"https://www.meoclocks.com/support",
                url:"https://www.meoclocks.com/support"
            }
        });
        const accountLinks = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: process.env.STRIPE_REDIRECT,
            return_url: process.env.STRIPE_REDIRECT,
            type: 'account_onboarding',
        });
        if (stripeAccount.length>0){
            //@ts-ignore
            await patch("stripe", {userId: req.user!.appId}, {stripeAccount: account.id, accountLinks: accountLinks})
        } else {
            //@ts-ignore
            await post("stripe", {stripeAccount: account.id, accountLinks: accountLinks, userId: req.user!.appId})
        }
        
        res.status(200).send(accountLinks.url) 
    } catch (e) {
        return res.status(500).send(e)
    }
})

stripeRouterPrivate.get("/stripe/onboarded", async(req: Request, res: Response)=>{
    try{
        //@ts-ignore
        //acct_1IBysTRbCXwFuUvf
        //u-muyn7hbVQ
        const account = await CRUD.getSpecific("stripe", {userId: req.user!.appId})
        const stripeAccountId = account[0].stripeAccount
        const stripeAccount = await stripe.accounts.retrieve(
            stripeAccountId
        );
        res.status(200).json({
            chargesEnabled: stripeAccount.charges_enabled,
            detailsSubmitted: stripeAccount.details_submitted
        })
    } catch(e) {
        res.status(500).send("Something went wrong while getting account")
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
                refresh_url: process.env.STRIPE_REDIRECT,
                return_url: process.env.STRIPE_REDIRECT,
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
        const {amount, sponsored, clock} = req.body
        if(amount && sponsored && clock){
            let destinationAccount = await CRUD.getSpecific("stripe", {userId: sponsored})
            if ( destinationAccount.length > 0) {
                const destinationAccountId = destinationAccount[0].stripeAccount
                const stripeAccount = await stripe.accounts.retrieve(
                    destinationAccountId
                );
                if (stripeAccount.charges_enabled && stripeAccount.details_submitted) {
                    const paymentIntent = await stripe.paymentIntents.create({
                        payment_method_types: ['card'],
                        amount: amount*100,
                        currency: 'usd',
                        application_fee_amount: 100,
                        transfer_data: {
                          destination: destinationAccountId,
                        },
                    });
                    //@ts-ignore
                    CRUD.post("payment-intents", {appId:"pi-"+shortid.generate(), from:req.user!.appId, intent:paymentIntent.id, to: sponsored, succeeded: false, clock: clock, succeeded: false})
                    
                    return res.status(200).send({paymentSecret: paymentIntent.client_secret,
                        chargesEnabled: stripeAccount.charges_enabled,
                        detailsSubmitted: stripeAccount.details_submitted
                    })
                } else {
                    return res.status(200).send({
                        paymentSecret: null,
                        chargesEnabled: stripeAccount.charges_enabled,
                        detailsSubmitted: stripeAccount.details_submitted
                    })
                }
            } else {
                return res.status(200).send({paymentSecret: null})
            }
        } else {
            res.sendStatus(400)
        }
    } catch(e){
        console.log(e)
        return res.status(500).send(e)
    }
})

stripeRouterPrivate.get("/stripe/status", async(req: Request, res: Response)=>{
    try {
        //@ts-ignore
        const stripeRecord = await CRUD.getSpecific("stripe", {userId: req.user?.appId})
        if(stripeRecord.length>0){
            return res.status(200).send(true)
        } else {
            return res.status(200).send(false)
        }
    } catch(e) {
        return res.status(500).send(e)
    }    
})

stripeRouterPrivate.delete("/stripe", async(req: Request, res: Response) => {
    try {
        //@ts-ignore
        await CRUD.deleteEntity("stripe", {userId: req.user?.appId})
        return res.sendStatus(200)
    } catch(e) {
        return res.status(500).send(e)
    } 
})





export default stripeRouterPrivate

