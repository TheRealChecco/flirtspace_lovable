/**
 * Livello di astrazione del provider AI (solo lato server, mai importato dal browser).
 *
 * Tutto l'accoppiamento con il provider concreto (Groq) è isolato qui:
 * base URL, modello e variabile d'ambiente della chiave. Per cambiare provider
 * in futuro basta modificare questo file senza toccare la logica della chat.
 *
 * Groq espone un'API compatibile con OpenAI (endpoint /chat/completions).
 */
const PROVIDER_BASE_URL = "https://api.groq.com/openai/v1";
const PROVIDER_MODEL = "openai/gpt-oss-20b";
const PROVIDER_KEY_ENV = "GROQ_API_KEY";
/** Timeout della singola chiamata al modello (ms). */
const REQUEST_TIMEOUT_MS = 30_000;

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type AiErrorKind =
  | "auth"
  | "rate_limit"
  | "server"
  | "timeout"
  | "network"
  | "empty"
  | "config"
  | "unknown";

export class AiProviderError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly kind: AiErrorKind,
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}

/**
 * Esegue una richiesta di completamento chat verso il provider AI.
 * Solleva `AiProviderError` per ogni caso di errore (auth, rate limit, server,
 * timeout, rete, risposta vuota), in modo che il chiamante possa persistere lo
 * stato di fallimento senza lasciare la UI bloccata su "in preparazione".
 */
export async function chatCompletion(
  messages: ChatMessage[],
  opts: { json?: boolean; timeoutMs?: number } = {},
): Promise<string> {
  const apiKey = process.env[PROVIDER_KEY_ENV];
  if (!apiKey) {
    throw new AiProviderError(
      `Configurazione AI mancante sul server (${PROVIDER_KEY_ENV})`,
      500,
      "config",
    );
  }

  const controller = new AbortController();
  const timeoutMs = opts.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${PROVIDER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: PROVIDER_MODEL,
        messages,
        temperature: opts.json ? 0 : 0.8,
      }),
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      throw new AiProviderError("Timeout nella risposta del provider AI", 504, "timeout");
    }
    throw new AiProviderError("Errore di rete verso il provider AI", 503, "network");
  }
  clearTimeout(timer);

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    const status = response.status;
    const kind: AiErrorKind =
      status === 401 || status === 403
        ? "auth"
        : status === 429
          ? "rate_limit"
          : status >= 500
            ? "server"
            : "unknown";
    throw new AiProviderError(
      detail.slice(0, 300) || `Errore HTTP ${status}`,
      status,
      kind,
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new AiProviderError("Il provider AI ha restituito una risposta vuota", 502, "empty");
  }
  return reply;
}
