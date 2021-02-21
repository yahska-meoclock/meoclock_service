import nosql_crud, { get, getAll, post, getSpecific, deleteEntity, patch, appGetOne } from '../connections/nosql_crud'

export const isOwner = async (clock: any, user: any):Promise<boolean> => {
    const isOwner = false
    try {
        const clock_field = await nosql_crud.appGetOne("clocks", clock)
        return clock_field.owner == user
    } catch {
        return isOwner
    }
}

export const getClocksWithOwners = async (clocks: any[]) => {
    let appIds = clocks.map((c:any)=>c.owner)
    let promises:Promise<any>[] = []
    let ownerMap = new Map()
    appIds.forEach((id:string) => {
        let ownerPromise = nosql_crud.appGetOne("users", id)
        promises.push(ownerPromise)
        ownerPromise.then((owner:any)=>ownerMap.set(id, owner))
    });
    await Promise.all(promises)
    let results = clocks.map((res:any)=>{
        let userOwner = ownerMap.get(res.owner)
        return {...res, ownerInfo:{firstName:userOwner.firstName, 
            lastName:userOwner.lastName,
            pictureUrl: userOwner.pictureUrl
        }}
    })
    return results
}