'use client';
/**
 * Page: /learn — education paths
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FREE_LEARN_PATHS } from '@/data/learnPaths';
import { localizeLearnPaths } from '@/lib/localizeLearnPaths';
import { LearnLockedPreview } from '@/components/learn/LearnLockedPreview';
import { usePremium } from '@/hooks/usePremium';
import { useWorkoutStore } from '@/store/workoutStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { logPillarWin } from '@/lib/pillarLog';
import { ChevronDown, ChevronUp, BookOpen, BookMarked } from 'lucide-react';

export function LearnPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { premium } = usePremium();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const paths = useMemo(
    () => localizeLearnPaths(FREE_LEARN_PATHS, t),
    [t]
  );
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [pathQuery, setPathQuery] = useState('');
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      return new Set(JSON.parse(localStorage.getItem('mw_learn_completed') || '[]') as string[]);
    } catch {
      return new Set();
    }
  });

  const filteredPaths = useMemo(() => {
    const q = pathQuery.trim().toLowerCase();
    if (!q) return paths;
    return paths.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.lessons.some((l) => l.title.toLowerCase().includes(q))
    );
  }, [paths, pathQuery]);

  const markLessonDone = (lessonId: string, title: string) => {
    const next = new Set(completedLessons);
    next.add(lessonId);
    setCompletedLessons(next);
    localStorage.setItem('mw_learn_completed', JSON.stringify([...next]));
    logPillarWin('learn', title);
  };

  return (
    <PillarPageShell
      icon={BookOpen}
      eyebrow={t('learnEyebrow', { defaultValue: 'Learn' })}
      title={t('learnTitle', { defaultValue: 'Learn & Master' })}
      subtitle={t('learnSubtitle', {
        count: FREE_LEARN_PATHS.length,
        defaultValue: `${FREE_LEARN_PATHS.length} free education paths — evidence-based foundations plus specialist intros. Premium unlocks full programs (Super Bundle).`,
      })}
    >
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
                  'Beyond the Basics guidebook — 6 chapters on performance science, movement, programming, and more. evidence-based, free core.',
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

        <div className="space-y-3">
          <input
            type="search"
            value={pathQuery}
            onChange={(e) => setPathQuery(e.target.value)}
            placeholder={t('learnSearchPlaceholder', {
              defaultValue: 'Search paths or lessons…',
            })}
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5 min-h-[44px] text-sm"
          />
          {filteredPaths.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('learnNoMatches', { defaultValue: 'No paths match that search.' })}
            </p>
          )}
          {filteredPaths.map((path) => {
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

        {premium ? (
          <Card className="content-card border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-base">
                {t('learnPremiumTitle', { defaultValue: 'Premium Specialist Programs' })}
              </CardTitle>
              <CardDescription>
                {t('learnPremiumCourseDesc', {
                  defaultValue: 'Multi-chapter specialist courses with progress that survives reload.',
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="fitness" size="sm" asChild>
                <Link href="/learn/course">
                  {t('learnOpenCourses', { defaultValue: 'Open specialist courses →' })}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <LearnLockedPreview />
        )}
    </PillarPageShell>
  );
}
