/**
 * One-shot generator: extracts pro programs from programTemplates into server-only module.
 * Run: npx tsx scripts/generate-premium-programs.ts
 */
import { writeFileSync } from 'fs';
import { PROGRAM_TEMPLATES, type ProgramTemplate } from '../src/data/programTemplates';

function formatEx(exerciseId: string, setCount: number, reps: number, weight = 0): string {
  return weight
    ? `ex("${exerciseId}", ${setCount}, ${reps}, ${weight})`
    : `ex("${exerciseId}", ${setCount}, ${reps})`;
}

function formatProgram(p: ProgramTemplate, indent: string): string {
  const lines: string[] = [];
  lines.push(`${indent}{`);
  lines.push(`${indent}  id: ${JSON.stringify(p.id)},`);
  lines.push(`${indent}  name: ${JSON.stringify(p.name)},`);
  lines.push(`${indent}  category: "pro",`);
  lines.push(`${indent}  description: ${JSON.stringify(p.description)},`);
  lines.push(`${indent}  duration: ${JSON.stringify(p.duration)},`);
  lines.push(`${indent}  focus: ${JSON.stringify(p.focus)},`);
  if (p.tags?.length) {
    lines.push(`${indent}  tags: ${JSON.stringify(p.tags)},`);
  }
  lines.push(`${indent}  sessions: [`);
  for (const s of p.sessions) {
    lines.push(`${indent}    {`);
    lines.push(`${indent}      id: ${JSON.stringify(s.id)},`);
    lines.push(`${indent}      name: ${JSON.stringify(s.name)},`);
    if (s.weekLabel) lines.push(`${indent}      weekLabel: ${JSON.stringify(s.weekLabel)},`);
    if (s.notes) lines.push(`${indent}      notes: ${JSON.stringify(s.notes)},`);
    lines.push(`${indent}      exercises: [`);
    for (const e of s.exercises) {
      const reps = e.sets[0]?.reps ?? 0;
      const weight = e.sets[0]?.weight ?? 0;
      lines.push(`${indent}        ${formatEx(e.exerciseId, e.sets.length, reps, weight)},`);
    }
    lines.push(`${indent}      ],`);
    lines.push(`${indent}    },`);
  }
  lines.push(`${indent}  ],`);
  lines.push(`${indent}},`);
  return lines.join('\n');
}

const proPrograms = PROGRAM_TEMPLATES.filter((p) => p.category === 'pro');

const body = `import 'server-only';
import type { WorkoutExerciseTemplate } from '@/types';
import type { ProgramTemplate } from '@/data/programTemplates';

function sets(count: number, reps: number, weight = 0): WorkoutExerciseTemplate['sets'] {
  return Array.from({ length: count }, () => ({ reps, weight }));
}

function ex(exerciseId: string, setCount: number, reps: number, weight = 0): WorkoutExerciseTemplate {
  return { exerciseId, sets: sets(setCount, reps, weight) };
}

/** Pro program templates — server-only; served via /api/premium/programs */
export const PREMIUM_PROGRAM_TEMPLATES: ProgramTemplate[] = [
${proPrograms.map((p) => formatProgram(p, '  ')).join('\n')}
];

export function getPremiumProgramTemplates(): ProgramTemplate[] {
  return PREMIUM_PROGRAM_TEMPLATES;
}
`;

writeFileSync('src/data/premiumProgramTemplates.ts', body);
console.log(`Wrote ${proPrograms.length} pro programs to src/data/premiumProgramTemplates.ts`);
