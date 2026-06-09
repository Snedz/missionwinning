// Payments (temporarily demo / request-based while finalizing business setup / LLC).
//
// Core is free for everyone (per vision.md).
// Premium pillars and Super Bundle are unlocked via "Request Access" (demo grant for now).
// Real processor (PayPal, Stripe, Lemon Squeezy etc.) will be added once business entity is ready.
//
// For now: buttons call grantPremiumDemo and show a request message.
// Later: will support real checkout + webhook fulfillment.

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

// Helper to grant premium immediately (client-side optimistic + analytics)
// Updated for bundle: supports 'super-bundle' to unlock full access.
export function grantPremiumDemo(productId?: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mw_premium', 'true')
    if (productId) {
      localStorage.setItem('mw_event_enroll_' + productId, Date.now().toString())
      if (productId === 'super-bundle') {
        localStorage.setItem('mw_bundle_active', 'true')
      }
    }
    // Cleaned: no more beta spots, use for bundle conversion tracking if needed
  }
}
