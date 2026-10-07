
/* =====================================================================
   p29 — matrículas ocultas en las fotos (detección en el navegador),
   subida real de fotos al publicar y VIN fuera de la vista pública
   ===================================================================== */
var PLATE_CFG = {
  model: "https://huggingface.co/morsetechlab/yolov11-license-plate-detection/resolve/main/license-plate-finetune-v1n.onnx",
  ort: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/",
  conf: 0.32, maxSide: 1920,
};
function loadScriptOnce(src) {
  window.__scripts = window.__scripts || {};
  return window.__scripts[src] || (window.__scripts[src] = new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.async = true; s.onload = res; s.onerror = () => rej(new Error("No se pudo cargar " + src)); document.head.appendChild(s); }));
}
async function plateSession() {
  if (window.__plateS) return window.__plateS;
  await loadScriptOnce(PLATE_CFG.ort + "ort.min.js");
  ort.env.wasm.wasmPaths = PLATE_CFG.ort; ort.env.wasm.numThreads = 1;
  window.__plateS = await ort.InferenceSession.create(PLATE_CFG.model, { executionProviders: ["wasm"] });
  return window.__plateS;
}
function plateSrc(u) {
  const a = new URL(u, location.href);
  if (a.origin === location.origin || a.protocol === "blob:" || a.protocol === "data:" || /\.supabase\.co$/.test(a.hostname)) return a.href;
  return "/api/foto?u=" + encodeURIComponent(a.href);
}
async function plateBitmap(src) {
  if (src instanceof Blob) return createImageBitmap(src);
  const r = await fetch(plateSrc(/^(https?:|data:|blob:)/.test(String(src)) ? src : admPhoto(src))); if (!r.ok) throw new Error("No se pudo leer la foto (" + r.status + ")");
  return createImageBitmap(await r.blob());
}
async function plateDetect(bmp) {
  const sess = await plateSession(), S = 640;
  const cv = document.createElement("canvas"); cv.width = S; cv.height = S; const cx = cv.getContext("2d", { willReadFrequently: true });
  const sc = Math.min(S / bmp.width, S / bmp.height), nw = bmp.width * sc, nh = bmp.height * sc, px = (S - nw) / 2, py = (S - nh) / 2;
  cx.fillStyle = "rgb(114,114,114)"; cx.fillRect(0, 0, S, S); cx.drawImage(bmp, px, py, nw, nh);
  const d = cx.getImageData(0, 0, S, S).data, f = new Float32Array(3 * S * S);
  for (let i = 0; i < S * S; i++) { f[i] = d[i * 4] / 255; f[i + S * S] = d[i * 4 + 1] / 255; f[i + 2 * S * S] = d[i * 4 + 2] / 255; }
  const o = (await sess.run({ [sess.inputNames[0]]: new ort.Tensor("float32", f, [1, 3, S, S]) }))[sess.outputNames[0]];
  const n = o.dims[2], dd = o.data, raw = [];
  for (let i = 0; i < n; i++) { const c = dd[4 * n + i]; if (c > PLATE_CFG.conf) raw.push({ c, x: (dd[i] - px) / sc, y: (dd[n + i] - py) / sc, w: dd[2 * n + i] / sc, h: dd[3 * n + i] / sc }); }
  raw.sort((a, b) => b.c - a.c);
  const iou = (a, b) => { const x1 = Math.max(a.x - a.w / 2, b.x - b.w / 2), y1 = Math.max(a.y - a.h / 2, b.y - b.h / 2), x2 = Math.min(a.x + a.w / 2, b.x + b.w / 2), y2 = Math.min(a.y + a.h / 2, b.y + b.h / 2); const i = Math.max(0, x2 - x1) * Math.max(0, y2 - y1); return i / (a.w * a.h + b.w * b.h - i); };
  const keep = []; raw.forEach(b => { if (keep.every(k => iou(k, b) < 0.3)) keep.push(b); });
  return keep.slice(0, 4).map(b => ({ x: b.x - b.w / 2, y: b.y - b.h / 2, w: b.w, h: b.h, c: b.c }));
}
/* difumina cada recuadro (mosaico suave, funciona en todos los navegadores) */
function plateRender(bmp, boxes) {
  const k = Math.min(1, PLATE_CFG.maxSide / Math.max(bmp.width, bmp.height)), W = Math.round(bmp.width * k), H = Math.round(bmp.height * k);
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H; const cx = cv.getContext("2d");
  cx.drawImage(bmp, 0, 0, W, H);
  boxes.forEach(b => {
    const ew = b.w * 0.16, eh = b.h * 0.38;
    const x = Math.max(0, Math.floor((b.x - ew) * k)), y = Math.max(0, Math.floor((b.y - eh) * k));
    const w = Math.min(W - x, Math.ceil((b.w + 2 * ew) * k)), h = Math.min(H - y, Math.ceil((b.h + 2 * eh) * k));
    if (w < 2 || h < 2) return;
    const t = document.createElement("canvas"), tw = Math.max(3, Math.round(w / 14)), th = Math.max(2, Math.round(h / 14));
    t.width = tw; t.height = th; const tc = t.getContext("2d"); tc.imageSmoothingEnabled = true; tc.drawImage(cv, x, y, w, h, 0, 0, tw, th);
    cx.save(); cx.beginPath(); if (cx.roundRect) cx.roundRect(x, y, w, h, Math.min(h, w) * 0.22); else cx.rect(x, y, w, h); cx.clip();
    cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = "high"; cx.drawImage(t, 0, 0, tw, th, x, y, w, h);
    cx.fillStyle = "rgba(30,30,30,.16)"; cx.fillRect(x, y, w, h); cx.restore();
  });
  return cv;
}
function canvasBlob(cv, q) { return new Promise(r => cv.toBlob(b => r(b), "image/jpeg", q || 0.86)); }
async function photoUpload(blob, folder) {
  if (!live()) return URL.createObjectURL(blob);
  const uid = (await sb.auth.getUser()).data.user.id;
  const path = `${uid}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await sb.storage.from("vehicle-photos").upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw error;
  return sb.storage.from("vehicle-photos").getPublicUrl(path).data.publicUrl;
}
function isBlurred(u, meta) { return /\/blur\//.test(String(u)) || !!(meta && meta.photos_original && meta.photos_original[u]); }

/* ---------- admin: revisar y ocultar en una ficha ---------- */
function admPlateModal(v, photos, done) {
  const items = photos.map(u => ({ u, done: isBlurred(u, v.meta), boxes: [], bmp: null, on: false, st: "pend" }));
  modal("Ocultar matrículas · " + esc(admTitle(v)), `<p class="muted" style="margin:0">Detectamos la matrícula en cada foto y la difuminamos. Revisa el resultado: <b>arrastra</b> sobre la foto para añadir una zona y <b>haz clic</b> en un recuadro para quitarlo.</p>
    <div class="pl-grid" id="plGrid">${items.map((it, i) => `<figure class="pl-it" data-i="${i}"><div class="pl-cv"><img src="${admPhoto(it.u)}" alt=""></div><figcaption><label><input type="checkbox" data-pon="${i}" ${it.done ? "disabled" : ""}> <span data-pst="${i}">${it.done ? "Ya oculta" : "Detectando…"}</span></label></figcaption></figure>`).join("")}</div>
    <div class="pl-foot"><span class="muted" id="plSum">Cargando el detector…</span><div style="display:flex;gap:8px"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes" disabled>${ic("eyeoff", "sm")}Ocultar</button></div></div>`, async close => {
    const box = $(".modal"); if (box) box.classList.add("modal-xl");
    let cancelled = false; $("#cNo").onclick = () => { cancelled = true; close(); };
    const sum = () => { const n = items.filter(x => x.on).length; $("#plSum").textContent = n ? `${n} ${n === 1 ? "foto" : "fotos"} para ocultar` : "Nada que ocultar"; $("#cYes").disabled = !n; $("#cYes").innerHTML = ic("eyeoff", "sm") + (n ? `Ocultar en ${n} ${n === 1 ? "foto" : "fotos"}` : "Ocultar"); };
    const draw = i => {
      const it = items[i], fig = $(`.pl-it[data-i="${i}"] .pl-cv`); if (!fig || !it.bmp) return;
      let cv = fig.querySelector("canvas"); if (!cv) { fig.innerHTML = ""; cv = document.createElement("canvas"); fig.appendChild(cv); bindDraw(i, cv); }
      const k = Math.min(1, 900 / it.bmp.width); cv.width = Math.round(it.bmp.width * k); cv.height = Math.round(it.bmp.height * k); cv.dataset.k = k;
      const c = cv.getContext("2d"); c.drawImage(it.on && it.boxes.length ? plateRender(it.bmp, it.boxes) : it.bmp, 0, 0, cv.width, cv.height);
      c.lineWidth = 3; c.strokeStyle = "#e27122"; it.boxes.forEach(b => c.strokeRect(b.x * k, b.y * k, b.w * k, b.h * k));
      $(`[data-pst="${i}"]`).textContent = it.boxes.length ? `${it.boxes.length} ${it.boxes.length === 1 ? "matrícula" : "zonas"}` : "Sin matrícula detectada";
      const chk = $(`[data-pon="${i}"]`); chk.checked = it.on; chk.disabled = !it.boxes.length;
    };
    const bindDraw = (i, cv) => {
      let st = null;
      const pt = e => { const r = cv.getBoundingClientRect(), k = +cv.dataset.k; return { x: (e.clientX - r.left) / r.width * cv.width / k, y: (e.clientY - r.top) / r.height * cv.height / k }; };
      cv.onpointerdown = e => { st = pt(e); cv.setPointerCapture(e.pointerId); };
      cv.onpointerup = e => {
        if (!st) return; const en = pt(e), it = items[i];
        const w = Math.abs(en.x - st.x), h = Math.abs(en.y - st.y);
        if (w < 8 && h < 8) { const hit = it.boxes.findIndex(b => en.x >= b.x && en.x <= b.x + b.w && en.y >= b.y && en.y <= b.y + b.h); if (hit >= 0) it.boxes.splice(hit, 1); }
        else it.boxes.push({ x: Math.min(st.x, en.x), y: Math.min(st.y, en.y), w, h, c: 1, manual: true });
        it.on = it.boxes.length > 0; st = null; draw(i); sum();
      };
    };
    $$("[data-pon]").forEach(c => c.onchange = () => { const i = +c.dataset.pon; items[i].on = c.checked; draw(i); sum(); });
    try { await plateSession(); } catch (e) { $("#plSum").textContent = "No se pudo cargar el detector: " + e.message; return; }
    for (let i = 0; i < items.length; i++) {
      if (cancelled) return; const it = items[i]; if (it.done) continue;
      try { it.bmp = await plateBitmap(it.u); it.boxes = await plateDetect(it.bmp); it.on = it.boxes.length > 0; draw(i); }
      catch (e) { $(`[data-pst="${i}"]`).textContent = "No se pudo leer"; }
      sum();
    }
    $("#cYes").onclick = async () => {
      const b = $("#cYes"); b.disabled = true; const todo = items.filter(x => x.on && x.bmp);
      const orig = Object.assign({}, (v.meta && v.meta.photos_original) || {}); const out = photos.slice(); let n = 0;
      try {
        for (const it of todo) { b.textContent = `Subiendo ${++n}/${todo.length}…`; const url = await photoUpload(await canvasBlob(plateRender(it.bmp, it.boxes)), "blur/" + v.id); const idx = out.indexOf(it.u); if (idx >= 0) out[idx] = url; orig[url] = it.u; }
        const p = { photos: out, meta: { photos_original: orig, plates_blurred_at: new Date().toISOString() } };
        if (live()) await admRpc("admin_vehicle_save", { p_id: v.id, p }); else { const x = admOff().vs.find(q => q.id === v.id); if (x) { x.photos = out; x.meta = Object.assign({}, x.meta, p.meta); } }
        ADM.photos = out; admDrop("veh", "v:*", "auc", "mk"); close(); admOk(`Matrícula oculta en ${todo.length} ${todo.length === 1 ? "foto" : "fotos"}`, "eyeoff"); done && done();
      } catch (e) { admErr(e); b.disabled = false; sum(); }
    };
  });
}

/* ---------- admin: todo el inventario en dos clics ---------- */
function admPlateBulk(all, done) {
  const act = all.filter(v => !v.archived_at && ["subasta", "mercado"].includes(v.status));
  const sub = act.filter(v => v.status === "subasta");
  const pending = list => list.reduce((a, v) => a + (v.photos || []).filter(u => !isBlurred(u, v.meta)).length, 0);
  modal("Ocultar matrículas en las fotos", `<p style="margin:0">Detectamos la matrícula en cada foto y la difuminamos automáticamente. Las fotos originales quedan guardadas solo para el equipo.</p>
    <div class="arch-rs" style="grid-template-columns:1fr">
      <label class="arch-r"><input type="radio" name="plS" value="sub" checked><span>${ic("gavel", "sm")}Vehículos en subasta · ${sub.length} vehículos · ${pending(sub)} fotos pendientes</span></label>
      <label class="arch-r"><input type="radio" name="plS" value="all"><span>${ic("car", "sm")}Todos los activos (subasta y Mercado) · ${act.length} vehículos · ${pending(act)} fotos pendientes</span></label></div>
    <div class="pl-prog" id="plProg" hidden><div class="pl-bar"><i id="plBar"></i></div><small id="plTxt"></small></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">${ic("eyeoff", "sm")}Empezar</button></div>`, close => {
    let stop = false; $("#cNo").onclick = () => { stop = true; close(); };
    $("#cYes").onclick = async () => {
      const list = $("input[name=plS]:checked").value === "sub" ? sub : act;
      const jobs = list.map(v => ({ v, ph: (v.photos || []).filter(u => !isBlurred(u, v.meta)) })).filter(j => j.ph.length);
      const total = jobs.reduce((a, j) => a + j.ph.length, 0);
      if (!total) { close(); return toast("Todas las fotos ya tienen la matrícula oculta", "check"); }
      $("#cYes").disabled = true; $$("input[name=plS]").forEach(x => x.disabled = true); $("#plProg").hidden = false; $("#cNo").textContent = "Detener";
      const res = { photos: 0, blurred: 0, none: 0, err: 0, review: [] };
      const tick = (t) => { $("#plBar").style.width = (res.photos / total * 100).toFixed(1) + "%"; $("#plTxt").textContent = t; };
      try { tick("Cargando el detector…"); await plateSession(); } catch (e) { tick("No se pudo cargar el detector: " + e.message); return; }
      for (const j of jobs) {
        if (stop) break;
        const v = j.v, out = (v.photos || []).slice(), orig = Object.assign({}, (v.meta && v.meta.photos_original) || {}); let changed = 0, missing = 0;
        for (const u of j.ph) {
          if (stop) break;
          tick(`${admTitle(v)} · foto ${res.photos + 1} de ${total}`);
          try { const bmp = await plateBitmap(u), boxes = await plateDetect(bmp);
            if (boxes.length) { const url = await photoUpload(await canvasBlob(plateRender(bmp, boxes)), "blur/" + v.id); out[out.indexOf(u)] = url; orig[url] = u; changed++; res.blurred++; } else { missing++; res.none++; }
          } catch (e) { res.err++; }
          res.photos++;
        }
        if (changed) {
          const p = { photos: out, meta: { photos_original: orig, plates_blurred_at: new Date().toISOString(), plates_review: missing > 0 } };
          try { if (live()) await admRpc("admin_vehicle_save", { p_id: v.id, p }); else Object.assign(admOff().vs.find(q => q.id === v.id) || {}, { photos: out, meta: Object.assign({}, v.meta, p.meta) }); } catch (e) { res.err++; }
        }
        if (missing && !changed) res.review.push(v);
      }
      admDrop("veh", "v:*", "auc", "mk", "ov");
      $("#plBar").style.width = "100%";
      $("#plTxt").innerHTML = `<b>${res.blurred}</b> fotos con matrícula oculta · ${res.none} sin matrícula visible${res.err ? ` · <span class="bad">${res.err} con error</span>` : ""}${stop ? " · detenido" : ""}`
        + (res.review.length ? `<br><span class="warn">Revisa a mano ${res.review.length} vehículos en los que no se vio ninguna matrícula:</span> ${res.review.slice(0, 8).map(v => `<a class="link" href="#/admin/vehiculo/${v.id}">${esc(admTitle(v))}</a>`).join(", ")}` : "");
      $("#cNo").textContent = "Cerrar"; $("#cNo").onclick = () => { close(); done && done(); };
    };
  });
}

/* ---------- enganches en la consola ---------- */
(function hookAdminPlates() {
  const i = ROUTES.findIndex(r => String(r[0]) === String(/^\/admin\/vehiculos$/));
  if (i >= 0) ROUTES[i] = [ROUTES[i][0], admRoute("vehiculos", "Vehículos", "Todo el inventario: subasta, Mercado, sin publicar y vendidos.",
    `<button class="btn sm" id="admBlurAll">${ic("eyeoff", "sm")}<span>Ocultar matrículas</span></button><button class="btn sm" id="admCsvVeh">${ic("doc", "sm")}<span>Exportar</span></button><button class="btn sm primary" id="admNewVeh">${ic("plus", "sm")}<span>Nuevo vehículo</span></button>`)];
  const R = ADM_R.vehiculos, bb = R.bind;
  R.bind = (d, q, m, draw) => { bb(d, q, m, draw); const b = $("#admBlurAll"); if (b) b.onclick = () => admPlateBulk(d.veh, () => admMount("vehiculos", {}, m)); };
  const E = ADM_R.vehiculo, eb = E.bind;
  E.bind = (d, q, m, draw) => {
    eb(d, q, m, draw);
    const ph = $("#ePhotos"); if (!ph || d.isNew) return;
    const head = ph.closest(".panel").querySelector(".adm-ph");
    if (head && !head.querySelector("#ePlBlur")) {
      const pend = (ADM.photos || []).filter(u => !isBlurred(u, d.v.meta)).length;
      head.insertAdjacentHTML("beforeend", `<button class="btn xs" id="ePlBlur">${ic("eyeoff", "sm")}Ocultar matrículas${pend ? ` <i class="adm-b">${pend}</i>` : ""}</button>`);
      $("#ePlBlur").onclick = () => { if (!(ADM.photos || []).length) return toast("Este vehículo no tiene fotos", "alert"); admPlateModal(d.v, ADM.photos.slice(), () => admMount("vehiculo", q, m)); };
    }
  };
})();

/* ---------- publicar: fotos reales, con matrícula oculta opcional ---------- */
window.PUB_FILES = window.PUB_FILES || [];
function pubPhotosBlock() {
  const files = window.PUB_FILES, sub = typeof PUB !== "undefined" && PUB.type === "subasta";
  if (sub) PUB.blur = true; else if (PUB.blur == null) PUB.blur = true;
  return `<div class="pph">
    <div class="pph-grid" id="phGrid">${files.map((f, i) => `<figure draggable="true" data-pi="${i}"><img src="${f.url}" alt="">${i === 0 ? `<span class="chip acc">Portada</span>` : ""}<button type="button" class="pph-x" data-px="${i}" aria-label="Quitar foto">${ic("x", "sm")}</button></figure>`).join("")}
      <label class="pph-add drop" id="phDrop">${ic("upload", "lg")}<b>${files.length ? "Añadir más fotos" : "Arrastra las fotos aquí o haz clic"}</b><span style="font-size:13px">Frontal, trasera, laterales, interior, cuadro, motor y daños · hasta 30</span><input type="file" id="phInput" accept="image/*" multiple hidden></label></div>
    <label class="adm-tog pph-blur"><input type="checkbox" id="phBlur" ${PUB.blur ? "checked" : ""} ${sub ? "disabled" : ""}><span class="toggle-ui"></span><span><b>Ocultar la matrícula en las fotos</b><small>${sub ? "En subasta la ocultamos siempre: compradores y vendedores no se identifican." : "Gratis. Se hace en tu navegador antes de subir las fotos."}</small></span></label>
    <button type="button" id="phAdd" hidden></button></div>`;
}
function pubPhotosMount() {
  const grid = $("#phGrid"); if (!grid) return;
  const files = window.PUB_FILES;
  const cnt = $("#phCount"); if (cnt) { cnt.textContent = files.length ? files.length + (files.length === 1 ? " foto" : " fotos") : "Sin fotos"; cnt.className = "chip " + (files.length >= 6 ? "ok" : files.length ? "warn" : "bad"); }
  const rerender = () => { const host = grid.closest(".pph"); host.outerHTML = pubPhotosBlock(); pubPhotosMount(); };
  const add = list => { [...list].filter(f => /^image\//.test(f.type)).slice(0, 30 - files.length).forEach(f => files.push({ file: f, url: URL.createObjectURL(f) })); rerender(); };
  $("#phInput").onchange = e => add(e.target.files);
  const dz = $("#phDrop"); dz.ondragover = e => { e.preventDefault(); dz.classList.add("over"); }; dz.ondragleave = () => dz.classList.remove("over"); dz.ondrop = e => { e.preventDefault(); add(e.dataTransfer.files); };
  $$("[data-px]", grid).forEach(b => b.onclick = e => { e.preventDefault(); const i = +b.dataset.px; URL.revokeObjectURL(files[i].url); files.splice(i, 1); rerender(); });
  let from = null; $$("figure[data-pi]", grid).forEach(f => { f.ondragstart = () => from = +f.dataset.pi; f.ondragover = e => e.preventDefault(); f.ondrop = e => { e.preventDefault(); const to = +f.dataset.pi; if (from == null || from === to) return; files.splice(to, 0, files.splice(from, 1)[0]); from = null; rerender(); }; });
  const bl = $("#phBlur"); if (bl) bl.onchange = () => { PUB.blur = bl.checked; };
}
async function pubUploadPhotos(v) {
  const files = window.PUB_FILES; if (!files.length || !live()) return [];
  const urls = [], blur = PUB.type === "subasta" || PUB.blur;
  const t = document.createElement("div"); t.className = "toast"; t.innerHTML = ic("upload") + "<span>Subiendo fotos…</span>"; $("#toasts").appendChild(t);
  if (blur) { try { await plateSession(); } catch (e) {} }
  for (let i = 0; i < files.length; i++) {
    t.querySelector("span").textContent = `Subiendo fotos ${i + 1}/${files.length}${blur ? " · ocultando matrícula" : ""}…`;
    try { const bmp = await createImageBitmap(files[i].file); let boxes = []; if (blur && window.__plateS) { try { boxes = await plateDetect(bmp); } catch (e) {} }
      urls.push(await photoUpload(await canvasBlob(plateRender(bmp, boxes)), v.id)); } catch (e) { console.warn("foto", e); }
  }
  t.remove();
  if (urls.length) { const { error } = await sb.from("vehicles").update({ photos: urls }).eq("id", v.id); if (error) toast("Fotos subidas, pero no se pudieron guardar: " + esc(error.message), "alert"); }
  files.forEach(f => URL.revokeObjectURL(f.url)); files.length = 0;
  return urls;
}
(function hookPublishPhotos() {
  const base = sbPublishVehicle;
  sbPublishVehicle = async function () { const v = await base.apply(this, arguments); if (v && v.id) { await pubUploadPhotos(v); try { await sbLoadMarket(); } catch (e) {} } return v; };
  patchRoute(/^\/publicar$/, () => { const g = $("#phGrid"); if (g) pubPhotosMount(); });
})();

/* ---------- Mercado: VIN solo con sesión iniciada ---------- */
(function vinMercado() {
  patchRoute(/^\/mercado\/([\w-]+)$/, async (q, m) => {
    const host = $(".mkd-ok") || $(".mkd-feat") || $(".specs"); if (!host || $(".vinrow")) return;
    if (!S.user) { host.insertAdjacentHTML("afterend", `<div class="vinrow">${ic("lock", "sm")}<span>VIN <b class="mono">•••••••••••••••••</b></span><a class="link" href="#/login?next=${encodeURIComponent("#/mercado/" + m[1])}">Inicia sesión para verlo</a></div>`); return; }
    if (!live()) return;
    try { const { data } = await sb.rpc("listing_vin", { p_listing: m[1] }); if (data && !$(".vinrow")) { host.insertAdjacentHTML("afterend", `<div class="vinrow">${ic("search", "sm")}<span>VIN <b class="mono" translate="no">${esc(data)}</b></span><button type="button" class="link" data-copy-vin>Copiar</button></div>`); const cb = $("[data-copy-vin]"); if (cb) cb.onclick = () => { try { navigator.clipboard.writeText(data); toast("VIN copiado", "check"); } catch (e) {} }; } } catch (e) {}
  });
})();
