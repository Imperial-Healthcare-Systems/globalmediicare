import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getTreatment, treatmentHtml, allSlugs } from "../../../lib/renderTreatment";
import { range } from "../../../lib/treatmentCosts";

const dir = path.join(process.cwd(), "content");
const head = fs.readFileSync(path.join(dir, "_head.html"), "utf8");
const foot = fs.readFileSync(path.join(dir, "_foot.html"), "utf8");

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const t = getTreatment(params.slug);
  if (!t) return { title: "Treatment Cost — Globalmediicare" };
  return {
    title: `${t.name} Cost in India — Globalmediicare | ${range(t.low, t.high)}`,
    description: `${t.name} cost in India: ${range(t.low, t.high)}. ${t.description} Includes visa, travel and case management with Globalmediicare.`,
    alternates: { canonical: `/treatment-cost/${t.slug}` },
  };
}

export default function TreatmentDetailPage({ params }) {
  const t = getTreatment(params.slug);
  if (!t) notFound();
  const html = head + treatmentHtml(t) + foot;
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <Script src="/directory.js" strategy="afterInteractive" />
    </>
  );
}
