-- Seed initial trade categories
INSERT INTO trades (name, slug, icon) VALUES
  ('Plumbing',        'plumbing',        'wrench'),
  ('Electrical',       'electrical',       'bolt'),
  ('Carpentry',        'carpentry',        'hammer'),
  ('HVAC',             'hvac',             'wind'),
  ('Painting',         'painting',         'paint-roller'),
  ('Landscaping',      'landscaping',      'leaf'),
  ('Roofing',          'roofing',          'home'),
  ('General Handyman', 'general-handyman', 'toolbox'),
  ('Appliance Repair', 'appliance-repair', 'washing-machine'),
  ('Flooring',         'flooring',         'layers'),
  ('Cleaning',         'cleaning',         'sparkles'),
  ('Moving & Hauling', 'moving-hauling',   'truck')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================================
-- Dummy contractors (for dev/demo only)
-- All share the password "password123" (bcrypt, 12 rounds, via pgcrypto
-- so it matches backend/src/utils/password.js's hash format exactly).
-- Each block is idempotent: rerunning seed.sql skips contractors whose
-- email already exists (ON CONFLICT DO NOTHING short-circuits the
-- downstream profile/trade inserts too, since they select from the
-- empty RETURNING set).
-- =====================================================================

-- 1. Marcus Chen — Plumbing — Toronto, ON (also does HVAC)
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name, phone, email_verified_at)
  VALUES ('marcus.chen@example.com', crypt('password123', gen_salt('bf', 12)), 'contractor',
          'Marcus Chen', '+1-416-555-0142', now() - interval '2 years')
  ON CONFLICT (email) DO NOTHING
  RETURNING id
), new_profile AS (
  INSERT INTO contractor_profiles (
    user_id, primary_trade_id, bio, certifications, years_experience,
    service_city, service_province, service_postal_code, latitude, longitude,
    market_rate_cad, rate_type, profile_photo_url, is_verified, avg_rating, review_count, is_available
  )
  SELECT id, (SELECT id FROM trades WHERE slug = 'plumbing'),
    'Licensed plumber serving the GTA for over a decade. Specializing in leak repair, fixture installs, and emergency callouts.',
    '[{"name": "Certified Journeyman Plumber", "issuer": "Ontario College of Trades", "year": 2014, "file_url": null}]'::jsonb,
    12, 'Toronto', 'ON', 'M5V 2T6', 43.6532, -79.3832,
    8500, 'hourly', 'https://i.pravatar.cc/300?img=11', true, 4.80, 96, true
  FROM new_user
  RETURNING id
)
INSERT INTO contractor_trades (contractor_profile_id, trade_id)
SELECT id, (SELECT id FROM trades WHERE slug = 'hvac') FROM new_profile;

-- 2. Sarah Bouchard — Electrical — Montreal, QC
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name, phone, email_verified_at)
  VALUES ('sarah.bouchard@example.com', crypt('password123', gen_salt('bf', 12)), 'contractor',
          'Sarah Bouchard', '+1-514-555-0198', now() - interval '3 years')
  ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO contractor_profiles (
  user_id, primary_trade_id, bio, certifications, years_experience,
  service_city, service_province, service_postal_code, latitude, longitude,
  market_rate_cad, rate_type, profile_photo_url, is_verified, avg_rating, review_count, is_available
)
SELECT id, (SELECT id FROM trades WHERE slug = 'electrical'),
  'Master electrician handling residential rewiring, panel upgrades, and EV charger installs across Montreal.',
  '[{"name": "Master Electrician License", "issuer": "Corporation des maitres electriciens du Quebec", "year": 2011, "file_url": null}]'::jsonb,
  15, 'Montreal', 'QC', 'H2Y 1C6', 45.5019, -73.5674,
  9200, 'hourly', 'https://i.pravatar.cc/300?img=32', true, 4.90, 118, true
FROM new_user;

-- 3. David Nguyen — Carpentry — Vancouver, BC
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name, phone, email_verified_at)
  VALUES ('david.nguyen@example.com', crypt('password123', gen_salt('bf', 12)), 'contractor',
          'David Nguyen', '+1-604-555-0177', now() - interval '1 year')
  ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO contractor_profiles (
  user_id, primary_trade_id, bio, certifications, years_experience,
  service_city, service_province, service_postal_code, latitude, longitude,
  market_rate_cad, rate_type, profile_photo_url, is_verified, avg_rating, review_count, is_available
)
SELECT id, (SELECT id FROM trades WHERE slug = 'carpentry'),
  'Custom carpentry and finish work — built-ins, decks, and framing. Portfolio available on request.',
  '[]'::jsonb,
  7, 'Vancouver', 'BC', 'V6B 1A1', 49.2827, -123.1207,
  7500, 'hourly', 'https://i.pravatar.cc/300?img=13', true, 4.60, 41, true
FROM new_user;

-- 4. Emily Tremblay — HVAC — Calgary, AB
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name, phone, email_verified_at)
  VALUES ('emily.tremblay@example.com', crypt('password123', gen_salt('bf', 12)), 'contractor',
          'Emily Tremblay', '+1-403-555-0163', now() - interval '4 years')
  ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO contractor_profiles (
  user_id, primary_trade_id, bio, certifications, years_experience,
  service_city, service_province, service_postal_code, latitude, longitude,
  market_rate_cad, rate_type, profile_photo_url, is_verified, avg_rating, review_count, is_available
)
SELECT id, (SELECT id FROM trades WHERE slug = 'hvac'),
  'Furnace and AC installs, repairs, and seasonal maintenance. Certified gas fitter.',
  '[{"name": "Gas Fitter Certificate", "issuer": "Alberta Municipal Affairs", "year": 2018, "file_url": null}]'::jsonb,
  9, 'Calgary', 'AB', 'T2P 1J9', 51.0447, -114.0719,
  9800, 'hourly', 'https://i.pravatar.cc/300?img=47', true, 4.75, 63, true
FROM new_user;

-- 5. Jordan MacKenzie — Painting — Ottawa, ON (newer, not yet verified)
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name, phone, email_verified_at)
  VALUES ('jordan.mackenzie@example.com', crypt('password123', gen_salt('bf', 12)), 'contractor',
          'Jordan MacKenzie', '+1-613-555-0129', now() - interval '4 months')
  ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO contractor_profiles (
  user_id, primary_trade_id, bio, certifications, years_experience,
  service_city, service_province, service_postal_code, latitude, longitude,
  market_rate_cad, rate_type, profile_photo_url, is_verified, avg_rating, review_count, is_available
)
SELECT id, (SELECT id FROM trades WHERE slug = 'painting'),
  'Interior and exterior painting, clean lines and on-time finishes. Free quotes for rooms and full homes.',
  '[]'::jsonb,
  3, 'Ottawa', 'ON', 'K1P 1J1', 45.4215, -75.6972,
  45000, 'flat', 'https://i.pravatar.cc/300?img=15', false, 4.20, 8, true
FROM new_user;

-- 6. Priya Sharma — Landscaping — Mississauga, ON
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name, phone, email_verified_at)
  VALUES ('priya.sharma@example.com', crypt('password123', gen_salt('bf', 12)), 'contractor',
          'Priya Sharma', '+1-905-555-0184', now() - interval '2 years')
  ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO contractor_profiles (
  user_id, primary_trade_id, bio, certifications, years_experience,
  service_city, service_province, service_postal_code, latitude, longitude,
  market_rate_cad, rate_type, profile_photo_url, is_verified, avg_rating, review_count, is_available
)
SELECT id, (SELECT id FROM trades WHERE slug = 'landscaping'),
  'Full-service landscaping — lawn care, garden design, and seasonal cleanups for residential properties.',
  '[{"name": "Landscape Horticulturist Certificate", "issuer": "Landscape Ontario", "year": 2019, "file_url": null}]'::jsonb,
  6, 'Mississauga', 'ON', 'L5B 1M2', 43.5890, -79.6441,
  6500, 'hourly', 'https://i.pravatar.cc/300?img=25', true, 4.65, 54, true
FROM new_user;

-- 7. Liam O'Brien — Roofing — Halifax, NS
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name, phone, email_verified_at)
  VALUES ('liam.obrien@example.com', crypt('password123', gen_salt('bf', 12)), 'contractor',
          'Liam O''Brien', '+1-902-555-0156', now() - interval '5 years')
  ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO contractor_profiles (
  user_id, primary_trade_id, bio, certifications, years_experience,
  service_city, service_province, service_postal_code, latitude, longitude,
  market_rate_cad, rate_type, profile_photo_url, is_verified, avg_rating, review_count, is_available
)
SELECT id, (SELECT id FROM trades WHERE slug = 'roofing'),
  'Residential roofing — shingle replacement, repairs, and inspections. Every job quoted before work begins.',
  '[{"name": "Certified Roofing Technician", "issuer": "Roofing Contractors Association of Canada", "year": 2016, "file_url": null}]'::jsonb,
  10, 'Halifax', 'NS', 'B3J 1P3', 44.6488, -63.5752,
  0, 'quote', 'https://i.pravatar.cc/300?img=52', true, 4.55, 29, true
FROM new_user;

-- 8. Aisha Khan — General Handyman — Edmonton, AB (also Painting, Flooring)
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name, phone, email_verified_at)
  VALUES ('aisha.khan@example.com', crypt('password123', gen_salt('bf', 12)), 'contractor',
          'Aisha Khan', '+1-780-555-0171', now() - interval '3 years')
  ON CONFLICT (email) DO NOTHING
  RETURNING id
), new_profile AS (
  INSERT INTO contractor_profiles (
    user_id, primary_trade_id, bio, certifications, years_experience,
    service_city, service_province, service_postal_code, latitude, longitude,
    market_rate_cad, rate_type, profile_photo_url, is_verified, avg_rating, review_count, is_available
  )
  SELECT id, (SELECT id FROM trades WHERE slug = 'general-handyman'),
    'No job too small — furniture assembly, drywall patching, minor repairs, and everything in between.',
    '[]'::jsonb,
    8, 'Edmonton', 'AB', 'T5J 0N3', 53.5461, -113.4938,
    6000, 'hourly', 'https://i.pravatar.cc/300?img=44', true, 4.70, 87, true
  FROM new_user
  RETURNING id
)
INSERT INTO contractor_trades (contractor_profile_id, trade_id)
SELECT id, t.trade_id
FROM new_profile, (VALUES
  ((SELECT id FROM trades WHERE slug = 'painting')),
  ((SELECT id FROM trades WHERE slug = 'flooring'))
) AS t(trade_id);

-- 9. Carlos Mendes — Appliance Repair — Winnipeg, MB (newer, fewer reviews)
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name, phone, email_verified_at)
  VALUES ('carlos.mendes@example.com', crypt('password123', gen_salt('bf', 12)), 'contractor',
          'Carlos Mendes', '+1-204-555-0135', now() - interval '6 months')
  ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO contractor_profiles (
  user_id, primary_trade_id, bio, certifications, years_experience,
  service_city, service_province, service_postal_code, latitude, longitude,
  market_rate_cad, rate_type, profile_photo_url, is_verified, avg_rating, review_count, is_available
)
SELECT id, (SELECT id FROM trades WHERE slug = 'appliance-repair'),
  'Fridge, washer, dryer, and dishwasher repair. Same-day service in most of Winnipeg.',
  '[]'::jsonb,
  4, 'Winnipeg', 'MB', 'R3C 0V8', 49.8951, -97.1384,
  7000, 'hourly', 'https://i.pravatar.cc/300?img=61', false, 4.10, 12, true
FROM new_user;

-- 10. Sophie Lavoie — Flooring — Quebec City, QC (currently booked up)
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name, phone, email_verified_at)
  VALUES ('sophie.lavoie@example.com', crypt('password123', gen_salt('bf', 12)), 'contractor',
          'Sophie Lavoie', '+1-418-555-0149', now() - interval '18 months')
  ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO contractor_profiles (
  user_id, primary_trade_id, bio, certifications, years_experience,
  service_city, service_province, service_postal_code, latitude, longitude,
  market_rate_cad, rate_type, profile_photo_url, is_verified, avg_rating, review_count, is_available
)
SELECT id, (SELECT id FROM trades WHERE slug = 'flooring'),
  'Hardwood, laminate, and tile installation. Precision work backed by a two-year workmanship guarantee.',
  '[{"name": "Flooring Installation Certificate", "issuer": "CFI Canada", "year": 2020, "file_url": null}]'::jsonb,
  6, 'Quebec City', 'QC', 'G1R 2L3', 46.8139, -71.2080,
  7200, 'hourly', 'https://i.pravatar.cc/300?img=48', true, 4.85, 45, false
FROM new_user;
