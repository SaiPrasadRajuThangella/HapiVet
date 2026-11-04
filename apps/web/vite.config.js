import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The API runs on its own port in development; see apps/api.
const proxy = { '/api': process.env.VITE_DEV_API || 'http://localhost:4100' };

export default defineConfig({
  plugins: [react()],
  server: { port: 5180, proxy },
  preview: { proxy },
  build: {
    // Three.js stays out of manualChunks on purpose: left to the dynamic import in PuppyStage.jsx,
    // it lands in the Scene3D chunk and is never preloaded by index.html.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
});
