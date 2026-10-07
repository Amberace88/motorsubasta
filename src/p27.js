
/* =====================================================================
   p27 — consola de administración, analítica propia y marcas
   ===================================================================== */

/* ---------- analítica propia (sin cookies; id anónimo que rota cada día) ---------- */
function trkSid() {
  const d = new Date().toISOString().slice(0, 10);
  let o = store.get("tsid", null);
  if (!o || o.d !== d) { o = { d, id: (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()).replace(/-/g, "").slice(0, 24) }; store.set("tsid", o); }
  return o.id;
}
function trkDevice() { const w = innerWidth; return /Mobi|Android|iPhone/i.test(navigator.userAgent) || w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop"; }
function trkBase() {
  const p = new URLSearchParams(location.search);
  if (!window.__trkUtm) window.__trkUtm = { us: p.get("utm_source"), um: p.get("utm_medium"), uc: p.get("utm_campaign") };
  let ref = null;
  try { if (document.referrer && !window.__trkRefSent) { const h = new URL(document.referrer).hostname.replace(/^www\./, ""); if (h && h !== location.hostname) ref = h; } } catch (e) {}
  return Object.assign({ sid: trkSid(), lang: (typeof LANG !== "undefined" && LANG) || document.documentElement.lang || "es", dev: trkDevice(), tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || "").slice(0, 40), vw: String(innerWidth) }, ref ? { ref } : {}, window.__trkUtm.us ? window.__trkUtm : {});
}
var TRK_Q = window.TRK_Q || (window.TRK_Q = []);
function trackEv(kind, extra) {
  try {
    if (S.user && S.user.role === "admin") return;
    const path = route().path;
    const m = path.match(/^\/(?:subasta|mercado)\/([\w-]+)$/);
    const ev = Object.assign(trkBase(), { kind, path }, m && m[1] !== "comparar" ? { vid: m[1] } : {}, extra || {});
    if (ev.ref) window.__trkRefSent = true;
    TRK_Q.push(ev); trkFlush();
  } catch (e) {}
}
function trkFlush() {
  if (!live()) { if (TRK_Q.length > 60) TRK_Q.splice(0, TRK_Q.length - 60); return; }
  while (TRK_Q.length) { const ev = TRK_Q.shift(); sb.rpc("track", { p: ev }).then(() => {}, () => {}); }
}
(function trkInit() {
  let last = "";
  const view = () => { const p = route().path; if (p === last) return; last = p; trackEv("view"); };
  addEventListener("hashchange", () => setTimeout(view, 30));
  let tries = 0; const wait = setInterval(() => { tries++; if (live() || tries > 40) { clearInterval(wait); view(); trkFlush(); loadPublicSettings(); } }, 250);
  document.addEventListener("click", e => {
    const a = e.target.closest && e.target.closest("a[href^='tel:'], a[href^='mailto:'], a[href*='wa.me'], a[href*='whatsapp'], [data-track]");
    if (a) trackEv(a.dataset.track || "contact", { props: { via: (a.getAttribute("href") || "").split(":")[0].slice(0, 12) } });
  }, true);
  let qt; document.addEventListener("input", e => {
    if (e.target && e.target.id === "mkQ") { clearTimeout(qt); const v = e.target.value.trim(); qt = setTimeout(() => { if (v.length >= 2) trackEv("search", { props: { q: v.slice(0, 60) } }); }, 1400); }
  }, true);
  const wrap = (name, kind) => { try { const f = window[name]; if (typeof f !== "function" || f.__trk) return; const g = function () { trackEv(kind); return f.apply(this, arguments); }; g.__trk = true; window[name] = g; } catch (e) {} };
  wrap("shareListing", "share"); wrap("notifyModal", "notify"); wrap("saveSearchAlert", "save"); wrap("offerModal", "offer");
})();

/* ajustes públicos: aviso en la web y apertura de subastas */
async function loadPublicSettings() {
  if (!live()) return;
  try {
    const { data } = await sb.from("app_settings").select("key, value");
    const st = {}; (data || []).forEach(r => st[r.key] = r.value);
    window.APP_SETTINGS = st;
    if (st.auctions_open === true && typeof AUCTIONS_OPEN !== "undefined" && !AUCTIONS_OPEN) { AUCTIONS_OPEN = true; router(); }
    renderAnnouncement();
  } catch (e) {}
}
function renderAnnouncement() {
  const t = window.APP_SETTINGS && window.APP_SETTINGS.announcement;
  let bar = document.getElementById("siteNotice");
  if (!t || store.get("noticeClosed", "") === t) { if (bar) bar.remove(); return; }
  if (!bar) { bar = document.createElement("div"); bar.id = "siteNotice"; const top = document.getElementById("top"); (top && top.parentNode ? top.parentNode : document.body).insertBefore(bar, top ? top.nextSibling : document.body.firstChild); }
  bar.innerHTML = `<div class="wrap">${ic("bell", "sm")}<span>${esc(t)}</span><button class="icon-btn" aria-label="Cerrar aviso">${ic("x", "sm")}</button></div>`;
  bar.querySelector("button").onclick = () => { store.set("noticeClosed", t); bar.remove(); };
}

/* ---------- marcas: escaparate premium ---------- */
var BRANDS = ["Toyota", "Volkswagen", "SEAT", "Cupra", "Renault", "Peugeot", "Citroën", "Opel", "Ford", "BMW", "Mercedes-Benz", "Audi", "Škoda", "Hyundai", "Kia", "Nissan",
  "Fiat", "Dacia", "Mazda", "Volvo", "Jeep", "Mini", "Land Rover", "Porsche", "Tesla", "Honda", "Mitsubishi", "Suzuki", "Lexus", "Yamaha", "DAF", "Iveco"];
function brandCount(b) {
  const k = b.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const hit = x => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").startsWith(k);
  return market.filter(m => hit(m.make || m.title)).length + lots.filter(l => hit(l.make || l.title)).length;
}
function brandMono(b) { const w = b.replace(/[^A-Za-zÀ-ž\s-]/g, "").split(/[\s-]+/).filter(Boolean); return (w.length > 1 ? w[0][0] + w[1][0] : b.slice(0, 2)).toUpperCase(); }
function brandsShowcase() {
  const rows = [BRANDS.slice(0, 16), BRANDS.slice(16)];
  const tile = b => { const n = brandCount(b); return `<a class="bx" href="#/mercado?q=${encodeURIComponent(b)}" aria-label="${esc(b)}"><span class="bx-m" aria-hidden="true">${brandMono(b)}</span><span class="bx-t"><b translate="no">${esc(b)}</b><small>${n ? n + (n === 1 ? " vehículo" : " vehículos") : "Ver anuncios"}</small></span></a>`; };
  return `<div class="brandx" data-rev>
    <div class="brandx-h"><div><div class="eyebrow">Marcas en MotorSubasta</div><h3>Todas las marcas, un solo mercado</h3></div><a class="btn sm" href="#/mercado">${ic("store", "sm")}Ver todo el Mercado${ic("right", "sm")}</a></div>
    ${rows.map((r, i) => `<div class="brandx-row ${i ? "rev" : ""}"><div class="brandx-track">${[r, r].map((set, k) => set.map(b => k ? tile(b).replace("<a ", '<a tabindex="-1" aria-hidden="true" ') : tile(b)).join("")).join("")}</div></div>`).join("")}
  </div>`;
}

/* =====================================================================
   CONSOLA DE ADMINISTRACIÓN
   ===================================================================== */
var ADM = window.ADM || (window.ADM = { c: {}, sort: {}, f: {}, days: 30, show: {} });
function admIs() { return roleIs("admin"); }
async function admRpc(fn, args) { const { data, error } = await sb.rpc(fn, args || {}); if (error) throw error; return data; }
function admErr(e) { const m = (e && (e.message || e.details)) || String(e); toast("No se ha podido completar: " + esc(m.replace(/^.*?:\s*/, "").slice(0, 140)), "alert"); }
function admOk(msg, i) { toast(msg + (live() ? "" : " · modo demostración"), i || "check"); }
var ADM_FMT = { d: t => t ? new Date(t).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—",
  dt: t => t ? new Date(t).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—",
  e: n => n == null || n === "" || isNaN(+n) ? "—" : eur(+n), n: n => n == null ? "—" : num(+n),
  pct: (a, b) => !b ? null : Math.round((a - b) / b * 100) };
function admTitle(v) { return v ? [v.year, v.make, v.model].filter(Boolean).join(" ") : "—"; }
function admPhoto(p) { return p ? pimg(photoStem(p)) : "img/hall.jpg"; }
function admPerson(p, fallback) { if (!p) return `<span class="faint">${fallback || "—"}</span>`; return `<div class="adm-person"><b>${esc(p.name || p.email || "—")}</b>${p.email ? `<small>${esc(p.email)}</small>` : ""}${p.phone ? `<small>${esc(p.phone)}</small>` : ""}</div>`; }
function admInit(n) { return String(n || "?").split(/[\s@.]+/).filter(Boolean).slice(0, 2).map(x => x[0]).join("").toUpperCase(); }
function admCsv(name, rows) {
  if (!rows.length) return toast("No hay datos para exportar", "alert");
  const cols = Object.keys(rows[0]);
  const q = v => { const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v); return /[";\n,]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const csv = "﻿" + [cols.join(";"), ...rows.map(r => cols.map(c => q(r[c])).join(";"))].join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = name + "-" + new Date().toISOString().slice(0, 10) + ".csv"; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ---------- gráficos SVG ---------- */
function admArea(series, keys, opt) {
  opt = opt || {};
  const W = 760, H = opt.h || 230, L = 38, B = 26, T = 12, n = series.length;
  if (!n) return `<div class="adm-empty">Sin datos todavía</div>`;
  const mx = Math.max(4, ...series.flatMap(s => keys.map(k => +s[k.k] || 0)));
  const nice = Math.ceil(mx / 4) * 4, X = i => L + (n === 1 ? (W - L) / 2 : i * (W - L - 6) / (n - 1)), Y = v => T + (H - T - B) * (1 - v / nice);
  const grid = [0, .25, .5, .75, 1].map(f => `<line x1="${L}" x2="${W}" y1="${Y(nice * f)}" y2="${Y(nice * f)}" class="g"/><text x="${L - 8}" y="${Y(nice * f) + 4}" text-anchor="end">${num(nice * f)}</text>`).join("");
  const step = Math.max(1, Math.ceil(n / 8));
  const xl = series.map((s, i) => (i % step === 0 && n - 1 - i >= step * .6) || i === n - 1 ? `<text x="${X(i)}" y="${H - 6}" text-anchor="middle">${esc(s.lbl || String(s.d).slice(5).split("-").reverse().join("/"))}</text>` : "").join("");
  const id = "g" + Math.random().toString(36).slice(2, 7);
  const paths = keys.map((k, ki) => {
    const pts = series.map((s, i) => [X(i), Y(+s[k.k] || 0)]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    return `<defs><linearGradient id="${id}${ki}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${k.c}" stop-opacity="${ki ? .10 : .28}"/><stop offset="1" stop-color="${k.c}" stop-opacity="0"/></linearGradient></defs>
      <path d="${line} L ${X(n - 1)} ${Y(0)} L ${X(0)} ${Y(0)} Z" fill="url(#${id}${ki})"/><path d="${line}" fill="none" stroke="${k.c}" stroke-width="${ki ? 1.6 : 2.4}" stroke-linejoin="round" stroke-linecap="round" class="ln" ${ki ? 'stroke-dasharray="4 4"' : ""}/>`;
  }).join("");
  const data = esc(JSON.stringify({ s: series.map(s => [s.lbl || s.d, ...keys.map(k => +s[k.k] || 0)]), k: keys.map(k => [k.l, k.c]), x: series.map((s, i) => X(i)) }));
  return `<div class="adm-chart" data-chart="${data}"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(opt.label || "Gráfico")}">${grid}${paths}${xl}<line class="cur" x1="0" x2="0" y1="${T}" y2="${H - B}" style="opacity:0"/></svg><div class="adm-tip" hidden></div>
    <div class="adm-legend">${keys.map(k => `<span><i style="background:${k.c}"></i>${k.l}</span>`).join("")}</div></div>`;
}
function admBindCharts(root) {
  $$(".adm-chart", root).forEach(el => {
    if (el.__b) return; el.__b = 1;
    const d = JSON.parse(el.dataset.chart), svg = el.querySelector("svg"), tip = el.querySelector(".adm-tip"), cur = el.querySelector(".cur");
    el.addEventListener("mousemove", e => {
      const r = svg.getBoundingClientRect(), vx = (e.clientX - r.left) / r.width * svg.viewBox.baseVal.width;
      let i = 0, best = 1e9; d.x.forEach((x, j) => { const dd = Math.abs(x - vx); if (dd < best) { best = dd; i = j; } });
      cur.setAttribute("x1", d.x[i]); cur.setAttribute("x2", d.x[i]); cur.style.opacity = 1;
      const row = d.s[i]; tip.hidden = false;
      tip.innerHTML = `<b>${esc(String(row[0]).length === 10 ? new Date(row[0]).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" }) : row[0])}</b>` + d.k.map((k, j) => `<span><i style="background:${k[1]}"></i>${k[0]}<em>${num(row[j + 1])}</em></span>`).join("");
      const px = d.x[i] / svg.viewBox.baseVal.width * r.width; tip.style.left = Math.min(r.width - tip.offsetWidth - 4, Math.max(4, px + 12)) + "px";
    });
    el.addEventListener("mouseleave", () => { tip.hidden = true; cur.style.opacity = 0; });
  });
}
function admBars(list, opt) {
  opt = opt || {};
  if (!list || !list.length) return `<div class="adm-empty">${opt.empty || "Sin datos todavía"}</div>`;
  const mx = Math.max(1, ...list.map(x => +x.n || 0)), tot = list.reduce((a, x) => a + (+x.n || 0), 0);
  return `<div class="adm-bars">${list.slice(0, opt.max || 10).map(x => `<div class="br" ${x.href ? `data-href="${esc(x.href)}"` : ""}><div class="bl"><span>${x.html || esc(x.k)}</span><b>${opt.fmt ? opt.fmt(x.n) : num(x.n)}${opt.pct !== false && tot ? `<small>${Math.round(x.n / tot * 100)}%</small>` : ""}</b></div><div class="bt"><i style="width:${(x.n / mx * 100).toFixed(1)}%;${x.c ? "background:" + x.c : ""}"></i></div></div>`).join("")}</div>`;
}
function admDonut(list, opt) {
  opt = opt || {};
  const tot = list.reduce((a, x) => a + (+x.n || 0), 0);
  if (!tot) return `<div class="adm-empty">Sin datos todavía</div>`;
  const R = 54, C = 2 * Math.PI * R; let off = 0;
  const segs = list.filter(x => x.n > 0).map(x => { const l = x.n / tot * C; const s = `<circle r="${R}" cx="70" cy="70" fill="none" stroke="${x.c}" stroke-width="16" stroke-dasharray="${l.toFixed(2)} ${(C - l).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"><title>${esc(x.k)}: ${num(x.n)}</title></circle>`; off += l; return s; }).join("");
  return `<div class="adm-donut"><svg viewBox="0 0 140 140" role="img" aria-label="${esc(opt.label || "Distribución")}"><g transform="rotate(-90 70 70)"><circle r="${R}" cx="70" cy="70" fill="none" stroke="var(--surface-3)" stroke-width="16"/>${segs}</g><text x="70" y="68" text-anchor="middle" class="dv">${num(tot)}</text><text x="70" y="86" text-anchor="middle" class="dl">${esc(opt.center || "total")}</text></svg>
    <ul>${list.map(x => `<li><i style="background:${x.c}"></i><span>${esc(x.k)}</span><b>${num(x.n)}</b><small>${Math.round(x.n / tot * 100)}%</small></li>`).join("")}</ul></div>`;
}
function admSpark(vals, c) {
  if (!vals || vals.length < 2) return "";
  const mx = Math.max(1, ...vals), W = 100, H = 28;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1) * W).toFixed(1)},${(H - 2 - v / mx * (H - 4)).toFixed(1)}`).join(" ");
  return `<svg class="adm-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${c || "var(--accent)"}" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
}
function admCols(list, opt) {
  const mx = Math.max(1, ...list.map(x => x.n));
  return `<div class="adm-cols ${opt && opt.cls || ""}">${list.map(x => `<div title="${esc(x.k)}: ${num(x.n)}"><i style="height:${Math.max(2, x.n / mx * 100).toFixed(1)}%"></i><small>${esc(x.l)}</small></div>`).join("")}</div>`;
}
function admKpi(icon, label, value, sub, opt) {
  opt = opt || {};
  const d = opt.delta;
  return `<${opt.href ? `a href="${opt.href}"` : "div"} class="adm-kpi ${opt.tone || ""}"><div class="kh"><span class="ki">${ic(icon, "sm")}</span><small>${label}</small>${d != null ? `<em class="${d >= 0 ? "up" : "down"}">${d >= 0 ? "▲" : "▼"} ${Math.abs(d)}%</em>` : ""}</div>
    <b class="tnum" data-count="${typeof value === "number" ? value : ""}">${typeof value === "number" ? (opt.eur ? eur(value) : num(value)) : value}</b><span class="ks">${sub || ""}</span>${opt.spark || ""}</${opt.href ? "a" : "div"}>`;
}
function admCount(root) {
  if (RM && RM()) return;
  $$(".adm-kpi b[data-count]", root).forEach(b => {
    const to = +b.dataset.count; if (!to || to < 4 || !/^[€\d.\s]+$/.test(b.textContent.trim())) return;
    const isE = b.textContent.trim().startsWith("€"), t0 = performance.now(), dur = 700;
    const step = t => { const k = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3))); b.textContent = isE ? eur(v) : num(v); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}

/* tablas con orden por columna y paginación */
function admTable(id, cols, rows, opt) {
  opt = opt || {};
  const st = ADM.sort[id] || (opt.sort ? { k: opt.sort, d: opt.dir || -1 } : null);
  if (st) { const c = cols.find(x => x.k === st.k); if (c) { const val = c.sv || (r => r[c.k]); rows = [...rows].sort((a, b) => { const x = val(a), y = val(b); return (x == null) - (y == null) || (x > y ? 1 : x < y ? -1 : 0) * st.d; }); } }
  const lim = ADM.show[id] || opt.page || 60;
  if (!rows.length) return `<div class="panel empty adm-empty-p">${ic(opt.emptyIcon || "check", "lg")}<b>${opt.empty || "Nada que mostrar"}</b>${opt.emptySub ? `<span>${opt.emptySub}</span>` : ""}</div>`;
  return `<div class="tbl-wrap adm-tbl"><table data-tbl="${id}"><thead><tr>${cols.map(c => `<th class="${c.r ? "r" : ""} ${c.sv || c.k ? "srt" : ""}" ${c.k ? `data-sk="${c.k}"` : ""} ${c.w ? `style="width:${c.w}"` : ""}>${c.l}${st && st.k === c.k ? (st.d > 0 ? " ↑" : " ↓") : ""}</th>`).join("")}</tr></thead>
    <tbody>${rows.slice(0, lim).map(r => `<tr ${opt.href ? `data-href="${esc(opt.href(r))}" class="lnk"` : ""}>${cols.map(c => `<td class="${c.r ? "r" : ""} ${c.cls || ""}">${c.f ? c.f(r) : esc(r[c.k] == null ? "—" : r[c.k])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    ${rows.length > lim ? `<div class="adm-more"><button class="btn sm" data-more="${id}">Mostrar ${Math.min(60, rows.length - lim)} más · ${rows.length - lim} restantes</button></div>` : `<div class="adm-count">${num(rows.length)} ${rows.length === 1 ? "registro" : "registros"}</div>`}`;
}
function admBindTables(root, rerender) {
  $$("th[data-sk]", root).forEach(th => th.onclick = () => {
    const id = th.closest("table").dataset.tbl, k = th.dataset.sk, cur = ADM.sort[id];
    ADM.sort[id] = { k, d: cur && cur.k === k ? -cur.d : -1 }; rerender();
  });
  $$("[data-more]", root).forEach(b => b.onclick = () => { ADM.show[b.dataset.more] = (ADM.show[b.dataset.more] || 60) + 60; rerender(); });
  $$("tr[data-href]", root).forEach(tr => tr.onclick = e => { if (e.target.closest("a,button,input,select,label")) return; location.hash = tr.dataset.href; });
  $$("[data-href]:not(tr)", root).forEach(x => x.onclick = () => location.hash = x.dataset.href);
}

/* ---------- datos: Supabase o demostración local ---------- */
function admRnd(seed) { let s = seed % 2147483647 || 7; return () => (s = s * 16807 % 2147483647) / 2147483647; }
function admOff() {
  if (ADM.off) return ADM.off;
  const sellerU = { id: "u-vend", name: "Autos Finestrat S.L.", email: "vendedor@demo.es", phone: "+34 600 000 002", city: "Finestrat" };
  const buyers = [{ id: "u-comp", name: "Talleres Llorca S.L.", email: "comprador@demo.es", phone: "+34 600 000 001" }, { id: "u-b2", name: "Desguaces Segura", email: "segura@demo.es", phone: "+34 611 223 344" }, { id: "u-b3", name: "AutoExport Ruse", email: "ruse@demo.es", phone: "+359 88 123 4567" }];
  const r = admRnd(42), day = 86400000;
  const vs = [];
  lots.forEach((l, i) => {
    const st = statusOf(l);
    vs.push({ id: "v-" + l.id, ref: l.ref || "MS-" + (1001 + i), make: l.make, model: l.model, year: l.year, km: l.km, fuel: l.fuel, transmission: l.trans, body_type: l.body, power_cv: l.cv, displacement: l.cc, seats: l.seats,
      vin: l.vin || null, plate: l.plate || null, no_plate: false, category: l.cat, title: l.titleSt || "limpio", runs: l.runs !== false, has_keys: l.keys !== false, description: l.desc || "", photos: (l.photos || [l.img]).filter(Boolean),
      city: l.city, province: l.prov, status: "subasta", seller_kind: /S\.L\.|Profesional/.test(l.sellerType || "") ? "profesional" : "particular", created_at: new Date(now() - (i + 2) * day).toISOString(), meta: {}, seller: sellerU,
      views: 30 + Math.round(r() * 220), contacts: 0, panels: l.panels || {},
      auction: { id: l.id, status: st === "live" ? "viva" : st === "soon" ? "programada" : "cerrada", session: l.cat, starts_at: new Date(l.startsAt).toISOString(), ends_at: new Date(l.endsAt).toISOString(), start_price: l.start,
        reserve_price: l.noReserve ? null : Math.round(l.start * 2.2 / 50) * 50, buy_now_price: l.buyNow || null, top_bid: l.hist.length ? curPrice(l) : null, bids: l.hist.length, bidders: new Set(l.hist.map(h => h.who)).size,
        watchers: l.watchers || 0, featured: !!l.featured, decision: null, top: l.hist[0] ? { name: l.hist[0].who === "Tú" ? "Talleres Llorca S.L." : l.hist[0].who, email: "pujador@demo.es" } : null }, _lot: l });
  });
  market.forEach((m, i) => {
    vs.push({ id: "v-" + m.id, ref: m.ref || "MS-" + (2001 + i), make: m.make || String(m.title).split(" ")[0], model: m.model || String(m.title).split(" ").slice(1).join(" "), year: m.year, km: m.km, fuel: m.fuel, transmission: m.trans,
      body_type: m.body, power_cv: m.cv, displacement: m.cc, seats: m.seats, vin: m.vin || (i % 3 ? "VF1" + (1e13 + i * 7919) : null), plate: i % 4 ? (1000 + i * 37) + " KLM" : null, no_plate: false, category: m.cat, title: "limpio",
      runs: m.runs !== false, has_keys: m.keys !== false, description: m.desc || "", photos: (m.photos || [m.img]).filter(Boolean), city: m.city, province: m.prov || m.city, status: "mercado",
      seller_kind: m.sellerType === "Profesional" ? "profesional" : "particular", created_at: new Date(m.created || now() - (i + 1) * day).toISOString(), meta: {}, seller: i % 2 ? sellerU : { id: "u-p" + i, name: "Particular · " + m.city, email: "particular" + i + "@demo.es", phone: "+34 622 00" + (1000 + i) },
      views: 20 + Math.round(r() * 160), contacts: Math.round(r() * 14), panels: {},
      listing: { id: m.id, price: m.price, negotiable: !!m.neg, status: "activo", created_at: new Date(m.created || now() - (i + 1) * day).toISOString(), offers: Math.round(r() * 3), offers_new: i % 3 === 0 ? 1 : 0, listing_type: m.type }, _mk: m });
  });
  const sold = vs.filter(v => v.auction && v.auction.status === "cerrada" && v.auction.bids).slice(0, 2);
  const deals = sold.map((v, i) => ({ kind: i ? "decision" : "order", id: "d" + i, via: "subasta", at: v.auction.ends_at, amount: v.auction.top_bid, fee: typeof buyerFee === "function" ? buyerFee(v.auction.top_bid) : 0,
    status: i ? "decision:pendiente" : "pendiente_pago", doc_status: "pendiente", buyer: buyers[i], seller: sellerU, vehicle: { id: v.id, ref: v.ref, make: v.make, model: v.model, year: v.year, photo: v.photos[0], city: v.city } }));
  const users = DEMO_USERS.filter(u => u.role !== "dealer").map((u, i) => ({ id: "u-" + u.role, email: u.email, full_name: u.name, company: u.company, role: u.role, plan: u.plan, verification: u.verified ? "verificado" : "pendiente", blocked: false,
    phone: u.phone, city: u.city, cif: u.cif, created_at: new Date(now() - (40 - i * 9) * day).toISOString(), vehicles: u.role === "seller" ? vs.length : 0, active: u.role === "seller" ? vs.length : 0, bids: u.role === "buyer" ? 6 : 0, offers: u.role === "buyer" ? 2 : 0, buys: u.role === "buyer" ? 1 : 0, sales: 0, last_seen: new Date(now() - i * 3600e3).toISOString(), views: 120 - i * 20 }))
    .concat(S.users.filter(u => u.mail).map((u, i) => ({ id: "u-x" + i, email: u.mail, full_name: u.co !== "—" ? u.co : "", company: u.co !== "—" ? u.co : null, role: /Vend/.test(u.role) ? "seller" : "buyer", plan: "Gratis",
      verification: u.st === "ok" ? "verificado" : u.st === "pend" ? "enviado" : "pendiente", blocked: u.st === "blk", created_at: new Date(now() - (i + 3) * 3 * day).toISOString(), vehicles: 0, active: 0, bids: i % 3, offers: i % 2, buys: 0, sales: 0, last_seen: null, views: 0 })));
  const offers = vs.filter(v => v.listing).slice(0, 7).map((v, i) => ({ id: 900 + i, listing_id: v.listing.id, amount: Math.round(v.listing.price * (.78 + r() * .17) / 50) * 50, message: ["¿Acepta transferencia hoy?", "Puedo recogerlo esta semana.", "", "¿Tiene libro de mantenimiento?"][i % 4],
    status: ["nueva", "nueva", "contraoferta", "rechazada", "aceptada", "nueva", "caducada"][i], counter: i === 2 ? Math.round(v.listing.price * .95) : null, created_at: new Date(now() - i * 9 * 3600e3).toISOString(),
    buyer: buyers[i % 3], seller: v.seller, price: v.listing.price, listing_status: v.listing.status, vehicle: { id: v.id, ref: v.ref, make: v.make, model: v.model, year: v.year, photo: v.photos[0] } }));
  const R2 = admRnd(7);
  const series = [...Array(90)].map((_, i) => { const d = new Date(now() - (89 - i) * day); const w = d.getDay(), base = 60 + i * 2.4 + (w === 0 || w === 6 ? -18 : 12); const vis = Math.max(5, Math.round(base * (.8 + R2() * .45))); return { d: d.toISOString().slice(0, 10), visitors: vis, views: Math.round(vis * (2.6 + R2())), signups: Math.round(R2() * 4), bids: Math.round(R2() * 9), offers: Math.round(R2() * 5), vehicles: Math.round(R2() * 3) }; });
  ADM.off = { vs, deals, users, offers, series, log: [{ at: new Date(now() - 3600e3).toISOString(), admin_name: "Eddie", action: "editar", entity: "vehicle", entity_id: vs[0] && vs[0].id, label: vs[0] && admTitle(vs[0]), detail: { km: { de: 129000, a: 129333 } } }], notes: {}, settings: { auctions_open: false, announcement: "", contact: { email: "info@motorsubasta.com", phone: "", whatsapp: "" } } };
  return ADM.off;
}
function admOffTraffic(days) {
  const o = admOff(), s = o.series.slice(-days), p = o.series.slice(-2 * days, -days);
  const sum = (a, k) => a.reduce((x, y) => x + y[k], 0), V = sum(s, "visitors"), PV = sum(s, "views");
  const R = admRnd(days * 13);
  const vids = o.vs.slice().sort((a, b) => b.views - a.views).slice(0, 12).map(v => ({ vid: v.auction ? v.auction.id : v.listing.id, views: v.views, visitors: Math.round(v.views * .7) }));
  return { days, demo: true, kpi: { views: PV, visitors: V, users: Math.round(V * .08), events: Math.round(V * .4), pages_per_visit: +(PV / V).toFixed(2), mobile: 64 }, prev: { views: sum(p, "views") || PV * .8, visitors: sum(p, "visitors") || V * .8, events: Math.round(V * .32) },
    series: s.map(x => ({ d: x.d, views: x.views, visitors: x.visitors })),
    hours: [...Array(24)].map((_, h) => ({ h, n: Math.round((h < 7 ? 4 : h < 9 ? 20 : h < 14 ? 70 : h < 16 ? 52 : h < 22 ? 80 : 30) * (.7 + R() * .6)) })),
    weekdays: [1, 2, 3, 4, 5, 6, 7].map(w => ({ w, n: Math.round((w > 5 ? 380 : 520) * (.8 + R() * .4)) })),
    pages: [["/", 1], ["/mercado", .82], ["/mercado/·", .74], ["/subastas", .41], ["/herramientas", .22], ["/venta-rapida", .17], ["/precios", .14], ["/seguros", .12], ["/registro", .09], ["/coches-segunda-mano", .07]].map(([p, f]) => ({ path: p, views: Math.round(PV * f * .3), visitors: Math.round(V * f * .45) })),
    vehicles: vids, referrers: [["Directo", .38], ["google.com", .31], ["facebook.com", .12], ["instagram.com", .08], ["wallapop.com", .05], ["bing.com", .03]].map(([k, f]) => ({ ref: k, visitors: Math.round(V * f) })),
    campaigns: [{ source: "facebook", medium: "cpc", campaign: "lanzamiento-mercado", visitors: Math.round(V * .07) }, { source: "whatsapp", medium: "social", campaign: "grupo-talleres", visitors: Math.round(V * .03) }],
    devices: [{ k: "mobile", n: Math.round(V * .64) }, { k: "desktop", n: Math.round(V * .3) }, { k: "tablet", n: Math.round(V * .06) }],
    langs: [{ k: "es", n: Math.round(V * .71) }, { k: "en", n: Math.round(V * .12) }, { k: "uk", n: Math.round(V * .07) }, { k: "pl", n: Math.round(V * .06) }, { k: "pt", n: Math.round(V * .04) }],
    zones: [["Europe/Madrid", .82], ["Atlantic/Canary", .06], ["Europe/Warsaw", .04], ["Europe/Kiev", .04], ["Europe/Lisbon", .02], ["Europe/London", .02]].map(([k, f]) => ({ k, n: Math.round(V * f) })),
    events: [["contact", .09], ["search", .21], ["share", .02], ["save", .03], ["notify", .04], ["offer", .02], ["compare", .03]].map(([k, f]) => ({ k, n: Math.round(V * f), prev: Math.round(V * f * .8) })),
    searches: ["bmw", "golf", "furgoneta", "ibiza", "mercedes", "moto", "diesel valencia", "toyota yaris"].map((q, i) => ({ q, n: 40 - i * 4 })),
    funnel: { visitors: V, engaged: Math.round(V * .46), contact: Math.round(V * .07), register: Math.round(V * .025), publish: Math.round(V * .008) },
    live: { visitors: 3, pages: ["/mercado", "/", "/mercado/M2"] },
    recent: [...Array(12)].map((_, i) => ({ at: new Date(now() - i * 97e3).toISOString(), kind: i % 4 ? "view" : "search", path: ["/mercado", "/", "/subastas", "/mercado/M1", "/herramientas"][i % 5], device: i % 3 ? "mobile" : "desktop", lang: "es", ref: i === 3 ? "google.com" : null })) };
}
function admOffOverview() {
  const o = admOff(), vs = o.vs, t = o.series.slice(-30);
  const cnt = f => vs.filter(f).length;
  return { demo: true,
    users: { total: o.users.length, buyers: o.users.filter(u => u.role === "buyer").length, sellers: o.users.filter(u => u.role === "seller").length, admins: 1, verified: o.users.filter(u => u.verification === "verificado").length,
      to_review: o.users.filter(u => ["enviado", "revision"].includes(u.verification)).length, blocked: o.users.filter(u => u.blocked).length, new_today: 1, new7: 3, new30: 9, companies: o.users.filter(u => u.company).length },
    vehicles: { total: vs.length, subasta: cnt(v => v.status === "subasta"), mercado: cnt(v => v.status === "mercado"), vendido: cnt(v => v.status === "vendido"), borrador: cnt(v => ["borrador", "aprobado"].includes(v.status)), revision: 0, rechazado: cnt(v => v.status === "rechazado"),
      no_vin: cnt(v => !v.vin && !["vendido", "rechazado"].includes(v.status)), no_photo: cnt(v => !v.photos.length), no_plate: cnt(v => !v.plate && !v.no_plate), new7: 4, imported: cnt(v => v.meta && v.meta.legacy_ref) },
    auctions: { live: cnt(v => v.auction && v.auction.status === "viva"), scheduled: cnt(v => v.auction && v.auction.status === "programada"), closed: cnt(v => v.auction && v.auction.status === "cerrada"), awarded: 0, cancelled: 0, decision: o.deals.filter(d => d.kind === "decision").length,
      top_sum: vs.reduce((a, v) => a + (v.auction && v.auction.status === "viva" ? +v.auction.top_bid || 0 : 0), 0) },
    bids: { today: t[29].bids, d7: t.slice(-7).reduce((a, x) => a + x.bids, 0), d30: t.reduce((a, x) => a + x.bids, 0), bidders30: 11 },
    market: { active: cnt(v => v.listing && v.listing.status === "activo"), paused: 0, sold: 0, stock: vs.reduce((a, v) => a + (v.listing && v.listing.status === "activo" ? +v.listing.price : 0), 0), avg: 0 },
    offers: { new: o.offers.filter(x => x.status === "nueva").length, accepted: o.offers.filter(x => x.status === "aceptada").length, rejected: 1, counter: 1, stale: 1, d7: 5, total: o.offers.length },
    orders: { total: 1, pending_pay: 1, paid: 0, docs: 0, delivered: 0, failed: 0, gmv: o.deals.reduce((a, d) => a + (+d.amount || 0), 0), fees: o.deals.reduce((a, d) => a + (+d.fee || 0), 0), gmv30: 0 },
    leads: { car: 2, car_total: 5, insurance: 1, insurance_total: 3, waitlist: 37, alerts: 6, contact: 1, valuations: 0 },
    traffic: { views_today: t[29].views, visitors_today: t[29].visitors, views7: t.slice(-7).reduce((a, x) => a + x.views, 0), live: 3, views30: t.reduce((a, x) => a + x.views, 0) },
    series: t, top: vs.slice().sort((a, b) => b.views - a.views).slice(0, 8).map(v => ({ vid: v.auction ? v.auction.id : v.listing.id, views: v.views, visitors: Math.round(v.views * .7) })), settings: o.settings };
}
async function admGet(key, force) {
  if (!force && ADM.c[key] && now() - ADM.c[key].t < 45000) return ADM.c[key].v;
  let v;
  if (live()) {
    if (key === "ov") v = await admRpc("admin_overview");
    else if (key.startsWith("tr")) v = await admRpc("admin_traffic", { p_days: +key.slice(2) || 30 });
    else if (key === "veh") v = await admRpc("admin_vehicles");
    else if (key === "auc") v = await admRpc("admin_auctions");
    else if (key === "mk") v = await admRpc("admin_market");
    else if (key === "deals") v = await admRpc("admin_deals");
    else if (key === "users") v = await admRpc("admin_users");
    else if (key === "log") { const { data, error } = await sb.from("admin_log").select("*").order("at", { ascending: false }).limit(400); if (error) throw error; v = data; }
    else if (key.startsWith("v:")) v = await admRpc("admin_vehicle", { p_id: key.slice(2) });
    else if (key.startsWith("u:")) v = await admRpc("admin_user", { p_id: key.slice(2) });
  } else {
    const o = admOff();
    if (key === "ov") v = admOffOverview();
    else if (key.startsWith("tr")) v = admOffTraffic(+key.slice(2) || 30);
    else if (key === "veh") v = o.vs;
    else if (key === "auc") v = o.vs.filter(x => x.auction).map(x => Object.assign({}, x.auction, { vehicle: { id: x.id, ref: x.ref, make: x.make, model: x.model, year: x.year, km: x.km, photo: x.photos[0], category: x.category, city: x.city, vin: x.vin, plate: x.plate, status: x.status }, seller: x.seller, views: x.views, max_bid: x.auction.top_bid }));
    else if (key === "mk") v = { listings: o.vs.filter(x => x.listing).map(x => Object.assign({}, x.listing, { vehicle: { id: x.id, ref: x.ref, make: x.make, model: x.model, year: x.year, km: x.km, photo: x.photos[0], category: x.category, city: x.city, vin: x.vin, plate: x.plate, status: x.status, fuel: x.fuel }, seller: x.seller, views: x.views, contacts: x.contacts, best_offer: Math.max(0, ...o.offers.filter(f => f.listing_id === x.listing.id).map(f => f.amount)) || null })), offers: o.offers };
    else if (key === "deals") v = o.deals.concat(o.vs.filter(x => x.status === "vendido").map(x => ({ kind: "sold", id: x.id, via: (x.meta.sold || {}).channel || "directa", at: (x.meta.sold || {}).date, amount: (x.meta.sold || {}).price, fee: 0, status: "vendido", buyer_name: (x.meta.sold || {}).buyer, seller: x.seller, vehicle: { id: x.id, ref: x.ref, make: x.make, model: x.model, year: x.year, photo: x.photos[0], city: x.city } })));
    else if (key === "users") v = o.users;
    else if (key === "log") v = o.log;
    else if (key.startsWith("v:")) { const x = o.vs.find(q => q.id === key.slice(2)); v = x ? Object.assign({}, x, { auctions: x.auction ? [x.auction] : [], listings: x.listing ? [x.listing] : [], bids: x._lot ? x._lot.hist.map((h, i) => ({ id: i, amount: h.amt, at: new Date(h.t).toISOString(), auto: false, pre: !!h.pre, alias: "P" + (i + 1), bidder: { name: h.who === "Tú" ? "Talleres Llorca S.L." : h.who, email: "pujador@demo.es" } })) : [], offers: o.offers.filter(f => x.listing && f.listing_id === x.listing.id), orders: [], notes: o.notes[x.id] || [], log: o.log.filter(g => g.entity_id === x.id), views_series: [] }) : null; }
    else if (key.startsWith("u:")) { const u = o.users.find(q => q.id === key.slice(2)); v = u ? Object.assign({}, u, { vehicles: u.role === "seller" ? o.vs.slice(0, 12).map(x => ({ id: x.id, ref: x.ref, make: x.make, model: x.model, year: x.year, status: x.status, photo: x.photos[0], created_at: x.created_at })) : [], bids: [], offers: [], orders: [], activity: [], notes: o.notes[u.id] || [], log: [] }) : null; }
  }
  ADM.c[key] = { t: now(), v };
  return v;
}
function admDrop(...keys) { keys.forEach(k => { Object.keys(ADM.c).forEach(c => { if (c === k || (k.endsWith("*") && c.startsWith(k.slice(0, -1)))) delete ADM.c[c]; }); }); }

/* ---------- estructura ---------- */
var ADM_NAV = [
  ["General", [["", "Panel de control", "chart"], ["analitica", "Analítica y tráfico", "gauge"], ["registro", "Registro de cambios", "doc"]]],
  ["Inventario", [["vehiculos", "Vehículos", "car", "veh"], ["subastas", "Subastas", "gavel", "auc"], ["mercado", "Mercado", "store", "mk"], ["operaciones", "Vendidos y operaciones", "truck", "deals"]]],
  ["Personas", [["usuarios", "Usuarios", "users", "users"], ["solicitudes", "Solicitudes y leads", "msg", "leads"]]],
  ["Sistema", [["ajustes", "Ajustes", "gear"]]],
];
function admBadge(k) {
  const o = ADM.c.ov && ADM.c.ov.v; if (!o) return "";
  const n = k === "veh" ? (o.vehicles.no_vin || 0) : k === "auc" ? (o.auctions.decision || 0) : k === "mk" ? (o.offers.new || 0) : k === "deals" ? (o.orders.pending_pay || 0) : k === "users" ? (o.users.to_review || 0) : k === "leads" ? ((o.leads.car || 0) + (o.leads.insurance || 0) + (o.leads.contact || 0)) : 0;
  const tip = { veh: "sin VIN", auc: "decisiones pendientes", mk: "ofertas nuevas", deals: "pendientes de pago", users: "por verificar", leads: "nuevas" }[k];
  return n ? `<span class="adm-b" title="${n} ${tip}">${n}</span>` : "";
}
function admShell(sec, title, sub, actions, crumb) {
  if (!admIs()) return `<div class="wrap"><div class="panel empty" style="margin-top:40px">${ic("shield", "lg")}<b>Área restringida</b><span>El panel de administración solo está disponible para el equipo de MotorSubasta.</span><a class="btn primary" href="#/">Volver al inicio</a></div></div>`;
  return `<div class="adm">
  <aside class="adm-nav" aria-label="Administración">
    <div class="adm-brand"><span class="adm-logo">${ic("shield", "sm")}</span><div><b>Consola</b><small>MotorSubasta · ${live() ? '<i class="ok">en vivo</i>' : '<i>demostración</i>'}</small></div></div>
    <form class="adm-find" id="admFind" role="search"><span>${ic("search", "sm")}</span><input name="q" placeholder="VIN, matrícula, ref., email…" autocomplete="off" aria-label="Buscar en la consola"></form>
    ${ADM_NAV.map(([g, items]) => `<div class="adm-g"><small>${g}</small>${items.map(([k, t, i, b]) => `<a href="#/admin${k ? "/" + k : ""}" class="${sec === k ? "on" : ""}">${ic(i, "sm")}<span>${t}</span>${b ? admBadge(b) : ""}</a>`).join("")}</div>`).join("")}
    <div class="adm-foot"><a href="#/">${ic("home", "sm")}Ver la web</a><a href="#/cuenta?as=1">${ic("user", "sm")}Vista de cliente</a></div>
  </aside>
  <section class="adm-main">
    <header class="adm-top"><div>${crumb ? `<div class="adm-crumb">${crumb}</div>` : `<div class="eyebrow">${ic("shield", "sm")} Administración</div>`}<h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div><div class="adm-actions">${actions || ""}<button class="btn sm ghost" id="admReload" title="Actualizar datos">${ic("refresh", "sm")}<span>Actualizar</span></button></div></header>
    <div id="admBody" class="adm-body"><div class="adm-skel">${[...Array(4)].map(() => "<i></i>").join("")}</div><div class="adm-skel tall"><i></i><i></i></div></div>
  </section></div>`;
}
var ADM_R = {};
function admRoute(sec, title, sub, actions, crumb) {
  return (q, m) => [admShell(sec, typeof title === "function" ? title(q, m) : title, sub, typeof actions === "function" ? actions(q, m) : actions, typeof crumb === "function" ? crumb(q, m) : crumb), () => admMount(sec, q, m)];
}
async function admMount(sec, q, m) {
  if (!admIs()) return;
  const f = $("#admFind");
  if (f) f.onsubmit = e => { e.preventDefault(); const v = f.q.value.trim(); if (!v) return; location.hash = v.includes("@") ? "#/admin/usuarios?q=" + encodeURIComponent(v) : "#/admin/vehiculos?q=" + encodeURIComponent(v); };
  const rl = $("#admReload"); if (rl) rl.onclick = () => { ADM.c = {}; admMount(sec, q, m); toast("Datos actualizados", "refresh"); };
  const R = ADM_R[sec]; if (!R) return;
  const body = $("#admBody");
  try {
    if (!ADM.c.ov) admGet("ov").then(() => { $$(".adm-nav .adm-g a").forEach(a => { const it = ADM_NAV.flatMap(g => g[1]).find(x => "#/admin" + (x[0] ? "/" + x[0] : "") === a.getAttribute("href")); if (it && it[3] && !a.querySelector(".adm-b")) a.insertAdjacentHTML("beforeend", admBadge(it[3])); }); }, () => {});
    const data = await R.load(q, m);
    if (!$("#admBody") || $("#admBody") !== body) return;
    const draw = () => { const y = scrollY; body.innerHTML = R.view(data, q, m); body.classList.remove("adm-in"); void body.offsetWidth; body.classList.add("adm-in"); admBindTables(body, draw); admBindCharts(body); R.bind && R.bind(data, q, m, draw); scrollTo(0, y); };
    ADM.redraw = draw; draw(); admCount(body);
  } catch (e) {
    console.warn(e);
    body.innerHTML = `<div class="panel empty">${ic("alert", "lg")}<b>No se han podido cargar los datos</b><span>${esc((e && e.message) || String(e))}</span><button class="btn primary sm" onclick="ADM.c={};router()">Reintentar</button></div>`;
  }
}
function admSeg(id, opts, cur) { return `<div class="seg adm-seg" data-seg="${id}">${opts.map(([k, t, n]) => `<button type="button" data-v="${k}" class="${cur === k ? "on" : ""}">${t}${n != null ? `<span class="sn">${num(n)}</span>` : ""}</button>`).join("")}</div>`; }
function admBindSeg(root, draw) { $$("[data-seg]", root).forEach(s => $$("button", s).forEach(b => b.onclick = () => { ADM.f[s.dataset.seg] = b.dataset.v; Object.keys(ADM.show).forEach(k => delete ADM.show[k]); draw(); })); }
function admPanel(title, body, opt) { opt = opt || {}; return `<div class="panel adm-p ${opt.cls || ""}">${title ? `<div class="adm-ph"><h3>${title}</h3>${opt.right || ""}</div>` : ""}${body}</div>`; }
function admVehStatus(v) {
  if (v.status === "vendido") return ["Vendido", "vip", "check"];
  if (v.status === "rechazado") return ["Rechazado", "bad", "x"];
  if (v.auction && ["viva", "programada", "cerrada"].includes(v.auction.status) && v.status === "subasta") {
    const a = v.auction, t = now(), s = +new Date(a.starts_at), e = +new Date(a.ends_at);
    if (a.status !== "cancelada" && t >= s && t < e) return ["Subasta en vivo", "ok", "gavel"];
    if (a.status === "cerrada" || t >= e) return [a.decision ? "Decisión " + a.decision : "Subasta cerrada", "warn", "gavel"];
    return ["Subasta programada", "acc", "gavel"];
  }
  if (v.listing && v.listing.status === "activo") return ["En Mercado", "info", "store"];
  if (v.listing && v.listing.status === "pausado") return ["Mercado en pausa", "", "store"];
  return ["Sin publicar", "", "eyeoff"];
}
function admChip(v) { const [t, c, i] = admVehStatus(v); return `<span class="chip ${c}">${ic(i, "sm")}${t}</span>`; }

/* ---------- PANEL ---------- */
ADM_R[""] = {
  load: async () => { const [ov, veh] = await Promise.all([admGet("ov", true), admGet("veh")]); let log = []; try { log = await admGet("log"); } catch (e) {} return { ov, veh, log }; },
  view: ({ ov, veh, log }) => {
    const s = ov.series || [], last7 = s.slice(-7), prev7 = s.slice(-14, -7);
    const sum = (a, k) => a.reduce((x, y) => x + (+y[k] || 0), 0);
    const att = [
      [ov.users.to_review, "usuarios esperan verificación", "#/admin/usuarios?f=revisar", "shield", "warn"],
      [ov.auctions.decision, "subastas pendientes de decisión del vendedor", "#/admin/subastas?f=decision", "scale", "warn"],
      [ov.offers.stale, "ofertas del Mercado sin respuesta en más de 24 h", "#/admin/mercado?tab=ofertas", "msg", "bad"],
      [ov.offers.new, "ofertas nuevas en el Mercado", "#/admin/mercado?tab=ofertas", "msg", "info"],
      [ov.orders.pending_pay, "operaciones pendientes de pago", "#/admin/operaciones?f=pendientes", "euro", "warn"],
      [ov.vehicles.no_vin, "vehículos publicados sin VIN", "#/admin/vehiculos?i=novin", "car", "bad"],
      [ov.vehicles.no_plate, "vehículos sin matrícula", "#/admin/vehiculos?i=noplate", "car", ""],
      [ov.vehicles.no_photo, "vehículos sin fotos", "#/admin/vehiculos?i=nophoto", "upload", ""],
      [(ov.leads.car || 0) + (ov.leads.insurance || 0), "solicitudes nuevas (venta rápida y seguros)", "#/admin/solicitudes", "bolt", "info"],
      [ov.leads.contact, "mensajes de contacto sin atender", "#/admin/solicitudes", "msg", ""],
    ].filter(x => x[0]);
    const vmap = {}; veh.forEach(v => { vmap[v.id] = v; if (v.ref) vmap[v.ref] = v; if (v.listing) vmap[v.listing.id] = v; if (v.auction) vmap[v.auction.id] = v; });
    const inv = [{ k: "En subasta", n: ov.vehicles.subasta, c: "var(--accent)" }, { k: "En Mercado", n: ov.vehicles.mercado, c: "var(--info)" }, { k: "Vendidos", n: ov.vehicles.vendido, c: "var(--vip)" }, { k: "Sin publicar", n: ov.vehicles.borrador + ov.vehicles.revision, c: "var(--muted)" }, { k: "Rechazados", n: ov.vehicles.rechazado, c: "var(--bad)" }];
    return `${ov.demo ? `<div class="adm-demo">${ic("alert", "sm")}Modo demostración: estás viendo datos de ejemplo. Con la base de datos conectada, aquí aparecen los datos reales.</div>` : ""}
    <div class="adm-kpis">
      ${admKpi("eye", "Visitantes hoy", ov.traffic.visitors_today, `${num(ov.traffic.views_today)} páginas vistas · <b class="ok">${num(ov.traffic.live)}</b> en línea`, { href: "#/admin/analitica", spark: admSpark(s.map(x => x.visitors), "var(--accent)"), delta: ADM_FMT.pct(sum(last7, "visitors"), sum(prev7, "visitors")) })}
      ${admKpi("users", "Usuarios", ov.users.total, `+${num(ov.users.new7)} esta semana · ${num(ov.users.verified)} verificados`, { href: "#/admin/usuarios", spark: admSpark(s.map(x => x.signups), "var(--info)") })}
      ${admKpi("car", "Vehículos activos", ov.vehicles.subasta + ov.vehicles.mercado, `${num(ov.vehicles.subasta)} en subasta · ${num(ov.vehicles.mercado)} en Mercado`, { href: "#/admin/vehiculos", spark: admSpark(s.map(x => x.vehicles), "var(--ok)") })}
      ${admKpi("gavel", "Subastas", ov.auctions.live ? ov.auctions.live + " en vivo" : num(ov.auctions.scheduled), ov.auctions.live ? `${num(ov.auctions.scheduled)} programadas · ${eur(ov.auctions.top_sum)} pujado` : "programadas · " + num(ov.bids.d7) + " pujas en 7 días", { href: "#/admin/subastas", tone: ov.auctions.live ? "live" : "" })}
      ${admKpi("msg", "Ofertas Mercado", ov.offers.new, ov.offers.stale ? `<b class="bad">${ov.offers.stale} sin respuesta +24 h</b>` : `${num(ov.offers.d7)} en 7 días · ${num(ov.offers.accepted)} aceptadas`, { href: "#/admin/mercado?tab=ofertas" })}
      ${admKpi("euro", "Volumen operado", ov.orders.gmv, `${eur(ov.orders.fees)} en comisiones · ${num(ov.orders.total)} operaciones`, { href: "#/admin/operaciones", eur: true })}
    </div>
    <div class="adm-grid g-21">
      ${admPanel("Tráfico de los últimos 30 días", admArea(s, [{ k: "visitors", l: "Visitantes", c: "var(--accent)" }, { k: "views", l: "Páginas vistas", c: "var(--info)" }], { label: "Tráfico 30 días" }), { right: `<a class="btn xs" href="#/admin/analitica">Ver analítica${ic("right", "sm")}</a>` })}
      ${admPanel("Requiere tu atención", att.length ? `<ul class="adm-att">${att.map(([n, t, h, i, c]) => `<li><a href="${h}"><span class="ai ${c}">${ic(i, "sm")}</span><b class="tnum">${num(n)}</b><span>${t}</span>${ic("right", "sm")}</a></li>`).join("")}</ul>` : `<div class="adm-allok">${ic("check", "lg")}<b>Todo al día</b><span>No hay nada pendiente ahora mismo.</span></div>`)}
    </div>
    <div class="adm-grid g-4">
      ${[["Altas de usuarios", "signups", "var(--info)", "users"], ["Vehículos publicados", "vehicles", "var(--ok)", "car"], ["Ofertas Mercado", "offers", "var(--vip)", "msg"], ["Pujas", "bids", "var(--accent)", "gavel"]].map(([t, k, c, i]) =>
        `<div class="panel adm-mini"><div class="kh"><span class="ki">${ic(i, "sm")}</span><small>${t} · 30 días</small></div><b class="tnum">${num(sum(s, k))}</b>${admCols(s.map(x => ({ k: x.d, n: +x[k] || 0, l: "" })), { cls: "mini" })}<span class="ks">${num(sum(last7, k))} en los últimos 7 días</span></div>`).join("")}
    </div>
    <div class="adm-grid g-3">
      ${admPanel("Inventario", admDonut(inv, { center: "vehículos", label: "Inventario por estado" }), { right: `<a class="btn xs" href="#/admin/vehiculos">Gestionar</a>` })}
      ${admPanel("Vehículos más vistos · 30 días", (ov.top || []).length ? `<ol class="adm-top">${ov.top.map(t => { const v = vmap[t.vid]; return `<li ${v ? `data-href="#/admin/vehiculo/${v.id}"` : ""}><img src="${admPhoto(v && v.photos && v.photos[0])}" alt="" loading="lazy"><span><b>${v ? esc(admTitle(v)) : esc(t.vid)}</b><small>${v ? admVehStatus(v)[0] : ""}</small></span><em class="tnum">${num(t.views)}</em></li>`; }).join("")}</ol>` : `<div class="adm-empty">Las visitas a fichas aparecerán aquí.</div>`)}
      ${admPanel("Últimos cambios del equipo", (log || []).length ? `<ul class="adm-feed">${log.slice(0, 7).map(g => `<li><span class="dot"></span><div><b>${esc(admActionLabel(g.action))}</b> ${g.label ? "· " + esc(g.label) : ""}<small>${esc(g.admin_name || "—")} · ${ago(+new Date(g.at))}</small></div></li>`).join("")}</ul>` : `<div class="adm-empty">Aún no hay cambios registrados.</div>`, { right: `<a class="btn xs" href="#/admin/registro">Ver todo</a>` })}
    </div>
    <div class="adm-grid g-3">
      ${admPanel("Usuarios", admBars([{ k: "Compradores", n: ov.users.buyers, c: "var(--info)" }, { k: "Vendedores", n: ov.users.sellers, c: "var(--ok)" }, { k: "Empresas", n: ov.users.companies, c: "var(--vip)" }, { k: "Verificados", n: ov.users.verified, c: "var(--accent)" }, { k: "Bloqueados", n: ov.users.blocked, c: "var(--bad)" }], { pct: false }))}
      ${admPanel("Mercado", `<div class="adm-stats">${[["Anuncios activos", num(ov.market.active)], ["Valor del stock", eur(ov.market.stock)], ["Precio medio", eur(ov.market.avg || (ov.market.active ? ov.market.stock / ov.market.active : 0))], ["Ofertas totales", num(ov.offers.total)], ["Aceptadas", num(ov.offers.accepted)], ["Vendidos", num(ov.market.sold)]].map(([a, b]) => `<div><small>${a}</small><b class="tnum">${b}</b></div>`).join("")}</div>`, { right: `<a class="btn xs" href="#/admin/mercado">Abrir</a>` })}
      ${admPanel("Captación", `<div class="adm-stats">${[["Lista de espera", num(ov.leads.waitlist)], ["Venta rápida (nuevas)", num(ov.leads.car)], ["Seguros (nuevas)", num(ov.leads.insurance)], ["Alertas de búsqueda", num(ov.leads.alerts)], ["Contacto sin atender", num(ov.leads.contact)], ["Pujadores 30 días", num(ov.bids.bidders30 || 0)]].map(([a, b]) => `<div><small>${a}</small><b class="tnum">${b}</b></div>`).join("")}</div>`, { right: `<a class="btn xs" href="#/admin/solicitudes">Abrir</a>` })}
    </div>`;
  },
};
function admActionLabel(a) {
  const m = { editar: "Ficha editada", crear: "Vehículo creado", eliminar: "Vehículo eliminado", importar: "Inventario importado", usuario: "Usuario actualizado", operacion: "Operación actualizada", anuncio: "Anuncio actualizado", ajuste: "Ajuste cambiado",
    "canal:mercado": "Publicado en Mercado", "canal:subasta": "Enviado a subasta", "canal:retirar": "Retirado", "canal:vendido": "Marcado como vendido", "canal:rechazar": "Rechazado",
    "subasta:extend": "Subasta ampliada", "subasta:close": "Subasta cerrada", "subasta:cancel": "Subasta cancelada", "subasta:relist": "Subasta reprogramada", "subasta:feature": "Destacado cambiado", "subasta:edit": "Subasta editada", "subasta:accept": "Adjudicación aceptada", "subasta:reject": "Adjudicación rechazada" };
  return m[a] || (a.startsWith("oferta:") ? "Oferta → " + a.slice(7) : a);
}

/* ---------- ANALÍTICA ---------- */
ADM_R.analitica = {
  load: async q => { const d = +(q.d || ADM.days || 30); ADM.days = d; const [tr, veh] = await Promise.all([admGet("tr" + d, true), admGet("veh")]); return { tr, veh, d }; },
  view: ({ tr, veh, d }) => {
    const k = tr.kpi, p = tr.prev || {};
    const vmap = {}; veh.forEach(v => { vmap[v.id] = v; if (v.listing) vmap[v.listing.id] = v; if (v.auction) vmap[v.auction.id] = v; if (v.ref) vmap[v.ref] = v; });
    const DAYS = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const hours = [...Array(24)].map((_, h) => ({ k: h + ":00", l: h % 3 === 0 ? String(h) : "", n: ((tr.hours || []).find(x => x.h === h) || {}).n || 0 }));
    const wd = [1, 2, 3, 4, 5, 6, 7].map(w => ({ k: DAYS[w], l: DAYS[w], n: ((tr.weekdays || []).find(x => x.w === w) || {}).n || 0 }));
    const EV = { contact: "Contactos al vendedor", search: "Búsquedas", share: "Compartidos", save: "Alertas guardadas", notify: "Avisos de subastas", offer: "Ofertas iniciadas", compare: "Comparaciones", bid: "Pujas", register: "Registros", login: "Inicios de sesión", publish: "Publicaciones", lead: "Solicitudes", tool: "Herramientas", other: "Otros" };
    const DEV = { mobile: "Móvil", desktop: "Ordenador", tablet: "Tableta" };
    const LG = { es: "Español", en: "Inglés", pt: "Portugués", pl: "Polaco", uk: "Ucraniano" };
    const f = tr.funnel || {};
    const fun = [["Visitantes", f.visitors], ["Ven una ficha", f.engaged], ["Contactan u ofertan", f.contact], ["Se registran", f.register], ["Publican un vehículo", f.publish]];
    return `${tr.demo ? `<div class="adm-demo">${ic("alert", "sm")}Modo demostración: datos de ejemplo.</div>` : ""}
    <div class="adm-bar">${admSeg("days", [["1", "Hoy"], ["7", "7 días"], ["30", "30 días"], ["90", "90 días"]], String(d))}<span class="adm-live"><i></i><b>${num((tr.live || {}).visitors || 0)}</b> visitantes en línea ahora</span></div>
    <div class="adm-kpis">
      ${admKpi("users", "Visitantes únicos", k.visitors, "por día, sin cookies", { delta: ADM_FMT.pct(k.visitors, p.visitors) })}
      ${admKpi("eye", "Páginas vistas", k.views, `${k.pages_per_visit || 0} por visita`, { delta: ADM_FMT.pct(k.views, p.views) })}
      ${admKpi("bolt", "Interacciones", k.events, "contactos, búsquedas, ofertas…", { delta: ADM_FMT.pct(k.events, p.events) })}
      ${admKpi("user", "Usuarios con sesión", k.users, "visitantes registrados")}
      ${admKpi("gauge", "Desde móvil", (k.mobile || 0) + "%", "de los visitantes")}
      ${admKpi("spark", "Conversión a contacto", f.visitors ? (Math.round(f.contact / f.visitors * 1000) / 10) + "%" : "—", "visitantes que contactan u ofertan")}
    </div>
    ${admPanel("Visitantes y páginas vistas", admArea(tr.series || [], [{ k: "visitors", l: "Visitantes", c: "var(--accent)" }, { k: "views", l: "Páginas vistas", c: "var(--info)" }], { h: 250, label: "Tráfico" }))}
    <div class="adm-grid g-2">
      ${admPanel("Horas de más tráfico <small>(hora de España)</small>", admCols(hours))}
      ${admPanel("Días de la semana", admCols(wd))}
    </div>
    <div class="adm-grid g-3">
      ${admPanel("Embudo de conversión", `<div class="adm-funnel">${fun.map(([t, n], i) => `<div><span>${t}</span><i style="width:${f.visitors ? Math.max(3, (n || 0) / f.visitors * 100) : 0}%"></i><b class="tnum">${num(n || 0)}</b>${i ? `<small>${f.visitors ? (Math.round((n || 0) / f.visitors * 1000) / 10) + "%" : ""}</small>` : ""}</div>`).join("")}</div>`)}
      ${admPanel("Dispositivos", admDonut((tr.devices || []).map((x, i) => ({ k: DEV[x.k] || x.k, n: x.n, c: ["var(--accent)", "var(--info)", "var(--vip)", "var(--muted)"][i % 4] })), { center: "visitantes" }))}
      ${admPanel("Idiomas", admBars((tr.langs || []).map(x => ({ k: LG[x.k] || x.k, n: x.n }))))}
    </div>
    <div class="adm-grid g-2">
      ${admPanel("Páginas más vistas", admTable("pages", [{ k: "path", l: "Página", f: r => `<span class="mono">${esc(r.path)}</span>` }, { k: "views", l: "Vistas", r: 1, f: r => num(r.views) }, { k: "visitors", l: "Visitantes", r: 1, f: r => num(r.visitors) }], tr.pages || [], { sort: "views", page: 12, empty: "Sin visitas todavía" }))}
      ${admPanel("Vehículos más vistos", (tr.vehicles || []).length ? `<ol class="adm-top">${tr.vehicles.slice(0, 10).map(t => { const v = vmap[t.vid]; return `<li ${v ? `data-href="#/admin/vehiculo/${v.id}"` : ""}><img src="${admPhoto(v && v.photos && v.photos[0])}" alt="" loading="lazy"><span><b>${v ? esc(admTitle(v)) : esc(t.vid)}</b><small>${num(t.visitors)} visitantes</small></span><em class="tnum">${num(t.views)}</em></li>`; }).join("")}</ol>` : `<div class="adm-empty">Sin visitas a fichas todavía.</div>`)}
    </div>
    <div class="adm-grid g-3">
      ${admPanel("De dónde vienen", admBars((tr.referrers || []).map(x => ({ k: x.ref, n: x.visitors }))))}
      ${admPanel("Zonas horarias / países", admBars((tr.zones || []).map(x => ({ k: x.k.replace(/_/g, " "), n: x.n }))))}
      ${admPanel("Lo que buscan en el Mercado", (tr.searches || []).length ? `<div class="adm-tags">${tr.searches.map(x => `<a href="#/mercado?q=${encodeURIComponent(x.q)}" target="_blank">${esc(x.q)}<b>${num(x.n)}</b></a>`).join("")}</div>` : `<div class="adm-empty">Aún no hay búsquedas.</div>`)}
    </div>
    <div class="adm-grid g-2">
      ${admPanel("Interacciones", (tr.events || []).length ? `<div class="adm-evs">${tr.events.map(x => { const dd = ADM_FMT.pct(x.n, x.prev); return `<div><small>${EV[x.k] || x.k}</small><b class="tnum">${num(x.n)}</b>${dd != null ? `<em class="${dd >= 0 ? "up" : "down"}">${dd >= 0 ? "▲" : "▼"} ${Math.abs(dd)}%</em>` : ""}</div>`; }).join("")}</div>` : `<div class="adm-empty">Aún no hay interacciones registradas.</div>`)}
      ${admPanel("Campañas (UTM)", (tr.campaigns || []).length ? admTable("utm", [{ k: "source", l: "Fuente" }, { k: "medium", l: "Medio" }, { k: "campaign", l: "Campaña" }, { k: "visitors", l: "Visitantes", r: 1, f: r => num(r.visitors) }], tr.campaigns, { sort: "visitors", page: 10 }) : `<div class="adm-empty">Añade <code>?utm_source=facebook&amp;utm_campaign=lanzamiento</code> a tus enlaces y verás aquí qué campaña trae a cada visitante.</div>`)}
    </div>
    ${admPanel("Actividad en directo", `<ul class="adm-stream">${(tr.recent || []).map(e => `<li><time>${new Date(e.at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</time><span class="chip ${e.kind === "view" ? "" : "acc"}">${EV[e.kind] || (e.kind === "view" ? "Visita" : e.kind)}</span><span class="mono">${esc(e.path || "")}</span><small>${DEV[e.device] || ""}${e.ref ? " · desde " + esc(e.ref) : ""}</small></li>`).join("") || "<li class='faint'>Sin actividad reciente</li>"}</ul>`, { right: `<small class="muted">Analítica propia, sin cookies ni datos personales.</small>` })}`;
  },
  bind: (d, q, m, draw) => { $$("[data-seg='days'] button").forEach(b => b.onclick = () => { location.hash = "#/admin/analitica?d=" + b.dataset.v; }); },
};

/* ---------- VEHÍCULOS ---------- */
function admChannel(v) {
  const s = admVehStatus(v)[0];
  return v.status === "vendido" ? "vendidos" : v.status === "rechazado" ? "rechazados" : /^Subasta|^Decisión/.test(s) ? "subasta" : /Mercado/.test(s) && s !== "Mercado en pausa" ? "mercado" : "sin";
}
function admVehPrice(v) {
  if (v.status === "vendido" && v.meta && v.meta.sold) return v.meta.sold.price;
  if (v.auction && v.status === "subasta") return v.auction.top_bid || v.auction.start_price;
  if (v.listing) return v.listing.price;
  return v.meta && v.meta.market_value;
}
ADM_R.vehiculos = {
  load: async q => { if (q.q != null) ADM.f.vq = q.q; if (q.i) ADM.f.vi = q.i; if (q.ch) ADM.f.vch = q.ch; return { veh: await admGet("veh") }; },
  view: ({ veh }) => {
    const ch = ADM.f.vch || "todos", cat = ADM.f.vcat || "", iss = ADM.f.vi || "", qq = (ADM.f.vq || "").trim().toLowerCase().replace(/[\s-]/g, "");
    const cnt = k => veh.filter(v => k === "todos" || admChannel(v) === k).length;
    let rows = veh.filter(v => ch === "todos" || admChannel(v) === ch).filter(v => !cat || v.category === cat)
      .filter(v => !iss || (iss === "novin" ? !v.vin : iss === "noplate" ? !v.plate && !v.no_plate : iss === "nophoto" ? !(v.photos || []).length : iss === "imported" ? v.meta && v.meta.legacy_ref : iss === "nodesc" ? !v.description : true))
      .filter(v => !qq || [v.ref, v.vin, v.plate, v.make, v.model, v.city, v.seller && v.seller.email, v.seller && v.seller.name, v.meta && v.meta.legacy_ref, v.year].join(" ").toLowerCase().replace(/[\s-]/g, "").includes(qq)
        || (v.make + v.model).toLowerCase().replace(/\s/g, "").includes(qq));
    return `<div class="adm-bar">
      ${admSeg("vch", [["todos", "Todos", cnt("todos")], ["subasta", "Subasta", cnt("subasta")], ["mercado", "Mercado", cnt("mercado")], ["sin", "Sin publicar", cnt("sin")], ["vendidos", "Vendidos", cnt("vendidos")], ["rechazados", "Rechazados", cnt("rechazados")]], ch)}
      <div class="adm-filters"><div class="search">${ic("search")}<input class="in" id="vQ" placeholder="Marca, modelo, VIN, matrícula, ref., vendedor…" value="${esc(ADM.f.vq || "")}"></div>
      <select class="in" id="vCat" aria-label="Categoría"><option value="">Todas las categorías</option>${Object.entries(CATS).map(([k, c]) => `<option value="${k}" ${cat === k ? "selected" : ""}>${c.short}</option>`).join("")}</select>
      <select class="in" id="vIss" aria-label="Revisión"><option value="">Sin filtro de calidad</option>${[["novin", "Sin VIN"], ["noplate", "Sin matrícula"], ["nophoto", "Sin fotos"], ["nodesc", "Sin descripción"], ["imported", "Importados de la web anterior"]].map(([k, t]) => `<option value="${k}" ${iss === k ? "selected" : ""}>${t}</option>`).join("")}</select></div></div>
    ${admTable("veh", [
      { k: "make", l: "Vehículo", sv: v => admTitle(v), f: v => `<div class="adm-veh"><img src="${admPhoto((v.photos || [])[0])}" alt="" loading="lazy"><div><b>${esc(admTitle(v))}</b><small>${esc(v.ref || "")} · ${num(v.km || 0)} km · ${esc(v.city || "—")}</small></div></div>` },
      { k: "vin", l: "VIN · Matrícula", f: v => `<div class="adm-id"><span class="mono ${v.vin ? "" : "bad"}">${v.vin ? esc(v.vin) : "Falta VIN"}</span><span class="mono ${v.plate || v.no_plate ? "" : "warn"}">${v.plate ? esc(v.plate) : v.no_plate ? "Sin matrícula (exento)" : "Falta matrícula"}</span></div>` },
      { k: "status", l: "Estado", sv: v => admVehStatus(v)[0], f: v => admChip(v) + ` <span class="chip ${CATS[v.category] ? CATS[v.category].chip : ""}">${CATS[v.category] ? CATS[v.category].short : v.category}</span>` },
      { k: "price", l: "Precio / puja", r: 1, sv: v => +admVehPrice(v) || 0, f: v => `<b class="tnum">${ADM_FMT.e(admVehPrice(v))}</b>${v.auction && v.status === "subasta" ? `<small class="muted">${v.auction.top_bid ? "puja máx." : "salida"}</small>` : v.listing ? `<small class="muted">${v.listing.negotiable ? "negociable" : "precio fijo"}</small>` : ""}` },
      { k: "views", l: "Actividad", r: 1, sv: v => +v.views || 0, f: v => `<span class="adm-act">${ic("eye", "sm")}${num(v.views || 0)}</span>${v.auction ? `<span class="adm-act">${ic("gavel", "sm")}${num(v.auction.bids || 0)}</span>` : ""}${v.listing ? `<span class="adm-act">${ic("msg", "sm")}${num(v.listing.offers || 0)}${v.listing.offers_new ? `<i class="adm-b">${v.listing.offers_new}</i>` : ""}</span>` : ""}` },
      { k: "seller", l: "Vendedor", sv: v => v.seller && v.seller.name, f: v => admPerson(v.seller) },
      { k: "created_at", l: "Alta", sv: v => v.created_at, f: v => `<span class="tnum muted">${ADM_FMT.d(v.created_at)}</span>` },
    ], rows, { href: v => "#/admin/vehiculo/" + v.id, sort: "created_at", empty: "No hay vehículos con estos filtros", emptyIcon: "car" })}`;
  },
  bind: (d, q, m, draw) => {
    admBindSeg($("#admBody"), draw);
    let t; $("#vQ").oninput = e => { clearTimeout(t); t = setTimeout(() => { ADM.f.vq = e.target.value; const p = e.target.selectionStart; draw(); const i = $("#vQ"); i.focus(); i.setSelectionRange(p, p); }, 180); };
    $("#vCat").onchange = e => { ADM.f.vcat = e.target.value; draw(); };
    $("#vIss").onchange = e => { ADM.f.vi = e.target.value; draw(); };
    $("#admNewVeh") && ($("#admNewVeh").onclick = () => location.hash = "#/admin/vehiculo/nuevo");
    $("#admCsvVeh") && ($("#admCsvVeh").onclick = () => admCsv("vehiculos", d.veh.map(v => ({ ref: v.ref, marca: v.make, modelo: v.model, año: v.year, km: v.km, combustible: v.fuel, cambio: v.transmission, vin: v.vin, matricula: v.plate, categoria: v.category, estado: admVehStatus(v)[0], precio: admVehPrice(v), ciudad: v.city, provincia: v.province, vendedor: v.seller && v.seller.name, email_vendedor: v.seller && v.seller.email, telefono_vendedor: v.seller && v.seller.phone, vistas: v.views, pujas: v.auction && v.auction.bids, ofertas: v.listing && v.listing.offers, alta: v.created_at, ref_anterior: v.meta && v.meta.legacy_ref }))));
  },
};

/* ficha completa del vehículo */
var ADM_FUEL = ["Gasolina", "Diésel", "Híbrido", "Híbrido enchufable", "Eléctrico", "GLP", "GNC", "Otro"];
var ADM_TRANS = ["Manual", "Automático"];
var ADM_BODY = ["Compacto", "Berlina", "Familiar", "SUV", "Todoterreno", "Monovolumen", "Coupé", "Cabrio", "Furgoneta", "Pick-up", "Camión", "Autocaravana", "Motocicleta", "Otro"];
function admF(id, label, val, opt) {
  opt = opt || {};
  const v = val == null ? "" : val;
  const inp = opt.sel ? `<select class="in" id="${id}" data-k="${opt.k || ""}">${opt.blank !== false ? `<option value="">—</option>` : ""}${opt.sel.map(o => { const [k, t] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(k)}" ${String(v) === String(k) ? "selected" : ""}>${esc(t)}</option>`; }).join("")}${v && !opt.sel.some(o => String(Array.isArray(o) ? o[0] : o) === String(v)) ? `<option value="${esc(v)}" selected>${esc(v)}</option>` : ""}</select>`
    : opt.area ? `<textarea class="in" id="${id}" data-k="${opt.k || ""}" rows="${opt.rows || 6}">${esc(v)}</textarea>`
    : `<input class="in ${opt.mono ? "mono" : ""}" id="${id}" data-k="${opt.k || ""}" type="${opt.type || "text"}" value="${esc(v)}" ${opt.ph ? `placeholder="${esc(opt.ph)}"` : ""} ${opt.ro ? "readonly" : ""} ${opt.max ? `maxlength="${opt.max}"` : ""}>`;
  return `<div class="field ${opt.cls || ""}"><label for="${id}">${label}${opt.hint ? ` <small class="muted">${opt.hint}</small>` : ""}</label>${inp}${opt.after || ""}</div>`;
}
function admTog(id, label, on, k) { return `<label class="adm-tog"><input type="checkbox" id="${id}" data-k="${k || ""}" ${on ? "checked" : ""}><span class="toggle-ui"></span>${label}</label>`; }
ADM_R.vehiculo = {
  load: async (q, m) => {
    if (m[1] === "nuevo") { let users = []; try { users = await admGet("users"); } catch (e) {} return { v: { id: null, photos: [], meta: {}, category: "limpio", title: "limpio", runs: true, has_keys: true, status: "aprobado", auctions: [], listings: [], bids: [], offers: [], orders: [], notes: [], log: [] }, users, isNew: true }; }
    const [v, users] = await Promise.all([admGet("v:" + m[1], true), admGet("users").catch(() => [])]);
    if (!v) throw new Error("Este vehículo no existe o ha sido eliminado.");
    v.auction = (v.auctions || [])[0] || v.auction || null; v.listing = (v.listings || [])[0] || v.listing || null;
    ADM.photos = (v.photos || []).slice();
    return { v, users };
  },
  view: ({ v, users, isNew }) => {
    if (isNew) ADM.photos = ADM.photos && ADM.__newKeep ? ADM.photos : [];
    const a = v.auction, l = v.listing, mt = v.meta || {}, tech = mt.tech || {};
    const st = admVehStatus(v);
    const ph = ADM.photos || [];
    const t = now(), live1 = a && a.status !== "cancelada" && t >= +new Date(a.starts_at) && t < +new Date(a.ends_at);
    const TECH = { keys: "Llaves", airbags: "Airbags", mechanical: "Mecánica", drivingStatus: "Circulación", structuralDamage: "Estructura", documentation: "Documentación", legalStatus: "Situación legal", intendedUse: "Uso previsto" };
    const techHtml = Object.entries(TECH).filter(([k]) => Array.isArray(tech[k]) && tech[k].length).map(([k, t]) => `<div><small>${t}</small><div class="adm-tags sm">${tech[k].map(x => `<span>${esc(String(x).replace(/_/g, " "))}</span>`).join("")}</div></div>`).join("");
    return `<div class="adm-ed">
    <div class="adm-ed-main">
      ${admPanel("Datos del vehículo", `<div class="fgrid g3">
        ${admF("eMake", "Marca *", v.make, { k: "make" })}${admF("eModel", "Modelo y versión *", v.model, { k: "model" })}${admF("eYear", "Año *", v.year, { k: "year", type: "number" })}
        ${admF("eKm", "Kilómetros *", v.km, { k: "km", type: "number" })}${admF("eFuel", "Combustible", v.fuel, { k: "fuel", sel: ADM_FUEL })}${admF("eTrans", "Cambio", v.transmission, { k: "transmission", sel: ADM_TRANS })}
        ${admF("eBody", "Carrocería", v.body_type, { k: "body_type", sel: ADM_BODY })}${admF("eCv", "Potencia (CV)", v.power_cv, { k: "power_cv", type: "number" })}${admF("eCc", "Cilindrada (cc)", v.displacement, { k: "displacement", type: "number" })}
        ${admF("eSeats", "Plazas", v.seats, { k: "seats", type: "number" })}${admF("eFirst", "1.ª matriculación", v.first_reg, { k: "first_reg", type: "date" })}${admF("eCity", "Ciudad", v.city, { k: "city" })}
        ${admF("eProv", "Provincia", v.province, { k: "province" })}</div>`)}
      ${admPanel("Identificación", `<div class="fgrid g3">
        ${admF("eVin", "VIN (bastidor)", v.vin, { k: "vin", mono: 1, max: 17, after: `<small class="muted" id="eVinMsg"></small>` })}
        ${admF("ePlate", "Matrícula", v.plate, { k: "plate", mono: 1, max: 12 })}
        ${admF("eRef", "Referencia", v.ref || "se asigna al guardar", { ro: 1, mono: 1 })}</div>
        ${admTog("eNoPlate", "Vehículo sin matrícula (exento, extranjero, maquinaria…)", v.no_plate, "no_plate")}`)}
      ${admPanel("Estado y categoría", `<div class="fgrid g3">
        ${admF("eCat", "Categoría / sesión", v.category, { k: "category", sel: Object.entries(CATS).map(([k, c]) => [k, c.name]), blank: false })}
        ${admF("eTitle", "Documentación", v.title, { k: "title", sel: [["limpio", "Título limpio"], ["salvamento", "Salvamento"], ["piezas", "Solo piezas"]], blank: false })}
        ${admF("eKind", "Tipo de vendedor", v.seller_kind, { k: "seller_kind", sel: [["particular", "Particular"], ["profesional", "Profesional"]], blank: false })}</div>
        <div class="adm-togs">${admTog("eRuns", "Arranca y circula", v.runs !== false, "runs")}${admTog("eKeys", "Tiene llaves", v.has_keys !== false, "has_keys")}</div>`)}
      ${admPanel("Descripción", admF("eDesc", "Texto del anuncio", v.description, { k: "description", area: 1, rows: 7 }))}
      ${admPanel(`Fotos <small class="muted">${ph.length}</small>`, `<div class="adm-photos" id="ePhotos">${ph.map((p, i) => `<figure draggable="true" data-i="${i}"><img src="${admPhoto(p)}" alt="" loading="lazy">${i === 0 ? `<span class="chip acc">Portada</span>` : ""}<div class="pa"><button type="button" data-pm="${i}" data-d="-1" aria-label="Mover a la izquierda">${ic("left", "sm")}</button><button type="button" data-pc="${i}" aria-label="Usar de portada">${ic("spark", "sm")}</button><button type="button" data-pm="${i}" data-d="1" aria-label="Mover a la derecha">${ic("right", "sm")}</button><button type="button" data-px="${i}" aria-label="Quitar foto">${ic("x", "sm")}</button></div></figure>`).join("")}
        <label class="adm-up">${ic("upload")}<b>Subir fotos</b><small>JPG o PNG · varias a la vez</small><input type="file" id="ePhotoUp" accept="image/*" multiple hidden></label></div>
        <form class="adm-addurl" id="ePhotoUrlF"><input class="in" id="ePhotoUrl" placeholder="…o pega la URL de una foto (https://…)"><button class="btn sm">${ic("plus", "sm")}Añadir</button></form>`)}
      ${!isNew ? admPanel("Datos internos", `<div class="fgrid g3">
        ${admF("eMv", "Valor de mercado estimado (€)", mt.market_value, { type: "number" })}
        ${admF("eScore", "Puntuación de estado (0–100)", mt.score, { type: "number" })}
        ${admF("eLegacy", "Ref. en la web anterior", mt.legacy_ref || "—", { ro: 1, mono: 1 })}</div>
        ${mt.origin || mt.damage_level ? `<div class="adm-stats sm">${mt.origin ? `<div><small>Origen</small><b>${esc(String(mt.origin).replace(/_/g, " "))}</b></div>` : ""}${mt.damage_level ? `<div><small>Nivel de daño</small><b>${esc(mt.damage_level)}</b></div>` : ""}${mt.legacy_views != null ? `<div><small>Vistas en la web anterior</small><b>${num(mt.legacy_views)}</b></div>` : ""}${mt.export_ok ? `<div><small>Exportación</small><b>Apto</b></div>` : ""}</div>` : ""}
        ${techHtml ? `<div class="adm-tech">${techHtml}</div>` : ""}`) : ""}
      ${!isNew && (v.bids || []).length ? admPanel(`Pujas <small class="muted">${v.bids.length}</small>`, admTable("vbids", [{ k: "amount", l: "Importe", f: b => `<b class="tnum">${eur(b.amount)}</b>${b.auto ? ' <span class="chip">auto</span>' : ""}${b.pre ? ' <span class="chip">pre-puja</span>' : ""}` }, { k: "bidder", l: "Pujador (real)", sv: b => b.bidder && b.bidder.name, f: b => admPerson(b.bidder) }, { k: "alias", l: "Alias público", f: b => `<span class="mono">${esc(b.alias || "—")}</span>` }, { k: "at", l: "Fecha", f: b => ADM_FMT.dt(b.at) }], v.bids, { sort: "amount", page: 15 })) : ""}
      ${!isNew && (v.offers || []).length ? admPanel(`Ofertas del Mercado <small class="muted">${v.offers.length}</small>`, admOffersTable("voff", v.offers.map(o => Object.assign({}, o, { price: l && l.price, vehicle: null })))) : ""}
    </div>
    <aside class="adm-ed-side">
      <div class="panel adm-hero"><img src="${admPhoto(ph[0])}" alt=""><div><span class="chip ${st[1]}">${ic(st[2], "sm")}${st[0]}</span><h3>${esc(admTitle(v)) || "Nuevo vehículo"}</h3><small class="muted">${esc(v.ref || "")}${v.created_at ? " · alta " + ADM_FMT.d(v.created_at) : ""}</small></div></div>
      ${!isNew ? `<div class="panel adm-p"><div class="adm-ph"><h3>Publicación</h3></div>
        ${a && v.status === "subasta" ? `<div class="adm-stats sm">
            <div><small>Sesión</small><b>${CATS[a.session] ? CATS[a.session].short : a.session}</b></div><div><small>${live1 ? "Cierra en" : t < +new Date(a.starts_at) ? "Empieza en" : "Cerró"}</small><b class="mono tnum" data-adm-tm="${live1 ? a.ends_at : a.starts_at}">${t < +new Date(a.ends_at) ? fmtLeft((live1 ? +new Date(a.ends_at) : +new Date(a.starts_at)) - t) : ADM_FMT.dt(a.ends_at)}</b></div>
            <div><small>Salida</small><b class="tnum">${ADM_FMT.e(a.start_price)}</b></div><div><small>Reserva</small><b class="tnum">${ADM_FMT.e(a.reserve_price)}</b></div>
            <div><small>Compra ya</small><b class="tnum">${ADM_FMT.e(a.buy_now_price)}</b></div><div><small>Puja máx.</small><b class="tnum">${ADM_FMT.e(a.top_bid)}</b></div>
            <div><small>Pujas</small><b class="tnum">${num((v.bids || []).length || a.bids || 0)}</b></div><div><small>Seguidores</small><b class="tnum">${num(a.watchers || 0)}</b></div></div>
            ${a.top ? `<div class="adm-who"><small>Mejor postor (solo admin)</small>${admPerson(a.top)}</div>` : ""}
            ${a.decision ? `<div class="adm-who warn"><small>Decisión del vendedor</small><b>${esc(a.decision)}</b>${a.decision_deadline ? `<small>vence ${ADM_FMT.dt(a.decision_deadline)}</small>` : ""}</div>` : ""}
            <div class="adm-btns"><button class="btn sm" data-aa="edit" data-id="${a.id}">${ic("gear", "sm")}Editar subasta</button><button class="btn sm" data-aa="extend" data-id="${a.id}">${ic("clock", "sm")}+15 min</button>
              ${live1 ? `<button class="btn sm" data-aa="close" data-id="${a.id}">${ic("gavel", "sm")}Cerrar ya</button>` : `<button class="btn sm" data-aa="relist" data-id="${a.id}">${ic("refresh", "sm")}Reprogramar</button>`}
              ${a.decision === "pendiente" || a.decision === "contraoferta" || a.decision === "caducada" || (a.status === "cerrada" && a.top_bid) ? `<button class="btn sm ok" data-aa="accept" data-id="${a.id}">${ic("check", "sm")}Adjudicar</button><button class="btn sm bad" data-aa="reject" data-id="${a.id}">No adjudicar</button>` : ""}
              <button class="btn sm" data-aa="feature" data-id="${a.id}">${ic("spark", "sm")}${a.featured ? "Quitar destacado" : "Destacar"}</button><button class="btn sm bad ghost" data-aa="cancel" data-id="${a.id}">Cancelar subasta</button></div>`
        : l && v.status === "mercado" ? `<div class="adm-stats sm"><div><small>Precio</small><b class="tnum">${ADM_FMT.e(l.price)}</b></div><div><small>Estado</small><b>${esc(l.status)}</b></div><div><small>Negociable</small><b>${l.negotiable ? "Sí" : "No"}</b></div><div><small>Ofertas</small><b class="tnum">${num((v.offers || []).length)}</b></div><div><small>Vistas</small><b class="tnum">${num(v.views || 0)}</b></div><div><small>Online desde</small><b>${ADM_FMT.d(l.created_at)}</b></div></div>
            <div class="adm-btns"><button class="btn sm" data-ls="price" data-id="${l.id}">${ic("euro", "sm")}Cambiar precio</button>${l.status === "activo" ? `<button class="btn sm" data-ls="pausado" data-id="${l.id}">Pausar anuncio</button>` : `<button class="btn sm ok" data-ls="activo" data-id="${l.id}">Reactivar</button>`}<button class="btn sm" data-ls="neg" data-id="${l.id}">${l.negotiable ? "Marcar precio fijo" : "Marcar negociable"}</button></div>`
        : v.status === "vendido" ? `<div class="adm-who"><small>Venta registrada</small><b class="tnum">${ADM_FMT.e(mt.sold && mt.sold.price)}</b>${mt.sold ? `<small>${esc(mt.sold.buyer || "")} · ${esc(mt.sold.channel || "")} · ${esc(mt.sold.date || "")}</small>` : ""}</div>`
        : `<p class="muted" style="margin:0 0 10px">Este vehículo no está publicado. Elige dónde publicarlo: solo puede estar en un sitio a la vez.</p>`}
        <div class="adm-btns main">
          ${v.status !== "mercado" ? `<button class="btn sm primary" data-ch="mercado">${ic("store", "sm")}Publicar en Mercado</button>` : ""}
          ${v.status !== "subasta" ? `<button class="btn sm primary" data-ch="subasta">${ic("gavel", "sm")}Enviar a subasta</button>` : ""}
          ${v.status !== "vendido" ? `<button class="btn sm" data-ch="vendido">${ic("check", "sm")}Marcar vendido</button>` : ""}
          ${["subasta", "mercado"].includes(v.status) ? `<button class="btn sm" data-ch="retirar">${ic("eyeoff", "sm")}Retirar</button>` : ""}
          ${v.status !== "rechazado" ? `<button class="btn sm bad ghost" data-ch="rechazar">${ic("x", "sm")}Rechazar</button>` : ""}
        </div>
        <a class="adm-pub" href="${a && v.status === "subasta" ? "#/subasta/" + a.id : l ? "#/mercado/" + l.id : "#/"}" target="_blank">${ic("eye", "sm")}Ver la ficha pública</a>
      </div>` : ""}
      <div class="panel adm-p"><div class="adm-ph"><h3>Vendedor</h3></div>
        ${v.seller ? admPerson(v.seller) + (v.seller.id && !String(v.seller.id).startsWith("u-p") ? `<a class="btn xs" style="margin-top:8px" href="#/admin/usuario/${v.seller.id}">${ic("user", "sm")}Ver usuario</a>` : "") : ""}
        <div class="field" style="margin-top:10px"><label for="eSeller">${v.seller ? "Cambiar vendedor" : "Asignar vendedor"}</label><select class="in" id="eSeller"><option value="">${v.seller ? "— mantener —" : "Yo (MotorSubasta)"}</option>${(users || []).filter(u => u.role !== "buyer" || u.company).map(u => `<option value="${u.id}">${esc((u.company || u.full_name || u.email) + " · " + u.email)}</option>`).join("")}</select></div>
      </div>
      ${!isNew ? `<div class="panel adm-p"><div class="adm-ph"><h3>Notas internas</h3></div>
        <form id="eNoteF" class="adm-note-f"><textarea class="in" id="eNote" rows="2" placeholder="Solo las ve el equipo…"></textarea><button class="btn sm">${ic("plus", "sm")}Añadir nota</button></form>
        <ul class="adm-notes">${(v.notes || []).map(n => `<li><p>${esc(n.body)}</p><small>${esc(n.admin_name || "")} · ${ADM_FMT.dt(n.created_at)}</small></li>`).join("") || "<li class='faint'>Sin notas</li>"}</ul></div>
      <div class="panel adm-p"><div class="adm-ph"><h3>Historial</h3></div><ul class="adm-feed">${(v.log || []).map(g => `<li><span class="dot"></span><div><b>${esc(admActionLabel(g.action))}</b>${g.detail && Object.keys(g.detail).length && !g.detail.snapshot ? `<small>${esc(Object.entries(g.detail).slice(0, 4).map(([k, x]) => x && typeof x === "object" && "a" in x ? k + ": " + (x.de ?? "—") + " → " + (x.a ?? "—") : k + ": " + (typeof x === "object" ? JSON.stringify(x) : x)).join(" · "))}</small>` : ""}<small>${esc(g.admin_name || "")} · ${ADM_FMT.dt(g.at)}</small></div></li>`).join("") || "<li class='faint'>Sin cambios registrados</li>"}</ul></div>
      <div class="panel adm-p adm-danger"><div class="adm-ph"><h3>Zona peligrosa</h3></div><p class="muted">Eliminar borra el vehículo, sus subastas, pujas y anuncios. No se puede deshacer.</p><button class="btn sm bad" id="eDel">${ic("x", "sm")}Eliminar vehículo</button></div>` : ""}
    </aside>
    </div>
    <div class="adm-save" id="eSaveBar"><span>${ic("alert", "sm")}<b>Cambios sin guardar</b></span><button class="btn sm ghost" id="eDiscard">Descartar</button><button class="btn sm primary" id="eSave">${ic("check", "sm")}${isNew ? "Crear vehículo" : "Guardar cambios"}</button></div>`;
  },
  bind: (d, q, m, draw) => {
    const v = d.v, body = $("#admBody");
    const bar = $("#eSaveBar"); const dirty = () => bar.classList.add("on");
    $$("[data-k], #eMv, #eScore, #eSeller", body).forEach(i => { i.addEventListener("input", dirty); i.addEventListener("change", dirty); });
    $("#eDiscard").onclick = () => { if (d.isNew) { ADM.photos = []; } else ADM.photos = (v.photos || []).slice(); draw(); };
    const vin = $("#eVin");
    const vinMsg = () => { const x = vin.value.trim().toUpperCase(); const msg = $("#eVinMsg"); if (!x) { msg.textContent = "Obligatorio para publicar"; msg.className = "bad"; return; } if (typeof vinCheck === "function") { try { const r = vinCheck(x); if (r) { msg.textContent = r.ok ? "✓ " + [r.make, r.region, (r.years || []).join("/")].filter(Boolean).join(" · ") + (r.check === false ? " · dígito de control no coincide" : "") : (r.errs || [])[0] || "Revisa el VIN"; msg.className = r.ok && r.check !== false ? "ok" : "warn"; return; } } catch (e) {} } msg.textContent = x.length === 17 ? "17 caracteres" : x.length + "/17 caracteres"; msg.className = x.length === 17 ? "ok" : "warn"; };
    vin.addEventListener("input", vinMsg); vinMsg();
    const photosRedraw = () => { const keepScroll = scrollY; dirty(); const box = $("#ePhotos"); const html = ADM_R.vehiculo.view(d, q, m); const tmp = document.createElement("div"); tmp.innerHTML = html; box.innerHTML = tmp.querySelector("#ePhotos").innerHTML; bindPhotos(); $(".adm-hero img").src = admPhoto(ADM.photos[0]); scrollTo(0, keepScroll); };
    const bindPhotos = () => {
      $$("[data-px]", body).forEach(b => b.onclick = () => { ADM.photos.splice(+b.dataset.px, 1); photosRedraw(); });
      $$("[data-pc]", body).forEach(b => b.onclick = () => { const i = +b.dataset.pc; ADM.photos.unshift(ADM.photos.splice(i, 1)[0]); photosRedraw(); });
      $$("[data-pm]", body).forEach(b => b.onclick = () => { const i = +b.dataset.pm, j = i + +b.dataset.d; if (j < 0 || j >= ADM.photos.length) return; [ADM.photos[i], ADM.photos[j]] = [ADM.photos[j], ADM.photos[i]]; photosRedraw(); });
      let from = null;
      $$("#ePhotos figure", body).forEach(f => { f.ondragstart = () => from = +f.dataset.i; f.ondragover = e => e.preventDefault(); f.ondrop = e => { e.preventDefault(); const to = +f.dataset.i; if (from == null || from === to) return; ADM.photos.splice(to, 0, ADM.photos.splice(from, 1)[0]); from = null; photosRedraw(); }; });
      const up = $("#ePhotoUp"); if (up) up.onchange = async () => {
        const files = [...up.files]; if (!files.length) return;
        for (const f of files) {
          if (live()) {
            try { const uid = (await sb.auth.getUser()).data.user.id; const path = `${uid}/admin/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${(f.name.split(".").pop() || "jpg").toLowerCase()}`;
              const { error } = await sb.storage.from("vehicle-photos").upload(path, f, { contentType: f.type, upsert: false }); if (error) throw error;
              ADM.photos.push(sb.storage.from("vehicle-photos").getPublicUrl(path).data.publicUrl);
            } catch (e) { admErr(e); }
          } else ADM.photos.push(URL.createObjectURL(f));
        }
        photosRedraw(); toast(files.length + (files.length === 1 ? " foto añadida" : " fotos añadidas") + " · recuerda guardar", "upload");
      };
    };
    bindPhotos();
    $("#ePhotoUrlF").onsubmit = e => { e.preventDefault(); const u = $("#ePhotoUrl").value.trim(); if (!/^https?:\/\/\S+$/i.test(u)) return toast("Pega una URL que empiece por https://", "alert"); ADM.photos.push(u); photosRedraw(); };
    const collect = () => {
      const p = {};
      $$("[data-k]", body).forEach(i => { const k = i.dataset.k; if (!k) return; p[k] = i.type === "checkbox" ? i.checked : i.value.trim(); });
      p.photos = ADM.photos.slice();
      const meta = {}; const mv = $("#eMv"), sc = $("#eScore");
      if (mv && mv.value !== "") meta.market_value = +mv.value; if (sc && sc.value !== "") meta.score = Math.max(0, Math.min(100, +sc.value));
      if (Object.keys(meta).length) p.meta = meta;
      const sel = $("#eSeller"); if (sel && sel.value) p.seller_id = sel.value;
      return p;
    };
    $("#eSave").onclick = async () => {
      const p = collect();
      if (!p.make || !p.model || !p.year || p.km === "") return toast("Marca, modelo, año y kilómetros son obligatorios", "alert");
      const btn = $("#eSave"); btn.disabled = true;
      try {
        let id = v.id;
        if (live()) id = await admRpc("admin_vehicle_save", { p_id: v.id, p });
        else { const o = admOff(); let x = o.vs.find(q2 => q2.id === v.id); if (!x) { x = { id: "v-n" + Date.now(), ref: "MS-" + (3000 + o.vs.length), created_at: new Date().toISOString(), meta: {}, seller: { name: "MotorSubasta", email: "admin@motorsubasta.com" }, status: "aprobado", views: 0 }; o.vs.unshift(x); }
          Object.assign(x, p, { meta: Object.assign({}, x.meta, p.meta || {}) }); delete x.seller_id; id = x.id; o.log.unshift({ at: new Date().toISOString(), admin_name: S.user.name, action: d.isNew ? "crear" : "editar", entity: "vehicle", entity_id: id, label: admTitle(x), detail: {} }); }
        admDrop("veh", "ov", "auc", "mk", "v:*");
        admOk(d.isNew ? "Vehículo creado" : "Cambios guardados");
        if (d.isNew) location.hash = "#/admin/vehiculo/" + id; else admMount("vehiculo", q, m);
      } catch (e) { admErr(e); btn.disabled = false; }
    };
    $$("[data-ch]", body).forEach(b => b.onclick = () => admChannelModal(v, b.dataset.ch, () => admMount("vehiculo", q, m)));
    $$("[data-aa]", body).forEach(b => b.onclick = () => admAuctionAct(b.dataset.id, b.dataset.aa, Object.assign({}, v.auction, { vehicle: v }), () => admMount("vehiculo", q, m)));
    $$("[data-ls]", body).forEach(b => b.onclick = () => admListingAct(v.listing, b.dataset.ls, () => admMount("vehiculo", q, m)));
    const nf = $("#eNoteF"); if (nf) nf.onsubmit = async e => { e.preventDefault(); const t = $("#eNote").value.trim(); if (!t) return;
      try { if (live()) await admRpc("admin_note_add", { p_entity: "vehicle", p_id: v.id, p_body: t }); else { const o = admOff(); (o.notes[v.id] = o.notes[v.id] || []).unshift({ body: t, admin_name: S.user.name, created_at: new Date().toISOString() }); } admDrop("v:*"); admMount("vehiculo", q, m); } catch (er) { admErr(er); } };
    const del = $("#eDel"); if (del) del.onclick = () => modal("Eliminar vehículo", `<p style="margin:0">Vas a eliminar <b>${esc(admTitle(v))}</b> (${esc(v.ref || "")}) con todas sus subastas, pujas y anuncios. Escribe <b class="mono">${esc(v.ref || "ELIMINAR")}</b> para confirmar.</p><input class="in mono" id="dConf" autocomplete="off"><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn bad" id="cYes" disabled>Eliminar definitivamente</button></div>`, close => {
      const want = v.ref || "ELIMINAR"; $("#dConf").oninput = e => $("#cYes").disabled = e.target.value.trim() !== want; $("#cNo").onclick = close;
      $("#cYes").onclick = async () => { try { if (live()) await admRpc("admin_vehicle_delete", { p_id: v.id }); else { const o = admOff(); o.vs = o.vs.filter(x => x.id !== v.id); } admDrop("veh", "ov", "auc", "mk"); close(); admOk("Vehículo eliminado", "x"); location.hash = "#/admin/vehiculos"; } catch (e) { admErr(e); } };
    });
    addEventListener("beforeunload", e => { if (bar.classList.contains("on") && document.body.contains(bar)) { e.preventDefault(); e.returnValue = ""; } }, { once: true });
  },
};

/* ---------- acciones compartidas ---------- */
function admNextSession(cat) {
  const H = { limpio: 11, danado: 13, siniestro: 15, oculta: 11 }[cat] || 11;
  const d = new Date(); const s = new Date(d.toLocaleString("en-US", { timeZone: "Europe/Madrid" })); s.setHours(H, 0, 0, 0);
  if (new Date(d.toLocaleString("en-US", { timeZone: "Europe/Madrid" })) >= s) s.setDate(s.getDate() + 1);
  return s.toISOString().slice(0, 10);
}
function admChannelModal(v, ch, done) {
  const title = { mercado: "Publicar en el Mercado", subasta: "Enviar a subasta", vendido: "Marcar como vendido", retirar: "Retirar de la venta", rechazar: "Rechazar vehículo" }[ch];
  const mv = (v.meta && v.meta.market_value) || (v.listing && v.listing.price) || "";
  const warnBids = ch === "mercado" && v.auction && (v.auction.bids || (v.bids || []).length) && ["viva", "cerrada"].includes(v.auction.status);
  const body = ch === "mercado" ? `<div class="fgrid"><div class="field"><label for="cmP">Precio de venta</label><div class="money"><span>€</span><input class="in" id="cmP" type="number" min="0" value="${esc(mv)}"></div></div><div class="field"><label>&nbsp;</label>${admTog("cmN", "Precio negociable", !v.listing || v.listing.negotiable !== false)}</div></div>${v.status === "subasta" ? `<p class="muted" style="margin:0">La subasta actual se cancelará: un vehículo solo puede estar en un sitio.</p>` : ""}${warnBids ? `<p class="bad" style="margin:0">${ic("alert", "sm")} La subasta tiene pujas. Al moverlo se perderá la subasta.</p>` : ""}`
    : ch === "subasta" ? `<div class="fgrid"><div class="field"><label for="cmS">Precio de salida</label><div class="money"><span>€</span><input class="in" id="cmS" type="number" min="0" value="${esc(Math.round((+mv || 1000) * .25 / 25) * 25)}"></div></div>
        <div class="field"><label for="cmR">Precio de reserva <small class="muted">opcional</small></label><div class="money"><span>€</span><input class="in" id="cmR" type="number" min="0" placeholder="sin reserva"></div></div>
        <div class="field"><label for="cmB">Compra ya <small class="muted">opcional</small></label><div class="money"><span>€</span><input class="in" id="cmB" type="number" min="0" value="${esc(mv)}"></div></div>
        <div class="field"><label for="cmC">Sesión</label><select class="in" id="cmC">${Object.entries(CATS).map(([k, c]) => `<option value="${k}" ${v.category === k ? "selected" : ""}>${c.name} · ${c.session}</option>`).join("")}</select></div>
        <div class="field"><label for="cmD">Día de la sesión</label><input class="in" id="cmD" type="date" value="${admNextSession(v.category)}"></div>
        <div class="field"><label>&nbsp;</label>${admTog("cmF", "Destacar en portada", false)}</div></div>${v.status === "mercado" ? `<p class="muted" style="margin:0">El anuncio del Mercado se pausará automáticamente.</p>` : ""}`
    : ch === "vendido" ? `<div class="fgrid"><div class="field"><label for="cmP">Precio final</label><div class="money"><span>€</span><input class="in" id="cmP" type="number" min="0" value="${esc((v.auction && v.auction.top_bid) || (v.listing && v.listing.price) || mv)}"></div></div>
        <div class="field"><label for="cmV">Vía</label><select class="in" id="cmV"><option value="directa">Venta directa</option><option value="mercado" ${v.status === "mercado" ? "selected" : ""}>Mercado</option><option value="subasta" ${v.status === "subasta" ? "selected" : ""}>Subasta</option><option value="compra24h">Compra MotorSubasta 24 h</option></select></div>
        <div class="field"><label for="cmBu">Comprador</label><input class="in" id="cmBu" placeholder="Nombre o empresa"></div><div class="field"><label for="cmDt">Fecha</label><input class="in" id="cmDt" type="date" value="${new Date().toISOString().slice(0, 10)}"></div></div>
        <div class="field"><label for="cmNo">Notas</label><textarea class="in" id="cmNo" rows="2" placeholder="Forma de pago, transporte, documentación…"></textarea></div>`
    : `<p style="margin:0">${ch === "retirar" ? "El vehículo dejará de verse en la web, pero se conserva con todos sus datos. Puedes volver a publicarlo cuando quieras." : "El vehículo se marcará como rechazado y dejará de verse en la web."}</p>`;
  modal(title, body + `<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn ${ch === "rechazar" ? "bad" : "primary"}" id="cYes">${title}</button></div>`, close => {
    $("#cNo").onclick = close;
    $("#cYes").onclick = async () => {
      const g = id => { const e = $("#" + id); return e ? (e.type === "checkbox" ? e.checked : e.value) : undefined; };
      const p = ch === "mercado" ? { price: g("cmP"), negotiable: g("cmN"), force: true } : ch === "subasta" ? { start_price: g("cmS"), reserve_price: g("cmR"), buy_now_price: g("cmB"), session: g("cmC"), day: g("cmD"), featured: g("cmF") }
        : ch === "vendido" ? { price: g("cmP"), via: g("cmV"), buyer: g("cmBu"), date: g("cmDt"), notes: g("cmNo") } : {};
      if (ch === "mercado" && !(+p.price > 0)) return toast("Indica un precio", "alert");
      if (ch === "subasta" && !(+p.start_price > 0)) return toast("Indica el precio de salida", "alert");
      $("#cYes").disabled = true;
      try {
        if (live()) await admRpc("admin_vehicle_channel", { p_id: v.id, p_channel: ch, p });
        else {
          const x = admOff().vs.find(q => q.id === v.id);
          if (ch === "mercado") { x.status = "mercado"; x.listing = Object.assign(x.listing || { id: "L-" + Date.now(), created_at: new Date().toISOString(), offers: 0, offers_new: 0 }, { price: +p.price, negotiable: !!p.negotiable, status: "activo" }); if (x.auction) x.auction.status = "cancelada"; }
          else if (ch === "subasta") { const H = { limpio: 11, danado: 13, siniestro: 15, oculta: 11 }[p.session] || 11, s = new Date(p.day + "T" + String(H).padStart(2, "0") + ":00:00"); x.status = "subasta"; if (x.listing) x.listing.status = "pausado"; x.auction = { id: "A-" + Date.now(), status: "programada", session: p.session, starts_at: s.toISOString(), ends_at: new Date(+s + 2 * HOUR).toISOString(), start_price: +p.start_price, reserve_price: +p.reserve_price || null, buy_now_price: +p.buy_now_price || null, bids: 0, bidders: 0, watchers: 0, featured: !!p.featured }; }
          else if (ch === "vendido") { x.status = "vendido"; x.meta = Object.assign({}, x.meta, { sold: { price: +p.price, buyer: p.buyer, channel: p.via, date: p.date, notes: p.notes } }); }
          else if (ch === "retirar") { x.status = "aprobado"; if (x.listing) x.listing.status = "pausado"; if (x.auction) x.auction.status = "cancelada"; }
          else if (ch === "rechazar") { x.status = "rechazado"; if (x.listing) x.listing.status = "pausado"; if (x.auction) x.auction.status = "cancelada"; }
        }
        admDrop("veh", "ov", "auc", "mk", "deals", "v:*"); close(); admOk({ mercado: "Publicado en el Mercado", subasta: "Subasta programada", vendido: "Venta registrada", retirar: "Vehículo retirado", rechazar: "Vehículo rechazado" }[ch]); done && done();
      } catch (e) { admErr(e); $("#cYes").disabled = false; }
    };
  });
}
function admAuctionAct(id, act, a, done) {
  const run = async p => {
    try {
      if (live()) await admRpc("admin_auction_action", { p_id: id, p_action: act, p: p || {} });
      else { const x = admOff().vs.find(q => q.auction && q.auction.id === id); const au = x && x.auction; if (au) {
        if (act === "extend") { au.ends_at = new Date(+new Date(au.ends_at) + 15 * MIN).toISOString(); if (x._lot) x._lot.endsAt += 15 * MIN; }
        else if (act === "close") { au.ends_at = new Date().toISOString(); au.status = "cerrada"; if (x._lot) x._lot.endsAt = now(); }
        else if (act === "cancel") { au.status = "cancelada"; x.status = "aprobado"; }
        else if (act === "relist") { const s = new Date(admNextSession(au.session) + "T11:00:00"); au.starts_at = s.toISOString(); au.ends_at = new Date(+s + 2 * HOUR).toISOString(); au.status = "programada"; au.top_bid = null; au.bids = 0; }
        else if (act === "feature") au.featured = !au.featured;
        else if (act === "edit") Object.assign(au, p);
        else if (act === "accept") { x.status = "vendido"; au.status = "adjudicada"; x.meta = Object.assign({}, x.meta, { sold: { price: au.top_bid, channel: "subasta", date: new Date().toISOString().slice(0, 10) } }); }
        else if (act === "reject") au.decision = "rechazada"; } }
      admDrop("veh", "ov", "auc", "deals", "v:*");
      admOk({ extend: "Cierre ampliado 15 minutos", close: "Subasta cerrada", cancel: "Subasta cancelada", relist: "Subasta reprogramada", feature: "Destacado actualizado", edit: "Subasta actualizada", accept: "Vehículo adjudicado", reject: "Adjudicación rechazada" }[act], act === "cancel" || act === "reject" ? "x" : "gavel");
      done && done();
    } catch (e) { admErr(e); }
  };
  if (act === "edit") {
    const iso = t => t ? new Date(+new Date(t) - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
    return modal("Editar subasta", `<div class="fgrid"><div class="field"><label for="aeS">Salida</label><div class="money"><span>€</span><input class="in" id="aeS" type="number" value="${esc(a.start_price || "")}"></div></div>
      <div class="field"><label for="aeR">Reserva</label><div class="money"><span>€</span><input class="in" id="aeR" type="number" value="${esc(a.reserve_price || "")}" placeholder="sin reserva"></div></div>
      <div class="field"><label for="aeB">Compra ya</label><div class="money"><span>€</span><input class="in" id="aeB" type="number" value="${esc(a.buy_now_price || "")}" placeholder="sin compra ya"></div></div>
      <div class="field"><label for="aeC">Sesión</label><select class="in" id="aeC">${Object.entries(CATS).map(([k, c]) => `<option value="${k}" ${a.session === k ? "selected" : ""}>${c.name}</option>`).join("")}</select></div>
      <div class="field"><label for="aeI">Empieza</label><input class="in" id="aeI" type="datetime-local" value="${iso(a.starts_at)}"></div><div class="field"><label for="aeE">Termina</label><input class="in" id="aeE" type="datetime-local" value="${iso(a.ends_at)}"></div></div>
      <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">Guardar</button></div>`, close => {
      $("#cNo").onclick = close;
      $("#cYes").onclick = () => { const s = $("#aeI").value, e = $("#aeE").value; if (s && e && new Date(e) <= new Date(s)) return toast("El final debe ser posterior al inicio", "alert");
        close(); run({ start_price: $("#aeS").value, reserve_price: $("#aeR").value, buy_now_price: $("#aeB").value, session: $("#aeC").value, starts_at: s ? new Date(s).toISOString() : "", ends_at: e ? new Date(e).toISOString() : "" }); };
    });
  }
  if (act === "accept") return modal("Adjudicar subasta", `<p style="margin:0">Se adjudica <b>${esc(admTitle(a.vehicle))}</b> al mejor postor${a.top ? " (" + esc(a.top.name) + ")" : ""}. Se crea la operación y se avisa a comprador y vendedor.</p><div class="field"><label for="acP">Precio de adjudicación</label><div class="money"><span>€</span><input class="in" id="acP" type="number" value="${esc(a.counter_price || a.top_bid || a.max_bid || "")}"></div></div><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn ok" id="cYes">Adjudicar</button></div>`, close => { $("#cNo").onclick = close; $("#cYes").onclick = () => { close(); run({ price: $("#acP").value }); }; });
  if (["cancel", "close", "relist", "reject"].includes(act)) {
    const txt = { cancel: "La subasta se cancelará y el vehículo quedará sin publicar.", close: "La subasta se cerrará ahora mismo con la puja actual.", relist: "Se programará en la próxima sesión de su categoría. Las pujas actuales se borrarán.", reject: "La puja ganadora no se adjudicará." }[act];
    return modal({ cancel: "Cancelar subasta", close: "Cerrar subasta ya", relist: "Reprogramar subasta", reject: "No adjudicar" }[act], `<p style="margin:0">${txt}</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Volver</button><button class="btn ${act === "relist" || act === "close" ? "primary" : "bad"}" id="cYes">Confirmar</button></div>`, close => { $("#cNo").onclick = close; $("#cYes").onclick = () => { close(); run({}); }; });
  }
  run({ minutes: 15 });
}
function admListingAct(l, act, done) {
  const run = async p => {
    try { if (live()) await admRpc("admin_listing_set", { p_id: l.id, p }); else { const x = admOff().vs.find(q => q.listing && q.listing.id === l.id); if (x) { Object.assign(x.listing, p); if (p.status === "pausado") x.status = "aprobado"; if (p.status === "activo") x.status = "mercado"; if (p.status === "vendido") x.status = "vendido"; } }
      admDrop("veh", "ov", "mk", "v:*"); admOk("Anuncio actualizado", "store"); done && done(); } catch (e) { admErr(e); }
  };
  if (act === "price") return modal("Cambiar precio", `<div class="field"><label for="lpP">Nuevo precio</label><div class="money"><span>€</span><input class="in" id="lpP" type="number" value="${esc(l.price)}"></div></div><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">Guardar</button></div>`, close => { $("#cNo").onclick = close; $("#cYes").onclick = () => { const v = +$("#lpP").value; if (!(v > 0)) return; close(); run({ price: v }); }; });
  if (act === "neg") return run({ negotiable: !l.negotiable });
  run({ status: act });
}
function admOffersTable(id, offers) {
  const ST = { nueva: ["Nueva", "acc"], aceptada: ["Aceptada", "ok"], rechazada: ["Rechazada", "bad"], contraoferta: ["Contraoferta", "info"], caducada: ["Caducada", ""] };
  return admTable(id, [
    ...(offers.some(o => o.vehicle) ? [{ k: "vehicle", l: "Vehículo", sv: o => admTitle(o.vehicle), f: o => o.vehicle ? `<a class="adm-veh" href="#/admin/vehiculo/${o.vehicle.id}"><img src="${admPhoto(o.vehicle.photo)}" alt="" loading="lazy"><div><b>${esc(admTitle(o.vehicle))}</b><small>${esc(o.vehicle.ref || "")}</small></div></a>` : "—" }] : []),
    { k: "amount", l: "Oferta", r: 1, f: o => `<b class="tnum">${eur(o.amount)}</b>${o.price ? `<small class="${o.amount / o.price >= .9 ? "ok" : "muted"}">${Math.round(o.amount / o.price * 100)}% del precio</small>` : ""}${o.counter ? `<small class="info">contra: ${eur(o.counter)}</small>` : ""}` },
    { k: "buyer", l: "Comprador", sv: o => o.buyer && o.buyer.name, f: o => admPerson(o.buyer) },
    ...(offers.some(o => o.seller) ? [{ k: "seller", l: "Vendedor", sv: o => o.seller && o.seller.name, f: o => admPerson(o.seller) }] : []),
    { k: "message", l: "Mensaje", f: o => o.message ? `<span class="adm-msg">${esc(o.message)}</span>` : `<span class="faint">—</span>` },
    { k: "status", l: "Estado", f: o => `<select class="in xs adm-st" data-off="${o.id}">${Object.entries(ST).map(([k, [t]]) => `<option value="${k}" ${o.status === k ? "selected" : ""}>${t}</option>`).join("")}</select>` },
    { k: "created_at", l: "Fecha", f: o => `<span class="muted tnum">${ADM_FMT.dt(o.created_at)}</span>` },
  ], offers, { sort: "created_at", empty: "Sin ofertas todavía", emptyIcon: "msg" });
}
function admBindOffers(root, done) {
  $$("select[data-off]", root).forEach(s => s.onchange = async () => {
    try { if (live()) await admRpc("admin_offer_set", { p_id: +s.dataset.off, p_status: s.value, p_counter: null }); else { const o = admOff().offers.find(x => String(x.id) === s.dataset.off); if (o) o.status = s.value; }
      admDrop("mk", "ov", "deals", "v:*"); admOk("Oferta actualizada", "msg"); done && done(); } catch (e) { admErr(e); }
  });
}

/* ---------- SUBASTAS ---------- */
function admAucState(a) { const t = now(), s = +new Date(a.starts_at), e = +new Date(a.ends_at);
  if (a.status === "cancelada") return "canceladas"; if (a.status === "adjudicada") return "adjudicadas";
  if (a.decision && ["pendiente", "contraoferta", "caducada"].includes(a.decision)) return "decision";
  if (t >= s && t < e) return "vivo"; if (t < s) return "programadas"; return "cerradas"; }
ADM_R.subastas = {
  load: async q => { if (q.f) ADM.f.af = q.f === "decision" ? "decision" : q.f; return { auc: await admGet("auc") }; },
  view: ({ auc }) => {
    const f = ADM.f.af || "activas";
    const by = k => auc.filter(a => k === "todas" || (k === "activas" ? ["vivo", "programadas"].includes(admAucState(a)) : admAucState(a) === k));
    const rows = by(f), live1 = by("vivo"), dec = by("decision"), ended = auc.filter(a => ["cerradas", "adjudicadas", "decision"].includes(admAucState(a)));
    const STL = { vivo: ["En vivo", "ok"], programadas: ["Programada", "acc"], decision: ["Decisión", "warn"], cerradas: ["Cerrada", ""], adjudicadas: ["Adjudicada", "vip"], canceladas: ["Cancelada", "bad"] };
    return `<div class="adm-kpis">
      ${admKpi("gavel", "En vivo ahora", live1.length, `${num(live1.reduce((x, a) => x + (+a.bids || 0), 0))} pujas en curso`, { tone: live1.length ? "live" : "" })}
      ${admKpi("clock", "Programadas", by("programadas").length, "próximas sesiones")}
      ${admKpi("euro", "Volumen pujado (vivo)", live1.reduce((x, a) => x + (+a.top_bid || +a.max_bid || 0), 0), "suma de pujas máximas", { eur: true })}
      ${admKpi("scale", "Pendientes de decisión", dec.length, "el vendedor tiene 24 h", { tone: dec.length ? "warn" : "" })}
      ${admKpi("check", "Tasa de adjudicación", ended.length ? Math.round(by("adjudicadas").length / ended.length * 100) + "%" : "—", `${by("adjudicadas").length} de ${ended.length} terminadas`)}
      ${admKpi("users", "Pujadores únicos", auc.reduce((x, a) => x + (+a.bidders || 0), 0), "suma por subasta")}
    </div>
    <div class="adm-bar">${admSeg("af", [["activas", "Activas", by("activas").length], ["vivo", "En vivo", live1.length], ["programadas", "Programadas", by("programadas").length], ["decision", "Decisión", dec.length], ["cerradas", "Cerradas", by("cerradas").length], ["adjudicadas", "Adjudicadas", by("adjudicadas").length], ["canceladas", "Canceladas", by("canceladas").length], ["todas", "Todas", auc.length]], f)}</div>
    ${admTable("auc", [
      { k: "vehicle", l: "Lote", sv: a => admTitle(a.vehicle), f: a => `<div class="adm-veh"><img src="${admPhoto(a.vehicle.photo)}" alt="" loading="lazy"><div><b>${esc(admTitle(a.vehicle))}</b><small>${esc(a.vehicle.ref || "")} · ${num(a.vehicle.km || 0)} km · ${esc(a.vehicle.city || "")}</small></div></div>` },
      { k: "starts_at", l: "Sesión", sv: a => a.starts_at, f: a => `<span class="chip ${CATS[a.session] ? CATS[a.session].chip : ""}">${CATS[a.session] ? CATS[a.session].short : a.session}</span><small class="muted">${new Date(a.starts_at).toLocaleString("es-ES", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" })}</small>` },
      { k: "ends_at", l: "Tiempo", sv: a => a.ends_at, f: a => { const s = admAucState(a); return s === "vivo" || s === "programadas" ? `<span class="mono tnum ${s === "vivo" ? "ok" : ""}" data-adm-tm="${s === "vivo" ? a.ends_at : a.starts_at}">${fmtLeft(+new Date(s === "vivo" ? a.ends_at : a.starts_at) - now())}</span><small class="muted">${s === "vivo" ? "para cerrar" : "para empezar"}</small>` : `<span class="muted">${ADM_FMT.dt(a.ends_at)}</span>`; } },
      { k: "start_price", l: "Salida · Reserva · Ya", r: 1, f: a => `<span class="tnum">${ADM_FMT.e(a.start_price)}</span><small class="muted">${a.reserve_price ? "res. " + eur(a.reserve_price) : "sin reserva"}${a.buy_now_price ? " · ya " + eur(a.buy_now_price) : ""}</small>` },
      { k: "top_bid", l: "Puja máx.", r: 1, sv: a => +a.top_bid || +a.max_bid || 0, f: a => { const v = a.top_bid || a.max_bid; return v ? `<b class="tnum">${eur(v)}</b>${a.reserve_price ? `<small class="${v >= a.reserve_price ? "ok" : "warn"}">${v >= a.reserve_price ? "reserva superada" : "bajo reserva"}</small>` : ""}` : `<span class="faint">—</span>`; } },
      { k: "bids", l: "Pujas", r: 1, sv: a => +a.bids || 0, f: a => `<span class="tnum">${num(a.bids || 0)}</span><small class="muted">${num(a.bidders || 0)} pujadores · ${num(a.watchers || 0)} siguen</small>` },
      { k: "top", l: "Mejor postor", sv: a => a.top && a.top.name, f: a => admPerson(a.top || a.winner, "Sin pujas") },
      { k: "status", l: "Estado", sv: a => admAucState(a), f: a => { const [t, c] = STL[admAucState(a)]; return `<span class="chip ${c}">${t}${a.decision && admAucState(a) === "decision" ? ": " + a.decision : ""}</span>${a.featured ? ` <span class="chip acc">${ic("spark", "sm")}</span>` : ""}`; } },
      { l: "", f: a => { const s = admAucState(a); return `<div class="actions">${s === "vivo" || s === "programadas" ? `<button class="btn xs" data-aa="extend" data-id="${a.id}" title="Ampliar 15 minutos">+15'</button>` : ""}${s === "vivo" ? `<button class="btn xs" data-aa="close" data-id="${a.id}">Cerrar</button>` : ""}${["cerradas", "canceladas", "decision"].includes(s) ? `<button class="btn xs" data-aa="relist" data-id="${a.id}">Reprogramar</button>` : ""}${s === "decision" || (s === "cerradas" && (a.top_bid || a.max_bid)) ? `<button class="btn xs ok" data-aa="accept" data-id="${a.id}">Adjudicar</button>` : ""}<button class="btn xs" data-bids="${a.id}" title="Ver pujas">${ic("eye", "sm")}</button></div>`; } },
    ], rows, { href: a => "#/admin/vehiculo/" + a.vehicle.id, sort: f === "activas" || f === "programadas" || f === "vivo" ? "starts_at" : "ends_at", dir: f === "activas" || f === "programadas" || f === "vivo" ? 1 : -1, empty: "No hay subastas en este estado", emptyIcon: "gavel" })}`;
  },
  bind: (d, q, m, draw) => {
    admBindSeg($("#admBody"), draw);
    const reload = () => admMount("subastas", {}, m);
    $$("[data-aa]").forEach(b => b.onclick = () => { const a = d.auc.find(x => x.id === b.dataset.id); admAuctionAct(b.dataset.id, b.dataset.aa, a, reload); });
    $$("[data-bids]").forEach(b => b.onclick = async () => {
      const a = d.auc.find(x => x.id === b.dataset.bids);
      let bids = [];
      try { bids = live() ? await admRpc("admin_auction_bids", { p_id: a.id }) : ((admOff().vs.find(x => x.auction && x.auction.id === a.id) || {})._lot || { hist: [] }).hist.map((h, i) => ({ amount: h.amt, at: new Date(h.t).toISOString(), alias: "P" + (i + 1), bidder: { name: h.who === "Tú" ? "Talleres Llorca S.L." : h.who, email: "pujador@demo.es" } })); } catch (e) { return admErr(e); }
      modal("Pujas · " + esc(admTitle(a.vehicle)), bids.length ? `<p class="muted" style="margin:0">Identidades reales: solo las ve el equipo. En la web se muestra el alias.</p><div class="tbl-wrap"><table><thead><tr><th class="r">Importe</th><th>Pujador</th><th>Alias</th><th>Fecha</th></tr></thead><tbody>${bids.map(x => `<tr><td class="r"><b class="tnum">${eur(x.amount)}</b>${x.auto ? ' <span class="chip">auto</span>' : ""}</td><td>${admPerson(x.bidder)}</td><td class="mono">${esc(x.alias || "—")}</td><td class="muted">${ADM_FMT.dt(x.at)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="adm-empty">Todavía no hay pujas.</div>`);
    });
  },
};

/* ---------- MERCADO ---------- */
ADM_R.mercado = {
  load: async q => { if (q.tab) ADM.f.mt = q.tab; return { mk: await admGet("mk") }; },
  view: ({ mk }) => {
    const tab = ADM.f.mt || "anuncios", L = mk.listings, O = mk.offers;
    const act = L.filter(l => l.status === "activo"), stock = act.reduce((a, l) => a + (+l.price || 0), 0);
    const lf = ADM.f.mlf || "activo";
    const rows = L.filter(l => lf === "todos" || l.status === lf);
    return `<div class="adm-kpis">
      ${admKpi("store", "Anuncios activos", act.length, `${L.filter(l => l.status === "pausado").length} en pausa · ${L.filter(l => l.status === "vendido").length} vendidos`)}
      ${admKpi("euro", "Valor del stock", stock, `precio medio ${act.length ? eur(stock / act.length) : "—"}`, { eur: true })}
      ${admKpi("msg", "Ofertas nuevas", O.filter(o => o.status === "nueva").length, `${O.length} en total · ${O.filter(o => o.status === "aceptada").length} aceptadas`, { tone: O.some(o => o.status === "nueva") ? "warn" : "" })}
      ${admKpi("eye", "Vistas de fichas", L.reduce((a, l) => a + (+l.views || 0), 0), "desde que se publicaron")}
      ${admKpi("bolt", "Contactos", L.reduce((a, l) => a + (+l.contacts || 0), 0), "teléfono, WhatsApp, email")}
      ${admKpi("spark", "Conversión a oferta", L.reduce((a, l) => a + (+l.views || 0), 0) ? (Math.round(O.length / L.reduce((a, l) => a + (+l.views || 0), 0) * 1000) / 10) + "%" : "—", "ofertas por cada vista")}
    </div>
    <div class="adm-bar">${admSeg("mt", [["anuncios", "Anuncios", L.length], ["ofertas", "Ofertas y mensajes", O.length]], tab)}
      ${tab === "anuncios" ? admSeg("mlf", [["activo", "Activos", act.length], ["pausado", "En pausa", L.filter(l => l.status === "pausado").length], ["vendido", "Vendidos", L.filter(l => l.status === "vendido").length], ["todos", "Todos", L.length]], lf) : ""}</div>
    ${tab === "anuncios" ? admTable("mkl", [
      { k: "vehicle", l: "Vehículo", sv: l => admTitle(l.vehicle), f: l => `<div class="adm-veh"><img src="${admPhoto(l.vehicle.photo)}" alt="" loading="lazy"><div><b>${esc(admTitle(l.vehicle))}</b><small>${esc(l.vehicle.ref || "")} · ${num(l.vehicle.km || 0)} km · ${esc(l.vehicle.city || "")}</small></div></div>` },
      { k: "price", l: "Precio", r: 1, sv: l => +l.price, f: l => `<div class="adm-inline"><span class="money"><span>€</span><input class="in xs tnum" type="number" value="${esc(l.price)}" data-lp="${l.id}" aria-label="Precio"></span></div><small class="muted">${l.negotiable ? "negociable" : "fijo"}</small>` },
      { k: "status", l: "Estado", f: l => `<select class="in xs" data-lst="${l.id}">${[["activo", "Activo"], ["pausado", "En pausa"], ["vendido", "Vendido"], ["retirado", "Retirado"]].map(([k, t]) => `<option value="${k}" ${l.status === k ? "selected" : ""}>${t}</option>`).join("")}</select>` },
      { k: "views", l: "Vistas", r: 1, sv: l => +l.views || 0, f: l => num(l.views || 0) },
      { k: "contacts", l: "Contactos", r: 1, sv: l => +l.contacts || 0, f: l => num(l.contacts || 0) },
      { k: "offers", l: "Ofertas", r: 1, sv: l => +l.offers || 0, f: l => `${num(l.offers || 0)}${l.offers_new ? ` <i class="adm-b">${l.offers_new}</i>` : ""}${l.best_offer ? `<small class="muted">máx. ${eur(l.best_offer)}</small>` : ""}` },
      { k: "seller", l: "Vendedor", sv: l => l.seller && l.seller.name, f: l => admPerson(l.seller) },
      { k: "created_at", l: "Online", sv: l => l.created_at, f: l => `<span class="muted">${Math.max(0, Math.round((now() - +new Date(l.created_at)) / 86400000))} días</span>` },
    ], rows, { href: l => "#/admin/vehiculo/" + l.vehicle.id, sort: "created_at", empty: "No hay anuncios en este estado", emptyIcon: "store" }) : admOffersTable("mko", O)}`;
  },
  bind: (d, q, m, draw) => {
    admBindSeg($("#admBody"), draw);
    const reload = () => admMount("mercado", {}, m);
    $$("[data-lp]").forEach(i => i.onchange = () => { const l = d.mk.listings.find(x => x.id === i.dataset.lp); const v = +i.value; if (!(v > 0)) return; admListingActDirect(l, { price: v }, reload); });
    $$("[data-lst]").forEach(s => s.onchange = () => { const l = d.mk.listings.find(x => x.id === s.dataset.lst); admListingActDirect(l, { status: s.value }, reload); });
    admBindOffers($("#admBody"), reload);
  },
};
async function admListingActDirect(l, p, done) {
  try { if (live()) await admRpc("admin_listing_set", { p_id: l.id, p }); else { const x = admOff().vs.find(q => q.listing && q.listing.id === l.id); if (x) { Object.assign(x.listing, p); if (p.status) x.status = p.status === "activo" ? "mercado" : p.status === "vendido" ? "vendido" : "aprobado"; } }
    admDrop("veh", "ov", "mk", "v:*"); admOk("Anuncio actualizado", "store"); done && done(); } catch (e) { admErr(e); }
}

/* ---------- publicar: estado y documentación, sin ambigüedades ---------- */
var COND_OPTS = [
  ["limpio", "shield", "Sin daños", "Circula con normalidad. Solo el desgaste propio de su edad y kilómetros.", ["Uso diario", "Reventa"]],
  ["danado", "wrench", "Con daños reparables", "Golpe, avería o daños de carrocería. Se puede reparar y volver a circular.", ["Talleres", "Exportación"]],
  ["siniestro", "alert", "Siniestro o para piezas", "Siniestro total, inundado, quemado o destinado a desguace.", ["Desguaces", "Recambios"]],
];
var DOC_OPTS = [
  ["limpio", "check", "En regla", "De alta en la DGT y se transfiere con normalidad."],
  ["salvamento", "doc", "Siniestro declarado o baja temporal", "Necesita peritaje, reparación o ITV antes de volver a circular."],
  ["piezas", "recycle", "Baja definitiva · solo piezas", "No puede volver a circular. Se vende para recambios o desguace."],
];
function docLabel(k) { const o = DOC_OPTS.find(x => x[0] === k); return o ? o[2] : k; }
function pubCondBlock() {
  const sub = typeof PUB !== "undefined" && PUB.type !== "mercado";
  return `<div class="panel pubcond" style="display:grid;gap:18px">
    <div><div class="pc-h"><span class="pc-n">1</span><div><h3>¿En qué estado está el vehículo?</h3><p class="muted">Define dónde aparece: ${sub ? "la sesión de subasta en la que entra" : "el filtro del Mercado en el que lo buscan"}.</p></div></div>
      <div class="opt-cards pc-cards">${COND_OPTS.map(([k, i, t, d, tags]) => `<button type="button" class="opt ${PUB.cat === k ? "on" : ""}" data-pcat="${k}" aria-pressed="${PUB.cat === k}"><span class="pc-ic ${CATS[k].chip}">${ic(i)}</span><b>${t}</b><small>${d}</small><span class="pc-tags">${tags.map(x => `<i>${x}</i>`).join("")}${sub ? `<i class="ses">${ic("clock", "sm")}${CATS[k].session}</i>` : ""}</span><span class="pc-ck">${ic("check", "sm")}</span></button>`).join("")}</div></div>
    <div><div class="pc-h"><span class="pc-n">2</span><div><h3>Documentación en la DGT</h3><p class="muted">Lo primero que mira un comprador profesional. Te proponemos la opción más habitual según el estado.</p></div></div>
      <div class="pc-docs" id="ptitle" role="radiogroup" aria-label="Documentación">${DOC_OPTS.map(([k, i, t, d]) => `<button type="button" role="radio" data-v="${k}" aria-checked="${PUB.title === k}" class="${PUB.title === k ? "on" : ""}"><span class="pc-rd"></span><span class="pc-di">${ic(i, "sm")}</span><span><b>${t}</b><small>${d}</small></span><em class="pc-sug" hidden>Sugerido</em></button>`).join("")}</div>
      <p class="pc-warn" id="pcWarn" hidden>${ic("alert", "sm")}<span></span></p></div>
  </div>`;
}
function pubCondSync() {
  const box = document.querySelector(".pubcond"); if (!box || typeof PUB === "undefined") return;
  const sug = { limpio: "limpio", danado: PUB.title === "piezas" ? "salvamento" : "limpio", siniestro: "salvamento" }[PUB.cat] || "limpio";
  $$("#ptitle button", box).forEach(b => { b.setAttribute("aria-checked", PUB.title === b.dataset.v); b.querySelector(".pc-sug").hidden = b.dataset.v !== sug || PUB.title === sug; });
  $$("[data-pcat]", box).forEach(b => b.setAttribute("aria-pressed", PUB.cat === b.dataset.pcat));
  const w = $("#pcWarn"), msg = PUB.cat === "limpio" && PUB.title === "piezas" ? "Un vehículo sin daños no suele estar de baja definitiva. Revisa la documentación."
    : PUB.cat === "limpio" && PUB.title === "salvamento" ? "Si tiene un siniestro declarado, quizá encaje mejor en «Con daños reparables»." : "";
  if (w) { w.hidden = !msg; w.querySelector("span").textContent = msg; }
}
document.addEventListener("click", e => {
  const c = e.target.closest && e.target.closest(".pubcond [data-pcat]"), t = e.target.closest && e.target.closest(".pubcond #ptitle button");
  if (t) PUB.titleSet = true;
  if (c && !PUB.titleSet) { setTimeout(() => { const sug = { limpio: "limpio", danado: "limpio", siniestro: c.dataset.pcat === "siniestro" ? "salvamento" : "limpio" }[c.dataset.pcat]; PUB.title = sug; $$(".pubcond #ptitle button").forEach(x => x.classList.toggle("on", x.dataset.v === sug)); pubCondSync(); }, 0); }
  if (c || t) setTimeout(pubCondSync, 0);
});

/* ---------- OPERACIONES ---------- */
var ADM_OST = { pendiente_pago: ["Pendiente de pago", "warn"], pagado: ["Pagado", "info"], documentacion: ["Documentación", "acc"], entregado: ["Entregado", "ok"], incumplido: ["Incumplido", "bad"], vendido: ["Venta registrada", "vip"], aceptada: ["Oferta aceptada", "ok"] };
ADM_R.operaciones = {
  load: async q => { if (q.f) ADM.f.of = q.f; const [deals, veh] = await Promise.all([admGet("deals"), admGet("veh")]); return { deals, veh }; },
  view: ({ deals }) => {
    const f = ADM.f.of || "todas";
    const fin = d => ["entregado", "vendido"].includes(d.status);
    const pend = d => d.status === "pendiente_pago" || String(d.status).startsWith("decision:") || d.kind === "offer";
    const rows = deals.filter(d => f === "todas" || (f === "subasta" ? d.via === "subasta" : f === "mercado" ? d.via === "mercado" : f === "pendientes" ? pend(d) : f === "cerradas" ? fin(d) : f === "registradas" ? d.kind === "sold" : true));
    const real = deals.filter(d => d.kind === "order" || d.kind === "sold");
    const gmv = real.reduce((a, d) => a + (+d.amount || 0), 0), fees = deals.reduce((a, d) => a + (+d.fee || 0), 0);
    return `<div class="adm-kpis">
      ${admKpi("truck", "Operaciones", real.length, `${deals.filter(d => d.kind === "order").length} con pago en plataforma`)}
      ${admKpi("euro", "Volumen vendido", gmv, "precio de los vehículos", { eur: true })}
      ${admKpi("spark", "Comisiones", fees, "prima del comprador", { eur: true })}
      ${admKpi("clock", "Pendientes", deals.filter(pend).length, "pago, decisión u oferta aceptada", { tone: deals.some(pend) ? "warn" : "" })}
      ${admKpi("doc", "En documentación", deals.filter(d => d.status === "documentacion").length, "transferencia en curso")}
      ${admKpi("check", "Completadas", deals.filter(fin).length, "entregadas o registradas")}
    </div>
    <div class="adm-bar">${admSeg("of", [["todas", "Todas", deals.length], ["pendientes", "Pendientes", deals.filter(pend).length], ["subasta", "Subasta", deals.filter(d => d.via === "subasta").length], ["mercado", "Mercado", deals.filter(d => d.via === "mercado").length], ["cerradas", "Completadas", deals.filter(fin).length], ["registradas", "Ventas registradas", deals.filter(d => d.kind === "sold").length]], f)}</div>
    ${admTable("deals", [
      { k: "at", l: "Fecha", sv: d => d.at, f: d => `<span class="tnum">${ADM_FMT.d(d.at)}</span>` },
      { k: "vehicle", l: "Vehículo", sv: d => admTitle(d.vehicle), f: d => d.vehicle ? `<a class="adm-veh" href="#/admin/vehiculo/${d.vehicle.id}"><img src="${admPhoto(d.vehicle.photo)}" alt="" loading="lazy"><div><b>${esc(admTitle(d.vehicle))}</b><small>${esc(d.vehicle.ref || "")} · ${esc(d.vehicle.city || "")}</small></div></a>` : "—" },
      { k: "via", l: "Vía", f: d => `<span class="chip ${d.via === "subasta" ? "acc" : d.via === "mercado" ? "info" : ""}">${ic(d.via === "subasta" ? "gavel" : d.via === "mercado" ? "store" : "truck", "sm")}${{ subasta: "Subasta", mercado: "Mercado", directa: "Venta directa", compra24h: "Compra 24 h" }[d.via] || d.via}</span>` },
      { k: "buyer", l: "Comprador", sv: d => (d.buyer && d.buyer.name) || d.buyer_name, f: d => d.buyer ? admPerson(d.buyer) : `<b>${esc(d.buyer_name || "—")}</b>` },
      { k: "seller", l: "Vendedor", sv: d => d.seller && d.seller.name, f: d => admPerson(d.seller) },
      { k: "amount", l: "Importe", r: 1, sv: d => +d.amount || 0, f: d => `<b class="tnum">${ADM_FMT.e(d.amount)}</b>${+d.fee ? `<small class="muted">+ ${eur(d.fee)} comisión</small>` : ""}` },
      { k: "status", l: "Estado", sv: d => d.status, f: d => d.kind === "order" ? `<select class="in xs" data-ord="${d.id}">${Object.entries(ADM_OST).filter(([k]) => !["vendido", "aceptada"].includes(k)).map(([k, [t]]) => `<option value="${k}" ${d.status === k ? "selected" : ""}>${t}</option>`).join("")}</select>${d.pickup ? `<small class="ok">${ic("pin", "sm")}recogida lista</small>` : ""}`
        : String(d.status).startsWith("decision:") ? `<span class="chip warn">Decisión: ${esc(d.status.slice(9))}</span>` : `<span class="chip ${(ADM_OST[d.status] || ["", ""])[1]}">${(ADM_OST[d.status] || [d.status])[0]}</span>${d.notes ? `<small class="muted">${esc(d.notes)}</small>` : ""}` },
    ], rows, { sort: "at", empty: "Todavía no hay operaciones", emptySub: "Las ventas de subasta, las ofertas aceptadas del Mercado y las ventas que registres aparecerán aquí.", emptyIcon: "truck" })}`;
  },
  bind: (d, q, m, draw) => {
    admBindSeg($("#admBody"), draw);
    $$("[data-ord]").forEach(s => s.onchange = async () => {
      try { if (live()) await admRpc("admin_order_set", { p_id: s.dataset.ord, p: { status: s.value } }); else { const x = admOff().deals.find(y => y.id === s.dataset.ord); if (x) x.status = s.value; }
        admDrop("deals", "ov"); admOk("Operación actualizada", "truck"); admMount("operaciones", {}, m); } catch (e) { admErr(e); }
    });
    const nb = $("#admNewSale"); if (nb) nb.onclick = () => {
      const cands = d.veh.filter(v => !["vendido", "rechazado"].includes(v.status));
      modal("Registrar una venta", `<div class="field"><label for="nsV">Vehículo</label><select class="in" id="nsV">${cands.map(v => `<option value="${v.id}">${esc(admTitle(v) + " · " + (v.ref || "") + " · " + admVehStatus(v)[0])}</option>`).join("")}</select></div><p class="muted" style="margin:0">En el siguiente paso indicas precio, comprador y vía.</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">Continuar</button></div>`, close => {
        $("#cNo").onclick = close; $("#cYes").onclick = () => { const v = cands.find(x => x.id === $("#nsV").value); close(); setTimeout(() => admChannelModal(v, "vendido", () => admMount("operaciones", {}, m)), 30); };
      });
    };
  },
};

/* ---------- USUARIOS ---------- */
var ADM_VER = { pendiente: ["Sin verificar", ""], enviado: ["Por revisar", "warn"], revision: ["En revisión", "warn"], verificado: ["Verificado", "ok"], rechazado: ["Rechazado", "bad"] };
var ADM_ROLE = { buyer: "Comprador", seller: "Comprador y vendedor", dealer: "Dealer", admin: "Administrador" };
ADM_R.usuarios = {
  load: async q => { if (q.q != null) ADM.f.uq = q.q; if (q.f) ADM.f.uf = q.f; return { users: await admGet("users") }; },
  view: ({ users }) => {
    const f = ADM.f.uf || "todos", qq = (ADM.f.uq || "").toLowerCase().trim();
    const flt = { todos: () => true, revisar: u => ["enviado", "revision"].includes(u.verification), verificados: u => u.verification === "verificado", sinverificar: u => ["pendiente", "rechazado"].includes(u.verification), bloqueados: u => u.blocked, vendedores: u => ["seller", "dealer"].includes(u.role), empresas: u => !!u.company, admins: u => u.role === "admin" };
    const rows = users.filter(flt[f] || flt.todos).filter(u => !qq || [u.email, u.full_name, u.company, u.phone, u.city, u.cif].join(" ").toLowerCase().includes(qq));
    const n = k => users.filter(flt[k]).length;
    return `<div class="adm-kpis">
      ${admKpi("users", "Usuarios", users.length, `+${users.filter(u => now() - +new Date(u.created_at) < 7 * 86400000).length} en 7 días`)}
      ${admKpi("store", "Venden", n("vendedores"), `${n("empresas")} empresas o autónomos`)}
      ${admKpi("shield", "Verificados", n("verificados"), `${users.length ? Math.round(n("verificados") / users.length * 100) : 0}% del total`)}
      ${admKpi("clock", "Por revisar", n("revisar"), "documentación enviada", { tone: n("revisar") ? "warn" : "" })}
      ${admKpi("eye", "Activos 7 días", users.filter(u => u.last_seen && now() - +new Date(u.last_seen) < 7 * 86400000).length, "con sesión iniciada")}
      ${admKpi("lock", "Bloqueados", n("bloqueados"), "sin acceso")}
    </div>
    <div class="adm-bar">${admSeg("uf", [["todos", "Todos", users.length], ["revisar", "Por revisar", n("revisar")], ["verificados", "Verificados", n("verificados")], ["sinverificar", "Sin verificar", n("sinverificar")], ["vendedores", "Venden", n("vendedores")], ["empresas", "Empresas", n("empresas")], ["bloqueados", "Bloqueados", n("bloqueados")], ["admins", "Equipo", n("admins")]], f)}
      <div class="adm-filters"><div class="search">${ic("search")}<input class="in" id="uQ" placeholder="Nombre, email, teléfono, CIF…" value="${esc(ADM.f.uq || "")}"></div></div></div>
    ${admTable("users", [
      { k: "email", l: "Usuario", sv: u => u.company || u.full_name || u.email, f: u => `<div class="adm-user"><span class="avatar">${admInit(u.company || u.full_name || u.email)}</span><div><b>${esc(u.company || u.full_name || "—")}</b><small>${esc(u.email || "")}${u.phone ? " · " + esc(u.phone) : ""}</small></div></div>` },
      { k: "role", l: "Cuenta", f: u => `<span class="chip ${u.role === "admin" ? "vip" : u.role === "buyer" ? "" : "info"}">${ADM_ROLE[u.role] || u.role}</span><small class="muted">${u.company ? "Empresa / autónomo" : "Particular"} · ${esc(u.plan || "Gratis")}</small>` },
      { k: "verification", l: "Verificación", f: u => `<span class="chip ${(ADM_VER[u.verification] || ["", ""])[1]}">${(ADM_VER[u.verification] || [u.verification])[0]}</span>${u.blocked ? ` <span class="chip bad">${ic("lock", "sm")}Bloqueado</span>` : ""}` },
      { k: "vehicles", l: "Actividad", r: 1, sv: u => (+u.vehicles || 0) + (+u.bids || 0) + (+u.offers || 0), f: u => `<span class="adm-act" title="Vehículos">${ic("car", "sm")}${num(u.vehicles || 0)}</span><span class="adm-act" title="Pujas">${ic("gavel", "sm")}${num(u.bids || 0)}</span><span class="adm-act" title="Ofertas">${ic("msg", "sm")}${num(u.offers || 0)}</span><span class="adm-act" title="Operaciones">${ic("truck", "sm")}${num((+u.buys || 0) + (+u.sales || 0))}</span>` },
      { k: "last_seen", l: "Última visita", sv: u => u.last_seen || "", f: u => u.last_seen ? `<span class="muted">${ago(+new Date(u.last_seen))}</span>` : `<span class="faint">—</span>` },
      { k: "created_at", l: "Alta", f: u => `<span class="muted tnum">${ADM_FMT.d(u.created_at)}</span>` },
      { l: "", f: u => `<div class="actions">${u.verification !== "verificado" ? `<button class="btn xs ok" data-uv="${u.id}">${ic("check", "sm")}Verificar</button>` : ""}${u.role !== "admin" ? `<button class="btn xs ${u.blocked ? "" : "bad ghost"}" data-ub="${u.id}">${u.blocked ? "Desbloquear" : "Bloquear"}</button>` : ""}</div>` },
    ], rows, { href: u => "#/admin/usuario/" + u.id, sort: "created_at", empty: "No hay usuarios con este filtro", emptyIcon: "users" })}`;
  },
  bind: (d, q, m, draw) => {
    admBindSeg($("#admBody"), draw);
    let t; $("#uQ").oninput = e => { clearTimeout(t); t = setTimeout(() => { ADM.f.uq = e.target.value; const p = e.target.selectionStart; draw(); const i = $("#uQ"); i.focus(); i.setSelectionRange(p, p); }, 180); };
    const set = async (id, p, msg) => { try { if (live()) await admRpc("admin_user_set", { p_id: id, p }); else Object.assign(admOff().users.find(u => u.id === id), p); admDrop("users", "ov", "u:*"); admOk(msg, "users"); admMount("usuarios", {}, m); } catch (e) { admErr(e); } };
    $$("[data-uv]").forEach(b => b.onclick = () => set(b.dataset.uv, { verification: "verificado" }, "Usuario verificado"));
    $$("[data-ub]").forEach(b => b.onclick = () => { const u = d.users.find(x => x.id === b.dataset.ub); set(u.id, { blocked: !u.blocked }, u.blocked ? "Usuario desbloqueado" : "Usuario bloqueado"); });
    const cs = $("#admCsvUsers"); if (cs) cs.onclick = () => admCsv("usuarios", d.users.map(u => ({ email: u.email, nombre: u.full_name, empresa: u.company, telefono: u.phone, ciudad: u.city, rol: u.role, plan: u.plan, verificacion: u.verification, bloqueado: u.blocked, vehiculos: u.vehicles, pujas: u.bids, ofertas: u.offers, alta: u.created_at, ultima_visita: u.last_seen })));
  },
};
ADM_R.usuario = {
  load: async (q, m) => { const u = await admGet("u:" + m[1], true); if (!u) throw new Error("Este usuario no existe."); return { u }; },
  view: ({ u }) => {
    const tab = ADM.f.utab || "vehiculos";
    const T = { vehiculos: ["Vehículos", u.vehicles || []], pujas: ["Pujas", u.bids || []], ofertas: ["Ofertas", u.offers || []], ops: ["Operaciones", u.orders || []], act: ["Actividad", u.activity || []] };
    const list = T[tab][1];
    return `<div class="adm-ed">
    <div class="adm-ed-main">
      <div class="panel adm-uhead"><span class="avatar xl">${admInit(u.company || u.full_name || u.email)}</span><div><h2>${esc(u.company || u.full_name || u.email)}</h2><p class="muted">${esc(u.email || "")}${u.phone ? " · " + esc(u.phone) : ""}${u.city ? " · " + esc(u.city) : ""}</p>
        <div class="adm-chips"><span class="chip ${(ADM_VER[u.verification] || ["", ""])[1]}">${(ADM_VER[u.verification] || [u.verification])[0]}</span><span class="chip">${ADM_ROLE[u.role] || u.role}</span><span class="chip acc">${esc(u.plan || "Gratis")}</span>${u.blocked ? `<span class="chip bad">Bloqueado</span>` : ""}<span class="chip">Alta ${ADM_FMT.d(u.created_at)}</span></div></div></div>
      <div class="adm-bar">${admSeg("utab", Object.entries(T).map(([k, [t, l]]) => [k, t, l.length]), tab)}</div>
      ${tab === "vehiculos" ? admTable("uveh", [{ k: "make", l: "Vehículo", sv: v => admTitle(v), f: v => `<div class="adm-veh"><img src="${admPhoto(v.photo)}" alt="" loading="lazy"><div><b>${esc(admTitle(v))}</b><small>${esc(v.ref || "")}</small></div></div>` }, { k: "status", l: "Estado", f: v => `<span class="chip">${esc(v.status)}</span>` }, { k: "created_at", l: "Alta", f: v => ADM_FMT.d(v.created_at) }], list, { href: v => "#/admin/vehiculo/" + v.id, sort: "created_at", empty: "No ha publicado vehículos", emptyIcon: "car" })
      : tab === "pujas" ? admTable("ubids", [{ k: "vehicle", l: "Vehículo", f: b => b.vehicle_id ? `<a href="#/admin/vehiculo/${b.vehicle_id}">${esc(b.vehicle)}</a>` : esc(b.vehicle || "—") }, { k: "amount", l: "Importe", r: 1, f: b => `<b class="tnum">${eur(b.amount)}</b>` }, { k: "at", l: "Fecha", f: b => ADM_FMT.dt(b.at) }], list, { sort: "at", empty: "No ha pujado todavía", emptyIcon: "gavel" })
      : tab === "ofertas" ? admTable("uoff", [{ k: "vehicle", l: "Vehículo", f: o => o.vehicle_id ? `<a href="#/admin/vehiculo/${o.vehicle_id}">${esc(o.vehicle)}</a>` : esc(o.vehicle || "—") }, { k: "amount", l: "Oferta", r: 1, f: o => `<b class="tnum">${eur(o.amount)}</b>` }, { k: "status", l: "Estado", f: o => `<span class="chip">${esc(o.status)}</span>` }, { k: "at", l: "Fecha", f: o => ADM_FMT.dt(o.at) }], list, { sort: "at", empty: "No ha hecho ofertas", emptyIcon: "msg" })
      : tab === "ops" ? admTable("uops", [{ k: "side", l: "Tipo", f: o => `<span class="chip ${o.side === "compra" ? "info" : "ok"}">${o.side}</span>` }, { k: "amount", l: "Importe", r: 1, f: o => `<b class="tnum">${eur(o.amount)}</b>` }, { k: "status", l: "Estado", f: o => `<span class="chip ${(ADM_OST[o.status] || ["", ""])[1]}">${(ADM_OST[o.status] || [o.status])[0]}</span>` }, { k: "at", l: "Fecha", f: o => ADM_FMT.d(o.at) }], list, { sort: "at", empty: "Sin operaciones", emptyIcon: "truck" })
      : `<ul class="adm-stream">${list.map(e => `<li><time>${ADM_FMT.dt(e.at)}</time><span class="chip ${e.kind === "view" ? "" : "acc"}">${e.kind}</span><span class="mono">${esc(e.path || "")}</span><small>${esc(e.device || "")}</small></li>`).join("") || "<li class='faint'>Sin actividad registrada</li>"}</ul>`}
    </div>
    <aside class="adm-ed-side">
      <div class="panel adm-p"><div class="adm-ph"><h3>Cuenta</h3></div>
        ${admF("uRole", "Tipo de cuenta", u.role, { sel: Object.entries(ADM_ROLE), blank: false })}
        ${admF("uPlan", "Plan", u.plan, { sel: ["Comprador Gratis", "Comprador Pro", "Comprador Dealer", "Vendedor Gratis", "Vendedor Pro", "Combinado Pro", "Combinado Full", "Interno"], blank: false })}
        ${admF("uVer", "Verificación", u.verification, { sel: Object.entries(ADM_VER).map(([k, [t]]) => [k, t]), blank: false })}
        ${admTog("uBlk", "Cuenta bloqueada", u.blocked)}
        <div class="fgrid">${admF("uName", "Nombre", u.full_name)}${admF("uCo", "Empresa", u.company)}${admF("uPh", "Teléfono", u.phone)}${admF("uCity", "Ciudad", u.city)}${admF("uCif", "CIF / NIF", u.cif)}</div>
        <button class="btn primary block" id="uSave">${ic("check", "sm")}Guardar cambios</button>
        ${u.email ? `<a class="btn block" href="mailto:${esc(u.email)}">${ic("msg", "sm")}Escribir por email</a>` : ""}
        ${u.phone ? `<a class="btn block" href="https://wa.me/${esc(String(u.phone).replace(/\D/g, ""))}" target="_blank" rel="noopener">${ic("msg", "sm")}WhatsApp</a>` : ""}
      </div>
      <div class="panel adm-p"><div class="adm-ph"><h3>Notas internas</h3></div>
        <form id="uNoteF" class="adm-note-f"><textarea class="in" id="uNote" rows="2" placeholder="Solo las ve el equipo…"></textarea><button class="btn sm">${ic("plus", "sm")}Añadir nota</button></form>
        <ul class="adm-notes">${(u.notes || []).map(n => `<li><p>${esc(n.body)}</p><small>${esc(n.admin_name || "")} · ${ADM_FMT.dt(n.created_at)}</small></li>`).join("") || "<li class='faint'>Sin notas</li>"}</ul></div>
      <div class="panel adm-p"><div class="adm-ph"><h3>Historial</h3></div><ul class="adm-feed">${(u.log || []).map(g => `<li><span class="dot"></span><div><b>${esc(admActionLabel(g.action))}</b><small>${esc(Object.entries(g.detail || {}).map(([k, x]) => k + ": " + (x && typeof x === "object" ? (x.de ?? "—") + " → " + (x.a ?? "—") : x)).join(" · "))}</small><small>${esc(g.admin_name || "")} · ${ADM_FMT.dt(g.at)}</small></div></li>`).join("") || "<li class='faint'>Sin cambios</li>"}</ul></div>
    </aside></div>`;
  },
  bind: (d, q, m, draw) => {
    admBindSeg($("#admBody"), draw);
    const u = d.u;
    $("#uSave").onclick = async () => {
      const p = { role: $("#uRole").value, plan: $("#uPlan").value, verification: $("#uVer").value, blocked: $("#uBlk").checked, full_name: $("#uName").value.trim(), company: $("#uCo").value.trim(), phone: $("#uPh").value.trim(), city: $("#uCity").value.trim(), cif: $("#uCif").value.trim() };
      if (u.role === "admin" && p.role !== "admin" && S.user && (S.user.email === u.email)) return toast("No puedes quitarte el rol de administrador a ti mismo", "alert");
      try { if (live()) await admRpc("admin_user_set", { p_id: u.id, p }); else Object.assign(admOff().users.find(x => x.id === u.id), p); admDrop("users", "ov", "u:*"); admOk("Usuario actualizado", "users"); admMount("usuario", q, m); } catch (e) { admErr(e); }
    };
    $("#uNoteF").onsubmit = async e => { e.preventDefault(); const t = $("#uNote").value.trim(); if (!t) return;
      try { if (live()) await admRpc("admin_note_add", { p_entity: "user", p_id: u.id, p_body: t }); else { const o = admOff(); (o.notes[u.id] = o.notes[u.id] || []).unshift({ body: t, admin_name: S.user.name, created_at: new Date().toISOString() }); } admDrop("u:*"); admMount("usuario", q, m); } catch (er) { admErr(er); } };
  },
};

/* ---------- SOLICITUDES ---------- */
ADM_R.solicitudes = { load: async () => ({}), view: () => `<div id="admLeads"></div>`, bind: () => { const b = $("#admLeads"); if (b && typeof adSolicitudes === "function") adSolicitudes(b); } };

/* ---------- AJUSTES ---------- */
ADM_R.ajustes = {
  load: async () => { const ov = await admGet("ov", true); return { st: ov.settings || {}, ov }; },
  view: ({ st, ov }) => {
    const c = st.contact || {};
    return `<div class="adm-grid g-2">
      ${admPanel("Lanzamiento de subastas", `<p class="muted" style="margin-top:0">Ahora la web funciona en modo lanzamiento: el Mercado está abierto y las subastas se muestran como «Próximamente» con lista de espera. Cuando la empresa esté lista, ábrelas desde aquí sin tocar código.</p>
        <div class="trow"><div><b>Subastas abiertas al público</b><small>${st.auctions_open ? "Los usuarios verificados pueden pujar." : "Las subastas se ven en vista previa; no se puede pujar."}</small></div><label class="toggle"><input type="checkbox" id="sAuc" ${st.auctions_open ? "checked" : ""} aria-label="Subastas abiertas"><span></span></label></div>`)}
      ${admPanel("Aviso en la web", `<p class="muted" style="margin-top:0">Una franja bajo la cabecera para anuncios importantes (horarios, mantenimiento, novedades). Déjalo vacío para ocultarla.</p>
        <div class="field"><label for="sAnn">Texto del aviso</label><input class="in" id="sAnn" maxlength="180" value="${esc(st.announcement || "")}" placeholder="Ej.: Este viernes las subastas empiezan a las 12:00"></div><button class="btn sm primary" id="sAnnSave">${ic("check", "sm")}Guardar aviso</button>`)}
      ${admPanel("Datos de contacto públicos", `<div class="fgrid">${admF("sMail", "Email", c.email, { type: "email" })}${admF("sPhone", "Teléfono", c.phone)}${admF("sWa", "WhatsApp", c.whatsapp, { ph: "+34 600 000 000" })}</div><button class="btn sm primary" id="sContSave">${ic("check", "sm")}Guardar contacto</button>`)}
      ${admPanel("Inventario importado", `<p class="muted" style="margin-top:0">Vehículos traídos de la web anterior (demo.motorsubasta.com) con sus fotos, descripciones, precios y datos técnicos.</p>
        <div class="adm-stats"><div><small>Importados</small><b class="tnum">${num(ov.vehicles.imported || 0)}</b></div><div><small>Sin VIN</small><b class="tnum ${ov.vehicles.no_vin ? "bad" : ""}">${num(ov.vehicles.no_vin || 0)}</b></div><div><small>Sin fotos</small><b class="tnum">${num(ov.vehicles.no_photo || 0)}</b></div></div>
        <a class="btn sm" href="#/admin/vehiculos?i=imported">${ic("car", "sm")}Revisar importados</a> <a class="btn sm" href="#/admin/vehiculos?i=novin">Completar VIN</a>`)}
      ${admPanel("Analítica", `<p class="muted" style="margin-top:0">La web mide visitas, fuentes de tráfico, búsquedas y contactos sin cookies ni datos personales: cada visitante recibe un identificador anónimo que cambia cada día. Las visitas del equipo no se cuentan.</p>
        <p class="muted">Para medir campañas, añade a tus enlaces: <code>?utm_source=facebook&amp;utm_medium=cpc&amp;utm_campaign=nombre</code></p><a class="btn sm" href="#/admin/analitica">${ic("gauge", "sm")}Abrir analítica</a>`)}
      ${admPanel("Exportar datos", `<p class="muted" style="margin-top:0">Descarga en CSV (se abre con Excel o Google Sheets).</p><div class="adm-btns"><button class="btn sm" data-exp="veh">${ic("car", "sm")}Vehículos</button><button class="btn sm" data-exp="users">${ic("users", "sm")}Usuarios</button><button class="btn sm" data-exp="deals">${ic("truck", "sm")}Operaciones</button><button class="btn sm" data-exp="offers">${ic("msg", "sm")}Ofertas</button></div>`)}
    </div>`;
  },
  bind: (d, q, m) => {
    const save = async (key, value, msg) => { try { if (live()) await admRpc("admin_setting", { p_key: key, p_value: value }); else admOff().settings[key] = value; admDrop("ov"); window.APP_SETTINGS = Object.assign(window.APP_SETTINGS || {}, { [key]: value }); admOk(msg, "gear"); } catch (e) { admErr(e); } };
    $("#sAuc").onchange = e => {
      const on = e.target.checked; e.target.checked = !on;
      modal(on ? "Abrir las subastas" : "Cerrar las subastas", `<p style="margin:0">${on ? "Las subastas pasarán a estar abiertas: los usuarios verificados podrán pujar y los vendedores publicar en subasta. Hazlo solo cuando la empresa y los pagos estén listos." : "Las subastas volverán a la vista previa «Próximamente». Las pujas quedarán desactivadas."}</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn ${on ? "primary" : "bad"}" id="cYes">${on ? "Abrir subastas" : "Volver a vista previa"}</button></div>`, close => {
        $("#cNo").onclick = close; $("#cYes").onclick = async () => { close(); await save("auctions_open", on, on ? "Subastas abiertas" : "Subastas en vista previa"); if (typeof AUCTIONS_OPEN !== "undefined") AUCTIONS_OPEN = on; admMount("ajustes", q, m); };
      });
    };
    $("#sAnnSave").onclick = async () => { const t = $("#sAnn").value.trim(); await save("announcement", t, t ? "Aviso publicado" : "Aviso retirado"); try { store.set("noticeClosed", ""); } catch (e) {} renderAnnouncement(); };
    $("#sContSave").onclick = () => save("contact", { email: $("#sMail").value.trim(), phone: $("#sPhone").value.trim(), whatsapp: $("#sWa").value.trim() }, "Contacto guardado");
    $$("[data-exp]").forEach(b => b.onclick = async () => {
      try {
        const k = b.dataset.exp;
        if (k === "veh") { const v = await admGet("veh"); admCsv("vehiculos", v.map(x => ({ ref: x.ref, marca: x.make, modelo: x.model, año: x.year, km: x.km, vin: x.vin, matricula: x.plate, categoria: x.category, estado: admVehStatus(x)[0], precio: admVehPrice(x), ciudad: x.city, vendedor: x.seller && x.seller.name, email: x.seller && x.seller.email, vistas: x.views, alta: x.created_at }))); }
        if (k === "users") { const u = await admGet("users"); admCsv("usuarios", u.map(x => ({ email: x.email, nombre: x.full_name, empresa: x.company, telefono: x.phone, rol: x.role, plan: x.plan, verificacion: x.verification, alta: x.created_at }))); }
        if (k === "deals") { const dd = await admGet("deals"); admCsv("operaciones", dd.map(x => ({ fecha: x.at, via: x.via, vehiculo: admTitle(x.vehicle), ref: x.vehicle && x.vehicle.ref, comprador: (x.buyer && x.buyer.name) || x.buyer_name, vendedor: x.seller && x.seller.name, importe: x.amount, comision: x.fee, estado: x.status }))); }
        if (k === "offers") { const mk = await admGet("mk"); admCsv("ofertas", mk.offers.map(x => ({ fecha: x.created_at, vehiculo: admTitle(x.vehicle), oferta: x.amount, precio: x.price, estado: x.status, comprador: x.buyer && x.buyer.name, email: x.buyer && x.buyer.email, telefono: x.buyer && x.buyer.phone, mensaje: x.message }))); }
      } catch (e) { admErr(e); }
    });
  },
};

/* ---------- REGISTRO ---------- */
ADM_R.registro = {
  load: async () => ({ log: await admGet("log", true) }),
  view: ({ log }) => {
    const f = ADM.f.lf || "todo";
    const rows = log.filter(g => f === "todo" || g.entity === f);
    const href = g => g.entity === "vehicle" && g.entity_id && g.action !== "eliminar" ? "#/admin/vehiculo/" + g.entity_id : g.entity === "user" && g.entity_id ? "#/admin/usuario/" + g.entity_id : null;
    return `<div class="adm-bar">${admSeg("lf", [["todo", "Todo", log.length], ["vehicle", "Vehículos", log.filter(g => g.entity === "vehicle").length], ["auction", "Subastas", log.filter(g => g.entity === "auction").length], ["user", "Usuarios", log.filter(g => g.entity === "user").length], ["order", "Operaciones", log.filter(g => g.entity === "order").length], ["setting", "Ajustes", log.filter(g => g.entity === "setting").length]], f)}</div>
    ${admTable("log", [
      { k: "at", l: "Fecha", f: g => `<span class="tnum">${ADM_FMT.dt(g.at)}</span>` },
      { k: "admin_name", l: "Quién", f: g => esc(g.admin_name || "—") },
      { k: "action", l: "Acción", f: g => `<span class="chip">${esc(admActionLabel(g.action))}</span>` },
      { k: "label", l: "Sobre", f: g => { const h = href(g); return h ? `<a href="${h}">${esc(g.label || g.entity_id || "—")}</a>` : esc(g.label || "—"); } },
      { l: "Detalle", f: g => { const d = g.detail || {}; if (d.snapshot) return `<small class="muted">copia de seguridad guardada</small>`; const e = Object.entries(d); return e.length ? `<small class="adm-diff">${e.slice(0, 5).map(([k, x]) => `<span><b>${esc(k)}</b> ${x && typeof x === "object" && "a" in x ? esc(String(x.de ?? "—")) + " → " + esc(String(x.a ?? "—")) : esc(typeof x === "object" ? JSON.stringify(x) : String(x))}</span>`).join("")}</small>` : `<span class="faint">—</span>`; } },
    ], rows, { sort: "at", empty: "Aún no hay cambios registrados", emptySub: "Cada cambio que haga el equipo queda aquí: quién, cuándo y qué cambió.", emptyIcon: "doc" })}`;
  },
  bind: (d, q, m, draw) => admBindSeg($("#admBody"), draw),
};

/* ---------- rutas ---------- */
(function admRoutes() {
  GUARD.auth.push("/admin");
  const R = [
    [/^\/admin$/, admRoute("", "Panel de control", "Todo lo que pasa en MotorSubasta, de un vistazo.")],
    [/^\/admin\/analitica$/, admRoute("analitica", "Analítica y tráfico", "Visitas, fuentes, búsquedas y conversión. Sin cookies.")],
    [/^\/admin\/vehiculos$/, admRoute("vehiculos", "Vehículos", "Todo el inventario: subasta, Mercado, sin publicar y vendidos.", `<button class="btn sm" id="admCsvVeh">${ic("doc", "sm")}<span>Exportar</span></button><button class="btn sm primary" id="admNewVeh">${ic("plus", "sm")}<span>Nuevo vehículo</span></button>`)],
    [/^\/admin\/vehiculo\/([\w-]+)$/, admRoute("vehiculo", (q, m) => m[1] === "nuevo" ? "Nuevo vehículo" : "Ficha del vehículo", null, null, () => `<a href="#/admin/vehiculos">${ic("left", "sm")}Vehículos</a>`)],
    [/^\/admin\/subastas$/, admRoute("subastas", "Subastas", "Sesiones, pujas con identidad real, decisiones y adjudicaciones.")],
    [/^\/admin\/mercado$/, admRoute("mercado", "Mercado", "Anuncios, precios, vistas, contactos y ofertas.")],
    [/^\/admin\/operaciones$/, admRoute("operaciones", "Vendidos y operaciones", "Ventas por subasta, Mercado y venta directa: pagos, documentación y entrega.", `<button class="btn sm primary" id="admNewSale">${ic("plus", "sm")}<span>Registrar venta</span></button>`)],
    [/^\/admin\/usuarios$/, admRoute("usuarios", "Usuarios", "Compradores, vendedores y empresas: verificación, planes y actividad.", `<button class="btn sm" id="admCsvUsers">${ic("doc", "sm")}<span>Exportar</span></button>`)],
    [/^\/admin\/usuario\/([\w-]+)$/, admRoute("usuario", "Ficha de usuario", null, null, () => `<a href="#/admin/usuarios">${ic("left", "sm")}Usuarios</a>`)],
    [/^\/admin\/solicitudes$/, admRoute("solicitudes", "Solicitudes y leads", "Venta rápida, seguros, alertas de búsqueda y lista de espera.")],
    [/^\/admin\/ajustes$/, admRoute("ajustes", "Ajustes", "Lanzamiento, avisos, contacto y exportaciones.")],
    [/^\/admin\/registro$/, admRoute("registro", "Registro de cambios", "Quién cambió qué y cuándo.")],
  ];
  for (let i = ROUTES.length - 1; i >= 0; i--) if (String(ROUTES[i][0]) === String(/^\/admin$/)) ROUTES.splice(i, 1);
  R.reverse().forEach(r => ROUTES.unshift(r));
  const ci = ROUTES.findIndex(r => String(r[0]) === String(/^\/cuenta$/));
  if (ci >= 0) { const base = ROUTES[ci][1]; ROUTES[ci] = [ROUTES[ci][0], (q, m) => { if (admIs() && !q.as) { setTimeout(() => location.replace("#/admin"), 0); return [`<div class="wrap"><div class="adm-skel"><i></i><i></i><i></i></div></div>`, null]; } return base(q, m); }]; }
  setInterval(() => { $$("[data-adm-tm]").forEach(el => { const t = +new Date(el.dataset.admTm) - now(); el.textContent = t > 0 ? fmtLeft(t) : "00:00:00"; }); }, 1000);
})();
