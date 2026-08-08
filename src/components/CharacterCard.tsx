import { Link } from "@tanstack/react-router";
import { ArrowRight, Crown, MessageCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import type { PublicCharacter } from "@/types/database";

/** Card del marketplace: riceve il personaggio pubblico letto dal database. */
export function CharacterCard({ character }: { character: PublicCharacter }) {
  const name = character.name ?? "Senza nome";
  const slug = character.slug ?? "";
  const tags = character.tags ?? [];

  return (
    <article className="group surface-card shine relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[var(--shadow-glow)]">
      {/* Ritratto */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <CharacterAvatar
          src={character.avatar}
          name={name}
          className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

        {/* Badge */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {character.is_new && (
            <Badge className="gap-1 rounded-full border-transparent bg-[image:var(--gradient-primary)] text-primary-foreground">
              <Sparkles className="h-3 w-3" /> Nuovo
            </Badge>
          )}
          {character.is_premium && (
            <Badge className="gap-1 rounded-full border-amber-300/40 bg-background/80 text-amber-200 backdrop-blur">
              <Crown className="h-3 w-3" /> Premium
            </Badge>
          )}
        </div>

        {/* Stato online */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Online
          </span>
        </div>

        {/* Nome sopra l'immagine */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="font-display text-xl font-semibold">
            {name}
            {character.age ? <span className="ml-1.5 text-base font-normal text-muted-foreground">{character.age}</span> : null}
          </h3>
          <p className="text-sm text-muted-foreground">{character.tagline}</p>
        </div>
      </div>

      {/* Corpo */}
      <div className="flex flex-1 flex-col gap-3 p-4 pt-3">
        <p className="text-sm leading-relaxed text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
          {character.description}
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="rounded-full border-border/70 text-[11px] text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5 text-primary" />
            {character.language ?? "Italiano"}
          </span>
          <Button asChild size="sm" variant="glass" className="group/btn">
            <Link to="/chat/$characterId" params={{ characterId: slug }}>
              Inizia a chattare
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function CharacterCardSkeleton() {
  return (
    <div className="surface-card overflow-hidden rounded-2xl">
      <div className="aspect-[3/4] animate-pulse bg-secondary/50" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-3/4 animate-pulse rounded bg-secondary/50" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-secondary/50" />
      </div>
    </div>
  );
}
