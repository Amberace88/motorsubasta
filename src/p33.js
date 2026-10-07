
/* =====================================================================
   p33 — Mapa de daños en 3D
   · carrocería generada según el modelo (compacto, berlina, familiar, SUV,
     todoterreno, monovolumen/furgoneta, pick-up, coupé, camión)
   · pintura con barniz, cristales, faros, llantas y estudio de luz (three.js)
   · cada panel se colorea según el daño; clic en la pieza → elegir gravedad
   · motos y náutica: se mantiene el mapa por lista
   ===================================================================== */
var C3 = { three: null, loading: null, inst: null, cam: { az: 0.72, el: 0.2, dist: 0 } };
var C3_ZONES = ["pdel", "capo", "techo", "male", "ptra", "pdi", "pdd", "pti", "ptd", "adi", "add", "ati", "atd"];
var C3_SEVC = ["#000000", "#3d86ff", "#f4b23a", "#f2731f", "#e5484d"];
var C3_PAINTS = [["Plata", "#b9bdc2"], ["Blanco", "#eeeeea"], ["Negro", "#121316"], ["Gris", "#4b5058"], ["Rojo", "#9c1a1d"], ["Azul", "#1f3f73"], ["Verde", "#2f4d3d"], ["Beige", "#b8a585"]];

/* ---------- carrocerías (medidas reales aproximadas, en metros) ---------- */
var C3_TYPES = {
  hatch: { name: "Compacto", L: 4.25, W: 1.79, R: 0.315, clr: 0.13, ax: [0.205, 0.80], doors: 4, wr: 0.80, gate: 1, p: 7,
    top: [[0, .50], [.02, .62], [.06, .72], [.18, .83], [.30, .93], [.45, 1.42], [.79, 1.41], [.86, 1.33], [.965, 1.05], [.993, .84], [1, .56]],
    belt: [[0, .86], [.3, .93], [.85, 1.0], [1, .98]], cab: [.30, .45, .79, .965], dr: [.33, .56, .76], win: [.31, .84], bump: [.07, .55, .93, .62] },
  sedan: { name: "Berlina", L: 4.75, W: 1.83, R: 0.325, clr: 0.13, ax: [0.19, 0.775], doors: 4, wr: 0.79, gate: 0, p: 7,
    top: [[0, .52], [.02, .65], [.06, .75], [.25, .86], [.33, .95], [.47, 1.43], [.67, 1.42], [.80, 1.07], [.95, 1.06], [.99, .93], [1, .56]],
    belt: [[0, .86], [.33, .95], [.78, 1.04], [1, 1.04]], cab: [.33, .47, .67, .80], dr: [.35, .55, .71], win: [.34, .74], bump: [.06, .56, .94, .62] },
  estate: { name: "Familiar", L: 4.8, W: 1.83, R: 0.325, clr: 0.13, ax: [0.19, 0.765], doors: 4, wr: 0.80, gate: 1, p: 7,
    top: [[0, .52], [.02, .65], [.06, .75], [.25, .86], [.33, .95], [.47, 1.45], [.88, 1.43], [.935, 1.36], [.985, 1.02], [.997, .86], [1, .58]],
    belt: [[0, .86], [.33, .95], [.9, 1.03], [1, 1.02]], cab: [.33, .47, .88, .985], dr: [.35, .55, .71], win: [.34, .90], bump: [.06, .56, .94, .62] },
  suv: { name: "SUV", rails: 1, L: 4.55, W: 1.86, R: 0.36, clr: 0.19, ax: [0.195, 0.79], doors: 4, wr: 0.83, gate: 1, p: 8, clad: 0.16,
    top: [[0, .64], [.02, .80], [.07, .92], [.27, 1.03], [.35, 1.10], [.47, 1.64], [.86, 1.62], [.93, 1.53], [.985, 1.18], [.998, .95], [1, .70]],
    belt: [[0, 1.0], [.35, 1.10], [.9, 1.17], [1, 1.15]], cab: [.35, .47, .86, .985], dr: [.36, .57, .77], win: [.36, .92], bump: [.06, .64, .94, .70] },
  jeep: { name: "Todoterreno", hlT: .05, rails: 1, L: 4.3, W: 1.88, R: 0.40, clr: 0.24, ax: [0.18, 0.80], doors: 4, wr: 0.92, gate: 1, p: 14, clad: 0.22, spare: 1,
    top: [[0, .74], [.012, .98], [.04, 1.05], [.29, 1.10], [.32, 1.14], [.37, 1.84], [.97, 1.84], [.993, 1.75], [1, .80]],
    belt: [[0, 1.08], [.32, 1.14], [1, 1.16]], cab: [.32, .37, .97, .995], dr: [.34, .56, .76], win: [.33, .95], bump: [.04, .70, .96, .74] },
  van: { name: "Monovolumen / furgoneta", tlW: .72, tlH: .42, tlT: .035, rails: 1, L: 4.95, W: 1.92, R: 0.33, clr: 0.16, ax: [0.17, 0.80], doors: 4, wr: 0.90, gate: 1, p: 12, cargo: 0,
    top: [[0, .62], [.02, .84], [.06, .98], [.14, 1.10], [.18, 1.18], [.29, 1.94], [.975, 1.94], [.994, 1.84], [1, .70]],
    belt: [[0, 1.02], [.18, 1.18], [1, 1.22]], cab: [.18, .29, .975, .994], dr: [.20, .43, .74], win: [.19, .95], bump: [.05, .58, .95, .62] },
  cargo: { name: "Furgoneta de carga", tlW: .74, tlH: .45, tlT: .03, L: 5.0, W: 1.95, R: 0.33, clr: 0.16, ax: [0.17, 0.80], doors: 4, wr: 0.92, gate: 1, p: 13, cargo: 1,
    top: [[0, .62], [.02, .84], [.06, .98], [.14, 1.10], [.18, 1.18], [.29, 2.05], [.98, 2.05], [.995, 1.95], [1, .70]],
    belt: [[0, 1.02], [.18, 1.18], [1, 1.22]], cab: [.18, .29, .98, .995], dr: [.20, .43, .74], win: [.19, .43], bump: [.05, .58, .95, .62] },
  pickup: { name: "Pick-up", tlW: .74, tlH: .30, tlT: .03, L: 5.3, W: 1.86, R: 0.385, clr: 0.22, ax: [0.17, 0.79], doors: 4, wr: 0.86, gate: 0, p: 10, clad: 0.14, bed: 0.62,
    top: [[0, .72], [.015, .94], [.05, 1.04], [.26, 1.11], [.31, 1.16], [.41, 1.80], [.60, 1.79], [.615, 1.24], [.996, 1.22], [1, .80]],
    belt: [[0, 1.08], [.31, 1.16], [.61, 1.22], [1, 1.22]], cab: [.31, .41, .60, .615], dr: [.32, .465, .60], win: [.32, .595], bump: [.04, .70, .96, .74] },
  coupe: { name: "Coupé", L: 4.5, W: 1.84, R: 0.33, clr: 0.11, ax: [0.20, 0.79], doors: 2, wr: 0.76, gate: 0, p: 7,
    top: [[0, .47], [.02, .58], [.07, .68], [.34, .86], [.38, .90], [.53, 1.32], [.66, 1.31], [.84, .98], [.965, .97], [.992, .85], [1, .52]],
    belt: [[0, .82], [.38, .90], [.84, .99], [1, .98]], cab: [.38, .53, .66, .84], dr: [.40, .64, .64], win: [.39, .74], bump: [.06, .50, .94, .58] },
  truck: { name: "Camión", hl: [0.72, 0.86], tlW: .7, tlH: .18, tlT: .02, L: 7.2, W: 2.45, R: 0.50, clr: 0.32, ax: [0.17, 0.74], doors: 2, wr: 0.94, gate: 1, p: 16, cargo: 1, clad: 0.3,
    top: [[0, 1.0], [.01, 1.35], [.03, 1.55], [.05, 2.7], [.24, 2.8], [.25, 3.4], [.995, 3.4], [1, 1.1]],
    belt: [[0, 1.6], [.24, 1.65], [1, 1.7]], cab: [.03, .05, .24, .25], dr: [.05, .23, .23], win: [.04, .23], bump: [.03, 1.0, .97, 1.05] },
};
var C3_ORDER = ["hatch", "sedan", "estate", "suv", "jeep", "van", "cargo", "pickup", "coupe", "truck"];

/* ---------- reconocer la carrocería por marca y modelo ---------- */
var C3_MODELS = {
  suv: "tiguan t-roc t-cross touareg taigo q2 q3 q4 q5 q7 q8 x1 x2 x3 x4 x5 x6 x7 ix ix1 ix3 gla glb glc gle gls ml eqa eqb eqc eqe-suv qashqai juke x-trail kadjar captur austral arkana koleos rafale 2008 3008 5008 4008 aircross ds7 ds3 ateca arona tarraco formentor terramar kona tucson santa-fe santafe bayon ix35 ix55 sportage sorento stonic niro xceed ev3 ev5 ev6 ev9 rav4 c-hr yaris-cross corolla-cross highlander bz4x cx-3 cx-30 cx-5 cx-60 cx-80 kuga puma ecosport edge explorer mokka crossland grandland frontera antara duster bigster vitara s-cross sx4 outlander asx eclipse-cross xc40 xc60 xc90 ex30 ex90 evoque velar discovery range-rover macan cayenne model-y id.4 id.5 id4 id5 enyaq elroq kodiaq karoq kamiq compass renegade avenger cherokee tonale stelvio zs hs ioniq-5 mach-e 500x 600 cr-v hr-v zr-v forester xv crosstrek ux nx rx tivoli korando torres atto seal-u jaecoo omoda tiggo countryman f-pace e-pace i-pace kona-electric",
  jeep: "wrangler jimny defender clase-g g-class g350 g400 g500 g63 land-cruiser landcruiser patrol pajero montero samurai santana niva grenadier bronco rexton terrano grand-vitara",
  van: "multivan california caravelle sharan alhambra galaxy s-max touran zafira picasso scenic espace grand-espace carnival staria tourneo traveller spacetourer rifter berlingo partner kangoo combo doblo caddy townstar proace-city clase-v v-class viano marco-polo jogger lodgy sienna id.buzz buzz",
  cargo: "transporter transit custom trafic master expert jumpy boxer jumper ducato scudo talento vivaro movano crafter sprinter citan vito nv200 nv300 nv400 primastar interstar connect courier daily hiace proace e-transit e-sprinter",
  pickup: "hilux ranger navara l200 amarok d-max x-class gladiator tundra f-150 ram frontier bt-50 t60 musso cybertruck",
  coupe: "coupe cabrio cabriolet roadster spider spyder z4 tt 911 cayman boxster mx-5 miata gt86 gr86 brz supra mustang camaro corvette f-type rc 370z 350z amg-gt slk slc clk sl m2 m4 m8 rcz scirocco 718 r8 huracan gallardo 488 f8 296 sf90",
  estate: "touring variant avant sportstourer sports-tourer sw break sportbreak estate kombi combi sportwagon shooting-brake allroad v60 v70 v90 outback levorg tourer wagon",
  sedan: "serie-3 serie-5 serie-7 3-series 5-series 7-series 316 318 320 325 330 335 340 518 520 525 530 535 540 545 550 730 740 750 i4 i5 i7 a4 a6 a8 clase-c clase-e clase-s c-class e-class s-class passat jetta arteon superb octavia insignia mondeo avensis camry accord model-3 model-s giulia talisman laguna 508 407 607 c5 c-elysee toledo exeo ioniq-6 i40 elantra logan cla xe xf stinger a7 panamera civic-sedan eqe eqs s60 s90 seal",
  truck: "actros axor atego arocs antos scania stralis s-way eurocargo tgx tgs tgl tgm fh fm fh16 t-high",
  moto: "cbr cb500 cb650 forza pcx yzf mt-07 mt-09 tmax xmax nmax ninja z650 z900 versys panigale multistrada sportster softail gsx gsx-r hayabusa v-strom burgman vespa scooter moto",
};
var C3_MOTO_MAKES = /^(yamaha|kawasaki|ducati|harley|ktm|triumph|aprilia|piaggio|vespa|mv agusta|benelli|royal enfield|husqvarna|sym|kymco|bmw motorrad)/i;
var C3_MAKE_DEF = { "jeep": "suv", "land rover": "suv", "ssangyong": "suv", "kgm": "suv", "isuzu": "pickup", "iveco": "cargo", "ldv": "cargo", "lynk": "suv", "smart": "hatch" };
var C3_SIZE = { city: "jimny 500 up aygo aygo-x twingo i10 picanto c1 107 108 spark panda smart fortwo mii citigo ka spring", small: "polo ibiza clio corsa 208 i20 yaris fiesta c3 sandero fabia rio swift micra jazz mazda2 a1 mini 2008 captur juke arona t-cross stonic kona bayon puma", large: "x5 x6 x7 q7 q8 touareg gle gls cayenne xc90 range-rover land-cruiser serie-7 7-series clase-s s-class a8 panamera model-s passat superb arteon a6 e-class clase-e serie-5 5-series mondeo kodiaq tarraco 5008 sorento santa-fe outlander transit crafter sprinter master movano ducato boxer jumper" };
function c3Norm(s) { return " " + String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9.\- ]/g, " ").replace(/\s+/g, " ").trim() + " "; }
var C3_RX = {};
function c3Rx(w) { return C3_RX[w] || (C3_RX[w] = new RegExp("(^| )" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/-/g, "[ -]?") + (/\d$/.test(w) ? "[a-z]{0,4}" : "") + "(?= |$)")); }
function c3Has(text, list) { return list.split(" ").find(w => w && c3Rx(w).test(text)); }
function c3Detect(make, model, hint) {
  const mdl = c3Norm(model), txt = c3Norm(make + " " + model), mk = c3Norm(make).trim();
  if (C3_MOTO_MAKES.test(mk) || hint === "moto") return { type: "moto", by: mk || "moto" };
  for (const k of ["estate", "coupe"]) { const w = c3Has(mdl, C3_MODELS[k]); if (w) return { type: k, by: w }; }
  for (const k of ["truck", "pickup", "jeep", "van", "cargo", "suv", "sedan", "moto"]) { const w = c3Has(txt, C3_MODELS[k]); if (w) return { type: k, by: w }; }
  if (/^(daf|scania)/.test(mk) || (hint === "camion" && /^(man|iveco|volvo|renault|mercedes)/.test(mk))) return { type: "truck", by: mk };
  if (hint === "camion") return { type: "truck", by: null };
  const h = c3Norm(hint); if (h.trim()) { const H = [["jeep", /todoterreno|4x4/], ["suv", /suv|crossover/], ["estate", /familiar|ranchera|break/], ["van", /monovolumen|minivan/], ["cargo", /furgon/], ["pickup", /pick ?up/], ["coupe", /coupe|cabrio|descapotable/], ["sedan", /berlina|sedan/], ["truck", /camion/]].find(x => x[1].test(h)); if (H) return { type: H[0], by: null }; }
  for (const k in C3_MAKE_DEF) if (mk.startsWith(k)) return { type: C3_MAKE_DEF[k], by: mk };
  return { type: "hatch", by: null };
}
function c3Size(make, model, type) {
  const txt = c3Norm(make + " " + model);
  if (c3Has(txt, C3_SIZE.city)) return type === "hatch" ? 0.86 : 0.93;
  if (c3Has(txt, C3_SIZE.small)) return 0.95;
  if (c3Has(txt, C3_SIZE.large)) return 1.05;
  return 1;
}

/* ---------- geometría ---------- */
function c3Lerp(pts, t) { for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const a = pts[i - 1], b = pts[i], u = (t - a[0]) / Math.max(1e-6, b[0] - a[0]); const s = u * u * (3 - 2 * u); return a[1] + (b[1] - a[1]) * (0.35 * u + 0.65 * s); } return pts[pts.length - 1][1]; }
function c3Sm(a, b, x) { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); }
function c3Model(T, scale) {
  const k = scale || 1, L = T.L * k, W = T.W * (0.94 + 0.06 * k), R = T.R * (0.9 + 0.1 * k);
  const hT = t => c3Lerp(T.top, t), hB = t => c3Lerp(T.belt, t);
  const half = t => { const u = Math.abs(2 * t - 1); return W / 2 * Math.pow(Math.max(0, 1 - Math.pow(u, T.p)), 1 / T.p); };
  const cab = t => t > T.cab[0] && t < T.cab[3];
  const ax = T.ax.map(a => L / 2 - a * L);
  const ybot = t => { const x = L / 2 - t * L; let y = T.clr + 0.04 * Math.pow(Math.max(0, Math.abs(2 * t - 1) - 0.8) / 0.2, 2) * (T.clr + 0.2);
    for (const a of ax) { const dx = Math.abs(x - a), Ra = R + 0.045; if (dx < Ra) y = Math.max(y, R + Math.sqrt(Ra * Ra - dx * dx) * 0.98); } return y; };
  const ys = t => Math.min(hB(t), hT(t) - 0.05);
  const cw = t => c3Sm(T.cab[0] - 0.02, T.cab[0] + 0.015, t) * (1 - c3Sm(T.cab[3] - 0.015, T.cab[3] + 0.02, t));
  const wr = t => { const h = half(t), o = Math.max(0.01, h - 0.11); return o + (h * T.wr - o) * cw(t); };
  const F = T.flare != null ? T.flare : T.clad ? 0.045 : 0.03;
  const fl = t => { const x = L / 2 - t * L; let f = 0; for (const a of ax) { const d = Math.abs(x - a) / (R * 2.3); if (d < 1) f = Math.max(f, Math.pow(1 - d * d, 2)); } return f * F; };
  const M = { T, L, W, R, k, hT, hB, half, cab, ax, ybot, ys, wr, fl, F };
  if (T.hl) M.hl = T.hl.slice(); else { const y1 = hT(0.03) - 0.035; M.hl = [y1 - (T.hlH || 0.12), y1]; }
  M.yF = M.hl[0] - 0.015;
  const yr = Math.min(hB(0.985), hT(0.985) - 0.04); M.tl = [yr - (T.tlH || 0.14), yr]; M.yR = Math.min(T.bump[3] + 0.06, M.tl[0] - 0.05);
  return M;
}
function c3Section(M, t, out) {
  const w = Math.max(0.0005, M.half(t)), yb = M.ybot(t), yt = M.hT(t), ysh = Math.max(yb + 0.06, M.ys(t)), wr0 = Math.min(M.wr(t), w - 0.02);
  const rb = Math.min(0.1, (ysh - yb) * 0.3, w * 0.5), wg = Math.max(wr0, w - 0.035), rr = Math.min(0.08, Math.max(0.01, (yt - ysh) * 0.35), wr0 * 0.6), crown = 0.025;
  const fl = M.fl(t) * Math.min(1, w / (M.W * 0.3)), sw = Math.min(1, w * 3);
  const P = []; const lin = (n, f) => { for (let i = 0; i < n; i++) P.push(f(i / n)); };
  lin(4, s => [(w - rb) * s, yb]);
  for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + Math.PI / 2 * i / 6; P.push([w - rb * 1.15 + rb * 1.15 * Math.cos(a), yb + rb + rb * Math.sin(a)]); }
  lin(9, s => [w + 0.024 * Math.sin(Math.PI * Math.pow(s, 0.7)) * sw, yb + rb + (ysh - 0.05 - yb - rb) * s]);
  for (let i = 0; i < 4; i++) { const a = Math.PI / 2 * i / 4; P.push([wg + (w - wg) * Math.cos(a), ysh - 0.05 + 0.05 * Math.sin(a)]); }
  lin(7, s => [wg + (wr0 - wg) * s + 0.012 * Math.sin(Math.PI * s), ysh + (yt - rr - ysh) * s]);
  for (let i = 0; i < 6; i++) { const a = Math.PI / 2 * i / 6; P.push([wr0 - rr + rr * Math.cos(a), yt - rr + rr * Math.sin(a)]); }
  lin(5, s => { const z = (wr0 - rr) * (1 - s); return [z, yt + crown * (1 - Math.pow(z / Math.max(0.01, wr0 - rr), 2))]; });
  P.push([0, yt + crown]);
  if (fl > 0) P.forEach(q => { if (q[1] < ysh - 0.02) q[0] += fl * c3Sm(ysh - 0.02, ysh - 0.2, q[1]) * Math.min(1, q[0] / w); });
  out.length = 0; P.forEach(q => out.push(q)); return out;
}
function c3BodyGeometry(THREE, M) {
  const NX = 240, sec = [], HN = c3Section(M, 0.5, []).length, RING = HN * 2 - 2;
  const pos = new Float32Array((NX + 1) * RING * 3), prof = new Float32Array((NX + 1) * RING * 4), idx = [];
  for (let i = 0; i <= NX; i++) {
    const u = i / NX, t = u - 0.4 * Math.sin(2 * Math.PI * u) / (2 * Math.PI), x = M.L / 2 - t * M.L; c3Section(M, t, sec);
    const ys = M.ys(t), yt = M.hT(t), w = M.half(t), wr = M.wr(t);
    for (let j = 0; j < RING; j++) { const p = j < HN ? sec[j] : sec[RING - j], z = j < HN ? p[0] : -p[0], v = i * RING + j, o = v * 3;
      pos[o] = x; pos[o + 1] = p[1]; pos[o + 2] = z; prof[v * 4] = ys; prof[v * 4 + 1] = yt; prof[v * 4 + 2] = w; prof[v * 4 + 3] = wr; }
  }
  for (let i = 0; i < NX; i++) for (let j = 0; j < RING; j++) { const a = i * RING + j, b = i * RING + (j + 1) % RING, c = (i + 1) * RING + j, d = (i + 1) * RING + (j + 1) % RING; idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aProf", new THREE.BufferAttribute(prof, 4)); g.setIndex(idx); g.computeVertexNormals(); return g;
}

/* ---------- zonas (misma regla en el sombreador y al hacer clic) ---------- */
function c3ZoneAt(M, p, n) {
  const T = M.T, t = Math.min(1, Math.max(0, (M.L / 2 - p.x) / M.L)), ysh = M.ys(t), yt = M.hT(t), w = M.half(t), az = Math.abs(p.z), left = p.z > 0;
  const cab = M.cab(t), above = p.y > ysh + 0.012;
  if (n.y < -0.45) return null;
  if (Math.min(...M.ax.map(a => Math.hypot(p.x - a, p.y - M.R))) < M.R + 0.07 && az < w - 0.02 && Math.abs(n.z) < 0.6) return null;
  if ((t < T.bump[0] + 0.02 && p.y < M.yF + 0.02) || (n.x > 0.6 && p.y < ysh)) return "pdel";
  if (t > T.bump[2] - 0.02 && p.y < M.yR + 0.02) return "ptra";
  if (n.x < -0.6 && t > 0.88) return "male";
  if (cab && above) {
    if (t < T.cab[1] - 0.004 && !(Math.abs(n.z) > 0.55)) return "capo";
    if (t > T.cab[2] + 0.004 && !(Math.abs(n.z) > 0.55)) return "male";
    if (p.y > yt - 0.04) return "techo";
  }
  const side = Math.abs(n.z) > 0.5 || az > w - 0.09;
  if (!side || (n.y > 0.55 && az < w - 0.11)) { if (t < T.cab[0] + 0.01) return "capo"; if (t > T.cab[3] - 0.01 || (T.bed && t > T.bed)) return "male"; if (cab) return "techo"; }
  const d = T.dr;
  if (t < d[0]) return left ? "adi" : "add";
  if (t < d[1]) return left ? "pdi" : "pdd";
  if (T.doors === 4 && t < d[2]) return left ? "pti" : "ptd";
  return left ? "ati" : "atd";
}

/* sombreador: la pintura, los cristales, las luces y las juntas salen de la posición */
function c3PatchMaterial(mat, M, U) {
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute vec4 aProf; varying vec3 vOP; varying vec3 vON; varying vec4 vProf;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvOP = position; vON = normal; vProf = aProf;");
    const T = M.T, f = v => Number(v).toFixed(4);
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", `#include <common>
varying vec3 vOP; varying vec3 vON; varying vec4 vProf;
uniform float uSev[13]; uniform float uHover; uniform float uSel; uniform vec3 uPaint; uniform vec2 uPM; uniform float uTime;
vec3 kCol; float kRough; float kMetal; float kClear; vec3 kEmit;
const float L = ${f(M.L)}; const float CLR = ${f(T.clr)}; const float RW = ${f(M.R)};
const vec4 CAB = vec4(${f(T.cab[0])}, ${f(T.cab[1])}, ${f(T.cab[2])}, ${f(T.cab[3])});
const vec3 DR = vec3(${f(T.dr[0])}, ${f(T.dr[1])}, ${f(T.dr[2])});
const vec2 WIN = vec2(${f(T.win[0])}, ${f(T.win[1])});
const vec2 BUMP = vec2(${f(T.bump[0])}, ${f(T.bump[2])});
const float YF = ${f(M.yF)}; const float YR = ${f(M.yR)};
const vec2 HL = vec2(${f(M.hl[0])}, ${f(M.hl[1])}); const vec2 TL = vec2(${f(M.tl[0])}, ${f(M.tl[1])});
const float HLT = ${f(T.hlT || 0.075)}; const float TLT = ${f(T.tlT || 0.05)}; const float TLW = ${f(T.tlW || 0.42)};
const float W2 = ${f(M.W / 2)};
const vec2 AX = vec2(${f(M.ax[0])}, ${f(M.ax[1])});
const float DOORS = ${T.doors}.0; const float CLAD = ${f(T.clad || 0)}; const float BED = ${f(T.bed || 0)}; const float CARGO = ${T.cargo ? 1 : 0}.0; const float GATE = ${T.gate ? 1 : 0}.0;
vec3 sevColor(float s){ return s < 0.5 ? vec3(0.) : s < 1.5 ? vec3(0.20,0.50,1.) : s < 2.5 ? vec3(0.98,0.72,0.20) : s < 3.5 ? vec3(0.98,0.45,0.10) : vec3(0.92,0.20,0.24); }
float seam(float d, float w){ float fw = fwidth(d) + 1e-5; return 1. - smoothstep(w, w + fw * 1.5, abs(d)); }
void carShade(){
  vec3 p = vOP; vec3 n = normalize(vON);
  float t = clamp((L * .5 - p.x) / L, 0., 1.);
  float ys = vProf.x, yt = vProf.y, w = vProf.z, wr = vProf.w, az = abs(p.z);
  bool left = p.z > 0.; bool cab = t > CAB.x && t < CAB.w; bool above = p.y > ys + .012;
  bool sideF = abs(n.z) > .5 || az > w - .09;
  float kind = 0.; // 0 pintura 1 cristal 2 plástico negro 3 faro 4 piloto 5 rejilla 6 matrícula 7 cromo
  float zone = -1.;
  // ---------- zona ----------
  if ((t < BUMP.x + .02 && p.y < YF + .02) || (n.x > .6 && p.y < ys)) zone = 0.;
  else if (t > BUMP.y - .02 && p.y < YR + .02) zone = 4.;
  else if (n.x < -.6 && t > .88) zone = 3.;
  else if (cab && above && t < CAB.y - .004 && abs(n.z) <= .55) zone = 1.;
  else if (cab && above && t > CAB.z + .004 && abs(n.z) <= .55) zone = 3.;
  else if (cab && above && p.y > yt - .04) zone = 2.;
  else if (!sideF || (n.y > .55 && az < w - .11)) zone = t < CAB.x + .01 ? 1. : (t > CAB.w - .01 || (BED > 0. && t > BED)) ? 3. : (cab ? 2. : 1.);
  else { float s = left ? 0. : 1.;
    if (t < DR.x) zone = 9. + s; else if (t < DR.y) zone = 5. + s; else if (DOORS > 3. && t < DR.z) zone = 7. + s; else zone = 11. + s; }
  // ---------- tipo de superficie ----------
  if (n.y < -.45) { kind = 2.; zone = -1.; }
  { float da = min(length(vec2(p.x - AX.x, p.y - RW)), length(vec2(p.x - AX.y, p.y - RW))); if (da < RW + .07 && az < w - .02 && abs(n.z) < .6) { kind = 2.; zone = -1.; } }
  if (cab && above) {
    bool roof = p.y > yt - .035 && t > CAB.y + .012 && t < CAB.z - .012;
    if (!roof) {
      if (t <= CAB.y + .012) { if (az < wr - .045 && p.y > ys + .03) kind = 1.; }
      else if (t >= CAB.z - .012) { if (az < wr - .05 && t < CAB.w - .006 && p.y > ys + .03) kind = 1.; }
      else if (t > WIN.x && t < WIN.y && p.y < yt - .05 && p.y > ys + .025) { kind = 1.; if (CARGO > 0. && t > DR.y + .02) kind = 0.; }
      if (kind == 1. && abs(n.z) > .4 && t > CAB.y && t < CAB.z) {
        if (abs(t - DR.y) * L < .05) kind = 2.;
        if (p.y < ys + .045 || p.y > yt - .07 || t < WIN.x + .01 || t > WIN.y - .01) kind = 2.;
      }
      if (abs(n.z) > .4 && abs(p.y - (ys + .02)) < .007 && t > WIN.x && t < WIN.y) kind = 7.;
    }
  }
  // frontal: faros envolventes, parrilla, entrada inferior y matrícula
  if (t < HLT && p.y > HL.x && p.y < HL.y && az > W2 * (.42 + .10 * (p.y - HL.x) / (HL.y - HL.x)) && n.y < .8 && n.x > -.3) kind = 3.;
  if (n.x > .45 && t < .06) {
    if (az < W2 * .42 && p.y > HL.x - .01 && p.y < HL.y - .015) kind = 5.;
    if (az < W2 * .70 && p.y > CLR + .07 && p.y < YF - .17) kind = 5.;
    if (az > W2 * .74 && az < W2 * .88 && p.y > CLR + .12 && p.y < YF - .19) kind = 2.;
    if (az < .26 && p.y > YF - .155 && p.y < YF - .045) kind = 6.;
    if (p.y < CLR + .05) kind = 2.;
  }
  // trasera: pilotos envolventes, matrícula y difusor
  if (t > 1. - TLT && p.y > TL.x && p.y < TL.y && az > W2 * TLW && n.y < .8 && n.x < .3) kind = 4.;
  if (n.x < -.45 && t > .94) {
    if (az < .26 && p.y > YR - .16 && p.y < YR - .05) kind = 6.;
    if (p.y < CLR + .08) kind = 2.;
  }
  // plásticos de paso de rueda (SUV, todoterreno, pick-up)
  if (CLAD > 0. && sideF && n.y > -.45 && kind == 0.) {
    float d0 = length(vec2(p.x - AX.x, p.y - RW)), d1 = length(vec2(p.x - AX.y, p.y - RW));
    if (p.y < CLR + CLAD * .55 || min(d0, d1) < RW + .045 + .075) kind = 2.;
  }
  if (BED > 0. && t > BED + .01 && t < .985 && n.y > .5 && az < w - .07) kind = 2.;
  // ---------- material ----------
  kCol = uPaint; kRough = uPM.y; kMetal = uPM.x; kClear = 1.; kEmit = vec3(0.);
  if (kind == 1.) { kCol = vec3(.015, .019, .026); kRough = .03; kMetal = .2; kClear = 1.; }
  else if (kind == 2.) { kCol = vec3(.028); kRough = .7; kMetal = 0.; kClear = 0.; float g = fract(p.x * 40.) * fract(p.y * 37.); kCol *= .9 + .2 * g; }
  else if (kind == 3.) {
    float e = (p.y - HL.x) / (HL.y - HL.x);
    kCol = vec3(.10, .11, .12); kRough = .05; kMetal = 1.; kClear = 1.;
    if (e > .70 && e < .86) { kCol = vec3(.95); kEmit = vec3(1.6, 1.7, 1.9); kMetal = 0.; }
    else if (n.x > .4) { float c = length(vec2(az - W2 * .72, p.y - (HL.x + (HL.y - HL.x) * .38))); if (c < .034) { kCol = vec3(.9); kEmit = vec3(.25, .27, .3) * (1. - smoothstep(.02, .034, c)); } }
  }
  else if (kind == 4.) {
    float e = (p.y - TL.x) / (TL.y - TL.x);
    kCol = vec3(.28, .01, .015); kRough = .05; kMetal = .2; kClear = 1.; kEmit = vec3(.35, .01, .01);
    if (e > .42 && e < .58) kEmit = vec3(1.7, .08, .06);
  }
  else if (kind == 5.) { kCol = vec3(.03); kRough = .3; kMetal = .4; kClear = .7; float g = step(.55, fract(p.y * 30.)) * step(.2, fract(p.z * 9.)); kCol = mix(vec3(.012), vec3(.07), g); }
  else if (kind == 6.) {
    kCol = vec3(.9); kRough = .35; kMetal = 0.; kClear = .3;
    float fr = n.x > 0. ? 1. : -1.; float zz = p.z * fr; // borde azul europeo a la izquierda del observador
    float y0 = n.x > 0. ? YF - .155 : YR - .16, ym = y0 + .055;
    if (zz > .215) kCol = vec3(.04, .16, .55);
    else if (zz > -.235 && zz < .19 && abs(p.y - ym) < .028) kCol = mix(kCol, vec3(.05), step(.42, fract(zz * 24.)) * step(.08, abs(fract(zz * 4.5) - .5)));
    if (az > .25 || abs(p.y - ym) > .049) kCol = vec3(.08);
  }
  else if (kind == 7.) { kCol = vec3(.8); kRough = .12; kMetal = 1.; kClear = 1.; }
  // oclusión aproximada: bajos y pasos de rueda más oscuros
  if (kind == 0.) { float d = min(length(vec2(p.x - AX.x, p.y - RW)), length(vec2(p.x - AX.y, p.y - RW)));
    kCol *= mix(.55, 1., smoothstep(CLR, CLR + .28, p.y)) * mix(.6, 1., smoothstep(RW + .02, RW + .16, d)); }
  // ---------- daño por zona ----------
  int zi = int(zone + .5);
  float sv = zone >= 0. ? uSev[zi] : 0.;
  if (sv > .5) { vec3 sc = sevColor(sv); float m = kind == 0. ? .9 : kind == 1. ? .30 : kind == 2. ? .5 : .25; kCol = mix(kCol, sc * sc, m); if (kind == 0.) { kRough = .34; kMetal = 0.; } kEmit += sc * sc * (kind == 0. ? .10 : .03); }
  if (zone >= 0. && abs(zone - uHover) < .5) { kCol = mix(kCol, vec3(1.), .14); kEmit += vec3(.06, .035, .0) * (1. + .5 * sin(uTime * 5.)); }
  if (zone >= 0. && abs(zone - uSel) < .5) kEmit += vec3(.12, .06, .0) * (.6 + .4 * sin(uTime * 6.));
  // ---------- juntas de carrocería ----------
  float sm = 0.;
  if (sideF && p.y < ys + .005 && p.y > CLR + .05) { sm = max(sm, seam((t - DR.x) * L, .0018)); sm = max(sm, seam((t - DR.y) * L, .0018)); if (DOORS > 3.) sm = max(sm, seam((t - DR.z) * L, .0018)); }
  if (n.y > .35 && t < CAB.x) { sm = max(sm, seam((t - (CAB.x - .012)) * L, .0018)); sm = max(sm, seam(az - (w - .115), .0016)); }
  if (t < BUMP.x + .08) sm = max(sm, seam(p.y - YF, .0016) * step(abs(n.y), .7));
  if (t > BUMP.y - .08) sm = max(sm, seam(p.y - YR, .0016) * step(abs(n.y), .7));
  if (GATE < .5 && n.y > .35 && t > CAB.w) sm = max(sm, seam((t - (CAB.w + .01)) * L, .0018));
  if (GATE > .5 && n.x < -.5 && t > .9) sm = max(sm, seam(p.y - (YR + .02), .0016));
  // tiradores
  if (sideF && abs(p.y - (ys - .075)) < .013 && n.y < .5 && kind == 0.) { if ((t > DR.y - .055 && t < DR.y - .02) || (DOORS > 3. && t > DR.z - .05 && t < DR.z - .02)) { kCol = mix(kCol, vec3(.7), .75); kMetal = .9; kRough = .2; } }
  kCol *= 1. - sm * .85; kRough = mix(kRough, .9, sm);
}
`).replace("#include <color_fragment>", "#include <color_fragment>\ncarShade(); diffuseColor.rgb = kCol;")
      .replace("#include <roughnessmap_fragment>", "float roughnessFactor = kRough;")
      .replace("#include <metalnessmap_fragment>", "float metalnessFactor = kMetal;")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += kEmit;")
      .replace("#include <lights_physical_fragment>", "#include <lights_physical_fragment>\nmaterial.clearcoat *= kClear;");
    mat.userData.shader = sh;
  };
}

/* ---------- ruedas, retrovisores, rueda de repuesto ---------- */
function c3Wheel(THREE, R, Wd, rugged) {
  const g = new THREE.Group(), rim = R * (rugged ? 0.56 : 0.64);
  const prof = []; const N = 22;
  for (let i = 0; i <= N; i++) { const a = -Math.PI / 2 + Math.PI * i / N; prof.push(new THREE.Vector2(rim + (R - rim) * (0.55 + 0.45 * Math.cos(a)) + (i === 0 || i === N ? 0 : 0.012), Wd / 2 * Math.sin(a))); }
  const tire = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), new THREE.MeshStandardMaterial({ color: 0x141414, roughness: .92, metalness: 0 }));
  tire.rotation.x = Math.PI / 2; g.add(tire);
  const rimMat = new THREE.MeshPhysicalMaterial({ color: 0xd9dce0, metalness: .85, roughness: .2, clearcoat: .6, envMapIntensity: 1.4 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1b1d20, metalness: .6, roughness: .45 });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(rim * .98, rim * .98, Wd * .8, 40, 1, true), dark); barrel.rotation.x = Math.PI / 2; g.add(barrel);
  const face = new THREE.Mesh(new THREE.TorusGeometry(rim * .93, rim * .07, 10, 48), rimMat); face.position.z = Wd * .38; g.add(face);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(rim * .62, rim * .62, .02, 32), new THREE.MeshStandardMaterial({ color: 0x8a8d91, metalness: .8, roughness: .5 })); disc.rotation.x = Math.PI / 2; disc.position.z = Wd * .05; g.add(disc);
  const cal = new THREE.Mesh(new THREE.BoxGeometry(rim * .32, rim * .5, .05), new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: .5 })); cal.position.set(rim * .45, rim * .25, Wd * .12); g.add(cal);
  const NS = rugged ? 6 : 5;
  for (let i = 0; i < NS; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(rim * .86, rim * .17, .035), rimMat); const a = i / NS * Math.PI * 2; sp.position.set(Math.cos(a) * rim * .45, Math.sin(a) * rim * .45, Wd * .36); sp.rotation.z = a; g.add(sp);
    const sp2 = sp.clone(); sp2.rotation.z = a + .16; sp2.position.set(Math.cos(a + .16) * rim * .45, Math.sin(a + .16) * rim * .45, Wd * .355); g.add(sp2); }
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(rim * .17, rim * .17, .05, 24), rimMat); cap.rotation.x = Math.PI / 2; cap.position.z = Wd * .38; g.add(cap);
  return g;
}

/* ---------- estudio de luz: reflejos tipo cabina de fotografía ---------- */
function c3Env(THREE, renderer) {
  const s = new THREE.Scene(), B = (c, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k || 1), side: THREE.DoubleSide });
  const room = new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), B(0x1d1f23)); s.add(room);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(19, 48), B(0x2c2d31)); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.3; s.add(floor);
  const hz = new THREE.Mesh(new THREE.CylinderGeometry(17, 17, 1.6, 48, 1, true), B(0xb4bac2, 1.25)); hz.position.y = 1.0; s.add(hz);
  const pl = (w, h, x, y, z, c, k, tx, ty, tz) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), B(c, k)); m.position.set(x, y, z); m.lookAt(tx || 0, ty == null ? 0.5 : ty, tz || 0); s.add(m); };
  pl(14, 1.6, 0, 9, -2.4, 0xffffff, 3.4, 0, 0, -2.4); pl(14, 1.6, 0, 9, 2.4, 0xffffff, 3.4, 0, 0, 2.4); pl(4, 4, 0, 9.5, 0, 0xffffff, 1.4, 0, 0, 0);
  pl(5, 7, 12, 4, 7, 0xfff0dc, 2.4); pl(5, 7, -12, 4, -7, 0xdbe6ff, 2.0); pl(9, 3, -4, 3, 15, 0xffffff, 1.3); pl(9, 3, 6, 3, -15, 0xffffff, 1.1);
  const pm = new THREE.PMREMGenerator(renderer); const tex = pm.fromScene(s, 0.02).texture; pm.dispose(); return tex;
}
function c3ShadowTex(THREE, M) {
  const c = document.createElement("canvas"), CW = 512, CH = 256; c.width = CW; c.height = CH; const x = c.getContext("2d");
  const sx = CW / (M.L * 1.6), sz = CH / (M.W * 2.2), cx = CW / 2, cy = CH / 2, off = 4000;
  const rr = (w, h, r, blur, a) => { x.save(); x.shadowColor = `rgba(0,0,0,${a})`; x.shadowBlur = blur; x.shadowOffsetX = off; x.beginPath();
    const X = cx - w / 2 - off, Y = cy - h / 2; x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); x.fillStyle = "#000"; x.fill(); x.restore(); };
  rr(M.L * sx * 1.02, M.W * sz * 1.0, 40, 46, .55);
  rr(M.L * sx * 0.94, M.W * sz * 0.86, 24, 14, .55);
  M.ax.forEach(a => [1, -1].forEach(sd => { x.save(); x.shadowColor = "rgba(0,0,0,.8)"; x.shadowBlur = 10; x.shadowOffsetX = off; x.beginPath();
    x.ellipse(cx + a * sx - off, cy - sd * (M.half(0.5) - 0.12) * sz, M.R * 0.7 * sx, 0.11 * sz, 0, 0, Math.PI * 2); x.fill(); x.restore(); }));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function c3PaintPM(hex) { const c = parseInt(hex.slice(1), 16), r = (c >> 16 & 255) / 255, g = (c >> 8 & 255) / 255, b = (c & 255) / 255, l = .3 * r + .59 * g + .11 * b;
  return l > .8 ? [.15, .22] : l < .1 ? [.35, .2] : [.62, .3]; }

/* ---------- motor ---------- */
function c3Load() {
  if (C3.three) return Promise.resolve(C3.three);
  return C3.loading || (C3.loading = import("/vendor/three-0160.module.min.js").then(m => (C3.three = m)));
}
function c3WebGL() { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2")); } catch (e) { return false; } }
function c3Build(type, paint, scale) {
  const THREE = C3.three, I = C3.inst, T = C3_TYPES[type] || C3_TYPES.hatch;
  if (I.car) { I.scene.remove(I.car); I.car.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.map) o.material.map.dispose(); }); }
  const M = c3Model(T, scale); I.M = M;
  const car = new THREE.Group();
  const U = { uSev: { value: new Array(13).fill(0) }, uHover: { value: -1 }, uSel: { value: -1 }, uPaint: { value: new THREE.Color(paint) }, uPM: { value: new THREE.Vector2(...c3PaintPM(paint)) }, uTime: { value: 0 } };
  I.U = U;
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: .6, roughness: .3, clearcoat: 1, clearcoatRoughness: .04, envMapIntensity: 1.15 });
  c3PatchMaterial(mat, M, U); mat.customProgramCacheKey = () => "car3-" + type + "-" + M.L.toFixed(3);
  const body = new THREE.Mesh(c3BodyGeometry(THREE, M), mat); car.add(body); I.body = body;
  const Wd = Math.min(0.27, 0.19 + M.W * 0.025) * (T.R > .38 ? 1.08 : 1);
  M.ax.forEach(ax => [1, -1].forEach(sd => {
    const tA = (M.L / 2 - ax) / M.L, w = M.half(tA);
    const wh = c3Wheel(THREE, M.R, Wd, T.clad ? 1 : 0); wh.position.set(ax, M.R, sd * (w + M.F * 0.5 - Wd / 2 + 0.005)); if (sd < 0) wh.rotation.y = Math.PI; car.add(wh);
  }));
  const mirMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(paint), metalness: U.uPM.value.x, roughness: U.uPM.value.y, clearcoat: 1, clearcoatRoughness: .04, envMapIntensity: 1.15 }); I.mirMat = mirMat;
  const blk = new THREE.MeshStandardMaterial({ color: 0x0d0d0e, roughness: .6 });
  const tm = T.cab[0] + 0.035, xm = M.L / 2 - tm * M.L, ym = M.ys(tm) + 0.075, wm = M.half(tm);
  [1, -1].forEach(sd => { const g = new THREE.SphereGeometry(1, 24, 14); g.scale(0.06, 0.06, 0.12); const m = new THREE.Mesh(g, mirMat); m.position.set(xm - 0.02, ym, sd * (wm + 0.085)); m.rotation.y = sd * 0.12; m.userData.zone = sd > 0 ? "pdi" : "pdd"; car.add(m);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.09), blk); arm.position.set(xm + 0.005, ym - 0.025, sd * (wm + 0.02)); car.add(arm); });
  if (T.spare) { const sp = c3Wheel(THREE, M.R * 0.95, Wd, 1); sp.rotation.y = -Math.PI / 2; sp.position.set(-M.L / 2 - Wd / 2 + 0.03, M.yR + M.R * 0.9, 0); car.add(sp); }
  if (T.rails) [1, -1].forEach(sd => { const tr0 = T.cab[1] + 0.03, tr1 = T.cab[2] - 0.02, len = (tr1 - tr0) * M.L, xc = M.L / 2 - (tr0 + tr1) / 2 * M.L, tc = (tr0 + tr1) / 2;
    const r = new THREE.Mesh(new THREE.BoxGeometry(len, 0.035, 0.035), new THREE.MeshStandardMaterial({ color: 0x1a1b1d, metalness: .6, roughness: .35 })); r.position.set(xc, M.hT(tc) + 0.03, sd * (M.wr(tc) - 0.1)); car.add(r);
    [-.45, .45].forEach(q => { const ft = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.035, 0.03), r.material); ft.position.set(xc + q * len, M.hT(tc) + 0.012, sd * (M.wr(tc) - 0.1)); car.add(ft); }); });
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(M.L * 1.6, M.W * 2.2), new THREE.MeshBasicMaterial({ map: c3ShadowTex(THREE, M), transparent: true, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.002; sh.renderOrder = -1; car.add(sh);
  I.scene.add(car); I.car = car;
  const H = Math.max(...T.top.map(p => p[1]));
  I.target.set(0, H * 0.4, 0);
  I.span = [M.L * 0.86 + M.W * 0.55, H * 1.3]; c3Fit(true);
  c3ApplySev(); I.dirty = true;
}
function c3ApplySev() {
  const I = C3.inst; if (!I || !I.U) return;
  const pan = (I.opts && I.opts.panels) || {};
  I.U.uSev.value = C3_ZONES.map(z => +pan[z] || 0);
  I.dirty = true;
}
function c3Init(stage, opts) {
  const THREE = C3.three;
  if (!C3.inst) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    scene.environment = c3Env(THREE, renderer);
    const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(4, 8, 5); scene.add(key);
    scene.add(new THREE.HemisphereLight(0xdfe7ff, 0x202020, 0.35));
    C3.inst = { renderer, scene, camera, target: new THREE.Vector3(), ray: new THREE.Raycaster(), dirty: true, t0: performance.now(), tween: null, idle: 0 };
    c3Loop();
  }
  const I = C3.inst; I.opts = opts; I.stage = stage;
  const cv = I.renderer.domElement; cv.className = "c3cv"; stage.querySelector(".c3view").appendChild(cv);
  const key = opts.type + "|" + opts.paint + "|" + opts.scale;
  if (I.key !== key) { I.key = key; c3Build(opts.type, opts.paint, opts.scale); } else c3ApplySev();
  c3Resize(); c3Bind(stage);
  if (!I.ro) { I.ro = new ResizeObserver(() => c3Resize()); } I.ro.disconnect(); I.ro.observe(stage.querySelector(".c3view"));
  if (!I.intro) { I.intro = 1; C3.cam.az = 2.1; c3Tween({ az: 0.72, el: 0.2, dist: I.baseDist }, 1600); }
}
function c3Fit(reset) { const I = C3.inst; if (!I || !I.span) return; const tv = Math.tan(I.camera.fov * Math.PI / 360), a = I.camera.aspect || 1.5;
  const d = Math.max(I.span[0] * 0.53 / (tv * a), I.span[1] * 0.62 / tv), old = I.baseDist; I.baseDist = d;
  if (reset || !old) C3.cam.dist = d; else { const k = d / old; C3.cam.dist *= k; if (I.tween) { I.tween.from.dist *= k; I.tween.to.dist *= k; } }
  I.dirty = true; }
function c3Resize() { const I = C3.inst; if (!I || !I.stage) return; const v = I.stage.querySelector(".c3view"); if (!v) return; const w = v.clientWidth, h = v.clientHeight; if (!w || !h) return; I.renderer.setSize(w, h, false); I.camera.aspect = w / h; I.camera.updateProjectionMatrix(); c3Fit(false); I.dirty = true; }
function c3Tween(to, ms) { const I = C3.inst; I.tween = { from: Object.assign({}, C3.cam), to: Object.assign({}, C3.cam, to), t0: performance.now(), ms: ms || 700 };
  let d = I.tween.to.az - I.tween.from.az; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; I.tween.to.az = I.tween.from.az + d; }
function c3Loop() {
  const I = C3.inst; if (!I) return;
  requestAnimationFrame(c3Loop);
  if (!I.stage || !document.body.contains(I.renderer.domElement)) return;
  const now = performance.now();
  if (I.tween) { const k = Math.min(1, (now - I.tween.t0) / I.tween.ms), e = 1 - Math.pow(1 - k, 3); ["az", "el", "dist"].forEach(p => C3.cam[p] = I.tween.from[p] + (I.tween.to[p] - I.tween.from[p]) * e); if (k >= 1) I.tween = null; I.dirty = true; }
  else if (I.opts && I.opts.auto && now - (I.lastUser || 0) > 5000) { C3.cam.az += 0.0018; I.dirty = true; }
  const anim = I.U && (I.U.uHover.value >= 0 || I.U.uSel.value >= 0);
  if (anim) { I.U.uTime.value = (now - I.t0) / 1000; I.dirty = true; }
  if (!I.dirty) return; I.dirty = false;
  const c = C3.cam, cam = I.camera, tg = I.target;
  cam.position.set(tg.x + c.dist * Math.cos(c.el) * Math.cos(c.az), tg.y + c.dist * Math.sin(c.el), tg.z + c.dist * Math.cos(c.el) * Math.sin(c.az));
  cam.lookAt(tg); I.renderer.render(I.scene, cam);
}
function c3Pick(e) {
  const I = C3.inst, cv = I.renderer.domElement, r = cv.getBoundingClientRect();
  const v = new C3.three.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  I.ray.setFromCamera(v, I.camera);
  const hits = I.ray.intersectObjects(I.car.children.filter(o => o.isMesh && (o === I.body || o.userData.zone)), false);
  if (!hits.length) return null;
  const h = hits[0]; if (h.object.userData.zone) return h.object.userData.zone;
  return c3ZoneAt(I.M, h.point, h.face.normal);
}
function c3Bind(stage) {
  const I = C3.inst, cv = I.renderer.domElement, tip = stage.querySelector(".c3tip");
  if (cv.__b) { cv.__stage = stage; return; } cv.__b = 1; cv.__stage = stage;
  const pts = new Map(); let drag = null, moved = 0, pinch = 0;
  cv.addEventListener("pointerdown", e => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); drag = { x: e.clientX, y: e.clientY, az: C3.cam.az, el: C3.cam.el }; moved = 0; if (cv.__stage) cv.__stage.classList.add("used"); I.lastUser = performance.now(); I.tween = null; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); } });
  cv.addEventListener("pointermove", e => {
    const st = cv.__stage, tp = st && st.querySelector(".c3tip");
    if (pts.has(e.pointerId)) pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 2) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) { C3.cam.dist = Math.max(I.baseDist * .45, Math.min(I.baseDist * 1.8, C3.cam.dist * pinch / d)); I.dirty = true; } pinch = d; moved = 9; return; }
    if (drag && pts.size === 1) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
      if (moved > 4) { C3.cam.az = drag.az + dx * 0.008; C3.cam.el = Math.max(-0.05, Math.min(1.35, drag.el + dy * 0.006)); I.dirty = true; if (tp) tp.hidden = true; return; } }
    if (e.pointerType === "mouse" && !drag) { const z = c3Pick(e), zi = z ? C3_ZONES.indexOf(z) : -1; if (I.U.uHover.value !== zi) { I.U.uHover.value = zi; I.dirty = true; }
      cv.style.cursor = z ? "pointer" : "grab";
      if (tp) { if (z) { const r = st.getBoundingClientRect(), sv = +((I.opts.panels || {})[z] || 0); tp.hidden = false; tp.innerHTML = `<b>${esc(c3PanelName(z))}</b><span class="c3s s${sv}">${SEV[sv]}</span>`; tp.style.transform = `translate(${e.clientX - r.left + 14}px,${e.clientY - r.top + 14}px)`; } else tp.hidden = true; } }
  });
  const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; if (drag && moved < 5 && e.type === "pointerup") { const z = c3Pick(e); if (z && cv.__stage) c3Popover(cv.__stage, z, e); } if (!pts.size) drag = null; };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  cv.addEventListener("pointerleave", () => { if (I.U && I.U.uHover.value !== -1) { I.U.uHover.value = -1; I.dirty = true; } const tp = cv.__stage && cv.__stage.querySelector(".c3tip"); if (tp) tp.hidden = true; });
  cv.addEventListener("wheel", e => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); I.lastUser = performance.now(); C3.cam.dist = Math.max(I.baseDist * .45, Math.min(I.baseDist * 1.8, C3.cam.dist * (1 + Math.sign(e.deltaY) * 0.08))); I.dirty = true; }, { passive: false });
  cv.addEventListener("dblclick", () => c3Tween({ az: 0.72, el: 0.2, dist: I.baseDist }, 700));
}
function c3PanelName(z) { const p = PANELS.find(x => x[0] === z); return p ? p[1] : z; }
function c3Popover(stage, z, e) {
  const I = C3.inst; if (!I.opts.interactive) { return; }
  const pop = stage.querySelector(".c3pop"), r = stage.getBoundingClientRect(), cur = +((I.opts.panels || {})[z] || 0);
  I.U.uSel.value = C3_ZONES.indexOf(z); I.dirty = true;
  pop.innerHTML = `<div class="c3pop-h"><b>${esc(c3PanelName(z))}</b><button type="button" class="c3x" aria-label="Cerrar">${ic("x", "sm")}</button></div>
    <div class="c3sevs">${SEV.map((s, i) => `<button type="button" data-c3s="${i}" class="${cur === i ? "on" : ""}"><i class="c3d s${i}"></i>${s}</button>`).join("")}</div>`;
  pop.hidden = false;
  const x = Math.min(r.width - 230, Math.max(8, e.clientX - r.left - 110)), y = Math.min(r.height - 230, Math.max(8, e.clientY - r.top + 12));
  pop.style.transform = `translate(${x}px,${y}px)`;
  const close = () => { pop.hidden = true; I.U.uSel.value = -1; I.dirty = true; };
  pop.querySelector(".c3x").onclick = close;
  $$("[data-c3s]", pop).forEach(b => b.onclick = () => { const v = +b.dataset.c3s; I.opts.onSet && I.opts.onSet(z, v); close(); });
}

/* ---------- escenario (HTML) ---------- */
function c3Stage(opts) {
  const d = opts.det, T = C3_TYPES[d.type] || C3_TYPES.hatch;
  return `<div class="c3" id="c3Stage" data-rev>
    <div class="c3view"><div class="c3load"><span class="spin"></span><small>Preparando el modelo 3D…</small></div></div>
    <div class="c3top">
      ${opts.interactive ? `<label class="c3type">${ic("car", "sm")}<select id="c3Type" aria-label="Carrocería">${C3_ORDER.map(k => `<option value="${k}" ${k === d.type ? "selected" : ""}>${C3_TYPES[k].name}</option>`).join("")}</select></label>
      ${d.by ? `<span class="c3by">${ic("spark", "sm")}Reconocido: <b>${esc(d.label || d.by)}</b></span>` : ""}` : `<span class="c3by">${ic("car", "sm")}${esc(T.name)}</span>`}
    </div>
    <div class="c3views" role="group" aria-label="Vistas">${[["34", "3D"], ["front", "Frente"], ["left", "Izquierda"], ["right", "Derecha"], ["rear", "Detrás"], ["top", "Arriba"]].map(([k, t]) => `<button type="button" data-c3v="${k}">${t}</button>`).join("")}</div>
    ${opts.interactive ? `<div class="c3paint" role="radiogroup" aria-label="Color">${C3_PAINTS.map(([n, c]) => `<button type="button" data-c3p="${c}" title="${n}" aria-label="${n}" class="${c === opts.paint ? "on" : ""}" style="--c:${c}"></button>`).join("")}</div>` : ""}
    <div class="c3hint">${ic("refresh", "sm")}${opts.interactive ? "Arrastra para girar · toca una pieza para marcar el daño" : "Arrastra para girar"}</div>
    <div class="c3tip" hidden></div><div class="c3pop" hidden></div>
  </div>`;
}
function c3Mount(stage, opts) {
  if (!stage) return;
  c3Load().then(() => {
    if (!document.body.contains(stage)) return;
    const ld = stage.querySelector(".c3load"); if (ld) ld.remove();
    c3Init(stage, opts);
    $$("[data-c3v]", stage).forEach(b => b.onclick = () => { const I = C3.inst, V = { "34": { az: .72, el: .2 }, front: { az: 0, el: .1 }, left: { az: Math.PI / 2, el: .08 }, right: { az: -Math.PI / 2, el: .08 }, rear: { az: Math.PI, el: .12 }, top: { az: Math.PI / 2, el: 1.3 } }[b.dataset.c3v];
      I.lastUser = performance.now(); c3Tween(Object.assign({ dist: I.baseDist }, V), 800); $$("[data-c3v]", stage).forEach(x => x.classList.toggle("on", x === b)); });
    $$("[data-c3p]", stage).forEach(b => b.onclick = () => { opts.paint = b.dataset.c3p; opts.onPaint && opts.onPaint(opts.paint); const I = C3.inst; I.U.uPaint.value.set(opts.paint); I.mirMat.color.set(opts.paint); I.key = opts.type + "|" + opts.paint + "|" + opts.scale; I.dirty = true; $$("[data-c3p]", stage).forEach(x => x.classList.toggle("on", x === b)); });
    const ts = stage.querySelector("#c3Type"); if (ts) ts.onchange = () => { opts.type = ts.value; opts.onType && opts.onType(ts.value); C3.inst.key = null; c3Init(stage, opts); const by = stage.querySelector(".c3by"); if (by) by.remove(); };
  }).catch(err => { console.error("3D:", err); const v = stage.querySelector(".c3view"); if (v) v.innerHTML = `<div class="c3load"><small>No se pudo cargar el 3D. Usa la lista de paneles.</small></div>`; });
}

/* ---------- publicar: paso de condición ---------- */
(function patchPublish3D() {
  const v = viewPublish;
  viewPublish = function () {
    let h = v.apply(this, arguments);
    if (PUB.step !== 1 || !c3WebGL()) return h;
    if (/Náutica|Maquinaria/.test(PUB.mcat || "")) return h;
    const det = c3Detect(PUB.make, PUB.model, PUB.mcat === "Motocicletas" ? "moto" : PUB.mcat === "Transporte pesado" ? "camion" : "");
    if (det.type === "moto") return h;
    if (PUB.body3d) det.type = PUB.body3d, det.by = det.by && PUB.body3d === c3Detect(PUB.make, PUB.model).type ? det.by : null;
    det.label = `${PUB.make || ""} ${PUB.model || ""}`.trim(); PUB.paint = PUB.paint || "#b9bdc2";
    h = h.replace("Toca el mapa o usa la lista.", "Toca el modelo 3D o usa la lista.");
    return h.replace(/<div class="cond" style="grid-template-columns:180px 1fr"><div class="carmap">[\s\S]*?<\/svg><\/div>/, `<div class="cond cond3d">${c3Stage({ det, interactive: true, paint: PUB.paint })}`);
  };
  patchRoute(/^\/publicar$/, () => {
    const st = $("#c3Stage");
    if (!st) { if (PUB.step === 0 && c3WebGL()) setTimeout(() => c3Load().catch(() => {}), 2500); return; }
    const det = c3Detect(PUB.make, PUB.model, PUB.mcat === "Transporte pesado" ? "camion" : ""); const type = PUB.body3d || det.type;
    const setSev = (z, val) => {
      if (val) PUB.panels[z] = val; else delete PUB.panels[z];
      const row = $(`[data-prow="${z}"]`); if (row) $$("button", row).forEach(b => b.classList.toggle("on", +b.dataset.s === val));
      const sc = $("#pScore"); if (sc) { sc.textContent = scoreOf(PUB.panels); const n = sc.nextElementSibling; if (n) n.textContent = `/100 · ${Object.keys(PUB.panels).filter(k => PUB.panels[k]).length}/15 paneles con daño`; }
      c3ApplySev();
    };
    const opts = { type, paint: PUB.paint || "#b9bdc2", scale: c3Size(PUB.make, PUB.model, type), panels: PUB.panels, interactive: true, auto: false,
      onSet: setSev, onPaint: c => { PUB.paint = c; }, onType: t => { PUB.body3d = t; opts.scale = c3Size(PUB.make, PUB.model, t); } };
    c3Mount(st, opts);
    /* la lista también actualiza el 3D sin recargar la página */
    $$("[data-prow]").forEach(row => $$("button", row).forEach(b => b.onclick = e => { e.stopPropagation(); setSev(row.dataset.prow, +b.dataset.s); }));
  });
})();

/* ---------- ficha de subasta: el mismo 3D en modo lectura ---------- */
patchRoute(/^\/subasta\/([\w-]+)$/, (q, m) => {
  const l = lots.find(x => x.id === m[1]); const map = $("#app .carmap"); if (!l || !map || !c3WebGL()) return;
  const det = c3Detect(l.make || "", l.model || l.title || "", l.body || "");
  if (det.type === "moto") return;
  const host = document.createElement("div"); host.innerHTML = c3Stage({ det, interactive: false, paint: "#b9bdc2" }); const st = host.firstElementChild; st.classList.add("c3ro");
  map.replaceWith(st); const cond = st.closest(".cond"); if (cond) cond.classList.add("cond3d");
  const go = () => c3Mount(st, { type: det.type, paint: "#b9bdc2", scale: c3Size(l.make, l.model, det.type), panels: l.panels || {}, interactive: false, auto: true });
  if (!("IntersectionObserver" in window)) return go();
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); go(); } }, { rootMargin: "300px" }); io.observe(st);
});
