import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? "";
const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] ?? "";

let publicClientInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
}

export function getPublicSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!publicClientInstance) {
    publicClientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return publicClientInstance;
}
