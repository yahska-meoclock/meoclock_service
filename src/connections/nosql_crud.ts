import { getNoSqlConnection } from './nosql'
import { ObjectId } from "mongodb"
import { Clock } from "../definitions/clock"

// function putTodo(req, res, dbo) {
//     console.log("req ", req.body)
//     dbo.collection('todos').updateOne({_id: req.params.id}, {$set: {title: req.body.title, isCompleted: req.body.isCompleted||false}}, (err, result)=>{
//         if(err) throw err;
//         console.log("U ", req.params.id)
//         dbo.collection("todos").findOne({_id:req.params.id}, (error, findResult)=>{
//             if(error) throw error;
//             console.log(" Find ", findResult)
//             if(findResult){
//                 const _findResult = transform(findResult)
//                 res.status(200).send(_findResult)
//             }
//             res.status(404).send()
//         })
//     })
// }

export async function get(entity:string, id:string) {
    const db = await getNoSqlConnection()
    const result = await db.collection(entity).findOne({_id: new ObjectId(id)})
    return result
}
export async function patch(entity: string, filter: any, patch: any) {
    const db = await getNoSqlConnection()
    console.log("Patching ", filter, patch)
    if(filter._id)
        filter._id = new ObjectId(filter._id)
    console.log(entity, filter, patch)
    const updatedResult = await db.collection(entity).updateOne(filter, {$set: patch})
    return updatedResult
}

export async function expirePatch(entity: string, clocks: any, patch: any) {
    const db = await getNoSqlConnection()
    const filter = {_id: {$in: clocks}}
    const updatedResult = await db.collection(entity).updateOne(filter, {$set: patch})
    return updatedResult
}

export async function post(entity: string, data: any) {
    const db = await getNoSqlConnection()
    db.collection(entity).insertOne(data, (err:any, result:any)=>{
        if(err) throw err;
        return result
    })
}

export async function getAll(entity: string){
    const db = await getNoSqlConnection()
    const result = await db.collection(entity).find({}).toArray()
    return result
}

export async function getSpecific(entity: string, filter: any) {
    const db = await getNoSqlConnection()
    const result = await db.collection(entity).find(filter).toArray()
    return result
}

export async function deleteEntity(entity: string, filter:any=null) {
    if (filter) {
        try {
            const db = await getNoSqlConnection()
            console.log("Filter ", filter)
            if(filter._id)
                filter._id = new ObjectId(filter._id)
            const result = await db.collection(entity).deleteOne(filter)
            return result.deletedCount
        } catch (e) {
            throw e
        }
    }
}

export default {
    get,
    post,
    getAll,
    patch,
    getSpecific,
    deleteEntity,
    expirePatch
}