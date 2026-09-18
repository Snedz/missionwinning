#!/usr/bin/env node
/**
 * Deterministic Open Plate generator. Original geometry only.
 * Writes interiors/plates/plate-01.svg … plate-12.svg
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, 'plates');

const W = 765;
const H = 990;
const STROKE = '#111111';
const SW = 2.2;

function svg(body, title) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">
  <title>${title}</title>
  <rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>
  <rect x="36" y="36" width="${W - 72}" height="${H - 72}" fill="none" stroke="${STROKE}" stroke-width="1.4"/>
  ${body}
</svg>
`;
}

function hexGrid() {
  const r = 42;
  const h = r * Math.sqrt(3);
  let d = '';
  for (let row = 0; row < 14; row++) {
    for (let col = 0; col < 12; col++) {
      const cx = 90 + col * (r * 1.5) + (row % 2 ? r * 0.75 : 0);
      const cy = 90 + row * (h * 0.5);
      if (cx < 70 || cx > W - 70 || cy < 70 || cy > H - 70) continue;
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
      }
      d += `<polygon points="${pts.join(' ')}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
    }
  }
  return svg(d, 'Open Plate 01 — nested hex grid');
}

function vine() {
  let d = '';
  const stem = [];
  for (let t = 0; t <= 20; t++) {
    const y = 80 + t * 42;
    const x = 382 + Math.sin(t * 0.55) * 90;
    stem.push(`${t === 0 ? 'M' : 'L'}${x} ${y}`);
  }
  d += `<path d="${stem.join(' ')}" fill="none" stroke="${STROKE}" stroke-width="${SW + 0.6}"/>`;
  for (let t = 1; t <= 18; t++) {
    const y = 80 + t * 42;
    const x = 382 + Math.sin(t * 0.55) * 90;
    const side = t % 2 === 0 ? 1 : -1;
    const lx = x + side * 120;
    const ly = y - 18;
    d += `<path d="M${x} ${y} Q${x + side * 50} ${y - 40} ${lx} ${ly}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
    d += `<ellipse cx="${lx}" cy="${ly}" rx="28" ry="16" transform="rotate(${side * 25} ${lx} ${ly})" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
    d += `<path d="M${lx} ${ly} l${side * 18} -8" fill="none" stroke="${STROKE}" stroke-width="1.4"/>`;
  }
  return svg(d, 'Open Plate 02 — climbing vine');
}

function windows() {
  let d = '';
  const cols = 4;
  const rows = 5;
  const gw = 140;
  const gh = 150;
  const ox = (W - cols * gw) / 2;
  const oy = 80;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ox + c * gw;
      const y = oy + r * gh;
      d += `<rect x="${x}" y="${y}" width="${gw - 16}" height="${gh - 16}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
      d += `<rect x="${x + 10}" y="${y + 10}" width="${gw - 36}" height="${gh - 36}" fill="none" stroke="${STROKE}" stroke-width="1.6"/>`;
      const panes = r % 2 === 0 ? 2 : 3;
      for (let p = 1; p < panes; p++) {
        const px = x + 10 + ((gw - 36) * p) / panes;
        d += `<line x1="${px}" y1="${y + 10}" x2="${px}" y2="${y + gh - 26}" stroke="${STROKE}" stroke-width="1.6"/>`;
      }
      d += `<line x1="${x + 10}" y1="${y + (gh - 16) / 2}" x2="${x + gw - 26}" y2="${y + (gh - 16) / 2}" stroke="${STROKE}" stroke-width="1.6"/>`;
      d += `<path d="M${x + 8} ${y + 8} h${gw - 32} v8 h-${gw - 32} z" fill="none" stroke="${STROKE}" stroke-width="1.4"/>`;
    }
  }
  return svg(d, 'Open Plate 03 — window grid');
}

function waves() {
  let d = '';
  for (let i = 0; i < 18; i++) {
    const y0 = 90 + i * 46;
    let p = `M 70 ${y0}`;
    for (let x = 70; x <= W - 70; x += 8) {
      const y = y0 + Math.sin((x + i * 18) / 42) * (16 + (i % 4) * 4);
      p += ` L ${x} ${y}`;
    }
    d += `<path d="${p}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
  }
  for (let k = 0; k < 7; k++) {
    const cx = 140 + k * 80;
    const cy = 200 + (k % 3) * 220;
    d += `<circle cx="${cx}" cy="${cy}" r="28" fill="none" stroke="${STROKE}" stroke-width="1.6"/>`;
    d += `<circle cx="${cx}" cy="${cy}" r="14" fill="none" stroke="${STROKE}" stroke-width="1.6"/>`;
  }
  return svg(d, 'Open Plate 04 — wave bands');
}

function stars() {
  let d = '';
  const step = 92;
  for (let y = 100; y <= H - 100; y += step) {
    for (let x = 100; x <= W - 100; x += step) {
      const odd = Math.round(x / step + y / step) % 2;
      const r = odd ? 34 : 26;
      const pts = [];
      const n = odd ? 8 : 6;
      for (let i = 0; i < n * 2; i++) {
        const rad = i % 2 === 0 ? r : r * 0.45;
        const a = (Math.PI * i) / n - Math.PI / 2;
        pts.push(`${x + rad * Math.cos(a)},${y + rad * Math.sin(a)}`);
      }
      d += `<polygon points="${pts.join(' ')}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
    }
  }
  return svg(d, 'Open Plate 05 — star tiling');
}

function radialLeaves() {
  const cx = W / 2;
  const cy = H / 2;
  let d = `<circle cx="${cx}" cy="${cy}" r="28" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
  for (let ring = 0; ring < 6; ring++) {
    const n = 8 + ring * 4;
    const rad = 70 + ring * 58;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + ring * 0.12;
      const x = cx + rad * Math.cos(a);
      const y = cy + rad * Math.sin(a);
      const rot = (a * 180) / Math.PI;
      d += `<ellipse cx="${x}" cy="${y}" rx="${22 + ring}" ry="11" transform="rotate(${rot} ${x} ${y})" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
    }
  }
  return svg(d, 'Open Plate 06 — radial leaves');
}

function blocks() {
  let d = '';
  for (let i = 0; i < 36; i++) {
    const col = i % 6;
    const row = Math.floor(i / 6);
    const x = 80 + col * 104;
    const y = 80 + row * 140;
    const w = 88;
    const h = 70 + (i % 5) * 10;
    d += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
    d += `<polygon points="${x},${y} ${x + 18},${y - 16} ${x + w + 18},${y - 16} ${x + w},${y}" fill="none" stroke="${STROKE}" stroke-width="1.6"/>`;
    d += `<polygon points="${x + w},${y} ${x + w + 18},${y - 16} ${x + w + 18},${y + h - 16} ${x + w},${y + h}" fill="none" stroke="${STROKE}" stroke-width="1.6"/>`;
    const floors = 2 + (i % 3);
    for (let f = 1; f < floors; f++) {
      d += `<line x1="${x}" y1="${y + (h * f) / floors}" x2="${x + w}" y2="${y + (h * f) / floors}" stroke="${STROKE}" stroke-width="1.3"/>`;
    }
  }
  return svg(d, 'Open Plate 07 — block plan');
}

function flowerWheel() {
  const cx = W / 2;
  const cy = H / 2;
  let d = '';
  for (let ring = 5; ring >= 1; ring--) {
    const n = ring * 8;
    const rad = ring * 62;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n;
      const x = cx + rad * Math.cos(a);
      const y = cy + rad * Math.sin(a);
      d += `<circle cx="${x}" cy="${y}" r="${18 + ring * 2}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
    }
  }
  d += `<circle cx="${cx}" cy="${cy}" r="46" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
  d += `<circle cx="${cx}" cy="${cy}" r="16" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
  return svg(d, 'Open Plate 08 — flower wheel');
}

function ridges() {
  let d = '';
  const peaks = [120, 200, 160, 280, 140, 240, 180, 300, 150, 220];
  for (let band = 0; band < 8; band++) {
    let p = `M 70 ${880 - band * 90}`;
    for (let i = 0; i < peaks.length; i++) {
      const x = 70 + i * ((W - 140) / (peaks.length - 1));
      const y = 880 - band * 90 - peaks[i] * (0.35 + band * 0.04);
      p += ` L ${x} ${y}`;
    }
    p += ` L ${W - 70} ${880 - band * 40} L 70 ${880 - band * 40} Z`;
    d += `<path d="${p}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
  }
  return svg(d, 'Open Plate 09 — ridgelines');
}

function interlace() {
  let d = '';
  const s = 70;
  for (let y = 90; y < H - 90; y += s) {
    for (let x = 90; x < W - 90; x += s) {
      d += `<path d="M${x} ${y + 20} C${x + 30} ${y - 10}, ${x + 40} ${y + 50}, ${x + 70} ${y + 20}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
      d += `<path d="M${x + 20} ${y} C${x - 10} ${y + 30}, ${x + 50} ${y + 40}, ${x + 20} ${y + 70}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
      d += `<circle cx="${x + 35}" cy="${y + 35}" r="8" fill="none" stroke="${STROKE}" stroke-width="1.5"/>`;
    }
  }
  return svg(d, 'Open Plate 10 — interlace');
}

function circlePack() {
  let d = '';
  const rings = [1, 6, 12, 18, 24];
  const cx = W / 2;
  const cy = H / 2;
  rings.forEach((n, ri) => {
    const rad = ri === 0 ? 0 : 70 + (ri - 1) * 78;
    const r = 34 - ri * 2;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + ri * 0.08;
      const x = cx + rad * Math.cos(a);
      const y = cy + rad * Math.sin(a);
      d += `<circle cx="${x}" cy="${y}" r="${Math.max(16, r)}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
      if (ri > 1) {
        d += `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="${STROKE}" stroke-width="1.4"/>`;
      }
    }
  });
  return svg(d, 'Open Plate 11 — circle pack');
}

function fern() {
  const cx = 200;
  let d = `<path d="M${cx} 80 L${cx} 910" fill="none" stroke="${STROKE}" stroke-width="${SW + 0.8}"/>`;
  for (let i = 0; i < 22; i++) {
    const y = 110 + i * 36;
    const len = 80 + (21 - i) * 14;
    const side = i % 2 === 0 ? 1 : -1;
    const x2 = cx + side * len;
    d += `<path d="M${cx} ${y} Q${cx + side * (len * 0.45)} ${y - 28} ${x2} ${y - 6}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
    for (let k = 1; k <= 5; k++) {
      const t = k / 6;
      const bx = cx + side * len * t;
      const by = y - 28 * t * (1 - t) * 2 - 6 * t;
      d += `<path d="M${bx} ${by} q${side * 18} -12 ${side * 28} 4" fill="none" stroke="${STROKE}" stroke-width="1.5"/>`;
    }
  }
  d += `<path d="M${cx} 80 q40 -30 70 10" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
  return svg(d, 'Open Plate 12 — fern unfurl');
}

const plates = [
  hexGrid,
  vine,
  windows,
  waves,
  stars,
  radialLeaves,
  blocks,
  flowerWheel,
  ridges,
  interlace,
  circlePack,
  fern,
];

mkdirSync(outDir, { recursive: true });
plates.forEach((fn, i) => {
  const name = `plate-${String(i + 1).padStart(2, '0')}.svg`;
  writeFileSync(path.join(outDir, name), fn());
});
console.log(`wrote ${plates.length} plates → ${outDir}`);
