'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FREE_LEARN_PATHS, type LearnPath } from '@/data/learnPaths';
import { localizeLearnPaths } from '@/lib/localizeLearnPaths';
import { PREMIUM_LEARN_PATH_COUNT } from '@/lib/learnPremiumMeta';
import { usePremium } from '@/hooks/usePremium';
import { useWorkoutStore } from '@/store/workoutStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { StaggerGroup, StaggerItem } from '@/components/layout/StaggerReveal';
import { logPillarWin } from '@/lib/pillarLog';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

function LearnPathCards({
  paths,
  expandedPath,
  setExpandedPath,
  completedLessons,
  markLessonDone,
  t,
}: {
  paths: LearnPath[];
  expandedPath: string | null;
  setExpandedPath: (id: string | null) => void;
  completedLessons: Set<string>;
  markLessonDone: (lessonId: string, title: string) => void;
  t: (key: string, options?: { defaultValue?: string }) => string;
}) {
  return (
    <div className="space-y-3">
      {paths.map((path) => {
        const open = expandedPath === path.id;
        const doneCount = path.lessons.filter((l) => completedLessons.has(l.id)).length;
        return (
          <Card key={path.id} className="content-card">
            <button
              type="button"
              className="w-full text-left"
              onClick={() => setExpandedPath(open ? null : path.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{path.icon}</span>
                    {path.title}
                  </CardTitle>
                  <CardDescription>{path.subtitle}</CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-emerald-400 tabular-nums">
                    {doneCount}/{path.lessons.length}
                  </span>
                  {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </button>
            {open && (
              <CardContent className="space-y-4 pt-0 border-t border-border/50">
                {path.lessons.map((lesson) => (
                  <div key={lesson.id} className="p-4 rounded-lg bg-muted/30 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{lesson.title}</h3>
                      {completedLessons.has(lesson.id) && (
                        <span className="text-xs text-emerald-400 shrink-0">
                          {t('learnDone', { defaultValue: '✓ Done' })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{lesson.summary}</p>
                    <ul className="text-sm list-disc pl-4 space-y-1 text-muted-foreground">
                      {lesson.keyPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                    <div className="flex gap-2 flex-wrap pt-2">
                      {lesson.actionHref && lesson.actionLabel && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={lesson.actionHref}>{lesson.actionLabel}</Link>
                        </Button>
                      )}
                      {!completedLessons.has(lesson.id) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markLessonDone(lesson.id, lesson.title)}
                        >
                          {t('learnMarkComplete', { defaultValue: 'Mark complete' })}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export function LearnPage() {
  const { t } = useTranslation();
  const { premium, loading: premiumLoading } = usePremium();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const freePaths = useMemo(() => localizeLearnPaths(FREE_LEARN_PATHS, t), [t]);
  const [premiumPathsRaw, setPremiumPathsRaw] = useState<LearnPath[]>([]);
  const premiumPaths = useMemo(
    () => localizeLearnPaths(premiumPathsRaw, t),
    [t, premiumPathsRaw]
  );
  const [expandedPath, setExpandedPath] = useState<string | null>(FREE_LEARN_PATHS[0]?.id ?? null);
  const [expandedPremiumPath, setExpandedPremiumPath] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      return new Set(JSON.parse(localStorage.getItem('mw_learn_completed') || '[]') as string[]);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    if (!premium) {
      setPremiumPathsRaw([]);
      setExpandedPremiumPath(null);
      return;
    }
    fetch('/api/premium/learn-paths', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { paths: [] }))
      .then((data) => {
        const paths = data.paths ?? [];
        setPremiumPathsRaw(paths);
        if (paths.length > 0) {
          setExpandedPremiumPath((prev) => prev ?? paths[0].id);
        }
      })
      .catch(() => setPremiumPathsRaw([]));
  }, [premium]);

  const markLessonDone = (lessonId: string, title: string) => {
    const next = new Set(completedLessons);
    next.add(lessonId);
    setCompletedLessons(next);
    localStorage.setItem('mw_learn_completed', JSON.stringify([...next]));
    logPillarWin('learn', title);
  };

  const premiumSectionIndex = 3;

  return (
    <StaggerGroup className="space-y-6">
      <StaggerItem index={0}>
        <PillarPageHeader
          icon={BookOpen}
          title={t('learnTitle', { defaultValue: 'Learn & Master' })}
          subtitle={t('learnSubtitle', {
            count: FREE_LEARN_PATHS.length,
            defaultValue: `${FREE_LEARN_PATHS.length} free education paths — ISSA-aligned foundations plus specialist intros. Premium unlocks full programs (Super Bundle).`,
          })}
        />
      </StaggerItem>

      <StaggerItem index={1}>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('learnPathsFree', { defaultValue: 'Free education paths' })}
          </h3>
          <LearnPathCards
            paths={freePaths}
            expandedPath={expandedPath}
            setExpandedPath={setExpandedPath}
            completedLessons={completedLessons}
            markLessonDone={markLessonDone}
            t={t}
          />
        </div>
      </StaggerItem>

      <StaggerItem index={2}>
        <Card className="content-card border-emerald-500/20">
          <CardHeader>
            <CardTitle className="text-base">
              {t('learnSampleTitle', { defaultValue: 'Try it — free sample workout' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="fitness"
              size="sm"
              onClick={() => {
                startWorkout('Learn Sample — Bodyweight', [
                  { exerciseId: 'push-ups', sets: [{ reps: 10, weight: 0 }] },
                  { exerciseId: 'squats', sets: [{ reps: 12, weight: 0 }] },
                  { exerciseId: 'plank', sets: [{ reps: 30, weight: 0 }] },
                ]);
                window.location.href = '/active';
              }}
            >
              {t('learnSampleBtn', { defaultValue: 'Start Bodyweight Sample →' })}
            </Button>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem index={premiumSectionIndex}>
        {premium && !premiumLoading && premiumPaths.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('learnPathsPremium', {
                defaultValue: 'Premium specialist programs (Super Bundle)',
              })}
            </h3>
            <LearnPathCards
              paths={premiumPaths}
              expandedPath={expandedPremiumPath}
              setExpandedPath={setExpandedPremiumPath}
              completedLessons={completedLessons}
              markLessonDone={markLessonDone}
              t={t}
            />
          </div>
        ) : (
          <Card className="content-card border-emerald-500/30">
            <CardHeader>
              <CardTitle className="text-base">
                {t('learnPremiumLockedTitle', {
                  count: PREMIUM_LEARN_PATH_COUNT,
                  defaultValue: `+${PREMIUM_LEARN_PATH_COUNT} Specialist Programs`,
                })}
              </CardTitle>
              <CardDescription>
                {t('learnPremiumLockedBody', {
                  defaultValue:
                    'Unlock PT+Nutrition, Bodybuilding, Corrective, Business, Online Coaching, and Conditioning paths via the Super Bundle.',
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="fitness" onClick={() => { window.location.href = '/bundle'; }}>
                {t('learnExploreBundle', { defaultValue: 'Explore Super Bundle' })}
              </Button>
            </CardContent>
          </Card>
        )}
      </StaggerItem>
    </StaggerGroup>
  );
}
