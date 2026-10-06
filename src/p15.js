/* ============================================================
   v10 — cabecera estable + fondo generativo del hero
   ============================================================ */

/* ---------- 1. cabecera: fin del parpadeo ----------
   La cabecera es sticky, así que al encogerse movía el documento
   hacia arriba, el scroll volvía a cruzar el umbral y la clase se
   quitaba: bucle. Ahora la altura ya no cambia (solo el logo) y el
   umbral tiene histéresis, así que no puede oscilar.                */
var SCROLLED = false;
function onScrollTop() {
  const y = scrollY;
  if (!SCROLLED && y > 64) SCROLLED = true;
  else if (SCROLLED && y < 20) SCROLLED = false;
  const t = $("#top");
  if (t) t.classList.toggle("scrolled", SCROLLED);
  const p = $("#prog");
  if (p) {
    const h = document.documentElement.scrollHeight - innerHeight;
    p.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  }
}

/* ---------- 2. fondo generativo del hero ----------
   Lienzo propio detrás del hero: tres masas de luz que orbitan y
   estelas finas en diagonal, como faros en carretera de noche.
   Lee los colores del tema, se para fuera de pantalla y respeta
   "reducir movimiento".                                             */
var HERO_FX = null;
function heroBackdrop() {
  if (HERO_FX) { HERO_FX.stop(); HERO_FX = null; }
  const hero = document.querySelector(".hero");
  if (!hero || RM()) return;

  const cv = document.createElement("canvas");
  cv.className = "hero-fx";
  cv.setAttribute("aria-hidden", "true");
  hero.insertBefore(cv, hero.firstChild);
  const ctx = cv.getContext("2d", { alpha: true });

  let W = 0, H = 0, dpr = 1, raf = 0, tick = 0, t = 0, visible = true, dead = false;
  const css = getComputedStyle(document.documentElement);
  const light = () => {
    const th = document.documentElement.getAttribute("data-theme");
    return th ? th === "light" : matchMedia("(prefers-color-scheme: light)").matches;
  };
  let lite = light();

  /* paleta: naranja de marca + dos tonos fríos que lo sostienen */
  const warm = (css.getPropertyValue("--accent-fill") || "#e27122").trim();
  const hexToRgb = h => {
    const m = h.replace("#", "");
    const n = parseInt(m.length === 3 ? m.split("").map(c => c + c).join("") : m, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const A = hexToRgb(warm);
  const BLOBS = [
    { c: A, r: .62, a: [.00042, .00031], p: [0.0, 1.9], o: [.30, .70] },
    { c: [96, 132, 190], r: .52, a: [.00029, .00044], p: [2.1, 0.4], o: [.68, .34] },
    { c: [222, 150, 92], r: .40, a: [.00051, .00037], p: [4.0, 2.7], o: [.46, .62] },
  ];

  /* estelas: líneas finas que cruzan en diagonal y vuelven a entrar */
  const N = 22;
  const trails = [...Array(N)].map((_, i) => {
    const fast = i % 7 === 0;                 // alguna estela rápida rompe el ritmo
    return {
      x: Math.random(), y: Math.random(),
      len: (fast ? .14 : .05) + Math.random() * (fast ? .18 : .15),
      sp: (fast ? .0011 : .00024) + Math.random() * .0007,
      w: fast ? 1.8 : Math.random() < .3 ? 1.3 : .8,
      a: (fast ? .30 : .13) + Math.random() * .3,
      warm: i % 3 === 0,
    };
  });

  const ANG = -0.33;                       // ≈ -19°
  const ux = Math.cos(ANG), uy = Math.sin(ANG);

  function size() {
    const r = hero.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    cv.style.width = W + "px";
    cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function frame() {
    if (dead) return;
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    if (++tick % 2) return;                // ~30 fps: suave y barato
    t += 33;

    ctx.clearRect(0, 0, W, H);
    const base = lite ? .15 : .26;

    ctx.globalCompositeOperation = "lighter";
    for (const b of BLOBS) {
      const cx = W * (.5 + .34 * Math.sin(t * b.a[0] + b.p[0]));
      const cy = H * (.5 + .40 * Math.cos(t * b.a[1] + b.p[1]));
      const rad = Math.max(W, H) * b.r;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      const al = base * (b.o[0] + b.o[1] * .5);
      g.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${al})`);
      g.addColorStop(.45, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${al * .34})`);
      g.addColorStop(1, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    for (const s of trails) {
      s.x += ux * s.sp * 33 * 6;
      s.y += uy * s.sp * 33 * 6;
      if (s.x > 1.25) { s.x = -.25; s.y = Math.random(); }
      if (s.y < -.25) { s.y = 1.25; s.x = Math.random(); }
      const x1 = s.x * W, y1 = s.y * H;
      const x2 = x1 - ux * s.len * W, y2 = y1 - uy * s.len * W;
      const g = ctx.createLinearGradient(x1, y1, x2, y2);
      const col = s.warm ? `${A[0]},${A[1]},${A[2]}` : lite ? "90,110,140" : "190,205,225";
      g.addColorStop(0, `rgba(${col},${s.a * (lite ? .5 : 1)})`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.strokeStyle = g;
      ctx.lineWidth = s.w;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  const ro = new ResizeObserver(size);
  ro.observe(hero);
  const io = new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { threshold: 0 });
  io.observe(hero);
  const mq = matchMedia("(prefers-color-scheme: light)");
  const onTheme = () => { lite = light(); };
  mq.addEventListener && mq.addEventListener("change", onTheme);
  const mo = new MutationObserver(onTheme);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  size();
  raf = requestAnimationFrame(frame);

  HERO_FX = {
    stop() {
      dead = true; cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect(); mo.disconnect();
      mq.removeEventListener && mq.removeEventListener("change", onTheme);
      cv.remove();
    },
    theme: onTheme,
  };
}

/* el botón de tema también refresca el lienzo */
(function hookTheme() {
  const b = $("#themeBtn");
  if (!b) return;
  const prev = b.onclick;
  b.onclick = e => { prev && prev(e); if (HERO_FX) HERO_FX.theme(); };
})();

/* ---------- 3. enganche: el hero solo existe en la portada ---------- */
(function hookHome() {
  const i = ROUTES.findIndex(r => String(r[0]) === String(/^\/$/));
  if (i >= 0) ROUTES[i] = [/^\/$/, () => [viewHome(), () => { bindCards(); heroBackdrop(); }]];
})();

addEventListener("scroll", onScrollTop, { passive: true });
onScrollTop();
if (route().path === "/") heroBackdrop();
