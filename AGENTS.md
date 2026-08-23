## Base44 dev environment

Stack: TanStack Start (SSR) + Vite + React, Supabase (hosted), Groq. Package
manager is **npm** (`package-lock.json`); the `bun.lock` / `bunfig.toml` Bun
leftovers were removed during cleanup. The Base44 compose runs the dev server
under **Node**, not Bun — see the note below.

### Running
`docker compose -f docker-compose.base44.yml up -d` → Vite dev server on port
3000 (SSR). `npm install` runs on boot into a named `node_modules` volume; source
is bind-mounted so edits hot-reload.

### Why Node, not Bun
Bun's built-in `undici` shim is missing `dispatch()`/`close()`/`destroy()` on
`Pool` (https://github.com/oven-sh/bun/issues/39247), which breaks the miniflare
runtime used by `@cloudflare/vite-plugin` (`vite dev` never starts). Node ships a
working undici, so the Cloudflare/TanStack Start dev server boots cleanly under
Node. Do not switch the compose back to `oven/bun` until that Bun fix ships.

### Repo quirk fixed during setup
`package.json` had a malformed dependency entry (`"@supabase/ssr",` with no
version) — corrected to `"@supabase/ssr": "^0.12.4"`.

### Secrets (optional at boot)
- `GROQ_API_KEY` — server-side chat replies via Groq (`src/lib/ai/provider.ts`).
- `SUPABASE_SERVICE_ROLE_KEY` — server-side admin ops (`src/integrations/supabase/client.server.ts`).
The Supabase publishable keys (public) already live in the repo `.env` and are
enough to boot and render the landing/characters/pricing pages. Both secrets are
delivered via `/run/base44/app.env` (last `env_file:` entry, always wins over the
placeholders in `.env.base44-defaults`).

### workerd TLS — ca-certificates required
The SSR runs in **workerd** (Cloudflare runtime via `@cloudflare/vite-plugin`).
`node:22-slim` ships **no system CA bundle**, and workerd verifies outbound TLS
against the OS store (unlike Node, which bundles its own CAs). Without
`ca-certificates`, every server-side HTTPS call (Supabase `getClaims()`, REST
queries, Groq) fails with `unable to get local issuer certificate`, which
surfaced as "Cannot read properties of null (reading 'claims')" in the chat.
`Dockerfile.base44` installs `ca-certificates` to fix this. Do not drop it.

### Auth / profiles (works)
Signup calls `supabase.auth.signUp({ options: { data: { username } } })`. The DB
trigger `on_auth_user_created → public.handle_new_user()` (SECURITY DEFINER)
creates the `profiles` row (id = auth user id), a `user_roles` row (role `user`)
and a `credit_transactions` row (50 welcome credits) — all on `auth.users`
INSERT, regardless of email confirmation. Verified end-to-end: signup → profile
created → confirm email → login → read own profile / create conversation / send
message all pass RLS. **Email confirmation is enabled** in this Supabase
project, so a new user cannot log in until they confirm (dashboard →
Authentication → Providers → Email → "Confirm email" to disable for dev). The
profile is created either way. If "profiles not saved" is reported again, the
cause is almost always that the migrations were not applied to the connected
project — re-run `supabase/migrations/*.sql` in the SQL editor.

### Logo
The logo is the local `public/favicon.png` (64×64), referenced as `/favicon.png`
in SiteHeader, SiteFooter, auth and admin. The old external R2 asset
(`src/assets/flirtspace-logo.png.asset.json`, served from `/__l5e/...`) was
removed — it was a runtime dependency on an external CDN and 404'd outside that platform.

### Cron AI replies (portable)
`private.dispatch_ai_replies()` (scheduled via `pg_cron` every minute) reads its
target URL from `private.app_config.ai_replies_endpoint` (migration
`20260822020000_...`). Set that to the deployed app URL (e.g. the Cloudflare
Workers URL) when going to production; if empty the cron no-ops and replies are
still delivered by client-side polling while a chat is open. The old migration
hardcoded an external preview URL — do not restore it.

### Stripe (crediti a pagamento)
Pacchetti una tantum venduti via Stripe Checkout: Starter 9€/500, Premium
24€/2000 (evidenziato "Il più scelto"), VIP 59€/6000. Il client
(`PricingSection`) chiama la server function `createCheckout`
(`src/lib/stripe.functions.ts`) passando solo l'id del pacchetto; il server
mappa l'id al Price ID Stripe dalle env var `STRIPE_PRICE_STARTER/PREMIUM/VIP`
e crea la Checkout Session (mode `payment`, una tantum). L'utente non sceglie i
crediti. Il webhook `/api/public/stripe-webhook` verifica la firma
(`STRIPE_WEBHOOK_SECRET`), determina i crediti dal Price ID effettivamente
pagato e accredita atomicamente via RPC `grant_stripe_credits` (idempotente su
`public.stripe_events`). La migration `20260824000000_stripe_credits.sql` crea
la tabella + la RPC — va applicata nel SQL editor Supabase (non eseguibile via
REST con la service role key). I crediti sono scalati nella chat da `spendCredit`
(`src/lib/credits.server.ts`, UPDATE condizionato atomico, race-safe, mai sotto
zero) e rimborsati se la risposta IA fallisce. Tutte le chiavi Stripe sono
server-side solo. Pagina di ritorno: `/payment-success` (poll del saldo, non
accredita) e `/payment-cancelled`.

### Chat (risposta immediata)
The reply used to be scheduled 1-20 min in the future (`REPLY_DELAY_*_MINUTES`
in `ai.server.ts`) and only processed by `runDueReplyJobs` once `deliver_at`
passed, so the UI sat on "Sta preparando una risposta…" for minutes (the
"second message stuck" bug). Now `scheduleReply` sets `deliver_at = now`,
`sendChatMessage` calls `runDueReplyJobs` immediately and returns the generated
reply (`replyMessage`) to the client, so the response appears as soon as the
mutation resolves. The delay constants and the job/claim/cron architecture are
kept for future re-enablement. The AI provider is Groq (`openai/gpt-oss-20b`),
abstracted behind `src/lib/ai/provider.ts`. If Groq fails (auth, rate limit,
timeout, empty response) the reply is marked `failed` immediately (no hang)
and the retry banner shows; the error kind is logged.

### Verify
`curl -sf http://localhost:3000/` returns the SSR HTML (Italian, FlirtSpace
landing). The external-host check also passes: `curl -sf -H "Host:
external-preview.example.com" http://localhost:3000/`.

## workerd dev runtime & server secrets

The TanStack Start SSR runs inside **workerd** (Cloudflare runtime) via
`@cloudflare/vite-plugin`, even in dev. workerd does **not** expose the
container's OS environment through `process.env` — server-side secrets must
come from a `.dev.vars` file (gitignored), which the plugin reads and surfaces
as `process.env` (nodejs_compat). `scripts/dev-base44.sh` bridges the
platform-delivered OS env (`GROQ_API_KEY`, `SUPABASE_*`) into `.dev.vars` before
starting Vite. Production is unchanged: secrets are set as Cloudflare secrets.
Verify the SSR sees a key via `POST /api/public/ai-replies` with a fake
`x-cron-secret` — `401 Unauthorized` means the env reached the worker.

### Supabase project alignment (browser vs server)

The committed `.env` points `VITE_SUPABASE_URL` at a **template** Supabase
project, while the platform secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`SUPABASE_PUBLISHABLE_KEY`) point at the user's **real** project. The service
role key only works for the real project, so the browser MUST use it too —
otherwise `requireSupabaseAuth`'s `getClaims()` validates a session from one
project against another and returns `null` ("Cannot read properties of null
(reading 'claims')"). `scripts/dev-base44.sh` writes a gitignored `.env.local`
that overrides `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` /
`VITE_SUPABASE_PROJECT_ID` with the real values from the OS env, so client and
server share one project. Users must authenticate against the real project.
