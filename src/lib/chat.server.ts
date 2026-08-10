import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { ChatTurn } from "@/lib/ai.server";
import type {
  CharacterRecord,
  Conversation,
  Message,
  MessageSender,
  PublicCharacter,
} from "@/types/database";

/**
 * Helper lato server per la chat. Le query utente passano dal client
 * autenticato (RLS applicata come l'utente); solo la lettura del personaggio
 * completo (prompt IA) usa il client privilegiato, perché quelle colonne
 * non devono mai essere esposte ai client.
 */
export type UserClient = SupabaseClient<Database>;

/** Quanti messaggi recenti compongono il contesto inviato al modello. */
export const HISTORY_LIMIT = 40;

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): NonNullable<T> {
  if (res.error) throw new Error(res.error.message);
  return res.data as NonNullable<T>;
}

export async function findPublicCharacter(
  client: UserClient,
  slug: string,
): Promise<PublicCharacter | null> {
  const { data, error } = await client
    .from("public_characters")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/** Conversazione dell'utente corrente: la RLS garantisce che sia sua. */
export async function getOwnedConversation(
  client: UserClient,
  conversationId: string,
): Promise<Conversation | null> {
  const { data, error } = await client
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getOrCreateConversation(
  client: UserClient,
  userId: string,
  characterId: string,
): Promise<Conversation> {
  const existing = await client
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .eq("character_id", characterId)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return existing.data;

  return unwrap(
    await client
      .from("conversations")
      .insert({ user_id: userId, character_id: characterId })
      .select("*")
      .single(),
  );
}

/** Inserisce il saluto del personaggio come primo messaggio, solo a chat vuota. */
export async function ensureGreeting(
  client: UserClient,
  conversationId: string,
  greeting: string | null,
): Promise<void> {
  const text = greeting?.trim();
  if (!text) return;
  const { count, error } = await client
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId);
  if (error) throw new Error(error.message);
  if ((count ?? 0) > 0) return;
  await insertChatMessage(client, conversationId, "character", text);
}

export async function listMessages(
  client: UserClient,
  conversationId: string,
  limit?: number,
): Promise<Message[]> {
  if (!limit) {
    return unwrap(
      await client
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("timestamp"),
    );
  }
  const latest = unwrap(
    await client
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("timestamp", { ascending: false })
      .limit(limit),
  );
  return latest.reverse();
}

export async function insertChatMessage(
  client: UserClient,
  conversationId: string,
  sender: MessageSender,
  text: string,
): Promise<Message> {
  return unwrap(
    await client
      .from("messages")
      .insert({ conversation_id: conversationId, sender, message: text })
      .select("*")
      .single(),
  );
}

export async function touchConversation(client: UserClient, conversationId: string): Promise<void> {
  await client
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);
}

/**
 * Carica il personaggio completo (inclusi i prompt IA) con il client
 * privilegiato: la tabella base è leggibile solo dagli admin via RLS,
 * ma qui i dati restano sul server e non vengono mai restituiti al client.
 */
export async function loadFullCharacter(characterId: string): Promise<CharacterRecord | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("characters")
    .select("*")
    .eq("id", characterId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/** Converte lo storico del database nei turni per il modello. */
export function toChatTurns(messages: Message[]): ChatTurn[] {
  return messages.map((m) => ({
    role: m.sender === "user" ? "user" : "assistant",
    text: m.message,
  }));
}
