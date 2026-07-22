#!/usr/bin/env npx tsx
/**
 * Generate public/magazine/beyond-the-basics[.lang].pdf from /guide/print.
 *
 * Prerequisites: app serving locally (or GUIDEBOOK_PDF_BASE_URL).
 *   npm run build && npm run start
 *   npm run build-guidebook-pdf
 *   GUIDEBOOK_PDF_LANGS=en,es,fr npm run build-guidebook-pdf
 *   GUIDEBOOK_PDF_LANGS=all npm run build-guidebook-pdf
 *
 * Optional:
 *   GUIDEBOOK_PDF_BASE_URL=https://www.missionwinning.com
 *   GUIDEBOOK_PDF_AUTO_SERVER=1
 *   GUIDEBOOK_PDF_LANGS=en,es  — comma list (default: en)
 */
import { mkdirSync, readFileSync, statSync, copyFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawn, type ChildProcess } from 'child_process';
import { chromium } from 'playwright';
import { createServer } from 'net';
import { APP_LANGS } from '../src/i18n/appLangs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'magazine');

const MIN_BYTES = 80_000;
const MIN_PAGES = 12;
const MAX_PAGES = 36;

function countPdfPages(buf: Buffer): number {
  const pageObjs = buf.toString('latin1').match(/\/Type\s*\/Page(?!s)\b/g);
  return pageObjs?.length ?? 0;
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = createServer();
    s.listen(0, '127.0.0.1', () => {
      const addr = s.address();
      if (!addr || typeof addr === 'string') {
        s.close();
        reject(new Error('Could not allocate port'));
        return;
      }
      const { port } = addr;
      s.close((err) => (err ? reject(err) : resolve(port)));
    });
    s.on('error', reject);
  });
}

async function waitForUrl(url: string, timeoutMs = 90_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function maybeStartServer(): Promise<{ base: string; child: ChildProcess | null }> {
  const envBase = process.env.GUIDEBOOK_PDF_BASE_URL?.replace(/\/$/, '');
  if (envBase) return { base: envBase, child: null };
  if (process.env.GUIDEBOOK_PDF_AUTO_SERVER === '1') {
    const port = await freePort();
    const base = `http://127.0.0.1:${port}`;
    const child = spawn('npx', ['next', 'start', '-p', String(port)], {
      cwd: root,
      env: { ...process.env, PRIVATE_MODE: 'false' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    await waitForUrl(`${base}/guide/print`);
    return { base, child };
  }
  return { base: 'http://127.0.0.1:3000', child: null };
}

function resolveLangs(): string[] {
  const raw = process.env.GUIDEBOOK_PDF_LANGS?.trim();
  if (!raw) return ['en'];
  if (raw === 'all') return [...APP_LANGS];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function outPathFor(lang: string): string {
  return lang === 'en'
    ? join(outDir, 'beyond-the-basics.pdf')
    : join(outDir, `beyond-the-basics.${lang}.pdf`);
}

async function renderLang(base: string, lang: string): Promise<void> {
  const printUrl = `${base}/guide/print?lang=${lang}`;
  const outPath = outPathFor(lang);
  console.log(`Opening ${printUrl}`);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const res = await page.goto(printUrl, { waitUntil: 'networkidle', timeout: 90_000 });
    if (!res || !res.ok()) {
      throw new Error(
        `Failed to load ${printUrl} (status ${res?.status() ?? 'none'}). Is the app running?`
      );
    }
    await page.waitForSelector('.magazine-document', { timeout: 30_000 });
    await page.waitForTimeout(1500);
    await page.emulateMedia({ media: 'print' });
    await page.addStyleTag({
      content: `.no-print { display: none !important; }`,
    });

    await page.pdf({
      path: outPath,
      format: 'Letter',
      printBackground: true,
      tagged: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width:100%;font-size:8px;font-family:ui-monospace,monospace;color:#5c6570;padding:0 0.65in;display:flex;justify-content:space-between;">
          <span>Beyond the Basics · Mission Winning</span>
          <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>
      `,
    });

    const st = statSync(outPath);
    const buf = readFileSync(outPath);
    const pages = countPdfPages(buf);
    console.log(`Wrote ${outPath} (${st.size} bytes, ~${pages} pages)`);

    if (st.size < MIN_BYTES) {
      throw new Error(`PDF too small (${st.size} bytes). Expected >= ${MIN_BYTES}.`);
    }
    if (pages < MIN_PAGES || pages > MAX_PAGES) {
      throw new Error(
        `PDF page count out of range (~${pages}). Expected ${MIN_PAGES}–${MAX_PAGES}.`
      );
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const { base, child } = await maybeStartServer();
  const langs = resolveLangs();
  try {
    for (const lang of langs) {
      await renderLang(base, lang);
    }
    const enPath = outPathFor('en');
    try {
      statSync(enPath);
    } catch {
      const first = outPathFor(langs[0]);
      copyFileSync(first, enPath);
      console.log(`Copied ${first} → ${enPath}`);
    }
  } finally {
    if (child) child.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
