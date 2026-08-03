'use client';

import { useEffect, useId, useMemo, useState } from 'react';
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
import { ScoreNumeral } from '@/components/ui/ScoreNumeral';
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
  const uid = useId();
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
    /*
     * `.206` — a target is not a meal.
     *
     * `saveMacroTargets` above is the whole job: it is what Fuel reads to draw
     * the day's targets. This used to *also* unshift a
     * `Calc target protein 180g` row into `mw_nutrition_log`, which caused two
     * separate failures:
     *
     *   1. `NutritionPage` sums every row dated today into the day's *consumed*
     *      totals, so setting a 2400 kcal / 180g target made Fuel report 2400
     *      kcal already eaten before a single meal — and fed
     *      `countHighProteinDaysFromNutritionLog` (threshold 150g), inflating
     *      the Mission Score's Fuel pillar off a number the athlete only wished
     *      for.
     *   2. It wrote `logs.slice(0, 50)`. Every other writer keeps **90 days**
     *      via `pruneNutritionLogToDays`. At ~4 entries a day that cap is under
     *      two weeks, so one tap of "Apply targets" silently deleted months of
     *      real meals — and `NutritionPage`'s own next write persisted the
     *      truncated array back.
     *
     * `.170` already ruled that non-food rows do not belong in the Fuel diary;
     * this is the same rule one layer down, on the device log rather than the
     * cloud table. Deleting the write fixes both.
     */
    saveMacroTargets({ cals: targetCals, protein, carbs, fat });
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
            <Label htmlFor={`${uid}-bw`}>
              {t('calcBwLabel', { unit: bwLabel, defaultValue: `Bodyweight (${bwLabel})` })}
            </Label>
            <Input
              id={`${uid}-bw`}
              type="number"
              value={bw}
              onChange={(e) => setBw(+e.target.value || 0)}
              className="mt-1 tabular-nums"
            />
          </div>
          <div>
            <Label htmlFor={`${uid}-height`}>
              {t('calcHeightLabel', { unit: heightLabel, defaultValue: `Height (${heightLabel})` })}
            </Label>
            <Input
              id={`${uid}-height`}
              type="number"
              value={height}
              onChange={(e) => setHeight(+e.target.value || 0)}
              className="mt-1 tabular-nums"
            />
          </div>
          <div>
            <Label htmlFor={`${uid}-age`}>{t('calcAgeLabel', { defaultValue: 'Age' })}</Label>
            <Input
              id={`${uid}-age`}
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
                  variant={sex === s ? 'selected' : 'outline'}
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
                variant={goal === g ? 'selected' : 'outline'}
                onClick={() => setGoal(g)}
              >
                {goalLabel(g)}
              </Button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t space-y-4">
          {/* These are results, not budgets. The rings they replace drew arcs
              against invented ceilings (protein/200, carbs/300) — an arc that
              implied progress toward a target the calculator never set. A
              numeral states the answer without inventing a denominator. */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-t-2 border-border pt-4 sm:grid-cols-4">
            <ScoreNumeral
              label={t('calcTargetCals', { defaultValue: 'Target Calories' })}
              value={targetCals}
              caption={`BMR ${bmr} · TDEE ${tdee}`}
              size="md"
            />
            <ScoreNumeral
              label={t('calcProtein', { defaultValue: 'Protein' })}
              value={`${protein}g`}
              size="md"
            />
            <ScoreNumeral
              label={t('calcCarbs', { defaultValue: 'Carbs' })}
              value={`${carbs}g`}
              size="md"
            />
            <ScoreNumeral label={t('calcFat', { defaultValue: 'Fat' })} value={`${fat}g`} size="md" />
          </div>

          <div className="space-y-1">
            {/* Three segments, one hue: the accent ramp steps dark → light so
                protein / carbs / fat stay distinguishable without sky, amber
                and rose — which were three unrelated colours doing the job of
                one scale. Labels flip to ink on the lighter two steps. */}
            <div className="flex h-4 overflow-hidden text-[10px] font-semibold">
              <div
                className="bg-accent-700 flex items-center justify-center text-primary-foreground"
                style={{ width: `${macroSplit.proteinPct}%` }}
              >
                {macroSplit.proteinPct > 12 ? `P ${macroSplit.proteinPct}%` : ''}
              </div>
              <div
                className="bg-accent-400 flex items-center justify-center text-accent-900"
                style={{ width: `${macroSplit.carbsPct}%` }}
              >
                {macroSplit.carbsPct > 12 ? `C ${macroSplit.carbsPct}%` : ''}
              </div>
              <div
                className="bg-accent-200 flex items-center justify-center text-accent-900"
                style={{ width: `${macroSplit.fatPct}%` }}
              >
                {macroSplit.fatPct > 12 ? `F ${macroSplit.fatPct}%` : ''}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="default" onClick={applyTargets}>
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
