CREATE TABLE public.spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    latitude DECIMAL(9,6) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DECIMAL(9,6) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    spot_type VARCHAR(255) NOT NULL CHECK (spot_type IN ('Cafe', 'Library', 'University Housing', 'Restaurant', 'Outdoor', 'Lounge'))
);

ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
