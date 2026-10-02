CREATE TABLE IF NOT EXISTS interests (
  id uuid PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  postal_code char(4) NOT NULL,
  date_of_birth date,
  age_band text,
  confirmation_message_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  privacy_version text NOT NULL,
  statement_snapshot text NOT NULL,
  statement_revision text NOT NULL,
  verified_at timestamptz,
  verification_token_hash text UNIQUE,
  verification_expires_at timestamptz,
  marketing_requested boolean NOT NULL DEFAULT false,
  marketing_consent_at timestamptz,
  marketing_consent_text text,
  marketing_withdrawn_at timestamptz,
  CONSTRAINT interests_email_unique UNIQUE (email),
  CONSTRAINT interests_postal_code_format CHECK (postal_code ~ '^[0-9]{4}$')
);
CREATE INDEX IF NOT EXISTS interests_created_at_idx ON interests(created_at DESC);

-- Daily cleanup is invoked by an external scheduler using an authenticated
-- database connection or by the administrator's Purge button.

-- The app creates and seeds this table on its first database-backed request.
CREATE TABLE IF NOT EXISTS petition_settings (
  id integer PRIMARY KEY CHECK (id = 1),
  title text NOT NULL,
  statement text NOT NULL DEFAULT '',
  revision integer NOT NULL DEFAULT 0,
  draft text NOT NULL,
  manager_email text NOT NULL,
  canvas_color text NOT NULL DEFAULT '#fff4c4',
  ink_color text NOT NULL DEFAULT '#000000',
  accent_color text NOT NULL DEFAULT '#dfee4b',
  updated_at timestamptz NOT NULL DEFAULT now()
);
