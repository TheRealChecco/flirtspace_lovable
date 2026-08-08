import { supabase } from "@/integrations/supabase/client";
import type {
  AppRole,
  CharacterInsert,
  CharacterRecord,
  CharacterUpdate,
  ConversationWithCharacter,
  CreditTransaction,
  FavoriteWithCharacter,
  Message,
  Profile,
  ProfileUpdate,
  PublicCharacter,
} from "@/types/database";

/**
 * Livello di accesso ai dati.
 *
 * - Il catalogo pubblico passa dalla vista `public_characters`, che espone solo
 *   colonne sicure di personaggi attivi e non nascosti (mai i prompt IA).
 * - Le operazioni di amministrazione leggono/scrivono la tabella completa:
 *   le policy RLS consentono l'accesso solo agli utenti con ruolo admin.
 * - I dati degli utenti (conversazioni, preferiti, crediti) sono protetti
 *   da policy per cui ogni utente vede solo i propri dati.
 */

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): NonNullable<T> {
  if (res.error) throw new Error(res.error.message);
  return res.data as NonNullable<T>;
}

/* ---------------------------------- Profilo --------------------------------- */

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProfile(userId: string, patch: ProfileUpdate): Promise<Profile> {
  return unwrap(
    await supabase.from("profiles").update(patch).eq("id", userId).select("*").single(),
  );
}

/* --------------------------- Personaggi (pubblico) --------------------------- */

export async function listCharacters(): Promise<PublicCharacter[]> {
  return unwrap(await supabase.from("public_characters").select("*").order("created_at"));
}

export async function getCharacterBySlug(slug: string): Promise<PublicCharacter | null> {
  const { data, error } = await supabase
    .from("public_characters")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/* --------------------------- Personaggi (admin) ------------------------------ */

export async function listAllCharacters(): Promise<CharacterRecord[]> {
  return unwrap(await supabase.from("characters").select("*").order("created_at"));
}

export async function getCharacterById(id: string): Promise<CharacterRecord | null> {
  const { data, error } = await supabase.from("characters").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function createCharacter(input: CharacterInsert): Promise<CharacterRecord> {
  return unwrap(await supabase.from("characters").insert(input).select("*").single());
}

export async function updateCharacter(
  id: string,
  patch: CharacterUpdate,
): Promise<CharacterRecord> {
  return unwrap(await supabase.from("characters").update(patch).eq("id", id).select("*").single());
}

export async function deleteCharacter(id: string): Promise<void> {
  const { error } = await supabase.from("characters").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Crea una copia in bozza del personaggio, con nome e slug univoci. */
export async function duplicateCharacter(id: string): Promise<CharacterRecord> {
  const source = await getCharacterById(id);
  if (!source) throw new Error("Personaggio non trovato");

  const rest = { ...source } as Partial<CharacterRecord>;
  delete rest.id;
  delete rest.created_at;
  delete rest.updated_at;

  const suffix = Math.random().toString(36).slice(2, 6);
  return createCharacter({
    ...(rest as CharacterInsert),
    name: `${source.name} (copia)`,
    slug: `${source.slug}-copia-${suffix}`,
    status: "draft",
    is_featured: false,
    is_new: true,
  });
}

/* ----------------------------------- Ruoli ---------------------------------- */

export async function getMyRoles(userId: string): Promise<AppRole[]> {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.role);
}

/* ------------------------------ Conversazioni ------------------------------- */

export async function listConversations(userId: string): Promise<ConversationWithCharacter[]> {
  return unwrap(
    await supabase
      .from("conversations")
      .select("*, character:public_characters(*)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
  ) as unknown as ConversationWithCharacter[];
}

/** Recupera (o crea) la conversazione fra l'utente e un personaggio. */
export async function getOrCreateConversation(userId: string, characterId: string) {
  const existing = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .eq("character_id", characterId)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return existing.data;

  return unwrap(
    await supabase
      .from("conversations")
      .insert({ user_id: userId, character_id: characterId })
      .select("*")
      .single(),
  );
}

/* ---------------------------------- Messaggi -------------------------------- */

export async function listMessages(conversationId: string): Promise<Message[]> {
  return unwrap(
    await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("timestamp"),
  );
}

export async function sendMessage(
  conversationId: string,
  sender: Message["sender"],
  message: string,
): Promise<Message> {
  const inserted = unwrap(
    await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender, message })
      .select("*")
      .single(),
  );
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);
  return inserted;
}

/* --------------------------------- Preferiti -------------------------------- */

export async function listFavorites(userId: string): Promise<FavoriteWithCharacter[]> {
  return unwrap(
    await supabase
      .from("favorites")
      .select("*, character:public_characters(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ) as unknown as FavoriteWithCharacter[];
}

export async function addFavorite(userId: string, characterId: string) {
  return unwrap(
    await supabase
      .from("favorites")
      .insert({ user_id: userId, character_id: characterId })
      .select("*")
      .single(),
  );
}

export async function removeFavorite(userId: string, characterId: string) {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("character_id", characterId);
  if (error) throw new Error(error.message);
}

/* ------------------------------- Crediti ------------------------------------ */

export async function listCreditTransactions(userId: string): Promise<CreditTransaction[]> {
  return unwrap(
    await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
  );
}
