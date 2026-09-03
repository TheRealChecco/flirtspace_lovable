import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, Loader2, Send, Zap } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { useAuth } from "@/hooks/use-auth";
import { getProfile } from "@/lib/api";
import { getChatState, pollChat, sendChatMessage } from "@/lib/chat.functions";
import type { Message } from "@/types/database";

export const Route = createFileRoute("/_authenticated/chat/$characterId")({
  head: () => ({ meta: [{ title: "Chat — FlirtSpace" }] }),
  component: ChatPage,
});

function ChatPage() {
  const { characterId } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const getChatStateFn = useServerFn(getChatState);
  const sendChatMessageFn = useServerFn(sendChatMessage);
  const pollChatFn = useServerFn(pollChat);

  // Stato iniziale: personaggio + conversazione (creata se assente) + messaggi.
  const chatQuery = useQuery({
    queryKey: ["chat-state", characterId],
    queryFn: () => getChatStateFn({ data: { slug: characterId } }),
    retry: false,
  });

  // Saldo crediti (decrementato di 1 a ogni messaggio).
  const creditsQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: Boolean(user?.id),
  });

  const [messages, setMessages] = useState<Message[] | null>(null);
  const [pendingReply, setPendingReply] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Popola i messaggi dallo stato iniziale (una sola volta).
  useEffect(() => {
    if (messages === null && chatQuery.data) {
      setMessages(chatQuery.data.messages);
      const st = chatQuery.data.replyState?.status;
      setPendingReply(st === "pending" || st === "processing");
    }
  }, [messages, chatQuery.data]);

  // Scroll automatico ai messaggi più recenti.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pendingReply]);

  // Polling della risposta in arrivo (il job vive nel database).
  const conversationId = chatQuery.data?.conversationId;
  useEffect(() => {
    if (!pendingReply || !conversationId) return;
    let active = true;
    const id = setInterval(async () => {
      try {
        const res = await pollChatFn({ data: { conversationId } });
        if (!active) return;
        setMessages(res.messages);
        if (!res.replyState) {
          setPendingReply(false);
        } else if (res.replyState.status === "failed") {
          setPendingReply(false);
          setError(res.replyState.error ?? "Risposta non disponibile. Riprova.");
        }
      } catch {
        /* riprova al prossimo tick */
      }
    }, 1500);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [pendingReply, conversationId, pollChatFn]);

  const character = chatQuery.data?.character;
  const credits = creditsQuery.data?.credits ?? 0;
  const insufficient = error?.toLowerCase().includes("crediti insufficienti");

  async function onSend(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !conversationId || sending) return;
    setError(null);
    setSending(true);
    setText("");
    try {
      const res = await sendChatMessageFn({ data: { conversationId, text: trimmed } });
      setMessages((prev) => {
        const base = prev ?? [];
        const next = [...base, res.userMessage];
        if (res.replyMessage) next.push(res.replyMessage);
        return next;
      });
      if (res.replyState && res.replyState.status !== "delivered") {
        setPendingReply(true);
      }
      // Aggiorna saldo crediti e cronologia conversazioni.
      void queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      void queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Errore durante l'invio.";
      setError(msg);
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }

  if (chatQuery.isLoading) {
    return (
      <PageShell>
        <div className="grid min-h-[70vh] place-items-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

  if (chatQuery.isError || !character) {
    return (
      <PageShell>
        <section className="mx-auto max-w-md px-5 py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Personaggio non trovato</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {chatQuery.error instanceof Error
              ? chatQuery.error.message
              : "Il personaggio selezionato non è disponibile."}
          </p>
          <Button asChild variant="hero" className="mt-6">
            <Link to="/characters">
              <ArrowLeft className="h-4 w-4" /> Torna ai personaggi
            </Link>
          </Button>
        </section>
      </PageShell>
    );
  }

  const name = character.name ?? "Personaggio";

  return (
    <PageShell>
      <section className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-3xl flex-col px-3 sm:px-5">
        {/* Header personaggio */}
        <header className="flex items-center gap-3 border-b border-border/60 py-3">
          <Button asChild variant="ghost" size="sm" className="shrink-0">
            <Link to="/characters" title="Torna ai personaggi">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Personaggi</span>
            </Link>
          </Button>
          <CharacterAvatar
            src={character.avatar}
            name={name}
            className="h-10 w-10 shrink-0 rounded-full"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-semibold">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{character.tagline}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-xs font-medium">
            <Zap className="h-3.5 w-3.5 text-primary" />
            {credits}
          </div>
        </header>

        {/* Messaggi */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto py-4">
          {character.description && (
            <div className="mx-auto max-w-md rounded-2xl border border-border/50 bg-card/40 p-3 text-center text-xs text-muted-foreground">
              {character.description}
            </div>
          )}
          {(messages ?? []).map((m) => (
            <MessageBubble key={m.id} message={m} avatar={character.avatar} name={name} />
          ))}
          {pendingReply && (
            <div className="flex items-end gap-2">
              <CharacterAvatar
                src={character.avatar}
                name={name}
                className="h-7 w-7 shrink-0 rounded-full text-xs"
              />
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border/60 bg-card/60 px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Errore / crediti insufficienti */}
        {error && (
          <div
            className={`mb-2 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
              insufficient
                ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <p>{error}</p>
              {insufficient && (
                <Link to="/pricing" className="font-medium underline">
                  Ricarica i crediti
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={onSend} className="flex items-end gap-2 border-t border-border/60 py-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void onSend(e as unknown as FormEvent);
              }
            }}
            placeholder="Scrivi un messaggio…"
            rows={1}
            className="max-h-32 min-h-[44px] resize-none rounded-2xl"
            disabled={sending}
          />
          <Button
            type="submit"
            variant="hero"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-full"
            disabled={sending || !text.trim()}
            aria-label="Invia messaggio"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </section>
    </PageShell>
  );
}

function MessageBubble({
  message,
  avatar,
  name,
}: {
  message: Message;
  avatar: string | null;
  name: string;
}) {
  const isUser = message.sender === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <CharacterAvatar src={avatar} name={name} className="h-7 w-7 shrink-0 rounded-full text-xs" />
      )}
      <div
        className={`max-w-[78%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? "rounded-br-sm bg-[image:var(--gradient-primary)] text-primary-foreground"
            : "rounded-bl-sm border border-border/60 bg-card/60"
        }`}
      >
        {message.message}
      </div>
    </div>
  );
}
