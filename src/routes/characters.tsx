import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/layout/PageShell";
import { CharacterCard, CharacterCardSkeleton } from "@/components/CharacterCard";
import { Reveal } from "@/components/Reveal";
import { listCharacters } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/characters")({
  head: () => ({
    meta: [
      { title: "Personaggi — FlirtSpace" },
      {
        name: "description",
        content:
          "Esplora il catalogo dei compagni IA di FlirtSpace: personalità uniche per conversazioni coinvolgenti e personalizzate.",
      },
      { property: "og:title", content: "Personaggi — FlirtSpace" },
      {
        property: "og:description",
        content: "Trova il compagno IA perfetto per te: romantico, divertente, misterioso o mentore.",
      },
    ],
  }),
  component: CharactersPage,
});

function CharactersPage() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["public-characters"],
    queryFn: listCharacters,
  });
  const characters = data ?? [];

  const allTags = useMemo(
    () => Array.from(new Set(characters.flatMap((c) => c.tags ?? []))).sort(),
    [characters],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return characters.filter((c) => {
      if (tag && !(c.tags ?? []).includes(tag)) return false;
      if (!q) return true;
      return [c.name, c.tagline, c.description, c.profession]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [characters, query, tag]);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-14 sm:pt-20">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Il marketplace</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Trova il tuo <span className="text-gradient">compagno IA</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Ogni personaggio ha una personalità, una memoria e uno stile di conversazione unici.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mx-auto mt-10 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca per nome, tagline o descrizione…"
                className="h-12 rounded-full border-border/70 bg-card/60 pl-11"
              />
            </div>
          </div>
        </Reveal>

        {allTags.length > 0 && (
          <Reveal delay={150}>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setTag(null)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  tag === null
                    ? "border-transparent bg-[image:var(--gradient-primary)] text-primary-foreground"
                    : "border-border/70 text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                Tutti
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(tag === t ? null : t)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                    tag === t
                      ? "border-transparent bg-[image:var(--gradient-primary)] text-primary-foreground"
                      : "border-border/70 text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </Reveal>
        )}

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <CharacterCardSkeleton key={i} />)
            : filtered.map((c, i) => (
                <Reveal key={c.id} delay={(i % 3) * 80}>
                  <CharacterCard character={c} />
                </Reveal>
              ))}
        </div>

        {!isLoading && filtered.length === 0 && (
          <p className="mt-16 text-center text-sm text-muted-foreground">
            Nessun personaggio corrisponde alla ricerca. Prova a rimuovere i filtri.
          </p>
        )}
      </section>
    </PageShell>
  );
}
