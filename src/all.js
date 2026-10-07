"use strict";
/* ---------- icons ---------- */
const P = {
  home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
  gavel:'<path d="M14 13l-8 8"/><path d="M13 4l7 7"/><path d="M9 8l7 7"/><path d="M11 6l6 6-3 3-6-6z"/><path d="M4 22h8"/>',
  store:'<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9h16v2a3 3 0 0 1-5.3 1.9A3 3 0 0 1 12 14a3 3 0 0 1-2.7-1.1A3 3 0 0 1 4 11z"/><path d="M5 13v7h14v-7"/>',
  building:'<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1"/>',
  car:'<path d="M5 16H3v-4l2-5h14l2 5v4h-2"/><circle cx="7.5" cy="16.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/><path d="M9.5 16.5h5M3 12h18"/>',
  bell:'<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  gauge:'<path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l4-5"/>',
  pin:'<path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  fuel:'<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M3 21h12M4 10h10M14 8l3 2v7a1.5 1.5 0 0 0 3 0V9l-3-3"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  check:'<path d="M5 12l5 5 9-10"/>',
  chev:'<path d="M6 9l6 6 6-6"/>',
  left:'<path d="M15 6l-6 6 6 6"/>',
  right:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff:'<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.7M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 4.4-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  wrench:'<path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8"/><path d="M14.7 6.3L13 4.6a4 4 0 0 0-5.4 5.4L3 14.6 6.4 18"/>',
  alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5v.5"/>',
  recycle:'<path d="M7 19H4.5a1.5 1.5 0 0 1-1.3-2.3L5.5 13"/><path d="M11 19h8.5a1.5 1.5 0 0 0 1.3-2.3l-1.6-2.7"/><path d="M14 16l-3 3 3 3M8.3 6.6l1.4-2.3a1.5 1.5 0 0 1 2.6 0L14 7"/><path d="M5.5 13L4 9.5 7.5 9"/><path d="M17 9l-1.5-3.5L19 5"/>',
  bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M22 20a7 7 0 0 0-4-6.3"/>',
  upload:'<path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 16v4h16v-4"/>',
  chart:'<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  euro:'<path d="M17 6a7 7 0 1 0 0 12"/><path d="M4 10h9M4 14h9"/>',
  doc:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  truck:'<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  msg:'<path d="M4 5h16v11H9l-5 4z"/>',
  logout:'<path d="M10 4H5v16h5"/><path d="M15 8l4 4-4 4M19 12H9"/>',
  spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  refresh:'<path d="M20 11a8 8 0 0 0-14.9-3M4 13a8 8 0 0 0 14.9 3"/><path d="M4 4v4h4M20 20v-4h-4"/>',
  flame:'<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-9-1 2-2 3-3 3 0-2-1-4-3-6 0 4-4 6-4 12a7 7 0 0 0 7 7z"/>',
  scale:'<path d="M12 3v18M5 21h14M6 7h12"/><path d="M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  robot:'<rect x="5" y="8" width="14" height="11" rx="2"/><path d="M12 4v4M9 13h.01M15 13h.01M9 16h6"/>',
  share:'<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>',
};
const ic = (n, c = "") => `<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ""}</svg>`;

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const eur = n => "€" + Math.round(n).toLocaleString(window.NUMLOC || "es-ES");
const num = n => Math.round(n).toLocaleString(window.NUMLOC || "es-ES");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem("ms_" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("ms_" + k, JSON.stringify(v)); } catch (e) {} }
};
const MIN = 60000, HOUR = 60 * MIN;
const now = () => Date.now();
function fmtLeft(ms) {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
  const p = v => String(v).padStart(2, "0");
  return (d ? d + "d " : "") + p(h) + ":" + p(m) + ":" + p(x);
}
function ago(t) {
  const m = Math.round((now() - t) / MIN);
  if (m < 1) return "ahora";
  if (m < 60) return "hace " + m + " min";
  const h = Math.round(m / 60);
  if (h < 24) return "hace " + h + " h";
  return "hace " + Math.round(h / 24) + " d";
}
function toast(msg, icon = "check") {
  const t = document.createElement("div");
  t.className = "toast"; t.setAttribute("role", "status");
  t.innerHTML = ic(icon) + "<span>" + msg + "</span>";
  $("#toasts").appendChild(t);
  setTimeout(() => t.remove(), 3600);
}

/* ---------- catalog ---------- */
const CATS = {
  limpio: { name: "Vehículos Limpios", short: "Limpio", chip: "ok", icon: "shield", desc: "Estado funcional, título limpio. Pueden tener defectos menores.", session: "11:00 – 13:00" },
  danado: { name: "Vehículos Dañados", short: "Dañado", chip: "warn", icon: "wrench", desc: "Daños reparables. Ideales para taller o reventa.", session: "13:00 – 15:00" },
  siniestro: { name: "Siniestro / Desguace", short: "Siniestro", chip: "bad", icon: "alert", desc: "Siniestro total, inundados o para piezas.", session: "15:00 – 16:00" },
  oculta: { name: "Ofertas Ocultas", short: "Premium", chip: "vip", icon: "eyeoff", desc: "Lotes exclusivos para suscriptores Dealer.", session: "11:00 – 16:00" },
};
const PANELS = [
  ["pdel", "Parachoques delantero"], ["capo", "Capó"], ["techo", "Techo"], ["male", "Maletero"], ["ptra", "Parachoques trasero"],
  ["pdi", "Puerta del. izq."], ["pdd", "Puerta del. der."], ["pti", "Puerta tras. izq."], ["ptd", "Puerta tras. der."],
  ["adi", "Aleta del. izq."], ["add", "Aleta del. der."], ["ati", "Aleta tras. izq."], ["atd", "Aleta tras. der."],
  ["int", "Interior"], ["mec", "Mecánica"],
];
const SEV = ["Sin daños", "Estético", "Leve", "Moderado", "Severo"];
const SEVW = [0, 1, 3, 6, 10];
const scoreOf = d => Math.max(0, 100 - Object.values(d || {}).reduce((a, s) => a + SEVW[s], 0));

const BIDDERS = ["Talleres Llorca", "AutoExport Ruse", "Compraventa Elx", "Desguaces Segura", "Dealer #2231", "Motor Benidorm", "Pujador #0817", "Recambios Murcia", "Flota Levante", "Pujador #1190"];

// o = minutes offset for start, dur = duration in minutes
const RAW = [
  ["bmw-330ci", 2005, "BMW", "330Ci Cabrio", 329000, "Gasolina", "Manual", "El Prat", "Barcelona", "limpio", 500, "6892 CFX", 231, "Descapotable", -70, 95, {}, true],
  ["renault-clio", 2019, "Renault", "Clio V 1.0 TCe", 88400, "Gasolina", "Manual", "Bilbao", "Bizkaia", "limpio", 4200, "6123 LJR", 90, "Compacto", -50, 64, {pdel:1}, false],
  ["opel-astra", 2009, "Opel", "Astra 1.7 CDTi", 232388, "Diésel", "Manual", "El Campello", "Alicante", "limpio", 490, "2347 KHT", 110, "Compacto", -30, 180, {pdi:1,int:1}, true],
  ["renault-traffic", 2005, "Renault", "Trafic 1.9 dCi 9 plazas", 481000, "Diésel", "Manual", "Sevilla", "Sevilla", "limpio", 500, "2087 FKT", 100, "Furgoneta", 45, 120, {pdel:2,add:1,mec:2}, true],
  ["opel-corsa-verde", 2003, "Opel", "Corsa 1.2", 129000, "Gasolina", "Manual", "Murcia", "Murcia", "limpio", 350, "8346 BVC", 75, "Compacto", 60, 120, {capo:1,techo:1,pdd:1}, true],
  ["toyota-yaris", 2015, "Toyota", "Yaris Hybrid", 129050, "Híbrido", "Automático", "Zaragoza", "Zaragoza", "danado", 1900, "••••", 100, "Compacto", -40, 58, {pdel:3,add:3,capo:2}, false],
  ["bmw-325xi", 2016, "BMW", "325xi Touring", 222000, "Diésel", "Automático", "Hospitalet", "Barcelona", "danado", 490, "8432 KMG", 218, "Familiar", -20, 27, {pdel:4,capo:4,adi:3,techo:2,mec:3}, true],
  ["ford-transit", 2014, "Ford", "Transit 2.2 TDCi", 464000, "Diésel", "Manual", "Torremolinos", "Málaga", "danado", 807, "4827 KDV", 125, "Furgoneta", -15, 130, {pdel:3,add:4,pdd:3}, true],
  ["mercedes-s", 2018, "Mercedes-Benz", "S 350 d", 178000, "Diésel", "Automático", "Finestrat", "Alicante", "danado", 9000, "7321 KJR", 286, "Berlina", 90, 120, {pdel:4,adi:4,capo:3,pdi:2}, false],
  ["suzuki-jimny", 2021, "Suzuki", "Jimny 1.5 AllGrip", 38000, "Gasolina", "Manual", "Córdoba", "Córdoba", "danado", 2800, "••••", 102, "Todoterreno", 120, 120, {techo:4,pdi:3,pdel:3,capo:3}, true],
  ["peugeot-307", 2006, "Peugeot", "307 1.6 HDi", 191000, "Diésel", "Manual", "Granada", "Granada", "danado", 340, "0712 FVR", 110, "Compacto", 150, 120, {techo:4,pdi:4,capo:2,adi:3}, true],
  ["mercedes-e-quemado", 2015, "Mercedes-Benz", "E 220 Cabrio", 189000, "Diésel", "Automático", "Palma", "Illes Balears", "siniestro", 600, "4564 JBT", 170, "Descapotable", -10, 16, {pdel:4,capo:4,techo:4,int:4,mec:4,pdi:4,pdd:4}, true],
  ["seat-ibiza", 2016, "SEAT", "Ibiza 1.0 TSI", 89000, "Gasolina", "Manual", "Paterna", "Valencia", "siniestro", 580, "1948 JXH", 95, "Compacto", 240, 60, {int:4,mec:4,pdel:3,capo:2}, true],
  ["bmw-320i", 1993, "BMW", "320i E36", 235000, "Gasolina", "Manual", "Paterna", "Valencia", "siniestro", 35, "B 8724 NV", 150, "Berlina", 240, 60, {pdel:4,capo:4,techo:4,male:4,int:4,mec:4}, true],
  ["bmw-m3", 1988, "BMW", "M3 E30", 88000, "Gasolina", "Manual", "Calpe", "Alicante", "oculta", 29000, "M-3 E30", 200, "Coupé", -25, 150, {pdel:1}, false],
];
const DESC = {
  limpio: "Vehículo en estado funcional, arranca y circula. Documentación en regla y título limpio. Revisado por nuestro equipo: los defectos declarados se reflejan en el mapa de condición.",
  danado: "Vehículo con daños estructurales o de carrocería reparables. Ideal para talleres y compraventas. Consulta el mapa de condición y las fotos antes de pujar.",
  siniestro: "Siniestro total declarado por la aseguradora. Venta orientada a desguace, recuperación de piezas o exportación. Sin garantía de funcionamiento.",
  oculta: "Lote exclusivo de colección. Solo visible para suscriptores Dealer y Combinado Full. Historial completo y libro de mantenimiento disponibles.",
};

const T0 = now();
const lots = RAW.map((r, i) => {
  const [img, year, make, model, km, fuel, trans, city, prov, cat, start, plate, cv, body, o, dur, panels, noReserve] = r;
  const startsAt = T0 + o * MIN, endsAt = startsAt + dur * MIN;
  const live = startsAt <= T0;
  const nb = live ? 3 + (i * 7) % 9 : 0;
  let cur = start, hist = [];
  for (let k = 0; k < nb; k++) {
    cur += inc(cur);
    hist.unshift({ who: BIDDERS[(i + k * 3) % BIDDERS.length], amt: cur, t: startsAt + (k + 1) * (Math.max(1, -o) / (nb + 1)) * MIN });
  }
  return {
    id: "L" + (412 + i * 7), img, year, make, model, title: `${year} ${make} ${model}`, km, fuel, trans, city, prov, cat, start, plate, cv, body,
    startsAt, endsAt, panels, noReserve, hist, watchers: 8 + (i * 13) % 40,
    vin: ("WBA" + (img.length * 7919 + i * 104729).toString(36).toUpperCase() + "K" + (year % 100) + "0" + i + "7Z").slice(0, 17).padEnd(17, "3"),
    buyNow: cat === "limpio" && i % 2 ? Math.round(start * 3.2 / 100) * 100 : null,
    keys: !["mercedes-e-quemado", "bmw-320i"].includes(img), runs: cat !== "siniestro" && img !== "bmw-325xi",
  };
});
function inc(v) { return v < 1000 ? 25 : v < 5000 ? 50 : v < 15000 ? 100 : 250; }
const curPrice = l => l.hist.length ? l.hist[0].amt : l.start;
const statusOf = l => now() < l.startsAt ? "soon" : now() < l.endsAt ? "live" : "end";

const market = [
  { id: "M1", img: "honda-cbr", title: "Honda CBR600RR", year: 2011, km: 89655, fuel: "Gasolina", trans: "Manual", city: "Calpe", cat: "danado", type: "Motocicletas", price: 3900, neg: true, seller: "MS Seller", days: 4 },
  { id: "M2", img: "daf-cf", title: "DAF CF 85.460", year: 2017, km: 560900, fuel: "Diésel", trans: "Automático", city: "Elche", cat: "danado", type: "Transporte pesado", price: 18500, neg: true, seller: "Flota Levante", days: 9 },
  { id: "M3", img: "honda-civic", title: "Honda Civic 1.0 VTEC", year: 2019, km: 98500, fuel: "Gasolina", trans: "Manual", city: "Madrid", cat: "danado", type: "Vehículos ligeros", price: 5600, neg: false, seller: "Particular", days: 2 },
  { id: "M4", img: "opel-astra", title: "Opel Astra 1.7 CDTi", year: 2009, km: 232388, fuel: "Diésel", trans: "Manual", city: "El Campello", cat: "limpio", type: "Vehículos ligeros", price: 3900, neg: true, seller: "Compraventa Elx", days: 12 },
  { id: "M5", img: "renault-clio", title: "Renault Clio V TCe 90", year: 2019, km: 88400, fuel: "Gasolina", trans: "Manual", city: "Bilbao", cat: "limpio", type: "Vehículos ligeros", price: 9800, neg: true, seller: "Renting Norte", days: 1 },
  { id: "M6", img: "renault-traffic", title: "Renault Trafic Combi 9", year: 2005, km: 481000, fuel: "Diésel", trans: "Manual", city: "Sevilla", cat: "limpio", type: "Vehículos ligeros", price: 4500, neg: false, seller: "Particular", days: 6 },
];

/* buyer fee table (from original tarifas; tiers under 2.000 € are placeholders) */
const FEES = [[0, 999, 129], [1000, 1999, 179], [2000, 3999, 219], [4000, 5999, 279], [6000, 7999, 319], [8000, 9999, 359], [10000, 12999, 399], [13000, 15999, 459]];
const buyerFee = p => { const t = FEES.find(f => p >= f[0] && p <= f[1]); return t ? t[2] : p * 0.028; };
const GESTORIA = [["Transferencia vehículo estándar", 149], ["Transferencia cliente final (IGIC/IPSI)", 199], ["Baja tráfico", 129], ["Transferencia a tercero", 109], ["Gestión DUA + transporte interinsular", 229], ["Duplicado permiso / ficha técnica", 89], ["Gestiones adicionales", 69], ["Informe DGT", 15], ["Reforma vehículo", 49], ["Levantamiento reserva dominio", 59]];
const TRANSPORT = { "Alicante": 90, "Valencia": 160, "Murcia": 140, "Madrid": 290, "Barcelona": 380, "Sevilla": 420, "Málaga": 390, "Bizkaia": 520, "Zaragoza": 360, "Granada": 330, "Córdoba": 380, "Illes Balears": 340 };

/* ---------- state ---------- */
const S = {
  favs: new Set(store.get("favs", ["L419", "L461"])),
  myBids: store.get("mybids", {}),       // lotId -> my max placed
  auto: store.get("auto", {}),           // lotId -> max autobid
  notes: [
    { t: T0 - 4 * MIN, txt: "Tu puja en <b>2016 BMW 325xi</b> sigue siendo la más alta.", icon: "gavel", unread: true },
    { t: T0 - 38 * MIN, txt: "La sesión <b>Vehículos Dañados</b> empieza hoy a las 13:00.", icon: "clock", unread: true },
    { t: T0 - 5 * HOUR, txt: "Oferta directa recibida para <b>2015 Toyota Yaris</b>: 2.350 €.", icon: "bolt", unread: false },
  ],
  theme: store.get("theme", null),
  plan: store.get("plan", "Comprador Pro"),
  settings: store.get("settings", { comments: false, qa: true, mkmsg: true, mkmod: false, antisnipe: true, hidden: true, veriff: true }),
  offers: [
    { id: 1, img: "bmw-325xi", title: "2015 Volkswagen Beetle", km: 190470, seller: "MS Seller", mail: "bekksell@gmail.com", loc: "Calpe, Alicante", d: 6, ask: 1500, st: "new" },
    { id: 2, img: "toyota-yaris", title: "2015 Toyota Yaris Hybrid", km: 129050, seller: "Vendedor venta", mail: "vincheckspain@gmail.com", loc: "Zaragoza", d: 12, ask: 2600, st: "new" },
    { id: 3, img: "opel-astra", title: "2009 Opel Astra", km: 232388, seller: "Vendedor venta", mail: "vincheckspain@gmail.com", loc: "El Campello, Alicante", d: 22, ask: 1200, st: "new" },
    { id: 4, img: "suzuki-jimny", title: "2021 Suzuki Jimny", km: 38000, seller: "Autos Finestrat", mail: "ventas@autosfinestrat.es", loc: "Finestrat, Alicante", d: 1, ask: 7400, st: "new" },
    { id: 5, img: "opel-corsa-verde", title: "2003 Opel Corsa", km: 129000, seller: "Particular", mail: "j.martinez@correo.es", loc: "Murcia", d: 3, ask: 600, st: "new" },
  ],
  users: [
    { mail: "buyer@test.com", co: "—", role: "Comprador", st: "pend", d: "26/04/2026" },
    { mail: "ventas@autosfinestrat.es", co: "Autos Finestrat S.L.", role: "Vendedor", st: "pend", d: "14/09/2026" },
    { mail: "compras@talleresllorca.es", co: "Talleres Llorca", role: "Dealer", st: "pend", d: "15/09/2026" },
    { mail: "vincheckspain@gmail.com", co: "VIN Check Spain", role: "Vendedor", st: "ok", d: "02/05/2026" },
    { mail: "bekksell@gmail.com", co: "MS Seller", role: "Vendedor", st: "ok", d: "19/04/2026" },
    { mail: "export@autoexportruse.bg", co: "AutoExport Ruse", role: "Dealer", st: "ok", d: "08/06/2026" },
    { mail: "spam.bidder@mail.xyz", co: "—", role: "Comprador", st: "blk", d: "01/07/2026" },
  ],
};
S.notesUnread = () => S.notes.filter(n => n.unread).length;
function saveBids() { store.set("mybids", S.myBids); store.set("auto", S.auto); }

/* ---------- theme ---------- */
function applyTheme() {
  const r = document.documentElement;
  if (S.theme) r.setAttribute("data-theme", S.theme);
  const dark = S.theme ? S.theme === "dark" : !matchMedia("(prefers-color-scheme: light)").matches;
  $("#themeBtn").innerHTML = ic(dark ? "sun" : "moon");
}
$("#themeBtn").onclick = () => {
  const dark = S.theme ? S.theme === "dark" : !matchMedia("(prefers-color-scheme: light)").matches;
  S.theme = dark ? "light" : "dark"; store.set("theme", S.theme); applyTheme();
};

/* ---------- header ---------- */
const NAV = [["#/", "Inicio", "home"], ["#/subastas", "Subastas", "gavel"], ["#/mercado", "Mercado", "store"], ["#/precios", "Precios", "euro"], ["#/empresa", "Empresa", "building"], ["#/admin", "Admin", "shield"]];
function renderHeader(path) {
  const liveN = lots.filter(l => statusOf(l) === "live").length;
  const html = NAV.map(([h, t, i]) => {
    const on = h === "#/" ? path === "/" : path.startsWith(h.slice(1).replace(/s$/, ""));
    return `<a href="${h}" class="${on ? "on" : ""}">${ic(i, "sm")}${t}${t === "Subastas" && liveN ? '<span class="live-dot" title="Subastas en vivo"></span>' : ""}</a>`;
  }).join("");
  $("#nav").innerHTML = html;
  $("#mnav").innerHTML = html + `<a href="#/valoracion">${ic("car", "sm")}Valoración gratuita</a><a href="#/publicar">${ic("upload", "sm")}Publicar vehículo</a>`;
  $("#valBtn").innerHTML = ic("car", "sm") + "Valoración";
  $("#favBtn").innerHTML = ic("heart") + (S.favs.size ? `<span class="badge-n">${S.favs.size}</span>` : "");
  const u = S.notesUnread();
  $("#bellBtn").innerHTML = ic("bell") + (u ? `<span class="badge-n">${u}</span>` : "");
  $("#burger").innerHTML = ic("menu");
}
$("#burger").onclick = () => { $("#mnav").hidden = !$("#mnav").hidden; };
$("#userBtn").onclick = e => {
  e.stopPropagation();
  const m = $("#userMenu");
  m.innerHTML = `<div style="padding:8px 10px 10px;border-bottom:1px solid var(--line);margin-bottom:4px"><b>Eddie</b><small class="muted" style="display:block">Plan: ${S.plan}</small></div>
    <a href="#/favoritos">${ic("heart", "sm")}Mis favoritos y pujas</a>
    <a href="#/publicar">${ic("upload", "sm")}Publicar vehículo</a>
    <a href="#/precios">${ic("euro", "sm")}Suscripción</a>
    <a href="#/admin">${ic("shield", "sm")}Panel de administración</a>
    <button id="logoutBtn" style="color:var(--bad)">${ic("logout", "sm")}Cerrar sesión</button>`;
  m.hidden = !m.hidden;
  $("#logoutBtn").onclick = () => { m.hidden = true; toast("Sesión de demostración: no se cierra", "lock"); };
};
document.addEventListener("click", () => { $("#userMenu").hidden = true; });
$("#bellBtn").onclick = () => openNotes();

function openNotes() {
  const o = $("#overlay");
  o.innerHTML = `<div class="scrim" style="place-items:stretch;padding:0;background:rgba(0,0,0,.35)" id="nScrim"></div>
  <aside class="drawer" role="dialog" aria-label="Notificaciones">
    <div class="modal mh" style="border-radius:0;border:0;border-bottom:1px solid var(--line);box-shadow:none;width:auto"><h3>Notificaciones</h3><button class="icon-btn" id="nClose" aria-label="Cerrar">${ic("x")}</button></div>
    <div class="list">${S.notes.map(n => `<div class="note ${n.unread ? "unread" : ""}"><span class="avatar" style="background:var(--surface-3);color:var(--accent)">${ic(n.icon, "sm")}</span><div><b style="font-weight:500">${n.txt}</b><small>${ago(n.t)}</small></div></div>`).join("")}</div>
  </aside>`;
  const close = () => { o.innerHTML = ""; S.notes.forEach(n => n.unread = false); renderHeader(route().path); };
  $("#nScrim").onclick = close; $("#nClose").onclick = close;
}
function notify(txt, icon = "gavel") { S.notes.unshift({ t: now(), txt, icon, unread: true }); renderHeader(route().path); }

function modal(title, body, onMount) {
  const o = $("#overlay");
  o.innerHTML = `<div class="scrim" id="mScrim"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="mh"><h3>${title}</h3><button class="icon-btn" id="mClose" aria-label="Cerrar">${ic("x")}</button></div><div class="mb">${body}</div></div></div>`;
  const close = () => { o.innerHTML = ""; };
  $("#mClose").onclick = close;
  $("#mScrim").onclick = e => { if (e.target.id === "mScrim") close(); };
  onMount && onMount(close);
}
document.addEventListener("keydown", e => { if (e.key === "Escape") $("#overlay").innerHTML = ""; });

function toggleFav(id) {
  S.favs.has(id) ? S.favs.delete(id) : S.favs.add(id);
  store.set("favs", [...S.favs]);
  toast(S.favs.has(id) ? "Añadido a favoritos. Te avisaremos antes del cierre." : "Quitado de favoritos", "heart");
  renderHeader(route().path);
}
/* ---------- shared pieces ---------- */
const imgSrc = n => /^(https?:|data:|blob:)/.test(String(n)) ? String(n) : `img/${n}.jpg`;
function lotCard(l) {
  const st = statusOf(l), c = CATS[l.cat], locked = l.cat === "oculta" && !/Dealer|Full/.test(S.plan);
  const lead = S.myBids[l.id] && l.hist[0] && l.hist[0].who === "Tú";
  const label = st === "live" ? "Cierra en" : st === "soon" ? "Empieza en" : "Finalizada";
  const total = l.endsAt - l.startsAt, pct = st === "live" ? Math.min(100, (now() - l.startsAt) / total * 100) : st === "end" ? 100 : 0;
  return `<article class="card">
    <a class="ph ${locked ? "locked" : ""}" href="#/subasta/${l.id}">
      <img src="${imgSrc(l.img)}" alt="${esc(l.title)}" loading="lazy">
      <div class="lot-tag">${st === "live" ? '<span class="status live"><span class="live-dot" style="background:#fff"></span>En vivo</span>' : st === "soon" ? '<span class="status soon">Programada</span>' : '<span class="status end">Cerrada</span>'}</div>
      <span class="lotno">LOTE ${l.id.slice(1)}</span>
      ${locked ? `<div class="lockov">${ic("lock", "lg")}<span>Acceso Dealer</span></div>` : ""}
    </a>
    <button class="fav ${S.favs.has(l.id) ? "on" : ""}" data-fav="${l.id}" aria-label="Favorito">${ic("heart", "sm")}</button>
    <div class="bd">
      <a href="#/subasta/${l.id}"><h3>${locked ? l.year + " " + l.make + " •••" : esc(l.title)}</h3></a>
      <div class="meta"><span class="chip ${c.chip}">${c.short}</span>${l.noReserve ? '<span class="chip acc">Sin reserva</span>' : ""}${lead ? `<span class="chip ok">${ic("check", "sm")}Vas ganando</span>` : ""}</div>
      <div class="meta"><span class="chip">${ic("gauge", "sm")}${num(l.km / 1000)}k km</span><span class="chip">${ic("pin", "sm")}${esc(l.city)}</span><span class="chip">${ic("gavel", "sm")}${l.hist.length}</span></div>
      <div class="price-row">
        <div class="price"><small>${l.hist.length ? "Puja actual" : "Precio de salida"}</small><span data-price="${l.id}">${locked ? "€ •••" : eur(curPrice(l))}</span></div>
        <div class="tm"><small>${label}</small><span class="t ${st === "live" && l.endsAt - now() < 10 * MIN ? "clock hot" : ""}" data-tm="${l.id}">${st === "end" ? "—" : fmtLeft((st === "live" ? l.endsAt : l.startsAt) - now())}</span></div>
      </div>
      <div class="bar"><i data-bar="${l.id}" style="width:${pct}%"></i></div>
    </div>
  </article>`;
}
function bindCards(root = document) {
  $$("[data-fav]", root).forEach(b => {
    b.onclick = e => { e.preventDefault(); toggleFav(b.dataset.fav); b.classList.toggle("on", S.favs.has(b.dataset.fav)); };
  });
}

/* ---------- HOME ---------- */
function viewHome() {
  const live = lots.filter(l => statusOf(l) === "live" && l.cat !== "oculta").sort((a, b) => a.endsAt - b.endsAt);
  const h = live[0] || lots[0];
  const counts = k => lots.filter(l => l.cat === k).length;
  return `
  <section class="hero"><div class="wrap">
    <div>
      <div class="eyebrow">Remarketing de vehículos · España</div>
      <h1 style="margin-top:14px">Puja hoy.<br>Llévatelo <em>mañana.</em></h1>
      <p class="lead">Subastas diarias de vehículos limpios, dañados y siniestros de aseguradoras, rentings y concesionarios. Precio total claro antes de pujar: comisión, gestoría y transporte incluidos.</p>
      <div class="hero-cta">
        <a class="btn primary" href="#/subastas">${ic("gavel", "sm")}Ver subastas en vivo</a>
        <a class="btn" href="#/publicar">${ic("upload", "sm")}Publicar vehículo</a>
        <a class="btn ghost" href="#/valoracion">${ic("chart", "sm")}Valoración gratuita</a>
      </div>
      <div class="stats">
        <div><b class="tnum">${lots.length}</b><span>lotes esta semana</span></div>
        <div><b class="tnum">${live.length}</b><span>en vivo ahora</span></div>
        <div><b>17</b><span>comunidades autónomas</span></div>
        <div><b>24 h</b><span>oferta directa</span></div>
      </div>
    </div>
    <a class="hero-lot" href="#/subasta/${h.id}" aria-label="Lote destacado">
      <div class="ph"><img src="${imgSrc(h.img)}" alt="${esc(h.title)}">
        <div class="lot-tag"><span class="status live"><span class="live-dot" style="background:#fff"></span>En vivo</span><span class="chip">LOTE ${h.id.slice(1)}</span></div></div>
      <div class="body">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><h3 style="font-size:20px">${esc(h.title)}</h3><span class="muted" style="font-size:13px">${num(h.km)} km · ${h.fuel} · ${esc(h.city)}</span></div><span class="chip ${CATS[h.cat].chip}">${CATS[h.cat].short}</span></div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:10px">
          <div><small class="muted">Puja actual</small><div class="bigprice" style="font-size:34px" data-price="${h.id}">${eur(curPrice(h))}</div></div>
          <div style="text-align:right"><small class="muted">Cierra en</small><div class="clock" data-tm="${h.id}">${fmtLeft(h.endsAt - now())}</div></div>
        </div>
      </div>
    </a>
  </div></section>

  <section class="blk"><div class="wrap">
    <div class="sec-head"><div><div class="eyebrow">Categorías</div><h2 style="margin-top:8px">Elige tu tipo de lote</h2></div></div>
    <div class="cats">
      ${Object.entries(CATS).map(([k, c]) => `<a class="cat ${k === "oculta" ? "oculta" : k}" href="#/subastas?cat=${k}">
        <div class="row"><span class="ic">${ic(c.icon)}</span><span class="n tnum">${counts(k)}</span></div>
        <h3>${c.name}</h3>${k === "oculta" ? '<span class="eyebrow" style="color:var(--vip)">Acceso premium</span>' : ""}<p>${c.desc}</p>
        <span class="faint mono" style="font-size:11.5px">Sesión ${c.session} CET</span></a>`).join("")}
    </div>
  </div></section>

  <section class="blk" style="padding-top:0"><div class="wrap">
    <div class="sec-head"><div><div class="eyebrow">${ic("flame", "sm")} Cierran pronto</div><h2 style="margin-top:8px">Subastas con más actividad</h2></div><a class="link" href="#/subastas">Ver calendario ${ic("right", "sm")}</a></div>
    <div class="grid">${live.slice(0, 4).map(lotCard).join("")}</div>
  </div></section>

  <section class="blk" style="background:var(--bg-2);border-block:1px solid var(--line)"><div class="wrap">
    <div class="sec-head"><div><div class="eyebrow">Cómo funciona</div><h2 style="margin-top:8px">De la puja a tu nave</h2></div></div>
    <div class="steps">
      <div class="step"><span class="k">PASO 1</span>${ic("user", "lg")}<h4>Regístrate y verifica</h4><p>Cuenta profesional o particular. Verificación de identidad en minutos.</p></div>
      <div class="step"><span class="k">PASO 2</span>${ic("search", "lg")}<h4>Inspecciona el lote</h4><p>Fotos, mapa de daños por panel, VIN y coste total calculado.</p></div>
      <div class="step"><span class="k">PASO 3</span>${ic("gavel", "lg")}<h4>Puja o automatiza</h4><p>Puja manual o automática hasta tu máximo. Anti-sniping de 2 minutos.</p></div>
      <div class="step"><span class="k">PASO 4</span>${ic("truck", "lg")}<h4>Paga y recibe</h4><p>Gestoría y transporte a toda España o exportación con DUA.</p></div>
    </div>
  </div></section>

  <section class="blk"><div class="wrap">
    <div class="sec-head"><div><div class="eyebrow">Compromiso</div><h2 style="margin-top:8px">En MotorSubasta, pujar es comprar</h2><p>Cada puja es vinculante. Esa seriedad protege a compradores y vendedores.</p></div></div>
    <div class="commit">
      <div class="panel"><h3>Tu compromiso al pujar</h3><ul class="checks">
        <li>${ic("check", "sm")}Las pujas no se pueden retirar ni cancelar.</li>
        <li>${ic("check", "sm")}Tu puja mantiene su validez durante 30 días naturales.</li>
        <li>${ic("check", "sm")}Si el vendedor acepta, formalizas la compra en el plazo indicado.</li>
        <li>${ic("check", "sm")}Si no cumples, se aplica penalización y la operación pasa al segundo mejor postor.</li>
      </ul></div>
      <div class="panel"><h3>¿Qué ocurre después?</h3>
        <div class="outcome"><span class="chip ok">${ic("check", "sm")}</span><div><small>El vendedor acepta tu puja</small><b>Formalizas la compra</b></div></div>
        <div class="outcome"><span class="chip">${ic("x", "sm")}</span><div><small>El vendedor rechaza tu puja</small><b>Sin obligación para ti</b></div></div>
        <div class="outcome"><span class="chip bad">${ic("alert", "sm")}</span><div><small>Incumples el compromiso</small><b>Penalización y reactivación 349 € + IVA</b></div></div>
      </div>
    </div>
  </div></section>

  <section class="blk" style="padding-top:0"><div class="wrap">
    <div class="sec-head"><div><div class="eyebrow">Mercado · precio fijo</div><h2 style="margin-top:8px">Compra sin esperar a la subasta</h2></div><a class="link" href="#/mercado">Ver mercado ${ic("right", "sm")}</a></div>
    <div class="grid">${market.slice(0, 3).map(mkCard).join("")}</div>
  </div></section>

  <section class="blk" style="padding-top:0"><div class="wrap">
    <div class="panel" style="display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center;padding:28px;background:linear-gradient(120deg,var(--accent-soft),var(--surface) 60%)">
      <div><div class="eyebrow">Para vendedores</div><h2 style="font-size:30px;font-weight:800;font-stretch:82%;text-transform:uppercase;margin-top:8px">¿Tienes un vehículo dañado?</h2><p class="muted" style="margin:8px 0 0;max-width:60ch">Publícalo en subasta, véndelo a precio fijo o recibe una oferta directa de MotorSubasta en 24 horas. Tú decides si aceptas.</p></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn primary" href="#/publicar">Publicar ahora</a><a class="btn" href="#/valoracion">Pedir oferta 24 h</a></div>
    </div>
    <div style="margin-top:28px"><div class="lbl" style="margin-bottom:10px">Marcas frecuentes</div><div class="brands">${["Toyota", "Volkswagen", "SEAT", "Renault", "Peugeot", "Citroën", "Opel", "Ford", "BMW", "Mercedes-Benz", "Audi", "Hyundai", "Kia", "Nissan", "Fiat", "Dacia"].map(b => `<span>${b}</span>`).join("")}</div></div>
  </div></section>`;
}
function mkCard(m) {
  return `<article class="card"><a class="ph" href="#/mercado/${m.id}"><img src="${imgSrc(m.img)}" alt="${esc(m.title)}" loading="lazy"><span class="lotno">${m.type.toUpperCase()}</span></a>
  <div class="bd"><a href="#/mercado/${m.id}"><h3>${esc(m.title)}</h3></a>
  <div class="meta"><span class="chip">${m.year}</span><span class="chip">${num(m.km)} km</span><span class="chip ${CATS[m.cat].chip}">${CATS[m.cat].short}</span></div>
  <div class="price-row"><div class="price"><small>${m.neg ? "Precio negociable" : "Precio fijo"}</small><span style="color:var(--accent)">${eur(m.price)}</span></div><div class="tm"><small>desde</small><span class="t">~${eur(m.price / 60 * 1.12)}/mes</span></div></div></div></article>`;
}

/* ---------- SUBASTAS ---------- */
const AUC = { day: 0, q: "", cat: "all", sort: "end", open: { limpio: true, danado: true, siniestro: true, oculta: false } };
function viewAuctions(query) {
  if (query.cat) { AUC.cat = query.cat; if (CATS[query.cat]) AUC.open[query.cat] = true; }
  const days = [...Array(14)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });
  const dn = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"], mn = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  return `<div class="wrap">
  <div class="admin-head"><div><div class="eyebrow">Calendario de subastas</div><h1 style="margin-top:8px">Subastas</h1><p class="muted" style="margin:6px 0 0">Sesiones diarias por categoría. Horario peninsular (CET).</p></div>
  <div class="seg" role="tablist"><button class="on">${ic("gavel", "sm")}Sesiones</button><a class="btn xs ghost" href="#/favoritos">${ic("heart", "sm")}Mis favoritos</a></div></div>
  <div class="days">${days.map((d, i) => `<button class="day ${i === AUC.day ? "on" : ""}" data-day="${i}"><small>${i === 0 ? "HOY" : i === 1 ? "MAÑ" : dn[d.getDay()]}</small><b>${d.getDate()}</b><small>${mn[d.getMonth()]}</small>${i < 2 ? `<em>${i === 0 ? lots.length : 6}</em>` : "<em>&nbsp;</em>"}</button>`).join("")}</div>
  <div class="toolbar">
    <div class="search">${ic("search")}<input class="in" id="aq" placeholder="Buscar marca, modelo, ciudad o lote…" value="${esc(AUC.q)}"></div>
    <div class="seg" id="acat">${[["all", "Todas"], ["limpio", "Limpios"], ["danado", "Dañados"], ["siniestro", "Siniestros"], ["oculta", "Ocultas"]].map(([k, t]) => `<button data-c="${k}" class="${AUC.cat === k ? "on" : ""}">${t}</button>`).join("")}</div>
    <select class="in" id="asort" style="width:auto"><option value="end">Cierre más próximo</option><option value="low">Precio más bajo</option><option value="bids">Más pujas</option></select>
  </div>
  <div id="sessions"></div></div>`;
}
function renderSessions() {
  const box = $("#sessions"); if (!box) return;
  if (AUC.day > 1) { box.innerHTML = `<div class="panel empty">${ic("clock", "lg")}<b>Aún no hay lotes publicados para este día</b><span>Los vendedores publican con 48 h de antelación. Activa alertas para recibir aviso.</span><button class="btn sm" onclick="toast('Alerta creada para este día','bell')">Crear alerta</button></div>`; return; }
  const q = AUC.q.toLowerCase();
  let list = lots.filter(l => (AUC.cat === "all" || l.cat === AUC.cat) && (!q || (l.title + l.city + l.id + l.prov).toLowerCase().includes(q)));
  if (AUC.day === 1) list = list.filter((_, i) => i % 2 === 0);
  const sorter = { end: (a, b) => (statusOf(a) === "end") - (statusOf(b) === "end") || a.endsAt - b.endsAt, low: (a, b) => curPrice(a) - curPrice(b), bids: (a, b) => b.hist.length - a.hist.length }[AUC.sort];
  box.innerHTML = Object.entries(CATS).filter(([k]) => AUC.cat === "all" || AUC.cat === k).map(([k, c]) => {
    const items = list.filter(l => l.cat === k).sort(sorter);
    const col = { limpio: "ok", danado: "warn", siniestro: "bad", oculta: "vip" }[k];
    return `<div class="session ${AUC.open[k] ? "open" : ""}"><button data-sess="${k}" aria-expanded="${!!AUC.open[k]}">
      <span class="ic" style="background:var(--${col}-soft);color:var(--${col})">${ic(c.icon)}</span>
      <div><h3>${c.name}</h3><small>${ic("clock", "sm")}${c.session} CET ${k === "oculta" ? "· solo Dealer" : ""}</small></div>
      <span class="cnt tnum">${items.length}</span>${ic("chev", "chev")}</button>
      ${AUC.open[k] ? `<div class="inner">${items.length ? `<div class="grid">${items.map(lotCard).join("")}</div>` : `<div class="empty">${ic("clock", "lg")}No hay lotes con estos filtros</div>`}</div>` : ""}</div>`;
  }).join("");
  $$("[data-sess]", box).forEach(b => b.onclick = () => { AUC.open[b.dataset.sess] = !AUC.open[b.dataset.sess]; renderSessions(); });
  bindCards(box);
}
function mountAuctions() {
  $$("[data-day]").forEach(b => b.onclick = () => { AUC.day = +b.dataset.day; $$("[data-day]").forEach(x => x.classList.toggle("on", x === b)); renderSessions(); });
  $("#aq").oninput = e => { AUC.q = e.target.value; renderSessions(); };
  $$("#acat button").forEach(b => b.onclick = () => { AUC.cat = b.dataset.c; if (CATS[AUC.cat]) AUC.open[AUC.cat] = true; $$("#acat button").forEach(x => x.classList.toggle("on", x === b)); renderSessions(); });
  $("#asort").value = AUC.sort;
  $("#asort").onchange = e => { AUC.sort = e.target.value; renderSessions(); };
  renderSessions();
}

/* ---------- LOT DETAIL ---------- */
function carMap(p, interactive) {
  const r = (id, x, y, w, h, rx = 6) => `<rect data-panel="${id}" class="sev-${p[id] || 0}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"><title>${PANELS.find(q => q[0] === id)[1]}: ${SEV[p[id] || 0]}</title></rect>`;
  return `<div class="carmap"><svg viewBox="0 0 160 312" role="img" aria-label="Mapa de daños por panel">
    ${r("pdel", 34, 4, 92, 20, 10)}${r("capo", 40, 28, 80, 62)}${r("adi", 14, 28, 22, 62)}${r("add", 124, 28, 22, 62)}
    ${r("pdi", 14, 94, 22, 58)}${r("pdd", 124, 94, 22, 58)}${r("techo", 40, 94, 80, 112)}
    ${r("pti", 14, 156, 22, 54)}${r("ptd", 124, 156, 22, 54)}${r("ati", 14, 214, 22, 66)}${r("atd", 124, 214, 22, 66)}
    ${r("male", 40, 210, 80, 70)}${r("ptra", 34, 284, 92, 22, 10)}
  </svg></div>`;
}
const legend = () => `<div class="legend">${SEV.map((s, i) => `<span><i class="sev-${i}" style="background:${["var(--surface-3)", "var(--info)", "var(--warn)", "var(--accent)", "var(--bad)"][i]}"></i>${s}</span>`).join("")}</div>`;

let DET = { id: null, img: 0 };
function viewLot(id) {
  const l = lots.find(x => x.id === id);
  if (!l) return `<div class="wrap"><div class="empty" style="padding:80px">${ic("alert", "lg")}<b>Este lote no existe o ya se retiró</b><a class="btn" href="#/subastas">Volver a subastas</a></div></div>`;
  if (DET.id !== id) DET = { id, img: 0 };
  const c = CATS[l.cat], locked = l.cat === "oculta" && !/Dealer|Full/.test(S.plan);
  const others = lots.filter(x => x.id !== id && x.cat === l.cat).slice(0, 3);
  const sc = scoreOf(l.panels);
  const damaged = PANELS.filter(([k]) => l.panels[k]);
  return `<div class="wrap">
  <a class="back" href="#/subastas">${ic("left", "sm")}Volver a subastas</a>
  <div class="detail">
    <div>
      <div class="gallery">
        <div class="main"><img id="mainImg" src="${imgSrc(l.img)}" alt="${esc(l.title)}" style="${locked ? "filter:blur(16px)" : ""}">
          <div class="lot-tag"><span class="chip">LOTE ${l.id.slice(1)}</span><span class="chip">${ic("eye", "sm")}${l.watchers} siguiendo</span></div></div>
        <div class="thumbs">${[0, 1, 2, 3, 4].map(i => `<button class="${i === 0 ? "on" : ""}" data-th="${i}" aria-label="Foto ${i + 1}"><img src="${imgSrc(l.img)}" alt=""></button>`).join("")}</div>
      </div>
      <div class="d-title">
        <div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px"><span class="chip ${c.chip}">${c.name}</span>${l.noReserve ? '<span class="chip acc">Sin precio de reserva</span>' : '<span class="chip">Con reserva</span>'}${l.buyNow ? `<span class="chip info">Compra inmediata ${eur(l.buyNow)}</span>` : ""}</div>
        <h1>${locked ? l.year + " " + l.make + " •••" : esc(l.title)}</h1>
        <p class="muted" style="margin:8px 0 0">${num(l.km)} km · ${l.fuel} · ${l.trans} · ${l.cv} CV · ${esc(l.city)}, ${esc(l.prov)}</p></div>
        <div style="display:flex;gap:6px"><button class="icon-btn" id="dFav" aria-label="Favorito" style="${S.favs.has(l.id) ? "color:var(--accent)" : ""}">${ic("heart")}</button><button class="icon-btn" id="dShare" aria-label="Compartir">${ic("share")}</button></div>
      </div>

      <h2 class="h-sec">${ic("doc")}Especificaciones</h2>
      <div class="specs">
        <div><small>Marca</small><b>${l.make}</b></div><div><small>Modelo</small><b>${l.model}</b></div><div><small>Año</small><b>${l.year}</b></div>
        <div><small>Kilometraje</small><b class="tnum">${num(l.km)} km</b></div><div><small>Combustible</small><b>${l.fuel}</b></div><div><small>Transmisión</small><b>${l.trans}</b></div>
        <div><small>Carrocería</small><b>${l.body}</b></div><div><small>Potencia</small><b>${l.cv} CV</b></div><div><small>Matrícula</small><b><span class="plate"><i>E</i><span>${l.plate}</span></span></b></div>
        <div><small>VIN</small><b class="mono" style="font-size:12.5px">${locked ? "•••••••••••••••••" : l.vin}</b></div><div><small>Llaves</small><b>${l.keys ? "Sí, 1 juego" : "Sin llaves"}</b></div><div><small>Arranca y circula</small><b>${l.runs ? "Sí" : "No"}</b></div>
      </div>

      <h2 class="h-sec">${ic("wrench")}Condición por panel</h2>
      <div class="panel cond">
        ${carMap(l.panels)}
        <div>
          <div style="display:flex;align-items:flex-end;gap:12px;margin-bottom:12px"><span class="score tnum" style="color:${sc > 80 ? "var(--ok)" : sc > 50 ? "var(--warn)" : "var(--bad)"}">${sc}</span><span class="muted" style="padding-bottom:6px">/100 · verificado por inspector</span></div>
          ${damaged.length ? `<div class="plist">${damaged.map(([k, n]) => `<div><span>${n}</span><span class="chip ${["", "info", "warn", "acc", "bad"][l.panels[k]]}">${SEV[l.panels[k]]}</span></div>`).join("")}</div>` : '<p class="muted">Sin daños declarados.</p>'}
          ${legend()}
        </div>
      </div>

      <h2 class="h-sec">${ic("msg")}Descripción</h2>
      <p style="max-width:68ch;margin:0">${DESC[l.cat]} ${l.keys ? "Se entrega con llaves." : "Se entrega sin llaves."} ${l.runs ? "Arranca correctamente." : "No arranca: requiere grúa para su retirada."}</p>

      <h2 class="h-sec">${ic("truck")}Recogida y transporte</h2>
      <div class="panel" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:end">
        <div class="field"><label for="tDest">Enviar a</label><select class="in" id="tDest">${Object.keys(TRANSPORT).map(p => `<option ${p === "Alicante" ? "selected" : ""}>${p}</option>`).join("")}</select></div>
        <div><small class="muted">Estimación ${l.runs ? "portavehículos" : "grúa"} desde ${esc(l.city)}</small><div class="bigprice" style="font-size:28px" id="tOut"></div><small class="muted">Retirada coordinada con el vendedor: 3–10 días laborables desde el pago.</small></div>
      </div>
      <div class="lbl" style="margin:28px 0 10px">Otros lotes de ${c.name.toLowerCase()}</div>
      <div class="grid">${others.map(lotCard).join("")}</div>
    </div>

    <aside class="bidbox" id="bidbox"></aside>
  </div></div>`;
}
function renderBidbox(l) {
  const box = $("#bidbox"); if (!box) return;
  const st = statusOf(l), cur = curPrice(l), minBid = l.hist.length ? cur + inc(cur) : l.start;
  const lead = l.hist[0] && l.hist[0].who === "Tú";
  const mine = S.myBids[l.id];
  const locked = l.cat === "oculta" && !/Dealer|Full/.test(S.plan);
  const prev = $("#bidIn") ? +$("#bidIn").value : 0;
  const val = Math.max(prev || 0, minBid);
  box.innerHTML = `<div class="hd ${st}"><span>${st === "live" ? "● En vivo" : st === "soon" ? "Programada" : "Subasta cerrada"}</span><span class="tnum">${ic("gavel", "sm")} ${l.hist.length} pujas</span></div>
  <div class="bd">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:10px">
      <div><small class="muted">${l.hist.length ? "Puja actual" : "Precio de salida"}</small><div class="bigprice tnum">${locked ? "€ •••" : eur(cur)}</div></div>
      <div style="text-align:right"><small class="muted">${st === "live" ? "Cierra en" : st === "soon" ? "Empieza en" : "Cerró"}</small><div class="clock ${st === "live" && l.endsAt - now() < 10 * MIN ? "hot" : ""}" data-tm="${l.id}" style="font-size:24px">${st === "end" ? "—" : fmtLeft((st === "live" ? l.endsAt : l.startsAt) - now())}</div></div>
    </div>
    ${mine ? `<div class="lead-note ${lead ? "win" : "lose"}">${ic(lead ? "check" : "alert", "sm")}${lead ? "Vas ganando con " + eur(cur) : "Te han superado. Tu última puja: " + eur(mine)}</div>` : ""}
    ${locked ? `<div class="lead-note" style="background:var(--vip-soft);color:var(--vip)">${ic("lock", "sm")}Lote exclusivo para planes Dealer y Combinado Full.</div><a class="btn primary block" href="#/precios">Ver planes</a>` : st === "end" ? `<div class="lead-note" style="background:var(--surface-2)">${lead ? "Has ganado este lote. Te contactaremos para formalizar." : "Subasta finalizada. Pendiente de aceptación del vendedor."}</div>` : `
    <div class="incs">${[1, 2, 4].map(k => `<button data-inc="${inc(cur) * k}">+${eur(inc(cur) * k)}</button>`).join("")}</div>
    <div class="field"><div style="display:flex;justify-content:space-between"><label for="bidIn">Tu puja</label><small class="muted">Mín. ${eur(minBid)}</small></div>
      <div class="money"><span>€</span><input class="in tnum" id="bidIn" type="number" inputmode="numeric" min="${minBid}" step="${inc(cur)}" value="${val}"></div></div>
    <div style="background:var(--surface-2);border-radius:10px;padding:10px 12px" id="costBox"></div>
    <button class="btn primary block" id="bidGo" ${st !== "live" ? "disabled" : ""}>${ic("gavel", "sm")}${st === "live" ? "Pujar" : "Disponible al abrir la sesión"}</button>
    ${l.buyNow ? `<button class="btn block" id="buyNow">${ic("bolt", "sm")}Comprar ya por ${eur(l.buyNow)}</button>` : ""}
    <details class="acc" ${S.auto[l.id] ? "open" : ""}><summary>${ic("robot", "sm")}Puja automática ${S.auto[l.id] ? `<span class="chip ok" style="margin-left:auto">Activa hasta ${eur(S.auto[l.id])}</span>` : ""}${ic("chev", "chev sm")}</summary>
      <div class="ac-b"><small class="muted">Pujamos por ti el mínimo necesario hasta tu máximo. Nadie ve tu límite.</small>
      <div class="money"><span>€</span><input class="in" id="autoIn" type="number" value="${S.auto[l.id] || Math.round(minBid * 1.4 / 50) * 50}"></div>
      <div style="display:flex;gap:8px"><button class="btn sm primary" id="autoGo">${S.auto[l.id] ? "Actualizar" : "Activar"}</button>${S.auto[l.id] ? '<button class="btn sm" id="autoOff">Desactivar</button>' : ""}</div></div></details>`}
    <ul class="muted" style="font-size:12px;margin:0;padding-left:16px;display:grid;gap:3px"><li>Incremento mínimo: ${eur(inc(cur))}</li><li>Todas las pujas son vinculantes 30 días</li><li>Anti-sniping: una puja en los 2 últimos minutos amplía 2 minutos</li></ul>
    <div><div class="lbl" style="margin-bottom:6px">Historial de pujas</div>
    ${l.hist.length ? `<ul class="bids">${l.hist.slice(0, 12).map(b => `<li class="${b.who === "Tú" ? "me" : ""}"><span><b>${b.who}</b> <small class="faint">${ago(b.t)}</small></span><span class="mono tnum">${eur(b.amt)}</span></li>`).join("")}</ul>` : '<p class="muted" style="margin:0;font-size:13px">Aún no hay pujas. Sé el primero.</p>'}</div>
  </div>`;
  if (locked || st === "end") return;
  const bi = $("#bidIn");
  const cost = () => {
    const p = +bi.value || 0, fee = buyerFee(p), g = 149, dest = $("#tDest") ? $("#tDest").value : "Alicante";
    const t = Math.round((TRANSPORT[dest] || 200) * (l.runs ? 1 : 1.35) * (l.city.includes(dest) || l.prov === dest ? .5 : 1));
    const disc = planDisc();
    const feeD = fee * (1 - disc), iva = (feeD + g + t) * .21;
    $("#costBox").innerHTML = `<div class="kv"><span>Puja</span><span class="tnum">${eur(p)}</span></div>
      <div class="kv"><span>Comisión comprador${disc ? ` (−${Math.round(disc * 100)}% ${S.plan})` : ""}</span><span class="tnum">${eur(feeD)}</span></div>
      <div class="kv"><span>Gestoría transferencia</span><span class="tnum">${eur(g)}</span></div>
      <div class="kv"><span>Transporte a ${dest}</span><span class="tnum">${eur(t)}</span></div>
      <div class="kv"><span>IVA servicios (21%)</span><span class="tnum">${eur(iva)}</span></div>
      <div class="kv total"><span>Coste total estimado</span><span class="tnum">${eur(p + feeD + g + t + iva)}</span></div>`;
    if ($("#tOut")) $("#tOut").textContent = eur(t) + " + IVA";
  };
  bi.oninput = cost; cost();
  if ($("#tDest")) $("#tDest").onchange = cost;
  $$("[data-inc]").forEach(b => b.onclick = () => { bi.value = cur + +b.dataset.inc; cost(); });
  $("#bidGo").onclick = () => {
    const v = +bi.value;
    if (!(v >= minBid)) { toast("La puja mínima es " + eur(minBid), "alert"); return; }
    modal("Confirmar puja", `<p style="margin:0">Vas a pujar <b class="tnum">${eur(v)}</b> por <b>${esc(l.title)}</b>.</p>
      <div class="lead-note" style="background:var(--warn-soft);color:var(--warn)">${ic("alert", "sm")}La puja es vinculante durante 30 días y no se puede retirar.</div>
      <label style="display:flex;gap:8px;align-items:center;font-size:14px"><input type="checkbox" id="cOk"> Acepto las condiciones de puja</label>
      <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes" disabled>Confirmar puja</button></div>`, close => {
      $("#cOk").onchange = e => { $("#cYes").disabled = !e.target.checked; };
      $("#cNo").onclick = close;
      $("#cYes").onclick = () => { close(); placeBid(l, "Tú", v); toast("Puja de " + eur(v) + " registrada. Vas ganando.", "gavel"); };
    });
  };
  if ($("#buyNow")) $("#buyNow").onclick = () => modal("Comprar ya", `<p style="margin:0">Compra inmediata de <b>${esc(l.title)}</b> por <b>${eur(l.buyNow)}</b> + comisión y gastos. La subasta se cerrará para el resto de pujadores.</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">Comprar</button></div>`, close => {
    $("#cNo").onclick = close;
    $("#cYes").onclick = () => { close(); placeBid(l, "Tú", l.buyNow); l.endsAt = now(); toast("¡Compra confirmada! Te enviamos los siguientes pasos.", "check"); notify(`Has comprado <b>${esc(l.title)}</b> con Comprar ya.`, "bolt"); refresh(); };
  });
  $("#autoGo").onclick = () => {
    const v = +$("#autoIn").value;
    if (!(v >= minBid)) { toast("El máximo debe ser al menos " + eur(minBid), "alert"); return; }
    S.auto[l.id] = v; saveBids();
    if (!lead) placeBid(l, "Tú", minBid);
    toast("Puja automática activa hasta " + eur(v), "robot"); renderBidbox(l);
  };
  if ($("#autoOff")) $("#autoOff").onclick = () => { delete S.auto[l.id]; saveBids(); toast("Puja automática desactivada", "robot"); renderBidbox(l); };
}
function placeBid(l, who, amt) {
  l.hist.unshift({ who, amt, t: now() });
  if (who === "Tú") { S.myBids[l.id] = amt; saveBids(); S.favs.add(l.id); store.set("favs", [...S.favs]); }
  if (S.settings.antisnipe && l.endsAt - now() < 2 * MIN) { l.endsAt += 2 * MIN; }
  refresh();
}
function mountLot(id) {
  const l = lots.find(x => x.id === id); if (!l) return;
  renderBidbox(l);
  $$("[data-th]").forEach(b => b.onclick = () => { $$("[data-th]").forEach(x => x.classList.toggle("on", x === b)); const im = b.querySelector("img"); const m = $("#mainImg"); m.style.transform = getComputedStyle(im).transform; m.style.objectPosition = getComputedStyle(im).objectPosition; m.style.filter = getComputedStyle(im).filter; });
  $("#dFav").onclick = () => { toggleFav(l.id); $("#dFav").style.color = S.favs.has(l.id) ? "var(--accent)" : ""; };
  $("#dShare").onclick = () => { try { navigator.clipboard.writeText(location.href); } catch (e) {} toast("Enlace del lote copiado", "share"); };
  bindCards($(".detail"));
}
/* ---------- MERCADO ---------- */
const MK = { q: "", cat: "all", type: "all", min: "", max: "", fuel: "all", trans: "all", sort: "new" };
function viewMarket() {
  const types = ["Vehículos ligeros", "Motocicletas", "Náutica", "Transporte pesado"];
  return `<div class="wrap">
  <div class="admin-head"><div><div class="eyebrow">Precio fijo · negociable</div><h1 style="margin-top:8px">Mercado</h1><p class="muted" style="margin:6px 0 0">Compra directa sin esperar a la subasta. Haz una oferta y el vendedor responde en 48 h.</p></div>
  <a class="btn primary" href="#/publicar?t=mercado">${ic("plus", "sm")}Publicar anuncio</a></div>
  <div class="toolbar" style="margin-top:0"><div class="search">${ic("search")}<input class="in" id="mq" placeholder="Buscar por marca o modelo…" value="${esc(MK.q)}"></div>
  <select class="in" id="msort" style="width:auto"><option value="new">Más recientes</option><option value="low">Precio: menor a mayor</option><option value="high">Precio: mayor a menor</option><option value="km">Menos kilómetros</option></select></div>
  <div class="mk" style="margin-top:0">
    <aside class="filters">
      <h4>Estado</h4><div class="pills" id="fcat">${[["all", "Todos"], ["limpio", "Limpios"], ["danado", "Dañados"], ["siniestro", "Desguace"]].map(([k, t]) => `<button class="pill ${MK.cat === k ? "on" : ""}" data-v="${k}">${t}</button>`).join("")}</div>
      <h4>Tipo</h4><div class="pills" id="ftype"><button class="pill ${MK.type === "all" ? "on" : ""}" data-v="all">Todos</button>${types.map(t => `<button class="pill ${MK.type === t ? "on" : ""}" data-v="${t}">${t}</button>`).join("")}</div>
      <h4>Precio (€)</h4><div class="two"><input class="in" id="fmin" type="number" placeholder="Mín." value="${MK.min}"><input class="in" id="fmax" type="number" placeholder="Máx." value="${MK.max}"></div>
      <h4>Combustible</h4><select class="in" id="ffuel"><option value="all">Todos</option><option>Gasolina</option><option>Diésel</option><option>Híbrido</option><option>Eléctrico</option></select>
      <h4>Transmisión</h4><select class="in" id="ftrans"><option value="all">Todas</option><option>Manual</option><option>Automático</option></select>
      <button class="btn sm ghost" id="freset">${ic("refresh", "sm")}Limpiar filtros</button>
    </aside>
    <div><div class="muted" style="font-size:13px;margin-bottom:10px" id="mcount"></div><div id="mlist"></div></div>
  </div></div>`;
}
function renderMarket() {
  const q = MK.q.toLowerCase();
  let list = market.filter(m => (!q || m.title.toLowerCase().includes(q)) && (MK.cat === "all" || m.cat === MK.cat) && (MK.type === "all" || m.type === MK.type)
    && (!MK.min || m.price >= +MK.min) && (!MK.max || m.price <= +MK.max) && (MK.fuel === "all" || m.fuel === MK.fuel) && (MK.trans === "all" || m.trans === MK.trans));
  list.sort({ new: (a, b) => a.days - b.days, low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, km: (a, b) => a.km - b.km }[MK.sort]);
  $("#mcount").textContent = list.length + (list.length === 1 ? " vehículo" : " vehículos");
  $("#mlist").innerHTML = list.length ? list.map(m => `<article class="row-card">
    <a class="ph" href="#/mercado/${m.id}"><img src="${imgSrc(m.img)}" alt="${esc(m.title)}" loading="lazy"><span class="lotno" style="position:absolute;top:10px;left:10px;bottom:auto;font:600 10.5px var(--mono);background:rgba(10,9,8,.7);color:#fff;padding:5px 7px;border-radius:5px">${m.type.toUpperCase()}</span></a>
    <div class="bd"><a href="#/mercado/${m.id}"><h3>${esc(m.title)}</h3></a>
      <div class="spec"><span>${ic("clock", "sm")}${m.year}</span><span>${ic("gauge", "sm")}${num(m.km)} km</span><span>${ic("fuel", "sm")}${m.fuel}</span><span>${ic("gear", "sm")}${m.trans}</span></div>
      <div class="meta"><span class="chip ${CATS[m.cat].chip}">${CATS[m.cat].short}</span><span class="chip">${ic("pin", "sm")}${m.city}</span><span class="chip">${ic("user", "sm")}${m.seller}</span></div>
      <small class="faint">Publicado hace ${m.days} ${m.days === 1 ? "día" : "días"}</small></div>
    <div class="pr"><div><b class="tnum">${eur(m.price)}</b><small>${m.neg ? "Precio negociable" : "Precio fijo"}</small><small>desde ~${eur(m.price / 60 * 1.12)}/mes</small></div>
      <button class="btn sm primary" data-offer="${m.id}">${m.neg ? "Hacer oferta" : "Contactar"}</button></div></article>`).join("")
    : `<div class="panel empty">${ic("search", "lg")}<b>Ningún vehículo coincide</b><span>Prueba a ampliar el rango de precio o quitar filtros.</span></div>`;
  $$("[data-offer]").forEach(b => b.onclick = () => offerModal(market.find(m => m.id === b.dataset.offer)));
}
function mountMarket() {
  const r = () => renderMarket();
  $("#mq").oninput = e => { MK.q = e.target.value; r(); };
  $("#msort").value = MK.sort; $("#msort").onchange = e => { MK.sort = e.target.value; r(); };
  [["#fcat", "cat"], ["#ftype", "type"]].forEach(([s, k]) => $$(s + " .pill").forEach(b => b.onclick = () => { MK[k] = b.dataset.v; $$(s + " .pill").forEach(x => x.classList.toggle("on", x === b)); r(); }));
  $("#fmin").oninput = e => { MK.min = e.target.value; r(); };
  $("#fmax").oninput = e => { MK.max = e.target.value; r(); };
  $("#ffuel").value = MK.fuel; $("#ffuel").onchange = e => { MK.fuel = e.target.value; r(); };
  $("#ftrans").value = MK.trans; $("#ftrans").onchange = e => { MK.trans = e.target.value; r(); };
  $("#freset").onclick = () => { Object.assign(MK, { q: "", cat: "all", type: "all", min: "", max: "", fuel: "all", trans: "all" }); router(); };
  r();
}
function offerModal(m) {
  modal(m.neg ? "Hacer oferta" : "Contactar al vendedor", `<div style="display:flex;gap:12px;align-items:center"><img src="${imgSrc(m.img)}" alt="" style="width:90px;height:64px;object-fit:cover;border-radius:8px"><div><b>${esc(m.title)}</b><div class="muted" style="font-size:13px">Precio anunciado ${eur(m.price)}</div></div></div>
    ${m.neg ? `<div class="field"><label for="oAmt">Tu oferta</label><div class="money"><span>€</span><input class="in" id="oAmt" type="number" value="${Math.round(m.price * .9 / 50) * 50}"></div><small class="muted" id="oHint"></small></div>` : ""}
    <div class="field"><label for="oMsg">Mensaje (opcional)</label><textarea class="in" id="oMsg" placeholder="Ej.: Puedo recogerlo esta semana en ${esc(m.city)}."></textarea></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="oNo">Cancelar</button><button class="btn primary" id="oYes">${m.neg ? "Enviar oferta" : "Enviar mensaje"}</button></div>`, close => {
    const hint = () => { const v = +$("#oAmt").value, p = v / m.price; $("#oHint").textContent = p >= .95 ? "Muy cerca del precio: alta probabilidad de aceptación." : p >= .85 ? "Oferta razonable para un precio negociable." : "Oferta baja: el vendedor podría contraofertar."; };
    if ($("#oAmt")) { $("#oAmt").oninput = hint; hint(); }
    $("#oNo").onclick = close;
    $("#oYes").onclick = () => { close(); toast(m.neg ? "Oferta de " + eur(+$("#oAmt")?.value || 0) + " enviada al vendedor" : "Mensaje enviado", "msg"); notify(`Oferta enviada por <b>${esc(m.title)}</b>. Respuesta en 48 h.`, "msg"); };
  });
}
function viewMarketItem(id) {
  const m = market.find(x => x.id === id);
  if (!m) return `<div class="wrap"><div class="empty" style="padding:80px"><b>Anuncio no encontrado</b><a class="btn" href="#/mercado">Volver al mercado</a></div></div>`;
  return `<div class="wrap"><a class="back" href="#/mercado">${ic("left", "sm")}Volver al mercado</a>
  <div class="detail"><div>
    <div class="gallery"><div class="main"><img src="${imgSrc(m.img)}" alt="${esc(m.title)}"></div></div>
    <div class="d-title"><div><div style="display:flex;gap:6px;margin-bottom:10px"><span class="chip ${CATS[m.cat].chip}">${CATS[m.cat].short}</span><span class="chip">${m.type}</span></div><h1>${esc(m.title)}</h1><p class="muted" style="margin:8px 0 0">${m.year} · ${num(m.km)} km · ${m.fuel} · ${m.trans} · ${m.city}</p></div></div>
    <h2 class="h-sec">${ic("msg")}Descripción del vendedor</h2><p class="muted" style="max-width:68ch">Vehículo disponible para ver en ${m.city} con cita previa. Documentación al día. ${m.cat === "danado" ? "Presenta daños visibles en las fotos; se vende tal cual." : "Mantenimiento al día."} Se admite transporte a cargo del comprador a través de MotorSubasta.</p>
  </div>
  <aside class="bidbox"><div class="hd end"><span>Mercado · ${m.neg ? "negociable" : "precio fijo"}</span><span>${ic("user", "sm")} ${m.seller}</span></div>
    <div class="bd"><div><small class="muted">Precio</small><div class="bigprice" style="color:var(--accent)">${eur(m.price)}</div><small class="muted">Financiación desde ~${eur(m.price / 60 * 1.12)}/mes · 60 meses</small></div>
    <button class="btn primary block" id="miOffer">${m.neg ? "Hacer oferta" : "Contactar vendedor"}</button>
    <button class="btn block" id="miRes">${ic("lock", "sm")}Reservar 48 h (150 €, reembolsable)</button>
    <div class="kv"><span>Comisión comprador</span><span>Incluida en plan Full</span></div><div class="kv"><span>Gestoría</span><span>149 € + IVA</span></div></div></aside>
  </div></div>`;
}

/* ---------- VALORACIÓN ---------- */
const VAL = { make: "Toyota", model: "Corolla", year: 2019, km: 90000, damage: "leve", title: "limpio", keys: true, runs: true, direct: true };
function viewValuation() {
  return `<div class="wrap">
  <div class="admin-head"><div><div class="eyebrow">Gratis · sin compromiso</div><h1 style="margin-top:8px">Valoración de vehículo</h1><p class="muted" style="margin:6px 0 0;max-width:62ch">Recibe una horquilla de precio al instante y, si quieres, una oferta de compra en firme de MotorSubasta en 24 horas.</p></div></div>
  <div class="form-shell" style="margin-top:0">
    <form class="panel" id="valForm" style="display:grid;gap:18px" onsubmit="return false">
      <h3 style="margin:0">${ic("car")} Datos del vehículo</h3>
      <div class="fgrid">
        <div class="field"><label for="vMake">Marca</label><input class="in" id="vMake" value="${VAL.make}"></div>
        <div class="field"><label for="vModel">Modelo</label><input class="in" id="vModel" value="${VAL.model}"></div>
        <div class="field"><label for="vYear">Año</label><input class="in" id="vYear" type="number" value="${VAL.year}"></div>
        <div class="field"><label for="vKm">Kilometraje (km)</label><input class="in" id="vKm" type="number" value="${VAL.km}"></div>
        <div class="field"><label for="vVin">VIN</label><input class="in mono" id="vVin" maxlength="17" placeholder="17 caracteres"></div>
        <div class="field"><label for="vPlate">Matrícula (opcional)</label><input class="in mono" id="vPlate" placeholder="1234 ABC"></div>
        <div class="field"><label for="vDmg">Tipo de daño</label><select class="in" id="vDmg"><option value="ninguno">Sin daños</option><option value="leve">Leve / estético</option><option value="moderado">Moderado</option><option value="grave">Grave / estructural</option><option value="inundado">Inundado</option><option value="quemado">Incendio</option></select></div>
        <div class="field"><label for="vTitle">Documentación</label><select class="in" id="vTitle"><option value="limpio">En regla</option><option value="salvamento">Siniestro declarado o baja temporal</option><option value="piezas">Baja definitiva · solo piezas</option></select></div>
        <div class="full" style="display:flex;gap:18px;flex-wrap:wrap"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="vKeys" ${VAL.keys ? "checked" : ""}> Tiene llaves</label><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="vRuns" ${VAL.runs ? "checked" : ""}> Arranca y conduce</label></div>
        <div class="field full"><label for="vDesc">Descripción del daño</label><textarea class="in" id="vDesc" placeholder="Qué pasó, zonas afectadas y reparaciones ya realizadas."></textarea></div>
        <div class="full drop">${ic("upload", "lg")}<b>Arrastra fotos o haz clic para subir</b><span style="font-size:13px">Exterior, interior y zonas dañadas · 0/50 fotos</span><button type="button" class="btn sm" onclick="toast('Selector de fotos disponible en la versión con servidor','upload')">Seleccionar fotos</button></div>
      </div>
      <div class="trow" style="border:1px solid var(--line);border-radius:12px;padding:14px;background:var(--surface-2)"><div><b>${ic("bolt", "sm")} Oferta directa de MotorSubasta</b><small>Te enviamos una oferta de compra en firme en 24 h. Si la aceptas, se vende sin subasta.</small></div><label class="toggle"><input type="checkbox" id="vDirect" ${VAL.direct ? "checked" : ""} aria-label="Solicitar oferta directa"><span></span></label></div>
      <h3 style="margin:6px 0 0">${ic("user")} Contacto</h3>
      <div class="fgrid">
        <div class="field"><label for="vName">Nombre completo</label><input class="in" id="vName" value="Eddie"></div>
        <div class="field"><label for="vMail">Correo electrónico</label><input class="in" id="vMail" type="email" value="baropsedijs@gmail.com"></div>
        <div class="field"><label for="vTel">WhatsApp</label><input class="in" id="vTel" value="+34 600 000 000"></div>
        <div class="field"><label for="vPref">Contacto preferido</label><select class="in" id="vPref"><option>WhatsApp</option><option>Email</option><option>Llamada</option></select></div>
      </div>
      <button class="btn primary" id="vSend">${ic("check", "sm")}Solicitar valoración</button>
    </form>
    <div class="side-list" style="position:sticky;top:84px">
      <div class="estimate"><span class="eyebrow">Estimación instantánea</span><div class="rng tnum" id="vOut"></div><small class="muted" id="vNote"></small>
        <div class="bar"><i id="vBar" style="width:50%"></i></div></div>
      <div class="panel">${ic("euro", "lg")}<div><b>Completamente gratis</b><p>Sin costes ocultos ni obligación de vender.</p></div></div>
      <div class="panel">${ic("shield", "lg")}<div><b>Análisis profesional</b><p>Peritos con experiencia en aseguradoras y remarketing.</p></div></div>
      <div class="panel">${ic("msg", "lg")}<div><b>¿Necesitas ayuda?</b><p>Escríbenos por WhatsApp y te guiamos en el proceso.</p></div></div>
    </div>
  </div></div>`;
}
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
  $("#vSend").onclick = () => {
    const vin = $("#vVin").value.trim();
    if (vin && vin.length !== 17) { toast("El VIN debe tener 17 caracteres (tiene " + vin.length + ")", "alert"); $("#vVin").focus(); return; }
    toast($("#vDirect").checked ? "Solicitud enviada. Recibirás la oferta en 24 h." : "Solicitud de valoración enviada", "check");
    notify(`Valoración recibida para <b>${esc($("#vMake").value)} ${esc($("#vModel").value)}</b>.`, "chart");
  };
}

/* ---------- PUBLICAR ---------- */
const PUB = { step: 0, cat: "danado", title: "salvamento", type: "subasta", panels: {}, full: 12000, buy: false, direct: true, mcat: "Vehículos ligeros" };
const PUB_STEPS = ["Vehículo", "Condición", "Fotos y texto", "Publicación"];
function viewPublish(query) {
  if (query.t === "mercado") PUB.type = "mercado";
  if (!AUCTIONS_OPEN) PUB.type = "mercado";
  const s = PUB.step;
  const body = [
    `${pubCondBlock()}<div class="panel" style="display:grid;gap:16px;margin-top:14px"><h3 style="margin:0">Identificación y datos</h3>
      <div class="fgrid">
        <div class="field"><label for="pPlate">Matrícula *</label><input class="in mono up" id="pPlate" placeholder="1234 BCD" maxlength="12"><label class="nopl"><input type="checkbox" id="pNoPlate"> <span>Sin matrícula (náutica, vehículo nuevo o dado de baja)</span></label></div>
        <div class="field"><label for="pVin">Número de bastidor (VIN) *</label><div style="display:flex;gap:6px"><input class="in mono" id="pVin" maxlength="17" placeholder="WBAPH5C55BA123456"><button type="button" class="btn" id="pDecode" title="Decodificar VIN">${ic("search", "sm")}</button></div><small class="muted" id="pVinN">0/17 · autocompleta marca, modelo y datos técnicos</small></div>
        <div class="field"><label for="pMake">Marca *</label><input class="in" id="pMake" placeholder="BMW"></div>
        <div class="field"><label for="pModel">Modelo *</label><input class="in" id="pModel" placeholder="Serie 3"></div>
        <div class="field"><label for="pYear">Año *</label><input class="in" id="pYear" type="number" value="2020"></div>
        <div class="field"><label for="pKm">Kilómetros *</label><input class="in" id="pKm" type="number" value="120000"></div>
        <div class="field"><label for="pFuel">Combustible</label><select class="in" id="pFuel"><option>Diésel</option><option>Gasolina</option><option>Híbrido</option><option>Eléctrico</option></select></div>
        <div class="field"><label for="pTrans">Transmisión</label><select class="in" id="pTrans"><option>Manual</option><option>Automático</option></select></div>
        <div class="field"><label for="pProv">Provincia *</label><select class="in" id="pProv">${Object.keys(TRANSPORT).map(p => `<option>${p}</option>`).join("")}</select></div>
        <div class="field"><label for="pCity">Ciudad *</label><input class="in" id="pCity" placeholder="Alicante"></div>
      </div></div>`,
    `<div class="panel" style="display:grid;gap:16px"><div><h3 style="margin:0">Condición por panel</h3><p class="muted" style="margin:4px 0 0;font-size:13.5px">Los compradores pujan más por vehículos con condición declarada. Toca el mapa o usa la lista.</p></div>
      <div class="cond" style="grid-template-columns:180px 1fr">${carMap(PUB.panels)}<div><div style="display:flex;align-items:flex-end;gap:10px"><span class="score tnum" id="pScore">${scoreOf(PUB.panels)}</span><span class="muted" style="padding-bottom:6px">/100 · ${Object.keys(PUB.panels).length}/15 paneles con daño</span></div>${legend()}</div></div>
      <div class="panel-pick">${PANELS.map(([k, n]) => `<div class="pr"><span style="font-size:13.5px">${n}</span><div class="sevs" data-prow="${k}">${SEV.map((t, i) => `<button type="button" data-s="${i}" class="${(PUB.panels[k] || 0) === i ? "on" : ""}">${t}</button>`).join("")}</div></div>`).join("")}</div>
      <div class="fgrid"><div class="field"><label>Llaves</label><div class="pills"><button type="button" class="pill on">Tiene llaves</button><button type="button" class="pill">Sin llaves</button><button type="button" class="pill">Arranque sin llave</button></div></div>
      <div class="field"><label>Conducción</label><div class="pills"><button type="button" class="pill on">Funciona y conduce</button><button type="button" class="pill">Solo arranca</button><button type="button" class="pill">Necesita grúa</button></div></div>
      <div class="field"><label>Airbags</label><div class="pills"><button type="button" class="pill on">No desplegados</button><button type="button" class="pill">Desplegados</button><button type="button" class="pill">Faltantes</button></div></div>
      <div class="field"><label>Urgencia de venta</label><div class="pills"><button type="button" class="pill">Inmediata</button><button type="button" class="pill on">7 días</button><button type="button" class="pill">Sin prisa</button></div></div></div></div>`,
    `<div class="panel" style="display:grid;gap:16px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h3 style="margin:0">Fotos del vehículo</h3><span class="chip bad" id="phCount">0/9 mínimo</span></div>
      <div class="drop">${ic("upload", "lg")}<b>Arrastra las fotos aquí</b><span style="font-size:13px">Mínimo 9: frontal, trasera, laterales, interior, cuadro, motor y daños</span><button type="button" class="btn sm" id="phAdd">Añadir fotos de ejemplo</button></div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h3 style="margin:0">Descripción</h3><button type="button" class="btn sm" id="genDesc">${ic("spark", "sm")}Generar descripción</button></div>
      <textarea class="in" id="pDesc" style="min-height:160px" placeholder="Condición, daños, reparaciones necesarias, historial…"></textarea></div>`,
    `<div class="panel" style="display:grid;gap:16px"><h3 style="margin:0">Tipo de publicación</h3>
      <div class="opt-cards" style="grid-template-columns:1fr 1fr">${[["subasta", "gavel", "Subasta", "Pujas competitivas en la sesión de su categoría"], ["mercado", "store", "Mercado", "Precio fijo para venta directa"]].map(([k, i, t, d]) => k === "subasta" && !AUCTIONS_OPEN
        ? `<button type="button" class="opt soonopt" disabled aria-disabled="true"><b>${ic(i, "sm")}${t}<span class="chip acc">Próximamente</span></b><small>Abrimos muy pronto. Te avisaremos para subastar tu vehículo.</small></button>`
        : `<button type="button" class="opt ${PUB.type === k ? "on" : ""}" data-ptype="${k}"><b>${ic(i, "sm")}${t}</b><small>${k === "mercado" && !AUCTIONS_OPEN ? "Precio fijo para venta directa · gratis en el lanzamiento" : d}</small></button>`).join("")}</div>
      ${PUB.type === "subasta" ? `
      <div class="fgrid"><div class="field"><label for="pFull">Precio deseado (€)</label><input class="in tnum" id="pFull" type="number" value="${PUB.full}"><small class="muted">La puja de salida se sugiere al 25%.</small></div>
      <div class="field"><label for="pStart">Puja de salida (€)</label><input class="in tnum" id="pStart" type="number" value="${Math.round(PUB.full * .25)}"><small class="muted" id="pStartHint"></small></div>
      <div class="field"><label for="pDate">Fecha preferida</label><input class="in" id="pDate" type="date"></div>
      <div class="field"><label for="pRes">Precio de reserva (€, opcional)</label><input class="in tnum" id="pRes" type="number" placeholder="Sin reserva"></div>
      <div class="field full"><label for="pPick">Dirección de recogida * <span class="muted">· privada</span></label><input class="in" id="pPick" placeholder="Calle, número, ciudad"><small class="muted">Solo la recibe el comprador cuando la venta está aceptada y pagada. En las subastas nadie ve quién vende.</small></div></div>
      <div class="trow"><div><b>Compra inmediata</b><small>Los compradores pueden cerrar la venta al instante a tu precio.</small></div><label class="toggle"><input type="checkbox" id="pBuy" ${PUB.buy ? "checked" : ""} aria-label="Compra inmediata"><span></span></label></div>`
      : `<div class="fgrid"><div class="field"><label for="pPrice">Precio de venta (€) *</label><input class="in tnum" id="pPrice" type="number" value="${PUB.full}"></div>
      <div class="field"><label for="pMcat">Categoría</label><select class="in" id="pMcat">${["Vehículos ligeros", "Motocicletas", "Náutica", "Transporte pesado"].map(c => `<option ${PUB.mcat === c ? "selected" : ""}>${c}</option>`).join("")}</select></div></div>
      <div class="trow"><div><b>Precio negociable</b><small>Permite a los compradores enviar ofertas.</small></div><label class="toggle"><input type="checkbox" checked aria-label="Precio negociable"><span></span></label></div>`}
      <div class="trow"><div><b>Oferta directa de MotorSubasta</b><small>Además, recibe una oferta de compra en 24 h. Si la aceptas, se vende sin esperar.</small></div><label class="toggle"><input type="checkbox" id="pDirect" ${PUB.direct ? "checked" : ""} aria-label="Oferta directa"><span></span></label></div>
      <div id="pSummary" style="background:var(--surface-2);border-radius:12px;padding:14px"></div></div>`,
  ][s];
  return `<div class="wrap">
  <div class="admin-head"><div><div class="eyebrow">Vender</div><h1 style="margin-top:8px">Publicar vehículo</h1></div><span class="muted" style="font-size:13px">${ic("check", "sm")} Borrador guardado automáticamente</span></div>
  <div class="stepper">${PUB_STEPS.map((t, i) => `<div class="${i === s ? "on" : i < s ? "done" : ""}"><b>${i < s ? "✓" : "PASO " + (i + 1)}</b>${t}</div>`).join("")}</div>
  <form onsubmit="return false" style="max-width:860px">${body}
  <div style="display:flex;justify-content:space-between;gap:10px;margin-top:16px"><button type="button" class="btn" id="pPrev" ${s === 0 ? "disabled" : ""}>${ic("left", "sm")}Anterior</button>
  <button type="button" class="btn primary" id="pNext">${s === 3 ? ic("check", "sm") + "Enviar a revisión" : "Siguiente " + ic("right", "sm")}</button></div></form></div>`;
}
function mountPublish() {
  const go = d => { PUB.step = Math.max(0, Math.min(3, PUB.step + d)); router(); scrollTo(0, 0); };
  $("#pPrev").onclick = () => go(-1);
  $("#pNext").onclick = () => {
    if (PUB.step === 0) { const v = $("#pVin").value.trim(); if (v.length !== 17) { toast("Introduce un VIN de 17 caracteres o usa el botón de decodificar", "alert"); $("#pVin").focus(); return; } }
    if (PUB.step === 3) { toast("Vehículo enviado a revisión. Te avisamos al aprobarlo.", "check"); notify("Tu vehículo está <b>en revisión</b>. Tiempo medio: 2 h.", "upload"); PUB.step = 0; PUB.panels = {}; location.hash = "#/admin"; return; }
    go(1);
  };
  $$("[data-pcat]").forEach(b => b.onclick = () => { PUB.cat = b.dataset.pcat; $$("[data-pcat]").forEach(x => x.classList.toggle("on", x === b)); });
  $$("#ptitle button").forEach(b => b.onclick = () => { PUB.title = b.dataset.v; $$("#ptitle button").forEach(x => x.classList.toggle("on", x === b)); });
  if ($("#pVin")) {
    $("#pVin").oninput = e => { e.target.value = e.target.value.toUpperCase().replace(/[IOQ]/g, ""); $("#pVinN").textContent = e.target.value.length + "/17 · autocompleta marca, modelo y datos técnicos"; };
    $("#pDecode").onclick = () => { $("#pVin").value = "WBAPH5C55BA123456"; $("#pMake").value = "BMW"; $("#pModel").value = "320d Touring"; $("#pYear").value = 2011; $("#pFuel").value = "Diésel"; $("#pVinN").textContent = "17/17 · VIN decodificado: BMW Serie 3 (E91), 2.0 diésel, 184 CV"; toast("VIN decodificado", "search"); };
  }
  const setPanel = (k, v) => { if (v) PUB.panels[k] = v; else delete PUB.panels[k]; router(); };
  $$("[data-prow]").forEach(row => $$("button", row).forEach(b => b.onclick = () => setPanel(row.dataset.prow, +b.dataset.s)));
  $$(".carmap rect").forEach(r => r.onclick = () => setPanel(r.dataset.panel, ((PUB.panels[r.dataset.panel] || 0) + 1) % 5));
  $$(".pills").forEach(g => $$(".pill", g).forEach(b => { if (!b.dataset.v) b.onclick = () => $$(".pill", g).forEach(x => x.classList.toggle("on", x === b)); }));
  if ($("#phAdd")) {
    let n = 0;
    $("#phAdd").onclick = () => { n = Math.min(50, n + 9); const c = $("#phCount"); c.textContent = n + " fotos"; c.className = "chip ok"; toast(n + " fotos añadidas", "upload"); };
    $("#genDesc").onclick = () => { $("#pDesc").value = `${$("#pDesc").value ? $("#pDesc").value + "\n\n" : ""}Vehículo ${CATS[PUB.cat].short.toLowerCase()}. Documentación: ${docLabel(PUB.title).toLowerCase()}. Puntuación de condición ${scoreOf(PUB.panels)}/100. ${Object.keys(PUB.panels).length ? "Daños declarados en: " + PANELS.filter(p => PUB.panels[p[0]]).map(p => p[1].toLowerCase() + " (" + SEV[PUB.panels[p[0]]].toLowerCase() + ")").join(", ") + "." : "Sin daños declarados."} Se entrega con llaves y arranca correctamente. Ideal para ${PUB.cat === "limpio" ? "uso particular o reventa" : "taller o exportación"}.`; };
  }
  $$("[data-ptype]").forEach(b => b.onclick = () => { PUB.type = b.dataset.ptype; router(); });
  const sum = () => {
    if (!$("#pSummary")) return;
    const sub = PUB.type === "subasta";
    const price = sub ? +($("#pStart").value || 0) : +($("#pPrice").value || 0);
    const rate = sellerRate();
    $("#pSummary").innerHTML = `<div class="kv"><span>${sub ? "Puja de salida" : "Precio de venta"}</span><span class="tnum">${eur(price)}</span></div>
      ${!sub && !AUCTIONS_OPEN ? `<div class="kv"><span>Comisión de venta</span><span class="chip ok">Gratis en el lanzamiento</span></div>`
        : `<div class="kv"><span>Comisión de éxito vendedor <span translate="no">(${(rate * 100).toFixed(1)}% · ${S.plan})</span></span><span class="tnum">${eur((sub ? PUB.full : price) * rate)}</span></div>`}
      <div class="kv"><span>Sesión</span><span>${sub ? CATS[PUB.cat].name + " · " + CATS[PUB.cat].session : "Mercado · 60 días"}</span></div>`;
    if ($("#pStartHint")) $("#pStartHint").textContent = price < PUB.full * .15 ? "Salida muy baja: atrae pujas, pero fija una reserva." : "Salida atractiva para compradores profesionales.";
  };
  if ($("#pFull")) { $("#pFull").oninput = e => { PUB.full = +e.target.value; $("#pStart").value = Math.round(PUB.full * .25); sum(); }; $("#pStart").oninput = sum; $("#pDate").valueAsDate = new Date(Date.now() + 2 * 86400000); $("#pBuy").onchange = e => PUB.buy = e.target.checked; }
  if ($("#pPrice")) { $("#pPrice").oninput = e => { PUB.full = +e.target.value; sum(); }; $("#pMcat").onchange = e => PUB.mcat = e.target.value; }
  if ($("#pDirect")) $("#pDirect").onchange = e => PUB.direct = e.target.checked;
  sum();
}

/* ---------- PRECIOS ---------- */
const PR = { annual: false, mode: "subastas" };
const PLANS = {
  subastas: [
    ["Para compradores", "user", [
      ["Comprador Gratis", 0, [["Dto. comisión", "—"], ["Acceso anticipado", "—"]], ["Pujas manuales", "Todas las subastas públicas"], "Empezar gratis"],
      ["Comprador Pro", 39.99, [["Dto. comisión", "−5%"], ["Acceso anticipado", "+5 min"]], ["Puja automática", "Ver ofertas «Comprar ya» primero", "Alertas por marca y modelo", "Si compras 1 coche al mes, se paga solo"], "Suscribirse", true],
      ["Comprador Dealer", 99.99, [["Dto. comisión", "−10%"], ["Acceso anticipado", "+15 min"]], ["Acceso a Ofertas Ocultas", "Puja automática ilimitada", "Informes DGT incluidos (10/mes)", "Gestor de cuenta"], "Suscribirse"]]],
    ["Para vendedores", "truck", [
      ["Vendedor Gratis", 0, [["Vehículos/mes", "2"], ["Comisión de éxito", "3%"]], ["Publicaciones básicas", "Oferta directa 24 h"], "Empezar gratis"],
      ["Vendedor Pro", 39.99, [["Vehículos/mes", "10"], ["Comisión de éxito", "1,5%"]], ["Analíticas de visitas y pujas", "Soporte prioritario", "Destacado en su sesión"], "Suscribirse", true],
      ["Vendedor Dealer", 99.99, [["Vehículos/mes", "Ilimitado"], ["Comisión de éxito", "0%"]], ["Carga masiva por CSV", "Analíticas avanzadas", "Posicionamiento destacado"], "Suscribirse"]]],
    ["Plan combinado · compra y vende", "users", [
      ["Combinado Starter", 29.99, [["Comisión", "2,5%"], ["Vehículos/mes", "5"]], ["Pujas y publicaciones básicas", "Dto. comisión −1%"], "Suscribirse"],
      ["Combinado Pro", 69.99, [["Comisión", "1,5%"], ["Vehículos/mes", "10"]], ["Acceso anticipado +5 min", "Puja automática", "Analíticas"], "Suscribirse", true],
      ["Combinado Full", 149.99, [["Comisión", "0%"], ["Vehículos/mes", "Ilimitado"]], ["Ofertas Ocultas", "Acceso anticipado +15 min", "Dto. comisión −10%"], "Suscribirse"]]],
  ],
  mercado: [
    ["Para compradores", "user", [
      ["Comprador Gratis", 0, [["Ofertas", "Solo visualización"]], ["Ver precios y fotos", "Ver todos los anuncios"], "Empezar gratis"],
      ["Comprador Pro", 19.99, [["Ofertas/mes", "10"]], ["Chat con vendedores", "Enviar y recibir contraofertas", "Cerrar tratos"], "Suscribirse", true],
      ["Comprador Full", 39.99, [["Ofertas", "Ilimitadas"]], ["Favoritos y alertas ilimitados", "Historial extendido del vehículo", "Reservar vehículos 48 h"], "Suscribirse"]]],
    ["Para vendedores", "truck", [
      ["Vendedor Básico", 0, [["Anuncios/mes", "1"], ["Comisión de éxito", "3%"]], ["Publicación básica", "Visibilidad limitada"], "Empezar gratis"],
      ["Vendedor Pro", 29.99, [["Anuncios/mes", "5"], ["Comisión de éxito", "1,5%"]], ["Categoría motos", "Mayor visibilidad en búsquedas"], "Suscribirse", true],
      ["Vendedor Full", 49.99, [["Anuncios/mes", "20"], ["Comisión de éxito", "0%"]], ["Todas las categorías (ligeros, motos, náutica, pesados)", "Prioridad en búsquedas", "Estadísticas avanzadas"], "Suscribirse"]]],
  ],
};
function viewPricing() {
  const f = p => p === 0 ? "Gratis" : `€${(PR.annual ? p * .83 : p).toFixed(2).replace(".", ",")}<small> /mes</small>`;
  return `<div class="wrap">
  <div class="admin-head"><div><div class="eyebrow">Planes y tarifas</div><h1 style="margin-top:8px">Elige tu plan</h1><p class="muted" style="margin:6px 0 0">Todos pueden participar. Los planes reducen comisiones y dan ventaja. Plan actual: <b style="color:var(--text)">${S.plan}</b></p></div>
  <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><div class="seg" id="prMode"><button data-v="subastas" class="${PR.mode === "subastas" ? "on" : ""}">${ic("gavel", "sm")}Subastas</button><button data-v="mercado" class="${PR.mode === "mercado" ? "on" : ""}">${ic("store", "sm")}Mercado</button></div>
  <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;font-weight:600">Mensual <span class="toggle"><input type="checkbox" id="prAnnual" ${PR.annual ? "checked" : ""} aria-label="Facturación anual"><span></span></span> Anual <span class="chip acc">−17%</span></label></div></div>
  ${PLANS[PR.mode].map(([g, gi, plans]) => `<div style="margin:28px 0 14px;display:flex;gap:10px;align-items:center"><span class="chip acc" style="height:32px;width:32px;justify-content:center;padding:0">${ic(gi, "sm")}</span><h3 style="font-size:20px">${g}</h3></div>
  <div class="plans">${plans.map(([n, p, kvs, feats, cta, pop]) => `<div class="plan ${pop ? "pop" : ""}">${pop ? '<span class="flag">Más popular</span>' : ""}
    <h3>${n}</h3><div class="amt tnum">${f(p)}</div>${PR.annual && p ? `<small class="muted" style="margin-top:-8px">Facturado ${eur(p * .83 * 12)} al año</small>` : ""}
    <div>${kvs.map(([k, v]) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`).join("")}</div>
    <ul>${feats.map(x => `<li>${ic("check", "sm")}${x}</li>`).join("")}</ul>
    <button class="btn ${pop ? "primary" : ""} block" data-plan="${n}" ${S.plan === n ? "disabled" : ""}>${S.plan === n ? "Plan actual" : cta}</button></div>`).join("")}</div>`).join("")}

  <section style="margin-top:48px"><div class="sec-head"><div><div class="eyebrow">Tarifas</div><h2 style="margin-top:8px">Comisión comprador por tramo</h2><p>Se aplica sobre el precio de adjudicación. Precios sin IVA; no incluyen transporte ni gestoría.</p></div></div>
  <div class="tbl-wrap"><table><thead><tr><th>Precio de adjudicación</th><th class="r">Comisión</th><th class="r">Con Pro (−5%)</th><th class="r">Con Dealer (−10%)</th></tr></thead><tbody>
  ${FEES.map(([a, b, c]) => `<tr><td class="tnum">${num(a)} € – ${num(b)} €</td><td class="r tnum">${c} € + IVA</td><td class="r tnum muted">${Math.round(c * .95)} €</td><td class="r tnum muted">${Math.round(c * .9)} €</td></tr>`).join("")}
  <tr><td>16.000 € +</td><td class="r">2,8% del precio + IVA</td><td class="r muted">2,66%</td><td class="r muted">2,52%</td></tr></tbody></table></div></section>

  <section style="margin-top:36px" class="commit">
    <div><h3 style="font-size:20px;margin-bottom:12px">${ic("doc")} Servicios de gestoría</h3><div class="tbl-wrap"><table><tbody>${GESTORIA.map(([n, p]) => `<tr><td>${n}</td><td class="r tnum">${p} € + IVA</td></tr>`).join("")}</tbody></table></div></div>
    <div style="display:grid;gap:14px;align-content:start">
      <div class="panel"><h3>${ic("truck")} Transporte</h3><p class="muted" style="margin:0 0 10px;font-size:13.5px">Estimación desde Alicante con portavehículos (grúa +35%).</p>${Object.entries(TRANSPORT).slice(0, 6).map(([k, v]) => `<div class="kv"><span>${k}</span><span class="tnum">${v} € + IVA</span></div>`).join("")}</div>
      <div class="panel" style="border-color:color-mix(in srgb,var(--bad) 40%,var(--line))"><h3 style="color:var(--bad)">${ic("alert")} Tarifa de reactivación</h3><p class="muted" style="margin:0 0 10px;font-size:13.5px">Reactivación de cuenta por incumplimiento del compromiso de compra.</p><div class="bigprice">349 € <small class="muted" style="font:500 14px var(--body)">+ IVA</small></div></div>
    </div>
  </section>

  <section style="margin-top:40px" class="faq"><h2 style="font-size:28px;font-weight:800;font-stretch:82%;text-transform:uppercase;margin-bottom:8px">Preguntas frecuentes</h2>
    ${[["¿Puedo cancelar en cualquier momento?", "Sí. El plan sigue activo hasta el final del periodo pagado y no se renueva."],
      ["¿Qué métodos de pago aceptan?", "Tarjeta, transferencia SEPA y Bizum para particulares. Las empresas pueden pagar por domiciliación."],
      ["¿Puedo subir o bajar de plan?", "Sí, el cambio es inmediato y se prorratea el importe del periodo en curso."],
      ["¿Qué pasa si gano una subasta y el vendedor no acepta?", "Si la puja no alcanza la reserva, el vendedor decide en 24 h. Si rechaza, no tienes ninguna obligación."],
      ["¿Cómo funciona el anti-sniping?", "Cualquier puja en los dos últimos minutos amplía el cierre dos minutos más, para que todos puedan responder."]].map(([q, a]) => `<details><summary>${q}${ic("chev", "chev")}</summary><p>${a}</p></details>`).join("")}
  </section></div>`;
}
function mountPricing() {
  $$("#prMode button").forEach(b => b.onclick = () => { PR.mode = b.dataset.v; router(); });
  $("#prAnnual").onchange = e => { PR.annual = e.target.checked; router(); };
  $$("[data-plan]").forEach(b => b.onclick = () => modal("Cambiar a " + b.dataset.plan, `<p style="margin:0">Tu plan pasará de <b>${S.plan}</b> a <b>${b.dataset.plan}</b>. Facturación ${PR.annual ? "anual" : "mensual"}.</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">Confirmar</button></div>`, close => {
    $("#cNo").onclick = close;
    $("#cYes").onclick = () => { S.plan = b.dataset.plan; store.set("plan", S.plan); close(); toast("Plan actualizado a " + S.plan, "check"); router(); };
  }));
}

/* ---------- EMPRESA ---------- */
function viewCompany() {
  return `<section class="hero"><div class="mesh" aria-hidden="true"></div><div class="wrap">
    <div><div class="eyebrow">Sobre nosotros</div><h1 style="margin-top:14px;max-width:17ch">Remarketing de vehículos con reglas claras.</h1>
    <p class="lead">Conectamos aseguradoras, rentings, concesionarios y particulares con compradores profesionales. Subastas en tiempo real, mercado a precio fijo y la parte administrativa —documentación, transporte y exportación— resuelta desde la adjudicación hasta la retirada.</p>
    <div class="hero-cta"><a class="btn primary" href="#/precios">Únete a la plataforma ${ic("right", "sm")}</a><a class="btn" href="#/subastas">Explorar subastas</a></div></div>
    <aside class="livepanel">
      <div class="hd">${ic("chart", "sm")}La plataforma en cifras</div>
      <div class="lrow" style="grid-template-columns:1fr auto"><span><b>Vehículos procesados</b><small>Desde el lanzamiento</small></span><span class="rt"><span class="p tnum">500+</span></span></div>
      <div class="lrow" style="grid-template-columns:1fr auto"><span><b>Compradores profesionales</b><small>Talleres, compraventas y exportadores</small></span><span class="rt"><span class="p tnum">50+</span></span></div>
      <div class="lrow" style="grid-template-columns:1fr auto"><span><b>Sesiones diarias</b><small>Limpios, dañados, desguace y ocultas</small></span><span class="rt"><span class="p tnum">4</span></span></div>
      <div class="lrow" style="grid-template-columns:1fr auto"><span><b>Países de exportación</b><small>Con gestión de DUA</small></span><span class="rt"><span class="p tnum">3</span></span></div>
      <div class="ft"><span>Oficina en Alicante · Cobertura nacional</span><a class="link" href="#/empresa">Contacto ${ic("right", "sm")}</a></div>
    </aside></div></section>
  <section class="blk"><div class="wrap num-row">
    <div><b class="tnum">500+</b><span>vehículos procesados</span></div><div><b class="tnum">50+</b><span>compradores profesionales</span></div>
    <div><b class="tnum">3</b><span>países de exportación</span></div><div><b>24/7</b><span>plataforma disponible</span></div></div></section>
  <section class="blk" style="padding-top:0"><div class="wrap split">
    <div><div class="eyebrow">Qué hacemos</div><p class="big-quote" style="margin-top:12px">Subastas en vivo, mercado profesional y servicios integrales en un solo lugar.</p></div>
    <div style="display:grid;gap:12px">
      <div class="panel" style="display:flex;gap:14px">${ic("bolt", "lg")}<div><b>Subastas en tiempo real</b><p class="muted" style="margin:2px 0 0;font-size:14px">Pujas transparentes, pre-puja abierta a todos y oportunidades exclusivas.</p></div></div>
      <div class="panel" style="display:flex;gap:14px">${ic("store", "lg")}<div><b>Mercado profesional</b><p class="muted" style="margin:2px 0 0;font-size:14px">Compraventa a precio fijo con herramientas para el sector.</p></div></div>
      <div class="panel" style="display:flex;gap:14px">${ic("truck", "lg")}<div><b>Logística y exportación</b><p class="muted" style="margin:2px 0 0;font-size:14px">Transporte nacional, DUA y exportación a otros mercados.</p></div></div>
    </div></div></section>
  <section class="blk" style="background:var(--bg-2);border-block:1px solid var(--line)"><div class="wrap">
    <div class="sec-head"><div><div class="eyebrow">Para quién</div><h2 style="margin-top:8px">Diseñado para el sector</h2></div></div>
    <div class="tags">${["Concesionarios", "Compraventas", "Exportadores", "Empresas de renting y leasing", "Flotas corporativas", "Aseguradoras", "Desguaces y recicladores", "Talleres", "Inversores del sector", "Particulares"].map(t => `<span>${t}</span>`).join("")}</div>
    <div class="commit" style="margin-top:28px">
      <div class="panel"><h3>${ic("shield")} Seguridad y confianza</h3><ul class="checks"><li>${ic("check", "sm")}Usuarios verificados con identidad y CIF</li><li>${ic("check", "sm")}Pagos protegidos en cuenta de garantía</li><li>${ic("check", "sm")}Contratos digitales firmados en la plataforma</li><li>${ic("check", "sm")}Protección de datos conforme al RGPD</li></ul></div>
      <div class="panel"><h3>${ic("msg")} Contacto</h3><div class="kv"><span>Email</span><b>info@motorsubasta.com</b></div><div class="kv"><span>Teléfono</span><b>+34 900 000 000</b></div><div class="kv"><span>Oficina</span><b>Alicante, España</b></div><div class="kv"><span>Horario</span><b>L–V 9:00–18:00</b></div></div>
    </div></div></section>`;
}

/* ---------- FAVORITOS ---------- */
function viewFavs() {
  const fav = lots.filter(l => S.favs.has(l.id));
  const bid = lots.filter(l => S.myBids[l.id]);
  const win = bid.filter(l => l.hist[0] && l.hist[0].who === "Tú");
  return `<div class="wrap"><div class="admin-head"><div><div class="eyebrow">Mi cuenta</div><h1 style="margin-top:8px">Favoritos y pujas</h1></div></div>
  <div class="kpis"><div class="kpi"><small>${ic("heart", "sm")}Siguiendo</small><b class="tnum">${fav.length}</b></div><div class="kpi"><small>${ic("gavel", "sm")}Con puja mía</small><b class="tnum">${bid.length}</b></div><div class="kpi"><small>${ic("check", "sm")}Voy ganando</small><b class="tnum" style="color:var(--ok)">${win.length}</b></div><div class="kpi"><small>${ic("alert", "sm")}Superado</small><b class="tnum" style="color:var(--bad)">${bid.length - win.length}</b></div></div>
  ${fav.length ? `<div class="grid">${fav.map(lotCard).join("")}</div>` : `<div class="panel empty">${ic("heart", "lg")}<b>Aún no sigues ningún lote</b><span>Pulsa el corazón en una subasta para verla aquí y recibir avisos.</span><a class="btn primary sm" href="#/subastas">Ver subastas</a></div>`}</div>`;
}
/* ---------- ADMIN ---------- */
const AD = { tab: "resumen", sub: "ofertas", ucat: "all", q: "" };
const ADMIN_TABS = [["resumen", "Resumen", "chart"], ["tareas", "Tareas", "check"], ["subastas", "Subastas", "gavel"], ["catalogo", "Catálogo", "car"], ["usuarios", "Usuarios", "users"], ["finanzas", "Finanzas", "euro"], ["comunicaciones", "Comunicaciones", "msg"], ["config", "Configuración", "gear"]];
function viewAdmin() {
  const pend = S.offers.filter(o => o.st === "new").length + S.users.filter(u => u.st === "pend").length;
  return `<div class="wrap">
  <div class="admin-head"><div><div class="eyebrow">${ic("shield", "sm")} Administración</div><h1 style="margin-top:8px">Panel de control</h1><p class="muted" style="margin:6px 0 0">Usuarios, vehículos, subastas y analíticas de la plataforma.</p></div>
  <div style="display:flex;gap:8px"><a class="btn sm" href="#/publicar">${ic("plus", "sm")}Nuevo vehículo</a><button class="btn sm primary" id="adCreate">${ic("gavel", "sm")}Crear subasta</button></div></div>
  <div class="tabs" role="tablist">${ADMIN_TABS.map(([k, t, i]) => `<button role="tab" data-tab="${k}" class="${AD.tab === k ? "on" : ""}">${ic(i, "sm")}${t}${k === "tareas" && pend ? `<span class="badge-n">${pend}</span>` : ""}</button>`).join("")}</div>
  <div id="adBody"></div></div>`;
}
function renderAdmin() {
  const b = $("#adBody"); if (!b) return;
  const live = lots.filter(l => statusOf(l) === "live"), soon = lots.filter(l => statusOf(l) === "soon");
  const gmv = lots.reduce((a, l) => a + (l.hist.length ? curPrice(l) : 0), 0);
  const T = {
    resumen: () => {
      const days = [...Array(14)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 13 + i); return { d, v: [12, 18, 9, 22, 31, 27, 14, 19, 35, 41, 29, 38, 44, 0][i] }; });
      days[13].v = lots.reduce((a, l) => a + l.hist.filter(h => h.t > T0 - 12 * HOUR).length, 0);
      const mx = 50, W = 560, H = 200, bw = W / 14;
      return `<div class="kpis">
        <div class="kpi"><small>${ic("users", "sm")}Usuarios</small><b class="tnum">${S.users.length + 127}</b><em>+14 esta semana</em></div>
        <div class="kpi"><small>${ic("car", "sm")}Vehículos</small><b class="tnum">${lots.length + market.length}</b><em>${lots.length} en subasta</em></div>
        <div class="kpi"><small>${ic("gavel", "sm")}En vivo</small><b class="tnum" style="color:var(--bad)">${live.length}</b><em style="color:var(--muted)">${soon.length} programadas</em></div>
        <div class="kpi"><small>${ic("euro", "sm")}Volumen pujado hoy</small><b class="tnum">${eur(gmv)}</b><em>+22% vs. semana pasada</em></div>
        <div class="kpi"><small>${ic("euro", "sm")}Comisiones estimadas</small><b class="tnum">${eur(lots.reduce((a, l) => a + (l.hist.length ? buyerFee(curPrice(l)) : 0), 0))}</b><em>sin IVA</em></div>
        <div class="kpi"><small>${ic("eye", "sm")}Visitas hoy</small><b class="tnum">1.284</b><em>+9%</em></div>
      </div>
      <div class="a-grid">
        <div class="panel chart"><div style="display:flex;justify-content:space-between;margin-bottom:10px"><h3 style="margin:0">Pujas por día</h3><span class="muted" style="font-size:12px">Últimos 14 días</span></div>
          <svg viewBox="0 0 ${W + 30} ${H + 30}" role="img" aria-label="Gráfico de pujas por día">
            ${[0, 25, 50].map(v => `<line x1="30" x2="${W + 30}" y1="${H - v / mx * H + 5}" y2="${H - v / mx * H + 5}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="0" y="${H - v / mx * H + 9}">${v}</text>`).join("")}
            ${days.map((x, i) => `<rect x="${30 + i * bw + 5}" y="${H - x.v / mx * H + 5}" width="${bw - 10}" height="${x.v / mx * H}" rx="3" fill="${i === 13 ? "var(--accent)" : "var(--surface-3)"}"><title>${x.d.getDate()}/${x.d.getMonth() + 1}: ${x.v} pujas</title></rect>${i % 2 === 1 || i === 13 ? `<text x="${30 + i * bw + bw / 2}" y="${H + 24}" text-anchor="middle">${x.d.getDate()}/${x.d.getMonth() + 1}</text>` : ""}`).join("")}
            <text x="${30 + 13 * bw + bw / 2}" y="${H - days[13].v / mx * H - 2}" text-anchor="middle" style="fill:var(--text);font-weight:600">${days[13].v}</text>
          </svg></div>
        <div class="panel"><h3>Actividad reciente</h3><ul class="feed">${lots.flatMap(l => l.hist.slice(0, 2).map(h => ({ ...h, l }))).sort((a, b) => b.t - a.t).slice(0, 7).map(x => `<li><span class="dot" style="background:${x.who === "Tú" ? "var(--accent)" : "var(--info)"}"></span><div><b>${x.who}</b> pujó <b class="tnum">${eur(x.amt)}</b> en ${esc(x.l.title)}<div class="faint" style="font-size:12px">${ago(x.t)}</div></div></li>`).join("")}</ul></div>
      </div>
      <div class="panel" style="margin-top:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">${ic("clock")}<b>${live.length} subastas activas</b><span class="muted">· próxima en cerrar: ${live.length ? esc(live.sort((a, b) => a.endsAt - b.endsAt)[0].title) + " en " + fmtLeft(live[0].endsAt - now()) : "—"}</span><button class="btn xs" style="margin-left:auto" data-go="subastas">Gestionar</button></div>`;
    },
    tareas: () => `<div class="seg" style="margin-bottom:14px" id="adSub">${[["ofertas", "Ofertas directas", S.offers.filter(o => o.st === "new").length], ["verif", "Verificaciones", S.users.filter(u => u.st === "pend").length], ["revision", "Vehículos en revisión", 2]].map(([k, t, n]) => `<button data-sub="${k}" class="${AD.sub === k ? "on" : ""}">${t} <span class="chip ${n ? "acc" : ""}" style="height:18px">${n}</span></button>`).join("")}</div>
      ${AD.sub === "ofertas" ? `<div class="tbl-wrap"><table><thead><tr><th>Vehículo</th><th>Vendedor</th><th>Ubicación</th><th>Pide</th><th>Recibida</th><th class="r">Acciones</th></tr></thead><tbody>
        ${S.offers.map(o => `<tr style="${o.st !== "new" ? "opacity:.55" : ""}"><td><div style="display:flex;gap:10px;align-items:center"><img class="th-img" src="${imgSrc(o.img)}" alt=""><div><b>${o.title}</b><div class="muted tnum" style="font-size:12px">${num(o.km)} km</div></div></div></td>
        <td>${o.seller}<div class="muted" style="font-size:12px">${o.mail}</div></td><td>${o.loc}</td><td class="tnum">${eur(o.ask)}</td><td class="muted">hace ${o.d} d</td>
        <td><div class="actions">${o.st === "new" ? `<button class="btn xs primary" data-off="${o.id}" data-a="counter">${ic("bolt", "sm")}Ofertar</button><button class="btn xs bad" data-off="${o.id}" data-a="reject">Rechazar</button>` : `<span class="chip ${o.st === "sent" ? "ok" : "bad"}">${o.st === "sent" ? "Oferta enviada " + eur(o.sent) : "Rechazada"}</span>`}</div></td></tr>`).join("")}</tbody></table></div>`
      : AD.sub === "verif" ? usersTable(S.users.filter(u => u.st === "pend"))
      : `<div class="tbl-wrap"><table><thead><tr><th>Vehículo</th><th>Categoría</th><th>Vendedor</th><th>Condición</th><th class="r">Acciones</th></tr></thead><tbody>
        ${[lots[8], lots[9]].map(l => `<tr><td><div style="display:flex;gap:10px;align-items:center"><img class="th-img" src="${imgSrc(l.img)}" alt=""><b>${esc(l.title)}</b></div></td><td><span class="chip ${CATS[l.cat].chip}">${CATS[l.cat].short}</span></td><td>vincheckspain@gmail.com</td><td class="tnum">${scoreOf(l.panels)}/100</td><td><div class="actions"><a class="btn xs" href="#/subasta/${l.id}">${ic("eye", "sm")}Ver</a><button class="btn xs ok" data-rev="1">Aprobar</button></div></td></tr>`).join("")}</tbody></table></div>`}`,
    subastas: () => `<div class="tbl-wrap"><table><thead><tr><th>Lote</th><th>Estado</th><th class="r">Pujas</th><th class="r">Actual</th><th>Tiempo</th><th class="r">Acciones</th></tr></thead><tbody>
      ${[...lots].sort((a, b) => a.endsAt - b.endsAt).map(l => { const st = statusOf(l); return `<tr><td><div style="display:flex;gap:10px;align-items:center"><img class="th-img" src="${imgSrc(l.img)}" alt=""><div><a href="#/subasta/${l.id}"><b>${esc(l.title)}</b></a><div style="display:flex;gap:4px;margin-top:3px"><span class="chip ${CATS[l.cat].chip}" style="height:20px">${CATS[l.cat].short}</span><span class="faint mono" style="font-size:11px">#${l.id}</span></div></div></div></td>
      <td><span class="status ${st}">${{ live: "En vivo", soon: "Programada", end: "Cerrada" }[st]}</span></td><td class="r tnum">${l.hist.length}</td><td class="r tnum">${eur(curPrice(l))}</td>
      <td class="mono tnum ${st === "live" && l.endsAt - now() < 10 * MIN ? "clock hot" : ""}" style="font-size:13px" data-tm="${l.id}">${st === "end" ? "—" : fmtLeft((st === "live" ? l.endsAt : l.startsAt) - now())}</td>
      <td><div class="actions">${st !== "end" ? `<button class="btn xs" data-ext="${l.id}">${ic("clock", "sm")}+15 min</button><button class="btn xs" data-endnow="${l.id}">Cerrar ya</button>` : `<button class="btn xs" data-relist="${l.id}">${ic("refresh", "sm")}Reprogramar</button>`}</div></td></tr>`; }).join("")}</tbody></table></div>`,
    catalogo: () => `<div class="toolbar" style="margin-top:0"><div class="search">${ic("search")}<input class="in" id="adQ" placeholder="Buscar por modelo, VIN o vendedor…" value="${esc(AD.q)}"></div></div>
      <div class="tbl-wrap"><table><thead><tr><th>Vehículo</th><th>VIN</th><th class="r">Km</th><th>Canal</th><th>Condición</th><th class="r">Precio</th><th>Estado</th></tr></thead><tbody>
      ${[...lots.map(l => ({ img: l.img, t: l.title, vin: l.vin, km: l.km, ch: "Subasta", cat: l.cat, p: curPrice(l), st: statusOf(l) })), ...market.map(m => ({ img: m.img, t: m.year + " " + m.title, vin: "—", km: m.km, ch: "Mercado", cat: m.cat, p: m.price, st: "pub" }))]
        .filter(r => !AD.q || (r.t + r.vin).toLowerCase().includes(AD.q.toLowerCase()))
        .map(r => `<tr><td><div style="display:flex;gap:10px;align-items:center"><img class="th-img" src="${imgSrc(r.img)}" alt=""><b>${esc(r.t)}</b></div></td><td class="mono" style="font-size:12px">${r.vin}</td><td class="r tnum">${num(r.km)}</td><td><span class="chip ${r.ch === "Subasta" ? "acc" : "info"}">${ic(r.ch === "Subasta" ? "gavel" : "store", "sm")}${r.ch}</span></td><td><span class="chip ${CATS[r.cat].chip}">${CATS[r.cat].short}</span></td><td class="r tnum">${eur(r.p)}</td><td><span class="chip ok">Aprobado</span></td></tr>`).join("")}</tbody></table></div>`,
    usuarios: () => `<div class="seg" style="margin-bottom:14px" id="adU">${[["all", "Todos"], ["pend", "Pendientes"], ["ok", "Verificados"], ["blk", "Bloqueados"]].map(([k, t]) => `<button data-u="${k}" class="${AD.ucat === k ? "on" : ""}">${t}</button>`).join("")}</div>${usersTable(S.users.filter(u => AD.ucat === "all" || u.st === AD.ucat))}`,
    finanzas: () => `<div class="kpis"><div class="kpi"><small>Ingresos del mes</small><b class="tnum">${eur(8420)}</b><em>+18%</em></div><div class="kpi"><small>Suscripciones activas</small><b class="tnum">46</b><em>MRR ${eur(2310)}</em></div><div class="kpi"><small>Facturas pendientes</small><b class="tnum">3</b><em style="color:var(--warn)">${eur(1188)}</em></div><div class="kpi"><small>Liquidaciones a vendedores</small><b class="tnum">2</b><em style="color:var(--muted)">${eur(6340)} programado</em></div></div>
      <div class="tbl-wrap"><table><thead><tr><th>Factura</th><th>Cliente</th><th>Concepto</th><th class="r">Importe</th><th>Estado</th></tr></thead><tbody>
      ${[["F-2026-0912", "Talleres Llorca", "Comisión lote 419", 179, "paid"], ["F-2026-0913", "AutoExport Ruse", "Plan Comprador Dealer", 99.99, "paid"], ["F-2026-0914", "Compraventa Elx", "Transferencia + transporte", 239, "pend"], ["F-2026-0915", "Motor Benidorm", "Comisión lote 447", 219, "pend"], ["F-2026-0916", "Pujador #0817", "Reactivación de cuenta", 349, "over"]].map(([n, c, k, a, s]) => `<tr><td class="mono">${n}</td><td>${c}</td><td>${k}</td><td class="r tnum">${eur(a * 1.21)}</td><td><span class="chip ${{ paid: "ok", pend: "warn", over: "bad" }[s]}">${{ paid: "Pagada", pend: "Pendiente", over: "Vencida" }[s]}</span></td></tr>`).join("")}</tbody></table></div>`,
    comunicaciones: () => `<div class="a-grid"><div class="panel" style="display:grid;gap:12px"><h3 style="margin:0">Enviar mensaje</h3>
      <div class="seg" id="chSeg"><button class="on">WhatsApp</button><button>Email</button></div>
      <div class="field"><label for="cmTo">Destinatarios</label><select class="in" id="cmTo"><option>Todos los compradores (134)</option><option>Dealers (12)</option><option>Seguidores de lotes que cierran hoy (41)</option><option>Vendedores con borradores (6)</option></select></div>
      <div class="field"><label for="cmTpl">Plantilla</label><select class="in" id="cmTpl"><option>Recordatorio de sesión</option><option>Nuevos lotes publicados</option><option>Oferta directa lista</option></select></div>
      <div class="field"><label for="cmMsg">Mensaje</label><textarea class="in" id="cmMsg">Hola {nombre}, hoy a las 13:00 empieza la sesión de Vehículos Dañados con ${lots.filter(l => l.cat === "danado").length} lotes. Entra en motorsubasta.com/subastas</textarea></div>
      <button class="btn primary" id="cmSend">${ic("msg", "sm")}Enviar</button></div>
      <div class="panel"><h3>Últimos envíos</h3><ul class="feed">${[["WhatsApp", "Recordatorio de sesión", 134, "98%"], ["Email", "Nuevos lotes publicados", 212, "41% abiertos"], ["WhatsApp", "Oferta directa lista", 1, "Leído"], ["Email", "Factura disponible", 5, "100%"]].map(([c, t, n, r]) => `<li><span class="chip ${c === "Email" ? "info" : "ok"}">${c}</span><div><b>${t}</b><div class="muted" style="font-size:12px">${n} destinatarios · ${r}</div></div></li>`).join("")}</ul></div></div>`,
    config: () => `<div class="panel">${[["Subastas", [["antisnipe", "Anti-sniping", "Una puja en los 2 últimos minutos amplía el cierre 2 minutos."], ["comments", "Comentarios en subastas", "Los usuarios pueden comentar en la página del lote."], ["qa", "Preguntas y respuestas", "Los compradores preguntan y el vendedor responde públicamente."], ["hidden", "Ofertas Ocultas", "Sesión exclusiva para planes Dealer y Combinado Full."]]], ["Mercado", [["mkmsg", "Mensaje en ofertas", "El comprador puede adjuntar un mensaje al ofertar."], ["mkmod", "Moderación de ofertas", "Un moderador aprueba cada oferta antes de enviarla."]]], ["Seguridad", [["veriff", "Verificación de identidad obligatoria", "Exigir verificación antes de la primera puja."]]]]
      .map(([g, items]) => `<div class="eyebrow" style="margin:10px 0 2px">${g}</div>${items.map(([k, t, d]) => `<div class="trow"><div><b>${t}</b><small>${d}</small></div><label class="toggle"><input type="checkbox" data-set="${k}" ${S.settings[k] ? "checked" : ""} aria-label="${t}"><span></span></label></div>`).join("")}`).join("")}</div>`,
  };
  b.innerHTML = T[AD.tab]();
  $$("[data-go]", b).forEach(x => x.onclick = () => { AD.tab = x.dataset.go; router(); });
  $$("[data-sub]", b).forEach(x => x.onclick = () => { AD.sub = x.dataset.sub; renderAdmin(); });
  $$("[data-u]", b).forEach(x => x.onclick = () => { AD.ucat = x.dataset.u; renderAdmin(); });
  $$("[data-off]", b).forEach(x => x.onclick = () => {
    const o = S.offers.find(q => q.id == x.dataset.off);
    if (x.dataset.a === "reject") { o.st = "rej"; toast("Solicitud rechazada. Se ha avisado al vendedor.", "x"); return reAdmin(); }
    modal("Oferta directa", `<p style="margin:0"><b>${o.title}</b> · el vendedor pide <b>${eur(o.ask)}</b></p><div class="field"><label for="ofAmt">Nuestra oferta de compra</label><div class="money"><span>€</span><input class="in" id="ofAmt" type="number" value="${Math.round(o.ask * .85 / 50) * 50}"></div><small class="muted">Válida 24 h. Se envía por WhatsApp y email.</small></div><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">Enviar oferta</button></div>`, close => {
      $("#cNo").onclick = close;
      $("#cYes").onclick = () => { o.st = "sent"; o.sent = +$("#ofAmt").value; close(); toast("Oferta de " + eur(o.sent) + " enviada a " + o.seller, "bolt"); reAdmin(); };
    });
  });
  $$("[data-uact]", b).forEach(x => x.onclick = () => { const u = S.users.find(q => q.mail === x.dataset.mail); u.st = x.dataset.uact; toast(u.st === "ok" ? "Usuario verificado" : "Usuario bloqueado", u.st === "ok" ? "check" : "lock"); reAdmin(); });
  $$("[data-rev]", b).forEach(x => x.onclick = () => { x.closest("tr").remove(); toast("Vehículo aprobado y programado", "check"); });
  $$("[data-ext]", b).forEach(x => x.onclick = () => { const l = lots.find(q => q.id === x.dataset.ext); if (statusOf(l) === "soon") l.startsAt += 15 * MIN; l.endsAt += 15 * MIN; toast("Cierre ampliado 15 minutos", "clock"); renderAdmin(); });
  $$("[data-endnow]", b).forEach(x => x.onclick = () => { const l = lots.find(q => q.id === x.dataset.endnow); l.endsAt = now(); if (l.startsAt > now()) l.startsAt = now() - 1; toast("Subasta cerrada", "gavel"); refresh(); });
  $$("[data-relist]", b).forEach(x => x.onclick = () => { const l = lots.find(q => q.id === x.dataset.relist); l.startsAt = now() + 24 * HOUR; l.endsAt = l.startsAt + 2 * HOUR; toast("Reprogramada para mañana", "refresh"); refresh(); });
  $$("[data-set]", b).forEach(x => x.onchange = () => { S.settings[x.dataset.set] = x.checked; store.set("settings", S.settings); toast("Configuración guardada", "gear"); });
  if ($("#adQ")) $("#adQ").oninput = e => { AD.q = e.target.value; const p = e.target.selectionStart; renderAdmin(); $("#adQ").focus(); $("#adQ").setSelectionRange(p, p); };
  if ($("#cmSend")) $("#cmSend").onclick = () => toast("Mensaje en cola para " + $("#cmTo").value, "msg");
  $$("#chSeg button").forEach(x => x.onclick = () => $$("#chSeg button").forEach(y => y.classList.toggle("on", y === x)));
}
function reAdmin() { const s = scrollY; router(); scrollTo(0, s); }
function usersTable(list) {
  if (!list.length) return `<div class="panel empty">${ic("check", "lg")}<b>Nada pendiente</b></div>`;
  return `<div class="tbl-wrap"><table><thead><tr><th>Email</th><th>Empresa</th><th>Rol</th><th>Estado</th><th>Registro</th><th class="r">Acciones</th></tr></thead><tbody>
  ${list.map(u => `<tr><td>${u.mail}</td><td>${u.co}</td><td><span class="chip acc">${u.role}</span></td><td><span class="chip ${{ pend: "warn", ok: "ok", blk: "bad" }[u.st]}">${{ pend: "Pendiente", ok: "Verificado", blk: "Bloqueado" }[u.st]}</span></td><td class="tnum muted">${u.d}</td>
  <td><div class="actions">${u.st !== "ok" ? `<button class="btn xs ok" data-uact="ok" data-mail="${u.mail}">${ic("check", "sm")}Aprobar</button>` : ""}${u.st !== "blk" ? `<button class="btn xs bad" data-uact="blk" data-mail="${u.mail}">${u.st === "pend" ? "Rechazar" : "Bloquear"}</button>` : ""}</div></td></tr>`).join("")}</tbody></table></div>`;
}
function mountAdmin() {
  $$("[data-tab]").forEach(x => x.onclick = () => { AD.tab = x.dataset.tab; $$("[data-tab]").forEach(y => y.classList.toggle("on", y === x)); renderAdmin(); });
  $("#adCreate").onclick = () => modal("Crear subasta", `<div class="field"><label for="ncV">Vehículo aprobado</label><select class="in" id="ncV">${market.map(m => `<option value="${m.id}">${m.year} ${m.title}</option>`).join("")}</select></div>
    <div class="fgrid"><div class="field"><label for="ncS">Salida (€)</label><input class="in" id="ncS" type="number" value="1000"></div><div class="field"><label for="ncD">Duración</label><select class="in" id="ncD"><option value="60">1 hora</option><option value="120" selected>2 horas</option><option value="1440">24 horas</option></select></div></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">Crear y programar</button></div>`, close => {
    $("#cNo").onclick = close;
    $("#cYes").onclick = () => {
      const m = market.find(q => q.id === $("#ncV").value), st = now() + 30 * MIN;
      lots.push({ id: "L" + (600 + lots.length), img: m.img, year: m.year, make: m.title.split(" ")[0], model: m.title.split(" ").slice(1).join(" "), title: m.year + " " + m.title, km: m.km, fuel: m.fuel, trans: m.trans, city: m.city, prov: "Alicante", cat: m.cat, start: +$("#ncS").value, plate: "••••", cv: 100, body: "—", startsAt: st, endsAt: st + +$("#ncD").value * MIN, panels: {}, noReserve: false, hist: [], watchers: 0, vin: "—", buyNow: null, keys: true, runs: true });
      close(); toast("Subasta creada: empieza en 30 minutos", "gavel"); AD.tab = "subastas"; router();
    };
  });
  renderAdmin();
}

/* ---------- router ---------- */
function route() {
  const h = location.hash.slice(1) || "/";
  const [path, qs] = h.split("?");
  return { path, query: Object.fromEntries(new URLSearchParams(qs || "")) };
}
const ROUTES = [
  [/^\/$/, () => [viewHome(), () => bindCards()]],
  [/^\/subastas$/, q => [viewAuctions(q), mountAuctions]],
  [/^\/subasta\/(\w+)$/, (q, m) => [viewLot(m[1]), () => mountLot(m[1])]],
  [/^\/mercado$/, () => [viewMarket(), mountMarket]],
  [/^\/mercado\/(\w+)$/, (q, m) => [viewMarketItem(m[1]), () => { const it = market.find(x => x.id === m[1]); if (it) { $("#miOffer").onclick = () => offerModal(it); $("#miRes").onclick = () => toast("Reserva de 48 h confirmada", "lock"); } }]],
  [/^\/valoracion$/, () => [viewValuation(), mountValuation]],
  [/^\/publicar$/, q => [viewPublish(q), mountPublish]],
  [/^\/precios$/, () => [viewPricing(), mountPricing]],
  [/^\/empresa$/, () => [viewCompany(), null]],
  [/^\/favoritos$/, () => [viewFavs(), () => bindCards()]],
  [/^\/admin$/, () => [viewAdmin(), mountAdmin]],
];
let lastPath = null;
function router() {
  const { path, query } = route();
  let out = null;
  for (const [re, fn] of ROUTES) { const m = path.match(re); if (m) { out = fn(query, m); break; } }
  if (!out) out = [`<div class="wrap"><div class="empty" style="padding:90px">${ic("alert", "lg")}<b>Página no encontrada</b><a class="btn primary" href="#/">Ir al inicio</a></div></div>`, null];
  $("#app").innerHTML = out[0];
  out[1] && out[1]();
  if (path !== lastPath) { scrollTo(0, 0); lastPath = path; }
  $("#mnav").hidden = true;
  renderHeader(path);
  document.title = "MotorSubasta";
}
function refresh() {
  const { path } = route();
  if (path.startsWith("/subasta/")) { const l = lots.find(x => x.id === path.split("/")[2]); if (l) renderBidbox(l); }
  else if (path === "/subastas") renderSessions();
  else if (path === "/admin") { if (["resumen", "subastas"].includes(AD.tab)) renderAdmin(); }
  else if (path === "/" || path === "/favoritos") $$("[data-price]").forEach(e => { const l = lots.find(x => x.id === e.dataset.price); if (l && !e.textContent.includes("•")) e.textContent = eur(curPrice(l)); });
  renderHeader(path);
}
addEventListener("hashchange", router);

/* ---------- clock tick ---------- */
const lastStatus = {};
setInterval(() => {
  let changed = false;
  lots.forEach(l => { const s = statusOf(l); if (lastStatus[l.id] && lastStatus[l.id] !== s) { changed = true; if (s === "end" && S.myBids[l.id]) notify(l.hist[0].who === "Tú" ? `¡Has ganado <b>${esc(l.title)}</b> por ${eur(curPrice(l))}!` : `Subasta cerrada: <b>${esc(l.title)}</b>. No fuiste el mejor postor.`, "gavel"); } lastStatus[l.id] = s; });
  if (changed) refresh();
  $$("[data-tm]").forEach(e => {
    const l = lots.find(x => x.id === e.dataset.tm); if (!l) return;
    const s = statusOf(l);
    e.textContent = s === "end" ? "—" : fmtLeft((s === "live" ? l.endsAt : l.startsAt) - now());
    e.classList.toggle("hot", s === "live" && l.endsAt - now() < 10 * MIN);
  });
  $$("[data-bar]").forEach(e => { const l = lots.find(x => x.id === e.dataset.bar); if (l && statusOf(l) === "live") e.style.width = Math.min(100, (now() - l.startsAt) / (l.endsAt - l.startsAt) * 100) + "%"; });
}, 1000);

/* ---------- simulated competing bidders ---------- */
function simBid() {
  const live = lots.filter(l => statusOf(l) === "live" && l.cat !== "oculta");
  if (live.length) {
    const favored = live.filter(l => S.myBids[l.id]);
    const l = favored.length && Math.random() < .55 ? favored[Math.floor(Math.random() * favored.length)] : live[Math.floor(Math.random() * live.length)];
    const cur = curPrice(l), wasMe = l.hist[0] && l.hist[0].who === "Tú";
    const who = BIDDERS[Math.floor(Math.random() * BIDDERS.length)];
    const amt = cur + inc(cur) * (Math.random() < .7 ? 1 : 2);
    const max = S.auto[l.id];
    if (wasMe && max && max >= amt) {
      l.hist.unshift({ who, amt, t: now() });
      const counter = Math.min(max, amt + inc(amt));
      l.hist.unshift({ who: "Tú", amt: counter, t: now() + 1 }); S.myBids[l.id] = counter; saveBids();
      notify(`Tu puja automática respondió en <b>${esc(l.title)}</b>: ${eur(counter)}.`, "robot");
    } else {
      l.hist.unshift({ who, amt, t: now() });
      if (S.settings.antisnipe && l.endsAt - now() < 2 * MIN) l.endsAt += 2 * MIN;
      if (wasMe) { notify(`Te han superado en <b>${esc(l.title)}</b>: ${eur(amt)}.`, "alert"); toast("Te han superado en " + l.title, "alert"); }
    }
    refresh();
  }
  setTimeout(simBid, 9000 + Math.random() * 14000);
}

/* boot lives in the last layer */

