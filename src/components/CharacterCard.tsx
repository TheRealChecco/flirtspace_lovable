import { Link } from "@tanstack/react-router";
import { MessageCircle, Sparkles, Star } from "lucide-react";
import type { Character } from "@/data/characters";
import { Button } from "@/components/ui/button";

export function CharacterCard({ character }: { character: Character }) {
  return (
    <article className="group surface-card shine relative flex flex-col overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[var(--shadow-glow)]">
      <div className="relative aspect-4/5 overflow-hidden">
        <img
          src={character.image}
          alt={`${character.name}, ${character.tagline}`}
          loading="lazy"
          width={640}
          height={640}
          className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />

        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[11px] font-medium backdrop-blur-md">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Online
        </span>

        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-1 text-[11px] font-medium backdrop-blur-md">
          <Star className="h-3 w-3 fill-primary text-primary" /> 4.9
        </span>

        <div className="absolute inset-x-4 bottom-4">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
            {character.tagline}
          </p>
          <h3 className="mt-1 font-display text-xl leading-tight font-semibold">
            {character.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 pt-4">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {character.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {character.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/60 bg-secondary/50 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" /> {character.chats} chat
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Memoria attiva
          </span>
        </div>

        <Button variant="hero" size="lg" className="mt-4 w-full" asChild>
          <Link to="/chat/$characterId" params={{ characterId: character.id }}>
            Inizia la conversazione
          </Link>
        </Button>
      </div>
    </article>
  );
}
