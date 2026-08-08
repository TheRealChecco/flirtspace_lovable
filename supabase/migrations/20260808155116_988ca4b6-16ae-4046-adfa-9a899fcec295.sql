ALTER TABLE public.characters
  ADD COLUMN display_name text,
  ADD COLUMN age integer,
  ADD COLUMN gender text,
  ADD COLUMN nationality text,
  ADD COLUMN language text NOT NULL DEFAULT 'Italiano',
  ADD COLUMN profession text,
  ADD COLUMN biography text NOT NULL DEFAULT '',
  ADD COLUMN hair_color text,
  ADD COLUMN eye_color text,
  ADD COLUMN height_cm integer,
  ADD COLUMN clothing_style text,
  ADD COLUMN trait_romantic smallint NOT NULL DEFAULT 5,
  ADD COLUMN trait_funny smallint NOT NULL DEFAULT 5,
  ADD COLUMN trait_intelligent smallint NOT NULL DEFAULT 5,
  ADD COLUMN trait_playful smallint NOT NULL DEFAULT 5,
  ADD COLUMN trait_flirty smallint NOT NULL DEFAULT 5,
  ADD COLUMN trait_caring smallint NOT NULL DEFAULT 5,
  ADD COLUMN trait_confident smallint NOT NULL DEFAULT 5,
  ADD COLUMN trait_shy smallint NOT NULL DEFAULT 5,
  ADD COLUMN trait_curious smallint NOT NULL DEFAULT 5,
  ADD COLUMN trait_emotional smallint NOT NULL DEFAULT 5,
  ADD COLUMN trait_jealous smallint NOT NULL DEFAULT 5,
  ADD COLUMN trait_dominant smallint NOT NULL DEFAULT 5,
  ADD COLUMN style_message_length text NOT NULL DEFAULT 'media',
  ADD COLUMN style_emoji_usage smallint NOT NULL DEFAULT 5,
  ADD COLUMN style_gif_usage smallint NOT NULL DEFAULT 0,
  ADD COLUMN style_nickname_usage smallint NOT NULL DEFAULT 3,
  ADD COLUMN style_asks_questions smallint NOT NULL DEFAULT 5,
  ADD COLUMN style_typing_speed smallint NOT NULL DEFAULT 5,
  ADD COLUMN style_formality smallint NOT NULL DEFAULT 4,
  ADD COLUMN interests text[] NOT NULL DEFAULT '{}',
  ADD COLUMN memory_user_name boolean NOT NULL DEFAULT true,
  ADD COLUMN memory_past_conversations boolean NOT NULL DEFAULT true,
  ADD COLUMN memory_preferences boolean NOT NULL DEFAULT true,
  ADD COLUMN memory_birthdays boolean NOT NULL DEFAULT false,
  ADD COLUMN memory_favorite_topics boolean NOT NULL DEFAULT true,
  ADD COLUMN system_prompt text NOT NULL DEFAULT '',
  ADD COLUMN character_instructions text NOT NULL DEFAULT '',
  ADD COLUMN conversation_examples text NOT NULL DEFAULT '',
  ADD COLUMN forbidden_behaviors text NOT NULL DEFAULT '',
  ADD COLUMN hidden_instructions text NOT NULL DEFAULT '',
  ADD COLUMN is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN is_premium boolean NOT NULL DEFAULT false,
  ADD COLUMN is_new boolean NOT NULL DEFAULT true;

ALTER TABLE public.characters ADD CONSTRAINT characters_slider_range CHECK (
  trait_romantic BETWEEN 0 AND 10 AND trait_funny BETWEEN 0 AND 10 AND
  trait_intelligent BETWEEN 0 AND 10 AND trait_playful BETWEEN 0 AND 10 AND
  trait_flirty BETWEEN 0 AND 10 AND trait_caring BETWEEN 0 AND 10 AND
  trait_confident BETWEEN 0 AND 10 AND trait_shy BETWEEN 0 AND 10 AND
  trait_curious BETWEEN 0 AND 10 AND trait_emotional BETWEEN 0 AND 10 AND
  trait_jealous BETWEEN 0 AND 10 AND trait_dominant BETWEEN 0 AND 10 AND
  style_emoji_usage BETWEEN 0 AND 10 AND style_gif_usage BETWEEN 0 AND 10 AND
  style_nickname_usage BETWEEN 0 AND 10 AND style_asks_questions BETWEEN 0 AND 10 AND
  style_typing_speed BETWEEN 0 AND 10 AND style_formality BETWEEN 0 AND 10
);

DROP POLICY "Active characters are public" ON public.characters;
CREATE POLICY "Active characters are public" ON public.characters FOR SELECT TO anon, authenticated
  USING (status = 'active'::character_status AND NOT is_hidden);