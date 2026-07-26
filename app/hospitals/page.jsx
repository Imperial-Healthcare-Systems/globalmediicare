import fs from "node:fs";
import path from "node:path";
import Script from "next/script";

// Listing page — shared chrome (content/_head.html + _foot.html) wraps the
// page body (content/hospitals.html); /directory.js renders the cards and wires
// search + filters. Same "inline HTML + vanilla engine" approach as the home page.
const dir = path.join(process.cwd(), "content");
const html =
  fs.readFileSync(path.join(dir, "_head.html"), "utf8") +
  fs.readFileSync(path.join(dir, "hospitals.html"), "utf8") +
  fs.readFileSync(path.join(dir, "_foot.html"), "utf8");

export const metadata = {
  title: "Accredited Hospitals — Globalmediicare | Global Network",
  description:
    "Explore internationally accredited hospitals across six countries. Filter by country, specialty and accreditation, then get a free treatment quote.",
  alternates: { canonical: "/hospitals" },
};

export default function HospitalsPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <Script src="/directory.js" strategy="afterInteractive" />
    </>
  );
}
