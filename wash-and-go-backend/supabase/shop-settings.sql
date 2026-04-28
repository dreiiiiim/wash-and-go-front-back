-- ============================================================
-- Shop Settings: admin-configurable operating hours
-- Safe to run in Supabase SQL Editor.
-- ============================================================

create table if not exists public.shop_settings (
  id         text primary key,
  key        text unique,
  value      text,
  setting_date date unique,
  open_time text not null default '08:00 AM',
  close_time text not null default '05:00 PM',
  updated_at timestamptz default timezone('utc', now())
);

alter table public.shop_settings
  add column if not exists id text,
  add column if not exists key text,
  add column if not exists value text,
  add column if not exists setting_date date,
  add column if not exists open_time text not null default '08:00 AM',
  add column if not exists close_time text not null default '05:00 PM',
  add column if not exists updated_at timestamptz default timezone('utc', now());

create unique index if not exists shop_settings_id_unique
  on public.shop_settings (id);

create unique index if not exists shop_settings_key_unique
  on public.shop_settings (key);

create unique index if not exists shop_settings_setting_date_unique
  on public.shop_settings (setting_date)
  where setting_date is not null;

insert into public.shop_settings (id, open_time, close_time, updated_at)
values ('default', '08:00 AM', '05:00 PM', timezone('utc', now()))
on conflict (id) do nothing;

alter table public.shop_settings enable row level security;

drop policy if exists "Shop settings are publicly readable" on public.shop_settings;
create policy "Shop settings are publicly readable"
  on public.shop_settings for select
  using (true);

drop policy if exists "Admins can update shop settings" on public.shop_settings;
create policy "Admins can update shop settings"
  on public.shop_settings for update
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins can insert shop settings" on public.shop_settings;
create policy "Admins can insert shop settings"
  on public.shop_settings for insert
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
