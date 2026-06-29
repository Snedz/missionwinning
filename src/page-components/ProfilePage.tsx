'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase, signOut, signInMagic, isPremium, getUser } from "@/lib/supabase";
import i18n from "@/i18n";
import { useWorkoutStore } from "@/store/workoutStore";
import { useUiMode } from "@/hooks/useUiMode";
import { useMissionJourney } from "@/hooks/useMissionJourney";
import { daysSinceCommission } from "@/lib/missionJourney";
import { getBetaFunnelMetrics, getJourneyEvents } from "@/lib/journeyAnalytics";
import { BetaAdminPanel } from "@/components/beta/BetaAdminPanel";
import { MoreSheet } from "@/components/layout/MoreSheet";
import { LayoutGrid } from "lucide-react";

import { scheduleJourneyPush } from '@/lib/journeySync';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';

const LANGS = ['en', 'es', 'fr', 'pt', 'ru', 'de', 'it', 'ko', 'ja', 'th', 'vi', 'hi', 'zh', 'id'] as const;
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
  const { mode, isPro, setUiMode } = useUiMode();
  const { isCommissioned, state, action } = useMissionJourney();
  const [moreOpen, setMoreOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [nudgeLoading, setNudgeLoading] = useState(false);
  const [nudgeSent, setNudgeSent] = useState(false);
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [goals, setGoals] = useState("Build strength and stay healthy");
  const [signInEmail, setSignInEmail] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
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
    window.location.href = "/";
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail) return;
    setSignInLoading(true);
    try {
      await signInMagic(signInEmail);
      alert(`Magic link sent to ${signInEmail}. Check your email and click the link to sign in. Then refresh this page.`);
      setSignInEmail("");
    } catch (err: any) {
      alert("Sign in failed: " + (err.message || "Check your Supabase config and try again."));
    } finally {
      setSignInLoading(false);
    }
  };

  // Light onboarding state
  const [experience, setExperience] = useState(localStorage.getItem('mw_experience') || '');
  const [equipment, setEquipment] = useState(localStorage.getItem('mw_equipment') || '');
  const [primaryGoal, setPrimaryGoal] = useState(localStorage.getItem('mw_primary_goal') || goals);

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
    window.location.href = "/active";
  };

  const completeOnboarding = () => {
    localStorage.setItem('mw_experience', experience);
    localStorage.setItem('mw_equipment', equipment);
    localStorage.setItem('mw_primary_goal', primaryGoal);
    setGoals(primaryGoal);
    localStorage.setItem('mw_goals', primaryGoal);
    scheduleJourneyPush();
    if (!localStorage.getItem('mw_streak')) localStorage.setItem('mw_streak', '1');
  };

  // Owner analytics / revenue stub (bundle members)
  const members = typeof window !== 'undefined' ? parseInt(localStorage.getItem('mw_contributors') || '12400') : 12400;
  const estRevenue = Math.round(members * 12 * 0.3); // rough from bundle subs (demo)

  // Show last assessment (from Assessments free core tool) + quick actions
  const lastAssessment = typeof window !== 'undefined' ? (() => {
    try { return JSON.parse(localStorage.getItem('mw_last_assessment') || 'null'); } catch { return null; }
  })() : null;

  const funnel = getBetaFunnelMetrics(state);

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
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('profileSettings', { defaultValue: 'Profile & Settings' })}</h2>
        {isCommissioned && state.commissionedAt && (
          <p className="text-sm text-emerald-400 mt-1">
            {t('missionOperator', { defaultValue: 'Mission Operator' })} · Day {daysSinceCommission(state.commissionedAt)}
          </p>
        )}
        <p className="text-muted-foreground">Your Mission Winning account. Global preferences. Premium status.</p>
      </div>

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
            <div className="border border-emerald-500/30 bg-emerald-950/10 p-3 rounded">
              <div className="font-semibold mb-2 text-emerald-400">Sign up or sign in (free magic link)</div>
              <div className="text-xs text-muted-foreground mb-2">
                {t('cloudSyncPending', { defaultValue: 'Sign in to sync journey across devices' })}
              </div>
              <form onSubmit={handleSignIn} className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm bg-background"
                  disabled={signInLoading}
                />
                <Button type="submit" disabled={signInLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {signInLoading ? "Sending magic link..." : "Send Magic Link → Sign In / Sign Up"}
                </Button>
              </form>
              <div className="text-xs text-muted-foreground mt-2">Low-friction email OTP. Enables cloud workout/nutrition sync, real premium status from your enrollments, and cross-device access. No password.</div>
            </div>
          )}
          <div className="text-xs text-muted-foreground">Premium status from Supabase enrollments (demo requests log a lead + grant local access). Full real payments + auth when LLC ready.</div>
        </CardContent>
      </Card>

      <Card className="content-card">
        <CardHeader><CardTitle>{t('appMode', { defaultValue: 'App mode' })}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>{t('simpleMode', { defaultValue: 'Simple' })}</strong> — one clear action each day. Best for most people worldwide.
            <br />
            <strong>{t('proMode', { defaultValue: 'Pro' })}</strong> — full Today view, charts, and all tools.
          </p>
          <div className="flex gap-2">
            <Button
              variant={mode === 'simple' ? 'default' : 'outline'}
              className="flex-1 min-h-[44px]"
              onClick={() => setUiMode('simple')}
            >
              {t('simpleMode', { defaultValue: 'Simple' })}
            </Button>
            <Button
              variant={mode === 'pro' ? 'default' : 'outline'}
              className="flex-1 min-h-[44px]"
              onClick={() => setUiMode('pro')}
            >
              {t('proMode', { defaultValue: 'Pro' })}
            </Button>
          </div>
          {isPro && (
            <Button variant="outline" className="w-full min-h-[44px] gap-2" onClick={() => setMoreOpen(true)}>
              <LayoutGrid className="h-4 w-4" />
              {t('navMore', { defaultValue: 'More tools' })}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
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
                <Button size="sm" variant="outline" onClick={() => window.location.href = '/assessments'}>Retake Assessment</Button>
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
              No assessment yet. <Button size="sm" variant="outline" onClick={() => window.location.href = '/assessments'}>Take the free Readiness Assessment</Button>
              <div className="text-xs mt-1 text-muted-foreground">ParQ-style screen + stage of change. Results guide safe free starters (always available).</div>
            </div>
          )}
          <div className="text-[10px] text-muted-foreground">Core free forever. Premium adds history, deeper coaching forms, and saved programs.</div>
        </CardContent>
      </Card>

      <Card className="border-emerald-500/40 bg-emerald-950/10">
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

      <BetaAdminPanel enabled={!!email} />

      {/* Journey profile — first-time onboarding or edit link */}
      {!isOnboarded ? (
        <Card className="border-emerald-500/40 bg-emerald-950/10">
          <CardHeader><CardTitle>{t('firstTimeSetup', { defaultValue: 'First-time setup' })}</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">Complete this once to personalize your Win Score, muscle readiness, and starting recommendations. Sets your path to dominate.</p>
            <div>
              <label className="text-xs font-medium">Experience Level</label>
              <select value={experience} onChange={e => setExperience(e.target.value)} className="w-full border rounded p-2 bg-background mt-1">
                <option value="">Select...</option>
                <option value="beginner">Beginner (&lt;1 year)</option>
                <option value="intermediate">Intermediate (1-3 years)</option>
                <option value="advanced">Advanced (3+ years)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Equipment Access</label>
              <select value={equipment} onChange={e => setEquipment(e.target.value)} className="w-full border rounded p-2 bg-background mt-1">
                <option value="">Select...</option>
                <option value="bodyweight">Bodyweight / Minimal (park, home)</option>
                <option value="dumbbells">Dumbbells + Bodyweight</option>
                <option value="full-gym">Full Gym / Barbell</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Primary Goal</label>
              <select value={primaryGoal} onChange={e => setPrimaryGoal(e.target.value)} className="w-full border rounded p-2 bg-background mt-1">
                <option value="Build strength and stay healthy">Build strength and stay healthy</option>
                <option value="Build muscle / Hypertrophy">Build muscle / Hypertrophy</option>
                <option value="Lose fat / Get lean">Lose fat / Get lean</option>
                <option value="Get stronger (powerlifting style)">Get stronger (powerlifting style)</option>
                <option value="Conditioning / Athletic performance">Conditioning / Athletic performance</option>
              </select>
            </div>
            <Button onClick={completeOnboarding} disabled={!experience || !equipment} className="w-full">Complete Setup &amp; Seed Your First Win Score</Button>
            <div className="text-xs text-muted-foreground">This unlocks personalized Today hub recommendations and starting challenges. Premium programs expand this further.</div>
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
            <p className="text-muted-foreground truncate">Goal: {primaryGoal || goals}</p>
            <Button variant="outline" className="w-full min-h-[44px]" onClick={() => { window.location.href = '/welcome?edit=1'; }}>
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
              <Button className="mt-2" onClick={() => window.location.href = "/bundle"}>{t('exploreBundle', { defaultValue: 'Explore Super Bundle' })}</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Owner Revenue Snapshot - Cardone-style beta proof + real numbers for founder view */}
      <Card className="border-emerald-500/40 bg-emerald-950/10">
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

      <Card>
        <CardHeader><CardTitle>{t('dataExport', { defaultValue: 'Data Export (Premium Demo)' })}</CardTitle></CardHeader>
        <CardContent>
          <Button onClick={() => {
            const data = {
              workouts: localStorage.getItem('mw_workout_history') || '[]',
              nutrition: localStorage.getItem('mw_nutrition_log') || '[]',
              events: getJourneyEvents(),
              legacyEvents: Object.keys(localStorage).filter(k => k.startsWith('mw_event_')).reduce((acc: Record<string, string | null>, k) => { acc[k] = localStorage.getItem(k); return acc; }, {}),
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mission-winning-data.json';
            a.click();
            URL.revokeObjectURL(url);
          }}>{t('exportData', { defaultValue: 'Export Logs (JSON)' })}</Button>
          <div className="text-xs mt-2">Premium feature stub. Full CSV/PDF in production. (Works for demo even in free.)</div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">More settings (locale, notifications, data export) coming with full backend. Your data stays private and under your control.</div>
      <p className="text-[10px] text-muted-foreground/70 text-center pt-2">Build {APP_BUILD_LABEL}</p>
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  );
}
