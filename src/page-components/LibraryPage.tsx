'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Dumbbell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { EXERCISES, getExerciseById } from '@/data/exercises';
import { PROGRAM_TAG_LABELS } from '@/data/exerciseEnrichment';
import { useWorkoutStore } from '@/store/workoutStore';
import { usePremium } from '@/hooks/usePremium';
import type { ProgramTag } from '@/types';

const TAG_OPTIONS: { value: ProgramTag | ''; labelKey: string }[] = [
  { value: '', labelKey: 'libraryTagAll' },
  { value: 'strength', labelKey: 'libraryTagStrength' },
  { value: 'hypertrophy', labelKey: 'libraryTagHypertrophy' },
  { value: 'conditioning', labelKey: 'libraryTagConditioning' },
  { value: 'corrective', labelKey: 'libraryTagCorrective' },
];

const EQUIP_OPTIONS: { value: string; labelKey: string }[] = [
  { value: '', labelKey: 'libraryEquipAll' },
  { value: 'bodyweight', labelKey: 'libraryEquipBodyweight' },
  { value: 'dumbbell', labelKey: 'libraryEquipDumbbell' },
  { value: 'barbell', labelKey: 'libraryEquipBarbell' },
  { value: 'cable', labelKey: 'libraryEquipCable' },
  { value: 'band', labelKey: 'libraryEquipBand' },
  { value: 'kettlebell', labelKey: 'libraryEquipKettlebell' },
];

const LEVEL_OPTIONS: { value: string; labelKey: string }[] = [
  { value: '', labelKey: 'libraryLevelAll' },
  { value: 'beginner', labelKey: 'libraryLevelBeginner' },
  { value: 'intermediate', labelKey: 'libraryLevelIntermediate' },
  { value: 'advanced', labelKey: 'libraryLevelAdvanced' },
];

export function LibraryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [equip, setEquip] = useState('');
  const [tag, setTag] = useState<ProgramTag | ''>('');
  const [level, setLevel] = useState('');
  const { premium } = usePremium();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const filtered = EXERCISES.filter((e) => {
    const matchQ =
      !q ||
      e.name.toLowerCase().includes(q.toLowerCase()) ||
      e.muscleGroups.some((m) => m.toLowerCase().includes(q.toLowerCase()));
    const matchE = !equip || (e.equipment || '').toLowerCase().includes(equip.toLowerCase());
    const matchTag = !tag || (e.tags ?? []).includes(tag);
    const matchLevel = !level || e.level === level;
    return matchQ && matchE && matchTag && matchLevel;
  });

  return (
    <PillarPageShell
      icon={Dumbbell}
      title={t('library', { defaultValue: 'Exercise Library' })}
      subtitle={t('librarySubtitle', {
        count: EXERCISES.length,
        defaultValue: `${EXERCISES.length}+ movements with cues and alternatives. Bodyweight and minimal equipment prioritized.`,
      })}
    >
      <p className="text-muted-foreground text-sm">
        <Link href="/log" className="underline">
          {t('libraryTodayHub', { defaultValue: 'Today Hub' })}
        </Link>
        {' · '}
        <Link href="/builder" className="underline">
          {t('libraryProgramTemplates', { defaultValue: 'Program templates' })}
        </Link>
        {premium
          ? t('libraryPremiumUnlocked', { defaultValue: ' — full library unlocked.' })
          : t('libraryFreeCatalog', { defaultValue: ' — free core includes the full catalog.' })}
      </p>

      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder={t('librarySearchPlaceholder', { defaultValue: 'Search name or muscle...' })}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={equip}
          onChange={(e) => setEquip(e.target.value)}
          className="border rounded px-3 bg-background text-sm"
        >
          {EQUIP_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {t(o.labelKey)}
            </option>
          ))}
        </select>
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value as ProgramTag | '')}
          className="border rounded px-3 bg-background text-sm"
        >
          {TAG_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {t(o.labelKey)}
            </option>
          ))}
        </select>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="border rounded px-3 bg-background text-sm"
        >
          {LEVEL_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {t(o.labelKey)}
            </option>
          ))}
        </select>
        <span className="text-xs self-center text-muted-foreground">
          {t('libraryShowingCount', {
            shown: filtered.length,
            total: EXERCISES.length,
            defaultValue: `Showing ${filtered.length} of ${EXERCISES.length}`,
          })}
        </span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ex) => (
          <Card key={ex.id} className="content-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{ex.name}</CardTitle>
              <div className="text-xs text-muted-foreground">
                {ex.muscleGroups.join(' • ')} • {ex.equipment || 'Various'}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {(ex.tags ?? []).slice(0, 3).map((tagId) => (
                  <Badge key={tagId} variant="outline" className="text-[10px]">
                    {PROGRAM_TAG_LABELS[tagId]}
                  </Badge>
                ))}
                {ex.level && (
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {ex.level}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {ex.cues ? (
                <div>
                  <span className="font-medium">{t('libraryKeyCues', { defaultValue: 'Key cues:' })}</span>{' '}
                  {ex.cues}
                </div>
              ) : (
                <div className="text-muted-foreground">
                  {t('libraryCuesComing', {
                    defaultValue: 'Form cues coming soon for this movement.',
                  })}
                </div>
              )}
              {ex.alternatives && ex.alternatives.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {t('libraryAlternatives', { defaultValue: 'Alternatives:' })}
                  </span>{' '}
                  {ex.alternatives.map((id) => getExerciseById(id)?.name ?? id).join(', ')}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  startWorkout(ex.name, [{ exerciseId: ex.id, sets: [{ reps: 8, weight: 0 }] }]);
                  router.push('/active');
                }}
                className="text-xs px-3 py-1.5 border border-primary/50 rounded hover:bg-primary/10 font-medium w-full text-center"
              >
                {t('libraryQuickAdd', { defaultValue: "Quick Add to Today's Workout →" })}
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          {t('libraryNoResults', {
            defaultValue:
              'No exercises match these filters. Try clearing equipment or style filters.',
          })}
        </p>
      )}
    </PillarPageShell>
  );
}
