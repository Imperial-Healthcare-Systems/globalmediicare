import fs from "node:fs";
import path from "node:path";

// Standalone oncology landing page (campaign / direct-link only — intentionally
// NOT linked from the site nav). Served as a self-contained HTML document via a
// route handler so it bypasses the shared root layout and globals.css entirely,
// keeping its own <head>, <style> and <script> fully isolated from the main site.
// Source: content/lp-oncology-treatment-india.html
export const dynamic = "force-static";

const html = fs.readFileSync(
  path.join(process.cwd(), "content", "lp-oncology-treatment-india.html"),
  "utf8"
);

export function GET() {
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
