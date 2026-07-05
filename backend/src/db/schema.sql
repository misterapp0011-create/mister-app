-- =====================================================================
-- Mister — PostgreSQL schema
-- Canada-wide contractor marketplace. All monetary values in CAD cents
-- (integer) to avoid floating point issues. "_cad" columns store cents.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";   -- for case-insensitive email column

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('contractor', 'customer', 'admin');

CREATE TYPE job_status AS ENUM (
  'pending',        -- offer accepted, payment authorized, awaiting schedule confirmation
  'scheduled',       -- date/time set, waiting for job day
  'en_route',        -- contractor hit "I'm on my way"
  'arrived',         -- contractor hit "Arrived"
  'in_progress',     -- job started
  'completed',       -- contractor hit "Job Complete", awaiting customer confirmation
  'confirmed',       -- customer confirmed, payment released
  'disputed',        -- customer disputed, admin must resolve
  'cancelled'        -- cancelled before start, payment released back to customer
);

CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'declined', 'countered', 'expired', 'cancelled');

CREATE TYPE payment_status AS ENUM ('authorized', 'captured', 'released', 'refunded', 'failed', 'cancelled');

CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved_customer', 'resolved_contractor');

-- ---------------------------------------------------------------------
-- USERS  (auth + role, shared by all three user types)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             CITEXT UNIQUE NOT NULL,
  password_hash     TEXT,                 -- NULL if user only ever used Google OAuth
  google_id         TEXT UNIQUE,          -- NULL if user only uses password auth
  role              user_role NOT NULL,
  full_name         TEXT NOT NULL,
  phone             TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  is_suspended      BOOLEAN NOT NULL DEFAULT FALSE,
  suspended_reason  TEXT,
  email_verified_at TIMESTAMPTZ,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_auth_method_chk CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL)
);

CREATE INDEX idx_users_role ON users(role);

-- ---------------------------------------------------------------------
-- TRADES  (categories: Plumbing, Electrical, Carpentry, etc.)
-- ---------------------------------------------------------------------
CREATE TABLE trades (
  id          SERIAL PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  icon        TEXT,                       -- icon name / emoji for UI
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- CONTRACTOR PROFILES
-- ---------------------------------------------------------------------
CREATE TABLE contractor_profiles (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  primary_trade_id          INTEGER NOT NULL REFERENCES trades(id),
  bio                       TEXT,
  certifications            JSONB NOT NULL DEFAULT '[]', -- [{name, issuer, year, file_url}]
  years_experience          SMALLINT,
  service_city              TEXT,
  service_province          TEXT,          -- e.g. 'ON', 'BC'
  service_postal_code       TEXT,
  latitude                  DOUBLE PRECISION,
  longitude                 DOUBLE PRECISION,
  service_radius_km         INTEGER NOT NULL DEFAULT 25,
  market_rate_cad           INTEGER,       -- typical rate in cents (e.g. hourly or callout base)
  rate_type                 TEXT NOT NULL DEFAULT 'hourly', -- 'hourly' | 'flat' | 'quote'
  profile_photo_url         TEXT,
  portfolio_photo_urls      JSONB NOT NULL DEFAULT '[]',    -- array of Cloudinary URLs
  stripe_connect_account_id TEXT UNIQUE,
  stripe_payouts_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified               BOOLEAN NOT NULL DEFAULT FALSE,
  avg_rating                NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count              INTEGER NOT NULL DEFAULT 0,
  is_available              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contractor_profiles_trade ON contractor_profiles(primary_trade_id);
CREATE INDEX idx_contractor_profiles_location ON contractor_profiles(latitude, longitude);

-- A contractor may also list secondary trades/skills
CREATE TABLE contractor_trades (
  contractor_profile_id UUID NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE,
  trade_id               INTEGER NOT NULL REFERENCES trades(id),
  PRIMARY KEY (contractor_profile_id, trade_id)
);

-- ---------------------------------------------------------------------
-- CUSTOMER PROFILES
-- ---------------------------------------------------------------------
CREATE TABLE customer_profiles (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  default_address    TEXT,
  default_city       TEXT,
  default_province   TEXT,
  default_postal_code TEXT,
  latitude           DOUBLE PRECISION,
  longitude          DOUBLE PRECISION,
  stripe_customer_id TEXT UNIQUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- OFFERS  (price negotiation between customer and contractor)
-- ---------------------------------------------------------------------
CREATE TABLE offers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contractor_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trade_id        INTEGER REFERENCES trades(id),
  parent_offer_id UUID REFERENCES offers(id), -- links a counter-offer to the one it replaces
  amount_cad      INTEGER NOT NULL CHECK (amount_cad > 0),
  description     TEXT,                        -- job description ("I need my pipes fixed")
  status          offer_status NOT NULL DEFAULT 'pending',
  proposed_by     user_role NOT NULL,           -- 'customer' or 'contractor' (who made this offer/counter)
  responded_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_offers_customer ON offers(customer_id);
CREATE INDEX idx_offers_contractor ON offers(contractor_id);
CREATE INDEX idx_offers_status ON offers(status);

-- ---------------------------------------------------------------------
-- JOBS  (created once an offer is accepted)
-- ---------------------------------------------------------------------
CREATE TABLE jobs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id          UUID NOT NULL REFERENCES offers(id),
  customer_id       UUID NOT NULL REFERENCES users(id),
  contractor_id     UUID NOT NULL REFERENCES users(id),
  trade_id          INTEGER REFERENCES trades(id),
  title             TEXT,
  description       TEXT,
  agreed_amount_cad INTEGER NOT NULL,
  status            job_status NOT NULL DEFAULT 'pending',
  address           TEXT NOT NULL,
  latitude          DOUBLE PRECISION,
  longitude         DOUBLE PRECISION,
  scheduled_at      TIMESTAMPTZ,
  contractor_lat    DOUBLE PRECISION,      -- last known live location while en route
  contractor_lng    DOUBLE PRECISION,
  contractor_location_updated_at TIMESTAMPTZ,
  en_route_at       TIMESTAMPTZ,
  arrived_at        TIMESTAMPTZ,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  confirmed_at      TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  cancel_reason     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_customer ON jobs(customer_id);
CREATE INDEX idx_jobs_contractor ON jobs(contractor_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- ---------------------------------------------------------------------
-- MESSAGES  (chat between a customer and a contractor)
-- ---------------------------------------------------------------------
CREATE TABLE messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id     UUID NOT NULL REFERENCES users(id),
  offer_id      UUID REFERENCES offers(id),   -- set when this message represents an offer/counter-offer
  job_id        UUID REFERENCES jobs(id),
  body          TEXT,
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_thread ON messages(customer_id, contractor_id, created_at);

-- ---------------------------------------------------------------------
-- PAYMENTS  (Stripe Connect escrow lifecycle, one row per job)
-- ---------------------------------------------------------------------
CREATE TABLE payments (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                    UUID NOT NULL UNIQUE REFERENCES jobs(id),
  customer_id               UUID NOT NULL REFERENCES users(id),
  contractor_id             UUID NOT NULL REFERENCES users(id),
  stripe_payment_intent_id  TEXT UNIQUE,
  stripe_transfer_id        TEXT,
  amount_cad                INTEGER NOT NULL,       -- total charged to customer, in cents
  platform_fee_cad          INTEGER NOT NULL,        -- platform cut, in cents
  contractor_payout_cad     INTEGER NOT NULL,        -- amount_cad - platform_fee_cad
  status                    payment_status NOT NULL DEFAULT 'authorized',
  authorized_at             TIMESTAMPTZ,
  captured_at                TIMESTAMPTZ,
  released_at               TIMESTAMPTZ,
  refunded_at                TIMESTAMPTZ,
  failure_reason             TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_status ON payments(status);

-- ---------------------------------------------------------------------
-- REVIEWS  (customer reviews contractor after a completed job)
-- ---------------------------------------------------------------------
CREATE TABLE reviews (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id         UUID NOT NULL UNIQUE REFERENCES jobs(id),
  customer_id    UUID NOT NULL REFERENCES users(id),
  contractor_id  UUID NOT NULL REFERENCES users(id),
  rating         SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_contractor ON reviews(contractor_id);

-- ---------------------------------------------------------------------
-- DISPUTES
-- ---------------------------------------------------------------------
CREATE TABLE disputes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id            UUID NOT NULL REFERENCES jobs(id),
  raised_by_id      UUID NOT NULL REFERENCES users(id),
  reason            TEXT NOT NULL,
  evidence_urls     JSONB NOT NULL DEFAULT '[]',
  status            dispute_status NOT NULL DEFAULT 'open',
  resolution_notes  TEXT,
  resolved_by_id    UUID REFERENCES users(id),  -- admin who resolved it
  resolved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_disputes_status ON disputes(status);

-- ---------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,        -- 'offer_received' | 'offer_accepted' | 'job_scheduled' | ...
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB NOT NULL DEFAULT '{}',
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- ---------------------------------------------------------------------
-- updated_at auto-touch trigger
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','contractor_profiles','customer_profiles','offers','jobs','payments','disputes']
  LOOP
    EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();', t);
  END LOOP;
END $$;
