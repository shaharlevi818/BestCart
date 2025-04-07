// src/database.ts

import mysql from 'mysql2/promise'; // Use mysql2/promise
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

// Create and configure the connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'bestcart_db', 
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(connection => {
        console.log('[database]: Connection pool created successfully.');
        connection.release();
    })
    .catch(err => {
        console.error('[database]: Error creating connection pool:', err);
    });

// EXPORT the configured pool for other modules to use
export default pool;

