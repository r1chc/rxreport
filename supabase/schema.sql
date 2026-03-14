-- ============================================================
-- RxReport: FDA FAERS local cache schema
-- Apply with: psql $DATABASE_URL -f supabase/schema.sql
--             or paste into Supabase SQL editor
-- ============================================================

-- ------------------------------------------------------------
-- Sync audit log (written at the start and end of each run)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sync_log (
  id             BIGSERIAL    PRIMARY KEY,
  started_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  completed_at   TIMESTAMPTZ,
  drugs_synced   INT          NOT NULL DEFAULT 0,
  status         TEXT         NOT NULL DEFAULT 'running',  -- 'running' | 'success' | 'error'
  error          TEXT
);

-- ------------------------------------------------------------
-- Master drug table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drugs (
  slug                TEXT        PRIMARY KEY,
  name                TEXT        NOT NULL,
  total_reports       INT         NOT NULL DEFAULT 0,
  serious_reports     INT         NOT NULL DEFAULT 0,
  non_serious_reports INT         NOT NULL DEFAULT 0,
  last_synced_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drugs_name ON drugs (name);

-- ------------------------------------------------------------
-- Top side effects (reactions) per drug
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drug_reactions (
  id         BIGSERIAL PRIMARY KEY,
  drug_slug  TEXT      NOT NULL REFERENCES drugs (slug) ON DELETE CASCADE,
  name       TEXT      NOT NULL,
  count      INT       NOT NULL DEFAULT 0,
  percentage NUMERIC(6, 1) NOT NULL DEFAULT 0,
  rank       INT       NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (drug_slug, name)
);

CREATE INDEX IF NOT EXISTS idx_drug_reactions_drug_slug ON drug_reactions (drug_slug);

-- ------------------------------------------------------------
-- Quarterly trend data
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drug_trends (
  id         BIGSERIAL PRIMARY KEY,
  drug_slug  TEXT      NOT NULL REFERENCES drugs (slug) ON DELETE CASCADE,
  quarter    TEXT      NOT NULL,   -- e.g. "2023 Q1"
  count      INT       NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (drug_slug, quarter)
);

CREATE INDEX IF NOT EXISTS idx_drug_trends_drug_slug ON drug_trends (drug_slug);

-- ------------------------------------------------------------
-- Age demographics
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drug_age_groups (
  id         BIGSERIAL PRIMARY KEY,
  drug_slug  TEXT      NOT NULL REFERENCES drugs (slug) ON DELETE CASCADE,
  label      TEXT      NOT NULL,   -- e.g. "18-44"
  count      INT       NOT NULL DEFAULT 0,
  percentage NUMERIC(6, 1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (drug_slug, label)
);

CREATE INDEX IF NOT EXISTS idx_drug_age_groups_drug_slug ON drug_age_groups (drug_slug);

-- ------------------------------------------------------------
-- Gender breakdown (one row per drug)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drug_gender (
  drug_slug  TEXT    PRIMARY KEY REFERENCES drugs (slug) ON DELETE CASCADE,
  male       INT     NOT NULL DEFAULT 0,
  female     INT     NOT NULL DEFAULT 0,
  unknown    INT     NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Seriousness breakdown (one row per drug)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drug_seriousness (
  drug_slug          TEXT    PRIMARY KEY REFERENCES drugs (slug) ON DELETE CASCADE,
  death              INT     NOT NULL DEFAULT 0,
  hospitalization    INT     NOT NULL DEFAULT 0,
  life_threatening   INT     NOT NULL DEFAULT 0,
  disabling          INT     NOT NULL DEFAULT 0,
  congenital_anomali INT     NOT NULL DEFAULT 0,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Reaction outcomes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drug_outcomes (
  id         BIGSERIAL PRIMARY KEY,
  drug_slug  TEXT      NOT NULL REFERENCES drugs (slug) ON DELETE CASCADE,
  label      TEXT      NOT NULL,
  count      INT       NOT NULL DEFAULT 0,
  percentage NUMERIC(6, 1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (drug_slug, label)
);

CREATE INDEX IF NOT EXISTS idx_drug_outcomes_drug_slug ON drug_outcomes (drug_slug);

-- ------------------------------------------------------------
-- Drug indications
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drug_indications (
  id         BIGSERIAL PRIMARY KEY,
  drug_slug  TEXT      NOT NULL REFERENCES drugs (slug) ON DELETE CASCADE,
  label      TEXT      NOT NULL,
  count      INT       NOT NULL DEFAULT 0,
  percentage NUMERIC(6, 1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (drug_slug, label)
);

CREATE INDEX IF NOT EXISTS idx_drug_indications_drug_slug ON drug_indications (drug_slug);

-- ------------------------------------------------------------
-- Reporter types
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drug_reporter_types (
  id         BIGSERIAL PRIMARY KEY,
  drug_slug  TEXT      NOT NULL REFERENCES drugs (slug) ON DELETE CASCADE,
  label      TEXT      NOT NULL,
  count      INT       NOT NULL DEFAULT 0,
  percentage NUMERIC(6, 1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (drug_slug, label)
);

CREATE INDEX IF NOT EXISTS idx_drug_reporter_types_drug_slug ON drug_reporter_types (drug_slug);

-- ------------------------------------------------------------
-- Reporting countries
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drug_countries (
  id         BIGSERIAL PRIMARY KEY,
  drug_slug  TEXT      NOT NULL REFERENCES drugs (slug) ON DELETE CASCADE,
  label      TEXT      NOT NULL,
  count      INT       NOT NULL DEFAULT 0,
  percentage NUMERIC(6, 1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (drug_slug, label)
);

CREATE INDEX IF NOT EXISTS idx_drug_countries_drug_slug ON drug_countries (drug_slug);

-- ------------------------------------------------------------
-- Action taken
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drug_action_taken (
  id         BIGSERIAL PRIMARY KEY,
  drug_slug  TEXT      NOT NULL REFERENCES drugs (slug) ON DELETE CASCADE,
  label      TEXT      NOT NULL,
  count      INT       NOT NULL DEFAULT 0,
  percentage NUMERIC(6, 1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (drug_slug, label)
);

CREATE INDEX IF NOT EXISTS idx_drug_action_taken_drug_slug ON drug_action_taken (drug_slug);

-- ------------------------------------------------------------
-- Administration routes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drug_routes (
  id         BIGSERIAL PRIMARY KEY,
  drug_slug  TEXT      NOT NULL REFERENCES drugs (slug) ON DELETE CASCADE,
  label      TEXT      NOT NULL,
  count      INT       NOT NULL DEFAULT 0,
  percentage NUMERIC(6, 1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (drug_slug, label)
);

CREATE INDEX IF NOT EXISTS idx_drug_routes_drug_slug ON drug_routes (drug_slug);

-- ------------------------------------------------------------
-- Co-reported drugs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drug_co_reported (
  id             BIGSERIAL PRIMARY KEY,
  drug_slug      TEXT      NOT NULL REFERENCES drugs (slug) ON DELETE CASCADE,
  co_drug_label  TEXT      NOT NULL,
  count          INT       NOT NULL DEFAULT 0,
  percentage     NUMERIC(6, 1) NOT NULL DEFAULT 0,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (drug_slug, co_drug_label)
);

CREATE INDEX IF NOT EXISTS idx_drug_co_reported_drug_slug ON drug_co_reported (drug_slug);

-- ------------------------------------------------------------
-- FDA drug label data
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drug_labels (
  drug_slug            TEXT    PRIMARY KEY REFERENCES drugs (slug) ON DELETE CASCADE,
  has_black_box_warning BOOLEAN NOT NULL DEFAULT FALSE,
  black_box_warning    TEXT,
  warnings             TEXT,
  contraindications    TEXT,
  indications_and_usage TEXT,
  pharm_class          TEXT[]  NOT NULL DEFAULT '{}',
  brand_names          TEXT[]  NOT NULL DEFAULT '{}',
  generic_names        TEXT[]  NOT NULL DEFAULT '{}',
  manufacturer         TEXT,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

-- Enable Row Level Security
ALTER TABLE drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_age_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_gender ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_seriousness ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_indications ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_reporter_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_action_taken ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_co_reported ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- Public read access for all drug data tables
CREATE POLICY "Public read access" ON drugs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON drug_reactions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON drug_trends FOR SELECT USING (true);
CREATE POLICY "Public read access" ON drug_age_groups FOR SELECT USING (true);
CREATE POLICY "Public read access" ON drug_gender FOR SELECT USING (true);
CREATE POLICY "Public read access" ON drug_seriousness FOR SELECT USING (true);
CREATE POLICY "Public read access" ON drug_outcomes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON drug_indications FOR SELECT USING (true);
CREATE POLICY "Public read access" ON drug_reporter_types FOR SELECT USING (true);
CREATE POLICY "Public read access" ON drug_countries FOR SELECT USING (true);
CREATE POLICY "Public read access" ON drug_action_taken FOR SELECT USING (true);
CREATE POLICY "Public read access" ON drug_routes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON drug_co_reported FOR SELECT USING (true);
CREATE POLICY "Public read access" ON drug_labels FOR SELECT USING (true);

-- sync_log: no public access (only service_role can write)
CREATE POLICY "No public access" ON sync_log FOR SELECT USING (false);
