// Payments — Stripe Checkout Sessions (+ Payment Link fallback) + webhook enrollment.
// See docs/STRIPE_PREMIUM_SETUP.md.
//
// Core is free for everyone (per vision.md).
// Preferred path: UnlockButton → POST /api/checkout → Stripe hosted Checkout
//   (card, wallets, PayPal, USDC when enabled in Dashboard).
// Fallback: NEXT_PUBLIC_STRIPE_LINK_* Payment Links when Sessions are unconfigured.
// Webhooks grant rows in Supabase `enrollments`; usePremium reads /api/premium/status.
// Without either path, UI falls back to an honest founders waitlist (dev: grantPremiumDemo).

import { STORAGE_KEYS, STORAGE_KEY_PREFIXES } from '@/lib/storage/keys';
import { writeRaw } from '@/lib/storage/safeStorage';

/** Super Bundle plan IDs — keep in sync with BUNDLE_PLANS in bundleConfig.ts. */
export type CheckoutPlanId = 'monthly' | '12mo' | 'lifetime';

// Product price map for reference (one-time programs / pillars).
// Used in UnlockButton for display and demo.
export const PROGRAM_PRICES: Record<string, { price: string; currency: string; title: string }> = {
  'pt-nutrition': { price: '497', currency: 'USD', title: 'Elite Personal Training + Nutrition' },
  'bodybuilding': { price: '297', currency: 'USD', title: 'Bodybuilding Specialist' },
  'corrective': { price: '347', currency: 'USD', title: 'Corrective Exercise Specialist' },
  'strength-business': { price: '397', currency: 'USD', title: 'Strength Business of Personal Training' },
  'online-coaching': { price: '297', currency: 'USD', title: 'Online Coaching Mastery' },
  'conditioning': { price: '247', currency: 'USD', title: 'Conditioning Specialist' },
}

// Super Bundle monthly anchor — keep in sync with BUNDLE_PLANS in bundleConfig.ts + docs/STRATEGY.md.
export const SUPER_BUNDLE_PRICE = '11.99'
export const SUPER_BUNDLE_TITLE = 'Mission Winning Super Bundle (All Premium Pillars)'
export const BUNDLE_DISCOUNT_NOTE =
  'Founders annual ~$4.92/mo ($59/yr) · monthly $11.99 · lifetime $149 — free core forever'

/** Pillars included in the Super Bundle (Freeletics 7-in-1 model → our unified super app). */
export const BUNDLE_PILLARS = [
  {
    id: 'train',
    name: 'Train',
    free: 'Full logger, builder, library, benchmarks',
    premium: 'AI Coach depth, unlimited plans, hybrid programming',
    standalone: '$15/mo',
    route: '/log',
  },
  {
    id: 'fuel',
    name: 'Fuel',
    free: 'Macro log, water, 40 free recipes',
    premium: '102+ premium recipes, meal plans, coaching sync',
    standalone: '$10/mo',
    route: '/nutrition',
  },
  {
    id: 'move',
    name: 'Move',
    free: '24 guided mobility flows + timer',
    premium: '40 premium recovery flows — press play, follow cues',
    standalone: '$9/mo',
    route: '/move',
  },
  {
    id: 'mind',
    name: 'Mind',
    free: 'Breathing timer + 24 guided sessions',
    premium: '48 premium guided sessions — timed player with pause/skip',
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
    free: 'Education paths + 6-chapter guidebook',
    premium: '16 premium Learn sections with chapter progress',
    standalone: '$12/mo',
    route: '/learn',
  },
] as const

/**
 * Stripe Payment Links (legacy / fallback — see docs/LAUNCH_RUNBOOK.md).
 * Prefer Checkout Sessions via POST /api/checkout when STRIPE_SECRET_KEY + price IDs are set.
 *
 * NOTE: NEXT_PUBLIC_* vars are inlined at build time ONLY for static
 * `process.env.X` property access — a dynamic `process.env[key]` lookup is
 * always undefined in the browser, so every link must be listed here.
 */
const STRIPE_LINKS: Record<string, string | undefined> = {
  'super-bundle': process.env.NEXT_PUBLIC_STRIPE_LINK_BUNDLE || process.env.NEXT_PUBLIC_STRIPE_LINK_PREMIUM,
  bundle: process.env.NEXT_PUBLIC_STRIPE_LINK_BUNDLE || process.env.NEXT_PUBLIC_STRIPE_LINK_PREMIUM,
  /** Monthly plan (preferred). Falls back to legacy 3-month link env if still set. */
  'bundle-monthly':
    process.env.NEXT_PUBLIC_STRIPE_LINK_BUNDLE_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_LINK_BUNDLE_3MO,
  'bundle-3mo':
    process.env.NEXT_PUBLIC_STRIPE_LINK_BUNDLE_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_LINK_BUNDLE_3MO,
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

/**
 * Client flag: Checkout Sessions API is live (set with STRIPE_SECRET_KEY + price IDs on server).
 * When true, UnlockButton prefers POST /api/checkout over Payment Links.
 */
export function isCheckoutSessionsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_STRIPE_CHECKOUT === 'true'
}

export type CreateCheckoutForPlanResult =
  | { ok: true; url: string }
  | {
      ok: false
      code: 'auth_required' | 'unavailable' | 'error' | 'territory_blocked'
      message: string
    }

/**
 * Start Checkout Sessions for a Super Bundle plan. Caller redirects to `url` on success.
 * Requires signed-in session cookies.
 */
export async function createCheckoutForPlan(
  planId: CheckoutPlanId
): Promise<CreateCheckoutForPlanResult> {
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    })
    const data = (await res.json().catch(() => ({}))) as {
      url?: string
      error?: string
      code?: string
    }
    if (res.status === 401 || data.code === 'auth_required') {
      return {
        ok: false,
        code: 'auth_required',
        message: data.error || 'Sign in required to checkout',
      }
    }
    if (res.status === 403 || data.code === 'territory_blocked') {
      return {
        ok: false,
        code: 'territory_blocked',
        message:
          data.error ||
          'Hosted checkout is not available in your region. See Supported Regions.',
      }
    }
    if (res.status === 503) {
      return {
        ok: false,
        code: 'unavailable',
        message: data.error || 'Checkout not configured',
      }
    }
    if (!res.ok || !data.url) {
      return {
        ok: false,
        code: 'error',
        message: data.error || 'Checkout failed',
      }
    }
    return { ok: true, url: data.url }
  } catch {
    return { ok: false, code: 'error', message: 'Network error starting checkout' }
  }
}

/** Open Stripe Customer Portal (manage / cancel). Requires signed-in session. */
export async function openBillingPortal(): Promise<CreateCheckoutForPlanResult> {
  try {
    const res = await fetch('/api/billing-portal', {
      method: 'POST',
      credentials: 'include',
    })
    const data = (await res.json().catch(() => ({}))) as {
      url?: string
      error?: string
      code?: string
    }
    if (res.status === 401 || data.code === 'auth_required') {
      return {
        ok: false,
        code: 'auth_required',
        message: data.error || 'Sign in required',
      }
    }
    if (!res.ok || !data.url) {
      return {
        ok: false,
        code: res.status === 503 || res.status === 404 ? 'unavailable' : 'error',
        message: data.error || 'Billing portal unavailable',
      }
    }
    return { ok: true, url: data.url }
  } catch {
    return { ok: false, code: 'error', message: 'Network error opening billing portal' }
  }
}

// Helper to grant premium immediately (client-side optimistic + analytics)
// Updated for bundle: supports 'super-bundle' to unlock full access.
// Demo grant — device storage only honored in development (production uses Supabase enrollments).
export function grantPremiumDemo(productId?: string) {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }
  writeRaw(STORAGE_KEYS.premium, 'true');
  if (productId) {
    writeRaw(`${STORAGE_KEY_PREFIXES.event}enroll_${productId}`, Date.now().toString());
    if (productId === 'super-bundle') {
      writeRaw(STORAGE_KEYS.bundleActive, 'true');
    }
  }
}
