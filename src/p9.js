/* ============================================================
   v4b — lot detail, marketplace, valuation, company
   ============================================================ */

/* ---------- LOT DETAIL ---------- */
function viewLot(id) {
  const l = lots.find(x => x.id === id);
  if (!l) return `<div class="wrap"><div class="empty" style="padding:80px">${ic("alert", "lg")}<b>Este lote no existe o ya se retiró</b><a class="btn" href="#/subastas">Volver a subastas</a></div></div>`;
  if (DET.id !== id) DET = { id, img: 0 };
  const c = CATS[l.cat], locked = l.cat === "oculta" && !/Dealer|Full/.test(S.plan);
  const others = lots.filter(x => x.id !== id).sort((a, b) => a.startsAt - b.startsAt).slice(0, 4);
  const sc = scoreOf(l.panels), damaged = PANELS.filter(([k]) => l.panels[k]);
  const spec = [["Marca", l.make], ["Modelo", l.model], ["Año", l.year], ["Primera matriculación", l.firstReg],
    ["VIN", locked ? "•••••••••••••••••" : l.vin], ["Kilometraje", num(l.km) + " km"], ["Tipo de carrocería", l.body], ["Cilindrada", num(l.cc) + " cc"],
    ["Combustible", l.fuel], ["Transmisión", l.trans], ["Potencia", l.cv + " CV"], ["Plazas", l.seats],
    ["Estado del título", l.cat === "siniestro" ? "Salvamento" : "Limpio"], ["Nivel de daños", ["Ninguno", "Leve", "Moderado", "Grave"][Math.min(3, Math.floor((100 - sc) / 25))]],
    ["Categoría", c.short], ["Tipo de vendedor", l.sellerType], ["En marcha", l.runs ? "Sí" : "No"], ["Llaves", l.keys ? "Sí" : "No"]];
  return `<div class="wrap">
  <a class="back" href="#/subastas">${ic("left", "sm")}Volver a subastas</a>
  <div class="detail">
    <div>
      <div class="gallery">
        <div class="main"><img id="mainImg" src="${imgSrc(l.img)}" alt="${esc(l.title)}" style="${locked ? "filter:blur(18px)" : ""}">
          <div class="lot-tag"><span class="chip">${ic("car", "sm")}${l.ref}</span><span class="chip">${ic("eye", "sm")}${l.watchers} siguiendo</span>${l.featured ? '<span class="chip acc" style="background:rgba(255,92,21,.92);color:#190802">Destacado</span>' : ""}</div></div>
        <div class="thumbs">${[0, 1, 2, 3, 4].map(i => `<button class="${i === 0 ? "on" : ""}" data-th="${i}" aria-label="Foto ${i + 1} de ${esc(l.title)}"><img src="${imgSrc(l.img)}" alt=""></button>`).join("")}</div>
      </div>
      <div class="d-title">
        <div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px"><span class="chip ${c.chip}">${c.name}</span><span class="chip ok">Sin reserva</span>${l.buyNow ? `<span class="chip info">Compra inmediata ${eur(l.buyNow)}</span>` : ""}</div>
        <h1>${locked ? l.year + " " + l.make + " •••" : esc(l.title)}</h1>
        <p class="muted" style="margin:8px 0 0">${l.fuel} · ${l.trans} · ${num(l.km)} km · ${l.cv} CV · ${esc(l.city)}, ${esc(l.prov)}</p></div>
        <div style="display:flex;gap:6px"><button class="icon-btn" id="dFav" aria-label="Guardar en favoritos" style="${S.favs.has(l.id) ? "color:var(--accent)" : ""}">${ic("heart")}</button><button class="icon-btn" id="dShare" aria-label="Copiar enlace">${ic("share")}</button></div>
      </div>

      <h2 class="h-sec">${ic("msg")}Descripción</h2>
      <p style="max-width:68ch;margin:0">${DESC[l.cat]} ${l.keys ? "Se entrega con llaves." : "Se entrega sin llaves."} ${l.runs ? "Arranca y se desplaza por sus medios." : "No arranca: requiere grúa para su retirada."} Documentación disponible según lo aportado por el vendedor.</p>
      <button class="btn sm ghost" id="trBtn" style="margin-top:12px">${ic("globe2", "sm")}Traducir descripción</button>

      <h2 class="h-sec">${ic("doc")}Especificaciones del vehículo</h2>
      <div class="specs">${spec.map(([k, v]) => `<div><small>${k}</small><b class="${k === "VIN" ? "mono" : ""}" style="${k === "VIN" ? "font-size:12.5px" : ""}">${v}</b></div>`).join("")}</div>

      <h2 class="h-sec">${ic("wrench")}Condición por panel</h2>
      <div class="panel cond">${carMap(l.panels)}
        <div>
          <div style="display:flex;align-items:flex-end;gap:12px;margin-bottom:12px"><span class="score tnum" style="color:${sc > 80 ? "var(--ok)" : sc > 50 ? "var(--warn)" : "var(--bad)"}">${sc}</span><span class="muted" style="padding-bottom:6px">/100 · verificado por admin</span></div>
          ${damaged.length ? `<div class="plist">${damaged.map(([k, n]) => `<div><span>${n}</span><span class="chip ${["", "info", "warn", "acc", "bad"][l.panels[k]]}">${SEV[l.panels[k]]}</span></div>`).join("")}</div>` : '<p class="muted">Sin daños declarados.</p>'}
          ${legend()}
        </div>
      </div>

      <h2 class="h-sec">${ic("pin")}Ubicación y transporte</h2>
      <div class="panel" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:end">
        <div><b>${esc(l.city)}, ${esc(l.prov)}</b><div class="muted" style="font-size:13px">España · retirada con cita previa</div>
          <div class="field" style="margin-top:12px"><label for="tDest">Calcular transporte a</label><select class="in" id="tDest">${Object.keys(TRANSPORT).map(p => `<option ${p === "Alicante" ? "selected" : ""}>${p}</option>`).join("")}</select></div></div>
        <div><small class="muted">Estimación ${l.runs ? "portavehículos" : "grúa"}</small><div class="bigprice" style="font-size:28px" id="tOut"></div><small class="muted">Retirada coordinada con el vendedor: 3–10 días laborables desde el pago.</small></div>
      </div>

      <h2 class="h-sec">${ic("doc")}Historial del vehículo</h2>
      <div class="panel locked-card">
        <div><b>${ic("lock", "sm")} Historial completo disponible con el plan Comprador Dealer</b><p class="muted" style="margin:6px 0 0;font-size:13.5px">3 registros disponibles: ITV, cambios de titularidad y cargas. Informe DGT incluido en el plan.</p></div>
        <a class="btn sm primary" href="#/precios">Mejorar plan</a>
      </div>

      <h2 class="h-sec">${ic("user")}Vendedor</h2>
      <div class="panel" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
        <span class="avatar" style="width:46px;height:46px;font-size:15px">${l.sellerType[0]}</span>
        <div style="flex:1;min-width:180px"><b>${l.sellerType} verificado</b><div class="muted" style="font-size:13px">${l.sellerType === "Aseguradora" ? "Compañía de seguros · lotes de siniestro" : l.sellerType === "Empresa" ? "Flota / renting · facturación con IVA" : "Vendedor particular"}</div></div>
        <span class="chip ok">${ic("check", "sm")}Identidad verificada</span>
        <button class="btn sm" id="sellerBtn">Ver perfil del vendedor</button>
      </div>

      <div class="lbl" style="margin:30px 0 10px">Otras subastas</div>
      <div class="grid">${others.map(lotCard).join("")}</div>
    </div>
    <aside class="bidbox" id="bidbox"></aside>
  </div></div>`;
}

function renderBidbox(l) {
  const box = $("#bidbox"); if (!box) return;
  const st = statusOf(l), cur = curPrice(l), step = inc(cur), minBid = l.hist.length ? cur + step : l.start;
  const lead = l.hist[0] && l.hist[0].who === "Tú", mine = S.myBids[l.id];
  const locked = l.cat === "oculta" && !/Dealer|Full/.test(S.plan);
  const prev = $("#bidIn") ? +$("#bidIn").value : 0;
  const val = Math.max(prev || 0, minBid);
  const closeTxt = new Date(l.endsAt).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const bidders = new Set(l.hist.map(h => h.who)).size;
  box.innerHTML = `<div class="hd ${st}"><span>${st === "live" ? "● Subasta en directo" : st === "soon" ? "Próximamente" : "Subasta cerrada"}</span><span class="tnum">${ic("gavel", "sm")} ${l.hist.length}</span></div>
  <div class="bd">
    ${st === "soon" ? `<div class="countbox"><small class="muted">Comienza en</small><div class="clock" data-tm="${l.id}">${fmtLeft(l.startsAt - now())}</div></div>
      <div class="lead-note" style="background:var(--accent-soft);color:var(--accent)">${ic("bolt", "sm")}Puja anticipada abierta: tu oferta se aplica y se mantiene hasta que empiece la subasta.</div>` : ""}
    <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:10px">
      <div><small class="muted">${l.hist.length ? (st === "soon" ? "Mejor puja anticipada" : "Puja actual") : "Precio de salida"}</small><div class="bigprice tnum">${locked ? "€ •••" : eur(cur)}</div></div>
      ${st !== "soon" ? `<div style="text-align:right"><small class="muted">${st === "live" ? "Cierra en" : "Cerró"}</small><div class="clock ${st === "live" && l.endsAt - now() < 10 * MIN ? "hot" : ""}" data-tm="${l.id}" style="font-size:24px">${st === "end" ? "—" : fmtLeft(l.endsAt - now())}</div></div>` : ""}
    </div>
    <div class="bstats"><span>${ic("gavel", "sm")}<b class="tnum">${l.hist.length}</b> pujas</span><span>${ic("users", "sm")}<b class="tnum">${bidders}</b> pujadores</span><span>${ic("eye", "sm")}<b class="tnum">${l.watchers}</b> viendo</span></div>
    ${mine ? `<div class="lead-note ${lead ? "win" : "lose"}">${ic(lead ? "check" : "alert", "sm")}${lead ? "Tu puja lidera con " + eur(cur) : "Te han superado. Tu última puja: " + eur(mine)}</div>` : ""}
    ${locked ? `<div class="lead-note" style="background:var(--vip-soft);color:var(--vip)">${ic("lock", "sm")}Lote exclusivo para planes Dealer y Combinado Full.</div><a class="btn primary block" href="#/precios">Ver planes</a>`
      : st === "end" ? `<div class="lead-note" style="background:var(--surface-2)">${lead ? "Has ganado este lote. Te contactaremos para formalizar." : "Subasta finalizada. Pendiente de aceptación del vendedor."}</div>` : `
    <div class="incs">${[1, 2, 4].map(k => `<button data-inc="${step * k}">+${eur(step * k)}</button>`).join("")}</div>
    <div class="field"><div style="display:flex;justify-content:space-between"><label for="bidIn">Tu puja</label><small class="muted">Mín. ${eur(minBid)}</small></div>
      <div class="money"><span>€</span><input class="in tnum" id="bidIn" type="number" inputmode="numeric" min="${minBid}" step="${step}" value="${val}"></div></div>
    <div style="background:var(--surface-2);border-radius:12px;padding:11px 13px" id="costBox"></div>
    <button class="btn primary block" id="bidGo">${ic("gavel", "sm")}${st === "soon" ? "Pre-pujar" : "Pujar"}</button>
    ${l.buyNow ? `<button class="btn block" id="buyNow">${ic("bolt", "sm")}Comprar ya por ${eur(l.buyNow)}</button>` : ""}
    <details class="acc" ${S.auto[l.id] ? "open" : ""}><summary>${ic("robot", "sm")}Puja automática ${S.auto[l.id] ? `<span class="chip ok" style="margin-left:auto">Hasta ${eur(S.auto[l.id])}</span>` : ""}${ic("chev", "chev sm")}</summary>
      <div class="ac-b"><small class="muted">Pujamos por ti el mínimo necesario hasta tu máximo. Nadie ve tu límite.</small>
      <div class="money"><span>€</span><input class="in" id="autoIn" type="number" value="${S.auto[l.id] || Math.round(minBid * 1.4 / 50) * 50}"></div>
      <div style="display:flex;gap:8px"><button class="btn sm primary" id="autoGo">${S.auto[l.id] ? "Actualizar" : "Activar"}</button>${S.auto[l.id] ? '<button class="btn sm" id="autoOff">Desactivar</button>' : ""}</div></div></details>`}
    <ul class="muted" style="font-size:12px;margin:0;padding-left:16px;display:grid;gap:3px">
      <li>Incremento mínimo: ${eur(step)}</li><li>Todas las pujas son vinculantes 30 días</li>
      <li>Termina: ${closeTxt} CEST</li><li>Anti-sniping: una puja en los 2 últimos minutos amplía 2 minutos</li></ul>
    <div><div class="lbl" style="margin-bottom:6px">${l.hist.length} ${l.hist.length === 1 ? "puja" : "pujas"}</div>
    ${l.hist.length ? `<ul class="bids">${l.hist.slice(0, 12).map(b => `<li class="${b.who === "Tú" ? "me" : ""}"><span><b>${b.who}</b> <small class="faint">${ago(b.t)}${b.pre ? " · anticipada" : ""}</small></span><span class="mono tnum">${eur(b.amt)}</span></li>`).join("")}</ul>` : '<p class="muted" style="margin:0;font-size:13px">Aún no hay pujas. ¡Sé el primero en pujar!</p>'}</div>
  </div>`;
  if (locked || st === "end") return;
  const bi = $("#bidIn");
  const cost = () => {
    const p = +bi.value || 0, fee = buyerFee(p), g = 149, dest = $("#tDest") ? $("#tDest").value : "Alicante";
    const t = Math.round((TRANSPORT[dest] || 200) * (l.runs ? 1 : 1.35) * (l.prov === dest ? .5 : 1));
    const disc = /Dealer|Full/.test(S.plan) ? .10 : /Pro/.test(S.plan) ? .05 : 0;
    const feeD = fee * (1 - disc), iva = (feeD + g + t) * .21;
    $("#costBox").innerHTML = `<div class="kv"><span>Puja</span><span class="tnum">${eur(p)}</span></div>
      <div class="kv"><span>Comisión comprador${disc ? ` (−${disc * 100}%)` : ""}</span><span class="tnum">${eur(feeD)}</span></div>
      <div class="kv"><span>Gestoría transferencia</span><span class="tnum">${eur(g)}</span></div>
      <div class="kv"><span>Transporte a ${dest}</span><span class="tnum">${eur(t)}</span></div>
      <div class="kv"><span>IVA servicios (21%)</span><span class="tnum">${eur(iva)}</span></div>
      <div class="kv total"><span>Coste total estimado</span><span class="tnum">${eur(p + feeD + g + t + iva)}</span></div>`;
    if ($("#tOut")) $("#tOut").textContent = eur(t) + " + IVA";
  };
  bi.oninput = cost; cost();
  if ($("#tDest")) $("#tDest").onchange = cost;
  $$("[data-inc]").forEach(b => b.onclick = () => { bi.value = cur + +b.dataset.inc; cost(); });
  $("#bidGo").onclick = () => { const v = +bi.value; if (!(v >= minBid)) { toast("La puja mínima es " + eur(minBid), "alert"); bi.focus(); return; } quickBid(l.id, v); };
  if ($("#buyNow")) $("#buyNow").onclick = () => modal("Comprar ya", `<p style="margin:0">Compra inmediata de <b>${esc(l.title)}</b> por <b>${eur(l.buyNow)}</b> más comisión y gastos. La subasta se cierra para el resto de pujadores.</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">Comprar</button></div>`, close => {
    $("#cNo").onclick = close;
    $("#cYes").onclick = () => { close(); placeBid(l, "Tú", l.buyNow); l.endsAt = now(); l.startsAt = Math.min(l.startsAt, now() - 1); toast("¡Compra confirmada!", "check"); notify(`Has comprado <b>${esc(l.title)}</b> con Comprar ya.`, "bolt"); refresh(); };
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
function mountLot(id) {
  const l = lots.find(x => x.id === id); if (!l) return;
  renderBidbox(l);
  $$("[data-th]").forEach(b => b.onclick = () => {
    $$("[data-th]").forEach(x => x.classList.toggle("on", x === b));
    const im = b.querySelector("img"), m = $("#mainImg"), cs = getComputedStyle(im);
    m.style.transform = cs.transform; m.style.objectPosition = cs.objectPosition; m.style.filter = cs.filter;
  });
  $("#dFav").onclick = () => { toggleFav(l.id); $("#dFav").style.color = S.favs.has(l.id) ? "var(--accent)" : ""; };
  $("#dShare").onclick = () => { try { navigator.clipboard.writeText(location.href); } catch (e) {} toast("Enlace del lote copiado", "share"); };
  $("#trBtn").onclick = () => toast("Traducción automática disponible en la versión con servidor", "globe2");
  $("#sellerBtn").onclick = () => modal("Perfil del vendedor", `<div style="display:flex;gap:12px;align-items:center"><span class="avatar" style="width:46px;height:46px">${l.sellerType[0]}</span><div><b>${l.sellerType} verificado</b><div class="muted" style="font-size:13px">Miembro desde 2024 · ${12 + l.watchers} lotes vendidos</div></div></div>
    <div class="kv"><span>Valoración media</span><b>4,7 / 5</b></div><div class="kv"><span>Entrega a tiempo</span><b>96%</b></div><div class="kv"><span>Respuesta media</span><b>3 h</b></div>
    <p class="muted" style="margin:0;font-size:13px">Los datos de contacto se desbloquean automáticamente al ganar el lote.</p>`);
  bindCards($(".detail"));
}

/* ---------- MARKETPLACE ---------- */
Object.assign(MK, { brand: "all", type: "all", year: "", kmMax: "" });
function viewMarket() {
  const types = ["Vehículos ligeros", "Motocicletas", "Náutica", "Transporte pesado"];
  const brands = [...new Set(market.map(m => m.title.split(" ")[0]))];
  return `<div class="wrap">
  <div class="admin-head"><div><div class="eyebrow">Mercado · precio fijo</div><h1 style="margin-top:8px">Encuentra tu vehículo</h1><p class="muted" style="margin:6px 0 0">Compra directa sin esperar a la subasta. Haz una oferta y el vendedor responde en 48 h.</p></div>
  <a class="btn primary" href="#/publicar?t=mercado">${ic("plus", "sm")}Publicar anuncio</a></div>
  <div class="mk" style="margin-top:0">
    <aside class="filters">
      <div class="search" style="min-width:0">${ic("search")}<input class="in" id="mq" placeholder="Buscar BMW Serie 3…" value="${esc(MK.q)}"></div>
      <div><h4>Categoría</h4><div class="pills" id="fcat">${[["all", "Todos"], ["limpio", "Limpios"], ["danado", "Dañados"], ["siniestro", "Desguace"]].map(([k, t]) => `<button class="pill ${MK.cat === k ? "on" : ""}" data-v="${k}">${t}</button>`).join("")}</div></div>
      <div><h4>Tipo de vehículo</h4><div class="pills" id="ftype"><button class="pill ${MK.type === "all" ? "on" : ""}" data-v="all">Todos</button>${types.map(t => `<button class="pill ${MK.type === t ? "on" : ""}" data-v="${t}">${t.replace("Vehículos ", "")}</button>`).join("")}</div></div>
      <div><h4>Marca</h4><select class="in" id="fbrand" aria-label="Marca"><option value="all">Todas las marcas</option>${brands.map(b => `<option ${MK.brand === b ? "selected" : ""}>${b}</option>`).join("")}</select></div>
      <div><h4>Precio (€)</h4><div class="two"><input class="in" id="fmin" type="number" placeholder="Mín." value="${MK.min}"><input class="in" id="fmax" type="number" placeholder="Máx." value="${MK.max}"></div></div>
      <div><h4>Año desde</h4><input class="in" id="fyear" type="number" placeholder="Cualquiera" value="${MK.year}"></div>
      <div><h4>Kilometraje máx.</h4><input class="in" id="fkm" type="number" placeholder="Cualquiera" value="${MK.kmMax}"></div>
      <div><h4>Combustible</h4><select class="in" id="ffuel"><option value="all">Todos</option><option>Gasolina</option><option>Diésel</option><option>Híbrido</option><option>Eléctrico</option></select></div>
      <div><h4>Transmisión</h4><select class="in" id="ftrans"><option value="all">Todas</option><option>Manual</option><option>Automático</option></select></div>
      <button class="btn sm ghost" id="freset">${ic("refresh", "sm")}Limpiar filtros</button>
    </aside>
    <div>
      <div class="mkbar"><span id="mcount" class="muted"></span>
        <div style="display:flex;gap:8px;align-items:center"><span class="lbl">Ordenar</span><select class="in" id="msort" style="width:auto;height:38px"><option value="new">Más recientes</option><option value="low">Precio: menor a mayor</option><option value="high">Precio: mayor a menor</option><option value="km">Menos kilómetros</option></select></div>
      </div>
      <div id="mlist"></div>
    </div>
  </div></div>`;
}
function renderMarket() {
  const q = MK.q.toLowerCase();
  let list = market.filter(m => (!q || m.title.toLowerCase().includes(q)) && (MK.cat === "all" || m.cat === MK.cat) && (MK.type === "all" || m.type === MK.type)
    && (MK.brand === "all" || m.title.startsWith(MK.brand)) && (!MK.min || m.price >= +MK.min) && (!MK.max || m.price <= +MK.max)
    && (!MK.year || m.year >= +MK.year) && (!MK.kmMax || m.km <= +MK.kmMax)
    && (MK.fuel === "all" || m.fuel === MK.fuel) && (MK.trans === "all" || m.trans === MK.trans));
  list.sort({ new: (a, b) => a.days - b.days, low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, km: (a, b) => a.km - b.km }[MK.sort]);
  $("#mcount").innerHTML = `<b style="color:var(--text)">${list.length}</b> ${list.length === 1 ? "anuncio" : "anuncios"} de ${market.length}`;
  $("#mlist").innerHTML = list.length ? list.map((m, i) => `<article class="row-card" data-rev style="--d:${Math.min(i, 6) * 50}ms">
    <a class="ph" href="#/mercado/${m.id}"><img src="${imgSrc(m.img)}" alt="${esc(m.title)}" loading="lazy"><span class="lotno" style="position:absolute;top:10px;left:10px;bottom:auto;background:rgba(8,8,9,.72);padding:5px 8px;border-radius:6px;color:#fff">${m.type.toUpperCase()}</span></a>
    <div class="bd"><a href="#/mercado/${m.id}"><h3>${esc(m.title)}</h3></a>
      <div class="spec"><span>${ic("clock", "sm")}${m.year}</span><span>${ic("gauge", "sm")}${num(m.km)} km</span><span>${ic("fuel", "sm")}${m.fuel}</span><span>${ic("gear", "sm")}${m.trans}</span></div>
      <div class="meta"><span class="chip ${CATS[m.cat].chip}">${CATS[m.cat].short}</span><span class="chip">${ic("pin", "sm")}${m.city}</span><span class="chip">${ic("user", "sm")}${m.seller}</span></div>
      <small class="faint">Publicado hace ${m.days} ${m.days === 1 ? "día" : "días"}</small></div>
    <div class="pr"><div><b class="tnum">${eur(m.price)}</b><small>${m.neg ? "Precio negociable" : "Precio fijo"}</small><small>desde ~${eur(m.price / 60 * 1.12)}/mes</small></div>
      <button class="btn sm primary" data-offer="${m.id}">${m.neg ? "Hacer oferta" : "Contactar"}</button></div></article>`).join("")
    : `<div class="panel empty">${ic("search", "lg")}<b>Ningún vehículo coincide</b><span>Prueba a ampliar el rango de precio o quitar filtros.</span><button class="btn sm" id="clearF">Limpiar filtros</button></div>`;
  $$("[data-offer]").forEach(b => b.onclick = () => offerModal(market.find(m => m.id === b.dataset.offer)));
  if ($("#clearF")) $("#clearF").onclick = () => { Object.assign(MK, { q: "", cat: "all", type: "all", brand: "all", min: "", max: "", year: "", kmMax: "", fuel: "all", trans: "all" }); router(); };
  initReveal($("#mlist"));
  fadeImgs($("#mlist"));
}
function mountMarket() {
  const r = () => renderMarket();
  $("#mq").oninput = e => { MK.q = e.target.value; r(); };
  $("#msort").value = MK.sort; $("#msort").onchange = e => { MK.sort = e.target.value; r(); };
  [["#fcat", "cat"], ["#ftype", "type"]].forEach(([s, k]) => $$(s + " .pill").forEach(b => b.onclick = () => { MK[k] = b.dataset.v; $$(s + " .pill").forEach(x => x.classList.toggle("on", x === b)); r(); }));
  [["#fmin", "min"], ["#fmax", "max"], ["#fyear", "year"], ["#fkm", "kmMax"]].forEach(([s, k]) => { const e = $(s); if (e) e.oninput = ev => { MK[k] = ev.target.value; r(); }; });
  [["#ffuel", "fuel"], ["#ftrans", "trans"], ["#fbrand", "brand"]].forEach(([s, k]) => { const e = $(s); if (e) { e.value = MK[k]; e.onchange = ev => { MK[k] = ev.target.value; r(); }; } });
  $("#freset").onclick = () => { Object.assign(MK, { q: "", cat: "all", type: "all", brand: "all", min: "", max: "", year: "", kmMax: "", fuel: "all", trans: "all" }); router(); };
  r();
}

/* ---------- VALUATION (fields mirror the live form) ---------- */
function viewValuation() {
  return `<div class="wrap">
  <div class="admin-head"><div><div class="eyebrow">Valoración gratuita</div><h1 style="margin-top:8px">Valoración de vehículo</h1><p class="muted" style="margin:6px 0 0;max-width:64ch">Obtén una evaluación profesional de tu vehículo y el coste estimado. Completamente gratis, con respuesta en 24–48 horas.</p></div></div>
  <div class="form-shell" style="margin-top:0">
    <form class="panel" id="valForm" style="display:grid;gap:18px" onsubmit="return false">
      <div><h3 style="margin:0">${ic("car")} Información del vehículo</h3><p class="muted" style="margin:4px 0 0;font-size:13.5px">Proporciona detalles sobre tu vehículo y los daños para una valoración precisa.</p></div>
      <div class="fgrid">
        <div class="field"><label for="vMake">Marca</label><input class="in" id="vMake" value="Toyota"></div>
        <div class="field"><label for="vModel">Modelo</label><input class="in" id="vModel" value="Corolla"></div>
        <div class="field"><label for="vYear">Año</label><input class="in" id="vYear" type="number" value="2019"></div>
        <div class="field"><label for="vKm">Kilometraje (km)</label><input class="in" id="vKm" type="number" value="90000"></div>
        <div class="field"><label for="vVin">VIN</label><input class="in mono" id="vVin" maxlength="17" placeholder="17 caracteres"></div>
        <div class="field"><label for="vPlate">Matrícula (opcional)</label><input class="in mono" id="vPlate" placeholder="1234 ABC"></div>
        <div class="field"><label for="vDmg">Tipo de daño</label><select class="in" id="vDmg">
          <option value="ninguno">Sin daños</option><option value="leve" selected>Colisión / accidente</option><option value="inundado">Inundación / daños por agua</option>
          <option value="quemado">Daños por incendio</option><option value="moderado">Daños por granizo</option><option value="grave">Avería mecánica</option><option value="moderado">Vandalismo / robo</option><option value="leve">Otro</option></select></div>
        <div class="field"><label for="vTitle">Estado del título</label><select class="in" id="vTitle"><option value="limpio">Título limpio</option><option value="salvamento">Título de salvamento</option><option value="piezas">Solo piezas</option></select></div>
        <div class="full"><div class="lbl" style="margin-bottom:8px">Estado del vehículo</div><div style="display:flex;gap:18px;flex-wrap:wrap">
          <label><input type="checkbox" id="vKeys" checked> <span>Tiene llaves</span></label>
          <label><input type="checkbox" id="vRuns" checked> <span>Arranca y conduce</span></label></div></div>
        <div class="field full"><label for="vDesc">Descripción del daño</label><textarea class="in" id="vDesc" placeholder="Qué pasó, zonas afectadas y reparaciones ya realizadas."></textarea></div>
        <div class="full drop">${ic("upload", "lg")}<b>Arrastra y suelta fotos o haz clic para subir</b><span style="font-size:13px">Incluye áreas dañadas, exterior e interior · <span id="phN">0</span>/50 fotos</span><button type="button" class="btn sm" id="vPhotos">Seleccionar fotos</button></div>
      </div>
      <div class="trow" style="border:1px solid var(--line);border-radius:13px;padding:15px;background:var(--surface-2)"><div><b>${ic("bolt", "sm")} Oferta directa de MotorSubasta</b><small>Recibe una oferta de compra directa en 24 horas. Si la aceptas, tu vehículo se vende sin necesidad de subasta.</small></div><label class="toggle"><input type="checkbox" id="vDirect" checked aria-label="Solicitar oferta directa"><span></span></label></div>
      <h3 style="margin:6px 0 0">${ic("user")} Información de contacto</h3>
      <div class="fgrid">
        <div class="field"><label for="vName">Nombre completo</label><input class="in" id="vName" value="Eddie"></div>
        <div class="field"><label for="vMail">Correo electrónico</label><input class="in" id="vMail" type="email" value="baropsedijs@gmail.com"></div>
        <div class="field"><label for="vTel">Número de WhatsApp</label><input class="in" id="vTel" value="+34 600 000 000"></div>
        <div class="field"><label for="vPref">Método de contacto preferido</label><select class="in" id="vPref"><option>WhatsApp</option><option>Email</option><option>Ambos</option></select></div>
      </div>
      <button class="btn primary" id="vSend">${ic("check", "sm")}Enviar solicitud de valoración</button>
    </form>
    <div class="side-list" style="position:sticky;top:78px">
      <div class="estimate"><span class="eyebrow">Estimación instantánea</span><div class="rng tnum" id="vOut"></div><small class="muted" id="vNote"></small><div class="bar"><i id="vBar" style="width:50%"></i></div></div>
      <div class="panel">${ic("bolt", "lg")}<div><b>Respuesta rápida</b><p>Valoración en 24–48 horas de nuestro equipo de expertos.</p></div></div>
      <div class="panel">${ic("euro", "lg")}<div><b>Completamente gratis</b><p>Sin costes ocultos. El servicio de valoración es 100% gratuito.</p></div></div>
      <div class="panel">${ic("shield", "lg")}<div><b>Análisis profesional</b><p>Equipo con experiencia en aseguradoras y remarketing.</p></div></div>
      <div class="panel">${ic("msg", "lg")}<div><b>¿Necesitas ayuda?</b><p>Escríbenos por WhatsApp y te guiamos en el proceso.</p></div></div>
    </div>
  </div></div>`;
}

/* ---------- COMPANY ---------- */
function viewCompany() {
  return `<section class="hero"><div class="mesh" aria-hidden="true"></div><div class="wrap">
    <div><div class="eyebrow">Sobre nosotros</div>
    <h1 style="margin-top:16px">La plataforma profesional de subastas y mercado de vehículos en España</h1>
    <p class="lead">Tecnología, transparencia y oportunidades reales para maximizar beneficios. Conectamos vendedores particulares y empresas con compradores profesionales del sector, con subastas en tiempo real y un mercado directo.</p>
    <div class="hero-cta"><a class="btn primary" href="#/precios">Únete a la plataforma ${ic("right", "sm")}</a><a class="btn" href="#/subastas">Explorar subastas</a></div></div>
    <aside class="livepanel">
      <div class="hd">${ic("chart", "sm")}La plataforma en cifras</div>
      ${[["Vehículos procesados", "Desde el lanzamiento", "500+"], ["Compradores profesionales", "Talleres, compraventas y exportadores", "50+"], ["Países de exportación", "Con gestión de DUA", "3"], ["Plataforma disponible", "Pujas y mercado", "24/7"]]
        .map(([t, s, v]) => `<div class="lrow" style="grid-template-columns:1fr auto"><span><b>${t}</b><small>${s}</small></span><span class="rt"><span class="p tnum">${v}</span></span></div>`).join("")}
      <div class="ft"><span>Oficina en Alicante · cobertura nacional</span><a class="link" href="#/empresa">Contacto ${ic("right", "sm")}</a></div>
    </aside>
  </div></section>

  <section class="blk"><div class="wrap">
    <div class="sec-head" data-rev><div><div class="eyebrow">Qué hacemos</div><h2 style="margin-top:10px">Subastas, mercado y servicios integrales</h2></div></div>
    <div class="steps" data-rev>
      <div class="step">${ic("bolt", "lg")}<h4>Subastas en tiempo real</h4><p>Sistema de pujas en vivo con total transparencia y oportunidades exclusivas para compradores profesionales.</p></div>
      <div class="step">${ic("store", "lg")}<h4>Mercado profesional</h4><p>Compra y venta a precio fijo con herramientas diseñadas para el sector automotriz.</p></div>
      <div class="step">${ic("truck", "lg")}<h4>Servicios integrales</h4><p>Logística, transporte y exportación para operar dentro y fuera de España.</p></div>
      <div class="step">${ic("chart", "lg")}<h4>Datos del mercado</h4><p>Precios reales de adjudicación del mercado español para decidir con criterio.</p></div>
    </div>
  </div></section>

  <section class="blk" style="padding-top:0"><div class="wrap split">
    <div data-rev><div class="eyebrow">Nuestra misión</div><p class="big-quote" style="margin-top:12px">Transformar el remarketing de vehículos en España con tecnología, datos y transparencia.</p>
      <p class="muted" style="max-width:60ch">El mercado tradicional era lento, opaco y limitado. MotorSubasta nació para ofrecer velocidad, eficiencia y acceso real a oportunidades, eliminando barreras y simplificando procesos.</p></div>
    <div class="panel" data-rev><h3>${ic("eye")} Nuestra visión</h3><p class="muted" style="margin:0 0 14px;font-size:14px">Convertirnos en la referencia del remarketing profesional de vehículos en España y facilitar el acceso a compradores cualificados para exportación internacional.</p>
      <ul class="checks">${["Subastas en tiempo real con total transparencia", "Acceso a compradores profesionales", "Comisiones claras y competitivas", "Datos reales del mercado español"].map(t => `<li>${ic("check", "sm")}${t}</li>`).join("")}</ul></div>
  </div></section>

  <section class="blk" style="background:var(--bg-2);border-block:1px solid var(--line)"><div class="wrap">
    <div class="sec-head" data-rev><div><div class="eyebrow">Para quién</div><h2 style="margin-top:10px">Para quién es MotorSubasta</h2><p>También permitimos que particulares vendan de forma rápida y transparente, conectándolos con una red profesional de compradores.</p></div></div>
    <div class="tags" data-rev>${["Concesionarios", "Compraventas", "Exportadores", "Empresas de renting y leasing", "Flotas corporativas", "Desguaces y recicladores", "Inversores del sector", "Particulares"].map(t => `<span>${t}</span>`).join("")}</div>
    <div class="cats" style="margin-top:28px">
      ${[["shield", "Confianza y transparencia", "Procesos claros, reglas definidas e información detallada."],
        ["users", "Comunidad profesional", "Una red donde los profesionales comparten oportunidades y confianza."],
        ["spark", "Innovación", "Tecnología que simplifica operaciones y mejora resultados."],
        ["msg", "Servicio", "Soporte dedicado y atención personalizada."],
        ["euro", "Rentabilidad", "Herramientas y datos para maximizar beneficios."],
        ["gear", "Tecnología", "Plataforma moderna basada en datos, automatización y eficiencia."]].map(([i, t, d], n) =>
        `<div class="panel" data-rev style="--d:${n * 55}ms"><span class="chip acc">${ic(i, "sm")}</span><h3 style="margin:10px 0 6px;font-size:16.5px">${t}</h3><p class="muted" style="margin:0;font-size:13px">${d}</p></div>`).join("")}
    </div>
  </div></section>

  <section class="blk"><div class="wrap">
    <div class="sec-head" data-rev><div><div class="eyebrow">Cómo funciona para partners</div><h2 style="margin-top:10px">Empieza a operar en minutos</h2></div></div>
    <div class="steps" data-rev>
      <div class="step"><span class="k">01</span>${ic("user", "lg")}<h4>Registro</h4><p>Crea tu cuenta profesional y verifica tu identidad en minutos.</p></div>
      <div class="step"><span class="k">02</span>${ic("search", "lg")}<h4>Explora</h4><p>Accede a subastas en vivo y al mercado con información detallada.</p></div>
      <div class="step"><span class="k">03</span>${ic("gavel", "lg")}<h4>Opera</h4><p>Puja en subastas o negocia precios directamente en el mercado.</p></div>
      <div class="step"><span class="k">04</span>${ic("truck", "lg")}<h4>Recibe</h4><p>Gestionamos la logística y el transporte hasta tu ubicación.</p></div>
    </div>
    <div class="commit" style="margin-top:18px">
      <div class="panel" data-rev><h3>${ic("shield")} Seguridad y confianza</h3><ul class="checks">${["Usuarios verificados", "Pagos protegidos", "Contratos digitales", "Protección de datos conforme al RGPD", "Procesos auditables"].map(t => `<li>${ic("check", "sm")}${t}</li>`).join("")}</ul></div>
      <div class="panel" data-rev style="--d:80ms"><h3>${ic("msg")} Contacta con nosotros</h3>
        <div class="kv"><span>Email</span><b>info@motorsubasta.com</b></div><div class="kv"><span>Teléfono</span><b>+34 900 000 000</b></div>
        <div class="kv"><span>Oficina</span><b>Alicante, España</b></div><div class="kv"><span>Horario</span><b>L–V 9:00–18:00</b></div>
        <a class="btn primary block" href="#/precios" style="margin-top:14px">Crear cuenta</a></div>
    </div>
  </div></section>`;
}

/* ---------- data for v4 ---------- */
rebuildInventory();
