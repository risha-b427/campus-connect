CREATE TABLE public.check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    spot_id UUID NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
    crowd_level INT NOT NULL CHECK (crowd_level BETWEEN 1 AND 10),
    noise_level INT NOT NULL CHECK (noise_level BETWEEN 1 AND 10),
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out_time TIMESTAMPTZ DEFAULT NULL,
    CHECK (check_out_time IS NULL OR check_out_time >= check_in_time)
);

CREATE INDEX idx_check_ins_user_id ON public.check_ins(user_id);
CREATE INDEX idx_check_ins_spot_id ON public.check_ins(spot_id);

ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
