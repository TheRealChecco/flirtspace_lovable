import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Sparkle, Zap } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCharacter, type Character } from "@/data/characters";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat/$characterId")({
  loader: ({ params }) => {
    const character = getCharacter(params.characterId);
    if (!character) throw notFound();
    return { character };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Chat non disponibile — FlirtSpace" }, { name: "robots", content: "noindex" }],
      };
    }
    const { character } = loaderData;
    const title = `Chatta con ${character.name} — ${character.tagline} | FlirtSpace`;
    return {
      meta: [
        { title },
        { name: "description", content: character.description },
        { property: "og:title", content: title },
        { property: "og:description", content: character.description },
      ],
    };
  },
  component: ChatPage,
});

type Message = { id: string; role: "user" | "assistant"; text: string; time: string };

const now = () => new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

/**
 * TODO(ai): sostituire con una chiamata in streaming a una server function che parla
 * con il gateway AI, salva i messaggi e scala il saldo crediti.
 */
function mockReply(name: string, input: string): string {
  const replies = [
    `Interessante — raccontami di più su "${input.slice(0, 40)}".`,
    `Ci stavo pensando anch'io. Cosa te l'ha fatto venire in mente oggi?`,
    `Mmh. Mi piace come l'hai detto. Restiamoci un attimo.`,
    `Sinceramente? Farei lo stesso. Ma sono curiosa di sapere cosa ti dice ${
      name === "Milo" ? "l'istinto" : "il cuore"
    }.`,
  ];
  return replies[Math.floor(Math.random() * replies.length)] ?? replies[0]!;
}

function ChatPage() {
  const { character } = Route.useLoaderData() as { character: Character };
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", role: "assistant", text: character.greeting, time: "" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [credits, setCredits] = useState(248);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages((m) => m.map((msg) => (msg.id === "greeting" ? { ...msg, time: now() } : msg)));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing) return;

    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text, time: now() }]);
    setInput("");
    setCredits((c) => Math.max(0, c - 1));
    setTyping(true);

    setTimeout(
      () => {
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: mockReply(character.name, text),
            time: now(),
          },
        ]);
        setTyping(false);
      },
      1100 + Math.random() * 900,
    );
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <SiteHeader />

      {/* Profilo del personaggio */}
      <div className="z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto grid max-w-3xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <Link
            to="/characters"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-accent/60"
            aria-label="Torna ai personaggi"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={character.image}
                alt={character.name}
                width={640}
                height={640}
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold">{character.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {typing ? "sta scrivendo…" : `${character.tagline} · online`}
              </p>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">{credits}</span>
          </span>
        </div>
      </div>

      {/* Conversazione */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
          <div className="mx-auto flex flex-wrap justify-center gap-1.5">
            {character.tags.map((t: string) => (
              <Badge key={t} variant="secondary" className="rounded-full font-normal">
                {t}
              </Badge>
            ))}
          </div>

          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "animate-fade-up flex max-w-[85%] flex-col gap-1 sm:max-w-[70%]",
                m.role === "user" ? "self-end items-end" : "self-start items-start",
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user"
                    ? "rounded-br-md bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "surface-card rounded-bl-md text-foreground",
                )}
              >
                {m.text}
              </div>
              <span className="px-1 text-[11px] text-muted-foreground">{m.time}</span>
            </div>
          ))}

          {typing && (
            <div className="surface-card flex w-16 items-center justify-center gap-1 self-start rounded-2xl rounded-bl-md px-4 py-4">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="animate-blink h-1.5 w-1.5 rounded-full bg-primary"
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Composer */}
      <div className="border-t border-border/60 bg-background/85 backdrop-blur-xl">
        <form onSubmit={send} className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-end gap-2 rounded-2xl border border-border/70 bg-card/60 p-2 focus-within:border-primary/50">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(e as unknown as React.FormEvent);
                }
              }}
              rows={1}
              placeholder={`Scrivi a ${character.name}...`}
              className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              variant="hero"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl"
              disabled={!input.trim() || typing}
              aria-label="Invia messaggio"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Sparkle className="h-3 w-3" /> 1 credito per messaggio · le conversazioni sono private
          </p>
        </form>
      </div>
    </div>
  );
}
