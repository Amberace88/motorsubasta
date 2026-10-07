// POST /api/extras/webhook — Stripe avisa del pago; verificamos la firma y activamos el extra.
// En Stripe: Developers → Webhooks → endpoint https://<dominio>/api/extras/webhook, evento checkout.session.completed.
// Variables: STRIPE_WEBHOOK_SECRET (whsec_…), SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
const enc = new TextEncoder();
async function hmacHex(secret, msg) {
  const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return [...new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(msg)))].map(b => b.toString(16).padStart(2, "0")).join("");
}
function safeEq(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_WEBHOOK_SECRET || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return new Response("no configurado", { status: 503 });
  const raw = await request.text(), sig = request.headers.get("stripe-signature") || "";
  const parts = Object.fromEntries(sig.split(",").map(x => x.split("=")).filter(x => x.length === 2).map(([k, v]) => [k, v]));
  const v1s = sig.split(",").filter(x => x.startsWith("v1=")).map(x => x.slice(3));
  const t = +parts.t;
  if (!t || !v1s.length || Math.abs(Date.now() / 1000 - t) > 300) return new Response("firma", { status: 400 });
  const want = await hmacHex(env.STRIPE_WEBHOOK_SECRET, `${t}.${raw}`);
  if (!v1s.some(v => safeEq(v, want))) return new Response("firma", { status: 400 });

  const ev = JSON.parse(raw);
  if (ev.type === "checkout.session.completed" || ev.type === "checkout.session.async_payment_succeeded") {
    const s = ev.data && ev.data.object || {};
    const id = (s.metadata && s.metadata.purchase) || s.client_reference_id;
    if (id && s.payment_status === "paid") {
      const r = await fetch(env.SUPABASE_URL + "/rest/v1/rpc/extras_mark_paid", {
        method: "POST", headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY, "content-type": "application/json" },
        body: JSON.stringify({ p_id: id, p_ref: s.id, p_amount: s.amount_total }),
      });
      if (!r.ok) return new Response("supabase " + r.status, { status: 500 }); // Stripe reintentará
    }
  }
  return new Response(JSON.stringify({ received: true }), { headers: { "content-type": "application/json" } });
}
