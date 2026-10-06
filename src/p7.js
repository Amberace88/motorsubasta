/* ============================================================
   v3 — UX, accessibility and interaction polish
   ============================================================ */

/* ---------- money with rolling digits ---------- */
function setMoney(el, v) {
  const txt = eur(v);
  if (!el || el.dataset.v === txt) return;
  const old = el.dataset.v || "";
  el.dataset.v = txt;
  if (RM()) { el.textContent = txt; return; }
  el.innerHTML = [...txt].map((ch, i) => `<span class="dg${old[i] === ch ? "" : " n"}" style="--i:${i}">${ch === " " ? "&nbsp;" : ch}</span>`).join("");
}

/* ---------- refresh (v3): rolling prices + highlight ---------- */
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
        if (bp) { bp.classList.remove("flashing"); void bp.offsetWidth; bp.classList.add("flashing"); }
      }
      _lastTop[l.id] = top;
    }
  } else if (path === "/subastas") { renderSessions(); }
  else if (path === "/admin") { if (["resumen", "subastas"].includes(AD.tab)) renderAdmin(); }
  $$("[data-price]").forEach(e => {
    const l = lots.find(x => x.id === e.dataset.price);
    if (!l || e.textContent.includes("•")) return;
    const to = curPrice(l), had = e.dataset.v;
    setMoney(e, to);
    if (had && had !== eur(to) && !e.closest(".mbar")) { e.classList.remove("flashing"); void e.offsetWidth; e.classList.add("flashing"); }
  });
  mobileBar();
  renderHeader(path);
}

/* ---------- sticky bid bar on phones ---------- */
function mobileBar() {
  const { path } = route();
  const l = path.startsWith("/subasta/") ? lots.find(x => x.id === path.split("/")[2]) : null;
  const want = l && innerWidth <= 1080 && statusOf(l) === "live" && !(l.cat === "oculta" && !/Dealer|Full/.test(S.plan));
  const ex = $("#mbar");
  if (!want) { if (ex) ex.remove(); document.body.classList.remove("has-mbar"); return; }
  if (ex && ex.dataset.lot === l.id) return;
  const bar = ex || document.createElement("div");
  bar.id = "mbar"; bar.className = "mbar"; bar.dataset.lot = l.id;
  bar.innerHTML = `<div><small>Puja actual</small><b class="tnum" data-price="${l.id}">${eur(curPrice(l))}</b></div>
    <div class="t"><small>Cierra en</small><span data-tm="${l.id}">${fmtLeft(l.endsAt - now())}</span></div>
    <button class="btn primary sm" id="mbarGo">${ic("gavel", "sm")}Pujar</button>`;
  if (!ex) document.body.appendChild(bar);
  document.body.classList.add("has-mbar");
  $("#mbarGo").onclick = () => {
    const box = $("#bidbox");
    if (box) box.scrollIntoView({ behavior: RM() ? "auto" : "smooth", block: "center" });
    setTimeout(() => { const i = $("#bidIn"); if (i) { i.focus(); i.select(); } }, RM() ? 0 : 520);
  };
}
addEventListener("resize", () => { mobileBar(); });

/* ---------- breadcrumbs on a lot ---------- */
function crumbs() {
  const { path } = route();
  if (!path.startsWith("/subasta/")) return;
  const l = lots.find(x => x.id === path.split("/")[2]);
  const back = $("#app .back");
  if (!l || !back || $("#app .crumbs")) return;
  const nav = document.createElement("nav");
  nav.className = "crumbs"; nav.setAttribute("aria-label", "Ruta de navegación");
  nav.innerHTML = `<a href="#/">Inicio</a><span class="sep">/</span><a href="#/subastas">Subastas</a><span class="sep">/</span><a href="#/subastas?cat=${l.cat}">${CATS[l.cat].name}</a><span class="sep">/</span><b>${l.ref || "Lote " + l.id.slice(1)}</b>`;
  back.before(nav);
}

/* ---------- focus management for overlays ---------- */
var _lastFocus = null;
function trapOverlay() {
  const ov = $("#overlay");
  const box = ov.querySelector(".modal, .drawer");
  if (!box) { if (_lastFocus && document.contains(_lastFocus)) { _lastFocus.focus(); } _lastFocus = null; return; }
  if (box.dataset.trapped) return;
  box.dataset.trapped = "1";
  _lastFocus = document.activeElement;
  const sel = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
  const first = box.querySelector(sel);
  if (first) setTimeout(() => first.focus(), 30);
  box.addEventListener("keydown", e => {
    if (e.key !== "Tab") return;
    const f = [...box.querySelectorAll(sel)].filter(n => n.offsetParent !== null);
    if (!f.length) return;
    const a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
}

/* ---------- pointer tilt (fine pointers only) ---------- */
function bindTilt(el, max = 5) {
  if (RM() || !matchMedia("(pointer:fine)").matches || el.dataset.tilt) return;
  el.dataset.tilt = "1"; el.classList.add("tilt");
  el.addEventListener("pointermove", e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.classList.add("live");
    el.style.transform = `perspective(1100px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateZ(0)`;
  });
  el.addEventListener("pointerleave", () => { el.classList.remove("live"); el.style.transform = ""; });
}

/* ---------- idempotent enhancement pass ---------- */
function polish() {
  const { path } = route();
  // current page for assistive tech
  $$("#nav a, #mnav a").forEach(a => a.classList.contains("on") ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  // animated chart bars + condition panels
  $$(".chart rect:not([data-an])").forEach((r, i) => { r.dataset.an = "1"; r.style.setProperty("--i", i); });
  $$(".carmap rect:not([data-an])").forEach((r, i) => { r.dataset.an = "1"; r.style.setProperty("--i", i); });
  // labels for the market filter controls
  [["#ffuel", "Combustible"], ["#ftrans", "Transmisión"], ["#fmin", "Precio mínimo"], ["#fmax", "Precio máximo"], ["#msort", "Ordenar"], ["#asort", "Ordenar subastas"], ["#aq", "Buscar subastas"], ["#mq", "Buscar en el mercado"], ["#adQ", "Buscar en el catálogo"], ["#autoIn", "Máximo para la puja automática"], ["#bidIn", "Importe de tu puja"], ["#tDest", "Provincia de destino del transporte"]]
    .forEach(([s, n]) => { const e = $(s); if (e && !e.getAttribute("aria-label")) e.setAttribute("aria-label", n); });
  // rolling prices on first paint
  $$("[data-price]").forEach(e => { if (!e.dataset.v && !e.textContent.includes("•")) { const l = lots.find(x => x.id === e.dataset.price); if (l) setMoney(e, curPrice(l)); } });
  crumbs();
  mobileBar();
  const lp = $(".livepanel"); if (lp) bindTilt(lp, 4);
  if (path === "/" ) { const hl = $(".hero-lot"); if (hl) bindTilt(hl, 5); }
  trapOverlay();
}
var _pt = 0;
new MutationObserver(() => { clearTimeout(_pt); _pt = setTimeout(polish, 50); })
  .observe(document.body, { childList: true, subtree: true });

/* ---------- gallery: arrow-key navigation ---------- */
addEventListener("keydown", e => {
  if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
  const th = $$("#app .thumbs button");
  if (!th.length || !document.activeElement.closest(".thumbs")) return;
  const i = th.findIndex(b => b === document.activeElement);
  const n = th[(i + (e.key === "ArrowRight" ? 1 : th.length - 1)) % th.length];
  n.focus(); n.click(); e.preventDefault();
});

/* ---------- valuation form: inline, described errors ---------- */
function mountValuation() {
  const calc = () => {
    const y = +$("#vYear").value || 2015, km = +$("#vKm").value || 0;
    const brand = { bmw: 1.3, "mercedes-benz": 1.35, mercedes: 1.35, audi: 1.3, toyota: 1.15, volkswagen: 1.1, dacia: .8, fiat: .8 }[$("#vMake").value.trim().toLowerCase()] || 1;
    let base = 26000 * brand * Math.pow(.86, Math.max(0, 2026 - y)) * Math.max(.35, 1 - km / 450000);
    const dm = { ninguno: 1, leve: .82, moderado: .6, grave: .38, inundado: .22, quemado: .12 }[$("#vDmg").value];
    const tm = { limpio: 1, salvamento: .75, piezas: .45 }[$("#vTitle").value];
    base *= dm * tm * ($("#vKeys").checked ? 1 : .9) * ($("#vRuns").checked ? 1 : .8);
    base = Math.max(150, base);
    $("#vOut").textContent = eur(Math.round(base * .88 / 50) * 50) + " – " + eur(Math.round(base * 1.08 / 50) * 50);
    $("#vNote").textContent = `${$("#vMake").value} ${$("#vModel").value} ${y} · ${num(km)} km. Orientativa; la oferta en firme depende de fotos y peritaje.`;
    $("#vBar").style.width = Math.min(100, base / 250) + "%";
  };
  $$("#valForm input,#valForm select").forEach(e => e.addEventListener("input", calc));
  calc();
  const vin = $("#vVin");
  let errEl = null;
  const clearErr = () => { vin.removeAttribute("aria-invalid"); vin.removeAttribute("aria-describedby"); if (errEl) { errEl.remove(); errEl = null; } };
  vin.addEventListener("input", () => { vin.value = vin.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); clearErr(); });
  $("#vSend").onclick = () => {
    const v = vin.value.trim();
    if (v && v.length !== 17) {
      clearErr();
      errEl = document.createElement("span");
      errEl.className = "err"; errEl.id = "vVinErr"; errEl.setAttribute("role", "alert");
      errEl.innerHTML = ic("alert", "sm") + `El VIN debe tener 17 caracteres. Has escrito ${v.length}.`;
      vin.after(errEl);
      vin.setAttribute("aria-invalid", "true"); vin.setAttribute("aria-describedby", "vVinErr");
      vin.focus();
      return;
    }
    clearErr();
    toast($("#vDirect").checked ? "Solicitud enviada. Recibirás la oferta en 24 h." : "Solicitud de valoración enviada", "check");
    notify(`Valoración recibida para <b>${esc($("#vMake").value)} ${esc($("#vModel").value)}</b>.`, "chart");
  };
}

/* ---------- toasts: announce once, then retire ---------- */
function toast(msg, icon = "check") {
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = ic(icon) + "<span>" + msg + "</span>";
  $("#toasts").appendChild(t);
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 3600);
}

/* boot moved to the last layer */
