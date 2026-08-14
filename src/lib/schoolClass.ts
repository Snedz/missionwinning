/** School / PE class codes — local join + optional cloud sync via Supabase. */

import { americaHomeOrFallback } from '@/lib/americaConfig';
import { saveSquadCode } from '@/lib/leaderboard/boards';
import { STORAGE_KEYS, STORAGE_KEY_PREFIXES } from '@/lib/storage/keys';
import { readJson, readRaw, remove, writeJson, writeRaw } from '@/lib/storage/safeStorage';

const JOINED_CLASS_KEY = STORAGE_KEYS.classCode;
const TEACHER_CLASSES_KEY = STORAGE_KEYS.teacherClasses;

export type TeacherClassRecord = {
  code: string;
  name: string;
  createdAt: string;
  teacherPin: string;
};

const TEACHER_PIN_PREFIX = STORAGE_KEY_PREFIXES.teacherPin;

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
  const arr = new Uint8Array(4);
  crypto.getRandomValues(arr);
  for (let i = 0; i < 4; i++) {
    suffix += CODE_CHARS[arr[i] % CODE_CHARS.length];
  }
  return `MW${suffix}`;
}

export function getJoinedClassCode(): string | null {
  const raw = readRaw(JOINED_CLASS_KEY);
  if (!raw) return null;
  return normalizeClassCode(raw);
}

export function joinClass(rawCode: string): string | null {
  const code = normalizeClassCode(rawCode);
  if (!code) return null;
  writeRaw(JOINED_CLASS_KEY, code);
  saveSquadCode(code);
  return code;
}

export function leaveClass(): void {
  remove(JOINED_CLASS_KEY);
}

export function loadTeacherClasses(): TeacherClassRecord[] {
  const parsed = readJson<TeacherClassRecord[]>(TEACHER_CLASSES_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function generateTeacherPin(): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(100000 + (arr[0] % 900000));
}

export function saveTeacherPin(code: string, pin: string): void {
  writeRaw(`${TEACHER_PIN_PREFIX}${code}`, pin);
}

export function getTeacherPin(code: string): string | null {
  return readRaw(`${TEACHER_PIN_PREFIX}${code}`);
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
  const existing = loadTeacherClasses().filter((c) => c.code !== record.code);
  writeJson(TEACHER_CLASSES_KEY, [record, ...existing].slice(0, 10));
  saveTeacherPin(record.code, teacherPin);
  return record;
}

export function mergeCloudTeacherClass(record: {
  code: string;
  name: string;
  teacherPin: string | null;
  createdAt: string;
}): void {
  if (!record.teacherPin) return;
  const code = normalizeClassCode(record.code);
  if (!code) return;
  saveTeacherPin(code, record.teacherPin);
  const local: TeacherClassRecord = {
    code,
    name: record.name.trim() || 'PE Class',
    createdAt: record.createdAt,
    teacherPin: record.teacherPin,
  };
  const existing = loadTeacherClasses().filter((c) => c.code !== code);
  writeJson(TEACHER_CLASSES_KEY, [local, ...existing].slice(0, 10));
}

export function teacherDashboardUrl(code: string, pin: string, baseUrl?: string): string {
  const origin =
    baseUrl ??
    (typeof window !== 'undefined' ? window.location.origin : 'https://www.missionwinning.com');
  return `${origin.replace(/\/$/, '')}/school/class/${code}?pin=${encodeURIComponent(pin)}`;
}

export function classJoinUrl(code: string, baseUrl?: string): string {
  const normalized = normalizeClassCode(code);
  if (!normalized) return americaHomeOrFallback();
  const origin =
    baseUrl ??
    (typeof window !== 'undefined' ? window.location.origin : 'https://www.missionwinning.com');
  return `${origin.replace(/\/$/, '')}/join/class/${normalized}`;
}
