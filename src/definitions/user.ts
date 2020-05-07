
export class User {
    firstName:string = ""
    lastName:string = ""
    googleEmail:string|null = null
    appleEmail:string|null = null
    appleAccessToken:string|null = null
    appleRefreshToken:string|null = null
    googleAccessToken:string|null = null
    googleRefreshToken:string|null = null
    username:string = ""
    passwordHash:string|null = ""
}

export default User

