-- ============================================================
-- Run this in Supabase SQL Editor (new query)
-- Adds new columns, re-seeds services with correct data,
-- adds new columns to bookings, opens storage for guest uploads
-- ============================================================

-- ------------------------------------------------------------
-- 1. Add new columns to services
-- ------------------------------------------------------------
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS is_lube_flat boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lube_prices   jsonb,
  ADD COLUMN IF NOT EXISTS vehicle_type  text CHECK (vehicle_type IN ('VEHICLE', 'MOTORCYCLE'));

-- ------------------------------------------------------------
-- 2. Add new columns to bookings
-- ------------------------------------------------------------
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS plate_number    text,
  ADD COLUMN IF NOT EXISTS vehicle_type    text CHECK (vehicle_type IN ('VEHICLE', 'MOTORCYCLE')),
  ADD COLUMN IF NOT EXISTS oil_type        text CHECK (oil_type IN ('REGULAR', 'SEMI_SYNTHETIC', 'FULLY_SYNTHETIC')),
  ADD COLUMN IF NOT EXISTS payment_method  text;

-- ------------------------------------------------------------
-- 3. Re-seed services (clear wrong data first)
--    Safe to run on empty/dev tables only.
-- ------------------------------------------------------------
DELETE FROM public.bookings;
DELETE FROM public.services;

INSERT INTO public.services
  (id, category, name, description, duration_hours,
   price_small, price_medium, price_large, price_extra_large,
   is_lube_flat, lube_prices, vehicle_type)
VALUES
  -- LUBE — Express (Gas only, flat price)
  ('lube-express-gas', 'LUBE', 'Express (Gas)',
   'Engine Oil, Oil Filter, Labor, FREE Standard Car Wash. Gasoline (4 Liters).',
   1, 1400, 1400, 1400, 1400, true, '{"GAS": 1400, "DIESEL": 1400}', null),

  -- LUBE — Express (Diesel only, flat price)
  ('lube-express-diesel', 'LUBE', 'Express (Diesel)',
   'Engine Oil, Oil Filter, Labor, FREE Standard Car Wash. Diesel (7 Liters).',
   1, 1900, 1900, 1900, 1900, true, '{"GAS": 1900, "DIESEL": 1900}', null),

  -- LUBE — Premium Regular
  ('lube-premium-regular', 'LUBE', 'Premium Regular',
   'Engine Oil, Oil Filter, Labor, Engine Flushing, FREE Standard Car Wash. Regular oil.',
   1, 1650, 1650, 1650, 1650, true, '{"GAS": 1650, "DIESEL": 2250}', null),

  -- LUBE — Premium Semi-Synthetic
  ('lube-premium-semi-synthetic', 'LUBE', 'Premium Semi-Synthetic',
   'Engine Oil, Oil Filter, Labor, Engine Flushing, FREE Standard Car Wash. Semi-synthetic oil.',
   1, 2250, 2250, 2250, 2250, true, '{"GAS": 2250, "DIESEL": 3300}', null),

  -- LUBE — Premium Fully-Synthetic
  ('lube-premium-fully-synthetic', 'LUBE', 'Premium Fully-Synthetic',
   'Engine Oil, Oil Filter, Labor, Engine Flushing, FREE Standard Car Wash. Fully-synthetic oil.',
   1, 2650, 2650, 2650, 2650, true, '{"GAS": 2650, "DIESEL": 4250}', null),

  -- GROOMING — Vehicle
  ('grooming-interior', 'GROOMING', 'Interior Detailing',
   'Deep cleaning of seats, carpets, dashboard, and sanitation.',
   3, 2700, 3700, 4500, 5200, false, null, 'VEHICLE'),

  ('grooming-exterior', 'GROOMING', 'Exterior Detailing',
   'Multi-step wash, clay bar, polish, and wax application.',
   3, 3800, 4800, 5800, 6800, false, null, 'VEHICLE'),

  ('grooming-full', 'GROOMING', 'Full Detailing',
   'Complete interior and exterior restoration package.',
   6, 5500, 7300, 8800, 9500, false, null, 'VEHICLE'),

  ('grooming-engine', 'GROOMING', 'Engine Detailing',
   'Thorough engine bay cleaning, degreasing, and finishing.',
   2, 1000, 1250, 1500, 1700, false, null, 'VEHICLE'),

  ('grooming-glass', 'GROOMING', 'Glass Detailing',
   'Complete glass cleaning, water spot removal, and protective coating.',
   2, 2000, 2100, 2300, 2500, false, null, 'VEHICLE'),

  -- GROOMING — Motorcycle
  ('moto-regular-wash', 'GROOMING', 'Regular Carwash',
   'Standard wash, degreasing, and tire black.',
   1, 150, 200, 250, 300, false, null, 'MOTORCYCLE'),

  ('moto-wash-wax', 'GROOMING', 'Carwash with Wax',
   'Standard wash, degreasing, tire black, and premium wax application.',
   1, 250, 350, 450, 550, false, null, 'MOTORCYCLE'),

  -- COATING — Vehicle
  ('ceramic-1yr-vehicle', 'COATING', 'Ceramic Coating (1 Year) — Vehicle',
   'Standard car wash, asphalt removal, exterior detailing, watermarks/acid rain removal, paint correction (double step buffing). 1 year protection.',
   6, 9500, 10500, 11500, 12500, false, null, 'VEHICLE'),

  ('ceramic-3yr-vehicle', 'COATING', 'Ceramic Coating (3 Years) — Vehicle',
   'Standard car wash, asphalt removal, exterior detailing, watermarks/acid rain removal, paint correction (double step buffing). 3 years protection.',
   8, 11000, 12000, 13000, 15000, false, null, 'VEHICLE'),

  ('ceramic-5yr-vehicle', 'COATING', 'Ceramic Coating (5 Years) — Vehicle',
   'Premium 9H ceramic protection. 5 years protection.',
   8, 14000, 15000, 16000, 18000, false, null, 'VEHICLE'),

  -- COATING — Motorcycle
  ('ceramic-1yr-motorcycle', 'COATING', 'Ceramic Coating (1 Year) — Motorcycle',
   'Standard wash, asphalt removal, detailing, watermarks/acid rain removal, paint correction. 1 year protection.',
   4, 2750, 2850, 3000, 3250, false, null, 'MOTORCYCLE'),

  ('ceramic-3yr-motorcycle', 'COATING', 'Ceramic Coating (3 Years) — Motorcycle',
   'Standard wash, detailing, paint correction. 3 years protection.',
   5, 3000, 3200, 3350, 3600, false, null, 'MOTORCYCLE'),

  ('ceramic-5yr-motorcycle', 'COATING', 'Ceramic Coating (5 Years) — Motorcycle',
   'Premium 9H ceramic protection for motorcycles. 5 years protection.',
   6, 3300, 3500, 3700, 3900, false, null, 'MOTORCYCLE');

-- ------------------------------------------------------------
-- 4. Make payment-proofs bucket public so frontend can upload
--    without requiring auth and display proof images directly
-- ------------------------------------------------------------
UPDATE storage.buckets SET public = true WHERE id = 'payment-proofs';

DROP POLICY IF EXISTS "Authenticated users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Payment proofs are viewable by authenticated users" ON storage.objects;

CREATE POLICY "Anyone can upload payment proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Payment proofs are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-proofs');
