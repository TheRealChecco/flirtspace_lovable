DROP POLICY "Active characters are public" ON public.characters;

CREATE OR REPLACE VIEW public.public_characters AS
SELECT
  id, slug, name, tagline, description, avatar, personality, tags, greeting,
  status, created_at,
  display_name, age, gender, nationality, language, profession, biography,
  hair_color, eye_color, height_cm, clothing_style, interests,
  is_featured, is_premium, is_new
FROM public.characters
WHERE status = 'active'::character_status AND NOT is_hidden;

GRANT SELECT ON public.public_characters TO anon, authenticated;
GRANT SELECT ON public.public_characters TO service_role;