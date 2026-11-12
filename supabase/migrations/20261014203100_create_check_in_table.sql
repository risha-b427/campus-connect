CREATE TABLE public.check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- A verified auth user can check in before creating a public profile.
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    spot_id UUID NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
    note TEXT,
    -- API fields busyness and noise; ratings are submitted at checkout.
    crowd_level INT CHECK (crowd_level BETWEEN 1 AND 10),
    noise_level INT CHECK (noise_level BETWEEN 1 AND 10),
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out_time TIMESTAMPTZ DEFAULT NULL,
    CHECK (check_out_time IS NULL OR check_out_time >= check_in_time),
    CONSTRAINT check_ins_ratings_state_check CHECK (
        (check_out_time IS NULL AND crowd_level IS NULL AND noise_level IS NULL)
        OR
        (check_out_time IS NOT NULL AND crowd_level IS NOT NULL AND noise_level IS NOT NULL)
    )
);

-- Enforce one active check-in even when requests arrive concurrently.
CREATE UNIQUE INDEX check_ins_one_active_per_user
    ON public.check_ins (user_id)
    WHERE check_out_time IS NULL;

CREATE INDEX idx_check_ins_user_history
    ON public.check_ins (user_id, check_in_time DESC, id DESC);
CREATE INDEX idx_check_ins_spot_id ON public.check_ins(spot_id);

ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
