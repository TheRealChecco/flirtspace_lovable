import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  ensureGreeting,
  findPublicCharacter,
  getOrCreateConversation,
  getOwnedConversation,
  getReplyState,
  insertChatMessage,
  listMessages,
  scheduleReply,
  touchConversation,
} from "@/lib/chat.server";

/**
 * Stato iniziale della chat: personaggio pubblico, conversazione dell'utente
 * (creata se assente, con il saluto del personaggio) e storico messaggi.
 */
export const getChatState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ slug: z.string().min(1).max(120) }))
  .handler(async ({ data, context }) => {
    const character = await findPublicCharacter(context.supabase, data.slug);
    if (!character?.id) throw new Error("Personaggio non trovato");

    const conversation = await getOrCreateConversation(
      context.supabase,
      context.userId,
      character.id,
    );
    await ensureGreeting(context.supabase, conversation.id, character.greeting);
    const [messages, replyState] = await Promise.all([
      listMessages(context.supabase, conversation.id),
      getReplyState(context.supabase, conversation.id),
    ]);

    return { character, conversationId: conversation.id, messages, replyState };
  });

/**
 * Polling leggero: messaggi consegnati + stato della risposta in arrivo.
 * Ne approfitta per dare una spinta ai job scaduti (lo scheduler del
 * database resta comunque la fonte principale, anche a browser chiuso).
 */
export const pollChat = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ conversationId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const conversation = await getOwnedConversation(context.supabase, data.conversationId);
    if (!conversation) throw new Error("Conversazione non trovata");

    const [messages, replyState] = await Promise.all([
      listMessages(context.supabase, conversation.id),
      getReplyState(context.supabase, conversation.id),
    ]);

    if (replyState?.status === "pending") {
      const { runDueReplyJobs } = await import("@/lib/jobs.server");
      void runDueReplyJobs().catch((err) => console.error("[chat] job kick", err));
    }

    return { messages, replyState };
  });

/**
 * Invia un messaggio: salva subito il testo dell'utente e pianifica la
 * risposta del personaggio con un ritardo naturale generato lato server.
 * La generazione avviene poi nel worker: nessun timer nel browser.
 */
export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      conversationId: z.string().uuid(),
      text: z.string().trim().min(1, "Il messaggio è vuoto").max(2000),
    }),
  )
  .handler(async ({ data, context }) => {
    // La RLS garantisce che la conversazione appartenga all'utente.
    const conversation = await getOwnedConversation(context.supabase, data.conversationId);
    if (!conversation) throw new Error("Conversazione non trovata");

    const userMessage = await insertChatMessage(
      context.supabase,
      conversation.id,
      "user",
      data.text,
    );

    // Un solo job per messaggio utente: l'indice unico evita duplicati.
    await scheduleReply(context.supabase, conversation.id, userMessage.id);
    await touchConversation(context.supabase, conversation.id);

    return { userMessage, replyState: { status: "pending" as const, error: null } };
  });

/** Riprova una risposta non riuscita, ripianificandola a breve. */
export const retryReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ conversationId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const conversation = await getOwnedConversation(context.supabase, data.conversationId);
    if (!conversation) throw new Error("Conversazione non trovata");

    // L'aggiornamento dei messaggi è riservato al server (RLS: nessun update
    // lato utente). L'appartenenza è già stata verificata sopra.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("messages")
      .update({
        status: "pending",
        error: null,
        deliver_at: new Date(Date.now() + 5_000).toISOString(),
      })
      .eq("conversation_id", conversation.id)
      .eq("status", "failed");
    if (error) throw new Error(error.message);

    return { ok: true };
  });
