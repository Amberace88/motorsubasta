/* ============================================================
   v11 — animación del hero con sensación de sala de subastas
   Sobre la foto de la nave: las lámparas respiran, un foco cruza
   la sala, el polvo flota y cada puja real lanza una onda desde
   el fondo del pasillo.
   ============================================================ */

var HERO_PULSE = 0;                       /* lo sube cada puja nueva */
function heroBidPulse() { HERO_PULSE = Math.min(3, HERO_PULSE + 1); }

function heroBackdrop() {
  if (HERO_FX) { HERO_FX.stop(); HERO_FX = null; }
  const hero = document.querySelector(".hero");
  if (!hero || RM()) return;

  const cv = document.createElement("canvas");
  cv.className = "hero-fx";
  cv.setAttribute("aria-hidden", "true");
  hero.insertBefore(cv, hero.children[1] || null);
  const ctx = cv.getContext("2d", { alpha: true });

  let W = 0, H = 0, dpr = 1, raf = 0, tick = 0, t = 0, visible = true, dead = false;

  /* lámparas: dos hileras que convergen en el punto de fuga (.5,.42) */
  const VX = .5, VY = .42;
  const LAMPS = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < 7; i++) {
      const k = Math.pow(i / 6, 1.7);                 // más juntas al fondo
      LAMPS.push({
        x: VX + side * (.012 + k * .50),
        y: VY - .22 + k * .16,
        r: .02 + (1 - k) * .085,
        a: .10 + (1 - k) * .30,
        ph: Math.random() * 6.28,
        sp: .00035 + Math.random() * .0005,
      });
    }
  }

  /* polvo en suspensión */
  const MOTES = [...Array(34)].map(() => ({
    x: Math.random(), y: Math.random(),
    r: .4 + Math.random() * 1.5,
    a: .06 + Math.random() * .2,
    vx: (Math.random() - .5) * .000035,
    vy: -.00002 - Math.random() * .00004,
  }));

  const rings = [];                        /* ondas de puja */
  let nextRing = 2600;

  function size() {
    const r = hero.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function frame() {
    if (dead) return;
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    if (++tick % 2) return;                 /* ~30 fps */
    t += 33;

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    /* 1 · respiración de las lámparas */
    for (const l of LAMPS) {
      const puls = .72 + .28 * Math.sin(t * l.sp + l.ph);
      const cx = l.x * W, cy = l.y * H, rad = l.r * Math.max(W, H) * (.9 + .2 * puls);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      const a = l.a * puls * .5;
      g.addColorStop(0, `rgba(255,186,108,${a})`);
      g.addColorStop(.42, `rgba(236,140,60,${a * .3})`);
      g.addColorStop(1, "rgba(226,113,34,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.2832); ctx.fill();
    }

    /* 2 · foco que recorre la nave */
    const sweep = (t % 17000) / 17000;
    const sx = (-.25 + sweep * 1.5) * W;
    const sg = ctx.createLinearGradient(sx - W * .22, 0, sx + W * .22, 0);
    sg.addColorStop(0, "rgba(255,196,128,0)");
    sg.addColorStop(.5, "rgba(255,196,128,.055)");
    sg.addColorStop(1, "rgba(255,196,128,0)");
    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);

    /* 3 · ondas de puja desde el fondo del pasillo */
    if (t > nextRing) { rings.push({ t0: t, strong: HERO_PULSE > 0 }); if (HERO_PULSE > 0) HERO_PULSE--; nextRing = t + 5200 + Math.random() * 4200; }
    for (let i = rings.length - 1; i >= 0; i--) {
      const k = (t - rings[i].t0) / (rings[i].strong ? 2600 : 3600);
      if (k >= 1) { rings.splice(i, 1); continue; }
      const e = 1 - Math.pow(1 - k, 2.2);
      const rad = e * Math.max(W, H) * .62;
      const a = (1 - k) * (rings[i].strong ? .3 : .15);
      ctx.strokeStyle = `rgba(255,170,90,${a})`;
      ctx.lineWidth = (rings[i].strong ? 2.2 : 1.3) * (1 - k * .5);
      ctx.beginPath(); ctx.ellipse(VX * W, VY * H, rad, rad * .42, 0, 0, 6.2832); ctx.stroke();
    }

    /* 4 · polvo */
    for (const m of MOTES) {
      m.x += m.vx * 33 * 30; m.y += m.vy * 33 * 30;
      if (m.y < -.05) { m.y = 1.05; m.x = Math.random(); }
      if (m.x < -.05) m.x = 1.05; if (m.x > 1.05) m.x = -.05;
      ctx.fillStyle = `rgba(255,214,170,${m.a})`;
      ctx.beginPath(); ctx.arc(m.x * W, m.y * H, m.r, 0, 6.2832); ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
  }

  const ro = new ResizeObserver(size); ro.observe(hero);
  const io = new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { threshold: 0 });
  io.observe(hero);

  size();
  raf = requestAnimationFrame(frame);
  HERO_FX = {
    stop() { dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); cv.remove(); },
    theme() {},
  };
}

/* la puja real que llega por realtime enciende una onda */
(function hookRealtimePulse() {
  const prev = typeof notify === "function" ? notify : null;
  if (!prev) return;
  notify = function (txt, icon) { if (/puja|puj/i.test(String(txt))) heroBidPulse(); return prev.apply(this, arguments); };
})();

/* precarga de la foto para que el hero no aparezca en dos tiempos */
(function preloadHall() {
  const l = document.createElement("link");
  l.rel = "preload"; l.as = "image"; l.href = "img/hall.jpg"; l.fetchPriority = "high";
  document.head.appendChild(l);
})();

if (route().path === "/") heroBackdrop();
