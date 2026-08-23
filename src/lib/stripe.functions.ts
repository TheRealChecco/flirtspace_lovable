import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  createCheckoutSession,
  getStripe,
  type PackageId,
} from "@/lib/stripe.server";

/**
 * Ricava l'origine pubblica dell'app dalla richiesta (l'header Origin inviato
 * dal browser). Serve a costruire gli URL di successo/annullamento di Stripe
 * che puntino al dominio giusto, anche quando cambia l'host di preview.
 */
function originFromRequest(): string {
  const req = getRequest();
  const origin =
    req.headers.get("origin") || req.headers.get("x-forwarded-origin");
  if (origin) return origin;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (host) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`;
  }
  try {
    return new URL(req.url).origin;
  } catch {
    return process.env.PUBLIC_URL || "https://flirtspace.app";
  }
}

/**
 * Crea una Checkout Session Stripe lato server e restituisce l'URL a cui
 * reindirizzare il browser. Il client sceglie solo il pacchetto; il Price ID
 * è determinato dal server dalle env var, quindi l'utente non può pagare 9€
 * per ottenere 6.000 crediti.
 */
export const createCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ packageId: z.enum(["starter", "premium", "vip"]) }))
  .handler(async ({ data, context }) => {
    const { url } = await createCheckoutSession({
      packageId: data.packageId as PackageId,
      userId: context.userId,
      origin: originFromRequest(),
    });
    return { url };
  });

/**
 * Stato di una sessione di checkout (per la pagina di ritorno). Verifica che
 * la sessione appartenga all'utente autenticato. Non accredita crediti: ci
 * pensa il webhook.
 */
export const getPaymentStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ sessionId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    if (session.client_reference_id !== context.userId) {
      throw new Error("Sessione non trovata");
    }
    return {
      paymentStatus: session.payment_status as "paid" | "unpaid" | "no_payment_required",
      package: (session.metadata?.package as PackageId | undefined) ?? null,
    };
  });
