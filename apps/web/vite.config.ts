import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const { PORT = '3000' } = loadEnv(mode, path.resolve(import.meta.dirname, '../..'), '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
    // Same-origin /api: no CORS, and <img src="/api/..."> just works.
    server: { proxy: { '/api': `http://localhost:${PORT}` } },
  };
});
