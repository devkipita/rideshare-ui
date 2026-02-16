import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type SupabaseAdminClient = SupabaseClient<any, "public", any>;

const globalForSupabase = globalThis as typeof globalThis & {
  __supabaseAdmin?: SupabaseAdminClient;
};

export const supabaseAdmin =
  globalForSupabase.__supabaseAdmin ??
  createClient<any>(supabaseUrl, serviceRoleKey);

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.__supabaseAdmin = supabaseAdmin;
}
