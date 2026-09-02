import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import rehypeTableScroll from "./src/lib/rehype-table-scroll.mjs";

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
  markdown: {
    // Markdown tables render straight into `.doc`, where a wide table would push
    // the page sideways. The plugin gives each one a scrollable, focusable
    // wrapper; the styling lives on `.doc .table-scroll` in global.css.
    rehypePlugins: [rehypeTableScroll],
  },
  integrations: [sitemap()],
});
