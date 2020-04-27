import { getNoSqlConnection } from './nosql'

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

// function postTodo(req, res, dbo) {
//     console.log("req ", req.body)
    
//     dbo.collection('todos').find({}).toArray((err, result)=>{
//         if(err) throw err;
//         const newId = parseInt(Math.random()*1000)+"" + (result.length + 1)
//         const todo = {_id: newId, title:req.body.title, isCompleted:req.body.isCompleted||false}
//         console.log("Todo ", todo)
//         dbo.collection('todos').insertOne(todo, (err, result)=>{
//             if(err) throw err;
//             console.log("Inserted "+result.insertedId)
//             dbo.collection("todos").findOne({_id:result.insertedId}, (error, findResult)=>{
//                 console.log(" Find ", findResult)
//                 if(findResult){
//                     const _findResult = transform(findResult)
//                     res.status(201).send(_findResult)
//                 }
//             })
//         })
//     })
// }

export async function getAll(entity: string){
    const db = await getNoSqlConnection()
    const result = await db.collection(entity).find({}).toArray()
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
