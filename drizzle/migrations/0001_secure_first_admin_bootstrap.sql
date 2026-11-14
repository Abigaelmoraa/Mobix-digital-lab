CREATE TABLE public.mobix_admin_bootstrap (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  completed_by uuid NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT ALL ON TABLE public.mobix_admin_bootstrap TO service_role;
ALTER TABLE public.mobix_admin_bootstrap ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.claim_mobix_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  caller_id uuid := auth.uid();
  caller_email text;
  caller_email_verified boolean;
  existing_admin_id uuid;
BEGIN
  SELECT pg_catalog.lower(u.email), (u.email_confirmed_at IS NOT NULL)
    INTO caller_email, caller_email_verified
    FROM auth.users AS u
    WHERE u.id = caller_id;

  IF caller_id IS NULL
     OR caller_email IS DISTINCT FROM 'samwelobanyi@yahoo.com'
     OR caller_email_verified IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Not authorized to initialize studio access'
      USING ERRCODE = '42501';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('mobix_first_admin_setup', 0)
  );

  IF EXISTS (SELECT 1 FROM public.mobix_admin_bootstrap) THEN
    RETURN false;
  END IF;

  SELECT ur.user_id
    INTO existing_admin_id
    FROM public.user_roles AS ur
    WHERE ur.role IN ('admin'::public.app_role, 'super_admin'::public.app_role)
    ORDER BY ur.created_at
    LIMIT 1;

  IF existing_admin_id IS NOT NULL THEN
    INSERT INTO public.mobix_admin_bootstrap (id, completed_by)
    VALUES (true, existing_admin_id)
    ON CONFLICT (id) DO NOTHING;
    RETURN false;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (caller_id, 'super_admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.mobix_admin_bootstrap (id, completed_by)
  VALUES (true, caller_id);

  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.claim_mobix_first_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_mobix_first_admin() TO authenticated;