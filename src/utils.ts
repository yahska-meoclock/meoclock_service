import crypto from "crypto"
import fs from "fs"
import jwt from 'jsonwebtoken'

export const generateToken = async (subject: string)=>{
    let payload = {
        iss: process.env.JWT_ISSUER,
        sub: subject,
        aud: process.env.JWT_AUDIENCE,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2
    };
    const secret = fs.readFileSync(process.env.SECRETS_PATH+"/private.pem")
    const token = await jwt.sign(payload, secret)
    return token
}

export const generateHash = (p: string) => {
    const hash = crypto.createHash('sha256');
    hash.update(p);
    return hash.digest('hex');
}