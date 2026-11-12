-- Development-data cleanup: no real check-in data exists at this rollout.
-- Confirm this assumption before applying to any other environment.
-- Never fabricate scores for existing unrated sessions.
DELETE FROM public.check_ins
WHERE crowd_level IS NULL OR noise_level IS NULL;

ALTER TABLE public.check_ins
    DROP CONSTRAINT check_ins_ratings_state_check,
    ALTER COLUMN crowd_level SET NOT NULL,
    ALTER COLUMN noise_level SET NOT NULL;

COMMENT ON COLUMN public.check_ins.crowd_level IS
    'Crowdedness score (API busyness), integer 1-10, required at check-in and updateable while active.';
COMMENT ON COLUMN public.check_ins.noise_level IS
    'Noise score, integer 1-10, required at check-in and updateable while active.';
