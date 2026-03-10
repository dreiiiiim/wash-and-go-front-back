-- This drops the old global timeslot unique constraint so the new per-service capacities will work.
-- Run this query in the Supabase SQL Editor.

DROP INDEX IF EXISTS public.bookings_slot_unique;
