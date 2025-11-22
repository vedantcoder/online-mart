import { createClient } from "@supabase/supabase-js";

// Server-side Supabase admin client (DO NOT import in client components)
// Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in environment.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log clearly if misconfigured, but do not throw on import.
if (!supabaseUrl) {
  console.error(
    "❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please add it to your .env.local file."
  );
}

if (!serviceRoleKey) {
  console.error(
    "❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Please get your Service Role Key from Supabase Dashboard > Project Settings > API and add it to your .env.local file."
  );
}

// Fallback client if env vars missing; API routes should still validate
export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  serviceRoleKey || "placeholder-key",
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);
