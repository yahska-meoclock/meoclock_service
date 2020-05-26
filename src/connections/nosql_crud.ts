import { getNoSqlConnection } from './nosql'
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
// function deleteTodo(req, res, dbo) {
//     console.log("req del", req.params.id)
//     dbo.collection("todos").deleteOne({_id:req.params.id}, (error, result)=>{
//         if (error) throw error;
//         console.log("count ", result.deletedCount);
//         res.status(200).send()
//     })
// }

export default {
    post,
    getAll,
    getSpecific
}