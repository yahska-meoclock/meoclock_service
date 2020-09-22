import {Strategy, ExtractJwt, StrategyOptions} from 'passport-jwt'
import fs from "fs"
import CRUD from "../connections/nosql_crud"

const opts:StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: fs.readFileSync(process.env.SECRETS_PATH+"/private.pem"),
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_Audience
}


const createJWTStrategy = () => new Strategy(opts, async function(jwt_payload, done) {
    try {
        let user = await CRUD.getSpecific("users", {username: jwt_payload.sub})
        user = user[0]
        if(user) {
            return done(null, user)
        } else {
            return done(null, false)
        }
    } catch (error){
        return done(error, false)
    }
   
});

export { createJWTStrategy }