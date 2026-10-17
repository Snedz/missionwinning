/**
 * Owner writes for the Garage name.
 *
 * The device call sign is pushed only when it already matches the column
 * check and the profile handle is still empty. A later edit on this screen
 * is not overwritten. `full_name` is never selected here.
 */

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { readChatCallSign } from '@/lib/social/callSign';
import {
  callSignToSync,
  isGarageCallSign,
  type GarageNameMode,
} from '@/lib/social/authorStamp';

export type GarageIdentity = {
  callSign: string;
  mode: GarageNameMode;
};

export type GarageWriteResult = 'ok' | 'invalid' | 'taken' | 'failed';

async function ownerId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function loadGarageIdentity(): Promise<GarageIdentity | null> {
  const userId = await ownerId();
  if (!userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('call_sign, garage_name_mode')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    callSign: typeof data.call_sign === 'string' ? data.call_sign : '',
    mode: data.garage_name_mode === 'real_name' ? 'real_name' : 'call_sign',
  };
}

/**
 * Fill `profiles.call_sign` from this device when the column is still empty.
 * Returns false when there is nothing to write or the write did not land.
 */
export async function syncDeviceCallSign(): Promise<boolean> {
  const next = callSignToSync(readChatCallSign());
  if (!next) return false;
  const userId = await ownerId();
  if (!userId) return false;
  const { data, error } = await supabase
    .from('profiles')
    .select('call_sign')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return false;
  if (typeof data.call_sign === 'string' && data.call_sign.length > 0) return false;
  const { error: writeError } = await supabase
    .from('profiles')
    .update({ call_sign: next })
    .eq('id', userId);
  return !writeError;
}

export async function saveGarageCallSign(raw: string): Promise<GarageWriteResult> {
  const userId = await ownerId();
  if (!userId) return 'failed';
  const trimmed = raw.trim();
  const value = trimmed.length === 0 ? null : trimmed;
  if (value !== null && !isGarageCallSign(value)) return 'invalid';
  const { data, error } = await supabase
    .from('profiles')
    .update({ call_sign: value })
    .eq('id', userId)
    .select('id')
    .maybeSingle();
  if (error?.code === '23505') return 'taken';
  if (error || !data) return 'failed';
  return 'ok';
}

export async function saveGarageNameMode(mode: GarageNameMode): Promise<Exclude<GarageWriteResult, 'invalid' | 'taken'>> {
  const userId = await ownerId();
  if (!userId) return 'failed';
  const { data, error } = await supabase
    .from('profiles')
    .update({ garage_name_mode: mode })
    .eq('id', userId)
    .select('id')
    .maybeSingle();
  if (error || !data) return 'failed';
  return 'ok';
}
