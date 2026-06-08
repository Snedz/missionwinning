import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, Dumbbell, Flame, Play, Target, TrendingUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDuration } from "@/lib/utils";
import { useWorkoutStore } from "@/store/workoutStore";
import { computeReadiness, getRecommendedFocus, computeWinScore } from "@/lib/score";
import { EXERCISES } from "@/data/exercises";

export function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const savedWorkouts = useWorkoutStore((s) => s.savedWorkouts);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const startEmptyWorkout = useWorkoutStore((s) => s.startEmptyWorkout);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const recent = workoutHistory.slice(0, 3);
  const totalSessions = workoutHistory.length;
  const totalVolume = workoutHistory.reduce((sum, w) => sum + w.totalVolume, 0);

  // Simple local streak (retention feature - challenges logic stub per plan "What Else"; full UI in follow-up)
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    const savedStreak = parseInt(localStorage.getItem('mw_streak') || '0');
    const lastWorkout = workoutHistory[0]?.completedAt ? new Date(workoutHistory[0].completedAt) : null;
    if (lastWorkout) {
      const daysSince = Math.floor((Date.now() - lastWorkout.getTime()) / (1000*3600*24));
      if (daysSince === 0 || daysSince === 1) {
        setStreak(savedStreak || 1);
      } else {
        setStreak(0);
        localStorage.setItem('mw_streak', '0');
      }
    }
    // Challenges progress stub (from plan "What Else": 7-day, protein, volume, program complete). Enable UI + local save when ready.
  }, [workoutHistory, streak, totalVolume]);

  const handleQuickStart = () => {
    if (activeWorkout) {
      navigate("/active");
      return;
    }
    startEmptyWorkout();
    navigate("/active");
  };

  const handleStartSaved = (id: string) => {
    const workout = savedWorkouts.find((w) => w.id === id);
    if (!workout) return;
    startWorkout(workout.name, workout.exercises, workout.id);
    navigate("/active");
  };

  // === Today Hub computations using shared util (clean, reusable) ===
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  const readiness = computeReadiness(workoutHistory);
  const recommendedFocus = getRecommendedFocus(readiness);

  // High protein days (from nutrition logs)
  let highProteinDays = 0;
  try {
    const logs = JSON.parse(localStorage.getItem('mw_nutrition_log') || '[]');
    const byDate: Record<string, number> = {};
    logs.forEach((l: any) => {
      const d = l.date || new Date().toISOString().split('T')[0];
      byDate[d] = (byDate[d] || 0) + (l.protein || 0);
    });
    highProteinDays = Object.values(byDate).filter((p: number) => p >= 150).length;
  } catch {}

  // Win/Mission Score via util
  const scoreBreakdown = computeWinScore({
    streak,
    highProteinDays,
    totalSessions,
    totalVolume,
    savedCount: savedWorkouts.length,
  });
  const score = scoreBreakdown.total;

  const MAJOR_GROUPS: Array<keyof typeof readiness> = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  // Onboarding awareness for progression
  const isOnboarded = typeof window !== 'undefined' && !!(localStorage.getItem('mw_experience') && localStorage.getItem('mw_equipment'));
  const userGoal = typeof window !== 'undefined' ? (localStorage.getItem('mw_primary_goal') || 'Build strength and stay healthy') : 'Build strength and stay healthy';
  const userEquip = typeof window !== 'undefined' ? (localStorage.getItem('mw_equipment') || 'full-gym') : 'full-gym';

  return (
    <div className="space-y-8">
      {/* Clear functional homepage header — distinct from sales Landing. This is the daily "Today" command center. */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight fitness-text-gradient">
              {t('appName', { defaultValue: 'Mission Winning' })} • {t('today', { defaultValue: 'Today' })}
            </h2>
            <p className="mt-1 text-muted-foreground">{today} — {t('recommendedFocus', { defaultValue: recommendedFocus })} {userEquip === 'bodyweight' ? '(bodyweight focus)' : ''}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">MISSION SCORE</div>
            <div className="text-4xl font-bold text-emerald-400 flex items-center gap-2">
              {score} <Trophy className="h-6 w-6" />
            </div>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          One clear action. Track your wins. Dominate daily. <span className="text-red-400">BETA FOUNDERS: Early bird active — 347/500 spots claimed. Lock in lifetime access.</span>
        </p>
        {!isOnboarded && (
          <div className="mt-2 text-xs p-2 bg-amber-950/30 border border-amber-500/30 rounded">
            First time? <a href="/profile" className="underline text-amber-400">Complete Mission Setup in Profile</a> to personalize your Win Score, readiness, and starting program recommendation.
          </div>
        )}
      </div>

      {/* Primary Action Hero (Forge "JUST GO" spirit — biggest, clearest CTA on the functional homepage) */}
      <Card className="border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-400">
            <Target className="h-5 w-5" /> Ready to Win Today
          </CardTitle>
          <CardDescription>
            {activeWorkout
              ? "Workout in progress — jump back in and keep the momentum."
              : `Recommended: ${recommendedFocus}. Start now — no thinking required.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="fitness" size="lg" className="w-full md:w-auto text-lg py-6" onClick={handleQuickStart}>
            <Play className="h-5 w-5 mr-2" />
            {activeWorkout ? "RESUME ACTIVE WORKOUT" : "TAKE MASSIVE ACTION — START WORKOUT"}
          </Button>
          <div className="mt-3 flex flex-wrap gap-2">
            {savedWorkouts.slice(0, 3).map((w) => (
              <Button key={w.id} variant="outline" size="sm" onClick={() => handleStartSaved(w.id)}>
                {w.name}
              </Button>
            ))}
            {savedWorkouts.length === 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/builder")}>
                Or build a custom session →
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Muscle Readiness (Forge-style actionable "know what to train" — inferred from your logs) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Muscle Readiness
          </CardTitle>
          <CardDescription>Based on your recent training history. Prime groups are ready for focus.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {MAJOR_GROUPS.map(g => {
              const r = readiness[g];
              const isPrime = r.days >= 4;
              const matchingEx = EXERCISES.filter(e => e.muscleGroups.includes(g)).slice(0, 2);
              return (
                <div key={g} className={`p-3 rounded border ${isPrime ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-border/60'}`}>
                  <div className="font-medium">{g}</div>
                  <div className={isPrime ? "text-emerald-400" : "text-muted-foreground"}>
                    {r.days === 99 ? 'No recent data' : `${r.days}d rest`} — {r.status}
                  </div>
                  {isPrime && matchingEx.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-1 text-xs w-full"
                      onClick={() => {
                        const template = matchingEx.map(ex => ({ exerciseId: ex.id, sets: [{ reps: 8, weight: 0 }] }));
                        startWorkout(`${g} Focus`, template);
                        navigate("/active");
                      }}
                    >
                      Train {g} now →
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Train prime groups for best results. Rest others. Your logs make this smarter over time.</div>
        </CardContent>
      </Card>

      {/* Recommended starting point - tied to onboarding for clear progression */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Recommended Starting Point
          </CardTitle>
          <CardDescription>Based on your mission setup (edit in Profile).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Focus:</span> {userGoal} {userEquip === 'bodyweight' ? 'with bodyweight/minimal' : 'with available equipment'}
          </div>
          <div className="text-muted-foreground">Start with a simple full-body or split from Builder, or launch a program template. Complete sessions to level up your Win Score and unlock premium education.</div>
          <Button variant="outline" size="sm" onClick={() => navigate('/builder')}>
            Go to Builder / Choose Template →
          </Button>
        </CardContent>
      </Card>

      {/* Stats row (supporting, not the hero) */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              Sessions
            </CardDescription>
            <CardTitle className="text-3xl">{totalSessions}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-secondary/20 bg-secondary/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-secondary" />
              Total Volume
            </CardDescription>
            <CardTitle className="text-3xl">
              {totalVolume.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">lbs</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Saved Routines
            </CardDescription>
            <CardTitle className="text-3xl">{savedWorkouts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              Current Streak
            </CardDescription>
            <CardTitle className="text-3xl">{streak} <span className="text-lg font-normal text-muted-foreground">days</span></CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Wins & Challenges (reframed as proof of massive action — elevated but secondary to the primary CTA) */}
      <Card className="border-emerald-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-400">
            <Trophy className="h-5 w-5" /> Your Wins &amp; Streaks
          </CardTitle>
          <CardDescription>Proof you are taking massive action. Complete these for badges, coaching priority, and exclusive drops.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          <div className={streak >= 7 ? "text-emerald-400 font-medium" : ""}>
            {streak >= 7 ? "✓" : "○"} 7-Day Streak ({streak}/7) {streak >= 7 && "🏅"}
          </div>
          <div className={totalVolume > 1000 ? "text-emerald-400 font-medium" : ""}>
            {totalVolume > 1000 ? "✓" : "○"} 1000kg+ Total Volume ({totalVolume.toLocaleString()}/1000) {totalVolume > 1000 && "🏅"}
          </div>
          <div className={totalSessions >= 15 ? "text-emerald-400 font-medium" : ""}>
            {totalSessions >= 15 ? "✓" : "○"} 15+ Sessions Logged ({totalSessions}/15) {totalSessions >= 15 && "🏅"}
          </div>
          <div className={savedWorkouts.length >= 3 ? "text-emerald-400 font-medium" : ""}>
            {savedWorkouts.length >= 3 ? "✓" : "○"} 3+ Saved Routines ({savedWorkouts.length}/3) {savedWorkouts.length >= 3 && "🏅"}
          </div>
          <div className={highProteinDays >= 5 ? "text-emerald-400 font-medium" : ""}>
            {highProteinDays >= 5 ? "✓" : "○"} High Protein Days (150g+) ({highProteinDays}/5+) {highProteinDays >= 5 && "🏅"}
          </div>
          <div className="col-span-2 text-xs text-muted-foreground">Share a win in the Beta Founders Hub (/feedback). Full program completion tracking coming in Builder.</div>
        </CardContent>
      </Card>

      {/* PWA Install Banner (kept, now in context of daily use) */}
      {typeof window !== 'undefined' && !window.matchMedia('(display-mode: standalone)').matches && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded text-sm flex items-center justify-between">
          <span>Install Mission Winning for offline use anywhere (PWA). Train in any gym, park, or home — no excuses.</span>
          <Button size="sm" variant="outline" onClick={() => {
            const trig = (window as any).triggerPwaInstall;
            if (trig) trig();
            else {
              const p = (window as any).deferredPwaPrompt && (window as any).deferredPwaPrompt();
              if (p) p.prompt();
              else alert('Use browser menu (⋮ > Add to Home Screen / Install).');
            }
          }}>Install Now</Button>
        </div>
      )}

      {/* Recent Activity (supporting history view) */}
      {recent.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">Recent Wins</h3>
          <div className="grid gap-3">
            {recent.map((log) => (
              <Card key={log.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{log.workoutName}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(log.completedAt)}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(log.durationSeconds)}
                    </span>
                    <span>{log.totalVolume.toLocaleString()} lbs</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="link" className="mt-2 px-0" onClick={() => navigate("/history")}>
            View full history →
          </Button>
        </div>
      )}
    </div>
  );
}
