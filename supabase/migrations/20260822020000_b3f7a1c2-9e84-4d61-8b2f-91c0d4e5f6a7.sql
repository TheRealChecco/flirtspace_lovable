-- Rende configurabile l'endpoint del cron che consegna le risposte IA pianificate.
-- Prima l'URL dell'app era hardcoded a un ambiente di preview esterno, il che
-- legava il database a un host specifico e non portabile. Ora l'URL viene letto
-- da private.app_config (chiave 'ai_replies_endpoint'): impostalo al tuo dominio
-- di produzione (es. https://flirtspace.example.workers.dev) quando fai il deploy.
-- Se vuoto, il cron salta la chiamata senza errori (le risposte vengono comunque
-- consegnate dal polling lato client quando l'utente ha la chat aperta).

INSERT INTO private.app_config (key, value)
VALUES ('ai_replies_endpoint', '')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION private.dispatch_ai_replies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public, extensions
AS $$
DECLARE
  secret text;
  endpoint text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.messages WHERE status = 'pending' AND deliver_at <= now()) THEN
    RETURN;
  END IF;

  SELECT value INTO secret FROM private.app_config WHERE key = 'cron_secret';
  SELECT value INTO endpoint FROM private.app_config WHERE key = 'ai_replies_endpoint';

  -- Nessun endpoint configurato: nulla da fare (il polling client gestisce le risposte a chat aperta).
  IF endpoint IS NULL OR endpoint = '' THEN
    RETURN;
  END IF;

  PERFORM extensions.net_http_post(
    url := endpoint,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
END;
$$;

REVOKE ALL ON FUNCTION private.dispatch_ai_replies() FROM public, anon, authenticated;
