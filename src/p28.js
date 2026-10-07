
/* =====================================================================
   p28 — archivo de vehículos y confirmación de disponibilidad
   Un vehículo puede venderse fuera de MotorSubasta: el equipo lo archiva,
   pide confirmación al vendedor o el propio vendedor avisa en un clic.
   ===================================================================== */
var STALE_DAYS = 14;
var ARCH_REASONS = [
  ["vendido_fuera", "Vendido fuera de MotorSubasta", "check"],
  ["vendido_aqui", "Vendido a través de MotorSubasta", "gavel"],
  ["retirado_vendedor", "El vendedor ya no lo vende", "eyeoff"],
  ["sin_respuesta", "El vendedor no responde", "clock"],
  ["duplicado", "Anuncio duplicado", "doc"],
  ["spam", "Datos falsos o spam", "alert"],
  ["otro", "Otro motivo", "msg"],
];
function archLabel(k) { const r = ARCH_REASONS.find(x => x[0] === k); return r ? r[1] : (k || "Archivado"); }
function vAge(v) { const t = +new Date(v.confirmed_at || v.created_at || now()); return Math.max(0, Math.floor((now() - t) / 86400000)); }
function vActive(v) { return !v.archived_at && ["subasta", "mercado"].includes(v.status); }
function vStale(v) { return vActive(v) && vAge(v) >= STALE_DAYS; }
function vConfirmChip(v) {
  if (v.archived_at) return `<span class="chip">${ic("doc", "sm")}Archivado</span>`;
  if (!vActive(v)) return "";
  const d = vAge(v);
  if (v.confirm_requested_at && (!v.confirmed_at || +new Date(v.confirm_requested_at) > +new Date(v.confirmed_at))) return `<span class="chip info" title="Pedido ${ADM_FMT.dt(v.confirm_requested_at)}">${ic("clock", "sm")}Confirmación pedida</span>`;
  return d >= STALE_DAYS ? `<span class="chip warn" title="Última confirmación hace ${d} días">${ic("alert", "sm")}Sin confirmar · ${d} d</span>` : `<span class="chip ok" title="${v.confirmed_by ? "Confirmado por " + esc(v.confirmed_by) : "Publicado"} hace ${d} días">${ic("check", "sm")}${v.confirmed_at ? "Confirmado" : "Reciente"} · ${d} d</span>`;
}

/* ---------- acciones ---------- */
async function admArchive(v, done) {
  modal("Archivar vehículo", `<p style="margin:0">El anuncio deja de verse en la web y sale del inventario activo. No se borra: queda en <b>Archivados</b> con su historial y puedes restaurarlo cuando quieras.</p>
    <div class="arch-rs">${ARCH_REASONS.map(([k, t, i], n) => `<label class="arch-r"><input type="radio" name="arR" value="${k}" ${n === 0 ? "checked" : ""}><span>${ic(i, "sm")}${t}</span></label>`).join("")}</div>
    <div class="fgrid" id="arSold"><div class="field"><label for="arP">Precio de venta <small class="muted">si lo sabes</small></label><div class="money"><span>€</span><input class="in" id="arP" type="number" min="0" placeholder="opcional"></div></div>
      <div class="field"><label for="arB">Comprador <small class="muted">opcional</small></label><input class="in" id="arB" placeholder="Nombre o empresa"></div></div>
    <div class="field"><label for="arN">Nota interna</label><textarea class="in" id="arN" rows="2" placeholder="Ej.: lo vendió en Wallapop la semana pasada (llamada 12/10)"></textarea></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">${ic("doc", "sm")}Archivar</button></div>`, close => {
    const sync = () => { const r = ($("input[name=arR]:checked") || {}).value; $("#arSold").hidden = !/^vendido/.test(r); };
    $$("input[name=arR]").forEach(x => x.onchange = sync); sync();
    $("#cNo").onclick = close;
    $("#cYes").onclick = async () => {
      const reason = $("input[name=arR]:checked").value, p = { price: $("#arP").value, buyer: $("#arB").value.trim(), notes: $("#arN").value.trim() };
      $("#cYes").disabled = true;
      try {
        if (live()) await admRpc("admin_vehicle_archive", { p_id: v.id, p_reason: reason, p });
        else { const x = admOff().vs.find(q => q.id === v.id); if (x) { x.archived_at = new Date().toISOString(); x.archive_reason = reason; if (x.listing) x.listing.status = /^vendido/.test(reason) ? "vendido" : "retirado"; if (x.auction && ["programada", "viva", "cerrada"].includes(x.auction.status)) x.auction.status = "cancelada"; x.status = /^vendido/.test(reason) ? "vendido" : ["spam", "duplicado"].includes(reason) ? "rechazado" : "aprobado"; if (/^vendido/.test(reason)) x.meta = Object.assign({}, x.meta, { sold: { price: +p.price || null, buyer: p.buyer, channel: reason === "vendido_fuera" ? "fuera" : "directa", date: new Date().toISOString().slice(0, 10), notes: p.notes } }); admOff().log.unshift({ at: new Date().toISOString(), admin_name: S.user.name, action: "archivar:" + reason, entity: "vehicle", entity_id: x.id, label: admTitle(x), detail: p }); } }
        admDrop("veh", "ov", "auc", "mk", "deals", "v:*"); close(); admOk("Vehículo archivado · " + archLabel(reason), "doc"); done && done();
      } catch (e) { admErr(e); $("#cYes").disabled = false; }
    };
  });
}
async function admUnarchive(v, done) {
  try { if (live()) await admRpc("admin_vehicle_unarchive", { p_id: v.id }); else { const x = admOff().vs.find(q => q.id === v.id); if (x) { x.archived_at = null; x.archive_reason = null; x.status = "aprobado"; } }
    admDrop("veh", "ov", "v:*", "deals"); admOk("Vehículo restaurado · ahora puedes volver a publicarlo", "refresh"); done && done(); } catch (e) { admErr(e); }
}
async function admConfirm(v, done) {
  try { if (live()) await admRpc("admin_vehicle_confirm", { p_id: v.id }); else { const x = admOff().vs.find(q => q.id === v.id); if (x) { x.confirmed_at = new Date().toISOString(); x.confirmed_by = "equipo"; x.confirm_requested_at = null; } }
    admDrop("veh", "ov", "v:*"); admOk("Disponibilidad confirmada", "check"); done && done(); } catch (e) { admErr(e); }
}
async function admAskConfirm(list, done) {
  const ids = list.filter(vActive).map(v => v.id);
  if (!ids.length) return toast("No hay anuncios activos que confirmar", "alert");
  modal("Pedir confirmación al vendedor", `<p style="margin:0">Se enviará un aviso ${ids.length === 1 ? "al vendedor" : "a los vendedores de <b>" + ids.length + " anuncios</b>"} en su panel y por email: <i>«¿Sigue a la venta? Confírmalo en un clic o avísanos si ya lo vendiste.»</i></p>
    <p class="muted" style="margin:0">Si en unos días no responde, puedes llamarle o archivar el anuncio con el motivo «El vendedor no responde».</p>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">${ic("msg", "sm")}Enviar ${ids.length > 1 ? ids.length + " avisos" : "aviso"}</button></div>`, close => {
    $("#cNo").onclick = close;
    $("#cYes").onclick = async () => {
      $("#cYes").disabled = true;
      try { let n = ids.length; if (live()) n = await admRpc("admin_request_confirm", { p_ids: ids }); else admOff().vs.filter(x => ids.includes(x.id)).forEach(x => x.confirm_requested_at = new Date().toISOString());
        admDrop("veh", "ov", "v:*"); close(); admOk(n + (n === 1 ? " aviso enviado" : " avisos enviados"), "msg"); done && done(); } catch (e) { admErr(e); $("#cYes").disabled = false; }
    };
  });
}

/* ---------- lista de vehículos: archivados aparte, sin confirmar y aviso masivo ---------- */
(function patchVehList() {
  const baseChannel = admChannel;
  admChannel = function (v) { return v.archived_at ? "archivados" : baseChannel(v); };
  const R = ADM_R.vehiculos, baseView = R.view, baseBind = R.bind;
  R.view = d => {
    const all = d.veh, ch = ADM.f.vch || "todos", iss = ADM.f.vi || "";
    const visible = ch === "archivados" ? all.filter(v => v.archived_at) : all.filter(v => !v.archived_at);
    const filtered = iss === "stale" && ch !== "archivados" ? visible.filter(vStale) : visible;
    const keepIss = ADM.f.vi; if (iss === "stale") ADM.f.vi = "";
    let html = baseView({ veh: filtered });
    ADM.f.vi = keepIss;
    const nArch = all.filter(v => v.archived_at).length, stale = all.filter(vStale), live1 = all.filter(v => !v.archived_at), nAll = live1.length;
    ["subasta", "mercado", "sin", "vendidos", "rechazados"].forEach(k => { html = html.replace(new RegExp('(<button type="button" data-v="' + k + '"[^>]*>[^<]*)<span class="sn">[^<]*</span>'), "$1<span class=\"sn\">" + num(live1.filter(v => baseChannel(v) === k).length) + "</span>"); });
    html = html.replace(/(<button type="button" data-v="todos"[^>]*>Todos)<span class="sn">[^<]*<\/span>/, `$1<span class="sn">${num(nAll)}</span>`)
      .replace(/(<button type="button" data-v="rechazados"[^>]*>Rechazados<span class="sn">[^<]*<\/span><\/button>)/, `$1<button type="button" data-v="archivados" class="${ch === "archivados" ? "on" : ""}">Archivados<span class="sn">${num(nArch)}</span></button>`)
      .replace('<option value="imported"', `<option value="stale" ${iss === "stale" ? "selected" : ""}>Sin confirmar · más de ${STALE_DAYS} días (${stale.length})</option><option value="imported"`);
    const bar = stale.length ? `<div class="conf-bar">${ic("alert", "sm")}<span><b>${stale.length} anuncios</b> llevan más de ${STALE_DAYS} días sin confirmar que siguen a la venta. Los vendedores pueden haberlos vendido por otra vía.</span><button class="btn xs" id="vStaleShow">Ver cuáles</button><button class="btn xs primary" id="vStaleAsk">${ic("msg", "sm")}Pedir confirmación a todos</button></div>` : "";
    return bar + html.replace(/(<th[^>]*data-sk="status"[^>]*>)/, "$1");
  };
  R.bind = (d, q, m, draw) => {
    baseBind(d, q, m, draw);
    const all = d.veh;
    const s = $("#vStaleShow"); if (s) s.onclick = () => { ADM.f.vi = "stale"; ADM.f.vch = "todos"; draw(); };
    const a = $("#vStaleAsk"); if (a) a.onclick = () => admAskConfirm(all.filter(vStale), () => admMount("vehiculos", {}, m));
    $$("#admBody tbody tr[data-href]").forEach(tr => {
      const id = tr.dataset.href.split("/").pop(), v = all.find(x => x.id === id); if (!v) return;
      const cell = tr.children[2]; if (cell) cell.insertAdjacentHTML("beforeend", " " + vConfirmChip(v) + (v.archived_at ? `<small class="muted">${esc(archLabel(v.archive_reason))} · ${ADM_FMT.d(v.archived_at)}</small>` : ""));
    });
  };
})();

/* ---------- ficha: tarjeta de estado del anuncio y acciones arriba ---------- */
(function patchVehEditor() {
  const R = ADM_R.vehiculo, baseView = R.view, baseBind = R.bind;
  R.view = (d, q, m) => {
    let html = baseView(d, q, m);
    const v = d.v; if (d.isNew) return html;
    const d0 = vAge(v), req = v.confirm_requested_at && (!v.confirmed_at || +new Date(v.confirm_requested_at) > +new Date(v.confirmed_at));
    const card = v.archived_at
      ? `<div class="panel adm-p conf-card arch"><div class="adm-ph"><h3>${ic("doc", "sm")} Archivado</h3></div>
          <p style="margin:0 0 6px"><b>${esc(archLabel(v.archive_reason))}</b></p><small class="muted">Desde ${ADM_FMT.dt(v.archived_at)}${v.meta && v.meta.archive_note ? " · " + esc(v.meta.archive_note) : ""}</small>
          <div class="adm-btns" style="margin-top:12px"><button class="btn sm primary" id="vUnarch">${ic("refresh", "sm")}Restaurar</button></div></div>`
      : `<div class="panel adm-p conf-card ${vStale(v) ? "stale" : ""}"><div class="adm-ph"><h3>¿Sigue a la venta?</h3>${vConfirmChip(v)}</div>
          <p class="muted" style="margin:0 0 4px;font-size:13px">${v.confirmed_at ? `Última confirmación hace <b>${d0} ${d0 === 1 ? "día" : "días"}</b>${v.confirmed_by ? " (" + esc(v.confirmed_by) + ")" : ""}.` : `Publicado hace <b>${d0} días</b> y nunca confirmado.`} El vendedor puede haberlo vendido por otra vía: confírmalo cada ${STALE_DAYS} días.</p>
          ${req ? `<p class="info" style="margin:6px 0 0;font-size:12.5px">${ic("clock", "sm")} Confirmación pedida ${ADM_FMT.dt(v.confirm_requested_at)} · esperando respuesta</p>` : ""}
          <div class="adm-btns" style="margin-top:12px">
            ${vActive(v) ? `<button class="btn sm ok" id="vConf">${ic("check", "sm")}Sigue disponible</button><button class="btn sm" id="vAsk">${ic("msg", "sm")}Pedir al vendedor</button>` : ""}
            <button class="btn sm" id="vSoldOut">${ic("check", "sm")}Vendido fuera</button>
            <button class="btn sm" id="vArch2">${ic("doc", "sm")}Archivar</button></div></div>`;
    html = html.replace('<aside class="adm-ed-side">', '<aside class="adm-ed-side">' + card);
    if (v.archived_at) html = html.replace('<div class="adm-ed-main">', `<div class="adm-ed-main"><div class="conf-arch-banner">${ic("doc", "sm")}<span>Este vehículo está <b>archivado</b> (${esc(archLabel(v.archive_reason))}). No aparece en la web ni en el inventario activo.</span></div>`);
    return html;
  };
  R.bind = (d, q, m, draw) => {
    baseBind(d, q, m, draw);
    const v = d.v, reload = () => admMount("vehiculo", q, m);
    const on = (id, fn) => { const b = $("#" + id); if (b) b.onclick = fn; };
    on("vUnarch", () => admUnarchive(v, reload));
    on("vConf", () => admConfirm(v, reload));
    on("vAsk", () => admAskConfirm([v], reload));
    on("vArch2", () => admArchive(v, reload));
    on("vArchTop", () => admArchive(v, reload));
    on("vSoldOut", () => { admArchive(v, reload); });
    on("vDelTop", () => { const b = $("#eDel"); if (b) b.click(); });
    const top = $("#vArchTop"); if (top && v.archived_at) { top.innerHTML = ic("refresh", "sm") + "<span>Restaurar</span>"; top.onclick = () => admUnarchive(v, reload); }
  };
  const i = ROUTES.findIndex(r => String(r[0]) === String(/^\/admin\/vehiculo\/([\w-]+)$/));
  if (i >= 0) ROUTES[i] = [ROUTES[i][0], admRoute("vehiculo", (q, m) => m[1] === "nuevo" ? "Nuevo vehículo" : "Ficha del vehículo", null,
    (q, m) => m[1] === "nuevo" ? "" : `<button class="btn sm" id="vArchTop">${ic("doc", "sm")}<span>Archivar</span></button><button class="btn sm bad ghost" id="vDelTop">${ic("x", "sm")}<span>Eliminar</span></button>`,
    () => `<a href="#/admin/vehiculos">${ic("left", "sm")}Vehículos</a>`)];
})();

/* ---------- panel: avisos de anuncios sin confirmar ---------- */
(function patchOverview() {
  const R = ADM_R[""], baseBind = R.bind;
  R.bind = (d, q, m, draw) => {
    baseBind && baseBind(d, q, m, draw);
    const st = (d.veh || []).filter(vStale); if (!st.length) return;
    const li = `<li><a href="#/admin/vehiculos?i=stale"><span class="ai warn">${ic("clock", "sm")}</span><b class="tnum">${num(st.length)}</b><span>anuncios sin confirmar en más de ${STALE_DAYS} días (¿vendidos fuera?)</span>${ic("right", "sm")}</a></li>`;
    const ul = $(".adm-att"); if (ul) ul.insertAdjacentHTML("afterbegin", li);
    else { const ok = $(".adm-allok"); if (ok) ok.outerHTML = `<ul class="adm-att">${li}</ul>`; }
  };
})();
(function patchOps() { const via = { fuera: "Vendido fuera" }; const R = ADM_R.operaciones, bv = R.view; R.view = (d, q, m) => bv(d, q, m).replace(/(<\/svg>)fuera<\/span>/g, "$1" + via.fuera + "</span>"); })();
(function patchLabels() { const base = admActionLabel; admActionLabel = function (a) {
  if (a.startsWith("archivar:")) return "Archivado · " + archLabel(a.slice(9)); if (a.startsWith("vendedor:")) return "Vendedor: " + archLabel(a.slice(9));
  return { restaurar: "Restaurado", confirmar: "Disponibilidad confirmada", pedir_confirmacion: "Confirmación pedida" }[a] || base(a); }; })();

/* ---------- vendedor: confirmar en un clic ---------- */
async function myConfirmList() {
  if (live()) { try { const { data } = await sb.rpc("my_confirmations"); return (data || []).filter(v => vActive(v) && (vStale(v) || (v.confirm_requested_at && (!v.confirmed_at || +new Date(v.confirm_requested_at) > +new Date(v.confirmed_at))))); } catch (e) { return []; } }
  return [];
}
function sellerConfirmPanel(list) {
  return `<div class="panel conf-seller" id="confSeller"><div class="cs-h"><span class="ai warn">${ic("clock", "sm")}</span><div><h3>¿Siguen a la venta?</h3><p class="muted">Confírmalo para que tus anuncios sigan visibles. Si ya vendiste alguno, avísanos y lo retiramos.</p></div></div>
    ${list.map(v => `<div class="cs-row" data-cs="${v.id}"><img src="${pimg(photoStem(v.photo))}" alt="" loading="lazy"><div><b>${esc([v.year, v.make, v.model].filter(Boolean).join(" "))}</b><small>${v.status === "subasta" ? "Subasta" : "Mercado"} · ${v.confirmed_at ? "confirmado hace " + vAge(v) + " días" : "publicado hace " + vAge(v) + " días"}</small></div>
      <div class="cs-a"><button class="btn xs ok" data-csy="${v.id}">${ic("check", "sm")}Sigue a la venta</button><button class="btn xs" data-csn="${v.id}">Ya lo vendí</button></div></div>`).join("")}</div>`;
}
async function mountSellerConfirm() {
  const host = $(".acctbody"); if (!host || $("#confSeller")) return;
  const list = await myConfirmList(); if (!list.length || !$(".acctbody") || $("#confSeller")) return;
  const head = host.querySelector(".admin-head");
  (head || host.firstElementChild || host).insertAdjacentHTML(head ? "afterend" : "beforebegin", sellerConfirmPanel(list));
  const done = id => { const r = $(`[data-cs="${id}"]`); if (r) r.remove(); if (!$$("#confSeller .cs-row").length) { const p = $("#confSeller"); if (p) p.remove(); } };
  $$("[data-csy]").forEach(b => b.onclick = async () => { try { await sb.rpc("seller_confirm_vehicle", { p_id: b.dataset.csy, p_available: true, p: {} }).then(r => { if (r.error) throw r.error; }); toast("Gracias. Tu anuncio sigue visible.", "check"); done(b.dataset.csy); } catch (e) { toast("No se ha podido guardar: " + esc(e.message || e), "alert"); } });
  $$("[data-csn]").forEach(b => b.onclick = () => modal("¿Qué ha pasado con el vehículo?", `<div class="arch-rs"><label class="arch-r"><input type="radio" name="csR" value="vendido_fuera" checked><span>${ic("check", "sm")}Lo he vendido por otra vía</span></label><label class="arch-r"><input type="radio" name="csR" value="retirado_vendedor"><span>${ic("eyeoff", "sm")}Ya no lo quiero vender</span></label></div>
    <div class="field" id="csPw"><label for="csP">¿Por cuánto lo vendiste? <small class="muted">opcional, nos ayuda a mejorar las valoraciones</small></label><div class="money"><span>€</span><input class="in" id="csP" type="number" min="0"></div></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">Retirar anuncio</button></div>`, close => {
      $$("input[name=csR]").forEach(x => x.onchange = () => $("#csPw").hidden = $("input[name=csR]:checked").value !== "vendido_fuera");
      $("#cNo").onclick = close;
      $("#cYes").onclick = async () => { try { const r = await sb.rpc("seller_confirm_vehicle", { p_id: b.dataset.csn, p_available: false, p: { reason: $("input[name=csR]:checked").value, price: $("#csP").value } }); if (r.error) throw r.error; close(); toast("Anuncio retirado. ¡Gracias por avisarnos!", "check"); done(b.dataset.csn); } catch (e) { toast("No se ha podido guardar: " + esc(e.message || e), "alert"); } };
    }));
}
(function sellerConfirmRoutes() {
  [/^\/vender$/, /^\/vender\/anuncios$/, /^\/vender\/subastas$/].forEach(re => patchRoute(re, () => setTimeout(mountSellerConfirm, 60)));
})();

/* ---------- Mercado: tipo de vehículo siempre coherente ---------- */
function mkTypes() { return [["Vehículos ligeros", "Turismos y furgonetas", "car"], ["Motocicletas", "Motos", "bolt"], ["Transporte pesado", "Pesados", "truck"], ["Náutica", "Náutica", "globe"], ["Maquinaria y agrícola", "Maquinaria", "wrench"]]; }
var MK_RX = {
  nautica: /\b(barco|yate|lancha|velero|embarcaci[oó]n|neum[aá]tica|semirr[ií]gida|moto de agua|jet ?ski|wave ?runner|wawe ?runner|sea-?doo|azimut|bayliner|beneteau|jeanneau|quicksilver|zodiac|sunseeker|fairline|princess yachts?)\b/i,
  maquinaria: /\b(tractor|cosechadora|claas|john deere|new holland|fendt|kubota|massey ferguson|deutz|excavadora|retroexcavadora|miniexcavadora|carretilla|manitou|jcb|caterpillar|bobcat|maquinaria)\b/i,
  pesado: /\b(cami[oó]n|tractora|cabeza tractora|semirremolque|autob[uú]s|autocar|daf|iveco|scania|man tgx|man tgs|renault trucks|volvo fh|actros)\b/i,
  moto: /\b(motocicleta|moto|scooter|ciclomotor|quad|cbr|r1|yzf|mt-?0\d|ninja|gsx|harley)\b/i,
};
function mkClassify(m) {
  const txt = [m.make, m.model, m.title, m.body].filter(Boolean).join(" ");
  const known = mkTypes().map(t => t[0]);
  if (MK_RX.nautica.test(txt)) return "Náutica";
  if (MK_RX.maquinaria.test(txt)) return "Maquinaria y agrícola";
  if (known.includes(m.type) && m.type !== "Vehículos ligeros") return m.type;
  if (MK_RX.pesado.test(txt)) return "Transporte pesado";
  if (/motocicleta|moto\b/i.test(m.body || "") || (MK_RX.moto.test(txt) && !/\b(furgoneta|turismo)\b/i.test(txt))) return "Motocicletas";
  return known.includes(m.type) ? m.type : "Vehículos ligeros";
}
(function classifyMarket() {
  const base = mapMarket;
  mapMarket = function (l) { const m = base(l); m.type = mkClassify(m); return m; };
  try { market.forEach(m => m.type = mkClassify(m)); } catch (e) {}
})();

/* ---------- marcas: una fila de logotipos, sobria y lenta ---------- */
var BRAND_LOGOS = [["Toyota", "toyota"], ["Volkswagen", "volkswagen"], ["SEAT", "seat"], ["Renault", "renault"], ["Peugeot", "peugeot"], ["Citroën", "citroen"], ["Opel", "opel"], ["Ford", "ford"],
  ["BMW", "bmw"], ["Mercedes-Benz", "mercedes"], ["Audi", "audi"], ["Škoda", "skoda"], ["Hyundai", "hyundai"], ["Kia", "kia"], ["Nissan", "nissan"], ["Fiat", "fiat"], ["Dacia", "dacia"],
  ["Mazda", "mazda"], ["Volvo", "volvo"], ["Jeep", "jeep"], ["Mini", "mini"], ["Land Rover", "landrover"], ["Porsche", "porsche"], ["Tesla", "tesla"], ["Honda", "honda"],
  ["Mitsubishi", "mitsubishi"], ["Suzuki", "suzuki"], ["Alfa Romeo", "alfaromeo"], ["Jaguar", "jaguar"], ["Subaru", "subaru"], ["MG", "mg"], ["Chevrolet", "chevrolet"], ["DAF", "daf"], ["Iveco", "iveco"]];
function brandsShowcase() {
  const src = s => `https://cdn.jsdelivr.net/npm/simple-icons@14.15.0/icons/${s}.svg`;
  const item = ([b, s], dup) => { const n = brandCount(b); return `<a class="bl" href="#/mercado?q=${encodeURIComponent(b)}" ${dup ? 'tabindex="-1" aria-hidden="true"' : `aria-label="${esc(b)}${n ? " · " + n + (n === 1 ? " vehículo" : " vehículos") : ""}"`} title="${esc(b)}${n ? " · " + n + (n === 1 ? " vehículo" : " vehículos") : ""}"><i style="--l:url('${src(s)}')"></i><span translate="no">${esc(b)}</span></a>`; };
  return `<div class="brandl" data-rev><div class="brandl-h"><span>Marcas disponibles</span></div>
    <div class="brandl-row"><div class="brandl-track">${BRAND_LOGOS.map(x => item(x, false)).join("")}${BRAND_LOGOS.map(x => item(x, true)).join("")}</div></div></div>`;
}
