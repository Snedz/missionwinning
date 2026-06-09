'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame } from "lucide-react";

export function CalculatorsPage() {
  // 1RM Calculator
  const [weight, setWeight] = useState(225);
  const [reps, setReps] = useState(5);
  const e1rm = Math.round(weight * (1 + reps / 30));

  // Macro / TDEE simple
  const [bw, setBw] = useState(180);
  const [height, setHeight] = useState(70);
  const [age, setAge] = useState(28);
  const [activity, setActivity] = useState(1.55);
  const bmr = Math.round(10 * bw * 0.4536 + 6.25 * height * 2.54 - 5 * age + 5); // Mifflin male approx
  const tdee = Math.round(bmr * activity);
  const [goal, setGoal] = useState<"maintain" | "cut" | "bulk">("maintain");
  const targetCals = goal === "cut" ? Math.round(tdee * 0.85) : goal === "bulk" ? Math.round(tdee * 1.1) : tdee;
  const protein = Math.round(bw * 1.0);
  const fat = Math.round((targetCals * 0.25) / 9);
  const carbs = Math.round((targetCals - protein * 4 - fat * 9) / 4);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight fitness-text-gradient">Mission Winning Calculators</h2>
        <p className="text-muted-foreground">Free tools for everyone. <span className="text-emerald-400 font-semibold">Super Bundle unlocks premium versions</span> — advanced periodization, full macros, client tools that sync. The path to precision starts free.</p>
        <div className="mt-2 text-xs text-emerald-400">Join the Super Bundle for lifetime premium calculators + all pillars. See /bundle.</div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 1RM */}
        <Card>
          <CardHeader>
            <CardTitle className="fitness-text-gradient">Estimated 1RM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Weight (lbs)</Label>
                <Input type="number" value={weight} onChange={(e) => setWeight(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <Label>Reps</Label>
                <Input type="number" value={reps} onChange={(e) => setReps(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>
            </div>
            <div className="text-5xl font-bold tabular-nums text-emerald-500">{e1rm} <span className="text-xl font-normal text-muted-foreground">lbs</span></div>
            <p className="text-xs text-muted-foreground">Epley formula. Use as starting point. Test real 1RM carefully.</p>
          </CardContent>
        </Card>

        {/* Simple TDEE + Macros */}
        <Card>
          <CardHeader>
            <CardTitle className="fitness-text-gradient">Macro &amp; TDEE Estimator (Free — Super Bundle unlocks advanced)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Bodyweight (lbs)</Label><Input type="number" value={bw} onChange={e => setBw(+e.target.value || 0)} /></div>
              <div><Label>Height (in)</Label><Input type="number" value={height} onChange={e => setHeight(+e.target.value || 0)} /></div>
              <div><Label>Age</Label><Input type="number" value={age} onChange={e => setAge(+e.target.value || 0)} /></div>
            </div>

            <div>
              <Label>Activity Multiplier</Label>
              <div className="flex gap-2 mt-1">
                {[1.2, 1.375, 1.55, 1.725].map(m => (
                  <Button key={m} size="sm" variant={activity === m ? "default" : "outline"} onClick={() => setActivity(m)}>{m}</Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Goal</Label>
              <div className="flex gap-2 mt-1">
                {(["maintain", "cut", "bulk"] as const).map(g => (
                  <Button key={g} size="sm" variant={goal === g ? "default" : "outline"} onClick={() => setGoal(g)}>{g}</Button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex justify-between text-lg"><span>Target Calories</span> <span className="font-semibold tabular-nums">{targetCals}</span></div>
              <div className="mt-2 text-sm grid grid-cols-3 gap-2">
                <div>Protein: <span className="font-medium">{protein}g</span></div>
                <div>Fat: <span className="font-medium">{fat}g</span></div>
                <div>Carbs: <span className="font-medium">{carbs}g</span></div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">Rough Mifflin-St Jeor + activity. Premium version in programs includes adjustments for training phase, body comp, and Log integration.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-500/30 bg-emerald-950/10">
        <CardContent className="pt-6">
          <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-2">
            <Flame className="h-4 w-4" /> PREMIUM CALCULATORS &amp; TOOLS — SUPER BUNDLE MEMBERS
          </div>
          <p className="text-sm text-white/70">Enroll in any program (especially PT Education or Strength Business) to unlock advanced periodization calculators, contest prep macros, client assessment scoring, custom block generators that sync straight into your Log, and more. This is how the obsessed dominate — precision tools for massive results.</p>
          <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => window.location.href = "/bundle"}>See Super Bundle &amp; Unlock Premium Tools</Button>
        </CardContent>
      </Card>

      <div className="text-xs text-center text-muted-foreground">More calculators (strength standards by bodyweight, Wilks, conditioning readiness) coming with future program releases. Global default metric — toggle units in profile.</div>
      <div className="text-center p-2 text-emerald-400 text-xs font-semibold">Join the growing global community building healthier lives. <a href="/bundle" className="underline">Get the Super Bundle</a> to unlock all premium tools + shape the future via /feedback.</div>

      {/* Bundle Banner */}
      <div className="text-center p-3 bg-emerald-950/20 border border-emerald-500/30 rounded text-sm">
        <span className="text-emerald-400 font-semibold">SUPER BUNDLE:</span> One subscription for all premium pillars (Train Coach, Fuel, Move, Mind, Learn). 50% intro pricing — free core always available for everyone.
      </div>
    </div>
  );
}
