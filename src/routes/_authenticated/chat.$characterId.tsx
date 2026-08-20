import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, CheckCheck, Loader2, Send, Sparkle, TriangleAlert, Zap } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getProfile } from "@/lib/api";
import { getChatState, pollChat, retryReply, sendChatMessage } from "@/lib/chat.functions";
import type { Message, PublicCharacter } from "@/types/database";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/chat/$characterId")({
  head: () => ({
    meta: [{ title: "Chat — FlirtSpace" }, { name: "robots", content: "noindex" }],
  }),
  component: ChatPage,
});

type ReplyState = { status: "pending" | "processing" | "failed"; error: string | null } | null;

type UiMessage = {
  id: string;
  sender: "user" | "character";
  text: string;
  time: string;
  pending?: boolean;
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

const toUi = (m: Message): UiMessage => ({
  id: m.id,
  sender: m.sender === "user" ? "user" : "character",
  text: m.message,
  time: formatTime(m.timestamp),
});

const SUGGESTIONS = [
  "Raccontami qualcosa di te",
  "Com'è andata la tua giornata?",
  "Ho bisogno di un consiglio",
];

function ChatPage() {
  const { characterId: slug } = Route.useParams();
  const { user } = useAuth();
  const fetchChatState = useServerFn(getChatState);
  const sendMessage = useServerFn(sendChatMessage);
  const poll = useServerFn(pollChat);
  const retry = useServerFn(retryReply);

  const chatQuery = useQuery({
    queryKey: ["chat", slug],
    queryFn: () => fetchChatState({ data: { slug } }),
    retry: false,
    staleTime: Infinity,
  });

  const creditsQuery = useQuery({
    queryKey: ["profile-credits", user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: Boolean(user?.id),
  });

  const character: PublicCharacter | undefined = chatQuery.data?.character;
  const conversationId = chatQuery.data?.conversationId;
  const [replyState, setReplyState] = useState<ReplyState>(null);

  // Le risposte sono pianificate sul server: il client si limita a
  // ricontrollare la conversazione, anche dopo un ricaricamento della pagina.
  const pollQuery = useQuery({
    queryKey: ["chat-poll", conversationId],
    queryFn: () => poll({ data: { conversationId: conversationId! } }),
    enabled: Boolean(conversationId),
    refetchInterval: replyState?.status === "pending" || replyState?.status === "processing" ? 10_000 : 45_000,
    refetchOnWindowFocus: true,
  });
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Sincronizza lo storico dal server al primo caricamento e dopo gli errori.
  useEffect(() => {
    if (chatQuery.data) {
      setMessages(chatQuery.data.messages.map(toUi));
      setReplyState(chatQuery.data.replyState);
    }
  }, [chatQuery.data]);

  useEffect(() => {
    if (pollQuery.data) {
      setMessages(pollQuery.data.messages.map(toUi));
      setReplyState(pollQuery.data.replyState);
    }
  }, [pollQuery.data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatQuery.data]);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [input]);

  const mutation = useMutation({
    mutationFn: (vars: { conversationId: string; text: string; tempId: string }) =>
      sendMessage({ data: { conversationId: vars.conversationId, text: vars.text } }),
    onSuccess: ({ userMessage, replyState: next }, vars) => {
      setMessages((prev) => [...prev.filter((m) => m.id !== vars.tempId), toUi(userMessage)]);
      setReplyState(next);
    },
    onError: (error, vars) => {
      // Rimuove l'ottimistico e risincronizza dal server: il messaggio utente
      // potrebbe essere già stato salvato prima dell'errore AI.
      setMessages((prev) => prev.filter((m) => m.id !== vars.tempId));
      setSendError(error.message || "Errore di rete. Controlla la connessione e riprova.");
      toast.error("Messaggio non inviato");
      void chatQuery.refetch();
    },
  });

  const sending = mutation.isPending;
  const awaitingReply = replyState?.status === "pending" || replyState?.status === "processing";
  const typing = sending || awaitingReply;

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || !conversationId || sending) return;

    setSendError(null);
    const tempId = `temp-${crypto.randomUUID()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, sender: "user", text: value, time: formatTime(new Date().toISOString()), pending: true },
    ]);
    setInput("");
    mutation.mutate({ conversationId, text: value, tempId });
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    submit(input);
  };

  /* ------------------------------ Stati speciali ----------------------------- */

  if (chatQuery.isLoading) {
    return (
      <div className="flex h-dvh flex-col bg-background">
        <SiteHeader />
        <div className="grid flex-1 place-items-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm">Apro la conversazione…</p>
          </div>
        </div>
      </div>
    );
  }

  if (chatQuery.isError || !character) {
  return (
    <div className="flex h-dvh flex-col bg-background">
      <SiteHeader />
      <div className="grid flex-1 place-items-center px-6">
        <div className="surface-card max-w-sm rounded-3xl p-8 text-center">
          <TriangleAlert className="mx-auto h-7 w-7 text-primary" />
          <h1 className="mt-4 font-display text-lg font-semibold">Chat non disponibile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Il personaggio non esiste o non è più attivo. Esplora gli altri compagni IA.
          </p>

          <p className="mt-2 text-xs text-red-400 break-all">
            {chatQuery.error?.message ?? "Personaggio non trovato"}
          </p>

          <Button variant="hero" className="mt-6" asChild>
            <Link to="/characters">Esplora i personaggi</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
  const lastUserId = [...messages].reverse().find((m) => m.sender === "user")?.id;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <SiteHeader />

      {/* Profilo del personaggio */}
      <div className="z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto grid max-w-3xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <Link
            to="/characters"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-accent/60"
            aria-label="Torna ai personaggi"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              <CharacterAvatar
                src={character.avatar}
                name={character.name ?? "?"}
                className="h-10 w-10 rounded-full text-sm ring-2 ring-primary/25"
              />
              <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold">
                {character.display_name || character.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {typing ? (
                  <span className="text-primary">sta preparando una risposta…</span>
                ) : (
                  `${character.tagline ?? "Compagno IA"} · online`
                )}
              </p>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs backdrop-blur">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">{creditsQuery.data?.credits ?? "—"}</span>
          </span>
        </div>
      </div>

      {/* Conversazione */}
      <main className="relative flex-1 overflow-y-auto">
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0" />
        <div className="relative mx-auto flex max-w-3xl flex-col gap-3 px-4 py-6">
          {/* Intestazione conversazione */}
          <div className="mx-auto mb-2 flex flex-col items-center text-center">
            <CharacterAvatar
              src={character.avatar}
              name={character.name ?? "?"}
              className="h-16 w-16 rounded-full text-xl ring-2 ring-primary/25"
            />
            <p className="mt-3 font-display text-base font-semibold">
              {character.display_name || character.name}
            </p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
              {character.description}
            </p>
            <span className="mt-4 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
              Oggi
            </span>
          </div>

          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const grouped = prev?.sender === m.sender;
            return (
              <div
                key={m.id}
                className={cn(
                  "animate-fade-up flex max-w-[85%] items-end gap-2 sm:max-w-[70%]",
                  m.sender === "user" ? "self-end flex-row-reverse" : "self-start",
                  grouped ? "mt-0" : "mt-2",
                )}
              >
                {m.sender === "character" ? (
                  <CharacterAvatar
                    src={character.avatar}
                    name={character.name ?? "?"}
                    className={cn("h-7 w-7 shrink-0 rounded-full text-[10px]", grouped && "invisible")}
                  />
                ) : null}
                <div className={cn("flex flex-col gap-1", m.sender === "user" && "items-end")}>
                  <div
                    className={cn(
                      "px-4 py-2.5 text-sm leading-relaxed",
                      m.sender === "user"
                        ? "rounded-2xl rounded-br-md bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]"
                        : "surface-card rounded-2xl rounded-bl-md text-foreground",
                    )}
                  >
                    {m.text}
                  </div>
                  <span className="flex items-center gap-1 px-1 text-[10px] text-muted-foreground">
                    {m.time}
                    {m.sender === "user" &&
                      (m.pending || (m.id === lastUserId && typing) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <CheckCheck className="h-3 w-3 text-primary" />
                      ))}
                  </span>
                </div>
              </div>
            );
          })}

          {typing && (
            <div className="animate-fade-in flex items-end gap-2 self-start">
              <CharacterAvatar
                src={character.avatar}
                name={character.name ?? "?"}
                className="h-7 w-7 shrink-0 rounded-full text-[10px]"
              />
              <div className="surface-card flex w-16 items-center justify-center gap-1 rounded-2xl rounded-bl-md px-4 py-4">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="animate-blink h-1.5 w-1.5 rounded-full bg-primary"
                    style={{ animationDelay: `${i * 0.18}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Composer */}
      <div className="border-t border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 pt-3">
          {messages.length <= 1 && !typing && (
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="shrink-0 rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {replyState?.status === "failed" && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2 text-xs text-destructive">
              <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1">
                La risposta non è riuscita. Puoi riprovare quando vuoi.
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!conversationId) return;
                  void retry({ data: { conversationId } }).then(() => {
                    setReplyState({ status: "pending", error: null });
                    void pollQuery.refetch();
                  });
                }}
                className="shrink-0 underline underline-offset-2 hover:opacity-80"
              >
                Riprova
              </button>
            </div>
          )}
          {sendError && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2 text-xs text-destructive">
              <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1">{sendError}</span>
              <button
                type="button"
                onClick={() => setSendError(null)}
                className="shrink-0 underline underline-offset-2 hover:opacity-80"
              >
                Chiudi
              </button>
            </div>
          )}
        </div>
        <form onSubmit={send} className="mx-auto max-w-3xl px-4 pt-2 pb-4">
          <div className="flex items-end gap-2 rounded-2xl border border-border/70 bg-card/60 p-2 backdrop-blur transition-colors focus-within:border-primary/50">
            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder={`Scrivi a ${character.display_name || character.name}...`}
              className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              variant="hero"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl"
              disabled={!input.trim() || sending}
              aria-label="Invia messaggio"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Sparkle className="h-3 w-3" /> Le conversazioni sono private e salvate sul tuo account
          </p>
        </form>
      </div>
    </div>
  );
}
