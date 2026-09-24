CREATE TABLE IF NOT EXISTS interests (
  id uuid PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  postal_code char(4) NOT NULL,
  date_of_birth date,
  created_at timestamptz NOT NULL DEFAULT now(),
  privacy_version text NOT NULL,
  statement_snapshot text NOT NULL,
  statement_revision text NOT NULL,
  verified_at timestamptz,
  verification_token_hash text UNIQUE,
  verification_expires_at timestamptz,
  CONSTRAINT interests_email_unique UNIQUE (email),
  CONSTRAINT interests_postal_code_format CHECK (postal_code ~ '^[0-9]{4}$')
);
CREATE INDEX IF NOT EXISTS interests_created_at_idx ON interests(created_at DESC);

-- Daily cleanup is invoked by an external scheduler using an authenticated
-- database connection or by the administrator's Purge button.
