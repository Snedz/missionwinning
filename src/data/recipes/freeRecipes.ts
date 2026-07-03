export interface Recipe {
  name: string;
  protein: number;
  cals: number;
  carbs: number;
  fat: number;
  ingredients: string;
  instructions: string;
  tip: string;
}

export const FREE_RECIPES: Recipe[] = [
  {
    "name": "Elite Chicken Rice Power Bowl",
    "protein": 52,
    "cals": 620,
    "carbs": 58,
    "fat": 12,
    "ingredients": "180g grilled chicken breast, 200g cooked rice, 100g broccoli, 1 tbsp olive oil, herbs, lemon",
    "instructions": "Grill seasoned chicken. Steam broccoli. Combine over rice. Drizzle oil. Complete protein + veg for recovery. ~45g+ leucine rich from chicken.",
    "tip": "From protein fundamentals: chicken provides all essential aminos. Pair with carb for glycogen. Avoid excess to limit ammonia/uric acid waste."
  },
  {
    "name": "Mediterranean Salmon Plate (DASH principles)",
    "protein": 35,
    "cals": 480,
    "carbs": 22,
    "fat": 28,
    "ingredients": "120g baked salmon, 80g quinoa, 150g mixed greens/tomato/cucumber, 1/4 avocado, olive oil + lemon",
    "instructions": "Bake salmon with herbs. Cook quinoa. Assemble salad. Top with avocado. Omega-3s + complete protein.",
    "tip": "Per nutrition materials: fish complete protein, low sodium emphasis (DASH/Med), healthy fats support hormones/recovery. High bioavailability."
  },
  {
    "name": "Beef & Egg Scramble for Growth",
    "protein": 48,
    "cals": 580,
    "carbs": 12,
    "fat": 32,
    "ingredients": "120g lean ground beef, 3 eggs, spinach, 50g feta or cheese, peppers/onion",
    "instructions": "Brown beef. Scramble with eggs + veg. Top cheese. High contractile protein for muscle repair.",
    "tip": "Beef + eggs: excellent EAA profile including leucine. From Ch5: contractile proteins (actin/myosin) need steady supply for training adaptation."
  },
  {
    "name": "Greek Yogurt Parfait (Quick Recovery)",
    "protein": 38,
    "cals": 340,
    "carbs": 32,
    "fat": 8,
    "ingredients": "300g Greek yogurt (plain), 30g almonds/walnuts, 100g berries, 1 tbsp honey or none",
    "instructions": "Layer yogurt, nuts, berries. Fast complete protein (whey/casein).",
    "tip": "Dairy sources high quality complete protein. Great post-training for synthesis without heavy digestion load."
  },
  {
    "name": "Complex Carb Power Oats (Ch12 Fuel)",
    "protein": 20,
    "cals": 450,
    "carbs": 70,
    "fat": 8,
    "ingredients": "80g oats, 200g Greek yogurt or milk, 30g nuts, berries, 1 tbsp flax/chia",
    "instructions": "Cook oats with yogurt/milk. Top nuts, seeds, berries. Pre/post workout carb focus for glycogen.",
    "tip": "Ch12: Complex carbs (oats, rice, potatoes, quinoa) preferred for stable blood sugar. Low-GI most of day; higher GI post-workout ok. Fiber aids digestion."
  },
  {
    "name": "Healthy Fat Salmon Bowl (Ch12 Hormones)",
    "protein": 40,
    "cals": 550,
    "carbs": 30,
    "fat": 30,
    "ingredients": "150g salmon, 150g sweet potato or rice, avocado, olive oil, greens, nuts",
    "instructions": "Bake salmon. Roast sweet potato. Assemble with avocado/oil. 15-30% calories from fats per Ch12.",
    "tip": "Fats for hormones, brain, insulation. Prioritize unsaturated (olive, salmon, nuts, flax). Limit trans/saturated. Ch12: quality fats support training recovery."
  },
  {
    "name": "Vitamin Packed Veggie Stir (Ch12 Micronutrients)",
    "protein": 25,
    "cals": 380,
    "carbs": 45,
    "fat": 12,
    "ingredients": "150g chicken or tofu, 200g mixed veggies (broccoli, spinach, peppers), 100g brown rice, olive oil, lemon",
    "instructions": "Stir fry protein + veggies. Serve over rice. Add seeds for extra nutrients.",
    "tip": "Ch12: Veggies for vitamins (A, C, B's, minerals like iron/magnesium). Aim variety daily. Fiber for gut health. Hydrate well."
  },
  {
    "name": "Post-Workout Carb + Protein Recovery (Ch12)",
    "protein": 35,
    "cals": 520,
    "carbs": 65,
    "fat": 10,
    "ingredients": "150g chicken breast, 250g white rice or potato, 1 banana, 20g nuts or whey if available",
    "instructions": "Grill chicken, cook rice/potato. Add banana for quick carbs. Nuts for fats.",
    "tip": "Ch12: Post workout - protein + carbs for recovery/glycogen. Higher GI ok here. Within 1-2hrs. Hydration critical."
  },
  {
    "name": "Egg & Greek Yogurt Complete Scramble (Ovalbumin + Whey)",
    "protein": 42,
    "cals": 380,
    "carbs": 8,
    "fat": 18,
    "ingredients": "4 eggs, 150g Greek yogurt, spinach, 20g cheese, herbs",
    "instructions": "Scramble eggs with spinach. Fold in yogurt at end for creaminess. Top cheese. Fast high-bioavailability complete protein.",
    "tip": "Ch5: Eggs (ovalbumin) + dairy (lactalbumin/whey) deliver all essential aminos including leucine for synthesis. Low waste at proper dose. Contractile support for training."
  },
  {
    "name": "Myosin Lean Beef Power Plate",
    "protein": 55,
    "cals": 620,
    "carbs": 35,
    "fat": 28,
    "ingredients": "180g lean beef, 150g sweet potato, broccoli, olive oil",
    "instructions": "Grill or pan beef. Roast sweet potato. Steam veg. Simple, complete contractile protein dominant meal.",
    "tip": "Ch5: Beef myosin/actin are key structural/contractile proteins for muscle repair and force. Balance portions: excess nitrogen → ammonia/uric acid. Pair carb for energy without waste."
  },
  {
    "name": "Global Complete: Lentil Rice Dahl Bowl (Veg)",
    "protein": 32,
    "cals": 480,
    "carbs": 72,
    "fat": 8,
    "ingredients": "120g dry lentils, 200g cooked rice, spinach, tomato, cumin, lemon, 1 tsp oil",
    "instructions": "Cook lentils with spices/tomato to stew. Serve over rice + greens. Squeeze lemon. Affordable worldwide complete protein combo.",
    "tip": "Ch5: Legumes + grains (rice) complement to full EAA profile (like animal sources). High fiber, low cost. Supports structural repair without high waste byproducts when total protein moderated."
  },
  {
    "name": "Dairy Whey Recovery Shake (Lactalbumin)",
    "protein": 38,
    "cals": 320,
    "carbs": 28,
    "fat": 6,
    "ingredients": "250g milk or Greek yogurt, 30g whey or more yogurt, banana, 15g almonds, cinnamon",
    "instructions": "Blend all. Post-session quick hit. Add ice. 5-10min prep.",
    "tip": "Ch5: Milk proteins (lactalbumin) fast + complete. Leucine rich for immediate synthesis trigger. Hormonal support (insulin response with carbs). Great when solid food heavy."
  },
  {
    "name": "Budget Chicken & Rice (Global Staple)",
    "protein": 45,
    "cals": 520,
    "carbs": 55,
    "fat": 10,
    "ingredients": "150g chicken thigh or breast, 200g cooked rice, frozen mixed veg, soy or hot sauce",
    "instructions": "Pan cook chicken, steam veg, combine over rice. Season to taste.",
    "tip": "Affordable worldwide. Batch cook 3 days at once. Protein + carb base for trainees on a budget."
  },
  {
    "name": "15-Min Tuna Pasta",
    "protein": 38,
    "cals": 480,
    "carbs": 52,
    "fat": 12,
    "ingredients": "1 can tuna, 80g dry pasta, cherry tomatoes, garlic, olive oil, lemon",
    "instructions": "Boil pasta. Sauté garlic/tomato, flake tuna in, toss with pasta and lemon.",
    "tip": "Fast post-workout when time is tight. Complete protein from fish."
  },
  {
    "name": "Overnight Oats (No Cook)",
    "protein": 28,
    "cals": 380,
    "carbs": 48,
    "fat": 10,
    "ingredients": "60g oats, 200g milk or yogurt, 1 scoop whey or extra yogurt, berries, chia",
    "instructions": "Mix night before, refrigerate. Grab and go in the morning.",
    "tip": "Consistent breakfast habit beats perfect macros you never eat."
  },
  {
    "name": "Black Bean & Egg Bowl",
    "protein": 32,
    "cals": 420,
    "carbs": 38,
    "fat": 14,
    "ingredients": "1 can black beans, 2 eggs, salsa, avocado half, rice optional",
    "instructions": "Warm beans, fry or scramble eggs, top with salsa and avocado.",
    "tip": "Plant + animal protein combo. High fiber for satiety."
  },
  {
    "name": "Cottage Cheese & Fruit Plate",
    "protein": 35,
    "cals": 310,
    "carbs": 28,
    "fat": 8,
    "ingredients": "250g cottage cheese, apple or pineapple, cinnamon, 15g walnuts",
    "instructions": "Plate cottage cheese, top fruit and nuts. No cooking required.",
    "tip": "Casein-rich dairy — good evening snack for sustained amino acids."
  },
  {
    "name": "Sheet Pan Sausage & Veg",
    "protein": 30,
    "cals": 450,
    "carbs": 25,
    "fat": 28,
    "ingredients": "2 chicken sausages, bell peppers, zucchini, onion, olive oil, herbs",
    "instructions": "Roast all on one tray 25 min at 200°C / 400°F. Minimal cleanup.",
    "tip": "Meal prep friendly. Adjust veg for local availability."
  },
  {
    "name": "Peanut Butter Banana Toast",
    "protein": 18,
    "cals": 380,
    "carbs": 42,
    "fat": 16,
    "ingredients": "2 slices whole grain bread, 2 tbsp peanut butter, 1 banana, honey optional",
    "instructions": "Toast bread, spread PB, slice banana on top.",
    "tip": "Pre-training quick fuel when you have 30 min before the gym."
  },
  {
    "name": "Simple Miso Tofu Soup",
    "protein": 22,
    "cals": 280,
    "carbs": 18,
    "fat": 14,
    "ingredients": "200g firm tofu, miso paste, green onion, seaweed, bok choy or spinach",
    "instructions": "Simmer veg in water, whisk miso off heat, add cubed tofu.",
    "tip": "Light recovery meal. Hydrating and easy to digest."
  }
];
