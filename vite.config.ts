import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Copy PDF.js worker file to public directory
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const pdfWorkerPath = path.join(nodeModulesPath, 'pdfjs-dist', 'build', 'pdf.worker.min.js');
fs.copyFileSync(pdfWorkerPath, './public/pdf.worker.min.js');

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 8080,
    host: true, // This will listen on all available network interfaces
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  }
}));