/* ============================================================
   v12 — sesiones compactas · contrato de compraventa · idiomas
   ============================================================ */


/* ---------- hora de España para todos ----------
   Las sesiones son a hora peninsular española (Europe/Madrid, con su
   cambio de horario). Quien mira desde otra zona ve además su hora local. */
function madridParts(t) {
  const o = {};
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })
    .formatToParts(new Date(t)).forEach(x => { if (x.type !== "literal") o[x.type] = +x.value; });
  return o;
}
function madridOffsetMin(t) { const o = madridParts(t); return Math.round((Date.UTC(o.year, o.month - 1, o.day, o.hour, o.minute, o.second) - Math.floor(t / 1000) * 1000) / 60000); }
/* instante exacto de las hh:mm en Madrid, hoy (en Madrid) + dayOffset */
function madridAt(h, m, dayOffset) {
  const o = madridParts(Date.now());
  const guess = Date.UTC(o.year, o.month - 1, o.day + (dayOffset || 0), h, m || 0, 0);
  let t = guess - madridOffsetMin(guess) * 60000;
  return guess - madridOffsetMin(t) * 60000;          /* segunda pasada: días de cambio de hora */
}
/* fecha de Madrid como Date a mediodía UTC (para pintar día/mes sin desfases) */
function madridDay(i) { const o = madridParts(Date.now()); return new Date(Date.UTC(o.year, o.month - 1, o.day + (i || 0), 12)); }
function hm(t, tz) { return new Date(t).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: tz }); }
function fmtES(t) { return hm(t, "Europe/Madrid"); }
function fmtLocal(t) { return hm(t); }
function tzDiffers(t) { return madridOffsetMin(t) !== -new Date(t).getTimezoneOffset(); }
/* "11:00 – 13:00 · hora de España" y, si procede, la hora del visitante */
function sesTimes(k) {
  const [a, b] = (typeof SES !== "undefined" && SES[k]) || [11, 13];
  const ta = madridAt(a, 0), tb = madridAt(b, 0);
  return `<span class="sest">${fmtES(ta)} – ${fmtES(tb)}</span><span class="tzl">hora de España</span>` +
    (tzDiffers(ta) ? `<span class="tzloc">${fmtLocal(ta)} – ${fmtLocal(tb)}</span><span class="tzl">tu hora</span>` : "");
}

/* ---------- 1. fila de sesión: la misma en portada y en subastas ----------
   Cerrada por defecto. En la cabecera va todo lo que decide si abrirla:
   cuántos vehículos hay, desde qué precio, cuántas pujas, cuándo empieza
   o cuándo cierra, y unas miniaturas de lo que hay dentro.              */
/* (todo lo que se usa al pintar va en funciones: la primera pintura ocurre
    antes de que este archivo termine de ejecutarse) */
function isLockedLot(l) { return l.cat === "oculta" && !/Dealer|Full/.test(S.plan); }

function sesInfo(items) {
  const live = items.filter(l => statusOf(l) === "live").sort((a, b) => a.endsAt - b.endsAt);
  const soon = items.filter(l => statusOf(l) === "soon").sort((a, b) => a.startsAt - b.startsAt);
  const open = items.filter(l => statusOf(l) !== "end");
  const prices = open.map(curPrice);
  return {
    live, soon, open,
    ref: live[0] || soon[0] || null,
    from: prices.length ? Math.min(...prices) : null,
    bids: items.reduce((s, l) => s + l.hist.length, 0),
  };
}

function sessHead(k, items, isOpen) {
  const c = CATS[k], col = { limpio: "ok", danado: "warn", siniestro: "bad", oculta: "vip" }[k], f = sesInfo(items);
  const locked = k === "oculta" && !/Dealer|Full/.test(S.plan);
  const st = f.live.length ? "live" : f.soon.length ? "soon" : "end";
  const pics = (f.open.length ? f.open : items).slice(0, 3);
  const left = f.ref ? fmtLeft((st === "live" ? f.ref.endsAt : f.ref.startsAt) - now()) : "";
  return `<button class="shead" data-sess="${k}" aria-expanded="${isOpen}">
    <span class="ic" style="background:var(--${col}-soft);color:var(--${col})">${ic(c.icon)}</span>
    <span class="nm"><h3>${c.name}</h3><small>${ic("clock", "sm")}${sesTimes(k)}${k === "oculta" ? '<span class="tzl">solo Dealer</span>' : ""}</small></span>
    <span class="facts">
      ${pics.length ? `<span class="thumbs ${locked ? "lk" : ""}" aria-hidden="true">${pics.map(l => `<img src="${imgSrc(l.img)}" alt="" loading="lazy">`).join("")}</span>` : ""}
      <span class="f"><b class="tnum">${items.length}</b><small>vehículos</small></span>
      ${f.from != null ? `<span class="f"><b class="tnum">${locked ? "€ •••" : eur(f.from)}</b><small>desde</small></span>` : ""}
      <span class="f hide-s"><b class="tnum">${f.bids}</b><small>pujas</small></span>
    </span>
    <span class="sst">${st === "live"
      ? `<span class="chip livechip"><span class="live-dot"></span>${AUCTIONS_OPEN ? "En directo" : "En curso"}</span><span class="when"><small>Cierra en</small><span class="mono tnum" data-tm="${f.ref.id}">${left}</span></span>`
      : st === "soon"
      ? `<span class="chip acc"><span class="live-dot idle"></span>${AUCTIONS_OPEN ? "Puja anticipada" : "Programada"}</span><span class="when"><small>Empieza en</small><span class="mono tnum" data-tm="${f.ref.id}">${left}</span></span>`
      : `<span class="chip">Sesión finalizada</span>`}</span>
    ${ic("chev", "chev")}
  </button>`;
}

/* fila compacta de un lote dentro de una sesión de la portada */
function miniRow(l) {
  const st = statusOf(l), locked = isLockedLot(l), hot = st === "live" && l.endsAt - now() < 10 * MIN;
  return `<a class="lrow" href="#/subasta/${l.id}">
    <span class="im ${locked ? "lk" : ""}"><img src="${imgSrc(l.img)}" alt="" loading="lazy">${locked ? ic("lock", "sm") : ""}</span>
    <span><b>${locked ? l.year + " " + esc(l.make) + " •••" : esc(l.title)}</b><small>${num(l.km)} km · ${esc(l.fuel)} · ${esc(l.city)}</small></span>
    <span class="rt"><span class="p tnum">${locked ? "€ •••" : eur(curPrice(l))}</span><span class="c ${hot ? "hot" : ""}" data-tm="${l.id}">${st === "end" ? "—" : fmtLeft((st === "live" ? l.endsAt : l.startsAt) - now())}</span></span>
  </a>`;
}

function homeSessions() {
  const HOME_OPEN = window.HOME_OPEN || (window.HOME_OPEN = {});
  return Object.entries(CATS).map(([k, c]) => {
    const items = lots.filter(l => l.cat === k).sort((a, b) => ({ live: 0, soon: 1, end: 2 })[statusOf(a)] - ({ live: 0, soon: 1, end: 2 })[statusOf(b)] || a.startsAt - b.startsAt);
    const open = !!HOME_OPEN[k];
    return `<div class="session ${open ? "open" : ""}">${sessHead(k, items, open)}
      ${open ? `<div class="inner sesmini">${items.length ? items.slice(0, 6).map(miniRow).join("") : `<div class="empty">${ic("clock", "lg")}Aún no hay lotes en esta sesión</div>`}
        <a class="more" href="#/subastas?cat=${k}">${items.length > 6 ? `Ver los ${items.length} lotes` : "Abrir en el calendario"} ${ic("right", "sm")}</a></div>` : ""}</div>`;
  }).join("");
}
function bindHomeSess() {
  const box = $("#homeSess"); if (!box) return;
  $$("[data-sess]", box).forEach(b => b.onclick = () => {
    const HOME_OPEN = window.HOME_OPEN || (window.HOME_OPEN = {});
    HOME_OPEN[b.dataset.sess] = !HOME_OPEN[b.dataset.sess];
    box.innerHTML = homeSessions(); bindHomeSess(); fadeImgs(box);
  });
}

/* subastas: todas cerradas al entrar; ?cat= abre solo esa */
Object.keys(AUC.open).forEach(k => { AUC.open[k] = false; });

(function hookHome2() {
  const i = ROUTES.findIndex(r => String(r[0]) === String(/^\/$/));
  if (i >= 0) ROUTES[i] = [/^\/$/, () => [viewHome(), () => { bindCards(); heroBackdrop(); bindHomeSess(); }]];
})();

