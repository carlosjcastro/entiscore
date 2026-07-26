import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? "";
const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";

let serverClientInstance: SupabaseClient | null = null;

export function isServerSupabaseConfigured(): boolean {
  return supabaseUrl.length > 0 && serviceRoleKey.length > 0;
}

export function getServerSupabase(): SupabaseClient | null {
  if (!isServerSupabaseConfigured()) return null;
  if (!serverClientInstance) {
    serverClientInstance = createClient(supabaseUrl, serviceRoleKey);
  }
  return serverClientInstance;
}
