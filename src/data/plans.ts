/**
 * Credit packages. Replace `priceId` values with real Stripe price IDs
 * once Stripe payments are enabled, then create a checkout session server-side.
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
    blurb: "Try a few companions and find your favourite.",
    features: [
      "500 chat credits",
      "Access to all public characters",
      "Standard response speed",
      "7 days of conversation history",
    ],
    priceId: "price_starter_placeholder",
  },
  {
    id: "premium",
    name: "Premium",
    price: 24,
    credits: 2000,
    blurb: "For daily conversations with real continuity.",
    features: [
      "2,000 chat credits",
      "Long-term memory across chats",
      "Priority response speed",
      "Unlimited history & favourites",
      "Voice replies (beta)",
    ],
    featured: true,
    priceId: "price_premium_placeholder",
  },
  {
    id: "vip",
    name: "VIP",
    price: 59,
    credits: 6000,
    blurb: "Unlimited creativity and custom companions.",
    features: [
      "6,000 chat credits",
      "Create custom private characters",
      "Fastest models & longest memory",
      "Early access to new features",
      "Priority support",
    ],
    priceId: "price_vip_placeholder",
  },
];
