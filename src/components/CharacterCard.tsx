import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import type { Character } from "@/data/characters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CharacterCard({ character }: { character: Character }) {
  return (
    <article className="group surface-card flex flex-col overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/50">
      <div className="relative aspect-4/5 overflow-hidden">
        <img
          src={character.image}
          alt={`${character.name}, ${character.tagline}`}
          loading="lazy"
          width={640}
          height={640}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[image:var(--gradient-subtle)]" />
        <span className="absolute top-3 left-3 rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
          {character.tagline}
        </span>
        <span className="absolute right-3 bottom-3 flex items-center gap-1 text-[11px] text-muted-foreground">
          <MessageCircle className="h-3 w-3" /> {character.chats}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold">{character.name}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {character.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {character.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="rounded-full font-normal">
              {tag}
            </Badge>
          ))}
        </div>
        <Button variant="hero" className="mt-5 w-full" asChild>
          <Link to="/chat/$characterId" params={{ characterId: character.id }}>
            Start conversation
          </Link>
        </Button>
      </div>
    </article>
  );
}
