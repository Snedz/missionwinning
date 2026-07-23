/**
 * Premium adaptive fuel plan — macro-synced meals from recipe library.
 * Auth: premium | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { createClient } from '@supabase/supabase-js';
import { FREE_RECIPES } from '@/data/recipes/freeRecipes';
import { PREMIUM_RECIPES } from '@/data/recipes/premiumRecipes';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { isPremiumBypassEnabled, isPremiumForUser } from '@/lib/premiumServer';
import { buildFuelContext } from '@/lib/fuelCoach/contextBuilder';
import { recipesFromCatalog } from '@/lib/fuelCoach/mealSelector';
import { generateFuelPlan } from '@/lib/fuelCoach/planEngine';
import { currentWeekStart } from '@/lib/coach/splitPlanner';

export const GET = withApiLogging('premium/fuel-plan', async (request: NextRequest) => {
  const weekStart = request.nextUrl.searchParams.get('weekStart') ?? currentWeekStart();

  if (isPremiumBypassEnabled()) {
    const ctx = buildFuelContext({ history: [], seedId: 'demo-fuel' });
    const recipes = recipesFromCatalog([...FREE_RECIPES, ...PREMIUM_RECIPES]);
    return NextResponse.json({ plan: generateFuelPlan(ctx, recipes, weekStart) });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({ error: 'Premium content unavailable' }, { status: 503 });
  }

  const accessToken = extractSupabaseAccessToken(request.cookies);
  if (!accessToken) {
    return NextResponse.json({ error: 'Sign in and unlock premium' }, { status: 403 });
  }

  const supabase = createClient(url, anon);
  const {
    data: { user },
  } = await supabase.auth.getUser(accessToken);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const premium = await isPremiumForUser(user.id, user.email ?? null);
  if (!premium) {
    return NextResponse.json({ error: 'Premium enrollment required' }, { status: 403 });
  }

  const ctx = buildFuelContext({ history: [], seedId: user.id });
  const recipes = recipesFromCatalog([...FREE_RECIPES, ...PREMIUM_RECIPES]);
  return NextResponse.json({ plan: generateFuelPlan(ctx, recipes, weekStart) });
});
