import { createFileRoute, Link, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, Lock, Mail, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/flirtspace-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({ to: safePath(search.redirect) });
    }
  },
  head: () => ({
    meta: [
      { title: "Accedi o registrati — FlirtSpace" },
      {
        name: "description",
        content:
          "Accedi al tuo account FlirtSpace o creane uno nuovo per chattare con i compagni IA e gestire i tuoi crediti.",
      },
      { property: "og:title", content: "Accedi o registrati — FlirtSpace" },
      {
        property: "og:description",
        content: "Entra in FlirtSpace: conversazioni personalizzate con personalità IA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

/** Accetta solo percorsi interni, mai URL esterni. */
function safePath(value: string | undefined): string {
  if (!value) return "/dashboard";
  try {
    const url = new URL(value, "http://local");
    return url.pathname.startsWith("/") ? `${url.pathname}${url.search}` : "/dashboard";
  } catch {
    return "/dashboard";
  }
}

type Mode = "signin" | "signup";

function AuthPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signup") {
        await signUp({ email, password, username });
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          await router.invalidate();
          void navigate({ to: safePath(redirectTo) });
        } else {
          setNotice("Ti abbiamo inviato un'email: conferma l'indirizzo per attivare l'account.");
        }
      } else {
        await signIn({ email, password });
        await router.invalidate();
        void navigate({ to: safePath(redirectTo) });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Qualcosa è andato storto.");
    } finally {
      setBusy(false);
    }
  }

  async function onForgotPassword() {
    if (!email) {
      setError("Inserisci prima la tua email.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await resetPassword(email);
      setNotice("Se l'indirizzo esiste, riceverai un link per reimpostare la password.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Qualcosa è andato storto.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="halo grid min-h-dvh place-items-center bg-background px-5 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <img
            src={logo.url}
            alt="Logo FlirtSpace"
            width={512}
            height={512}
            className="h-10 w-10 rounded-xl object-cover ring-1 ring-border/70"
          />
          <span className="font-display text-xl font-semibold tracking-tight">
            Flirt<span className="text-gradient">Space</span>
          </span>
        </Link>

        <div className="surface-card rounded-2xl p-7">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {mode === "signin" ? "Bentornato" : "Crea il tuo account"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Accedi per riprendere le tue conversazioni."
              : "50 crediti gratuiti al primo accesso, nessuna carta richiesta."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="username">Nome utente</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alex"
                    autoComplete="username"
                    required
                    minLength={3}
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@esempio.com"
                  autoComplete="email"
                  required
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={8}
                  className="pl-9"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-foreground">
                {notice}
              </p>
            )}

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {mode === "signin" ? "Accedi" : "Crea account"}
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setNotice(null);
              }}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {mode === "signin" ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
            </button>
            {mode === "signin" && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Password dimenticata?
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Continuando accetti i Termini di servizio e la Privacy policy di FlirtSpace.
        </p>
      </div>
    </div>
  );
}
