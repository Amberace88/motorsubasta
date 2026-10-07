/* ============================================================
   v16 — captación gratuita
   1. Herramientas: calculadora ITP + coste de transferencia, comprobador de VIN
   2. Landings SEO (archivos estáticos aparte) + enlaces ?city= ?type= al Mercado
   3. "Te compramos tu coche en 24 h"  → tabla car_leads
   4. Exportadores (PL / UA)           → #/exportar
   5. Importación CSV para profesionales → #/vender/importar
   6. Compartir anuncio + imagen para Instagram / TikTok
   7. Lista de espera con ventaja de lanzamiento
   (todo en funciones: la primera pintura ocurre antes de que esta capa se ejecute)
   ============================================================ */

function live() { return typeof LIVE !== "undefined" && LIVE && typeof sb !== "undefined" && sb; }
function pimg(n) { return /^(https?:|data:)/.test(String(n || "")) ? n : imgSrc(n || "opel-astra"); }

/* ---------- 1a. ITP ---------- */
function itpRegions() {
  /* tipos orientativos 2026 para turismos usados entre particulares (cuota de ITP, modelo 620 o equivalente) */
  return [
    ["andalucia", "Andalucía", 4, { hp: 8, ev: 1 }], ["aragon", "Aragón", 4, {}], ["asturias", "Asturias", 4, { hp: 8 }],
    ["baleares", "Illes Balears", 4, { hp: 8, ev: 0 }], ["canarias", "Canarias", 5.5, {}], ["cantabria", "Cantabria", 6, {}],
    ["clm", "Castilla-La Mancha", 6, {}], ["cyl", "Castilla y León", 5, { hp: 8 }], ["cataluna", "Cataluña", 5, { old10: 40000 }],
    ["valencia", "Comunitat Valenciana", 6, {}], ["extremadura", "Extremadura", 6, {}], ["galicia", "Galicia", 3, { ev: 0, old15: true }],
    ["madrid", "Comunidad de Madrid", 4, {}], ["murcia", "Región de Murcia", 4, {}], ["navarra", "Navarra", 6, {}],
    ["paisvasco", "País Vasco", 4, {}], ["rioja", "La Rioja", 4, {}], ["ceuta", "Ceuta", 2, {}], ["melilla", "Melilla", 2, {}],
  ];
}
function itpCoef(age) { const t = [100, 84, 67, 56, 47, 39, 34, 28, 24, 19, 17, 13, 10]; return t[Math.max(0, Math.min(12, age))] / 100; }
function itpState() { return window.__itp || (window.__itp = { reg: "valencia", seller: "particular", year: new Date().getFullYear() - 8, newValue: "", price: 6000, hp: false, ev: false, moped: false, gestoria: true }); }
function itpCalc() {
  const s = itpState(), r = itpRegions().find(x => x[0] === s.reg) || itpRegions()[0], rule = r[3];
  const age = Math.max(0, new Date().getFullYear() - (+s.year || new Date().getFullYear()));
  const fiscal = s.newValue ? Math.round(+s.newValue * itpCoef(age)) : 0;
  const base = Math.max(+s.price || 0, fiscal);
  let rate = r[2], note = "";
  if (s.ev && rule.ev != null) { rate = rule.ev; note = "Tipo reducido para vehículos de cero emisiones."; }
  else if (s.hp && rule.hp) { rate = rule.hp; note = "Tipo incrementado para turismos de más de 15 CV fiscales."; }
  if (rule.old10 && age > 10 && base < rule.old10) { rate = 0; note = "Exento: más de 10 años y valor inferior a 40.000 €."; }
  if (rule.old15 && age > 15) note = "En Galicia los vehículos de más de 15 años tributan con cuota fija reducida: consulta el importe exacto.";
  const pro = s.seller === "profesional";
  const itp = pro ? 0 : Math.round(base * rate) / 100;
  const tasa = s.moped ? 27.85 : 55.70, gest = s.gestoria ? 149 * 1.21 : 0;
  return { r, age, fiscal, base, rate, itp, tasa, gest, total: itp + tasa + gest, note, pro };
}
const eur2 = v => "€" + (+v).toLocaleString(window.NUMLOC || "es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function itpOut() {
  const c = itpCalc();
  return `<div class="tl-res">
    <div class="tl-big"><small>${c.pro ? "Compra a profesional" : "Impuesto (ITP) estimado"}</small><b class="tnum">${c.pro ? "0 €" : eur2(c.itp)}</b>
      <span>${c.pro ? "El precio ya incluye el IVA (o REBU): no se paga ITP." : `${String(c.rate).replace(".", ",")}% sobre ${eur(c.base)}${c.fiscal > (+itpState().price || 0) ? " (valor fiscal)" : ""}`}</span></div>
    <div class="kv"><span>Base imponible</span><span class="tnum">${eur(c.base)}</span></div>
    ${c.fiscal ? `<div class="kv"><span>Valor fiscal (${Math.round(itpCoef(c.age) * 100)}% por ${c.age} ${c.age === 1 ? "año" : "años"})</span><span class="tnum">${eur(c.fiscal)}</span></div>` : ""}
    <div class="kv"><span>ITP</span><span class="tnum">${eur2(c.itp)}</span></div>
    <div class="kv"><span>Tasa DGT de transferencia</span><span class="tnum">${eur2(c.tasa)}</span></div>
    ${c.gest ? `<div class="kv"><span>Gestoría (149 € + IVA)</span><span class="tnum">${eur2(c.gest)}</span></div>` : ""}
    <div class="kv total"><span>Total del cambio de titular</span><span class="tnum">${eur2(c.total)}</span></div>
    ${c.note ? `<p class="tl-note">${ic("alert", "sm")}${c.note}</p>` : ""}
  </div>`;
}

/* ---------- 1b. VIN ---------- */
function vinWmi() {
  return { WVW: "Volkswagen", WV1: "Volkswagen Comerciales", WV2: "Volkswagen Comerciales", WAU: "Audi", WUA: "Audi Sport", WBA: "BMW", WBS: "BMW M", WBY: "BMW i", WMW: "MINI", WDB: "Mercedes-Benz", WDD: "Mercedes-Benz", W1K: "Mercedes-Benz", W1N: "Mercedes-Benz", WDF: "Mercedes-Benz Vans", W1V: "Mercedes-Benz Vans", WME: "smart",
    WP0: "Porsche", WP1: "Porsche SUV", W0L: "Opel", W0V: "Opel", VXK: "Opel", WF0: "Ford (Alemania)", WF1: "Ford", VF1: "Renault", VF6: "Renault Trucks", UU1: "Dacia", VF3: "Peugeot", VR3: "Peugeot", VF7: "Citroën", VR7: "Citroën", VSS: "SEAT / CUPRA", VS6: "Ford (España)",
    VSK: "Nissan (España)", VNK: "Toyota (Francia)", SB1: "Toyota (Reino Unido)", JTD: "Toyota", JTE: "Toyota", JTN: "Toyota", NMT: "Toyota (Turquía)", JHM: "Honda", SHH: "Honda (Reino Unido)", JN1: "Nissan", SJN: "Nissan (Reino Unido)", JMZ: "Mazda", JS2: "Suzuki", TSM: "Suzuki (Hungría)",
    KMH: "Hyundai", TMA: "Hyundai (Chequia)", NLH: "Hyundai (Turquía)", KNA: "Kia", KNE: "Kia", U5Y: "Kia (Eslovaquia)", TMB: "Škoda", ZFA: "Fiat", ZFF: "Ferrari", ZAR: "Alfa Romeo", ZLA: "Lancia", ZCF: "Iveco", YV1: "Volvo", YV4: "Volvo", SAL: "Land Rover", SAJ: "Jaguar", SCC: "Lotus",
    "5YJ": "Tesla", "7SA": "Tesla", LRW: "Tesla (China)", XTA: "Lada", JMB: "Mitsubishi", JA3: "Mitsubishi", XLR: "DAF", YS2: "Scania", WMA: "MAN", JYA: "Yamaha", JH2: "Honda (moto)", JKA: "Kawasaki", ZDM: "Ducati", WB1: "BMW Motorrad", VBK: "KTM" };
}
function vinRegion(c) {
  if (/[A-C]/.test(c)) return "África"; if (/[J-R]/.test(c)) return "Asia"; if (/[S-Z]/.test(c)) return "Europa"; if (/[1-5]/.test(c)) return "Norteamérica"; if (/[6-7]/.test(c)) return "Oceanía"; if (/[8-9]/.test(c)) return "Sudamérica"; return "—";
}
function vinYears(c) {
  const L = "ABCDEFGHJKLMNPRSTVWXY", i = L.indexOf(c);
  if (i >= 0) return [1980 + i, 2010 + i].filter(y => y <= new Date().getFullYear() + 1);
  if (/[1-9]/.test(c)) return [2000 + +c];
  return [];
}
function vinCheck(v) {
  v = String(v || "").toUpperCase().replace(/[\s-]/g, "");
  if (!v) return null;
  const errs = [];
  if (v.length !== 17) errs.push(`Tiene ${v.length} caracteres; un VIN tiene 17.`);
  if (/[IOQ]/.test(v)) errs.push("Contiene I, O o Q, que no se usan en los VIN.");
  if (/[^A-Z0-9]/.test(v)) errs.push("Solo puede tener letras y números.");
  const W = vinWmi(), make = W[v.slice(0, 3)] || null;
  const tr = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9 };
  const wt = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0; if (v.length === 17) for (let i = 0; i < 17; i++) { const ch = v[i]; sum += (/\d/.test(ch) ? +ch : tr[ch] || 0) * wt[i]; }
  const cd = sum % 11 === 10 ? "X" : String(sum % 11);
  return { v, ok: !errs.length, errs, make, region: vinRegion(v[0]), years: v.length >= 10 ? vinYears(v[9]) : [], check: v.length === 17 ? v[8] === cd : null, serial: v.slice(11) };
}
function vinOut(v) {
  const r = vinCheck(v);
  if (!r) return `<p class="muted tl-hint">${ic("search", "sm")}Escribe los 17 caracteres del bastidor (casilla E del permiso de circulación).</p>`;
  return `<div class="tl-res">
    <div class="tl-big ${r.ok ? "" : "bad"}"><small>${r.ok ? "Formato correcto" : "Revisa el VIN"}</small><b class="mono" translate="no">${esc(r.v)}</b>${r.errs.map(e => `<span>${ic("alert", "sm")}${e}</span>`).join("")}</div>
    <div class="kv"><span>Fabricante</span><b>${r.make ? esc(r.make) : `<span class="faint">No identificado (${esc(r.v.slice(0, 3))})</span>`}</b></div>
    <div class="kv"><span>Región de fabricación</span><b>${r.region}</b></div>
    <div class="kv"><span>Año de modelo (posición 10)</span><b>${r.years.length ? r.years.join(" o ") : "—"}</b></div>
    <div class="kv"><span>Dígito de control (posición 9)</span><b>${r.check == null ? "—" : r.check ? "Correcto" : "No coincide"}</b></div>
    <p class="tl-note">${ic("alert", "sm")}Muchos fabricantes europeos no codifican el año ni usan dígito de control: es normal que no coincida.</p>
    ${r.ok ? `<a class="btn primary block" href="https://vincheckspain.com" target="_blank" rel="noopener">${ic("search", "sm")}Informe completo del vehículo en VIN Check Spain</a>` : ""}
  </div>`;
}

function toolsState() { return window.__tools || (window.__tools = { tab: "itp", vin: "" }); }
function viewTools(q) {
  const t = toolsState(); if (q && q.t) t.tab = q.t;
  const s = itpState(), regs = itpRegions();
  const tabs = [["itp", "euro", "Impuestos y transferencia"], ["vin", "search", "Comprobar VIN"], ["mas", "spark", "Más herramientas"]];
  return `<div class="wrap tlw">
  <header class="tlh" data-rev><div class="eyebrow">${ic("spark", "sm")}Herramientas gratis</div><h1>Calcula antes de comprar o vender</h1>
    <p class="muted">Impuestos, tasas y comprobación del bastidor en segundos. Sin registrarte.</p></header>
  <div class="seg tltabs" id="tlTabs">${tabs.map(([k, i, n]) => `<button class="${t.tab === k ? "on" : ""}" data-v="${k}">${ic(i, "sm")}${n}</button>`).join("")}</div>
  ${t.tab === "itp" ? `<div class="tlgrid" data-rev>
    <form class="panel tlform" onsubmit="return false">
      <h3>${ic("euro")} ¿Cuánto cuesta cambiar el coche de nombre?</h3>
      <div class="fgrid">
        <div class="field"><label for="itReg">Comunidad del comprador</label><select class="in" id="itReg">${regs.map(r => `<option value="${r[0]}" ${s.reg === r[0] ? "selected" : ""}>${r[1]}</option>`).join("")}</select></div>
        <div class="field"><span class="lbl">Vendedor</span><div class="seg" id="itSeller">${[["particular", "Particular"], ["profesional", "Profesional"]].map(([k, n]) => `<button type="button" data-v="${k}" class="${s.seller === k ? "on" : ""}">${n}</button>`).join("")}</div></div>
        <div class="field"><label for="itPrice">Precio de compra (€)</label><input class="in tnum" id="itPrice" type="number" inputmode="numeric" value="${s.price}"></div>
        <div class="field"><label for="itYear">Año de 1.ª matriculación</label><input class="in tnum" id="itYear" type="number" inputmode="numeric" value="${s.year}"></div>
        <div class="field full"><label for="itNew">Valor de tablas de Hacienda (nuevo) <span class="muted">· opcional</span></label><input class="in tnum" id="itNew" type="number" inputmode="numeric" placeholder="Ej.: 21000" value="${s.newValue}"><small class="muted">Hacienda calcula el impuesto sobre el mayor entre el precio y el valor fiscal (valor de tablas × % según antigüedad).</small></div>
      </div>
      <div class="tlchk">
        <label><input type="checkbox" id="itHp" ${s.hp ? "checked" : ""}> <span>Más de 15 CV fiscales</span></label>
        <label><input type="checkbox" id="itEv" ${s.ev ? "checked" : ""}> <span>Eléctrico (cero emisiones)</span></label>
        <label><input type="checkbox" id="itMoped" ${s.moped ? "checked" : ""}> <span>Ciclomotor</span></label>
        <label><input type="checkbox" id="itGest" ${s.gestoria ? "checked" : ""}> <span>Con gestoría</span></label>
      </div>
    </form>
    <aside class="tlside"><div class="panel" id="itOut">${itpOut()}</div>
      <p class="faint tl-disc">Cálculo orientativo con los tipos generales de 2026. Cada comunidad puede tener bonificaciones propias: confirma el importe en el modelo 620 (o el de tu comunidad) antes de pagar. Plazo: 30 días hábiles desde la compra.</p>
      <a class="btn block" href="#/contrato">${ic("doc", "sm")}Hacer el contrato de compraventa gratis</a></aside>
  </div>` : t.tab === "vin" ? `<div class="tlgrid" data-rev>
    <div class="panel tlform"><h3>${ic("search")} Comprobar un número de bastidor</h3>
      <div class="field"><label for="vinIn">VIN / bastidor</label><input class="in mono up" id="vinIn" maxlength="20" autocomplete="off" spellcheck="false" placeholder="VF1RJA00X65123456" value="${esc(t.vin)}"></div>
      <p class="muted" style="font-size:13.5px;margin:0">Detectamos errores de escritura, el fabricante y la región. Para el historial (ITV, kilómetros, cargas, robos) usa el informe completo.</p></div>
    <aside class="tlside"><div class="panel" id="vinOut">${vinOut(t.vin)}</div></aside>
  </div>` : `<div class="tlmore" data-rev>${toolCards().join("")}</div>`}
  </div>`;
}
function toolCards() {
  return [["euro", "Calculadora de ITP", "Impuesto, tasa DGT y gestoría por comunidad.", "#/herramientas?t=itp"],
    ["search", "Comprobar VIN", "Fabricante, año y errores del bastidor.", "#/herramientas?t=vin"],
    ["doc", "Contrato de compraventa", "Rellena, firma en pantalla y descarga el PDF.", "#/contrato"],
    ["bolt", "Te compramos tu coche", "Oferta en firme en 24 h, sin compromiso.", "#/venta-rapida"],
    ["chart", "Valoración gratuita", "Horquilla de precio al instante.", "#/valoracion"],
    ["umbrella", "Seguro por días", "Para llevarte el coche que acabas de comprar.", "#/seguros"]]
    .map(([i, t, d, h]) => `<a class="toolc" href="${h}"><span class="wic">${ic(i)}</span><b>${t}</b><small>${d}</small>${ic("right", "sm")}</a>`);
}
function mountTools() {
  const t = toolsState(), s = itpState();
  $$("#tlTabs button").forEach(b => b.onclick = () => { t.tab = b.dataset.v; location.hash = "#/herramientas?t=" + t.tab; });
  const upd = () => { const o = $("#itOut"); if (o) o.innerHTML = itpOut(); };
  const bind = (id, k, f = v => v) => { const e = $(id); if (e) e.oninput = e.onchange = () => { s[k] = e.type === "checkbox" ? e.checked : f(e.value); upd(); }; };
  bind("#itReg", "reg"); bind("#itPrice", "price"); bind("#itYear", "year"); bind("#itNew", "newValue");
  bind("#itHp", "hp"); bind("#itEv", "ev"); bind("#itMoped", "moped"); bind("#itGest", "gestoria");
  $$("#itSeller button").forEach(b => b.onclick = () => { s.seller = b.dataset.v; $$("#itSeller button").forEach(x => x.classList.toggle("on", x === b)); upd(); });
  const vi = $("#vinIn"); if (vi) vi.oninput = () => { t.vin = vi.value; $("#vinOut").innerHTML = vinOut(t.vin); };
}

/* ---------- 3. Te compramos tu coche ---------- */
function sellFastState() { return window.__sf || (window.__sf = { make: "", model: "", year: "", km: "", condition: "sin_danos", city: "", price: "", name: "", phone: "", email: "", notes: "", done: null }); }
function viewSellFast() {
  const s = sellFastState();
  if (S.user) { s.name = s.name || S.user.name || ""; s.email = s.email || S.user.email || ""; s.phone = s.phone || S.user.phone || ""; }
  if (s.done) return `<div class="wrap cvwrap"><div class="panel sgdone" data-rev><span class="okbig">${ic("check", "lg")}</span><h1>Solicitud recibida</h1>
    <p class="muted">Te llamamos en menos de 24 h laborables al <b translate="no">${esc(s.done.phone)}</b> con una oferta por tu ${esc(s.done.make)}.</p>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px"><a class="btn primary" href="#/publicar?t=mercado">${ic("plus", "sm")}Publicarlo también en el Mercado</a><button class="btn" id="sfAgain">Otro vehículo</button></div></div></div>`;
  const f = (k, l, o = {}) => `<div class="field ${o.full ? "full" : ""}"><label for="sf_${k}">${l}${o.req ? ' <i class="req">*</i>' : ""}</label><input class="in ${o.mono ? "mono" : ""}" id="sf_${k}" data-sf="${k}" value="${esc(s[k])}" ${o.type ? `type="${o.type}"` : ""} ${o.im ? `inputmode="${o.im}"` : ""} ${o.ph ? `placeholder="${esc(o.ph)}"` : ""} ${o.ac ? `autocomplete="${o.ac}"` : ""}></div>`;
  return `<div class="wrap cvwrap">
  <section class="cvhero sfhero" data-rev>
    <div class="eyebrow">${ic("bolt", "sm")}Venta rápida · sin compromiso</div>
    <h1>Te compramos tu coche en 24 h</h1>
    <p class="lead">Con daños, averiado, siniestrado o perfecto. Nos dices qué tienes, te llamamos con una oferta y, si te encaja, lo recogemos y nos ocupamos del papeleo.</p>
    <div class="sfsteps">${[["msg", "Nos cuentas", "2 minutos, sin fotos obligatorias"], ["euro", "Oferta en 24 h", "Por teléfono, sin compromiso"], ["truck", "Recogida y pago", "Transferencia y cambio de titular"]].map(([i, t, d], n) => `<div><span>${n + 1}</span>${ic(i)}<b>${t}</b><small>${d}</small></div>`).join("")}</div>
  </section>
  <div class="cvgrid">
    <form class="cvform" id="sfForm" novalidate onsubmit="return false">
      ${cvSec(1, "sfV", "Tu vehículo", "", `<div class="fgrid">${f("make", "Marca", { req: 1, ph: "Seat" })}${f("model", "Modelo", { ph: "León 1.5 TSI" })}${f("year", "Año", { im: "numeric", ph: "2017" })}${f("km", "Kilómetros", { im: "numeric", ph: "120000" })}
        <div class="field full"><span class="lbl">Estado</span><div class="opt-cards sfcond">${[["sin_danos", "check", "Sin daños"], ["danado", "wrench", "Con daños"], ["averiado", "gear", "Averiado"], ["siniestro", "alert", "Siniestro"]].map(([k, i, t]) => `<button type="button" class="opt ${s.condition === k ? "on" : ""}" data-sfc="${k}"><b>${ic(i, "sm")}${t}</b></button>`).join("")}</div></div>
        ${f("city", "Dónde está", { ph: "Alicante" })}${f("price", "Precio que te gustaría (€)", { im: "numeric", ph: "Opcional" })}</div>`)}
      ${cvSec(2, "sfP", "Cómo te contactamos", "", `<div class="fgrid">${f("name", "Nombre", { req: 1, ac: "name" })}${f("phone", "Teléfono", { req: 1, type: "tel", ac: "tel", ph: "+34 600 000 000" })}${f("email", "Email", { type: "email", ac: "email", full: 1 })}
        <div class="field full"><label for="sf_notes">Algo más <span class="muted">(opcional)</span></label><textarea class="in" id="sf_notes" data-sf="notes" rows="3" placeholder="Por ejemplo: golpe en la puerta trasera, ITV hasta marzo.">${esc(s.notes)}</textarea></div></div>
        <label class="cvchk sgconsent"><input type="checkbox" id="sfOk"><span>Acepto que MotorSubasta use estos datos para hacerme una oferta por mi vehículo (<a class="link" href="#/privacidad">política de privacidad</a>).</span></label>
        <div id="sfErr"></div>
        <button type="button" class="btn primary lg" id="sfGo">${ic("bolt", "sm")}Quiero mi oferta</button>`)}
    </form>
    <aside class="cvside"><div class="panel cvafter"><h4>Por qué vender así</h4><ol>
      <li><b>Sin anuncios ni visitas.</b> No tienes que enseñar el coche a desconocidos.</li>
      <li><b>Cualquier estado.</b> Compramos también siniestros y vehículos que no arrancan.</li>
      <li><b>Papeleo incluido.</b> Contrato, cambio de titular y baja si hace falta.</li>
      <li><b>Tú decides.</b> Si la oferta no te convence, lo publicas gratis en el Mercado.</li></ol></div>
      <a class="toolc" href="#/valoracion"><span class="wic">${ic("chart")}</span><b>¿Solo quieres saber cuánto vale?</b><small>Valoración gratuita al instante</small>${ic("right", "sm")}</a></aside>
  </div></div>`;
}
function mountSellFast() {
  const s = sellFastState();
  const a = $("#sfAgain"); if (a) { a.onclick = () => { Object.assign(s, { make: "", model: "", year: "", km: "", price: "", notes: "", done: null }); router(); }; return; }
  const f = $("#sfForm"); if (!f) return;
  f.addEventListener("input", e => { const k = e.target.dataset.sf; if (k) s[k] = e.target.value; });
  $$("[data-sfc]").forEach(b => b.onclick = () => { s.condition = b.dataset.sfc; $$("[data-sfc]").forEach(x => x.classList.toggle("on", x === b)); });
  $("#sfGo").onclick = async () => {
    const err = m => { $("#sfErr").innerHTML = `<div class="err">${ic("alert", "sm")}${m}</div>`; };
    if (!String(s.make).trim()) return err("Indica la marca del vehículo.");
    if (String(s.name).trim().length < 2) return err("Indica tu nombre.");
    if (String(s.phone).replace(/\D/g, "").length < 9) return err("Revisa el teléfono.");
    if (s.email && !isEmail(s.email)) return err("Revisa el email.");
    if (!$("#sfOk").checked) return err("Necesitamos tu consentimiento para contactarte.");
    const n = (v, a, b) => { const x = parseInt(String(v).replace(/\D/g, ""), 10); return x >= a && x <= b ? x : null; };
    const row = { make: String(s.make).trim().slice(0, 60), model: String(s.model).trim().slice(0, 80) || null, year: n(s.year, 1950, 2100), km: n(s.km, 0, 3000000),
      condition: s.condition, city: String(s.city).trim().slice(0, 80) || null, price_wanted: n(s.price, 0, 10000000), full_name: String(s.name).trim().slice(0, 120),
      phone: String(s.phone).trim().slice(0, 30), email: String(s.email).trim().toLowerCase() || null, notes: String(s.notes || "").slice(0, 1000) || null, lang: window.LANG || "es", source: "web", consent: true };
    const b = $("#sfGo"); b.disabled = true;
    if (live()) { const { error } = await sb.from("car_leads").insert(row); if (error) { b.disabled = false; console.warn(error); return err("No se ha podido enviar. Inténtalo de nuevo en un momento."); } }
    else { const l = store.get("carleads", []); l.unshift({ ...row, created_at: new Date().toISOString(), status: "nuevo" }); store.set("carleads", l.slice(0, 50)); }
    s.done = { phone: row.phone, make: row.make }; router(); scrollTo(0, 0);
  };
}

/* ---------- 4. Exportadores ---------- */
function viewExport() {
  return `<div class="wrap expw">
  <section class="exph" data-rev>
    <div class="eyebrow">${ic("globe", "sm")}Exportación · Polonia, Ucrania y toda Europa</div>
    <h1>Compra vehículos en España y llévatelos a tu país</h1>
    <p class="lead">Coches sin daños, dañados y siniestrados del mercado español, con la documentación preparada para exportar. Atención en español, inglés, polaco y ucraniano.</p>
    <div class="hero-cta"><a class="btn primary lg" href="#/mercado">${ic("store", "sm")}Ver vehículos</a><a class="btn lg" href="#/registro">Crear cuenta gratis</a></div>
    <div class="expflags" aria-hidden="true">${["es", "pl", "uk"].map(l => typeof flag === "function" ? flag(l) : "").join(`<span>${ic("right", "sm")}</span>`)}</div>
  </section>
  <section class="exp4">${[["sun", "Menos óxido", "El clima seco de gran parte de España conserva mejor la carrocería y los bajos."],
      ["car", "Mucha oferta", "Ex-renting, flotas, aseguradoras y particulares: vehículos de todas las gamas y estados."],
      ["doc", "Papeles en regla", "Contrato, factura y baja para exportación tramitados por gestoría."],
      ["truck", "Transporte", "Portavehículos hasta tu país, coordinado con transportistas habituales."]].map(([i, t, d], n) =>
      `<div class="panel" data-rev style="--d:${n * 60}ms"><span class="wic">${ic(i)}</span><h3>${t}</h3><p class="muted">${d}</p></div>`).join("")}</section>
  <section class="expsteps" data-rev><h2>Cómo funciona</h2><ol>
    <li><b>Regístrate y verifica tu empresa o identidad.</b><span>Es gratis. Los profesionales pueden facturar con su NIF/VAT.</span></li>
    <li><b>Compra en el Mercado</b> o, cuando abran, en las subastas.<span>Precio y coste total visibles antes de decidir.</span></li>
    <li><b>Pago por transferencia.</b><span>Con contrato o factura a tu nombre.</span></li>
    <li><b>Documentación para exportar.</b><span>Baja del vehículo en la DGT por traslado a otro país. Fuera de la UE (por ejemplo, Ucrania) también hace falta la declaración de exportación (DUA).</span></li>
    <li><b>Recogida o transporte.</b><span>Lo recoges tú o te enviamos presupuesto de transporte hasta destino.</span></li></ol></section>
  <section class="expdocs" data-rev>
    <div class="panel"><h3>${ic("doc")} Documentos que recibes</h3><ul class="checks">${["Permiso de circulación", "Tarjeta de inspección técnica (ficha técnica)", "Contrato de compraventa o factura", "Justificante de baja para exportación", "DUA de exportación (destinos fuera de la UE)"].map(t => `<li>${ic("check", "sm")}${t}</li>`).join("")}</ul></div>
    <div class="panel"><h3>${ic("msg")} Hablamos tu idioma</h3><p class="muted">Toda la web está en polaco y ucraniano. Cambia el idioma arriba a la derecha o escríbenos y te atendemos.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn" href="?lang=pl#/exportar">${typeof flag === "function" ? flag("pl") : ""}Polski</a><a class="btn" href="?lang=uk#/exportar">${typeof flag === "function" ? flag("uk") : ""}Українська</a><a class="btn primary" href="#/contacto">${ic("msg", "sm")}Contactar</a></div></div>
  </section>
  <p class="faint" style="font-size:12.5px;margin:18px 0 0">La documentación y los impuestos dependen del país de destino; te orientamos en cada caso antes de la compra.</p>
  </div>`;
}

/* ---------- 5. Importación CSV ---------- */
function csvCols() { return ["vin", "matricula", "marca", "modelo", "año", "km", "combustible", "cambio", "precio", "negociable", "ciudad", "provincia", "estado", "tipo", "potencia_cv", "carroceria", "plazas", "descripcion", "fotos"]; }
function csvParse(txt) {
  txt = String(txt || "").replace(/^﻿/, "");
  const first = txt.split(/\r?\n/)[0] || "", d = (first.match(/;/g) || []).length >= (first.match(/,/g) || []).length ? ";" : ",";
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (q) { if (c === '"') { if (txt[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === d) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && txt[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const clean = rows.filter(r => r.some(x => String(x).trim()));
  if (!clean.length) return [];
  const norm = h => String(h).trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const alias = { marca: "marca", make: "marca", modelo: "modelo", model: "modelo", ano: "año", year: "año", anio: "año", km: "km", kilometros: "km", combustible: "combustible", fuel: "combustible",
    cambio: "cambio", transmision: "cambio", precio: "precio", price: "precio", negociable: "negociable", ciudad: "ciudad", city: "ciudad", provincia: "provincia", estado: "estado", tipo: "tipo",
    potencia_cv: "potencia_cv", potencia: "potencia_cv", cv: "potencia_cv", carroceria: "carroceria", plazas: "plazas", descripcion: "descripcion", description: "descripcion", fotos: "fotos", photos: "fotos", imagenes: "fotos", vin: "vin", bastidor: "vin", numero_de_bastidor: "vin", matricula: "matricula", plate: "matricula", placa: "matricula" };
  const head = clean[0].map(h => alias[norm(h)] || norm(h));
  return clean.slice(1).map(r => Object.fromEntries(head.map((h, i) => [h, String(r[i] == null ? "" : r[i]).trim()])));
}
function csvRow(o) {
  const n = v => { const x = parseInt(String(v || "").replace(/[^\d]/g, ""), 10); return isNaN(x) ? null : x; };
  const est = String(o.estado || "").toLowerCase();
  const cat = /sinies|desgu|pieza/.test(est) ? "siniestro" : /da[nñ]|golpe|averi/.test(est) ? "danado" : "limpio";
  const tipo = String(o.tipo || "").toLowerCase();
  const type = /moto/.test(tipo) ? "Motocicletas" : /cami|pesad|tract/.test(tipo) ? "Transporte pesado" : /barco|nau|moto de agua/.test(tipo) ? "Náutica" : "Vehículos ligeros";
  const vin = String(o.vin || "").toUpperCase().replace(/\s/g, ""), plate = String(o.matricula || "").toUpperCase().replace(/[\s-]/g, "");
  const r = { vin, plate, noPlate: /^(sin|no|-)$/i.test(String(o.matricula || "").trim()), make: o.marca, model: o.modelo, year: n(o["año"]), km: n(o.km) || 0, fuel: o.combustible || null, transmission: o.cambio || null, price: n(o.precio),
    neg: !/^(no|n|0|false)$/i.test(String(o.negociable || "si")), city: o.ciudad || null, province: o.provincia || o.ciudad || null, category: cat, type,
    power_cv: n(o.potencia_cv), body_type: o.carroceria || null, seats: n(o.plazas), description: o.descripcion || null,
    photos: String(o.fotos || "").split(/[|\s]+/).filter(u => /^https:\/\//.test(u)).slice(0, 20) };
  const errs = [];
  if (vin.length < 8 || vin.length > 17 || /[IOQ]/.test(vin)) errs.push("VIN");
  if (!r.noPlate && !plateOk(plate)) errs.push("matrícula");
  if (!r.make) errs.push("marca"); if (!r.model) errs.push("modelo");
  if (!r.year || r.year < 1950 || r.year > new Date().getFullYear() + 1) errs.push("año");
  if (!r.price) errs.push("precio");
  return { r, errs };
}
function csvTemplate() {
  const rows = [csvCols(), ["VSSZZZKJZKR012345", "1234 KLM", "Seat", "León 1.5 TSI FR", "2019", "86000", "Gasolina", "Manual", "14900", "sí", "Alicante", "Alicante", "sin daños", "turismo", "150", "Compacto", "5", "Un propietario, libro de revisiones.", "https://tuweb.com/fotos/leon-1.jpg|https://tuweb.com/fotos/leon-2.jpg"],
    ["VF1KW0BB556123456", "5678 FGH", "Renault", "Kangoo dCi 90", "2016", "142000", "Diésel", "Manual", "6900", "no", "Elche", "Alicante", "dañado", "furgoneta", "90", "Furgoneta", "2", "Golpe en puerta lateral.", ""]];
  return "﻿" + rows.map(r => r.map(c => /[;"\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c).join(";")).join("\n");
}
function importState() { return window.__imp || (window.__imp = { rows: [], done: 0, busy: false }); }
function viewImport() {
  const s = importState(), ok = s.rows.filter(x => !x.errs.length);
  return sellShell("#/vender/importar", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Vendedor</div><h1 style="margin-top:8px">Importar anuncios</h1>
      <p class="muted" style="margin:6px 0 0">Sube tu stock en un CSV (exportado de tu web, DMS o de otros portales) y publícalo en el Mercado gratis.</p></div>
      <button class="btn" id="impTpl">${ic("download", "sm")}Plantilla CSV</button></div>
    <label class="drop impdrop" id="impDrop">${ic("upload", "lg")}<b>Arrastra aquí tu archivo CSV</b><span style="font-size:13px">o haz clic para elegirlo · separador ; o , · primera fila con los nombres de columna</span><input type="file" id="impFile" accept=".csv,text/csv" hidden></label>
    <details class="impcols"><summary>${ic("doc", "sm")}Columnas que reconocemos</summary><p class="muted" translate="no"><code>${csvCols().join("</code> <code>")}</code></p><p class="muted" style="font-size:13px">Obligatorias: vin, matricula (o «sin»), marca, modelo, año y precio. En <code>fotos</code>, enlaces https separados por <code>|</code>. Estado: «sin daños», «dañado» o «siniestro».</p></details>
    ${s.rows.length ? `<div class="panel" style="margin-top:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px"><h3 style="margin:0">${s.rows.length} filas · <span style="color:var(--ok)">${ok.length} listas</span>${s.rows.length - ok.length ? ` · <span style="color:var(--warn)">${s.rows.length - ok.length} con errores</span>` : ""}</h3>
        <div style="display:flex;gap:8px"><button class="btn sm ghost" id="impClear">Vaciar</button><button class="btn sm primary" id="impGo" ${!ok.length || s.busy ? "disabled" : ""}>${ic("upload", "sm")}Publicar ${ok.length} en el Mercado</button></div></div>
      ${s.busy ? `<div class="impprog"><i style="width:${Math.round(s.done / Math.max(1, ok.length) * 100)}%"></i></div>` : ""}
      <div class="tbl-wrap"><table><thead><tr><th></th><th>Vehículo</th><th>Año</th><th>Km</th><th>Estado</th><th>Ciudad</th><th class="r">Precio</th></tr></thead><tbody>
      ${s.rows.map(x => `<tr class="${x.errs.length ? "imperr" : ""}"><td>${x.errs.length ? `<span class="chip warn" title="Falta: ${x.errs.join(", ")}">${ic("alert", "sm")}${x.errs.join(", ")}</span>` : x.st === "ok" ? `<span class="chip ok">${ic("check", "sm")}Publicado</span>` : x.st === "err" ? `<span class="chip bad">${x.why ? "Ya publicado" : "Error"}</span>` : `<span class="chip">Listo</span>`}</td>
        <td><b>${esc((x.r.make || "") + " " + (x.r.model || ""))}</b><div class="faint" style="font-size:12px">${mkTypeShort(x.r.type)} · ${x.r.photos.length} fotos</div></td><td class="tnum">${x.r.year || "—"}</td><td class="tnum">${x.r.km ? num(x.r.km) : "—"}</td><td>${CATS[x.r.category] ? CATS[x.r.category].short : x.r.category}</td><td>${esc(x.r.city || "—")}</td><td class="r tnum">${x.r.price ? eur(x.r.price) : "—"}</td></tr>`).join("")}
      </tbody></table></div></div>` : ""}`);
}
function mountImport() {
  const s = importState();
  $("#impTpl").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csvTemplate()], { type: "text/csv;charset=utf-8" })); a.download = "motorsubasta-plantilla.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
  const load = file => { if (!file) return; if (file.size > 3e6) { toast("Archivo demasiado grande (máx. 3 MB)", "alert"); return; } const fr = new FileReader(); fr.onload = () => { s.rows = csvParse(fr.result).slice(0, 500).map(o => ({ ...csvRow(o), st: "" })); if (!s.rows.length) toast("No hemos encontrado filas en el archivo", "alert"); router(); }; fr.readAsText(file, "utf-8"); };
  $("#impFile").onchange = e => load(e.target.files[0]);
  const dz = $("#impDrop");
  dz.addEventListener("dragover", e => { e.preventDefault(); dz.classList.add("over"); });
  dz.addEventListener("dragleave", () => dz.classList.remove("over"));
  dz.addEventListener("drop", e => { e.preventDefault(); dz.classList.remove("over"); load(e.dataTransfer.files[0]); });
  if ($("#impClear")) $("#impClear").onclick = () => { s.rows = []; router(); };
  if ($("#impGo")) $("#impGo").onclick = async () => {
    const todo = s.rows.filter(x => !x.errs.length && x.st !== "ok"); if (!todo.length) return;
    s.busy = true; s.done = 0; router();
    for (const x of todo) {
      const r = x.r;
      if (live()) {
        const { data: v, error } = await sb.from("vehicles").insert({ seller_id: S.user.id, vin: r.vin, plate: r.noPlate ? null : r.plate, make: r.make, model: r.model, year: r.year, km: r.km, fuel: r.fuel, transmission: r.transmission,
          category: r.category, city: r.city, province: r.province, power_cv: r.power_cv, body_type: r.body_type, seats: r.seats, description: r.description, photos: r.photos, status: "mercado" }).select("id, status").single();
        if (error) { x.st = "err"; x.why = /YA_PUBLICADO/.test(error.message) ? "ya publicado" : ""; if (/verif|policy|row-level/i.test(error.message)) { toast("Verifica tu cuenta de vendedor para publicar", "alert"); break; } }
        else { const { error: e2 } = await sb.from("listings").insert({ vehicle_id: v.id, price: r.price, negotiable: r.neg, listing_type: r.type, status: "activo" }); x.st = e2 ? "err" : "ok"; }
      } else {
        if ((S.myVehicles || []).some(v => v.vin && v.vin === r.vin) || market.some(m => m.vin && m.vin === r.vin)) { x.st = "err"; x.why = "dup"; s.done++; continue; }
        (S.myVehicles || (S.myVehicles = [])).unshift({ id: "V-" + Date.now().toString(36) + s.done, img: r.photos[0] || "opel-astra", title: `${r.year} ${r.make} ${r.model}`, km: r.km, cat: r.category, st: "aprobado", price: r.price, bids: 0, views: 0, date: new Date().toLocaleDateString("es-ES"), channel: "mercado", vin: r.vin, plate: r.plate, lst: "activo" });
        market.unshift({ vin: r.vin, id: "I" + Date.now().toString(36) + s.done, img: r.photos[0] || "opel-astra", photos: r.photos.length ? r.photos : ["opel-astra"], title: r.make + " " + r.model, year: r.year, km: r.km, fuel: r.fuel || "—", trans: r.transmission || "—", city: r.city || "—", cat: r.category, type: r.type, price: r.price, neg: r.neg, seller: S.user.company || S.user.name, sellerType: "Profesional", days: 0, cv: r.power_cv, body: r.body_type, seats: r.seats, desc: r.description });
        x.st = "ok";
      }
      s.done++; const p = $(".impprog i"); if (p) p.style.width = Math.round(s.done / todo.length * 100) + "%";
    }
    s.busy = false;
    if (live()) await sbLoadMarket();
    const n = s.rows.filter(x => x.st === "ok").length;
    toast(`${n} ${n === 1 ? "anuncio publicado" : "anuncios publicados"} en el Mercado`, "check"); router();
  };
}

/* ---------- 6. Compartir anuncio ---------- */
function shareListing(m) {
  const url = location.origin + location.pathname + "#/mercado/" + m.id;
  const txt = `${m.title} · ${eur(m.price)} · ${mkSpec(m)}`;
  const e = encodeURIComponent;
  const nets = [["WhatsApp", `https://wa.me/?text=${e(txt + " " + url)}`, "#25D366"], ["Telegram", `https://t.me/share/url?url=${e(url)}&text=${e(txt)}`, "#2AABEE"],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`, "#1877F2"], ["X", `https://twitter.com/intent/tweet?text=${e(txt)}&url=${e(url)}`, "#111"]];
  modal("Compartir anuncio", `<div class="shnets">${nets.map(([n, h, c]) => `<a class="shnet" href="${h}" target="_blank" rel="noopener" style="--c:${c}"><span>${n[0]}</span>${n}</a>`).join("")}</div>
    <div class="shlink"><input class="in mono" id="shUrl" readonly value="${esc(url)}"><button class="btn" id="shCopy">${ic("doc", "sm")}Copiar</button></div>
    <div class="shimg"><canvas id="shCv" width="1080" height="1350" aria-label="Imagen para redes sociales"></canvas>
      <div><b>Imagen para Instagram y TikTok</b><small class="muted">Formato 4:5 con foto, precio y datos. Súbela como publicación o historia.</small><button class="btn primary" id="shDl">${ic("download", "sm")}Descargar imagen</button></div></div>`, close => {
    $("#shCopy").onclick = async () => { try { await navigator.clipboard.writeText(url); } catch (er) { $("#shUrl").select(); document.execCommand && document.execCommand("copy"); } toast("Enlace copiado", "check"); };
    const cv = $("#shCv"); drawShareCard(cv, m);
    $("#shDl").onclick = () => { try { cv.toBlob(b => { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = (m.title || "anuncio").replace(/[^\w]+/g, "-").toLowerCase() + "-motorsubasta.png"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000); }, "image/png"); } catch (er) { toast("No se ha podido generar la imagen", "alert"); } };
  });
}
function drawShareCard(cv, m) {
  const x = cv.getContext("2d"), W = 1080, H = 1350, font = getComputedStyle(document.body).fontFamily || "sans-serif";
  const paint = img => {
    x.fillStyle = "#0b0a0a"; x.fillRect(0, 0, W, H);
    if (img) { const r = Math.max(W / img.width, 820 / img.height), w = img.width * r, h = img.height * r; x.drawImage(img, (W - w) / 2, (820 - h) / 2, w, h); }
    const g = x.createLinearGradient(0, 520, 0, 860); g.addColorStop(0, "rgba(11,10,10,0)"); g.addColorStop(1, "rgba(11,10,10,1)"); x.fillStyle = g; x.fillRect(0, 520, W, 340);
    x.fillStyle = "#e27122"; x.beginPath(); x.roundRect ? x.roundRect(60, 60, 290, 64, 32) : x.rect(60, 60, 290, 64); x.fill();
    x.fillStyle = "#fff"; x.font = `800 30px ${font}`; x.textBaseline = "middle"; x.fillText("MOTORSUBASTA", 84, 93);
    x.textBaseline = "alphabetic"; x.fillStyle = "#fff"; x.font = `800 74px ${font}`;
    const words = String(m.title).split(" "); let line = "", y = 930; const lines = [];
    words.forEach(w => { const t = line ? line + " " + w : w; if (x.measureText(t).width > W - 120) { lines.push(line); line = w; } else line = t; }); lines.push(line);
    lines.slice(0, 2).forEach((l, i) => x.fillText(l, 60, y + i * 84)); y += Math.min(2, lines.length) * 84;
    x.fillStyle = "#b8b1aa"; x.font = `500 38px ${font}`; x.fillText(mkSpec(m), 60, y + 10);
    x.fillStyle = "#e27122"; x.font = `800 120px ${font}`; x.fillText(eur(m.price), 60, y + 160);
    x.fillStyle = "#8f8984"; x.font = `600 34px ${font}`; x.fillText((m.neg ? "Precio negociable" : "Precio fijo") + " · " + m.city, 60, y + 220);
    x.fillStyle = "#242121"; x.fillRect(60, H - 110, W - 120, 2);
    x.fillStyle = "#fff"; x.font = `700 34px ${font}`; x.fillText("Mercado gratis de vehículos", 60, H - 52);
    x.fillStyle = "#e27122"; x.textAlign = "right"; x.fillText(location.host, W - 60, H - 52); x.textAlign = "left";
  };
  paint(null);
  const img = new Image(); if (/^https?:/.test(pimg(m.img))) img.crossOrigin = "anonymous";
  img.onload = () => paint(img); img.src = pimg(m.img);
}

/* ---------- 7. Lista de espera con ventaja ---------- */
function waitBonus() { return `<div class="wbonus">${ic("spark", "sm")}<span><b>Ventaja de lanzamiento:</b> los 500 primeros de la lista tendrán 3 meses de plan Pro gratis cuando abran las subastas.</span></div>`; }

/* ---------- alertas de búsqueda reales ---------- */
async function saveSearchAlert(label, filters) {
  const email = (S.user && S.user.email) || store.get("waitlistMe", "");
  const go = async mail => {
    if (!isEmail(mail)) return "Introduce un email válido";
    if (live()) { const { error } = await sb.from("search_alerts").insert({ email: mail.trim().toLowerCase(), label: String(label).slice(0, 300), filters, lang: window.LANG || "es" }); if (error) return "No se ha podido guardar. Inténtalo de nuevo."; }
    else { const l = store.get("mksaved", []); l.unshift({ email: mail, label, filters, at: Date.now() }); store.set("mksaved", l.slice(0, 20)); }
    store.set("waitlistMe", mail.trim().toLowerCase()); return null;
  };
  modal("Guardar búsqueda", `<p class="muted" style="margin:0">Te escribiremos cuando se publique un vehículo que encaje con: <b style="color:var(--text)">${esc(label)}</b></p>
    <div class="field"><label for="saMail">Tu email</label><input class="in" id="saMail" type="email" autocomplete="email" value="${esc(email)}" placeholder="tu@email.com"></div><div id="saErr"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="saNo">Cancelar</button><button class="btn primary" id="saGo">${ic("bell", "sm")}Guardar y avisarme</button></div>`, close => {
    $("#saNo").onclick = close;
    $("#saGo").onclick = async () => { const e = await go($("#saMail").value); if (e) { $("#saErr").innerHTML = `<div class="err">${ic("alert", "sm")}${e}</div>`; return; } close(); toast("Búsqueda guardada. Te avisaremos por email.", "bell"); };
  });
}

/* ---------- rutas y enganches ---------- */
function mkApplyQ(q) {
  if (!q || !(q.city || q.type || q.cat || q.q || q.prov)) return;
  const s = mkS(); mkClear();
  const T = { turismos: "Vehículos ligeros", ligeros: "Vehículos ligeros", motos: "Motocicletas", pesados: "Transporte pesado", nautica: "Náutica" };
  if (q.type) s.type = T[q.type] || q.type;
  if (q.cat && CATS[q.cat]) s.cat = q.cat;
  if (q.city) { const c = mkAll().map(m => m.city).find(c => c && c.toLowerCase() === String(q.city).toLowerCase()); if (c) s.city = c; else s.q = q.city; }
  if (q.q) s.q = q.q;
}
(function growthRoutes() {
  ROUTES.unshift([/^\/mercado$/, q => { mkApplyQ(q); return [viewMarket(), mountMarket]; }]);
  ROUTES.unshift([/^\/herramientas$/, q => [viewTools(q), mountTools]]);
  ROUTES.unshift([/^\/venta-rapida$/, () => [viewSellFast(), mountSellFast]]);
  ROUTES.unshift([/^\/exportar$/, () => [viewExport(), null]]);
  ROUTES.unshift([/^\/vender\/importar$/, () => [viewImport(), () => { mountImport(); if (typeof mountAcct === "function") try { mountAcct(); } catch (e) {} }]]);
})();

/* portada: herramientas gratis */
function toolsStrip() {
  return `<section class="blk tstrip" style="padding-top:0"><div class="wrap">
    <div class="sec-head" data-rev><div><div class="eyebrow">${ic("spark", "sm")}Herramientas gratis</div><h2 style="margin-top:10px">Todo lo que necesitas para comprar o vender</h2></div><a class="link" href="#/herramientas?t=mas">Ver todas ${ic("right", "sm")}</a></div>
    <div class="tlmore" data-rev>${toolCards().slice(0, 4).join("")}</div>
  </div></section>`;
}

/* admin: todas las solicitudes (seguros, compra en 24 h, búsquedas, lista de espera) */
async function adSolicitudes(b) {
  b.innerHTML = `<div class="panel empty">${ic("clock", "lg")}<b>Cargando…</b></div>`;
  let leads = [], wl = [], cars = [], alerts = [];
  if (live()) {
    const [a, w, c, s] = await Promise.all([
      sb.from("insurance_leads").select("*").order("created_at", { ascending: false }).limit(300),
      sb.from("waitlist").select("email, topic, lang, created_at").order("created_at", { ascending: false }).limit(1000),
      sb.from("car_leads").select("*").order("created_at", { ascending: false }).limit(300),
      sb.from("search_alerts").select("*").order("created_at", { ascending: false }).limit(500)]);
    if (a.error) { b.innerHTML = `<div class="panel empty">${ic("alert", "lg")}<b>No se pudieron cargar las solicitudes</b><span>${esc(a.error.message)}</span></div>`; return; }
    leads = a.data || []; wl = w.data || []; cars = c.data || []; alerts = s.data || [];
  } else { leads = store.get("seguros", []); wl = store.get("waitlist", []).map(e => ({ email: e, topic: "subastas" })); cars = store.get("carleads", []); alerts = store.get("mksaved", []).map(x => ({ email: x.email || "—", label: x.label || x.t, created_at: new Date(x.at).toISOString() })); }
  const kindTxt = Object.fromEntries(SG_KINDS.map(k => [k[0], k[2]]));
  const condTxt = { sin_danos: "Sin daños", danado: "Con daños", averiado: "Averiado", siniestro: "Siniestro" };
  const dt = d => d ? new Date(d).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";
  const csv = (rows, cols, name) => { const q = v => `"${String(v == null ? "" : typeof v === "object" ? JSON.stringify(v) : v).replace(/"/g, '""')}"`; const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + [cols.join(";")].concat(rows.map(x => cols.map(c => q(x[c])).join(";"))).join("\n")], { type: "text/csv;charset=utf-8" })); a.download = name + "-" + cvToday() + ".csv"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
  const sec = (id, title, icn, rows, head, row) => `<div class="panel" style="margin-top:14px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px"><h3 style="margin:0">${ic(icn, "sm")} ${title} <span class="chip">${rows.length}</span></h3>${rows.length ? `<button class="btn sm" data-csv="${id}">${ic("download", "sm")}CSV</button>` : ""}</div>
    ${rows.length ? `<div class="tbl-wrap"><table><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(row).join("")}</tbody></table></div>` : `<p class="muted" style="margin:0">Aún no hay registros.</p>`}</div>`;
  b.innerHTML = `<div class="kpis">
      <div class="kpi"><small>${ic("bolt", "sm")}Te compramos tu coche</small><b class="tnum">${cars.length}</b><em>${cars.filter(x => (x.status || "nuevo") === "nuevo").length} nuevas</em></div>
      <div class="kpi"><small>${ic("umbrella", "sm")}Solicitudes de seguro</small><b class="tnum">${leads.length}</b><em>${leads.filter(x => x.status === "nuevo").length} nuevas</em></div>
      <div class="kpi"><small>${ic("search", "sm")}Búsquedas guardadas</small><b class="tnum">${alerts.length}</b><em>avisos por email</em></div>
      <div class="kpi"><small>${ic("bell", "sm")}Lista de espera subastas</small><b class="tnum">${wl.length}</b><em>emails para el día de apertura</em></div></div>
    ${sec("cars", "Te compramos tu coche", "bolt", cars, ["Fecha", "Vehículo", "Estado", "Precio pedido", "Contacto", "Ciudad"], x => `<tr><td class="mono" style="font-size:12px">${dt(x.created_at)}</td><td>${esc([x.make, x.model, x.year].filter(Boolean).join(" "))}<div class="faint" style="font-size:12px">${x.km != null ? num(x.km) + " km" : ""}</div></td><td>${condTxt[x.condition] || esc(x.condition || "")}</td><td class="tnum">${x.price_wanted ? eur(x.price_wanted) : "—"}</td><td>${esc(x.full_name)}<div class="faint" style="font-size:12px">${esc(x.phone)}${x.email ? " · " + esc(x.email) : ""}</div></td><td>${esc(x.city || "—")}</td></tr>`)}
    ${sec("ins", "Seguros", "umbrella", leads, ["Fecha", "Tipo", "Vehículo", "Contacto", "Origen", "Estado"], x => `<tr><td class="mono" style="font-size:12px">${dt(x.created_at)}</td><td>${kindTxt[x.kind] || x.kind}${x.days ? ` · ${x.days} d` : ""}</td><td>${esc([x.make, x.model, x.year].filter(Boolean).join(" "))}<div class="faint mono" style="font-size:12px">${esc(x.plate || "")}</div></td><td>${esc(x.full_name)}<div class="faint" style="font-size:12px">${esc(x.phone)} · ${esc(x.email)}</div></td><td class="faint" style="font-size:12px">${esc(x.source || "web")}</td><td><span class="chip ${x.status === "nuevo" ? "acc" : ""}">${esc(x.status || "nuevo")}</span></td></tr>`)}
    ${sec("alerts", "Búsquedas guardadas", "search", alerts, ["Fecha", "Email", "Búsqueda"], x => `<tr><td class="mono" style="font-size:12px">${dt(x.created_at)}</td><td>${esc(x.email)}</td><td>${esc(x.label)}</td></tr>`)}
    ${sec("wl", "Lista de espera de subastas", "bell", wl, ["Fecha", "Email", "Idioma"], x => `<tr><td class="mono" style="font-size:12px">${dt(x.created_at)}</td><td>${esc(x.email)}</td><td>${esc(x.lang || "es")}</td></tr>`)}`;
  const map = { cars: [cars, ["created_at", "make", "model", "year", "km", "condition", "city", "price_wanted", "full_name", "phone", "email", "notes", "lang", "status"], "compra-24h"],
    ins: [leads, ["created_at", "kind", "days", "plate", "make", "model", "year", "use_type", "start_date", "birth_year", "license_years", "postal_code", "full_name", "phone", "email", "notes", "source", "lang", "status"], "solicitudes-seguro"],
    alerts: [alerts, ["created_at", "email", "label", "filters", "lang"], "busquedas"], wl: [wl, ["created_at", "email", "topic", "lang"], "lista-espera"] };
  $$("[data-csv]", b).forEach(x => x.onclick = () => { const [r, c, n] = map[x.dataset.csv]; csv(r, c, n); });
}
