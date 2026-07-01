'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Flag, Printer, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PftWeekOnePrintSheet } from '@/components/fitness-test/PftWeekOnePrintSheet';
import { awardLabel, type FitnessAwardTier } from '@/lib/presidentialFitnessTest';
import {
  getTeacherPin,
  normalizeClassCode,
  classJoinUrl,
  saveTeacherPin,
  teacherDashboardUrl,
} from '@/lib/schoolClass';
import { formatWeekOneChallengeText } from '@/data/pftWeekOneChallenge';

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
  const searchParams = useSearchParams();
  const code = normalizeClassCode(rawCode) ?? rawCode.toUpperCase();
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [entries, setEntries] = useState<ClassPftEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const className = stats?.className ?? t('schoolDefaultName', { defaultValue: 'PE Class' });

  const tryUnlock = useCallback(
    async (pin: string) => {
      const trimmed = pin.trim();
      if (!trimmed) return;
      const local = getTeacherPin(code);
      if (local && local === trimmed) {
        saveTeacherPin(code, trimmed);
        setUnlocked(true);
        setPinError('');
        return;
      }
      try {
        const res = await fetch(`/api/school/class/${code}/verify?pin=${encodeURIComponent(trimmed)}`);
        const data = (await res.json()) as { ok?: boolean };
        if (data.ok) {
          saveTeacherPin(code, trimmed);
          setUnlocked(true);
          setPinError('');
          return;
        }
      } catch {
        /* fall through */
      }
      if (local && local === trimmed) {
        setUnlocked(true);
        return;
      }
      setPinError(t('teacherPinInvalid', { defaultValue: 'Incorrect teacher PIN.' }));
    },
    [code, t]
  );

  useEffect(() => {
    const qPin = searchParams.get('pin');
    if (qPin) {
      setPinInput(qPin);
      void tryUnlock(qPin);
    } else {
      const local = getTeacherPin(code);
      if (local) void tryUnlock(local);
    }
  }, [code, searchParams, tryUnlock]);

  useEffect(() => {
    if (!unlocked) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [statsRes, lbRes] = await Promise.all([
          fetch(`/api/school/class/${code}/stats`),
          fetch(`/api/school/class/${code}/leaderboard`),
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

  const printChallenge = () => window.print();

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
              className="w-full rounded-md bg-background border border-border px-3 py-2 font-mono text-lg"
              placeholder="123456"
            />
            {pinError && <p className="text-xs text-red-400">{pinError}</p>}
            <Button className="w-full" onClick={() => void tryUnlock(pinInput)}>
              {t('teacherPinUnlock', { defaultValue: 'Unlock dashboard' })}
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/america">{t('pftBackBenchmarks', { defaultValue: 'Back' })}</Link>
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
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Flag className="h-5 w-5" />
              <span className="text-xs uppercase tracking-widest font-medium">
                {t('teacherDashboardKicker', { defaultValue: 'Teacher dashboard' })}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{className}</h1>
            <p className="text-sm text-muted-foreground mt-1 font-mono">{code}</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/america">/america</Link>
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm">{t('teacherLoading', { defaultValue: 'Loading…' })}</p>
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
                  <Trophy className="h-5 w-5 text-amber-400" />
                  {t('teacherPftBoard', { defaultValue: 'Class fitness test standings' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('teacherPftEmpty', { defaultValue: 'No synced results yet.' })}</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {entries.map((e) => (
                      <li key={`${e.rank}-${e.athleteLabel}`} className="flex justify-between gap-4 border-b border-border/40 pb-2">
                        <span>#{e.rank} {e.athleteLabel}</span>
                        <span className="text-muted-foreground shrink-0">
                          {awardLabel(e.bestTier as FitnessAwardTier)} · {e.score} pts
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/leaderboard?board=presidential-fitness&scope=friends">
                    {t('teacherOpenLeaderboard', { defaultValue: 'Open PFT leaderboard →' })}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="content-card border-dashed">
              <CardHeader>
                <CardTitle className="text-base">{t('teacherWeekOne', { defaultValue: 'Week 1 challenge' })}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button onClick={printChallenge} className="gap-2">
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
      <PftWeekOnePrintSheet className={className} classCode={code} />
    </>
  );
}

export function TeacherClassPage({ code }: { code: string }) {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Loading…</div>}>
      <TeacherClassInner code={code} />
    </Suspense>
  );
}
