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
      { title: "Your dashboard — Lumina" },
      {
        name: "description",
        content:
          "Manage your account, conversation history, favourite companions, credit balance and subscription.",
      },
      { property: "og:title", content: "Your dashboard — Lumina" },
      {
        property: "og:description",
        content: "Conversation history, favourites, credits and subscription in one place.",
      },
    ],
  }),
  component: Dashboard,
});

/** Placeholder user. Replace with Supabase auth session + `profiles` row. */
const user = {
  name: "Alex Rivera",
  email: "alex@example.com",
  member_since: "March 2026",
  credits: 248,
  credits_total: 500,
  plan: "Premium",
  renews: "12 Sept 2026",
};

const history = [
  { id: "aurora", last: "You made it. I was just thinking about you…", when: "2h ago", count: 142 },
  { id: "milo", last: "Okay so I have a terrible idea…", when: "Yesterday", count: 88 },
  { id: "nadia", last: "Let's make this session count.", when: "3 days ago", count: 27 },
];

function Dashboard() {
  const favourites = characters.slice(0, 4);

  return (
    <PageShell>
      <section className="halo px-5 pt-14 pb-8">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold sm:text-3xl">Welcome back, Alex</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Member since {user.member_since}
            </p>
          </div>
          <Button variant="glass" size="sm">
            <Settings className="h-4 w-4" /> Settings
          </Button>
        </div>
      </section>

      <section className="px-5 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Credits */}
            <div className="surface-card rounded-2xl p-6">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Credits balance</p>
                  <p className="mt-1 flex items-center gap-2 font-display text-3xl font-bold">
                    <Zap className="h-6 w-6 text-primary" />
                    {user.credits}
                  </p>
                </div>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/pricing">Top up</Link>
                </Button>
              </div>
              <Progress
                value={(user.credits / user.credits_total) * 100}
                className="mt-5 h-2 bg-secondary"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {user.credits} of {user.credits_total} credits from your last pack remaining.
              </p>
            </div>

            {/* History */}
            <div className="surface-card rounded-2xl p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <MessageSquare className="h-4 w-4 text-primary" /> Conversation history
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
                          <p className="text-[11px] text-muted-foreground">{h.count} msgs</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Favourites */}
            <div className="surface-card rounded-2xl p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Heart className="h-4 w-4 text-primary" /> Favourite characters
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

          {/* Right column */}
          <div className="space-y-6">
            <div className="surface-card rounded-2xl p-6">
              <h2 className="font-display text-lg font-semibold">Account</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Name</dt>
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
                Edit profile
              </Button>
            </div>

            <div className="surface-card rounded-2xl border-primary/40 p-6">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                <h2 className="font-display text-lg font-semibold">Subscription</h2>
              </div>
              <Badge className="mt-3 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground">
                {user.plan}
              </Badge>
              <p className="mt-3 text-sm text-muted-foreground">
                Long-term memory, priority speed and voice replies are active. Renews{" "}
                {user.renews}.
              </p>
              <Button variant="hero" size="sm" className="mt-5 w-full" asChild>
                <Link to="/pricing">Upgrade to VIP</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
