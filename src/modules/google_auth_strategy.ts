import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import CRUD from "../connections/nosql_crud"
import {User} from "../definitions/user"

export const createGoogleAuthStrategy = () => new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID??"",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET??"",
    callbackURL: "https://service.meoclocks.com/google/redirect"
  },
  async function(accessToken: any, refreshToken: any, profile: any, done: any) {
    try {
      const user = await CRUD.getSpecific("user", {googleEmail: profile.id})
      if(user) {
          return done(null, user)
      } else {
        const user:User = {
          id: null,
          username: profile.id,
          passwordHash: null,
          firstName: "",
          lastName: "",
          googleEmail: null,
          appleEmail: null,
          appleAccessToken: null,
          appleRefreshToken: null,
          signupEmail: profile.id,
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken
        }
        CRUD.post("user", user)
        return done(null, user)
      }
    } catch (error){
        return done(error, false)
    }
  }
)
