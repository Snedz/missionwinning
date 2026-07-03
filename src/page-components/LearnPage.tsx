'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FREE_LEARN_PATHS } from '@/data/learnPaths';
import { localizeLearnPaths } from '@/lib/localizeLearnPaths';
import { UnlockButton } from '@/components/UnlockButton';
import { PROGRAM_PRICES } from '@/lib/payments';
import { useWorkoutStore } from '@/store/workoutStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { StaggerGroup, StaggerItem } from '@/components/layout/StaggerReveal';
import { logPillarWin } from '@/lib/pillarLog';
import { ChevronDown, ChevronUp, BookOpen, BookMarked } from 'lucide-react';

export function LearnPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const paths = useMemo(
    () => localizeLearnPaths(FREE_LEARN_PATHS, t),
    [i18n.language, t]
  );
  const [expandedPath, setExpandedPath] = useState<string | null>(FREE_LEARN_PATHS[0]?.id ?? null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      return new Set(JSON.parse(localStorage.getItem('mw_learn_completed') || '[]') as string[]);
    } catch {
      return new Set();
    }
  });

  const markLessonDone = (lessonId: string, title: string) => {
    const next = new Set(completedLessons);
    next.add(lessonId);
    setCompletedLessons(next);
    localStorage.setItem('mw_learn_completed', JSON.stringify([...next]));
    logPillarWin('learn', title);
  };

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
        <Card className="content-card border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-emerald-400" />
              {t('learnExpandedBanner', {
                defaultValue: 'Now with even more content!',
              })}
            </CardTitle>
            <CardDescription>
              {t('learnExpandedDesc', {
                defaultValue:
                  'Beyond the Basics guidebook — 6 chapters on performance science, movement, programming, and more. ISSA-aligned, free core.',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="fitness" size="sm" asChild>
              <Link href="/learn/guide">
                {t('learnOpenGuidebook', { defaultValue: 'Open Guidebook →' })}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem index={2}>
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
      </StaggerItem>

      <StaggerItem index={3}>
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
                router.push('/active');
              }}
            >
              {t('learnSampleBtn', { defaultValue: 'Start Bodyweight Sample →' })}
            </Button>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem index={4}>
        <Card className="content-card border-white/10 bg-card/50">
          <CardHeader>
            <CardTitle className="text-base">
              {t('learnPremiumTitle', { defaultValue: 'Premium Specialist Programs' })}
            </CardTitle>
            <CardDescription>
              {t('learnPremiumDesc', {
                defaultValue:
                  'Full PT+Nutrition, Bodybuilding, Corrective, Business, Coaching, Conditioning.',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="text-xs text-muted-foreground list-disc pl-4">
              {Object.entries(PROGRAM_PRICES).map(([id, info]) => (
                <li key={id}>
                  {info.title} — ${info.price}
                </li>
              ))}
            </ul>
            <UnlockButton
              productId="learn-premium"
              price="147"
              title={t('learnPremiumBtn', { defaultValue: 'Learn & Master Bundle (All Programs)' })}
            />
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerGroup>
  );
}
