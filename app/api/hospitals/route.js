// Public read endpoint powering /hospitals. Returns Supabase data when
// configured, otherwise the bundled seed. Dynamic so admin edits show at once.
import { getSupabaseServer } from "../../../lib/supabase";
import { SEED_HOSPITALS } from "../../../lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = getSupabaseServer();
  if (sb) {
    const { data, error } = await sb
      .from("hospitals")
      .select("name,city,country,image_url,accreditation,beds,established,specialties")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (!error && data) {
      return Response.json({ source: "supabase", hospitals: data });
    }
  }
  return Response.json({ source: "seed", hospitals: SEED_HOSPITALS });
}
