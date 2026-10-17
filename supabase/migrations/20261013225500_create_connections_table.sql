CREATE TABLE public.connections (
    user_1 UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    user_2 UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    PRIMARY KEY (user_1, user_2),
    CHECK (user_1 < user_2)
);

CREATE INDEX idx_connections_user_2 ON public.connections(user_2);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
