import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase, signOut } from "@/lib/supabase";
import i18n from "@/i18n";

const LANGS = ['en', 'es', 'fr', 'pt', 'ru'] as const;
const NATIVE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  ru: 'Русский',
};

function LanguageSwitcher() {
  const { t } = useTranslation();
  const currentLang = i18n.language.split('-')[0];
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
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
  const [email, setEmail] = useState<string | null>(null);
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [goals, setGoals] = useState("Build strength and stay healthy");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
    const savedUnits = localStorage.getItem("mw_units") as "metric" | "imperial" | null;
    if (savedUnits) setUnits(savedUnits);
    const savedGoals = localStorage.getItem("mw_goals");
    if (savedGoals) setGoals(savedGoals);
  }, []);

  const saveUnits = (u: "metric" | "imperial") => {
    setUnits(u);
    localStorage.setItem("mw_units", u);
  };

  const saveGoals = () => {
    localStorage.setItem("mw_goals", goals);
    alert("Goals saved (local for now; will sync with profile on Supabase).");
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const premium = typeof window !== "undefined" && localStorage.getItem("mw_premium") === "true";

  // Light onboarding state
  const [experience, setExperience] = useState(localStorage.getItem('mw_experience') || '');
  const [equipment, setEquipment] = useState(localStorage.getItem('mw_equipment') || '');
  const [primaryGoal, setPrimaryGoal] = useState(localStorage.getItem('mw_primary_goal') || goals);

  const isOnboarded = !!(localStorage.getItem('mw_experience') && localStorage.getItem('mw_equipment'));

  const completeOnboarding = () => {
    localStorage.setItem('mw_experience', experience);
    localStorage.setItem('mw_equipment', equipment);
    localStorage.setItem('mw_primary_goal', primaryGoal);
    setGoals(primaryGoal);
    saveGoals();
    alert('Mission setup complete! Your Win Score and recommendations will now personalize. Start with a quick workout from the Dashboard.');
    // Seed initial Win Score hint
    if (!localStorage.getItem('mw_streak')) localStorage.setItem('mw_streak', '1');
  };

  // Owner analytics / revenue stub (beta spots drive est. locked revenue)
  const spotsClaimed = typeof window !== 'undefined' ? parseInt(localStorage.getItem('mw_beta_spots_claimed') || '347') : 347;
  const estRevenue = Math.round(spotsClaimed * 347); // avg from beta pricing mix

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('profileSettings', { defaultValue: 'Profile & Settings' })}</h2>
        <p className="text-muted-foreground">Your Mission Winning account. Global preferences. Premium status.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('account', { defaultValue: 'Account' })}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>{email ? `Signed in as ${email}` : "Not signed in (sign in from sidebar for sync)"}</div>
          {email && <Button variant="outline" onClick={handleSignOut}>{t('signOut', { defaultValue: 'Sign Out' })}</Button>}
          <div className="text-xs text-muted-foreground">Cloud sync + real premium checks coming with full Supabase setup (see SETUP.md).</div>
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

      {/* Light first-run onboarding for progression (goals, experience, equipment) */}
      {!isOnboarded && (
        <Card className="border-emerald-500/40 bg-emerald-950/10">
          <CardHeader><CardTitle>🚀 Mission Setup (First-Time Onboarding)</CardTitle></CardHeader>
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
      )}

      <Card>
        <CardHeader><CardTitle>{t('premiumStatus', { defaultValue: 'Premium Status' })}</CardTitle></CardHeader>
        <CardContent>
          {premium ? (
            <div className="text-emerald-400 font-medium">{t('premiumUnlocked', { defaultValue: '✓ Premium unlocked (via program purchase or demo)' })}</div>
          ) : (
            <div>
              {t('noPremium', { defaultValue: 'Free tier active. Unlock full library, nutrition, advanced programs, and analytics by purchasing a specialist program or Premium sub.' })}
              <Button className="mt-2" onClick={() => window.location.href = "/programs"}>{t('explorePrograms', { defaultValue: 'Explore Programs' })}</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Owner Revenue Snapshot - Cardone-style beta proof + real numbers for founder view */}
      <Card className="border-emerald-500/40 bg-emerald-950/10">
        <CardHeader><CardTitle>{t('revenueSnapshot', { defaultValue: 'Beta Revenue Snapshot (Demo)' })}</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span>{t('spotsClaimed', { defaultValue: 'Spots claimed' })}:</span> <span className="font-mono text-emerald-400">{spotsClaimed}/500</span></div>
          <div className="flex justify-between"><span>{t('estRevenue', { defaultValue: 'Est. Beta Founders revenue locked' })}:</span> <span className="font-mono text-emerald-400">${estRevenue.toLocaleString()}</span></div>
          <div className="text-xs text-muted-foreground">{t('avgTicket', { defaultValue: 'Avg ticket ~$347' })} — one-time specialist programs + unlocks. Track real via Supabase enrollments later. Massive action compounds.</div>
          <div className="text-[10px] mt-1">Beta Founders who took massive action early lock lifetime pricing and shape the product. Share wins → /feedback.</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('demoAnalytics', { defaultValue: 'Demo Analytics (Beta Events)' })}</CardTitle></CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => {
            const events = Object.keys(localStorage).filter(k => k.startsWith('mw_event_')).map(k => ({key: k, val: localStorage.getItem(k)}));
            console.log('Mission Winning Analytics Events:', events);
            alert('Events logged to console (open dev tools). ' + events.length + ' tracked actions (enrolls, feedback, PWA, etc.). Full Supabase analytics in next phase.');
          }}>{t('viewEvents', { defaultValue: 'View Tracked Events (console)' })}</Button>
          <div className="text-xs mt-2">Tracks beta CTAs, feedback, installs, program views for owner insights and A/B. Share /feedback to build social proof.</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('dataExport', { defaultValue: 'Data Export (Premium Demo)' })}</CardTitle></CardHeader>
        <CardContent>
          <Button onClick={() => {
            const data = {
              workouts: localStorage.getItem('mw_workout_history') || '[]',
              nutrition: localStorage.getItem('mw_nutrition_log') || '[]',
              events: Object.keys(localStorage).filter(k => k.startsWith('mw_event_')).reduce((acc: any, k) => { acc[k] = localStorage.getItem(k); return acc; }, {}),
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
    </div>
  );
}
