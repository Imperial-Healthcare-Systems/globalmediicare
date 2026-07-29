// Server-side HTML renderers for the Treatment Cost pages. Output is wrapped by
// the shared chrome (content/_head.html + _foot.html) in the route files and
// injected as SSR HTML (good for SEO). All copy is Global Mediicare's own.
import { TREATMENTS, byCategory, getTreatment, related, usd, range } from "./treatmentCosts";

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const INCLUDED = [
  "Free medical opinion & itemised cost estimate",
  "Hospital & specialist doctor appointment booking",
  "Medical-visa invitation letter & documentation",
  "Airport pickup, accommodation & local transport",
  "Dedicated case manager & language interpreter",
  "90-day tele-follow-up after you return home",
];

function check() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
}

function faq(t) {
  const items = [
    ["Is this the final price?", `The range shown is indicative. Once our specialists review your medical reports we send an itemised, all-inclusive quote for your ${esc(t.name)} — usually within 48 hours — with no hidden charges.`],
    ["What does the estimate include?", "Your written quote covers the procedure and standard hospital stay. Global Mediicare separately arranges your visa, travel, accommodation, interpreter and case management — most of it free of charge."],
    ["How much can I save versus the US or UK?", "Patients typically save 60–80% against US and UK prices, at internationally accredited Indian hospitals and with no waiting lists."],
    ["How do I get started?", "Share your medical reports and we'll match you with the right hospital and surgeon, then confirm your cost and travel plan — all at no cost to you."],
  ];
  return `<div class="faqlist tcfaq">${items.map((f, i) => `
    <details class="faqi"${i === 0 ? " open" : ""}>
      <summary><span>${esc(f[0])}</span><span class="faqx"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><line class="vv" x1="12" y1="5" x2="12" y2="19"/></svg></span></summary>
      <div class="faqa"><p>${esc(f[1])}</p></div>
    </details>`).join("")}</div>`;
}

function card(t) {
  return `<a class="tccard rv" href="/treatment-cost/${t.slug}">
    <div class="tccard-h"><h3>${esc(t.name)}</h3><span class="tccard-cat">${esc(t.category)}</span></div>
    <p class="tccard-desc">${esc(t.description.length > 120 ? t.description.slice(0, 117) + "…" : t.description)}</p>
    <div class="tccard-f"><span class="tccard-cost">${esc(range(t.low, t.high))}</span><span class="tccard-go">View details
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></div>
  </a>`;
}

export function landingHtml() {
  const groups = byCategory();
  return `<main id="top">
<section class="dirhero" data-dark>
  <div class="wrap">
    <p class="eyebrow lt">Transparent Pricing</p>
    <h1 class="dirhero-h">Treatment Cost in India</h1>
    <p class="dirhero-sub">Indicative, all-inclusive cost ranges for leading treatments across our accredited hospital network — typically 60–80% below US and UK prices. Pick a treatment for a detailed breakdown, or get a free personalised estimate in 48 hours.</p>
    <div style="margin-top:1.6rem"><button type="button" class="btn btn-gold" data-q="treatment" data-qname="Treatment cost estimate">Get a Free Cost Estimate</button></div>
  </div>
</section>
<section class="dirsec"><div class="wrap">
  ${groups.map((g) => `<div class="tcgroup rv">
    <h2 class="tcgroup-h">${esc(g.category)}</h2>
    <div class="tcgrid">${g.items.map(card).join("")}</div>
  </div>`).join("")}
</div></section>
<section class="dircta" data-dark><div class="wrap dircta-in">
  <div><h2>Get your exact treatment cost</h2><p>Share your medical reports and receive a written, all-inclusive quote — hospital, doctor and travel included — within 48 hours, free of charge.</p></div>
  <button type="button" class="btn btn-gold" data-q="treatment" data-qname="Treatment cost estimate">Get a Free Estimate</button>
</div></section>
</main>`;
}

export function treatmentHtml(t) {
  const rows = (t.variants && t.variants.length ? t.variants : [{ name: "Standard procedure", low: t.low, high: t.high }]);
  const rel = related(t);
  return `<main id="top">
<section class="dirhero tchero" data-dark>
  <div class="wrap">
    <nav class="tcbread" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/treatment-cost">Treatment Cost</a><span>/</span><b>${esc(t.name)}</b></nav>
    <p class="eyebrow lt">${esc(t.category)}</p>
    <h1 class="dirhero-h">${esc(t.name)} Cost in India</h1>
    <p class="dirhero-sub">${esc(t.description)}</p>
    <div class="tchero-cost"><span class="tchero-cost-l">Estimated cost in India</span><span class="tchero-cost-v">${esc(range(t.low, t.high))}</span></div>
    <div style="margin-top:1.4rem"><button type="button" class="btn btn-gold" data-q="treatment" data-qname="${esc(t.name)}">Get a Free Cost Estimate</button></div>
  </div>
</section>

<section class="dirsec"><div class="wrap tclayout">
  <div class="tcmain">
    <div class="tcblock rv">
      <h2>${esc(t.name)} — cost breakdown</h2>
      <div class="tctable-wrap"><table class="tctable">
        <thead><tr><th>Procedure / variant</th><th>Estimated cost (USD)</th></tr></thead>
        <tbody>${rows.map((v) => `<tr><td>${esc(v.name)}</td><td class="tctable-cost">${esc(range(v.low, v.high))}</td></tr>`).join("")}</tbody>
      </table></div>
      <p class="tcnote">Ranges are indicative and depend on the hospital, city and individual case. Your written quote is confirmed after a medical review — usually within 48 hours.</p>
    </div>

    <div class="tcblock rv">
      <h2>What affects the cost</h2>
      <ul class="tcfactors">${t.factors.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
    </div>

    <div class="tcblock rv">
      <h2>Treatment timeline</h2>
      <div class="tctimeline">
        <div class="tctime"><span class="tctime-v">${esc(t.hospitalStay)}</span><span class="tctime-l">Hospital / procedure stay</span></div>
        <div class="tctime"><span class="tctime-v">${esc(t.totalDays)}</span><span class="tctime-l">Recommended time in country</span></div>
      </div>
    </div>

    <div class="tcblock rv">
      <h2>What Global Mediicare includes</h2>
      <ul class="tcincl">${INCLUDED.map((i) => `<li><span class="ck">${check()}</span>${esc(i)}</li>`).join("")}</ul>
      <p class="tcnote">Estimates cover the medical procedure and standard hospital stay. Flights, personal expenses and treatment for any unrelated or unforeseen complications are additional and confirmed upfront in your written quote.</p>
    </div>

    <div class="tcblock rv">
      <h2>Why patients choose India with Global Mediicare</h2>
      <p>Every year, patients from 40+ countries travel to India for world-class ${esc(t.name.toLowerCase())} — at internationally accredited (JCI / NABH) hospitals, with highly experienced surgeons and no waiting lists, for a fraction of Western prices. Global Mediicare manages the entire journey: hospital and doctor selection, cost estimates, medical visa, travel, stay and aftercare — so you can focus on getting well.</p>
    </div>

    <div class="tcblock rv">
      <h2>Frequently asked questions</h2>
      ${faq(t)}
    </div>
  </div>

  <aside class="tcside">
    <div class="tccta-card rv">
      <p class="eyebrow lt">Free · No obligation</p>
      <h3>Get your exact quote</h3>
      <p>Send your reports for an itemised, all-inclusive estimate in 48 hours.</p>
      <button type="button" class="btn btn-gold" data-q="treatment" data-qname="${esc(t.name)}">Get a Free Estimate</button>
      <a class="tccta-wa" href="https://wa.me/919651049119" target="_blank" rel="noopener">or chat on WhatsApp</a>
    </div>
    <div class="tcfacts rv">
      <h4>Quick facts</h4>
      <dl>
        <dt>Category</dt><dd>${esc(t.category)}</dd>
        <dt>Cost in India</dt><dd>${esc(range(t.low, t.high))}</dd>
        <dt>Hospital stay</dt><dd>${esc(t.hospitalStay)}</dd>
        <dt>Time in country</dt><dd>${esc(t.totalDays)}</dd>
      </dl>
    </div>
    ${rel.length ? `<div class="tcrel rv"><h4>Related treatments</h4>${rel.map((r) => `<a href="/treatment-cost/${r.slug}"><span>${esc(r.name)}</span><span class="tcrel-c">${esc(range(r.low, r.high))}</span></a>`).join("")}</div>` : ""}
  </aside>
</div></section>
</main>`;
}

export function allSlugs() { return TREATMENTS.map((t) => t.slug); }
export { getTreatment };
