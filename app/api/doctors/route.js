// Public read endpoint powering /doctors. Returns Supabase data when configured,
// otherwise the bundled seed so the page always renders. Dynamic (never cached)
// so admin edits show immediately.
import { getSupabaseServer } from "../../../lib/supabase";
import { SEED_DOCTORS } from "../../../lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = getSupabaseServer();
  if (sb) {
    const { data, error } = await sb
      .from("doctors")
      .select("name,designation,specialty,experience,hospital,city,country,photo_url")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (!error && data) {
      return Response.json({ source: "supabase", doctors: data });
    }
  }
  return Response.json({ source: "seed", doctors: SEED_DOCTORS });
}
