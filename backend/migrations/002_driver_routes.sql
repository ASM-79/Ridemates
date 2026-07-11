ALTER TABLE routes
  ADD COLUMN start_address TEXT NOT NULL DEFAULT '',
  ADD COLUMN end_address TEXT NOT NULL DEFAULT '',
  ADD COLUMN seats_available INTEGER NOT NULL DEFAULT 3;

ALTER TABLE routes ALTER COLUMN start_address DROP DEFAULT;
ALTER TABLE routes ALTER COLUMN end_address DROP DEFAULT;

ALTER TABLE matches
  ADD COLUMN route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  ADD COLUMN status TEXT NOT NULL DEFAULT 'confirmed';

CREATE INDEX idx_matches_route_id ON matches(route_id);
