import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, LogOut, MessageSquare, Settings, Zap } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { listConversations, listFavorites, getProfile } from "@/lib/api";
import { CharacterAvatar } from "@/components/CharacterAvatar";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Area personale — FlirtSpace" },
      {
        name: "description",
        content:
          "Cronologia delle conversazioni, compagni preferiti e saldo crediti.",
      },
      { property: "og:title", content: "Area personale — FlirtSpace" },
      {
        property: "og:description",
        content: "Cronologia, preferiti e crediti in un unico posto.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function formatWhen(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Adesso";
  if (hours < 24) return `${hours} ore fa`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Ieri" : `${days} giorni fa`;
}

function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = user?.id ?? "";

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(userId),
    enabled: Boolean(userId),
  });
  const conversationsQuery = useQuery({
    queryKey: ["conversations", userId],
    queryFn: () => listConversations(userId),
    enabled: Boolean(userId),
  });
  const favoritesQuery = useQuery({
    queryKey: ["favorites", userId],
    queryFn: () => listFavorites(userId),
    enabled: Boolean(userId),
  });

  const profile = profileQuery.data;
  const creditsTotal = Math.max(profile?.credits ?? 0, 500);
  const history = conversationsQuery.data ?? [];
  const favourites = favoritesQuery.data ?? [];

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <PageShell>
      <section className="halo px-5 pt-14 pb-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold sm:text-3xl">
              Bentornato{profile?.username ? `, ${profile.username}` : ""}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {profile
                ? `Iscritto dal ${new Date(profile.created_at).toLocaleDateString("it-IT", { month: "long", year: "numeric" })}`
                : "Caricamento del profilo…"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="glass" size="sm" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4" /> Impostazioni
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Esci
            </Button>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          {/* Colonna principale */}
          <div className="space-y-6 lg:col-span-2">
            {/* Crediti */}
            <div className="surface-card rounded-2xl p-6">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Saldo crediti</p>
                  <p className="mt-1 flex items-center gap-2 font-display text-3xl font-bold">
                    <Zap className="h-6 w-6 text-primary" />
                    {profile?.credits ?? 0}
                  </p>
                </div>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/pricing">Ricarica</Link>
                </Button>
              </div>
              <Progress
                value={((profile?.credits ?? 0) / creditsTotal) * 100}
                className="mt-5 h-2 bg-secondary"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Ti restano {profile?.credits ?? 0} crediti su {creditsTotal}.
              </p>
            </div>

            {/* Cronologia */}
            <div className="surface-card rounded-2xl p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <MessageSquare className="h-4 w-4 text-primary" /> Cronologia conversazioni
              </h2>
              {history.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Nessuna conversazione ancora.{" "}
                  <Link to="/characters" className="text-foreground underline">
                    Scopri i personaggi
                  </Link>
                  .
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-border/60">
                  {history.map((conv) => (
                    <li key={conv.id}>
                      <Link
                        to="/chat/$characterId"
                        params={{ characterId: conv.character.slug ?? "" }}
                        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3.5 transition-opacity hover:opacity-80"
                      >
                        <CharacterAvatar
                          src={conv.character.avatar}
                          name={conv.character.name ?? "Personaggio"}
                          className="h-11 w-11 shrink-0 rounded-full"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{conv.character.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {conv.character.tagline}
                          </p>
                        </div>
                        <p className="shrink-0 text-xs text-muted-foreground">
                          {formatWhen(conv.updated_at)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Preferiti */}
            <div className="surface-card rounded-2xl p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Heart className="h-4 w-4 text-primary" /> Personaggi preferiti
              </h2>
              {favourites.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Non hai ancora salvato nessun personaggio.
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {favourites.map((fav) => (
                    <Link
                      key={fav.id}
                      to="/chat/$characterId"
                      params={{ characterId: fav.character.slug ?? "" }}
                      className="group rounded-xl border border-border/60 p-3 text-center transition-colors hover:border-primary/50"
                    >
                      <CharacterAvatar
                        src={fav.character.avatar}
                        name={fav.character.name ?? "Personaggio"}
                        className="mx-auto h-14 w-14 rounded-full text-lg"
                      />
                      <p className="mt-2 truncate text-sm font-medium">{fav.character.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {fav.character.tagline}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
