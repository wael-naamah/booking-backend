import { getEnv } from '../../../env';
import mongoose from 'mongoose';
import { ClientError } from '../../../utils/exceptions';


const createConnection = (uri: string) => {
    const conn = mongoose.createConnection(uri, {
        minPoolSize: 10,
        maxPoolSize: 25,
        connectTimeoutMS: 20000,
        socketTimeoutMS: 720000,
    });
    conn.on('error', (err) => {
        console.error(`mongo connection error: ${err}`);
        process.exit(1); // kill the process for cloud run to respawn
    });
    conn.once('open', function callback() {
        console.info('mongo connection opened');
        return;
    });
    return conn;
};

let connection: mongoose.Connection;

export const getMongo = (): mongoose.Connection => {
    if (!connection) {
        connection = createConnection(getEnv().mongoUri)
    }
    if (connection) {
        return connection;
    }
    throw new ClientError('Database connection error: ', 400);
};
