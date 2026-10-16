import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from '../env';

const pool = new pg.Pool({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 3000 });
// Without a listener, an idle client dropped by Postgres crashes the process.
pool.on('error', (error) => console.error('Postgres pool error:', error.message));

export const db = drizzle(pool);

export async function pingDatabase(): Promise<void> {
  await db.execute(sql`select 1`);
}
