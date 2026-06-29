import 'server-only';
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

export const PREMIUM_RECIPES: Recipe[] = [
  {
    "name": "Free Core: Egg Fried Rice Bowl (Global)",
    "protein": 28,
    "cals": 480,
    "carbs": 55,
    "fat": 12,
    "ingredients": "3 eggs, 200g cooked rice, mixed frozen veg, soy or salt, green onion, 1 tsp oil",
    "instructions": "Scramble eggs in pan, add rice + veg, stir fry 3-4 min. Season simply. Cheap, fast, complete protein + carbs anywhere.",
    "tip": "Free core staple: Eggs + rice/veg is accessible worldwide, balanced macros, easy post-workout or any meal."
  },
  {
    "name": "Free Core: Tuna or Chickpea Salad (No Cook)",
    "protein": 35,
    "cals": 380,
    "carbs": 20,
    "fat": 18,
    "ingredients": "1 can tuna or 150g chickpeas, mixed greens or cabbage, tomato, cucumber, lemon/olive oil or yogurt dressing",
    "instructions": "Drain, chop veg, mix with protein. Lemon + pinch salt. 5 min, no stove needed. Great for travel or minimal kitchens.",
    "tip": "Free core: Canned or legume protein + fresh veg = high protein, hydrating, zero equipment meal for global users."
  },
  {
    "name": "Free Core: Peanut Butter Banana Oats (Breakfast)",
    "protein": 18,
    "cals": 420,
    "carbs": 55,
    "fat": 14,
    "ingredients": "50g oats, 1 banana, 2 tbsp peanut butter, milk or water, pinch cinnamon",
    "instructions": "Cook oats, mash banana in, stir PB. 5 min. Cheap complete breakfast with protein + slow carbs.",
    "tip": "Free core: Oats + PB + fruit is globally available, sustained energy, easy to scale for training days."
  },
  {
    "name": "Free Core: Greek Yogurt Power Bowl",
    "protein": 30,
    "cals": 350,
    "carbs": 35,
    "fat": 8,
    "ingredients": "200g Greek yogurt, 100g berries, 20g oats or granola, 10g seeds (chia/flax), drizzle honey if available",
    "instructions": "Layer yogurt, berries, oats/seeds. 2 min prep. High protein, probiotic, portable.",
    "tip": "Free core: Yogurt + fruit + seeds is cheap, global, quick recovery or snack. Protein for muscle, carbs for energy."
  },
  {
    "name": "Free Core: Simple Lentil Stew (One Pot)",
    "protein": 25,
    "cals": 400,
    "carbs": 60,
    "fat": 5,
    "ingredients": "100g dry lentils, onion/garlic if avail, carrot or any veg, spices (cumin, salt), water or broth",
    "instructions": "Simmer lentils + veg + spices 20-25 min until soft. Add lemon. Makes 2 servings.",
    "tip": "Free core: Lentils are cheap complete protein base worldwide. Bulk cook for multiple meals. Pairs with rice for full profile."
  },
  {
    "name": "Free Core: Post-Mobility Recovery Yogurt Bowl",
    "protein": 28,
    "cals": 320,
    "carbs": 35,
    "fat": 8,
    "ingredients": "200g Greek yogurt, 80g berries, 20g nuts/seeds, drizzle honey, pinch cinnamon",
    "instructions": "Layer yogurt + berries + nuts. Eat within 30 min of mobility or light session. Easy global staple.",
    "tip": "Synergy with Move/Mind: protein for repair + carbs for glycogen after mobility work. Low effort, high adherence per vision."
  },
  {
    "name": "Free Core: Simple Egg Rice Recovery (Global)",
    "protein": 22,
    "cals": 420,
    "carbs": 50,
    "fat": 12,
    "ingredients": "2 eggs, 150g cooked rice, handful greens or frozen veg, soy/salt, green onion if avail",
    "instructions": "Scramble eggs, mix with rice + veg. 5 min. Add lemon for brightness. Post any session fuel.",
    "tip": "Free core recovery: eggs + rice = complete, cheap, worldwide. Supports training adaptation without fancy ingredients."
  },
  {
    "name": "Free Core: Mindful Post-Workout Oats (Mind + Fuel)",
    "protein": 18,
    "cals": 380,
    "carbs": 55,
    "fat": 9,
    "ingredients": "50g oats, 150g milk or yogurt, 1 banana, 15g peanut butter or seeds, dash cinnamon",
    "instructions": "Cook oats with liquid, top with sliced banana + PB. Eat slowly, pair with 2 min breathing (mind synergy).",
    "tip": "Vision synergy: complex carbs + protein for recovery, mindful eating habit from Mind pillar. Accessible anywhere, cheap base."
  },
  {
    "name": "Free Core: Lentil Veggie Recovery Stew (Global One-Pot)",
    "protein": 26,
    "cals": 410,
    "carbs": 58,
    "fat": 7,
    "ingredients": "100g dry lentils, 200g mixed veg (carrot, spinach, tomato), spices (cumin, turmeric), lemon",
    "instructions": "Simmer lentils + veg 20 min. Squeeze lemon. Batch cook for multiple days post training or mobility.",
    "tip": "Free core: plant protein + fiber for gut health and recovery. Ties Move (mobility) to Fuel. Low cost, worldwide ingredients."
  },
  {
    "name": "Free Core: Quick Sardine Toast (Omega Recovery)",
    "protein": 24,
    "cals": 340,
    "carbs": 28,
    "fat": 15,
    "ingredients": "1 can sardines (in oil or water), 1 slice bread or rice cake, tomato, lemon, herbs",
    "instructions": "Mash sardines on toast, top tomato + squeeze. 2 min prep. Great after any movement session.",
    "tip": "Free core omega boost for inflammation/recovery. Minimal equipment, shelf-stable, pairs with Mind wind-down."
  },
  {
    "name": "Free Core: Chickpea Hummus Wrap (Plant Power)",
    "protein": 22,
    "cals": 380,
    "carbs": 52,
    "fat": 10,
    "ingredients": "150g chickpeas (mashed), 1 wholegrain wrap or flatbread, cucumber, tomato, lemon-tahini or yogurt drizzle",
    "instructions": "Mash chickpeas with lemon/spices, spread on wrap, add veg. Roll and eat. 5 min, no cook if using canned.",
    "tip": "Free core plant protein + fiber for sustained energy. Global staple (falafel-inspired), ties to Move recovery and Fuel basics."
  },
  {
    "name": "Free Core: Banana Almond Butter Rice Cake (Quick Fuel)",
    "protein": 8,
    "cals": 280,
    "carbs": 42,
    "fat": 10,
    "ingredients": "2 rice cakes, 1 banana, 2 tbsp almond or peanut butter, pinch salt or cinnamon",
    "instructions": "Spread PB on cakes, top banana slices. Instant post-mobility or pre-training snack anywhere.",
    "tip": "Free core fast carbs + healthy fat/protein. Minimalist, portable, supports Mind focus and Move sessions without prep."
  },
  {
    "name": "Free Core: Tofu Scramble Bowl (Veg Protein)",
    "protein": 25,
    "cals": 350,
    "carbs": 25,
    "fat": 18,
    "ingredients": "200g firm tofu, 100g spinach or mixed veg, turmeric, salt, 1 tsp oil, optional tomato/onion",
    "instructions": "Crumble and pan-fry tofu with spices + veg 5-7 min. Simple one-pan. Add rice for more cals.",
    "tip": "Free core affordable complete plant protein. Easy for global users, supports training recovery and habit consistency per vision."
  },
  {
    "name": "Free Core: Tofu Veggie Scramble (Global Veg)",
    "protein": 24,
    "cals": 320,
    "carbs": 18,
    "fat": 16,
    "ingredients": "200g firm tofu, mixed frozen or fresh veg (spinach, peppers, tomato), turmeric, salt, 1 tsp oil",
    "instructions": "Crumble tofu in pan, add spices + veg, scramble 5-6 min. Cheap, fast, complete plant protein anywhere.",
    "tip": "Free core: Tofu + veg is accessible, high volume, low cost complete protein. Add rice or bread for more cals on training days."
  },
  {
    "name": "Free Core: Sardine or Mackerel Rice Bowl (Omega Cheap)",
    "protein": 32,
    "cals": 480,
    "carbs": 45,
    "fat": 20,
    "ingredients": "1 can sardines or mackerel in oil/water, 150g cooked rice, lemon, greens or cucumber if available",
    "instructions": "Drain fish, mix with rice + squeeze lemon. 3 min. Bones edible for calcium.",
    "tip": "Free core: Canned oily fish = affordable omega-3s + high protein. Excellent for recovery and global low-resource kitchens."
  },
  {
    "name": "Free Core: Black Bean Power Rice (Legume Complete)",
    "protein": 26,
    "cals": 520,
    "carbs": 85,
    "fat": 6,
    "ingredients": "150g cooked black beans, 200g rice, onion, tomato, cumin, lime or lemon, cilantro if avail",
    "instructions": "Heat beans with spices + tomato. Serve over rice. Squeeze citrus. Bulk prep friendly.",
    "tip": "Free core: Beans + rice = classic complete protein combo used worldwide. High fiber, cheap, sustaining for volume eating."
  },
  {
    "name": "Free Core: Egg & Potato Hash (Bodyweight Fuel)",
    "protein": 22,
    "cals": 420,
    "carbs": 45,
    "fat": 18,
    "ingredients": "2-3 eggs, 1 large potato or sweet potato, any veg scraps, salt/herbs, 1 tsp oil",
    "instructions": "Dice and pan-fry potato until soft, push aside, scramble eggs in same pan. Mix. 10 min one-pan meal.",
    "tip": "Free core: Eggs + potato is simple, filling, globally common. Great for beginners or minimal equipment days. Add beans for more protein."
  },
  {
    "name": "Free Core: Overnight Oats Power Bowl (Mind Fuel)",
    "protein": 20,
    "cals": 380,
    "carbs": 48,
    "fat": 12,
    "ingredients": "50g oats, 150g milk or plant milk, 1 tbsp chia, 80g berries, 15g nuts, dash vanilla",
    "instructions": "Mix oats, milk, chia night before. Top berries/nuts in AM. 1 min prep, pairs with morning mind prompt.",
    "tip": "Free core: Prep-ahead for busy days. Synergy with Mind (mindful eating) + Fuel. Cheap, global ingredients, high fiber/protein."
  },
  {
    "name": "Free Core: Bean & Rice Burrito Bowl (Global Complete)",
    "protein": 24,
    "cals": 450,
    "carbs": 68,
    "fat": 9,
    "ingredients": "150g black beans, 200g rice, 100g salsa or tomato, avocado or oil, cilantro/lime if avail",
    "instructions": "Heat beans with spices, serve over rice with toppings. 5 min. Add mobility recovery note: eat post-flow.",
    "tip": "Free core: Beans + rice = complete protein worldwide staple. Ties Fuel to Move recovery. Low cost, scalable, plant-based option."
  },
  {
    "name": "Free Core: Cottage Cheese or Yogurt Fruit Plate (Quick Protein)",
    "protein": 28,
    "cals": 300,
    "carbs": 30,
    "fat": 6,
    "ingredients": "200g cottage cheese or Greek yogurt, 100g mixed fruit, 10g seeds, honey optional",
    "instructions": "Layer and eat. 2 min. Post-mobility or evening wind-down snack with Mind gratitude.",
    "tip": "Free core: High protein, probiotic, minimal prep. Global dairy or alternatives. Supports habit stacking with Move/Mind."
  },
  {
    "name": "Free Core: Sweet Potato & Egg Power Plate (Simple Carbs)",
    "protein": 18,
    "cals": 380,
    "carbs": 42,
    "fat": 16,
    "ingredients": "1 medium sweet potato, 2 eggs, spinach or greens, pinch salt/herbs",
    "instructions": "Bake or microwave potato, top with fried/poached eggs + greens. 10 min. Great after bodyweight sessions.",
    "tip": "Free core: Sweet potato for sustained energy + eggs for protein. Minimal equipment, ties to free starters in Home."
  },
  {
    "name": "Free Core: Avocado Egg Toast (Healthy Fats)",
    "protein": 16,
    "cals": 320,
    "carbs": 28,
    "fat": 18,
    "ingredients": "1 slice whole grain bread, 1 egg, 1/2 avocado, tomato slices, salt/pepper",
    "instructions": "Toast bread, mash avocado, top with poached/fried egg and tomato. 5 min. Simple, nutrient dense.",
    "tip": "Free core: Healthy fats from avocado support hormones and recovery. Quick, global ingredients, pairs with Mind wind-down."
  },
  {
    "name": "Free Core: Chickpea Salad (Plant Protein No-Cook)",
    "protein": 18,
    "cals": 340,
    "carbs": 38,
    "fat": 12,
    "ingredients": "150g chickpeas, cucumber, tomato, red onion, olive oil, lemon, herbs",
    "instructions": "Drain chickpeas, chop veg, mix with oil/lemon. 5 min. No cooking needed.",
    "tip": "Free core: Legume protein for veg days. Hydrating, cheap, ties to Move for post-mobility refuel."
  },
  {
    "name": "Free Core: Protein Pancakes (Weekend Treat)",
    "protein": 22,
    "cals": 360,
    "carbs": 42,
    "fat": 10,
    "ingredients": "1 banana, 2 eggs, 30g oats or protein powder alternative, pinch baking powder",
    "instructions": "Mash banana + eggs + oats, cook small pancakes in pan. 10 min. Top with fruit.",
    "tip": "Free core: Fun way to hit protein. Use as post-training meal. Simple, no special equipment."
  },
  {
    "name": "Free Core: Quinoa Veggie Bowl (Complete Grain)",
    "protein": 20,
    "cals": 390,
    "carbs": 52,
    "fat": 11,
    "ingredients": "100g cooked quinoa, 100g mixed veg (broccoli, peppers), 50g feta or tofu, lemon/olive oil",
    "instructions": "Cook quinoa, steam veg, mix with protein and dressing. 10 min. Batch friendly.",
    "tip": "Free core: Quinoa is complete protein + fiber. Global, easy, pairs with mobility for recovery fuel."
  },
  {
    "name": "Free Core: Hummus Veggie Plate (Dip & Dip)",
    "protein": 15,
    "cals": 310,
    "carbs": 32,
    "fat": 14,
    "ingredients": "100g hummus, 150g raw veg (carrots, celery, cucumber), 1 small pita or crackers",
    "instructions": "Dip and eat. 2 min. No cook, portable for on-the-go or post-session.",
    "tip": "Free core: Chickpea hummus for plant protein. Simple, accessible, great with Mind reset."
  },
  {
    "name": "Free Core: Cottage Cheese Bowl (High Protein Snack)",
    "protein": 32,
    "cals": 280,
    "carbs": 18,
    "fat": 8,
    "ingredients": "200g cottage cheese, 80g pineapple or berries, 10g nuts, cinnamon",
    "instructions": "Mix and eat. 1 min. Post-mobility or evening with Mind wind-down.",
    "tip": "Free core: Cottage cheese is cheap complete protein. Low prep, supports training recovery."
  },
  {
    "name": "Free Core: Oatmeal with Egg (Savory Power)",
    "protein": 22,
    "cals": 400,
    "carbs": 48,
    "fat": 12,
    "ingredients": "50g oats, 1 egg, 100g spinach, salt/herbs, optional cheese",
    "instructions": "Cook oats, stir in egg and spinach. 5 min. Savory twist for sustained energy.",
    "tip": "Free core: Oats + egg for balanced macros. Ties to habit stacking in Mind and Fuel."
  },
  {
    "name": "Free Core: Lentil Soup with Greens (One Pot Recovery)",
    "protein": 24,
    "cals": 380,
    "carbs": 48,
    "fat": 8,
    "ingredients": "100g lentils, 150g spinach/kale, carrot, onion, spices, lemon",
    "instructions": "Simmer lentils with veg 20 min. Add greens at end. Batch cook for days.",
    "tip": "Free core: Lentils for cheap protein + iron. Post training or mobility, easy global meal."
  },
  {
    "name": "Free Core: Greek Yogurt Parfait with Nuts (Probiotic)",
    "protein": 26,
    "cals": 340,
    "carbs": 32,
    "fat": 12,
    "ingredients": "200g Greek yogurt, 50g berries, 20g mixed nuts/seeds, honey drizzle",
    "instructions": "Layer in jar. Prep ahead. Eat with mind prompt for mindful eating.",
    "tip": "Free core: Yogurt for gut health + protein. Portable, ties Mind and Fuel for daily habit."
  },
  {
    "name": "Free Core: Simple Dal and Rice (Plant Protein)",
    "protein": 22,
    "cals": 410,
    "carbs": 62,
    "fat": 6,
    "ingredients": "100g red lentils, 150g rice, tomato, spices (cumin, turmeric), lemon",
    "instructions": "Cook lentils with spices and tomato into dal, serve over rice. 15 min. Batch cook friendly.",
    "tip": "Free core: Lentils + rice = complete protein staple worldwide. Cheap, ties to Move recovery and Fuel basics."
  },
  {
    "name": "Free Core: Banana with PB on Toast (Quick Energy)",
    "protein": 10,
    "cals": 320,
    "carbs": 42,
    "fat": 12,
    "ingredients": "1 banana, 2 tbsp peanut butter, 1 slice bread or rice cake, pinch salt",
    "instructions": "Toast bread, spread PB, top banana. 2 min. Instant post-mobility or pre-training.",
    "tip": "Free core: Fast carbs + fat/protein. Minimalist, portable, supports Mind focus and Move sessions."
  },
  {
    "name": "Free Core: Egg and Bean Scramble (Protein Boost)",
    "protein": 24,
    "cals": 360,
    "carbs": 28,
    "fat": 16,
    "ingredients": "2 eggs, 100g black beans, spinach, tomato, salt/herbs, 1 tsp oil",
    "instructions": "Scramble eggs with beans and veg. 5 min. One pan, high protein.",
    "tip": "Free core: Eggs + beans for complete protein. Easy, ties to habit stacking in Mind and Fuel."
  },
  {
    "name": "Free Core: Chia Pudding (Mind Fuel)",
    "protein": 12,
    "cals": 280,
    "carbs": 32,
    "fat": 12,
    "ingredients": "3 tbsp chia seeds, 200g milk or plant milk, 50g berries, dash vanilla",
    "instructions": "Mix chia and milk night before, top berries in AM. 1 min prep, pairs with morning mind prompt.",
    "tip": "Free core: Prep-ahead for busy days. Synergy with Mind (mindful eating) + Fuel. High fiber, global ingredients."
  },
  {
    "name": "Free Core: Tempeh Stir Fry (Plant Power)",
    "protein": 28,
    "cals": 420,
    "carbs": 35,
    "fat": 18,
    "ingredients": "150g tempeh, 200g mixed veg (broccoli, carrots), soy sauce or tamari, ginger, 1 tsp oil",
    "instructions": "Cube and pan-fry tempeh with veg. 10 min. Add rice for more cals. Easy global plant protein.",
    "tip": "Free core: Tempeh for fermented plant protein. Synergy with Move (post-mobility) and Fuel basics. Affordable, accessible."
  },
  {
    "name": "Free Core: Cottage Cheese Bowl (High Protein Snack)",
    "protein": 32,
    "cals": 280,
    "carbs": 18,
    "fat": 8,
    "ingredients": "200g cottage cheese, 80g pineapple or berries, 10g nuts, cinnamon",
    "instructions": "Mix and eat. 1 min. Post-mobility or evening with Mind wind-down.",
    "tip": "Free core: Cottage cheese is cheap complete protein. Low prep, supports training recovery."
  },
  {
    "name": "Free Core: Oatmeal with Egg (Savory Power)",
    "protein": 22,
    "cals": 400,
    "carbs": 48,
    "fat": 12,
    "ingredients": "50g oats, 1 egg, 100g spinach, salt/herbs, optional cheese",
    "instructions": "Cook oats, stir in egg and spinach. 5 min. Savory twist for sustained energy.",
    "tip": "Free core: Oats + egg for balanced macros. Ties to habit stacking in Mind and Fuel."
  },
  {
    "name": "Free Core: Lentil Soup with Greens (One Pot Recovery)",
    "protein": 24,
    "cals": 380,
    "carbs": 48,
    "fat": 8,
    "ingredients": "100g lentils, 150g spinach/kale, carrot, onion, spices, lemon",
    "instructions": "Simmer lentils with veg 20 min. Add greens at end. Batch cook for days.",
    "tip": "Free core: Lentils for cheap protein + iron. Post training or mobility, easy global meal."
  },
  {
    "name": "Free Core: Peanut Stew (African Inspired)",
    "protein": 22,
    "cals": 420,
    "carbs": 38,
    "fat": 18,
    "ingredients": "120g chicken or tofu, 2 tbsp peanut butter, 150g sweet potato, spinach, tomato, spices",
    "instructions": "Simmer protein + veg in peanut tomato base 15 min. Serve with rice if desired. One pot.",
    "tip": "Free core: Affordable peanut + veg protein boost. Global flavors, post training recovery fuel."
  },
  {
    "name": "Free Core: Smoked Fish + Yam (West African Style)",
    "protein": 30,
    "cals": 460,
    "carbs": 42,
    "fat": 16,
    "ingredients": "1 can mackerel or sardines, 1 medium yam or sweet potato, greens, chili/lemon",
    "instructions": "Boil or roast yam, flake fish on top with greens and lemon. 10 min. Shelf stable protein.",
    "tip": "Free core: Canned fish for omega + protein. Yam for sustained carbs. Simple, low resource friendly."
  },
  {
    "name": "Free Core: Rajma (Kidney Bean Curry) + Rice",
    "protein": 20,
    "cals": 440,
    "carbs": 68,
    "fat": 8,
    "ingredients": "150g cooked kidney beans, 150g rice, tomato, onion, cumin, turmeric, ginger",
    "instructions": "Simmer beans with spices into curry. Serve over rice. Batch cook staple across South Asia.",
    "tip": "Free core: Beans + rice complete protein. Cheap, hearty, ties to daily habit in Fuel + recovery."
  },
  {
    "name": "Free Core: Spinach Egg Drop (Quick Asian)",
    "protein": 18,
    "cals": 280,
    "carbs": 12,
    "fat": 16,
    "ingredients": "2 eggs, 150g spinach, 200ml broth or water, garlic, soy or salt, green onion",
    "instructions": "Bring broth to simmer, swirl in beaten egg, add spinach. 5 min. Light high protein soup.",
    "tip": "Free core: Eggs + greens for fast complete protein. Pairs with Mind reset or light Move day."
  },
  {
    "name": "Free Core: Cottage Cheese + Veggie Stuffed Pepper",
    "protein": 26,
    "cals": 260,
    "carbs": 18,
    "fat": 10,
    "ingredients": "150g cottage cheese, 1 bell pepper, tomato, herbs, optional hot sauce",
    "instructions": "Mix cheese with chopped veg, stuff pepper. Eat raw or 5 min microwave. No cook option.",
    "tip": "Free core: High protein low prep snack/meal. Ties to Mind (prep as ritual) and Move recovery."
  },
  {
    "name": "Free Core: Simple Miso Tofu Bowl (Japanese Inspired)",
    "protein": 24,
    "cals": 340,
    "carbs": 22,
    "fat": 16,
    "ingredients": "150g firm tofu, 1 tbsp miso (or soy + pinch), 100g greens, sesame or oil, rice optional",
    "instructions": "Pan or microwave tofu, mix miso glaze, serve with greens. 7 min. Fermented flavor hit.",
    "tip": "Free core: Plant protein + umami. Global adaptable, great after mobility or light training."
  },
  {
    "name": "Free Core: Red Lentil 'Pancakes' (Protein Flatbread)",
    "protein": 22,
    "cals": 320,
    "carbs": 42,
    "fat": 6,
    "ingredients": "100g red lentils (soaked or quick cook), spices, 1 egg or flax, herbs",
    "instructions": "Blend or mash into batter, pan cook small cakes 3-4 min/side. High protein base for any meal.",
    "tip": "Free core: Lentils for cheap complete plant protein. Stack with veg or yogurt. Ties Fuel to Mind (mindful prep)."
  },
  {
    "name": "Free Core: Avocado Egg Smash (No Cook)",
    "protein": 18,
    "cals": 340,
    "carbs": 12,
    "fat": 26,
    "ingredients": "1 avocado, 2 hardboiled or fried eggs, tomato, lemon, chili or herbs",
    "instructions": "Mash avocado + egg, top with tomato. 5 min. Portable, satisfying.",
    "tip": "Free core: Healthy fats + complete protein. Great post Move or as Mind wind-down snack. Global breakfast staple."
  },
  {
    "name": "Free Core: Canned Mackerel + Potato Hash",
    "protein": 28,
    "cals": 420,
    "carbs": 38,
    "fat": 18,
    "ingredients": "1 can mackerel, 1 potato or sweet potato, greens, onion/garlic if avail",
    "instructions": "Pan fry potato, flake in fish at end. 10 min one pan. Bones for calcium.",
    "tip": "Free core: Omega + protein from shelf stable fish. Cheap, pairs with recovery after any pillar work."
  },
  {
    "name": "Free Core: Spinach Egg Scramble with Beans",
    "protein": 26,
    "cals": 360,
    "carbs": 28,
    "fat": 14,
    "ingredients": "2 eggs, 100g spinach, 80g black beans or chickpeas, spices, 1 tsp oil",
    "instructions": "Scramble eggs with veg + beans. 6 min. One pan complete meal.",
    "tip": "Free core: Eggs + legumes for full EAA profile. Quick, affordable, synergy with daily Mind/Fuel habits."
  },
  {
    "name": "Free Core: Chickpea Tomato Curry (One Pan)",
    "protein": 20,
    "cals": 380,
    "carbs": 52,
    "fat": 8,
    "ingredients": "150g chickpeas, 200g tomato/onion, spices (cumin, turmeric), 1 tsp oil, lemon",
    "instructions": "Simmer chickpeas in spiced tomato sauce 10 min. Serve over rice or with bread. Batch friendly.",
    "tip": "Free core: Legume curry staple worldwide. High fiber + protein. Pair with Move recovery or Mind evening meal."
  },
  {
    "name": "Free Core: Cottage Cheese Berry Plate (Probiotic Power)",
    "protein": 30,
    "cals": 300,
    "carbs": 28,
    "fat": 8,
    "ingredients": "200g cottage cheese or Greek yogurt, 100g berries, 15g seeds/nuts, cinnamon",
    "instructions": "Layer and eat. 1 min. Add a mind prompt while eating.",
    "tip": "Free core: Fast complete protein + probiotics. Great post-mobility or as Mind wind-down. Cheap, global dairy alternative friendly."
  },
  {
    "name": "Free Core: Sardine Egg Toast (Omega + Protein)",
    "protein": 26,
    "cals": 380,
    "carbs": 28,
    "fat": 18,
    "ingredients": "1 can sardines, 1-2 eggs, 1 slice bread or rice cake, tomato, lemon",
    "instructions": "Toast base, top with mashed sardine + fried/poached egg. 6 min.",
    "tip": "Free core: Shelf-stable omega boost + eggs. Excellent for recovery days or quick Fuel + Move stack."
  },
  {
    "name": "Free Core: Savory Oat + Egg Bowl (Global Breakfast)",
    "protein": 22,
    "cals": 380,
    "carbs": 42,
    "fat": 12,
    "ingredients": "50g oats, 1-2 eggs, spinach or any greens, salt/herbs, optional cheese or beans",
    "instructions": "Cook oats savory, stir in egg at end or top with fried egg + greens. 5 min.",
    "tip": "Free core: Oats + egg for sustained energy. Versatile base; log as Fuel win after any morning Move or Mind practice."
  },
  {
    "name": "Free Core: Black Bean & Egg Scramble (Latin Inspired)",
    "protein": 24,
    "cals": 380,
    "carbs": 32,
    "fat": 16,
    "ingredients": "150g black beans, 2 eggs, onion/tomato if avail, spices, 1 tsp oil",
    "instructions": "Heat beans, scramble eggs in. 5 min one pan. Add rice for more volume.",
    "tip": "Free core: Beans + eggs complete protein. Cheap, fast, pairs with Mind reset or post Move recovery."
  },
  {
    "name": "Free Core: Chickpea 'Tuna' Salad (No Cook Vegan)",
    "protein": 18,
    "cals": 340,
    "carbs": 38,
    "fat": 12,
    "ingredients": "150g chickpeas (mashed), celery or cucumber if avail, lemon, herbs, 1 tsp oil or yogurt",
    "instructions": "Mash chickpeas, mix with veg + dressing. 3 min. Serve on bread or greens.",
    "tip": "Free core: Plant-based complete combo. Portable, no cook, great for Fuel + Mind mindful eating."
  },
  {
    "name": "Free Core: Cottage Cheese + Black Bean Bowl (Probiotic Power)",
    "protein": 28,
    "cals": 320,
    "carbs": 30,
    "fat": 8,
    "ingredients": "150g cottage cheese, 100g black beans, tomato, herbs, optional hot sauce",
    "instructions": "Mix and eat. 1 min. High volume, satisfying.",
    "tip": "Free core: Dairy + legume for extra protein. Synergy with Move (post workout) and Mind (simple ritual)."
  },
  {
    "name": "Free Core: Savory Lentil 'Porridge' with Egg",
    "protein": 26,
    "cals": 400,
    "carbs": 48,
    "fat": 10,
    "ingredients": "100g lentils (quick cook), 1 egg, spinach, cumin, lemon",
    "instructions": "Cook lentils savory, top with fried egg + greens. 8 min.",
    "tip": "Free core: Lentils for affordable protein base. Warm, comforting, log as Fuel win after any pillar work."
  },
  {
    "name": "Free Core: Canned Tuna Chickpea Mash (No Cook)",
    "protein": 32,
    "cals": 380,
    "carbs": 28,
    "fat": 12,
    "ingredients": "1 can tuna or 150g chickpeas, 100g mixed veg (tomato/cucumber), lemon, herbs, 1 tsp oil",
    "instructions": "Mash or mix ingredients. 3 min. Serve on greens or bread.",
    "tip": "Free core: Shelf-stable complete protein. Portable for travel or post-Move recovery. Ties to Mind mindful eating."
  },
  {
    "name": "Free Core: Savory Oatmeal with Egg & Greens",
    "protein": 22,
    "cals": 360,
    "carbs": 42,
    "fat": 12,
    "ingredients": "50g oats, 1-2 eggs, 100g spinach or greens, salt/herbs, optional beans",
    "instructions": "Cook oats savory, stir in egg at end or top fried. 6 min.",
    "tip": "Free core: Oats + egg for sustained energy. Quick Fuel after Mind or Move sessions. Global breakfast staple."
  },
  {
    "name": "Free Core: Black Bean Veggie Bowl (Plant Power)",
    "protein": 20,
    "cals": 400,
    "carbs": 58,
    "fat": 8,
    "ingredients": "150g black beans, 200g rice or sweet potato, tomato, corn or veg, cumin, lime",
    "instructions": "Heat beans with spices, serve over carb + veg. 5-8 min.",
    "tip": "Free core: Affordable legume + grain complete protein. Batch cook friendly, pairs with daily Move or Mind habit."
  },
  {
    "name": "Free Core: Greek Yogurt with Lentils & Herbs (Probiotic + Protein)",
    "protein": 28,
    "cals": 340,
    "carbs": 32,
    "fat": 8,
    "ingredients": "200g Greek yogurt, 100g cooked lentils, cucumber, herbs, lemon",
    "instructions": "Mix yogurt with lentils and veg. 2 min. Cold or room temp.",
    "tip": "Free core: Yogurt + legumes for gut + muscle support. Simple post-training or evening Mind wind-down fuel."
  },
  {
    "name": "Free Core: Red Lentil Soup with Egg (One Pot)",
    "protein": 24,
    "cals": 380,
    "carbs": 48,
    "fat": 8,
    "ingredients": "100g red lentils, 1 egg, carrot/spinach if avail, cumin, lemon",
    "instructions": "Simmer lentils 15 min, top with fried/poached egg. 20 min total.",
    "tip": "Free core: Affordable lentil protein base. Warm, comforting; log as Fuel win after Move or Mind sessions."
  },
  {
    "name": "Free Core: Chickpea Avocado Mash (No Cook)",
    "protein": 18,
    "cals": 360,
    "carbs": 32,
    "fat": 18,
    "ingredients": "150g chickpeas, 1/2 avocado, tomato, lemon, herbs, 1 tsp oil",
    "instructions": "Mash chickpeas + avocado, mix with veg. 3 min. Serve on toast or greens.",
    "tip": "Free core: Plant complete protein + healthy fats. Portable for post-Move recovery or Mind snack."
  },
  {
    "name": "Free Core: Tofu Scramble with Black Beans (Veg Power)",
    "protein": 26,
    "cals": 380,
    "carbs": 32,
    "fat": 16,
    "ingredients": "200g firm tofu, 100g black beans, spinach, turmeric, 1 tsp oil",
    "instructions": "Crumble tofu, scramble with beans + veg 6 min. One pan.",
    "tip": "Free core: High volume plant protein. Ties Fuel to daily Mind or Move habit stacking."
  },
  {
    "name": "Free Core: Savory Yogurt with Beans & Corn (Quick)",
    "protein": 22,
    "cals": 340,
    "carbs": 38,
    "fat": 8,
    "ingredients": "200g Greek yogurt, 100g black beans or chickpeas, corn, cumin, lime",
    "instructions": "Mix yogurt with beans/corn. 2 min. Cold or room temp.",
    "tip": "Free core: Probiotic + legume protein. Simple evening Fuel + Mind ritual or post training."
  },
  {
    "name": "Free Core: Quick Chickpea Curry (One Pan)",
    "protein": 20,
    "cals": 400,
    "carbs": 52,
    "fat": 10,
    "ingredients": "150g chickpeas, 200g tomato/onion mix, spices (cumin, turmeric, chili), 1 tsp oil, rice optional",
    "instructions": "Simmer chickpeas in spiced sauce 10 min. Serve over rice or with bread.",
    "tip": "Free core: Affordable legume curry staple worldwide. Batch cook friendly, pairs with Move recovery or Mind evening meal."
  },
  {
    "name": "Free Core: Egg & Potato Hash with Beans",
    "protein": 24,
    "cals": 420,
    "carbs": 48,
    "fat": 14,
    "ingredients": "2 eggs, 1 large potato, 100g black beans, spinach or greens, herbs",
    "instructions": "Pan fry diced potato, add beans + egg scramble. 8 min one pan.",
    "tip": "Free core: Hearty complete protein + carb. Quick Fuel after any pillar work, ties to daily habit stacking."
  },
  {
    "name": "Free Core: Mackerel or Sardine Sweet Potato Mash",
    "protein": 28,
    "cals": 400,
    "carbs": 38,
    "fat": 16,
    "ingredients": "1 can mackerel/sardines, 1 medium sweet potato, greens, lemon",
    "instructions": "Microwave or boil potato, mash with fish + squeeze lemon. 6 min.",
    "tip": "Free core: Shelf-stable omega + protein. Excellent for recovery days or quick Fuel + Move stack."
  },
  {
    "name": "Free Core: Black Bean & Corn Salad with Yogurt",
    "protein": 18,
    "cals": 340,
    "carbs": 42,
    "fat": 8,
    "ingredients": "150g black beans, 100g corn, 150g mixed veg, 100g Greek yogurt, cumin, lime",
    "instructions": "Mix all, chill or eat room temp. 3 min.",
    "tip": "Free core: Plant protein + probiotic. Portable for post-Move or Mind wind-down snack."
  },
  {
    "name": "Free Core: Lentil Veggie Stew with Egg (One Pot)",
    "protein": 26,
    "cals": 400,
    "carbs": 52,
    "fat": 8,
    "ingredients": "100g lentils, 200g mixed veg (carrot, spinach, tomato), 1 egg, cumin, lemon",
    "instructions": "Simmer lentils + veg 15 min, top with fried/poached egg. 20 min total.",
    "tip": "Free core: Affordable lentil protein base. Warm, comforting; log as Fuel win after Move or Mind sessions."
  },
  {
    "name": "Free Core: Cottage Cheese with Black Beans & Corn (Quick)",
    "protein": 28,
    "cals": 360,
    "carbs": 38,
    "fat": 8,
    "ingredients": "200g cottage cheese, 100g black beans, 80g corn, tomato, cumin, lime",
    "instructions": "Mix all. 2 min. Cold or room temp.",
    "tip": "Free core: High protein + probiotic. Simple post-training or evening Mind wind-down fuel."
  },
  {
    "name": "Free Core: Savory Oat with Sardines or Beans",
    "protein": 24,
    "cals": 380,
    "carbs": 42,
    "fat": 12,
    "ingredients": "50g oats, 1 can sardines or 100g beans, spinach, lemon, herbs",
    "instructions": "Cook oats savory, top with fish or beans + squeeze lemon. 6 min.",
    "tip": "Free core: Oats + complete protein. Quick Fuel after any pillar work, ties to daily habit stacking."
  },
  {
    "name": "Free Core: Tofu Rice Bowl with Veggies (Plant Power)",
    "protein": 22,
    "cals": 400,
    "carbs": 52,
    "fat": 10,
    "ingredients": "150g firm tofu, 200g rice, 150g mixed veg (broccoli, peppers), soy or spices, 1 tsp oil",
    "instructions": "Pan fry tofu + veg, serve over rice. 8 min.",
    "tip": "Free core: High volume plant protein. Ties Fuel to Move recovery or Mind mindful eating."
  },
  {
    "name": "Free Core: Chickpea Curry Quick (One Pan)",
    "protein": 20,
    "cals": 380,
    "carbs": 48,
    "fat": 10,
    "ingredients": "150g chickpeas, 200g tomato/onion, spices (cumin, turmeric), 1 tsp oil, rice optional",
    "instructions": "Simmer chickpeas in spiced sauce 10 min. Serve over rice or with bread.",
    "tip": "Free core: Affordable legume curry staple worldwide. Batch cook friendly, pairs with Move recovery or Mind evening meal."
  },
  {
    "name": "Free Core: Egg & Lentil Scramble (Quick)",
    "protein": 26,
    "cals": 360,
    "carbs": 28,
    "fat": 14,
    "ingredients": "2 eggs, 100g cooked lentils, spinach, tomato, herbs, 1 tsp oil",
    "instructions": "Scramble eggs with lentils + veg. 5 min one pan.",
    "tip": "Free core: Eggs + legumes for complete protein. Quick Fuel after any pillar work, ties to daily habit stacking."
  },
  {
    "name": "Free Core: Yogurt with Beans & Greens (Probiotic)",
    "protein": 22,
    "cals": 320,
    "carbs": 32,
    "fat": 8,
    "ingredients": "200g Greek yogurt, 100g black beans or chickpeas, 80g greens, cumin, lemon",
    "instructions": "Mix yogurt with beans + greens. 2 min. Cold or room temp.",
    "tip": "Free core: Probiotic + legume protein. Simple evening Fuel + Mind ritual or post training."
  },
  {
    "name": "Free Core: Tofu Veggie Stir (Plant Power)",
    "protein": 24,
    "cals": 360,
    "carbs": 28,
    "fat": 16,
    "ingredients": "150g firm tofu, 150g mixed veg (broccoli, peppers), soy or spices, 1 tsp oil, rice optional",
    "instructions": "Pan fry tofu + veg. 6 min. Serve over rice.",
    "tip": "Free core: High volume plant protein. Ties Fuel to Move recovery or Mind mindful eating."
  },
  {
    "name": "Free Core: Black Bean and Egg Power Bowl",
    "protein": 28,
    "cals": 420,
    "carbs": 48,
    "fat": 12,
    "ingredients": "150g black beans, 2 eggs, 150g rice or sweet potato, tomato, cumin, lime",
    "instructions": "Heat beans, scramble or fry eggs, serve over carb. 8 min.",
    "tip": "Free core: Legume + egg complete protein. Quick post-Move or Mind session fuel, ties to daily habit."
  },
  {
    "name": "Free Core: Cottage Cheese with Lentils and Herbs",
    "protein": 30,
    "cals": 340,
    "carbs": 28,
    "fat": 8,
    "ingredients": "200g cottage cheese, 100g cooked lentils, cucumber, herbs, lemon",
    "instructions": "Mix all. 2 min. Cold or room temp.",
    "tip": "Free core: High protein + probiotic. Simple evening wind-down or post-training snack, synergy with Mind."
  },
  {
    "name": "Free Core: Savory Oat with Sardines or Chickpeas",
    "protein": 26,
    "cals": 400,
    "carbs": 42,
    "fat": 12,
    "ingredients": "50g oats, 1 can sardines or 120g chickpeas, spinach, lemon, herbs",
    "instructions": "Cook oats savory, top with fish or chickpeas. 6 min.",
    "tip": "Free core: Oats + complete protein. Versatile quick Fuel after any pillar work."
  },
  {
    "name": "Free Core: Tofu Scramble with Veggies and Beans",
    "protein": 26,
    "cals": 380,
    "carbs": 32,
    "fat": 16,
    "ingredients": "200g firm tofu, 100g black beans, 150g mixed veg, turmeric, 1 tsp oil",
    "instructions": "Crumble and scramble tofu with beans + veg. 7 min one pan.",
    "tip": "Free core: Plant-based complete protein. Ties Fuel to Move or Mind daily habit."
  },
  {
    "name": "Free Core: Savory Chickpea and Spinach Scramble",
    "protein": 24,
    "cals": 340,
    "carbs": 32,
    "fat": 14,
    "ingredients": "150g chickpeas, 150g spinach, 2 eggs, garlic, cumin, 1 tsp oil",
    "instructions": "Mash chickpeas lightly, scramble with spinach and egg. 6 min.",
    "tip": "Free core: Quick complete protein scramble. Great post-Move or as Mind reset meal, log in Nutrition for synergy."
  },
  {
    "name": "Free Core: High Protein Lentil and Egg Bowl",
    "protein": 28,
    "cals": 400,
    "carbs": 48,
    "fat": 8,
    "ingredients": "120g cooked lentils, 2 eggs, 100g greens, tomato, lemon, herbs",
    "instructions": "Warm lentils, top with poached eggs and salad. 5 min.",
    "tip": "Free core: Lentils + egg for affordable complete protein. Ties Fuel to daily Move or Mind habit."
  },
  {
    "name": "Free Core: Cottage Cheese and Black Bean Power Plate",
    "protein": 32,
    "cals": 360,
    "carbs": 30,
    "fat": 10,
    "ingredients": "200g cottage cheese, 100g black beans, cucumber, tomato, cumin, lime",
    "instructions": "Mix or layer. 2 min prep. Add a Mind gratitude while eating.",
    "tip": "Free core: Probiotic + legume protein combo. Simple, portable, synergy with Mind and post-Move recovery."
  },
  {
    "name": "Free Core: Quick Tofu and Veggie Rice Bowl",
    "protein": 24,
    "cals": 420,
    "carbs": 52,
    "fat": 12,
    "ingredients": "150g firm tofu, 200g rice, 150g mixed veg, soy or spices, 1 tsp oil",
    "instructions": "Pan fry tofu and veg, serve over rice. 8 min.",
    "tip": "Free core: Plant protein + carb for sustained energy. Log after Move or as Fuel + Mind stack."
  },
  {
    "name": "Free Core: Black Bean and Corn Salad with Yogurt",
    "protein": 18,
    "cals": 340,
    "carbs": 42,
    "fat": 8,
    "ingredients": "150g black beans, 100g corn, 150g mixed veg, 100g Greek yogurt, cumin, lime",
    "instructions": "Mix all. 3 min. Cold or room temp.",
    "tip": "Free core: Plant protein + probiotic. Portable for post-Move or Mind wind-down snack."
  },
  {
    "name": "Free Core: Egg and Sweet Potato Hash with Beans",
    "protein": 24,
    "cals": 420,
    "carbs": 48,
    "fat": 14,
    "ingredients": "2 eggs, 1 large sweet potato, 100g black beans, spinach, herbs",
    "instructions": "Pan fry diced potato, add beans + egg scramble. 8 min one pan.",
    "tip": "Free core: Hearty complete protein + carb. Quick Fuel after any pillar work."
  },
  {
    "name": "Free Core: Cottage Cheese with Lentils and Veggies",
    "protein": 30,
    "cals": 340,
    "carbs": 28,
    "fat": 8,
    "ingredients": "200g cottage cheese, 100g cooked lentils, cucumber, tomato, cumin, lemon",
    "instructions": "Mix all. 2 min. Simple, high volume.",
    "tip": "Free core: Probiotic + legume protein. Ties to Mind wind-down or post-Move recovery."
  },
  {
    "name": "Free Core: Tofu Rice Bowl with Simple Peanut Sauce",
    "protein": 24,
    "cals": 420,
    "carbs": 48,
    "fat": 14,
    "ingredients": "150g firm tofu, 200g rice, 150g mixed veg, 2 tbsp peanut butter, soy, lime",
    "instructions": "Pan fry tofu + veg, mix quick peanut sauce, serve over rice. 8 min.",
    "tip": "Free core: Plant protein with flavor. Synergy with Move or Mind daily habit."
  },
  {
    "name": "Free Core: Lentil and Rice Bowl with Egg",
    "protein": 26,
    "cals": 420,
    "carbs": 52,
    "fat": 8,
    "ingredients": "120g cooked lentils, 200g rice, 1 egg, spinach, cumin, lemon",
    "instructions": "Warm lentils and rice, top with poached egg and greens. 5 min.",
    "tip": "Free core: Affordable complete protein + carb. Ties Fuel to daily Move or Mind habit."
  },
  {
    "name": "Free Core: Cottage Cheese with Black Beans and Greens",
    "protein": 30,
    "cals": 340,
    "carbs": 28,
    "fat": 8,
    "ingredients": "200g cottage cheese, 100g black beans, 80g greens, tomato, cumin, lime",
    "instructions": "Mix or layer. 2 min. Add Mind gratitude cue.",
    "tip": "Free core: Probiotic + legume protein. Simple post-Move or evening Mind wind-down."
  },
  {
    "name": "Free Core: Tofu Stir Fry with Veggies and Rice",
    "protein": 24,
    "cals": 400,
    "carbs": 48,
    "fat": 12,
    "ingredients": "150g firm tofu, 200g rice, 150g mixed veg, soy or spices, 1 tsp oil",
    "instructions": "Pan fry tofu and veg, serve over rice. 7 min.",
    "tip": "Free core: High volume plant protein. Synergy with Move recovery or Mind stack."
  },
  {
    "name": "Free Core: Greek Yogurt with Lentils and Veggies",
    "protein": 28,
    "cals": 360,
    "carbs": 32,
    "fat": 8,
    "ingredients": "200g Greek yogurt, 100g cooked lentils, cucumber, tomato, cumin, lemon",
    "instructions": "Mix yogurt with lentils and salad. 2 min.",
    "tip": "Free core: Probiotic + complete protein. Portable for post-Move or Mind snack."
  }
];
