'use client';

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUser, saveNutritionEntry, getUserNutritionForDate } from "@/lib/supabase";
import { syncProteinChallengeFromNutrition } from "@/lib/challenges";
import { FREE_RECIPES } from "@/data/recipes/freeRecipes";
import type { Recipe } from "@/data/recipes/types";
import { usePremium } from "@/hooks/usePremium";
import { PhotoLogStub } from "@/components/nutrition/PhotoLogStub";
import { SignInPrompt } from "@/components/auth/SignInPrompt";

const FREE_RECIPE_COUNT = 12;

interface LogEntry {
  name: string;
  protein: number;
  cals: number;
  carbs?: number;
  fat?: number;
  time: string;
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
];

export function NutritionPage() {
  // Free core per vision.md: Basic logging, targets, accessible recipes free for all worldwide.
  // Premium deep plans/recipes in Fuel pillar or Super Bundle. Core mission free forever.

  const { t } = useTranslation();
  const { premium, loading: premiumLoading } = usePremium();
  const [premiumRecipes, setPremiumRecipes] = useState<Recipe[]>([]);
  const [targetCals] = useState(2200);
  const [targetProtein] = useState(160);
  const [logged, setLogged] = useState<LogEntry[]>([]);
  const [water, setWater] = useState(0);
  const [customName, setCustomName] = useState("");
  const [customP, setCustomP] = useState(20);
  const [customC, setCustomC] = useState(200);
  const [cloudStatus, setCloudStatus] = useState("");

  const today = new Date().toISOString().split('T')[0];

  // Persist + cloud load/save
  useEffect(() => {
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
    localStorage.setItem("mw_nutrition_log", JSON.stringify(logged));
  }, [logged]);

  useEffect(() => {
    localStorage.setItem("mw_water", water.toString());
  }, [water]);

  const addEntry = (name: string, p: number, c: number, carbs = 0, fat = 0) => {
    const entry: LogEntry = { name, protein: p, cals: c, carbs, fat, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setLogged(prev => [...prev, entry]);
    syncProteinChallengeFromNutrition();
    // Cloud sync
    getUser().then(u => {
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
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('fuelTitle', { defaultValue: 'Nutrition' })}</h2>
        <p className="text-muted-foreground">
          {t('fuelSubtitle', {
            defaultValue:
              'Free core: daily macro log, water, targets, and accessible recipes worldwide.',
          })}
          {premium
            ? ' Premium: full recipe library + deep plans (Super Bundle).'
            : ' Super Bundle unlocks the full recipe library and advanced meal plans.'}{' '}
          High-protein days boost your{' '}
          <a href="/log" className="underline">
            Win Score
          </a>
          .
        </p>
      </div>

      <PhotoLogStub
        onLogEstimate={(est) => {
          addEntry(est.name, est.protein, est.cals, est.carbs, est.fat);
        }}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Today's Targets</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Calories</span><span>{totalCals} / {targetCals}</span></div>
              <div className="h-2 bg-muted rounded"><div className="h-2 bg-emerald-500 rounded" style={{width: `${cProgress}%`}} /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Protein</span><span>{totalProtein}g / {targetProtein}g</span></div>
              <div className="h-2 bg-muted rounded"><div className="h-2 bg-emerald-500 rounded" style={{width: `${pProgress}%`}} /></div>
            </div>
            <div className="text-xs text-muted-foreground">Carbs: {totalCarbs}g • Fat: {totalFat}g • Water: {water} / 8 glasses</div>
            {pillarWins.length > 0 && (
              <div className="mt-2 text-[10px] text-emerald-400">Pillar wins today (Move/Mind/Assess): {pillarWins.length} — e.g. {pillarWins[0]?.name}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Hydration</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setWater(Math.max(0, water-1))}>-</Button>
              <div className="flex-1 text-center text-2xl font-bold tabular-nums">{water} <span className="text-sm font-normal">glasses</span></div>
              <Button size="sm" variant="outline" onClick={() => setWater(water+1)}>+</Button>
            </div>
            <div className="text-xs text-center mt-2 text-muted-foreground">Aim for 8+ (adjust for climate/activity)</div>
          </CardContent>
        </Card>
      </div>

      <div className="text-xs bg-muted/20 p-3 rounded">Protein insight from the specialist nutrition materials (textbook ch5): Essential for growth, maintenance, repair of cells (including muscle - actin/myosin), enzymes, hormones, and structural support (e.g. collagen). Active clients require more (1.6-2.2g/kg bodyweight); balance to avoid waste like ammonia/uric acid. Use complete proteins (animal or combined plant like beans+rice), BCAAs (leucine for protein synthesis, isoleucine/valine for energy) for recovery during intense exercise, glutamine for immune/gut health under stress. Time around workouts. From the textbook: prioritize variety for all essential aminos; excess can limit growth if energy is low. Recipes below emphasize these principles.

Ch12 Nutrition for Bodybuilders: Carbs are primary fuel (complex like oats, rice, potatoes for stable energy; avoid high GI except post-workout). Fats for hormones (15-30% calories from healthy sources like olive oil, salmon, nuts; avoid trans/saturated excess). Vitamins/minerals key for performance (A for vision, B's for energy, C/D for immunity/recovery, etc. from whole foods). Fiber 20-30g+ for digestion. Post-workout: protein + carbs for recovery. Hydration critical. Global accessible: focus on local whole foods over supplements.</div>

      <Card>
        <CardHeader><CardTitle>Quick Log (common foods)</CardTitle></CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          {QUICK_FOODS.map(([name, p, c, carbs, fat], i) => (
            <Button key={i} variant="outline" size="sm" onClick={() => addEntry(name as string, p as number, c as number, carbs as number, fat as number)}>{name}</Button>
          ))}
          <div className="w-full text-xs text-muted-foreground mt-2">More complete database + recipes in the full Nutrition program. Adjust targets via Calculators page.</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Custom Entry</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[120px]">
            <div className="text-xs mb-1">Food</div>
            <Input value={customName} onChange={e=>setCustomName(e.target.value)} placeholder="e.g. Apple" />
          </div>
          <div>
            <div className="text-xs mb-1">Protein g</div>
            <Input type="number" value={customP} onChange={e=>setCustomP(parseInt(e.target.value)||0)} className="w-20" />
          </div>
          <div>
            <div className="text-xs mb-1">Cals</div>
            <Input type="number" value={customC} onChange={e=>setCustomC(parseInt(e.target.value)||0)} className="w-20" />
          </div>
          <Button onClick={addCustom}>Log</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Today's Log</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={clearDay}>Clear day</Button>
            <Button variant="outline" size="sm" onClick={async () => { setCloudStatus('Loading...'); await loadCloudNutrition(); setCloudStatus('Cloud loaded (signed-in only)'); setTimeout(() => setCloudStatus(''), 1800); }}>Load from Cloud</Button>
            {cloudStatus && <span className="text-[10px] text-emerald-400 ml-2">{cloudStatus}</span>}
          </div>
        </CardHeader>
        <CardContent>
          {logged.length === 0 && <div className="text-muted-foreground text-sm">No entries yet. Use quick logs or custom above.</div>}
          <ul className="space-y-1 text-sm">
            {logged.map((l, i) => (
              <li key={i} className="flex justify-between">
                <span>{l.time} — {l.name}</span>
                <span className="text-muted-foreground">+{l.protein}g P • {l.cals} kcal</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t text-sm flex justify-between font-medium">
            <span>Totals</span>
            <span>{totalProtein}g protein • {totalCals} kcal</span>
          </div>
        </CardContent>
      </Card>

      <div className="text-[10px] text-muted-foreground">Data stored locally (synced when you sign in with Supabase in future updates). Full integration + meal plans in the paid Nutrition course.</div>

      <Card>
        <CardHeader><CardTitle>Free Recipes ({FREE_RECIPE_COUNT} — core mission)</CardTitle></CardHeader>
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
      <Card>
        <CardHeader><CardTitle>Premium Recipes &amp; Meal Ideas (Super Bundle)</CardTitle></CardHeader>
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
          <div className="text-xs text-muted-foreground">Seeded from protein science + DASH/Med principles for global accessibility.</div>
        </CardContent>
      </Card>
      ) : (
        <Card className="border-emerald-500/30">
          <CardHeader>
            <CardTitle>+{premiumRecipes.length} Premium Recipes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>Unlock the full Fuel pillar recipe library, meal timing strategies, and advanced macro coaching via the Super Bundle.</p>
            <Button variant="fitness" onClick={() => window.location.href = '/bundle'}>Explore Super Bundle</Button>
          </CardContent>
        </Card>
      )}

      <SignInPrompt className="mt-2" nextPath="/nutrition" description={t('fuelSignInDesc', { defaultValue: 'Sync meals and macro history across devices.' })} />
    </div>
  );
}

