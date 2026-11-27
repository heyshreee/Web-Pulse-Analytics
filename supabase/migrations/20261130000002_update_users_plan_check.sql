-- Allow canonical plan IDs (nano, lite, pro, max, enterprise) alongside legacy aliases
-- (free, basic, business) in public.users.plan.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE public.users
    ADD CONSTRAINT users_plan_check
    CHECK (plan = ANY (ARRAY[
        'free'::text,
        'basic'::text,
        'nano'::text,
        'lite'::text,
        'pro'::text,
        'business'::text,
        'max'::text,
        'enterprise'::text
    ]));
