-- 1. Stato dei messaggi -------------------------------------------------
CREATE TYPE public.message_status AS ENUM ('pending', 'processing', 'delivered', 'failed');

ALTER TABLE public.messages
  ADD COLUMN status public.message_status NOT NULL DEFAULT 'delivered',
  ADD COLUMN deliver_at timestamp with time zone,
  ADD COLUMN reply_to_message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE,
  ADD COLUMN error text;

-- Un solo job IA per messaggio utente (niente risposte duplicate).
CREATE UNIQUE INDEX messages_one_job_per_user_message
  ON public.messages (reply_to_message_id)
  WHERE reply_to_message_id IS NOT NULL;

CREATE INDEX messages_due_jobs_idx
  ON public.messages (deliver_at)
  WHERE status = 'pending';

-- 2. Riepiloghi conversazione -------------------------------------------
CREATE TABLE public.conversation_summaries (
  conversation_id uuid PRIMARY KEY REFERENCES public.conversations(id) ON DELETE CASCADE,
  summary text NOT NULL DEFAULT '',
  summarized_until timestamp with time zone,
  message_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.conversation_summaries TO authenticated;
GRANT ALL ON public.conversation_summaries TO service_role;
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own conversation summaries"
  ON public.conversation_summaries FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c
                 WHERE c.id = conversation_summaries.conversation_id AND c.user_id = auth.uid()));

CREATE TRIGGER conversation_summaries_set_updated_at
  BEFORE UPDATE ON public.conversation_summaries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Memoria a lungo termine utente/personaggio --------------------------
CREATE TABLE public.user_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  memory text NOT NULL,
  category text NOT NULL DEFAULT 'altro',
  importance smallint NOT NULL DEFAULT 5,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_used_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX user_memories_lookup_idx
  ON public.user_memories (user_id, character_id, importance DESC, last_used_at DESC);

GRANT SELECT, DELETE ON public.user_memories TO authenticated;
GRANT ALL ON public.user_memories TO service_role;
ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own memories"
  ON public.user_memories FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
  ON public.user_memories FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER user_memories_set_updated_at
  BEFORE UPDATE ON public.user_memories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Configurazione interna per l'attività pianificata -------------------
CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.app_config (
  key text PRIMARY KEY,
  value text NOT NULL
);

INSERT INTO private.app_config (key, value)
VALUES ('cron_secret', encode(gen_random_bytes(24), 'hex'))
ON CONFLICT (key) DO NOTHING;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION private.dispatch_ai_replies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public, extensions
AS $$
DECLARE secret text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.messages WHERE status = 'pending' AND deliver_at <= now()) THEN
    RETURN;
  END IF;
  SELECT value INTO secret FROM private.app_config WHERE key = 'cron_secret';
  PERFORM extensions.net_http_post(
    -- Endpoint superseded by migration 20260822020000: dispatch_ai_replies() now
    -- reads the URL from private.app_config('ai_replies_endpoint'). This placeholder
    -- only exists for the historical record; the function is redefined below.
    url := 'https://placeholder-set-ai_replies_endpoint.invalid/api/public/ai-replies',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
END; $$;

SELECT cron.schedule('flirtspace-ai-replies', '* * * * *', $$SELECT private.dispatch_ai_replies();$$);