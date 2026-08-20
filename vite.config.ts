import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: {
        name: "ssr",
      },
    }),
    tanstackStart({
      server: {
        entry: "server",
      },
    }),
    react(),
    tsConfigPaths(),
  ],
});
