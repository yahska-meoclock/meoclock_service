import fs from 'fs'
import jwt from 'jsonwebtoken'
import express, { Request, Response } from 'express';
import axios from "axios"
import querystring from "querystring"

const authRoute = express.Router()

interface AppleAuthKeyCollection {
    keys: [AppleAuthKey]
}
interface AppleAuthKey  {
   kty:string,
   kid:string,
   use:string,
   alg:string,
   n:string,
   e:string
}
interface AxiosAuthKeyResult {
    data: AppleAuthKeyCollection
}

const getClientSecret = (key: string) => {
    const privateKey = fs.readFileSync(process.env.APPLE_PRIVATE_KEY_FILE??"", {encoding:"utf8"});

    const token = jwt.sign({}, privateKey, 
    {
        algorithm:"ES256",
        keyid:process.env.KEY_ID,
        expiresIn: '1d',  
        audience: 'https://appleid.apple.com',  
        subject: process.env.CLIENT_ID,  
        issuer: process.env.TEAM_ID
    })

    const key1 = "iGaLqP6y-SJCCBq5Hv6pGDbG_SQ11MNjH7rWHcCFYz4hGwHC4lcSurTlV8u3avoVNM8jXevG1Iu1SY11qInqUvjJur--hghr1b56OPJu6H1iKulSxGjEIyDP6c5BdE1uwprYyr4IO9th8fOwCPygjLFrh44XEGbDIFeImwvBAGOhmMB2AD1n1KviyNsH0bEB7phQtiLk-ILjv1bORSRl8AK677-1T8isGfHKXGZ_ZGtStDe7Lu0Ihp8zoUt59kx2o9uWpROkzF56ypresiIl4WprClRCjz8x6cPZXU2qNWhu71TQvUFwvIvbkE1oYaJMb0jcOTmBRZA2QuYw-zHLwQ"
    const key2 = "4dGQ7bQK8LgILOdLsYzfZjkEAoQeVC_aqyc8GC6RX7dq_KvRAQAWPvkam8VQv4GK5T4ogklEKEvj5ISBamdDNq1n52TpxQwI2EqxSk7I9fKPKhRt4F8-2yETlYvye-2s6NeWJim0KBtOVrk0gWvEDgd6WOqJl_yt5WBISvILNyVg1qAAM8JeX6dRPosahRVDjA52G2X-Tip84wqwyRpUlq2ybzcLh3zyhCitBOebiRWDQfG26EH9lTlJhll-p_Dg8vAXxJLIJ4SNLcqgFeZe4OfHLgdzMvxXZJnPp_VgmkcpUdRotazKZumj6dBPcXI_XID4Z4Z3OM1KrZPJNdUhxw"
    //console.log(jwt.verify(token, key))
    //console.log(jwt.verify(token, key2))
    console.log(token)
    return token
}

authRoute.get("/auth/apple", (req: Request, res: Response)=>{
    //console.log(getClientSecret())
    res.status(200).send("auth apple get ")
})
authRoute.post("/auth/apple", (req: Request, res: Response)=>{
    //console.log(getClientSecret())
    res.status(200).send("auth apple post")
})

authRoute.post("/apple/redirect", async (req: Request, res: Response)=>{
    const keyResult: AxiosAuthKeyResult = await axios.get("https://appleid.apple.com/auth/keys")
    const key = keyResult.data.keys[0].n
    const clientSecret = getClientSecret(key)
    console.log(req.body)
    const requestBody = {
        grant_type: 'authorization_code',
        code: req.body.code,
        redirect_uri: "www.meoclocks.com/auth/apple",
        client_id: process.env.CLIENT_ID,
        client_secret: clientSecret,
        scope: "name email"
    }

    axios.request({
        method: "POST",
        url: "https://appleid.apple.com/auth/token",
        data: querystring.stringify(requestBody),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
       }).then(response => {
        return res.json({
         success: true,
         data: response.data
        })
       }).catch(error => {
        return res.status(500).json({
         success: false,
         error: error.response.data
        })
    })
})

export default authRoute