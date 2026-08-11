import { createFileRoute } from "@tanstack/react-router";

/**
 * Endpoint interno chiamato ogni minuto dallo scheduler del database.
 * Consegna le risposte IA pianificate e scadute. Il chiamante viene
 * verificato con una chiave interna conservata nel database.
 */
export const Route = createFileRoute("/api/public/ai-replies")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const provided = request.headers.get("x-cron-secret") ?? "";
        if (!provided) return new Response("Unauthorized", { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: valid, error } = await supabaseAdmin.rpc("verify_cron_secret", {
          _secret: provided,
        });
        if (error) return new Response("Errore di verifica", { status: 500 });
        if (!valid) return new Response("Unauthorized", { status: 401 });

        const { runDueReplyJobs } = await import("@/lib/jobs.server");
        const result = await runDueReplyJobs();
        return Response.json(result);
      },
    },
  },
});
