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
      { title: "FlirtSpace — I tuoi compagni AI personalizzati" },
      {
        name: "description",
        content:
          "Chatta con personalità AI uniche quando vuoi. Conversazioni personalizzate, memoria reale, privacy garantita.",
      },
      { property: "og:title", content: "FlirtSpace — I tuoi compagni AI personalizzati" },
      {
        property: "og:description",
        content: "Chatta con personalità AI uniche — personalizzate, private e sempre disponibili.",
      },
    ],
  }),
  component: Landing,
});

const benefits = [
  {
    icon: Heart,
    title: "Conversazioni personalizzate",
    body: "Ogni compagno si adatta al tuo tono, alla tua storia e alle cose a cui tieni.",
  },
  {
    icon: Wand2,
    title: "Personalità uniche",
    body: "Personaggi creati a mano, con voce, passato e senso dell'umorismo tutti loro.",
  },
  {
    icon: Clock,
    title: "Sempre disponibili",
    body: "Pensieri delle 3 di notte o due parole a metà giornata: il tuo compagno è a un tap.",
  },
  {
    icon: Lock,
    title: "Privato e sicuro",
    body: "Conversazioni criptate, nessuna pubblicità profilata, puoi cancellare tutto quando vuoi.",
  },
];

const faqs = [
  {
    q: "Come funzionano i crediti?",
    a: "Ogni messaggio inviato consuma un credito. I crediti non scadono e puoi ricaricarli quando vuoi dalla tua area personale.",
  },
  {
    q: "I compagni ricordano le conversazioni precedenti?",
    a: "Sì. Con Premium e VIP i compagni mantengono una memoria a lungo termine, così il contesto continua naturalmente.",
  },
  {
    q: "I miei dati sono privati?",
    a: "Le conversazioni sono criptate in transito e a riposo, mai vendute e mai usate per la pubblicità. Puoi eliminarle definitivamente.",
  },
  {
    q: "Posso creare un mio personaggio?",
    a: "I membri VIP possono creare compagni privati su misura, con persona, voce e impostazioni di memoria personalizzate.",
  },
  {
    q: "Posso disdire o chiedere un rimborso?",
    a: "I pacchetti di crediti sono acquisti una tantum, senza abbonamento. I crediti non usati sono rimborsabili entro 14 giorni.",
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
            Ora con memoria a lungo termine
          </span>
          <h1 className="animate-fade-up mt-6 text-4xl leading-[1.05] font-bold sm:text-6xl">
            Incontra i tuoi compagni AI <span className="text-gradient">personalizzati</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Chatta con personalità AI uniche quando vuoi. Ogni compagno ha la sua voce, la sua
            memoria e il suo umore — e ti conosce un po' meglio a ogni conversazione.
          </p>
          <div className="animate-fade-up mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="hero" size="xl" asChild>
              <Link to="/chat/$characterId" params={{ characterId: "aurora" }}>
                Inizia a chattare <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link to="/characters">Esplora i personaggi</Link>
            </Button>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Nessuna carta richiesta · 50 crediti gratuiti all'iscrizione
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

      {/* Personaggi in evidenza */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold sm:text-3xl">Compagni in evidenza</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Personalità selezionate e amate dalla community.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/characters">
                Vedi tutti <ArrowRight className="h-4 w-4" />
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

      {/* Vantaggi */}
      <section className="border-y border-border/60 bg-card/20 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-lg text-2xl font-bold sm:text-3xl">
            Creato per sembrare una connessione vera
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

      {/* Anteprima prezzi */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Pacchetti di crediti semplici</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Paghi solo quello che usi. Nessun abbonamento, nessuna scadenza.
            </p>
          </div>
          <div className="mt-10">
            <PricingSection compact />
          </div>
          <div className="mt-8 text-center">
            <Button variant="ghost" asChild>
              <Link to="/pricing">
                Confronta tutti i piani <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Domande frequenti</h2>
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
