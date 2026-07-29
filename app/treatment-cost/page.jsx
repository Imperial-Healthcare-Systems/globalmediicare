import fs from "node:fs";
import path from "node:path";
import Script from "next/script";
import { landingHtml } from "../../lib/renderTreatment";

// Treatment Cost landing — shared chrome (content/_head.html + _foot.html) wraps
// SSR-rendered content built from lib/treatmentCosts.js. /directory.js provides
// the drawer + the shared enquiry modal used by the "Get a Free Estimate" CTAs.
const dir = path.join(process.cwd(), "content");
const head = fs.readFileSync(path.join(dir, "_head.html"), "utf8");
const foot = fs.readFileSync(path.join(dir, "_foot.html"), "utf8");

export const metadata = {
  title: "Treatment Cost in India — Globalmediicare | Transparent Pricing",
  description:
    "Indicative, all-inclusive cost ranges for surgery and treatment in India across our accredited hospital network — typically 60–80% below US/UK prices. Free personalised estimate in 48 hours.",
  alternates: { canonical: "/treatment-cost" },
};

export default function TreatmentCostPage() {
  const html = head + landingHtml() + foot;
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <Script src="/directory.js" strategy="afterInteractive" />
    </>
  );
}
