import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('✅ Connected to Neon PostgreSQL Database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

export const dbQuery = async <T = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    // Audit of Database Connection/Execution as requested
    console.log(`[DB AUDIT] Executed query: { text: ${text.replace(/\n/g, ' ')}, duration: ${duration}ms, rows: ${res.rowCount} }`);
    
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[DB AUDIT ERROR] Query failed: { text: ${text.replace(/\n/g, ' ')}, duration: ${duration}ms, error: ${(error as any).message} }`);
    throw error;
  }
};

export default pool;
