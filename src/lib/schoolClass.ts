/** School / PE class codes — local join + optional cloud sync via Supabase. */

import { saveSquadCode } from '@/lib/leaderboard/boards';

const JOINED_CLASS_KEY = 'mw_class_code';
const TEACHER_CLASSES_KEY = 'mw_teacher_classes';

export type TeacherClassRecord = {
  code: string;
  name: string;
  createdAt: string;
  teacherPin: string;
};

const TEACHER_PIN_PREFIX = 'mw_teacher_pin_';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function normalizeClassCode(raw: string): string | null {
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length < 4) return null;
  const body = cleaned.startsWith('MW') ? cleaned.slice(2) : cleaned;
  const suffix = body.slice(0, 6);
  if (suffix.length < 4) return null;
  return `MW${suffix.slice(0, 6)}`;
}

export function generateClassCode(): string {
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return `MW${suffix}`;
}

export function getJoinedClassCode(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(JOINED_CLASS_KEY);
  if (!raw) return null;
  return normalizeClassCode(raw);
}

export function joinClass(rawCode: string): string | null {
  const code = normalizeClassCode(rawCode);
  if (!code || typeof window === 'undefined') return null;
  localStorage.setItem(JOINED_CLASS_KEY, code);
  saveSquadCode(code);
  return code;
}

export function leaveClass(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(JOINED_CLASS_KEY);
}

export function loadTeacherClasses(): TeacherClassRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TEACHER_CLASSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TeacherClassRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function generateTeacherPin(): string {
  return String(100000 + Math.floor(Math.random() * 900000));
}

export function saveTeacherPin(code: string, pin: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${TEACHER_PIN_PREFIX}${code}`, pin);
}

export function getTeacherPin(code: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`${TEACHER_PIN_PREFIX}${code}`);
}

export function teacherDashboardUrl(code: string, pin: string, baseUrl?: string): string {
  const origin =
    baseUrl ??
    (typeof window !== 'undefined' ? window.location.origin : 'https://www.missionwinning.com');
  return `${origin.replace(/\/$/, '')}/school/class/${code}?pin=${encodeURIComponent(pin)}`;
}

export function saveTeacherClass(name: string, code?: string): TeacherClassRecord {
  const normalized = code ? normalizeClassCode(code) ?? generateClassCode() : generateClassCode();
  const teacherPin = generateTeacherPin();
  const record: TeacherClassRecord = {
    code: normalized,
    name: name.trim() || 'PE Class',
    createdAt: new Date().toISOString(),
    teacherPin,
  };
  if (typeof window === 'undefined') return record;
  const existing = loadTeacherClasses().filter((c) => c.code !== record.code);
  localStorage.setItem(TEACHER_CLASSES_KEY, JSON.stringify([record, ...existing].slice(0, 10)));
  saveTeacherPin(record.code, teacherPin);
  return record;
}

export function classJoinUrl(code: string, baseUrl?: string): string {
  const normalized = normalizeClassCode(code);
  if (!normalized) return '/america';
  const origin =
    baseUrl ??
    (typeof window !== 'undefined' ? window.location.origin : 'https://www.missionwinning.com');
  return `${origin.replace(/\/$/, '')}/join/class/${normalized}`;
}
