import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PricingSection } from "@/components/PricingSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Prezzi — pacchetti crediti FlirtSpace" },
      {
        name: "description",
        content:
          "Pacchetti crediti Starter, Premium e VIP per chattare con i compagni AI. Acquisti una tantum, i crediti non scadono.",
      },
      { property: "og:title", content: "Prezzi — pacchetti crediti FlirtSpace" },
      {
        property: "og:description",
        content: "Pacchetti Starter, Premium e VIP. Nessun abbonamento, i crediti non scadono.",
      },
    ],
  }),
  component: Pricing,
});

const billingFaqs = [
  {
    q: "Quali metodi di pagamento sono accettati?",
    a: "I pagamenti con carta sono gestiti in sicurezza da Stripe. Apple Pay e Google Pay compaiono automaticamente sui dispositivi compatibili.",
  },
  {
    q: "I crediti scadono?",
    a: "No. I crediti restano sul tuo account finché non li usi, con qualsiasi compagno.",
  },
  {
    q: "Posso comprare altri crediti durante il mese?",
    a: "Sì — ricarica quando vuoi dalla tua area personale e il saldo si aggiorna all'istante.",
  },
];

function Pricing() {
  return (
    <PageShell>
      <section className="halo px-5 pt-16 pb-12 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold sm:text-5xl">Crediti, non vincoli</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground sm:text-base">
            Un messaggio costa un credito. Compra un pacchetto, chatta quanto vuoi e ricarica solo
            quando ti serve.
          </p>
        </div>
      </section>

      <section className="px-5 pb-16">
        <div className="mx-auto max-w-6xl">
          <PricingSection />
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Il checkout è gestito da Stripe (integrazione di prova — nessun addebito reale).
          </p>
        </div>
      </section>

      <section className="px-5 pb-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold">Domande sulla fatturazione</h2>
          <Accordion type="single" collapsible className="mt-8">
            {billingFaqs.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-border/60">
                <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </PageShell>
  );
}
