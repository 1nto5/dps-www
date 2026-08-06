import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  // SITE/BASE env vars let CI build for the temporary github.io test URL;
  // the defaults are the production domain.
  site: process.env.SITE ?? "https://dpsszczytno.pl",
  base: process.env.BASE,
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  integrations: [sitemap()],
});
