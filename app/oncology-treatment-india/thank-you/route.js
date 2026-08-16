import fs from "node:fs";
import path from "node:path";

// Thank-you page for the oncology landing form. The form POSTs to /api/consult,
// then redirects here — giving a real page URL that GTM/Ads can fire a
// conversion on. Served as a standalone HTML document (same isolation approach
// as the landing page: bypasses the root layout + globals.css).
// Source: content/lp-oncology-thank-you.html
export const dynamic = "force-static";

const html = fs.readFileSync(
  path.join(process.cwd(), "content", "lp-oncology-thank-you.html"),
  "utf8"
);

export function GET() {
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
