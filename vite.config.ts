import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.wasm'], 
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0, // Keeps your WASM binary pure
    sourcemap: false      // Shrinks final frontend build sizes
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    }
  }
});
