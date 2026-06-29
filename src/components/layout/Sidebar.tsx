'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell,
  History,
  Home,
  BarChart3,
  PenTool,
  Zap,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkoutStore } from "@/store/workoutStore";
import { useTranslation } from "react-i18next";
import { supabase, signInMagic, signOut, isPremium } from "@/lib/supabase";

const navItems = [
  // Train (free core + premium Coach)
  { to: "/log", label: "Dashboard", icon: Home, group: "Train" },
  { to: "/active", label: "Active Workout", icon: Zap, group: "Train" },
  { to: "/builder", label: "Builder", icon: PenTool, group: "Train" },
  { to: "/library", label: "Library", icon: BarChart3, group: "Train" },
  { to: "/benchmarks", label: "Benchmarks", icon: BarChart3, group: "Train" },
  // Fuel (free basics + premium)
  { to: "/nutrition", label: "Nutrition", icon: BarChart3, group: "Fuel" },
  { to: "/calculators", label: "Calculators", icon: BarChart3, group: "Fuel" },
  { to: "/assessments", label: "Assessments", icon: BarChart3, group: "Fuel" },
  // Move (mobility + yoga — free entry + premium)
  { to: "/move", label: "Move & Mobility", icon: BarChart3, group: "Move" },
  // Mind (mindfulness — free entry + premium)
  { to: "/mind", label: "Mind & Recovery", icon: BarChart3, group: "Mind" },
  // Track (activity — free manual log + premium GPS)
  { to: "/track", label: "Track Activity", icon: MapPin, group: "Track" },
  // Progress
  { to: "/history", label: "History", icon: History, group: "Progress" },
  // Learn (education pillar — free intros + premium programs)
  { to: "/learn", label: "Learn & Master", icon: BarChart3, group: "Learn" },
  // You
  { to: "/profile", label: "Profile", icon: BarChart3, group: "You" },
  // Bundle hub (Super Bundle promo)
  { to: "/bundle", label: "Super Bundle", icon: BarChart3, group: "Bundle" },
];

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showSignin, setShowSignin] = useState(false);
  const [signinEmail, setSigninEmail] = useState("");
  const [premium, setPremium] = useState(false);

  // Language switcher: native names + dropdown so it makes sense even when the UI is in a non-English language.
  // Users who only read Spanish, French, etc. can now discover and use it without needing English.
  const LANGS = ['en', 'es', 'fr', 'pt', 'ru'] as const;
  const NATIVE_NAMES: Record<string, string> = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    pt: 'Português',
    ru: 'Русский',
  };
  const currentLang = i18n.language.split('-')[0];
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Simple auth listener + premium check (call on mount / after signin)
  React.useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted && data.user?.email) {
        setUserEmail(data.user.email);
        isPremium().then(p => mounted && setPremium(p));
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        isPremium().then(p => setPremium(p));
        // Load cloud data on sign in
        useWorkoutStore.getState().loadFromCloud();
      } else {
        setUserEmail(null);
        setPremium(false);
      }
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const handleMagic = async () => {
    if (!signinEmail) return;
    try {
      await signInMagic(signinEmail);
      alert("Magic link sent — check email and click to sign in. (Check spam too)");
      setShowSignin(false);
      setSigninEmail("");
    } catch (e: any) {
      alert("Sign in error: " + (e.message || e));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUserEmail(null);
    setPremium(false);
  };

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border/60 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
          <Dumbbell className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight">MISSION WINNING</h1>
          <p className="text-xs text-muted-foreground">Train. Win. Daily.</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {(() => {
          const pathname = usePathname();
          const groups: Record<string, typeof navItems> = {};
          navItems.forEach(item => {
            const g = (item as any).group || 'Other';
            if (!groups[g]) groups[g] = [];
            groups[g].push(item as any);
          });
          return Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-2">
              <div className="px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground/70">{group}</div>
              {items.map(({ to, label, icon: Icon }) => {
                const isActive = pathname === to || (to === '/log' && pathname === '/');
                return (
                  <Link
                    key={to}
                    href={to}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {t(label.toLowerCase(), { defaultValue: label })}
                    {to === "/active" && activeWorkout && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-secondary animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          ));
        })()}
      </nav>

      <div className="border-t border-border/60 p-4 space-y-3 text-xs">
        <a href="/" className="block text-emerald-400 hover:text-emerald-300">← Back to Mission Winning</a>
        <a href="/vision" className="block text-xs text-white/50 hover:text-white/70">vision.md — the path for all</a>
        <a href="/learn" className="block text-muted-foreground hover:text-foreground">View Education Programs (free intros)</a>
        <a href="/feedback" className="block text-emerald-400 hover:text-emerald-300">Share Wins &amp; Feedback</a>
        <div className="text-[10px] text-emerald-400">Global contributors: {typeof window !== 'undefined' ? (localStorage.getItem('mw_contributors') || '12,400') : '12,400'}+</div>
        <a href="/about" className="block text-muted-foreground hover:text-foreground">About &amp; Legal</a>
        <div className="space-y-1">
          <div className="text-[10px] text-muted-foreground">{t('language', { defaultValue: 'Language' })}</div>
          <select
            value={currentLang}
            onChange={(e) => changeLanguage(e.target.value)}
            className="w-full text-xs bg-background border border-border/50 rounded px-2 py-1 text-foreground"
            aria-label={t('changeLanguage', { defaultValue: 'Change language' })}
          >
            {LANGS.map(l => (
              <option key={l} value={l}>{NATIVE_NAMES[l]}</option>
            ))}
          </select>
          <div className="text-[10px] text-emerald-400/70">{NATIVE_NAMES[currentLang] || 'English'}</div>
        </div>
        {premium && (
          <div className="text-green-400 font-medium pt-1">✓ Premium active</div>
        )}
        <p className="text-muted-foreground pt-1 border-t border-border/40">
          {activeWorkout ? "Workout in progress" : "Ready to train"}
        </p>
        {/* Quick streak for retention (free core) */}
        <div className="text-[10px] text-emerald-400/80 pt-1">
          🔥 Streak: {typeof window !== 'undefined' ? (localStorage.getItem('mw_streak') || '0') : '0'} days
        </div>

        {/* Sign in / Sign up for cloud sync + real premium (Supabase magic link) */}
        <div className="pt-2 border-t border-border/30 bg-emerald-950/10 -mx-1 px-2 py-2 rounded">
          {userEmail ? (
            <div className="space-y-1">
              <div className="text-[10px] truncate text-emerald-400">{userEmail}</div>
              {premium && <div className="text-green-400 text-[10px]">✓ Premium (Supabase)</div>}
              <button onClick={handleSignOut} className="text-[10px] text-muted-foreground hover:text-foreground">Sign out</button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[10px] text-emerald-400 font-medium">Sign in / Sign up (free magic link)</div>
              {!showSignin ? (
                <button 
                  onClick={() => setShowSignin(true)} 
                  className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded font-medium"
                >
                  Sign in with Magic Link (free)
                </button>
              ) : (
                <div className="space-y-1">
                  <input
                    type="email"
                    value={signinEmail}
                    onChange={e => setSigninEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full text-xs bg-background border border-border/50 rounded px-2 py-1"
                  />
                  <div className="flex gap-1">
                    <button 
                      onClick={handleMagic} 
                      className="text-xs px-2 py-1 bg-emerald-600 text-white rounded flex-1 font-medium"
                      disabled={!signinEmail}
                    >
                      Send magic link
                    </button>
                    <button onClick={() => setShowSignin(false)} className="text-xs px-2 py-1 border border-border/50 rounded">Cancel</button>
                  </div>
                  <div className="text-[9px] text-muted-foreground">No password. Check email (incl. spam). Enables cloud + real premium.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
