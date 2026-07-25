import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseAuthEnabled =
  (import.meta.env.VITE_AUTH_PROVIDER as string | undefined)?.toLowerCase() ===
    'supabase' &&
  Boolean(url && anon);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseAuthEnabled || !url || !anon) return null;
  if (!client) {
    client = createClient(url, anon);
  }
  return client;
}
