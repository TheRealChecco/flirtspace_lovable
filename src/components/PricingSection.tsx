import { Check, Zap } from "lucide-react";
import { plans, type Plan } from "@/data/plans";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * TODO(stripe): sostituire con una server function che crea la sessione
 * Stripe Checkout per `plan.priceId` e reindirizza a session.url.
 */
function startCheckout(plan: Plan) {
  console.info("[stripe placeholder] checkout per", plan.priceId);
  window.alert(`Checkout Stripe (placeholder) — ${plan.name}`);
}

/** Formattazione stabile lato server e client (separatore delle migliaia italiano). */
const formatCredits = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export function PricingSection({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={cn(
            "surface-card relative flex flex-col rounded-3xl p-7 transition-all duration-500 hover:-translate-y-1",
            plan.featured && "border-primary/60 shadow-[var(--shadow-glow)]",
          )}
        >
          {plan.featured && (
            <span className="absolute -top-3 left-7 rounded-full bg-[image:var(--gradient-primary)] px-3 py-1 text-[11px] font-semibold text-primary-foreground">
              Il più scelto
            </span>
          )}
          <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>
          <div className="mt-6 flex items-end gap-1">
            <span className="font-display text-4xl font-bold">{plan.price} €</span>
            <span className="pb-1.5 text-sm text-muted-foreground">una tantum</span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-primary">
            <Zap className="h-4 w-4" />
            {formatCredits(plan.credits)} crediti
          </p>

          {!compact && (
            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
          )}

          <Button
            variant={plan.featured ? "hero" : "glass"}
            size="lg"
            className="mt-8 w-full"
            onClick={() => startCheckout(plan)}
          >
            Scegli {plan.name}
          </Button>
        </div>
      ))}
    </div>
  );
}
