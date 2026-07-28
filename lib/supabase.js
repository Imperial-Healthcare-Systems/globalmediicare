// Supabase client helpers. The public anon key is safe to expose to the browser;
// row-level security (see db/schema.sql) is what actually protects writes.
//
// Configure in .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=...
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
//
// When these are absent, isSupabaseConfigured() returns false and callers fall
// back to the bundled seed data — so the site works before Supabase is wired.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

// One shared client per runtime. Auth session persistence is enabled so the
// admin panel keeps you logged in across reloads (browser only).
let _client = null;
export function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (_client) return _client;
  _client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return _client;
}

// Stateless client for server-side reads (API routes) — no session storage.
export function getSupabaseServer() {
  if (!isSupabaseConfigured()) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
