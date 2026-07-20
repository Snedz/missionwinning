'use client';
/**
 * Page: /nutrition — Fuel pillar
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUser, saveNutritionEntry, getUserNutritionForDate } from '@/lib/supabase';
import { syncProteinChallengeFromNutrition } from '@/lib/challenges';
import { FREE_RECIPES } from '@/data/recipes/freeRecipes';
import type { Recipe } from '@/data/recipes/types';
import { usePremium } from '@/hooks/usePremium';
import { fetchPremiumCatalogJson } from '@/lib/premiumCatalogCache';
import { FuelLogSheet, type MealType } from '@/components/nutrition/FuelLogSheet';
import { FoodSearchBar } from '@/components/nutrition/FoodSearchBar';
import { BarcodeLookup } from '@/components/nutrition/BarcodeLookup';
import { FuelMacroOverview } from '@/components/nutrition/FuelMacroOverview';
import { FuelTodayLogCard, type FuelLogEntry } from '@/components/nutrition/FuelTodayLogCard';
import { FuelRecipesPanel } from '@/components/nutrition/FuelRecipesPanel';
import type { FoodSearchItem } from '@/lib/foodSearch';
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
  const [activeMeal, setActiveMeal] = useState<MealType>('lunch');
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
    // Persist full history (not just today) and keep a 90-day bound.
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
    setLogged((prev) => {
      const next = [...prev, entry];
      return next;
    });
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
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="fuel-nl-meal">
            {t('fuelNlTitle', { defaultValue: 'Describe what you ate' })}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="fuel-nl-meal"
              type="text"
              value={nlMealText}
              placeholder={t('fuelNlPlaceholder', {
                defaultValue: 'chicken rice broccoli…',
              })}
              onChange={(e) => {
                const v = e.target.value;
                setNlMealText(v);
                setNlPreview(estimateMealFromDescription(v));
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                const est = estimateMealFromDescription(nlMealText);
                if (!est) return;
                addEntry(est.name, est.protein, est.cals, est.carbs, est.fat);
                setNlMealText('');
                setNlPreview(null);
              }}
              className="flex-1 h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              variant="fitness"
              className="h-11 gap-2 shrink-0"
              disabled={!nlPreview}
              onClick={() => {
                if (!nlPreview) return;
                addEntry(
                  nlPreview.name,
                  nlPreview.protein,
                  nlPreview.cals,
                  nlPreview.carbs,
                  nlPreview.fat
                );
                setNlMealText('');
                setNlPreview(null);
              }}
            >
              <Plus className="h-4 w-4" />
              {t('fuelLogMeal', { defaultValue: 'Log meal' })}
            </Button>
          </div>
          {nlPreview && (
            <p className="text-xs text-muted-foreground tabular-nums">
              {t('fuelNlPreview', {
                name: nlPreview.name,
                protein: nlPreview.protein,
                cals: nlPreview.cals,
                defaultValue: `Est. ${nlPreview.name} — ${nlPreview.protein}g P · ${nlPreview.cals} kcal (${nlPreview.confidence})`,
              })}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {frequentFoods.map(([name, p, c, carbs, fat]) => (
            <Button
              key={name}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => addEntry(name, p, c, carbs, fat)}
            >
              {name}
            </Button>
          ))}
        </div>
        {savedMeals.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {t('fuelSavedMeals', { defaultValue: 'Saved meals' })}
            </p>
            <div className="flex flex-wrap gap-2">
              {savedMeals.map((m) => (
                <Button
                  key={m.id}
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  onClick={() => addEntry(m.name, m.protein, m.cals, m.carbs, m.fat)}
                >
                  {m.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 items-center">
          <Button variant="outline" size="sm" onClick={() => setLogSheetOpen(true)}>
            <Plus className="h-3.5 w-3.5 me-1" />
            {t('fuelLogDetailed', { defaultValue: 'Detailed log' })}
          </Button>
          <div className="flex items-center gap-1 ms-auto">
            <Button size="sm" variant="ghost" onClick={() => setWater(Math.max(0, water - 1))}>
              −
            </Button>
            <span className="text-sm tabular-nums text-muted-foreground min-w-[4.5rem] text-center">
              {water} {t('fuelGlasses', { defaultValue: 'glasses' })}
            </span>
            <Button size="sm" variant="ghost" onClick={() => setWater(water + 1)}>
              +
            </Button>
          </div>
        </div>
        {yesterdayMeals.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
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
            }}
          >
            {t('fuelRepeatYesterday', {
              count: yesterdayMeals.length,
              defaultValue: `Repeat yesterday (${yesterdayMeals.length} items)`,
            })}
          </Button>
        )}
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
          <div className="text-xs bg-muted/20 p-3 rounded space-y-2">
            <p>
              {t('fuelScienceCh5', {
                defaultValue:
                  'Protein insight (textbook ch.5): Essential for growth, repair, enzymes, and hormones. Active clients often need 1.6–2.2g/kg. Use complete proteins; time intake around workouts. Variety covers essential aminos — recipes below follow these principles.',
              })}
            </p>
            <p>
              {t('fuelScienceCh12', {
                defaultValue:
                  'Nutrition for bodybuilders (ch.12): Complex carbs fuel training; healthy fats support hormones (15–30% calories). Vitamins/minerals from whole foods; fiber 20–30g+. Post-workout protein + carbs aid recovery. Hydration matters — prioritize local whole foods.',
              })}
            </p>
          </div>

          <Card className="content-card">
            <CardHeader>
              <CardTitle>{t('fuelSearchTitle', { defaultValue: 'Search foods' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BarcodeLookup
                onSelect={(item) => {
                  addEntry(
                    item.brand ? `${item.name} (${item.brand})` : item.name,
                    item.protein,
                    item.calories,
                    item.carbs,
                    item.fat
                  );
                }}
              />
              <FoodSearchBar
                onSelect={(item: FoodSearchItem) => {
                  addEntry(
                    item.brand ? `${item.name} (${item.brand})` : item.name,
                    item.protein,
                    item.calories,
                    item.carbs,
                    item.fat
                  );
                }}
              />
            </CardContent>
          </Card>
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

      {moreOpen && (
        <FuelRecipesPanel
          freeRecipes={freeRecipes}
          premium={premium}
          premiumRecipes={premiumRecipes}
          premiumFetchError={premiumFetchError}
          onLogRecipe={(r) => addEntry(r.name, r.protein, r.cals, r.carbs, r.fat)}
        />
      )}

      <SignInPrompt
        className="mt-2"
        nextPath="/nutrition"
        description={t('fuelSignInDesc', {
          defaultValue: 'Sync meals and macro history across devices.',
        })}
      />

      <Button
        variant="fitness"
        size="lg"
        className="fixed bottom-[calc(52px+env(safe-area-inset-bottom)+12px)] end-4 z-40 h-14 rounded-2xl shadow-lg shadow-emerald-950/40 gap-2 px-5 md:bottom-6"
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
