/* ============================================================
   v16 — Mercado profesional (gratis)
   · búsqueda + filtros compactos (cajón en móvil), chips activos, cuadrícula / lista
   · comparar hasta 3 vehículos (bandeja fija + tabla con lo mejor resaltado)
   · ficha completa: galería, datos técnicos, coste total estimado, similares
   · ofertas reales en Supabase (tabla offers)
   (todo en funciones: la primera pintura ocurre antes de que esta capa se ejecute)
   ============================================================ */

/* ---------- datos ---------- */
function mkS() {
  return window.__mk2 || (window.__mk2 = { q: "", type: "all", cat: "all", fuel: [], trans: "all", seller: "all", min: "", max: "", yFrom: "", km: "", city: "all", neg: false, sort: "new", view: store.get("mkview", "grid"), shown: 24, drawer: false });
}
function mkTypes() { return [["Vehículos ligeros", "Turismos y furgonetas", "car"], ["Motocicletas", "Motos", "bolt"], ["Transporte pesado", "Pesados", "truck"], ["Náutica", "Náutica", "globe"]]; }
function mkTypeShort(t) { const x = mkTypes().find(y => y[0] === t); return x ? x[1] : t; }
function mkDemoSpecs() {
  return {
    "Honda CBR600RR": { cv: 118, cc: 599, body: "Deportiva", seats: 2, desc: "Daños de caída en carenado derecho y estribera. Motor sin incidencias, arranca y funciona. Se vende tal cual." },
    "DAF CF 85.460": { cv: 460, cc: 12902, body: "Cabeza tractora", seats: 2, desc: "Tractora con cabina dormitorio. Golpe frontal leve en paragolpes y faro. Mantenimientos en concesionario oficial." },
    "Opel Corsa 1.7 CDTi": { cv: 125, cc: 1686, body: "Utilitario", seats: 5, desc: "Coche de diario con ITV en vigor. Embrague cambiado hace 20.000 km. Pequeños roces de uso." },
    "Volkswagen Multivan": { cv: 150, cc: 1968, body: "Monovolumen", seats: 7, desc: "Un solo propietario, mantenimiento oficial completo y dos llaves. Garantía de fábrica en vigor." },
    "Renault Mégane": { cv: 105, cc: 1461, body: "Compacto", seats: 5, desc: "Golpe lateral trasero. Mecánica correcta, ideal para reparar o para piezas." },
    "Mitsubishi Montero": { cv: 160, cc: 3200, body: "Todoterreno", seats: 7, desc: "4x4 con reductora, enganche de remolque y ruedas nuevas. Motor fiable y cuidado." },
    "Mercedes-Benz E-Class": { cv: 170, cc: 2148, body: "Berlina", seats: 5, desc: "Libro de mantenimiento sellado. Interior en cuero en muy buen estado." },
    "Yamaha Wave Runner": { cv: 110, cc: 1049, body: "Moto de agua", seats: 3, desc: "Golpe en el casco, motor revisado. Se vende con remolque." },
  };
}
/* normaliza un anuncio (demo o Supabase) para la vista */
function mkN(m) {
  if (!m || m.__n) return m;
  const d = !m.ref && mkDemoSpecs()[m.title];
  if (d && m.cv == null) Object.assign(m, d);
  m.photos = m.photos && m.photos.length ? m.photos : [m.img];
  m.make = m.make || String(m.title).split(" ")[0];
  m.sellerType = m.sellerType || (/^particular$/i.test(m.seller || "") ? "Particular" : "Profesional");
  m.created = m.created || (now() - (m.days || 0) * 86400000);
  if (m.runs == null) m.runs = true;
  if (m.keys == null) m.keys = true;
  m.__n = true;
  return m;
}
function mkAll() { return market.map(mkN); }
function mkById(id) { return mkN(market.find(x => String(x.id) === String(id))); }
function mkAgo(m) { return m.days === 0 ? "hoy" : m.days === 1 ? "hace 1 día" : `hace ${m.days} días`; }
function mkSpec(m) { return [m.year, num(m.km) + " km", m.fuel, m.trans].filter(x => x && x !== "—").join(" · "); }

/* Supabase: anuncios con todos los datos del vehículo */
function mapMarket(l) {
  const v = l.vehicles || {}, pr = v.profiles || {};
  return {
    id: l.id, ref: v.ref || null, img: photoStem((v.photos || [])[0]), photos: (v.photos || []).map(photoStem),
    title: (v.make || "") + " " + (v.model || ""), make: v.make, model: v.model, year: v.year, km: v.km || 0,
    fuel: v.fuel || "—", trans: v.transmission || "—", city: v.city || "—", prov: v.province || v.city || "—",
    cat: v.category || "limpio", type: l.listing_type || "Vehículos ligeros", price: +l.price, neg: !!l.negotiable,
    seller: pr.company || (v.seller_kind === "profesional" ? "Profesional verificado" : "Particular"), sellerType: pr.company || v.seller_kind === "profesional" ? "Profesional" : "Particular",
    days: Math.max(0, Math.round((Date.now() - new Date(l.created_at)) / 86400000)), created: +new Date(l.created_at),
    cv: v.power_cv || null, cc: v.displacement || null, seats: v.seats || null, body: v.body_type || null, firstReg: v.first_reg || null,
    desc: v.description || "", vin: v.vin || "", score: v.condition_score != null ? v.condition_score : null,
    runs: v.runs !== false, keys: v.has_keys !== false, titleSt: v.title || "limpio",
  };
}
async function sbLoadMarket() {
  const base = `id, price, negotiable, listing_type, created_at,`;
  const rich = base + ` vehicles ( ref, make, model, year, km, fuel, transmission, body_type, power_cv, displacement, seats, vin, first_reg, category, title, condition_score, runs, has_keys, description, photos, city, province, seller_kind )`;
  const poor = base + ` vehicles ( make, model, year, km, fuel, transmission, category, photos, city )`;
  let r = await sb.from("listings").select(rich).eq("status", "activo").order("created_at", { ascending: false });
  if (r.error) { console.warn("listings:", r.error.message); r = await sb.from("listings").select(poor).eq("status", "activo").order("created_at", { ascending: false }); }
  if (r.data) { market.length = 0; r.data.map(mapMarket).forEach(m => market.push(m)); }
}
async function sbLoadInventory() {
  const q = sel => sb.from("auctions").select(sel).in("status", ["programada", "viva", "cerrada", "adjudicada"]).order("starts_at", { ascending: true });
  let { data, error } = await q(AUCTION_SELECT);
  if (error && /seller_kind/.test(error.message)) ({ data, error } = await q(AUCTION_SELECT.replace(", seller_kind", "")));
  if (error) { console.warn("auctions:", error.message); return false; }
  const mapped = (data || []).map(mapLot);
  lots.length = 0; mapped.forEach(l => lots.push(l));
  await sbLoadMarket();
  return true;
}

/* ---------- filtros ---------- */
function mkFiltered() {
  const s = mkS(), q = s.q.trim().toLowerCase();
  const list = mkAll().filter(m =>
    (!q || [m.title, m.city, m.prov, m.fuel, m.body, m.ref].join(" ").toLowerCase().includes(q)) &&
    (s.type === "all" || m.type === s.type) && (s.cat === "all" || m.cat === s.cat) &&
    (!s.fuel.length || s.fuel.includes(m.fuel)) && (s.trans === "all" || m.trans === s.trans) &&
    (s.seller === "all" || m.sellerType === s.seller) && (s.city === "all" || m.city === s.city) &&
    (!s.min || m.price >= +s.min) && (!s.max || m.price <= +s.max) &&
    (!s.yFrom || m.year >= +s.yFrom) && (!s.km || m.km <= +s.km) && (!s.neg || m.neg));
  const so = { new: (a, b) => b.created - a.created, low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, km: (a, b) => a.km - b.km, year: (a, b) => b.year - a.year }[s.sort];
  return list.sort(so);
}
function mkActive() {
  const s = mkS(), out = [];
  if (s.q) out.push(["q", `“${s.q}”`]);
  if (s.type !== "all") out.push(["type", mkTypeShort(s.type)]);
  if (s.cat !== "all") out.push(["cat", CATS[s.cat] ? CATS[s.cat].short : s.cat]);
  s.fuel.forEach(f => out.push(["fuel:" + f, f]));
  if (s.trans !== "all") out.push(["trans", s.trans]);
  if (s.seller !== "all") out.push(["seller", s.seller]);
  if (s.city !== "all") out.push(["city", s.city]);
  if (s.min || s.max) out.push(["price", `${s.min ? eur(+s.min) : "0"} – ${s.max ? eur(+s.max) : "∞"}`]);
  if (s.yFrom) out.push(["yFrom", "Desde " + s.yFrom]);
  if (s.km) out.push(["km", "< " + num(+s.km) + " km"]);
  if (s.neg) out.push(["neg", "Negociable"]);
  return out;
}
function mkClear(k) {
  const s = mkS();
  if (!k) return Object.assign(s, { q: "", type: "all", cat: "all", fuel: [], trans: "all", seller: "all", min: "", max: "", yFrom: "", km: "", city: "all", neg: false });
  if (k.startsWith("fuel:")) s.fuel = s.fuel.filter(f => f !== k.slice(5));
  else if (k === "price") { s.min = ""; s.max = ""; }
  else s[k] = ({ q: "", type: "all", cat: "all", trans: "all", seller: "all", city: "all", yFrom: "", km: "", neg: false })[k];
}

/* ---------- comparar ---------- */
function cmpIds() { return (store.get("cmp", []) || []).filter(id => market.some(m => String(m.id) === String(id))).slice(0, 3); }
function cmpToggle(id) {
  let ids = cmpIds(); id = String(id);
  if (ids.includes(id)) ids = ids.filter(x => x !== id);
  else { if (ids.length >= 3) { toast("Puedes comparar hasta 3 vehículos", "alert"); return false; } ids.push(id); }
  store.set("cmp", ids); cmpTray(); $$(`[data-cmp="${id}"]`).forEach(c => { c.checked = ids.includes(id); c.closest(".mcmp") && c.closest(".mcmp").classList.toggle("on", ids.includes(id)); });
  return true;
}
function cmpTray() {
  let t = $("#cmpTray");
  const ids = cmpIds(), path = route().path;
  if (!ids.length || path === "/mercado/comparar" || !/^\/(mercado|$)/.test(path)) { if (t) t.remove(); return; }
  if (!t) { t = document.createElement("div"); t.id = "cmpTray"; t.className = "cmptray"; document.body.appendChild(t); }
  const items = ids.map(mkById);
  t.innerHTML = `<div class="ct-slots">${[0, 1, 2].map(i => items[i] ? `<span class="ct-it"><img src="${imgSrc(items[i].img)}" alt=""><b>${esc(items[i].title)}</b><button data-cmprm="${items[i].id}" aria-label="Quitar">${ic("x", "sm")}</button></span>` : `<span class="ct-it empty">${ic("plus", "sm")}<b>Añade otro</b></span>`).join("")}</div>
    <div class="ct-act"><button class="btn sm ghost" id="ctClear">Vaciar</button><a class="btn sm primary ${ids.length < 2 ? "dis" : ""}" href="#/mercado/comparar" ${ids.length < 2 ? 'aria-disabled="true"' : ""}>${ic("scale", "sm")}Comparar (${ids.length})</a></div>`;
  $$("[data-cmprm]", t).forEach(b => b.onclick = () => cmpToggle(b.dataset.cmprm));
  $("#ctClear").onclick = () => { store.set("cmp", []); $$("[data-cmp]").forEach(c => { c.checked = false; c.closest(".mcmp") && c.closest(".mcmp").classList.remove("on"); }); cmpTray(); };
  const a = $(".ct-act a", t); a.onclick = e => { if (ids.length < 2) { e.preventDefault(); toast("Elige al menos 2 vehículos", "scale"); } };
}
document.addEventListener("change", e => { const c = e.target.closest && e.target.closest("[data-cmp]"); if (c) { if (!cmpToggle(c.dataset.cmp)) c.checked = false; } });
window.addEventListener("hashchange", () => setTimeout(cmpTray, 50));

/* ---------- tarjetas ---------- */
function mkCard(m, i = 0) {
  m = mkN(m); const inCmp = cmpIds().includes(String(m.id));
  return `<article class="mc" data-rev style="--d:${Math.min(i, 8) * 45}ms">
    <a class="mc-ph" href="#/mercado/${m.id}" aria-label="${esc(m.title)}"><img src="${imgSrc(m.img)}" alt="${esc(m.title)}" loading="lazy">
      <span class="mc-type">${mkTypeShort(m.type)}</span>${m.photos.length > 1 ? `<span class="mc-n">${m.photos.length} fotos</span>` : ""}</a>
    <button class="mc-fav ${S.favs.has(m.id) ? "on" : ""}" data-fav="${m.id}" aria-label="Guardar">${ic("heart", "sm")}</button>
    <div class="mc-bd">
      <a href="#/mercado/${m.id}"><h3>${esc(m.title)}</h3></a>
      <div class="mc-spec tnum">${mkSpec(m)}</div>
      <div class="mc-tags"><span class="chip ${CATS[m.cat].chip}">${CATS[m.cat].short}</span><span class="chip">${m.sellerType === "Profesional" ? ic("building", "sm") : ic("user", "sm")}${m.sellerType}</span></div>
      <div class="mc-foot"><div class="mc-price"><b class="tnum">${eur(m.price)}</b><small>${m.neg ? "Negociable" : "Precio fijo"}</small></div>
        <div class="mc-loc">${ic("pin", "sm")}${esc(m.city)}<small>${mkAgo(m)}</small></div></div>
      <label class="mcmp ${inCmp ? "on" : ""}"><input type="checkbox" data-cmp="${m.id}" ${inCmp ? "checked" : ""}><span>Comparar</span></label>
    </div></article>`;
}
function mkRow(m) {
  m = mkN(m); const inCmp = cmpIds().includes(String(m.id));
  return `<div class="mr" role="row">
    <a class="mr-im" href="#/mercado/${m.id}"><img src="${imgSrc(m.img)}" alt="" loading="lazy"></a>
    <div class="mr-t"><a href="#/mercado/${m.id}"><b>${esc(m.title)}</b></a><small>${mkTypeShort(m.type)} · <span class="chip ${CATS[m.cat].chip}">${CATS[m.cat].short}</span></small></div>
    <span class="tnum">${m.year}</span><span class="tnum">${num(m.km)} km</span><span>${esc(m.fuel)}</span><span>${esc(m.trans)}</span>
    <span class="mr-loc">${esc(m.city)}<small>${m.sellerType}</small></span>
    <span class="mr-p tnum"><b>${eur(m.price)}</b><small>${m.neg ? "Negociable" : "Fijo"}</small></span>
    <span class="mr-a"><label class="mcmp sm ${inCmp ? "on" : ""}" title="Comparar"><input type="checkbox" data-cmp="${m.id}" ${inCmp ? "checked" : ""}><span>${ic("scale", "sm")}</span></label><button class="btn xs primary" data-offer="${m.id}">${m.neg ? "Oferta" : "Contactar"}</button></span>
  </div>`;
}

/* ---------- vista: listado ---------- */
function mkFilters() {
  const s = mkS(), all = mkAll();
  const cnt = (k, v) => all.filter(m => m[k] === v).length;
  const cities = [...new Set(all.map(m => m.city).filter(c => c && c !== "—"))].sort((a, b) => a.localeCompare(b, "es"));
  const fuels = ["Gasolina", "Diésel", "Híbrido", "Eléctrico", "GLP"];
  return `<div class="mf-h"><b>${ic("search", "sm")}Filtros</b><button class="link" id="mfReset">Limpiar</button><button class="mf-x" id="mfClose" aria-label="Cerrar">${ic("x")}</button></div>
    <div class="mf-g"><h4>Estado</h4><div class="mf-chips" id="mfCat">${[["all", "Todos"], ["limpio", "Sin daños"], ["danado", "Dañados"], ["siniestro", "Desguace"]].map(([k, t]) => `<button class="${s.cat === k ? "on" : ""}" data-v="${k}">${t}${k !== "all" ? `<i>${cnt("cat", k)}</i>` : ""}</button>`).join("")}</div></div>
    <div class="mf-g"><h4>Precio</h4><div class="mf-two"><div class="money sm"><span>€</span><input class="in" id="mfMin" type="number" inputmode="numeric" placeholder="Mín." value="${s.min}"></div><div class="money sm"><span>€</span><input class="in" id="mfMax" type="number" inputmode="numeric" placeholder="Máx." value="${s.max}"></div></div>
      <div class="mf-quick">${[["", "3000", "< 3.000"], ["3000", "6000", "3–6k"], ["6000", "10000", "6–10k"], ["10000", "", "> 10k"]].map(([a, b, t]) => `<button data-pr="${a}|${b}" class="${s.min === a && s.max === b ? "on" : ""}">${t}</button>`).join("")}</div></div>
    <div class="mf-g"><h4>Año desde</h4><select class="in" id="mfYear"><option value="">Cualquiera</option>${[2022, 2020, 2018, 2015, 2012, 2010, 2005].map(y => `<option ${String(y) === s.yFrom ? "selected" : ""}>${y}</option>`).join("")}</select></div>
    <div class="mf-g"><h4>Kilómetros máx.</h4><select class="in" id="mfKm"><option value="">Cualquiera</option>${[50000, 100000, 150000, 200000, 300000].map(k => `<option value="${k}" ${String(k) === s.km ? "selected" : ""}>${num(k)} km</option>`).join("")}</select></div>
    <div class="mf-g"><h4>Combustible</h4><div class="mf-chips" id="mfFuel">${fuels.map(f => `<button class="${s.fuel.includes(f) ? "on" : ""}" data-v="${f}">${f}</button>`).join("")}</div></div>
    <div class="mf-g"><h4>Cambio</h4><div class="seg mf-seg" id="mfTrans">${[["all", "Todos"], ["Manual", "Manual"], ["Automático", "Automático"]].map(([k, t]) => `<button class="${s.trans === k ? "on" : ""}" data-v="${k}">${t}</button>`).join("")}</div></div>
    <div class="mf-g"><h4>Vendedor</h4><div class="seg mf-seg" id="mfSeller">${[["all", "Todos"], ["Profesional", "Profesional"], ["Particular", "Particular"]].map(([k, t]) => `<button class="${s.seller === k ? "on" : ""}" data-v="${k}">${t}</button>`).join("")}</div></div>
    <div class="mf-g"><h4>Ubicación</h4><select class="in" id="mfCity"><option value="all">Toda España</option>${cities.map(c => `<option ${s.city === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></div>
    <label class="mf-tog"><span>Solo precio negociable</span><span class="toggle"><input type="checkbox" id="mfNeg" ${s.neg ? "checked" : ""}><span></span></span></label>
    <button class="btn primary block mf-apply" id="mfApply">Ver resultados</button>`;
}
function viewMarket() {
  const s = mkS(), all = mkAll();
  const tc = t => all.filter(m => m.type === t).length;
  return `<div class="wrap mkw">
  <header class="mkh" data-rev>
    <div><div class="eyebrow">${ic("store", "sm")}Mercado · gratis para todos</div><h1>Vehículos en venta</h1>
      <p class="muted">Precio fijo o negociable, trato directo con el vendedor. Compara hasta 3 vehículos antes de decidir.</p></div>
    <a class="btn primary" href="#/publicar?t=mercado">${ic("plus", "sm")}Publicar gratis</a>
  </header>
  <div class="mksearch" data-rev>
    <div class="search">${ic("search")}<input class="in" id="mkQ" placeholder="Marca, modelo, ciudad o referencia…" value="${esc(s.q)}" autocomplete="off"></div>
    <div class="mktypes" id="mkTypes"><button class="${s.type === "all" ? "on" : ""}" data-v="all">Todos<i>${all.length}</i></button>${mkTypes().map(([k, t, i]) => `<button class="${s.type === k ? "on" : ""}" data-v="${k}">${ic(i, "sm")}${t}<i>${tc(k)}</i></button>`).join("")}</div>
  </div>
  <div class="mkgrid">
    <aside class="mkf ${s.drawer ? "open" : ""}" id="mkF">${mkFilters()}</aside>
    <div class="mkres">
      <div class="mkbar2">
        <button class="btn sm mkfbtn" id="mkFBtn">${ic("search", "sm")}Filtros${mkActive().length ? ` <i class="cnt">${mkActive().length}</i>` : ""}</button>
        <span id="mkCount" class="muted"></span>
        <div class="mkbar-r">
          <select class="in" id="mkSort" aria-label="Ordenar">${[["new", "Más recientes"], ["low", "Precio más bajo"], ["high", "Precio más alto"], ["km", "Menos kilómetros"], ["year", "Más nuevos"]].map(([k, t]) => `<option value="${k}" ${s.sort === k ? "selected" : ""}>${t}</option>`).join("")}</select>
          <div class="seg mkview" id="mkView"><button class="${s.view === "grid" ? "on" : ""}" data-v="grid" aria-label="Cuadrícula">${ic("menu", "sm")}</button><button class="${s.view === "list" ? "on" : ""}" data-v="list" aria-label="Lista">${ic("doc", "sm")}</button></div>
        </div>
      </div>
      <div class="mkact" id="mkAct"></div>
      <div id="mkList"></div>
      <section class="mkalert" data-rev>${ic("bell")}<div><b>¿No encuentras lo que buscas?</b><span>Guarda esta búsqueda y te avisamos cuando se publique un vehículo que encaje.</span></div><button class="btn sm" id="mkSave">${ic("bell", "sm")}Guardar búsqueda</button></section>
    </div>
  </div>
  <div class="mkscrim" id="mkScrim"></div>
  </div>`;
}
function renderMarket() {
  const s = mkS(), list = mkFiltered(), box = $("#mkList"); if (!box) return;
  const shown = list.slice(0, s.shown);
  $("#mkCount").innerHTML = `<b class="tnum">${list.length}</b> ${list.length === 1 ? "vehículo" : "vehículos"}`;
  const act = mkActive();
  $("#mkAct").innerHTML = act.length ? act.map(([k, t]) => `<button class="achip" data-clr="${esc(k)}">${esc(t)}${ic("x", "sm")}</button>`).join("") + `<button class="link" data-clr="">Quitar todo</button>` : "";
  box.className = s.view === "list" ? "mklist" : "mkcards";
  box.innerHTML = !list.length
    ? `<div class="panel empty">${ic("search", "lg")}<b>Ningún vehículo coincide</b><span>Prueba a ampliar el precio o quitar algún filtro.</span><button class="btn sm" data-clr="">Quitar filtros</button></div>`
    : s.view === "list"
      ? `<div class="mr mr-h" role="row"><span></span><span>Vehículo</span><span>Año</span><span>Km</span><span>Combustible</span><span>Cambio</span><span>Ubicación</span><span>Precio</span><span></span></div>${shown.map(mkRow).join("")}`
      : shown.map(mkCard).join("");
  if (list.length > shown.length) box.insertAdjacentHTML("beforeend", `<div class="mkmore"><button class="btn" id="mkMore">Ver más (${list.length - shown.length})</button></div>`);
  $$("[data-clr]").forEach(b => b.onclick = () => { mkClear(b.dataset.clr); router(); });
  $$("[data-offer]", box).forEach(b => b.onclick = () => offerModal(mkById(b.dataset.offer)));
  if ($("#mkMore")) $("#mkMore").onclick = () => { s.shown += 24; renderMarket(); };
  bindCards(box); initReveal(box);
  const fb = $("#mkFBtn"); if (fb) fb.innerHTML = `${ic("search", "sm")}Filtros${act.length ? ` <i class="cnt">${act.length}</i>` : ""}`;
}
function mountMarket() {
  const s = mkS(), r = () => renderMarket();
  const refilter = () => { s.shown = 24; const f = $("#mkF"); if (f) { const o = f.classList.contains("open"); f.innerHTML = mkFilters(); bindFilters(); f.classList.toggle("open", o); } r(); };
  let t; $("#mkQ").oninput = e => { clearTimeout(t); t = setTimeout(() => { s.q = e.target.value; s.shown = 24; r(); }, 160); };
  $$("#mkTypes button").forEach(b => b.onclick = () => { s.type = b.dataset.v; $$("#mkTypes button").forEach(x => x.classList.toggle("on", x === b)); refilter(); });
  $("#mkSort").onchange = e => { s.sort = e.target.value; r(); };
  $$("#mkView button").forEach(b => b.onclick = () => { s.view = b.dataset.v; store.set("mkview", s.view); $$("#mkView button").forEach(x => x.classList.toggle("on", x === b)); r(); });
  const drawer = o => { s.drawer = o; $("#mkF").classList.toggle("open", o); $("#mkScrim").classList.toggle("on", o); document.documentElement.classList.toggle("mk-lock", o); };
  $("#mkFBtn").onclick = () => drawer(true);
  $("#mkScrim").onclick = () => drawer(false);
  $("#mkSave").onclick = () => {
    const act = mkActive();
    const f = { q: s.q, type: s.type, cat: s.cat, fuel: s.fuel, trans: s.trans, seller: s.seller, min: s.min, max: s.max, yFrom: s.yFrom, km: s.km, city: s.city, neg: s.neg };
    saveSearchAlert(act.map(a => a[1]).join(" · ") || "Todos los vehículos", f);
  };
  function bindFilters() {
    const on = (sel, ev, fn) => { const e = $(sel); if (e) e[ev] = fn; };
    $$("#mfCat button").forEach(b => b.onclick = () => { s.cat = b.dataset.v; refilter(); });
    $$("#mfFuel button").forEach(b => b.onclick = () => { const v = b.dataset.v; s.fuel = s.fuel.includes(v) ? s.fuel.filter(x => x !== v) : s.fuel.concat(v); refilter(); });
    $$("#mfTrans button").forEach(b => b.onclick = () => { s.trans = b.dataset.v; refilter(); });
    $$("#mfSeller button").forEach(b => b.onclick = () => { s.seller = b.dataset.v; refilter(); });
    $$("[data-pr]").forEach(b => b.onclick = () => { const [a, c] = b.dataset.pr.split("|"); const same = s.min === a && s.max === c; s.min = same ? "" : a; s.max = same ? "" : c; refilter(); });
    let pt; const price = () => { clearTimeout(pt); pt = setTimeout(() => { s.min = $("#mfMin").value; s.max = $("#mfMax").value; s.shown = 24; r(); $$("[data-pr]").forEach(b => b.classList.toggle("on", b.dataset.pr === s.min + "|" + s.max)); }, 250); };
    on("#mfMin", "oninput", price); on("#mfMax", "oninput", price);
    on("#mfYear", "onchange", e => { s.yFrom = e.target.value; refilter(); });
    on("#mfKm", "onchange", e => { s.km = e.target.value; refilter(); });
    on("#mfCity", "onchange", e => { s.city = e.target.value; refilter(); });
    on("#mfNeg", "onchange", e => { s.neg = e.target.checked; refilter(); });
    on("#mfReset", "onclick", () => { mkClear(); refilter(); });
    on("#mfClose", "onclick", () => drawer(false));
    on("#mfApply", "onclick", () => drawer(false));
  }
  bindFilters();
  drawer(false);
  r(); cmpTray();
}

/* ---------- vista: ficha ---------- */
function mkCost(m) { const g = 149, iva = g * .21; return { g, iva, total: m.price + g + iva }; }
function viewMarketItem(id) {
  const m = mkById(id);
  if (!m) return `<div class="wrap"><div class="panel empty" style="margin:60px 0">${ic("search", "lg")}<b>Anuncio no encontrado</b><span>Puede que se haya vendido o retirado.</span><a class="btn" href="#/mercado">Volver al Mercado</a></div></div>`;
  const inCmp = cmpIds().includes(String(m.id)), c = mkCost(m);
  const specs = [["clock", "Año", m.year], ["gauge", "Kilómetros", num(m.km) + " km"], ["fuel", "Combustible", m.fuel], ["gear", "Cambio", m.trans],
    ["bolt", "Potencia", m.cv ? m.cv + " CV" : null], ["wrench", "Cilindrada", m.cc ? num(m.cc) + " cc" : null], ["car", "Carrocería", m.body], ["users", "Plazas", m.seats],
    ["doc", "1.ª matriculación", m.firstReg ? new Date(m.firstReg).toLocaleDateString("es-ES", { month: "short", year: "numeric" }) : null], ["pin", "Ubicación", m.prov && m.prov !== m.city ? `${m.city}, ${m.prov}` : m.city]].filter(x => x[2] != null && x[2] !== "—" && x[2] !== "");
  const sim = mkAll().filter(x => x.id !== m.id).map(x => ({ x, d: (x.type === m.type ? 0 : 2) + Math.abs(x.price - m.price) / Math.max(m.price, 1) })).sort((a, b) => a.d - b.d).slice(0, 4).map(o => o.x);
  const desc = m.desc || `Vehículo disponible en ${m.city}. ${m.cat === "danado" ? "Presenta daños visibles en las fotos; se vende tal cual." : m.cat === "siniestro" ? "Siniestro: ideal para piezas o reconstrucción." : "Documentación al día."} Consulta cualquier detalle al vendedor.`;
  return `<div class="wrap mkd">
  <nav class="crumbs"><a href="#/mercado">Mercado</a>${ic("right", "sm")}<a href="#/mercado" data-goto-type="${esc(m.type)}">${mkTypeShort(m.type)}</a>${ic("right", "sm")}<span>${esc(m.title)}</span></nav>
  <div class="mkd-grid">
    <div class="mkd-main">
      <div class="gal" id="mkGal" data-i="0">
        <div class="gal-main"><img id="galImg" src="${imgSrc(m.photos[0])}" alt="${esc(m.title)}">
          ${m.photos.length > 1 ? `<button class="gal-nav p" data-gal="-1" aria-label="Anterior">${ic("left")}</button><button class="gal-nav n" data-gal="1" aria-label="Siguiente">${ic("right")}</button>` : ""}
          <span class="gal-c tnum" id="galC">1 / ${m.photos.length}</span><span class="mc-type">${mkTypeShort(m.type)}</span></div>
        ${m.photos.length > 1 ? `<div class="gal-th">${m.photos.map((p, i) => `<button class="${i ? "" : "on"}" data-gi="${i}"><img src="${imgSrc(p)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
      </div>
      <div class="mkd-title">
        <div class="mc-tags"><span class="chip ${CATS[m.cat].chip}">${CATS[m.cat].short}</span><span class="chip">${m.neg ? "Precio negociable" : "Precio fijo"}</span>${m.ref ? `<span class="chip mono" translate="no">${esc(m.ref)}</span>` : ""}</div>
        <h1>${esc(m.title)}</h1>
        <p class="muted tnum">${mkSpec(m)} · ${esc(m.city)} · publicado ${mkAgo(m)}</p>
      </div>
      <h2 class="h-sec">${ic("car")}Datos del vehículo</h2>
      <div class="specg">${specs.map(([i, k, v]) => `<div><span>${ic(i, "sm")}${k}</span><b class="tnum">${esc(String(v))}</b></div>`).join("")}</div>
      <h2 class="h-sec">${ic("msg")}Descripción</h2>
      <p class="mkd-desc">${esc(desc)}</p>
      <h2 class="h-sec">${ic("shield")}Estado</h2>
      <div class="statg">
        <div class="${m.runs ? "ok" : "warn"}">${ic(m.runs ? "check" : "alert", "sm")}${m.runs ? "Arranca y circula" : "No circula"}</div>
        <div class="${m.keys ? "ok" : "warn"}">${ic(m.keys ? "check" : "alert", "sm")}${m.keys ? "Con llaves" : "Sin llaves"}</div>
        <div class="${m.cat === "limpio" ? "ok" : "warn"}">${ic(m.cat === "limpio" ? "check" : "alert", "sm")}${m.cat === "limpio" ? "Sin daños declarados" : m.cat === "danado" ? "Daños declarados" : "Siniestro / piezas"}</div>
        ${m.score != null ? `<div class="sc"><span>Puntuación de estado</span><b class="tnum">${m.score}/100</b><i style="--w:${m.score}%"></i></div>` : ""}
      </div>
      ${m.vin ? `<div class="vinrow">${ic("search", "sm")}<span>VIN <b class="mono" translate="no">${S.user ? esc(m.vin) : esc(m.vin.slice(0, 3)) + "••••••••" + esc(m.vin.slice(-4))}</b></span>${S.user ? `<a class="link" href="https://vincheckspain.com" target="_blank" rel="noopener">Comprobar historial ${ic("right", "sm")}</a>` : `<a class="link" href="#/login">Inicia sesión para verlo</a>`}</div>` : ""}
    </div>
    <aside class="mkd-side">
      <div class="pbox">
        <small class="muted">${m.neg ? "Precio · negociable" : "Precio"}</small>
        <div class="pbox-p tnum">${eur(m.price)}</div>
        <button class="btn primary block" id="miOffer">${ic("msg", "sm")}${m.neg ? "Hacer una oferta" : "Contactar con el vendedor"}</button>
        <div class="pbox-r">
          <label class="mcmp blk ${inCmp ? "on" : ""}"><input type="checkbox" data-cmp="${m.id}" ${inCmp ? "checked" : ""}><span>${ic("scale", "sm")}Comparar</span></label>
          <button class="btn sm ${S.favs.has(m.id) ? "on" : ""}" id="miFav">${ic("heart", "sm")}Guardar</button>
          <button class="btn sm" id="miShare">${ic("share", "sm")}Compartir</button>
        </div>
        <div class="pbox-cost">
          <div class="kv"><span>Precio del vehículo</span><span class="tnum">${eur(m.price)}</span></div>
          <div class="kv"><span>Transferencia (gestoría)</span><span class="tnum">${eur(c.g)}</span></div>
          <div class="kv"><span>IVA de la gestoría</span><span class="tnum">${eur(c.iva)}</span></div>
          <div class="kv total"><span>Coste total estimado</span><span class="tnum">${eur(c.total)}</span></div>
          <small class="faint">${m.sellerType === "Particular" ? "Si compras a un particular, pagas además el ITP de tu comunidad." : "Comprando a un profesional, la operación suele llevar IVA y no ITP."} Sin comisiones de MotorSubasta.</small>
        </div>
      </div>
      <div class="panel sellerc" id="mkContact"><span class="avatar">${m.sellerType === "Profesional" ? ic("building", "sm") : ic("user", "sm")}</span>
        <div><b>${esc(m.sellerType === "Profesional" ? m.seller : "Vendedor particular")}</b><small class="muted">${m.sellerType} · ${esc(m.city)}</small></div></div>
      <div class="mkd-links">
        <a href="#/contrato">${ic("doc", "sm")}<span><b>Contrato de compraventa</b><small>Gratis, con firma y PDF</small></span>${ic("right", "sm")}</a>
        <a href="#/seguros?mercado=${encodeURIComponent(m.id)}">${ic("umbrella", "sm")}<span><b>Seguro para llevártelo</b><small>Ofertas sin compromiso</small></span>${ic("right", "sm")}</a>
      </div>
    </aside>
  </div>
  ${sim.length ? `<section class="mksim"><div class="sec-head"><div><h2>Vehículos similares</h2></div><a class="link" href="#/mercado">Ver todo el Mercado ${ic("right", "sm")}</a></div><div class="mkcards">${sim.map(mkCard).join("")}</div></section>` : ""}
  <div class="mkd-bar"><div><b class="tnum">${eur(m.price)}</b><small>${m.neg ? "Negociable" : "Precio fijo"}</small></div><button class="btn primary" id="miOffer2">${m.neg ? "Hacer oferta" : "Contactar"}</button></div>
  </div>`;
}
function mountMarketItem(id) {
  const m = mkById(id); if (!m) return;
  const go = () => offerModal(m);
  $("#miOffer").onclick = go; if ($("#miOffer2")) $("#miOffer2").onclick = go;
  $("#miFav").onclick = () => { toggleFav(m.id); $("#miFav").classList.toggle("on", S.favs.has(m.id)); };
  $("#miShare").onclick = () => shareListing(m);
  $$("[data-goto-type]").forEach(a => a.onclick = () => { mkS().type = a.dataset.gotoType; });
  const g = $("#mkGal"); let i = 0;
  const show = n => { i = (n + m.photos.length) % m.photos.length; $("#galImg").src = imgSrc(m.photos[i]); $("#galC").textContent = `${i + 1} / ${m.photos.length}`; $$(".gal-th button", g).forEach((b, k) => b.classList.toggle("on", k === i)); };
  $$("[data-gal]", g).forEach(b => b.onclick = () => show(i + +b.dataset.gal));
  $$("[data-gi]", g).forEach(b => b.onclick = () => show(+b.dataset.gi));
  let x0 = null; const main = $(".gal-main", g);
  main.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  main.addEventListener("touchend", e => { if (x0 == null || m.photos.length < 2) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); x0 = null; });
  const sim = $(".mksim"); if (sim) { bindCards(sim); initReveal(sim); }
  mkContactLoad(m);
  cmpTray();
}

/* ---------- vista: comparar ---------- */
function viewCompare(q) {
  if (q && q.ids) store.set("cmp", String(q.ids).split(",").slice(0, 3));
  const items = cmpIds().map(mkById);
  if (items.length < 2) return `<div class="wrap"><div class="panel empty" style="margin:60px 0">${ic("scale", "lg")}<b>Elige al menos 2 vehículos</b><span>Marca «Comparar» en los anuncios del Mercado (hasta 3).</span><a class="btn primary" href="#/mercado">Ir al Mercado</a></div></div>`;
  const best = (f, dir) => { const vals = items.map(f).filter(v => v != null); if (vals.length < 2 || new Set(vals).size < 2) return null; return dir < 0 ? Math.min(...vals) : Math.max(...vals); };
  const rows = [
    ["Precio", m => m.price, v => eur(v), -1],
    ["Coste total estimado", m => mkCost(m).total, v => eur(v), -1],
    ["Año", m => m.year, v => v, 1],
    ["Kilómetros", m => m.km, v => num(v) + " km", -1],
    ["Potencia", m => m.cv, v => v + " CV", 1],
    ["Cilindrada", m => m.cc, v => num(v) + " cc", 0],
    ["Combustible", m => m.fuel, v => v, 0],
    ["Cambio", m => m.trans, v => v, 0],
    ["Carrocería", m => m.body, v => v, 0],
    ["Plazas", m => m.seats, v => v, 0],
    ["Estado", m => CATS[m.cat].short, v => v, 0],
    ["Precio negociable", m => m.neg ? "Sí" : "No", v => v, 0],
    ["Vendedor", m => m.sellerType, v => v, 0],
    ["Ubicación", m => m.city, v => v, 0],
    ["Publicado", m => m.days, v => v === 0 ? "hoy" : v === 1 ? "hace 1 día" : `hace ${v} días`, -1],
  ];
  const cheapest = Math.min(...items.map(m => m.price));
  return `<div class="wrap cmpw">
  <nav class="crumbs"><a href="#/mercado">Mercado</a>${ic("right", "sm")}<span>Comparar</span></nav>
  <div class="cmp-h"><div><div class="eyebrow">${ic("scale", "sm")}Comparador</div><h1>Comparar ${items.length} vehículos</h1><p class="muted">En verde, el mejor valor de cada fila.</p></div>
    <label class="mf-tog"><span>Solo diferencias</span><span class="toggle"><input type="checkbox" id="cmpDiff"><span></span></span></label></div>
  <div class="cmp-scroll"><div class="cmp" style="--n:${items.length}">
    <div class="cmp-r cmp-top"><div class="cmp-k"></div>${items.map(m => `<div class="cmp-c">
      <a class="cmp-ph" href="#/mercado/${m.id}"><img src="${imgSrc(m.img)}" alt=""></a>
      <a href="#/mercado/${m.id}"><b>${esc(m.title)}</b></a>
      <span class="cmp-pr tnum">${eur(m.price)}${m.price > cheapest ? `<small>+${eur(m.price - cheapest)}</small>` : `<small class="okc">El más barato</small>`}</span>
      <div class="cmp-btns"><button class="btn sm primary" data-offer="${m.id}">${m.neg ? "Oferta" : "Contactar"}</button><button class="btn sm ghost" data-cmprm2="${m.id}" aria-label="Quitar">${ic("x", "sm")}</button></div></div>`).join("")}</div>
    ${rows.map(([k, f, fmt, dir]) => {
      const vals = items.map(f), b = dir ? best(f, dir) : null, same = new Set(vals.map(String)).size === 1;
      return `<div class="cmp-r ${same ? "same" : ""}"><div class="cmp-k">${k}</div>${vals.map(v => `<div class="cmp-c ${b != null && v === b ? "best" : ""}">${v == null || v === "—" ? `<span class="faint">—</span>` : esc(String(fmt(v)))}${b != null && v === b ? ` ${ic("check", "sm")}` : ""}</div>`).join("")}</div>`;
    }).join("")}
  </div></div>
  <p class="faint" style="font-size:12.5px;margin-top:12px">Coste total estimado = precio + transferencia por gestoría (149 € + IVA). No incluye ITP ni transporte.</p>
  </div>`;
}
function mountCompare() {
  const d = $("#cmpDiff"); if (d) d.onchange = e => $(".cmp").classList.toggle("diff", e.target.checked);
  $$("[data-cmprm2]").forEach(b => b.onclick = () => { cmpToggle(b.dataset.cmprm2); router(); });
  $$("[data-offer]").forEach(b => b.onclick = () => offerModal(mkById(b.dataset.offer)));
  cmpTray();
}

/* ---------- ofertas: reales con Supabase ---------- */
function offerModal(m) {
  m = mkN(m);
  if (!S.user) { toast("Inicia sesión para contactar con el vendedor", "user"); location.hash = "#/login"; return; }
  const neg = m.neg;
  modal(neg ? "Hacer una oferta" : "Contactar con el vendedor", `<div class="ofm"><img src="${imgSrc(m.img)}" alt=""><div><b>${esc(m.title)}</b><small class="muted">${mkSpec(m)}</small><small>Precio anunciado <b class="tnum">${eur(m.price)}</b></small></div></div>
    ${neg ? `<div class="field"><label for="oAmt">Tu oferta</label><div class="money"><span>€</span><input class="in tnum" id="oAmt" type="number" inputmode="numeric" step="50" value="${Math.round(m.price * .93 / 50) * 50}"></div>
      <div class="ofq">${[.9, .95, 1].map(p => `<button type="button" data-op="${p}">${p === 1 ? "Precio pedido" : "−" + Math.round((1 - p) * 100) + "%"}</button>`).join("")}</div><small class="muted" id="oHint"></small></div>` : ""}
    <div class="field"><label for="oMsg">Mensaje para el vendedor</label><textarea class="in" id="oMsg" rows="3" placeholder="Hola, me interesa. ¿Cuándo se puede ver en ${esc(m.city)}?"></textarea></div>
    <small class="faint">El vendedor recibe tu ${neg ? "oferta" : "mensaje"} y te responde por la plataforma. Tus datos de contacto solo se comparten si aceptáis.</small>
    <div id="oErr"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="oNo">Cancelar</button><button class="btn primary" id="oYes">${ic("msg", "sm")}${neg ? "Enviar oferta" : "Enviar mensaje"}</button></div>`, close => {
    const hint = () => { const v = +$("#oAmt").value, p = v / m.price; $("#oHint").textContent = !v ? "" : p >= .97 ? "Muy cerca del precio: alta probabilidad de aceptación." : p >= .88 ? "Oferta razonable para un precio negociable." : "Oferta baja: el vendedor podría contraofertar o rechazarla."; };
    if ($("#oAmt")) { $("#oAmt").oninput = hint; hint(); $$("[data-op]").forEach(b => b.onclick = () => { $("#oAmt").value = Math.round(m.price * +b.dataset.op / 50) * 50; hint(); }); }
    $("#oNo").onclick = close;
    $("#oYes").onclick = async () => {
      const amt = neg ? +$("#oAmt").value : m.price, msg = $("#oMsg").value.trim().slice(0, 1000);
      if (neg && !(amt > 0)) { $("#oErr").innerHTML = `<div class="err">${ic("alert", "sm")}Indica una cantidad</div>`; return; }
      if (!neg && msg.length < 3) { $("#oErr").innerHTML = `<div class="err">${ic("alert", "sm")}Escribe un mensaje para el vendedor</div>`; return; }
      const btn = $("#oYes"); btn.disabled = true;
      if (typeof LIVE !== "undefined" && LIVE && sb && !/^M\d+$/.test(String(m.id))) {
        const { error } = await sb.from("offers").insert({ listing_id: m.id, buyer_id: S.user.id, amount: amt, message: msg || null });
        if (error) {
          btn.disabled = false;
          $("#oErr").innerHTML = error.code === "42501"
            ? `<div class="err">${ic("alert", "sm")}Verifica tu cuenta para enviar ofertas. <a class="link" href="#/verificacion">Verificar ahora</a></div>`
            : `<div class="err">${ic("alert", "sm")}No se ha podido enviar. Inténtalo de nuevo.</div>`;
          return;
        }
      }
      close();
      toast(neg ? "Oferta de " + eur(amt) + " enviada al vendedor" : "Mensaje enviado al vendedor", "msg");
      notify(`${neg ? "Oferta enviada" : "Mensaje enviado"}: <b>${esc(m.title)}</b>. Te avisaremos cuando responda.`, "msg");
    };
  });
}
async function sbOfferSet(id, status, counter) {
  if (typeof LIVE === "undefined" || !LIVE || !sb || !/^\d+$/.test(String(id))) return;
  const row = { status }; if (counter) row.counter = counter;
  const { error } = await sb.from("offers").update(row).eq("id", id);
  if (error) toast("No se ha podido guardar la respuesta", "alert");
}

/* ---------- rutas ---------- */
(function mkRoutes() {
  const det = ROUTES.findIndex(r => /mercado/.test(String(r[0])) && /\(/.test(String(r[0])));
  const route = [/^\/mercado\/([\w-]+)$/, (q, m) => [viewMarketItem(m[1]), () => mountMarketItem(m[1])]];
  if (det >= 0) ROUTES[det] = route; else ROUTES.unshift(route);
  ROUTES.unshift([/^\/mercado\/comparar$/, q => [viewCompare(q), mountCompare]]);
})();
