ALTER TABLE users
  ADD COLUMN password_hash TEXT NOT NULL DEFAULT '',
  ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN verification_token TEXT,
  ADD COLUMN verification_token_expires_at TIMESTAMPTZ;

ALTER TABLE users ALTER COLUMN password_hash DROP DEFAULT;

CREATE UNIQUE INDEX idx_users_verification_token ON users(verification_token)
  WHERE verification_token IS NOT NULL;
