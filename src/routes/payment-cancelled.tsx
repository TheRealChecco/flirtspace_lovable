import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment-cancelled")({
  head: () => ({ meta: [{ title: "Pagamento annullato — FlirtSpace" }] }),
  component: PaymentCancelled,
});

function PaymentCancelled() {
  return (
    <PageShell>
      <section className="px-5 pt-24 pb-20">
        <div className="mx-auto max-w-md surface-card rounded-3xl p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted">
            <X className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold">Pagamento annullato</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Il pagamento non è stato completato. Nessun addebito è stato effettuato
            e i tuoi crediti sono rimasti invariati.
          </p>
          <div className="mt-7 flex flex-col gap-2">
            <Button variant="hero" asChild>
              <Link to="/pricing">Torna ai pacchetti</Link>
            </Button>
            <Button variant="glass" asChild>
              <Link to="/characters">Esplora i personaggi</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
