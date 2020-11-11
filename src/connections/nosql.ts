const MongoClient = require('mongodb').MongoClient;

let db: any

export async function getNoSqlConnection():Promise<any> {
    if(db){
        return db
    }else{
        // Connection URL
        const url = process.env.MONGO_ENDPOINT;
        // Database Name
        const dbName = 'meoclocks';
        // Create a new MongoClient
        let dbo = await MongoClient.connect(url, { useNewUrlParser: true })
        db = dbo.db(dbName)
        return db
    }
}

export function disconnect(){
    MongoClient.close()
}

