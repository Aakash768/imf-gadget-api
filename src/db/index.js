import pkg from 'pg';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: 5432,
});

const prisma = new PrismaClient();

const connectDB = async () => {
    let prismaConnected = false;

    try {
        await prisma.$connect();
        prismaConnected = true;
        console.log('Prisma connected to PostgreSQL');
    } catch (error) {
        console.error('Error connecting to Prisma PostgreSQL database', error);
    }

    if (!prismaConnected) {
        try {
            await pool.connect();
            console.log('PostgreSQL connected');
        } catch (error) {
            console.error('Error connecting to local PostgreSQL database', error);
            console.error('Both local PostgreSQL and Prisma connections failed. Exiting...');
            process.exit(1);
        }
    }
};

export { pool, prisma, connectDB };