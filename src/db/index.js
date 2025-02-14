import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;

const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: 5432,  
});

const connectDB = async () => {
    try {
        await pool.connect();
        console.log('PostgreSQL connected');
    } catch (error) {
        console.error('Error connecting to PostgreSQL database', error);
        process.exit(1);
    }
};

export { pool, connectDB };
