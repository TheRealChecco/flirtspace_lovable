import { supabase } from "@/integrations/supabase/client";
import type {
  CharacterRecord,
  ConversationWithCharacter,
  CreditTransaction,
  FavoriteWithCharacter,
  Message,
  Profile,
  ProfileUpdate,
} from "@/types/database";

/**
 * Livello di accesso ai dati. Tutte le query passano dalle policy di sicurezza
 * del database, quindi ogni utente vede solo i propri dati.
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

/* -------------------------------- Personaggi -------------------------------- */

export async function listCharacters(): Promise<CharacterRecord[]> {
  return unwrap(
    await supabase.from("characters").select("*").eq("status", "active").order("created_at"),
  );
}

export async function getCharacterBySlug(slug: string): Promise<CharacterRecord | null> {
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/* ------------------------------ Conversazioni ------------------------------- */

export async function listConversations(userId: string): Promise<ConversationWithCharacter[]> {
  return unwrap(
    await supabase
      .from("conversations")
      .select("*, character:characters(*)")
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
      .select("*, character:characters(*)")
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
