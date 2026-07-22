'use client';
/**
 * Page: /nutrition — Fuel pillar
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { getUser, saveNutritionEntry, getUserNutritionForDate } from '@/lib/supabase';
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
import { estimateMealFromDescription } from '@/lib/nlMealLog';
import { listMealPresets, saveMealPreset, type SavedMealPreset } from '@/lib/savedMeals';
import { bumpFuelLogStreak, getFuelLogStreak } from '@/lib/fuelStreak';
import {
  DEFAULT_QUICK_FOODS,
  getFrequentQuickFoods,
  getYesterdayEntries,
  parseNutritionLog,
  pruneNutritionLogToDays,
} from '@/lib/nutritionQuickLog';
import { DEFAULT_MACRO_TARGETS, loadMacroTargets } from '@/lib/macroTargets';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { useToast } from '@/hooks/use-toast';

const freeRecipes = FREE_RECIPES;
const QUICK_FOODS = DEFAULT_QUICK_FOODS;

type LogEntry = FuelLogEntry;

export function NutritionPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { premium } = usePremium();
  const [premiumRecipes, setPremiumRecipes] = useState<Recipe[]>([]);
  const [premiumFetchError, setPremiumFetchError] = useState(false);
  const [targetCals, setTargetCals] = useState(2200);
  const [targetProtein, setTargetProtein] = useState(160);
  const [logged, setLogged] = useState<LogEntry[]>([]);
  const [water, setWater] = useState(0);
  const [customName, setCustomName] = useState('');
  const [customP, setCustomP] = useState(20);
  const [customC, setCustomC] = useState(200);
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
  const [moreOpen, setMoreOpen] = useState(false);
  const [savedMeals, setSavedMeals] = useState<SavedMealPreset[]>(() =>
    typeof window !== 'undefined' ? listMealPresets() : []
  );
  const [allLogs, setAllLogs] = useState(() =>
    typeof window !== 'undefined' ? parseNutritionLog(localStorage.getItem('mw_nutrition_log')) : []
  );

  const today = new Date().toISOString().split('T')[0];
  const frequentFoods = getFrequentQuickFoods(allLogs, QUICK_FOODS);
  const yesterdayMeals = getYesterdayEntries(allLogs, today);

  useEffect(() => {
    const savedTargets = loadMacroTargets();
    if (savedTargets) {
      setTargetCals(savedTargets.cals);
      setTargetProtein(savedTargets.protein);
    } else {
      setTargetCals(DEFAULT_MACRO_TARGETS.cals);
      setTargetProtein(DEFAULT_MACRO_TARGETS.protein);
    }

    const saved = localStorage.getItem('mw_nutrition_log');
    if (saved) {
      const rawParsed = parseNutritionLog(saved);
      const parsed = pruneNutritionLogToDays(rawParsed, 90);
      if (parsed.length !== rawParsed.length) {
        localStorage.setItem('mw_nutrition_log', JSON.stringify(parsed));
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
    const savedWater = localStorage.getItem('mw_water');
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
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
          title: t('fuelPremiumFetchFailed', { defaultValue: 'Could not load premium recipes' }),
          description: t('fuelPremiumFetchFailedDesc', {
            defaultValue: 'Free recipes still work. Check your connection and try again.',
          }),
          variant: 'destructive',
        });
      });
  }, [premium, t, toast]);

  useEffect(() => {
    setFuelStreak(getFuelLogStreak());
  }, [logged]);

  useEffect(() => {
    localStorage.setItem('mw_water', water.toString());
  }, [water]);

  useEffect(() => {
    const todayRows = logged.map((l) => ({
      ...l,
      date: today,
    }));
    const older = allLogs.filter((l) => l.date && l.date !== today);
    const next = pruneNutritionLogToDays([...older, ...todayRows], 90);
    localStorage.setItem('mw_nutrition_log', JSON.stringify(next));
  }, [logged, allLogs, today]);

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

  const addEntry = (name: string, p: number, c: number, carbs = 0, fat = 0, meal = activeMeal) => {
    const entry: LogEntry & { date: string } = {
      name,
      protein: p,
      cals: c,
      carbs,
      fat,
      meal,
      date: today,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setLogged((prev) => [...prev, entry]);
    setAllLogs((prev) => {
      const next = pruneNutritionLogToDays([...prev, entry], 90);
      localStorage.setItem('mw_nutrition_log', JSON.stringify(next));
      return next;
    });
    setFuelStreak(bumpFuelLogStreak());
    syncProteinChallengeFromNutrition();
    getUser().then((u) => {
      if (u) saveNutritionEntry({ date: today, name, protein: p, cals: c, carbs, fat }).catch(() => {});
    });
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    addEntry(customName.trim(), customP, customC);
    setCustomName('');
  };

  const handleNlMealTextChange = (text: string) => {
    setNlMealText(text);
    setNlPreview(estimateMealFromDescription(text));
  };

  const handleLogNlMeal = () => {
    if (!nlPreview) return;
    addEntry(nlPreview.name, nlPreview.protein, nlPreview.cals, nlPreview.carbs, nlPreview.fat);
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
        (m.meal as MealType) ?? activeMeal
      );
    }
  };

  const totalProtein = logged.reduce((s, l) => s + l.protein, 0);
  const totalCals = logged.reduce((s, l) => s + l.cals, 0);
  const totalCarbs = logged.reduce((s, l) => s + (l.carbs || 0), 0);
  const totalFat = logged.reduce((s, l) => s + (l.fat || 0), 0);
  const carbsTarget = Math.max(1, Math.round((targetCals * 0.45) / 4));
  const fatTarget = Math.max(1, Math.round((targetCals * 0.25) / 9));

  const loadCloudNutrition = async () => {
    const u = await getUser();
    if (u) {
      const cloud = await getUserNutritionForDate(today);
      if (cloud.length > 0) {
        const mapped = cloud.map((c) => ({
          name: c.name,
          protein: c.protein,
          cals: c.cals,
          carbs: c.carbs,
          fat: c.fat,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setLogged((prev) => {
          const combined = [...prev, ...mapped.filter((m) => !prev.some((p) => p.name === m.name))];
          localStorage.setItem('mw_nutrition_log', JSON.stringify(combined));
          return combined;
        });
      }
    }
  };

  return (
    <PillarPageShell
      className="max-w-3xl pb-24"
      icon={UtensilsCrossed}
      eyebrow={t('fuelEyebrow', { defaultValue: 'Fuel' })}
      title={t('fuelTitle', { defaultValue: 'Nutrition' })}
      subtitle={t('fuelSubtitle', {
        defaultValue:
          'Free core: daily macro log, water, targets, and accessible recipes worldwide.',
      })}
      headerActions={
        fuelStreak > 0 ? (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary shrink-0">
            {t('fuelLogStreak', {
              count: fuelStreak,
              defaultValue: `${fuelStreak}-day log streak`,
            })}
          </span>
        ) : undefined
      }
    >
      <FuelMacroOverview
        totalCals={totalCals}
        targetCals={targetCals}
        totalProtein={totalProtein}
        targetProtein={targetProtein}
        totalCarbs={totalCarbs}
        carbsTarget={carbsTarget}
        totalFat={totalFat}
        fatTarget={fatTarget}
        water={water}
      >
        <FuelQuickLogPanel
          activeMeal={activeMeal}
          onActiveMealChange={setActiveMeal}
          mealLabel={mealLabel}
          nlMealText={nlMealText}
          onNlMealTextChange={handleNlMealTextChange}
          nlPreview={nlPreview}
          onLogNlMeal={handleLogNlMeal}
          frequentFoods={frequentFoods}
          onQuickLog={addEntry}
          savedMeals={savedMeals}
          onOpenLogSheet={() => setLogSheetOpen(true)}
          water={water}
          onWaterChange={setWater}
          yesterdayMeals={yesterdayMeals}
          onRepeatYesterday={handleRepeatYesterday}
        />
      </FuelMacroOverview>

      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setMoreOpen((o) => !o)}
        >
          {moreOpen
            ? t('fuelHideMore', { defaultValue: 'Hide search & recipes' })
            : t('fuelShowMore', { defaultValue: 'Search, barcode & recipes' })}
        </Button>
      </div>

      {moreOpen && (
        <>
          <FuelMoreTools onLogFood={addEntry} />
          <FuelRecipesPanel
            freeRecipes={freeRecipes}
            premium={premium}
            premiumRecipes={premiumRecipes}
            premiumFetchError={premiumFetchError}
            onLogRecipe={(r) => addEntry(r.name, r.protein, r.cals, r.carbs, r.fat)}
          />
        </>
      )}

      <FuelTodayLogCard
        logged={logged}
        totalProtein={totalProtein}
        totalCals={totalCals}
        cloudStatus={cloudStatus}
        mealLabel={mealLabel}
        onClearDay={() => {
          setLogged([]);
          setWater(0);
        }}
        onRemoveEntry={(index) => {
          setLogged((prev) => prev.filter((_, i) => i !== index));
        }}
        onLoadCloud={async () => {
          setCloudStatus(t('fuelCloudLoading', { defaultValue: 'Loading...' }));
          await loadCloudNutrition();
          setCloudStatus(t('fuelCloudLoaded', { defaultValue: 'Cloud loaded (signed-in only)' }));
          setTimeout(() => setCloudStatus(''), 1800);
        }}
        onOpenLogSheet={() => setLogSheetOpen(true)}
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

      <div className="text-[10px] text-muted-foreground">
        {t('fuelLocalNote', {
          defaultValue:
            'Data stored locally (synced when you sign in). Full integration + meal plans in the paid Nutrition course.',
        })}
      </div>

      <SignInPrompt
        className="mt-2"
        nextPath="/nutrition"
        description={t('fuelSignInDesc', {
          defaultValue: 'Sync meals and macro history across devices.',
        })}
      />

      <Button
        variant="outline"
        size="lg"
        className="fixed bottom-[calc(52px+env(safe-area-inset-bottom)+12px)] end-4 z-40 h-14 rounded-2xl border-primary gap-2 px-5 md:bottom-6"
        onClick={() => setLogSheetOpen(true)}
      >
        <Plus className="h-5 w-5" />
        {t('fuelLogFab', { defaultValue: 'Log food' })}
      </Button>

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
        onCustomNameChange={setCustomName}
        onCustomPChange={setCustomP}
        onCustomCChange={setCustomC}
        onCustomLog={addCustom}
      />
    </PillarPageShell>
  );
}
