import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function photoUploadPlugin(): Plugin {
  return {
    name: 'photo-upload-plugin',
    configureServer(server) {
      server.middlewares.use('/api/upload-photo', (req, res) => {
        if (req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk: Buffer) => chunks.push(chunk));
          req.on('end', () => {
            const buffer = Buffer.concat(chunks);
            try {
              const pubDir = path.resolve(__dirname, 'public');
              if (!fs.existsSync(pubDir)) {
                fs.mkdirSync(pubDir, { recursive: true });
              }
              fs.writeFileSync(path.join(pubDir, 'IMG_3213.jpg'), buffer);
              fs.writeFileSync(path.join(pubDir, 'IMG_3213.JPG'), buffer);
              fs.writeFileSync(path.join(pubDir, 'our-photo.jpg'), buffer);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, path: '/IMG_3213.jpg' }));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
        } else {
          res.writeHead(405).end();
        }
      });
    },
  };
}

function wishesApiPlugin(): Plugin {
  return {
    name: 'wishes-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/wishes', (req, res) => {
        const pubDir = path.resolve(__dirname, 'public');
        if (!fs.existsSync(pubDir)) {
          fs.mkdirSync(pubDir, { recursive: true });
        }
        const wishesFile = path.join(pubDir, 'wishes.json');

        if (req.method === 'GET') {
          try {
            if (fs.existsSync(wishesFile)) {
              const data = fs.readFileSync(wishesFile, 'utf-8');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(data || '[]');
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end('[]');
            }
          } catch (e) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end('[]');
          }
          return;
        }

        if (req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk: Buffer) => chunks.push(chunk));
          req.on('end', () => {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
              let list = [];
              if (fs.existsSync(wishesFile)) {
                try {
                  list = JSON.parse(fs.readFileSync(wishesFile, 'utf-8') || '[]');
                } catch {
                  list = [];
                }
              }
              const newEntry = {
                id: Date.now().toString(),
                wish: body.wish || '',
                date: body.date || new Date().toLocaleString()
              };
              list.unshift(newEntry);
              fs.writeFileSync(wishesFile, JSON.stringify(list, null, 2));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, entry: newEntry, count: list.length }));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
          return;
        }

        res.writeHead(405).end();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), photoUploadPlugin(), wishesApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
