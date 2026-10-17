import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

process.loadEnvFile(new URL('../../.env', import.meta.url));

export default defineConfig({
  test: {
    // Tests never touch the dev database.
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? '',
      OPENROUTER_API_KEY: 'test-key',
      OPENROUTER_VISION_MODEL: 'test/vision-model',
      UPLOAD_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'movemate-uploads-')),
    },
    globalSetup: ['./src/test/global-setup.ts'],
    setupFiles: ['./src/test/db.ts'],
    // Test files share one database and truncate it between tests.
    fileParallelism: false,
  },
});
