import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site: "https://dpsszczytno.pl",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  integrations: [sitemap()],
});
