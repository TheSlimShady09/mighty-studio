import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 4321, host: '127.0.0.1', open: false },
  preview: { port: 4322, host: '127.0.0.1' },
  build: { outDir: 'dist', assetsInlineLimit: 4096 }
});
