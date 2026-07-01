/** Pure authorization rules for school class cloud upsert (testable). */

export type SchoolClassRow = {
  code: string;
  name: string;
  created_by: string | null;
  teacher_pin: string | null;
};

export type SchoolClassUpsertAuth =
  | { allowed: true; claimCreator?: boolean }
  | { allowed: false; reason: 'forbidden' | 'pin_mismatch' };

export function authorizeSchoolClassUpsert(
  existing: SchoolClassRow | null,
  userId: string,
  teacherPin?: string | null
): SchoolClassUpsertAuth {
  if (!existing) return { allowed: true };

  if (existing.created_by === userId) return { allowed: true };

  if (existing.created_by && existing.created_by !== userId) {
    const pin = teacherPin?.trim() ?? '';
    if (pin && existing.teacher_pin === pin) return { allowed: true };
    return { allowed: false, reason: 'forbidden' };
  }

  const pin = teacherPin?.trim() ?? '';
  if (existing.teacher_pin && pin && existing.teacher_pin !== pin) {
    return { allowed: false, reason: 'pin_mismatch' };
  }

  return { allowed: true, claimCreator: true };
}
