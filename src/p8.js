/* ============================================================
   v4 — structure rebuilt to mirror demo.motorsubasta.com
   sessions · pre-bidding · quick bid · full spec sheet
   ============================================================ */

/* ---------- session schedule (CET day) ---------- */
function sessionAt(h, m, dayOffset) { return madridAt(h, m, dayOffset); }   /* hora de España, no la del navegador */
const SES = { limpio: [11, 13], danado: [13, 15], siniestro: [15, 16], oculta: [11, 16] };
function sessionWindow(cat, dayOffset) {
  const [a, b] = SES[cat];
  return [sessionAt(a, 0, dayOffset), sessionAt(b, 0, dayOffset)];
}
/* if today's last session already closed, the whole board moves to tomorrow */
var DAY_OFF = (() => { const [, end] = sessionWindow("siniestro", 0); return now() > end ? 1 : 0; })();

/* ---------- inventory (mirrors the live demo catalogue) ---------- */
const LOTS = [
  // img, year, make, model, km, fuel, trans, city, prov, cat, start, cv, body, panels, featured, buyNow, runs, keys, vin, plate
  ["opel-corsa-verde", 2003, "Opel", "Corsa 1.2", 129000, "Gasolina", "Manual", "Murcia", "Murcia", "limpio", 400, 75, "Compacto", { capo: 1, techo: 1 }, 1, null, 1, 1],
  ["renault-clio", 2019, "Renault", "Clio V 1.0 TCe", 88400, "Gasolina", "Manual", "Bilbao", "Bizkaia", "limpio", 1550, 90, "Compacto", { pdel: 1 }, 0, 9800, 1, 1],
  ["opel-astra", 2009, "Opel", "Astra 1.7 CDTi", 232388, "Diésel", "Manual", "El Campello", "Alicante", "limpio", 975, 110, "Compacto", { pdi: 1, int: 1 }, 0, null, 1, 1],
  ["renault-traffic", 2005, "Renault", "Trafic 1.9 dCi 9 plazas", 481000, "Diésel", "Manual", "Sevilla", "Sevilla", "limpio", 1375, 100, "Furgoneta", { pdel: 2, add: 1 }, 0, null, 1, 1],
  ["bmw-330ci", 2005, "BMW", "330Ci Cabrio", 329000, "Gasolina", "Manual", "El Prat", "Barcelona", "limpio", 825, 231, "Descapotable", {}, 0, 4200, 1, 1],
  ["honda-civic", 2019, "Honda", "Civic 1.0 VTEC", 98500, "Gasolina", "Manual", "Valencia", "Valencia", "limpio", 2250, 129, "Compacto", {}, 1, null, 1, 1],
  ["toyota-yaris", 2015, "Toyota", "Yaris Hybrid", 129050, "Híbrido", "Automático", "Zaragoza", "Zaragoza", "danado", 1750, 100, "Compacto", { pdel: 3, add: 3, capo: 2 }, 1, null, 1, 1],
  ["mercedes-s", 2018, "Mercedes-Benz", "S 350 d", 178000, "Diésel", "Automático", "Finestrat", "Alicante", "danado", 2000, 286, "Berlina", { pdel: 4, adi: 4, capo: 3, pdi: 2 }, 1, 25000, 1, 1],
  ["bmw-325xi", 2016, "BMW", "325xi Touring", 222000, "Diésel", "Automático", "Hospitalet", "Barcelona", "danado", 1750, 218, "Familiar", { pdel: 4, capo: 4, adi: 3, techo: 2, mec: 3 }, 0, null, 0, 1],
  ["ford-transit", 2014, "Ford", "Transit 2.2 TDCi", 464000, "Diésel", "Manual", "Torremolinos", "Málaga", "danado", 818, 125, "Furgoneta", { pdel: 3, add: 4, pdd: 3 }, 0, null, 1, 1],
  ["peugeot-307", 2006, "Peugeot", "307 1.6 HDi", 191000, "Diésel", "Manual", "Granada", "Granada", "danado", 425, 110, "Compacto", { techo: 4, pdi: 4, capo: 2, adi: 3 }, 0, null, 0, 0],
  ["suzuki-jimny", 2011, "Suzuki", "Jimny 1.3 4x4", 238000, "Gasolina", "Manual", "Córdoba", "Córdoba", "danado", 625, 85, "Todoterreno", { techo: 4, pdi: 3, pdel: 3, capo: 3 }, 0, null, 1, 1],
  ["mercedes-e-quemado", 2015, "Mercedes-Benz", "E 220 Cabrio", 189000, "Diésel", "Automático", "Isla de Palma", "Illes Balears", "siniestro", 2250, 170, "Descapotable", { pdel: 4, capo: 4, techo: 4, int: 4, mec: 4, pdi: 4, pdd: 4 }, 0, null, 0, 0],
  ["seat-ibiza", 2016, "SEAT", "Ibiza 1.0 TSI", 89000, "Gasolina", "Manual", "Paterna", "Valencia", "siniestro", 325, 95, "Compacto", { int: 4, mec: 4, pdel: 3, capo: 2 }, 0, null, 0, 1],
  ["bmw-320i", 1993, "BMW", "320i E36", 235000, "Gasolina", "Manual", "Paterna", "Valencia", "siniestro", 75, 150, "Berlina", { pdel: 4, capo: 4, techo: 4, male: 4, int: 4, mec: 4 }, 0, null, 0, 0],
  ["bmw-m3", 1988, "BMW", "M3 E30", 88000, "Gasolina", "Manual", "Calpe", "Alicante", "oculta", 16250, 200, "Coupé", { pdel: 1 }, 1, null, 1, 1],
];
function rebuildInventory() {
  if (typeof LIVE !== "undefined" && LIVE) return;   /* en modo conectado manda la base de datos */
  lots.length = 0;
  LOTS.forEach((r, i) => {
    const [img, year, make, model, km, fuel, trans, city, prov, cat, start, cv, body, panels, featured, buyNow, runs, keys] = r;
    const [s, e] = sessionWindow(cat, DAY_OFF);
    const id = "L" + (412 + i * 7);
    const l = {
      id, ref: "MS-0" + (1001 + i), img, year, make, model, title: `${year} ${make} ${model}`,
      km, fuel, trans, city, prov, cat, start, cv, body, panels, featured: !!featured, buyNow,
      runs: !!runs, keys: !!keys, noReserve: true, startsAt: s, endsAt: e, hist: [], watchers: 6 + (i * 13) % 44,
      vin: ("VF" + (img.length * 7919 + i * 104729).toString(36).toUpperCase() + "K" + (year % 100) + "0" + i + "7Z").slice(0, 17).padEnd(17, "3"),
      plate: ["4218 BJD", "6123 LJR", "2347 KHT", "2087 FKT", "6892 CFX", "9921 LKM", "••••", "7321 KJR", "8432 KMG", "4827 KDV", "0712 FVR", "1189 JLT", "4564 JBT", "1948 JXH", "B 8724 NV", "M-3 E30"][i],
      firstReg: `${String(1 + (i % 28)).padStart(2, "0")}/${String(1 + (i % 12)).padStart(2, "0")}/${year}`,
      cc: [1200, 999, 1686, 1870, 2979, 988, 1497, 2925, 1995, 2198, 1560, 1328, 2143, 999, 1991, 2302][i],
      seats: [5, 5, 5, 9, 4, 5, 5, 5, 5, 3, 5, 4, 4, 5, 5, 4][i],
      sellerType: i % 3 === 0 ? "Particular" : i % 3 === 1 ? "Empresa" : "Aseguradora",
    };
    // a scheduled lot can already hold pre-bids
    const pre = featured ? 2 + (i % 3) : i % 3;
    let cur = start;
    for (let k = 0; k < pre; k++) { cur += inc(cur); l.hist.unshift({ who: BIDDERS[(i + k * 3) % BIDDERS.length], amt: cur, t: now() - (pre - k) * 17 * MIN, pre: true }); }
    lots.push(l);
  });
  market.length = 0;
  [["honda-cbr", "Honda CBR600RR", 2011, 89655, "Gasolina", "Manual", "Marbella", "danado", "Motocicletas", 3900, 1],
   ["daf-cf", "DAF CF 85.460", 2017, 560900, "Diésel", "Automático", "Elche", "danado", "Transporte pesado", 18500, 1],
   ["opel-astra", "Opel Corsa 1.7 CDTi", 2009, 232388, "Diésel", "Manual", "El Campello", "limpio", "Vehículos ligeros", 8900, 1],
   ["honda-civic", "Volkswagen Multivan", 2023, 98000, "Diésel", "Automático", "El Prat", "limpio", "Vehículos ligeros", 24500, 1],
   ["renault-clio", "Renault Mégane", 2006, 328522, "Diésel", "Manual", "Palma", "danado", "Vehículos ligeros", 2900, 0],
   ["renault-traffic", "Mitsubishi Montero", 2004, 287000, "Diésel", "Manual", "Madrid", "limpio", "Vehículos ligeros", 17500, 1],
   ["bmw-330ci", "Mercedes-Benz E-Class", 2008, 235000, "Diésel", "Automático", "Valls", "limpio", "Vehículos ligeros", 9800, 1],
   ["mercedes-s", "Yamaha Wave Runner", 2007, 6588, "Gasolina", "Automático", "Calpe", "danado", "Náutica", 4500, 1],
  ].forEach((m, i) => market.push({ id: "M" + (i + 1), img: m[0], title: m[1], year: m[2], km: m[3], fuel: m[4], trans: m[5], city: m[6], cat: m[7], type: m[8], price: m[9], neg: !!m[10], seller: i % 2 ? "MS Seller" : "Vendedor verificado", days: 1 + i * 2 }));
}
const isPre = l => now() < l.startsAt;              // pre-bidding window (statusOf from the base layer already covers soon/live/end)
const sesName = c => CATS[c].name;

/* ---------- quick-bid used by cards and the bid box ---------- */
function quickBid(id, amount) {
  const l = lots.find(x => x.id === id); if (!l) return;
  if (l.cat === "oculta" && !/Dealer|Full/.test(S.plan)) { toast("Lote exclusivo para planes Dealer", "lock"); location.hash = "#/precios"; return; }
  const min = l.hist.length ? curPrice(l) + inc(curPrice(l)) : l.start;
  const v = Math.max(min, amount);
  const pre = isPre(l);
  modal(pre ? "Confirmar puja anticipada" : "Confirmar puja", `
    <div style="display:flex;gap:12px;align-items:center"><img src="${imgSrc(l.img)}" alt="" style="width:92px;height:66px;object-fit:cover;border-radius:10px"><div><b>${esc(l.title)}</b><div class="muted" style="font-size:13px">${CATS[l.cat].name} · ${esc(l.city)}</div></div></div>
    <div class="kv total" style="border:0;margin:0;padding:0"><span>Tu puja</span><span class="tnum">${eur(v)}</span></div>
    <div class="lead-note" style="background:var(--warn-soft);color:var(--warn)">${ic("alert", "sm")}${pre ? "Tu puja anticipada se aplica al abrir la sesión y se mantiene activa." : "La puja es vinculante durante 30 días y no se puede retirar."}</div>
    <label><input type="checkbox" id="cOk"> <span>Acepto las condiciones de puja</span></label>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes" disabled>${pre ? "Pre-pujar" : "Pujar"} ${eur(v)}</button></div>`, close => {
    $("#cOk").onchange = e => { $("#cYes").disabled = !e.target.checked; };
    $("#cNo").onclick = close;
    $("#cYes").onclick = () => {
      close(); placeBid(l, "Tú", v);
      toast((pre ? "Puja anticipada de " : "Puja de ") + eur(v) + " registrada", "gavel");
      notify(`${pre ? "Puja anticipada" : "Puja"} de <b>${eur(v)}</b> en ${esc(l.title)}.`, "gavel");
    };
  });
}

/* ---------- lot card with inline quick bid ---------- */
function lotCard(l, i = 0) {
  const st = statusOf(l), c = CATS[l.cat], locked = l.cat === "oculta" && !/Dealer|Full/.test(S.plan);
  const lead = S.myBids[l.id] && l.hist[0] && l.hist[0].who === "Tú";
  const cur = curPrice(l), step = inc(cur), nextBid = l.hist.length ? cur + step : l.start;
  const when = st === "soon" ? l.startsAt : l.endsAt;
  const hhmm = tzDiffers(l.startsAt) ? fmtLocal(l.startsAt) : fmtES(l.startsAt);
  return `<article class="card" data-rev style="--d:${Math.min(i, 8) * 55}ms">
    <a class="ph ${locked ? "locked" : ""}" href="#/subasta/${l.id}" aria-label="${esc(l.title)}">
      <img src="${imgSrc(l.img)}" alt="${esc(l.title)}" loading="lazy">
      <div class="lot-tag">
        ${st === "live" ? '<span class="status live"><span class="live-dot" style="background:#fff"></span>En vivo</span>' : st === "soon" ? '<span class="status soon">Programada</span>' : '<span class="status end">Cerrada</span>'}
      </div>
      <span class="lotno">${l.ref}</span>
      ${l.featured ? '<span class="feat">Destacado</span>' : ""}
      ${locked ? `<div class="lockov">${ic("lock", "lg")}<span>Acceso Dealer</span></div>` : ""}
    </a>
    <button class="fav ${S.favs.has(l.id) ? "on" : ""}" data-fav="${l.id}" aria-label="Guardar en favoritos">${ic("heart", "sm")}</button>
    <div class="bd">
      <a href="#/subasta/${l.id}"><h3>${locked ? l.year + " " + l.make + " •••" : esc(l.title)}</h3></a>
      <div class="sub">${num(l.km)} km<span class="dotsep">·</span>${l.fuel}<span class="dotsep">·</span>${esc(l.city)}</div>
      <div class="meta"><span class="chip ${c.chip}">${c.short}</span><span class="chip ok">Sin reserva</span>${lead ? `<span class="chip acc">${ic("check", "sm")}Tu puja lidera</span>` : ""}</div>
      <div class="price-row">
        <div class="price"><small>${l.hist.length ? (st === "soon" ? "Puja anticipada" : "Puja actual") : "Precio de salida"}</small><span class="tnum" data-price="${l.id}">${locked ? "€ •••" : eur(cur)}</span></div>
        <div class="tm"><small>${st === "soon" ? "Empieza " + hhmm : st === "live" ? "Cierra en" : "Finalizada"}</small><span class="t ${st === "live" && l.endsAt - now() < 10 * MIN ? "hot" : ""}" data-tm="${l.id}">${st === "end" ? "—" : fmtLeft(when - now())}</span></div>
      </div>
      ${locked || st === "end" ? "" : !AUCTIONS_OPEN ? `<div class="qbid pv"><button data-notify class="go">${ic("bell", "sm")}Avísame cuando abran</button></div>` : `<div class="qbid">
        <button data-qb="${l.id}" data-amt="${nextBid}" class="go">${ic("gavel", "sm")}${st === "soon" ? "Pre-pujar" : "Pujar"} ${eur(nextBid)}</button>
        ${[step, step * 2, step * 4].map(s => `<button data-qb="${l.id}" data-amt="${cur + s}">+${eur(s)}</button>`).join("")}
      </div>`}
      <div class="bar"><i data-bar="${l.id}" style="width:${st === "live" ? Math.min(100, (now() - l.startsAt) / (l.endsAt - l.startsAt) * 100) : st === "end" ? 100 : 0}%"></i></div>
    </div>
  </article>`;
}
function bindCards(root = document) {
  $$("[data-fav]", root).forEach(b => b.onclick = e => { e.preventDefault(); toggleFav(b.dataset.fav); b.classList.toggle("on", S.favs.has(b.dataset.fav)); });
  $$("[data-qb]", root).forEach(b => b.onclick = e => { e.preventDefault(); quickBid(b.dataset.qb, +b.dataset.amt); });
  fadeImgs(root);
}

/* ---------- HOME ---------- */
function viewHome() {
  // primero lo que se puede pujar ahora, luego lo programado; lo cerrado solo rellena
  const rank = l => ({ live: 0, soon: 1, end: 2 })[statusOf(l)];
  const pop = [...lots].sort((a, b) => rank(a) - rank(b) || (b.featured - a.featured) || b.hist.length - a.hist.length).slice(0, 8);
  const liveN = lots.filter(l => statusOf(l) === "live").length;
  const soonN = lots.filter(l => statusOf(l) === "soon").length;
  const pv = !AUCTIONS_OPEN;
  const mkSec = `<section class="blk" style="padding-top:0"><div class="wrap">
    <div class="sec-head" data-rev><div><div class="eyebrow">${ic("store", "sm")}Mercado · ${pv ? "publicar es gratis" : "precio fijo"}</div><h2 style="margin-top:10px">${pv ? "Coches en venta ahora" : "Descubre el marketplace"}</h2><p>${pv ? "Anuncios a precio fijo de profesionales y particulares. Contacta y negocia directamente." : "Vehículos disponibles a precio fijo, sin esperar a la subasta."}</p></div><a class="link" href="#/mercado">${pv ? "Ver todos los anuncios" : "Ver marketplace"} ${ic("right", "sm")}</a></div>
    <div class="grid">${market.slice(0, pv ? 8 : 4).map(mkCard).join("")}</div>
    ${pv ? `<div class="freecta" data-rev><div><b>¿Vendes un vehículo?</b><span>Publícalo gratis en unos minutos. Sin comisiones durante el lanzamiento.</span></div><a class="btn primary" href="#/publicar?t=mercado">${ic("plus", "sm")}Publicar gratis</a></div>` : ""}
  </div></section>`;
  return `
  <section class="hero hero-v2">
    <div class="hero-img" aria-hidden="true"></div>
    <div class="hero-veil" aria-hidden="true"></div>
    <div class="wrap">
      <span class="hero-badge" data-rev>${ic("shield", "sm")}Plataforma profesional verificada</span>
      ${pv ? `<h1 data-rev style="--d:120ms">Compra y vende vehículos en <em>toda España</em></h1>
      <p class="lead" data-rev style="--d:240ms">Publica tu coche gratis en el Mercado y trata directamente con el comprador. Muy pronto, subastas profesionales de vehículos sin daños, dañados y siniestrados.</p>
      <div class="hero-cta" data-rev style="--d:340ms">
        <a class="btn primary lg" href="#/mercado">${ic("store", "sm")}Ver coches en venta${ic("right", "sm")}</a>
        <a class="btn lg" href="#/publicar?t=mercado">${ic("plus", "sm")}Publicar gratis</a>
        <a class="btn ghost lg" href="#/subastas">${ic("gavel", "sm")}Subastas · próximamente</a>
      </div>` : `<h1 data-rev style="--d:120ms">Tu plataforma profesional de <em>subastas de vehículos</em></h1>
      <p class="lead" data-rev style="--d:240ms">Vehículos sin daños, con defectos, siniestros totales, inundados y para desguace. Compra directo en subasta, con el coste total calculado antes de pujar.</p>
      <div class="hero-cta" data-rev style="--d:340ms">
        <a class="btn primary lg" href="#/subastas">${ic("gavel", "sm")}Ver subastas${ic("right", "sm")}</a>
        <a class="btn lg" href="#/publicar">${ic("upload", "sm")}Publicar vehículo</a>
        <a class="btn ghost lg" href="#/valoracion">${ic("chart", "sm")}Valoración gratuita</a>
      </div>`}
      <div class="hero-pills" data-rev style="--d:440ms">
        ${pv ? `<span>${ic("check", "sm")}Publicar es <b>gratis</b></span><span><i class="live-dot idle"></i>Subastas próximamente</span>` : liveN ? `<span><i class="live-dot"></i><b class="tnum" data-count="${liveN}">${liveN}</b> subastas en directo</span>`
          : soonN ? `<span><i class="live-dot idle"></i><b class="tnum" data-count="${soonN}">${soonN}</b> lotes en puja anticipada</span>`
          : `<span>${ic("gavel", "sm")}<b class="tnum">11:00</b> próxima sesión</span>`}
        <span>${ic("car", "sm")}<b class="tnum" data-count="${lots.length + market.length}">${lots.length + market.length}</b> vehículos</span>
        ${pv ? "" : `<span>${ic("clock", "sm")}<b class="tnum" data-count="4">4</b> sesiones diarias</span>`}
        <span>${ic("pin", "sm")}<b class="tnum" data-count="17">17</b> comunidades</span>
      </div>
    </div>
  </section>

  ${pv ? mkSec.replace('class="blk" style="padding-top:0"', 'class="blk first"') : ""}
  <section class="blk ${pv ? "" : "first"}"><div class="wrap">
    ${pv ? `<div class="sec-head" data-rev><div><div class="eyebrow">${ic("gavel", "sm")}Subastas · próximamente</div><h2 style="margin-top:10px">Cuatro sesiones al día, a hora de España</h2><p>Ya puedes ver cómo serán las sesiones y sus lotes. La puja se activa el día de apertura.</p></div><button class="btn sm primary" data-notify>${ic("bell", "sm")}Avísame</button></div>`
    : `<div class="sec-head" data-rev><div><div class="eyebrow">${ic("clock", "sm")}Sesiones de subasta</div><h2 style="margin-top:10px">Cuatro categorías, cada día</h2><p>Abre una categoría para ver sus lotes. La puja anticipada está abierta hasta que empieza la sesión.</p></div><a class="link" href="#/subastas">Calendario completo ${ic("right", "sm")}</a></div>`}
    <div class="sesslist" id="homeSess" data-rev>${homeSessions()}</div>
  </div></section>

  <section class="blk" style="padding-top:8px"><div class="wrap">
    <div class="sec-head" data-rev><div><div class="eyebrow">${ic("flame", "sm")}${pv ? "Vista previa" : "Subastas populares"}</div><h2 style="margin-top:10px">Lotes con más actividad</h2><p>${pv ? "Así se verán los lotes cuando abran las subastas." : "Puja o pre-puja directamente desde la tarjeta."}</p></div><a class="link" href="#/subastas">Ver todas las subastas ${ic("right", "sm")}</a></div>
    <div class="grid">${pop.map(lotCard).join("")}</div>
  </div></section>

  <section class="procstrip"><div class="wrap">
    <div class="proc" data-rev><span class="t">01 · Adjudicación</span><b>Ganas el lote</b><span>Recibes el desglose con comisión, gestoría y transporte.</span><span class="when">Al cierre de la puja</span></div>
    <div class="proc" data-rev style="--d:70ms"><span class="t">02 · Vendedor</span><b>Acepta o contraoferta</b><span>El vendedor decide sobre la mejor oferta recibida.</span><span class="when">Hasta 24 h</span></div>
    <div class="proc" data-rev style="--d:140ms"><span class="t">03 · Pago y papeles</span><b>Contrato y transferencia</b><span>Pago por transferencia y cambio de titularidad con gestoría.</span><span class="when">48–72 h</span></div>
    <div class="proc" data-rev style="--d:210ms"><span class="t">04 · Entrega</span><b>Retirada o transporte</b><span>Se coordina con el vendedor: recogida propia o portavehículos.</span><span class="when">3–10 días laborables</span></div>
  </div></section>


  <section class="blk" style="background:var(--bg-2);border-block:1px solid var(--line)"><div class="wrap">
    <div class="sec-head" data-rev><div><div class="eyebrow">Cómo funciona</div><h2 style="margin-top:10px">Compra en tres pasos</h2></div></div>
    <div class="steps" data-rev>
      <div class="step"><span class="k">01</span>${ic("search", "lg")}<h4>Explorar</h4><p>Encuentra vehículos de aseguradoras, rentings, concesionarios y particulares.</p></div>
      <div class="step"><span class="k">02</span>${ic("gavel", "lg")}<h4>Pujar</h4><p>Pujas competitivas en tiempo real, o puja anticipada antes de abrir la sesión.</p></div>
      <div class="step"><span class="k">03</span>${ic("check", "lg")}<h4>Ganar</h4><p>Al ganar se desbloquean los datos del vendedor y el sistema de contraoferta de 24 h.</p></div>
      <div class="step"><span class="k">04</span>${ic("truck", "lg")}<h4>Cerrar</h4><p>Gestoría y transporte coordinados hasta la retirada del vehículo.</p></div>
    </div>
    <div class="tags" style="margin-top:18px" data-rev>${[["euro", "Sin comisiones ocultas"], ["users", "Diferentes vendedores"], ["msg", "Soporte en español"]].map(([i, t]) => `<span>${ic(i, "sm")} ${t}</span>`).join("")}</div>
  </div></section>

  ${whySection()}

  ${pv ? "" : mkSec}

  <section class="blk" style="background:var(--bg-2);border-block:1px solid var(--line)"><div class="wrap">
    <div class="sec-head" data-rev><div><div class="eyebrow">Proceso de puja</div><h2 style="margin-top:10px">Pujar es un compromiso real</h2><p>En MotorSubasta las pujas tienen carácter vinculante y contractual. Esto garantiza seriedad y protege a todos los participantes.</p></div></div>
    <div class="cats">
      ${[["doc", "Carácter contractual", "Puja vinculante", "Cada puja es un compromiso real de compra. No hay vuelta atrás."],
        ["clock", "30 días", "Validez 30 días", "Tu puja mantiene su validez durante 30 días naturales."],
        ["scale", "Decisión final", "Aceptación del vendedor", "El vendedor decide si acepta la mejor oferta al finalizar."],
        ["check", "Compromiso", "Formalización", "Si acepta, el comprador formaliza la compra en el plazo indicado."]].map(([i, tag, t, d], n) =>
        `<div class="panel" data-rev style="--d:${n * 70}ms"><span class="chip acc">${ic(i, "sm")}${tag}</span><h3 style="margin:12px 0 6px">${t}</h3><p class="muted" style="margin:0;font-size:13.5px">${d}</p></div>`).join("")}
    </div>
    <div class="commit" style="margin-top:16px">
      <div class="panel" data-rev style="border-color:color-mix(in srgb,var(--bad) 35%,var(--line))"><h3 style="color:var(--bad)">${ic("alert")} Incumplimiento</h3><p class="muted" style="margin:0 0 10px;font-size:13.5px">Si el comprador incumple su compromiso se aplican penalizaciones económicas y posible bloqueo de cuenta.</p><div class="chip bad">La operación puede ofrecerse al segundo mejor postor</div></div>
      <div class="panel" data-rev style="--d:80ms"><h3>¿Por qué estas normas?</h3><ul class="checks">
        <li>${ic("check", "sm")}Pujas serias y profesionales</li><li>${ic("check", "sm")}Protección para vendedores</li>
        <li>${ic("check", "sm")}Entorno seguro de negocio</li><li>${ic("check", "sm")}Sin ofertas especulativas</li></ul></div>
    </div>
  </div></section>

  <section class="blk"><div class="wrap">
    <div class="sec-head" data-rev><div><div class="eyebrow">Para vendedores</div><h2 style="margin-top:10px">Protección y control</h2><p>Como vendedor mantienes el control total en cada etapa: seguridad, transparencia y flexibilidad.</p></div></div>
    <div class="flow" data-rev>
      <div class="fstep"><span class="t">Tu vehículo</span><b>Publicas</b></div>${ic("right")}
      <div class="fstep"><span class="t">Subasta</span><b>Recibes ofertas</b></div>${ic("right")}
      <div class="fstep on"><span class="t">Tu decisión</span><b>Tú decides</b></div>
    </div>
    <div class="cats" style="margin-top:16px">
      ${[["check", "Derecho a aceptar", "Aceptas solo la oferta que se ajusta a tus expectativas."],
        ["x", "Derecho a rechazar", "Puedes rechazar cualquier oferta sin compromiso."],
        ["euro", "Penalización al comprador", "En caso de incumplimiento se aplican penalizaciones según las condiciones."],
        ["users", "Segundo postor", "Si el primer comprador no cumple, se activa el siguiente mejor postor."],
        ["lock", "Bloqueo de cuenta", "Suspensión o bloqueo para quien incumple las reglas de la plataforma."],
        ["shield", "Usuarios verificados", "Todos los compradores pasan verificación antes de participar."]].map(([i, t, d], n) =>
        `<div class="panel" data-rev style="--d:${n * 55}ms"><span class="chip ok">${ic(i, "sm")}</span><h3 style="margin:10px 0 6px;font-size:16.5px">${t}</h3><p class="muted" style="margin:0;font-size:13px">${d}</p></div>`).join("")}
    </div>
  </div></section>

  <section class="blk" style="padding-top:0"><div class="wrap">
    <div class="panel" data-rev style="display:grid;grid-template-columns:1fr auto;gap:22px;align-items:center;padding:32px;background:linear-gradient(120deg,var(--accent-soft),var(--surface) 62%)">
      <div><div class="eyebrow">Para vendedores</div><h2 style="font-size:clamp(23px,2.9vw,31px);letter-spacing:-.03em;margin-top:10px">Aseguradora, taller o particular: publica en minutos</h2><p class="muted" style="margin:10px 0 0;max-width:62ch">Súbelo a subasta, ponlo a precio fijo en el mercado o pide una oferta de compra directa de MotorSubasta en 24 horas.</p></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn primary" href="#/publicar">Publicar vehículo</a><a class="btn" href="#/valoracion">Pedir oferta 24 h</a></div>
      <div class="sellers" style="grid-column:1/-1">${[["shield", "Aseguradoras"], ["refresh", "Rentings"], ["store", "Concesionarios"], ["truck", "Flotas"], ["wrench", "Desguaces"], ["user", "Particulares"]].map(([i, t]) => `<span>${ic(i, "sm")}${t}</span>`).join("")}</div>
    </div>
    <div style="margin-top:34px"><div class="lbl" style="margin-bottom:12px">Marcas disponibles</div>
    <div class="brands"><div class="row">${[...Array(2)].map(() => ["Toyota", "Volkswagen", "SEAT", "Renault", "Peugeot", "Citroën", "Opel", "Ford", "BMW", "Mercedes-Benz", "Audi", "Hyundai", "Kia", "Nissan", "Fiat", "Dacia"].map(b => `<span>${b}</span>`).join("")).join("")}</div></div></div>
  </div></section>`;
}

/* ---------- AUCTIONS ---------- */
function viewAuctions(query) {
  if (query.cat) { AUC.cat = query.cat; if (CATS[query.cat]) AUC.open[query.cat] = true; }
  const days = [...Array(12)].map((_, i) => madridDay(i));
  const dn = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"], mn = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  const liveLot = lots.find(l => statusOf(l) === "live");
  const nextLot = lots.filter(l => statusOf(l) === "soon").sort((a, b) => a.startsAt - b.startsAt)[0];
  return `<div class="wrap">
  ${AUCTIONS_OPEN ? "" : previewBar()}
  <section class="guide" data-rev>
    <div class="gh"><div><div class="eyebrow">Cómo pujar</div><h2>Guía rápida para ganar tu próximo vehículo</h2></div></div>
    <div class="gsteps">
      <div><b>1</b><h4>Explora</h4><p>Filtra por marca, precio y categoría. Revisa fotos e inspección por paneles.</p></div>
      <div><b>2</b><h4>Puja</h4><p>Incrementos desde €50. Activa la puja automática para no perder el lote.</p></div>
      <div><b>3</b><h4>Gana</h4><p>Al ganar se desbloquean los datos de contacto del vendedor.</p></div>
      <div><b>4</b><h4>Cierra</h4><p>Pago, gestoría y transporte coordinados hasta la retirada.</p></div>
    </div>
  </section>

  <div class="sesbar" data-rev>
    <div class="now"><span class="live-dot ${liveLot ? "" : nextLot ? "idle" : "off"}"></span><span class="mono tnum" id="cetClock">${fmtES(Date.now())}</span><small>España</small></div>
    <div class="st">${liveLot ? `<b>Sesión en directo</b><span class="muted">${sesName(liveLot.cat)} · cierra en <span class="mono" data-tm="${liveLot.id}"></span></span>`
      : nextLot ? `<b>Sin sesión activa</b><span class="muted">${sesName(nextLot.cat)} empieza en <span class="mono" data-tm="${nextLot.id}"></span></span>`
      : "<b>Sesiones cerradas por hoy</b><span class=\"muted\">Vuelven mañana a las 11:00, hora de España</span>"}</div>
    <div class="pre">${AUCTIONS_OPEN ? `<span class="chip acc">${ic("bolt", "sm")}Puja anticipada abierta</span>` : `<span class="chip acc">${ic("bell", "sm")}Vista previa</span>`}</div>
  </div>

  <div class="days">${days.map((d, i) => `<button class="day ${i === AUC.day ? "on" : ""}" data-day="${i}"><small>${i === 0 ? "HOY" : i === 1 ? "MAÑ" : d.toLocaleDateString(uiLoc(), { weekday: "short", timeZone: "UTC" }).replace(/\.$/, "").toUpperCase()}</small><b>${d.getUTCDate()}</b><small>${d.toLocaleDateString(uiLoc(), { month: "short", timeZone: "UTC" }).replace(/\.$/, "").toUpperCase()}</small><em>${i === 0 ? lots.length : i === 1 ? 8 : "&nbsp;"}</em></button>`).join("")}</div>

  <div class="toolbar">
    <div class="search">${ic("search")}<input class="in" id="aq" placeholder="Buscar marca, modelo, ciudad o referencia…" value="${esc(AUC.q)}"></div>
    <div class="seg" id="acat">${[["all", "Todas"], ["limpio", "Limpios"], ["danado", "Dañados"], ["siniestro", "Desguace"], ["oculta", "Ocultas"]].map(([k, t]) => `<button data-c="${k}" class="${AUC.cat === k ? "on" : ""}">${t}</button>`).join("")}</div>
    <select class="in" id="asort" style="width:auto"><option value="end">Orden de sesión</option><option value="low">Precio más bajo</option><option value="bids">Más pujas</option></select>
  </div>
  <div id="sessions"></div></div>`;
}
function renderSessions() {
  const box = $("#sessions"); if (!box) return;
  if (AUC.day > 1) { box.innerHTML = `<div class="panel empty">${ic("clock", "lg")}<b>Aún no hay lotes publicados para este día</b><span>Los vendedores publican con 48 h de antelación. Crea una alerta y te avisamos.</span><button class="btn sm" id="alertBtn">${ic("bell", "sm")}Crear alerta</button></div>`; $("#alertBtn").onclick = () => toast("Alerta creada para este día", "bell"); return; }
  const q = AUC.q.toLowerCase();
  let list = lots.filter(l => (AUC.cat === "all" || l.cat === AUC.cat) && (!q || (l.title + l.city + l.ref + l.prov).toLowerCase().includes(q)));
  if (AUC.day === 1) list = list.filter((_, i) => i % 2 === 0);
  const sorter = { end: (a, b) => a.startsAt - b.startsAt || b.featured - a.featured, low: (a, b) => curPrice(a) - curPrice(b), bids: (a, b) => b.hist.length - a.hist.length }[AUC.sort];
  box.innerHTML = Object.entries(CATS).filter(([k]) => AUC.cat === "all" || AUC.cat === k).map(([k, c]) => {
    const items = list.filter(l => l.cat === k).sort(sorter);
    return `<div class="session ${AUC.open[k] ? "open" : ""}">${sessHead(k, items, !!AUC.open[k])}
      ${AUC.open[k] ? `<div class="inner">${items.length ? `<div class="grid">${items.map(lotCard).join("")}</div>` : `<div class="empty">${ic("search", "lg")}No hay lotes con estos filtros</div>`}</div>` : ""}</div>`;
  }).join("");
  $$("[data-sess]", box).forEach(b => b.onclick = () => { AUC.open[b.dataset.sess] = !AUC.open[b.dataset.sess]; renderSessions(); });
  bindCards(box);
  initReveal(box);
}
setInterval(() => { const c = $("#cetClock"); if (c) c.textContent = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Madrid" }); }, 1000);
