// /api/geo — país del visitante según Cloudflare (sin cookies, sin IP guardada).
// Sirve para proponer el mercado (España / Portugal) y para la analítica por país.
export function onRequestGet({ request }) {
  const cc = (request.cf && request.cf.country) || request.headers.get("cf-ipcountry") || "";
  return new Response(JSON.stringify({ cc: /^[A-Z]{2}$/.test(cc) ? cc : null }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "private, max-age=3600" },
  });
}
