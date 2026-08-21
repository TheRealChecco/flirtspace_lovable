import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getMyRoles } from "@/lib/api";

/**
 * Sezione amministrazione: riservata agli utenti con ruolo admin.
 * Il gate verifica il ruolo lato client (la RLS blocca comunque ogni accesso ai dati).
 */
export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const roles = await getMyRoles(data.user.id);
    if (!roles.includes("admin")) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [{ title: "Amministrazione — FlirtSpace" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img src="/favicon.png" alt="FlirtSpace" className="h-7 w-7 rounded-md" />
              <span className="font-display text-sm font-semibold">
                FlirtSpace <span className="text-gradient">Admin</span>
              </span>
            </Link>
            <span className="hidden items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary sm:inline-flex">
              <ShieldCheck className="h-3 w-3" /> Admin
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="glass" size="sm" asChild>
              <Link to="/admin/characters">Personaggi</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Torna al sito</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}
