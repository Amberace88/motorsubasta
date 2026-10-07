/* ============================================================
   v12 — idiomas: español (base) · English · Português · Polski · Українська
   La aplicación sigue escribiendo en español; una capa fina traduce lo
   que llega al DOM (texto, placeholder, title, aria-label) con
   diccionarios que se cargan bajo demanda desde /i18n/<lang>.json.
   Las cifras de un texto se tratan como huecos {0}, {1}…, así una sola
   entrada sirve para "16 lotes" y "3 lotes".
   Lo marcado con translate="no" (p. ej. el texto legal del contrato)
   no se toca.
   ============================================================ */
var LANGS = ["es", "en", "pt", "pl", "uk"];
var LANG_NAMES = { es: "Español", en: "English", pt: "Português", pl: "Polski", uk: "Українська" };
var LANG_LOCALE = { es: "es-ES", en: "en-GB", pt: "pt-PT", pl: "pl-PL", uk: "uk-UA" };
var LANG = "es";
var LANG_CODE = { es: "ES", en: "EN", pt: "PT", pl: "PL", uk: "UA" };   /* lo que ve la gente: "UK" se leería como Reino Unido */
var I18N = {};                       /* lang -> Map(es -> traducción) */
var I18N_SEEN = null;                /* modo extracción: recoge textos sin traducir */
const I18N_ORIG = new WeakMap();     /* nodo de texto -> { es, out } */
const I18N_ATTR = new WeakMap();     /* elemento -> { attr: { es, out } } */
const I18N_ATTRS = ["placeholder", "title", "aria-label", "alt"];
const I18N_NUM = /\d(?:[\d.,:  ]*\d)?/g;
const I18N_HAS_WORD = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ¿¡]{2}/;

/* ---------- consulta ---------- */
function i18nNorm(s) { return String(s).replace(/\s+/g, " ").trim(); }
function i18nLookup(core, lang) {
  const D = I18N[lang]; if (!D) return null;
  let t = D.get(core);
  if (t != null) return t;
  const nums = [];
  const key = core.replace(I18N_NUM, m => { nums.push(m); return "{" + (nums.length - 1) + "}"; });
  if (nums.length) { t = D.get(key); if (t != null) return t.replace(/\{(\d+)\}/g, (m, i) => nums[+i] != null ? nums[+i] : m); }
  if (core.includes(" · ")) {
    const parts = core.split(" · "), out = parts.map(p => i18nLookup(p, lang));
    if (out.some(x => x != null)) return out.map((x, i) => x != null ? x : parts[i]).join(" · ");
  }
  const m = core.match(/^(.*?)([:.…!?]+)$/);        /* "Precio:" usa la entrada de "Precio" */
  if (m && m[1] && D.has(m[1])) return D.get(m[1]) + m[2];
  return null;
}
/* API para el código: tr("Hola {nombre}", {nombre}) */
function tr(s, vars, lang) {
  lang = lang || LANG;
  let out = lang === "es" ? s : (i18nLookup(i18nNorm(s), lang) || s);
  if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return out;
}

/* ---------- traducción del DOM ---------- */
function i18nSkip(el) {
  return !el || !!el.closest('[translate="no"],.notranslate,script,style,textarea,code,pre,svg,[contenteditable="true"]');
}
function i18nText(node) {
  const v = node.nodeValue; if (!v) return;
  let rec = I18N_ORIG.get(node);
  if (rec && v === rec.out && rec.lang === LANG) return;      /* ya es nuestra traducción */
  if (!rec || v !== rec.out) rec = { es: v, out: v };         /* texto nuevo de la app (en español) */
  rec.lang = LANG;
  if (!I18N_HAS_WORD.test(v)) { I18N_ORIG.set(node, rec); return; }
  if (LANG === "es") { if (rec.out !== rec.es) { rec.out = rec.es; node.nodeValue = rec.es; } I18N_ORIG.set(node, rec); if (I18N_SEEN) I18N_SEEN.add(i18nNorm(rec.es)); return; }
  const core = i18nNorm(rec.es), t = i18nLookup(core, LANG);
  if (t == null) { if (I18N_SEEN) I18N_SEEN.add(core); if (rec.out !== rec.es) { rec.out = rec.es; node.nodeValue = rec.es; } I18N_ORIG.set(node, rec); return; }
  const lead = /^\s/.test(rec.es) ? " " : "", trail = /\s$/.test(rec.es) ? " " : "";
  rec.out = lead + t + trail;
  I18N_ORIG.set(node, rec);
  if (node.nodeValue !== rec.out) node.nodeValue = rec.out;
}
function i18nAttrs(el) {
  let recs = I18N_ATTR.get(el);
  for (const a of I18N_ATTRS) {
    const v = el.getAttribute(a); if (v == null || !I18N_HAS_WORD.test(v)) continue;
    recs = recs || {};
    let r = recs[a];
    if (r && v === r.out && r.lang === LANG) continue;
    if (!r || v !== r.out) r = { es: v, out: v };
    r.lang = LANG;
    if (r.out !== r.es) { el.setAttribute(a, r.es); r.out = r.es; }
    if (LANG !== "es") {
      const t = i18nLookup(i18nNorm(v), LANG);
      if (t != null) { r.out = t; el.setAttribute(a, t); }
      else if (I18N_SEEN && a !== "alt") I18N_SEEN.add(i18nNorm(v));
    } else if (I18N_SEEN && a !== "alt") I18N_SEEN.add(i18nNorm(v));
    recs[a] = r;
  }
  if (recs) I18N_ATTR.set(el, recs);
}
function i18nWalk(root) {
  if (!root) return;
  if (root.nodeType === 3) { if (!i18nSkip(root.parentElement)) i18nText(root); return; }
  if (root.nodeType !== 1 || i18nSkip(root)) return;
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => i18nSkip(n.parentElement) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  let n; while ((n = tw.nextNode())) i18nText(n);
  if (root.matches && root.matches("[placeholder],[title],[aria-label],[alt]")) i18nAttrs(root);
  root.querySelectorAll("[placeholder],[title],[aria-label],[alt]").forEach(el => { if (!i18nSkip(el)) i18nAttrs(el); });
}
/* volver al español: cada nodo recupera su texto original */
function i18nRestore(root) {
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n; while ((n = tw.nextNode())) { const r = I18N_ORIG.get(n); if (r && n.nodeValue === r.out && r.out !== r.es) { n.nodeValue = r.es; r.out = r.es; } }
  root.querySelectorAll("[placeholder],[title],[aria-label],[alt]").forEach(el => {
    const recs = I18N_ATTR.get(el); if (!recs) return;
    for (const a in recs) { const r = recs[a]; if (el.getAttribute(a) === r.out && r.out !== r.es) { el.setAttribute(a, r.es); r.out = r.es; } }
  });
}

/* observador: traduce lo que la app pinta, sin entrar en bucle consigo mismo */
var I18N_MO = null;
function i18nObserve() {
  if (I18N_MO) return;
  I18N_MO = new MutationObserver(list => {
    if (LANG === "es" && !I18N_SEEN) return;
    for (const m of list) {
      if (m.type === "characterData") { if (!i18nSkip(m.target.parentElement)) i18nText(m.target); }
      else if (m.type === "childList") m.addedNodes.forEach(n => i18nWalk(n));
      else if (m.type === "attributes" && !i18nSkip(m.target)) i18nAttrs(m.target);
    }
  });
  I18N_MO.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: I18N_ATTRS });
}

/* ---------- carga y cambio de idioma ---------- */
async function i18nLoad(lang) {
  if (lang === "es" || I18N[lang]) return true;
  try {
    const r = await fetch(`i18n/${lang}.json`, { cache: "no-cache" });   /* revalida con ETag: un 304 si no ha cambiado */
    if (!r.ok) throw new Error(r.status);
    const obj = await r.json(), map = new Map();
    for (const k in obj) if (obj[k]) map.set(i18nNorm(k), obj[k]);
    I18N[lang] = map;
    return true;
  } catch (e) { console.warn("i18n: no se pudo cargar", lang, e.message); return false; }
}
async function setLang(lang, opts = {}) {
  if (!LANGS.includes(lang)) lang = "es";
  if (lang !== "es" && !(await i18nLoad(lang))) { toast("No se pudo cargar el idioma", "alert"); return; }
  const prev = LANG;
  LANG = lang;
  window.NUMLOC = LANG_LOCALE[lang];
  document.documentElement.lang = lang;
  if (!opts.silent) store.set("lang", lang);
  if (prev !== "es" && lang === "es") i18nRestore(document.body);
  i18nObserve();
  router();                                    /* repinta con cifras y fechas del idioma */
  i18nWalk(document.body);
  renderLangUI();
  document.documentElement.classList.remove("i18n-wait");
}


/* banderas en SVG (los emoji de bandera no se ven en Windows) */
var FLAG_N = 0;
function flag(l) {
  const id = "fl" + (++FLAG_N);
  const body = {
    es: '<rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/>',
    en: `<clipPath id="${id}t"><path d="M15 10h15v10zv10H0zH0V0zV0h15z"/></clipPath><rect width="30" height="20" fill="#012169"/><path d="M0 0l30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0l30 20M30 0L0 20" stroke="#C8102E" stroke-width="2.4" clip-path="url(#${id}t)"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6.4"/><path d="M15 0v20M0 10h30" stroke="#C8102E" stroke-width="3.8"/>`,
    pt: '<rect width="30" height="20" fill="#DA291C"/><rect width="12" height="20" fill="#046A38"/><circle cx="12" cy="10" r="4.4" fill="none" stroke="#FFE900" stroke-width="1.4"/><path d="M9.9 7.4h4.2v3.5a2.1 2.1 0 0 1-4.2 0z" fill="#fff" stroke="#DA291C" stroke-width=".7"/>',
    pl: '<rect width="30" height="20" fill="#fff"/><rect y="10" width="30" height="10" fill="#DC143C"/>',
    uk: '<rect width="30" height="20" fill="#0057B7"/><rect y="10" width="30" height="10" fill="#FFD700"/>',
  }[l] || "";
  return `<span class="flag" aria-hidden="true"><svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice">${body}</svg></span>`;
}

/* ---------- interfaz: selector en la cabecera, menú móvil y pie ---------- */
function renderLangUI() {
  const tools = $(".top .tools");
  if (tools && !$("#langBtn")) {
    const w = document.createElement("div");
    w.className = "langwrap"; w.style.position = "relative";
    w.innerHTML = `<button class="icon-btn langbtn" id="langBtn" aria-haspopup="true" aria-label="Idioma"></button><div class="menu-pop langpop" id="langMenu" hidden translate="no"></div>`;
    tools.insertBefore(w, $("#themeBtn"));
    $("#langBtn").onclick = e => { e.stopPropagation(); const m = $("#langMenu"); m.hidden = !m.hidden; e.currentTarget.setAttribute("aria-expanded", !m.hidden); };
    document.addEventListener("click", e => { const m = $("#langMenu"); if (m && !m.hidden && !e.target.closest(".langwrap")) m.hidden = true; });
  }
  const b = $("#langBtn");
  if (b) b.innerHTML = flag(LANG) + `<span class="lc" translate="no">${LANG_CODE[LANG]}</span>` + ic("chev", "sm chev");
  const m = $("#langMenu");
  if (m) {
    m.innerHTML = LANGS.map(l => `<button data-lang="${l}" class="${l === LANG ? "on" : ""}" lang="${l}">${flag(l)}<span class="nm">${LANG_NAMES[l]}</span><span class="lc">${LANG_CODE[l]}</span>${l === LANG ? ic("check", "sm") : ""}</button>`).join("");
    $$("[data-lang]", m).forEach(x => x.onclick = () => { m.hidden = true; if (x.dataset.lang !== LANG) setLang(x.dataset.lang); });
  }
  let foot = $("#footLang");
  if (!foot) {
    const bar = $("footer .wrap:last-child");
    if (bar) { foot = document.createElement("span"); foot.id = "footLang"; foot.className = "footlang"; foot.setAttribute("translate", "no"); bar.insertBefore(foot, bar.lastElementChild); }
  }
  if (foot) {
    foot.innerHTML = LANGS.map(l => `<a href="javascript:void 0" data-flang="${l}" class="${l === LANG ? "on" : ""}" lang="${l}">${flag(l)}${LANG_NAMES[l]}</a>`).join("");
    $$("[data-flang]", foot).forEach(a => a.onclick = e => { e.preventDefault(); if (a.dataset.flang !== LANG) { setLang(a.dataset.flang); scrollTo({ top: 0, behavior: "smooth" }); } });
  }
}
/* el menú móvil se repinta con la cabecera: añadimos los idiomas al final */
(function hookHeaderLang() {
  const base = renderHeader;
  renderHeader = function (path) {
    base(path);
    const mn = $("#mnav");
    if (mn && !mn.querySelector(".mlang")) mn.insertAdjacentHTML("beforeend", `<div class="mlang" translate="no">${LANGS.map(l => `<button data-mlang="${l}" class="${l === LANG ? "on" : ""}" lang="${l}">${flag(l)}${LANG_CODE[l]}</button>`).join("")}</div>`);
    $$("[data-mlang]", mn || document).forEach(x => x.onclick = () => { if (x.dataset.mlang !== LANG) setLang(x.dataset.mlang); });
    renderLangUI();
  };
})();

/* sugerencia discreta si el navegador está en otro idioma que tenemos */
function i18nSuggest() {
  if (LANG !== "es" || store.get("lang", null) || store.get("langAsked", false)) return;
  const nav = String(navigator.language || "").slice(0, 2).toLowerCase();
  if (!LANGS.includes(nav) || nav === "es") return;
  const hello = { en: "View this site in English?", pt: "Ver este site em português?", pl: "Wyświetlić stronę po polsku?", uk: "Показати сайт українською?" }[nav];
  const yes = { en: "Switch to English", pt: "Mudar para português", pl: "Przełącz na polski", uk: "Перейти на українську" }[nav];
  const d = document.createElement("div");
  d.className = "langhint"; d.setAttribute("translate", "no"); d.setAttribute("role", "dialog"); d.setAttribute("lang", nav);
  d.innerHTML = `${flag(nav)}<span>${hello}</span><button class="btn sm primary" id="lhYes">${yes}</button><button class="icon-btn" id="lhNo" aria-label="×">${ic("x", "sm")}</button>`;
  document.body.appendChild(d);
  const done = () => { store.set("langAsked", true); d.classList.add("out"); setTimeout(() => d.remove(), 300); };
  $("#lhYes").onclick = () => { done(); setLang(nav); };
  $("#lhNo").onclick = done;
}

/* fechas del calendario de subastas en el idioma activo */
function uiLoc() { return window.NUMLOC || "es-ES"; }

/* ---------- arranque ---------- */
(function i18nBoot() {
  const m = (location.search + "&" + location.hash).match(/[?&]lang=(es|en|pt|pl|uk)\b/);
  const want = (m && m[1]) || store.get("lang", null) || "es";
  if (want !== "es") {
    document.documentElement.classList.add("i18n-wait");
    setTimeout(() => document.documentElement.classList.remove("i18n-wait"), 1500);   /* nunca dejar la página en blanco */
    setLang(want);
  } else {
    i18nObserve(); renderLangUI(); router();
    setTimeout(i18nSuggest, 2500);
  }
})();
