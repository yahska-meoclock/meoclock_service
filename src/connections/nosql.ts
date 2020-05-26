const MongoClient = require('mongodb').MongoClient;

let db: any

export async function getNoSqlConnection():Promise<any> {
    if(db){
        return db
    }else{
        // Connection URL
        //const url = 'mongodb://meoclock_mongo:27017';
        const url = process.env.MONGO_LINK;
        // Database Name
        const dbName = 'meoclocks';
        // Create a new MongoClient
        let dbo = await MongoClient.connect(url)
        db = dbo.db(dbName)
        return db
    }
}

export function disconnect(){
    MongoClient.close()
}

