import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { CharacterRecord } from "@/types/database";
import {
  generateJson,
  MEMORY_LIMIT,
  SUMMARY_UPDATE_THRESHOLD,
  type ChatTurn,
  type MemoryContext,
} from "@/lib/ai.server";

/**
 * Memoria multilivello (solo lato server):
 * - memorie a lungo termine per coppia utente/personaggio;
 * - riepilogo persistente e incrementale della conversazione.
 *
 * Ogni funzione è "best effort": un errore qui non deve mai impedire
 * all'utente di ricevere la risposta del personaggio.
 */
type Admin = SupabaseClient<Database>;

export type StoredMemory = {
  id: string;
  memory: string;
  category: string;
  importance: number;
};

/** Memorie più rilevanti (importanza, poi uso recente). */
export async function loadMemories(
  admin: Admin,
  userId: string,
  characterId: string,
): Promise<StoredMemory[]> {
  const { data, error } = await admin
    .from("user_memories")
    .select("id, memory, category, importance")
    .eq("user_id", userId)
    .eq("character_id", characterId)
    .order("importance", { ascending: false })
    .order("last_used_at", { ascending: false })
    .limit(MEMORY_LIMIT);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export function toMemoryContext(memories: StoredMemory[]): MemoryContext[] {
  return memories.map((m) => ({ memory: m.memory, category: m.category }));
}

/** Segna le memorie usate in questa risposta. */
export async function touchMemories(admin: Admin, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await admin
    .from("user_memories")
    .update({ last_used_at: new Date().toISOString() })
    .in("id", ids);
}

export async function loadSummary(
  admin: Admin,
  conversationId: string,
): Promise<{ summary: string; message_count: number } | null> {
  const { data, error } = await admin
    .from("conversation_summaries")
    .select("summary, message_count")
    .eq("conversation_id", conversationId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

function transcript(turns: ChatTurn[], characterName: string): string {
  return turns
    .map((t) => `${t.role === "user" ? "Utente" : characterName}: ${t.text}`)
    .join("\n");
}

/* ------------------------------ Estrazione memorie ----------------------------- */

type MemoryOp = {
  action?: string;
  id?: string;
  memory?: string;
  category?: string;
  importance?: number;
};

/**
 * Estrae solo informazioni stabili e utili sull'utente dagli ultimi scambi.
 * Può aggiornare una memoria esistente quando le nuove informazioni la
 * contraddicono o la arricchiscono.
 */
export async function updateMemories(
  admin: Admin,
  args: {
    userId: string;
    characterId: string;
    existing: StoredMemory[];
    turns: ChatTurn[];
    characterName: string;
  },
): Promise<void> {
  const userTurns = args.turns.filter((t) => t.role === "user");
  if (userTurns.length === 0) return;

  const result = await generateJson<{ memories?: MemoryOp[] }>(
    [
      "Sei un estrattore di memoria per una piattaforma di compagni virtuali IA.",
      "Dal dialogo indicato estrai SOLO informazioni stabili e utili sull'utente (nome, hobby, gusti musicali, film, preferenze, lavoro, interessi ricorrenti, fatti personali condivisi volontariamente).",
      "NON salvare chiacchiere occasionali, stati d'animo momentanei, domande o contenuti generati dal personaggio.",
      'Formato: {"memories":[{"action":"add"|"update","id":"<id esistente solo per update>","memory":"frase breve in italiano","category":"nome|hobby|musica|film|preferenze|lavoro|relazione|altro","importance":1-10}]}',
      'Se non c\'è nulla di utile rispondi {"memories":[]}. Massimo 5 elementi.',
    ].join("\n"),
    [
      `Memorie già salvate:\n${
        args.existing.length > 0
          ? args.existing.map((m) => `- id=${m.id} [${m.category}] ${m.memory}`).join("\n")
          : "(nessuna)"
      }`,
      `Dialogo recente:\n${transcript(args.turns, args.characterName)}`,
    ].join("\n\n"),
  );

  const ops = (result?.memories ?? []).slice(0, 5);
  const now = new Date().toISOString();

  for (const op of ops) {
    const text = op.memory?.trim();
    if (!text) continue;
    const importance = Math.min(10, Math.max(1, Math.round(op.importance ?? 5)));
    const category = (op.category ?? "altro").slice(0, 40);

    if (op.action === "update" && op.id && args.existing.some((m) => m.id === op.id)) {
      await admin
        .from("user_memories")
        .update({ memory: text, category, importance, last_used_at: now })
        .eq("id", op.id)
        .eq("user_id", args.userId);
      continue;
    }

    // Evita duplicati identici.
    if (args.existing.some((m) => m.memory.toLowerCase() === text.toLowerCase())) continue;

    await admin.from("user_memories").insert({
      user_id: args.userId,
      character_id: args.characterId,
      memory: text,
      category,
      importance,
    });
  }
}

/* ------------------------------ Riepilogo chat -------------------------------- */

/**
 * Aggiorna il riepilogo solo quando sono arrivati abbastanza messaggi nuovi,
 * partendo dal riepilogo esistente (aggiornamento incrementale, non rigenerato).
 */
export async function maybeUpdateSummary(
  admin: Admin,
  args: {
    conversationId: string;
    character: CharacterRecord;
    deliveredCount: number;
    turns: ChatTurn[];
  },
): Promise<void> {
  const current = await loadSummary(admin, args.conversationId);
  const covered = current?.message_count ?? 0;
  if (args.deliveredCount - covered < SUMMARY_UPDATE_THRESHOLD) return;

  const updated = await generateJson<{ summary?: string }>(
    [
      "Aggiorni il riepilogo persistente di una conversazione tra un utente e un compagno virtuale IA.",
      "Integra le nuove informazioni nel riepilogo esistente senza riscriverlo da zero e senza perdere fatti già presenti.",
      "Includi: argomenti importanti, eventi rilevanti, preferenze e fatti sull'utente, evoluzione della relazione, argomenti in sospeso, contesto emotivo.",
      'Massimo 250 parole, in italiano. Formato: {"summary":"..."}',
    ].join("\n"),
    [
      `Riepilogo attuale:\n${current?.summary?.trim() || "(nessuno)"}`,
      `Nuovi messaggi:\n${transcript(args.turns, args.character.name)}`,
    ].join("\n\n"),
  );

  const summary = updated?.summary?.trim();
  if (!summary) return;

  await admin.from("conversation_summaries").upsert(
    {
      conversation_id: args.conversationId,
      summary,
      message_count: args.deliveredCount,
      summarized_until: new Date().toISOString(),
    },
    { onConflict: "conversation_id" },
  );
}
