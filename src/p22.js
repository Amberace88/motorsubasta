/* ============================================================
   v15 — "Por qué MotorSubasta" animado
   · mapa de España con rutas desde Alicante
   · cinta de tipos de vendedor
   · matrícula española que cambia de vehículo
   · proceso transparente paso a paso
   (todo en funciones: la portada se pinta antes de que esta capa se ejecute)
   ============================================================ */

function whyProj(lon, lat) { return [((lon + 9.6) * 36).toFixed(1), ((44 - lat) * 36 * 1.3).toFixed(1)]; }
function whyMapSVG() {
  const coast = [[-8.41, 43.37], [-8.2, 43.55], [-7.7, 43.79], [-6.9, 43.58], [-5.66, 43.56], [-4.5, 43.42], [-3.8, 43.48], [-2.93, 43.33], [-1.79, 43.39],
    [-1.3, 43.05], [-0.4, 42.8], [0.7, 42.86], [1.7, 42.5], [2.7, 42.42], [3.32, 42.32], [3.1, 41.85], [2.17, 41.38], [1.25, 41.1], [0.87, 40.7],
    [0.2, 40.2], [-0.03, 39.98], [-0.33, 39.47], [-0.1, 38.95], [0.23, 38.73], [-0.48, 38.35], [-0.7, 37.95], [-0.69, 37.63], [-1.3, 37.55], [-1.65, 37.38],
    [-2.19, 36.72], [-2.46, 36.83], [-3.3, 36.73], [-4.42, 36.72], [-5.1, 36.42], [-5.35, 36.15], [-5.6, 36.01], [-6.05, 36.3], [-6.29, 36.53], [-6.4, 36.8],
    [-6.95, 37.2], [-7.4, 37.18], [-7.5, 37.6], [-7.3, 38.1], [-7.0, 38.6], [-7.3, 39.0], [-7.5, 39.6], [-6.9, 40.25], [-6.85, 41.0], [-6.2, 41.6],
    [-6.6, 41.95], [-7.4, 41.85], [-8.2, 42.1], [-8.87, 41.88], [-8.72, 42.24], [-9.0, 42.6], [-9.27, 42.88], [-9.1, 43.2], [-8.41, 43.37]];
  const mallorca = [[2.35, 39.55], [2.75, 39.95], [3.2, 39.92], [3.47, 39.72], [3.25, 39.35], [2.75, 39.4]];
  const menorca = [[3.82, 40.0], [4.1, 40.07], [4.32, 39.86], [3.95, 39.92]];
  const ibiza = [[1.2, 38.95], [1.45, 39.12], [1.6, 39.02], [1.4, 38.84]];
  const poly = pts => pts.map(p => whyProj(p[0], p[1]).join(",")).join(" ");
  const HQ = [-0.49, 38.35];
  const cities = [["Madrid", -3.70, 40.42, "r"], ["Barcelona", 2.17, 41.39, "r"], ["Valencia", -0.38, 39.47, "r"], ["Sevilla", -5.98, 37.39, "l"], ["Zaragoza", -0.89, 41.65, ""],
    ["Málaga", -4.42, 36.72, "b"], ["Murcia", -1.13, 37.99, ""], ["Bilbao", -2.93, 43.26, "b"], ["A Coruña", -8.41, 43.36, "b"], ["Valladolid", -4.72, 41.65, ""], ["Granada", -3.6, 37.18, ""], ["Palma", 2.65, 39.57, ""]];
  const [hx, hy] = whyProj(HQ[0], HQ[1]).map(Number);
  const routes = cities.filter(c => ["Madrid", "Barcelona", "Sevilla", "Bilbao", "A Coruña", "Málaga", "Zaragoza", "Palma"].includes(c[0])).map((c, i) => {
    const [x, y] = whyProj(c[1], c[2]).map(Number);
    const mx = (hx + x) / 2, my = (hy + y) / 2, dx = x - hx, dy = y - hy, len = Math.hypot(dx, dy);
    const cx = mx - dy / len * len * .22, cy = my + dx / len * len * .22 * (dx > 0 ? -1 : 1);
    const d = `M${hx},${hy} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x},${y}`;
    return `<path class="rt" d="${d}" pathLength="100" style="--i:${i}"/><circle class="truck" r="2.6" style="--i:${i}"><animateMotion dur="3.6s" begin="${(1.4 + i * .45).toFixed(2)}s" repeatCount="indefinite" path="${d}"/></circle>`;
  }).join("");
  const dots = cities.map(([n, lon, lat, lab], i) => {
    const [x, y] = whyProj(lon, lat);
    const pos = lab === "l" ? `x="${+x - 7}" y="${+y + 3.5}" text-anchor="end"` : lab === "b" ? `x="${x}" y="${+y + 13}" text-anchor="middle"` : `x="${+x + 7}" y="${+y + 3.5}"`;
    return `<g class="city" style="--i:${i}"><circle cx="${x}" cy="${y}" r="3"/>${lab ? `<text ${pos}>${n}</text>` : ""}</g>`;
  }).join("");
  return `<svg class="esmap" viewBox="0 0 512 390" role="img" aria-label="Mapa de España con cobertura nacional" translate="no">
    <defs><radialGradient id="esGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="var(--accent)" stop-opacity=".55"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></radialGradient>
      <pattern id="esDots" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r=".9" class="pd"/></pattern></defs>
    <polygon class="land" points="${poly(coast)}"/><polygon class="landdots" points="${poly(coast)}"/>
    ${[mallorca, menorca, ibiza].map(p => `<polygon class="land isl" points="${poly(p)}"/>`).join("")}
    <g class="canarias"><rect x="8" y="318" width="118" height="62" rx="9"/>${[[22, 352], [36, 346], [50, 350], [64, 345], [80, 352], [98, 338], [112, 331]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="${[3, 5, 5, 6, 6, 7, 5][i]}" ry="${[3, 3, 4, 4, 5, 3, 3][i]}"/>`).join("")}<text x="16" y="372">Canarias</text></g>
    ${routes}${dots}
    <circle class="hqglow" cx="${hx}" cy="${hy}" r="34" fill="url(#esGlow)"/>
    <g class="hq"><circle class="ring" cx="${hx}" cy="${hy}" r="6"/><circle cx="${hx}" cy="${hy}" r="5"/><text x="${hx + 9}" y="${hy + 14}">Alicante</text></g>
  </svg>`;
}

function whyT(s) { try { return typeof LANG !== "undefined" && LANG ? tr(s) : s; } catch (e) { return s; } }
function whyWords() { return [["Siniestro", "bad"], ["Averiado", "warn"], ["Embargo", "info"], ["Leasing", "vip"], ["Renting", "ok"], ["Sin daños", "ok"]]; }
function whySellers() { return [["shield", "Aseguradoras"], ["refresh", "Rentings"], ["store", "Concesionarios"], ["truck", "Flotas"], ["wrench", "Talleres"], ["recycle", "Desguaces"], ["building", "Empresas"], ["user", "Particulares"]]; }
function whySteps() { return [["upload", "Fotos del vehículo"], ["car", "Daños por paneles"], ["doc", "Documentación"], ["euro", "Coste total antes de pujar"], ["gavel", "Puja vinculante"]]; }

function whySection() {
  const S1 = whySellers(), half = Math.ceil(S1.length / 2);
  const row = list => list.concat(list).map(([i, t]) => `<span class="sch">${ic(i, "sm")}${t}</span>`).join("");
  return `<section class="blk why"><div class="wrap">
    <div class="sec-head" data-rev><div><div class="eyebrow">Por qué MotorSubasta</div><h2 style="margin-top:10px">Mercado español, reglas claras</h2></div></div>
    <div class="whygrid" id="whyGrid">
      <article class="wc wmap" data-rev>
        <div class="wtxt"><span class="wic">${ic("pin")}</span><h3>Mercado nacional</h3><p>Cobertura completa en las 17 comunidades autónomas de España.</p>
          <div class="wstats"><div><b class="tnum" data-count="17">17</b><small>comunidades</small></div><div><b class="tnum" data-count="50">50</b><small>provincias</small></div><div><b class="tnum">24 h</b><small>respuesta del vendedor</small></div></div></div>
        <div class="wmapbox">${whyMapSVG()}</div>
      </article>
      <article class="wc wsel" data-rev style="--d:80ms">
        <div class="wtxt"><span class="wic">${ic("users")}</span><h3>Diferentes vendedores</h3><p>Compañías de seguros, flotas de alquiler, concesionarios certificados, empresas, profesionales y particulares.</p></div>
        <div class="marq" aria-hidden="true"><div class="mrow">${row(S1.slice(0, half))}</div><div class="mrow rev">${row(S1.slice(half))}</div></div>
      </article>
      <article class="wc wplate" data-rev style="--d:160ms">
        <div class="wtxt"><span class="wic">${ic("car")}</span><h3>100% mercado español</h3><p>Siniestros, averiados, embargo, leasing y renting procedentes del mercado español.</p></div>
        <div class="platebox" aria-hidden="true">
          <div class="esplate" translate="no"><span class="eu"><i>★</i>E</span><span class="pch" id="whyPlate">${"1234 BCD".split("").map(c => `<b class="${c === " " ? "sp" : ""}">${c === " " ? "&nbsp;" : c}</b>`).join("")}</span></div>
          <span class="chip bad pword" id="whyWord" translate="no">${whyT("Siniestro")}</span>
        </div>
      </article>
      <article class="wc wproc" data-rev style="--d:240ms">
        <div class="wtxt"><span class="wic">${ic("shield")}</span><h3>Proceso transparente</h3><p>Normas de subasta claras, fotos y documentación según lo aportado por el vendedor.</p></div>
        <ol class="wsteps" id="whySteps">${whySteps().map(([i, t], n) => `<li style="--n:${n}"><span class="dot">${ic(i, "sm")}</span><span class="lb">${t}</span></li>`).join("")}<span class="wline"><i></i></span></ol>
      </article>
    </div>
  </div></section>`;
}

/* animación: solo mientras se ve; respeta "reducir movimiento" */
function whyMount() {
  const g = $("#whyGrid"); if (!g) return;
  const rm = typeof RM === "function" && RM();
  $$(".wc", g).forEach(c => c.addEventListener("pointermove", e => { const r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px"); }));
  if (rm || !("IntersectionObserver" in window)) { g.classList.add("on", "still"); $$("#whySteps li", g).forEach(li => li.classList.add("done")); return; }
  const T = whyT;
  const L = "BCDFGHJKLMNPRSTVWXYZ", D = "0123456789";
  let timers = [], wi = 0, si = 0;
  const clear = () => { timers.forEach(clearInterval); timers = []; };
  const spin = () => {
    const box = $("#whyPlate"), w = $("#whyWord"); if (!box || !w) return clear();
    const next = (Math.floor(1000 + Math.random() * 9000)) + " " + [0, 1, 2].map(() => L[Math.floor(Math.random() * L.length)]).join("");
    $$("b", box).forEach((b, k) => {
      const ch = next[k]; if (ch === " ") return;
      let n = 0; const pool = k < 4 ? D : L;
      b.classList.add("roll");
      const iv = setInterval(() => { b.textContent = pool[Math.floor(Math.random() * pool.length)]; if (++n > 6 + k) { clearInterval(iv); b.textContent = ch; b.classList.remove("roll"); } }, 45);
    });
    wi = (wi + 1) % whyWords().length; const [word, col] = whyWords()[wi];
    w.className = "chip pword out " + col;
    setTimeout(() => { w.textContent = T(word); w.className = "chip pword " + col; }, 220);
  };
  const step = () => {
    const lis = $$("#whySteps li"); if (!lis.length) return clear();
    si = (si + 1) % (lis.length + 2);
    lis.forEach((li, k) => { li.classList.toggle("done", k < si); li.classList.toggle("cur", k === si - 1); });
    const ln = $("#whySteps .wline i"); if (ln) { const pc = Math.min(100, Math.max(0, (si - 1) / (lis.length - 1) * 100)) + "%"; ln.style.width = pc; ln.style.setProperty("--p", pc); }
  };
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { g.classList.add("on"); if (!timers.length) { timers.push(setInterval(spin, 2600), setInterval(step, 900)); step(); } }
    else clear();
  }), { threshold: .2 });
  io.observe(g);
}

/* ---------- Cómo funciona: tarjetas 3D ---------- */
function howSteps() {
  return [["search", "Explorar", "Encuentra vehículos de aseguradoras, rentings, concesionarios y particulares.", "scan"],
    ["gavel", "Pujar", "Pujas competitivas en tiempo real, o puja anticipada antes de abrir la sesión.", "hit"],
    ["check", "Ganar", "Al ganar se desbloquean los datos del vendedor y el sistema de contraoferta de 24 h.", "draw"],
    ["truck", "Cerrar", "Gestoría y transporte coordinados hasta la retirada del vehículo.", "drive"]];
}
function howSection() {
  return `<section class="blk how"><div class="wrap">
    <div class="sec-head" data-rev><div><div class="eyebrow">Cómo funciona</div><h2 style="margin-top:10px">Compra en cuatro pasos</h2></div></div>
    <div class="how3d" id="how3d">
      <svg class="howline" viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden="true"><path d="M60 10 H940" pathLength="100"/><circle r="5" class="howdot"><animateMotion dur="6s" repeatCount="indefinite" path="M60 10 H940"/></circle></svg>
      ${howSteps().map(([i, t, d, fx], n) => `<article class="h3c" style="--n:${n}" data-fx="${fx}">
        <div class="h3in">
          <span class="h3num">0${n + 1}</span>
          <span class="h3ic">${ic(i, "lg")}</span>
          <h4>${t}</h4><p>${d}</p>
          <span class="h3glare" aria-hidden="true"></span>
        </div></article>`).join("")}
    </div>
    <div class="tags howtags" data-rev>${[["euro", "Sin comisiones ocultas"], ["users", "Diferentes vendedores"], ["msg", "Soporte en español"]].map(([i, t]) => `<span>${ic(i, "sm")} ${t}</span>`).join("")}</div>
  </div></section>`;
}
function howMount() {
  const g = $("#how3d"); if (!g) return;
  const rm = typeof RM === "function" && RM();
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (rm || !("IntersectionObserver" in window)) { g.classList.add("on"); return; }
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { g.classList.add("on"); o.disconnect(); } }), { threshold: .25 }).observe(g);
  if (!fine) return;
  $$(".h3c", g).forEach(c => {
    const inn = $(".h3in", c);
    c.addEventListener("pointermove", e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      inn.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 14}deg) translateZ(10px)`;
      inn.style.setProperty("--gx", (x + .5) * 100 + "%"); inn.style.setProperty("--gy", (y + .5) * 100 + "%");
      c.classList.add("act");
    });
    c.addEventListener("pointerleave", () => { inn.style.transform = ""; c.classList.remove("act"); });
  });
}

/* portada: los bloques nuevos sustituyen a las tarjetas planas */
patchRoute(/^\/$/, () => { whyMount(); howMount(); });
