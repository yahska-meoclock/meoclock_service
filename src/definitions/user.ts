import shortid from "shortid"
export class User {
    id:string|null=""
    appId:string=`u-${shortid.generate()}`
    firstName:string = ""
    lastName:string = ""
    token:string|null = null
    googleEmail:string|null = null
    appleEmail:string|null = null
    appleAccessToken:string|null = null
    appleRefreshToken:string|null = null
    googleAccessToken:string|null = null
    googleRefreshToken:string|null = null
    username:string = ""
    passwordHash:string|null = ""
    signupEmail:string|null = ""
    pictureUrl: string|null = ""
    active: boolean = false
    level: number = 1
}

export default User

