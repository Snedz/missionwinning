'use client';

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame } from "lucide-react";
import { SignInPrompt } from "@/components/auth/SignInPrompt";
import { useUnits, weightUnitLabel, heightUnitLabel, bodyweightUnitLabel } from "@/hooks/useUnits";
import {
  defaultCalcInputs,
  epley1rm,
  mifflinBmr,
  proteinTargetGrams,
} from "@/lib/calcHelpers";

export function CalculatorsPage() {
  const { t } = useTranslation();
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);
  const heightLabel = heightUnitLabel(units);
  const bwLabel = bodyweightUnitLabel(units);

  const [weight, setWeight] = useState(() => defaultCalcInputs(units).weight);
  const [reps, setReps] = useState(5);
  const [bw, setBw] = useState(() => defaultCalcInputs(units).bw);
  const [height, setHeight] = useState(() => defaultCalcInputs(units).height);
  const [age, setAge] = useState(28);
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState<"maintain" | "cut" | "bulk">("maintain");

  useEffect(() => {
    const d = defaultCalcInputs(units);
    setWeight(d.weight);
    setBw(d.bw);
    setHeight(d.height);
  }, [units]);

  const e1rm = epley1rm(weight, reps);
  const bmr = mifflinBmr(bw, height, age, units);
  const tdee = Math.round(bmr * activity);
  const targetCals =
    goal === "cut" ? Math.round(tdee * 0.85) : goal === "bulk" ? Math.round(tdee * 1.1) : tdee;
  const protein = proteinTargetGrams(bw, units);
  const fat = Math.round((targetCals * 0.25) / 9);
  const carbs = Math.round((targetCals - protein * 4 - fat * 9) / 4);

  const goalLabel = (g: typeof goal) =>
    t(
      g === 'maintain' ? 'calcGoalMaintain' : g === 'cut' ? 'calcGoalCut' : 'calcGoalBulk',
      { defaultValue: g }
    );

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight fitness-text-gradient">
          {t('calcTitle', { defaultValue: 'Mission Winning Calculators' })}
        </h2>
        <p className="text-muted-foreground">
          {t('calcSubtitle', {
            defaultValue:
              'Free tools for everyone. Super Bundle unlocks premium versions — advanced periodization, full macros, client tools that sync.',
          })}
        </p>
        <div className="mt-2 text-xs text-emerald-400">
          {t('calcBundleHint', {
            defaultValue: 'Join the Super Bundle for lifetime premium calculators + all pillars. See /bundle.',
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="fitness-text-gradient">
              {t('calc1rmTitle', { defaultValue: 'Estimated 1RM' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  {t('calcWeightLabel', { unit: unitLabel, defaultValue: `Weight (${unitLabel})` })}
                </Label>
                <Input type="number" value={weight} onChange={(e) => setWeight(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <Label>{t('calcRepsLabel', { defaultValue: 'Reps' })}</Label>
                <Input type="number" value={reps} onChange={(e) => setReps(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>
            </div>
            <div className="text-5xl font-bold tabular-nums text-emerald-500">
              {e1rm} <span className="text-xl font-normal text-muted-foreground">{unitLabel}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('calc1rmFoot', { defaultValue: 'Epley formula. Use as starting point. Test real 1RM carefully.' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="fitness-text-gradient">
              {t('calcMacroTitle', {
                defaultValue: 'Macro & TDEE Estimator (Free — Super Bundle unlocks advanced)',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>
                  {t('calcBwLabel', { unit: bwLabel, defaultValue: `Bodyweight (${bwLabel})` })}
                </Label>
                <Input type="number" value={bw} onChange={(e) => setBw(+e.target.value || 0)} />
              </div>
              <div>
                <Label>
                  {t('calcHeightLabel', { unit: heightLabel, defaultValue: `Height (${heightLabel})` })}
                </Label>
                <Input type="number" value={height} onChange={(e) => setHeight(+e.target.value || 0)} />
              </div>
              <div>
                <Label>{t('calcAgeLabel', { defaultValue: 'Age' })}</Label>
                <Input type="number" value={age} onChange={(e) => setAge(+e.target.value || 0)} />
              </div>
            </div>

            <div>
              <Label>{t('calcActivityLabel', { defaultValue: 'Activity Multiplier' })}</Label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {[1.2, 1.375, 1.55, 1.725].map((m) => (
                  <Button key={m} size="sm" variant={activity === m ? "default" : "outline"} onClick={() => setActivity(m)}>
                    {m}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>{t('calcGoalLabel', { defaultValue: 'Goal' })}</Label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {(["maintain", "cut", "bulk"] as const).map((g) => (
                  <Button key={g} size="sm" variant={goal === g ? "default" : "outline"} onClick={() => setGoal(g)}>
                    {goalLabel(g)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex justify-between text-lg">
                <span>{t('calcTargetCals', { defaultValue: 'Target Calories' })}</span>
                <span className="font-semibold tabular-nums">{targetCals}</span>
              </div>
              <div className="mt-2 text-sm grid grid-cols-3 gap-2">
                <div>
                  {t('calcProtein', { defaultValue: 'Protein' })}: <span className="font-medium">{protein}g</span>
                </div>
                <div>
                  {t('calcFat', { defaultValue: 'Fat' })}: <span className="font-medium">{fat}g</span>
                </div>
                <div>
                  {t('calcCarbs', { defaultValue: 'Carbs' })}: <span className="font-medium">{carbs}g</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {t('calcMacroFoot', {
                defaultValue:
                  'Rough Mifflin-St Jeor + activity. Premium version in programs includes adjustments for training phase, body comp, and Log integration.',
              })}
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              const entry = { date: today, name: `Calc target protein ${protein}g`, protein, cals: targetCals };
              const logs = JSON.parse(localStorage.getItem('mw_nutrition_log') || '[]');
              logs.unshift(entry);
              localStorage.setItem('mw_nutrition_log', JSON.stringify(logs.slice(0, 50)));
              alert(
                t('calcLogAlert', {
                  protein,
                  cals: targetCals,
                  defaultValue: `Logged ${protein}g protein + ${targetCals} cals target to today (view in Nutrition).`,
                })
              );
            }}
          >
            {t('calcLogMacros', { defaultValue: 'Log Macro Targets to Nutrition' })}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const msg = `Quick strength session targeting ~${e1rm} e1RM ${unitLabel}`;
              window.location.href = `/builder?note=${encodeURIComponent(msg)}`;
            }}
          >
            {t('calcBuildSession', {
              e1rm,
              defaultValue: `Build Session Targeting e1RM ~${e1rm}`,
            })}
          </Button>
          <Button size="sm" variant="outline" onClick={() => (window.location.href = "/assessments")}>
            {t('calcAssessment', { defaultValue: 'Run Readiness Assessment First' })}
          </Button>
        </div>
      </div>

      <Card className="border-emerald-500/30 bg-emerald-950/10">
        <CardContent className="pt-6">
          <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-2">
            <Flame className="h-4 w-4" />{' '}
            {t('calcPremiumTitle', { defaultValue: 'PREMIUM CALCULATORS & TOOLS — SUPER BUNDLE MEMBERS' })}
          </div>
          <p className="text-sm text-white/70">
            {t('calcPremiumDesc', {
              defaultValue:
                'Enroll in any program to unlock advanced periodization calculators, contest prep macros, client assessment scoring, custom block generators that sync into your Log, and more.',
            })}
          </p>
          <Button
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => (window.location.href = "/bundle")}
          >
            {t('calcPremiumBtn', { defaultValue: 'See Super Bundle & Unlock Premium Tools' })}
          </Button>
        </CardContent>
      </Card>

      <div className="text-xs text-center text-muted-foreground">
        {t('calcUnitsFoot', {
          defaultValue: 'Toggle kg/lbs and cm/in in Profile. Global default is metric.',
        })}
      </div>
      <div className="text-center p-2 text-emerald-400 text-xs font-semibold">
        {t('calcCommunityFoot', {
          defaultValue:
            'Join the growing global community building healthier lives. Get the Super Bundle to unlock all premium tools + shape the future via /feedback.',
        })}{' '}
        <a href="/bundle" className="underline">
          Super Bundle
        </a>
      </div>

      <div className="text-center p-3 bg-emerald-950/20 border border-emerald-500/30 rounded text-sm">
        <span className="text-emerald-400 font-semibold">
          {t('calcBannerTitle', { defaultValue: 'SUPER BUNDLE:' })}
        </span>{' '}
        {t('calcBannerDesc', {
          defaultValue:
            'One subscription for all premium pillars (Train Coach, Fuel, Move, Mind, Learn). 50% intro pricing — free core always available.',
        })}
      </div>

      <SignInPrompt
        className="mt-6"
        nextPath="/calculators"
        description={t('calcSignInFoot', {
          defaultValue: 'Sign in to sync calculator logs and nutrition targets across devices.',
        })}
      />
    </div>
  );
}
