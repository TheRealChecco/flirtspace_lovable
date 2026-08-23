import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook Stripe: accredita i crediti in modo atomico e idempotento.
 *
 * - Verifica la firma con STRIPE_WEBHOOK_SECRET (non si fida del browser).
 * - Determina i crediti dal Price ID Stripe (validato da Stripe), non dal client.
 * - Usa la RPC grant_stripe_credits (SECURITY DEFINER, service_role) che in una
 *   sola transazione marca l'evento, accredita il saldo e registra il ledger.
 *   Un evento ricevuto due volte accredita i crediti una sola volta.
 */
export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sig = request.headers.get("stripe-signature") ?? "";
        const body = await request.text();
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

        const { getStripe, creditsForPrice } = await import("@/lib/stripe.server");
        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        let event;
        try {
          event = await getStripe().webhooks.constructEventAsync(
            body,
            sig,
            webhookSecret,
          );
        } catch (err) {
          console.error("[stripe-webhook] firma non valida", err);
          return new Response("Invalid signature", { status: 400 });
        }

        if (event.type === "checkout.session.completed") {
          try {
            const session = event.data.object;
            // Recupera i line items per determinare il prezzo pagato (server-side).
            const full = await getStripe().checkout.sessions.retrieve(session.id, {
              expand: ["line_items"],
            });
            const priceId = full.line_items?.data?.[0]?.price?.id ?? null;
            const userId =
              full.metadata?.user_id ?? full.client_reference_id ?? null;

            if (!userId || !priceId) {
              console.error("[stripe-webhook] user_id o prezzo mancanti", {
                userId,
                priceId,
              });
              // 200 per non ricevere retry infiniti su eventi irrecuperabili.
              return new Response("ok", { status: 200 });
            }

            const credits = creditsForPrice(priceId);
            if (credits == null) {
              console.error("[stripe-webhook] prezzo non riconosciuto", priceId);
              return new Response("ok", { status: 200 });
            }

            const { data: granted, error } = await supabaseAdmin.rpc(
              "grant_stripe_credits",
              {
                p_user_id: userId,
                p_amount: credits,
                p_event_id: event.id,
                p_description: `Acquisto ${full.metadata?.package ?? "pacchetto"} — ${credits} crediti`,
              },
            );
            if (error) {
              console.error("[stripe-webhook] errore DB", error.message);
              return new Response("DB error", { status: 500 }); // Stripe riprova
            }
            console.log(
              "[stripe-webhook] accreditati",
              credits,
              "crediti a",
              userId,
              "(granted=",
              granted,
              ")",
            );
          } catch (err) {
            console.error("[stripe-webhook] errore handler", err);
            return new Response("Error", { status: 500 });
          }
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
