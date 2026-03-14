import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for API routes and server components.
 * Uses SUPABASE_SERVICE_ROLE_KEY when set; otherwise anon key.
 * Never use this in client components — use lib/supabase/client.ts there.
 */
export const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
