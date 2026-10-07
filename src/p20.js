/* ============================================================
   v13 — lanzamiento
   · Mercado gratis como producto principal
   · Subastas en vista previa (se ven y se explican, la puja espera)
   · Seguros: solicitud que se pasa a una correduría colaboradora
   · Decisión tras la subasta: vendedor 24 h, comprador responde, admin supervisa
   ============================================================ */

/* ← poner a true cuando estén la empresa y las condiciones legales de las subastas */
var AUCTIONS_OPEN = false;

Object.assign(P, {
  umbrella: '<path d="M22 12a10.06 10.06 0 0 0-20 0Z"/><path d="M12 12v8a2 2 0 0 0 4 0"/><path d="M12 2v1"/>',
});

/* ---------- lista de espera ---------- */
const isEmail = s => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(s || "").trim());
async function waitlistJoin(email, topic) {
  email = String(email || "").trim().toLowerCase();
  if (!isEmail(email)) return { ok: false, msg: "Introduce un email válido" };
  if (typeof LIVE !== "undefined" && LIVE && typeof sb !== "undefined" && sb) {
    const { error } = await sb.from("waitlist").insert({ email, topic: topic || "subastas", lang: window.LANG || "es" });
    if (error && error.code !== "23505") return { ok: false, msg: "No se ha podido guardar. Inténtalo de nuevo." };
  } else {
    const l = store.get("waitlist", []); if (!l.includes(email)) l.push(email); store.set("waitlist", l);
  }
  store.set("waitlistMe", email);
  return { ok: true };
}
const myEmail = () => store.get("waitlistMe", "") || (S.user && S.user.email) || "";

function notifyModal() {
  modal("Las subastas abren muy pronto", `
    <p class="muted" style="margin:0">Estamos cerrando la parte legal para que cada puja sea vinculante y segura. Déjanos tu email y te avisamos el día que abran. Mientras tanto, el Mercado ya está abierto y publicar es gratis.</p>
    <div class="field"><label for="wlMail">Tu email</label><input class="in" id="wlMail" type="email" autocomplete="email" placeholder="tu@email.com" value="${esc(myEmail())}"></div>
    <div id="wlErr"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap"><a class="btn" href="#/mercado" id="wlMk">${ic("store", "sm")}Ver el Mercado</a><button class="btn primary" id="wlGo">${ic("bell", "sm")}Avísame</button></div>`, close => {
    $("#wlMk").onclick = close;
    const go = async () => {
      const r = await waitlistJoin($("#wlMail").value, "subastas");
      if (!r.ok) { $("#wlErr").innerHTML = `<div class="err">${ic("alert", "sm")}${r.msg}</div>`; return; }
      close(); toast("Te avisaremos cuando abran las subastas", "bell");
    };
    $("#wlGo").onclick = go;
    $("#wlMail").onkeydown = e => { if (e.key === "Enter") go(); };
    setTimeout(() => $("#wlMail") && $("#wlMail").focus(), 60);
  });
}
/* cualquier botón con data-notify abre el aviso */
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-notify]");
  if (b) { e.preventDefault(); notifyModal(); }
});

function previewBar() {
  return `<div class="previewbar" data-rev>
    <span class="pv-ic">${ic("bell")}</span>
    <div><b>Vista previa de las subastas</b><span>Abrimos muy pronto. Ya puedes ver lotes, sesiones y precios; la puja se activa el día de apertura.</span></div>
    <div class="pv-act"><button class="btn sm primary" data-notify>${ic("bell", "sm")}Avísame</button><a class="btn sm" href="#/mercado">${ic("store", "sm")}Ir al Mercado</a></div>
  </div>`;
}

/* la puja queda en espera: el botón abre el aviso */
(function previewBids() {
  const base = quickBid;
  quickBid = function (id, amt) { if (!AUCTIONS_OPEN) return notifyModal(); return base(id, amt); };
})();

/* ficha del lote en vista previa */
(function previewBidbox() {
  const base = renderBidbox;
  renderBidbox = function (l) {
    if (AUCTIONS_OPEN) return base(l);
    const box = $("#bidbox"); if (!box) return;
    const cur = curPrice(l), locked = isLockedLot(l), st = statusOf(l);
    const local = tzDiffers(l.startsAt) ? `<small class="muted">${fmtLocal(l.startsAt)}–${fmtLocal(l.endsAt)} tu hora</small>` : "";
    box.innerHTML = `<div class="hd soon"><span>Vista previa</span><span class="chip acc">Próximamente</span></div>
    <div class="bd">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:10px">
        <div><small class="muted">${l.hist.length ? "Puja actual" : "Precio de salida"}</small><div class="bigprice tnum">${locked ? "€ •••" : eur(cur)}</div></div>
        <div style="text-align:right;display:grid;gap:2px"><small class="muted">${st === "live" ? "Sesión en curso" : "Sesión"}</small><b class="mono tnum" style="font-size:16px">${fmtES(l.startsAt)}–${fmtES(l.endsAt)}</b><small class="muted">hora de España</small>${local}</div>
      </div>
      <div class="lead-note" style="background:var(--accent-soft);color:var(--accent)">${ic("bell", "sm")}Las subastas abren muy pronto. Así funcionará este lote: puja vinculante, coste total calculado antes de pujar y decisión del vendedor en 24 h.</div>
      <div class="field"><label for="pvMail">Avísame cuando abran</label>
        <div class="pvrow"><input class="in" id="pvMail" type="email" autocomplete="email" placeholder="tu@email.com" value="${esc(myEmail())}"><button class="btn primary" id="pvGo">${ic("bell", "sm")}Avisar</button></div>
        <div id="pvErr"></div></div>
      <a class="btn block" href="#/mercado">${ic("store", "sm")}Ver coches a la venta en el Mercado</a>
      <a class="btn block ghost" href="#/seguros?lote=${encodeURIComponent(l.id)}">${ic("umbrella", "sm")}Pedir seguro para este vehículo</a>
    </div>`;
    $("#pvGo").onclick = async () => {
      const r = await waitlistJoin($("#pvMail").value, "subastas");
      $("#pvErr").innerHTML = r.ok ? `<small class="okmsg">${ic("check", "sm")}Listo, te avisaremos.</small>` : `<div class="err">${ic("alert", "sm")}${r.msg}</div>`;
    };
  };
})();

/* ---------- rutas: avisos de vista previa, precios, mercado y seguros ---------- */
function patchRoute(re, wrapMount) {
  const i = ROUTES.findIndex(r => String(r[0]) === String(re));
  if (i < 0) return;
  const fn = ROUTES[i][1];
  ROUTES[i] = [ROUTES[i][0], (q, m) => { const out = fn(q, m); const mount = out[1]; return [out[0], () => { mount && mount(); wrapMount(q, m); }]; }];
}
patchRoute(/^\/subasta\/([\w-]+)$/, () => { if (!AUCTIONS_OPEN) { const w = $("#app .wrap"); if (w && !w.querySelector(".previewbar")) w.insertAdjacentHTML("afterbegin", previewBar()); } });

patchRoute(/^\/mercado\/([\w-]+)$/, (q, m) => {
  const b = $("#miOffer"); if (!b || $(".segcta")) return;
  b.insertAdjacentHTML("afterend", `<a class="segcta" href="#/seguros?mercado=${encodeURIComponent(m[1])}">${ic("umbrella", "sm")}<span><b>¿Te lo llevas?</b> Pide seguro para el traslado</span>${ic("right", "sm")}</a>`);
});

/* ---------- SEGUROS ---------- */
var SG = null;
function sgState() {
  if (!SG) SG = { kind: "dias", plate: "", make: "", model: "", year: "", use: "particular", start: cvToday(), days: "7", birth: "", lic: "", cp: "", name: "", phone: "", email: "", notes: "", consent: false, source: "web", done: null };
  return SG;
}
const SG_KINDS = [
  ["dias", "clock", "Por días", "Para llevarte el coche que acabas de comprar o un uso puntual."],
  ["anual", "shield", "Anual", "Terceros, terceros ampliado o todo riesgo para el día a día."],
  ["profesional", "store", "Profesional o flota", "Compraventa, talleres, flotas y placas de tránsito."],
  ["transporte", "truck", "Transporte o exportación", "Vehículo en camión o portavehículos, nacional o internacional."],
];
function sgPrefill(q) {
  const s = sgState();
  const l = q.lote && lots.find(x => x.id === q.lote), m = q.mercado && market.find(x => x.id === q.mercado);
  if (l && s.source !== "lote:" + l.id) Object.assign(s, { make: l.make || "", model: l.model || "", year: String(l.year || ""), plate: l.plate && !/•/.test(l.plate) ? l.plate : "", source: "lote:" + l.id, kind: "dias" });
  if (m && s.source !== "mercado:" + m.id) Object.assign(s, { make: String(m.title).split(" ")[0] || "", model: String(m.title).split(" ").slice(1).join(" "), year: String(m.year || ""), source: "mercado:" + m.id, kind: "dias" });
  if (S.user) { s.name = s.name || S.user.name || ""; s.email = s.email || S.user.email || ""; s.phone = s.phone || S.user.phone || ""; }
}
function sgField(k, label, o = {}) {
  const s = sgState();
  return `<div class="field ${o.full ? "full" : ""}"><label for="sg_${k}">${label}${o.req ? ' <i class="req">*</i>' : ""}</label>
    <input class="in ${o.mono ? "mono" : ""}" id="sg_${k}" data-sg="${k}" value="${esc(s[k] || "")}" ${o.type ? `type="${o.type}"` : ""} ${o.im ? `inputmode="${o.im}"` : ""} ${o.ph ? `placeholder="${esc(o.ph)}"` : ""} ${o.ac ? `autocomplete="${o.ac}"` : ""} ${o.max ? `maxlength="${o.max}"` : ""}></div>`;
}
function viewSeguros(q) {
  const s = sgState(); sgPrefill(q || {});
  if (s.done) return `<div class="wrap cvwrap"><div class="panel sgdone" data-rev>
      <span class="okbig">${ic("check", "lg")}</span>
      <h1>Solicitud enviada</h1>
      <p class="muted">Una correduría de seguros colaboradora te contactará en 24 h laborables en el <b translate="no">${esc(s.done.phone)}</b> o en <b translate="no">${esc(s.done.email)}</b>.</p>
      <div class="chip acc" style="margin:4px auto 0">Referencia <b translate="no">${s.done.ref}</b></div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:22px"><a class="btn primary" href="#/mercado">${ic("store", "sm")}Ver el Mercado</a><button class="btn" id="sgAgain">Otra solicitud</button></div>
    </div></div>`;
  return `<div class="wrap cvwrap">
  <section class="cvhero" data-rev>
    <div class="eyebrow">${ic("umbrella", "sm")}Seguros · gratis y sin compromiso</div>
    <h1>Asegura tu vehículo antes de llevártelo</h1>
    <p class="lead">Cuéntanos qué necesitas y una correduría de seguros colaboradora te enviará ofertas de varias aseguradoras. Tú decides; MotorSubasta no te cobra nada.</p>
    <div class="cvbadges"><span>${ic("clock", "sm")}Respuesta en 24 h laborables</span><span>${ic("truck", "sm")}Seguro por días para el traslado</span><span>${ic("users", "sm")}Particulares y profesionales</span></div>
  </section>
  <div class="cvgrid">
    <form class="cvform" id="sgForm" novalidate onsubmit="return false">
      ${cvSec(1, "sgK", "¿Qué seguro necesitas?", "", `<div class="opt-cards sgkinds">${SG_KINDS.map(([k, i, t, d]) => `<button type="button" class="opt ${s.kind === k ? "on" : ""}" data-sgk="${k}" aria-pressed="${s.kind === k}"><b>${ic(i, "sm")}${t}</b><small>${d}</small></button>`).join("")}</div>`)}
      ${cvSec(2, "sgV", "Vehículo", "Si aún no tiene matrícula a tu nombre, pon la actual.", `<div class="fgrid">
        ${sgField("plate", "Matrícula", { mono: 1, ph: "1234 BCD", max: 10 })}
        ${sgField("year", "Año", { im: "numeric", ph: "2016", max: 4 })}
        ${sgField("make", "Marca", { req: 1, ph: "Toyota" })}
        ${sgField("model", "Modelo", { ph: "Yaris Hybrid" })}
        <div class="field full"><span class="lbl">Uso</span>${`<div class="seg cvseg" role="radiogroup">${[["particular", "Particular", "user"], ["profesional", "Profesional", "building"]].map(([k, t, i]) => `<button type="button" role="radio" class="${s.use === k ? "on" : ""}" aria-checked="${s.use === k}" data-sguse="${k}">${ic(i, "sm")}${t}</button>`).join("")}</div>`}</div>
      </div>`)}
      ${cvSec(3, "sgC", "Cuándo y quién conduce", "", `<div class="fgrid">
        ${sgField("start", "Fecha de inicio", { type: "date" })}
        <div class="field ${s.kind === "dias" ? "" : "hidden"}" id="sgDaysF"><label for="sg_days">Días</label><select class="in" id="sg_days" data-sg="days">${["1", "3", "7", "15", "30", "60", "90"].map(d => `<option ${s.days === d ? "selected" : ""}>${d}</option>`).join("")}</select></div>
        ${sgField("birth", "Año de nacimiento del conductor", { im: "numeric", ph: "1985", max: 4 })}
        ${sgField("lic", "Años con carnet", { im: "numeric", ph: "12", max: 2 })}
        ${sgField("cp", "Código postal", { im: "numeric", mono: 1, ph: "03509", max: 5 })}
      </div>`)}
      ${cvSec(4, "sgP", "Tus datos de contacto", "", `<div class="fgrid">
        ${sgField("name", "Nombre y apellidos", { req: 1, full: 1, ac: "name" })}
        ${sgField("phone", "Teléfono", { req: 1, type: "tel", ac: "tel", ph: "+34 600 000 000" })}
        ${sgField("email", "Email", { req: 1, type: "email", ac: "email" })}
        <div class="field full"><label for="sg_notes">¿Algo más? <span class="muted">(opcional)</span></label><textarea class="in" id="sg_notes" data-sg="notes" rows="3" placeholder="Por ejemplo: lo recojo en Valencia el lunes y lo llevo a Alicante.">${esc(s.notes)}</textarea></div>
      </div>
      <label class="cvchk sgconsent"><input type="checkbox" id="sgOk" ${s.consent ? "checked" : ""}><span>Acepto que MotorSubasta comunique estos datos a una correduría de seguros colaboradora inscrita en la DGSFP para que me contacte con ofertas de seguro. Puedo retirar el consentimiento cuando quiera (<a class="link" href="#/privacidad">política de privacidad</a>).</span></label>
      <div id="sgErr"></div>
      <button type="button" class="btn primary lg" id="sgGo">${ic("umbrella", "sm")}Pedir ofertas de seguro</button>`)}
    </form>
    <aside class="cvside">
      <div class="panel cvafter">
        <h4>Cómo funciona</h4>
        <ol>
          <li><b>Rellenas el formulario.</b> Son dos minutos y no te comprometes a nada.</li>
          <li><b>Una correduría lo estudia.</b> Está inscrita en el registro de la DGSFP y trabaja con varias aseguradoras.</li>
          <li><b>Te contacta con ofertas</b> por teléfono o email en 24 h laborables.</li>
          <li><b>Contratas solo si te convence.</b> El seguro lo firmas directamente con ellos.</li>
        </ol>
      </div>
      <div class="panel sglegal">
        ${ic("shield", "sm")}<p>MotorSubasta no es mediador de seguros ni compara productos: solo hace llegar tu solicitud a una correduría colaboradora, que es quien te asesora y te ofrece el seguro.</p>
      </div>
    </aside>
  </div>
</div>`;
}
function mountSeguros() {
  const s = sgState();
  const again = $("#sgAgain"); if (again) { again.onclick = () => { s.done = null; s.consent = false; router(); }; return; }
  const f = $("#sgForm"); if (!f) return;
  f.addEventListener("input", e => { const k = e.target.dataset.sg; if (k) s[k] = e.target.value; });
  f.addEventListener("change", e => { const k = e.target.dataset.sg; if (k) s[k] = e.target.value; if (e.target.id === "sgOk") s.consent = e.target.checked; });
  $$("[data-sgk]").forEach(b => b.onclick = () => {
    s.kind = b.dataset.sgk;
    $$("[data-sgk]").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    $("#sgDaysF").classList.toggle("hidden", s.kind !== "dias");
  });
  $$("[data-sguse]").forEach(b => b.onclick = () => { s.use = b.dataset.sguse; $$("[data-sguse]").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); }); });
  $("#sgGo").onclick = async () => {
    const err = m => { $("#sgErr").innerHTML = `<div class="err">${ic("alert", "sm")}${m}</div>`; };
    if (!String(s.make).trim()) return err("Indica la marca del vehículo.");
    if (String(s.name).trim().length < 2) return err("Indica tu nombre.");
    if (String(s.phone).replace(/\D/g, "").length < 9) return err("Revisa el teléfono.");
    if (!isEmail(s.email)) return err("Revisa el email.");
    if (s.cp && !/^\d{5}$/.test(s.cp)) return err("El código postal tiene 5 cifras.");
    if (!$("#sgOk").checked) return err("Necesitamos tu consentimiento para pasar la solicitud a la correduría.");
    const num = (v, a, b) => { const n = parseInt(v, 10); return n >= a && n <= b ? n : null; };
    const row = {
      kind: s.kind, plate: String(s.plate).toUpperCase().slice(0, 15) || null, make: String(s.make).slice(0, 60), model: String(s.model).slice(0, 80) || null,
      year: num(s.year, 1950, 2100), use_type: s.use, start_date: s.start || null, days: s.kind === "dias" ? num(s.days, 1, 365) : null,
      birth_year: num(s.birth, 1920, 2010), license_years: num(s.lic, 0, 80), postal_code: /^\d{5}$/.test(s.cp) ? s.cp : null,
      full_name: String(s.name).trim().slice(0, 120), phone: String(s.phone).trim().slice(0, 30), email: String(s.email).trim().toLowerCase(),
      notes: String(s.notes || "").slice(0, 1000) || null, lang: window.LANG || "es", source: s.source, consent: true,
    };
    const btn = $("#sgGo"); btn.disabled = true;
    try {
      if (typeof LIVE !== "undefined" && LIVE && sb) {
        const { error } = await sb.from("insurance_leads").insert(row);
        if (error) { console.warn(error); btn.disabled = false; return err("No se ha podido enviar. Inténtalo de nuevo en un momento."); }
      } else {
        const l = store.get("seguros", []); l.unshift({ ...row, created_at: new Date().toISOString(), status: "nuevo" }); store.set("seguros", l.slice(0, 50));
      }
      s.done = { phone: row.phone, email: row.email, ref: "S-" + Date.now().toString(36).slice(-5).toUpperCase() };
      router(); scrollTo(0, 0);
    } catch (e) { btn.disabled = false; err("No se ha podido enviar. Inténtalo de nuevo en un momento."); }
  };
}
ROUTES.unshift([/^\/seguros$/, q => [viewSeguros(q), mountSeguros]]);

/* ---------- DECISIONES tras la subasta ---------- */
const DEC_TXT = { pendiente: ["acc", "Pendiente de decisión"], contraoferta: ["info", "Contraoferta enviada"], aceptada: ["ok", "Aceptada"], rechazada: ["", "Rechazada"], caducada: ["warn", "Plazo vencido"] };
/* sin servidor: ejemplos para enseñar el flujo */
var DEMO_DEC = null;
function demoDecisions() {
  if (!DEMO_DEC) {
    const pick = (i, extra) => { const l = lots[i % Math.max(1, lots.length)] || {}; return Object.assign({ id: "D" + i, title: l.title || "Vehículo", img: l.img, ref: l.ref, reserve: null, sellerId: "demo", topBidder: "demo" }, extra); };
    DEMO_DEC = [
      pick(8, { decision: "pendiente", topBid: 2150, secondBid: 2050, reserve: 2400, deadline: now() + 19 * HOUR }),
      pick(3, { decision: "pendiente", topBid: 1475, secondBid: 1425, deadline: now() + 6 * HOUR }),
      pick(6, { decision: "contraoferta", topBid: 1850, secondBid: 1800, counter: 1990, deadline: now() + 21 * HOUR, mine: true }),
    ];
  }
  return DEMO_DEC;
}
function decItems(scope) {
  const live = typeof LIVE !== "undefined" && LIVE;
  if (!live) {
    const d = demoDecisions();
    if (scope === "buyer") return d.filter(x => x.mine);
    return scope === "admin" ? d : (canSell() ? d.filter(x => !x.mine) : []);
  }
  const uid = S.user && S.user.id;
  return lots.filter(l => l.decision && (scope === "admin" || (scope === "seller" ? l.sellerId === uid : l.topBidder === uid)))
    .map(l => ({ id: l.id, title: l.title, img: l.img, ref: l.ref, decision: l.decision, topBid: l.topBid, secondBid: l.secondBid, reserve: l.reserve, counter: l.counterPrice, deadline: l.decisionDeadline, finalPrice: l.finalPrice }))
    .sort((a, b) => (a.deadline || 9e15) - (b.deadline || 9e15));
}
function decRow(d, scope) {
  const [chip, txt] = DEC_TXT[d.decision] || ["", d.decision];
  const left = d.deadline && d.deadline > now() ? `<span class="mono tnum" data-dl="${d.deadline}">${fmtLeft(d.deadline - now())}</span>` : "";
  const below = d.reserve && d.topBid < d.reserve;
  const sellerCan = (scope === "seller" && d.decision === "pendiente") || (scope === "admin" && ["pendiente", "contraoferta", "caducada"].includes(d.decision));
  const buyerCan = scope === "buyer" && d.decision === "contraoferta";
  return `<div class="decrow" data-dec="${d.id}">
    <img src="${imgSrc(d.img)}" alt="" loading="lazy">
    <div class="dmain"><b>${esc(d.title)}</b><small>${d.ref ? esc(d.ref) + " · " : ""}<span class="chip ${chip}">${txt}</span>${left ? ` · quedan ${left}` : ""}</small></div>
    <div class="dnums">
      <span><small>Mejor puja</small><b class="tnum">${eur(d.topBid || 0)}</b></span>
      ${d.secondBid ? `<span><small>2.ª puja</small><b class="tnum">${eur(d.secondBid)}</b></span>` : ""}
      ${d.reserve ? `<span class="${below ? "warnc" : ""}"><small>Reserva</small><b class="tnum">${eur(d.reserve)}</b></span>` : ""}
      ${d.counter ? `<span><small>Contraoferta</small><b class="tnum">${eur(d.counter)}</b></span>` : ""}
      ${d.finalPrice ? `<span><small>Precio final</small><b class="tnum">${eur(d.finalPrice)}</b></span>` : ""}
    </div>
    <div class="dact">${sellerCan ? `
      <button class="btn sm primary" data-da="aceptar">${ic("check", "sm")}Aceptar</button>
      <button class="btn sm" data-da="contraoferta">${ic("msg", "sm")}Contraoferta</button>
      <button class="btn sm ghost" data-da="rechazar">${ic("x", "sm")}Rechazar</button>` : buyerCan ? `
      <button class="btn sm primary" data-dr="1">${ic("check", "sm")}Aceptar ${eur(d.counter)}</button>
      <button class="btn sm ghost" data-dr="0">${ic("x", "sm")}Rechazar</button>` : d.decision === "aceptada" && scope === "buyer" ? `<a class="btn sm primary" href="#/pago/${encodeURIComponent(d.id)}">${ic("euro", "sm")}Pagar</a>` : ""}</div>
  </div>`;
}
function decList(scope) {
  const items = decItems(scope);
  if (!items.length) return `<div class="panel empty">${ic("gavel", "lg")}<b>No hay decisiones pendientes</b><span>Cuando cierre una subasta con pujas, aparecerá aquí.</span></div>`;
  return `<div class="declist">${items.map(d => decRow(d, scope)).join("")}</div>`;
}
async function decAct(scope, id, action, price) {
  const live = typeof LIVE !== "undefined" && LIVE;
  if (!live) {
    const d = demoDecisions().find(x => x.id === id); if (!d) return;
    if (action === "aceptar") Object.assign(d, { decision: "aceptada", finalPrice: price || d.topBid, deadline: null });
    else if (action === "rechazar") Object.assign(d, { decision: "rechazada", deadline: null });
    else if (action === "contraoferta") Object.assign(d, { decision: "contraoferta", counter: price, deadline: now() + 24 * HOUR });
    else if (action === "si") Object.assign(d, { decision: "aceptada", finalPrice: d.counter, deadline: null });
    else if (action === "no") Object.assign(d, { decision: "rechazada", deadline: null });
    toast("Hecho (demostración)", "check"); router(); return;
  }
  const r = action === "si" || action === "no"
    ? await sb.rpc("respond_counter", { p_auction: id, p_accept: action === "si" })
    : await sb.rpc("decide_auction", { p_auction: id, p_action: action, p_price: price || null });
  const res = r.data && r.data[0];
  if (r.error || !res || !res.ok) { toast((res && res.message) || "No se ha podido completar", "alert"); return; }
  toast(res.message, "check");
  await sbLoadInventory(); router();
}
function bindDecisions(scope, root = document) {
  $$("[data-dec]", root).forEach(row => {
    const id = row.dataset.dec, d = decItems(scope).find(x => String(x.id) === id); if (!d) return;
    $$("[data-da]", row).forEach(b => b.onclick = () => {
      const a = b.dataset.da;
      if (a === "contraoferta") {
        const min = (d.topBid || 0) + inc(d.topBid || 0);
        return modal("Contraoferta", `<p class="muted" style="margin:0">El mejor postor tendrá 24 h para aceptarla o rechazarla.</p>
          <div class="field"><label for="ctP">Tu precio (€)</label><div class="money"><span>€</span><input class="in tnum" id="ctP" type="number" min="${min}" step="50" value="${Math.max(min, d.reserve || 0)}"></div><small class="muted">Mínimo ${eur(min)}</small></div>
          <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="ctNo">Cancelar</button><button class="btn primary" id="ctGo">${ic("msg", "sm")}Enviar contraoferta</button></div>`, close => {
          $("#ctNo").onclick = close;
          $("#ctGo").onclick = () => { const v = +$("#ctP").value; if (!(v >= min)) { toast("El mínimo es " + eur(min), "alert"); return; } close(); decAct(scope, id, "contraoferta", v); };
        });
      }
      if (a === "aceptar" && scope === "admin") {
        return modal("Aceptar oferta", `<p class="muted" style="margin:0">Como administrador puedes corregir el precio final si se ha acordado otro con las partes.</p>
          <div class="field"><label for="acP">Precio final (€)</label><div class="money"><span>€</span><input class="in tnum" id="acP" type="number" value="${d.counter && d.decision === "contraoferta" ? d.counter : d.topBid}"></div></div>
          <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="acNo">Cancelar</button><button class="btn primary" id="acGo">${ic("check", "sm")}Adjudicar</button></div>`, close => {
          $("#acNo").onclick = close;
          $("#acGo").onclick = () => { const v = +$("#acP").value; close(); decAct(scope, id, "aceptar", v > 0 ? v : null); };
        });
      }
      const label = a === "aceptar" ? `Aceptar ${eur(d.topBid)}` : "Rechazar la oferta";
      modal(label, `<p style="margin:0">${a === "aceptar" ? "Se adjudica el vehículo al mejor postor y se le pide el pago en 48 h." : "El mejor postor recibirá el aviso de que no se acepta su oferta."}</p>
        <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="dcNo">Cancelar</button><button class="btn primary" id="dcGo">Confirmar</button></div>`, close => {
        $("#dcNo").onclick = close; $("#dcGo").onclick = () => { close(); decAct(scope, id, a); };
      });
    });
    $$("[data-dr]", row).forEach(b => b.onclick = () => decAct(scope, id, b.dataset.dr === "1" ? "si" : "no"));
  });
}
setInterval(() => $$("[data-dl]").forEach(e => { e.textContent = fmtLeft(+e.dataset.dl - now()); }), 1000);

/* vendedor: nueva sección */
function viewSellerDecisions() {
  return sellShell("#/vender/decisiones", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Vendedor</div><h1 style="margin-top:8px">Decisiones</h1>
      <p class="muted" style="margin:6px 0 0">Cuando una subasta cierra con pujas, tienes 24 h para aceptar la mejor oferta, rechazarla o proponer otro precio.</p></div></div>
    ${decList("seller")}`);
}
ROUTES.unshift([/^\/vender\/decisiones$/, () => [viewSellerDecisions(), () => { bindDecisions("seller"); if (typeof mountAcct === "function") try { mountAcct(); } catch (e) {} }]]);
GUARD.seller.push && GUARD.seller.push("/vender/decisiones");

/* comprador: bloque arriba de "Mis pujas" */
patchRoute(/^\/cuenta\/pujas$/, () => {
  const items = decItems("buyer"); if (!items.length) return;
  const body = $(".acctbody .admin-head"); if (!body) return;
  body.insertAdjacentHTML("afterend", `<div class="panel decpanel"><h3 style="margin:0 0 12px">${ic("gavel", "sm")} Resultado de tus subastas</h3>${decList("buyer")}</div>`);
  bindDecisions("buyer", $(".decpanel"));
});

/* admin: decisiones y solicitudes */
if (!ADMIN_TABS.some(t => t[0] === "decisiones")) ADMIN_TABS.splice(2, 0, ["decisiones", "Decisiones", "scale"], ["solicitudes", "Solicitudes", "umbrella"]);
async function adSolicitudes(b) {
  b.innerHTML = `<div class="panel empty">${ic("clock", "lg")}<b>Cargando…</b></div>`;
  let leads = [], wl = [];
  if (typeof LIVE !== "undefined" && LIVE) {
    const [{ data: l, error: e1 }, { data: w }] = await Promise.all([
      sb.from("insurance_leads").select("*").order("created_at", { ascending: false }).limit(200),
      sb.from("waitlist").select("email, topic, lang, created_at").order("created_at", { ascending: false }).limit(500),
    ]);
    if (e1) { b.innerHTML = `<div class="panel empty">${ic("alert", "lg")}<b>No se pudieron cargar las solicitudes</b><span>${esc(e1.message)}</span></div>`; return; }
    leads = l || []; wl = w || [];
  } else { leads = store.get("seguros", []); wl = store.get("waitlist", []).map(e => ({ email: e, topic: "subastas" })); }
  const kindTxt = Object.fromEntries(SG_KINDS.map(k => [k[0], k[2]]));
  b.innerHTML = `<div class="kpis">
      <div class="kpi"><small>${ic("umbrella", "sm")}Solicitudes de seguro</small><b class="tnum">${leads.length}</b><em>${leads.filter(x => x.status === "nuevo").length} nuevas</em></div>
      <div class="kpi"><small>${ic("bell", "sm")}Lista de espera subastas</small><b class="tnum">${wl.length}</b><em>emails para el día de apertura</em></div></div>
    <div class="panel" style="margin-top:14px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px"><h3 style="margin:0">Seguros</h3><button class="btn sm" id="sgCsv">${ic("download", "sm")}Exportar CSV</button></div>
    ${leads.length ? `<div class="tbl-wrap"><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Vehículo</th><th>Contacto</th><th>Origen</th><th>Estado</th></tr></thead><tbody>${leads.map(x => `<tr>
      <td class="mono" style="font-size:12px">${new Date(x.created_at).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
      <td>${kindTxt[x.kind] || x.kind}${x.days ? ` · ${x.days} d` : ""}</td>
      <td>${esc([x.make, x.model, x.year].filter(Boolean).join(" "))}<div class="faint mono" style="font-size:12px">${esc(x.plate || "")}</div></td>
      <td>${esc(x.full_name)}<div class="faint" style="font-size:12px">${esc(x.phone)} · ${esc(x.email)}</div></td>
      <td class="faint" style="font-size:12px">${esc(x.source || "web")}</td>
      <td><span class="chip ${x.status === "nuevo" ? "acc" : ""}">${esc(x.status || "nuevo")}</span></td></tr>`).join("")}</tbody></table></div>`
      : `<p class="muted" style="margin:0">Aún no hay solicitudes.</p>`}</div>`;
  $("#sgCsv").onclick = () => {
    const cols = ["created_at", "kind", "days", "plate", "make", "model", "year", "use_type", "start_date", "birth_year", "license_years", "postal_code", "full_name", "phone", "email", "notes", "source", "lang", "status"];
    const q = v => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
    const csv = [cols.join(";")].concat(leads.map(x => cols.map(c => q(x[c])).join(";"))).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = "solicitudes-seguro-" + cvToday() + ".csv"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
}
(function hookAdmin() {
  const base = adRender;
  adRender = function () {
    const b = $("#adBody"); if (!b) return;
    if (AD.tab === "decisiones") { b.innerHTML = `<p class="muted" style="margin:0 0 12px">Subastas cerradas con pujas. El vendedor tiene 24 h; tú puedes decidir en su lugar o corregir el precio acordado.</p>${decList("admin")}`; bindDecisions("admin", b); return; }
    if (AD.tab === "solicitudes") return adSolicitudes(b);
    return base();
  };
})();
