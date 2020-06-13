export interface AppleAuthKeyCollection {
    keys: [AppleAuthKey]
}

export interface AppleAuthKey  {
   kty:string,
   kid:string,
   use:string,
   alg:string,
   n:string,
   e:string
}

export interface AxiosAuthKeyResult {
    data: AppleAuthKeyCollection
}