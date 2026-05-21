import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

let queryCount = 0;

export async function query(text: string, params?: any[]): Promise<QueryResult> {
  queryCount++;
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`Slow query (${duration}ms):`, text.substring(0, 100));
    }
    return result;
  } catch (error) {
    console.error(`Query error (attempt ${queryCount}):`, (error as Error).message);
    throw error;
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

export { pool };
