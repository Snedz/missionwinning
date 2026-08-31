'use client';
/**
 * Page: /nutrition — Fuel pillar
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, UtensilsCrossed } from 'lucide-react';
import { getUser, saveNutritionEntry, getUserNutritionForDate } from '@/lib/supabase';
import { isNonFoodEntryName } from '@/lib/pillarLog';
import { syncProteinChallengeFromNutrition } from '@/lib/challenges';
import { FuelLogSheet, type MealType } from '@/components/nutrition/FuelLogSheet';
import { FuelTodayLogCard, type FuelLogEntry } from '@/components/nutrition/FuelTodayLogCard';
import { saveMealPreset } from '@/lib/savedMeals';
import { bumpFuelLogStreak } from '@/lib/fuelStreak';
import {
  DEFAULT_QUICK_FOODS,
  getFrequentQuickFoods,
  parseNutritionLog,
  pruneNutritionLogToDays,
  mergeTodayIntoNutritionLog,
} from '@/lib/nutritionQuickLog';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { ScreenDock } from '@/components/layout/ScreenDock';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { readRaw, writeJson } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { formatLocalClockTime, localDateKey } from '@/lib/time/localDate';

const QUICK_FOODS = DEFAULT_QUICK_FOODS;

type LogEntry = FuelLogEntry;

export function NutritionPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [logged, setLogged] = useState<LogEntry[]>([]);
  const [customName, setCustomName] = useState('');
  const [customP, setCustomP] = useState(20);
  const [customC, setCustomC] = useState(200);
  const [customCarbs, setCustomCarbs] = useState(0);
  const [customFat, setCustomFat] = useState(0);
  const [cloudStatus, setCloudStatus] = useState('');
  const [logSheetOpen, setLogSheetOpen] = useState(false);
  const [activeMeal, setActiveMeal] = useState<MealType>(() => {
    const h = new Date().getHours();
    if (h < 10) return 'breakfast';
    if (h < 15) return 'lunch';
    if (h < 20) return 'dinner';
    return 'snack';
  });
  const [allLogs, setAllLogs] = useState(() =>
    parseNutritionLog(readRaw(STORAGE_KEYS.nutritionLog))
  );

  const today = localDateKey();
  const frequentFoods = getFrequentQuickFoods(allLogs, QUICK_FOODS);

  useEffect(() => {
    const saved = readRaw(STORAGE_KEYS.nutritionLog);
    if (saved) {
      const rawParsed = parseNutritionLog(saved);
      const parsed = pruneNutritionLogToDays(rawParsed, 90);
      if (parsed.length !== rawParsed.length) {
        writeJson(STORAGE_KEYS.nutritionLog, parsed);
      }
      setAllLogs(parsed);
      setLogged(
        parsed
          .filter((l) => !l.date || l.date === today)
          .map((l) => ({
            name: l.name,
            protein: l.protein,
            cals: l.cals,
            carbs: l.carbs,
            fat: l.fat,
            meal: l.meal as MealType | undefined,
            time: l.time ?? '',
          }))
      );
    }

    getUser().then((u) => {
      if (u) {
        getUserNutritionForDate(today).then((cloud) => {
          if (cloud.length > 0) {
            const mapped = cloud
              .filter((c) => !isNonFoodEntryName(c.name))
              .map((c) => ({
                name: c.name,
                protein: c.protein,
                cals: c.cals,
                carbs: c.carbs,
                fat: c.fat,
                time: formatLocalClockTime(),
              }));
            setLogged((prev) => {
              const combined = [...prev, ...mapped.filter((m) => !prev.some((p) => p.name === m.name))];
              return combined;
            });
          }
        });
      }
    });
  }, [today]);

  /** Single writer: merge today's list into full history + device storage. */
  useEffect(() => {
    setAllLogs((prev) => {
      const next = mergeTodayIntoNutritionLog(prev, logged, today, 90);
      writeJson(STORAGE_KEYS.nutritionLog, next);
      if (logged.length > 0) {
        void import('@/lib/rewards/apply').then((m) => m.applyFuelDayReward(today));
      }
      return next;
    });
  }, [logged, today]);

  const mealLabel = (meal?: MealType) => {
    if (!meal) return t('fuelMealOther', { defaultValue: 'Other' });
    const map: Record<MealType, string> = {
      breakfast: t('fuelMealBreakfast', { defaultValue: 'Breakfast' }),
      lunch: t('fuelMealLunch', { defaultValue: 'Lunch' }),
      dinner: t('fuelMealDinner', { defaultValue: 'Dinner' }),
      snack: t('fuelMealSnack', { defaultValue: 'Snack' }),
    };
    return map[meal];
  };

  const addEntry = (
    name: string,
    p: number,
    c: number,
    carbs = 0,
    fat = 0,
    meal = activeMeal,
    opts?: { quiet?: boolean }
  ) => {
    const entry: LogEntry = {
      name,
      protein: p,
      cals: c,
      carbs,
      fat,
      meal,
      time: formatLocalClockTime(),
    };
    setLogged((prev) => [...prev, entry]);
    bumpFuelLogStreak();
    syncProteinChallengeFromNutrition();
    if (!opts?.quiet) {
      toast({
        title: t('fuelLoggedToast', { defaultValue: 'Logged' }),
        description: t('fuelLoggedToastDesc', {
          name,
          protein: p,
          cals: c,
          defaultValue: `${name} · ${p}g protein · ${c} kcal`,
        }),
      });
    }
    getUser().then((u) => {
      if (u) saveNutritionEntry({ date: today, name, protein: p, cals: c, carbs, fat }).catch(() => {});
    });
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    addEntry(customName.trim(), customP, customC, customCarbs, customFat);
    setCustomName('');
    setCustomCarbs(0);
    setCustomFat(0);
  };

  const updateEntry = (
    index: number,
    next: { name: string; protein: number; cals: number; carbs: number; fat: number }
  ) => {
    const label = next.name.trim() || 'Meal';
    setLogged((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              name: label,
              protein: next.protein,
              cals: next.cals,
              carbs: next.carbs,
              fat: next.fat,
            }
          : row
      )
    );
    toast({
      title: t('fuelEntryUpdated', { defaultValue: 'Entry updated' }),
      description: t('fuelLoggedToastDesc', {
        name: label,
        protein: next.protein,
        cals: next.cals,
        defaultValue: `${label} · ${next.protein}g protein · ${next.cals} kcal`,
      }),
    });
    getUser().then((u) => {
      if (!u) return;
      saveNutritionEntry({
        date: today,
        name: `${label} (edited)`,
        protein: next.protein,
        cals: next.cals,
        carbs: next.carbs,
        fat: next.fat,
      }).catch(() => {});
    });
    syncProteinChallengeFromNutrition();
  };

  const clearDay = () => {
    setLogged([]);
  };

  const loadCloudNutrition = async () => {
    const u = await getUser();
    if (u) {
      const cloud = await getUserNutritionForDate(today);
      if (cloud.length > 0) {
        const food = cloud.filter((c) => !isNonFoodEntryName(c.name));
        const mapped = food.map((c) => ({
          name: c.name,
          protein: c.protein,
          cals: c.cals,
          carbs: c.carbs,
          fat: c.fat,
          time: formatLocalClockTime(),
        }));
        setLogged((prev) => [
          ...prev,
          ...mapped.filter((m) => !prev.some((p) => p.name === m.name)),
        ]);
      }
    }
  };

  const totalProtein = logged.reduce((s, l) => s + l.protein, 0);
  const totalCals = logged.reduce((s, l) => s + l.cals, 0);
  const fuelEyebrow = t('fuelEyebrow', { defaultValue: 'Fuel' });

  return (
    <PillarPageShell
      className="house-fuel max-w-3xl pb-24"
      icon={UtensilsCrossed}
      eyebrow={fuelEyebrow}
      title={t('fuelTitle', { defaultValue: 'Nutrition' })}
      subtitle={t('fuelSubtitleBrief', {
        defaultValue: 'Log meals on this device.',
      })}
    >
      {logged.length === 0 ? (
        <EmptyState
          className="house-empty"
          icon={UtensilsCrossed}
          title={t('fuelEmptyTitle', { defaultValue: 'No meals logged today' })}
          description={t('fuelNoEntries', {
            defaultValue: 'Log a meal on this device. Review macros before logging.',
          })}
        />
      ) : (
        <FuelTodayLogCard
          logged={logged}
          totalProtein={totalProtein}
          totalCals={totalCals}
          cloudStatus={cloudStatus}
          mealLabel={mealLabel}
          onClearDay={clearDay}
          onRemoveEntry={(index) => {
            setLogged((prev) => prev.filter((_, i) => i !== index));
          }}
          onUpdateEntry={updateEntry}
          onLoadCloud={async () => {
            setCloudStatus(t('fuelCloudLoading', { defaultValue: 'Loading...' }));
            await loadCloudNutrition();
            setCloudStatus(t('fuelCloudLoaded', { defaultValue: 'Cloud loaded (signed-in only)' }));
            setTimeout(() => setCloudStatus(''), 1800);
          }}
          onSaveMeal={(l) => {
            saveMealPreset({
              name: l.name,
              protein: l.protein,
              cals: l.cals,
              carbs: l.carbs,
              fat: l.fat,
            });
          }}
        />
      )}

      <ScreenDock>
        <div className="house-generate-dock">
          <p className="house-kicker">{fuelEyebrow}</p>
          <p className="house-lede">
            {t('fuelNoEntries', {
              defaultValue: 'Log a meal on this device. Review macros before logging.',
            })}
          </p>
          <button
            type="button"
            id="fuel-log"
            onClick={() => setLogSheetOpen(true)}
            className="house-btn house-btn-primary primary-action min-h-[52px] w-full tap-target"
            data-testid="fuel-log-dock"
          >
            <span className="flex-1 text-start">
              {t('fuelLogMeal', { defaultValue: 'Log meal' })}
            </span>
            <ChevronRight className="ms-auto h-5 w-5 shrink-0" aria-hidden />
          </button>
        </div>
      </ScreenDock>

      <FuelLogSheet
        open={logSheetOpen}
        onClose={() => setLogSheetOpen(false)}
        meal={activeMeal}
        onMealChange={setActiveMeal}
        quickFoods={frequentFoods}
        onLog={(name, p, c, carbs, fat) => addEntry(name, p, c, carbs, fat, activeMeal)}
        customName={customName}
        customP={customP}
        customC={customC}
        customCarbs={customCarbs}
        customFat={customFat}
        onCustomNameChange={setCustomName}
        onCustomPChange={setCustomP}
        onCustomCChange={setCustomC}
        onCustomCarbsChange={setCustomCarbs}
        onCustomFatChange={setCustomFat}
        onCustomLog={addCustom}
      />
    </PillarPageShell>
  );
}
