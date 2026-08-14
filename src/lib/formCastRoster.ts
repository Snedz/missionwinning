/**
 * Library-wide Form Index cast roster (.736).
 *
 * Who appears: docs/MEDIA.md. Where we operate: src/lib/legal/supportedRegions.ts.
 * Representation ≠ service territory. Ethnicity is not a user-facing field.
 *
 * Rotation (not a collage on one card):
 *   slots a,b,c = three athletic bodies
 *   slot d     = modest dress, alternating hijab (even) / kippah+tzitzit (odd)
 *
 * Catalog 006 `squats` is the pilot exception: both hijab and kippah in one
 * set (founder example), plus two athletic stills already shipped.
 *
 * CAST_EXERCISE_IDS is the *shipped* set (files on disk). Remaining structured
 * guides stay on SVG / single side.webp until their cast files land.
 */

import type { FormCastMember } from '@/lib/formCast';

/** Ordered ids with shipped cast files under public/form/{id}/cast-*.webp */
export const CAST_EXERCISE_IDS = ['squats', 'push-ups', 'pull-ups'] as const;

const LETTERS = ['a', 'b', 'c', 'd'] as const;

const SQUATS_PILOT: readonly FormCastMember[] = [
  { id: 'a', dress: 'athletic' },
  { id: 'b', dress: 'athletic' },
  { id: 'c', dress: 'modest', markers: ['hijab'] },
  { id: 'd', dress: 'modest', markers: ['kippah', 'tzitzit'] },
];

function membersForIndex(index: number): FormCastMember[] {
  const modestEven = index % 2 === 0;
  return [
    { id: LETTERS[0], dress: 'athletic' },
    { id: LETTERS[1], dress: 'athletic' },
    { id: LETTERS[2], dress: 'athletic' },
    modestEven
      ? { id: LETTERS[3], dress: 'modest', markers: ['hijab'] }
      : { id: LETTERS[3], dress: 'modest', markers: ['kippah', 'tzitzit'] },
  ];
}

export function buildFormCastSets(): Record<string, readonly FormCastMember[]> {
  const out: Record<string, readonly FormCastMember[]> = {};
  CAST_EXERCISE_IDS.forEach((id, i) => {
    out[id] = id === 'squats' ? SQUATS_PILOT : membersForIndex(i);
  });
  return out;
}
