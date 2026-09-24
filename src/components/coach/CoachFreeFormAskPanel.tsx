'use client';

/**
 * Free-surface form cues for /coach?ask= — never a chat paywall (.437).
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CoachTrainerDoor } from '@/components/coach/CoachTrainerDoor';
import { EXERCISES, ensureFullExerciseCatalog, getExerciseById } from '@/data/exercises';
import { getFormGuideOrCues } from '@/lib/formGuides';
import { cn } from '@/lib/utils';

export function CoachFreeFormAskPanel({
  askExerciseId,
  className,
}: {
  askExerciseId: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(askExerciseId);
  const [cues, setCues] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await ensureFullExerciseCatalog();
      if (cancelled) return;
      const ex = getExerciseById(askExerciseId) ?? EXERCISES.find((e) => e.id === askExerciseId);
      const guide = getFormGuideOrCues(askExerciseId, { exercise: ex ?? null });
      setName(ex?.name ?? askExerciseId);
      setCues(guide?.execute?.slice(0, 4) ?? (ex?.cues ? [ex.cues] : []));
    })();
    return () => {
      cancelled = true;
    };
  }, [askExerciseId]);

  return (
    <Card className={cn('content-card border-2 border-border', className)} data-testid="coach-free-form-ask">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {t('coachFreeFormTitle', {
            name,
            defaultValue: `Form cues — ${name}`,
          })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {cues.length > 0 ? (
          <ul className="space-y-1.5 text-sm text-foreground">
            {cues.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-primary shrink-0">·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('coachFreeFormFallback', {
              defaultValue: 'Open Form guide on the logger for setup and execute tips.',
            })}
          </p>
        )}
        <CoachTrainerDoor exerciseName={name} />
      </CardContent>
    </Card>
  );
}
