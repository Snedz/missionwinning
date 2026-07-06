// Payments — Stripe Payment Links + webhook enrollment (see docs/STRIPE_PREMIUM_SETUP.md).
//
// Core is free for everyone (per vision.md).
// When NEXT_PUBLIC_STRIPE_LINK_* env vars are set, UnlockButton opens live Stripe checkout.
// Webhooks grant rows in Supabase `enrollments`; usePremium reads /api/premium/status.
// Without Stripe links, UI falls back to an honest founders waitlist (dev: grantPremiumDemo).

// Product price map for reference (one-time programs / pillars).
// Used in UnlockButton for display and demo.
export const PROGRAM_PRICES: Record<string, { price: string; currency: string; title: string }> = {
  'pt-nutrition': { price: '497', currency: 'USD', title: 'Elite Personal Training + Nutrition' },
  'bodybuilding': { price: '297', currency: 'USD', title: 'Bodybuilding Specialist' },
  'corrective': { price: '347', currency: 'USD', title: 'Corrective Exercise Specialist' },
  'strength-business': { price: '297', currency: 'USD', title: 'Strength Business of Personal Training' },
  'online-coaching': { price: '997', currency: 'USD', title: 'Online Coaching Mastery' },
  'conditioning': { price: '247', currency: 'USD', title: 'Conditioning Specialist' },
}

// Super Bundle pricing (monthly example). Will be used for real checkout later.
export const SUPER_BUNDLE_PRICE = '12'
export const SUPER_BUNDLE_TITLE = 'Mission Winning Super Bundle (All Premium Pillars)'
export const BUNDLE_DISCOUNT_NOTE = '50% off intro for first 6-12 months — holistic value (Freeletics-inspired)'

/** Pillars included in the Super Bundle (Freeletics 7-in-1 model → our unified super app). */
export const BUNDLE_PILLARS = [
  {
    id: 'train',
    name: 'Train',
    free: 'Full logger, builder, library, benchmarks',
    premium: 'AI Coach, unlimited plans, hybrid programming',
    standalone: '$15/mo',
    route: '/log',
  },
  {
    id: 'fuel',
    name: 'Fuel',
    free: 'Macro log, water, 20 recipes',
    premium: 'Meal plans, periodized nutrition, coaching sync',
    standalone: '$10/mo',
    route: '/nutrition',
  },
  {
    id: 'move',
    name: 'Move',
    free: '10 guided mobility flows + timer',
    premium: '18 timed recovery flows — press play, follow cues',
    standalone: '$9/mo',
    route: '/move',
  },
  {
    id: 'mind',
    name: 'Mind',
    free: 'Breathing timer + 10 guided sessions',
    premium: '22 guided sessions — timed player with pause/skip',
    standalone: '$7/mo',
    route: '/mind',
  },
  {
    id: 'track',
    name: 'Track',
    free: 'Manual activity log + weekly stats',
    premium: 'GPS routes, live pace chart, weekly GPS stats',
    standalone: '$8/mo',
    route: '/track',
  },
  {
    id: 'learn',
    name: 'Learn',
    free: '10 education paths + 6-chapter guidebook',
    premium: '4 specialist courses with chapter progress',
    standalone: '$12/mo',
    route: '/learn',
  },
] as const

/**
 * Stripe Payment Links (set in Vercel when the business entity is ready —
 * see LAUNCH_RUNBOOK.md). Checkout activates automatically wherever a link
 * is configured; otherwise the UI falls back to the founders waitlist.
 *
 * NOTE: NEXT_PUBLIC_* vars are inlined at build time ONLY for static
 * `process.env.X` property access — a dynamic `process.env[key]` lookup is
 * always undefined in the browser, so every link must be listed here.
 */
const STRIPE_LINKS: Record<string, string | undefined> = {
  'super-bundle': process.env.NEXT_PUBLIC_STRIPE_LINK_BUNDLE || process.env.NEXT_PUBLIC_STRIPE_LINK_PREMIUM,
  bundle: process.env.NEXT_PUBLIC_STRIPE_LINK_BUNDLE || process.env.NEXT_PUBLIC_STRIPE_LINK_PREMIUM,
  'bundle-3mo': process.env.NEXT_PUBLIC_STRIPE_LINK_BUNDLE_3MO,
  'bundle-12mo': process.env.NEXT_PUBLIC_STRIPE_LINK_BUNDLE_12MO,
  'bundle-lifetime': process.env.NEXT_PUBLIC_STRIPE_LINK_BUNDLE_LIFETIME,
  'pt-nutrition': process.env.NEXT_PUBLIC_STRIPE_LINK_PT,
  bodybuilding: process.env.NEXT_PUBLIC_STRIPE_LINK_BB,
  corrective: process.env.NEXT_PUBLIC_STRIPE_LINK_CORR,
  'strength-business': process.env.NEXT_PUBLIC_STRIPE_LINK_BUS,
  'online-coaching': process.env.NEXT_PUBLIC_STRIPE_LINK_COACH,
  conditioning: process.env.NEXT_PUBLIC_STRIPE_LINK_COND,
}

export function getStripeCheckoutUrl(productId?: string): string | null {
  if (!productId) {
    return STRIPE_LINKS['bundle'] || null
  }
  return STRIPE_LINKS[productId] || null
}

// Helper to grant premium immediately (client-side optimistic + analytics)
// Updated for bundle: supports 'super-bundle' to unlock full access.
// Demo grant — localStorage only honored in development (production uses Supabase enrollments).
export function grantPremiumDemo(productId?: string) {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }
  localStorage.setItem('mw_premium', 'true');
  if (productId) {
    localStorage.setItem('mw_event_enroll_' + productId, Date.now().toString());
    if (productId === 'super-bundle') {
      localStorage.setItem('mw_bundle_active', 'true');
    }
  }
}
