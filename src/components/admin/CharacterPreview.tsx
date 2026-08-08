import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { StatusBadges } from "./StatusBadges";
import { TRAITS, type CharacterFormState } from "./character-form";

/** Anteprima live del personaggio come apparirà agli utenti. */
export function CharacterPreview({
  open,
  onOpenChange,
  state,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: CharacterFormState;
}) {
  const topTraits = TRAITS.map((t) => ({ ...t, value: state.traits[t.key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto border-border/70 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-display">Anteprima personaggio</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <div className="surface-card overflow-hidden rounded-2xl">
            <div className="relative aspect-[3/4]">
              <CharacterAvatar
                src={state.avatar || null}
                name={state.name || "?"}
                className="absolute inset-0 h-full w-full"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent p-4 pt-12">
                <p className="font-display text-lg font-semibold">{state.name || "Senza nome"}</p>
                <p className="text-xs text-muted-foreground">{state.tagline}</p>
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <StatusBadges character={state} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {[
                ["Nome visualizzato", state.display_name],
                ["Slug", state.slug],
                ["Età", state.age && `${state.age} anni`],
                ["Genere", state.gender],
                ["Nazionalità", state.nationality],
                ["Lingua", state.language],
                ["Professione", state.profession],
                ["Aspetto", [state.hair_color, state.eye_color, state.height_cm && `${state.height_cm} cm`].filter(Boolean).join(" · ")],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k as string}>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</p>
                    <p className="truncate">{v}</p>
                  </div>
                ))}
            </div>
            {state.greeting && (
              <div className="flex gap-2.5">
                <CharacterAvatar src={state.avatar || null} name={state.name || "?"} className="h-8 w-8 shrink-0 rounded-full text-xs" />
                <div className="rounded-2xl rounded-tl-md border border-border/70 bg-card/80 px-3.5 py-2.5 text-sm">
                  {state.greeting}
                </div>
              </div>
            )}
            {state.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {state.interests.map((i) => (
                  <Badge key={i} variant="outline" className="rounded-full text-[11px]">
                    {i}
                  </Badge>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <MessageCircle className="h-3 w-3" /> Tratti dominanti
              </p>
              {topTraits.map((t) => (
                <div key={t.key} className="flex items-center gap-3 text-xs">
                  <span className="w-24 shrink-0 text-muted-foreground">{t.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                      style={{ width: `${t.value * 10}%` }}
                    />
                  </div>
                  <span className="w-4 text-right font-medium">{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
