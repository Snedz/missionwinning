'use client';
/**
 * Page: /school/class/[code] — teacher dashboard
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Download, Flag, Printer, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PftWeekOnePrintSheet } from '@/components/fitness-test/PftWeekOnePrintSheet';
import { TeacherClassPrintSheet } from '@/components/fitness-test/TeacherClassPrintSheet';
import { awardLabel, type FitnessAwardTier } from '@/lib/presidentialFitnessTest';
import {
  getTeacherPin,
  normalizeClassCode,
  classJoinUrl,
  saveTeacherPin,
} from '@/lib/schoolClass';
import { formatClassStandingsCsv } from '@/lib/schoolClassExport';
import { formatWeekOneChallengeText } from '@/data/pftWeekOneChallenge';
import { americaHomeOrFallback } from '@/lib/americaConfig';

type ClassStats = {
  code: string;
  className: string | null;
  totalTests: number;
  uniqueAthletes: number;
  tierCounts: Record<string, number>;
};

type ClassPftEntry = {
  rank: number;
  athleteLabel: string;
  bestTier: string;
  score: number;
  lastTestAt: string;
};

function TeacherClassInner({ code: rawCode }: { code: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = normalizeClassCode(rawCode) ?? rawCode.toUpperCase();
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [entries, setEntries] = useState<ClassPftEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [printMode, setPrintMode] = useState<'week1' | 'report'>('week1');

  const className = stats?.className ?? t('schoolDefaultName', { defaultValue: 'PE Class' });

  const checkAccess = useCallback(
    async (pin: string) => {
      const trimmed = pin.trim();
      try {
        const res = await fetch(`/api/school/class/${code}/access`, {
          method: trimmed ? 'POST' : 'GET',
          credentials: 'include',
          headers: trimmed ? { 'Content-Type': 'application/json' } : undefined,
          body: trimmed ? JSON.stringify({ pin: trimmed }) : undefined,
        });
        const data = (await res.json()) as {
          unlocked?: boolean;
          isCreator?: boolean;
        };
        if (data.unlocked) {
          if (trimmed) saveTeacherPin(code, trimmed);
          setUnlocked(true);
          setIsCreator(Boolean(data.isCreator));
          setPinError('');
          if (searchParams.get('pin')) {
            router.replace(`/school/class/${code}`, { scroll: false });
          }
          return true;
        }
      } catch {
        /* fall through */
      }
      return false;
    },
    [code, searchParams, router]
  );

  const tryUnlock = useCallback(
    async (pin: string) => {
      const ok = await checkAccess(pin);
      if (!ok) {
        setPinError(t('teacherPinInvalid', { defaultValue: 'Incorrect teacher PIN.' }));
      }
    },
    [checkAccess, t]
  );

  useEffect(() => {
    const qPin = searchParams.get('pin');
    if (qPin) setPinInput(qPin);
    const local = getTeacherPin(code);
    void checkAccess(qPin || local || '');
  }, [code, searchParams, checkAccess]);

  useEffect(() => {
    if (!unlocked) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const pin = getTeacherPin(code);
        const headers: HeadersInit = pin ? { 'x-teacher-pin': pin } : {};
        const [statsRes, lbRes] = await Promise.all([
          fetch(`/api/school/class/${code}/stats`, { credentials: 'include', headers }),
          fetch(`/api/school/class/${code}/leaderboard`, { credentials: 'include', headers }),
        ]);
        if (!cancelled) {
          setStats((await statsRes.json()) as ClassStats);
          const lb = (await lbRes.json()) as { entries: ClassPftEntry[] };
          setEntries(lb.entries ?? []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, unlocked]);

  const printSheet = (mode: 'week1' | 'report') => {
    setPrintMode(mode);
    requestAnimationFrame(() => window.print());
  };

  const copyChallenge = async () => {
    await navigator.clipboard?.writeText(formatWeekOneChallengeText(className, code));
  };

  const downloadChallenge = () => {
    const text = formatWeekOneChallengeText(className, code);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mission-winning-pft-week1-${code}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExport = async (format: 'csv' | 'html') => {
    const ext = format === 'html' ? 'html' : 'csv';
    const prefix = format === 'html' ? 'report' : 'standings';
    try {
      const pin = getTeacherPin(code);
      const params = new URLSearchParams({ format });
      if (pin) params.set('pin', pin);
      const res = await fetch(`/api/school/class/${code}/export?${params}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `mission-winning-${prefix}-${code}.${ext}`;
        a.click();
        URL.revokeObjectURL(objectUrl);
        return;
      }
    } catch {
      /* fallback below */
    }
    if (format === 'csv') {
      const csv = formatClassStandingsCsv(className, code, entries);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mission-winning-standings-${code}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const downloadStandingsCsv = () => void downloadExport('csv');
  const downloadReportHtml = () => void downloadExport('html');

  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 page-enter">
        <Card className="content-card">
          <CardHeader>
            <CardTitle>{t('teacherPinTitle', { defaultValue: 'Teacher PIN required' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t('teacherPinDesc', {
                defaultValue: 'Enter the 6-digit PIN shown when you created class {{code}}.',
                code,
              })}
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError('');
              }}
              className="w-full rounded-none bg-background border border-border px-3 py-2 font-mono text-lg"
              placeholder="123456"
            />
            {pinError && <p className="text-xs text-destructive">{pinError}</p>}
            <Button className="w-full" onClick={() => void tryUnlock(pinInput)}>
              {t('teacherPinUnlock', { defaultValue: 'Unlock dashboard' })}
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href={americaHomeOrFallback()}>
                {t('pftBackBenchmarks', { defaultValue: 'Back' })}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 max-w-3xl mx-auto print:hidden page-enter">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Flag className="h-5 w-5" />
              <span className="text-xs uppercase tracking-widest font-medium">
                {t('teacherDashboardKicker', { defaultValue: 'Teacher dashboard' })}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{className}</h1>
            <p className="text-sm text-muted-foreground mt-1 font-mono">{code}</p>
            {isCreator && (
              <p className="text-xs text-primary mt-1">
                {t('teacherCreatorBadge', { defaultValue: 'Signed in as class creator' })}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={americaHomeOrFallback()}>
              {t('pftBackAmerica', { defaultValue: 'National fitness' })}
            </Link>
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm" role="status" aria-busy="true">
            {t('teacherLoading', { defaultValue: 'Loading class…' })}
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="content-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" /> {t('teacherAthletes', { defaultValue: 'Athletes synced' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats?.uniqueAthletes ?? 0}</p>
                </CardContent>
              </Card>
              <Card className="content-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    {t('teacherTests', { defaultValue: 'Tests logged' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats?.totalTests ?? 0}</p>
                </CardContent>
              </Card>
              <Card className="content-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    {t('teacherPresidential', { defaultValue: 'Presidential awards' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats?.tierCounts?.presidential ?? 0}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="content-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-5 w-5 text-[hsl(var(--status-warn))]" />
                  {t('teacherPftBoard', { defaultValue: 'Class fitness test standings' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('teacherPftEmpty', { defaultValue: 'No synced results yet.' })}
                  </p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {entries.map((e) => (
                      <li
                        key={`${e.rank}-${e.athleteLabel}`}
                        className="flex justify-between gap-4 border-b border-border pb-2"
                      >
                        <span>
                          #{e.rank} {e.athleteLabel}
                        </span>
                        <span className="text-muted-foreground shrink-0">
                          {awardLabel(e.bestTier as FitnessAwardTier)} · {e.score} pts
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/leaderboard?board=presidential-fitness&scope=class&class=${code}`}>
                      {t('teacherOpenLeaderboard', { defaultValue: 'Open PFT leaderboard →' })}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadStandingsCsv}>
                    <Download className="h-4 w-4" />
                    {t('teacherDownloadCsv', { defaultValue: 'Download CSV' })}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadReportHtml}>
                    <Download className="h-4 w-4" />
                    {t('teacherDownloadHtml', { defaultValue: 'Download report (HTML)' })}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => printSheet('report')}>
                    <Printer className="h-4 w-4" />
                    {t('teacherPrintReport', { defaultValue: 'Print report' })}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="content-card border-dashed">
              <CardHeader>
                <CardTitle className="text-base">{t('teacherWeekOne', { defaultValue: 'Week 1 challenge' })}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button onClick={() => printSheet('week1')} className="gap-2">
                  <Printer className="h-4 w-4" />
                  {t('teacherPrint', { defaultValue: 'Print' })}
                </Button>
                <Button variant="outline" onClick={() => void copyChallenge()}>
                  {t('teacherCopyPlan', { defaultValue: 'Copy text' })}
                </Button>
                <Button variant="outline" onClick={downloadChallenge}>
                  {t('teacherDownloadPlan', { defaultValue: 'Download .txt' })}
                </Button>
                <Button variant="ghost" asChild>
                  <a href={classJoinUrl(code)} target="_blank" rel="noreferrer">
                    {t('teacherJoinLink', { defaultValue: 'Student join link' })}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      {printMode === 'week1' ? (
        <PftWeekOnePrintSheet className={className} classCode={code} />
      ) : (
        <TeacherClassPrintSheet
          className={className}
          classCode={code}
          stats={{
            uniqueAthletes: stats?.uniqueAthletes ?? 0,
            totalTests: stats?.totalTests ?? 0,
            tierCounts: stats?.tierCounts ?? {},
          }}
          entries={entries}
        />
      )}
    </>
  );
}

export function TeacherClassPage({ code }: { code: string }) {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-muted-foreground" role="status" aria-busy="true">
          Loading class…
        </div>
      }
    >
      <TeacherClassInner code={code} />
    </Suspense>
  );
}
