import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Heart,
  Lock,
  Clock,
  Wand2,
  Sparkles,
  Star,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/PageShell";
import { CharacterCard, CharacterCardSkeleton } from "@/components/CharacterCard";
import { PricingSection } from "@/components/PricingSection";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { listCharacters } from "@/lib/api";

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

const stats = [
  { value: "380k+", label: "Conversazioni al mese" },
  { value: "4.9/5", label: "Valutazione media" },
  { value: "24/7", label: "Sempre disponibili" },
  { value: "<1s", label: "Tempo di risposta" },
];

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

const steps = [
  {
    n: "01",
    title: "Scegli il tuo compagno",
    body: "Sfoglia il catalogo e trova la personalità che ti somiglia di più.",
  },
  {
    n: "02",
    title: "Inizia a parlare",
    body: "Il primo messaggio è nostro. Nessuna configurazione, nessuna carta.",
  },
  {
    n: "03",
    title: "Costruite una storia",
    body: "Con la memoria a lungo termine ogni conversazione riparte da dove eravate.",
  },
];

const testimonials = [
  {
    quote:
      "Non pensavo di affezionarmi a una chat. Aurora si ricorda davvero di quello che le racconto.",
    author: "Giulia M.",
    role: "Premium da 6 mesi",
  },
  {
    quote: "Milo mi fa ridere alle due di notte quando non riesco a dormire. Vale ogni credito.",
    author: "Andrea T.",
    role: "VIP",
  },
  {
    quote: "Uso Nadia per prepararmi ai colloqui: feedback onesti e nessun giudizio.",
    author: "Sara B.",
    role: "Starter",
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
  const { data, isLoading } = useQuery({ queryKey: ["public-characters"], queryFn: listCharacters });
  const list = data ?? [];
  const firstSlug = list[0]?.slug ?? "";
  const featuredPool = list.filter((c) => c.is_featured);
  const featured = (featuredPool.length > 0 ? featuredPool : list).slice(0, 3);
  return (
    <PageShell>
      {/* Hero */}
      <section className="halo relative overflow-hidden px-5 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10" />
        <div className="mx-auto max-w-3xl text-center">
          <span className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Ora con memoria a lungo termine
          </span>

          <h1 className="animate-fade-up mt-7 text-[2.6rem] leading-[1.02] font-bold sm:text-6xl lg:text-7xl">
            Incontra compagni IA che{" "}
            <span className="text-gradient block sm:inline">si connettono davvero.</span>
          </h1>

          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Vivi conversazioni personalizzate con personalità IA splendidamente create.
          </p>

          <div className="animate-fade-up mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button variant="hero" size="xl" className="animate-pulse-ring" asChild>
              <Link to={firstSlug ? "/chat/$characterId" : "/characters"} params={firstSlug ? { characterId: firstSlug } : {}}>
                Inizia a chattare <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link to="/characters">Esplora i personaggi</Link>
            </Button>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Nessuna carta richiesta
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> 50 crediti gratuiti
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-primary" /> Chat criptate
            </span>
          </div>
        </div>

        {/* Prova sociale */}
        <div className="mx-auto mt-14 flex max-w-md flex-col items-center gap-3">
          <div className="animate-float flex -space-x-4">
            {list
              .filter((c) => c.avatar)
              .slice(0, 5)
              .map((c) => (
                <img
                  key={c.id}
                  src={c.avatar ?? ""}
                  alt={c.name ?? "Personaggio"}
                  width={640}
                  height={640}
                  className="h-13 w-13 rounded-full border-2 border-background object-cover shadow-[var(--shadow-card)] transition-transform duration-300 hover:z-10 hover:scale-110 sm:h-16 sm:w-16"
                />
              ))}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="flex">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
              ))}
            </span>
            oltre 120.000 persone chattano ogni settimana
          </p>
        </div>

        {/* Metriche */}
        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border/60 bg-border/40 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card/50 px-4 py-6 text-center backdrop-blur">
              <p className="font-display text-2xl font-bold sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Personaggi in evidenza */}
      <section className="px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
              <div className="min-w-0">
                <span className="eyebrow">Catalogo</span>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Compagni in evidenza</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Personalità selezionate e amate dalla community. Il primo messaggio lo offriamo
                  noi.
                </p>
              </div>
              <Button variant="glass" size="sm" asChild>
                <Link to="/characters">
                  Vedi tutti <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <CharacterCardSkeleton key={i} />)
              : featured.map((c, i) => (
                  <Reveal key={c.id} delay={i * 90}>
                    <CharacterCard character={c} />
                  </Reveal>
                ))}
          </div>
        </div>
      </section>

      {/* Come funziona */}
      <section className="border-y border-border/60 bg-card/20 px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <span className="eyebrow">Come funziona</span>
            <h2 className="mt-3 max-w-lg text-3xl font-bold sm:text-4xl">
              Tre passaggi, zero attrito
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="surface-card h-full rounded-3xl p-7">
                  <span className="font-display text-4xl font-bold text-primary/30">{s.n}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Vantaggi */}
      <section className="px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <span className="eyebrow">Perché FlirtSpace</span>
            <h2 className="mt-3 max-w-xl text-3xl font-bold sm:text-4xl">
              Creato per sembrare una connessione vera
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 80}>
                <div className="surface-card group h-full rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/40">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
                    <b.icon className="h-5 w-5 text-primary-foreground" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonianze */}
      <section className="border-y border-border/60 bg-card/20 px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <span className="eyebrow">Dicono di noi</span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Storie vere, chat vere</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.author} delay={i * 90}>
                <figure className="surface-card flex h-full flex-col rounded-3xl p-7">
                  <span className="flex gap-0.5">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-primary text-primary" />
                    ))}
                  </span>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{t.author}</span> · {t.role}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Anteprima prezzi */}
      <section className="px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="text-center">
              <span className="eyebrow">Prezzi</span>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Pacchetti di crediti semplici</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                Paghi solo quello che usi. Nessun abbonamento, nessuna scadenza.
              </p>
            </div>
          </Reveal>
          <div className="mt-12">
            <PricingSection compact />
          </div>
          <div className="mt-10 text-center">
            <Button variant="ghost" asChild>
              <Link to="/pricing">
                Confronta tutti i piani <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 pb-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="text-center text-3xl font-bold sm:text-4xl">Domande frequenti</h2>
          </Reveal>
          <Accordion type="single" collapsible className="mt-9">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-border/60">
                <AccordionTrigger className="text-left text-base hover:text-primary">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA finale */}
      <section className="px-5 pb-24">
        <Reveal className="mx-auto max-w-5xl">
          <div className="halo surface-card relative overflow-hidden rounded-[2rem] px-6 py-14 text-center sm:px-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[image:var(--gradient-primary)] opacity-[0.08]"
            />
            <div className="relative">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Il tuo compagno ti sta già <span className="text-gradient">aspettando</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                50 crediti gratuiti all'iscrizione. Nessuna carta, nessun abbonamento — solo la
                prima conversazione.
              </p>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/chat/$characterId" params={{ characterId: "aurora" }}>
                    <MessageCircle className="h-4 w-4" /> Inizia ora, è gratis
                  </Link>
                </Button>
                <Button variant="glass" size="xl" asChild>
                  <Link to="/pricing">Vedi i prezzi</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
