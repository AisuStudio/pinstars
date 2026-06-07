import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client. Uses the SECRET key, which bypasses RLS.
 * MUST only be imported in server code (API routes / server components) —
 * never in client components, or the secret leaks to the browser.
 */
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY env var",
    );
  }
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
