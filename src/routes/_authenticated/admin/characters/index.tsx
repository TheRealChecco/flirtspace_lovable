import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Eye, Loader2, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { CharacterPreview } from "@/components/admin/CharacterPreview";
import { StatusBadges } from "@/components/admin/StatusBadges";
import { formFromRecord } from "@/components/admin/character-form";
import { deleteCharacter, duplicateCharacter, listAllCharacters } from "@/lib/api";
import type { CharacterRecord } from "@/types/database";

export const Route = createFileRoute("/_authenticated/admin/characters/")({
  head: () => ({
    meta: [{ title: "Personaggi — FlirtSpace Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminCharactersPage,
});

const FILTERS = [
  { value: "tutti", label: "Tutti" },
  { value: "attivi", label: "Attivi" },
  { value: "bozze", label: "Bozze" },
  { value: "archiviati", label: "Archiviati" },
  { value: "nascosti", label: "Nascosti" },
  { value: "evidenza", label: "In evidenza" },
  { value: "premium", label: "Premium" },
  { value: "nuovi", label: "Nuovi" },
];

function matchesFilter(c: CharacterRecord, filter: string): boolean {
  switch (filter) {
    case "attivi":
      return c.status === "active" && !c.is_hidden;
    case "bozze":
      return c.status === "draft";
    case "archiviati":
      return c.status === "archived";
    case "nascosti":
      return Boolean(c.is_hidden);
    case "evidenza":
      return Boolean(c.is_featured);
    case "premium":
      return Boolean(c.is_premium);
    case "nuovi":
      return Boolean(c.is_new);
    default:
      return true;
  }
}

function AdminCharactersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("tutti");
  const [preview, setPreview] = useState<CharacterRecord | null>(null);
  const [toDelete, setToDelete] = useState<CharacterRecord | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-characters"],
    queryFn: listAllCharacters,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-characters"] });
    void queryClient.invalidateQueries({ queryKey: ["public-characters"] });
  };

  const deleteMutation = useMutation({
    mutationFn: deleteCharacter,
    onSuccess: () => {
      toast.success("Personaggio eliminato");
      setToDelete(null);
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateCharacter,
    onSuccess: (copy) => {
      toast.success(`Copia creata: ${copy.name}`);
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const characters = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return characters.filter((c) => {
      if (!matchesFilter(c, filter)) return false;
      if (!q) return true;
      return [c.name, c.display_name, c.slug, c.tagline]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [characters, search, filter]);

  const counts = useMemo(
    () => ({
      totali: characters.length,
      attivi: characters.filter((c) => c.status === "active" && !c.is_hidden).length,
      bozze: characters.filter((c) => c.status === "draft").length,
    }),
    [characters],
  );

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Gestione personaggi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {counts.totali} totali · {counts.attivi} attivi · {counts.bozze} bozze
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/admin/characters/new">
            <Plus className="h-4 w-4" /> Nuovo personaggio
          </Link>
        </Button>
      </div>

      {/* Ricerca e filtri */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per nome, slug o tagline…"
            className="h-11 rounded-full border-border/70 bg-card/60 pl-10"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-11 w-full rounded-full border-border/70 bg-card/60 sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="surface-card h-36 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface-card rounded-3xl p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Nessun personaggio corrisponde alla ricerca.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((c) => (
            <article key={c.id} className="surface-card flex gap-4 rounded-2xl p-4">
              <CharacterAvatar
                src={c.avatar}
                name={c.name}
                className="h-16 w-16 shrink-0 rounded-xl text-lg"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h2 className="truncate font-display font-semibold">
                    {c.display_name || c.name}
                  </h2>
                  <StatusBadges character={c} />
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.tagline}</p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">
                  {[c.age && `${c.age} anni`, c.language, `/${c.slug}`].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Button size="sm" variant="glass" asChild>
                    <Link to="/admin/characters/$id" params={{ id: c.id }}>
                      <Pencil className="h-3.5 w-3.5" /> Modifica
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setPreview(c)} aria-label="Anteprima">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => duplicateMutation.mutate(c.id)}
                    disabled={duplicateMutation.isPending}
                    aria-label="Duplica"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setToDelete(c)}
                    aria-label="Elimina"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Anteprima */}
      {preview && (
        <CharacterPreview
          open={Boolean(preview)}
          onOpenChange={(open) => !open && setPreview(null)}
          state={formFromRecord(preview)}
        />
      )}

      {/* Conferma eliminazione */}
      <AlertDialog open={Boolean(toDelete)} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent className="border-border/70 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Il personaggio e tutte le conversazioni collegate verranno rimossi definitivamente.
              Questa azione non si può annullare.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toDelete && deleteMutation.mutate(toDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
