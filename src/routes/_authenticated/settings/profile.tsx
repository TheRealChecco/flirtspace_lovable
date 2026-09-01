import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { useAuth } from "@/hooks/use-auth";
import { getProfile, updateProfile } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/settings/profile")({
  head: () => ({ meta: [{ title: "Modifica profilo — FlirtSpace" }] }),
  component: EditProfilePage,
});

/**
 * Modifica profilo: username e avatar. Usa il profilo Supabase esistente
 * (tabella `profiles` + `updateProfile`), rispettando la RLS che permette
 * di modificare solo il proprio profilo. Non crea nuovi sistemi utente.
 */
function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = user?.id ?? "";

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(userId),
    enabled: Boolean(userId),
  });
  const profile = profileQuery.data;

  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefilled = useRef(false);

  // Precompila il form una sola volta, quando il profilo è disponibile.
  useEffect(() => {
    if (profile && !prefilled.current) {
      setUsername(profile.username ?? "");
      setAvatar(profile.avatar ?? "");
      prefilled.current = true;
    }
  }, [profile]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const cleanUsername = username.trim();
      if (cleanUsername.length < 3) {
        throw new Error("Il nome utente deve avere almeno 3 caratteri.");
      }
      await updateProfile(userId, {
        username: cleanUsername,
        avatar: avatar.trim() || null,
      });
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("Profilo aggiornato");
      void navigate({ to: "/settings" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Salvataggio non riuscito.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <section className="px-5 pt-14 pb-20">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3">
            <Link
              to="/settings"
              aria-label="Torna alle impostazioni"
              className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-accent/60"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="font-display text-2xl font-bold">Modifica profilo</h1>
          </div>

          <form onSubmit={onSubmit} className="surface-card mt-6 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <CharacterAvatar
                src={avatar || undefined}
                name={username || "?"}
                className="h-16 w-16 rounded-full text-lg"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium">Anteprima avatar</p>
                <p className="text-xs text-muted-foreground">
                  Incolla l'URL di un'immagine per aggiornarlo.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nome utente</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  placeholder="alex"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">URL avatar</Label>
                <Input
                  id="avatar"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  type="url"
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="mt-6 flex gap-2">
              <Button type="submit" variant="hero" size="lg" disabled={busy || profileQuery.isLoading}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salva
              </Button>
              <Button type="button" variant="glass" size="lg" asChild>
                <Link to="/settings">Annulla</Link>
              </Button>
            </div>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
