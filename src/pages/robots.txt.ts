import type { APIRoute } from "astro";

/**
 * robots.txt, generated instead of static: a preview build (the temporary
 * github.io URL, `SITE` env var set) must not be indexed, only the real
 * domain may. `Astro.site` already carries that distinction.
 */
export const GET: APIRoute = ({ site }) => {
  const isProduction = site?.origin === "https://dpsszczytno.pl";
  // BASE_URL already has the leading and trailing slash normalised (e.g.
  // "/" on the real domain, "/dps-www/" for the temporary preview build).
  const base = import.meta.env.BASE_URL;
  const body = [
    "User-agent: *",
    isProduction ? "Allow: /" : "Disallow: /",
    "",
    `Sitemap: ${new URL(`${base}sitemap-index.xml`, site)}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
