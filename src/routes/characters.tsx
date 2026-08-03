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
      { title: "Character marketplace — Lumina AI companions" },
      {
        name: "description",
        content:
          "Browse romantic companions, funny friends, mystery personas, fantasy heroes and professional mentors. Start a conversation instantly.",
      },
      { property: "og:title", content: "Character marketplace — Lumina AI companions" },
      {
        property: "og:description",
        content: "Browse unique AI personalities and start a conversation instantly.",
      },
    ],
  }),
  component: Marketplace,
});

function Marketplace() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("All");

  const tags = useMemo(
    () => ["All", ...Array.from(new Set(characters.flatMap((c) => c.tags)))],
    [],
  );

  const filtered = characters.filter((c) => {
    const matchesTag = tag === "All" || c.tags.includes(tag);
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
          <h1 className="text-3xl font-bold sm:text-4xl">Character marketplace</h1>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
            Every companion has a distinct personality, memory and conversational style. Pick one
            and start talking — the first message is on us.
          </p>

          <div className="relative mt-8 max-w-md">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companions..."
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
              No companions match that search yet.
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
