import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CharacterStatus } from "@/types/database";

type Flags = {
  status: CharacterStatus;
  is_hidden?: boolean | null;
  is_featured?: boolean | null;
  is_premium?: boolean | null;
  is_new?: boolean | null;
};

const pill = "rounded-full px-2 py-0 text-[10px] font-semibold uppercase tracking-wider";

/** Badge di stato del personaggio, usati nella lista admin e nell'anteprima. */
export function StatusBadges({ character }: { character: Flags }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {character.status === "active" && (
        <Badge className={cn(pill, "border-emerald-400/30 bg-emerald-400/10 text-emerald-300")}>
          Attivo
        </Badge>
      )}
      {character.status === "draft" && (
        <Badge className={cn(pill, "border-amber-400/30 bg-amber-400/10 text-amber-300")}>
          Bozza
        </Badge>
      )}
      {character.status === "archived" && (
        <Badge className={cn(pill, "border-border bg-secondary text-muted-foreground")}>
          Archiviato
        </Badge>
      )}
      {character.is_hidden && (
        <Badge variant="outline" className={cn(pill, "text-muted-foreground")}>
          Nascosto
        </Badge>
      )}
      {character.is_featured && (
        <Badge className={cn(pill, "border-primary/40 bg-primary/15 text-primary")}>In evidenza</Badge>
      )}
      {character.is_premium && (
        <Badge className={cn(pill, "border-amber-300/40 bg-amber-300/10 text-amber-200")}>
          Premium
        </Badge>
      )}
      {character.is_new && (
        <Badge className={cn(pill, "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300")}>
          Nuovo
        </Badge>
      )}
    </span>
  );
}
