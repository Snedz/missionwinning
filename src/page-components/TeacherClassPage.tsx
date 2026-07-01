'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Flag, Printer, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PftWeekOnePrintSheet } from '@/components/fitness-test/PftWeekOnePrintSheet';
import { awardLabel, type FitnessAwardTier } from '@/lib/presidentialFitnessTest';
import { normalizeClassCode, classJoinUrl } from '@/lib/schoolClass';
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

type Props = {
  code: string;
};

export function TeacherClassPage({ code: rawCode }: Props) {
  const { t } = useTranslation();
  const code = normalizeClassCode(rawCode) ?? rawCode.toUpperCase();
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [entries, setEntries] = useState<ClassPftEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const className = stats?.className ?? t('schoolDefaultName', { defaultValue: 'PE Class' });

  useEffect(() => {
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
  }, [code]);

  const printChallenge = () => {
    window.print();
  };

  const copyChallenge = async () => {
    const text = formatWeekOneChallengeText(className, code);
    await navigator.clipboard?.writeText(text);
  };

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
            <Link href="/america">{t('pftBackBenchmarks', { defaultValue: 'Back' })} → /america</Link>
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm">{t('teacherLoading', { defaultValue: 'Loading class data…' })}</p>
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
                  <p className="text-sm text-muted-foreground">
                    {t('teacherPftEmpty', {
                      defaultValue:
                        'No synced results yet. Students join the class, sign in, and complete /fitness-test.',
                    })}
                  </p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {entries.map((e) => (
                      <li
                        key={`${e.rank}-${e.athleteLabel}`}
                        className="flex justify-between gap-4 border-b border-border/40 pb-2"
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
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href={`/leaderboard?scope=friends`}>
                    {t('teacherOpenLeaderboard', { defaultValue: 'Open squad leaderboard →' })}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="content-card border-dashed">
              <CardHeader>
                <CardTitle className="text-base">
                  {t('teacherWeekOne', { defaultValue: 'Week 1 challenge (printable)' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button onClick={printChallenge} className="gap-2">
                  <Printer className="h-4 w-4" />
                  {t('teacherPrint', { defaultValue: 'Print challenge' })}
                </Button>
                <Button variant="outline" onClick={() => void copyChallenge()}>
                  {t('teacherCopyPlan', { defaultValue: 'Copy plan text' })}
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
