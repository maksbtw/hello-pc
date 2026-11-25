import { defineConfig, type Plugin } from 'vite';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Dev-only render lab for the hero art. Not part of the app build. Run with the "lab"
 * launch config, then open /board/ (motherboard) or /retro/ (retro computer).
 * POST /__save?name=… writes renders into public/hero/ and hero metadata (*.json) into
 * src/points/, where the app imports it.
 */
const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../public/hero');
const srcDir = resolve(here, '../src/points');

function saveEndpoint(): Plugin {
  return {
    name: 'lab-save',
    configureServer(server) {
      server.middlewares.use('/__save', (req, res) => {
        const name = new URL(req.url ?? '', 'http://x').searchParams.get('name') ?? '';
        if (req.method !== 'POST' || !/^[\w.-]+\.(webp|png|json)$/.test(name)) {
          res.statusCode = 400;
          res.end('bad request');
          return;
        }
        const chunks: Buffer[] = [];
        req.on('data', (c: Buffer) => chunks.push(c));
        req.on('end', () => {
          mkdirSync(outDir, { recursive: true });
          const buf = Buffer.concat(chunks);
          const dir = name.endsWith('.json') && !name.startsWith('_') ? srcDir : outDir;
          writeFileSync(resolve(dir, name), buf);
          res.end(`saved ${name} ${buf.length}`);
        });
      });
    },
  };
}

export default defineConfig({
  root: here,
  publicDir: resolve(here, '../public'),
  plugins: [saveEndpoint()],
  server: { port: 5180, strictPort: true },
});
