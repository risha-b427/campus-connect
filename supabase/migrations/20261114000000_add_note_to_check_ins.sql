-- "What are you working on?" text shown with a check-in.
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS note TEXT;