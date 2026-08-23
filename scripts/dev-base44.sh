#!/bin/sh
# Base44 dev-only entrypoint.
#
# The TanStack Start SSR runs inside workerd (Cloudflare runtime) via
# @cloudflare/vite-plugin. workerd does NOT expose the container's OS
# environment through `process.env` — server secrets must come from a
# `.dev.vars` file (the standard Cloudflare dev-secrets mechanism, which the
# plugin reads and surfaces as `process.env` with nodejs_compat).
#
# This script bridges the platform-delivered OS env (env_file) into the
# gitignored `.dev.vars` so the SSR sees GROQ_API_KEY and the Supabase keys.
# Production stays unchanged: secrets are set directly as Cloudflare secrets.
set -e

npm install --no-audit --no-fund

{
  echo "GROQ_API_KEY=$GROQ_API_KEY"
  echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY"
  echo "SUPABASE_URL=$SUPABASE_URL"
  echo "SUPABASE_PUBLISHABLE_KEY=$SUPABASE_PUBLISHABLE_KEY"
  echo "STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY"
  echo "STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET"
  echo "STRIPE_PRICE_STARTER=$STRIPE_PRICE_STARTER"
  echo "STRIPE_PRICE_PREMIUM=$STRIPE_PRICE_PREMIUM"
  echo "STRIPE_PRICE_VIP=$STRIPE_PRICE_VIP"
} > /app/.dev.vars

# .env.local (gitignored) — aligns the BROWSER bundle (VITE_ vars) with the
# real Supabase project delivered as platform secrets. The committed .env
# points at a different (template) project; without this override the client
# and the server-side admin would use different projects and auth would fail.
PROJ=$(echo "$SUPABASE_URL" | sed 's|https://||; s|\.supabase\.co.*||')
{
  echo "VITE_SUPABASE_URL=$SUPABASE_URL"
  echo "VITE_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_PUBLISHABLE_KEY"
  echo "VITE_SUPABASE_PROJECT_ID=$PROJ"
} > /app/.env.local

exec node node_modules/.bin/vite dev --host 0.0.0.0 --port 3000
