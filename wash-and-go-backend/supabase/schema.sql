-- ============================================================
-- Wash & Go - Full Database Schema (idempotent — safe to re-run)
-- ============================================================

-- ------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid references auth.users on delete cascade not null primary key,
  full_name    text,
  avatar_url   text,
  phone        text,
  role         text not null default 'customer' check (role in ('customer', 'admin')),
  created_at   timestamp with time zone default timezone('utc', now()),
  updated_at   timestamp with time zone default timezone('utc', now())
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ------------------------------------------------------------
-- SERVICES
-- ------------------------------------------------------------
create table if not exists public.services (
  id                  text primary key,
  category            text not null check (category in ('LUBE', 'GROOMING', 'COATING')),
  name                text not null,
  description         text,
  duration_hours      int not null,
  price_small         int not null,
  price_medium        int not null,
  price_large         int not null,
  price_extra_large   int not null,
  is_active           boolean not null default true,
  created_at          timestamp with time zone default timezone('utc', now())
);

alter table public.services enable row level security;

drop policy if exists "Services are publicly readable" on public.services;
create policy "Services are publicly readable"
  on public.services for select
  using (is_active = true);

insert into public.services (id, category, name, description, duration_hours, price_small, price_medium, price_large, price_extra_large) values
  ('grooming-exterior', 'GROOMING', 'Exterior Wash & Wax',
   'Full exterior wash, clay bar treatment, and hand wax for a brilliant shine.',
   2, 500, 700, 900, 1100),
  ('grooming-interior', 'GROOMING', 'Interior Cleaning',
   'Deep vacuum, dashboard wipe-down, seat shampooing, and odor treatment.',
   2, 500, 700, 900, 1100),
  ('grooming-full', 'GROOMING', 'Full Detailing',
   'Complete interior and exterior restoration package.',
   6, 5500, 7300, 8800, 9500),
  ('lube-oil-change', 'LUBE', 'Oil Change',
   'Engine oil and filter replacement using semi-synthetic or full-synthetic oil.',
   1, 800, 1000, 1200, 1400),
  ('lube-pms', 'LUBE', 'Preventive Maintenance Service (PMS)',
   'Full PMS including oil change, fluid top-ups, filter check, and multi-point inspection.',
   2, 2000, 2500, 3000, 3500),
  ('coating-paint-protection', 'COATING', 'Paint Protection Film (PPF)',
   'Clear protective film applied to high-impact areas to guard against scratches and chips.',
   4, 8000, 10000, 12000, 14000),
  ('coating-ceramic', 'COATING', 'Ceramic Coating',
   'Professional-grade nano-ceramic coating for long-lasting gloss and hydrophobic protection.',
   8, 15000, 18000, 22000, 25000)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- BOOKINGS
-- ------------------------------------------------------------
create table if not exists public.bookings (
  id                  text primary key,
  user_id             uuid references auth.users on delete set null,
  customer_name       text not null,
  customer_phone      text not null,
  service_id          text references public.services not null,
  service_name        text not null,
  vehicle_size        text not null check (vehicle_size in ('SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE')),
  fuel_type           text check (fuel_type in ('GAS', 'DIESEL')),
  date                date not null,
  time_slot           text not null,
  total_price         int not null,
  down_payment_amount int not null,
  status              text not null default 'PENDING' check (status in ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
  payment_proof_url   text,
  created_at          timestamp with time zone default timezone('utc', now()),
  updated_at          timestamp with time zone default timezone('utc', now())
);

create unique index if not exists bookings_slot_unique
  on public.bookings (date, time_slot)
  where status in ('PENDING', 'CONFIRMED');

alter table public.bookings enable row level security;

drop policy if exists "Anyone can create a booking" on public.bookings;
create policy "Anyone can create a booking"
  on public.bookings for insert
  with check (true);

drop policy if exists "Users can view own bookings" on public.bookings;
create policy "Users can view own bookings"
  on public.bookings for select
  using (user_id = auth.uid());

drop trigger if exists on_bookings_updated on public.bookings;
create trigger on_bookings_updated
  before update on public.bookings
  for each row execute procedure public.handle_updated_at();

-- ------------------------------------------------------------
-- STORAGE: payment-proofs bucket
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('payment-proofs', 'payment-proofs', false)
  on conflict do nothing;

drop policy if exists "Authenticated users can upload payment proofs" on storage.objects;
create policy "Authenticated users can upload payment proofs"
  on storage.objects for insert
  with check (bucket_id = 'payment-proofs' and auth.role() = 'authenticated');

drop policy if exists "Payment proofs are viewable by authenticated users" on storage.objects;
create policy "Payment proofs are viewable by authenticated users"
  on storage.objects for select
  using (bucket_id = 'payment-proofs' and auth.role() = 'authenticated');
