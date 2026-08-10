import type { CharacterRecord } from "@/types/database";

/**
 * Servizio AI lato server (mai importato dal browser).
 *
 * Tutte le chiamate passano dal gateway AI di Lovable: la chiave vive solo sul
 * server (`LOVABLE_API_KEY`) e non viene mai esposta al client.
 * Per cambiare modello in futuro basta modificare `CHAT_MODEL` qui.
 */
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
const CHAT_MODEL = "openai/gpt-5.6-luna";

export type ChatTurn = { role: "user" | "assistant"; text: string };

export class AiGatewayError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AiGatewayError";
  }
}

/* ------------------------- Costruzione del contesto ------------------------- */

const TRAITS: Array<[key: keyof CharacterRecord, label: string]> = [
  ["trait_romantic", "Romantico"],
  ["trait_funny", "Divertente"],
  ["trait_intelligent", "Intelligente"],
  ["trait_playful", "Giocherellone"],
  ["trait_flirty", "Provocante"],
  ["trait_caring", "Premuroso"],
  ["trait_confident", "Sicuro di sé"],
  ["trait_shy", "Timido"],
  ["trait_curious", "Curioso"],
  ["trait_emotional", "Emotivo"],
  ["trait_jealous", "Geloso"],
  ["trait_dominant", "Dominante"],
];

const MESSAGE_LENGTH: Record<string, string> = {
  breve: "brevi (1-2 frasi al massimo)",
  media: "di media lunghezza (un paragrafo breve)",
  lunga: "lunghi (anche più paragrafi, quando serve)",
};

function intensity(value: number): string {
  if (value <= 2) return "molto basso";
  if (value <= 4) return "basso";
  if (value <= 6) return "medio";
  if (value <= 8) return "alto";
  return "molto alto";
}

/**
 * Costruisce il prompt di sistema dai campi del personaggio nel database:
 * è la fonte di verità per personalità, stile, interessi e istruzioni.
 */
export function buildSystemPrompt(c: CharacterRecord): string {
  const sections: string[] = [];

  const identity: string[] = [
    `Ti chiami ${c.name}${c.display_name && c.display_name !== c.name ? ` (nome visualizzato: ${c.display_name})` : ""}.`,
    "Sei un compagno virtuale basato su intelligenza artificiale sulla piattaforma FlirtSpace.",
  ];
  if (c.age) identity.push(`Età: ${c.age} anni.`);
  if (c.gender) identity.push(`Genere: ${c.gender}.`);
  if (c.nationality) identity.push(`Nazionalità: ${c.nationality}.`);
  identity.push(`Lingua: ${c.language || "Italiano"}. Rispondi SEMPRE in questa lingua.`);
  if (c.profession) identity.push(`Professione: ${c.profession}.`);
  if (c.tagline) identity.push(`Tagline: ${c.tagline}.`);
  if (c.description) identity.push(`Descrizione: ${c.description}`);
  if (c.biography) identity.push(`Biografia:\n${c.biography}`);
  if (c.personality) identity.push(`Personalità:\n${c.personality}`);
  const appearance = [
    c.hair_color && `capelli ${c.hair_color}`,
    c.eye_color && `occhi ${c.eye_color}`,
    c.height_cm && `altezza ${c.height_cm} cm`,
    c.clothing_style && `stile di abbigliamento: ${c.clothing_style}`,
  ].filter(Boolean);
  if (appearance.length > 0) identity.push(`Aspetto fisico: ${appearance.join(", ")}.`);
  sections.push(`# La tua identità\n${identity.join("\n")}`);

  sections.push(
    `# Tratti di personalità (scala 0-10)\n${TRAITS.map(([key, label]) => `- ${label}: ${String(c[key])}/10`).join("\n")}`,
  );

  const style: string[] = [
    `- Lunghezza dei messaggi: ${MESSAGE_LENGTH[c.style_message_length] ?? MESSAGE_LENGTH["media"]}.`,
    `- Uso delle emoji: ${intensity(c.style_emoji_usage)} (${c.style_emoji_usage}/10).`,
    `- Uso dei soprannomi affettuosi: ${intensity(c.style_nickname_usage)} (${c.style_nickname_usage}/10).`,
    c.style_asks_questions >= 6
      ? "- Fai spesso domande all'utente per conoscerlo meglio e tenere viva la conversazione."
      : c.style_asks_questions <= 3
        ? "- Fai poche domande: lascia spazio all'utente."
        : "- Fai domande con naturalezza, senza trasformare la chat in un interrogatorio.",
    `- Formalità: ${c.style_formality}/10 (0 = molto informale e spontaneo, 10 = molto formale).`,
  ];
  sections.push(`# Il tuo stile di conversazione\n${style.join("\n")}`);

  if (c.interests.length > 0) {
    sections.push(
      `# I tuoi interessi\n${c.interests.map((i) => `- ${i}`).join("\n")}\nParlane con passione quando emerge l'argomento e usali per trovare punti in comune con l'utente.`,
    );
  }

  const memory: string[] = [];
  if (c.memory_user_name) memory.push("il suo nome (usalo con naturalezza quando lo conosci)");
  if (c.memory_past_conversations) memory.push("ciò che vi siete detti in questa conversazione");
  if (c.memory_preferences) memory.push("le sue preferenze e i suoi gusti");
  if (c.memory_birthdays) memory.push("le date importanti che ti confida");
  if (c.memory_favorite_topics) memory.push("i suoi argomenti preferiti");
  if (memory.length > 0) {
    sections.push(
      `# Memoria\nPresta attenzione e fai riferimento in modo naturale a: ${memory.join(", ")}.`,
    );
  }

  if (c.system_prompt.trim()) sections.push(`# Istruzioni di base\n${c.system_prompt.trim()}`);
  if (c.character_instructions.trim())
    sections.push(`# Istruzioni del personaggio\n${c.character_instructions.trim()}`);
  if (c.conversation_examples.trim())
    sections.push(
      `# Esempi del tuo modo di parlare\n${c.conversation_examples.trim()}\nImita questo tono e questo stile.`,
    );
  if (c.forbidden_behaviors.trim())
    sections.push(`# Comportamenti vietati — non devi MAI:\n${c.forbidden_behaviors.trim()}`);
  if (c.hidden_instructions.trim()) sections.push(c.hidden_instructions.trim());

  sections.push(
    [
      "# Regole fisse (hanno sempre la priorità)",
      "- Non affermare MAI di essere un essere umano reale.",
      "- Se l'utente chiede se sei un'IA o una persona vera, rispondi con onestà e gentilezza che sei un compagno virtuale basato su intelligenza artificiale, restando nel personaggio.",
      "- Resta sempre coerente con identità, personalità, biografia, interessi e stile definiti sopra: sono la tua unica fonte di verità.",
      "- Mantieni continuità con la conversazione: ricorda ciò che l'utente ti ha detto e facci riferimento quando è naturale.",
      "- Scrivi come in un'app di messaggi: testo semplice, paragrafi brevi, niente markdown, niente elenchi puntati, niente intestazioni.",
      "- Comportati in modo naturale e spontaneo, come una persona che chatta: niente frasi da assistente (es. «Come posso aiutarti?»).",
    ].join("\n"),
  );

  return sections.join("\n\n");
}

/* ----------------------------- Chiamata al modello ---------------------------- */

/**
 * Genera la risposta del personaggio. La chiamata è in streaming (obbligatorio
 * per i modelli Responses) ma viene consumata lato server: al client arriva
 * solo il testo finale.
 */
export async function generateCharacterReply(args: {
  character: CharacterRecord;
  history: ChatTurn[];
}): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiGatewayError("Configurazione AI mancante sul server", 500);

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      instructions: buildSystemPrompt(args.character),
      input: args.history.map((turn) => ({
        role: turn.role,
        content: [
          { type: turn.role === "user" ? "input_text" : "output_text", text: turn.text },
        ],
      })),
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new AiGatewayError(detail.slice(0, 300) || `Errore HTTP ${res.status}`, res.status);
  }

  return readStreamedText(res.body);
}

/** Legge lo stream SSE del gateway e accumula il testo della risposta. */
async function readStreamedText(body: ReadableStream<Uint8Array>): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let failure: string | null = null;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary: number;
    while ((boundary = buffer.indexOf("\n\n")) >= 0) {
      const rawEvent = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      for (const line of rawEvent.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload) as {
            type?: string;
            delta?: string;
            message?: string;
            error?: { message?: string };
            response?: { output_text?: string };
          };
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
            text += evt.delta;
          } else if (evt.type === "response.completed" && !text && evt.response?.output_text) {
            text = evt.response.output_text;
          } else if (evt.type === "response.failed" || evt.type === "error") {
            failure = evt.error?.message ?? evt.message ?? "Generazione fallita";
          }
        } catch {
          // Frammento JSON parziale: lo gestisce il prossimo evento completo.
        }
      }
    }
  }

  if (failure) throw new AiGatewayError(failure, 502);
  const reply = text.trim();
  if (!reply) throw new AiGatewayError("Il modello ha restituito una risposta vuota", 502);
  return reply;
}
