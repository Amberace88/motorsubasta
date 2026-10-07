
/* =====================================================================
   p31 — Extras opcionales del Mercado (el Mercado es gratis, siempre)
   · vendedor: Destacado, Subir, Urgente, Pack · comprador: Oferta destacada, Informe
   · los pagos (Stripe) quedan preparados y apagados: con pagos apagados,
     el usuario ve "Muy pronto" y puede pedir aviso (medimos la demanda)
   · consola: "Extras y pagos" con ingresos, precios, compras y regalos
   ===================================================================== */
var EXTRAS_DEMO = [
  { code: "destacar_7", side: "vendedor", name: "Destacado 7 días", description: "Tu anuncio aparece arriba del Mercado con el sello «Destacado» durante 7 días.", price_cents: 299, effect: { featured: 7 } },
  { code: "destacar_30", side: "vendedor", name: "Destacado 30 días", description: "Arriba del Mercado con el sello «Destacado» durante 30 días.", price_cents: 699, effect: { featured: 30 } },
  { code: "subir", side: "vendedor", name: "Subir anuncio", description: "Vuelve a ponerlo el primero de los recientes, como recién publicado.", price_cents: 99, effect: { bump: true } },
  { code: "urgente", side: "vendedor", name: "Sello «Urgente»", description: "Etiqueta «Urgente» durante 14 días: atrae a quien busca una buena oportunidad.", price_cents: 149, effect: { urgent: 14 } },
  { code: "pack_30", side: "vendedor", name: "Pack visibilidad", description: "Destacado y «Urgente» 30 días, y lo subimos ahora. El ahorro frente a comprarlos por separado.", price_cents: 899, effect: { featured: 30, urgent: 30, bump: true } },
  { code: "oferta_top", side: "comprador", name: "Oferta destacada", description: "Tu oferta llega la primera a la bandeja del vendedor, marcada como prioritaria.", price_cents: 99, effect: { priority: true } },
  { code: "informe", side: "comprador", name: "Informe del vehículo", description: "Informe completo de la DGT por bastidor: titulares, cargas, ITV y kilometraje registrado. Te lo enviamos por email en 24 h.", price_cents: 1199, effect: { report: true } },
];
var EXTRAS = { list: null, loading: null };
function extrasPayOn() { const p = (window.APP_SETTINGS || {}).payments; return !!(p && p.enabled); }
function extrasLoad() {
  if (EXTRAS.list) return Promise.resolve(EXTRAS.list);
  if (EXTRAS.loading) return EXTRAS.loading;
  return EXTRAS.loading = (async () => {
    let list = null;
    if (live()) { try { const { data } = await sb.from("extras_products").select("code, side, name, description, price_cents, effect, sort").eq("active", true).order("sort"); if (data && data.length) list = data; } catch (e) {} }
    return EXTRAS.list = list || EXTRAS_DEMO;
  })();
}
function extrasEur(c) { return (c / 100).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"; }
function extrasIcon(x) { const e = x.effect || {}; return e.report ? "doc" : e.priority ? "bolt" : e.featured && e.urgent ? "spark" : e.featured ? "spark" : e.urgent ? "flame" : e.bump ? "refresh" : "plus"; }
function extrasWhen(d) { return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short" }); }

/* compra: con pagos activos va a Stripe; si no, se apunta el interés */
async function extrasBuy(code, target, btn) {
  trackEv("tool", { props: { a: "extra", p: code, pay: extrasPayOn() ? 1 : 0 } });
  if (!extrasPayOn()) {
    const k = "extrawish"; const w = store.get(k, []); if (!w.includes(code)) { w.push(code); store.set(k, w); }
    toast("Apuntado. Te avisaremos en cuanto esté disponible", "bell"); return "wish";
  }
  if (!live() || !S.user) { toast("Inicia sesión para continuar", "user"); return; }
  if (btn) { btn.disabled = true; btn.dataset.t = btn.innerHTML; btn.innerHTML = ic("lock", "sm") + "Abriendo el pago seguro…"; }
  try {
    const { data } = await sb.auth.getSession(); const tok = data && data.session && data.session.access_token;
    const r = await fetch("/api/extras/checkout", { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + tok }, body: JSON.stringify(Object.assign({ code }, target)) });
    const j = await r.json().catch(() => ({}));
    if (j.url) { location.href = j.url; return "redirect"; }
    if (j.free) { toast("Extra activado", "spark"); try { await sbLoadMarket(); } catch (e) {} router(); return "free"; }
    const M = { PAGOS_NO_CONFIGURADOS: "Los pagos aún no están configurados", PAGOS_DESACTIVADOS: "Los pagos aún no están activos", ANUNCIO_NO_VALIDO: "Este anuncio no está activo", OFERTA_NO_VALIDA: "Solo puedes destacar una oferta pendiente", SIN_SESION: "Inicia sesión de nuevo" };
    toast(M[j.error] || "No se ha podido iniciar el pago", "alert");
  } catch (e) { toast("No se ha podido iniciar el pago", "alert"); }
  if (btn) { btn.disabled = false; btn.innerHTML = btn.dataset.t; }
}

/* ventana de extras (vendedor o comprador) */
function extrasModal(side, title, sub, target, preview) {
  extrasLoad().then(all => {
    const list = all.filter(x => x.side === side && (side === "vendedor" || (target.offer ? (x.effect || {}).priority : (x.effect || {}).report)));
    if (!list.length) return toast("No hay extras disponibles ahora mismo", "alert");
    let cur = list.find(x => x.code === "pack_30") ? "destacar_7" : list[0].code; if (!list.some(x => x.code === cur)) cur = list[0].code;
    const on = extrasPayOn();
    modal(title, `<p class="muted" style="margin:0">${sub}</p>
      <div class="xg" role="radiogroup" aria-label="Extras">${list.map(x => `<label class="xo ${x.code === "pack_30" ? "best" : ""}"><input type="radio" name="xo" value="${x.code}" ${x.code === cur ? "checked" : ""}>
        <span class="xo-i">${ic(extrasIcon(x), "sm")}</span><span class="xo-t"><b>${esc(x.name)}</b><small>${esc(x.description)}</small></span><span class="xo-p tnum">${extrasEur(x.price_cents)}</span>${x.code === "pack_30" ? `<em class="xo-tag">Más completo</em>` : ""}</label>`).join("")}</div>
      ${preview || ""}
      <div class="xfree">${ic("check", "sm")}<span><b>El Mercado es gratis, siempre.</b> Publicar, contactar y vender no cuesta nada. Los extras son opcionales.</span></div>
      <div class="xfoot">${on ? `<small class="faint">${ic("lock", "sm")}Pago seguro con Stripe · tarjeta, Apple Pay o Google Pay</small>` : `<span class="chip acc">${ic("clock", "sm")}Muy pronto</span>`}
        <div style="display:flex;gap:8px"><button class="btn" id="xNo">Ahora no</button><button class="btn primary" id="xGo"></button></div></div>`, close => {
      const box = $(".modal"); if (box) box.classList.add("modal-x");
      const sel = () => list.find(x => x.code === ($("input[name=xo]:checked") || {}).value) || list[0];
      const upd = () => { const x = sel(); $("#xGo").innerHTML = on ? `${ic("lock", "sm")}Pagar ${extrasEur(x.price_cents)}` : `${ic("bell", "sm")}Avísame cuando esté`; const pv = $("#xPrev"); if (pv) { const e = x.effect || {}; pv.classList.toggle("feat", !!e.featured); pv.classList.toggle("urg", !!e.urgent); pv.classList.toggle("bump", !!e.bump); } };
      $$("input[name=xo]").forEach(i => i.onchange = upd); upd();
      $("#xNo").onclick = close;
      $("#xGo").onclick = async () => { const r = await extrasBuy(sel().code, target, $("#xGo")); if (r === "wish" || r === "free") close(); };
    });
  });
}
function boostPreview(v) {
  return `<div class="xprev" id="xPrev" aria-hidden="true"><div class="xprev-c"><div class="xprev-ph"><img src="${pimg(v.img)}" alt=""><span class="mc-badge feat">${ic("spark", "sm")}Destacado</span></div>
    <div class="xprev-b"><b>${esc(v.title)}</b><span class="tnum">${eur(v.price)}</span><i class="chip bad xprev-u">${ic("flame", "sm")}Urgente</i></div></div>
    <div class="xprev-l"><span>${ic("check", "sm")}Arriba del Mercado</span><span>${ic("check", "sm")}Sello visible</span><span>${ic("check", "sm")}Primero en recientes</span></div></div>`;
}

/* ---------- Mercado: efectos visibles ---------- */
(function patchExtrasMarket() {
  const map = mapMarket;
  mapMarket = function (l) {
    const m = map(l), t = Date.now();
    m.feat = !!(l.featured_until && +new Date(l.featured_until) > t);
    m.urg = !!(l.urgent_until && +new Date(l.urgent_until) > t);
    m.bumpAt = l.bumped_at ? +new Date(l.bumped_at) : 0;
    return m;
  };
  const filt = mkFiltered;
  mkFiltered = function () {
    const list = filt.apply(this, arguments), s = mkS();
    if (s.sort !== "new") return list;
    const day = new Date().toISOString().slice(0, 10), h = id => { let x = 0; const k = day + id; for (let i = 0; i < k.length; i++) x = (x * 31 + k.charCodeAt(i)) | 0; return x; };
    const fresh = m => Math.max(m.created || 0, m.bumpAt || 0);
    const feat = list.filter(m => m.feat).sort((a, b) => h(a.id) - h(b.id));   /* rotación diaria justa entre destacados */
    return feat.concat(list.filter(m => !m.feat).sort((a, b) => fresh(b) - fresh(a)));
  };
  const card = mkCard;
  mkCard = function (m) {
    let h = card.apply(this, arguments);
    if (m.feat) h = h.replace('<article class="mc"', '<article class="mc mc-feat"').replace(/<\/a>(\s*<button class="mc-fav)/, `<span class="mc-badge feat">${ic("spark", "sm")}Destacado</span></a>$1`);
    if (m.urg) h = h.replace('<div class="mc-tags">', `<div class="mc-tags"><span class="chip bad">${ic("flame", "sm")}Urgente</span>`);
    return h;
  };
  const row = mkRow;
  mkRow = function (m) {
    let h = row.apply(this, arguments);
    if (m.feat) h = h.replace('<div class="mr" role="row">', '<div class="mr mr-feat" role="row">').replace("<b>" + esc(m.title) + "</b>", `<b>${esc(m.title)}</b> <span class="chip acc mr-b">${ic("spark", "sm")}Destacado</span>`);
    if (m.urg) h = h.replace("<b>" + esc(m.title) + "</b>", `<b>${esc(m.title)}</b> <span class="chip bad mr-b">${ic("flame", "sm")}Urgente</span>`);
    return h;
  };
})();

/* ficha: sellos y el informe del vehículo */
patchRoute(/^\/mercado\/([\w-]+)$/, (q, mm) => {
  const m = mkById(mm[1]); if (!m) return;
  const tags = $(".mkd-title .mc-tags");
  if (tags && !tags.querySelector(".xb-t")) {
    if (m.urg) tags.insertAdjacentHTML("afterbegin", `<span class="chip bad xb-t">${ic("flame", "sm")}Urgente</span>`);
    if (m.feat) tags.insertAdjacentHTML("afterbegin", `<span class="chip acc xb-t">${ic("spark", "sm")}Destacado</span>`);
  }
  const links = $(".mkd-links");
  if (links && !$("#xRep") && ccOf(m) === "ES") {
    links.insertAdjacentHTML("afterbegin", `<a href="#" id="xRep">${ic("doc", "sm")}<span><b>Informe del vehículo</b><small>Titulares, cargas, ITV y kilometraje</small></span>${ic("right", "sm")}</a>`);
    $("#xRep").onclick = e => { e.preventDefault(); extrasModal("comprador", "Informe del vehículo", `${esc(m.title)} · antes de comprar, comprueba su historial oficial.`, { listing: m.id }); };
  }
});

/* ---------- vendedor: Impulsar en "Mis anuncios" ---------- */
(function patchSellerBoost() {
  const v0 = viewMyListings;
  viewMyListings = function () {
    let h = v0.apply(this, arguments);
    return h.replace(/<button class="btn xs" data-mprice="([^"]+)">/g, (all, id) => {
      const v = (S.myVehicles || []).find(x => String(x.id) === String(id));
      return (v && (v.lst || "activo") === "activo" ? `<button class="btn xs xboost" data-boost="${id}">${ic("spark", "sm")}Impulsar</button>` : "") + all;
    });
  };
  const m0 = mountMyListings;
  mountMyListings = function () {
    m0.apply(this, arguments);
    const find = id => (S.myVehicles || []).find(x => String(x.id) === String(id));
    $$("[data-boost]").forEach(b => b.onclick = () => { const v = find(b.dataset.boost); if (!v) return;
      extrasModal("vendedor", "Impulsa tu anuncio", `${esc(v.title)} · más visitas, más rápido.`, { listing: v.listingId || v.id }, boostPreview(v)); });
    /* estado de los extras activos de cada anuncio */
    const mine = (S.myVehicles || []).filter(v => v.listingId);
    if (live() && mine.length) sb.from("listings").select("id, featured_until, urgent_until, bumped_at").in("id", mine.map(v => v.listingId)).then(({ data }) => {
      (data || []).forEach(l => {
        const v = mine.find(x => x.listingId === l.id), row = v && $(`.myrow[data-my="${v.id}"] .my-t`); if (!row || row.querySelector(".xst")) return;
        const t = Date.now(), out = [];
        if (l.featured_until && +new Date(l.featured_until) > t) out.push(`<span class="chip acc">${ic("spark", "sm")}Destacado hasta ${extrasWhen(l.featured_until)}</span>`);
        if (l.urgent_until && +new Date(l.urgent_until) > t) out.push(`<span class="chip bad">${ic("flame", "sm")}Urgente hasta ${extrasWhen(l.urgent_until)}</span>`);
        if (out.length) row.insertAdjacentHTML("beforeend", `<div class="xst">${out.join("")}</div>`);
      });
    });
  };
})();

/* ---------- comprador: Oferta destacada ---------- */
patchRoute(/^\/cuenta\/mercado$/, () => {
  const of = myOffers(), rows = $$(".mylist .myrow");
  rows.forEach((r, i) => {
    const o = of[i]; if (!o || r.querySelector("[data-otop]") || !["nueva", "new"].includes(o.status) || !o.id) return;
    const a = r.querySelector(".my-a"); if (!a) return;
    a.insertAdjacentHTML("afterbegin", `<button class="btn xs xboost" data-otop="${o.id}">${ic("bolt", "sm")}Destacar oferta</button>`);
  });
  $$("[data-otop]").forEach(b => b.onclick = () => { const o = of.find(x => String(x.id) === b.dataset.otop);
    extrasModal("comprador", "Destaca tu oferta", `${esc(o ? o.title : "")} · que el vendedor vea la tuya la primera.`, { offer: +b.dataset.otop }); });
});

/* vuelta del pago */
(function extrasReturn() {
  const chk = () => { const m = location.hash.match(/[?&]extra=(ok|cancelado)/); if (!m) return;
    if (m[1] === "ok") { toast("Pago recibido. Tu extra se activa en unos segundos", "spark"); setTimeout(() => { try { sbLoadMarket(); } catch (e) {} router(); }, 3500); }
    else toast("Pago cancelado. No se ha cobrado nada", "x");
    history.replaceState(null, "", location.hash.replace(/[?&]extra=(ok|cancelado)/, "")); };
  addEventListener("hashchange", chk); setTimeout(chk, 600);
})();

/* ---------- precios: extras opcionales ---------- */
patchRoute(/^\/precios$/, () => {
  if ($(".xpr")) return;
  const host = $("#app .wrap") || $("#app"); if (!host) return;
  extrasLoad().then(all => {
    if ($(".xpr")) return;
    const on = extrasPayOn(), grp = side => all.filter(x => x.side === side).map(x => `<div class="xpr-i"><span class="xo-i">${ic(extrasIcon(x), "sm")}</span><div><b>${esc(x.name)}</b><small>${esc(x.description)}</small></div><span class="tnum">${extrasEur(x.price_cents)}</span></div>`).join("");
    host.insertAdjacentHTML("beforeend", `<section class="xpr" data-rev><div class="xpr-h"><div class="eyebrow">${ic("store", "sm")}Mercado</div><h2>El Mercado es gratis. Siempre.</h2>
      <p class="muted">Publicar, buscar, contactar y vender no cuesta nada, ni al vendedor ni al comprador. Si quieres ir más rápido, hay extras opcionales.${on ? "" : " Llegan muy pronto."}</p></div>
      <div class="xpr-g"><div class="panel"><h3>${ic("building", "sm")}Para vendedores</h3>${grp("vendedor")}</div><div class="panel"><h3>${ic("user", "sm")}Para compradores</h3>${grp("comprador")}</div></div></section>`);
    try { initReveal(host); } catch (e) {}
  });
});

/* ---------- consola: Extras y pagos ---------- */
(function admExtras() {
  if (!ADM_NAV.some(g => g[0] === "Ingresos")) ADM_NAV.splice(2, 0, ["Ingresos", [["extras", "Extras y pagos", "euro"]]]);
  const get = admGet;
  admGet = async function (key, force) {
    if (key !== "ext") return get.apply(this, arguments);
    if (!force && ADM.c.ext && now() - ADM.c.ext.t < 30000) return ADM.c.ext.v;
    let v;
    if (live()) v = await admRpc("admin_extras", { p_days: 30 });
    else {
      const o = admOff(); o.ext = o.ext || { payments: { enabled: false, test: true }, purchases: [] };
      const vs = o.vs.filter(x => x.listing);
      v = { demo: true, days: 30, payments: o.ext.payments, kpi: { revenue: 0, revenue_period: 0, paid: 0, paid_period: 0, gifts: o.ext.purchases.length, pending: 0, buyers: 0, to_fulfill: 0 },
        live: { featured: vs.filter(x => x.listing.featured_until && +new Date(x.listing.featured_until) > Date.now()).length, urgent: 0, priority: 0 },
        products: EXTRAS_DEMO.map((p, i) => Object.assign({ active: true, sort: i }, p, o.ext["p_" + p.code] || {}, { sold: 0, revenue: 0, interest: [14, 9, 22, 6, 11, 4, 17][i] })),
        purchases: o.ext.purchases };
    }
    ADM.c.ext = { t: now(), v }; return v;
  };
  const ST = { pendiente: ["", "Pendiente"], pagado: ["ok", "Pagado"], regalo: ["vip", "Regalo"], cancelado: ["", "Cancelado"], reembolsado: ["warn", "Reembolsado"] };
  ADM_R.extras = {
    load: async () => ({ x: await admGet("ext", true) }),
    view: ({ x }) => {
      const k = x.kpi || {}, lv = x.live || {}, pay = x.payments || {}, on = !!pay.enabled;
      const prods = x.products || [], interest = prods.reduce((a, p) => a + (+p.interest || 0), 0);
      const hook = location.origin + "/api/extras/webhook";
      return `${x.demo ? `<div class="adm-demo">${ic("alert", "sm")}Modo demostración: datos de ejemplo.</div>` : ""}
      <div class="panel adm-p xpay ${on ? "on" : ""}">
        <div class="xpay-h"><div><b>${on ? "Pagos activos" : "Pagos desactivados"}</b><span>${on ? (pay.test ? "Modo de prueba de Stripe: no se cobra dinero real." : "Cobros reales con Stripe.") : "Los usuarios ven los extras como «Muy pronto» y pueden pedir aviso. Así medimos la demanda antes de cobrar."}</span></div>
          <label class="adm-tog" style="margin:0"><input type="checkbox" id="xPayOn" ${on ? "checked" : ""}><span class="toggle-ui"></span><span>Activar pagos</span></label></div>
        <details class="xpay-d" ${on ? "" : "open"}><summary>${ic("gear", "sm")}Puesta en marcha de Stripe (una sola vez)</summary><ol>
          <li>Crea la cuenta de Stripe a nombre de la empresa (necesita CIF y cuenta bancaria).</li>
          <li>En Cloudflare Pages → motorsubasta → Settings → Variables (cifradas): <code>STRIPE_SECRET_KEY</code>, <code>STRIPE_WEBHOOK_SECRET</code>, <code>SUPABASE_URL</code>, <code>SUPABASE_ANON_KEY</code>, <code>SUPABASE_SERVICE_ROLE_KEY</code>.</li>
          <li>En Stripe → Developers → Webhooks, añade el endpoint <code class="xcopy" data-copy="${esc(hook)}" title="Copiar">${esc(hook)}</code> con el evento <code>checkout.session.completed</code>.</li>
          <li>Prueba primero con las claves de test (<code>sk_test_…</code>) y una compra con la tarjeta 4242 4242 4242 4242.</li>
          <li>Cuando funcione, cambia a las claves reales y desmarca «modo de prueba».</li></ol>
          <label class="adm-tog"><input type="checkbox" id="xPayTest" ${pay.test !== false ? "checked" : ""}><span class="toggle-ui"></span><span>Modo de prueba</span></label></details>
      </div>
      <div class="adm-kpis">
        ${admKpi("euro", "Ingresos", extrasEur(k.revenue || 0), `${extrasEur(k.revenue_period || 0)} en 30 días`)}
        ${admKpi("check", "Pagadas", k.paid || 0, `${num(k.buyers || 0)} clientes · ${num(k.paid_period || 0)} en 30 días`)}
        ${admKpi("spark", "Destacados", lv.featured || 0, `activos · ${num(lv.urgent || 0)} con «Urgente»`)}
        ${admKpi("bolt", "Ofertas top", lv.priority || 0, "pendientes de respuesta")}
        ${admKpi("bell", "Interés", interest, "«Avísame» en 30 días")}
        ${admKpi("doc", "Informes", k.to_fulfill || 0, "por enviar (24 h)", { tone: k.to_fulfill ? "warn" : "" })}
      </div>
      ${admPanel("Productos y precios", `<div class="xtab">${prods.map(p => `<div class="xtr" data-xp="${p.code}">
          <span class="xo-i">${ic(extrasIcon(p), "sm")}</span>
          <div class="xtr-n"><b>${esc(p.name)}</b><small>${p.side === "vendedor" ? "Vendedor" : "Comprador"} · ${num(p.sold || 0)} vendidos · ${extrasEur(p.revenue || 0)}</small></div>
          <div class="xtr-i"><span class="xtr-bar"><i style="width:${interest ? Math.round((+p.interest || 0) / Math.max(...prods.map(z => +z.interest || 0), 1) * 100) : 0}%"></i></span><small class="tnum">${num(p.interest || 0)} interesados</small></div>
          <div class="money sm"><span>€</span><input class="in tnum" type="number" min="0" step="0.01" value="${(p.price_cents / 100).toFixed(2)}" data-xprice aria-label="Precio de ${esc(p.name)}"></div>
          <label class="adm-tog" style="margin:0"><input type="checkbox" data-xact ${p.active ? "checked" : ""}><span class="toggle-ui"></span><span class="sr">Activo</span></label>
          <button class="btn xs" data-xsave>Guardar</button></div>`).join("")}</div>`, { right: `<button class="btn xs primary" id="xGift">${ic("spark", "sm")}Regalar un extra</button>` })}
      ${admPanel("Compras", (x.purchases || []).length ? admTable("xbuy", [
          { k: "created_at", l: "Fecha", f: r => `<span class="tnum">${new Date(r.created_at).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>` },
          { k: "name", l: "Extra", f: r => `<b>${esc(r.name)}</b>` },
          { k: "person", l: "Cliente", f: r => admPerson(r.person) },
          { k: "listing_title", l: "Anuncio", f: r => r.listing_id ? `<a class="link" href="#/mercado/${r.listing_id}">${esc(r.listing_title || "Ver")}</a>${r.vin ? `<small class="mono" style="display:block">${esc(r.vin)}</small>` : ""}` : "—" },
          { k: "amount_cents", l: "Importe", r: 1, f: r => `<span class="tnum">${extrasEur(r.amount_cents || 0)}</span>` },
          { k: "status", l: "Estado", f: r => { const s = ST[r.status] || ["", r.status]; return `<span class="chip ${s[0]}">${s[1]}</span>${r.product_code === "informe" && ["pagado", "regalo"].includes(r.status) ? (r.fulfilled_at ? `<small style="display:block" class="muted">Enviado</small>` : `<button class="btn xs" data-xful="${r.id}" style="margin-top:4px">Marcar enviado</button>`) : ""}`; } },
        ], x.purchases) : `<div class="adm-empty">Todavía no hay compras. ${on ? "" : "Activa los pagos cuando Stripe esté listo, o regala extras para el lanzamiento."}</div>`)}`;
    },
    bind: (d, q, m, draw) => {
      const reload = () => { admDrop("ext"); admMount("extras", q, m); };
      const setPay = async (patch) => { const v = Object.assign({ enabled: false, test: true }, d.x.payments || {}, patch);
        try { if (live()) await admRpc("admin_setting", { p_key: "payments", p_value: v }); else admOff().ext.payments = v;
          window.APP_SETTINGS = Object.assign({}, window.APP_SETTINGS, { payments: v }); admOk(v.enabled ? "Pagos activados" : "Pagos desactivados", "euro"); reload(); } catch (e) { admErr(e); } };
      const t = $("#xPayOn"); if (t) t.onchange = () => {
        if (!t.checked) return setPay({ enabled: false });
        t.checked = false;
        modal("Activar pagos", `<p style="margin:0">Los usuarios podrán pagar los extras con Stripe. Comprueba antes que las variables de Cloudflare y el webhook están configurados; si no, el pago mostrará un error.</p>
          <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">Activar pagos</button></div>`, close => { $("#cNo").onclick = close; $("#cYes").onclick = () => { close(); setPay({ enabled: true }); }; });
      };
      const tt = $("#xPayTest"); if (tt) tt.onchange = () => setPay({ test: tt.checked });
      $$(".xcopy").forEach(c => c.onclick = () => { try { navigator.clipboard.writeText(c.dataset.copy); toast("Copiado", "check"); } catch (e) {} });
      $$("[data-xp]").forEach(r => { const b = r.querySelector("[data-xsave]"); b.onclick = async () => {
        const code = r.dataset.xp, price = Math.round(parseFloat(r.querySelector("[data-xprice]").value.replace(",", ".")) * 100), active = r.querySelector("[data-xact]").checked;
        if (!(price >= 0)) return toast("Precio no válido", "alert");
        try { if (live()) await admRpc("admin_extras_product", { p_code: code, p: { price_cents: price, active } }); else admOff().ext["p_" + code] = { price_cents: price, active };
          EXTRAS.list = null; EXTRAS.loading = null; admOk("Extra guardado", "check"); reload(); } catch (e) { admErr(e); } }; });
      $$("[data-xful]").forEach(b => b.onclick = async () => { try { if (live()) await admRpc("admin_extras_set", { p_id: b.dataset.xful, p_action: "entregado" }); admOk("Marcado como enviado", "check"); reload(); } catch (e) { admErr(e); } });
      const g = $("#xGift"); if (g) g.onclick = async () => {
        let mk = []; try { mk = ((await admGet("mk")).listings || []).filter(l => l.status === "activo"); } catch (e) {}
        const sp = (d.x.products || []).filter(p => p.side === "vendedor");
        modal("Regalar un extra", `<p class="muted" style="margin:0">Sin cobro y al momento. Útil para el lanzamiento, compensar a un cliente o probar.</p>
          <div class="field"><label for="xgP">Extra</label><select class="in" id="xgP">${sp.map(p => `<option value="${p.code}">${esc(p.name)} · ${extrasEur(p.price_cents)}</option>`).join("")}</select></div>
          <div class="field"><label for="xgL">Anuncio</label><select class="in" id="xgL">${mk.map(l => `<option value="${l.id}">${esc(admTitle(l.vehicle || {}))} · ${eur(+l.price)}</option>`).join("")}</select></div>
          <div class="field"><label for="xgN">Nota interna</label><input class="in" id="xgN" placeholder="Lanzamiento Portugal, compensación…"></div>
          <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">${ic("spark", "sm")}Regalar</button></div>`, close => {
          $("#cNo").onclick = close;
          $("#cYes").onclick = async () => { const code = $("#xgP").value, lid = $("#xgL").value; if (!lid) return toast("Elige un anuncio", "alert");
            try { if (live()) await admRpc("admin_extras_grant", { p_code: code, p_listing: lid, p_offer: null, p_note: $("#xgN").value || null });
              else { const p = sp.find(z => z.code === code), l = mk.find(z => z.id === lid); admOff().ext.purchases.unshift({ id: "g" + Date.now(), created_at: new Date().toISOString(), name: p.name, product_code: code, person: { name: "Vendedor" }, listing_id: lid, listing_title: admTitle(l.vehicle || {}), amount_cents: 0, status: "regalo" });
                const x = admOff().vs.find(z => z.listing && z.listing.id === lid); if (x && (p.effect || {}).featured) x.listing.featured_until = new Date(Date.now() + p.effect.featured * 864e5).toISOString(); }
              close(); admDrop("mk"); admOk("Extra regalado y activo", "spark"); try { await sbLoadMarket(); } catch (e) {} reload(); } catch (e) { admErr(e); } };
        });
      };
    },
  };
  ROUTES.unshift([/^\/admin\/extras$/, admRoute("extras", "Extras y pagos", "Lo opcional que se paga en un Mercado gratis: precios, compras, regalos y la puesta en marcha de Stripe.")]);
})();

/* con sesión iniciada, el login con ?next= lleva directo a donde iba */
patchRoute(/^\/login$/, q => { if (isLogged() && q && q.next && /^#\/[\w\/?=&%.-]*$/.test(q.next)) location.replace(q.next); });
