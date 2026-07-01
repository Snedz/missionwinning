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
  options?: { pinVerified?: boolean }
): SchoolClassUpsertAuth {
  if (!existing) return { allowed: true };

  if (existing.created_by === userId) return { allowed: true };

  if (existing.created_by && existing.created_by !== userId) {
    return options?.pinVerified ? { allowed: true } : { allowed: false, reason: 'forbidden' };
  }

  if (existing.teacher_pin && !options?.pinVerified) {
    return { allowed: false, reason: 'pin_mismatch' };
  }

  return { allowed: true, claimCreator: true };
}
