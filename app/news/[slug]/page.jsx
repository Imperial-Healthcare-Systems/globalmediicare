import fs from "node:fs";
import path from "node:path";
import Script from "next/script";
import { notFound } from "next/navigation";
import { getPostBySlug, renderArticle } from "../../../lib/posts";

// Single article. Server-rendered from Supabase/seed by slug; 404 on unknown or
// unpublished slug. Dynamic so newly published posts resolve immediately.
export const dynamic = "force-dynamic";

const dir = path.join(process.cwd(), "content");
const HEAD = fs.readFileSync(path.join(dir, "_head.html"), "utf8");
const FOOT = fs.readFileSync(path.join(dir, "_foot.html"), "utf8");

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found — Globalmediicare" };
  const title = `${post.title} — Globalmediicare`;
  const description = post.excerpt || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/news/${post.slug}`,
      images: post.cover_url ? [{ url: post.cover_url }] : undefined,
    },
  };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const cta =
    `<section class="dircta" data-dark><div class="wrap dircta-in">` +
    `<div><h2>Ready to explore your options?</h2>` +
    `<p>Get a free medical opinion and an indicative estimate from our accredited hospital network.</p></div>` +
    `<a href="/#consult" class="btn btn-gold">Get a Free Medical Opinion</a>` +
    `</div></section>`;

  const html =
    HEAD + `<main id="top">` + renderArticle(post) + cta + `</main>` + FOOT;

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <Script src="/directory.js" strategy="afterInteractive" />
    </>
  );
}
