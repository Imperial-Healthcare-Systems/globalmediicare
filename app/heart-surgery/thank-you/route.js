import fs from "node:fs";
import path from "node:path";

// Thank-you page for the heart-surgery landing form. The form POSTs to
// /api/consult then redirects here — a real page URL that GTM/Ads can fire a
// conversion on. Served as a standalone HTML document (bypasses the root layout).
// Source: content/lp-heart-surgery-thank-you.html
export const dynamic = "force-static";

const html = fs.readFileSync(
  path.join(process.cwd(), "content", "lp-heart-surgery-thank-you.html"),
  "utf8"
);

export function GET() {
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
