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
    host: true,
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
          const targetPath = path.join(publicDir, 'pdf.worker.min.js');
          
          // Create public directory if it doesn't exist
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
          }
          
          // Copy the worker file if it exists and has changed
          if (fs.existsSync(pdfWorkerPath)) {
            // Only copy if target doesn't exist or source is newer
            if (!fs.existsSync(targetPath) || 
                fs.statSync(pdfWorkerPath).mtime > fs.statSync(targetPath).mtime) {
              fs.copyFileSync(pdfWorkerPath, targetPath);
              console.log('PDF worker file copied successfully');
            } else {
              console.log('PDF worker file is up to date');
            }
          } else {
            console.warn('PDF worker file not found at:', pdfWorkerPath);
          }

          // Copy cMaps if needed
          const cMapsDir = path.join(nodeModulesPath, 'pdfjs-dist', 'cmaps');
          const publicCMapsDir = path.join(publicDir, 'cmaps');
          
          if (fs.existsSync(cMapsDir)) {
            if (!fs.existsSync(publicCMapsDir)) {
              fs.mkdirSync(publicCMapsDir, { recursive: true });
            }
            fs.readdirSync(cMapsDir).forEach(file => {
              const srcPath = path.join(cMapsDir, file);
              const destPath = path.join(publicCMapsDir, file);
              if (!fs.existsSync(destPath) || 
                  fs.statSync(srcPath).mtime > fs.statSync(destPath).mtime) {
                fs.copyFileSync(srcPath, destPath);
              }
            });
            console.log('cMaps files copied successfully');
          }
        } catch (error) {
          console.error('Error copying PDF files:', error);
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