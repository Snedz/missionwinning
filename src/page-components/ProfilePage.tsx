'use client';
/**
 * Page: /profile — account, settings, backup
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useTranslation } from "react-i18next";
import { User } from 'lucide-react';
import { formatStoredGoal } from '@/lib/journeyGoals';
import { supabase, signOut, getUser } from "@/lib/supabase";
import { SignInPanel } from "@/components/auth/SignInPanel";
import i18n from "@/i18n";
import { useWorkoutStore } from "@/store/workoutStore";
import { useMissionJourney } from "@/hooks/useMissionJourney";
import { daysSinceCommission } from "@/lib/missionJourney";
import { getBetaFunnelMetrics, getJourneyEvents } from "@/lib/journeyAnalytics";
import { BetaAdminPanel } from "@/components/beta/BetaAdminPanel";

import { scheduleJourneyPush } from '@/lib/journeySync';
import { LegalNav } from '@/components/layout/LegalNav';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { showOwnerTools } from '@/lib/ownerTools';
import { downloadBackup, restoreBackupFromJson } from '@/lib/backup';
import { useToast } from '@/hooks/use-toast';
import { track } from '@/lib/analytics';
import {
  loadDaysPerWeek,
  saveDaysPerWeek,
} from '@/lib/coach/schedulePrefs';

const DAYS_PER_WEEK_OPTIONS = [2, 3, 4, 5, 6] as const;

const LANGS = ['en', 'es', 'fr', 'pt', 'ru', 'de', 'it', 'ko', 'ja', 'th', 'vi', 'hi', 'zh', 'id', 'ar'] as const;
const NATIVE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  ru: 'Русский',
  de: 'Deutsch',
  it: 'Italiano',
  ko: '한국어',
  ja: '日本語',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  hi: 'हिन्दी',
  zh: '中文',
  id: 'Bahasa Indonesia',
  ar: 'العربية',
};

function LanguageSwitcher() {
  const { t } = useTranslation();
  const currentLang = i18n.language.split('-')[0];
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    scheduleJourneyPush();
  };
  return (
    <div className="space-y-1">
      <select
        value={currentLang}
        onChange={(e) => changeLanguage(e.target.value)}
        className="w-full text-sm bg-background border border-border/50 rounded px-3 py-2"
        aria-label={t('changeLanguage', { defaultValue: 'Change language' })}
      >
        {LANGS.map(l => (
          <option key={l} value={l}>{NATIVE_NAMES[l]}</option>
        ))}
      </select>
    </div>
  );
}

export function ProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const { isCommissioned, state, action } = useMissionJourney();
  const [email, setEmail] = useState<string | null>(null);
  const [nudgeLoading, setNudgeLoading] = useState(false);
  const [nudgeSent, setNudgeSent] = useState(false);
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [goals, setGoals] = useState("Build strength and stay healthy");
  const [premium, setPremium] = useState(false);
  const [reminders, setReminders] = useState(false);
  const [remindersBusy, setRemindersBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
      if (data.user?.id) {
        supabase
          .from('profiles')
          .select('reminders_opt_in')
          .eq('id', data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) setReminders(!!profile.reminders_opt_in);
          });
      }
    });
    const savedUnits = localStorage.getItem("mw_units") as "metric" | "imperial" | null;
    if (savedUnits) setUnits(savedUnits);
    const savedGoals = localStorage.getItem("mw_goals");
    if (savedGoals) setGoals(savedGoals);

    // Use real premium check (DB if logged in, demo local fallback)
    import("@/lib/supabase").then(({ isPremium }) => {
      isPremium().then(setPremium);
    });
  }, []);

  const toggleReminders = async () => {
    if (remindersBusy) return;
    setRemindersBusy(true);
    const next = !reminders;
    const { data } = await supabase.auth.getUser();
    if (data.user?.id) {
      const { error } = await supabase
        .from('profiles')
        .update({ reminders_opt_in: next })
        .eq('id', data.user.id);
      if (!error) setReminders(next);
      else
        toast({
          title: t('remindersUpdateFailed', { defaultValue: 'Could not update reminders' }),
          description: t('remindersUpdateFailedDesc', { defaultValue: 'Try again in a moment.' }),
          variant: 'destructive',
        });
    }
    setRemindersBusy(false);
  };

  const saveUnits = (u: "metric" | "imperial") => {
    setUnits(u);
    localStorage.setItem("mw_units", u);
    scheduleJourneyPush();
  };

  const saveGoals = () => {
    localStorage.setItem("mw_goals", goals);
    scheduleJourneyPush();
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Light onboarding state
  const [experience] = useState(localStorage.getItem('mw_experience') || '');
  const [equipment] = useState(localStorage.getItem('mw_equipment') || '');
  const [daysPerWeek, setDaysPerWeek] = useState(() =>
    loadDaysPerWeek(localStorage.getItem('mw_experience') || 'beginner')
  );
  const [primaryGoal] = useState(localStorage.getItem('mw_primary_goal') || goals);

  const isOnboarded = !!(localStorage.getItem('mw_experience') && localStorage.getItem('mw_equipment'));

  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const launchFromAssessment = (risk: string) => {
    let name = "Daily Mobility + Mind Habit";
    let exs = [
      { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
    ];
    if (risk === 'low') {
      name = "Full Body Habit Builder";
      exs = [
        { exerciseId: "push-ups", sets: [{ reps: 10, weight: 0 }] },
        { exerciseId: "squats", sets: [{ reps: 12, weight: 0 }] },
        { exerciseId: "glute-bridge", sets: [{ reps: 12, weight: 0 }] },
        { exerciseId: "plank", sets: [{ reps: 25, weight: 0 }] },
      ];
    } else if (risk === 'moderate') {
      name = "Bodyweight Strength Circuit";
      exs = [
        { exerciseId: "push-ups", sets: [{ reps: 12, weight: 0 }] },
        { exerciseId: "squats", sets: [{ reps: 12, weight: 0 }] },
        { exerciseId: "inverted-row", sets: [{ reps: 8, weight: 0 }] },
        { exerciseId: "lunges", sets: [{ reps: 10, weight: 0 }] },
        { exerciseId: "plank", sets: [{ reps: 30, weight: 0 }] },
      ];
    }
    startWorkout(name, exs);
    router.push("/active");
  };

  // Owner analytics / revenue stub (bundle members)
  const members = typeof window !== 'undefined' ? parseInt(localStorage.getItem('mw_contributors') || '12400') : 12400;
  const estRevenue = Math.round(members * 12 * 0.3); // rough from bundle subs (demo)

  // Show last assessment (from Assessments free core tool) + quick actions
  const lastAssessment = typeof window !== 'undefined' ? (() => {
    try { return JSON.parse(localStorage.getItem('mw_last_assessment') || 'null'); } catch { return null; }
  })() : null;

  const funnel = getBetaFunnelMetrics(state);
  const ownerTools = showOwnerTools();

  const handleEmailNudge = async () => {
    setNudgeLoading(true);
    setNudgeSent(false);
    try {
      const res = await fetch('/api/journey/nudge', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: action.label,
          description: action.description,
          href: action.href,
          stepLabel: action.stepLabel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send email');
      setNudgeSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Email not available';
      alert(msg);
    } finally {
      setNudgeLoading(false);
    }
  };

  return (
    <PillarPageShell
      icon={User}
      eyebrow={t('profileEyebrow', { defaultValue: 'You' })}
      title={t('profileSettings', { defaultValue: 'Profile & Settings' })}
      subtitle={
        isCommissioned && state.commissionedAt
          ? `${t('missionOperator', { defaultValue: 'Mission Operator' })} · Day ${daysSinceCommission(state.commissionedAt)}`
          : t('profileSubtitle', {
              defaultValue: 'Your Mission Winning account. Global preferences. Premium status.',
            })
      }
    >
      <Card>
        <CardHeader><CardTitle>{t('account', { defaultValue: 'Account & Sign In' })}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {email ? (
            <>
              <div>Signed in as <span className="font-mono text-emerald-400">{email}</span></div>
              <Button variant="outline" onClick={handleSignOut}>{t('signOut', { defaultValue: 'Sign Out' })}</Button>
              <div className="text-xs text-emerald-400/90">
                {t('cloudSyncActive', { defaultValue: 'Journey synced to cloud' })}
              </div>
              <div className="text-xs text-muted-foreground">
                Journey phase, preferences, and milestones merge across devices on sign-in.
              </div>
            </>
          ) : (
            <div className="auth-panel rounded-xl p-4">
              <div className="font-semibold mb-1 text-emerald-400">Sign up or sign in</div>
              <div className="text-xs text-muted-foreground mb-4">
                {t('cloudSyncPending', { defaultValue: 'Sign in to sync journey across devices' })}
              </div>
              <SignInPanel nextPath="/profile" compact />
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            {ownerTools
              ? 'Premium status from Supabase enrollments (demo requests log a lead + grant local access). Full real payments + auth when LLC ready.'
              : t('premiumStatusFoot', { defaultValue: 'Premium unlocks via Super Bundle subscription.' })}
          </div>
        </CardContent>
      </Card>

      {email && (
        <Card>
          <CardHeader>
            <CardTitle>{t('remindersTitle', { defaultValue: 'Training reminders' })}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {t('remindersDesc', {
                defaultValue:
                  'Occasional emails when your streak is at risk or you go quiet — never more than one every two days. One-tap unsubscribe in every email.',
              })}
            </p>
            <Button
              variant={reminders ? 'default' : 'outline'}
              disabled={remindersBusy}
              onClick={toggleReminders}
              className="shrink-0"
              aria-pressed={reminders}
            >
              {reminders
                ? t('remindersOn', { defaultValue: 'On' })
                : t('remindersOff', { defaultValue: 'Off' })}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="content-card">
        <CardHeader><CardTitle>{t('units', { defaultValue: 'Units' })}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant={units === "metric" ? "default" : "outline"} onClick={() => saveUnits("metric")}>{t('metric', { defaultValue: 'Metric (kg, cm)' })}</Button>
            <Button variant={units === "imperial" ? "default" : "outline"} onClick={() => saveUnits("imperial")}>{t('imperial', { defaultValue: 'Imperial (lbs, in)' })}</Button>
          </div>
          <div className="text-xs mt-2 text-muted-foreground">Affects calculators and future logs. (Global default metric for accessibility.)</div>
        </CardContent>
      </Card>

      {/* Language switcher - same improved native dropdown as Sidebar for discoverability */}
      <Card>
        <CardHeader><CardTitle>{t('language', { defaultValue: 'Language' })}</CardTitle></CardHeader>
        <CardContent>
          <LanguageSwitcher />
          <div className="text-xs mt-2 text-muted-foreground">Switch the app language. Names shown in their native form so it's clear in any language.</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('trainingGoals', { defaultValue: 'Training Goals' })}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <textarea 
            className="w-full border rounded p-2 bg-background" 
            value={goals} 
            onChange={e => setGoals(e.target.value)}
            rows={3}
          />
          <Button onClick={saveGoals}>{t('saveGoals', { defaultValue: 'Save Goals' })}</Button>
          <div className="text-xs">Used for program recommendations (future personalization).</div>
        </CardContent>
      </Card>

      {/* Last Readiness Assessment (free core, persisted) */}
      <Card>
        <CardHeader><CardTitle>Readiness Assessment</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          {lastAssessment ? (
            <>
              <div>
                <span className="font-medium">Last result:</span> <span className="uppercase font-semibold">{lastAssessment.risk}</span> risk
                <span className="text-xs text-muted-foreground ml-2">({lastAssessment.date})</span>
              </div>
              <div className="text-muted-foreground">{lastAssessment.notes}</div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => router.push('/assessments')}>{t('retake', { defaultValue: 'Retake Assessment' })}</Button>
                <Button size="sm" onClick={() => launchFromAssessment(lastAssessment.risk)}>Start recommended starter for {lastAssessment.risk} risk →</Button>
                <Button size="sm" variant="ghost" onClick={async () => {
                  const u = await getUser();
                  const today = new Date().toISOString().split('T')[0];
                  if (u) await (await import('@/lib/supabase')).saveNutritionEntry({ date: today, name: 'Assessment Win from Profile', protein: 0, cals: 0 });
                  alert('Win logged! +1 streak.');
                }}>Log assessment win (+cloud)</Button>
              </div>
            </>
          ) : (
            <div>
              No assessment yet. <Button size="sm" variant="outline" onClick={() => router.push('/assessments')}>{t('takeAssessment', { defaultValue: 'Take the free Readiness Assessment' })}</Button>
              <div className="text-xs mt-1 text-muted-foreground">ParQ-style screen + stage of change. Results guide safe free starters (always available).</div>
            </div>
          )}
          <div className="text-[10px] text-muted-foreground">Core free forever. Premium adds history, deeper coaching forms, and saved programs.</div>
        </CardContent>
      </Card>

      <Card className="content-card border-emerald-500/40 bg-emerald-950/10">
        <CardHeader>
          <CardTitle>{t('betaJourneyProgress', { defaultValue: 'Beta journey progress' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border/50 p-3">
              <div className="text-xs text-muted-foreground">Phase</div>
              <div className="font-semibold capitalize">{funnel.phase.replace('-', ' ')}</div>
            </div>
            <div className="rounded-lg border border-border/50 p-3">
              <div className="text-xs text-muted-foreground">Events</div>
              <div className="font-semibold">{funnel.eventCount}</div>
            </div>
            <div className="rounded-lg border border-border/50 p-3">
              <div className="text-xs text-muted-foreground">I-Day</div>
              <div className="font-semibold">{funnel.iDayComplete ? '✓ Done' : '—'}</div>
            </div>
            <div className="rounded-lg border border-border/50 p-3">
              <div className="text-xs text-muted-foreground">Basic Training</div>
              <div className="font-semibold">{funnel.basicDone}/{funnel.basicTotal}</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Beta targets: I-Day ≥80%, commissioned ≥25% in 14 days. Phase transitions log as{' '}
            <code className="text-[10px]">journey_phase_complete</code>.
          </p>
          {email && !isCommissioned && (
            <Button
              variant="outline"
              className="w-full min-h-[44px]"
              disabled={nudgeLoading}
              onClick={handleEmailNudge}
            >
              {nudgeLoading
                ? 'Sending…'
                : t('emailNextStep', { defaultValue: 'Email my next step' })}
            </Button>
          )}
          {nudgeSent && (
            <p className="text-xs text-emerald-400">
              {t('emailNextStepSent', { defaultValue: 'Check your inbox for your next step.' })}
            </p>
          )}
        </CardContent>
      </Card>

      {ownerTools && <BetaAdminPanel enabled={!!email} />}

      {/* Journey profile — first-time onboarding or edit link */}
      {!isOnboarded ? (
        <Card className="content-card border-emerald-500/40 bg-emerald-950/10">
          <CardHeader><CardTitle>{t('firstTimeSetup', { defaultValue: 'First-time setup' })}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Complete I-Day to personalize workouts and Today recommendations (~2 minutes).
            </p>
            <Button className="w-full min-h-[44px]" onClick={() => router.push('/welcome')}>
              {t('welcomeBegin', { defaultValue: 'Begin I-Day' })}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>{t('editJourneyProfile', { defaultValue: 'Edit journey profile' })}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Experience: <span className="text-foreground capitalize">{experience || '—'}</span>
              {' · '}
              Equipment: <span className="text-foreground capitalize">{equipment?.replace('-', ' ') || '—'}</span>
            </p>
            <p className="text-muted-foreground truncate">
              Goal: {formatStoredGoal(primaryGoal || goals, t)}
            </p>
            <div className="space-y-2">
              <span className="text-muted-foreground">
                {t('coachDaysPerWeek', { defaultValue: 'How many days a week?' })}
              </span>
              <div className="flex flex-wrap gap-2">
                {DAYS_PER_WEEK_OPTIONS.map((n) => (
                  <Button
                    key={n}
                    type="button"
                    size="sm"
                    variant={daysPerWeek === n ? 'default' : 'outline'}
                    className={daysPerWeek === n ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                    onClick={() => {
                      setDaysPerWeek(n);
                      saveDaysPerWeek(n);
                      scheduleJourneyPush();
                    }}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
            <Button variant="outline" className="w-full min-h-[44px]" onClick={() => router.push('/welcome?edit=1')}>
              {t('editJourneyProfile', { defaultValue: 'Edit journey profile' })}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>{t('premiumStatus', { defaultValue: 'Premium Status' })}</CardTitle></CardHeader>
        <CardContent>
          {premium ? (
            <div className="text-emerald-400 font-medium">{t('premiumUnlocked', { defaultValue: '✓ Premium unlocked (via Super Bundle or demo request)' })}</div>
          ) : (
            <div>
              {t('noPremium', { defaultValue: 'Free tier active. Unlock full library cues, deep nutrition, mobility flows, mind sessions, advanced programs, and analytics via the Super Bundle or specialist programs.' })}
              <Button className="mt-2" onClick={() => router.push('/bundle')}>{t('exploreBundle', { defaultValue: 'Explore Super Bundle' })}</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {ownerTools && (
      <>
      {/* Owner Revenue Snapshot - founder view only */}
      <Card className="content-card border-emerald-500/40 bg-emerald-950/10">
        <CardHeader><CardTitle>{t('revenueSnapshot', { defaultValue: 'Super Bundle Snapshot (Demo)' })}</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span>{t('spotsClaimed', { defaultValue: 'Members' })}:</span> <span className="font-mono text-emerald-400">{members.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>{t('estRevenue', { defaultValue: 'Est. revenue from bundles' })}:</span> <span className="font-mono text-emerald-400">${estRevenue.toLocaleString()}</span></div>
          <div className="text-xs text-muted-foreground">{t('avgTicket', { defaultValue: 'Avg bundle ~$12/mo' })} — Super Bundle sustains the free core for the global mission. Track real via Supabase later.</div>
          <div className="text-[10px] mt-1">Members who join the bundle help make the free path available worldwide. Share wins → /feedback.</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('demoAnalytics', { defaultValue: 'Demo Analytics (Events)' })}</CardTitle></CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => {
            const events = getJourneyEvents();
            const legacy = Object.keys(localStorage).filter(k => k.startsWith('mw_event_')).map(k => ({ key: k, val: localStorage.getItem(k) }));
            console.log('Mission Winning Journey Events:', events);
            console.log('Legacy mw_event_* keys:', legacy);
            alert(`${events.length} journey events (${events.filter(e => e.name === 'journey_phase_complete').length} phase completes). See console for details.`);
          }}>{t('viewEvents', { defaultValue: 'View Tracked Events (console)' })}</Button>
          <div className="text-xs mt-2">Tracks journey phases, milestones, bundle CTAs, feedback, and installs. Syncs to Supabase when signed in.</div>
        </CardContent>
      </Card>
      </>
      )}

      <Card>
        <CardHeader><CardTitle>{t('dataBackup', { defaultValue: 'Back up your data' })}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={() => {
                downloadBackup();
                track('backup_exported');
              }}
            >
              {t('exportData', { defaultValue: 'Download backup (JSON)' })}
            </Button>
            <Button
              variant="outline"
              onClick={() => document.getElementById('mw-backup-file')?.click()}
            >
              {t('importData', { defaultValue: 'Restore from backup' })}
            </Button>
            <input
              id="mw-backup-file"
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const result = restoreBackupFromJson(String(reader.result ?? ''));
                  if (!result.ok) {
                    toast({
                      title: t('importFailed', { defaultValue: 'Restore failed' }),
                      description: result.error,
                      variant: 'destructive',
                    });
                    return;
                  }
                  track('backup_restored', { workouts: result.workoutsMerged ?? 0 });
                  toast({
                    title: t('importDone', { defaultValue: 'Backup restored' }),
                    description: t('importDoneDesc', {
                      defaultValue: '{{workouts}} workouts merged, {{keys}} settings restored. Reloading…',
                      workouts: result.workoutsMerged ?? 0,
                      keys: result.keysRestored ?? 0,
                    }),
                  });
                  setTimeout(() => router.refresh(), 1200);
                };
                reader.readAsText(file);
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {t('dataBackupFoot', {
              defaultValue:
                'The backup includes workouts, saved routines, nutrition, and journey progress from this device. Restoring merges — nothing on this device is deleted.',
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="content-card">
        <CardContent className="pt-6">
          <p className="text-sm font-medium mb-3">
            {t('infoProfileHelpTitle', { defaultValue: 'Help & legal' })}
          </p>
          <LegalNav />
        </CardContent>
      </Card>
    </PillarPageShell>
  );
}
