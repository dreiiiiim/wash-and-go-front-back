alter table if exists public.bookings
  drop constraint if exists bookings_status_check;

update public.bookings
set status = case
  when upper(replace(trim(status), ' ', '_')) = 'PENDING' then 'PENDING'
  when upper(replace(trim(status), ' ', '_')) = 'CONFIRMED' then 'CONFIRMED'
  when upper(replace(trim(status), ' ', '_')) = 'IN_PROGRESS' then 'IN_PROGRESS'
  when upper(replace(trim(status), ' ', '_')) = 'COMPLETED' then 'COMPLETED'
  when upper(replace(trim(status), ' ', '_')) = 'CANCELLED' then 'CANCELLED'
  when upper(replace(trim(status), ' ', '_')) = 'CANCELED' then 'CANCELLED'
  when upper(replace(trim(status), ' ', '_')) = 'REUPLOAD_REQUIRED' then 'REUPLOAD_REQUIRED'
  when upper(replace(trim(status), ' ', '_')) = 'PENDING_VERIFICATION' then 'PENDING_VERIFICATION'
  else 'PENDING'
end
where status is distinct from case
  when upper(replace(trim(status), ' ', '_')) = 'PENDING' then 'PENDING'
  when upper(replace(trim(status), ' ', '_')) = 'CONFIRMED' then 'CONFIRMED'
  when upper(replace(trim(status), ' ', '_')) = 'IN_PROGRESS' then 'IN_PROGRESS'
  when upper(replace(trim(status), ' ', '_')) = 'COMPLETED' then 'COMPLETED'
  when upper(replace(trim(status), ' ', '_')) = 'CANCELLED' then 'CANCELLED'
  when upper(replace(trim(status), ' ', '_')) = 'CANCELED' then 'CANCELLED'
  when upper(replace(trim(status), ' ', '_')) = 'REUPLOAD_REQUIRED' then 'REUPLOAD_REQUIRED'
  when upper(replace(trim(status), ' ', '_')) = 'PENDING_VERIFICATION' then 'PENDING_VERIFICATION'
  else 'PENDING'
end;

alter table if exists public.bookings
  add constraint bookings_status_check
  check (status in ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'CANCELLED', 'COMPLETED', 'REUPLOAD_REQUIRED', 'PENDING_VERIFICATION'));
