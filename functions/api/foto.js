// /api/foto?u=<url> — proxy de imágenes para el detector de matrículas del panel.
// Solo hosts propios, solo imágenes, sin cookies. Permite leer las fotos en un <canvas>.
const ALLOW = [/^demo\.motorsubasta\.com$/, /^([a-z0-9-]+\.)?motorsubasta\.(com|es|pt)$/, /^[a-z0-9]+\.supabase\.co$/];
const MAX = 15 * 1024 * 1024;

export async function onRequestGet({ request }) {
  const q = new URL(request.url).searchParams.get("u") || "";
  let u;
  try { u = new URL(q); } catch { return new Response("bad url", { status: 400 }); }
  if (u.protocol !== "https:" || !ALLOW.some(r => r.test(u.hostname))) return new Response("host not allowed", { status: 403 });
  const r = await fetch(u.toString(), { headers: { accept: "image/*" }, cf: { cacheTtl: 86400, cacheEverything: true } });
  const type = r.headers.get("content-type") || "";
  if (!r.ok) return new Response("upstream " + r.status, { status: 502 });
  if (!type.startsWith("image/")) return new Response("not an image", { status: 415 });
  const len = +(r.headers.get("content-length") || 0);
  if (len > MAX) return new Response("too large", { status: 413 });
  return new Response(r.body, { headers: {
    "content-type": type, "cache-control": "public, max-age=86400",
    "access-control-allow-origin": "*", "x-content-type-options": "nosniff",
  } });
}
