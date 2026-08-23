import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getProfile } from "@/lib/api";
import { getPaymentStatus } from "@/lib/stripe.functions";

export const Route = createFileRoute("/_authenticated/payment-success")({
  head: () => ({ meta: [{ title: "Pagamento ricevuto — FlirtSpace" }] }),
  component: PaymentSuccess,
});

function PaymentSuccess() {
  const { user } = useAuth();
  const sessionId = Route.useSearch<{ session_id?: string }>().session_id ?? "";
  const fetchStatus = useServerFn(getPaymentStatus);

  const statusQuery = useQuery({
    queryKey: ["payment-status", sessionId],
    queryFn: () => fetchStatus({ data: { sessionId } }),
    enabled: Boolean(sessionId),
    retry: false,
  });

  // Poll del saldo crediti: si aggiorna quando il webhook ha accreditato.
  const creditsQuery = useQuery({
    queryKey: ["profile-credits", user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: Boolean(user?.id),
    refetchInterval: (q) => (q.state.data?.credits && q.state.data.credits > 0 ? 4000 : false),
    refetchOnWindowFocus: true,
  });

  const [initialCredits] = useState<number | null>(() => null);
  const current = creditsQuery.data?.credits ?? null;
  const [startedAt] = useState(() => Date.now());
  const timedOut = Date.now() - startedAt > 60_000;

  const paid = statusQuery.data?.paymentStatus === "paid";
  const pending = statusQuery.isLoading || !paid;

  return (
    <PageShell>
      <section className="px-5 pt-24 pb-20">
        <div className="mx-auto max-w-md surface-card rounded-3xl p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/15">
            {pending ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <Check className="h-6 w-6 text-primary" />
            )}
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold">
            {paid ? "Pagamento ricevuto" : "In attesa di conferma"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {paid
              ? "Il tuo pagamento è stato confermato. I crediti vengono accreditati automaticamente dal sistema di pagamento: appariranno qui a breve."
              : "Stiamo confermando il pagamento con il sistema di pagamento. I crediti verranno accreditati a processo completato."}
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card/50 px-4 py-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm">
              Salto crediti:{" "}
              <span className="font-semibold">{current ?? "—"}</span>
            </span>
          </div>

          {timedOut && pending && (
            <p className="mt-4 text-xs text-muted-foreground">
              Ci sta mettendo più del previsto. Se i crediti non si aggiornano,
              ricarica la pagina tra qualche istante.
            </p>
          )}

          <div className="mt-7 flex flex-col gap-2">
            <Button variant="hero" asChild>
              <Link to="/characters">Inizia a chattare</Link>
            </Button>
            <Button variant="glass" asChild>
              <Link to="/dashboard">Vai al dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
