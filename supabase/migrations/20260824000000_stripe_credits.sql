-- Stripe: crediti per acquisti una tantum.
-- Riutilizza il sistema crediti esistente (profiles.credits + credit_transactions)
-- aggiungendo solo l'idempotenza e l'accredito atomico lato server.
-- Nessun nuovo sistema parallelo: il saldo resta profiles.credits, il ledger
-- resta credit_transactions. Il client non può chiamare queste funzioni.

-- Traccia gli eventi Stripe già elaborati (idempotenza webhook).
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.stripe_events TO service_role;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
-- Nessuna policy per anon/authenticated: solo service_role (webhook lato server).
-- Il client non può né leggere né scrivere questa tabella.

-- Accredito atomico e idempotente dei crediti per un acquisto Stripe.
-- Tutto in una transazione: marcatore idempotenza + saldo + ledger.
-- Restituisce TRUE se accreditato, FALSE se l'evento era già stato elaborato.
CREATE OR REPLACE FUNCTION public.grant_stripe_credits(
  p_user_id uuid,
  p_amount integer,
  p_event_id text,
  p_description text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE inserted boolean;
BEGIN
  IF p_amount <= 0 OR p_event_id IS NULL OR p_event_id = '' OR p_user_id IS NULL THEN
    RAISE EXCEPTION 'Parametri non validi per grant_stripe_credits';
  END IF;

  INSERT INTO public.stripe_events (stripe_event_id, user_id, amount)
  VALUES (p_event_id, p_user_id, p_amount)
  ON CONFLICT (stripe_event_id) DO NOTHING
  RETURNING TRUE INTO inserted;

  IF inserted IS NULL THEN
    RETURN FALSE;  -- evento già elaborato (webhook duplicato)
  END IF;

  UPDATE public.profiles SET credits = credits + p_amount WHERE id = p_user_id;
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, 'purchase', p_description);

  RETURN TRUE;
END;
$$;
GRANT EXECUTE ON FUNCTION public.grant_stripe_credits(uuid, integer, text, text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.grant_stripe_credits(uuid, integer, text, text) FROM anon, authenticated, public;
