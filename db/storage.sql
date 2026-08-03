-- ============================================================================
-- Global Mediicare — Storage bucket for admin image uploads
-- Run this ONCE in the Supabase SQL editor (like db/schema.sql).
-- Enables "Upload image" in /admin for doctor photos + hospital images.
-- Safe to re-run.
-- ============================================================================

-- Public bucket that serves uploaded images by URL.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- Row Level Security on the objects:
--   • anyone may READ (so the public site can show the images)
--   • only signed-in admins may upload / change / delete
drop policy if exists "media_public_read"  on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media_auth_insert"  on storage.objects;
create policy "media_auth_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

drop policy if exists "media_auth_update"  on storage.objects;
create policy "media_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');

drop policy if exists "media_auth_delete"  on storage.objects;
create policy "media_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media');
