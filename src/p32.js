
/* =====================================================================
   p32 — Contrato inteligente: pantalla partida 50/50 y vista previa viva
   · la vista previa sigue al campo que editas y resalta lo que cambia
   · clic en un hueco del contrato → salta al campo que lo rellena
   · progreso por secciones con "siguiente dato pendiente"
   · revisión automática (DNI/CIF, bastidor y marca, fechas, efectivo…)
   · rellenar con mis datos, con uno de mis vehículos o desde un anuncio
   ===================================================================== */
var CV_FOCUS = null, CV_LASTTXT = [];
var CV_ZOOM = (() => { try { return +store.get("cvzoom", 1) || 1; } catch (e) { return 1; } })();

/* fabricantes por las tres primeras letras del bastidor (WMI) */
var CV_WMI = { WVW: "Volkswagen", WV1: "Volkswagen", WV2: "Volkswagen", WAU: "Audi", WUA: "Audi", WBA: "BMW", WBS: "BMW", WBY: "BMW", WMW: "Mini", WDB: "Mercedes-Benz", WDD: "Mercedes-Benz", WDC: "Mercedes-Benz", W1K: "Mercedes-Benz", W1N: "Mercedes-Benz", WME: "Smart",
  WP0: "Porsche", WP1: "Porsche", W0L: "Opel", W0V: "Opel", WF0: "Ford", VF1: "Renault", VF3: "Peugeot", VF7: "Citroën", VR3: "Peugeot", VR7: "Citroën", VSS: "Seat", VSE: "Seat", VS6: "Ford", VNK: "Toyota", VWV: "Volkswagen",
  TMB: "Škoda", TMA: "Hyundai", UU1: "Dacia", ZFA: "Fiat", ZFF: "Ferrari", ZAR: "Alfa Romeo", ZHW: "Lamborghini", ZAP: "Piaggio", SAL: "Land Rover", SAJ: "Jaguar", SCC: "Lotus", YV1: "Volvo", YS3: "Saab",
  JTD: "Toyota", JTE: "Toyota", JTN: "Toyota", SB1: "Toyota", JMZ: "Mazda", JM1: "Mazda", JN1: "Nissan", SJN: "Nissan", VSK: "Nissan", JHM: "Honda", SHH: "Honda", JMB: "Mitsubishi", JSA: "Suzuki", TSM: "Suzuki",
  KMH: "Hyundai", KNA: "Kia", KNE: "Kia", U5Y: "Kia", NLH: "Hyundai", LRW: "Tesla", "5YJ": "Tesla", XP7: "Tesla", LJD: "BYD", VXK: "Opel", VYF: "DS", LSJ: "MG", JS1: "Suzuki", JYA: "Yamaha", JKA: "Kawasaki", ZDM: "Ducati", WB1: "BMW" };
function cvWmiMake(vin) { const v = String(vin || "").toUpperCase(); return v.length >= 3 ? CV_WMI[v.slice(0, 3)] || "" : ""; }
const cvNormMake = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");

/* ---------- secciones del contrato ↔ campos ---------- */
var CV_SECS = [["sel", "Vendedor", "#cvSel"], ["com", "Comprador", "#cvCom"], ["veh", "Vehículo", "#cvVeh"], ["pago", "Precio", "#cvPago"], ["firma", "Firma", "#cvFir"]];
function cvSecOf(path) { const k = String(path).split(".")[0]; return k === "lugar" || k === "fecha" ? "firma" : k === "entrega" ? "pago" : k === "estado" || k === "docs" || k === "extra" ? "estado" : k; }
var CV_HOLEMAP = {
  party: { "nombre y apellidos": "nombre", "documento": "doc", "razón social": "razon", "CIF": "cif", "representante": "rep", "DNI/NIE": "repDoc", "cargo": "cargo", "domicilio": "dom", "municipio": "mun", "provincia": "prov" },
  veh: { "marca": "veh.marca", "modelo": "veh.modelo", "matrícula": "veh.matricula", "bastidor": "veh.vin" },
  place: { "lugar": "lugar", "fecha": "fecha" }, pago: { "importe": "pago.precio" }, estado: { "daños conocidos": "estado.danosTxt" }, entrega: { "fecha": "entrega.fecha", "hora": "entrega.hora" },
};

/* vista previa con secciones marcadas, huecos clicables y cambios resaltados */
cvPreviewHTML = function (lang) {
  const es = !lang || lang === "es", T = s => es || typeof tr !== "function" ? s : tr(s, null, lang);
  const heads = { [T(CVX.hPrecio)]: "pago", [T(CVX.hEstado)]: "estado", [T(CVX.hEntrega)]: "entrega", [T(CVX.hCargas)]: "otros", [T(CVX.hTransf)]: "otros", [T(CVX.hSeguro)]: "otros", [T(CVX.hOtras)]: "estado", [T(CVX.hLey)]: "otros", [T(CVX.hObjeto)]: "veh" };
  const rev = {}; Object.values(CV_HOLEMAP).forEach(m => Object.keys(m).forEach(k => { rev[T(k)] = k; }));
  const holes = s => esc(s).replace(new RegExp(CV_HOLE_A + "([^" + CV_HOLE_B + "]*)" + CV_HOLE_B, "g"), (m, l) => `<mark data-hole="${esc(rev[l] || l)}" title="Clic para rellenar">${l}</mark>`);
  let sec = "top", party = 0;
  const out = cvBlocks(lang).map((b, i) => {
    if (b.t === "title") sec = "top";
    else if (b.t === "place") sec = "place";
    else if (b.t === "h" && b.center) sec = "top";
    else if (b.t === "h") { const key = Object.keys(heads).find(k => b.s.endsWith(k)); sec = key ? heads[key] : "otros"; }
    else if (b.t === "kv") sec = "veh";
    else if (b.t === "sig") sec = "firma";
    let s = sec;
    if (b.t === "p" && sec === "top") { s = party === 0 ? "sel" : party === 1 ? "com" : "top"; party++; }
    const cls = `cvb${CV_FOCUS && cvSecMatch(s, CV_FOCUS) ? " cur" : ""}`, a = `data-sec="${s}" data-bi="${i}"`;
    if (b.t === "title") return `<h4 class="cvt ${cls}" ${a}>${holes(b.s)}</h4>`;
    if (b.t === "place") return `<p class="cvplace ${cls}" ${a}>${holes(b.s)}</p>`;
    if (b.t === "h") return `<h5 class="${b.center ? "c " : ""}${cls}" ${a}>${holes(b.s)}</h5>`;
    if (b.t === "p") return `<p class="${cls}" ${a}>${holes(b.s)}</p>`;
    if (b.t === "kv") return `<table class="cvkv ${cls}" ${a}>${b.rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${holes(v)}</td></tr>`).join("")}</table>`;
    if (b.t === "sig") return `<div class="cvsigs ${cls}" ${a}>${["sel", "com"].map(k => `<div><span class="lab">${esc(b[k].label)}</span>${b[k].img ? `<img src="${b[k].img}" alt="">` : '<i class="line"></i>'}<small>${esc(b[k].who || "")}</small></div>`).join("")}</div>`;
    return "";
  }).join("");
  return `<div class="cvsheet">${out}</div>`;
};
function cvSecMatch(blockSec, focusSec) {
  if (focusSec === "firma") return blockSec === "place" || blockSec === "firma";
  if (focusSec === "pago") return blockSec === "pago" || blockSec === "entrega";
  return blockSec === focusSec;
}
function cvHolePath(mark) {
  const blk = mark.closest("[data-sec]"), s = blk && blk.dataset.sec, l = mark.dataset.hole;
  if (s === "sel" || s === "com") return CV_HOLEMAP.party[l] ? s + "." + CV_HOLEMAP.party[l] : null;
  if (s === "veh") return CV_HOLEMAP.veh[l] || null;
  if (s === "place") return CV_HOLEMAP.place[l] || null;
  if (s === "pago") return CV_HOLEMAP.pago[l] || null;
  if (s === "estado") return CV_HOLEMAP.estado[l] || null;
  if (s === "entrega") return CV_HOLEMAP.entrega[l] || null;
  return null;
}
function cvFocusPath(path) {
  const el = $(`[data-cv="${path}"]`); if (!el) return false;
  const sec = el.closest(".cvsec");
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => { try { el.focus({ preventScroll: true }); } catch (e) {} el.closest(".field") && el.closest(".field").classList.add("cvping"); setTimeout(() => el.closest(".field") && el.closest(".field").classList.remove("cvping"), 1200); }, 350);
  if (sec) sec.classList.add("cvsec-on");
  return true;
}
function cvScrollPaper(sec) {
  const paper = $("#cvPaper"); if (!paper) return;
  const blk = [...paper.querySelectorAll("[data-sec]")].find(b => cvSecMatch(b.dataset.sec, sec)); if (!blk) return;
  const top = blk.getBoundingClientRect().top - paper.getBoundingClientRect().top + paper.scrollTop - 28;
  paper.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}
function cvMarkFocus() { $$("#cvPaper [data-sec]").forEach(b => b.classList.toggle("cur", !!CV_FOCUS && cvSecMatch(b.dataset.sec, CV_FOCUS))); }

/* ---------- revisión inteligente ---------- */
function cvReview() {
  const c = cvState(), w = cvWarnings(), out = Object.entries(w).map(([p, t]) => ({ p, t, lvl: "warn" }));
  const docOf = s => (c[s].tipo === "empresa" ? c[s].cif : c[s].doc || "").toUpperCase().replace(/[\s-]/g, "");
  if (docOf("sel") && docOf("sel") === docOf("com")) out.push({ p: "com." + (c.com.tipo === "empresa" ? "cif" : "doc"), t: "Vendedor y comprador tienen el mismo documento", lvl: "warn" });
  const mk = cvWmiMake(c.veh.vin);
  if (mk && c.veh.marca && cvNormMake(mk) !== cvNormMake(c.veh.marca) && !(cvNormMake(c.veh.marca).includes(cvNormMake(mk)) || cvNormMake(mk).includes(cvNormMake(c.veh.marca))))
    out.push({ p: "veh.vin", t: `El bastidor es de un ${mk} y la marca indicada es ${c.veh.marca}`, lvl: "warn" });
  if (c.entrega.fecha && c.fecha && c.entrega.fecha < c.fecha) out.push({ p: "entrega.fecha", t: "La entrega es anterior a la fecha del contrato", lvl: "warn" });
  if (c.veh.fmat && c.veh.fmat > cvToday()) out.push({ p: "veh.fmat", t: "La primera matriculación está en el futuro", lvl: "warn" });
  if (c.veh.km && +c.veh.km > 900000) out.push({ p: "veh.km", t: "Kilometraje muy alto: revísalo", lvl: "warn" });
  const pr = +c.pago.precio; if (pr > 0 && pr < 150) out.push({ p: "pago.precio", t: "Precio muy bajo: comprueba el importe", lvl: "info" });
  if (c.estado.danos && !String(c.estado.danosTxt || "").trim()) out.push({ p: "estado.danosTxt", t: "Has marcado daños: descríbelos para evitar reclamaciones", lvl: "warn" });
  const missing = cvRequired().filter(([, v]) => !String(v || "").trim()).length;
  if (!missing && !(CV_SIG.sel && CV_SIG.com)) out.push({ p: null, t: "Faltan las firmas: firmad en pantalla o imprimid y firmad a mano", lvl: "info" });
  return { items: out, missing };
}
function cvRenderReview() {
  const box = $("#cvRev"); if (!box) return;
  const r = cvReview(), ok = !r.items.filter(x => x.lvl === "warn").length;
  box.className = "cvrev " + (ok && !r.missing ? "ok" : ok ? "mid" : "warn");
  box.innerHTML = `<div class="cvrev-h">${ic(ok ? (r.missing ? "clock" : "check") : "alert", "sm")}<b>${!ok ? `${r.items.filter(x => x.lvl === "warn").length} ${r.items.filter(x => x.lvl === "warn").length === 1 ? "cosa que revisar" : "cosas que revisar"}` : r.missing ? `Faltan ${r.missing} ${r.missing === 1 ? "dato" : "datos"}` : "Todo en orden"}</b>${ok && !r.missing ? `<span>El contrato está listo para firmar y descargar.</span>` : ""}</div>
    ${r.items.length ? `<ul>${r.items.slice(0, 5).map(x => `<li class="${x.lvl}">${x.p ? `<button type="button" data-goto="${x.p}">${esc(x.t)}${ic("right", "sm")}</button>` : `<span>${esc(x.t)}</span>`}</li>`).join("")}</ul>` : ""}`;
  $$("[data-goto]", box).forEach(b => b.onclick = () => cvFocusPath(b.dataset.goto));
}

/* ---------- progreso por secciones ---------- */
function cvRenderSecs() {
  const prog = $("#cvProg"); if (!prog) return;
  const req = cvRequired(), by = {};
  req.forEach(([p, v]) => { const s = cvSecOf(p); (by[s] = by[s] || { n: 0, miss: [] }).n++; if (!String(v || "").trim()) by[s].miss.push(p); });
  const next = req.find(([, v]) => !String(v || "").trim());
  let el = $("#cvSecs"); if (!el) { prog.insertAdjacentHTML("beforeend", `<div class="cvsecs" id="cvSecs"></div>`); el = $("#cvSecs"); }
  el.innerHTML = CV_SECS.map(([k, t, id]) => { const b = by[k] || { n: 0, miss: [] }, done = !b.miss.length;
    return `<button type="button" class="cvs ${done ? "ok" : ""} ${CV_FOCUS === k ? "on" : ""}" data-secgo="${k}" data-target="${id}">${done ? ic("check", "sm") : `<i class="tnum">${b.miss.length}</i>`}${t}</button>`; }).join("")
    + (next ? `<button type="button" class="btn xs primary cvnext" data-goto="${next[0]}">${ic("right", "sm")}Siguiente dato</button>` : `<span class="cvdone">${ic("check", "sm")}Datos completos</span>`);
  $$("[data-secgo]", el).forEach(b => b.onclick = () => { const s = by[b.dataset.secgo]; if (s && s.miss.length) cvFocusPath(s.miss[0]); else { const t = $(b.dataset.target); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); } });
  $$("[data-goto]", el).forEach(b => b.onclick = () => cvFocusPath(b.dataset.goto));
}

/* ---------- ayudas para rellenar ---------- */
function cvFill(map) {
  Object.entries(map).forEach(([p, v]) => { if (v == null || v === "") return; cvSet(p, v); const el = $(`[data-cv="${p}"]`); if (el) { el.value = v; el.closest(".field") && el.closest(".field").classList.add("cvfilled"); } });
  cvChanged();
  setTimeout(() => $$(".cvfilled").forEach(f => f.classList.remove("cvfilled")), 1400);
}
function cvVehicleSources() {
  const out = [];
  (S.myVehicles || []).forEach(v => out.push({ k: "v:" + v.id, t: v.title, v }));
  return out;
}
function cvFromVehicle(v) {
  const parts = String(v.title || "").split(" "), year = /^\d{4}$/.test(parts[0]) ? parts.shift() : "";
  const make = CV_MAKES.find(m => (parts.join(" ") + " ").toLowerCase().startsWith(m.toLowerCase() + " ")) || parts[0] || "";
  const model = parts.join(" ").slice(make.length).trim();
  cvFill({ "veh.marca": make, "veh.modelo": model, "veh.matricula": v.plate ? cvFmtPlate(v.plate) : "", "veh.vin": v.vin && v.vin !== "—" ? String(v.vin).toUpperCase() : "", "veh.km": v.km ? String(v.km) : "", "veh.fmat": year && !cvState().veh.fmat ? year + "-01-01" : "" });
}
function cvFromMarket(id) {
  const m = mkById(id); if (!m) return;
  const fuel = CV_FUEL.find(f => cvNormMake(f) === cvNormMake(m.fuel)) || "";
  cvFill({ "veh.marca": m.make || "", "veh.modelo": (m.model || String(m.title).replace(m.make || "", "")).trim(), "veh.km": m.km ? String(m.km) : "", "veh.comb": fuel, "pago.precio": m.price ? String(m.price) : "", "veh.fmat": m.firstReg ? String(m.firstReg).slice(0, 10) : "", "lugar": m.city && m.city !== "—" ? m.city : "" });
  const sel = $('[data-cv="veh.comb"]'); if (sel && fuel) sel.value = fuel;
  toast("Datos del anuncio copiados al contrato", "doc");
}
function cvMyData(side) {
  const u = S.user || {}; if (!u.email) return toast("Inicia sesión para usar tus datos", "user");
  const c = cvState()[side];
  if (u.company && c.tipo !== "empresa") { cvSet(side + ".tipo", "empresa"); cvRerenderParty(side); cvBindParty(side); }
  const p = cvState()[side].tipo === "empresa" ? { [side + ".razon"]: u.company, [side + ".rep"]: u.name } : { [side + ".nombre"]: u.name };
  cvFill(Object.assign(p, { [side + ".email"]: u.email, [side + ".tel"]: u.phone || "", [side + ".mun"]: u.city || "" }));
  toast("Tus datos de la cuenta, listos. Completa documento y domicilio", "user");
}
function cvSwap() {
  const c = cvState(), t = c.sel; c.sel = c.com; c.com = t;
  cvRerenderParty("sel"); cvRerenderParty("com"); cvBindParty("sel"); cvBindParty("com"); cvChanged(); toast("Vendedor y comprador intercambiados", "refresh");
}
function cvBindParty(side) {
  const sec = $(side === "sel" ? "#cvSel" : "#cvCom"); if (!sec) return;
  const head = sec.querySelector("header"); if (!head) return;
  const old = head.querySelector(".cvtools"); if (old) old.remove();
  head.insertAdjacentHTML("beforeend", `<div class="cvtools">${S.user ? `<button type="button" class="btn xs" data-mine="${side}">${ic("user", "sm")}Usar mis datos</button>` : ""}${side === "com" ? `<button type="button" class="btn xs ghost" data-swap title="Intercambiar vendedor y comprador">${ic("refresh", "sm")}Intercambiar</button>` : ""}</div>`);
  const m = head.querySelector("[data-mine]"); if (m) m.onclick = () => cvMyData(side);
  const s = head.querySelector("[data-swap]"); if (s) s.onclick = cvSwap;
}

/* ---------- montaje ---------- */
(function patchContract() {
  const up = cvUpdate;
  cvUpdate = function (opts) {
    const paper = $("#cvPaper"), keep = paper ? paper.scrollTop : 0;
    up.apply(this, arguments);
    if (!(opts && opts.noPreview) && paper) {
      paper.scrollTop = keep;
      const blocks = [...paper.querySelectorAll("[data-bi]")], now = blocks.map(b => b.textContent);
      if (CV_LASTTXT.length) blocks.forEach((b, i) => { if (CV_LASTTXT[i] != null && CV_LASTTXT[i] !== now[i] && b.dataset.sec !== "otros") { b.classList.remove("chg"); void b.offsetWidth; b.classList.add("chg"); } });
      CV_LASTTXT = now;
    }
    cvRenderSecs(); cvRenderReview();
    /* la marca sale sola del bastidor */
    const c = cvState(), mk = cvWmiMake(c.veh.vin), h = $('[data-hint="veh.vin"]');
    if (h && mk && !h.classList.contains("warn")) h.innerHTML = `${ic("check", "sm")} Bastidor de ${esc(mk)}`;
    for (const side of ["sel", "com"]) {
      const p = c[side], hint = $(`[data-hint="${side}.${p.tipo === "empresa" ? "cif" : "doc"}"]`);
      const ok = p.tipo === "empresa" ? (p.cif && cvDocOk("CIF", p.cif) === true) : (p.doc && cvDocOk(p.docTipo, p.doc) === true);
      if (hint && ok && !hint.classList.contains("warn")) { hint.innerHTML = `${ic("check", "sm")} ${p.tipo === "empresa" ? "CIF" : p.docTipo === "PAS" ? "Pasaporte" : p.docTipo} válido`; hint.classList.add("good"); }
      else if (hint) hint.classList.remove("good");
    }
  };
  const v = viewContract;
  viewContract = function (query) {
    let h = v.apply(this, arguments);
    h = h.replace('<div class="cvcard-h"><b>Vista previa</b><div class="cvprevtabs" id="cvPrevTabs"></div></div>',
      `<div class="cvcard-h"><b>${ic("doc", "sm")}Vista previa</b><div class="cvprevtabs" id="cvPrevTabs"></div><div class="cvzoom" role="group" aria-label="Tamaño de la vista previa"><button type="button" data-z="-1" aria-label="Reducir">−</button><span id="cvZ" class="tnum">${Math.round(CV_ZOOM * 100)}%</span><button type="button" data-z="1" aria-label="Ampliar">+</button></div></div>`)
      .replace('<div class="cvpaper" id="cvPaper" translate="no"></div>', `<div class="cvpaper" id="cvPaper" translate="no" style="--z:${CV_ZOOM}"></div><div class="cvrev" id="cvRev"></div>`)
;
    /* el bloque "Después de firmar" pasa al final del formulario: la columna derecha queda para el contrato */
    const a = h.indexOf('<div class="panel cvafter">'), b = a >= 0 ? h.indexOf("</aside>", a) : -1;
    if (a >= 0 && b > a) { const after = h.slice(a, b); h = h.slice(0, a) + h.slice(b); h = h.replace("</form>", after + "</form>"); }
    return h;
  };
  const mount = mountContract;
  mountContract = function () {
    mount.apply(this, arguments);
    const form = $("#cvForm"), paper = $("#cvPaper"); if (!form || !paper) return;
    cvBindParty("sel"); cvBindParty("com");
    /* rellenar el vehículo desde mis vehículos */
    const vs = cvVehicleSources(), veh = $("#cvVeh header");
    if (veh && vs.length && !veh.querySelector(".cvtools")) {
      veh.insertAdjacentHTML("beforeend", `<div class="cvtools"><select class="in sm" id="cvFromV" aria-label="Rellenar desde uno de mis vehículos"><option value="">Rellenar con uno de mis vehículos…</option>${vs.map(x => `<option value="${esc(x.k)}">${esc(x.t)}</option>`).join("")}</select></div>`);
      $("#cvFromV").onchange = e => { const x = vs.find(z => z.k === e.target.value); if (x) cvFromVehicle(x.v); e.target.value = ""; };
    }
    const q = route().query || {};
    if (q.mercado && !window.__cvFromMk) { window.__cvFromMk = q.mercado; setTimeout(() => cvFromMarket(q.mercado), 60); }
    /* el contrato sigue al campo en el que estás */
    form.addEventListener("focusin", e => { const p = e.target.dataset && e.target.dataset.cv; if (!p) return; const s = cvSecOf(p); if (s !== CV_FOCUS) { CV_FOCUS = s; cvMarkFocus(); cvScrollPaper(s); cvRenderSecs(); } });
    form.addEventListener("keydown", e => { if (e.key !== "Enter" || e.target.tagName !== "INPUT" || e.target.type === "checkbox") return; e.preventDefault();
      const all = $$("[data-cv]", form).filter(x => !x.disabled && x.offsetParent), i = all.indexOf(e.target); if (all[i + 1]) all[i + 1].focus(); });
    form.addEventListener("input", e => { const p = e.target.dataset && e.target.dataset.cv; if (p === "veh.vin") { const mk = cvWmiMake(e.target.value); if (mk && !String(cvState().veh.marca || "").trim() && e.target.value.length >= 3) cvFill({ "veh.marca": mk }); } });
    /* clic en el contrato → al campo */
    paper.addEventListener("click", e => {
      const mk = e.target.closest("mark[data-hole]");
      const path = mk && cvHolePath(mk);
      if (path && cvFocusPath(path)) return;
      const blk = e.target.closest("[data-sec]"); if (!blk) return;
      const sec = blk.dataset.sec, first = { sel: "#cvSel", com: "#cvCom", veh: "#cvVeh", pago: "#cvPago", entrega: "#cvPago", estado: "#cvEst", place: "#cvFir", firma: "#cvFir" }[sec];
      const t = first && $(first); if (t) { t.scrollIntoView({ behavior: "smooth", block: "start" }); const inp = t.querySelector("[data-cv]"); if (inp) setTimeout(() => inp.focus({ preventScroll: true }), 400); }
    });
    /* zoom */
    $$(".cvzoom [data-z]").forEach(b => b.onclick = () => { CV_ZOOM = Math.max(.8, Math.min(1.4, Math.round((CV_ZOOM + (+b.dataset.z) * .1) * 10) / 10)); paper.style.setProperty("--z", CV_ZOOM); $("#cvZ").textContent = Math.round(CV_ZOOM * 100) + "%"; try { store.set("cvzoom", CV_ZOOM); } catch (e) {} });
    cvUpdate();
  };
  /* tras cambiar de particular a empresa se vuelven a pintar los botones de la cabecera */
  const rp = cvRerenderParty;
  cvRerenderParty = function (side) { rp.apply(this, arguments); cvBindParty(side); };
})();

/* desde un anuncio del Mercado, el contrato viene ya rellenado */
patchRoute(/^\/mercado\/([\w-]+)$/, (q, mm) => { const a = $('.mkd-links a[href="#/contrato"]'); if (a) a.setAttribute("href", "#/contrato?mercado=" + encodeURIComponent(mm[1])); });
