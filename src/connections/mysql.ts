import { createConnection, Connection } from 'mysql';

let connection: Connection | null = null


export const getMySqlConnection = () => {
    if(connection) {
        return connection
    } else {
        connection = createConnection({
            host: 'localhost',
            user: 'akshay',
            password: 'qwerty',
            database:"market"
        });
        connection.connect();
    }
}



