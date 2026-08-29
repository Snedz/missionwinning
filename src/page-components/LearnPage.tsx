'use client';
/**
 * Page: /learn — Quiet Learn first-success intro (`.978`).
 * Other paths / guidebook in Show more.
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FREE_LEARN_PATHS } from '@/data/learnPaths';
import { localizeLearnPaths } from '@/lib/localizeLearnPaths';
import { QUIET_LEARN_PATH_ID } from '@/lib/quietLearn';
import { LearnLockedPreview } from '@/components/learn/LearnLockedPreview';
import { QuietLearnIntroCard } from '@/components/learn/QuietLearnIntroCard';
import { usePremium } from '@/hooks/usePremium';
import { useWorkoutStore } from '@/store/workoutStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { logPillarWin } from '@/lib/pillarLog';
import {
  BarChart3,
  Bandage,
  BookMarked,
  BookOpen,
  Brain,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Flower2,
  HeartHandshake,
  Home,
  Moon,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { isFreeBeta } from '@/lib/freeBeta';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';
import {
  parseSeoLearnPathParam,
  PUBLIC_GUIDE_HREF,
  stripSeoLearnPathFromSearch,
} from '@/lib/seoLearnBridge';

const FREE_PATH_IDS = FREE_LEARN_PATHS.map((p) => p.id);

/**
 * Lucide over emoji (design system: one icon family, ink-coloured). The data
 * schema keeps its emoji `icon` field — Android and localization read it — so
 * this map is the web presentation only; an unknown id falls back to BookOpen.
 */
const PATH_ICONS: Record<string, LucideIcon> = {
  'strength-basics': Dumbbell,
  'nutrition-101': UtensilsCrossed,
  'mobility-longevity': Flower2,
  'mindset-habits': Brain,
  'assessments-path': BarChart3,
  'corrective-foundations': Bandage,
  'periodization-design': CalendarRange,
  'coaching-client-success': HeartHandshake,
  'sleep-recovery': Moon,
  'home-gym-budget': Home,
};

export function LearnPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { premium } = usePremium();
  const freeBeta = isFreeBeta();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const paths = useMemo(
    () => localizeLearnPaths(FREE_LEARN_PATHS, t),
    [t]
  );
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [pathQuery, setPathQuery] = useState('');
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    () => new Set(readJson<string[]>(STORAGE_KEYS.learnCompleted, []))
  );

  /** Flow-3: SEO `/paths/[id]` → `/learn?path=` expands that free path once. */
  const seoPathConsumed = useRef(false);
  useEffect(() => {
    if (seoPathConsumed.current) return;
    const id = parseSeoLearnPathParam(searchParams, FREE_PATH_IDS);
    if (!id) return;
    seoPathConsumed.current = true;
    setExpandedPath(id);
    router.replace(`/learn${stripSeoLearnPathFromSearch(window.location.search)}`, {
      scroll: false,
    });
  }, [searchParams, router]);

  const filteredPaths = useMemo(() => {
    const q = pathQuery.trim().toLowerCase();
    const pool = q
      ? paths
      : paths.filter((p) => p.id !== QUIET_LEARN_PATH_ID);
    if (!q) return pool;
    return pool.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.lessons.some((l) => l.title.toLowerCase().includes(q))
    );
  }, [paths, pathQuery]);
  const showMoreOpen = Boolean(expandedPath) || Boolean(pathQuery.trim());

  const markLessonDone = (lessonId: string, title: string) => {
    const next = new Set(completedLessons);
    next.add(lessonId);
    setCompletedLessons(next);
    writeJson(STORAGE_KEYS.learnCompleted, [...next]);
    logPillarWin('learn', title);
  };

  return (
    <PillarPageShell
      className="house-learn"
      icon={BookOpen}
      eyebrow={t('learnEyebrow', { defaultValue: 'Learn' })}
      title={t('learnTitle', { defaultValue: 'Learn & Master' })}
      subtitle={t('quietLearnSubtitle', {
        defaultValue: 'Log a set. Then Coach from those logs.',
      })}
    >
        <QuietLearnIntroCard paths={paths} />

        <details open={showMoreOpen || undefined} className="house-card group">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
            <BookMarked className="h-4 w-4 text-primary" aria-hidden />
            {t('quietLearnMorePaths', {
              defaultValue: 'Other paths, guidebook & more',
            })}
          </summary>
          <div className="space-y-3 border-t-2 border-border p-4">
        {/* Catalog lives in Show more — first paint is the one intro. */}
        <div id="learn-paths" className="space-y-3 scroll-mt-20">
          <input
            type="search"
            value={pathQuery}
            onChange={(e) => setPathQuery(e.target.value)}
            placeholder={t('learnSearchPlaceholder', {
              defaultValue: 'Search paths or lessons…',
            })}
            className="w-full border-2 border-border bg-background px-3 py-2.5 min-h-[44px] text-sm"
            aria-label={t('learnSearchPlaceholder', {
              defaultValue: 'Search paths or lessons…',
            })}
          />
          {filteredPaths.length === 0 && (
            <EmptyState
              className="house-empty"
              icon={BookOpen}
              title={t('learnNoMatches', { defaultValue: 'No paths match that search.' })}
              description={t('learnNoMatchesDesc', {
                defaultValue: 'Try a different keyword, or clear search to see all free paths.',
              })}
              actionLabel={t('learnClearSearch', { defaultValue: 'Clear search' })}
              onAction={() => setPathQuery('')}
            />
          )}
          {filteredPaths.map((path) => {
            const open = expandedPath === path.id;
            const doneCount = path.lessons.filter((l) => completedLessons.has(l.id)).length;
            const PathIcon = PATH_ICONS[path.id] ?? BookOpen;
            return (
              <Card key={path.id} className="content-card">
                <button
                  type="button"
                  className="w-full text-left min-h-[44px] tap-target"
                  aria-expanded={open}
                  onClick={() => setExpandedPath(open ? null : path.id)}
                >
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <PathIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                        {path.title}
                      </CardTitle>
                      <CardDescription>{path.subtitle}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-primary tabular-nums">
                        {doneCount}/{path.lessons.length}
                      </span>
                      {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </CardHeader>
                </button>
                {open && (
                  <CardContent className="space-y-4 pt-0 border-t-2 border-border">
                    {path.lessons.map((lesson) => (
                      <div key={lesson.id} className="p-4 bg-card space-y-2 border-2 border-border">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold">{lesson.title}</h3>
                          {completedLessons.has(lesson.id) && (
                            <span className="text-xs text-primary shrink-0">
                              {t('learnDone', { defaultValue: 'Done' })}
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
                            <Button size="sm" variant="outline" className="min-h-[44px] tap-target" asChild>
                              <Link href={lesson.actionHref}>{lesson.actionLabel}</Link>
                            </Button>
                          )}
                          {!completedLessons.has(lesson.id) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="min-h-[44px] tap-target"
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

            <div className="space-y-4 border-t-2 border-border pt-4">
            <div>
              <p className="eyebrow mb-1 text-primary">
                {t('learnExpandedBanner', { defaultValue: 'Beyond the Basics' })}
              </p>
              <p className="mb-3 text-sm text-muted-foreground">
                {t('learnExpandedDesc', {
                  defaultValue:
                    'Six free chapters on performance, movement, and programming — practical, not hype.',
                })}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="min-h-[44px] tap-target" asChild>
                  <Link href="/learn/guide">
                    {t('learnOpenGuidebook', { defaultValue: 'Open Guidebook →' })}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="min-h-[44px] tap-target" asChild>
                  <Link href={PUBLIC_GUIDE_HREF}>
                    {t('learnOpenMagazine', { defaultValue: 'Magazine (web)' })}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="border-t-2 border-border pt-4">
              <p className="mb-2 text-sm font-semibold">
                {t('learnSampleTitle', { defaultValue: 'Try it — free sample workout' })}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] tap-target"
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
            </div>

            {premium ? (
              <div className="border-t-2 border-border pt-4">
                <p className="mb-1 text-sm font-semibold">
                  {freeBeta
                    ? t('learnPremiumTitleOpenBeta', {
                        defaultValue: 'Specialist Programs',
                      })
                    : t('learnPremiumTitle', {
                        defaultValue: 'Premium Specialist Programs',
                      })}
                </p>
                <p className="mb-3 text-sm text-muted-foreground">
                  {t('learnPremiumCourseDesc', {
                    defaultValue:
                      'Multi-chapter specialist courses with progress that survives reload.',
                  })}
                </p>
                <Button variant="outline" size="sm" className="min-h-[44px] tap-target" asChild>
                  <Link href="/learn/course">
                    {t('learnOpenCourses', { defaultValue: 'Open specialist courses →' })}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="border-t-2 border-border pt-4">
                <LearnLockedPreview />
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {freeBeta
                ? t('learnSubtitleOpenBeta', {
                    count: FREE_LEARN_PATHS.length,
                    defaultValue: `${FREE_LEARN_PATHS.length} education paths — foundations first. Guidebook and specialist courses open in Alpha.`,
                  })
                : t('learnSubtitle', {
                    count: FREE_LEARN_PATHS.length,
                    defaultValue: `${FREE_LEARN_PATHS.length} free education paths. Super Bundle unlocks full programs when paid depth is on.`,
                  })}
            </p>
          </div>
          </div>
        </details>
    </PillarPageShell>
  );
}
