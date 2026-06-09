'use client';

import { useState } from "react";
import { Calendar, Dumbbell, Timer } from "lucide-react";
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

export function HistoryPage() {
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const [selected, setSelected] = useState<CompletedWorkoutLog | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Workout History</h2>
        <p className="text-muted-foreground">Your history powers the <a href="/log" className="underline">Today Hub</a> readiness and Win Score.</p>
        <p className="mt-1 text-muted-foreground">
          {workoutHistory.length} completed session{workoutHistory.length !== 1 ? "s" : ""}
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
    </div>
  );
}
