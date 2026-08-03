import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Lock, Clock, Wand2, Sparkle } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { CharacterCard } from "@/components/CharacterCard";
import { PricingSection } from "@/components/PricingSection";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { characters } from "@/data/characters";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumina — Meet your personalized AI companions" },
      {
        name: "description",
        content:
          "Chat with unique AI personalities anytime. Personalized conversations, real memory, private and secure.",
      },
      { property: "og:title", content: "Lumina — Meet your personalized AI companions" },
      {
        property: "og:description",
        content: "Chat with unique AI personalities anytime — personalized, private and always on.",
      },
    ],
  }),
  component: Landing,
});

const benefits = [
  {
    icon: Heart,
    title: "Personalized conversations",
    body: "Every companion adapts to your tone, your history and the things you care about.",
  },
  {
    icon: Wand2,
    title: "Unique personalities",
    body: "Hand-crafted characters with their own voice, backstory and sense of humour.",
  },
  {
    icon: Clock,
    title: "Available anytime",
    body: "3am thoughts or a midday pep talk — your companion is one tap away, always.",
  },
  {
    icon: Lock,
    title: "Private and secure",
    body: "Encrypted conversations, no ad targeting, and you can delete everything at any time.",
  },
];

const faqs = [
  {
    q: "How do credits work?",
    a: "Each message you send uses one credit. Credits never expire, and you can top up any time from your dashboard.",
  },
  {
    q: "Do companions remember our previous conversations?",
    a: "Yes. On Premium and VIP, companions keep long-term memory across sessions so context carries over naturally.",
  },
  {
    q: "Is my data private?",
    a: "Conversations are encrypted in transit and at rest, never sold, and never used for advertising. You can delete any conversation permanently.",
  },
  {
    q: "Can I create my own character?",
    a: "VIP members can build private custom companions with their own persona, voice and memory settings.",
  },
  {
    q: "Can I cancel or get a refund?",
    a: "Credit packs are one-time purchases with no subscription lock-in. Unused credits can be refunded within 14 days.",
  },
];

function Landing() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="halo relative overflow-hidden px-5 pt-20 pb-24 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <Sparkle className="h-3.5 w-3.5 text-primary" />
            Now with long-term memory
          </span>
          <h1 className="animate-fade-up mt-6 text-4xl leading-[1.05] font-bold sm:text-6xl">
            Meet your <span className="text-gradient">personalized</span> AI companions
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Chat with unique AI personalities anytime. Each companion has their own voice, memory
            and mood — and they get to know you a little more with every conversation.
          </p>
          <div className="animate-fade-up mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="hero" size="xl" asChild>
              <Link to="/chat/$characterId" params={{ characterId: "aurora" }}>
                Start chatting <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link to="/characters">Explore characters</Link>
            </Button>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            No card required · 50 free credits on signup
          </p>
        </div>

        <div className="animate-float mx-auto mt-16 flex max-w-md -space-x-4">
          {characters.slice(0, 5).map((c) => (
            <img
              key={c.id}
              src={c.image}
              alt={c.name}
              width={640}
              height={640}
              className="h-14 w-14 rounded-full border-2 border-background object-cover sm:h-16 sm:w-16"
            />
          ))}
        </div>
      </section>

      {/* Featured characters */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold sm:text-3xl">Featured companions</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Hand-picked personalities loved by the community.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/characters">
                See all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {characters.slice(0, 3).map((c) => (
              <CharacterCard key={c.id} character={c} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-border/60 bg-card/20 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-lg text-2xl font-bold sm:text-3xl">
            Built to feel like a real connection
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="surface-card rounded-2xl p-6 transition-transform duration-500 hover:-translate-y-1"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent">
                  <b.icon className="h-5 w-5 text-primary" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Simple credit packs</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Pay for what you use. No subscriptions, no expiry.
            </p>
          </div>
          <div className="mt-10">
            <PricingSection compact />
          </div>
          <div className="mt-8 text-center">
            <Button variant="ghost" asChild>
              <Link to="/pricing">
                Compare full plans <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Frequently asked</h2>
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-border/60">
                <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </PageShell>
  );
}
