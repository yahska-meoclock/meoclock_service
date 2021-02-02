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