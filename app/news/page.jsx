import fs from "node:fs";
import path from "node:path";
import Script from "next/script";
import { getPosts, renderPostCards } from "../../lib/posts";

// News & Blogs listing. Server-rendered (SEO-friendly) from Supabase/seed, then
// wrapped in the shared site chrome (_head/_foot) and hydrated by directory.js
// (drawer, sticky header, reveal, enquiry modal). Dynamic so new posts appear
// as soon as they're published from the admin panel.
export const dynamic = "force-dynamic";

const dir = path.join(process.cwd(), "content");
const HEAD = fs.readFileSync(path.join(dir, "_head.html"), "utf8");
const FOOT = fs.readFileSync(path.join(dir, "_foot.html"), "utf8");

export const metadata = {
  title: "News & Blogs — Globalmediicare | Medical Travel Insights",
  description:
    "Guides, news and articles on medical travel — preparing for treatment abroad, understanding costs, and updates from Globalmediicare's hospital network.",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  const { posts } = await getPosts();

  const body =
    `<main id="top">` +
    `<section class="dirhero" data-dark>` +
    `<div class="dirhero-bg" aria-hidden="true"></div>` +
    `<div class="wrap">` +
    `<p class="eyebrow lt">News &amp; Blogs</p>` +
    `<h1 class="dirhero-h">Insights for Your Medical Journey</h1>` +
    `<p class="dirhero-sub">Practical guides, cost explainers and updates from our team — to help international patients plan treatment abroad with clarity and confidence.</p>` +
    `</div>` +
    `</section>` +
    `<section class="dirsec"><div class="wrap">` +
    renderPostCards(posts) +
    `</div></section>` +
    `<section class="dircta" data-dark><div class="wrap dircta-in">` +
    `<div><h2>Have a question about treatment abroad?</h2>` +
    `<p>Share your reports and our care team will guide you — free of charge, within 48 hours.</p></div>` +
    `<a href="/#consult" class="btn btn-gold">Get a Free Medical Opinion</a>` +
    `</div></section>` +
    `</main>`;

  const html = HEAD + body + FOOT;

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <Script src="/directory.js" strategy="afterInteractive" />
    </>
  );
}
