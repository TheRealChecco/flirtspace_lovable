import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CharacterEditor } from "@/components/admin/CharacterEditor";
import { getCharacterById } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/admin/characters/$id")({
  head: () => ({
    meta: [{ title: "Modifica personaggio — FlirtSpace Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: EditCharacterPage,
});

function EditCharacterPage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-character", id],
    queryFn: () => getCharacterById(id),
  });

  if (isLoading) {
    return <div className="surface-card h-96 animate-pulse rounded-3xl" />;
  }
  if (!data) {
    return (
      <div className="surface-card mx-auto max-w-md rounded-3xl p-8 text-center">
        <h1 className="font-display text-lg font-semibold">Personaggio non trovato</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Potrebbe essere stato eliminato da un altro amministratore.
        </p>
        <Button variant="hero" className="mt-5" asChild>
          <Link to="/admin/characters">Torna alla lista</Link>
        </Button>
      </div>
    );
  }
  return <CharacterEditor key={data.id} initial={data} />;
}
