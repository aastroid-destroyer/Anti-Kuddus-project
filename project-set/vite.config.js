import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  // A stray package.json/node_modules at the repo root pulls in a second copy
  // of React. Deduping forces every import (including inside pre-bundled deps
  // like react-fast-marquee) to resolve to this app's single React, so hooks
  // never run against a null dispatcher ("Cannot read properties of null
  // (reading 'useState')").
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})
