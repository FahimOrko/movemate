import { defineConfig } from 'vitest/config';

process.loadEnvFile(new URL('../../.env', import.meta.url));

export default defineConfig({
  test: {
    // Tests never touch the dev database.
    env: { NODE_ENV: 'test', DATABASE_URL: process.env.TEST_DATABASE_URL ?? '' },
  },
});
