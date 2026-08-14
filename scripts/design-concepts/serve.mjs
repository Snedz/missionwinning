#!/usr/bin/env node
/**
 * Local design studio. Serves `docs/design/` on a fixed port so the concept
 * board, the 04 landing, the studio sheet and the stills share one origin.
 *
 * Not the live site. Does not replace `/` or `/start`.
 *
 * Run: npm run design:concepts
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
export const DESIGN_DIR = path.join(ROOT, 'docs/design');
export const CONCEPTS_DIR = path.join(DESIGN_DIR, 'concepts');
export const HOST = '127.0.0.1';
export const PORT = Number(process.env.DESIGN_CONCEPTS_PORT || 4177);
export const WWW_CONTROL = 'http://localhost:4321';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
};

/**
 * Serve `docs/design/` (concepts + stills). Port 0 is for the stills script
 * so it does not collide with a studio the reviewer already has open.
 */
export function serveDesign({ port = 0, host = HOST } = {}) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent((req.url || '/').split('?')[0]);
      if (rel === '/' || rel === '') {
        res.writeHead(302, { Location: '/concepts/studio.html' });
        res.end();
        return;
      }
      const file = path.normalize(path.join(DESIGN_DIR, rel));
      const root = DESIGN_DIR.endsWith(path.sep) ? DESIGN_DIR : DESIGN_DIR + path.sep;
      if (file !== DESIGN_DIR && !file.startsWith(root)) return void res.writeHead(403).end();

      const candidates = rel.endsWith('/')
        ? [path.join(file, 'index.html')]
        : [file, path.join(file, 'index.html'), `${file}.html`];

      const tryNext = (i) => {
        if (i >= candidates.length) return void res.writeHead(404).end();
        const candidate = candidates[i];
        fs.stat(candidate, (err, st) => {
          if (err || !st.isFile()) return void tryNext(i + 1);
          fs.readFile(candidate, (readErr, body) => {
            if (readErr) return void tryNext(i + 1);
            res.writeHead(200, {
              'content-type': MIME[path.extname(candidate)] || 'application/octet-stream',
            });
            res.end(body);
          });
        });
      };
      tryNext(0);
    });
    server.on('error', reject);
    server.listen(port, host, () => resolve(server));
  });
}

function originOf(server) {
  return `http://${HOST}:${server.address().port}`;
}

export function printStudioUrls(origin) {
  console.log(`
Not live — design studio. Does not replace / or /start.

  Studio:     ${origin}/  →  ${origin}/concepts/studio.html
  Board:      ${origin}/concepts/
  Proposed:   ${origin}/concepts/04-combined.html
  Control:    ${WWW_CONTROL}/start   (npm run www — skip if it is not running)

Open 390×844 and 1440×900. Stills land in docs/design/ (npm run design:stills).
`);
}

async function main() {
  const landing = path.join(CONCEPTS_DIR, '04-combined.html');
  if (!fs.existsSync(landing)) {
    console.error(
      '\n✗ docs/design/concepts/04-combined.html is missing.\n' +
        '  Run `npx tsx scripts/design-concepts/build.mts` first.\n',
    );
    process.exit(1);
  }
  let server;
  try {
    server = await serveDesign({ port: PORT });
  } catch (err) {
    if (err && err.code === 'EADDRINUSE') {
      console.error(
        `\n✗ ${HOST}:${PORT} is already in use.\n` +
          '  That is the studio port on purpose — a drifting port is a URL nobody can share.\n' +
          '  Stop the other process, or set DESIGN_CONCEPTS_PORT.\n',
      );
      process.exit(1);
    }
    throw err;
  }
  printStudioUrls(originOf(server));
}

const isMain =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
