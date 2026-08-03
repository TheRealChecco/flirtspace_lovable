/**
 * Pacchetti di crediti. Sostituisci i `priceId` con veri price ID Stripe
 * quando i pagamenti sono attivi, poi crea la sessione di checkout lato server.
 */
export type Plan = {
  id: string;
  name: string;
  price: number;
  credits: number;
  blurb: string;
  features: string[];
  featured?: boolean;
  priceId: string;
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 9,
    credits: 500,
    blurb: "Prova qualche compagno e trova il tuo preferito.",
    features: [
      "500 crediti di chat",
      "Accesso a tutti i personaggi pubblici",
      "Velocità di risposta standard",
      "7 giorni di cronologia conversazioni",
    ],
    priceId: "price_starter_placeholder",
  },
  {
    id: "premium",
    name: "Premium",
    price: 24,
    credits: 2000,
    blurb: "Per conversazioni quotidiane con vera continuità.",
    features: [
      "2.000 crediti di chat",
      "Memoria a lungo termine tra le chat",
      "Risposte prioritarie",
      "Cronologia e preferiti illimitati",
      "Risposte vocali (beta)",
    ],
    featured: true,
    priceId: "price_premium_placeholder",
  },
  {
    id: "vip",
    name: "VIP",
    price: 59,
    credits: 6000,
    blurb: "Creatività senza limiti e compagni personalizzati.",
    features: [
      "6.000 crediti di chat",
      "Crea personaggi privati su misura",
      "Modelli più veloci e memoria più lunga",
      "Accesso anticipato alle novità",
      "Supporto prioritario",
    ],
    priceId: "price_vip_placeholder",
  },
];
