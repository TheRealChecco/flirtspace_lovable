import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Crown, Heart, LogOut, MessageSquare, Settings, Zap } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { listConversations, listFavorites, getProfile } from "@/lib/api";
import { characters as staticCharacters } from "@/data/characters";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Area personale — FlirtSpace" },
      {
        name: "description",
        content:
          "Gestisci account, cronologia delle conversazioni, compagni preferiti, saldo crediti e abbonamento.",
      },
      { property: "og:title", content: "Area personale — FlirtSpace" },
      {
        property: "og:description",
        content: "Cronologia, preferiti, crediti e abbonamento in un unico posto.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const PLAN_LABEL: Record<string, string> = {
  free: "Gratuito",
  starter: "Starter",
  premium: "Premium",
  vip: "VIP",
};

/** Immagini locali finché gli avatar non sono caricati sullo storage. */
function imageForSlug(slug: string) {
  return staticCharacters.find((c) => c.id === slug)?.image;
}

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
            <Button variant="glass" size="sm">
              <Settings className="h-4 w-4" /> Impostazioni
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Esci
            </Button>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {/* Colonna sinistra */}
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
                        <img
                          src={conv.character.avatar ?? imageForSlug(conv.character.slug ?? "") ?? ""}
                          alt={conv.character.name ?? "Personaggio"}
                          loading="lazy"
                          width={640}
                          height={640}
                          className="h-11 w-11 shrink-0 rounded-full object-cover"
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
                      <img
                        src={fav.character.avatar ?? imageForSlug(fav.character.slug ?? "") ?? ""}
                        alt={fav.character.name ?? "Personaggio"}
                        loading="lazy"
                        width={640}
                        height={640}
                        className="mx-auto h-14 w-14 rounded-full object-cover"
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

          {/* Colonna destra */}
          <div className="space-y-6">
            <div className="surface-card rounded-2xl p-6">
              <h2 className="font-display text-lg font-semibold">Account</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Nome utente</dt>
                  <dd className="truncate">{profile?.username ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="truncate">{profile?.email ?? user?.email ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Password</dt>
                  <dd>••••••••</dd>
                </div>
              </dl>
              <Button variant="glass" size="sm" className="mt-5 w-full">
                Modifica profilo
              </Button>
            </div>

            <div className="surface-card rounded-2xl border-primary/40 p-6">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                <h2 className="font-display text-lg font-semibold">Abbonamento</h2>
              </div>
              <Badge className="mt-3 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground">
                {PLAN_LABEL[profile?.subscription ?? "free"]}
              </Badge>
              <p className="mt-3 text-sm text-muted-foreground">
                {profile?.subscription === "free"
                  ? "Passa a un piano superiore per memoria a lungo termine, risposte prioritarie e voce."
                  : "Memoria a lungo termine, risposte prioritarie e risposte vocali sono attive."}
              </p>
              <Button variant="hero" size="sm" className="mt-5 w-full" asChild>
                <Link to="/pricing">Vedi i piani</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
