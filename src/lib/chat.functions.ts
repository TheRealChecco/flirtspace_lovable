import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AiGatewayError, generateCharacterReply } from "@/lib/ai.server";
import {
  ensureGreeting,
  findPublicCharacter,
  getOrCreateConversation,
  getOwnedConversation,
  HISTORY_LIMIT,
  insertChatMessage,
  listMessages,
  loadFullCharacter,
  toChatTurns,
  touchConversation,
} from "@/lib/chat.server";

/** Messaggio di errore comprensibile per l'utente finale. */
function friendlyAiError(status: number): string {
  if (status === 429) return "Troppe richieste in questo momento: riprova fra qualche secondo.";
  if (status === 402) return "Il servizio AI ha esaurito i crediti disponibili. Riprova più tardi.";
  return "Il servizio AI non è disponibile in questo momento. Riprova fra poco.";
}

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
    const messages = await listMessages(context.supabase, conversation.id);

    return { character, conversationId: conversation.id, messages };
  });

/**
 * Invia un messaggio: salva il testo dell'utente, costruisce il contesto dal
 * personaggio nel database, chiama il modello lato server e salva la risposta.
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

    // 1. Salva subito il messaggio dell'utente (resta anche se l'AI fallisce).
    const userMessage = await insertChatMessage(
      context.supabase,
      conversation.id,
      "user",
      data.text,
    );

    // 2. Carica il personaggio completo (prompt inclusi) solo lato server.
    const character = await loadFullCharacter(conversation.character_id);
    if (!character) throw new Error("Personaggio non trovato");

    // 3. Storico recente, incluso il messaggio appena salvato.
    const history = await listMessages(context.supabase, conversation.id, HISTORY_LIMIT);

    // 4. Genera la risposta.
    let reply: string;
    try {
      reply = await generateCharacterReply({ character, history: toChatTurns(history) });
    } catch (error) {
      await touchConversation(context.supabase, conversation.id);
      if (error instanceof AiGatewayError) {
        console.error("[chat] AI gateway error", error.status, error.message);
        throw new Error(friendlyAiError(error.status));
      }
      console.error("[chat] unexpected error", error);
      throw new Error("Si è verificato un errore imprevisto. Riprova fra poco.");
    }

    // 5. Salva e restituisci la risposta del personaggio.
    const aiMessage = await insertChatMessage(context.supabase, conversation.id, "character", reply);
    await touchConversation(context.supabase, conversation.id);

    return { userMessage, aiMessage };
  });
