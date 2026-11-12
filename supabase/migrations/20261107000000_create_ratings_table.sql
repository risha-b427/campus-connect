-- One overall study-spot rating per user, independent of individual visits.
CREATE TABLE public.ratings (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    spot_id UUID NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, spot_id)
);

-- Supports fetching and aggregating all ratings for a study spot.
CREATE INDEX idx_ratings_spot_id ON public.ratings (spot_id);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;