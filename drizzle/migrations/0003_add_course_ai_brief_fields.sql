ALTER TABLE public.courses
ADD COLUMN topics text[] NOT NULL DEFAULT '{}'::text[],
ADD COLUMN target_audience text NOT NULL DEFAULT '';