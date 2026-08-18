import fs from "node:fs";
import path from "node:path";

// Standalone heart-surgery campaign landing page (direct-link only — not in the
// site nav). Served as a self-contained HTML document via a route handler so it
// bypasses the root layout + globals.css, keeping its own design fully isolated.
// The form POSTs to /api/consult (email + admin Enquiries) then redirects to
// /heart-surgery/thank-you.
// Source: content/lp-heart-surgery.html
export const dynamic = "force-static";

const html = fs.readFileSync(
  path.join(process.cwd(), "content", "lp-heart-surgery.html"),
  "utf8"
);

export function GET() {
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
