/* ============================================================
   v15 — precios
   · Mercado: gratis (sin suscripciones durante el lanzamiento)
   · Subastas: Comprar / Vender, 3 planes cada uno, combinados compactos
   · Sin "acceso anticipado": la pre-puja ya está abierta a todos
   · Descuentos que compensan de verdad: Pro −25 %, Dealer −40 % de la comisión
   ============================================================ */

/* una sola fuente para descuentos y comisiones de plan */
function planDisc(plan) { plan = plan || S.plan || ""; return /Dealer|Full/.test(plan) ? .40 : /Pro/.test(plan) ? .25 : 0; }
function sellerRate(plan) { plan = plan || S.plan || ""; return /Dealer|Full/.test(plan) ? 0 : /Pro/.test(plan) ? .015 : .03; }
function planPrice(plan) { return ({ "Comprador Pro": 39.99, "Comprador Dealer": 99.99, "Vendedor Pro": 39.99, "Vendedor Dealer": 99.99, "Combinado Pro": 69.99, "Combinado Full": 149.99 })[plan] || 0; }

/* (la primera pintura ocurre antes de que esta capa se ejecute: todo va en funciones) */
function pr2() { return window.__pr2 || (window.__pr2 = { role: "buy", annual: false, n: 1, avg: 3000 }); }
function aucPlans() { return {
  buy: [
    { n: "Comprador Gratis", tag: "Para empezar a pujar", p: 0, limit: Infinity,
      key: [["Comisión de compra", "Estándar"], ["Alertas", "3"]],
      f: [[1, "Pujar y pre-pujar en todas las subastas públicas"], [1, "Coste total calculado antes de pujar"], [1, "Respuesta del vendedor en 24 h"], [0, "Puja automática"], [0, "Ofertas Ocultas"], [0, "Informes DGT incluidos"]] },
    { n: "Comprador Pro", tag: "Para quien compra cada mes", p: 39.99, pop: true, limit: Infinity,
      key: [["Comisión de compra", "−25%"], ["Alertas", "Ilimitadas"]],
      f: [[1, "Todo lo del plan Gratis"], [1, "Puja automática"], [1, "Alertas por marca, modelo y precio"], [1, "Aviso inmediato de «Comprar ya»"], [0, "Ofertas Ocultas"], [0, "Informes DGT incluidos"]],
      note: "Se paga solo con una compra de más de 1.000 € al mes" },
    { n: "Comprador Dealer", tag: "Para profesionales y exportadores", p: 99.99, limit: Infinity,
      key: [["Comisión de compra", "−40%"], ["Informes DGT", "10/mes"]],
      f: [[1, "Todo lo del plan Pro"], [1, "Acceso a Ofertas Ocultas"], [1, "10 informes DGT al mes incluidos"], [1, "Gestor de cuenta personal"]],
      note: "Se paga solo con dos compras de más de 2.000 € al mes" },
  ],
  sell: [
    { n: "Vendedor Gratis", tag: "Para particulares", p: 0, limit: 2,
      key: [["Comisión de éxito", "3%"], ["Vehículos/mes", "2"]],
      f: [[1, "Subasta en la sesión de su categoría"], [1, "Tú decides: aceptar, rechazar o contraofertar"], [1, "Oferta directa de MotorSubasta en 24 h"], [0, "Analíticas de visitas y pujas"], [0, "Destacado en su sesión"], [0, "Carga masiva por CSV"]] },
    { n: "Vendedor Pro", tag: "Para talleres y compraventas", p: 39.99, pop: true, limit: 10,
      key: [["Comisión de éxito", "1,5%"], ["Vehículos/mes", "10"]],
      f: [[1, "Todo lo del plan Gratis"], [1, "Analíticas de visitas y pujas"], [1, "Destacado en su sesión"], [1, "Soporte prioritario"], [0, "Carga masiva por CSV"]],
      note: "Se paga solo vendiendo un vehículo de más de 2.700 € al mes" },
    { n: "Vendedor Dealer", tag: "Para flotas, rentings y aseguradoras", p: 99.99, limit: Infinity,
      key: [["Comisión de éxito", "0%"], ["Vehículos/mes", "Sin límite"]],
      f: [[1, "Todo lo del plan Pro"], [1, "Carga masiva por CSV"], [1, "Analíticas avanzadas"], [1, "Posicionamiento destacado"]],
      note: "Se paga solo a partir de 3.400 € vendidos al mes" },
  ],
}; }
function comboPlans() { return [
  { n: "Combinado Pro", p: 69.99, save: 10, pts: ["Comisión de compra −25%", "Comisión de éxito 1,5%", "10 vehículos/mes"] },
  { n: "Combinado Full", p: 149.99, save: 50, pts: ["Comisión de compra −40%", "Comisión de éxito 0%", "Sin límite", "Ofertas Ocultas"] },
]; }

function prAmt(p) { return p === 0 ? `<span class="pc-free">Gratis</span>` :
  `<span class="pc-cur">€</span><span class="pc-num">${(pr2().annual ? p * .83 : p).toFixed(2).replace(".", ",")}</span><span class="pc-per">/mes</span>`; }

function planCta(pl) {
  if (S.user && S.plan === pl.n) return `<button class="btn block" disabled>${ic("check", "sm")}Tu plan actual</button>`;
  if (!pl.p) return S.user ? `<a class="btn block" href="#/subastas">${ic("gavel", "sm")}Ver subastas</a>` : `<a class="btn block" href="#/registro">Crear cuenta gratis</a>`;
  if (!AUCTIONS_OPEN) return `<button class="btn block ${pl.pop ? "primary" : ""}" data-notify>${ic("bell", "sm")}Avísame cuando abran</button>`;
  return `<button class="btn block ${pl.pop ? "primary" : ""}" data-plan="${pl.n}">Elegir ${pl.n.split(" ").pop()}</button>`;
}
function planCard(pl, i) {
  return `<article class="pc ${pl.pop ? "pop" : ""}" data-rev style="--d:${i * 70}ms">
    ${pl.pop ? `<span class="pc-badge">${ic("spark", "sm")}Más popular</span>` : ""}
    <header><h3>${pl.n}</h3><p>${pl.tag}</p></header>
    <div class="pc-amt tnum">${prAmt(pl.p)}</div>
    <small class="pc-bill">${pl.p ? (pr2().annual ? `Facturado ${eur(pl.p * .83 * 12)} al año` : "Facturación mensual · cancela cuando quieras") : "Sin cuota, para siempre"}</small>
    <div class="pc-key">${pl.key.map(([k, v]) => `<div><small>${k}</small><b class="tnum">${v}</b></div>`).join("")}</div>
    <ul class="pc-f">${pl.f.map(([on, t]) => `<li class="${on ? "" : "off"}">${ic(on ? "check" : "x", "sm")}<span>${t}</span></li>`).join("")}</ul>
    ${pl.note ? `<p class="pc-note">${ic("euro", "sm")}${pl.note}</p>` : `<p class="pc-note ghost"></p>`}
    ${planCta(pl)}
  </article>`;
}

/* ¿te sale a cuenta? — coste mensual de cada plan con tu volumen */
function prCalcHTML() {
  const buy = pr2().role === "buy", plans = aucPlans()[pr2().role], pf = pr2().annual ? .83 : 1;
  const rows = plans.map(pl => {
    const n = pr2().n, avg = pr2().avg;
    const fees = buy ? n * buyerFee(avg) * (1 - planDisc(pl.n)) : n * avg * sellerRate(pl.n);
    return { pl, fees, total: fees + pl.p * pf, over: !buy && n > pl.limit };
  });
  const ok = rows.filter(r => !r.over), best = ok.reduce((a, b) => (b.total < a.total ? b : a), ok[0]);
  const max = Math.max(...rows.map(r => r.total), 1);
  return `<div class="pcalc-out">${rows.map(r => `<div class="pcalc-row ${r === best ? "best" : ""} ${r.over ? "over" : ""}">
      <span class="nm">${r.pl.n.split(" ").pop()}${r === best ? `<i class="chip ok">Te conviene</i>` : ""}</span>
      <span class="bar"><i style="width:${Math.max(4, r.total / max * 100)}%"></i></span>
      <span class="tot tnum">${r.over ? `<small>Supera ${r.pl.limit} vehículos/mes</small>` : eur(r.total)}</span>
      <small class="det tnum">${r.over ? "" : `${eur(r.fees)} ${buy ? "comisiones" : "comisión de éxito"}${r.pl.p ? ` + ${eur(r.pl.p * pf)} plan` : ""}`}</small></div>`).join("")}</div>
    ${best && best.pl.p ? `<p class="pcalc-save">${ic("check", "sm")}Con <b>${best.pl.n}</b> ahorras <b class="tnum">${eur(rows[0].total - best.total)}</b> al mes frente al plan Gratis.</p>` : `<p class="pcalc-save muted">${ic("check", "sm")}Con este volumen, el plan Gratis es lo más económico.</p>`}`;
}

function viewPricing() {
  const buy = pr2().role === "buy", plans = aucPlans()[pr2().role];
  return `<div class="wrap prwrap">
  <section class="prhero" data-rev>
    <div class="eyebrow">${ic("euro", "sm")}Planes y tarifas</div>
    <h1>Precios claros, sin letra pequeña</h1>
    <p class="lead">Registrarse es gratis. En el Mercado no pagas nada; en las subastas solo pagas comisión cuando ganas o vendes. Los planes son para quien opera con frecuencia.</p>
    <nav class="prjump"><a href="#prMk" data-jump>${ic("store", "sm")}Mercado</a><a href="#prAuc" data-jump>${ic("gavel", "sm")}Subastas</a><a href="#prFees" data-jump>${ic("doc", "sm")}Tarifas</a><a href="#prFaq" data-jump>${ic("msg", "sm")}Preguntas</a></nav>
  </section>

  <section class="prmk" id="prMk" data-rev>
    <div class="prmk-l">
      <span class="chip ok">${ic("spark", "sm")}Gratis durante el lanzamiento</span>
      <h2>Mercado de coches</h2>
      <div class="prmk-amt"><b>0 €</b><span>sin cuotas<br>ni comisiones</span></div>
      <p class="muted">Publica y compra a precio fijo, tratando directamente con la otra parte. Sin planes ni suscripciones.</p>
      <div class="prmk-cta"><a class="btn primary" href="#/publicar?t=mercado">${ic("plus", "sm")}Publicar gratis</a><a class="btn" href="#/mercado">${ic("store", "sm")}Ver anuncios</a></div>
    </div>
    <div class="prmk-cols">
      <div><h4>${ic("upload", "sm")}Si vendes</h4><ul>${["Anuncios gratis para particulares y profesionales", "Sin comisión de venta", "Fotos, ficha técnica y descripción completas", "Anuncio activo 60 días, renovable"].map(t => `<li>${ic("check", "sm")}${t}</li>`).join("")}</ul></div>
      <div><h4>${ic("search", "sm")}Si compras</h4><ul>${["Todos los anuncios, fotos y precios", "Contacto directo con el vendedor", "Envía tu oferta si el precio es negociable", "Contrato de compraventa gratis en PDF"].map(t => `<li>${ic("check", "sm")}${t}</li>`).join("")}</ul></div>
    </div>
  </section>

  <section class="prauc" id="prAuc">
    <div class="prauc-h" data-rev>
      <div><div class="eyebrow">${ic("gavel", "sm")}Subastas${AUCTIONS_OPEN ? "" : ` <span class="chip acc">Abren muy pronto</span>`}</div>
        <h2>Planes para pujar y vender</h2>
        <p class="muted">${AUCTIONS_OPEN ? "Empieza gratis. Cambia o cancela tu plan cuando quieras." : "Los planes se podrán contratar el día que abran las subastas. Hasta entonces, todo es gratis."}</p></div>
      <div class="prctl">
        <div class="seg" id="prRole" role="tablist"><button role="tab" data-v="buy" class="${buy ? "on" : ""}" aria-selected="${buy}">${ic("gavel", "sm")}Quiero comprar</button><button role="tab" data-v="sell" class="${buy ? "" : "on"}" aria-selected="${!buy}">${ic("upload", "sm")}Quiero vender</button></div>
        <label class="prbill">Mensual <span class="toggle"><input type="checkbox" id="prAnnual" ${pr2().annual ? "checked" : ""} aria-label="Facturación anual"><span></span></span> Anual <span class="chip ok">−17%</span></label>
      </div>
    </div>
    <div class="pcs">${plans.map(planCard).join("")}</div>

    <div class="pcalc" data-rev>
      <div class="pcalc-in">
        <h3>¿Te sale a cuenta?</h3>
        <p class="muted">Mueve los valores y compara lo que pagarías al mes con cada plan.</p>
        <div class="field"><label for="pcN">${buy ? "Compras al mes" : "Ventas al mes"} <b class="tnum" id="pcNv">${pr2().n}</b></label><input type="range" id="pcN" min="0" max="20" step="1" value="${pr2().n}"></div>
        <div class="field"><label for="pcA">Precio medio por vehículo <b class="tnum" id="pcAv">${eur(pr2().avg)}</b></label><input type="range" id="pcA" min="500" max="20000" step="250" value="${pr2().avg}"></div>
        <small class="faint">${buy ? "Comisión de compra según la tabla de tramos, sin IVA." : "Comisión de éxito sobre el precio de adjudicación, sin IVA."}</small>
      </div>
      <div id="pcOut">${prCalcHTML()}</div>
    </div>

    <div class="combo" data-rev>
      <div class="combo-h"><h3>${ic("users", "sm")}¿Compras y vendes?</h3><p class="muted">Un solo plan para las dos cosas, más barato que contratarlos por separado.</p></div>
      ${comboPlans().map(c => `<div class="combo-r">
        <div class="nm"><b>${c.n}</b><span class="chip ok">Ahorras ${eur(c.save)}/mes</span></div>
        <div class="pts">${c.pts.map(t => `<span>${ic("check", "sm")}${t}</span>`).join("")}</div>
        <div class="pr tnum"><b>€${(pr2().annual ? c.p * .83 : c.p).toFixed(2).replace(".", ",")}</b><small>/mes</small></div>
        ${S.user && S.plan === c.n ? `<button class="btn sm" disabled>Tu plan actual</button>` : AUCTIONS_OPEN ? `<button class="btn sm" data-plan="${c.n}">Elegir</button>` : `<button class="btn sm" data-notify>${ic("bell", "sm")}Avísame</button>`}
      </div>`).join("")}
    </div>
  </section>

  <section class="prfees" id="prFees">
    <div class="sec-head" data-rev><div><div class="eyebrow">Tarifas</div><h2 style="margin-top:8px">Comisión del comprador por tramo</h2><p>Se aplica sobre el precio de adjudicación, solo si ganas. Precios sin IVA; no incluyen transporte ni gestoría.</p></div></div>
    <div class="tbl-wrap" data-rev><table><thead><tr><th>Precio de adjudicación</th><th class="r">Estándar</th><th class="r">Pro (−25%)</th><th class="r">Dealer (−40%)</th></tr></thead><tbody>
    ${FEES.map(([a, b, c]) => `<tr><td class="tnum">${num(a)} € – ${num(b)} €</td><td class="r tnum">${c} €</td><td class="r tnum">${Math.round(c * .75)} €</td><td class="r tnum">${Math.round(c * .6)} €</td></tr>`).join("")}
    <tr><td>16.000 € +</td><td class="r">2,8%</td><td class="r">2,1%</td><td class="r">1,68%</td></tr></tbody></table></div>
    <div class="commit" style="margin-top:22px">
      <div data-rev><h3 style="font-size:19px;margin-bottom:12px">${ic("doc")} Servicios de gestoría</h3><div class="tbl-wrap"><table><tbody>${GESTORIA.map(([n, p]) => `<tr><td>${n}</td><td class="r tnum">${p} € + IVA</td></tr>`).join("")}</tbody></table></div></div>
      <div style="display:grid;gap:14px;align-content:start">
        <div class="panel" data-rev><h3>${ic("truck")} Transporte</h3><p class="muted" style="margin:0 0 10px;font-size:13.5px">Estimación desde Alicante con portavehículos (grúa +35%).</p>${Object.entries(TRANSPORT).slice(0, 6).map(([k, v]) => `<div class="kv"><span>${k}</span><span class="tnum">${v} € + IVA</span></div>`).join("")}</div>
        <div class="panel" data-rev style="border-color:color-mix(in srgb,var(--bad) 40%,var(--line))"><h3 style="color:var(--bad)">${ic("alert")} Tarifa de reactivación</h3><p class="muted" style="margin:0 0 10px;font-size:13.5px">Solo si se incumple una compra adjudicada y hay que reactivar la cuenta.</p><div class="bigprice">349 € <small class="muted" style="font:500 14px var(--body)">+ IVA</small></div></div>
      </div>
    </div>
  </section>

  <section style="margin-top:48px" class="faq" id="prFaq"><h2 style="font-size:28px;margin-bottom:8px">Preguntas frecuentes</h2>
    ${[["¿Por qué el Mercado es gratis?", "Queremos que encuentres comprador o vehículo sin barreras. Durante el lanzamiento publicar, contactar y vender en el Mercado no tiene coste."],
      ["¿Tengo que pagar un plan para pujar?", "No. Con la cuenta gratuita puedes pujar y pre-pujar en todas las subastas públicas. Solo pagas la comisión si ganas un lote."],
      ["¿Qué es la pre-puja?", "Puedes dejar tu puja antes de que empiece la sesión. Se aplica al abrirse y sigue activa durante la subasta, igual para todos los planes."],
      ["¿Puedo cancelar en cualquier momento?", "Sí. El plan sigue activo hasta el final del periodo pagado y no se renueva."],
      ["¿Puedo subir o bajar de plan?", "Sí, el cambio es inmediato y se prorratea el importe del periodo en curso."],
      ["¿Qué pasa si gano una subasta y el vendedor no acepta?", "El vendedor tiene 24 h para aceptar, rechazar o proponerte otro precio. Si rechaza, no tienes ninguna obligación."],
      ["¿Cómo funciona el anti-sniping?", "Cualquier puja en los dos últimos minutos amplía el cierre dos minutos más, para que todos puedan responder."]].map(([q, a]) => `<details><summary>${q}${ic("chev", "chev")}</summary><p>${a}</p></details>`).join("")}
  </section></div>`;
}
function mountPricing() {
  $$("#prRole button").forEach(b => b.onclick = () => { pr2().role = b.dataset.v; pr2().n = 1; pr2().avg = pr2().role === "buy" ? 3000 : 3500; router(); });
  $("#prAnnual").onchange = e => { pr2().annual = e.target.checked; router(); };
  $$("[data-jump]").forEach(a => a.onclick = e => { e.preventDefault(); const t = $(a.getAttribute("href")); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); });
  const upd = () => { $("#pcNv").textContent = pr2().n; $("#pcAv").textContent = eur(pr2().avg); $("#pcOut").innerHTML = prCalcHTML(); };
  $("#pcN").oninput = e => { pr2().n = +e.target.value; upd(); };
  $("#pcA").oninput = e => { pr2().avg = +e.target.value; upd(); };
  $$("[data-plan]").forEach(b => b.onclick = () => {
    if (!S.user) { location.hash = "#/registro"; return; }
    modal("Cambiar a " + b.dataset.plan, `<p style="margin:0">Tu plan pasará de <b>${S.plan}</b> a <b>${b.dataset.plan}</b>. Facturación ${pr2().annual ? "anual" : "mensual"}.</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">Confirmar</button></div>`, close => {
      $("#cNo").onclick = close;
      $("#cYes").onclick = () => { S.plan = b.dataset.plan; store.set("plan", S.plan); close(); toast("Plan actualizado a " + S.plan, "check"); router(); };
    });
  });
}
