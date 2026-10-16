import { sql } from 'drizzle-orm';
import { beforeEach } from 'vitest';
import { db } from '../db/client';

beforeEach(async () => {
  // guidance_progress goes with it through the FK cascade.
  await db.execute(sql`truncate table moves cascade`);
});
