<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Base44 dev environment

Stack: TanStack Start (SSR) + Vite + React, Supabase (hosted), OpenAI. Package
manager in the repo is Bun (`bun.lock`, `bunfig.toml`), but the Base44 compose
runs the dev server under **Node**, not Bun — see the note below.

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
- `OPENAI_API_KEY` — server-side chat replies (`src/lib/ai.server.ts`).
- `SUPABASE_SERVICE_ROLE_KEY` — server-side admin ops (`src/integrations/supabase/client.server.ts`).
The Supabase publishable keys (public) already live in the repo `.env` and are
enough to boot and render the landing/characters/pricing pages. Both secrets are
delivered via `/run/base44/app.env` (last `env_file:` entry, always wins over the
placeholders in `.env.base44-defaults`).

### Verify
`curl -sf http://localhost:3000/` returns the SSR HTML (Italian, FlirtSpace
landing). The external-host check also passes: `curl -sf -H "Host:
external-preview.example.com" http://localhost:3000/`.
