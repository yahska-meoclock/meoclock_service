
export class User {
    id:string|null=""
    appId:string=""
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
}

export default User

