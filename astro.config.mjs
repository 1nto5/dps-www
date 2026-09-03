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
  // Old addresses → the new ones. Static meta-refresh pages, built by Astro.
  redirects: {
    "/o-nas/": "/o-domu/",
    "/oferta/": "/zycie-w-domu/",
    "/oferta/regulamin-imprez-okolicznosciowych/": "/zycie-w-domu/regulamin-imprez-okolicznosciowych/",
    "/przyjecie-do-domu/": "/zamieszkac-u-nas/",
    "/filia-w-spychowie/": "/zycie-w-domu/spychowo/",
    "/grupa-muzyczna/": "/zycie-w-domu/grupa-christopher/",
    "/galeria/": "/zycie-w-domu/zdjecia/",
    "/dokumenty/dotacje/2025/": "/dokumenty/dotacje/#rok-2025",
    "/dokumenty/dotacje/2024/": "/dokumenty/dotacje/#rok-2024",
    "/dokumenty/dotacje/2023/": "/dokumenty/dotacje/#rok-2023",
    "/dokumenty/dotacje/2022/": "/dokumenty/dotacje/#rok-2022",
    "/dokumenty/dotacje/2021/": "/dokumenty/dotacje/#rok-2021",
    "/dokumenty/dotacje/2020/": "/dokumenty/dotacje/#rok-2020",
    "/dokumenty/dotacje/2019-2018-2016/": "/dokumenty/dotacje/#rok-2019-2018-2016",
  },
  integrations: [sitemap()],
});
