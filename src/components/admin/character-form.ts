import type { CharacterInsert, CharacterRecord, CharacterStatus } from "@/types/database";

/** Stato del form dell'editor personaggi (tutto serializzabile). */
export type CharacterFormState = {
  name: string;
  display_name: string;
  slug: string;
  tagline: string;
  description: string;
  greeting: string;
  biography: string;
  age: string;
  gender: string;
  nationality: string;
  language: string;
  profession: string;
  avatar: string;
  hair_color: string;
  eye_color: string;
  height_cm: string;
  clothing_style: string;
  tags: string[];
  interests: string[];
  traits: Record<TraitKey, number>;
  style_message_length: MessageLength;
  style_emoji_usage: number;
  style_gif_usage: number;
  style_nickname_usage: number;
  style_asks_questions: number;
  style_typing_speed: number;
  style_formality: number;
  memory_user_name: boolean;
  memory_past_conversations: boolean;
  memory_preferences: boolean;
  memory_birthday: boolean;
  memory_favorite_topics: boolean;
  system_prompt: string;
  character_instructions: string;
  conversation_examples: string;
  forbidden_behaviors: string;
  hidden_instructions: string;
  status: CharacterStatus;
  is_hidden: boolean;
  is_featured: boolean;
  is_premium: boolean;
  is_new: boolean;
};

export const TRAITS = [
  { key: "trait_romantic", label: "Romantico" },
  { key: "trait_funny", label: "Divertente" },
  { key: "trait_intelligent", label: "Intelligente" },
  { key: "trait_playful", label: "Giocoso" },
  { key: "trait_flirty", label: "Civettuolo" },
  { key: "trait_caring", label: "Premuroso" },
  { key: "trait_confident", label: "Sicuro di sé" },
  { key: "trait_shy", label: "Timido" },
  { key: "trait_curious", label: "Curioso" },
  { key: "trait_emotional", label: "Emotivo" },
  { key: "trait_jealous", label: "Geloso" },
  { key: "trait_dominant", label: "Dominante" },
] as const;

export type TraitKey = (typeof TRAITS)[number]["key"];

export const MESSAGE_LENGTHS = [
  { value: "short", label: "Brevi" },
  { value: "medium", label: "Medi" },
  { value: "long", label: "Lunghi" },
] as const;

export type MessageLength = (typeof MESSAGE_LENGTHS)[number]["value"];

export const GENDERS = ["Femmina", "Maschio", "Non binario", "Altro"];
export const LANGUAGES = ["Italiano", "Inglese", "Spagnolo", "Francese", "Tedesco", "Portoghese"];

export const SUGGESTED_INTERESTS = [
  "Cinema",
  "Musica",
  "Viaggi",
  "Cucina",
  "Sport",
  "Lettura",
  "Gaming",
  "Fotografia",
  "Arte",
  "Moda",
  "Tecnologia",
  "Natura",
  "Fitness",
  "Astrologia",
  "Poesia",
];

export const STATUSES: { value: CharacterStatus; label: string }[] = [
  { value: "active", label: "Attivo" },
  { value: "draft", label: "Bozza" },
  { value: "archived", label: "Archiviato" },
];

const defaultTraits = (): Record<TraitKey, number> =>
  Object.fromEntries(TRAITS.map((t) => [t.key, 5])) as Record<TraitKey, number>;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export function emptyForm(): CharacterFormState {
  return {
    name: "",
    display_name: "",
    slug: "",
    tagline: "",
    description: "",
    greeting: "",
    biography: "",
    age: "",
    gender: "Femmina",
    nationality: "",
    language: "Italiano",
    profession: "",
    avatar: "",
    hair_color: "",
    eye_color: "",
    height_cm: "",
    clothing_style: "",
    tags: [],
    interests: [],
    traits: defaultTraits(),
    style_message_length: "medium",
    style_emoji_usage: 3,
    style_gif_usage: 2,
    style_nickname_usage: 4,
    style_asks_questions: 6,
    style_typing_speed: 5,
    style_formality: 3,
    memory_user_name: true,
    memory_past_conversations: true,
    memory_preferences: true,
    memory_birthday: false,
    memory_favorite_topics: true,
    system_prompt: "",
    character_instructions: "",
    conversation_examples: "",
    forbidden_behaviors: "",
    hidden_instructions: "",
    status: "draft",
    is_hidden: false,
    is_featured: false,
    is_premium: false,
    is_new: true,
  };
}

const str = (v: string | number | null | undefined) => (v == null ? "" : String(v));

export function formFromRecord(r: CharacterRecord): CharacterFormState {
  return {
    name: r.name,
    display_name: str(r.display_name),
    slug: r.slug,
    tagline: str(r.tagline),
    description: r.description,
    greeting: str(r.greeting),
    biography: str(r.biography),
    age: str(r.age),
    gender: str(r.gender) || "Femmina",
    nationality: str(r.nationality),
    language: str(r.language) || "Italiano",
    profession: str(r.profession),
    avatar: str(r.avatar),
    hair_color: str(r.hair_color),
    eye_color: str(r.eye_color),
    height_cm: str(r.height_cm),
    clothing_style: str(r.clothing_style),
    tags: r.tags ?? [],
    interests: r.interests ?? [],
    traits: Object.fromEntries(TRAITS.map((t) => [t.key, r[t.key] ?? 5])) as Record<TraitKey, number>,
    style_message_length: (r.style_message_length as MessageLength) || "medium",
    style_emoji_usage: r.style_emoji_usage ?? 3,
    style_gif_usage: r.style_gif_usage ?? 2,
    style_nickname_usage: r.style_nickname_usage ?? 4,
    style_asks_questions: r.style_asks_questions ?? 6,
    style_typing_speed: r.style_typing_speed ?? 5,
    style_formality: r.style_formality ?? 3,
    memory_user_name: r.memory_user_name ?? true,
    memory_past_conversations: r.memory_past_conversations ?? true,
    memory_preferences: r.memory_preferences ?? true,
    memory_birthday: r.memory_birthday ?? false,
    memory_favorite_topics: r.memory_favorite_topics ?? true,
    system_prompt: str(r.system_prompt),
    character_instructions: str(r.character_instructions),
    conversation_examples: str(r.conversation_examples),
    forbidden_behaviors: str(r.forbidden_behaviors),
    hidden_instructions: str(r.hidden_instructions),
    status: r.status,
    is_hidden: r.is_hidden ?? false,
    is_featured: r.is_featured ?? false,
    is_premium: r.is_premium ?? false,
    is_new: r.is_new ?? false,
  };
}

const nullable = (v: string) => (v.trim() === "" ? null : v.trim());
const numOrNull = (v: string) => {
  const n = Number(v);
  return v.trim() === "" || Number.isNaN(n) ? null : n;
};

/** Converte lo stato del form in payload per il database. */
export function toPayload(s: CharacterFormState): CharacterInsert {
  return {
    slug: s.slug.trim() || slugify(s.name),
    name: s.name.trim(),
    display_name: nullable(s.display_name),
    tagline: nullable(s.tagline),
    description: s.description.trim(),
    greeting: nullable(s.greeting),
    biography: s.biography.trim(),
    age: numOrNull(s.age),
    gender: nullable(s.gender),
    nationality: nullable(s.nationality),
    language: s.language,
    profession: nullable(s.profession),
    avatar: nullable(s.avatar),
    hair_color: nullable(s.hair_color),
    eye_color: nullable(s.eye_color),
    height_cm: numOrNull(s.height_cm),
    clothing_style: nullable(s.clothing_style),
    // Sintesi auto-generata dai tratti: base per i futuri prompt OpenAI.
    personality: TRAITS.map((t) => `${t.label} ${s.traits[t.key]}/10`).join(", "),
    tags: s.tags,
    interests: s.interests,
    ...s.traits,
    style_message_length: s.style_message_length,
    style_emoji_usage: s.style_emoji_usage,
    style_gif_usage: s.style_gif_usage,
    style_nickname_usage: s.style_nickname_usage,
    style_asks_questions: s.style_asks_questions,
    style_typing_speed: s.style_typing_speed,
    style_formality: s.style_formality,
    memory_user_name: s.memory_user_name,
    memory_past_conversations: s.memory_past_conversations,
    memory_preferences: s.memory_preferences,
    memory_birthday: s.memory_birthday,
    memory_favorite_topics: s.memory_favorite_topics,
    system_prompt: s.system_prompt,
    character_instructions: s.character_instructions,
    conversation_examples: s.conversation_examples,
    forbidden_behaviors: s.forbidden_behaviors,
    hidden_instructions: s.hidden_instructions,
    status: s.status,
    is_hidden: s.is_hidden,
    is_featured: s.is_featured,
    is_premium: s.is_premium,
    is_new: s.is_new,
  };
}
