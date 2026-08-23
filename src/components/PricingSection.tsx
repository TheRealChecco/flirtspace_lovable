import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { plans, type Plan } from "@/data/plans";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createCheckout } from "@/lib/stripe.functions";

/**
 * Avvia il checkout Stripe per un pacchetto. La sessione viene creata lato
 * server (createCheckout): il client passa solo l'id del pacchetto, il Price ID
 * è determinato dal server dalle env var. L'utente non può scegliere quanti
 * crediti comprare.
 */
function useCheckout() {
  const fetchCheckout = useServerFn(createCheckout);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function startCheckout(plan: Plan) {
    if (loadingId) return;
    setLoadingId(plan.id);
    try {
      const { url } = await fetchCheckout({
        data: { packageId: plan.id as "starter" | "premium" | "vip" },
      });
      window.location.href = url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Unauthorized") || msg.includes("Authentication")) {
        window.location.href = "/auth";
        return;
      }
      toast.error(msg || "Impossibile avviare il checkout. Riprova.");
      setLoadingId(null);
    }
  }

  return { startCheckout, loadingId };
}

/** Formattazione stabile lato server e client (separatore delle migliaia italiano). */
const formatCredits = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Costo per messaggio, arrotondato ai centesimi (2 decimali stabili). */
const perMessage = (plan: Plan) => (plan.price / plan.credits).toFixed(3).replace(".", ",");

export function PricingSection({ compact = false }: { compact?: boolean }) {
  const { startCheckout, loadingId } = useCheckout();

  return (
    <div className="grid gap-6 md:grid-cols-3 md:items-center">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={cn(
            "surface-card relative flex flex-col rounded-3xl p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/40",
            plan.featured &&
              "border-primary/60 shadow-[var(--shadow-glow)] md:scale-[1.045] md:p-8",
          )}
        >
          {plan.featured && (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl bg-[image:var(--gradient-primary)] opacity-[0.07]"
              />
              <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[image:var(--gradient-primary)] px-3.5 py-1 text-[11px] font-semibold whitespace-nowrap text-primary-foreground shadow-[var(--shadow-glow)]">
                <Sparkles className="h-3 w-3" /> Il più scelto
              </span>
            </>
          )}

          <div className="relative">
            <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{plan.blurb}</p>

            <div className="mt-6 flex items-end gap-1.5">
              <span className="font-display text-5xl leading-none font-bold tracking-tight">
                {plan.price}
                <span className="text-2xl">€</span>
              </span>
              <span className="pb-1.5 text-xs text-muted-foreground">una tantum</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Zap className="h-3.5 w-3.5" />
                {formatCredits(plan.credits)} crediti
              </span>
              <span className="text-xs text-muted-foreground">
                ≈ {perMessage(plan)} € a messaggio
              </span>
            </div>

            {!compact && (
              <ul className="mt-7 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full bg-primary/15">
                      <Check className="h-3 w-3 text-primary" />
                    </span>
                    <span className="leading-relaxed text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            )}

            <Button
              variant={plan.featured ? "hero" : "glass"}
              size="lg"
              className="mt-8 w-full"
              onClick={() => startCheckout(plan)}
              disabled={loadingId === plan.id}
            >
              {loadingId === plan.id ? "Reindirizzamento…" : `Scegli ${plan.name}`}
            </Button>

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Pagamento sicuro · I crediti non scadono
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
