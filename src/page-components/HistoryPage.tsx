'use client';

import { useEffect, useState } from "react";
import { Calendar, Dumbbell, Timer, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getExerciseById } from "@/data/exercises";
import { formatDate, formatDuration } from "@/lib/utils";
import { useWorkoutStore } from "@/store/workoutStore";
import type { CompletedWorkoutLog } from "@/types";
import { getUser, getUserNutritionForDate } from "@/lib/supabase";

export function HistoryPage() {
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const loadFromCloud = useWorkoutStore((s) => s.loadFromCloud);
  const [selected, setSelected] = useState<CompletedWorkoutLog | null>(null);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pillarWins, setPillarWins] = useState<any[]>([]);

  useEffect(() => {
    const sync = async () => {
      setSyncing(true);
      const user = await getUser();
      if (user) {
        await loadFromCloud();
        setCloudSynced(true);
        try {
          const today = new Date().toISOString().split('T')[0];
          const cloud = await getUserNutritionForDate(today);
          const wins = cloud.filter((c: any) => /win|assessment|mobility|mind|track|learn|move/i.test(c.name || ''));
          setPillarWins(wins);
        } catch {
          // offline or schema not ready
        }
      }
      setSyncing(false);
    };
    sync();
  }, [loadFromCloud]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Workout History</h2>
        <p className="text-muted-foreground">Your history powers the <a href="/log" className="underline">Today Hub</a> readiness and Win Score.</p>
        <p className="mt-1 text-muted-foreground">
          {workoutHistory.length} completed session{workoutHistory.length !== 1 ? "s" : ""}
          {syncing && " — syncing cloud…"}
          {!syncing && cloudSynced && " — cloud merged"}
        </p>
        {workoutHistory.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            Recent trend: Avg volume last 5: {Math.round(workoutHistory.slice(0,5).reduce((s,l)=>s+l.totalVolume,0)/Math.min(5,workoutHistory.length)).toLocaleString()} lbs. 
            See your Win Score growth in the <a href="/log" className="underline">Today Hub</a>.
          </div>
        )}
      </div>

      {workoutHistory.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium">No workouts logged yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete an active workout to see it here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {workoutHistory.map((log) => (
            <Card key={log.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold text-lg">{log.workoutName}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(log.completedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5" />
                      {formatDuration(log.durationSeconds)}
                    </span>
                    <span>{log.exercises.length} exercises</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Volume</p>
                    <p className="text-xl font-bold text-secondary">
                      {log.totalVolume.toLocaleString()} <span className="text-sm font-normal">lbs</span>
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setSelected(log)}>
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pillar Wins / Habit Logs from Move/Mind/Assessments (cloud nutrition entries) */}
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2 mb-2"><Trophy className="h-5 w-5" /> Pillar Wins &amp; Habit Logs</h3>
        <p className="text-sm text-muted-foreground mb-2">Mobility wins, mind prompts, assessments logged from pillars appear here (synergy with Nutrition). Free core.</p>
        {pillarWins.length > 0 ? (
          <div className="space-y-2">
            {pillarWins.slice(0,5).map((w, i) => (
              <div key={i} className="text-sm p-2 border rounded bg-muted/20 flex justify-between">
                <span>{w.name} <span className="text-xs text-muted-foreground">({formatDate(w.date || new Date().toISOString())})</span></span>
                <a href="/nutrition" className="text-xs underline">View in Nutrition →</a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">No pillar wins logged today yet. Use "Do it" in /move or /mind, or complete Assessment.</div>
        )}
        <div className="mt-2 flex gap-2 text-xs">
          <Button size="sm" variant="ghost" className="text-xs" onClick={async () => {
            const u = await getUser();
            const today = new Date().toISOString().split('T')[0];
            if (u) await (await import('@/lib/supabase')).saveNutritionEntry({ date: today, name: 'Quick Pillar Win from History', protein: 0, cals: 0 });
            alert('Win logged to Nutrition! Check Today hub for streak.');
          }}>Log similar win (+cloud)</Button>
          <a href="/log" className="px-2 py-0.5 border border-white/30 rounded hover:bg-white/10">Start free starter →</a>
          <a href="/learn" className="px-2 py-0.5 border border-white/30 rounded hover:bg-white/10">More samples in Learn →</a>
          <a href="/move" className="px-2 py-0.5 border border-white/30 rounded hover:bg-white/10">Do Move flow →</a>
          <a href="/mind" className="px-2 py-0.5 border border-white/30 rounded hover:bg-white/10">Log Mind prompt →</a>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.workoutName}</DialogTitle>
                <DialogDescription>
                  {formatDate(selected.completedAt)} · {formatDuration(selected.durationSeconds)} ·{" "}
                  {selected.totalVolume.toLocaleString()} lbs total volume
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                {selected.exercises.map((ex) => {
                  const exercise = getExerciseById(ex.exerciseId);
                  return (
                    <div key={ex.exerciseId} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{exercise?.name ?? ex.exerciseId}</h4>
                        {exercise?.muscleGroups.map((mg) => (
                          <Badge key={mg} variant="muscle" className="text-[10px]">
                            {mg}
                          </Badge>
                        ))}
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Set</TableHead>
                            <TableHead>Reps</TableHead>
                            <TableHead>Weight</TableHead>
                            <TableHead>Volume</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ex.sets.map((set, i) => (
                            <TableRow key={i}>
                              <TableCell>{i + 1}</TableCell>
                              <TableCell>{set.reps}</TableCell>
                              <TableCell>{set.weight} lbs</TableCell>
                              <TableCell>{(set.reps * set.weight).toLocaleString()} lbs</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Sign up / Sign in for early private access + full cloud history while building */}
      <div className="mt-6 p-4 bg-[#111827] border border-emerald-500/30 rounded">
        <div className="text-emerald-400 font-medium mb-2">Sign up / Sign in for early private access + cloud sync (free magic link)</div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const email = (e.target as any).email.value;
          if (!email) return;
          try {
            const { signInMagic } = await import('@/lib/supabase');
            await signInMagic(email);
            alert(`Magic link sent to ${email}. Check email to access the full private build.`);
          } catch (err: any) {
            alert('Error: ' + (err.message || 'Check Supabase/Resend in Vercel.'));
          }
        }} className="flex gap-2">
          <input name="email" type="email" placeholder="you@email.com" className="flex-1 border border-white/20 bg-black/40 rounded px-3 py-2 text-sm" required />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm font-medium">Send Magic Link</button>
        </form>
        <div className="text-[10px] text-white/40 mt-1">Load cloud history above works better when signed in. Public teaser only during build.</div>
      </div>
    </div>
  );
}
