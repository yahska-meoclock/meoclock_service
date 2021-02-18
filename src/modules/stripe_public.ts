import express, { Request, Response } from 'express';
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import bodyParser from 'body-parser'
import CRUD from "../connections/nosql_crud"
const stripeRouterPublic = express.Router()
import shortid from "shortid"
import logger from '../utilities/logger';
import axios from "axios"

//code=ac_HWpxUhep0Th1fmnl2RfPjtuaRLW7UBzE

stripeRouterPublic.get("/stripe/authorize-oauth", async (req: Request, res: Response)=>{
    const {code, state} = req.query;

    stripe.oauth.token({
        grant_type: 'authorization_code',
        code
    }).then((response: any)=>{
        const connected_account_id = response.stripe_user_id;
        console.log("Connected account ", connected_account_id)
        console.log("Response ", response)
        res.redirect(301, `${process.env.WEB_ENDPOINT}/profile`)
    }, (err: any) => {
        if (err.type === 'StripeInvalidGrantError') {
            return res.status(400).json({error: 'Invalid authorization code: ' + code});
        } else {
            return res.status(500).json({error: 'An unknown error occurred.'});
        }
    })
})

stripeRouterPublic.get("/stripe/reauth", async (req: Request, res: Response)=> {
    res.redirect(`${process.env.WEB_ENDPOINT}/profile`)
})

stripeRouterPublic.get("/stripe/return", async (req: Request, res: Response)=> {
    res.redirect(`${process.env.WEB_ENDPOINT}/profile`)
})

stripeRouterPublic.post("/public/stripe/sponsor", async(req: Request, res: Response) => {
    try {
        const {amount, clock} = req.body
        if(amount && clock){
            const sponsoredClock = await CRUD.appGetOne("clocks", clock)
            const sponsoredUser = await CRUD.appGetOne("users", sponsoredClock.owner)
            let destinationAccount = await CRUD.getSpecific("stripe", {userId: sponsoredUser.appId})
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
                    CRUD.post("payment-intents", {appId:"pi-"+shortid.generate(), from:"unknown", intent:paymentIntent.id, to: sponsoredUser, succeeded: false, clock: clock})
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

//Webhooks
stripeRouterPublic.post("/stripe/webhook/sponsor-succeeded", bodyParser.raw({type: 'application/json'}), async(req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];

    let event;
    logger.info("Payment intent successful")
    // Verify webhook signature and extract the event.
    // See https://stripe.com/docs/webhooks/signatures for more information.
    try {
        //@ts-ignore
        event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_PAYMENT_SUCCEEDED_HOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        logger.info("Payment Succeeded")
        CRUD.patch("payment-intents", {intent: paymentIntent.id}, {succeeded: true})

        axios.post("http://localhost:3000/validate_payment", {paymentIntent: paymentIntent.id})
        //handleSuccessfulPaymentIntent(paymentIntent);
    }
    res.json({received: true});
})

export default stripeRouterPublic