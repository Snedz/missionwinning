import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUser, saveNutritionEntry, getUserNutritionForDate } from "@/lib/supabase";

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

// Seeded from protein science (textbook Ch5): complete proteins (all EAAs), leucine trigger for synthesis, balance to limit waste (ammonia/uric acid), global accessible ingredients, DASH/Med low-sodium high healthy fats/veggies lean proteins.
const RECIPES = [
  {
    name: "Elite Chicken Rice Power Bowl",
    protein: 52,
    cals: 620,
    carbs: 58,
    fat: 12,
    ingredients: "180g grilled chicken breast, 200g cooked rice, 100g broccoli, 1 tbsp olive oil, herbs, lemon",
    instructions: "Grill seasoned chicken. Steam broccoli. Combine over rice. Drizzle oil. Complete protein + veg for recovery. ~45g+ leucine rich from chicken.",
    tip: "From protein fundamentals: chicken provides all essential aminos. Pair with carb for glycogen. Avoid excess to limit ammonia/uric acid waste.",
  },
  {
    name: "Mediterranean Salmon Plate (DASH principles)",
    protein: 35,
    cals: 480,
    carbs: 22,
    fat: 28,
    ingredients: "120g baked salmon, 80g quinoa, 150g mixed greens/tomato/cucumber, 1/4 avocado, olive oil + lemon",
    instructions: "Bake salmon with herbs. Cook quinoa. Assemble salad. Top with avocado. Omega-3s + complete protein.",
    tip: "Per nutrition materials: fish complete protein, low sodium emphasis (DASH/Med), healthy fats support hormones/recovery. High bioavailability.",
  },
  {
    name: "Beef & Egg Scramble for Growth",
    protein: 48,
    cals: 580,
    carbs: 12,
    fat: 32,
    ingredients: "120g lean ground beef, 3 eggs, spinach, 50g feta or cheese, peppers/onion",
    instructions: "Brown beef. Scramble with eggs + veg. Top cheese. High contractile protein for muscle repair.",
    tip: "Beef + eggs: excellent EAA profile including leucine. From Ch5: contractile proteins (actin/myosin) need steady supply for training adaptation.",
  },
  {
    name: "Greek Yogurt Parfait (Quick Recovery)",
    protein: 38,
    cals: 340,
    carbs: 32,
    fat: 8,
    ingredients: "300g Greek yogurt (plain), 30g almonds/walnuts, 100g berries, 1 tbsp honey or none",
    instructions: "Layer yogurt, nuts, berries. Fast complete protein (whey/casein).",
    tip: "Dairy sources high quality complete protein. Great post-training for synthesis without heavy digestion load.",
  },
  // Additional from Ch12: carbs as primary fuel (complex for stable energy), fats 15-30% for hormones, vitamins/minerals from whole foods, fiber 20-30g+.
  {
    name: "Complex Carb Power Oats (Ch12 Fuel)",
    protein: 20,
    cals: 450,
    carbs: 70,
    fat: 8,
    ingredients: "80g oats, 200g Greek yogurt or milk, 30g nuts, berries, 1 tbsp flax/chia",
    instructions: "Cook oats with yogurt/milk. Top nuts, seeds, berries. Pre/post workout carb focus for glycogen.",
    tip: "Ch12: Complex carbs (oats, rice, potatoes, quinoa) preferred for stable blood sugar. Low-GI most of day; higher GI post-workout ok. Fiber aids digestion.",
  },
  {
    name: "Healthy Fat Salmon Bowl (Ch12 Hormones)",
    protein: 40,
    cals: 550,
    carbs: 30,
    fat: 30,
    ingredients: "150g salmon, 150g sweet potato or rice, avocado, olive oil, greens, nuts",
    instructions: "Bake salmon. Roast sweet potato. Assemble with avocado/oil. 15-30% calories from fats per Ch12.",
    tip: "Fats for hormones, brain, insulation. Prioritize unsaturated (olive, salmon, nuts, flax). Limit trans/saturated. Ch12: quality fats support training recovery.",
  },
  {
    name: "Vitamin Packed Veggie Stir (Ch12 Micronutrients)",
    protein: 25,
    cals: 380,
    carbs: 45,
    fat: 12,
    ingredients: "150g chicken or tofu, 200g mixed veggies (broccoli, spinach, peppers), 100g brown rice, olive oil, lemon",
    instructions: "Stir fry protein + veggies. Serve over rice. Add seeds for extra nutrients.",
    tip: "Ch12: Veggies for vitamins (A, C, B's, minerals like iron/magnesium). Aim variety daily. Fiber for gut health. Hydrate well.",
  },
  {
    name: "Post-Workout Carb + Protein Recovery (Ch12)",
    protein: 35,
    cals: 520,
    carbs: 65,
    fat: 10,
    ingredients: "150g chicken breast, 250g white rice or potato, 1 banana, 20g nuts or whey if available",
    instructions: "Grill chicken, cook rice/potato. Add banana for quick carbs. Nuts for fats.",
    tip: "Ch12: Post workout - protein + carbs for recovery/glycogen. Higher GI ok here. Within 1-2hrs. Hydration critical.",
  },
  // Additional from Protein Ch5 science: complete proteins (all EAAs, leucine trigger), contractile (myosin/actin in meat), hormonal, structural; balance to avoid ammonia/uric acid waste from excess; global accessible complete combos (egg+milk, meat+veg, rice+legumes).
  {
    name: "Egg & Greek Yogurt Complete Scramble (Ovalbumin + Whey)",
    protein: 42,
    cals: 380,
    carbs: 8,
    fat: 18,
    ingredients: "4 eggs, 150g Greek yogurt, spinach, 20g cheese, herbs",
    instructions: "Scramble eggs with spinach. Fold in yogurt at end for creaminess. Top cheese. Fast high-bioavailability complete protein.",
    tip: "Ch5: Eggs (ovalbumin) + dairy (lactalbumin/whey) deliver all essential aminos including leucine for synthesis. Low waste at proper dose. Contractile support for training.",
  },
  {
    name: "Myosin Lean Beef Power Plate",
    protein: 55,
    cals: 620,
    carbs: 35,
    fat: 28,
    ingredients: "180g lean beef, 150g sweet potato, broccoli, olive oil",
    instructions: "Grill or pan beef. Roast sweet potato. Steam veg. Simple, complete contractile protein dominant meal.",
    tip: "Ch5: Beef myosin/actin are key structural/contractile proteins for muscle repair and force. Balance portions: excess nitrogen → ammonia/uric acid. Pair carb for energy without waste.",
  },
  {
    name: "Global Complete: Lentil Rice Dahl Bowl (Veg)",
    protein: 32,
    cals: 480,
    carbs: 72,
    fat: 8,
    ingredients: "120g dry lentils, 200g cooked rice, spinach, tomato, cumin, lemon, 1 tsp oil",
    instructions: "Cook lentils with spices/tomato to stew. Serve over rice + greens. Squeeze lemon. Affordable worldwide complete protein combo.",
    tip: "Ch5: Legumes + grains (rice) complement to full EAA profile (like animal sources). High fiber, low cost. Supports structural repair without high waste byproducts when total protein moderated.",
  },
  {
    name: "Dairy Whey Recovery Shake (Lactalbumin)",
    protein: 38,
    cals: 320,
    carbs: 28,
    fat: 6,
    ingredients: "250g milk or Greek yogurt, 30g whey or more yogurt, banana, 15g almonds, cinnamon",
    instructions: "Blend all. Post-session quick hit. Add ice. 5-10min prep.",
    tip: "Ch5: Milk proteins (lactalbumin) fast + complete. Leucine rich for immediate synthesis trigger. Hormonal support (insulin response with carbs). Great when solid food heavy.",
  },
];

export function NutritionPage() {
  const { t } = useTranslation();
  const premium = typeof window !== "undefined" && localStorage.getItem("mw_premium") === "true";
  const [targetCals] = useState(2200);
  const [targetProtein] = useState(160);
  const [logged, setLogged] = useState<LogEntry[]>([]);
  const [water, setWater] = useState(0);
  const [customName, setCustomName] = useState("");
  const [customP, setCustomP] = useState(20);
  const [customC, setCustomC] = useState(200);

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
    localStorage.setItem("mw_nutrition_log", JSON.stringify(logged));
  }, [logged]);

  useEffect(() => {
    localStorage.setItem("mw_water", water.toString());
  }, [water]);

  const addEntry = (name: string, p: number, c: number, carbs = 0, fat = 0) => {
    const entry: LogEntry = { name, protein: p, cals: c, carbs, fat, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setLogged(prev => [...prev, entry]);
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

  const pProgress = Math.min(100, Math.round((totalProtein / targetProtein) * 100));
  const cProgress = Math.min(100, Math.round((totalCals / targetCals) * 100));

  const clearDay = () => {
    setLogged([]);
    setWater(0);
  };

  if (!premium) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <h2 className="text-2xl font-bold">{t('nutrition', { defaultValue: 'Nutrition' })} Tracker</h2>
        <p className="mt-2 text-muted-foreground">Daily macro logging, targets, water, and recipe ideas from the nutrition specialist program.</p>
        <p className="mt-4 text-sm">Unlock with any specialist program purchase or Premium subscription.</p>
        <Button className="mt-4" onClick={() => window.location.href = "/programs"}>View Programs</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Nutrition</h2>
        <p className="text-muted-foreground">Log intake. Hit targets. Recover better. High-protein days directly boost your <a href="/log" className="underline">Win Score</a> in the Today Hub. (Premium • from your Nutrition cert)</p>
      </div>

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
          <Button variant="ghost" size="sm" onClick={clearDay}>Clear day</Button>
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
        <CardHeader><CardTitle>Beta Recipes &amp; Meal Ideas (Premium)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {RECIPES.map((r, i) => (
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
          <div className="text-xs text-muted-foreground">Seeded from protein science (complete proteins, leucine trigger, waste management, recovery timing) + DASH/Med principles for global accessibility.</div>
        </CardContent>
      </Card>

      {/* PREMIUM RECIPES - From Nutrition Specialist Materials */}
      <Card>
        <CardHeader>
          <CardTitle>Beta Recipes &amp; Meal Ideas</CardTitle>
          <p className="text-sm text-muted-foreground">High-protein, balanced meals based on the nutrition certification principles. Log the whole meal with one click. Build muscle, recover faster, stay lean.</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                name: "Elite Chicken Rice Bowl",
                desc: "Lean protein + complex carbs for sustained energy and recovery.",
                ingredients: "150g grilled chicken breast, 200g cooked brown rice, 100g broccoli, 1 tbsp olive oil",
                instructions: "Grill chicken seasoned with herbs. Steam broccoli. Combine with rice and drizzle oil. High volume, high protein.",
                macros: { protein: 52, cals: 620, carbs: 68, fat: 12 }
              },
              {
                name: "Protein Oat Pancakes",
                desc: "Breakfast that fuels training and keeps you full for hours.",
                ingredients: "80g oats, 1 scoop whey or plant protein, 1 egg + 2 whites, 1/2 banana, cinnamon",
                instructions: "Blend oats into flour. Mix with protein, egg, mashed banana. Cook on skillet like pancakes. Top with berries.",
                macros: { protein: 38, cals: 480, carbs: 52, fat: 8 }
              },
              {
                name: "Salmon Power Salad",
                desc: "Omega-3s + veggies for inflammation control and lean gains.",
                ingredients: "120g baked salmon, 150g mixed greens, 1/2 avocado, 50g quinoa, lemon & herbs",
                instructions: "Bake salmon with lemon. Toss greens, quinoa, sliced avocado. Top with salmon. Dress with lemon.",
                macros: { protein: 35, cals: 520, carbs: 28, fat: 28 }
              },
              {
                name: "Greek Yogurt Power Bowl",
                desc: "Quick recovery snack or post-workout meal with probiotics.",
                ingredients: "300g Greek yogurt (0% or 2%), 30g almonds, 1 scoop protein (optional), berries, honey drizzle",
                instructions: "Mix yogurt with protein if using. Top with almonds, berries and light honey. Eat immediately after training.",
                macros: { protein: 42, cals: 380, carbs: 32, fat: 14 }
              },
              {
                name: "Egg White Veggie Omelette + Toast",
                desc: "Classic high-volume breakfast for fat loss while preserving muscle.",
                ingredients: "6 egg whites + 1 whole egg, spinach, tomatoes, mushrooms, 1 slice whole grain toast",
                instructions: "Scramble or omelette the eggs with veggies. Season aggressively. Serve with toast on the side.",
                macros: { protein: 32, cals: 310, carbs: 28, fat: 9 }
              },
              {
                name: "Mediterranean Salmon Power Plate",
                desc: "Omega-3s + veggies per Mediterranean diet (from nutrition textbook) for heart health and lean gains.",
                ingredients: "120g baked salmon, 150g mixed greens, 80g olives/cucumber, 50g quinoa, olive oil & lemon",
                instructions: "Bake salmon with herbs. Toss greens, quinoa, veggies. Drizzle oil. Per DASH/Med principles: low sodium, high healthy fats.",
                macros: { protein: 35, cals: 480, carbs: 25, fat: 28 }
              },
              {
                name: "DASH Veggie Chicken Stir",
                desc: "Low-sodium veggie heavy with lean protein, per DASH guidelines for blood pressure and sustainable health.",
                ingredients: "150g chicken, 200g mixed veggies (broccoli, carrots), 100g brown rice, low-sodium soy alternative",
                instructions: "Stir fry chicken and veggies. Serve over rice. Focus on whole foods, limit added salt/sweets per textbook.",
                macros: { protein: 40, cals: 420, carbs: 45, fat: 8 }
              }
            ].map((recipe, idx) => (
              <Card key={idx} className="border-emerald-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{recipe.name}</CardTitle>
                  <div className="text-xs text-emerald-400">{recipe.desc}</div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div><strong>Ingredients:</strong> {recipe.ingredients}</div>
                  <div><strong>How to make:</strong> {recipe.instructions}</div>
                  <div className="flex gap-3 text-xs pt-2 border-t">
                    <span>P: <strong>{recipe.macros.protein}g</strong></span>
                    <span>Cals: <strong>{recipe.macros.cals}</strong></span>
                    <span>Carbs: <strong>{recipe.macros.carbs}g</strong></span>
                    <span>Fat: <strong>{recipe.macros.fat}g</strong></span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => {
                      // Log the entire recipe as one entry
                      const totalP = recipe.macros.protein;
                      const totalC = recipe.macros.cals;
                      const totalCarbs = recipe.macros.carbs;
                      const totalFat = recipe.macros.fat;
                      addEntry(recipe.name, totalP, totalC, totalCarbs, totalFat);
                    }}
                  >
                    Log Entire Recipe (+{recipe.macros.protein}g protein)
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground mt-4">These recipes are built from the nutrition certification framework: high protein (1.6-2.2g per kg bodyweight), balanced macros, whole foods focus. Scale portions to your targets. More recipes + meal timing strategies in the full paid Nutrition program.</div>
        </CardContent>
      </Card>
    </div>
  );
}

