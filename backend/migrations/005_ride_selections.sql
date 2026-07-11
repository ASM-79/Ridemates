CREATE TABLE ride_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  selector_request_id UUID NOT NULL REFERENCES commute_requests(id) ON DELETE CASCADE,
  selected_request_id UUID NOT NULL REFERENCES commute_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, selector_request_id)
);

CREATE INDEX idx_ride_selections_selected_request_id ON ride_selections(selected_request_id);
