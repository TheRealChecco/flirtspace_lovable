import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, Heart, MessageSquare, Settings, Zap } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { characters } from "@/data/characters";

export const Route = createFileRoute("/dashboard")({
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
    ],
  }),
  component: Dashboard,
});

/** Utente di esempio. Da sostituire con la sessione e la tabella `profiles`. */
const user = {
  name: "Alex Rivera",
  email: "alex@example.com",
  member_since: "marzo 2026",
  credits: 248,
  credits_total: 500,
  plan: "Premium",
  renews: "12 settembre 2026",
};

const history = [
  { id: "aurora", last: "Sei arrivato. Stavo giusto pensando a te…", when: "2 ore fa", count: 142 },
  { id: "milo", last: "Ok, ho un'idea pessima…", when: "Ieri", count: 88 },
  { id: "nadia", last: "Rendiamo utile questa sessione.", when: "3 giorni fa", count: 27 },
];

function Dashboard() {
  const favourites = characters.slice(0, 4);

  return (
    <PageShell>
      <section className="halo px-5 pt-14 pb-8">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold sm:text-3xl">Bentornato, Alex</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Iscritto da {user.member_since}
            </p>
          </div>
          <Button variant="glass" size="sm">
            <Settings className="h-4 w-4" /> Impostazioni
          </Button>
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
                    {user.credits}
                  </p>
                </div>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/pricing">Ricarica</Link>
                </Button>
              </div>
              <Progress
                value={(user.credits / user.credits_total) * 100}
                className="mt-5 h-2 bg-secondary"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Ti restano {user.credits} crediti su {user.credits_total} dell'ultimo pacchetto.
              </p>
            </div>

            {/* Cronologia */}
            <div className="surface-card rounded-2xl p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <MessageSquare className="h-4 w-4 text-primary" /> Cronologia conversazioni
              </h2>
              <ul className="mt-4 divide-y divide-border/60">
                {history.map((h) => {
                  const c = characters.find((ch) => ch.id === h.id)!;
                  return (
                    <li key={h.id}>
                      <Link
                        to="/chat/$characterId"
                        params={{ characterId: c.id }}
                        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3.5 transition-opacity hover:opacity-80"
                      >
                        <img
                          src={c.image}
                          alt={c.name}
                          loading="lazy"
                          width={640}
                          height={640}
                          className="h-11 w-11 shrink-0 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{c.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{h.last}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs text-muted-foreground">{h.when}</p>
                          <p className="text-[11px] text-muted-foreground">{h.count} messaggi</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Preferiti */}
            <div className="surface-card rounded-2xl p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Heart className="h-4 w-4 text-primary" /> Personaggi preferiti
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {favourites.map((c) => (
                  <Link
                    key={c.id}
                    to="/chat/$characterId"
                    params={{ characterId: c.id }}
                    className="group rounded-xl border border-border/60 p-3 text-center transition-colors hover:border-primary/50"
                  >
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      width={640}
                      height={640}
                      className="mx-auto h-14 w-14 rounded-full object-cover"
                    />
                    <p className="mt-2 truncate text-sm font-medium">{c.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{c.tagline}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Colonna destra */}
          <div className="space-y-6">
            <div className="surface-card rounded-2xl p-6">
              <h2 className="font-display text-lg font-semibold">Account</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Nome</dt>
                  <dd className="truncate">{user.name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="truncate">{user.email}</dd>
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
                {user.plan}
              </Badge>
              <p className="mt-3 text-sm text-muted-foreground">
                Memoria a lungo termine, risposte prioritarie e risposte vocali sono attive. Si
                rinnova il {user.renews}.
              </p>
              <Button variant="hero" size="sm" className="mt-5 w-full" asChild>
                <Link to="/pricing">Passa a VIP</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
