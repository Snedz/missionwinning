/**
 * Seed plus programs saved on this device. Not workout history.
 */

import { readJson, remove, writeJson } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { parseProgram } from './parse';
import { SEED_PROGRAM, SEED_PROGRAM_ID } from './seed';
import type { Program, ProgramEquipment, ProgramLevel } from './types';

interface ShellFile {
  programs: Program[];
}

function slugFromTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug || 'program';
}

export function readSavedPrograms(): Program[] {
  const raw = readJson<unknown>(STORAGE_KEYS.programShell, null);
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as { programs?: unknown }).programs)) {
    return [];
  }
  const out: Program[] = [];
  for (const row of (raw as { programs: unknown[] }).programs) {
    const program = parseProgram(row);
    if (program && program.id !== SEED_PROGRAM_ID) out.push(program);
  }
  return out;
}

/** Seed first, then device copies. The seed is not stored. */
export function listPrograms(): Program[] {
  return [SEED_PROGRAM, ...readSavedPrograms()];
}

export function saveProgram(program: Program): boolean {
  if (program.id === SEED_PROGRAM_ID) return false;
  const parsed = parseProgram(program);
  if (!parsed || parsed.id === SEED_PROGRAM_ID) return false;
  const rest = readSavedPrograms().filter((p) => p.id !== parsed.id);
  const file: ShellFile = { programs: [...rest, parsed] };
  return writeJson(STORAGE_KEYS.programShell, file);
}

export function clearSavedPrograms(): void {
  remove(STORAGE_KEYS.programShell);
}

export interface NewProgramInput {
  title: string;
  level: ProgramLevel;
  durationWeeks: number;
  sessionsPerWeek: number;
  equipment: ProgramEquipment[];
}

/**
 * A small template the athlete named. One squat pattern per session so it
 * can be browsed and started. Week count matches durationWeeks.
 */
export function buildLocalProgram(input: NewProgramInput, takenIds: readonly string[]): Program | null {
  const title = input.title.trim();
  if (!title) return null;
  const base = slugFromTitle(title);
  let id = `local-${base}`;
  let n = 2;
  while (takenIds.includes(id) || id === SEED_PROGRAM_ID) {
    id = `local-${base}-${n}`;
    n += 1;
    if (n > 50) return null;
  }
  const weeks = Array.from({ length: input.durationWeeks }, (_, w) => ({
    weekNumber: w + 1,
    title: `Week ${w + 1}`,
    sessions: Array.from({ length: input.sessionsPerWeek }, (_, s) => ({
      id: `${id}-w${w + 1}-s${s + 1}`,
      sessionNumber: s + 1,
      title: `Day ${s + 1}`,
      estimatedMinutes: 30,
      exercises: [
        {
          order: 1,
          exerciseId: 'squats',
          suggestedSets: [
            { setIndex: 1, reps: 8, weightKg: 0 },
            { setIndex: 2, reps: 8, weightKg: 0 },
            { setIndex: 3, reps: 8, weightKg: 0 },
          ],
        },
      ],
    })),
  }));
  return parseProgram({
    id,
    slug: base,
    title,
    description: 'Saved on this device. Suggested sets are a template, not a logged workout.',
    level: input.level,
    durationWeeks: input.durationWeeks,
    sessionsPerWeek: input.sessionsPerWeek,
    equipment: input.equipment,
    weeks,
  });
}
