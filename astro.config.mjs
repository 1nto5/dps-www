import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import rehypeTableScroll from "./src/lib/rehype-table-scroll.mjs";

// Astro does not prepend `base` to a redirect target, so the CI build for the
// temporary github.io URL would send every old address to a path that does not
// exist there. On the production domain `base` is empty and this is a no-op.
const base = (process.env.BASE ?? "").replace(/\/$/, "");
const at = (target) => `${base}${target}`;

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
  // The production site's own addresses → the pages that carry that content
  // here. Static meta-refresh pages, built by Astro. Every key below is a URL
  // that exists on dpsszczytno.pl today, so no link to the old site breaks.
  redirects: {
    "/gallery/": at("/o-domu/"),
    "/oferta/": at("/zycie-w-domu/"),
    "/filia-domu-pomocy-w-spychowie/": at("/zycie-w-domu/spychowo/"),
    "/programs/": at("/zycie-w-domu/grupa-christopher/"),
    "/regulamin-imprez-okolicznosciowych/": at("/zycie-w-domu/regulamin-imprez-okolicznosciowych/"),
    "/contact/": at("/kontakt/"),
    "/2016/09/27/podziekowania/": at("/aktualnosci/2016-09-27-podziekowania/"),

    "/projekt-pn-wykorzystanie-oze-w-domu-pomocy-spolecznej-w-szczytnie/": at("/projekty-unijne/oze/"),

    // The Dom keeps one page per year; here the years are one page with anchors.
    "/dotacje/dotacje-2025/": at("/dotacje/#rok-2025"),
    "/dotacje/dotacje-2024/": at("/dotacje/#rok-2024"),
    "/dotacje/dotacje-2023/": at("/dotacje/#rok-2023"),
    "/dotacje/dotacje-2022/": at("/dotacje/#rok-2022"),
    "/dotacje/2021-2/": at("/dotacje/#rok-2021"),
    "/dotacje/2020-2/": at("/dotacje/#rok-2020"),
    "/dotacje/2019-2018-2016/": at("/dotacje/#rok-2019-2018-2016"),

    // The Dom's slugs repeat the section name; ours do not.
    "/sygnalista/sygnalista-wewnetrzna-procedura/": at("/sygnalista/wewnetrzna-procedura/"),
    "/sygnalista/sygnalista-klauzula-informacyjna/": at("/sygnalista/klauzula-informacyjna/"),
    "/sygnalista/sygnalista-osoba-upowazniona/": at("/sygnalista/osoba-upowazniona/"),
    "/sygnalista/sygnalista-zalaczniki/": at("/sygnalista/zalaczniki/"),
  },
  integrations: [sitemap()],
});
