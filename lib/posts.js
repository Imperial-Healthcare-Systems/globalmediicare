// News & Blogs data access + SSR HTML builders.
// Data comes from Supabase when configured, otherwise the bundled SEED_POSTS
// (so /news renders before the backend is wired). Article bodies are authored
// as Markdown in the admin panel and rendered to safe HTML here — no client
// libraries, and every author-supplied value is HTML-escaped.
import { getSupabaseServer } from "./supabase";
import { SEED_POSTS } from "./seed";

const LIST_COLS =
  "title,slug,category,excerpt,cover_url,author,tags,published,published_at";

function bySeedDate(a, b) {
  return new Date(b.published_at) - new Date(a.published_at);
}

// Published posts, newest first.
export async function getPosts() {
  const sb = getSupabaseServer();
  if (sb) {
    const { data, error } = await sb
      .from("posts")
      .select(LIST_COLS)
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (!error && data) return { source: "supabase", posts: data };
  }
  const posts = SEED_POSTS.filter((p) => p.published !== false)
    .slice()
    .sort(bySeedDate);
  return { source: "seed", posts };
}

// A single published post by slug, or null.
export async function getPostBySlug(slug) {
  const sb = getSupabaseServer();
  if (sb) {
    const { data, error } = await sb
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    // No error → authoritative (data or a genuine 404). On error (e.g. the
    // posts table isn't migrated yet) fall through to the bundled seed.
    if (!error) return data || null;
  }
  return SEED_POSTS.find((p) => p.slug === slug && p.published !== false) || null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function readingTime(body) {
  const words = String(body || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Reject dangerous URL schemes; allow http(s), mailto, tel and site-relative.
function safeUrl(raw) {
  const u = String(raw || "").trim();
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(u)) return u;
  return "";
}

// Minimal, dependency-free Markdown -> safe HTML.
// Supports: ## / ### headings, - and 1. lists, > blockquotes, images,
// paragraphs, and inline **bold**, *italic*, `code`, [links](url).
export function renderMarkdown(md) {
  const blocks = String(md || "").replace(/\r\n/g, "\n").split(/\n{2,}/);
  const html = blocks.map((raw) => {
    const block = raw.trim();
    if (!block) return "";

    // Standalone image: ![alt](url)
    const img = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) {
      const url = safeUrl(img[2]);
      if (!url) return "";
      return `<figure class="post-figure"><img src="${esc(url)}" alt="${esc(img[1])}" loading="lazy"></figure>`;
    }

    // Headings
    let m;
    if ((m = block.match(/^###\s+(.*)$/))) return `<h3>${inline(m[1])}</h3>`;
    if ((m = block.match(/^##\s+(.*)$/))) return `<h2>${inline(m[1])}</h2>`;
    if ((m = block.match(/^#\s+(.*)$/))) return `<h2>${inline(m[1])}</h2>`;

    const lines = block.split("\n");

    // Unordered list
    if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*]\s+/, ""))}</li>`).join("")}</ul>`;
    }
    // Ordered list
    if (lines.every((l) => /^\s*\d+\.\s+/.test(l))) {
      return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+\.\s+/, ""))}</li>`).join("")}</ol>`;
    }
    // Blockquote
    if (lines.every((l) => /^\s*>\s?/.test(l))) {
      return `<blockquote>${inline(lines.map((l) => l.replace(/^\s*>\s?/, "")).join(" "))}</blockquote>`;
    }
    // Paragraph (single newlines -> <br>)
    return `<p>${lines.map((l) => inline(l)).join("<br>")}</p>`;
  });
  return html.filter(Boolean).join("\n");
}

// Inline formatting. Input is escaped first so any raw HTML is inert.
function inline(text) {
  let s = esc(text);
  // images (before links) ![alt](url)
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (all, alt, url) => {
    const u = safeUrl(url);
    return u ? `<img src="${u}" alt="${alt}" loading="lazy">` : alt;
  });
  // links [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (all, label, url) => {
    const u = safeUrl(url);
    if (!u) return label;
    const external = /^https?:/i.test(u);
    const rel = external ? ' target="_blank" rel="noopener"' : "";
    return `<a href="${u}"${rel}>${label}</a>`;
  });
  // bold, italic, code
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  return s;
}

const CAT_CLASS = (c) =>
  "cat-" + String(c || "news").toLowerCase().replace(/[^a-z0-9]+/g, "-");

// Listing grid of post cards.
export function renderPostCards(posts) {
  if (!posts.length) {
    return `<p class="dircount">No articles published yet. Please check back soon.</p>`;
  }
  return (
    `<div class="postgrid rv">` +
    posts
      .map((p, i) => {
        const href = `/news/${esc(p.slug)}`;
        const media = p.cover_url
          ? `<img src="${esc(p.cover_url)}" alt="${esc(p.title)}" loading="lazy">`
          : `<span class="postcard-mono" aria-hidden="true">${esc((p.category || "News")[0])}</span>`;
        return (
          `<article class="postcard d${(i % 3) + 1}">` +
          `<a class="postcard-media ${CAT_CLASS(p.category)}" href="${href}">${media}` +
          `<span class="postcard-cat">${esc(p.category || "News")}</span></a>` +
          `<div class="postcard-b">` +
          `<div class="postcard-meta"><span>${esc(fmtDate(p.published_at))}</span><span>·</span><span>${readingTime(p.body || p.excerpt)} min read</span></div>` +
          `<h3><a href="${href}">${esc(p.title)}</a></h3>` +
          `<p>${esc(p.excerpt)}</p>` +
          `<a class="postcard-more" href="${href}">Read article <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>` +
          `</div></article>`
        );
      })
      .join("") +
    `</div>`
  );
}

// Full article body for the single-post page.
export function renderArticle(post) {
  const tags = Array.isArray(post.tags) ? post.tags.filter(Boolean) : [];
  const cover = post.cover_url
    ? `<div class="post-cover"><img src="${esc(post.cover_url)}" alt="${esc(post.title)}"></div>`
    : "";
  const tagHtml = tags.length
    ? `<div class="post-tags">${tags.map((t) => `<span class="post-tag">#${esc(t)}</span>`).join("")}</div>`
    : "";
  return (
    `<article class="post">` +
    `<div class="wrap post-head">` +
    `<a class="post-back" href="/news"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> All News &amp; Blogs</a>` +
    `<span class="post-cat ${CAT_CLASS(post.category)}">${esc(post.category || "News")}</span>` +
    `<h1>${esc(post.title)}</h1>` +
    `<div class="post-byline"><span>${esc(post.author || "Globalmediicare")}</span><span>·</span><span>${esc(fmtDate(post.published_at))}</span><span>·</span><span>${readingTime(post.body)} min read</span></div>` +
    `</div>` +
    cover +
    `<div class="wrap post-body">${renderMarkdown(post.body)}${tagHtml}</div>` +
    `</article>`
  );
}
