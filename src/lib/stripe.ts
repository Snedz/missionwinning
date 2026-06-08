import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

// For MVP revenue: prefer Stripe Payment Links (create once in Stripe Dashboard, no server needed).
// Set these in .env.local as NEXT_PUBLIC_STRIPE_LINK_PT etc. (https://buy.stripe.com/xxxx)
// Then the buy buttons will redirect directly. Fulfillment via Stripe email + manual or webhook later.
// Both one-time programs AND recurring subs supported.
export const STRIPE_LINKS = {
  ptNutrition: process.env.NEXT_PUBLIC_STRIPE_LINK_PT || '',
  bodybuilding: process.env.NEXT_PUBLIC_STRIPE_LINK_BB || '',
  corrective: process.env.NEXT_PUBLIC_STRIPE_LINK_CORR || '',
  strengthBusiness: process.env.NEXT_PUBLIC_STRIPE_LINK_BUS || '',
  onlineCoaching: process.env.NEXT_PUBLIC_STRIPE_LINK_COACH || '',
  conditioning: process.env.NEXT_PUBLIC_STRIPE_LINK_COND || '',
  // Recurring premium sub example (create a $9.99/mo price)
  premiumMonthly: process.env.NEXT_PUBLIC_STRIPE_LINK_PREMIUM || '',
}

export async function redirectToCheckout(link: string) {
  if (!link || link === '') {
    alert('Stripe link not configured yet. Create a Payment Link in your Stripe Dashboard and set the VITE_STRIPE_LINK_* env var. For testing, we will grant demo premium.')
    // Demo fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem('mw_premium', 'true')
    }
    window.location.href = '/log'
    return
  }
  // Direct to hosted payment link (fastest for revenue, no code session needed)
  window.location.href = link
}

// Optional: full dynamic checkout with stripe-js (requires backend session creation for security)
export async function redirectToStripeCheckout(sessionId?: string) {
  if (!stripePublishableKey) {
    console.warn('No VITE_STRIPE_PUBLISHABLE_KEY — using demo mode')
    if (typeof window !== 'undefined') localStorage.setItem('mw_premium', 'true')
    window.location.href = '/log'
    return
  }
  const stripe = await loadStripe(stripePublishableKey)
  if (!stripe) return
  // In real: fetch session id from your backend/edge fn first
  if (sessionId) {
    const { error } = await (stripe as any).redirectToCheckout({ sessionId })
    if (error) console.error(error)
  } else {
    alert('Dynamic checkout requires a sessionId from server. Using Payment Link fallback for now.')
  }
}
