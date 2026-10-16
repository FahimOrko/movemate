import path from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

export default async function setup() {
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  await migrate(drizzle(pool), { migrationsFolder: path.resolve(import.meta.dirname, '../db/migrations') });
  await pool.end();
}
