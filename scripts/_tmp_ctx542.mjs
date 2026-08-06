import { readFileSync, writeFileSync } from 'node:fs';

let t = readFileSync('CONTEXT.md', 'utf8');
t = t.replace(
  /## Now \(2026-08-0[56] · web `2026\.07-unified\.\d+`/,
  '## Now (2026-08-05 · web `2026.07-unified.542`'
);

const insert = [
  '- **`.542`:** Kalligator mascot replaces Scout (Victory + History).',
  '- **`.541`–`.540`:** Form Index honesty + OHP/pull-ups still re-wire.',
  '- **`.539`:** Security F1 — private gate accepts verified Bearer JWT.',
  '- **`.538`–`.532`:** Super Bundle depth + web-first UX (inventory, continuity, Coach why, Victory secondaries).',
  '- **`.531`–`.505`:** Mission Rewards + formatLocal* + full-launch honesty.',
  '- **`.504`–`.474`:** Coach/Today residual (detail in LOG).',
  '',
].join('\n');

const nowMatch = t.match(/## Now[\s\S]*?(?=\n## Read next|\n## [A-Z][a-z])/);
if (!nowMatch) {
  console.error('no Now block');
  process.exit(1);
}
let now = nowMatch[0];
const shipRe2 = /- \*\*`\.541`:\*\*[\s\S]*?- \*\*`\.499`–`\.474`:\*\*[^\n]*\n/;
if (shipRe2.test(now)) {
  now = now.replace(shipRe2, insert);
  console.log('replaced from 541');
} else {
  console.log('ship pattern miss');
  process.exit(1);
}
t = t.replace(nowMatch[0], now);
t = t.replace(/`\.505`–`\.\d+`/g, '`.505`–`.542`');
writeFileSync('CONTEXT.md', t);
const bullets = (now.match(/^- /gm) || []).length;
console.log('now bullets', bullets);
