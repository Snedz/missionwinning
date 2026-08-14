'use client';
/**
 * Page: /nutrition — Fuel pillar
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { getUser, saveNutritionEntry, getUserNutritionForDate } from '@/lib/supabase';
import { isNonFoodEntryName } from '@/lib/pillarLog';
import { syncProteinChallengeFromNutrition } from '@/lib/challenges';
import { FREE_RECIPES } from '@/data/recipes/freeRecipes';
import type { Recipe } from '@/data/recipes/types';
import { usePremium } from '@/hooks/usePremium';
import { fetchPremiumCatalogJson } from '@/lib/premiumCatalogCache';
import { FuelLogSheet, type MealType } from '@/components/nutrition/FuelLogSheet';
import { FuelMacroOverview } from '@/components/nutrition/FuelMacroOverview';
import { FuelQuickLogPanel } from '@/components/nutrition/FuelQuickLogPanel';
import { FuelMoreTools } from '@/components/nutrition/FuelMoreTools';
import { FuelTodayLogCard, type FuelLogEntry } from '@/components/nutrition/FuelTodayLogCard';
import { FuelRecipesPanel } from '@/components/nutrition/FuelRecipesPanel';
import { FuelTargetsEditor } from '@/components/nutrition/FuelTargetsEditor';
import { FuelGoalWizard } from '@/components/nutrition/FuelGoalWizard';
import { FuelAdaptBanner } from '@/components/nutrition/FuelAdaptBanner';
import { estimateMealFromDescription } from '@/lib/nlMealLog';
import { listMealPresets, saveMealPreset, type SavedMealPreset } from '@/lib/savedMeals';
import { bumpFuelLogStreak, getFuelLogStreak } from '@/lib/fuelStreak';
import {
  DEFAULT_QUICK_FOODS,
  getFrequentQuickFoods,
  getRecentFoods,
  getYesterdayEntries,
  parseNutritionLog,
  pruneNutritionLogToDays,
  mergeTodayIntoNutritionLog,
  summarizeNutritionDays,
} from '@/lib/nutritionQuickLog';
import { FuelWeekGlance } from '@/components/nutrition/FuelWeekGlance';
import { FuelWeightStrip } from '@/components/nutrition/FuelWeightStrip';
import { FuelPastDaysCard } from '@/components/nutrition/FuelPastDaysCard';
import { DEFAULT_MACRO_TARGETS, loadMacroTargets } from '@/lib/macroTargets';
import {
  adaptDeltaSummary,
  loadFuelAdaptEnabled,
  resolveFuelDayTargets,
  saveFuelAdaptEnabled,
} from '@/lib/fuelDayAdapt';
import { useWorkoutStore } from '@/store/workoutStore';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { useToast } from '@/hooks/use-toast';
import { readRaw, writeJson, writeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { formatLocalClockTime, localDateKey } from '@/lib/time/localDate';
import { getContentInventory } from '@/lib/contentInventory';
import { isFreeBeta } from '@/lib/freeBeta';

const freeRecipes = FREE_RECIPES;
const QUICK_FOODS = DEFAULT_QUICK_FOODS;

type LogEntry = FuelLogEntry;

export function NutritionPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { premium } = usePremium();
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const [premiumRecipes, setPremiumRecipes] = useState<Recipe[]>([]);
  const [premiumFetchError, setPremiumFetchError] = useState(false);
  const [premiumRetry, setPremiumRetry] = useState(0);
  /** Base targets (edited/saved); rings use adapted values when train-match is on. */
  const [targetCals, setTargetCals] = useState(DEFAULT_MACRO_TARGETS.cals);
  const [targetProtein, setTargetProtein] = useState(DEFAULT_MACRO_TARGETS.protein);
  const [targetCarbs, setTargetCarbs] = useState(DEFAULT_MACRO_TARGETS.carbs);
  const [targetFat, setTargetFat] = useState(DEFAULT_MACRO_TARGETS.fat);
  const [adaptEnabled, setAdaptEnabled] = useState(true);
  const [logged, setLogged] = useState<LogEntry[]>([]);
  const [water, setWater] = useState(0);
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
  const [fuelStreak, setFuelStreak] = useState(0);
  const [nlMealText, setNlMealText] = useState('');
  const [nlPreview, setNlPreview] = useState<ReturnType<typeof estimateMealFromDescription>>(null);

  const [savedMeals, setSavedMeals] = useState<SavedMealPreset[]>(() =>
    typeof window !== 'undefined' ? listMealPresets() : []
  );
  const [allLogs, setAllLogs] = useState(() =>
    parseNutritionLog(readRaw(STORAGE_KEYS.nutritionLog))
  );

  const today = localDateKey();
  const recentFoods = getRecentFoods(allLogs, today, 6);
  const frequentFoods = getFrequentQuickFoods(allLogs, QUICK_FOODS);
  const yesterdayMeals = getYesterdayEntries(allLogs, today);

  const dayAdapt = useMemo(
    () =>
      resolveFuelDayTargets(
        {
          cals: targetCals,
          protein: targetProtein,
          carbs: targetCarbs,
          fat: targetFat,
        },
        workoutHistory,
        { todayIso: today, adapt: adaptEnabled }
      ),
    [targetCals, targetProtein, targetCarbs, targetFat, workoutHistory, today, adaptEnabled]
  );
  const dayTargets = dayAdapt.targets;
  const adaptDelta = dayAdapt.isAdapted
    ? adaptDeltaSummary(dayAdapt.base, dayAdapt.targets)
    : undefined;

  useEffect(() => {
    setAdaptEnabled(loadFuelAdaptEnabled());
    const savedTargets = loadMacroTargets();
    if (savedTargets) {
      setTargetCals(savedTargets.cals);
      setTargetProtein(savedTargets.protein);
      setTargetCarbs(savedTargets.carbs ?? DEFAULT_MACRO_TARGETS.carbs);
      setTargetFat(savedTargets.fat ?? DEFAULT_MACRO_TARGETS.fat);
    }

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
    const savedWater = readRaw(STORAGE_KEYS.water);
    if (savedWater) setWater(parseInt(savedWater));

    getUser().then((u) => {
      if (u) {
        getUserNutritionForDate(today).then((cloud) => {
          if (cloud.length > 0) {
            const mapped = cloud.map((c) => ({
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

  useEffect(() => {
    if (!premium) {
      setPremiumRecipes([]);
      setPremiumFetchError(false);
      return;
    }
    setPremiumFetchError(false);
    fetchPremiumCatalogJson<{ recipes?: Recipe[] }>('/api/premium/recipes')
      .then((data) => setPremiumRecipes(data.recipes ?? []))
      .catch(() => {
        setPremiumRecipes([]);
        setPremiumFetchError(true);
        toast({
          title: isFreeBeta()
            ? t('fuelPremiumFetchFailedOpenBeta', {
                defaultValue: 'Could not load extra recipes',
              })
            : t('fuelPremiumFetchFailed', {
                defaultValue: 'Could not load premium recipes',
              }),
          description: t('fuelPremiumFetchFailedDesc', {
            defaultValue: 'Free recipes still work. Check your connection and try again.',
          }),
          variant: 'destructive',
        });
      });
  }, [premium, premiumRetry, t, toast]);

  useEffect(() => {
    setFuelStreak(getFuelLogStreak());
  }, [logged]);

  useEffect(() => {
    writeRaw(STORAGE_KEYS.water, water.toString());
  }, [water]);

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
    setFuelStreak(bumpFuelLogStreak());
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
    // Best-effort append of corrected macros for signed-in users (API is insert-only).
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
    setWater(0);
  };

  const handleNlMealTextChange = (text: string) => {
    setNlMealText(text);
    setNlPreview(estimateMealFromDescription(text));
  };

  const handleLogNlMeal = (draft: {
    name: string;
    protein: number;
    cals: number;
    carbs: number;
    fat: number;
  }) => {
    if (!draft.name.trim()) return;
    addEntry(draft.name.trim(), draft.protein, draft.cals, draft.carbs, draft.fat);
    setNlMealText('');
    setNlPreview(null);
  };

  const handleRepeatYesterday = () => {
    for (const m of yesterdayMeals) {
      addEntry(
        m.name,
        m.protein,
        m.cals,
        m.carbs ?? 0,
        m.fat ?? 0,
        (m.meal as MealType) ?? activeMeal,
        { quiet: true }
      );
    }
    if (yesterdayMeals.length > 0) {
      toast({
        title: t('fuelCopiedDay', { defaultValue: 'Copied to today' }),
        description: t('fuelCopiedDayDesc', {
          count: yesterdayMeals.length,
          defaultValue: `${yesterdayMeals.length} meals added — edit anything that changed.`,
        }),
      });
    }
  };

  const handleCopyDayToToday = (
    rows: { name: string; protein: number; cals: number; carbs?: number; fat?: number; meal?: string }[]
  ) => {
    let added = 0;
    for (const m of rows) {
      const already = logged.some(
        (l) =>
          l.name.trim().toLowerCase() === m.name.trim().toLowerCase() &&
          l.protein === m.protein &&
          l.cals === m.cals
      );
      if (already) continue;
      addEntry(
        m.name,
        m.protein,
        m.cals,
        m.carbs ?? 0,
        m.fat ?? 0,
        (m.meal as MealType) || activeMeal,
        { quiet: true }
      );
      added += 1;
    }
    toast({
      title: t('fuelCopiedDay', { defaultValue: 'Copied to today' }),
      description:
        added === 0
          ? t('fuelCopiedDayNone', {
              defaultValue: 'Those meals are already on today.',
            })
          : t('fuelCopiedDayDesc', {
              count: added,
              defaultValue: `${added} meals added — edit anything that changed.`,
            }),
    });
  };

  const totalProtein = logged.reduce((s, l) => s + l.protein, 0);
  const totalCals = logged.reduce((s, l) => s + l.cals, 0);
  const totalCarbs = logged.reduce((s, l) => s + (l.carbs || 0), 0);
  const totalFat = logged.reduce((s, l) => s + (l.fat || 0), 0);
  const carbsTarget = Math.max(1, dayTargets.carbs);
  const fatTarget = Math.max(1, dayTargets.fat);

  const handleToggleAdapt = (on: boolean) => {
    setAdaptEnabled(on);
    saveFuelAdaptEnabled(on);
  };

  const loadCloudNutrition = async () => {
    const u = await getUser();
    if (u) {
      const cloud = await getUserNutritionForDate(today);
      if (cloud.length > 0) {
        // `nutrition_entries` is shared with pillar wins and assessments, which arrive
        // at 0g / 0 kcal. Without this the food diary listed things like
        // "track win: GPS 5.20 km" as a meal. See isNonFoodEntryName.
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

  const weekDays = summarizeNutritionDays(allLogs, today, 7);
  const inv = getContentInventory();

  return (
    <PillarPageShell
      className="max-w-3xl pb-24"
      icon={UtensilsCrossed}
      eyebrow={t('fuelEyebrow', { defaultValue: 'Fuel' })}
      title={t('fuelTitle', { defaultValue: 'What you ate' })}
      subtitle={t('fuelSubtitleBrief', {
        defaultValue: 'Log meals on this device. Targets and recipes when you need them.',
      })}
      headerActions={
        fuelStreak > 0 ? (
          <span className="shrink-0 border-2 border-border bg-muted px-3 py-1 text-xs font-semibold tabular-nums text-foreground">
            {t('fuelLogStreak', {
              count: fuelStreak,
              defaultValue: `${fuelStreak}-day log streak`,
            })}
          </span>
        ) : undefined
      }
    >
      {/* Field manual: log first — macros/targets no longer block the fold. */}
      <div id="fuel-log" className="scroll-mt-20 space-y-4">
        <FuelQuickLogPanel
          activeMeal={activeMeal}
          onActiveMealChange={setActiveMeal}
          mealLabel={mealLabel}
          nlMealText={nlMealText}
          onNlMealTextChange={handleNlMealTextChange}
          nlPreview={nlPreview}
          onLogNlMeal={handleLogNlMeal}
          recentFoods={recentFoods}
          frequentFoods={frequentFoods}
          onQuickLog={addEntry}
          savedMeals={savedMeals}
          onOpenLogSheet={() => setLogSheetOpen(true)}
          water={water}
          onWaterChange={setWater}
          yesterdayMeals={yesterdayMeals}
          onRepeatYesterday={handleRepeatYesterday}
        />
      </div>

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
          setSavedMeals(
            saveMealPreset({
              name: l.name,
              protein: l.protein,
              cals: l.cals,
              carbs: l.carbs,
              fat: l.fat,
            })
          );
        }}
      />

      <FuelMacroOverview
        totalCals={totalCals}
        targetCals={dayTargets.cals}
        totalProtein={totalProtein}
        targetProtein={dayTargets.protein}
        totalCarbs={totalCarbs}
        carbsTarget={carbsTarget}
        totalFat={totalFat}
        fatTarget={fatTarget}
        water={water}
      >
        <FuelAdaptBanner
          load={dayAdapt.load}
          isAdapted={dayAdapt.isAdapted}
          note={dayAdapt.note}
          deltaSummary={adaptDelta}
          adaptEnabled={adaptEnabled}
          onToggleAdapt={handleToggleAdapt}
        />
      </FuelMacroOverview>

      <details className="group border-2 border-border bg-card">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
          {t('fuelMoreTools', { defaultValue: 'Targets, week & weight' })}
        </summary>
        <div className="space-y-4 border-t-2 border-border p-4">
          <FuelTargetsEditor
            targetCals={targetCals}
            targetProtein={targetProtein}
            targetCarbs={targetCarbs}
            targetFat={targetFat}
            onSaved={(next) => {
              setTargetCals(next.cals);
              setTargetProtein(next.protein);
              setTargetCarbs(next.carbs);
              setTargetFat(next.fat);
            }}
          />
          <FuelGoalWizard
            onApplied={(next) => {
              setTargetCals(next.cals);
              setTargetProtein(next.protein);
              setTargetCarbs(next.carbs);
              setTargetFat(next.fat);
              toast({
                title: t('fuelGoalApplied', { defaultValue: 'Goal targets applied' }),
                description: t('fuelGoalAppliedDesc', {
                  cals: next.cals,
                  protein: next.protein,
                  defaultValue: `${next.cals} kcal · ${next.protein}g protein`,
                }),
              });
            }}
          />
          <FuelWeekGlance days={weekDays} todayIso={today} targetCals={targetCals} />
          <FuelWeightStrip todayIso={today} />
        </div>
      </details>

      <details className="group border-2 border-border bg-card">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
          {t('fuelShowMore', { defaultValue: 'Search, barcode & recipes' })}
        </summary>
        <div className="space-y-4 border-t-2 border-border p-4">
          <FuelMoreTools onLogFood={addEntry} />
          <FuelRecipesPanel
            freeRecipes={freeRecipes}
            premium={premium}
            premiumRecipes={premiumRecipes}
            premiumFetchError={premiumFetchError}
            onRetryPremium={() => setPremiumRetry((n) => n + 1)}
            onLogRecipe={(draft) =>
              addEntry(draft.name, draft.protein, draft.cals, draft.carbs, draft.fat)
            }
          />
          {isFreeBeta() ? (
            <p className="text-xs text-muted-foreground">
              {t('fuelSubtitleDepthBeta', {
                free: inv.recipes.free,
                unlocked: inv.unlockedTotal.recipes,
                defaultValue: `${inv.recipes.free} free recipes · ${inv.unlockedTotal.recipes} unlocked in Alpha.`,
              })}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('fuelSubtitleDepthPaid', {
                free: inv.recipes.free,
                premium: inv.recipes.premium,
                defaultValue: `${inv.recipes.free} free recipes · Super Bundle adds ${inv.recipes.premium} more.`,
              })}
            </p>
          )}
        </div>
      </details>

      <FuelPastDaysCard
        logs={allLogs}
        todayIso={today}
        onCopyDayToToday={handleCopyDayToToday}
      />

      <div className="text-xs leading-relaxed text-muted-foreground">
        {t('fuelLocalNote', {
          defaultValue:
            'Meals stay on this device. Sign in anytime to sync across phones and the web.',
        })}
      </div>

      <SignInPrompt
        className="mt-2"
        nextPath="/nutrition"
        description={t('fuelSignInDesc', {
          defaultValue: 'Sync meals and macro history across devices.',
        })}
      />

      {!logSheetOpen ? (
        <Button
          variant="default"
          size="lg"
          /* 56px, not 52 — the tab bar's real height since the five-tab recut.
             It is in flow now, so this offset clears an element that actually
             occupies the bottom of the shell rather than one overlaying it. */
          className="fixed bottom-[calc(56px+env(safe-area-inset-bottom)+12px)] end-4 z-40 h-14 gap-2 px-5 md:bottom-6"
          onClick={() => setLogSheetOpen(true)}
        >
          <Plus className="h-5 w-5" />
          {t('fuelLogFab', { defaultValue: 'Log food' })}
        </Button>
      ) : null}

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
