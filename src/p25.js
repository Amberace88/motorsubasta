/* ============================================================
   v17 — cuentas: Comprador · Vendedor · Admin
   · paneles separados Subastas / Mercado para comprar y para vender
   · contacto del Mercado configurable (teléfono, WhatsApp, email, plataforma)
   · subastas anónimas: nunca se muestra quién vende ni quién compra
   · recogida privada: el ganador la recibe tras pagar
   · VIN y matrícula obligatorios; un vehículo solo en un sitio
   (todo en funciones: la primera pintura ocurre antes de que esta capa se ejecute)
   ============================================================ */

/* solo tres cuentas de prueba */
if (typeof DEMO_USERS !== "undefined") for (let i = DEMO_USERS.length - 1; i >= 0; i--) if (DEMO_USERS[i].role === "dealer") DEMO_USERS.splice(i, 1);

function navGroup(title, items, active) {
  return `<div class="ngroup"><small>${title}</small>${items.map(([h, t, i, n]) => `<a href="${h}" class="${h === active ? "on" : ""}">${ic(i, "sm")}<span>${t}</span>${n ? `<i class="nbadge">${n}</i>` : ""}</a>`).join("")}</div>`;
}
function acctMe(role) {
  const u = S.user;
  return `<div class="acctme"><span class="avatar" style="width:44px;height:44px;font-size:15px">${initials(u.name)}</span>
    <div><b>${esc(role === "seller" ? (u.company || u.name) : u.name)}</b><small class="muted">${role === "seller" ? "Vendedor" : "Comprador"} · ${esc(u.city || "España")}</small>
    <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"><span class="chip acc">${esc(u.plan || S.plan || "")}</span>${u.verified ? `<span class="chip ok">${ic("check", "sm")}Verificado</span>` : `<a class="chip warn" href="#/verificacion">Sin verificar</a>`}</div></div></div>`;
}
function myOffers() { return store.get("myoffers", []); }
function acctShell(active, body) {
  const pend = (typeof payUnpaid === "function" ? payUnpaid().length : 0) || "";
  const favM = market.filter(m => S.favs.has(m.id)).length || "";
  return `<div class="wrap"><div class="acct">
    <aside class="acctnav">${acctMe("buyer")}
      ${navGroup("General", [["#/cuenta", "Resumen", "chart"], ["#/cuenta/ajustes", "Perfil y ajustes", "gear"], ["#/verificacion", "Verificación", "shield"]], active)}
      ${navGroup("Subastas", [["#/cuenta/pujas", "Mis pujas", "gavel"], ["#/favoritos", "Lotes que sigo", "heart"], ["#/cuenta/compras", "Compras y recogida", "truck", pend], ["#/cuenta/facturas", "Facturas", "doc"], ["#/cuenta/suscripcion", "Plan", "euro"]], active)}
      ${navGroup("Mercado", [["#/cuenta/mercado", "Mis ofertas y mensajes", "msg", myOffers().length || ""], ["#/cuenta/guardados", "Anuncios guardados", "heart", favM], ["#/cuenta/busquedas", "Búsquedas guardadas", "bell"]], active)}
      ${canSell() ? `<a href="#/vender" class="sw">${ic("store", "sm")}Cambiar a panel de vendedor</a>` : `<a href="#/publicar?t=mercado" class="sw">${ic("plus", "sm")}Vender un vehículo gratis</a>`}
    </aside>
    <div class="acctbody">${body}</div>
  </div></div>`;
}
function sellShell(active, body) {
  const mine = sellerSplit();
  return `<div class="wrap"><div class="acct">
    <aside class="acctnav">${acctMe("seller")}
      <a class="btn primary block" href="#/publicar" style="margin:4px 0 6px">${ic("plus", "sm")}Publicar vehículo</a>
      ${navGroup("General", [["#/vender", "Resumen", "chart"], ["#/cuenta/ajustes?tab=contacto", "Contacto y perfil", "gear"], ["#/vender/cobros", "Cobros", "euro"]], active)}
      ${navGroup("Subastas", [["#/vender/subastas", "Vehículos en subasta", "gavel", mine.sub.length || ""], ["#/vender/decisiones", "Decisiones", "scale"], ["#/vender/ventas", "Ventas", "truck"]], active)}
      ${navGroup("Mercado", [["#/vender/anuncios", "Mis anuncios", "store", mine.mk.length || ""], ["#/vender/ofertas", "Ofertas y mensajes", "msg", (S.sellerOffers || []).filter(o => o.st === "new").length || ""], ["#/vender/importar", "Importar CSV", "upload"]], active)}
      <a href="#/cuenta" class="sw">${ic("user", "sm")}Cambiar a panel de comprador</a>
    </aside>
    <div class="acctbody">${body}</div>
  </div></div>`;
}
function sellerSplit() {
  const all = S.myVehicles || [];
  const ch = v => v.channel || (v.listingId ? "mercado" : v.auctionId ? "subasta" : v.st === "mercado" ? "mercado" : v.bids > 0 || v.st === "subasta" ? "subasta" : "mercado");
  return { mk: all.filter(v => ch(v) === "mercado"), sub: all.filter(v => ch(v) === "subasta") };
}

/* ---------- vendedor · Mercado: mis anuncios ---------- */
function mkst() { return { activo: ["ok", "Activo"], pausado: ["", "Pausado"], vendido: ["info", "Vendido"], revision: ["warn", "En revisión"] }; }
function viewMyListings() {
  const list = sellerSplit().mk;
  return sellShell("#/vender/anuncios", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Mercado</div><h1 style="margin-top:8px">Mis anuncios</h1>
      <p class="muted" style="margin:6px 0 0">Anuncios a precio fijo. Los compradores te contactan por los medios que elijas en <a class="link" href="#/cuenta/ajustes?tab=contacto">Contacto</a>.</p></div>
      <a class="btn primary" href="#/publicar?t=mercado">${ic("plus", "sm")}Nuevo anuncio</a></div>
    ${list.length ? `<div class="mylist">${list.map(v => { const st = mkst()[v.lst || (v.st === "vendido" ? "vendido" : "activo")] || mkst().activo; return `<div class="myrow" data-my="${v.id}">
      <img src="${pimg(v.img)}" alt="" loading="lazy">
      <div class="my-t"><b>${esc(v.title)}</b><small>${num(v.km)} km · ${CATS[v.cat] ? CATS[v.cat].short : ""} · publicado ${esc(v.date)}</small></div>
      <div class="my-n"><b class="tnum">${eur(v.price)}</b><small>${v.views ? num(v.views) + " visitas" : "—"}</small></div>
      <span class="chip ${st[0]}">${st[1]}</span>
      <div class="my-a"><button class="btn xs" data-mprice="${v.id}">${ic("euro", "sm")}Precio</button>${(v.lst || "activo") === "pausado" ? `<button class="btn xs" data-mst="activo" data-id="${v.id}">Reactivar</button>` : `<button class="btn xs" data-mst="pausado" data-id="${v.id}">Pausar</button>`}<button class="btn xs" data-mst="vendido" data-id="${v.id}">${ic("check", "sm")}Vendido</button></div>
    </div>`; }).join("")}</div>` : `<div class="panel empty">${ic("store", "lg")}<b>Aún no tienes anuncios en el Mercado</b><span>Publicar es gratis y se ve al momento.</span><a class="btn primary" href="#/publicar?t=mercado">Publicar gratis</a></div>`}`);
}
async function listingSet(v, patch) {
  if (live() && v.listingId) {
    const { error } = await sb.from("listings").update(patch).eq("id", v.listingId);
    if (error) { toast("No se ha podido guardar", "alert"); return false; }
  }
  if (patch.price != null) v.price = patch.price;
  if (patch.status) v.lst = patch.status;
  if (!live()) store.set("myvehicles", S.myVehicles);
  return true;
}
function mountMyListings() {
  const find = id => (S.myVehicles || []).find(x => String(x.id) === String(id));
  $$("[data-mst]").forEach(b => b.onclick = async () => { const v = find(b.dataset.id); if (v && await listingSet(v, { status: b.dataset.mst })) { toast(b.dataset.mst === "vendido" ? "Marcado como vendido" : b.dataset.mst === "pausado" ? "Anuncio pausado" : "Anuncio activo", "check"); if (live()) await sbLoadMarket(); router(); } });
  $$("[data-mprice]").forEach(b => b.onclick = () => { const v = find(b.dataset.mprice); if (!v) return;
    modal("Cambiar precio", `<p class="muted" style="margin:0">${esc(v.title)}</p><div class="field"><label for="npP">Nuevo precio (€)</label><div class="money"><span>€</span><input class="in tnum" id="npP" type="number" value="${v.price}"></div></div>
      <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="npNo">Cancelar</button><button class="btn primary" id="npGo">Guardar</button></div>`, close => {
      $("#npNo").onclick = close;
      $("#npGo").onclick = async () => { const p = +$("#npP").value; if (!(p > 0)) return toast("Indica un precio válido", "alert"); close(); if (await listingSet(v, { price: p })) { toast("Precio actualizado", "check"); if (live()) await sbLoadMarket(); router(); } };
    }); });
}

/* ---------- vendedor · Subastas: mis vehículos en subasta ---------- */
function viewMyAuctionVehicles() {
  const list = sellerSplit().sub;
  return sellShell("#/vender/subastas", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Subastas</div><h1 style="margin-top:8px">Vehículos en subasta</h1>
      <p class="muted" style="margin:6px 0 0">En las subastas los compradores no ven quién vende, ni tú quién compra. MotorSubasta gestiona el contacto, el pago y la recogida.</p></div>
      ${AUCTIONS_OPEN ? `<a class="btn primary" href="#/publicar">${ic("plus", "sm")}Subastar vehículo</a>` : `<span class="chip acc">${ic("bell", "sm")}Subastas próximamente</span>`}</div>
    <div class="privnote">${ic("lock", "sm")}<span><b>Tu identidad es confidencial.</b> El comprador solo recibe la dirección de recogida cuando la venta está aceptada y pagada.</span></div>
    ${list.length ? `<div class="mylist">${list.map(v => `<div class="myrow">
      <img src="${pimg(v.img)}" alt="" loading="lazy">
      <div class="my-t"><b>${esc(v.title)}</b><small>${num(v.km)} km · ${CATS[v.cat] ? CATS[v.cat].short : ""} · ${esc(v.date)}</small></div>
      <div class="my-n"><b class="tnum">${eur(v.price)}</b><small>salida · ${v.bids || 0} pujas</small></div>
      <span class="chip ${VST[v.st] ? VST[v.st][0] : ""}">${VST[v.st] ? VST[v.st][1] : esc(v.st)}</span>
      <div class="my-a"><button class="btn xs" data-pick="${v.id}">${ic("pin", "sm")}Recogida</button></div></div>`).join("")}</div>`
      : `<div class="panel empty">${ic("gavel", "lg")}<b>No tienes vehículos en subasta</b><span>${AUCTIONS_OPEN ? "Publica tu primer vehículo y elige «Subasta»." : "Las subastas abren muy pronto. Mientras tanto, publica gratis en el Mercado."}</span><a class="btn" href="#/publicar?t=mercado">Publicar en el Mercado</a></div>`}`);
}
function pickupModal(vehicleId, cur) {
  cur = cur || {};
  modal("Dirección de recogida", `<p class="muted" style="margin:0">Solo la recibe el comprador cuando la venta está aceptada y pagada. Nunca se muestra en el anuncio.</p>
    <div class="field"><label for="pkA">Dirección *</label><input class="in" id="pkA" value="${esc(cur.address || "")}" placeholder="Calle, número, polígono…"></div>
    <div class="fgrid"><div class="field"><label for="pkC">Ciudad</label><input class="in" id="pkC" value="${esc(cur.city || "")}"></div><div class="field"><label for="pkH">Horario</label><input class="in" id="pkH" value="${esc(cur.hours || "")}" placeholder="L–V 9:00–14:00"></div></div>
    <div class="field"><label for="pkP">Teléfono para la recogida</label><input class="in" id="pkP" type="tel" value="${esc(cur.phone || "")}"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="pkNo">Cancelar</button><button class="btn primary" id="pkGo">Guardar</button></div>`, close => {
    $("#pkNo").onclick = close;
    $("#pkGo").onclick = async () => {
      const row = { vehicle_id: vehicleId, address: $("#pkA").value.trim(), city: $("#pkC").value.trim() || null, hours: $("#pkH").value.trim() || null, phone: $("#pkP").value.trim() || null, updated_at: new Date().toISOString() };
      if (row.address.length < 5) return toast("Indica la dirección", "alert");
      if (live()) { const { error } = await sb.from("vehicle_pickup").upsert(row); if (error) return toast("No se ha podido guardar", "alert"); }
      else { const m = store.get("pickups", {}); m[vehicleId] = row; store.set("pickups", m); }
      close(); toast("Dirección de recogida guardada", "pin");
    };
  });
}
async function mountMyAuctionVehicles() {
  $$("[data-pick]").forEach(b => b.onclick = async () => {
    let cur = null;
    if (live()) { const { data } = await sb.from("vehicle_pickup").select("*").eq("vehicle_id", b.dataset.pick).maybeSingle(); cur = data; }
    else cur = store.get("pickups", {})[b.dataset.pick];
    pickupModal(b.dataset.pick, cur);
  });
}

/* ---------- comprador · Mercado ---------- */
function viewBuyerMarket() {
  const of = myOffers();
  const stTxt = { new: ["acc", "Enviada"], nueva: ["acc", "Enviada"], aceptada: ["ok", "Aceptada"], rechazada: ["", "Rechazada"], contraoferta: ["info", "Contraoferta"], caducada: ["", "Caducada"] };
  return acctShell("#/cuenta/mercado", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Mercado</div><h1 style="margin-top:8px">Mis ofertas y mensajes</h1>
      <p class="muted" style="margin:6px 0 0">Lo que has enviado a vendedores del Mercado y su respuesta.</p></div><a class="btn" href="#/mercado">${ic("store", "sm")}Ir al Mercado</a></div>
    ${of.length ? `<div class="mylist">${of.map(o => { const s = stTxt[o.status] || stTxt.new; const m = mkById(o.listing); return `<div class="myrow">
      <img src="${pimg(o.img)}" alt="" loading="lazy">
      <div class="my-t"><b>${esc(o.title)}</b><small>${o.msg ? "«" + esc(o.msg.slice(0, 80)) + "»" : "Sin mensaje"} · ${new Date(o.at).toLocaleDateString("es-ES")}</small></div>
      <div class="my-n"><b class="tnum">${eur(o.amount)}</b><small>${o.counter ? "Contraoferta " + eur(o.counter) : o.neg ? "tu oferta" : "precio"}</small></div>
      <span class="chip ${s[0]}">${s[1]}</span>
      <div class="my-a">${m ? `<a class="btn xs" href="#/mercado/${m.id}">Ver anuncio</a>` : ""}</div></div>`; }).join("")}</div>`
      : `<div class="panel empty">${ic("msg", "lg")}<b>Aún no has contactado con ningún vendedor</b><span>Haz una oferta o escribe desde cualquier anuncio del Mercado.</span><a class="btn primary" href="#/mercado">Ver vehículos</a></div>`}`);
}
async function sbLoadMyOffers() {
  if (!live() || !S.user) return;
  const { data, error } = await sb.from("offers").select("id, amount, message, status, counter, created_at, listing_id, listings(price, negotiable, vehicles(make, model, year, photos))").eq("buyer_id", S.user.id).order("created_at", { ascending: false });
  if (error || !data) return;
  store.set("myoffers", data.map(o => { const l = o.listings || {}, v = l.vehicles || {}; return { id: o.id, listing: o.listing_id, title: [v.year, v.make, v.model].filter(Boolean).join(" "), img: photoStem((v.photos || [])[0]), amount: +o.amount, msg: o.message || "", status: o.status, counter: o.counter ? +o.counter : null, neg: l.negotiable, at: o.created_at }; }));
}
function viewSaved() {
  const list = mkAll().filter(m => S.favs.has(m.id));
  return acctShell("#/cuenta/guardados", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Mercado</div><h1 style="margin-top:8px">Anuncios guardados</h1></div><a class="btn" href="#/mercado">${ic("store", "sm")}Ir al Mercado</a></div>
    ${list.length ? `<div class="mkcards">${list.map(mkCard).join("")}</div>` : `<div class="panel empty">${ic("heart", "lg")}<b>No tienes anuncios guardados</b><span>Pulsa el corazón en un anuncio para guardarlo aquí.</span><a class="btn primary" href="#/mercado">Ver vehículos</a></div>`}`);
}
function viewSearches() {
  const list = store.get("mksaved", []);
  return acctShell("#/cuenta/busquedas", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Mercado</div><h1 style="margin-top:8px">Búsquedas guardadas</h1><p class="muted" style="margin:6px 0 0">Te avisamos por email cuando aparece un vehículo que encaja.</p></div></div>
    ${list.length ? `<div class="mylist">${list.map((s, i) => `<div class="myrow sr"><span class="wic">${ic("bell")}</span><div class="my-t"><b>${esc(s.label || s.t || "Búsqueda")}</b><small>${esc(s.email || "")} · ${new Date(s.at).toLocaleDateString("es-ES")}</small></div>
      <div class="my-a"><button class="btn xs" data-srun="${i}">${ic("search", "sm")}Ver resultados</button><button class="btn xs ghost" data-sdel="${i}">${ic("x", "sm")}</button></div></div>`).join("")}</div>`
      : `<div class="panel empty">${ic("bell", "lg")}<b>No tienes búsquedas guardadas</b><span>En el Mercado, filtra y pulsa «Guardar búsqueda».</span><a class="btn primary" href="#/mercado">Ir al Mercado</a></div>`}`);
}
function mountSearches() {
  const list = store.get("mksaved", []);
  $$("[data-srun]").forEach(b => b.onclick = () => { const s = list[+b.dataset.srun]; if (s && s.filters) Object.assign(mkS(), s.filters); location.hash = "#/mercado"; });
  $$("[data-sdel]").forEach(b => b.onclick = () => { list.splice(+b.dataset.sdel, 1); store.set("mksaved", list); router(); });
}

/* ---------- comprador · recogida tras pagar ---------- */
async function showPickup(p) {
  let info = null;
  if (live() && p.oid) { const { data } = await sb.rpc("pickup_for_order", { p_order: p.oid }); info = data && data[0]; }
  else if (!live()) info = { address: "Polígono Industrial Ejemplo, nave 7", city: "Alicante", hours: "L–V 9:00–14:00", phone: "+34 600 000 000", notes: "Datos de demostración" };
  modal("Recogida del vehículo", info ? `<div class="pkbox">${ic("pin")}<div><b>${esc(info.address)}</b><small>${esc(info.city || "")}</small></div></div>
      ${info.hours ? `<div class="kv"><span>Horario</span><b>${esc(info.hours)}</b></div>` : ""}${info.phone ? `<div class="kv"><span>Teléfono de recogida</span><a class="link" href="tel:${esc(info.phone.replace(/\s/g, ""))}">${esc(info.phone)}</a></div>` : ""}
      ${info.notes ? `<p class="muted" style="margin:0;font-size:13px">${esc(info.notes)}</p>` : ""}
      <p class="faint" style="font-size:12.5px;margin:0">Lleva tu DNI/NIE y el justificante de pago. Si contrataste transporte, te avisaremos del día de recogida.</p>`
    : `<p class="muted" style="margin:0">La dirección de recogida se muestra cuando la compra está aceptada y pagada. Si ya has pagado, puede tardar unos minutos en confirmarse.</p>`);
}
patchRoute(/^\/cuenta\/compras$/, () => {
  $$(".acctbody tbody tr").forEach((tr, i) => {
    const p = S.purchases[i]; if (!p || p.st === "pendiente") return;
    const td = tr.lastElementChild; if (!td || td.querySelector("[data-pk]")) return;
    td.insertAdjacentHTML("afterbegin", `<button class="btn xs" data-pk="${i}" style="margin-right:6px">${ic("pin", "sm")}Recogida</button>`);
  });
  $$("[data-pk]").forEach(b => b.onclick = () => showPickup(S.purchases[+b.dataset.pk]));
});

/* ---------- contacto del Mercado ---------- */
function contactPrefs() { const u = S.user || {}; return Object.assign({ phone: false, whatsapp: true, email: false, platform: true }, u.contact || store.get("contact", null) || {}); }
function contactPane() {
  const u = S.user || {}, c = contactPrefs();
  const row = (k, i, t, d, val) => `<label class="ctrow"><span class="wic">${ic(i)}</span><span class="ct-t"><b>${t}</b><small>${d}</small>${val ? `<em class="mono">${esc(val)}</em>` : ""}</span><span class="toggle"><input type="checkbox" data-ct="${k}" ${c[k] ? "checked" : ""}><span></span></span></label>`;
  return `<div class="panel" style="display:grid;gap:16px"><div><h3 style="margin:0">Contacto en el Mercado</h3><p class="muted" style="margin:6px 0 0;font-size:13.5px">Elige cómo pueden contactarte los compradores de tus anuncios. En las subastas tus datos nunca se muestran.</p></div>
    <div class="field"><label for="ctName">Nombre visible en tus anuncios</label><input class="in" id="ctName" value="${esc(u.publicName || u.company || (u.name || "").split(" ")[0])}" maxlength="80"></div>
    <div class="fgrid"><div class="field"><label for="ctPhone">Teléfono</label><input class="in" id="ctPhone" type="tel" value="${esc(u.phone || "")}" placeholder="+34 600 000 000"></div>
      <div class="field"><label for="ctWa">WhatsApp</label><input class="in" id="ctWa" type="tel" value="${esc(u.whatsapp || u.phone || "")}" placeholder="+34 600 000 000"></div></div>
    <div class="ctlist">
      ${row("platform", "msg", "Mensajes por la plataforma", "Recomendado: ofertas y mensajes dentro de MotorSubasta", "")}
      ${row("whatsapp", "msg", "WhatsApp", "Botón directo a tu WhatsApp", u.whatsapp || u.phone)}
      ${row("phone", "bell", "Llamadas", "Tu número visible para llamar", u.phone)}
      ${row("email", "doc", "Email", "Tu email visible en el anuncio", u.email)}
    </div>
    <small class="faint">Los datos de contacto solo se muestran a usuarios registrados, para evitar spam.</small>
    <button class="btn primary" id="ctSave" style="justify-self:start">Guardar contacto</button></div>`;
}
async function saveContact() {
  const c = {}; $$("[data-ct]").forEach(x => c[x.dataset.ct] = x.checked);
  if (!c.platform && !c.whatsapp && !c.phone && !c.email) return toast("Deja al menos una forma de contacto", "alert");
  const name = $("#ctName").value.trim().slice(0, 80), phone = $("#ctPhone").value.trim(), wa = $("#ctWa").value.trim();
  if ((c.phone && phone.replace(/\D/g, "").length < 9) || (c.whatsapp && wa.replace(/\D/g, "").length < 9)) return toast("Revisa el número de teléfono", "alert");
  if (live() && S.user && S.user.id) {
    const { error } = await sb.from("profiles").update({ contact_prefs: c, public_name: name || null, phone: phone || null, whatsapp: wa || null }).eq("id", S.user.id);
    if (error) return toast("No se ha podido guardar", "alert");
  }
  Object.assign(S.user, { contact: c, publicName: name, phone, whatsapp: wa }); store.set("contact", c); saveUser();
  toast("Preferencias de contacto guardadas", "check");
}
patchRoute(/^\/cuenta\/ajustes$/, () => { const b = $("#ctSave"); if (b) b.onclick = saveContact; });

/* panel de contacto en la ficha del Mercado */
async function mkContactLoad(m) {
  const box = $("#mkContact"); if (!box) return;
  const btns = c => {
    const wa = c.whatsapp && c.whatsapp.replace(/[^\d]/g, ""), txt = encodeURIComponent(`Hola, me interesa tu ${m.title} (${eur(m.price)}) en MotorSubasta: ${location.origin}/#/mercado/${m.id}`);
    const out = [];
    if (wa) out.push(`<a class="btn block ctbtn wa" href="https://wa.me/${wa}?text=${txt}" target="_blank" rel="noopener">${ic("msg", "sm")}WhatsApp</a>`);
    if (c.phone) out.push(`<a class="btn block ctbtn" href="tel:${esc(c.phone.replace(/\s/g, ""))}">${ic("bell", "sm")}Llamar · <span class="mono">${esc(c.phone)}</span></a>`);
    if (c.email) out.push(`<a class="btn block ctbtn" href="mailto:${esc(c.email)}?subject=${encodeURIComponent(m.title + " · MotorSubasta")}&body=${txt}">${ic("doc", "sm")}Email</a>`);
    if (c.platform !== false) out.push(`<button class="btn block ctbtn" data-ctmsg>${ic("msg", "sm")}Mensaje por la plataforma</button>`);
    return out.join("");
  };
  const head = (n, k) => `<div class="ct-h"><span class="avatar">${k === "profesional" ? ic("building", "sm") : ic("user", "sm")}</span><div><b>${esc(n)}</b><small class="muted">${k === "profesional" ? "Profesional" : "Particular"} · ${esc(m.city)}</small></div></div>`;
  if (!S.user) { box.innerHTML = `${head(m.sellerType === "Profesional" ? m.seller : "Vendedor particular", m.sellerType === "Profesional" ? "profesional" : "particular")}<a class="btn block" href="#/login?next=${encodeURIComponent("#/mercado/" + m.id)}">${ic("user", "sm")}Inicia sesión para ver el contacto</a>`; return; }
  let c = null;
  if (live() && !/^[MI]/.test(String(m.id))) { const { data } = await sb.rpc("listing_contact", { p_listing: m.id }); c = data && data[0]; }
  if (!c) c = { name: m.sellerType === "Profesional" ? m.seller : "Vendedor particular", kind: m.sellerType === "Profesional" ? "profesional" : "particular", whatsapp: live() ? null : "+34 600 000 000", platform: true };
  box.innerHTML = head(c.name, c.kind) + `<div class="ctbtns">${btns(c)}</div>`;
  const pm = $("[data-ctmsg]", box); if (pm) pm.onclick = () => offerModal(m);
}

/* ---------- registrar ofertas propias (para "Mis ofertas") ---------- */
(function hookOffers() {
  const base = offerModal;
  offerModal = function (m) {
    base(m);
    const btn = $("#oYes"); if (!btn) return;
    btn.addEventListener("click", () => { const amt = $("#oAmt") ? +$("#oAmt").value : m.price, msg = $("#oMsg") ? $("#oMsg").value.trim() : ""; setTimeout(() => {
      if ($("#oYes")) return;
      const l = myOffers(); l.unshift({ id: Date.now(), listing: m.id, title: m.title, img: m.img, amount: amt || m.price, msg, status: "nueva", neg: m.neg, at: new Date().toISOString() });
      store.set("myoffers", l.slice(0, 100));
    }, 400); }, true);
  };
})();

/* ---------- publicar: comprobación de duplicados ---------- */
async function vehicleInUse(vin, plate) {
  const nv = String(vin || "").toUpperCase().replace(/\s/g, ""), np = String(plate || "").toUpperCase().replace(/[\s-]/g, "");
  if (live()) { const { data, error } = await sb.rpc("vehicle_in_use", { p_vin: nv || null, p_plate: np || null }); return error ? null : data; }
  const own = (S.myVehicles || []).find(v => (nv && String(v.vin || "").toUpperCase() === nv) || (np && String(v.plate || "").toUpperCase().replace(/[\s-]/g, "") === np));
  return own ? (own.channel || "mercado") : null;
}
function plateOk(p) { p = String(p || "").toUpperCase().replace(/[\s-]/g, ""); return /^\d{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$/.test(p) || /^[A-Z]{1,2}\d{4}[A-Z]{0,2}$/.test(p) || /^C\d{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$/.test(p) || /^[A-Z0-9]{4,10}$/.test(p) && /\d{3}/.test(p); }

/* guardar en Supabase con todos los datos (y estado visible en el Mercado) */
async function sbPublishVehicle() {
  if (!live() || !S.user) return null;
  const price = PUB.type === "subasta" ? Math.round(PUB.full * .25) : PUB.full;
  const row = { seller_id: S.user.id, make: PUB.make || "Vehículo", model: PUB.model || "", year: PUB.year || new Date().getFullYear(), km: PUB.km || 0,
    category: PUB.cat, title: PUB.title, panels: PUB.panels, vin: PUB.vin || null, plate: PUB.noPlate ? null : (PUB.plate || null), no_plate: !!PUB.noPlate,
    fuel: PUB.fuel || null, transmission: PUB.trans || null, description: PUB.desc || null,
    city: PUB.city || S.user.city, province: PUB.prov || S.user.city, photos: [], status: PUB.type === "mercado" ? "mercado" : "revision", country: PUB.cc === "PT" ? "PT" : "ES" };
  let r = await sb.from("vehicles").insert(row).select("id, status").single();
  if (r.error && /no_plate|country|column/i.test(r.error.message)) { if (/country/i.test(r.error.message)) delete row.country; else delete row.no_plate; r = await sb.from("vehicles").insert(row).select("id, status").single(); }
  if (r.error) {
    const msg = /YA_PUBLICADO:subasta/.test(r.error.message) ? "Este vehículo ya está en una subasta: no puede publicarse también en el Mercado."
      : /YA_PUBLICADO/.test(r.error.message) ? "Este vehículo (VIN o matrícula) ya está publicado." : /VIN_/.test(r.error.message) ? "El VIN es obligatorio." : /MATRICULA/.test(r.error.message) ? "La matrícula es obligatoria." : "No se pudo guardar: " + r.error.message;
    toast(msg, "alert"); return null;
  }
  const v = r.data;
  if (PUB.type === "mercado") {
    const { error } = await sb.from("listings").insert({ vehicle_id: v.id, price, negotiable: PUB.neg !== false, listing_type: PUB.mcat, status: "activo" });
    if (error) { toast("Vehículo guardado, pero no se pudo crear el anuncio: " + error.message, "alert"); return v; }
    await sbLoadMarket();
  } else if (PUB.pickup) {
    await sb.from("vehicle_pickup").upsert({ vehicle_id: v.id, address: PUB.pickup });
  }
  return v;
}

/* ---------- rutas ---------- */
(function accountRoutes() {
  ROUTES.unshift([/^\/vender\/anuncios$/, () => [viewMyListings(), () => { mountMyListings(); try { mountAcct(); } catch (e) {} }]]);
  ROUTES.unshift([/^\/vender\/subastas$/, () => [viewMyAuctionVehicles(), () => { mountMyAuctionVehicles(); try { mountAcct(); } catch (e) {} }]]);
  ROUTES.unshift([/^\/vender\/vehiculos$/, () => { location.replace("#/vender/anuncios"); return ["", null]; }]);
  ROUTES.unshift([/^\/cuenta\/mercado$/, () => [viewBuyerMarket(), () => { try { mountAcct(); } catch (e) {} sbLoadMyOffers().then(() => { if (route().path === "/cuenta/mercado" && live()) $("#app").innerHTML = viewBuyerMarket(); }); }]]);
  ROUTES.unshift([/^\/cuenta\/guardados$/, () => [viewSaved(), () => { bindCards($("#app")); initReveal($("#app")); }]]);
  ROUTES.unshift([/^\/cuenta\/busquedas$/, () => [viewSearches(), mountSearches]]);
})();
