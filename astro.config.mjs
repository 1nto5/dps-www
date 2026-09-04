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
  // The production site's own addresses → the pages that carry that content
  // here. Static meta-refresh pages, built by Astro. Every key below is a URL
  // that exists on dpsszczytno.pl today, so no link to the old site breaks.
  redirects: {
    "/gallery/": "/o-domu/",
    "/oferta/": "/zycie-w-domu/",
    "/filia-domu-pomocy-w-spychowie/": "/zycie-w-domu/spychowo/",
    "/programs/": "/zycie-w-domu/grupa-christopher/",
    "/regulamin-imprez-okolicznosciowych/": "/zycie-w-domu/regulamin-imprez-okolicznosciowych/",
    "/contact/": "/kontakt/",
    "/2016/09/27/podziekowania/": "/aktualnosci/2016-09-27-podziekowania/",

    "/projekt-pn-wykorzystanie-oze-w-domu-pomocy-spolecznej-w-szczytnie/": "/projekty-unijne/oze/",

    // The Dom keeps one page per year; here the years are one page with anchors.
    "/dotacje/dotacje-2025/": "/dotacje/#rok-2025",
    "/dotacje/dotacje-2024/": "/dotacje/#rok-2024",
    "/dotacje/dotacje-2023/": "/dotacje/#rok-2023",
    "/dotacje/dotacje-2022/": "/dotacje/#rok-2022",
    "/dotacje/2021-2/": "/dotacje/#rok-2021",
    "/dotacje/2020-2/": "/dotacje/#rok-2020",
    "/dotacje/2019-2018-2016/": "/dotacje/#rok-2019-2018-2016",

    // The Dom's slugs repeat the section name; ours do not.
    "/sygnalista/sygnalista-wewnetrzna-procedura/": "/sygnalista/wewnetrzna-procedura/",
    "/sygnalista/sygnalista-klauzula-informacyjna/": "/sygnalista/klauzula-informacyjna/",
    "/sygnalista/sygnalista-osoba-upowazniona/": "/sygnalista/osoba-upowazniona/",
    "/sygnalista/sygnalista-zalaczniki/": "/sygnalista/zalaczniki/",
  },
  integrations: [sitemap()],
});
