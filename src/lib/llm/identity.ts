import 'server-only';

/**
 * Who is asking for LLM spend — resolved BEFORE any premium short-circuit.
 *
 * The structural hole this closes: every LLM route checked
 * `isPremiumBypassEnabled()` first and, under the free beta (bypass true by
 * default), returned before ever resolving a user — so the exact branch that
 * spends money was the one branch with no idea who it was spending it on.
 * Metering keyed on nothing meters nobody.
 *
 * This helper always resolves the Supabase user when a session cookie exists,
 * *then* answers the premium question (`bypass || isPremiumForUser`), so route
 * behavior is unchanged while identity becomes unconditionally available for
 * the quota key and the `llm_usage` row. The cost is one auth round-trip on
 * the bypass path, and only on LLM routes.
 */

import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { isPremiumBypassEnabled, isPremiumForUser } from '@/lib/premiumServer';
import { clientIp } from '@/lib/clientIp';
import type { LlmCallerIdentity } from '@/lib/llm/meteringRow';

export interface LlmCaller extends LlmCallerIdentity {
  email: string | null;
  premium: boolean;
}

export async function resolveLlmCaller(
  request: NextRequest,
  deviceId?: string | null
): Promise<LlmCaller> {
  const ip = clientIp(request);
  let userId: string | null = null;
  let email: string | null = null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anon) {
    const accessToken = extractSupabaseAccessToken(request.cookies);
    if (accessToken) {
      try {
        const supabase = createClient(url, anon);
        const {
          data: { user },
        } = await supabase.auth.getUser(accessToken);
        if (user) {
          userId = user.id;
          email = user.email ?? null;
        }
      } catch {
        // Auth outage must not take the rules engine down with it — the caller
        // simply stays anonymous (device/ip metering still applies).
      }
    }
  }

  let premium = isPremiumBypassEnabled();
  if (!premium && userId) {
    premium = await isPremiumForUser(userId, email);
  }

  return {
    userId,
    email,
    deviceId: deviceId?.trim() ? deviceId.trim().slice(0, 64) : null,
    ip,
    premium,
  };
}
