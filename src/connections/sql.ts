import { createConnection, Connection } from 'mysql';

let connection: Connection | null = null


export const getMySqlConnection = () => {
    if(connection) {
        return connection
    } else {
        connection = createConnection({
            host: process.env.SQL_HOST,
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            database: process.env.SQL_DATABASE
        });
        connection.connect();
    }
}



