'use client';

/**
 * Mission Winning personal trainer — next set, library form cue, plan.
 * The sentence updates from the free model when one is configured.
 * Log set / Start stay the filled actions. This card does not sell anything.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ensureFullExerciseCatalog, getExerciseById } from '@/data/exercises';
import { getFormGuideOrCues } from '@/lib/formGuides';
import { getOrCreateDeviceId } from '@/lib/coach/storage';
import {
  formatTrainerLoad,
  libraryFormCue,
  libraryHrefForExercise,
  type SessionTrainerSeed,
} from '@/lib/coach/sessionTrainer';

type Props = {
  seed: SessionTrainerSeed | null;
  surface: 'today' | 'train' | 'coach';
};

export function SessionTrainerCard({ seed, surface }: Props) {
  const { t } = useTranslation();
  const [cue, setCue] = useState<string | null>(null);
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [cueReady, setCueReady] = useState(false);
  const [llmLine, setLlmLine] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);

  const exerciseId = seed?.exerciseId ?? null;

  useEffect(() => {
    if (!exerciseId) {
      setCue(null);
      setResolvedName(null);
      setCueReady(true);
      return;
    }
    let cancelled = false;
    setCueReady(false);
    void (async () => {
      await ensureFullExerciseCatalog();
      if (cancelled) return;
      const ex = getExerciseById(exerciseId);
      const guide = getFormGuideOrCues(exerciseId, { exercise: ex ?? null });
      setCue(
        libraryFormCue({
          setup: guide?.setup,
          execute: guide?.execute,
          cues: ex?.cues,
        })
      );
      setResolvedName(ex?.name?.trim() || null);
      setCueReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  const name = seed?.exerciseName?.trim() || resolvedName;
  const load = seed ? formatTrainerLoad(seed) : null;
  const weight = seed?.weight ?? null;
  const reps = seed?.reps ?? null;
  const unit = seed?.unit ?? 'kg';
  const setsLeft = seed?.setsLeft ?? null;
  const planLabel = seed?.planLabel ?? null;
  const voiceKey = exerciseId && cueReady ? `${exerciseId}:${name ?? ''}:${cue ?? ''}` : '';
  const liveLoad = useRef({ weight, reps });
  liveLoad.current = { weight, reps };

  useEffect(() => {
    setLlmLine(null);
    setModel(null);
  }, [exerciseId, weight, reps]);

  useEffect(() => {
    if (!voiceKey) return;
    const snap = { weight, reps };
    const ac = new AbortController();
    void (async () => {
      try {
        const res = await fetch('/api/coach/session-trainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: ac.signal,
          body: JSON.stringify({
            exerciseId,
            exerciseName: name,
            weight: snap.weight,
            reps: snap.reps,
            unit,
            setsLeft,
            formCue: cue,
            planLabel,
            deviceId: getOrCreateDeviceId(),
          }),
        });
        if (!res.ok) return;
        if (snap.weight !== liveLoad.current.weight || snap.reps !== liveLoad.current.reps) return;
        const data = (await res.json()) as { source?: string; line?: string | null; model?: string | null };
        if (data.source === 'llm' && typeof data.line === 'string' && data.line.trim()) {
          setLlmLine(data.line.trim());
          setModel(typeof data.model === 'string' ? data.model : null);
        }
      } catch {
        // Library line stays. A missed call is not an error the athlete has to clear.
      }
    })();
    return () => ac.abort();
    // Weight and reps stay on the local line. One model call per lift, not per set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceKey, exerciseId, name, unit, setsLeft, cue, planLabel]);

  if (!seed) {
    return (
      <section className="house-card" data-testid="session-trainer" data-surface={surface} aria-busy="true">
        <p className="house-kicker">
          {t('sessionTrainerKicker', { defaultValue: 'Personal trainer' })}
        </p>
      </section>
    );
  }

  const localLine = !name
    ? t('sessionTrainerNoSet', { defaultValue: 'No set in front of you yet.' })
    : cue && load
      ? t('sessionTrainerLineCue', {
          name,
          load,
          cue,
          defaultValue: 'Next: {{name}}, {{load}}. {{cue}}',
        })
      : load
        ? t('sessionTrainerLine', {
            name,
            load,
            defaultValue: 'Next: {{name}}, {{load}}. Log it when the rep is yours.',
          })
        : t('sessionTrainerLineName', {
            name,
            defaultValue: 'Next: {{name}}. Log it when the rep is yours.',
          });

  const shown = llmLine ?? localLine;
  const href = libraryHrefForExercise(exerciseId);
  const nextDetail = name && load ? `${name} — ${load}` : name ?? t('sessionTrainerNoSet', { defaultValue: 'No set in front of you yet.' });

  return (
    <section
      className="house-card"
      data-testid="session-trainer"
      data-surface={surface}
      data-source={llmLine ? 'llm' : 'library'}
      data-model={model ?? ''}
      aria-busy={exerciseId && !cueReady ? true : undefined}
      style={{ marginTop: 16 }}
    >
      <p className="house-kicker">
        {t('sessionTrainerKicker', { defaultValue: 'Personal trainer' })}
      </p>
      <p className="house-lede" data-testid="session-trainer-line">
        {shown}
      </p>
      <p className="house-row" data-testid="session-trainer-next">
        <span className="house-kicker">{t('sessionTrainerNext', { defaultValue: 'Next set' })}</span>
        <span>{nextDetail}</span>
      </p>
      <p className="house-row" data-testid="session-trainer-form">
        <span className="house-kicker">{t('sessionTrainerForm', { defaultValue: 'Form' })}</span>
        <span>{cue ?? t('sessionTrainerNoCue', { defaultValue: 'No library cue for this lift.' })}</span>
      </p>
      <p className="house-row" data-testid="session-trainer-plan">
        <span className="house-kicker">{t('sessionTrainerPlan', { defaultValue: 'Plan' })}</span>
        <span>
          {seed.planLabel?.trim() ||
            t('sessionTrainerNoPlan', {
              defaultValue: 'No week plan yet. Log sets and Coach writes the week from your logs.',
            })}
        </span>
      </p>
      {href ? (
        <Link href={href} className="house-btn house-btn-ghost" data-testid="session-trainer-library">
          {t('sessionTrainerLibrary', { defaultValue: 'Library' })}
        </Link>
      ) : null}
    </section>
  );
}
