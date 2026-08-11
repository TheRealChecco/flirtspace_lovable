import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { CharacterRecord, Message } from "@/types/database";
import {
  AiGatewayError,
  generateCharacterReply,
  RECENT_MESSAGE_LIMIT,
} from "@/lib/ai.server";
import { toChatTurns } from "@/lib/chat.server";
import {
  loadMemories,
  loadSummary,
  maybeUpdateSummary,
  toMemoryContext,
  touchMemories,
  updateMemories,
} from "@/lib/memory.server";

/**
 * Worker delle risposte pianificate.
 *
 * I job vivono nella tabella `messages` (righe `pending` con `deliver_at`):
 * il ritardo è quindi persistente e indipendente dal browser dell'utente.
 * La "presa in carico" è atomica (update condizionato su `status = 'pending'`),
 * quindi due esecuzioni parallele non generano risposte duplicate.
 */
type Admin = SupabaseClient<Database>;

const BATCH_SIZE = 5;

export async function runDueReplyJobs(): Promise<{ processed: number; failed: number }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const admin = supabaseAdmin as unknown as Admin;

  const { data: due, error } = await admin
    .from("messages")
    .select("id")
    .eq("status", "pending")
    .lte("deliver_at", new Date().toISOString())
    .order("deliver_at")
    .limit(BATCH_SIZE);
  if (error) throw new Error(error.message);

  let processed = 0;
  let failed = 0;

  for (const job of due ?? []) {
    const claimed = await claim(admin, job.id);
    if (!claimed) continue;
    try {
      await deliverReply(admin, claimed);
      processed += 1;
    } catch (err) {
      failed += 1;
      const message =
        err instanceof AiGatewayError
          ? `AI ${err.status}`
          : err instanceof Error
            ? err.message.slice(0, 200)
            : "Errore sconosciuto";
      console.error("[ai-jobs] reply failed", claimed.id, message);
      await admin
        .from("messages")
        .update({ status: "failed", error: message })
        .eq("id", claimed.id);
    }
  }

  return { processed, failed };
}

/** Presa in carico atomica: solo chi passa da `pending` a `processing` lavora. */
async function claim(admin: Admin, id: string): Promise<Message | null> {
  const { data, error } = await admin
    .from("messages")
    .update({ status: "processing" })
    .eq("id", id)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function deliverReply(admin: Admin, job: Message): Promise<void> {
  const { data: conversation, error: convError } = await admin
    .from("conversations")
    .select("id, user_id, character_id")
    .eq("id", job.conversation_id)
    .maybeSingle();
  if (convError) throw new Error(convError.message);
  if (!conversation) throw new Error("Conversazione non trovata");

  const { data: character, error: charError } = await admin
    .from("characters")
    .select("*")
    .eq("id", conversation.character_id)
    .maybeSingle();
  if (charError) throw new Error(charError.message);
  if (!character) throw new Error("Personaggio non trovato");

  // --- Contesto IA: memorie + riepilogo + messaggi recenti -------------------
  const [memories, summary, recent] = await Promise.all([
    safe(() => loadMemories(admin, conversation.user_id, conversation.character_id), []),
    safe(() => loadSummary(admin, conversation.id), null),
    loadRecentMessages(admin, conversation.id),
  ]);

  const reply = await generateCharacterReply({
    character: character as CharacterRecord,
    history: toChatTurns(recent),
    memories: toMemoryContext(memories),
    summary: summary?.summary ?? null,
  });

  const { error: updateError } = await admin
    .from("messages")
    .update({
      message: reply,
      status: "delivered",
      error: null,
      timestamp: new Date().toISOString(),
    })
    .eq("id", job.id);
  if (updateError) throw new Error(updateError.message);

  await admin
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversation.id);

  // --- Memoria (best effort: non deve mai bloccare la conversazione) ---------
  const turns = toChatTurns([...recent, { ...job, message: reply } as Message]);
  await safe(async () => {
    await touchMemories(
      admin,
      memories.map((m) => m.id),
    );
    await updateMemories(admin, {
      userId: conversation.user_id,
      characterId: conversation.character_id,
      existing: memories,
      turns: turns.slice(-6),
      characterName: character.name,
    });
    const { count } = await admin
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conversation.id)
      .eq("status", "delivered");
    await maybeUpdateSummary(admin, {
      conversationId: conversation.id,
      character: character as CharacterRecord,
      deliveredCount: count ?? 0,
      turns,
    });
    return null;
  }, null);
}

async function loadRecentMessages(admin: Admin, conversationId: string): Promise<Message[]> {
  const { data, error } = await admin
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("status", "delivered")
    .order("timestamp", { ascending: false })
    .limit(RECENT_MESSAGE_LIMIT);
  if (error) throw new Error(error.message);
  return (data ?? []).reverse();
}

/** Esegue un'operazione non critica ignorando gli errori. */
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[ai-jobs] memoria non critica fallita", err);
    return fallback;
  }
}
