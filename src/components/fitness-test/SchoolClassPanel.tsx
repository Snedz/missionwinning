'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Share2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  classJoinUrl,
  getJoinedClassCode,
  joinClass,
  leaveClass,
  loadTeacherClasses,
  normalizeClassCode,
  saveTeacherClass,
} from '@/lib/schoolClass';
import { buildClassInviteShareText, shareText } from '@/lib/shareFitnessMission';

type ClassStatsResponse = {
  code: string;
  className: string | null;
  totalTests: number;
  uniqueAthletes: number;
  tierCounts: Record<string, number>;
  source?: string;
};

export function SchoolClassPanel() {
  const { t } = useTranslation();
  const [joined, setJoined] = useState<string | null>(() =>
    typeof window !== 'undefined' ? getJoinedClassCode() : null
  );
  const [joinInput, setJoinInput] = useState('');
  const [className, setClassName] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ClassStatsResponse | null>(null);
  const [message, setMessage] = useState('');

  const refreshStats = async (code: string) => {
    try {
      const res = await fetch(`/api/school/class/${code}/stats`);
      const data = (await res.json()) as ClassStatsResponse;
      setStats(data);
    } catch {
      setStats(null);
    }
  };

  const handleJoin = () => {
    const code = joinClass(joinInput);
    if (!code) {
      setMessage(t('schoolInvalidCode', { defaultValue: 'Enter a valid class code (e.g. MWA3K9).' }));
      return;
    }
    setJoined(code);
    setJoinInput('');
    setMessage('');
    void refreshStats(code);
  };

  const handleCreate = async () => {
    const record = saveTeacherClass(className || t('schoolDefaultName', { defaultValue: 'PE Class' }));
    setCreatedCode(record.code);
    setClassName('');
    setMessage(t('schoolCreated', { defaultValue: 'Class created — share the code with students.' }));

    try {
      await fetch('/api/school/class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: record.code, name: record.name }),
      });
    } catch {
      /* local-only ok */
    }
  };

  const handleLeave = () => {
    leaveClass();
    setJoined(null);
    setStats(null);
  };

  const copyInvite = async (code: string, name: string) => {
    const text = buildClassInviteShareText(code, name);
    const result = await shareText(text);
    if (result === 'copied') {
      setMessage(t('schoolInviteCopied', { defaultValue: 'Invite link copied.' }));
    }
  };

  const teacherClasses = typeof window !== 'undefined' ? loadTeacherClasses() : [];

  return (
    <Card className="content-card border-blue-800/25">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-blue-400" />
          {t('schoolTitle', { defaultValue: 'School & PE class' })}
        </CardTitle>
        <CardDescription>
          {t('schoolDesc', {
            defaultValue:
              'Teachers create a class code. Students join and sync fitness test results when signed in — aggregate stats only on the leaderboard card.',
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {joined ? (
          <div className="rounded-xl border border-blue-500/20 bg-blue-950/15 px-4 py-3 space-y-2">
            <p className="font-medium">
              {t('schoolJoined', { defaultValue: 'Joined class' })}:{' '}
              <span className="font-mono text-blue-300">{joined}</span>
            </p>
            {stats && (
              <p className="text-xs text-muted-foreground">
                {t('schoolStats', {
                  defaultValue: '{{tests}} tests · {{athletes}} athletes synced',
                  tests: stats.totalTests,
                  athletes: stats.uniqueAthletes,
                })}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/school/class/${joined}`}>
                  {t('schoolTeacherDashboard', { defaultValue: 'Teacher dashboard →' })}
                </Link>
              </Button>
              <Button size="sm" variant="outline" onClick={() => void refreshStats(joined)}>
                {t('schoolRefreshStats', { defaultValue: 'Refresh stats' })}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleLeave}>
                {t('schoolLeave', { defaultValue: 'Leave class' })}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value)}
              placeholder={t('schoolJoinPlaceholder', { defaultValue: 'MWA3K9' })}
              className="flex-1 rounded-md bg-background border border-border px-3 py-2 text-sm font-mono uppercase"
            />
            <Button onClick={handleJoin}>{t('schoolJoin', { defaultValue: 'Join class' })}</Button>
          </div>
        )}

        <div className="border-t border-border/50 pt-4 space-y-2">
          <p className="text-sm font-medium">{t('schoolCreateTitle', { defaultValue: 'Create a class' })}</p>
          <input
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder={t('schoolNamePlaceholder', { defaultValue: 'Mrs. Smith — 5th Grade PE' })}
            className="w-full rounded-md bg-background border border-border px-3 py-2 text-sm"
          />
          <Button variant="outline" className="w-full" onClick={() => void handleCreate()}>
            {t('schoolCreate', { defaultValue: 'Generate class code' })}
          </Button>
          {createdCode && (
            <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-sm rounded-lg bg-black/20 px-3 py-2">
              <span className="font-mono text-blue-300">{createdCode}</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    void navigator.clipboard?.writeText(classJoinUrl(createdCode));
                    setMessage(t('schoolLinkCopied', { defaultValue: 'Join link copied.' }));
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    void copyInvite(createdCode, className || 'PE Class')
                  }
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link href={`/school/class/${createdCode}`}>
                {t('schoolTeacherDashboard', { defaultValue: 'Teacher dashboard →' })}
              </Link>
            </Button>
            </div>
          )}
        </div>

        {teacherClasses.length > 0 && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>{t('schoolYourClasses', { defaultValue: 'Your saved classes:' })}</p>
            {teacherClasses.slice(0, 3).map((c) => (
              <div key={c.code} className="flex justify-between font-mono">
                <span>{c.name}</span>
                <button
                  type="button"
                  className="text-blue-400 hover:underline"
                  onClick={() => {
                    setJoinInput(c.code);
                    const code = normalizeClassCode(c.code);
                    if (code) void copyInvite(code, c.name);
                  }}
                >
                  {c.code}
                </button>
              </div>
            ))}
          </div>
        )}

        {message && <p className="text-xs text-emerald-400">{message}</p>}
      </CardContent>
    </Card>
  );
}
