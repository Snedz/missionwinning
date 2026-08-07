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
  },
{
    "name": "Tuna Rice Pack Bowl",
    "protein": 42,
    "cals": 520,
    "carbs": 55,
    "fat": 12,
    "ingredients": "1 can tuna in water, 200g cooked rice, cucumber, soy sauce or salsa, optional egg",
    "instructions": "Drain tuna, fold into rice with veg. Season lightly. Optional soft egg on top.",
    "tip": "Pantry staple for travel and late nights. Complete-ish protein with rice + egg if added."
  },
  {
    "name": "Lentil Tomato Stew",
    "protein": 24,
    "cals": 400,
    "carbs": 55,
    "fat": 8,
    "ingredients": "200g cooked lentils, canned tomatoes, onion, garlic, cumin, spinach, olive oil",
    "instructions": "Sauté onion/garlic, add lentils + tomatoes + spice, wilt spinach. Serve hot.",
    "tip": "Budget plant protein. Pair with yogurt or egg if you want a fuller amino profile."
  },
  {
    "name": "Turkey Wrap Lunch",
    "protein": 36,
    "cals": 430,
    "carbs": 38,
    "fat": 14,
    "ingredients": "2 whole-wheat wraps, 120g turkey slices, lettuce, tomato, mustard or hummus",
    "instructions": "Layer turkey and veg, roll tight. Slice in half for grab-and-go.",
    "tip": "No cook. Easy high-protein office lunch."
  },
  {
    "name": "Chickpea Scramble",
    "protein": 22,
    "cals": 360,
    "carbs": 40,
    "fat": 12,
    "ingredients": "1 can chickpeas mashed, turmeric, onion, peppers, spinach, olive oil",
    "instructions": "Sauté veg, add mashed chickpeas + spice until hot. Serve with toast optional.",
    "tip": "Egg-free morning option. Add feta if dairy is fine for extra protein."
  },
  {
    "name": "Pork Tenderloin + Potatoes",
    "protein": 40,
    "cals": 560,
    "carbs": 45,
    "fat": 18,
    "ingredients": "150g pork tenderloin, 250g potatoes, green beans, olive oil, herbs",
    "instructions": "Roast pork and potatoes; steam beans. Slice pork and plate.",
    "tip": "Classic post-lift plate. Keep pork lean cuts for better macros."
  },
  {
    "name": "Shrimp Stir-Fry Rice",
    "protein": 34,
    "cals": 480,
    "carbs": 50,
    "fat": 12,
    "ingredients": "150g shrimp, 200g mixed stir-fry veg, 180g cooked rice, garlic, soy, sesame oil",
    "instructions": "Stir-fry shrimp and veg hot and fast. Serve over rice.",
    "tip": "Fast cooking protein. Don't overcook shrimp — pull when pink."
  },
  {
    "name": "Black Bean Burrito Bowl",
    "protein": 28,
    "cals": 520,
    "carbs": 68,
    "fat": 14,
    "ingredients": "1 can black beans, 200g rice, salsa, corn, avocado, lime, cilantro",
    "instructions": "Warm beans, build bowl with rice and toppings. Squeeze lime.",
    "tip": "Plant-forward volume meal. Greek yogurt dollop bumps protein."
  },
  {
    "name": "Chicken Tortilla Soup Simple",
    "protein": 38,
    "cals": 420,
    "carbs": 30,
    "fat": 14,
    "ingredients": "150g shredded chicken, broth, canned tomatoes, black beans, corn, chili spice, lime",
    "instructions": "Simmer all 15 min. Finish lime. Optional tortilla strips.",
    "tip": "High volume, hydrating recovery meal after hard sessions."
  },
  {
    "name": "Egg Fried Rice Athlete",
    "protein": 28,
    "cals": 520,
    "carbs": 58,
    "fat": 16,
    "ingredients": "250g cold cooked rice, 3 eggs, frozen peas/carrots, soy, green onion, oil",
    "instructions": "Scramble eggs, add rice and veg, season. Hot wok or pan.",
    "tip": "Uses leftover rice. Great late-night training fuel."
  },
  {
    "name": "Cod + Green Beans + Rice",
    "protein": 36,
    "cals": 450,
    "carbs": 45,
    "fat": 10,
    "ingredients": "160g white fish, 200g green beans, 180g rice, lemon, olive oil",
    "instructions": "Bake or pan fish, steam beans, plate with rice and lemon.",
    "tip": "Lean complete protein. Easy on digestion before morning sessions."
  },
  {
    "name": "Overnight Protein Oats Jar",
    "protein": 32,
    "cals": 420,
    "carbs": 48,
    "fat": 10,
    "ingredients": "60g oats, 25g whey or greek yogurt, milk or water, berries, cinnamon",
    "instructions": "Mix night before in jar. Stir in morning. No cook.",
    "tip": "Pre-built breakfast for early alarms. Adjust liquid for thickness."
  },
  {
    "name": "Steak Bites + Sweet Potato",
    "protein": 42,
    "cals": 580,
    "carbs": 40,
    "fat": 22,
    "ingredients": "150g sirloin cubes, 250g sweet potato, broccoli, oil, salt, pepper",
    "instructions": "Roast sweet potato and broccoli; sear steak bites hot and fast.",
    "tip": "Higher iron meal for hard training blocks. Keep portions honest."
  },
  {
    "name": "Hummus Chicken Pita",
    "protein": 34,
    "cals": 480,
    "carbs": 44,
    "fat": 16,
    "ingredients": "1 large pita, 100g chicken, 3 tbsp hummus, cucumber, tomato",
    "instructions": "Warm pita, spread hummus, fill chicken and veg.",
    "tip": "Balanced macros without a full kitchen. Good travel option."
  },
  {
    "name": "Edamame Rice Bowl",
    "protein": 26,
    "cals": 440,
    "carbs": 55,
    "fat": 12,
    "ingredients": "150g shelled edamame, 200g rice, sesame, soy, shredded carrot, green onion",
    "instructions": "Warm edamame, toss with rice and toppings.",
    "tip": "Solid plant protein base. Add egg or tuna if you need more protein."
  },
  {
    "name": "Baked Potato Cottage Load",
    "protein": 32,
    "cals": 480,
    "carbs": 55,
    "fat": 12,
    "ingredients": "1 large baked potato, 200g cottage cheese, chives, pepper, optional salsa",
    "instructions": "Split hot potato, load cottage cheese and toppings.",
    "tip": "Cheap, filling, high casein. Excellent evening meal."
  },
  {
    "name": "Sardine Toast Plate",
    "protein": 30,
    "cals": 420,
    "carbs": 28,
    "fat": 20,
    "ingredients": "1 can sardines, 2 slices whole grain toast, lemon, greens, olive oil",
    "instructions": "Toast bread, top sardines, lemon, side salad.",
    "tip": "Omega-3 dense and no cook. Strong micronutrient density per dollar."
  },
  {
    "name": "Turkey Chili Single Pot",
    "protein": 40,
    "cals": 500,
    "carbs": 40,
    "fat": 16,
    "ingredients": "150g ground turkey, beans, tomatoes, onion, chili powder, cumin",
    "instructions": "Brown turkey, add remaining, simmer 20 min. Batch friendly.",
    "tip": "Meal prep king. Freeze portions for busy weeks."
  },
  {
    "name": "Banana Protein Pancakes 2-Ingredient+",
    "protein": 28,
    "cals": 380,
    "carbs": 42,
    "fat": 8,
    "ingredients": "1 banana, 2 eggs, 20g oats optional, cinnamon, cooking spray",
    "instructions": "Blend, cook small pancakes on nonstick. Top yogurt optional.",
    "tip": "Fast breakfast after morning lifts. Keep heat medium to avoid burning."
  },
  {
    "name": "Quinoa Chicken Salad Cold",
    "protein": 38,
    "cals": 490,
    "carbs": 42,
    "fat": 16,
    "ingredients": "120g chicken, 150g cooked quinoa, cucumber, tomato, olive oil, lemon, herbs",
    "instructions": "Toss cold ingredients. Make ahead for work fridge.",
    "tip": "Travels well. Complete plant+animal protein mix."
  },
  {
    "name": "Microwave Mug Egg Oats",
    "protein": 24,
    "cals": 350,
    "carbs": 35,
    "fat": 12,
    "ingredients": "40g oats, 2 eggs, splash milk, salt, cheese optional, microwave-safe mug",
    "instructions": "Mix, microwave 60–90s stirring once. Don't overcook.",
    "tip": "Dorm/hotel friendly. Protein + carbs with one dish."
  },
  {
    "name": "Tuna Rice Packet Bowl",
    "protein": 38,
    "cals": 460,
    "carbs": 48,
    "fat": 10,
    "ingredients": "1 pouch tuna in water, 200g cooked rice, cucumber, soy or hot sauce, green onion",
    "instructions": "Warm rice, flake tuna on top, add crunch and sauce. No pan required if rice is leftover.",
    "tip": "Travel staple. Complete protein with shelf-stable fish."
  },
  {
    "name": "Lentil Egg Skillet",
    "protein": 30,
    "cals": 440,
    "carbs": 42,
    "fat": 14,
    "ingredients": "200g cooked lentils, 2 eggs, spinach, onion, spices, oil",
    "instructions": "Warm lentils with onion and spinach, crack eggs on top, cover until set.",
    "tip": "Budget plant + animal protein. High fiber for satiety."
  },
  {
    "name": "Greek Chicken Wrap Cold",
    "protein": 36,
    "cals": 470,
    "carbs": 38,
    "fat": 16,
    "ingredients": "1 wrap, 120g chicken, 80g greek yogurt or tzatziki, tomato, cucumber, lettuce",
    "instructions": "Spread yogurt, fill chicken and veg, roll tight. Make ahead for fridge.",
    "tip": "One-hand meal after training. Yogurt adds casein."
  },
  {
    "name": "Shrimp Garlic Pasta Light",
    "protein": 34,
    "cals": 520,
    "carbs": 55,
    "fat": 14,
    "ingredients": "150g shrimp, 80g dry pasta cooked, garlic, olive oil, parsley, lemon, chili flake",
    "instructions": "Sauté garlic and shrimp, toss pasta with oil and lemon. Finish parsley.",
    "tip": "Fast complete protein. Keep oil measured for fat targets."
  },
  {
    "name": "Black Bean Sweet Potato Hash",
    "protein": 22,
    "cals": 430,
    "carbs": 62,
    "fat": 10,
    "ingredients": "250g sweet potato cubes, 150g black beans, onion, salsa, optional egg on top",
    "instructions": "Roast or pan-cook potato, add beans and salsa. Top fried egg if you need protein.",
    "tip": "Plant-forward carb meal. Add egg or greek yogurt to hit protein floor."
  },
  {
    "name": "Whey Rice Cake Stack",
    "protein": 28,
    "cals": 320,
    "carbs": 36,
    "fat": 6,
    "ingredients": "1 scoop whey, water or milk, 3 rice cakes, banana or berries, peanut butter thin",
    "instructions": "Shake whey, assemble rice cakes with fruit and thin PB, drink shake alongside.",
    "tip": "Emergency high-protein snack when kitchen is closed."
  },
  {
    "name": "Turkey Apple Cheese Plate",
    "protein": 32,
    "cals": 400,
    "carbs": 28,
    "fat": 16,
    "ingredients": "120g turkey slices, 1 apple, 40g cheese, handful crackers or rice cakes, mustard",
    "instructions": "Plate cold. No cook. Balance turkey, fruit, and cheese.",
    "tip": "Desk lunch that actually hits protein without a microwave."
  },
  {
    "name": "Tofu Scramble Toast",
    "protein": 26,
    "cals": 410,
    "carbs": 38,
    "fat": 14,
    "ingredients": "200g firm tofu, turmeric, spinach, 2 toast, oil, salt, pepper",
    "instructions": "Crumble and pan tofu with spices and spinach. Serve on toast.",
    "tip": "Plant option for free tier. Pair with dairy or egg if you need more leucine."
  },
];
