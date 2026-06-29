/**
 * Removes pro category programs from client programTemplates.ts
 * Run after generate-premium-programs.ts
 */
import { readFileSync, writeFileSync } from 'fs';
import { PROGRAM_TEMPLATES } from '../src/data/programTemplates';

const free = PROGRAM_TEMPLATES.filter((p) => p.category !== 'pro');
console.log(`Keeping ${free.length} client templates (removed ${PROGRAM_TEMPLATES.length - free.length} pro)`);

// Re-read source and remove pro blocks by line-based approach using IDs
const src = readFileSync('src/data/programTemplates.ts', 'utf8');
const proIds = new Set(PROGRAM_TEMPLATES.filter((p) => p.category === 'pro').map((p) => p.id));

// Split on program objects - simpler: use regex to remove blocks starting with id: "pro- or adv-intensity
let result = src;
for (const id of proIds) {
  const pattern = new RegExp(
    `\\n  \\{\\n    id: "${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?\\n  \\},`,
    'g'
  );
  result = result.replace(pattern, '');
}

// Remove orphaned Pro section comment
result = result.replace(/\n  \/\/ ─── Pro ───[^\n]*\n/g, '\n');

writeFileSync('src/data/programTemplates.ts', result);
console.log('Updated src/data/programTemplates.ts');
