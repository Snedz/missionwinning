import { createClient as createSupabaseJsClient, type SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { getAuthRedirectUrl as buildAuthRedirectUrl } from '@/lib/authRedirect'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars not set. Using demo mode (localStorage premium only). Create Supabase project and add NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local')
}

export function isSupabaseConfigured(): boolean {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('demo.supabase.co') &&
    supabaseAnonKey !== 'demo-anon-key'
  )
}

export function getAuthRedirectUrl(nextPath = '/log'): string {
  return buildAuthRedirectUrl(nextPath)
}

const url = supabaseUrl || 'https://demo.supabase.co'
const anon = supabaseAnonKey || 'demo-anon-key'

/**
 * Browser: @supabase/ssr cookie storage (PKCE verifier survives OAuth redirect).
 * Server/module init without window: ephemeral JS client (no cookie jar).
 */
function createAppSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    return createSupabaseJsClient(url, anon, {
      auth: {
        flowType: 'pkce',
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  }
  return createBrowserClient(url, anon)
}

export const supabase = createAppSupabaseClient()

export type OAuthProvider = 'google' | 'apple' | 'azure' | 'facebook'

// Types for our tables (match your Supabase schema)
export type Profile = {
  id: string
  email: string
  full_name?: string
  created_at: string
}

export type Product = {
  id: string
  title: string
  price: number
  description: string
  features: string[]
  is_premium: boolean
}

export type Enrollment = {
  id: string
  user_id: string
  product_id: string
  purchased_at: string
  premium_granted: boolean
  pdf_urls?: string[]
}

export type Lead = {
  id?: number
  name: string
  email: string
  goals?: string
  current_training?: string
  package_interest?: string
  created_at?: string
}

// Helper: check if user has premium (enrollment — demo only in development)
export async function checkPremium(email?: string): Promise<boolean> {
  if (
    typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'development' &&
    localStorage.getItem('mw_premium') === 'true'
  ) {
    return true;
  }
  if (!supabaseUrl) return false

  const user = email ? null : await getUser()
  let query = supabase
    .from('enrollments')
    .select('id')
    .or('premium_granted.eq.true,status.eq.active')
    .limit(1)

  if (user?.id) {
    query = query.eq('user_id', user.id)
  } else if (email) {
    query = query.eq('user_email', email)
  } else {
    return false
  }

  const { data } = await query
  return !!(data && data.length > 0)
}

// For demo: grant premium locally (development only)
export async function grantDemoPremium(email: string) {
  if (process.env.NODE_ENV === 'production') return;
  if (typeof window !== 'undefined') {
    localStorage.setItem('mw_premium', 'true')
    localStorage.setItem('mw_premium_email', email)
  }
}

// Auth helpers — OAuth + magic link (privacy-by-design: no passwords stored)
export async function signInWithOAuth(provider: OAuthProvider, nextPath = '/log') {
  const options: { redirectTo: string; scopes?: string } = {
    redirectTo: getAuthRedirectUrl(nextPath),
  }
  // Microsoft/Azure must return email for Supabase Auth account linking
  if (provider === 'azure') {
    options.scopes = 'email profile openid'
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options,
  })
  if (error) throw error
  return true
}

export async function signInMagic(email: string, nextPath = '/log') {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: getAuthRedirectUrl(nextPath) },
  })
  if (error) throw error
  return true
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Real premium check (prefers DB enrollment for logged in user, falls back to demo local)
export async function isPremium(): Promise<boolean> {
  if (
    typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'development' &&
    localStorage.getItem('mw_premium') === 'true'
  ) {
    return true;
  }
  const user = await getUser()
  if (!user || !supabaseUrl) return false
  const { data } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .or('premium_granted.eq.true,status.eq.active')
    .limit(1)
  if (data && data.length > 0) return true

  if (user.email) {
    const { data: byEmail } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_email', user.email)
      .or('premium_granted.eq.true,status.eq.active')
      .limit(1)
    return !!(byEmail && byEmail.length > 0)
  }
  return false
}

// --- Cloud Sync for Workouts & Nutrition (tied to authenticated user) ---
export type CloudWorkoutLog = {
  id?: string
  user_id: string
  workout_name: string
  started_at: string
  completed_at: string
  duration_seconds: number
  exercises: { exerciseId: string; sets: { reps: number; weight: number }[] }[]
  total_volume: number
}

export async function saveWorkoutLog(log: Omit<CloudWorkoutLog, 'user_id'>) {
  const user = await getUser()
  if (!user) return null
  const payload: CloudWorkoutLog = { ...log, user_id: user.id }
  const { data, error } = await supabase.from('workout_logs').insert(payload).select().single()
  if (error) { console.error('saveWorkoutLog error', error); return null }
  return data
}

export async function getUserWorkoutHistory(limit = 50): Promise<CloudWorkoutLog[]> {
  const user = await getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(limit)
  if (error) { console.error('getUserWorkoutHistory error', error); return [] }
  return data || []
}

export type CloudNutritionEntry = {
  id?: string
  user_id: string
  date: string // YYYY-MM-DD
  name: string
  protein: number
  cals: number
  carbs?: number
  fat?: number
  water_glasses?: number
}

export async function saveNutritionEntry(entry: Omit<CloudNutritionEntry, 'user_id'>) {
  const user = await getUser()
  if (!user) return null
  const payload: CloudNutritionEntry = { ...entry, user_id: user.id }
  const { data, error } = await supabase.from('nutrition_logs').insert(payload).select().single()
  if (error) { console.error('saveNutritionEntry error', error); return null }
  return data
}

export async function getUserNutritionForDate(date: string): Promise<CloudNutritionEntry[]> {
  const user = await getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)
  if (error) { console.error('getUserNutritionForDate error', error); return [] }
  return data || []
}

export async function getUserNutritionHistory(days = 7) {
  const user = await getUser()
  if (!user) return []
  const since = new Date()
  since.setDate(since.getDate() - days)
  const { data, error } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: false })
  if (error) { console.error('getUserNutritionHistory error', error); return [] }
  return data || []
}

/** Submit coaching inquiry or feedback to Supabase leads table (falls back to local-only). */
export async function submitLead(
  lead: Lead & {
    source?: string
    message?: string
    utm?: Record<string, string>
    referrer?: string
  }
): Promise<{ ok: boolean; localOnly?: boolean }> {
  const source = lead.source || lead.package_interest || 'general'
  const payload: Record<string, unknown> = {
    name: lead.name || 'Anonymous',
    email: lead.email,
    goals: lead.goals || lead.message || '',
    current_training: lead.current_training || '',
    // API schema prefers `source`; package_interest kept for local fallback shape.
    source,
    package_interest: source,
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('mw_attribution')
      if (raw) {
        const attr = JSON.parse(raw) as {
          utm_source?: string
          utm_medium?: string
          utm_campaign?: string
          utm_content?: string
          utm_term?: string
          landing_path?: string
          referrer?: string
        }
        payload.utm = {
          utm_source: attr.utm_source,
          utm_medium: attr.utm_medium,
          utm_campaign: attr.utm_campaign,
          utm_content: attr.utm_content,
          utm_term: attr.utm_term,
          landing_path: attr.landing_path,
        }
        if (attr.referrer) payload.referrer = attr.referrer
      }
    } catch {
      /* ignore */
    }
    if (lead.utm) payload.utm = { ...(payload.utm as object), ...lead.utm }
    if (lead.referrer) payload.referrer = lead.referrer
  }

  if (!supabaseUrl || supabaseUrl.includes('demo')) {
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('mw_leads') || '[]')
      localStorage.setItem('mw_leads', JSON.stringify([...existing, { ...payload, at: new Date().toISOString() }]))
    }
    return { ok: true, localOnly: true }
  }

  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.status === 202) {
      return { ok: true, localOnly: true }
    }

    if (!res.ok) {
      console.error('submitLead error', res.status)
      return { ok: false }
    }

    return { ok: true }
  } catch (e) {
    console.error('submitLead exception', e)
    return { ok: false }
  }
}