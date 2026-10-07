/* ============================================================
   v7b — área de comprador, área de vendedor y enrutado con permisos
   ============================================================ */

/* ---------- derived account data ---------- */
function myBidLots() { return lots.filter(l => S.myBids[l.id]).sort((a, b) => a.endsAt - b.endsAt); }
function myWon() { return lots.filter(l => statusOf(l) === "end" && l.hist[0] && l.hist[0].who === "Tú"); }
S.purchases = store.get("purchases", [
  { id: "C-2026-0042", lot: "2015 Toyota Yaris Hybrid", img: "toyota-yaris", amount: 1850, fee: 139, date: "28/09/2026", st: "pagado", doc: "en trámite" },
  { id: "C-2026-0038", lot: "2005 BMW 330Ci Cabrio", img: "bmw-330ci", amount: 975, fee: 79, date: "15/09/2026", st: "entregado", doc: "completado" },
]);
S.myVehicles = store.get("myvehicles", [
  { id: "V-104", img: "mercedes-s", title: "2018 Mercedes-Benz S 350 d", km: 178000, cat: "danado", st: "subasta", price: 2000, bids: 4, views: 212, date: "02/10/2026" },
  { id: "V-103", img: "suzuki-jimny", title: "2011 Suzuki Jimny 1.3 4x4", km: 238000, cat: "danado", st: "revision", price: 625, bids: 0, views: 18, date: "05/10/2026" },
  { id: "V-102", img: "renault-clio", title: "2019 Renault Clio V 1.0 TCe", km: 88400, cat: "limpio", st: "mercado", price: 9800, bids: 2, views: 340, date: "20/09/2026" },
  { id: "V-101", img: "ford-transit", title: "2014 Ford Transit 2.2 TDCi", km: 464000, cat: "danado", st: "vendido", price: 818, bids: 9, views: 489, date: "12/09/2026" },
]);
var VST = { subasta: ["acc", "En subasta"], revision: ["warn", "En revisión"], mercado: ["info", "En mercado"], vendido: ["ok", "Vendido"], borrador: ["", "Borrador"] };

/* ---------- shells ---------- */
function acctShell(active, body) {
  const tabs = [["#/cuenta", "Panel", "chart"], ["#/cuenta/pujas", "Mis pujas", "gavel"], ["#/favoritos", "Favoritos", "heart"],
    ["#/cuenta/compras", "Mis compras", "truck"], ["#/cuenta/facturas", "Facturas", "doc"],
    ["#/cuenta/suscripcion", "Suscripción", "euro"], ["#/verificacion", "Verificación", "shield"], ["#/cuenta/ajustes", "Ajustes", "gear"]];
  return `<div class="wrap"><div class="acct">
    <aside class="acctnav">
      <div class="acctme"><span class="avatar" style="width:44px;height:44px;font-size:15px">${initials(S.user.name)}</span>
        <div><b>${esc(S.user.name)}</b><small class="muted">${esc(S.user.email)}</small>
        <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"><span class="chip acc">${S.user.plan}</span>${S.user.verified ? `<span class="chip ok">${ic("check", "sm")}Verificado</span>` : `<span class="chip warn">Sin verificar</span>`}</div></div></div>
      ${tabs.map(([h, t, i]) => `<a href="${h}" class="${h === active ? "on" : ""}">${ic(i, "sm")}${t}</a>`).join("")}
      ${canSell() ? `<a href="#/vender" class="sw">${ic("store", "sm")}Cambiar a panel de vendedor</a>` : ""}
    </aside>
    <div class="acctbody">${body}</div>
  </div></div>`;
}
function sellShell(active, body) {
  const tabs = [["#/vender", "Panel", "chart"], ["#/vender/vehiculos", "Mis vehículos", "car"], ["#/publicar", "Publicar", "plus"],
    ["#/vender/ofertas", "Ofertas recibidas", "msg"], ["#/vender/decisiones", "Decisiones", "scale"], ["#/vender/ventas", "Ventas", "euro"], ["#/vender/cobros", "Cobros", "truck"], ["#/cuenta/ajustes", "Ajustes", "gear"]];
  return `<div class="wrap"><div class="acct">
    <aside class="acctnav">
      <div class="acctme"><span class="avatar" style="width:44px;height:44px;font-size:15px">${initials(S.user.name)}</span>
        <div><b>${esc(S.user.company || S.user.name)}</b><small class="muted">Vendedor · ${esc(S.user.city || "España")}</small>
        <div style="display:flex;gap:6px;margin-top:6px"><span class="chip acc">${S.user.plan}</span></div></div></div>
      ${tabs.map(([h, t, i]) => `<a href="${h}" class="${h === active ? "on" : ""}">${ic(i, "sm")}${t}</a>`).join("")}
      <a href="#/cuenta" class="sw">${ic("user", "sm")}Cambiar a panel de comprador</a>
    </aside>
    <div class="acctbody">${body}</div>
  </div></div>`;
}
const kpi = (icn, label, value, note, color) => `<div class="kpi" data-rev><small>${ic(icn, "sm")}${label}</small><b class="tnum"${color ? ` style="color:${color}"` : ""}>${value}</b>${note ? `<em>${note}</em>` : ""}</div>`;

/* ---------- buyer area ---------- */
function viewAccount() {
  const bids = myBidLots(), won = myWon();
  const leading = bids.filter(l => l.hist[0] && l.hist[0].who === "Tú" && statusOf(l) !== "end");
  const spend = S.purchases.reduce((a, p) => a + p.amount + p.fee, 0);
  const next = bids.filter(l => statusOf(l) !== "end")[0];
  return acctShell("#/cuenta", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Panel de comprador</div><h1 style="margin-top:8px">Hola, ${esc(S.user.name.split(" ")[0])}</h1><p class="muted" style="margin:6px 0 0">Resumen de tu actividad en la plataforma.</p></div>
      <a class="btn primary" href="#/subastas">${ic("gavel", "sm")}Ir a las subastas</a></div>
    <div class="kpis">
      ${kpi("gavel", "Pujas activas", bids.filter(l => statusOf(l) !== "end").length, leading.length + " liderando")}
      ${kpi("check", "Lotes ganados", won.length, "últimos 30 días", "var(--ok)")}
      ${kpi("heart", "Siguiendo", S.favs.size, "favoritos")}
      ${kpi("euro", "Gasto total", eur(spend), S.purchases.length + " compras")}
    </div>
    ${!S.user.verified ? `<div class="panel" style="display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap;border-color:color-mix(in srgb,var(--warn) 40%,var(--line));margin-bottom:14px">
      <div style="display:flex;gap:12px;align-items:center">${ic("alert", "lg")}<div><b>Verifica tu identidad para pujar</b><p class="muted" style="margin:3px 0 0;font-size:13.5px">Es un paso único y tarda unos minutos.</p></div></div>
      <a class="btn primary sm" href="#/verificacion">Verificar ahora</a></div>` : ""}
    <div class="a-grid">
      <div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><h3 style="margin:0">Tus pujas en curso</h3><a class="link" href="#/cuenta/pujas">Ver todas ${ic("right", "sm")}</a></div>
        ${bids.length ? `<div class="tbl-wrap" style="border:0"><table><tbody>${bids.slice(0, 5).map(l => bidRow(l)).join("")}</tbody></table></div>`
          : `<div class="empty">${ic("gavel", "lg")}<b>Todavía no has pujado</b><span>Entra en una subasta y haz tu primera puja.</span><a class="btn sm primary" href="#/subastas">Ver subastas</a></div>`}</div>
      <div class="panel"><h3>Próximo cierre</h3>
        ${next ? `<a href="#/subasta/${next.id}" style="display:block"><img src="${imgSrc(next.img)}" alt="" style="width:100%;height:150px;object-fit:cover;border-radius:12px"></a>
          <b style="display:block;margin-top:10px">${esc(next.title)}</b>
          <div class="kv"><span>Tu puja</span><span class="tnum">${eur(S.myBids[next.id])}</span></div>
          <div class="kv"><span>Puja actual</span><span class="tnum">${eur(curPrice(next))}</span></div>
          <div class="kv"><span>${statusOf(next) === "soon" ? "Empieza en" : "Cierra en"}</span><span class="mono tnum" data-tm="${next.id}"></span></div>
          <a class="btn primary block" href="#/subasta/${next.id}" style="margin-top:10px">Ir al lote</a>`
          : `<div class="empty">${ic("clock", "lg")}Sin pujas activas</div>`}</div>
    </div>
    <div class="panel" style="margin-top:14px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><h3 style="margin:0">Actividad reciente</h3><a class="link" href="#/cuenta/notificaciones">Notificaciones ${ic("right", "sm")}</a></div>
      <ul class="feed">${S.notes.slice(0, 6).map(n => `<li><span class="dot" style="background:var(--accent)"></span><div>${n.txt}<div class="faint" style="font-size:12px">${ago(n.t)}</div></div></li>`).join("")}</ul></div>`);
}
function bidRow(l) {
  const lead = l.hist[0] && l.hist[0].who === "Tú", st = statusOf(l);
  return `<tr><td style="width:64px"><img class="th-img" src="${imgSrc(l.img)}" alt=""></td>
    <td><a href="#/subasta/${l.id}"><b>${esc(l.title)}</b></a><div class="faint" style="font-size:12px">${l.ref} · ${CATS[l.cat].short}</div></td>
    <td class="r"><div class="muted" style="font-size:12px">Tu puja</div><b class="tnum">${eur(S.myBids[l.id])}</b></td>
    <td class="r"><div class="muted" style="font-size:12px">Actual</div><b class="tnum">${eur(curPrice(l))}</b></td>
    <td class="r">${st === "end" ? `<span class="chip ${lead ? "ok" : ""}">${lead ? "Ganada" : "No adjudicada"}</span>` : `<span class="chip ${lead ? "ok" : "bad"}">${lead ? "Lideras" : "Superado"}</span><div class="mono tnum faint" style="font-size:12px" data-tm="${l.id}"></div>`}</td></tr>`;
}
function viewMyBids() {
  const bids = myBidLots();
  return acctShell("#/cuenta/pujas", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Comprador</div><h1 style="margin-top:8px">Mis pujas</h1></div></div>
    <div class="seg" style="margin-bottom:14px" id="bidFilter">${[["all", "Todas"], ["live", "En curso"], ["lead", "Lidero"], ["lost", "Superado"], ["end", "Finalizadas"]].map(([k, t], i) => `<button data-bf="${k}" class="${i === 0 ? "on" : ""}">${t}</button>`).join("")}</div>
    ${bids.length ? `<div class="tbl-wrap"><table><thead><tr><th colspan="2">Lote</th><th class="r">Tu puja</th><th class="r">Actual</th><th class="r">Estado</th></tr></thead><tbody id="bidsBody">${bids.map(l => bidRow(l)).join("")}</tbody></table></div>`
      : `<div class="panel empty">${ic("gavel", "lg")}<b>Aún no has pujado</b><a class="btn sm primary" href="#/subastas">Ver subastas</a></div>`}`);
}
function viewPurchases() {
  const won = myWon();
  return acctShell("#/cuenta/compras", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Comprador</div><h1 style="margin-top:8px">Mis compras</h1><p class="muted" style="margin:6px 0 0">Lotes ganados, pagos y estado de la documentación.</p></div></div>
    ${won.length ? `<div class="panel" style="margin-bottom:14px;border-color:var(--accent-line)"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
      <div><b>${won.length} ${won.length === 1 ? "lote ganado pendiente de pago" : "lotes ganados pendientes de pago"}</b><p class="muted" style="margin:4px 0 0;font-size:13.5px">Tienes 48 h desde la adjudicación para completar el pago.</p></div>
      <a class="btn primary sm" href="#/subasta/${won[0].id}">Pagar ahora</a></div></div>` : ""}
    <div class="tbl-wrap"><table><thead><tr><th colspan="2">Vehículo</th><th class="r">Importe</th><th class="r">Comisión</th><th>Fecha</th><th>Pago</th><th>Documentación</th><th class="r">Factura</th></tr></thead><tbody>
      ${S.purchases.map(p => `<tr><td style="width:64px"><img class="th-img" src="${imgSrc(p.img)}" alt=""></td><td><b>${p.lot}</b><div class="faint" style="font-size:12px">${p.id}</div></td>
        <td class="r tnum">${eur(p.amount)}</td><td class="r tnum">${eur(p.fee * 1.21)}</td><td class="muted">${p.date}</td>
        <td><span class="chip ok">${p.st}</span></td><td><span class="chip ${p.doc === "completado" ? "ok" : "warn"}">${p.doc}</span></td>
        <td class="r"><button class="btn xs" data-inv="${p.id}">${ic("doc", "sm")}PDF</button></td></tr>`).join("")}
    </tbody></table></div>`);
}
function viewInvoices() {
  const rows = S.purchases.map(p => ({ n: "F" + p.id.slice(1), c: "Comisión de compra · " + p.lot, a: p.fee * 1.21, d: p.date, s: "pagada" }))
    .concat([{ n: "F-2026-0101", c: "Suscripción " + S.plan + " · octubre", a: 39.99, d: "01/10/2026", s: "pagada" },
      { n: "F-2026-0088", c: "Transferencia vehículo estándar", a: 149 * 1.21, d: "29/09/2026", s: "pendiente" }]);
  return acctShell("#/cuenta/facturas", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Comprador</div><h1 style="margin-top:8px">Facturas</h1><p class="muted" style="margin:6px 0 0">Descarga tus facturas con IVA desglosado.</p></div>
      <button class="btn sm" id="invAll">${ic("upload", "sm")}Exportar todo</button></div>
    <div class="tbl-wrap"><table><thead><tr><th>Nº</th><th>Concepto</th><th class="r">Importe</th><th>Fecha</th><th>Estado</th><th class="r">Acciones</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td class="mono">${r.n}</td><td>${r.c}</td><td class="r tnum">${eur(r.a)}</td><td class="muted">${r.d}</td>
        <td><span class="chip ${r.s === "pagada" ? "ok" : "warn"}">${r.s}</span></td><td class="r"><button class="btn xs" data-inv="${r.n}">${ic("doc", "sm")}PDF</button></td></tr>`).join("")}
    </tbody></table></div>`);
}
function viewSubscriptionAcct() {
  const plan = S.plan, disc = /Dealer|Full/.test(plan) ? 10 : /Pro/.test(plan) ? 5 : 0;
  return acctShell("#/cuenta/suscripcion", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Comprador</div><h1 style="margin-top:8px">Suscripción</h1></div><a class="btn" href="#/precios">Comparar planes</a></div>
    <div class="a-grid">
      <div class="panel"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
        <div><span class="chip acc">Plan actual</span><h3 style="margin:10px 0 4px;font-size:24px">${plan}</h3><p class="muted" style="margin:0;font-size:13.5px">Renovación el 1 de noviembre de 2026</p></div>
        <div style="text-align:right"><div class="bigprice tnum">${plan.includes("Gratis") ? "Gratis" : "€39,99"}</div><small class="muted">/mes · IVA incl.</small></div></div>
        <div style="margin-top:16px">
          <div class="kv"><span>Descuento en comisión</span><b>−${disc}%</b></div>
          <div class="kv"><span>Acceso anticipado</span><b>${disc ? "+5 min" : "—"}</b></div>
          <div class="kv"><span>Ofertas Ocultas</span><b>${/Dealer|Full/.test(plan) ? "Incluido" : "No incluido"}</b></div>
          <div class="kv"><span>Puja automática</span><b>${disc ? "Ilimitada" : "Básica"}</b></div></div>
        <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap"><a class="btn primary" href="#/precios">Mejorar plan</a><button class="btn" id="subCancel">Cancelar suscripción</button></div></div>
      <div class="panel"><h3>Método de pago</h3>
        <div class="trow"><div><b>Visa •••• 4242</b><small>Caduca 09/2028</small></div><button class="btn xs" id="pmEdit">Cambiar</button></div>
        <div class="trow"><div><b>Facturación</b><small>${esc(S.user.company || S.user.name)} · ${esc(S.user.cif || "—")}</small></div><a class="btn xs" href="#/cuenta/ajustes">Editar</a></div>
        <h3 style="margin-top:18px">Historial</h3>
        <ul class="feed"><li><span class="dot" style="background:var(--ok)"></span><div>Pago de 39,99 € · octubre<div class="faint" style="font-size:12px">01/10/2026</div></div></li>
          <li><span class="dot" style="background:var(--ok)"></span><div>Pago de 39,99 € · septiembre<div class="faint" style="font-size:12px">01/09/2026</div></div></li></ul></div>
    </div>`);
}
var SETTAB = { t: "perfil" };
function viewSettings(q) {
  if (q && q.tab) SETTAB.t = q.tab;
  const t = SETTAB.t;
  const tabs = [["perfil", "Perfil y empresa"], ["notificaciones", "Notificaciones"], ["pantalla", "Pantalla"], ["suscripcion", "Suscripción"], ["seguridad", "Contraseña y seguridad"]];
  const u = S.user;
  const panes = {
    perfil: `<div class="panel" style="display:grid;gap:16px"><h3 style="margin:0">Perfil y empresa</h3>
      <div style="display:flex;gap:14px;align-items:center"><span class="avatar" style="width:64px;height:64px;font-size:20px">${initials(u.name)}</span>
        <div><button class="btn sm" id="stPhoto">${ic("upload", "sm")}Cambiar foto</button><small class="muted" style="display:block;margin-top:6px">JPG, PNG o WebP. Máx 2 MB.</small></div></div>
      <div class="lbl">Información personal</div>
      <div class="fgrid">
        <div class="field"><label for="stName">Nombre</label><input class="in" id="stName" value="${esc(u.name.split(" ")[0])}"></div>
        <div class="field"><label for="stLast">Apellidos</label><input class="in" id="stLast" value="${esc(u.name.split(" ").slice(1).join(" "))}"></div>
        <div class="field"><label for="stMail">Correo electrónico</label><input class="in" id="stMail" value="${esc(u.email)}" disabled><small class="muted">El email no puede modificarse desde aquí.</small></div>
        <div class="field"><label for="stTel">Teléfono</label><input class="in" id="stTel" value="${esc(u.phone || "")}"></div>
        <div class="field"><label for="stWa">WhatsApp</label><input class="in" id="stWa" value="${esc(u.phone || "")}"></div>
      </div>
      <div class="lbl">Empresa</div>
      <div class="fgrid">
        <div class="field"><label for="stCo">Nombre de empresa</label><input class="in" id="stCo" value="${esc(u.company || "")}"></div>
        <div class="field"><label for="stType">Tipo de empresa</label><select class="in" id="stType"><option>Compraventa</option><option>Taller</option><option>Desguace</option><option>Exportador</option><option>Renting / flota</option><option>Particular</option></select></div>
        <div class="field"><label for="stCif">CIF/NIF</label><input class="in" id="stCif" value="${esc(u.cif || "")}"></div>
        <div class="field"><label for="stCity">Ciudad</label><input class="in" id="stCity" value="${esc(u.city || "")}"></div>
        <div class="field"><label for="stAddr">Dirección fiscal</label><input class="in" id="stAddr" placeholder="Calle, número"></div>
        <div class="field"><label for="stZip">Código postal</label><input class="in" id="stZip" placeholder="03001"></div>
        <div class="field"><label for="stProv">Provincia</label><select class="in" id="stProv">${Object.keys(TRANSPORT).map(p => `<option>${p}</option>`).join("")}</select></div>
        <div class="field"><label for="stCountry">País</label><select class="in" id="stCountry"><option>ES — España</option><option>PT — Portugal</option><option>FR — Francia</option><option>BG — Bulgaria</option></select></div>
      </div>
      <button class="btn primary" id="stSave" style="justify-self:start">Guardar perfil</button></div>`,
    notificaciones: `<div class="panel"><h3>Notificaciones</h3>
      ${[["Te superan en una puja", "Aviso inmediato cuando alguien supera tu puja", 1], ["Lote que sigues cierra pronto", "15 minutos antes del cierre", 1],
        ["Nueva sesión de subasta", "Resumen diario de lotes publicados", 1], ["Oferta recibida en el mercado", "Cuando alguien hace una oferta a tu anuncio", 1],
        ["Novedades y promociones", "Como máximo una vez al mes", 0]].map(([t, d, on], i) =>
        `<div class="trow"><div><b>${t}</b><small>${d}</small></div><div style="display:flex;gap:14px;align-items:center">
          <label style="min-height:auto;font-size:12.5px"><input type="checkbox" ${on ? "checked" : ""}> <span>Email</span></label>
          <label style="min-height:auto;font-size:12.5px"><input type="checkbox" ${i < 3 ? "checked" : ""}> <span>WhatsApp</span></label></div></div>`).join("")}
      <button class="btn primary" style="margin-top:14px" id="stNoti">Guardar notificaciones</button></div>`,
    pantalla: `<div class="panel"><h3>Pantalla</h3>
      <div class="trow"><div><b>Idioma</b><small>Idioma de la interfaz</small></div><select class="in" id="stLang" style="width:auto"><option>Español</option><option>English</option><option>Deutsch</option><option>Français</option></select></div>
      <div class="trow"><div><b>Tema</b><small>Claro, oscuro o según el sistema</small></div><div class="seg" id="stTheme"><button data-th="light">Claro</button><button data-th="dark">Oscuro</button><button data-th="system">Sistema</button></div></div>
      <div class="trow"><div><b>Moneda y formato</b><small>EUR · formato español</small></div><select class="in" style="width:auto"><option>EUR (€)</option></select></div>
      <div class="trow"><div><b>Zona horaria</b><small>Afecta a las horas de sesión</small></div><select class="in" style="width:auto"><option>Europe/Madrid (CET)</option><option>Atlantic/Canary (WET)</option></select></div></div>`,
    suscripcion: `<div class="panel"><h3>Suscripción</h3><div class="kv"><span>Plan actual</span><b>${S.plan}</b></div><div class="kv"><span>Renovación</span><b>01/11/2026</b></div>
      <div style="display:flex;gap:8px;margin-top:14px"><a class="btn primary" href="#/cuenta/suscripcion">Gestionar suscripción</a><a class="btn" href="#/precios">Ver planes</a></div></div>`,
    seguridad: `<div class="panel" style="display:grid;gap:16px"><h3 style="margin:0">Contraseña y seguridad</h3>
      <div class="fgrid">
        <div class="field full"><label for="sePass">Contraseña actual</label><input class="in" id="sePass" type="password"></div>
        <div class="field"><label for="seNew">Nueva contraseña</label><input class="in" id="seNew" type="password"></div>
        <div class="field"><label for="seNew2">Repetir contraseña</label><input class="in" id="seNew2" type="password"></div>
      </div>
      <button class="btn primary" id="seSave" style="justify-self:start">Cambiar contraseña</button>
      <div class="trow"><div><b>Verificación en dos pasos</b><small>Código por SMS al iniciar sesión</small></div><label class="toggle"><input type="checkbox" aria-label="2FA"><span></span></label></div>
      <div class="trow"><div><b>Sesiones activas</b><small>MacBook Pro · Alicante · ahora</small></div><button class="btn xs" id="seOut">Cerrar otras sesiones</button></div>
      <div class="trow"><div><b style="color:var(--bad)">Eliminar cuenta</b><small>Se borran tus datos salvo los exigidos por ley</small></div><button class="btn xs bad" id="seDel">Eliminar</button></div></div>`,
  };
  return acctShell("#/cuenta/ajustes", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Cuenta</div><h1 style="margin-top:8px">Ajustes</h1><p class="muted" style="margin:6px 0 0">Gestiona las preferencias de tu cuenta.</p></div></div>
    <div class="tabs" style="margin-bottom:16px">${tabs.map(([k, t]) => `<button data-set="${k}" class="${t === k ? "" : ""}${k === SETTAB.t ? " on" : ""}">${t}</button>`).join("")}</div>
    ${panes[t]}`);
}
function viewNotificationsPage() {
  return acctShell("#/cuenta", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Cuenta</div><h1 style="margin-top:8px">Notificaciones</h1></div><button class="btn sm" id="ntRead">Marcar todo como leído</button></div>
    <div class="panel">${S.notes.map(n => `<div class="note ${n.unread ? "unread" : ""}"><span class="avatar">${ic(n.icon, "sm")}</span><div><b style="font-weight:500">${n.txt}</b><small>${ago(n.t)}</small></div></div>`).join("")}</div>`);
}

/* ---------- seller area ---------- */
function viewSeller() {
  const v = S.myVehicles;
  const sold = v.filter(x => x.st === "vendido");
  const income = sold.reduce((a, x) => a + x.price, 0);
  return sellShell("#/vender", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Panel de vendedor</div><h1 style="margin-top:8px">${esc(S.user.company || S.user.name)}</h1><p class="muted" style="margin:6px 0 0">Tus vehículos, ofertas y cobros.</p></div>
      <a class="btn primary" href="#/publicar">${ic("plus", "sm")}Publicar vehículo</a></div>
    <div class="kpis">
      ${kpi("car", "Vehículos publicados", v.length, v.filter(x => x.st === "subasta").length + " en subasta")}
      ${kpi("gavel", "Pujas recibidas", v.reduce((a, x) => a + x.bids, 0), "esta semana")}
      ${kpi("eye", "Visitas", num(v.reduce((a, x) => a + x.views, 0)), "últimos 30 días")}
      ${kpi("euro", "Ingresos", eur(income), sold.length + " vendidos", "var(--ok)")}
    </div>
    <div class="a-grid">
      <div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><h3 style="margin:0">Tus vehículos</h3><a class="link" href="#/vender/vehiculos">Ver todos ${ic("right", "sm")}</a></div>
        <div class="tbl-wrap" style="border:0"><table><tbody>${v.slice(0, 4).map(x => `<tr><td style="width:64px"><img class="th-img" src="${imgSrc(x.img)}" alt=""></td>
          <td><b>${x.title}</b><div class="faint" style="font-size:12px">${x.id} · ${num(x.km)} km</div></td>
          <td class="r tnum">${eur(x.price)}</td><td class="r"><span class="chip ${VST[x.st][0]}">${VST[x.st][1]}</span></td></tr>`).join("")}</tbody></table></div></div>
      <div class="panel"><h3>Acciones pendientes</h3>
        <div class="outcome"><span class="chip warn">${ic("msg", "sm")}2</span><div><small>Ofertas por responder</small><b>Mercedes S 350 d · Clio V</b></div></div>
        <div class="outcome"><span class="chip acc">${ic("clock", "sm")}1</span><div><small>En revisión</small><b>Suzuki Jimny 1.3</b></div></div>
        <div class="outcome"><span class="chip ok">${ic("euro", "sm")}1</span><div><small>Liquidación programada</small><b>818 € · Ford Transit</b></div></div>
        <a class="btn block" href="#/vender/ofertas" style="margin-top:8px">Revisar ofertas</a></div>
    </div>
    <div class="panel chart" style="margin-top:14px"><div style="display:flex;justify-content:space-between;margin-bottom:10px"><h3 style="margin:0">Visitas por día</h3><span class="muted" style="font-size:12px">Últimos 14 días</span></div>
      ${sparkChart([18, 24, 31, 28, 44, 52, 38, 41, 60, 72, 55, 68, 81, 94])}</div>`);
}
function sparkChart(data) {
  const W = 560, H = 160, mx = Math.max(...data) * 1.15, bw = W / data.length;
  return `<svg viewBox="0 0 ${W + 30} ${H + 28}" role="img" aria-label="Visitas por día">
    ${[0, Math.round(mx / 2), Math.round(mx)].map(v => `<line x1="30" x2="${W + 30}" y1="${H - v / mx * H + 5}" y2="${H - v / mx * H + 5}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="0" y="${H - v / mx * H + 9}">${v}</text>`).join("")}
    ${data.map((v, i) => `<rect x="${30 + i * bw + 4}" y="${H - v / mx * H + 5}" width="${bw - 8}" height="${v / mx * H}" rx="3" fill="${i === data.length - 1 ? "var(--accent)" : "var(--surface-3)"}"><title>${v} visitas</title></rect>`).join("")}
  </svg>`;
}
function viewSellerVehicles() {
  return sellShell("#/vender/vehiculos", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Vendedor</div><h1 style="margin-top:8px">Mis vehículos</h1></div><a class="btn primary" href="#/publicar">${ic("plus", "sm")}Publicar vehículo</a></div>
    <div class="tbl-wrap"><table><thead><tr><th colspan="2">Vehículo</th><th class="r">Precio / salida</th><th class="r">Pujas</th><th class="r">Visitas</th><th>Estado</th><th>Publicado</th><th class="r">Acciones</th></tr></thead><tbody>
      ${S.myVehicles.map(x => `<tr><td style="width:64px"><img class="th-img" src="${imgSrc(x.img)}" alt=""></td>
        <td><b>${x.title}</b><div class="faint" style="font-size:12px">${x.id} · ${num(x.km)} km · ${CATS[x.cat].short}</div></td>
        <td class="r tnum">${eur(x.price)}</td><td class="r tnum">${x.bids}</td><td class="r tnum">${num(x.views)}</td>
        <td><span class="chip ${VST[x.st][0]}">${VST[x.st][1]}</span></td><td class="muted">${x.date}</td>
        <td><div class="actions"><button class="btn xs" data-ved="${x.id}">${ic("gear", "sm")}Editar</button><button class="btn xs" data-vst="${x.id}">${ic("chart", "sm")}Estadísticas</button></div></td></tr>`).join("")}
    </tbody></table></div>`);
}
S.sellerOffers = store.get("selleroffers", [
  { id: 1, img: "mercedes-s", title: "2018 Mercedes-Benz S 350 d", buyer: "Talleres Llorca", amount: 2300, msg: "Puedo recogerlo esta semana en Finestrat.", d: "hace 2 h", st: "new" },
  { id: 2, img: "renault-clio", title: "2019 Renault Clio V 1.0 TCe", buyer: "AutoExport Ruse", amount: 8800, msg: "Para exportación, pago por transferencia inmediata.", d: "hace 6 h", st: "new" },
  { id: 3, img: "ford-transit", title: "2014 Ford Transit 2.2 TDCi", buyer: "Desguaces Segura", amount: 760, msg: "", d: "hace 2 días", st: "acc" },
]);
function viewSellerOffers() {
  return sellShell("#/vender/ofertas", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Vendedor</div><h1 style="margin-top:8px">Ofertas recibidas</h1><p class="muted" style="margin:6px 0 0">Tienes 24 h para aceptar, rechazar o contraofertar.</p></div></div>
    <div style="display:grid;gap:12px">${S.sellerOffers.map(o => `<div class="panel offer" data-rev>
      <img src="${imgSrc(o.img)}" alt="">
      <div><b>${o.title}</b><div class="muted" style="font-size:13px">${o.buyer} · ${o.d}</div>${o.msg ? `<p class="muted" style="margin:8px 0 0;font-size:13.5px">“${o.msg}”</p>` : ""}</div>
      <div class="oamt"><small class="muted">Oferta</small><b class="tnum">${eur(o.amount)}</b><small class="muted">neto para ti ${eur(o.amount * 0.985)}</small></div>
      <div class="oact">${o.st === "new" ? `<button class="btn sm primary" data-off="${o.id}" data-a="acc">Aceptar</button>
        <button class="btn sm" data-off="${o.id}" data-a="cnt">Contraofertar</button>
        <button class="btn sm bad" data-off="${o.id}" data-a="rej">Rechazar</button>`
        : `<span class="chip ${o.st === "acc" ? "ok" : "bad"}">${o.st === "acc" ? "Aceptada" : "Rechazada"}</span>`}</div>
    </div>`).join("")}</div>`);
}
function viewSellerSales() {
  const rows = [["V-101", "2014 Ford Transit 2.2 TDCi", 818, "12/09/2026", "Talleres Llorca", "liquidado"],
    ["V-098", "2006 Peugeot 307 1.6 HDi", 425, "02/09/2026", "Desguaces Segura", "liquidado"],
    ["V-095", "2016 SEAT Ibiza 1.0 TSI", 325, "21/08/2026", "AutoExport Ruse", "liquidado"]];
  const total = rows.reduce((a, r) => a + r[2], 0);
  return sellShell("#/vender/ventas", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Vendedor</div><h1 style="margin-top:8px">Ventas</h1></div></div>
    <div class="kpis">${kpi("euro", "Facturado", eur(total), "últimos 60 días")}${kpi("car", "Vehículos vendidos", rows.length, "")}${kpi("scale", "Precio medio", eur(total / rows.length), "")}${kpi("clock", "Tiempo medio de venta", "7 días", "desde publicación")}</div>
    <div class="tbl-wrap"><table><thead><tr><th>Ref</th><th>Vehículo</th><th class="r">Adjudicado</th><th class="r">Comisión</th><th class="r">Neto</th><th>Fecha</th><th>Comprador</th><th>Estado</th></tr></thead><tbody>
      ${rows.map(([ref, t, a, d, b, s]) => `<tr><td class="mono">${ref}</td><td><b>${t}</b></td><td class="r tnum">${eur(a)}</td><td class="r tnum muted">${eur(a * .015)}</td><td class="r tnum">${eur(a * .985)}</td><td class="muted">${d}</td><td>${b}</td><td><span class="chip ok">${s}</span></td></tr>`).join("")}
    </tbody></table></div>`);
}
function viewSellerPayouts() {
  return sellShell("#/vender/cobros", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Vendedor</div><h1 style="margin-top:8px">Cobros</h1><p class="muted" style="margin:6px 0 0">Configura dónde recibes el dinero de tus ventas.</p></div></div>
    <div class="a-grid">
      <div class="panel"><h3>Estado de la cuenta de cobro</h3>
        <ol class="vsteps"><li class="done"><span class="n">${ic("check", "sm")}</span><div><b>Datos fiscales</b><small>${esc(S.user.company || S.user.name)} · ${esc(S.user.cif || "—")}</small></div></li>
          <li class="done"><span class="n">${ic("check", "sm")}</span><div><b>Identidad verificada</b><small>Verificación completada</small></div></li>
          <li class="now"><span class="n">3</span><div><b>Cuenta bancaria</b><small>Añade el IBAN donde recibirás las liquidaciones</small></div></li></ol>
        <div class="field" style="margin-top:14px"><label for="pyIban">IBAN</label><input class="in mono" id="pyIban" placeholder="ES00 0000 0000 0000 0000 0000"></div>
        <button class="btn primary" id="pySave" style="margin-top:12px">Guardar cuenta de cobro</button></div>
      <div class="panel"><h3>Cómo funcionan los pagos</h3>
        <ol class="howpay"><li>Tu subasta termina y un comprador gana el lote.</li><li>Revisas y aceptas la puja ganadora (24 h si hay reserva).</li><li>El comprador completa el pago en la plataforma.</li><li>Los fondos se transfieren a tu banco menos la comisión de tu plan.</li><li>Coordinas la entrega o el transporte con el comprador.</li></ol>
        <div class="kv"><span>Comisión de tu plan</span><b>${/Dealer|Full/.test(S.plan) ? "0%" : /Pro/.test(S.plan) ? "1,5%" : "3%"}</b></div>
        <div class="kv"><span>Plazo de liquidación</span><b>2–3 días laborables</b></div></div>
    </div>
    <div class="panel" style="margin-top:14px"><h3>Liquidaciones</h3>
      <div class="tbl-wrap" style="border:0"><table><thead><tr><th>Referencia</th><th>Concepto</th><th class="r">Importe</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>
        <tr><td class="mono">L-2026-0031</td><td>Ford Transit 2.2 TDCi</td><td class="r tnum">${eur(818 * .985)}</td><td class="muted">15/09/2026</td><td><span class="chip ok">Transferido</span></td></tr>
        <tr><td class="mono">L-2026-0029</td><td>Peugeot 307 1.6 HDi</td><td class="r tnum">${eur(425 * .985)}</td><td class="muted">05/09/2026</td><td><span class="chip ok">Transferido</span></td></tr>
        <tr><td class="mono">L-2026-0034</td><td>Mercedes S 350 d (pendiente de pago)</td><td class="r tnum">${eur(2000 * .985)}</td><td class="muted">—</td><td><span class="chip warn">Programada</span></td></tr>
      </tbody></table></div></div>`);
}

/* ---------- mounts for the account/seller areas ---------- */
function mountAcct() {
  $$("[data-inv]").forEach(b => b.onclick = () => toast("Factura " + b.dataset.inv + " descargada (demo)", "doc"));
  $$("[data-bf]").forEach(b => b.onclick = () => {
    $$("[data-bf]").forEach(x => x.classList.toggle("on", x === b));
    const k = b.dataset.bf, body = $("#bidsBody"); if (!body) return;
    const ls = myBidLots().filter(l => {
      const lead = l.hist[0] && l.hist[0].who === "Tú", st = statusOf(l);
      return k === "all" || (k === "live" && st !== "end") || (k === "lead" && lead && st !== "end") || (k === "lost" && !lead && st !== "end") || (k === "end" && st === "end");
    });
    body.innerHTML = ls.length ? ls.map(l => bidRow(l)).join("") : `<tr><td colspan="5" class="muted" style="text-align:center;padding:26px">Sin lotes en este estado</td></tr>`;
  });
  $$("[data-set]").forEach(b => b.onclick = () => { SETTAB.t = b.dataset.set; router(); });
  ["stSave", "stNoti", "seSave"].forEach(id => { const e = $("#" + id); if (e) e.onclick = () => { if (id === "stSave" && S.user) { S.user.name = ($("#stName").value + " " + $("#stLast").value).trim(); S.user.phone = $("#stTel").value; S.user.company = $("#stCo").value; S.user.cif = $("#stCif").value; S.user.city = $("#stCity").value; saveUser(); renderHeader(route().path); } toast("Cambios guardados", "check"); }; });
  if ($("#stTheme")) $$("#stTheme button").forEach(b => b.onclick = () => { S.theme = b.dataset.th === "system" ? null : b.dataset.th; store.set("theme", S.theme); if (!S.theme) document.documentElement.removeAttribute("data-theme"); applyTheme(); $$("#stTheme button").forEach(x => x.classList.toggle("on", x === b)); });
  if ($("#stPhoto")) $("#stPhoto").onclick = () => toast("Subida de foto disponible en la versión con servidor", "upload");
  if ($("#seOut")) $("#seOut").onclick = () => toast("Otras sesiones cerradas", "lock");
  if ($("#seDel")) $("#seDel").onclick = () => modal("Eliminar cuenta", `<p style="margin:0">Esta acción borra tu perfil, tus favoritos y tus preferencias. Las facturas se conservan por obligación legal.</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn bad" id="cYes">Eliminar cuenta</button></div>`, close => { $("#cNo").onclick = close; $("#cYes").onclick = () => { close(); logout(); }; });
  if ($("#subCancel")) $("#subCancel").onclick = () => modal("Cancelar suscripción", `<p style="margin:0">Tu plan <b>${S.plan}</b> seguirá activo hasta el 1 de noviembre y después pasarás al plan gratuito.</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Mantener plan</button><button class="btn bad" id="cYes">Cancelar</button></div>`, close => { $("#cNo").onclick = close; $("#cYes").onclick = () => { close(); toast("Suscripción cancelada al final del periodo", "check"); }; });
  if ($("#pmEdit")) $("#pmEdit").onclick = () => toast("Gestión de tarjeta disponible con el proveedor de pagos", "euro");
  if ($("#invAll")) $("#invAll").onclick = () => toast("Exportación enviada a tu correo (demo)", "doc");
  if ($("#ntRead")) $("#ntRead").onclick = () => { S.notes.forEach(n => n.unread = false); router(); toast("Notificaciones marcadas como leídas", "check"); };
}
function mountSeller() {
  $$("[data-ved]").forEach(b => b.onclick = () => { location.hash = "#/publicar"; });
  $$("[data-vst]").forEach(b => b.onclick = () => toast("Estadísticas detalladas del anuncio (demo)", "chart"));
  if ($("#pySave")) $("#pySave").onclick = () => { const v = $("#pyIban").value.replace(/\s/g, ""); if (v.length < 20) { toast("Introduce un IBAN válido", "alert"); return; } toast("Cuenta de cobro guardada", "check"); };
  $$("[data-off]").forEach(b => b.onclick = () => {
    const o = S.sellerOffers.find(x => x.id == b.dataset.off), a = b.dataset.a;
    if (a === "acc") { o.st = "acc"; store.set("selleroffers", S.sellerOffers); toast("Oferta aceptada. Se notifica al comprador.", "check"); router(); }
    else if (a === "rej") { o.st = "rej"; store.set("selleroffers", S.sellerOffers); toast("Oferta rechazada", "x"); router(); }
    else modal("Contraoferta", `<p style="margin:0"><b>${o.title}</b> · oferta recibida ${eur(o.amount)}</p>
      <div class="field"><label for="cntAmt">Tu contraoferta</label><div class="money"><span>€</span><input class="in" id="cntAmt" type="number" value="${Math.round(o.amount * 1.12 / 50) * 50}"></div></div>
      <div class="field"><label for="cntMsg">Mensaje (opcional)</label><textarea class="in" id="cntMsg" placeholder="Incluye ITV recién pasada."></textarea></div>
      <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">Enviar contraoferta</button></div>`, close => {
      $("#cNo").onclick = close;
      $("#cYes").onclick = () => { close(); o.st = "cnt"; toast("Contraoferta de " + eur(+$("#cntAmt").value) + " enviada", "msg"); };
    });
  });
}

/* ---------- routing with guards ---------- */
var GUARD = { auth: ["/cuenta", "/vender", "/publicar", "/verificacion", "/verificar-email"], seller: ["/vender", "/publicar"] };
ROUTES.length = 0;
ROUTES.push(
  [/^\/$/, () => [viewHome(), () => bindCards()]],
  [/^\/subastas$/, q => [viewAuctions(q), mountAuctions]],
  [/^\/subasta\/(\w+)$/, (q, m) => [viewLot(m[1]), () => mountLot(m[1])]],
  [/^\/mercado$/, () => [viewMarket(), mountMarket]],
  [/^\/mercado\/(\w+)$/, (q, m) => [viewMarketItem(m[1]), () => { const it = market.find(x => x.id === m[1]); if (it) { $("#miOffer").onclick = () => offerModal(it); $("#miRes").onclick = () => toast("Reserva de 48 h confirmada", "lock"); } }]],
  [/^\/ofertas-ocultas$/, () => [viewHidden(), () => bindCards()]],
  [/^\/valoracion$/, () => [viewValuation(), mountValuation]],
  [/^\/publicar$/, q => [viewPublish(q), mountPublish]],
  [/^\/precios$/, () => [viewPricing(), mountPricing]],
  [/^\/tarifas$/, () => [viewFees(), mountFees]],
  [/^\/como-funciona$/, () => [viewHowItWorks(), null]],
  [/^\/faq$/, () => [viewFaq(), mountFaq]],
  [/^\/contacto$/, () => [viewContact(), () => { $("#coGo").onclick = () => { if (!$("#coMsg").value.trim()) { toast("Escribe un mensaje", "alert"); return; } toast("Mensaje enviado. Te respondemos en 24 h.", "msg"); }; }]],
  [/^\/(terminos|privacidad|condiciones-puja)$/, (q, m) => [viewLegal(m[1]), null]],
  [/^\/empresa$/, () => [viewCompany(), null]],
  [/^\/favoritos$/, () => [viewFavs(), () => bindCards()]],
  [/^\/login$/, q => [viewLogin(q), () => mountLogin(q)]],
  [/^\/registro$/, () => [viewRegister(), mountRegister]],
  [/^\/recuperar$/, () => [viewForgot(), () => { $("#fgGo").onclick = () => toast("Si el correo existe, recibirás un enlace en unos minutos", "msg"); }]],
  [/^\/verificar-email$/, () => [viewVerifyEmail(), () => {
    $("#veResend").onclick = () => toast("Correo reenviado", "msg");
    $("#veDone").onclick = () => { toast("Correo confirmado", "check"); location.hash = "#/verificacion"; };
  }]],
  [/^\/verificacion$/, () => [viewVerification(), () => {
    if ($("#vfStart")) $("#vfStart").onclick = () => {
      S.user.vstep = 1; saveUser(); router(); toast("Documento enviado. Revisión en curso…", "upload");
      setTimeout(() => { if (S.user) { S.user.vstep = 2; saveUser(); if (route().path === "/verificacion") router(); } }, 2500);
      setTimeout(() => { if (S.user) { S.user.verified = true; saveUser(); renderHeader(route().path); if (route().path === "/verificacion") router(); toast("¡Identidad verificada!", "check"); notify("Tu identidad ha sido <b>verificada</b>. Ya puedes pujar.", "shield"); } }, 5200);
    };
  }]],
  [/^\/cuenta$/, () => [viewAccount(), mountAcct]],
  [/^\/cuenta\/pujas$/, () => [viewMyBids(), mountAcct]],
  [/^\/cuenta\/compras$/, () => [viewPurchases(), mountAcct]],
  [/^\/cuenta\/facturas$/, () => [viewInvoices(), mountAcct]],
  [/^\/cuenta\/suscripcion$/, () => [viewSubscriptionAcct(), mountAcct]],
  [/^\/cuenta\/ajustes$/, q => [viewSettings(q), mountAcct]],
  [/^\/cuenta\/notificaciones$/, () => [viewNotificationsPage(), mountAcct]],
  [/^\/vender$/, () => [viewSeller(), mountSeller]],
  [/^\/vender\/vehiculos$/, () => [viewSellerVehicles(), mountSeller]],
  [/^\/vender\/ofertas$/, () => [viewSellerOffers(), mountSeller]],
  [/^\/vender\/ventas$/, () => [viewSellerSales(), mountSeller]],
  [/^\/vender\/cobros$/, () => [viewSellerPayouts(), mountSeller]],
  [/^\/admin$/, () => [viewAdmin(), mountAdmin]],
);
function router() {
  ensureMotion();
  const { path, query } = route();
  if (GUARD.auth.some(p => path.startsWith(p)) && !isLogged()) { location.hash = "#/login?next=" + encodeURIComponent("#" + path); return; }
  if (GUARD.seller.some(p => path.startsWith(p)) && !canSell()) {
    $("#app").innerHTML = `<div class="wrap"><div class="panel empty" style="margin-top:40px">${ic("lock", "lg")}<b>Esta área es para cuentas de vendedor</b><span>Tu cuenta es de tipo ${ROLE_LABEL[S.user.role]}. Puedes activar la venta desde tus ajustes.</span><div style="display:flex;gap:8px"><a class="btn primary" href="#/cuenta/ajustes">Ir a ajustes</a><a class="btn" href="#/subastas">Ver subastas</a></div></div></div>`;
    renderHeader(path); return;
  }
  if (path === "/admin" && !roleIs("admin")) {
    $("#app").innerHTML = `<div class="wrap"><div class="panel empty" style="margin-top:40px">${ic("shield", "lg")}<b>Área restringida</b><span>El panel de administración solo está disponible para el equipo de MotorSubasta.</span><a class="btn primary" href="#/">Volver al inicio</a></div></div>`;
    renderHeader(path); return;
  }
  let out = null;
  for (const [re, fn] of ROUTES) { const m = path.match(re); if (m) { out = fn(query, m); break; } }
  if (!out) out = [`<div class="wrap"><div class="empty" style="padding:90px">${ic("alert", "lg")}<b>Página no encontrada</b><a class="btn primary" href="#/">Ir al inicio</a></div></div>`, null];
  const app = $("#app");
  app.innerHTML = out[0];
  app.classList.remove("page-in"); void app.offsetWidth;
  if (!RM()) app.classList.add("page-in");
  out[1] && out[1]();
  if (path !== lastPath) { scrollTo(0, 0); lastPath = path; }
  $("#mnav").hidden = true;
  renderHeader(path);
  initReveal(app); fadeImgs(app);
  document.title = "MotorSubasta";
}

/* footer links to the new pages */
(function fixFooter() {
  const map = { "#/precios": "#/precios", "#/empresa": "#/empresa" };
  const f = document.querySelector("footer .cols");
  if (!f) return;
  f.innerHTML = `<div><a class="logo" href="#/"><img class="lg lg-d" src="img/logo-dark.png" alt="MotorSubasta"><img class="lg lg-l" src="img/logo-light.png" alt="MotorSubasta"></a>
      <p class="muted" style="max-width:34ch;font-size:14px;margin-top:16px">Subastas y mercado profesional de vehículos en España. Limpios, dañados y siniestros, con reglas claras.</p></div>
    <div><h5>Plataforma</h5><a href="#/mercado">Mercado</a><a href="#/subastas">Subastas</a><a href="#/ofertas-ocultas">Ofertas ocultas</a><a href="#/valoracion">Valoración gratuita</a><a href="#/contrato">Contrato de compraventa</a><a href="#/seguros">Seguros</a></div>
    <div><h5>Precios</h5><a href="#/precios">Planes y suscripciones</a><a href="#/tarifas">Tarifas del comprador</a><a href="#/tarifas">Servicios de gestoría</a></div>
    <div><h5>Empresa</h5><a href="#/empresa">Sobre nosotros</a><a href="#/como-funciona">Cómo funciona</a><a href="#/faq">Preguntas frecuentes</a><a href="#/contacto">Contacto</a></div>
    <div><h5>Legal</h5><a href="#/privacidad">Política de privacidad</a><a href="#/terminos">Condiciones de uso</a><a href="#/condiciones-puja">Condiciones de puja</a></div>`;
})();

/* boot happens in the last layer */
