-- ============================================================================
-- Global Mediicare — News & Blogs (posts) schema
-- Run this ONCE in the Supabase SQL editor (additive; run after schema.sql).
-- Safe to re-run: IF NOT EXISTS / idempotent policy drops.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Table
-- ----------------------------------------------------------------------------
create table if not exists public.posts (
  id           uuid        primary key default gen_random_uuid(),
  title        text        not null,
  slug         text        not null unique,             -- URL: /news/<slug>
  category     text        not null default 'News',     -- News | Blog | Guide | Patient Story
  excerpt      text        not null default '',          -- short summary (card + meta description)
  body         text        not null default '',          -- article content, Markdown
  cover_url    text,                                      -- optional hero image
  author       text        not null default 'Globalmediicare',
  tags         text[]      not null default '{}',
  published    boolean     not null default true,         -- unpublished = draft (hidden from public)
  published_at timestamptz not null default now(),        -- publish date (drives ordering)
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists posts_published_idx on public.posts (published, published_at desc);

-- ----------------------------------------------------------------------------
-- updated_at trigger (touch_updated_at may already exist from schema.sql)
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
--   • anyone (anon) may READ published posts  -> public /news pages
--   • signed-in users (admin) may READ everything (incl. drafts) and WRITE
-- ----------------------------------------------------------------------------
alter table public.posts enable row level security;

drop policy if exists "posts_read"  on public.posts;
drop policy if exists "posts_write" on public.posts;
create policy "posts_read" on public.posts for select
  using (published = true or auth.role() = 'authenticated');
create policy "posts_write" on public.posts for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- Seed data (matches lib/seed.js SEED_POSTS). Runs only when the table is empty.
-- Original, generic editorial copy — edit or delete via the admin panel.
-- ----------------------------------------------------------------------------
insert into public.posts (title, slug, category, excerpt, body, author, tags, published, published_at, sort_order)
select * from (values
  (
    'What to Prepare Before Travelling to India for Treatment',
    'prepare-before-travelling-to-india-for-treatment',
    'Guide',
    'A practical checklist for international patients — documents, medical records, visa steps and what to pack for a smooth medical journey.',
    E'Planning treatment abroad can feel overwhelming. A little preparation goes a long way toward a calm, well-organised journey.\n\n## Gather your medical records\n\nCollect recent reports, scans and prescriptions in one folder — digital copies are ideal. Sharing these early lets the treating hospital give an accurate opinion and estimate before you travel.\n\n## Documents and visa\n\n- A passport valid for at least six months\n- Your medical visa invitation letter from the hospital\n- Copies of prior diagnoses and discharge summaries\n\nOur care team helps arrange the invitation letter and guides you through the medical visa application.\n\n## What to pack\n\nBring comfortable clothing, a list of current medications, and any assistive devices you use daily. Keep essentials and documents in your cabin bag.\n\n> Tip: share your reports with us before booking flights — an early opinion helps you plan dates around the recommended treatment.',
    'Globalmediicare Care Team',
    array['travel','planning','medical visa'],
    true,
    '2026-08-05T09:00:00Z'::timestamptz,
    1
  ),
  (
    'Understanding the Cost of Cancer Care Abroad',
    'understanding-the-cost-of-cancer-care-abroad',
    'Blog',
    'How oncology treatment estimates are built, what affects the final figure, and why an itemised quote matters for international patients.',
    E'Cost is one of the first questions patients ask — and one of the most important to get right.\n\n## Why estimates vary\n\nEvery cancer case is different. The final figure depends on the stage, the recommended protocol, the length of stay and the specific hospital. That is why a genuine estimate always follows a review of your medical reports.\n\n## What a good estimate includes\n\n- Consultation and diagnostic workup\n- The core treatment (surgery, chemotherapy, radiation or a combination)\n- Hospital stay and supportive care\n- A clear note of what is **not** included\n\n## Ask for it in writing\n\nAn itemised, written estimate lets you compare options with confidence and avoid surprises. Our team helps you obtain and understand these estimates at no charge.',
    'Globalmediicare Editorial',
    array['oncology','cost','estimates'],
    true,
    '2026-07-22T09:00:00Z'::timestamptz,
    2
  ),
  (
    'Globalmediicare Expands Its International Hospital Network',
    'globalmediicare-expands-international-hospital-network',
    'News',
    'We continue to grow our network of accredited hospitals across India, Turkey, the UAE, Thailand, Germany and Egypt to give patients more choice.',
    E'We are pleased to share that our network of accredited partner hospitals continues to grow across six countries.\n\nThis means more choice for international patients — a wider range of specialists, destinations and price points, all coordinated through a single care team.\n\n## More choice, same support\n\nEvery hospital in our network is selected for accreditation, clinical outcomes and international patient experience. Whichever destination you choose, our coordination — from first opinion to recovery — stays free of charge.\n\nExplore the [hospitals directory](/hospitals) or [request a free medical opinion](/#consult) to get started.',
    'Globalmediicare',
    array['announcement','network'],
    true,
    '2026-07-10T09:00:00Z'::timestamptz,
    3
  )
) as v(title, slug, category, excerpt, body, author, tags, published, published_at, sort_order)
where not exists (select 1 from public.posts);
