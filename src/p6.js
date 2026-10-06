/* v4 icon addition */
P.globe2 = '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>';
P.eye2 = P.eye;

/* ============================================================
   v2 — typography, motion and polish overrides
   (function declarations below replace the earlier ones)
   ============================================================ */
function RM(){return matchMedia("(prefers-reduced-motion: reduce)").matches}

function ensureMotion() {
  if (!RM() && "IntersectionObserver" in window) document.documentElement.classList.add("motion");
}
var _obs = null;
function initReveal(root) {
  if (RM() || !("IntersectionObserver" in window)) { $$("[data-rev]", root).forEach(e => e.classList.add("rv")); $$("[data-count]", root).forEach(e => e.textContent = e.dataset.count); return; }
  if (!_obs) _obs = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    el.classList.add("rv");
    if (el.dataset.count) countUp(el, 0, +el.dataset.count, 900, el.dataset.suffix || "");
    _obs.unobserve(el);
  }), { rootMargin: "0px 0px -8% 0px", threshold: .08 });
  $$("[data-rev],[data-count]", root).forEach(e => _obs.observe(e));
}
function countUp(el, from, to, dur = 650, suffix) {
  if (RM()) { el.textContent = suffix === undefined ? eur(to) : num(to) + suffix; return; }
  const t0 = performance.now(), fmt = suffix === undefined ? eur : v => num(v) + suffix;
  const step = t => {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(from + (to - from) * e);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function fadeImgs(root) {
  $$(".ph img", root).forEach(im => {
    const done = () => { im.classList.add("ld"); im.parentElement.classList.add("ready"); };
    im.complete ? done() : im.addEventListener("load", done, { once: true });
    im.addEventListener("error", () => im.parentElement.classList.add("ready"), { once: true });
  });
}

/* ---------- cards ---------- */
function lotCard(l, i = 0) {
  const st = statusOf(l), c = CATS[l.cat], locked = l.cat === "oculta" && !/Dealer|Full/.test(S.plan);
  const lead = S.myBids[l.id] && l.hist[0] && l.hist[0].who === "Tú";
  const label = st === "live" ? "Cierra en" : st === "soon" ? "Empieza en" : "Finalizada";
  const total = l.endsAt - l.startsAt, pct = st === "live" ? Math.min(100, (now() - l.startsAt) / total * 100) : st === "end" ? 100 : 0;
  return `<article class="card" data-rev style="--d:${Math.min(i, 8) * 55}ms">
    <a class="ph ${locked ? "locked" : ""}" href="#/subasta/${l.id}" aria-label="${esc(l.title)}">
      <img src="${imgSrc(l.img)}" alt="${esc(l.title)}" loading="lazy">
      <div class="lot-tag">${st === "live" ? '<span class="status live"><span class="live-dot" style="background:#fff"></span>En vivo</span>' : st === "soon" ? '<span class="status soon">Programada</span>' : '<span class="status end">Cerrada</span>'}${l.noReserve ? '<span class="chip">Sin reserva</span>' : ""}</div>
      <span class="lotno">LOTE ${l.id.slice(1)}</span>
      ${locked ? `<div class="lockov">${ic("lock", "lg")}<span>Acceso Dealer</span></div>` : ""}
    </a>
    <button class="fav ${S.favs.has(l.id) ? "on" : ""}" data-fav="${l.id}" aria-label="Guardar en favoritos">${ic("heart", "sm")}</button>
    <div class="bd">
      <a href="#/subasta/${l.id}"><h3>${locked ? l.year + " " + l.make + " •••" : esc(l.title)}</h3></a>
      <div class="sub">${num(l.km)} km<span class="dotsep">·</span>${l.fuel}<span class="dotsep">·</span>${esc(l.city)}</div>
      <div class="meta"><span class="chip ${c.chip}">${c.short}</span><span class="chip">${ic("gavel", "sm")}${l.hist.length} pujas</span>${lead ? `<span class="chip ok">${ic("check", "sm")}Vas ganando</span>` : ""}</div>
      <div class="price-row">
        <div class="price"><small>${l.hist.length ? "Puja actual" : "Precio de salida"}</small><span class="tnum" data-price="${l.id}">${locked ? "€ •••" : eur(curPrice(l))}</span></div>
        <div class="tm"><small>${label}</small><span class="t ${st === "live" && l.endsAt - now() < 10 * MIN ? "hot" : ""}" data-tm="${l.id}">${st === "end" ? "—" : fmtLeft((st === "live" ? l.endsAt : l.startsAt) - now())}</span></div>
      </div>
      <div class="bar"><i data-bar="${l.id}" style="width:${pct}%"></i></div>
    </div>
  </article>`;
}
function bindCards(root = document) {
  $$("[data-fav]", root).forEach(b => b.onclick = e => {
    e.preventDefault();
    toggleFav(b.dataset.fav);
    b.classList.toggle("on", S.favs.has(b.dataset.fav));
  });
  fadeImgs(root);
}
function mkCard(m, i = 0) {
  return `<article class="card" data-rev style="--d:${Math.min(i, 8) * 55}ms"><a class="ph" href="#/mercado/${m.id}"><img src="${imgSrc(m.img)}" alt="${esc(m.title)}" loading="lazy"><span class="lotno">${m.type.toUpperCase()}</span></a>
  <div class="bd"><a href="#/mercado/${m.id}"><h3>${esc(m.title)}</h3></a>
  <div class="sub">${m.year}<span class="dotsep">·</span>${num(m.km)} km<span class="dotsep">·</span>${m.city}</div>
  <div class="meta"><span class="chip ${CATS[m.cat].chip}">${CATS[m.cat].short}</span>${m.neg ? '<span class="chip acc">Negociable</span>' : '<span class="chip">Precio fijo</span>'}</div>
  <div class="price-row"><div class="price"><small>Precio</small><span style="color:var(--accent)">${eur(m.price)}</span></div><div class="tm"><small>Financiación</small><span class="t">~${eur(m.price / 60 * 1.12)}/mes</span></div></div></div></article>`;
}

/* ---------- live ticker ---------- */
function tickerHTML() {
  const items = lots.flatMap(l => l.hist.slice(0, 2).map(h => ({ ...h, l }))).sort((a, b) => b.t - a.t).slice(0, 14);
  const one = items.map(x => `<span class="it">${ic("gavel", "sm")}<b>${esc(x.l.title)}</b><span class="amt tnum">${eur(x.amt)}</span><span class="faint">${x.who}</span></span>`).join("") ||
    `<span class="it">${ic("clock", "sm")}<b>Próxima sesión</b><span class="faint">Vehículos Limpios · 11:00 CET</span></span>`;
  return `<div class="ticker" aria-hidden="true"><div class="row">${one}${one}</div></div>`;
}

/* ---------- HOME ---------- */
function liveRow(l) {
  const st = statusOf(l), hot = st === "live" && l.endsAt - now() < 10 * MIN;
  return `<a class="lrow" href="#/subasta/${l.id}">
    <span class="im"><img src="${imgSrc(l.img)}" alt="" loading="lazy"></span>
    <span><b>${esc(l.title)}</b><small>${num(l.km)} km · ${esc(l.city)} · <span class="chip ${CATS[l.cat].chip}" style="height:17px;padding:0 6px;font-size:10.5px">${CATS[l.cat].short}</span></small></span>
    <span class="rt"><span class="p tnum" data-price="${l.id}">${eur(curPrice(l))}</span><span class="c ${hot ? "hot" : ""}" data-tm="${l.id}">${fmtLeft((st === "live" ? l.endsAt : l.startsAt) - now())}</span></span>
  </a>`;
}
function viewHome() {
  const live = lots.filter(l => statusOf(l) === "live" && l.cat !== "oculta").sort((a, b) => a.endsAt - b.endsAt);
  const soon = lots.filter(l => statusOf(l) === "soon").sort((a, b) => a.startsAt - b.startsAt);
  const room = (live.length ? live : soon).slice(0, 4);
  const counts = k => lots.filter(l => l.cat === k).length;
  const words = s => s.split(" ").map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(" ");
  const next = soon[0];
  return `${tickerHTML()}
  <section class="hero"><div class="mesh" aria-hidden="true"></div><div class="wrap">
    <div>
      <div class="eyebrow" data-rev>${ic("shield", "sm")}Plataforma profesional de remarketing · España</div>
      <h1 style="margin-top:18px">${words("Vehículos de aseguradoras, rentings y flotas,")} <em>en subasta cada día.</em></h1>
      <p class="lead" data-rev style="--d:300ms">Limpios, dañados y siniestro total, con inspección por paneles y VIN verificado. Pujas vinculantes, coste total calculado antes de pujar y la parte administrativa resuelta hasta la retirada.</p>
      <div class="hero-cta" data-rev style="--d:380ms">
        <a class="btn primary" href="#/subastas">${ic("gavel", "sm")}Ver subastas en vivo</a>
        <a class="btn" href="#/publicar">${ic("upload", "sm")}Vender un vehículo</a>
        <a class="btn ghost" href="#/precios">${ic("euro", "sm")}Comisiones y tarifas</a>
      </div>
      <div class="stats">
        <div data-rev style="--d:440ms"><b class="tnum" data-count="${lots.length}">${lots.length}</b><span>lotes esta semana</span></div>
        <div data-rev style="--d:490ms"><b class="tnum" data-count="${live.length}">${live.length}</b><span>en vivo ahora mismo</span></div>
        <div data-rev style="--d:540ms"><b class="tnum" data-count="17">17</b><span>comunidades autónomas</span></div>
        <div data-rev style="--d:590ms"><b class="tnum" data-count="4">4</b><span>sesiones diarias</span></div>
      </div>
      <div class="trust" data-rev style="--d:640ms">${["Aseguradoras", "Rentings", "Concesionarios", "Flotas", "Desguaces", "Exportadores"].map(t => `<span>${t}</span>`).join("")}</div>
    </div>
    <aside class="livepanel" data-rev style="--d:220ms">
      <div class="hd"><span class="live-dot"></span>${live.length ? "Sala en directo" : "Próxima sesión"}<span class="n tnum">${room.length} lotes</span></div>
      ${room.map(liveRow).join("")}
      <div class="ft"><span>${next ? `Siguiente: <b style="color:var(--text)">${CATS[next.cat].name}</b> · ${CATS[next.cat].session} CET` : "Sesiones diarias de 11:00 a 16:00 CET"}</span><a class="link" href="#/subastas">Ver todas ${ic("right", "sm")}</a></div>
    </aside>
  </div></section>

  <section class="procstrip"><div class="wrap">
    <div class="proc" data-rev><span class="t">01 · Adjudicación</span><b>Ganas el lote</b><span>Recibes el desglose con comisión, gestoría y transporte.</span><span class="when">Al cierre de la puja</span></div>
    <div class="proc" data-rev style="--d:70ms"><span class="t">02 · Vendedor</span><b>Acepta o contraoferta</b><span>Si el lote tiene reserva, el vendedor decide o negocia.</span><span class="when">Hasta 24 h</span></div>
    <div class="proc" data-rev style="--d:140ms"><span class="t">03 · Pago y papeles</span><b>Contrato y transferencia</b><span>Pago por transferencia y cambio de titularidad con gestoría.</span><span class="when">48–72 h</span></div>
    <div class="proc" data-rev style="--d:210ms"><span class="t">04 · Entrega</span><b>Retirada o transporte</b><span>Se coordina con el vendedor: recogida propia o portavehículos.</span><span class="when">3–10 días laborables</span></div>
  </div></section>

  <section class="blk"><div class="wrap">
    <div class="sec-head" data-rev><div><div class="eyebrow">Categorías</div><h2 style="margin-top:10px">Cuatro sesiones, cada día</h2><p>Cada categoría tiene su franja horaria y sus reglas de inspección.</p></div></div>
    <div class="cats">
      ${Object.entries(CATS).map(([k, c], i) => `<a class="cat ${k === "oculta" ? "oculta" : k}" href="#/subastas?cat=${k}" data-rev style="--d:${i * 70}ms">
        <div class="row"><span class="ic">${ic(c.icon)}</span><span class="n tnum">${counts(k)}</span></div>
        <h3>${c.name}</h3>${k === "oculta" ? '<span class="eyebrow" style="color:var(--vip)">Acceso premium</span>' : ""}<p>${c.desc}</p>
        <span class="faint mono" style="font-size:11.5px">Sesión ${c.session} CET</span></a>`).join("")}
    </div>
  </div></section>

  <section class="blk" style="padding-top:0"><div class="wrap">
    <div class="sec-head" data-rev><div><div class="eyebrow">${ic("flame", "sm")}Cierran pronto</div><h2 style="margin-top:10px">Lotes con más actividad</h2><p>Una puja en los dos últimos minutos amplía el cierre dos minutos más.</p></div><a class="link" href="#/subastas">Ver calendario ${ic("right", "sm")}</a></div>
    <div class="grid">${(live.length ? live : lots).slice(0, 4).map(lotCard).join("")}</div>
  </div></section>

  <section class="blk" style="background:var(--bg-2);border-block:1px solid var(--line)"><div class="wrap">
    <div class="sec-head" data-rev><div><div class="eyebrow">Cómo funciona</div><h2 style="margin-top:10px">Del registro a la retirada</h2></div></div>
    <div class="steps" data-rev>
      <div class="step"><span class="k">PASO 1</span>${ic("user", "lg")}<h4>Regístrate y verifica</h4><p>Cuenta profesional o particular, con verificación de identidad y CIF.</p></div>
      <div class="step"><span class="k">PASO 2</span>${ic("search", "lg")}<h4>Inspecciona el lote</h4><p>Fotos, mapa de daños por panel, VIN y coste total calculado.</p></div>
      <div class="step"><span class="k">PASO 3</span>${ic("gavel", "lg")}<h4>Puja o automatiza</h4><p>Puja manual o automática hasta tu máximo, con anti-sniping de 2 minutos.</p></div>
      <div class="step"><span class="k">PASO 4</span>${ic("truck", "lg")}<h4>Paga y retira</h4><p>Gestoría incluida; la retirada se acuerda con el vendedor o la transportamos.</p></div>
    </div>
  </div></section>

  <section class="blk"><div class="wrap">
    <div class="sec-head" data-rev><div><div class="eyebrow">Compromiso</div><h2 style="margin-top:10px">En MotorSubasta, pujar es comprar</h2><p>Cada puja es vinculante. Esa seriedad es lo que mantiene el precio real.</p></div></div>
    <div class="commit">
      <div class="panel" data-rev><h3>Tu compromiso al pujar</h3><ul class="checks">
        <li>${ic("check", "sm")}Las pujas no se pueden retirar ni cancelar.</li>
        <li>${ic("check", "sm")}Tu puja mantiene su validez durante 30 días naturales.</li>
        <li>${ic("check", "sm")}Si el vendedor acepta, formalizas la compra en el plazo indicado.</li>
        <li>${ic("check", "sm")}Si no cumples, la operación pasa al segundo mejor postor.</li>
      </ul></div>
      <div class="panel" data-rev style="--d:90ms"><h3>¿Qué ocurre después?</h3>
        <div class="outcome"><span class="chip ok">${ic("check", "sm")}</span><div><small>El vendedor acepta tu puja</small><b>Formalizas la compra</b></div></div>
        <div class="outcome"><span class="chip">${ic("x", "sm")}</span><div><small>El vendedor rechaza tu puja</small><b>Sin obligación para ti</b></div></div>
        <div class="outcome"><span class="chip bad">${ic("alert", "sm")}</span><div><small>Incumples el compromiso</small><b>Penalización y reactivación 349 € + IVA</b></div></div>
      </div>
    </div>
  </div></section>

  <section class="blk" style="padding-top:0"><div class="wrap">
    <div class="sec-head" data-rev><div><div class="eyebrow">Mercado · precio fijo</div><h2 style="margin-top:10px">Compra sin esperar a la subasta</h2></div><a class="link" href="#/mercado">Ver mercado ${ic("right", "sm")}</a></div>
    <div class="grid">${market.slice(0, 3).map(mkCard).join("")}</div>
  </div></section>

  <section class="blk" style="padding-top:0"><div class="wrap">
    <div class="panel" data-rev style="display:grid;grid-template-columns:1fr auto;gap:22px;align-items:center;padding:32px;background:linear-gradient(120deg,var(--accent-soft),var(--surface) 62%)">
      <div><div class="eyebrow">Para vendedores</div><h2 style="font-size:clamp(23px,2.9vw,31px);letter-spacing:-.03em;margin-top:10px">Aseguradora, taller o particular: publica en minutos</h2><p class="muted" style="margin:10px 0 0;max-width:62ch">Súbelo a subasta, ponlo a precio fijo en el mercado o pide una oferta de compra directa de MotorSubasta en 24 horas. Tú decides si la aceptas.</p></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn primary" href="#/publicar">Publicar vehículo</a><a class="btn" href="#/valoracion">Pedir oferta 24 h</a></div>
    </div>
    <div style="margin-top:34px"><div class="lbl" style="margin-bottom:12px">Marcas frecuentes en nuestras sesiones</div>
    <div class="brands"><div class="row">${[...Array(2)].map(() => ["Toyota", "Volkswagen", "SEAT", "Renault", "Peugeot", "Citroën", "Opel", "Ford", "BMW", "Mercedes-Benz", "Audi", "Hyundai", "Kia", "Nissan", "Fiat", "Dacia"].map(b => `<span>${b}</span>`).join("")).join("")}</div></div></div>
  </div></section>`;
}

/* ---------- header with sliding indicator ---------- */
function renderHeader(path) {
  const liveN = lots.filter(l => statusOf(l) === "live").length;
  const links = NAV.map(([h, t, i]) => {
    const on = h === "#/" ? path === "/" : path.startsWith(h.slice(1).replace(/s$/, ""));
    return `<a href="${h}" class="${on ? "on" : ""}">${ic(i, "sm")}${t}${t === "Subastas" && liveN ? '<span class="live-dot" title="Subastas en vivo"></span>' : ""}</a>`;
  }).join("");
  $("#nav").innerHTML = links + '<span class="ind"></span>';
  $("#mnav").innerHTML = links + `<a href="#/valoracion">${ic("car", "sm")}Valoración gratuita</a><a href="#/publicar">${ic("upload", "sm")}Publicar vehículo</a>`;
  $("#valBtn").innerHTML = ic("car", "sm") + "Valoración";
  $("#favBtn").innerHTML = ic("heart") + (S.favs.size ? `<span class="badge-n">${S.favs.size}</span>` : "");
  const u = S.notesUnread();
  $("#bellBtn").innerHTML = ic("bell") + (u ? `<span class="badge-n">${u}</span>` : "");
  $("#burger").innerHTML = ic("menu");
  moveInd();
}
function moveInd() {
  const nav = $("#nav"), a = $("#nav a.on"), ind = $("#nav .ind");
  if (!nav || !ind) return;
  if (!a) { ind.style.width = "0px"; return; }
  ind.style.width = (a.offsetWidth - 26) + "px";
  ind.style.transform = `translateX(${a.offsetLeft + 13}px)`;
}
addEventListener("resize", moveInd);

/* ---------- router with page transition ---------- */
function router() {
  ensureMotion();
  const { path, query } = route();
  let out = null;
  for (const [re, fn] of ROUTES) { const m = path.match(re); if (m) { out = fn(query, m); break; } }
  if (!out) out = [`<div class="wrap"><div class="empty" style="padding:90px">${ic("alert", "lg")}<b>Página no encontrada</b><a class="btn primary" href="#/">Ir al inicio</a></div></div>`, null];
  const app = $("#app");
  app.innerHTML = out[0];
  app.classList.remove("page-in");
  void app.offsetWidth;
  if (!RM()) app.classList.add("page-in");
  out[1] && out[1]();
  if (path !== lastPath) { scrollTo(0, 0); lastPath = path; }
  $("#mnav").hidden = true;
  renderHeader(path);
  initReveal(app);
  fadeImgs(app);
  document.title = "MotorSubasta";
}

/* ---------- refresh with animated prices ---------- */
var _lastTop = {};
function refresh() {
  const { path } = route();
  if (path.startsWith("/subasta/")) {
    const l = lots.find(x => x.id === path.split("/")[2]);
    if (l) {
      const before = _lastTop[l.id];
      renderBidbox(l);
      const top = l.hist.length ? curPrice(l) : null;
      if (top != null && before != null && top !== before) {
        const li = $("#bidbox .bids li"); if (li) li.classList.add("fresh");
        const bp = $("#bidbox .bigprice");
        if (bp) { countUp(bp, before, top); bp.classList.remove("flashing"); void bp.offsetWidth; bp.classList.add("flashing"); }
      }
      _lastTop[l.id] = top;
    }
  } else if (path === "/subastas") { renderSessions(); }
  else if (path === "/admin") { if (["resumen", "subastas"].includes(AD.tab)) renderAdmin(); }
  $$("[data-price]").forEach(e => {
    const l = lots.find(x => x.id === e.dataset.price);
    if (!l || e.textContent.includes("•") || e.closest("#bidbox")) return;
    const to = curPrice(l), from = +String(e.textContent).replace(/[^\d]/g, "");
    if (from && from !== to) { countUp(e, from, to, 550); e.classList.remove("flashing"); void e.offsetWidth; e.classList.add("flashing"); }
    else if (!from) e.textContent = eur(to);
  });
  renderHeader(path);
}

/* ---------- scroll: progress bar, header state, hero parallax ---------- */
var _raf = 0;
addEventListener("scroll", () => {
  if (_raf) return;
  _raf = requestAnimationFrame(() => {
    _raf = 0;
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    $("#prog").style.width = (h > 0 ? Math.min(100, y / h * 100) : 0) + "%";
    if (typeof onScrollTop === "function") onScrollTop();
    else $("#top").classList.toggle("scrolled", y > 16);
    const ph = $("#heroPh");
    if (ph && !RM() && y < 700) ph.style.transform = `translateY(${y * -0.045}px)`;
  });
}, { passive: true });

/* ---------- seconds tick on the big clocks ---------- */
setInterval(() => {
  if (RM()) return;
  $$(".clock").forEach(c => { try { c.animate([{ opacity: .72 }, { opacity: 1 }], { duration: 220, easing: "ease-out" }); } catch (e) {} });
}, 1000);

/* ---------- safety sweep: never leave a revealed block hidden ---------- */
setInterval(() => {
  $$("[data-rev]:not(.rv)").forEach(e => { if (e.getBoundingClientRect().top < innerHeight + 200) e.classList.add("rv"); });
}, 1200);

/* ---------- boot v2 (render happens once, in the last layer) ---------- */
applyTheme();
ensureMotion();
setTimeout(() => simBid(), 7000);
