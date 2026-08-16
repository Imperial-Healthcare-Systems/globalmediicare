-- ============================================================================
-- Global Mediicare — Enquiries (leads) schema
-- Run this ONCE in the Supabase SQL editor (additive; run after schema.sql).
-- Stores every enquiry submitted from the site forms + the oncology landing
-- page, so they're viewable in the admin panel (in addition to the SMTP email).
-- Safe to re-run: IF NOT EXISTS / idempotent policy drops.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Table
-- ----------------------------------------------------------------------------
create table if not exists public.leads (
  id             uuid        primary key default gen_random_uuid(),
  source         text        not null default 'inline',  -- inline | modal | oncology-landing | …
  name           text        not null default '',
  email          text        not null default '',
  phone          text        not null default '',
  dial_code      text        not null default '',
  country        text        not null default '',
  treatment      text        not null default '',        -- treatment / condition sought
  stage          text        not null default '',        -- (oncology landing) cancer stage
  destination    text        not null default '',        -- preferred hospital / country
  preferred_date text        not null default '',
  preferred_slot text        not null default '',
  message        text        not null default '',
  status         text        not null default 'new',      -- new | contacted | closed
  created_at     timestamptz not null default now()
);

create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_status_idx  on public.leads (status);

-- ----------------------------------------------------------------------------
-- Row Level Security
--   • anyone (anon) may INSERT  -> public contact forms can submit a lead
--   • only signed-in users (admin) may READ / UPDATE / DELETE -> admin panel
--   (no public SELECT: enquiries are private and never exposed to the site)
-- ----------------------------------------------------------------------------
alter table public.leads enable row level security;

drop policy if exists "leads_insert" on public.leads;
drop policy if exists "leads_read"   on public.leads;
drop policy if exists "leads_update" on public.leads;
drop policy if exists "leads_delete" on public.leads;

create policy "leads_insert" on public.leads for insert
  with check (true);
create policy "leads_read" on public.leads for select
  using (auth.role() = 'authenticated');
create policy "leads_update" on public.leads for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "leads_delete" on public.leads for delete
  using (auth.role() = 'authenticated');
