import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Crown, LogOut, Mail, User } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { getProfile } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/settings/")({
  head: () => ({ meta: [{ title: "Impostazioni — FlirtSpace" }] }),
  component: SettingsPage,
});

const PLAN_LABEL: Record<string, string> = {
  free: "Gratuito",
  starter: "Starter",
  premium: "Premium",
  vip: "VIP",
};

/**
 * Pagina Impostazioni: panoramica account (dati già presenti nel profilo
 * Supabase), accesso alla modifica del profilo e logout. Non introduce nuove
 * funzionalità — usa solo ciò che il progetto già supporta.
 */
function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = user?.id ?? "";

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(userId),
    enabled: Boolean(userId),
  });
  const profile = profileQuery.data;

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <PageShell>
      <section className="px-5 pt-14 pb-20">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              aria-label="Torna all'area personale"
              className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-accent/60"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="font-display text-2xl font-bold">Impostazioni</h1>
          </div>

          <div className="surface-card mt-6 rounded-2xl p-6">
            <h2 className="font-display text-lg font-semibold">Account</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" /> Nome utente
                </dt>
                <dd className="truncate">{profile?.username ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" /> Email
                </dt>
                <dd className="truncate">{profile?.email ?? user?.email ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Crown className="h-4 w-4" /> Piano
                </dt>
                <dd>
                  <Badge className="rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground">
                    {PLAN_LABEL[profile?.subscription ?? "free"]}
                  </Badge>
                </dd>
              </div>
            </dl>
            <Button variant="glass" size="sm" className="mt-5 w-full" asChild>
              <Link to="/settings/profile">Modifica profilo</Link>
            </Button>
          </div>

          <div className="surface-card mt-6 rounded-2xl p-6">
            <h2 className="font-display text-lg font-semibold">Sessione</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Esci dal tuo account su questo dispositivo.
            </p>
            <Button variant="ghost" size="sm" className="mt-4 w-full" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Esci
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
