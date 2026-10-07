// POST /api/extras/checkout — crea el pago de un extra del Mercado con Stripe Checkout.
// Variables en Cloudflare Pages (Settings → Environment variables, cifradas):
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY
// El precio y la validación salen siempre de la base de datos (extras_checkout_prepare), nunca del navegador.
const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: "PAGOS_NO_CONFIGURADOS" }, 503);
  const auth = request.headers.get("authorization") || "";
  if (!/^Bearer\s+\S+/.test(auth)) return json({ error: "SIN_SESION" }, 401);
  let body; try { body = await request.json(); } catch { return json({ error: "PETICION" }, 400); }
  const code = String(body.code || "").slice(0, 40), listing = body.listing || null, offer = body.offer != null ? Number(body.offer) : null;
  if (!/^[a-z0-9_]+$/.test(code)) return json({ error: "EXTRA_NO_DISPONIBLE" }, 400);

  /* 1 · la base de datos valida (sesión, anuncio propio, pagos activados) y crea la compra pendiente */
  const prep = await fetch(env.SUPABASE_URL + "/rest/v1/rpc/extras_checkout_prepare", {
    method: "POST", headers: { apikey: env.SUPABASE_ANON_KEY, authorization: auth, "content-type": "application/json" },
    body: JSON.stringify({ p_code: code, p_listing: listing, p_offer: offer }),
  });
  const p = await prep.json().catch(() => ({}));
  if (!prep.ok) return json({ error: (String(p.message || "").match(/[A-Z_]{6,}/) || ["NO_SE_PUDO"])[0] }, 400);
  if (p.free) return json({ ok: true, free: true });

  /* 2 · sesión de pago en Stripe */
  const origin = new URL(request.url).origin, back = p.side === "comprador" ? "/#/cuenta/mercado" : "/#/vender/anuncios";
  const f = new URLSearchParams({
    mode: "payment", locale: "auto", client_reference_id: p.id, "metadata[purchase]": p.id, "metadata[code]": code,
    "payment_intent_data[metadata][purchase]": p.id,
    "line_items[0][quantity]": "1", "line_items[0][price_data][currency]": "eur", "line_items[0][price_data][unit_amount]": String(p.amount_cents),
    "line_items[0][price_data][product_data][name]": p.name, "line_items[0][price_data][product_data][description]": p.description || p.name,
    success_url: `${origin}${back}?extra=ok`, cancel_url: `${origin}${back}?extra=cancelado`,
  });
  if (p.email) f.set("customer_email", p.email);
  const s = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST", headers: { authorization: "Bearer " + env.STRIPE_SECRET_KEY, "content-type": "application/x-www-form-urlencoded", "idempotency-key": p.id },
    body: f,
  });
  const ses = await s.json().catch(() => ({}));
  if (!s.ok || !ses.url) return json({ error: "STRIPE", detail: ses.error && ses.error.message }, 502);

  /* 3 · guardamos la referencia de Stripe en la compra */
  await fetch(env.SUPABASE_URL + "/rest/v1/extras_purchases?id=eq." + encodeURIComponent(p.id), {
    method: "PATCH", headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY, "content-type": "application/json", prefer: "return=minimal" },
    body: JSON.stringify({ provider_ref: ses.id }),
  }).catch(() => {});
  return json({ url: ses.url });
}
