
/* =====================================================================
   p30 — España y Portugal: dos mercados en una sola plataforma
   · cada vehículo tiene país (ES/PT); el Mercado se ve por país o ambos
   · publicar: país, provincia/distrito y matrícula según el país
   · ficha: costes del país del vehículo y "llevarlo a Portugal" (ISV)
   · herramienta: calculadora de ISV para importar de España a Portugal
   · consola: filtro por país y sección "España y Portugal"
   ===================================================================== */

/* ---------- países ---------- */
var ES_PROVINCIAS = ["A Coruña", "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Barcelona", "Bizkaia", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ceuta", "Ciudad Real", "Córdoba", "Cuenca", "Gipuzkoa", "Girona", "Granada", "Guadalajara", "Huelva", "Huesca", "Illes Balears", "Jaén", "La Rioja", "Las Palmas", "León", "Lleida", "Lugo", "Madrid", "Málaga", "Melilla", "Murcia", "Navarra", "Ourense", "Palencia", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Zamora", "Zaragoza"];
var PT_DISTRITOS = ["Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco", "Coimbra", "Évora", "Faro", "Guarda", "Leiria", "Lisboa", "Portalegre", "Porto", "Santarém", "Setúbal", "Viana do Castelo", "Vila Real", "Viseu", "Açores", "Madeira"];
var MKC = {
  ES: { cc: "ES", fl: "es", name: "España", en: "en España", all: "Toda España", reg: "Provincia", regs: ES_PROVINCIAS, tel: "+34", city: "Alicante", plate: "1234 BCD", insp: "ITV" },
  PT: { cc: "PT", fl: "pt", name: "Portugal", en: "en Portugal", all: "Todo Portugal", reg: "Distrito", regs: PT_DISTRITOS, tel: "+351", city: "Lisboa", plate: "AA-00-AA", insp: "IPO" },
};
function ccOf(m) { return (m && (m.ctry || m.country)) === "PT" ? "PT" : "ES"; }
function ccFlag(cc) { return flag(cc === "PT" ? "pt" : "es"); }

/* Portugal queda preparado pero APAGADO hasta lanzar España: se enciende con app_settings.portugal = true */
function ptOn() { return !!(window.APP_SETTINGS && window.APP_SETTINGS.portugal === true); }

/* mercado que está mirando el visitante: ?pais= → elección guardada → país/idioma/zona horaria */
var MK_CC = null;
function mkGuessCC() {
  if (window.__geo === "PT") return "PT";
  if (window.__geo === "ES") return "ES";
  const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || "");
  if (/^(Europe\/Lisbon|Atlantic\/Azores|Atlantic\/Madeira)$/.test(tz)) return "PT";
  return typeof LANG !== "undefined" && LANG === "pt" ? "PT" : "ES";
}
function mkCC() { if (!ptOn()) return "ES"; return MK_CC || (MK_CC = store.get("mkcc", null) || mkGuessCC()); }
function mkSetCC(cc, remember) { MK_CC = ["ES", "PT", "ALL"].includes(cc) ? cc : "ES"; if (remember !== false) store.set("mkcc", MK_CC); }
function mkCCLabel(cc) { return cc === "ALL" ? "en España y Portugal" : MKC[cc].en; }

/* país del visitante (Cloudflare), una vez por sesión */
(function geoInit() {
  try { const g = sessionStorage.getItem("ms_geo"); if (g) { window.__geo = g; return; } } catch (e) {}
  if (!/^https?:/.test(location.protocol) || /^(localhost|127\.)/.test(location.hostname)) return;
  fetch("/api/geo").then(r => r.ok ? r.json() : null).then(d => {
    if (!d || !d.cc) return; window.__geo = d.cc; try { sessionStorage.setItem("ms_geo", d.cc); } catch (e) {}
    if (ptOn() && !store.get("mkcc", null) && !MK_CC_LOCKED) { const was = mkCC(); MK_CC = null; if (mkCC() !== was && /^\/mercado$/.test(route().path)) router(); }
  }).catch(() => {});
})();
var MK_CC_LOCKED = false;

/* ---------- validaciones por país ---------- */
function ptPlateNorm(p) { return String(p || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
function ptPlateOk(p) { p = ptPlateNorm(p); return /^[A-Z]{2}\d{2}[A-Z]{2}$/.test(p) || /^\d{2}[A-Z]{2}\d{2}$/.test(p) || /^\d{4}[A-Z]{2}$/.test(p) || /^[A-Z]{2}\d{4}$/.test(p); }
function ptPlateFmt(p) { p = ptPlateNorm(p); return p.length === 6 ? p.slice(0, 2) + "-" + p.slice(2, 4) + "-" + p.slice(4) : p; }
/* NIF / NIPC portugués: 9 dígitos, dígito de control módulo 11 */
function ptNifOk(n) {
  n = String(n || "").replace(/\D/g, ""); if (!/^[1235689]\d{8}$/.test(n) && !/^(45|70|71|72|74|75|77|79|90|91|98|99)\d{7}$/.test(n)) return false;
  let s = 0; for (let i = 0; i < 8; i++) s += +n[i] * (9 - i);
  const c = 11 - (s % 11); return (c >= 10 ? 0 : c) === +n[8];
}
(function patchPlate() {
  const base = plateOk;
  plateOk = function (p) { return typeof PUB !== "undefined" && PUB.cc === "PT" && route().path === "/publicar" ? ptPlateOk(p) : base(p); };
})();

/* ---------- datos del Mercado ---------- */
(function patchMarketData() {
  const map = mapMarket;
  mapMarket = function (l) { const m = map(l); m.ctry = ((l.vehicles || {}).country === "PT") ? "PT" : "ES"; return m; };
  const all = mkAll;
  mkAll = function () { const cc = mkCC(); return cc === "ALL" ? all() : all().filter(m => ccOf(m) === cc); };
  const tb = trkBase;
  trkBase = function () { const b = tb(); b.mk = mkCC(); if (window.__geo) b.cc = window.__geo; return b; };
  const aq = mkApplyQ;
  mkApplyQ = function (q) { if (q && q.pais) { const p = String(q.pais).toUpperCase(); mkSetCC(p === "AMBOS" ? "ALL" : p); MK_CC_LOCKED = true; } return aq(q); };
})();
function mkCCCounts() { const c = { ES: 0, PT: 0 }; market.forEach(m => { c[ccOf(m)]++; }); c.ALL = c.ES + c.PT; return c; }

/* ---------- Mercado: selector de país ---------- */
function ccSwitch() {
  const cur = mkCC(), n = mkCCCounts();
  const opt = [["ES", ccFlag("ES"), "España"], ["PT", ccFlag("PT"), "Portugal"], ["ALL", ic("globe", "sm"), "Ambos países"]];
  return `<div class="ccsw" role="radiogroup" aria-label="País" id="ccSw" data-cur="${cur}"><span class="ccsw-th" aria-hidden="true"></span>${opt.map(([k, f, t]) =>
    `<button type="button" role="radio" aria-checked="${cur === k}" class="${cur === k ? "on" : ""}" data-cc="${k}">${f}<span>${t}</span><i class="tnum">${n[k]}</i></button>`).join("")}</div>`;
}
function ccThumb(sw) {
  const on = sw && sw.querySelector("button.on"), th = sw && sw.querySelector(".ccsw-th"); if (!on || !th) return;
  th.style.width = on.offsetWidth + "px"; th.style.transform = `translateX(${on.offsetLeft - 4}px)`;
}
function ptLaunchNote() {
  const n = mkCCCounts();
  return `<section class="cclaunch" data-rev>${ccFlag("PT")}<div><b>MotorSubasta llega a Portugal</b><span>Publica gratis en el Mercado portugués. Y si buscas más oferta, ${n.ES ? `hay <b class="tnum">${n.ES}</b> vehículos en España` : "mira también España"}: calcula el ISV y el coste final antes de decidir.</span></div>
    <div class="cclaunch-a"><a class="btn sm primary" href="#/publicar?t=mercado&pais=pt">${ic("plus", "sm")}Publicar gratis</a><a class="btn sm" href="#/herramientas?t=isv">${ic("euro", "sm")}Calcular ISV</a></div></section>`;
}
(function patchMarketView() {
  const v = viewMarket;
  viewMarket = function () {
    if (!ptOn()) return v.apply(this, arguments);
    const cc = mkCC();
    let h = v.apply(this, arguments);
    h = h.replace("<h1>Vehículos en venta</h1>", `<h1>Vehículos en venta <span class="mkh-cc">${mkCCLabel(cc)}</span></h1>`)
      .replace('<div class="mksearch" data-rev>', `${ccSwitch()}<div class="mksearch" data-rev>`);
    if (cc === "PT") h = h.replace('<div class="mkact" id="mkAct"></div>', `${ptLaunchNote()}<div class="mkact" id="mkAct"></div>`);
    if (cc !== "ES") h = h.replace('href="#/publicar?t=mercado"', `href="#/publicar?t=mercado&pais=${cc === "PT" ? "pt" : "es"}"`);
    return h;
  };
  const f = mkFilters;
  mkFilters = function () {
    const cc = mkCC(), s = mkS();
    let h = f.apply(this, arguments);
    if (cc === "ES") return h;
    /* en Portugal se filtra por distrito; en "ambos", por ciudad con su país */
    const all = mkAll();
    if (cc === "PT") {
      const ds = [...new Set(all.map(m => m.prov).filter(x => x && x !== "—"))].sort((a, b) => a.localeCompare(b, "pt"));
      h = h.replace(/<h4>Ubicación<\/h4><select class="in" id="mfCity">[\s\S]*?<\/select>/, `<h4>Distrito</h4><select class="in" id="mfCity"><option value="all">Todo Portugal</option>${ds.map(c => `<option value="${esc(c)}" ${s.city === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>`);
    } else h = h.replace(">Toda España<", ">España y Portugal<");
    return h;
  };
  const filt = mkFiltered;
  mkFiltered = function () {
    const s = mkS();
    if (mkCC() !== "PT" || s.city === "all") return filt.apply(this, arguments);
    const keep = s.city; s.city = "all";
    try { return filt.apply(this, arguments).filter(m => m.prov === keep); } finally { s.city = keep; }
  };
  const card = mkCard;
  mkCard = function (m, i) {
    const h = card.apply(this, arguments);
    if (mkCC() !== "ALL" && ccOf(m) === mkCC()) return h;
    return h.replace(`<div class="mc-loc">${ic("pin", "sm")}`, `<div class="mc-loc">${ccFlag(ccOf(m))}`);
  };
  const row = mkRow;
  mkRow = function (m) {
    const h = row.apply(this, arguments);
    if (mkCC() !== "ALL" && ccOf(m) === mkCC()) return h;
    return h.replace('<span class="mr-loc">', `<span class="mr-loc">${ccFlag(ccOf(m))}`);
  };
  const mount = mountMarket;
  mountMarket = function () {
    mount.apply(this, arguments);
    const sw = $("#ccSw"); if (!sw) return;
    requestAnimationFrame(() => { ccThumb(sw); sw.classList.add("ready"); });
    $$("button", sw).forEach(b => b.onclick = () => {
      if (b.classList.contains("on")) return;
      $$("button", sw).forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); }); ccThumb(sw);
      mkSetCC(b.dataset.cc); MK_CC_LOCKED = true; const s = mkS(); s.city = "all"; s.shown = 24;
      trackEv("other", { props: { a: "market", cc: b.dataset.cc } });
      setTimeout(() => router(), 220);
    });
    addEventListener("resize", () => ccThumb($("#ccSw")), { passive: true });
  };
})();

/* ---------- ficha: costes del país y "llevarlo a Portugal" ---------- */
patchRoute(/^\/mercado\/([\w-]+)$/, (q, mm) => {
  const m = mkById(mm[1]); if (!m) return;
  const cc = ccOf(m), box = $(".pbox-cost");
  const meta = $(".mkd-title p.muted"); if (meta && !meta.querySelector(".flag")) meta.insertAdjacentHTML("afterbegin", ccFlag(cc) + " ");
  if (cc === "PT" && box && !box.dataset.pt) {
    box.dataset.pt = 1; const reg = 55.3;
    box.innerHTML = `<div class="kv"><span>Precio del vehículo</span><span class="tnum">${eur(m.price)}</span></div>
      <div class="kv"><span>Registro de propiedad en Portugal (online)</span><span class="tnum">${eur(reg)}</span></div>
      <div class="kv total"><span>Coste total estimado</span><span class="tnum">${eur(m.price + reg)}</span></div>
      <small class="faint">En Portugal no hay impuesto de transmisión: el comprador paga el registro de propiedad (plazo de 15 días) y el IUC anual. Sin comisiones de MotorSubasta.</small>`;
  }
  const viewerPT = ptOn() && (mkCC() === "PT" || window.__geo === "PT" || (typeof LANG !== "undefined" && LANG === "pt"));
  if (cc === "ES" && viewerPT && !$(".ccimp")) {
    const qs = new URLSearchParams({ t: "isv", p: m.price, y: m.firstReg ? String(m.firstReg).slice(0, 7) : m.year + "-01", f: /di[eé]sel|gas[oó]leo/i.test(m.fuel) ? "d" : /el[eé]ctrico/i.test(m.fuel) ? "ev" : /h[ií]brido/i.test(m.fuel) ? "hev" : "g", c: m.cc || "" });
    const side = $(".mkd-side .pbox"); if (side) side.insertAdjacentHTML("afterend", `<div class="panel ccimp">${ccFlag("PT")}<div><b>¿Te lo llevas a Portugal?</b><span>Calcula el ISV, la legalización y el coste final con matrícula portuguesa.</span></div><a class="btn sm" href="#/herramientas?${qs}">${ic("euro", "sm")}Calcular ISV</a></div>`);
  }
});

/* ---------- publicar: país, provincia o distrito y matrícula ---------- */
(function patchPublish() {
  const v = viewPublish;
  viewPublish = function (query) {
    if (query && query.pais && window.__pubccq !== query.pais) { window.__pubccq = query.pais; PUB.cc = String(query.pais).toUpperCase() === "PT" ? "PT" : "ES"; }
    if (!PUB.cc || !ptOn()) PUB.cc = mkCC() === "PT" ? "PT" : "ES";
    const C = MKC[PUB.cc];
    let h = v.apply(this, arguments);
    if (PUB.step !== 0) return h;
    const regs = C.regs, cur = regs.includes(PUB.prov) ? PUB.prov : "";
    if (!ptOn()) return h.replace(/<div class="field"><label for="pProv">Provincia \*<\/label><select class="in" id="pProv">[\s\S]*?<\/select><\/div>/,
      `<div class="field"><label for="pProv">Provincia *</label><select class="in" id="pProv"><option value="" ${cur ? "" : "selected"} disabled>Elige provincia</option>${regs.map(p => `<option ${cur === p ? "selected" : ""}>${p}</option>`).join("")}</select></div>`);
    h = h.replace(/<div class="field"><label for="pProv">Provincia \*<\/label><select class="in" id="pProv">[\s\S]*?<\/select><\/div>/,
      `<div class="field pubcc"><label>País del vehículo *</label><div class="ccpick" role="radiogroup" aria-label="País del vehículo">${["ES", "PT"].map(k => `<button type="button" role="radio" aria-checked="${PUB.cc === k}" class="${PUB.cc === k ? "on" : ""}" data-pcc="${k}">${ccFlag(k)}<span>${MKC[k].name}</span></button>`).join("")}</div></div>
       <div class="field"><label for="pProv">${C.reg} *</label><select class="in" id="pProv"><option value="" ${cur ? "" : "selected"} disabled>Elige ${C.reg.toLowerCase()}</option>${regs.map(p => `<option ${cur === p ? "selected" : ""}>${p}</option>`).join("")}</select></div>`)
      .replace('placeholder="1234 BCD" maxlength="12"', `placeholder="${C.plate}" maxlength="12"`)
      .replace('id="pCity" placeholder="Alicante"', `id="pCity" placeholder="${C.city}"`);
    if (PUB.cc === "PT") h = h.replace("Sin matrícula (náutica, vehículo nuevo o dado de baja)", "Sin matrícula (náutica, vehículo nuevo o cancelado)");
    return h;
  };
  patchRoute(/^\/publicar$/, () => {
    $$("[data-pcc]").forEach(b => b.onclick = () => {
      if (PUB.cc === b.dataset.pcc) return;
      const keep = { make: $("#pMake") && $("#pMake").value, model: $("#pModel") && $("#pModel").value, year: $("#pYear") && $("#pYear").value, km: $("#pKm") && $("#pKm").value, vin: $("#pVin") && $("#pVin").value, city: $("#pCity") && $("#pCity").value };
      PUB.cc = b.dataset.pcc; PUB.prov = ""; router();
      Object.entries({ pMake: keep.make, pModel: keep.model, pYear: keep.year, pKm: keep.km, pVin: keep.vin }).forEach(([id, val]) => { const e = $("#" + id); if (e && val) e.value = val; });
    });
    const pl = $("#pPlate"); if (pl && PUB.cc === "PT") pl.addEventListener("blur", () => { if (ptPlateOk(pl.value)) pl.value = ptPlateFmt(pl.value); });
  });
  /* aviso propio para Portugal antes que el de España */
  document.addEventListener("click", e => {
    const nx = e.target.closest && e.target.closest("#pNext"); if (!nx || PUB.step !== 0 || PUB.cc !== "PT") return;
    const pl = $("#pPlate"), no = $("#pNoPlate"), prov = $("#pProv");
    if (pl && !(no && no.checked) && !ptPlateOk(pl.value)) { e.stopPropagation(); e.preventDefault(); toast("Matrícula portuguesa no válida: usa el formato AA-00-AA, 00-AA-00, 00-00-AA o AA-00-00", "alert"); pl.focus(); return; }
    if (prov && !prov.value) { e.stopPropagation(); e.preventDefault(); toast("Elige el distrito donde está el vehículo", "alert"); prov.focus(); return; }
    if (pl && ptPlateOk(pl.value)) pl.value = ptPlateFmt(pl.value);
  }, true);
  document.addEventListener("click", e => {
    const nx = e.target.closest && e.target.closest("#pNext"); if (!nx || PUB.step !== 0 || PUB.cc === "PT") return;
    const prov = $("#pProv"); if (prov && !prov.value) { e.stopPropagation(); e.preventDefault(); toast("Elige la provincia donde está el vehículo", "alert"); prov.focus(); }
  }, true);
})();

/* NIF/NIPC portugués en los formularios de empresa: comprobación al salir del campo */
document.addEventListener("focusout", e => {
  const el = e.target; if (!el || !/^(coCif|obCif|stCif)$/.test(el.id)) return;
  const v = el.value.replace(/[\s.-]/g, ""), hint = el.parentElement.querySelector(".nifh") || (() => { const s = document.createElement("small"); s.className = "nifh"; el.parentElement.appendChild(s); return s; })();
  if (/^(PT)?\d{9}$/i.test(v)) { const ok = ptNifOk(v.replace(/^PT/i, "")); hint.className = "nifh " + (ok ? "ok" : "bad"); hint.textContent = ok ? "NIF/NIPC portugués válido" : "El NIF/NIPC portugués no es válido: revisa los 9 dígitos"; }
  else hint.textContent = "";
});

/* ---------- ISV: importar un coche de España a Portugal ---------- */
/* Código do ISV, tabela A (valores 2025, sin cambios en 2026) y reducción por antigüedad (art. 11.º, desde 2025 igual para ambas componentes) */
var ISV = {
  cil: [[1000, 1.09, 849.03], [1250, 1.18, 850.69], [Infinity, 5.61, 6194.88]],
  nedc: { g: [[99, 4.62, 427], [115, 8.09, 750.99], [145, 52.56, 5903.94], [175, 61.24, 7140.17], [195, 155.97, 23627.27], [Infinity, 205.65, 33390.12]],
          d: [[79, 5.78, 439.04], [95, 23.45, 1848.58], [120, 79.22, 7195.63], [140, 175.73, 18924.92], [160, 195.43, 21720.92], [Infinity, 268.42, 33447.9]] },
  wltp: { g: [[110, .44, 43.02], [115, 1.1, 115.8], [120, 1.38, 147.79], [130, 5.27, 619.17], [145, 6.38, 762.73], [175, 41.54, 5819.56], [195, 51.38, 7247.39], [235, 193.01, 34190.52], [Infinity, 233.81, 41910.96]],
          d: [[110, 1.72, 11.5], [120, 18.96, 1906.19], [140, 65.04, 7360.85], [150, 127.4, 16080.57], [160, 160.81, 21176.06], [170, 221.69, 29227.38], [190, 274.08, 36987.98], [Infinity, 282.35, 38271.32]] },
  red: [[1, 10], [2, 20], [3, 28], [4, 35], [5, 43], [6, 52], [7, 60], [8, 65], [9, 70], [10, 75], [Infinity, 80]],
  dpf: 500,
};
function isvState() {
  return window.__isv || (window.__isv = { price: 9500, reg: (new Date().getFullYear() - 6) + "-06", fuel: "d", cc: 1598, co2: 119, norm: "", dpf: true, phevKm: 50, ptPrice: "", transp: 450, legal: 350 });
}
function isvAge(reg) { const d = new Date(reg + "-01"); return isNaN(d) ? 0 : (Date.now() - d) / (365.25 * 86400000); }
function isvNorm(s) { if (s.norm) return s.norm; const d = new Date(s.reg + "-01"); return d >= new Date("2018-09-01") ? "wltp" : "nedc"; }
function isvCalc(s) {
  const out = { cil: 0, amb: 0, red: 0, age: isvAge(s.reg), norm: isvNorm(s), dpf: 0, base: 0, total: 0, note: "" };
  if (s.fuel === "ev") { out.note = "Los eléctricos puros están exentos de ISV."; return out; }
  const row = (t, v) => t.find(r => v <= r[0]), cc = Math.max(0, +s.cc || 0), co2 = Math.max(0, +s.co2 || 0), tb = s.fuel === "d" ? "d" : "g";
  const a = row(ISV.cil, cc), b = row(ISV[out.norm][tb], co2);
  out.cil = Math.max(0, cc * a[1] - a[2]); out.amb = Math.max(0, co2 * b[1] - b[2]);
  out.red = row(ISV.red, out.age)[1];
  out.base = (out.cil + out.amb) * (1 - out.red / 100);
  if (s.fuel === "phev") {
    const lim = out.norm === "wltp" && new Date(s.reg + "-01") >= new Date("2026-01-01") ? 80 : 50;
    if ((+s.phevKm || 0) >= 50 && co2 <= lim) { out.base *= .25; out.note = "Híbrido enchufable con 50 km o más de autonomía eléctrica y CO₂ bajo: paga el 25 % del ISV."; }
    else out.note = "Híbrido enchufable sin los requisitos de autonomía o CO₂: paga la tabla completa.";
  }
  if (s.fuel === "hev") out.note = "Los híbridos no enchufables pagan la tabla general.";
  if (s.fuel === "d" && s.dpf) out.dpf = ISV.dpf;
  out.total = Math.round((out.base + out.dpf) * 100) / 100;
  return out;
}
function isvView() {
  const s = isvState(), r = isvCalc(s), N = v => +v || 0;
  const landed = N(s.price) + N(s.transp) + N(s.legal) + r.total, save = s.ptPrice ? N(s.ptPrice) - landed : null;
  const parts = [["Precio en España", N(s.price)], ["Transporte a Portugal", N(s.transp)], ["Legalización", N(s.legal)], ["ISV", r.total]];
  const fuels = [["g", "Gasolina / GLP"], ["d", "Diésel"], ["hev", "Híbrido"], ["phev", "Híbrido enchufable"], ["ev", "Eléctrico"]];
  const yrs = Math.floor(r.age), mo = Math.round((r.age - yrs) * 12);
  return `<div class="isvg" data-rev>
    <form class="panel tlform" onsubmit="return false">
      <h3>${ccFlag("ES")}${ic("right", "sm")}${ccFlag("PT")} Importar de España a Portugal</h3>
      <p class="muted" style="margin:0;font-size:14px">Coche usado comprado en España y matriculado en Portugal. Estimación del ISV con las tablas del Código do ISV y la reducción por antigüedad.</p>
      <div class="fgrid">
        <div class="field"><label for="isPrice">Precio en España</label><div class="money"><span>€</span><input class="in tnum" id="isPrice" type="number" inputmode="numeric" min="0" value="${esc(s.price)}"></div></div>
        <div class="field"><label for="isReg">Primera matriculación</label><input class="in" id="isReg" type="month" value="${esc(s.reg)}" max="${new Date().toISOString().slice(0, 7)}"></div>
        <div class="field full"><label>Combustible</label><div class="mf-chips" id="isFuel">${fuels.map(([k, t]) => `<button type="button" class="${s.fuel === k ? "on" : ""}" data-v="${k}">${t}</button>`).join("")}</div></div>
        ${s.fuel === "ev" ? "" : `<div class="field"><label for="isCc">Cilindrada (cm³)</label><input class="in tnum" id="isCc" type="number" inputmode="numeric" min="0" value="${esc(s.cc)}"></div>
        <div class="field"><label for="isCo2">CO₂ (g/km)</label><input class="in tnum" id="isCo2" type="number" inputmode="numeric" min="0" value="${esc(s.co2)}"><small class="faint">Casilla V.7 del permiso de circulación o certificado de conformidad (COC)</small></div>
        <div class="field"><label for="isNorm">Norma de emisiones</label><select class="in" id="isNorm"><option value="" ${s.norm ? "" : "selected"}>Automático (${isvNorm(Object.assign({}, s, { norm: "" })).toUpperCase()})</option><option value="nedc" ${s.norm === "nedc" ? "selected" : ""}>NEDC</option><option value="wltp" ${s.norm === "wltp" ? "selected" : ""}>WLTP</option></select></div>
        ${s.fuel === "d" ? `<label class="adm-tog isv-tog"><input type="checkbox" id="isDpf" ${s.dpf ? "checked" : ""}><span class="toggle-ui"></span><span>Emite partículas ≥ 0,001 g/km<small class="faint">Recargo de 500 € (casi todos los diésel)</small></span></label>` : ""}
        ${s.fuel === "phev" ? `<div class="field"><label for="isKm">Autonomía eléctrica (km)</label><input class="in tnum" id="isKm" type="number" min="0" value="${esc(s.phevKm)}"></div>` : ""}`}
      </div>
      <details class="isv-more" ${s.ptPrice ? "open" : ""}><summary>${ic("gear", "sm")}Transporte, legalización y precio en Portugal</summary>
        <div class="fgrid">
          <div class="field"><label for="isTr">Transporte</label><div class="money"><span>€</span><input class="in tnum" id="isTr" type="number" min="0" value="${esc(s.transp)}"></div></div>
          <div class="field"><label for="isLg">Legalización</label><div class="money"><span>€</span><input class="in tnum" id="isLg" type="number" min="0" value="${esc(s.legal)}"></div><small class="faint">DAV en la Aduana, inspección tipo B, matrícula y placas</small></div>
          <div class="field full"><label for="isPt">Precio de un coche igual en Portugal (opcional)</label><div class="money"><span>€</span><input class="in tnum" id="isPt" type="number" min="0" placeholder="Para calcular el ahorro" value="${esc(s.ptPrice)}"></div></div>
        </div></details>
    </form>
    <aside class="panel isvout" id="isOut" aria-live="polite">
      <small class="muted">ISV estimado</small>
      <div class="isv-hero tnum">${eur(r.total)}</div>
      <div class="isv-sub muted">${s.fuel === "ev" ? r.note : `${r.norm.toUpperCase()} · ${yrs} ${yrs === 1 ? "año" : "años"}${mo ? " y " + mo + " " + (mo === 1 ? "mes" : "meses") : ""} · reducción del ${r.red} %`}</div>
      ${s.fuel === "ev" ? "" : `<div class="isv-br">
        <div class="kv"><span>Componente cilindrada</span><span class="tnum">${eur(r.cil)}</span></div>
        <div class="kv"><span>Componente ambiental (CO₂)</span><span class="tnum">${eur(r.amb)}</span></div>
        <div class="kv"><span>Reducción por antigüedad</span><span class="tnum">−${eur((r.cil + r.amb) * r.red / 100)}</span></div>
        ${s.fuel === "phev" && r.base ? `<div class="kv"><span>Ajuste híbrido enchufable</span><span class="tnum">×</span></div>` : ""}
        ${r.dpf ? `<div class="kv"><span>Recargo partículas (diésel)</span><span class="tnum">${eur(r.dpf)}</span></div>` : ""}
      </div>`}
      ${r.note && s.fuel !== "ev" ? `<p class="isv-note">${ic("alert", "sm")}${r.note}</p>` : ""}
      <div class="isv-land"><div class="kv total"><span>Coste final con matrícula portuguesa</span><span class="tnum">${eur(landed)}</span></div>
        <div class="isv-bars">${parts.map(([k, v]) => `<div class="ib"><span>${k}</span><b class="tnum">${eur(v)}</b><i style="--w:${landed ? (v / landed * 100).toFixed(1) : 0}%"></i></div>`).join("")}</div>
        ${save != null ? `<div class="isv-save ${save >= 0 ? "ok" : "bad"}">${ic(save >= 0 ? "check" : "alert", "sm")}<span>${save >= 0 ? "Ahorras" : "Te cuesta"} <b class="tnum">${eur(Math.abs(save))}</b> ${save >= 0 ? "frente a comprarlo en Portugal" : "más que en Portugal"}</span></div>` : ""}</div>
      <a class="btn primary block" href="#/mercado?pais=es">${ic("store", "sm")}Ver coches en España</a>
      <small class="faint">Estimación orientativa. El importe definitivo lo liquida la Autoridade Tributária con la DAV. Para vehículos comerciales, autocaravanas o motos se aplican otras tablas.</small>
    </aside></div>
    <section class="isv-steps" data-rev><h3>Cómo se legaliza en Portugal</h3><ol>
      <li><b>Compra y transporte.</b> Contrato o factura a tu nombre y el permiso de circulación español. Mientras dura el trámite puede circular con la matrícula española dentro de los plazos legales.</li>
      <li><b>DAV en la Aduana.</b> La Declaração Aduaneira de Veículo se presenta en los 20 días hábiles siguientes a la entrada en Portugal.</li>
      <li><b>Inspección tipo B.</b> En un centro de inspección (IPO) para comprobar el vehículo y sus datos.</li>
      <li><b>Pago del ISV</b> y asignación de la matrícula portuguesa por el IMT.</li>
      <li><b>Registo de propriedade</b> a tu nombre y, cada año, el IUC.</li></ol></section>`;
}
function isvMount() {
  const s = isvState();
  const re = () => { const y = scrollY, a = document.activeElement && document.activeElement.id, op = !!($(".isv-more") && $(".isv-more").open); const host = $(".isvg").parentElement; const tmp = document.createElement("div"); tmp.innerHTML = isvView(); $(".isvg").replaceWith(tmp.firstElementChild); $(".isv-steps").replaceWith(tmp.lastElementChild); if (op && $(".isv-more")) $(".isv-more").open = true; isvMount(); if (a && $("#" + a)) { const e = $("#" + a); e.focus(); if (e.setSelectionRange && e.type === "text") e.setSelectionRange(e.value.length, e.value.length); } scrollTo(0, y); host && initReveal && initReveal(host); };
  const out = () => { const tmp = document.createElement("div"); tmp.innerHTML = isvView(); const o = tmp.querySelector("#isOut"); if (o && $("#isOut")) $("#isOut").innerHTML = o.innerHTML; };
  const bind = (id, k, full) => { const e = $(id); if (!e) return; e.oninput = () => { s[k] = e.type === "checkbox" ? e.checked : e.value; full ? re() : out(); }; if (e.tagName === "SELECT" || e.type === "checkbox" || e.type === "month") e.onchange = e.oninput; };
  bind("#isPrice", "price"); bind("#isReg", "reg", true); bind("#isCc", "cc"); bind("#isCo2", "co2"); bind("#isNorm", "norm"); bind("#isDpf", "dpf"); bind("#isKm", "phevKm");
  bind("#isTr", "transp"); bind("#isLg", "legal"); bind("#isPt", "ptPrice");
  $$("#isFuel button").forEach(b => b.onclick = () => { s.fuel = b.dataset.v; if (s.fuel !== "d") s.dpf = s.fuel === "d"; else s.dpf = true; re(); trackEv("tool", { props: { t: "isv", f: s.fuel } }); });
}
(function patchTools() {
  const v = viewTools;
  viewTools = function (q) {
    if (!ptOn()) { const t0 = toolsState(); if (t0.tab === "isv") t0.tab = "itp"; if (q && q.t === "isv") q = Object.assign({}, q, { t: "itp" }); return v.call(this, q); }
    const t = toolsState(); if (q && q.t) t.tab = q.t;
    if (q && q.t === "isv") { const s = isvState(); if (q.p) s.price = +q.p || s.price; if (q.y && /^\d{4}-\d{2}$/.test(q.y)) s.reg = q.y; if (q.f && ["g", "d", "hev", "phev", "ev"].includes(q.f)) { s.fuel = q.f; s.dpf = q.f === "d"; } if (q.c) s.cc = +q.c || s.cc; s.norm = ""; }
    if (t.tab !== "isv") return v.apply(this, arguments).replace(/(<div class="seg tltabs" id="tlTabs">[\s\S]*?)(<\/div>)/, `$1<button class="" data-v="isv">${ccFlag("PT")}Importar a Portugal</button>$2`);
    const h = v.call(this, Object.assign({}, q, { t: "vin" }));
    t.tab = "isv";
    const head = h.slice(0, h.indexOf('<div class="seg tltabs"'));
    const tabs = h.match(/<div class="seg tltabs" id="tlTabs">[\s\S]*?<\/div>/)[0].replace(/ class="on"/g, ' class=""').replace("</div>", `<button class="on" data-v="isv">${ccFlag("PT")}Importar a Portugal</button></div>`);
    return head + tabs + isvView() + "</div>";
  };
  const m = mountTools;
  mountTools = function () { const t = toolsState(); if (ptOn() && t.tab === "isv") { $$("#tlTabs button").forEach(b => b.onclick = () => { t.tab = b.dataset.v; location.hash = "#/herramientas?t=" + t.tab; }); isvMount(); return; } return m.apply(this, arguments); };
})();

/* ---------- consola: país en vehículos y sección España y Portugal ---------- */
(function admCountries() {
  const g = ADM_NAV.find(x => x[0] === "General"); if (ptOn() && g && !g[1].some(x => x[0] === "paises")) g[1].splice(2, 0, ["paises", "España y Portugal", "globe"]);
  /* lista de vehículos: filtro por país */
  const R = ADM_R.vehiculos, rv = R.view;
  R.view = function (d, q, m) {
    if (!ptOn()) return rv.call(this, d, q, m);
    const f = ADM.f.vcc || "all", veh = d.veh || [];
    const n = { ES: veh.filter(v => ccOf(v) === "ES").length, PT: veh.filter(v => ccOf(v) === "PT").length };
    const dd = f === "all" ? d : Object.assign({}, d, { veh: veh.filter(v => ccOf(v) === f) });
    return `<div class="adm-ccbar">${admSeg("vcc", [["all", "Todos los países", veh.length], ["ES", "España", n.ES], ["PT", "Portugal", n.PT]], f)}</div>` + rv.call(this, dd, q, m);
  };
  const rb = R.bind;
  R.bind = function (d, q, m, draw) { rb.apply(this, arguments); $$('[data-seg="vcc"] button').forEach(b => b.onclick = () => { ADM.f.vcc = b.dataset.v; draw(); }); };
  /* ficha: cambiar el país */
  const E = ADM_R.vehiculo, eb = E.bind;
  E.bind = function (d, q, m, draw) {
    eb.apply(this, arguments);
    const side = $(".adm-ed-side"); if (!ptOn() || !side || d.isNew || !d.v || !d.v.id || $("#eCC")) return;
    const cc = ccOf(d.v);
    side.insertAdjacentHTML("afterbegin", `<div class="panel adm-p adm-cc"><div class="adm-ph"><h3>${ic("globe", "sm")}País</h3></div><div class="ccpick" id="eCC">${["ES", "PT"].map(k => `<button type="button" class="${cc === k ? "on" : ""}" data-ecc="${k}">${ccFlag(k)}<span>${MKC[k].name}</span></button>`).join("")}</div><small class="faint">Decide en qué Mercado aparece el anuncio.</small></div>`);
    $$("[data-ecc]").forEach(b => b.onclick = async () => {
      if (b.classList.contains("on")) return;
      try { if (live()) await admRpc("admin_vehicle_country", { p_id: d.v.id, p_country: b.dataset.ecc }); else { const x = admOff().vs.find(z => z.id === d.v.id); if (x) x.country = b.dataset.ecc; }
        d.v.country = b.dataset.ecc; $$("[data-ecc]").forEach(x => x.classList.toggle("on", x === b)); admDrop("veh", "mk", "mkts", "v:*"); admOk("País cambiado a " + MKC[b.dataset.ecc].name, "globe");
      } catch (e) { admErr(e); }
    });
  };
  /* datos */
  const get = admGet;
  admGet = async function (key, force) {
    if (!key.startsWith("mkts")) return get.apply(this, arguments);
    if (!force && ADM.c[key] && now() - ADM.c[key].t < 45000) return ADM.c[key].v;
    const days = +key.slice(4) || 30; let v;
    if (live()) v = await admRpc("admin_markets", { p_days: days });
    else {
      const vs = admOff().vs, act = x => x.listing && x.listing.status === "activo";
      const mk = cc => { const L = vs.filter(x => ccOf(x) === cc && act(x)); const regs = {}; L.forEach(x => { const k = x.province || x.city || "—"; regs[k] = (regs[k] || 0) + 1; });
        return { cc, listings: L.length, listings_new: Math.round(L.length / 3), stock: L.reduce((a, x) => a + +x.listing.price, 0), avg_price: L.length ? Math.round(L.reduce((a, x) => a + +x.listing.price, 0) / L.length) : 0, auctions: vs.filter(x => ccOf(x) === cc && x.auction).length, sellers: cc === "ES" ? 9 : 0, users: cc === "ES" ? 41 : 3, visitors: cc === "ES" ? 1240 : 96, market_views: cc === "ES" ? 2210 : 140, contacts: cc === "ES" ? 64 : 4, regions: Object.entries(regs).map(([k, n]) => ({ k, n })).sort((a, b) => b.n - a.n).slice(0, 8) }; };
      const t = admOffTraffic(days).series || [];
      v = { days, demo: true, countries: [mk("ES"), mk("PT")], series: t.map((x, i) => ({ d: x.d, es: Math.round(x.visitors * .86), pt: Math.round(x.visitors * .08 + (i % 5 === 0 ? 2 : 0)) })), geo: [{ k: "ES", n: 1240 }, { k: "PT", n: 96 }, { k: "GB", n: 31 }, { k: "PL", n: 22 }, { k: "UA", n: 14 }], cross: { pt_on_es: 38, es_on_pt: 3 } };
    }
    ADM.c[key] = { t: now(), v }; return v;
  };
  const GEO_N = { ES: "España", PT: "Portugal", GB: "Reino Unido", FR: "Francia", DE: "Alemania", PL: "Polonia", UA: "Ucrania", IT: "Italia", NL: "Países Bajos", BE: "Bélgica", US: "Estados Unidos", MA: "Marruecos", RO: "Rumanía", LV: "Letonia", IE: "Irlanda", CH: "Suiza", BR: "Brasil" };
  ADM_R.paises = {
    load: async q => { const d = +(q.d || ADM.days || 30); ADM.days = d; return { mk: await admGet("mkts" + d, true), d }; },
    view: ({ mk, d }) => {
      const [es, pt] = ["ES", "PT"].map(cc => (mk.countries || []).find(x => x.cc === cc) || { cc });
      const C = { ES: "var(--c-es)", PT: "var(--c-pt)" };
      const row = (icon, label, k, fmt) => `<div class="cmp-r"><span class="cmp-l">${ic(icon, "sm")}${label}</span>${[es, pt].map(x => `<b class="tnum">${fmt ? fmt(+x[k] || 0) : num(+x[k] || 0)}</b>`).join("")}
        <span class="cmp-bar" aria-hidden="true">${(() => { const a = +es[k] || 0, b = +pt[k] || 0, t = a + b || 1; return `<i style="width:${(a / t * 100).toFixed(1)}%;background:${C.ES}"></i><i style="width:${(b / t * 100).toFixed(1)}%;background:${C.PT}"></i>`; })()}</span></div>`;
      const geo = (mk.geo || []).map(x => ({ k: x.k, html: `${x.k === "ES" || x.k === "PT" ? ccFlag(x.k) : ""}${esc(GEO_N[x.k] || x.k)}`, n: x.n, c: x.k === "ES" ? C.ES : x.k === "PT" ? C.PT : "var(--muted)" }));
      const cr = mk.cross || {};
      return `${mk.demo ? `<div class="adm-demo">${ic("alert", "sm")}Modo demostración: datos de ejemplo.</div>` : ""}
      <div class="adm-bar">${admSeg("days", [["7", "7 días"], ["30", "30 días"], ["90", "90 días"]], String(d))}<span class="muted" style="font-size:13px">País del visitante según la red (sin cookies)</span></div>
      <div class="cmp-head"><div></div><div class="cmp-c">${ccFlag("ES")}<b>España</b></div><div class="cmp-c">${ccFlag("PT")}<b>Portugal</b></div><div></div></div>
      ${admPanel("", `<div class="cmp">
        ${row("store", "Anuncios activos en el Mercado", "listings")}
        ${row("plus", `Anuncios nuevos · ${d} días`, "listings_new")}
        ${row("euro", "Valor del stock", "stock", v => eur(v))}
        ${row("scale", "Precio medio", "avg_price", v => v ? eur(v) : "—")}
        ${row("gavel", "Subastas programadas o en vivo", "auctions")}
        ${row("building", "Vendedores con stock", "sellers")}
        ${row("users", "Usuarios registrados", "users")}
        ${row("eye", `Visitantes · ${d} días`, "visitors")}
        ${row("search", "Vistas del Mercado", "market_views")}
        ${row("msg", "Contactos y ofertas", "contacts")}</div>`, { cls: "adm-cmp" })}
      <div class="adm-grid">
        ${admPanel("Visitantes por país", admArea((mk.series || []).map(x => ({ d: x.d, es: x.es, pt: x.pt })), [{ k: "es", l: "España", c: getComputedStyle(document.documentElement).getPropertyValue("--c-es").trim() || "#d9661c" }, { k: "pt", l: "Portugal", c: getComputedStyle(document.documentElement).getPropertyValue("--c-pt").trim() || "#2f6bd0" }], { label: "Visitantes diarios de España y Portugal" }))}</div>
      <div class="adm-grid g-2">
        ${admPanel("De dónde vienen", admBars(geo, { empty: "Aún no hay visitas con país" }))}
        ${admPanel("Demanda cruzada", `<div class="xb">
          <div><span>${ccFlag("PT")}${ic("right", "sm")}${ccFlag("ES")}</span><b class="tnum">${num(cr.pt_on_es || 0)}</b><small>vistas de visitantes de Portugal a coches en España</small></div>
          <div><span>${ccFlag("ES")}${ic("right", "sm")}${ccFlag("PT")}</span><b class="tnum">${num(cr.es_on_pt || 0)}</b><small>vistas de visitantes de España a coches en Portugal</small></div></div>
          <p class="muted" style="font-size:13px;margin:12px 0 0">La demanda de Portugal sobre stock español es la señal para la importación con ISV y transporte.</p>`)}</div>
      <div class="adm-grid g-2">
        ${admPanel(`${ccFlag("ES")} Provincias con más anuncios`, admBars((es.regions || []).map(x => ({ k: x.k, n: x.n, c: C.ES })), { empty: "Sin anuncios" }))}
        ${admPanel(`${ccFlag("PT")} Distritos con más anuncios`, admBars((pt.regions || []).map(x => ({ k: x.k, n: x.n, c: C.PT })), { empty: "Aún no hay anuncios en Portugal" }))}
      </div>`;
    },
    bind: (data, q, m, draw) => { $$('[data-seg="days"] button').forEach(b => b.onclick = () => { ADM.days = +b.dataset.v; admMount("paises", { d: b.dataset.v }, m); }); },
  };
  ROUTES.unshift([/^\/admin\/paises$/, admRoute("paises", "España y Portugal", "Dos mercados en una consola: oferta, visitas y demanda cruzada.")]);
})();

/* ---------- inicio: aviso para visitantes de Portugal ---------- */
patchRoute(/^\/$/, () => {
  const viewerPT = ptOn() && (mkCC() === "PT" || window.__geo === "PT" || (typeof LANG !== "undefined" && LANG === "pt"));
  if (!viewerPT || $(".ptbar")) return;
  const em = $("#app h1 em"); if (em && /España/.test(em.textContent)) em.textContent = "España y Portugal";
  const h = $("#app .hero") || $("#app section"); if (!h) return;
  h.insertAdjacentHTML("afterend", `<div class="wrap"><a class="ptbar" href="#/mercado?pais=pt">${ccFlag("PT")}<span><b>Nuevo en Portugal</b> Mercado gratis para comprar y vender, y calculadora de ISV para traer el coche de España</span>${ic("right", "sm")}</a></div>`);
});
