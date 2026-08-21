import { createMiddleware } from "@tanstack/react-start";
import {
  getCookies,
  setCookie,
  setResponseHeader,
} from "@tanstack/react-start/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./types";

export const requireSupabaseAuth = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const SUPABASE_URL =
    process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];

  const SUPABASE_PUBLISHABLE_KEY =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ["SUPABASE_URL"] : []),
      ...(!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []),
    ];

    throw new Error(
      `Missing Supabase environment variable(s): ${missing.join(", ")}`,
    );
  }

  const supabase = createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return Object.entries(getCookies()).map(([name, value]) => ({
            name,
            value,
          }));
        },

        setAll(cookies, headers) {
          cookies.forEach(({ name, value, options }) => {
            setCookie(name, value, options);
          });

          Object.entries(headers).forEach(([name, value]) => {
            setResponseHeader(name, value);
          });
        },
      },
    },
  );

  const {
    data: { claims },
  } = await supabase.auth.getClaims();

  if (!claims?.sub) {
    throw new Error("Unauthorized: Authentication required");
  }

  return next({
    context: {
      supabase,
      userId: claims.sub,
      claims,
    },
  });
});
