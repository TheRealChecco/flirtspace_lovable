import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { CharacterCard } from "@/components/CharacterCard";
import { Input } from "@/components/ui/input";
import { characters } from "@/data/characters";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/characters")({
  head: () => ({
    meta: [
      { title: "Personaggi — compagni AI di FlirtSpace" },
      {
        name: "description",
        content:
          "Scopri compagne romantiche, amici divertenti, personaggi misteriosi, eroi fantasy e mentori professionali. Inizia subito a conversare.",
      },
      { property: "og:title", content: "Personaggi — compagni AI di FlirtSpace" },
      {
        property: "og:description",
        content: "Sfoglia personalità AI uniche e inizia subito una conversazione.",
      },
    ],
  }),
  component: Marketplace,
});

function Marketplace() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("Tutti");

  const tags = useMemo(
    () => ["Tutti", ...Array.from(new Set(characters.flatMap((c) => c.tags)))],
    [],
  );

  const filtered = characters.filter((c) => {
    const matchesTag = tag === "Tutti" || c.tags.includes(tag);
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.tagline.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q);
    return matchesTag && matchesQuery;
  });

  return (
    <PageShell>
      <section className="halo px-5 pt-14 pb-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold sm:text-4xl">Catalogo dei personaggi</h1>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
            Ogni compagno ha personalità, memoria e stile di conversazione unici. Scegline uno e
            inizia a parlare — il primo messaggio lo offriamo noi.
          </p>

          <div className="relative mt-8 max-w-md">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca un compagno..."
              className="h-11 rounded-xl bg-card/60 pl-10 backdrop-blur"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={cn(
                  "rounded-full border border-border/70 px-3.5 py-1.5 text-xs transition-colors",
                  tag === t
                    ? "border-primary/60 bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24">
        <div className="mx-auto max-w-6xl">
          {filtered.length === 0 ? (
            <p className="py-20 text-center text-sm text-muted-foreground">
              Nessun compagno corrisponde a questa ricerca.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <CharacterCard key={c.id} character={c} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
