import Stripe from "stripe";

/**
 * Integrazione Stripe lato server (Cloudflare Workers/workerd compatibile).
 *
 * - Il client Stripe usa il fetch HttpClient (globale in workerd), non http node.
 * - Le chiavi Stripe (secret key, webhook secret, price ID) vivono solo nelle
 *   environment variables server-side: mai esposte al browser.
 * - Il server determina i crediti dal Price ID Stripe ricevuto nel webhook,
 *   non da dati inviati dal client.
 */

export type PackageId = "starter" | "premium" | "vip";

interface PackageConfig {
  priceId: string;
  credits: number;
  name: string;
}

/** Mappa un plan id al Price ID Stripe (da env) + crediti. Solo lato server. */
export function getPackage(id: string): PackageConfig | null {
  const map: Record<PackageId, PackageConfig> = {
    starter: {
      priceId: process.env.STRIPE_PRICE_STARTER ?? "",
      credits: 500,
      name: "Starter",
    },
    premium: {
      priceId: process.env.STRIPE_PRICE_PREMIUM ?? "",
      credits: 2000,
      name: "Premium",
    },
    vip: {
      priceId: process.env.STRIPE_PRICE_VIP ?? "",
      credits: 6000,
      name: "VIP",
    },
  };
  const p = map[id as PackageId];
  return p && p.priceId ? p : null;
}

/**
 * Mappa un Price ID Stripe → crediti. Usato nel webhook: il prezzo è quello
 * effettivamente pagato e validato da Stripe, non un valore dal client.
 */
export function creditsForPrice(priceId: string): number | null {
  const byPrice: Record<string, number> = {
    [process.env.STRIPE_PRICE_STARTER ?? "__none_starter"]: 500,
    [process.env.STRIPE_PRICE_PREMIUM ?? "__none_premium"]: 2000,
    [process.env.STRIPE_PRICE_VIP ?? "__none_vip"]: 6000,
  };
  const c = byPrice[priceId];
  return typeof c === "number" ? c : null;
}

let client: Stripe | null = null;
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY non configurata");
  if (!client) {
    client = new Stripe(key, {
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return client;
}

/** Crea una Checkout Session una tantum per un pacchetto. */
export async function createCheckoutSession(opts: {
  packageId: PackageId;
  userId: string;
  origin: string;
}): Promise<{ url: string }> {
  const pkg = getPackage(opts.packageId);
  if (!pkg) throw new Error("Pacchetto non valido");

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: pkg.priceId, quantity: 1 }],
    success_url: `${opts.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${opts.origin}/payment-cancelled`,
    client_reference_id: opts.userId,
    metadata: { user_id: opts.userId, package: opts.packageId },
  });
  if (!session.url) throw new Error("Stripe non ha restituito un URL di checkout");
  return { url: session.url };
}
