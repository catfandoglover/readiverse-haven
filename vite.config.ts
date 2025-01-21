import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 8080,
    host: true, // This will listen on all available network interfaces
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    {
      name: 'pdf-worker-copy',
      buildStart() {
        try {
          const nodeModulesPath = path.resolve(__dirname, 'node_modules');
          const pdfWorkerPath = path.join(nodeModulesPath, 'pdfjs-dist', 'build', 'pdf.worker.min.js');
          const publicDir = path.resolve(__dirname, 'public');
          
          // Create public directory if it doesn't exist
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
          }
          
          // Copy the worker file
          if (fs.existsSync(pdfWorkerPath)) {
            fs.copyFileSync(pdfWorkerPath, path.join(publicDir, 'pdf.worker.min.js'));
            console.log('PDF worker file copied successfully');
          } else {
            console.warn('PDF worker file not found at:', pdfWorkerPath);
          }
        } catch (error) {
          console.error('Error copying PDF worker file:', error);
        }
      }
    }
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