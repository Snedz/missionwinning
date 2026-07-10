'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useToast } from '@/hooks/use-toast';
import {
  useUnits,
  heightUnitLabel,
  bodyweightUnitLabel,
  weightUnitLabel,
} from '@/hooks/useUnits';
import {
  ACTIVITY_LEVELS,
  type CalcSex,
  defaultCalcInputs,
  mifflinBmr,
  proteinTargetGrams,
} from '@/lib/calcHelpers';
import { saveMacroTargets } from '@/lib/macroTargets';

type Goal = 'maintain' | 'cut' | 'bulk';

export function MacroCalculator() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const units = useUnits();
  const heightLabel = heightUnitLabel(units);
  const bwLabel = bodyweightUnitLabel(units);

  const [bw, setBw] = useState(() => defaultCalcInputs(units).bw);
  const [height, setHeight] = useState(() => defaultCalcInputs(units).height);
  const [age, setAge] = useState(28);
  const [sex, setSex] = useState<CalcSex>('male');
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState<Goal>('maintain');

  useEffect(() => {
    const d = defaultCalcInputs(units);
    setBw(d.bw);
    setHeight(d.height);
  }, [units]);

  const bmr = mifflinBmr(bw, height, age, units, sex);
  const tdee = Math.round(bmr * activity);
  const targetCals =
    goal === 'cut' ? Math.round(tdee * 0.85) : goal === 'bulk' ? Math.round(tdee * 1.1) : tdee;
  const protein = proteinTargetGrams(bw, units);
  const fat = Math.round((targetCals * 0.25) / 9);
  const carbs = Math.max(0, Math.round((targetCals - protein * 4 - fat * 9) / 4));

  const macroSplit = useMemo(() => {
    const pCals = protein * 4;
    const cCals = carbs * 4;
    const fCals = fat * 9;
    const total = pCals + cCals + fCals || 1;
    return {
      proteinPct: Math.round((pCals / total) * 100),
      carbsPct: Math.round((cCals / total) * 100),
      fatPct: Math.round((fCals / total) * 100),
    };
  }, [protein, carbs, fat]);

  const goalLabel = (g: Goal) =>
    t(
      g === 'maintain' ? 'calcGoalMaintain' : g === 'cut' ? 'calcGoalCut' : 'calcGoalBulk',
      { defaultValue: g === 'maintain' ? 'Maintain' : g === 'cut' ? 'Cut' : 'Bulk' }
    );

  const activityLabel = (key: string) => {
    const labels: Record<string, string> = {
      sedentary: t('calcActivitySedentary', { defaultValue: 'Sedentary' }),
      light: t('calcActivityLight', { defaultValue: 'Light' }),
      moderate: t('calcActivityModerate', { defaultValue: 'Moderate' }),
      active: t('calcActivityActive', { defaultValue: 'Active' }),
    };
    return labels[key] ?? key;
  };

  const applyTargets = () => {
    saveMacroTargets({ cals: targetCals, protein, carbs, fat });
    const today = new Date().toISOString().split('T')[0];
    const entry = { date: today, name: `Calc target protein ${protein}g`, protein, cals: targetCals };
    const logs = JSON.parse(localStorage.getItem('mw_nutrition_log') || '[]');
    logs.unshift(entry);
    localStorage.setItem('mw_nutrition_log', JSON.stringify(logs.slice(0, 50)));
    toast({
      title: t('calcToastApplied', { defaultValue: 'Targets applied' }),
      description: t('calcToastAppliedDesc', {
        protein,
        cals: targetCals,
        defaultValue: `${protein}g protein · ${targetCals} kcal — visible on Fuel.`,
      }),
    });
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="fitness-text-gradient">
          {t('calcMacroTitle', { defaultValue: 'Macro & TDEE Estimator' })}
        </CardTitle>
        <CardDescription>
          {t('calcMacroDesc', {
            defaultValue: 'Mifflin-St Jeor BMR with activity multiplier. Adjust goal to shift calories.',
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <Label>
              {t('calcBwLabel', { unit: bwLabel, defaultValue: `Bodyweight (${bwLabel})` })}
            </Label>
            <Input
              type="number"
              value={bw}
              onChange={(e) => setBw(+e.target.value || 0)}
              className="mt-1 tabular-nums"
            />
          </div>
          <div>
            <Label>
              {t('calcHeightLabel', { unit: heightLabel, defaultValue: `Height (${heightLabel})` })}
            </Label>
            <Input
              type="number"
              value={height}
              onChange={(e) => setHeight(+e.target.value || 0)}
              className="mt-1 tabular-nums"
            />
          </div>
          <div>
            <Label>{t('calcAgeLabel', { defaultValue: 'Age' })}</Label>
            <Input
              type="number"
              value={age}
              onChange={(e) => setAge(+e.target.value || 0)}
              className="mt-1 tabular-nums"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>{t('calcSexLabel', { defaultValue: 'Sex' })}</Label>
            <div className="flex gap-2 mt-1">
              {(['male', 'female'] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={sex === s ? 'default' : 'outline'}
                  onClick={() => setSex(s)}
                  className="flex-1"
                >
                  {t(s === 'male' ? 'calcSexMale' : 'calcSexFemale', {
                    defaultValue: s === 'male' ? 'Male' : 'Female',
                  })}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label>{t('calcActivityLabel', { defaultValue: 'Activity level' })}</Label>
            <Select value={String(activity)} onValueChange={(v) => setActivity(parseFloat(v))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_LEVELS.map((level) => (
                  <SelectItem key={level.key} value={String(level.value)}>
                    {activityLabel(level.key)} ({level.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>{t('calcGoalLabel', { defaultValue: 'Goal' })}</Label>
          <div className="flex gap-2 mt-1 flex-wrap">
            {(['maintain', 'cut', 'bulk'] as const).map((g) => (
              <Button
                key={g}
                size="sm"
                variant={goal === g ? 'default' : 'outline'}
                onClick={() => setGoal(g)}
              >
                {goalLabel(g)}
              </Button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t space-y-4">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <ProgressRing
              label={t('calcTargetCals', { defaultValue: 'Target Calories' })}
              value={String(targetCals)}
              subtitle={`BMR ${bmr} · TDEE ${tdee}`}
              progress={Math.min(100, (targetCals / 3500) * 100)}
              tone="emerald"
            />
            <ProgressRing
              label={t('calcProtein', { defaultValue: 'Protein' })}
              value={`${protein}g`}
              progress={Math.min(100, (protein / 200) * 100)}
              tone="info"
            />
            <ProgressRing
              label={t('calcCarbs', { defaultValue: 'Carbs' })}
              value={`${carbs}g`}
              progress={Math.min(100, (carbs / 300) * 100)}
              tone="amber"
            />
            <ProgressRing
              label={t('calcFat', { defaultValue: 'Fat' })}
              value={`${fat}g`}
              progress={Math.min(100, (fat / 100) * 100)}
              tone="warn"
            />
          </div>

          <div className="space-y-1">
            <div className="flex h-3 rounded-full overflow-hidden text-[10px] font-medium">
              <div
                className="bg-sky-500/80 flex items-center justify-center text-white"
                style={{ width: `${macroSplit.proteinPct}%` }}
              >
                {macroSplit.proteinPct > 12 ? `P ${macroSplit.proteinPct}%` : ''}
              </div>
              <div
                className="bg-amber-500/80 flex items-center justify-center text-white"
                style={{ width: `${macroSplit.carbsPct}%` }}
              >
                {macroSplit.carbsPct > 12 ? `C ${macroSplit.carbsPct}%` : ''}
              </div>
              <div
                className="bg-rose-500/80 flex items-center justify-center text-white"
                style={{ width: `${macroSplit.fatPct}%` }}
              >
                {macroSplit.fatPct > 12 ? `F ${macroSplit.fatPct}%` : ''}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="fitness" onClick={applyTargets}>
            {t('calcApplyTargets', { defaultValue: 'Apply targets to Fuel' })}
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/nutrition">{t('calcViewFuel', { defaultValue: 'Open Fuel' })}</Link>
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground">
          {t('calcMacroFoot', {
            defaultValue:
              'Rough Mifflin-St Jeor + activity. Premium programs add phase and body-comp adjustments.',
          })}
        </p>
      </CardContent>
    </>
  );
}

export function MacroCalculatorActions({ e1rm }: { e1rm: number }) {
  const { t } = useTranslation();
  const router = useRouter();
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          const msg = `Quick strength session targeting ~${e1rm} e1RM ${unitLabel}`;
          router.push(`/builder?note=${encodeURIComponent(msg)}`);
        }}
      >
        {t('calcBuildSession', {
          e1rm,
          defaultValue: `Build Session Targeting e1RM ~${e1rm}`,
        })}
      </Button>
      <Button size="sm" variant="outline" asChild>
        <Link href="/assessments">
          {t('calcAssessment', { defaultValue: 'Run Readiness Assessment First' })}
        </Link>
      </Button>
    </div>
  );
}
