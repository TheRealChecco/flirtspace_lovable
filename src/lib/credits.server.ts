/**
 * Operazioni atomiche sui crediti lato server (workerd/Cloudflare compatibili).
 *
 * Il saldo vive in `profiles.credits` (con CHECK (credits >= 0)); il ledger in
 * `credit_transactions`. Questi helper usano il client privilegiato
 * (service_role) perché le policy RLS non permettono all'utente di modificare
 * il proprio saldo: il credito può essere scalato solo dal server.
 *
 * Lo spend è atomico tramite UPDATE condizionato (optimistic lock su
 * `credits = <valore_letto>`): due invii concorrenti con un solo credito ne
 * fanno passare uno solo, senza mai scendere sotto zero.
 */

export class InsufficientCreditsError extends Error {
  constructor() {
    super(
      "Crediti insufficienti. Acquista un pacchetto per continuare a chattare.",
    );
    this.name = "InsufficientCreditsError";
  }
}

/** Scala esattamente 1 credito. Solleva InsufficientCreditsError se il saldo è 0. */
export async function spendCredit(userId: string): Promise<number> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  for (let attempt = 0; attempt < 2; attempt++) {
    const { data: profile, error: rErr } = await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .maybeSingle();
    if (rErr) throw new Error(rErr.message);
    if (!profile) throw new Error("Profilo non trovato");
    if (profile.credits <= 0) throw new InsufficientCreditsError();

    // UPDATE atomico: decrementa solo se il saldo è ancora quello letto.
    // Il row lock di Postgres serializza due richieste concorrenti.
    const newCredits = profile.credits - 1;
    const { data: updated, error: uErr } = await supabaseAdmin
      .from("profiles")
      .update({ credits: newCredits })
      .eq("id", userId)
      .eq("credits", profile.credits)
      .select("credits")
      .maybeSingle();
    if (uErr) throw new Error(uErr.message);
    if (updated) {
      await supabaseAdmin.from("credit_transactions").insert({
        user_id: userId,
        amount: -1,
        type: "spend",
        description: "Messaggio inviato",
      });
      return updated.credits;
    }
    // Nessuna riga aggiornata: il saldo è cambiato nel frattempo. Riprova.
  }
  throw new InsufficientCreditsError();
}

/**
 * Rimborsa 1 credito quando il messaggio non viene salvato o la risposta IA
 * fallisce, così l'utente non perde mai il credito per un errore non suo.
 */
export async function refundCredit(userId: string, reason: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return;
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ credits: profile.credits + 1 })
    .eq("id", userId)
    .eq("credits", profile.credits);
  if (error) {
    console.error("[credits] rimborso fallito", error.message);
    return;
  }
  await supabaseAdmin.from("credit_transactions").insert({
    user_id: userId,
    amount: 1,
    type: "refund",
    description: reason,
  });
}
