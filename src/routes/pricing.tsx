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
      { title: "Pricing — Lumina credit packs" },
      {
        name: "description",
        content:
          "Starter, Premium and VIP credit packs for AI companion chats. One-time purchases, credits never expire.",
      },
      { property: "og:title", content: "Pricing — Lumina credit packs" },
      {
        property: "og:description",
        content: "Starter, Premium and VIP credit packs. No subscription, credits never expire.",
      },
    ],
  }),
  component: Pricing,
});

const billingFaqs = [
  {
    q: "What payment methods are supported?",
    a: "Card payments are processed securely by Stripe. Apple Pay and Google Pay appear automatically on supported devices.",
  },
  {
    q: "Do credits expire?",
    a: "No. Credits stay on your account until you use them, across every companion.",
  },
  {
    q: "Can I buy more credits mid-month?",
    a: "Yes — top up any time from the dashboard, and your balance updates instantly.",
  },
];

function Pricing() {
  return (
    <PageShell>
      <section className="halo px-5 pt-16 pb-12 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold sm:text-5xl">Credits, not commitments</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground sm:text-base">
            One message costs one credit. Buy a pack, chat as much as you want, top up whenever you
            need more.
          </p>
        </div>
      </section>

      <section className="px-5 pb-16">
        <div className="mx-auto max-w-6xl">
          <PricingSection />
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Checkout is powered by Stripe (integration placeholder — no charges are made yet).
          </p>
        </div>
      </section>

      <section className="px-5 pb-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold">Billing questions</h2>
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
