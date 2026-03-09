import mongoose from 'mongoose';
import { Pool, PoolClient } from 'pg';

// PostgreSQL connection pool
export const pgPool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE || 'requestbin',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'password',
});

// MongoDB connection
export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/requestbin';
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

// Test PostgreSQL connection
export async function testPgConnection(): Promise<void> {
  const client = await pgPool.connect();
  try {
    await client.query('SELECT NOW()');
    console.log('PostgreSQL connected');
  } finally {
    client.release();
  }
}

// Initialize both databases
export async function initDatabases(): Promise<void> {
  await Promise.all([connectMongo(), testPgConnection()]);
}

// Close all connections (useful for tests)
export async function closeDatabases(): Promise<void> {
  await Promise.all([mongoose.disconnect(), pgPool.end()]);
}
