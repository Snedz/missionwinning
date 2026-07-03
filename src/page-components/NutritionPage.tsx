'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUser, saveNutritionEntry, getUserNutritionForDate } from "@/lib/supabase";
import { syncProteinChallengeFromNutrition } from "@/lib/challenges";
import { FREE_RECIPES } from "@/data/recipes/freeRecipes";
import type { Recipe } from "@/data/recipes/types";
import { usePremium } from "@/hooks/usePremium";
import { FuelLogSheet, type MealType } from "@/components/nutrition/FuelLogSheet";
import { FoodSearchBar } from "@/components/nutrition/FoodSearchBar";
import { BarcodeLookup } from "@/components/nutrition/BarcodeLookup";
import type { FoodSearchItem } from "@/lib/foodSearch";
import { MetricRing } from "@/components/ui/MetricRing";
import { StaggerGroup, StaggerItem } from "@/components/layout/StaggerReveal";
import { bumpFuelLogStreak, getFuelLogStreak } from "@/lib/fuelStreak";
import { DEFAULT_MACRO_TARGETS, loadMacroTargets } from "@/lib/macroTargets";
import { SignInPrompt } from "@/components/auth/SignInPrompt";
import { Plus, UtensilsCrossed } from "lucide-react";
import { PillarPageHeader } from "@/components/layout/PillarPageHeader";

const FREE_RECIPE_COUNT = 12;

interface LogEntry {
  name: string;
  protein: number;
  cals: number;
  carbs?: number;
  fat?: number;
  time: string;
  meal?: MealType;
}

const QUICK_FOODS = [
  ["Chicken breast 150g", 45, 165, 0, 3],
  ["Oats 80g dry", 10, 300, 54, 5],
  ["Eggs 3 large", 18, 210, 1, 15],
  ["Rice 200g cooked", 8, 260, 56, 0],
  ["Banana 1 med", 1, 105, 27, 0],
  ["Greek yogurt 200g", 20, 130, 8, 0],
  ["Almonds 30g", 6, 170, 6, 15],
  ["Salmon 120g", 25, 250, 0, 15],
] as const;

export function NutritionPage() {
  // Free core per vision.md: Basic logging, targets, accessible recipes free for all worldwide.
  // Premium deep plans/recipes in Fuel pillar or Super Bundle. Core mission free forever.

  const { t } = useTranslation();
  const { premium, loading: premiumLoading } = usePremium();
  const [premiumRecipes, setPremiumRecipes] = useState<Recipe[]>([]);
  const [targetCals, setTargetCals] = useState(2200);
  const [targetProtein, setTargetProtein] = useState(160);
  const [logged, setLogged] = useState<LogEntry[]>([]);
  const [water, setWater] = useState(0);
  const [customName, setCustomName] = useState("");
  const [customP, setCustomP] = useState(20);
  const [customC, setCustomC] = useState(200);
  const [cloudStatus, setCloudStatus] = useState("");
  const [logSheetOpen, setLogSheetOpen] = useState(false);
  const [activeMeal, setActiveMeal] = useState<MealType>("lunch");
  const [fuelStreak, setFuelStreak] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  // Persist + cloud load/save
  useEffect(() => {
    const savedTargets = loadMacroTargets();
    if (savedTargets) {
      setTargetCals(savedTargets.cals);
      setTargetProtein(savedTargets.protein);
    } else {
      setTargetCals(DEFAULT_MACRO_TARGETS.cals);
      setTargetProtein(DEFAULT_MACRO_TARGETS.protein);
    }

    const saved = localStorage.getItem("mw_nutrition_log");
    if (saved) setLogged(JSON.parse(saved));
    const savedWater = localStorage.getItem("mw_water");
    if (savedWater) setWater(parseInt(savedWater));

    // Load today's cloud entries if signed in
    getUser().then(u => {
      if (u) {
        getUserNutritionForDate(today).then(cloud => {
          if (cloud.length > 0) {
            const mapped = cloud.map(c => ({
              name: c.name,
              protein: c.protein,
              cals: c.cals,
              carbs: c.carbs,
              fat: c.fat,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setLogged(prev => {
              const combined = [...prev, ...mapped.filter(m => !prev.some(p => p.name === m.name))];
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
      return;
    }
    fetch('/api/premium/recipes', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { recipes: [] }))
      .then((data) => setPremiumRecipes(data.recipes ?? []))
      .catch(() => setPremiumRecipes([]));
  }, [premium]);

  useEffect(() => {
    setFuelStreak(getFuelLogStreak());
  }, [logged]);

  useEffect(() => {
    localStorage.setItem("mw_water", water.toString());
  }, [water]);

  useEffect(() => {
    localStorage.setItem("mw_nutrition_log", JSON.stringify(logged));
  }, [logged]);

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

  const groupedLog = logged.reduce<Record<string, LogEntry[]>>((acc, entry) => {
    const key = entry.meal ?? 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  const addEntry = (name: string, p: number, c: number, carbs = 0, fat = 0, meal = activeMeal) => {
    const entry: LogEntry = {
      name,
      protein: p,
      cals: c,
      carbs,
      fat,
      meal,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setLogged((prev) => [...prev, entry]);
    setFuelStreak(bumpFuelLogStreak());
    syncProteinChallengeFromNutrition();
    getUser().then((u) => {
      if (u) saveNutritionEntry({ date: today, name, protein: p, cals: c, carbs, fat }).catch(() => {});
    });
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    addEntry(customName.trim(), customP, customC);
    setCustomName("");
  };

  const totalProtein = logged.reduce((s, l) => s + l.protein, 0);
  const totalCals = logged.reduce((s, l) => s + l.cals, 0);
  const totalCarbs = logged.reduce((s, l) => s + (l.carbs || 0), 0);
  const totalFat = logged.reduce((s, l) => s + (l.fat || 0), 0);

  const pillarWins = logged.filter(l => /win|assessment|mobility|mind/i.test(l.name));

  const loadCloudNutrition = async () => {
    const u = await getUser();
    if (u) {
      const cloud = await getUserNutritionForDate(today);
      if (cloud.length > 0) {
        const mapped = cloud.map(c => ({
          name: c.name,
          protein: c.protein,
          cals: c.cals,
          carbs: c.carbs,
          fat: c.fat,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setLogged(prev => {
          const combined = [...prev, ...mapped.filter(m => !prev.some(p => p.name === m.name))];
          localStorage.setItem("mw_nutrition_log", JSON.stringify(combined));
          return combined;
        });
      }
    }
  };

  const pProgress = Math.min(100, Math.round((totalProtein / targetProtein) * 100));
  const cProgress = Math.min(100, Math.round((totalCals / targetCals) * 100));

  const clearDay = () => {
    setLogged([]);
    setWater(0);
  };


  const freeRecipes = FREE_RECIPES;

  return (
    <StaggerGroup className="space-y-6 max-w-3xl pb-24">
      <StaggerItem index={0}>
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <PillarPageHeader
            icon={UtensilsCrossed}
            title={t('fuelTitle', { defaultValue: 'Nutrition' })}
            subtitle={t('fuelSubtitle', {
              defaultValue:
                'Free core: daily macro log, water, targets, and accessible recipes worldwide.',
            })}
            className="flex-1 min-w-0"
          />
          {fuelStreak > 0 && (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1 text-xs font-medium text-emerald-400 shrink-0">
              {t('fuelLogStreak', { count: fuelStreak, defaultValue: `${fuelStreak}-day log streak` })}
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm">
          {premium
            ? t('fuelPremiumActive', {
                defaultValue: ' Premium: full recipe library + deep plans (Super Bundle).',
              })
            : t('fuelBundleUpsell', {
                defaultValue:
                  ' Super Bundle unlocks the full recipe library and advanced meal plans.',
              })}{' '}
          {t('fuelHighProteinNote', { defaultValue: 'High-protein days boost your' })}{' '}
          <a href="/log" className="underline">
            {t('fuelWinScore', { defaultValue: 'Win Score' })}
          </a>
          .
        </p>
      </div>
      </StaggerItem>

      <StaggerItem index={1}>
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="content-card">
          <CardHeader><CardTitle>{t('fuelTargetsTitle', { defaultValue: "Today's Targets" })}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-around gap-4">
              <MetricRing
                label={t('fuelCalories', { defaultValue: 'Calories' })}
                value={`${totalCals}`}
                sublabel={`/ ${targetCals}`}
                progress={cProgress}
              />
              <MetricRing
                label={t('fuelProtein', { defaultValue: 'Protein' })}
                value={`${totalProtein}g`}
                sublabel={`/ ${targetProtein}g`}
                progress={pProgress}
                accentClassName="text-emerald-300"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {t('fuelMacrosSummary', {
                carbs: totalCarbs,
                fat: totalFat,
                water,
                defaultValue: `Carbs: ${totalCarbs}g • Fat: ${totalFat}g • Water: ${water} / 8 glasses`,
              })}
            </div>
            {pillarWins.length > 0 && (
              <div className="mt-2 text-[10px] text-emerald-400">
                {t('fuelPillarWinsToday', {
                  count: pillarWins.length,
                  example: pillarWins[0]?.name ?? '',
                  defaultValue: `Pillar wins today (Move/Mind/Assess): ${pillarWins.length} — e.g. ${pillarWins[0]?.name}`,
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="content-card">
          <CardHeader><CardTitle>{t('fuelHydrationTitle', { defaultValue: 'Hydration' })}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setWater(Math.max(0, water-1))}>-</Button>
              <div className="flex-1 text-center text-2xl font-bold tabular-nums">{water} <span className="text-sm font-normal">{t('fuelGlasses', { defaultValue: 'glasses' })}</span></div>
              <Button size="sm" variant="outline" onClick={() => setWater(water+1)}>+</Button>
            </div>
            <div className="text-xs text-center mt-2 text-muted-foreground">{t('fuelHydrationHint', { defaultValue: 'Aim for 8+ (adjust for climate/activity)' })}</div>
          </CardContent>
        </Card>
      </div>
      </StaggerItem>

      <StaggerItem index={2}>
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
      </StaggerItem>

      <StaggerItem index={3}>
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
      </StaggerItem>

      <StaggerItem index={4}>
      <Card className="content-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('fuelTodayLogTitle', { defaultValue: "Today's Log" })}</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={clearDay}>{t('fuelClearDay', { defaultValue: 'Clear day' })}</Button>
            <Button variant="outline" size="sm" onClick={async () => {
              setCloudStatus(t('fuelCloudLoading', { defaultValue: 'Loading...' }));
              await loadCloudNutrition();
              setCloudStatus(t('fuelCloudLoaded', { defaultValue: 'Cloud loaded (signed-in only)' }));
              setTimeout(() => setCloudStatus(''), 1800);
            }}>{t('fuelLoadCloud', { defaultValue: 'Load from Cloud' })}</Button>
            {cloudStatus && <span className="text-[10px] text-emerald-400 ml-2">{cloudStatus}</span>}
          </div>
        </CardHeader>
        <CardContent>
          {logged.length === 0 && (
            <div className="text-muted-foreground text-sm">
              {t('fuelNoEntries', { defaultValue: 'No entries yet. Tap + Log food to add your first meal.' })}
            </div>
          )}
          {Object.entries(groupedLog).map(([mealKey, entries]) => (
            <div key={mealKey} className="mb-4 last:mb-0">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                {mealKey === 'other' ? mealLabel() : mealLabel(mealKey as MealType)}
              </div>
              <ul className="space-y-1 text-sm">
                {entries.map((l, i) => (
                  <li key={`${mealKey}-${i}`} className="flex justify-between">
                    <span>{l.time} — {l.name}</span>
                    <span className="text-muted-foreground tabular-nums">+{l.protein}g P • {l.cals} kcal</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mt-4 pt-3 border-t text-sm flex justify-between font-medium">
            <span>{t('fuelTotals', { defaultValue: 'Totals' })}</span>
            <span className="tabular-nums">{t('fuelTotalsLine', { protein: totalProtein, cals: totalCals, defaultValue: `${totalProtein}g protein • ${totalCals} kcal` })}</span>
          </div>
        </CardContent>
      </Card>
      </StaggerItem>

      <div className="text-[10px] text-muted-foreground">{t('fuelLocalNote', { defaultValue: 'Data stored locally (synced when you sign in). Full integration + meal plans in the paid Nutrition course.' })}</div>

      <Card className="content-card">
        <CardHeader><CardTitle>{t('fuelFreeRecipesTitle', { count: FREE_RECIPE_COUNT, defaultValue: `Free Recipes (${FREE_RECIPE_COUNT} — core mission)` })}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {freeRecipes.map((r, i) => (
            <div key={i} className="border border-white/10 rounded p-3 bg-black/20">
              <div className="flex justify-between gap-2 flex-wrap">
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-emerald-400">{r.protein}g protein • {r.cals} kcal</div>
                </div>
                <Button size="sm" variant="fitness" onClick={() => addEntry(r.name, r.protein, r.cals, r.carbs, r.fat)}>
                  {t('logRecipe', { defaultValue: 'Log Recipe' })}
                </Button>
              </div>
              <div className="text-xs mt-1 text-white/70">{r.ingredients}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {premium ? (
      <Card className="content-card">
        <CardHeader><CardTitle>{t('fuelPremiumRecipesTitle', { defaultValue: 'Premium Recipes & Meal Ideas (Super Bundle)' })}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {premiumRecipes.map((r, i) => (
            <div key={i} className="border border-white/10 rounded p-3 bg-black/20">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-emerald-400">{r.protein}g protein • {r.cals} kcal • {r.carbs}c {r.fat}f</div>
                </div>
                <Button size="sm" variant="fitness" className="w-full" onClick={() => addEntry(r.name, r.protein, r.cals, r.carbs, r.fat)}>{t('logRecipe', { defaultValue: 'Log Entire Recipe + Boost Score' })}</Button>
              </div>
              <div className="text-xs mt-1 text-white/70">{r.ingredients}</div>
              <div className="text-xs mt-1">{r.instructions}</div>
              <div className="text-[10px] text-emerald-300 mt-1 italic">{r.tip}</div>
            </div>
          ))}
          <div className="text-xs text-muted-foreground">
            {t('fuelPremiumRecipesFoot', {
              defaultValue: 'Seeded from protein science + DASH/Med principles for global accessibility.',
            })}
          </div>
        </CardContent>
      </Card>
      ) : (
        <Card className="content-card border-emerald-500/30">
          <CardHeader>
            <CardTitle>{t('fuelPremiumLockedTitle', { count: premiumRecipes.length, defaultValue: `+${premiumRecipes.length} Premium Recipes` })}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>{t('fuelPremiumLockedBody', { defaultValue: 'Unlock the full Fuel pillar recipe library, meal timing strategies, and advanced macro coaching via the Super Bundle.' })}</p>
            <Button variant="fitness" asChild>
              <Link href="/bundle">{t('fuelExploreBundle', { defaultValue: 'Explore Super Bundle' })}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <SignInPrompt className="mt-2" nextPath="/nutrition" description={t('fuelSignInDesc', { defaultValue: 'Sync meals and macro history across devices.' })} />

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
        quickFoods={QUICK_FOODS}
        onLog={(name, p, c, carbs, fat) => addEntry(name, p, c, carbs, fat, activeMeal)}
        customName={customName}
        customP={customP}
        customC={customC}
        onCustomNameChange={setCustomName}
        onCustomPChange={setCustomP}
        onCustomCChange={setCustomC}
        onCustomLog={addCustom}
      />
    </StaggerGroup>
  );
}

