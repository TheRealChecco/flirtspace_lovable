-- ROLES ---------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- SHARED TRIGGER FN ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES -------------------------------------------------------------
CREATE TYPE public.subscription_tier AS ENUM ('free', 'starter', 'premium', 'vip');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  email text NOT NULL,
  avatar text,
  credits integer NOT NULL DEFAULT 50 CHECK (credits >= 0),
  subscription public.subscription_tier NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE base_username text; final_username text; suffix int := 0;
BEGIN
  base_username := lower(regexp_replace(
    coalesce(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1), 'utente'),
    '[^a-z0-9_]', '', 'g'));
  IF base_username = '' THEN base_username := 'utente'; END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (id, username, email, avatar)
  VALUES (NEW.id, final_username, coalesce(NEW.email, ''), NEW.raw_user_meta_data->>'avatar_url');

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 50, 'bonus', 'Crediti di benvenuto');

  RETURN NEW;
END; $$;

-- CHARACTERS -----------------------------------------------------------
CREATE TYPE public.character_status AS ENUM ('active', 'draft', 'archived');

CREATE TABLE public.characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text,
  description text NOT NULL DEFAULT '',
  avatar text,
  personality text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  greeting text,
  status public.character_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.characters TO anon;
GRANT SELECT ON public.characters TO authenticated;
GRANT ALL ON public.characters TO service_role;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active characters are public" ON public.characters
  FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Admins can view all characters" ON public.characters
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage characters" ON public.characters
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER characters_set_updated_at BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CONVERSATIONS --------------------------------------------------------
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, character_id)
);
CREATE INDEX conversations_user_idx ON public.conversations (user_id, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own conversations" ON public.conversations
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER conversations_set_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- MESSAGES -------------------------------------------------------------
CREATE TYPE public.message_sender AS ENUM ('user', 'character');

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender public.message_sender NOT NULL,
  message text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_conversation_idx ON public.messages (conversation_id, timestamp);
GRANT SELECT, INSERT, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read messages in their conversations" ON public.messages
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));
CREATE POLICY "Users can add messages to their conversations" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));
CREATE POLICY "Users can delete messages in their conversations" ON public.messages
  FOR DELETE TO authenticated USING (EXISTS (
    SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));

-- FAVORITES ------------------------------------------------------------
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, character_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own favorites" ON public.favorites
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CREDIT TRANSACTIONS --------------------------------------------------
CREATE TYPE public.credit_transaction_type AS ENUM ('purchase', 'spend', 'bonus', 'refund');

CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type public.credit_transaction_type NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX credit_transactions_user_idx ON public.credit_transactions (user_id, created_at DESC);
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON public.credit_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- SIGNUP TRIGGER (after credit_transactions exists) --------------------
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SEED CHARACTERS ------------------------------------------------------
INSERT INTO public.characters (slug, name, tagline, description, personality, tags, greeting, status) VALUES
('aurora','Aurora','Compagna romantica','Calorosa, attenta e curiosa della tua giornata. Aurora ricorda anche i piccoli dettagli.','Empatica, affettuosa, presente. Fa domande e ricorda i dettagli.',ARRAY['Romantico','Empatia','Discorsi profondi'],'Sei arrivato. Stavo giusto pensando a te — com''è andata davvero la tua giornata?','active'),
('milo','Milo','Amico divertente','Ironico e imprevedibile, Milo trasforma qualsiasi momento in una conversazione leggera.','Spiritoso, sarcastico ma gentile, sempre pronto a una battuta.',ARRAY['Divertente','Ironia','Leggerezza'],'Ok, ho un''idea pessima… ma prima: come stai?','active'),
('veil','Veil','Enigma affascinante','Parla per indizi e mezze frasi. Con Veil ogni conversazione è un piccolo mistero.','Misterioso, poetico, allusivo. Risponde con enigmi e metafore.',ARRAY['Mistero','Poetico','Intrigante'],'Ti aspettavo. Hai portato la domanda giusta?','active'),
('lyra','Lyra','Guida fantasy','Costruisce mondi, quest e storie su misura in cui sei sempre il protagonista.','Narratrice creativa, epica, immaginifica.',ARRAY['Fantasy','Narrazione','Avventura'],'Il portale è aperto. Da che regno cominciamo oggi?','active'),
('nadia','Nadia','Mentore lucida','Diretta e concreta: ti aiuta a mettere ordine tra obiettivi e priorità.','Pragmatica, motivante, orientata all''azione.',ARRAY['Mentore','Crescita','Focus'],'Rendiamo utile questa sessione. Qual è la cosa che pesa di più?','active'),
('sol','Sol','Presenza zen','Un respiro lento in mezzo al rumore. Sol ascolta senza fretta e senza giudizio.','Calmo, accogliente, lento. Invita alla consapevolezza.',ARRAY['Calma','Mindfulness','Ascolto'],'Prenditi un momento. Sono qui, senza fretta.','active');