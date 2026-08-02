-- ============================================================================
-- Global Mediicare — Doctors & Hospitals directory schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- Safe to re-run: uses IF NOT EXISTS / idempotent policy drops.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------
create table if not exists public.hospitals (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  city          text        not null default '',
  country       text        not null default '',   -- ISO2: in, tr, ae, th, de, eg
  image_url     text,
  accreditation text[]      not null default '{}',  -- e.g. {JCI,NABH}
  beds          integer,
  established   integer,
  specialties   text[]      not null default '{}',
  sort_order    integer     not null default 0,
  is_active     boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.doctors (
  id           uuid primary key default gen_random_uuid(),
  name         text        not null,
  designation  text        not null default '',
  specialty    text        not null default '',
  experience   integer,                              -- years
  hospital     text        not null default '',
  city         text        not null default '',
  country      text        not null default '',      -- ISO2
  photo_url    text,                                 -- optional; monogram avatar if null
  sort_order   integer     not null default 0,
  is_active    boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists hospitals_country_idx on public.hospitals (country);
create index if not exists doctors_country_idx  on public.doctors (country);
create index if not exists doctors_specialty_idx on public.doctors (specialty);

-- ----------------------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists hospitals_touch on public.hospitals;
create trigger hospitals_touch before update on public.hospitals
  for each row execute function public.touch_updated_at();

drop trigger if exists doctors_touch on public.doctors;
create trigger doctors_touch before update on public.doctors
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
--   • anyone (anon) may READ  -> powers the public /doctors and /hospitals pages
--   • only signed-in users may WRITE -> the admin panel (create the admin
--     account in Supabase Auth; any authenticated user is treated as admin)
-- ----------------------------------------------------------------------------
alter table public.hospitals enable row level security;
alter table public.doctors   enable row level security;

drop policy if exists "hospitals_read"  on public.hospitals;
drop policy if exists "hospitals_write" on public.hospitals;
create policy "hospitals_read"  on public.hospitals for select using (true);
create policy "hospitals_write" on public.hospitals for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "doctors_read"  on public.doctors;
drop policy if exists "doctors_write" on public.doctors;
create policy "doctors_read"  on public.doctors for select using (true);
create policy "doctors_write" on public.doctors for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- Seed data (matches the sample set shipped in the app). Runs only when empty.
-- NOTE: hospital accreditation / beds / established are ILLUSTRATIVE — verify
-- before publishing. Doctors are fictional sample records.
-- ----------------------------------------------------------------------------
insert into public.hospitals (name, city, country, image_url, accreditation, beds, established, specialties, sort_order)
select * from (values
  ('Medanta - The Medicity','Gurgaon','in','/assets/hospitals/medanta-the-medicity.jpg', array['JCI','NABH'], 1250, 2009, array['Cardiology','Oncology','Neurosurgery','Organ Transplant'], 1),
  ('Indraprastha Apollo','New Delhi','in','/assets/hospitals/indraprastha-apollo.jpg', array['JCI','NABH'], 710, 1996, array['Oncology','Cardiology','Orthopedics','Organ Transplant'], 2),
  ('Kokilaben Dhirubhai Ambani','Mumbai','in','/assets/hospitals/kokilaben-dhirubhai-ambani.jpg', array['NABH','NABL'], 750, 2009, array['Neurosurgery','Oncology','Cardiology','IVF & Fertility'], 3),
  ('Apollo Hospitals','Chennai','in','/assets/hospitals/apollo-hospitals.jpg', array['JCI','NABH'], 560, 1983, array['Cardiology','Orthopedics','IVF & Fertility','Bariatric'], 4),
  ('Erdem Hospital','Istanbul','tr','/assets/hospitals/erdem-hospital.webp', array['ISO'], 200, 1988, array['Bariatric','Cosmetic & Hair','Orthopedics','Cardiology'], 5),
  ('Burjeel Hospital','Abu Dhabi','ae','/assets/hospitals/burjeel-hospital.jpg', array['JCI','ISO'], 400, 2012, array['Orthopedics','Cardiology','Oncology','Cosmetic & Hair'], 7),
  ('Saudi German Hospital','Dubai','ae','/assets/hospitals/saudi-german-hospital.jpg', array['JCI'], 300, 2012, array['Gynecology','Orthopedics','Bariatric','Cardiology'], 8),
  ('Bumrungrad International','Bangkok','th','/assets/hospitals/bumrungrad-international.jpg', array['JCI','GHA'], 580, 1980, array['Bariatric','Oncology','Cardiology','Orthopedics'], 9),
  ('Bangkok Hospital','Bangkok','th','/assets/hospitals/bangkok-hospital.jpg', array['JCI','GHA'], 650, 1972, array['Cardiology','Cosmetic & Hair','Neurosurgery','Oncology'], 10),
  ('Charité','Berlin','de','/assets/hospitals/charite.jpg', array['ISO'], 3000, 1710, array['Spine Surgery','Oncology','Neurosurgery','Organ Transplant'], 11),
  ('Heidelberg University Hospital','Heidelberg','de','/assets/hospitals/heidelberg-university-hospital.jpg', array['ISO'], 1900, 1388, array['Organ Transplant','Oncology','Cardiology','Spine Surgery'], 12),
  ('As-Salam International','Cairo','eg','/assets/hospitals/as-salam-international.jpg', array['ISO'], 350, 1982, array['Cardiology','Oncology','Orthopedics','Gynecology'], 13),
  ('Cleopatra Hospital','Cairo','eg','/assets/hospitals/cleopatra-hospital.jpg', array['ISO'], 220, 1979, array['Gynecology','Cardiology','IVF & Fertility','Bariatric'], 14)
) as v(name, city, country, image_url, accreditation, beds, established, specialties, sort_order)
where not exists (select 1 from public.hospitals);

insert into public.doctors (name, designation, specialty, experience, hospital, city, country, sort_order)
select * from (values
  ('Dr. Rajesh Menon','Senior Consultant','Cardiology',24,'Medanta','Gurgaon','in',1),
  ('Dr. Ananya Sharma','Director','Oncology',19,'Indraprastha Apollo','New Delhi','in',2),
  ('Dr. Vikram Rao','Head of Department','Neurosurgery',22,'Kokilaben','Mumbai','in',3),
  ('Dr. Priya Nair','Senior Consultant','IVF & Fertility',16,'Apollo','Chennai','in',4),
  ('Dr. Arjun Kapoor','Consultant','Orthopedics',15,'Medanta','Gurgaon','in',5),
  ('Dr. Mehmet Yilmaz','Professor','Oncology',21,'Medical Park','Istanbul','tr',6),
  ('Dr. Elif Demir','Senior Consultant','Cardiology',18,'Memorial Hospitals','Istanbul','tr',7),
  ('Dr. Khalid Al Mansoori','Consultant','Orthopedics',17,'Burjeel','Abu Dhabi','ae',8),
  ('Dr. Sara Haddad','Senior Consultant','Gynecology',14,'Saudi German','Dubai','ae',9),
  ('Dr. Somchai Prasert','Director','Bariatric',20,'Bumrungrad','Bangkok','th',10),
  ('Dr. Kanya Srisai','Consultant','Cosmetic & Hair',13,'Bangkok Hospital','Bangkok','th',11),
  ('Dr. Hans Weber','Professor','Spine Surgery',26,'Charité','Berlin','de',12),
  ('Dr. Lena Schmidt','Senior Consultant','Organ Transplant',23,'Heidelberg University','Heidelberg','de',13),
  ('Dr. Omar Fahmy','Consultant','Cardiology',18,'As-Salam International','Cairo','eg',14),
  ('Dr. Nadia Mostafa','Senior Consultant','Oncology',15,'Cleopatra Hospital','Cairo','eg',15)
) as v(name, designation, specialty, experience, hospital, city, country, sort_order)
where not exists (select 1 from public.doctors);
