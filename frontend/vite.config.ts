import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy /api → backend (8080), żeby uniknąć CORS w devie.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
