ALTER TABLE public.courses
ADD COLUMN learning_outcomes text[] NOT NULL DEFAULT '{}'::text[];