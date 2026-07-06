export type MealPlanDay = {
  dayKey: string;
  label: string;
  meals: string[];
};

/** Static 7-day high-protein outline — premium shows full week; free shows day 1. */
export const FUEL_MEAL_PLAN: MealPlanDay[] = [
  {
    dayKey: 'mon',
    label: 'Monday',
    meals: [
      'Breakfast: Greek yogurt, berries, oats',
      'Lunch: Chicken rice bowl + greens',
      'Dinner: Salmon, sweet potato, broccoli',
    ],
  },
  {
    dayKey: 'tue',
    label: 'Tuesday',
    meals: [
      'Breakfast: Eggs, whole-grain toast, fruit',
      'Lunch: Tuna salad wrap',
      'Dinner: Lean beef stir-fry + rice',
    ],
  },
  {
    dayKey: 'wed',
    label: 'Wednesday',
    meals: [
      'Breakfast: Protein smoothie',
      'Lunch: Lentil soup + side salad',
      'Dinner: Turkey chili + beans',
    ],
  },
  {
    dayKey: 'thu',
    label: 'Thursday',
    meals: [
      'Breakfast: Cottage cheese + pineapple',
      'Lunch: Leftover chili bowl',
      'Dinner: Grilled chicken, quinoa, veg',
    ],
  },
  {
    dayKey: 'fri',
    label: 'Friday',
    meals: [
      'Breakfast: Omelet + avocado toast',
      'Lunch: Chickpea power salad',
      'Dinner: Fish tacos, cabbage slaw',
    ],
  },
  {
    dayKey: 'sat',
    label: 'Saturday',
    meals: [
      'Breakfast: Pancakes + whey (higher carb day)',
      'Lunch: Meal prep rice box',
      'Dinner: Flexible — hit protein target',
    ],
  },
  {
    dayKey: 'sun',
    label: 'Sunday',
    meals: [
      'Breakfast: Recovery brunch — eggs + fruit',
      'Lunch: Soup + bread',
      'Dinner: Prep proteins for the week',
    ],
  },
];
