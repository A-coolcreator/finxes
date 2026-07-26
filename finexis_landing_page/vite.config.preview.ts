import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Standalone build: bundles everything (JS + CSS) into one HTML file
// that can be opened directly by double-clicking, no server required.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-preview',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
  },
})
