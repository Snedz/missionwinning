import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type Session, type User } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const WEB_APP_URL =
  (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_WEB_APP_URL) ||
  (extra.webAppUrl as string) ||
  'https://www.missionwinning.com';

const supabaseUrl =
  (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_SUPABASE_URL) || '';
const supabaseAnonKey =
  (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) || '';

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes('demo.supabase.co');

export const supabase = createClient(
  supabaseUrl || 'https://demo.supabase.co',
  supabaseAnonKey || 'demo-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export type { Session, User };
