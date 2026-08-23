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
} > /app/.dev.vars

exec node node_modules/.bin/vite dev --host 0.0.0.0 --port 3000
