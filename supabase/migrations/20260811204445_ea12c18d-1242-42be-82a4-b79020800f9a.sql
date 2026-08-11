CREATE OR REPLACE FUNCTION public.verify_cron_secret(_secret text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = private, public
AS $$
  SELECT EXISTS (SELECT 1 FROM private.app_config WHERE key = 'cron_secret' AND value = _secret);
$$;

REVOKE ALL ON FUNCTION public.verify_cron_secret(text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_cron_secret(text) TO service_role;