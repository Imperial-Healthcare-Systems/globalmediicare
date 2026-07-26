import fs from "node:fs";
import path from "node:path";
import Script from "next/script";

// Listing page — shared chrome (content/_head.html + _foot.html) wraps the
// page body (content/doctors.html); /directory.js renders the cards and wires
// search + filters. Same "inline HTML + vanilla engine" approach as the home page.
const dir = path.join(process.cwd(), "content");
const html =
  fs.readFileSync(path.join(dir, "_head.html"), "utf8") +
  fs.readFileSync(path.join(dir, "doctors.html"), "utf8") +
  fs.readFileSync(path.join(dir, "_foot.html"), "utf8");

export const metadata = {
  title: "Find a Doctor — Globalmediicare | International Specialists",
  description:
    "Browse board-certified specialists across our global hospital network. Filter by specialty and country, then request a free medical opinion.",
  alternates: { canonical: "/doctors" },
};

export default function DoctorsPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <Script src="/directory.js" strategy="afterInteractive" />
    </>
  );
}
