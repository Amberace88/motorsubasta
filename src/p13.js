/* ============================================================
   v8 — pago del lote ganado, alta de perfil, analítica de admin
   ============================================================ */

/* ---------- helpers ---------- */
var IVA = 0.21;
var PROVS = Object.keys(TRANSPORT);
var PAY = { step: 0, gest: 0, trans: "", method: "card", terms: false, done: null };
var PAY_STEPS = ["Resumen", "Facturación", "Servicios", "Pago"];

function payLot(id) {
  const l = lots.find(x => x.id === id);
  if (l) return { id: l.id, title: l.title, img: l.img, amount: curPrice(l), km: l.km, city: l.city, cat: l.cat, lot: true };
  const p = S.purchases.find(x => x.id === id);
  if (p) return { id: p.id, title: p.lot, img: p.img, amount: p.amount, km: 0, city: "—", cat: "limpio", lot: false };
  return null;
}
function payTotals(v) {
  const base = v.amount, fee = buyerFee(base);
  const gest = PAY.gest ? GESTORIA[PAY.gest - 1][1] : 0;
  const trans = PAY.trans ? TRANSPORT[PAY.trans] : 0;
  const services = fee + gest + trans;
  const iva = services * IVA;
  return { base, fee, gest, trans, services, iva, total: base + services + iva };
}
function payUnpaid() {
  const won = myWon().filter(l => !S.purchases.some(p => p.ref === l.id));
  return won;
}

/* ---------- checkout ---------- */
function coSummary(v) {
  const t = payTotals(v);
  return `<div class="co-side">
    <div class="co-sum">
      <h4>Resumen del pago</h4>
      <div class="co-car"><img src="${imgSrc(v.img)}" alt=""><div><b>${esc(v.title)}</b><small class="muted" style="font-size:12px">${v.km ? num(v.km) + " km · " : ""}${esc(v.city)}</small></div></div>
      <div class="kv"><span>Importe del lote</span><span class="tnum">${eur(t.base)}</span></div>
      <div class="kv"><span>Comisión de compra</span><span class="tnum">${eur(t.fee)}</span></div>
      ${t.gest ? `<div class="kv"><span>${GESTORIA[PAY.gest - 1][0]}</span><span class="tnum">${eur(t.gest)}</span></div>` : ""}
      ${t.trans ? `<div class="kv"><span>Transporte a ${PAY.trans}</span><span class="tnum">${eur(t.trans)}</span></div>` : ""}
      <div class="kv"><span>IVA 21% (servicios)</span><span class="tnum">${eur(t.iva)}</span></div>
      <div class="co-tot"><span>Total a pagar</span><b id="coTot">${eur(t.total)}</b></div>
      <p class="faint" style="font-size:11.5px;margin:10px 0 0">El importe del lote no lleva IVA en compraventa entre particulares. El IVA se aplica a la comisión y a los servicios.</p>
    </div>
    <div class="co-sum co-safe">
      <div>${ic("shield", "sm")}<span>Tu dinero queda retenido hasta que confirmes la recogida del vehículo.</span></div>
      <div>${ic("lock", "sm")}<span>Pago cifrado. MotorSubasta no almacena los datos de tu tarjeta.</span></div>
      <div>${ic("clock", "sm")}<span>Tienes 48 h desde la adjudicación para completar el pago.</span></div>
      <div>${ic("msg", "sm")}<span>¿Dudas? <a href="#/contacto">Escríbenos</a> o llama al 602 456 789.</span></div>
    </div></div>`;
}
function viewPay(id) {
  const v = payLot(id);
  if (!v) return `<div class="wrap"><div class="panel empty" style="margin-top:40px">${ic("alert", "lg")}<b>Lote no encontrado</b><span>Puede que el pago ya esté completado.</span><a class="btn primary" href="#/cuenta/compras">Ir a mis compras</a></div></div>`;
  if (PAY.done === id) {
    const t = payTotals(v);
    return `<div class="wrap"><div class="panel ok-big" style="margin-top:28px;max-width:620px;margin-inline:auto">
      <span class="ring">${ic("check", "lg")}</span>
      <h1 style="margin:0;font-size:28px">Pago confirmado</h1>
      <p class="muted" style="margin:0;max-width:44ch">Hemos recibido <b class="tnum">${eur(t.total)}</b> por <b>${esc(v.title)}</b>. La factura ya está en tu cuenta y el vendedor ha sido avisado para coordinar la entrega.</p>
      <div class="kpis" style="width:100%;margin:10px 0 0;grid-template-columns:1fr 1fr">
        <div class="kpi"><small>${ic("doc", "sm")}Referencia</small><b class="tnum" style="font-size:17px">${PAY.ref}</b></div>
        <div class="kpi"><small>${ic("truck", "sm")}Siguiente paso</small><b style="font-size:15px">${PAY.trans ? "Transporte en 2–4 días" : "Recogida concertada"}</b></div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:6px">
        <a class="btn primary" href="#/cuenta/compras">Ver mis compras</a>
        <a class="btn" href="#/cuenta/facturas">Descargar factura</a>
        <a class="btn ghost" href="#/subastas">Seguir pujando</a></div></div></div>`;
  }
  const s = PAY.step, u = S.user || {};
  const body = [
    `<div class="panel" style="display:grid;gap:14px"><h3 style="margin:0">Lo que has ganado</h3>
      <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
        <img src="${imgSrc(v.img)}" alt="" style="width:168px;height:118px;object-fit:cover;border-radius:12px">
        <div style="min-width:0"><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px"><span class="chip ${CATS[v.cat].chip}">${CATS[v.cat].short}</span><span class="chip ok">${ic("check", "sm")}Adjudicado a ti</span></div>
          <b style="font:700 19px/1.2 var(--display)">${esc(v.title)}</b>
          <div class="muted" style="font-size:13px;margin-top:4px">${v.km ? num(v.km) + " km · " : ""}${esc(v.city)} · lote <span class="mono">#${v.id}</span></div></div></div>
      <div style="background:var(--surface-2);border-radius:12px;padding:14px">
        <div class="kv"><span>Puja ganadora</span><b class="tnum">${eur(v.amount)}</b></div>
        <div class="kv"><span>Comisión de compra (tramo ${eur(v.amount)})</span><b class="tnum">${eur(buyerFee(v.amount))}</b></div>
        <div class="kv"><span>Plan actual</span><b>${esc(u.plan || S.plan)}</b></div></div>
      <div class="trow"><div><b>Quiero factura a nombre de mi empresa</b><small>Si la activas, rellenaremos los datos fiscales en el paso siguiente.</small></div>
        <label class="toggle"><input type="checkbox" id="coCo" ${u.company ? "checked" : ""} aria-label="Factura a empresa"><span></span></label></div></div>`,
    `<div class="panel" style="display:grid;gap:14px"><h3 style="margin:0">Datos de facturación</h3>
      <div class="fgrid">
        <div class="field"><label for="coName">Nombre y apellidos *</label><input class="in" id="coName" value="${esc(u.name || "")}"></div>
        <div class="field"><label for="coMail">Email *</label><input class="in" id="coMail" type="email" value="${esc(u.email || "")}"></div>
        <div class="field"><label for="coTel">Teléfono *</label><input class="in" id="coTel" value="${esc(u.phone || "")}"></div>
        <div class="field"><label for="coCif">NIF / CIF *</label><input class="in mono" id="coCif" value="${esc(u.cif || "")}" placeholder="B12345678"></div>
        <div class="field"><label for="coCoName">Empresa</label><input class="in" id="coCoName" value="${esc(u.company || "")}"></div>
        <div class="field"><label for="coProv">Provincia *</label><select class="in" id="coProv">${PROVS.map(p => `<option ${p === (u.city || "Alicante") ? "selected" : ""}>${p}</option>`).join("")}</select></div>
        <div class="field" style="grid-column:1/-1"><label for="coAddr">Dirección *</label><input class="in" id="coAddr" placeholder="Calle, número, código postal, ciudad"></div>
      </div>
      <div class="trow"><div><b>Guardar estos datos en mi cuenta</b><small>Los usaremos para las próximas compras y facturas.</small></div>
        <label class="toggle"><input type="checkbox" id="coSave" checked aria-label="Guardar datos"><span></span></label></div></div>`,
    `<div style="display:grid;gap:14px">
      <div class="panel" style="display:grid;gap:12px"><div><h3 style="margin:0">Gestoría</h3><p class="muted" style="margin:4px 0 0;font-size:13.5px">Nos encargamos del cambio de titularidad y los trámites con la DGT. Opcional.</p></div>
        <div class="field"><label for="coGest">Trámite</label><select class="in" id="coGest">
          <option value="0">Sin gestoría — me encargo yo</option>
          ${GESTORIA.map(([n, p], i) => `<option value="${i + 1}" ${PAY.gest === i + 1 ? "selected" : ""}>${n} — ${p} € + IVA</option>`).join("")}
        </select></div>
        <ul class="feed" style="margin:0"><li>${ic("check", "sm")}<div>Documentación revisada por nuestro equipo antes de enviarla.</div></li>
          <li>${ic("check", "sm")}<div>Impuesto de transmisiones calculado y liquidado por ti con nuestra hoja.</div></li>
          <li>${ic("check", "sm")}<div>Plazo medio del cambio de nombre: 3–5 días laborables.</div></li></ul></div>
      <div class="panel" style="display:grid;gap:12px"><div><h3 style="margin:0">Transporte</h3><p class="muted" style="margin:4px 0 0;font-size:13.5px">El vehículo está en ${esc(v.city)}. Podemos llevarlo a tu taller con grúa.</p></div>
        <div class="field"><label for="coTrans">Provincia de entrega</label><select class="in" id="coTrans">
          <option value="">Recogida por mi cuenta — 0 €</option>
          ${PROVS.map(p => `<option ${PAY.trans === p ? "selected" : ""}>${p}</option>`).join("")}
        </select><small class="muted" id="coTransN">Precio por vehículo no apilable. Vehículos sin ruedas o siniestro total pueden tener recargo.</small></div></div></div>`,
    `<div style="display:grid;gap:14px">
      <div class="panel" style="display:grid;gap:12px"><h3 style="margin:0">Método de pago</h3>
        <div class="pm" id="coPm">
          ${[["card", "Tarjeta de crédito o débito", "Inmediato. El lote se bloquea a tu nombre al instante.", ["VISA", "MC", "AMEX"]],
            ["sepa", "Transferencia SEPA", "1–2 días laborables. Recibirás los datos bancarios y la referencia.", ["SEPA"]],
            ["bizum", "Bizum", "Hasta 1.000 € por operación.", ["BIZUM"]],
            ["fin", "Financiación profesional", "Hasta 24 meses para autónomos y empresas. Sujeto a aprobación.", ["36%", "TAE"]]]
            .map(([k, t, d, lg]) => `<label class="${PAY.method === k ? "on" : ""}" data-pm="${k}"><input type="radio" name="pm" ${PAY.method === k ? "checked" : ""}><span><b>${t}</b><small>${d}</small></span><span class="pm-logos">${lg.map(x => `<i>${x}</i>`).join("")}</span></label>`).join("")}
        </div>
        ${PAY.method === "card" ? `<div class="fgrid" style="margin-top:2px">
          <div class="field" style="grid-column:1/-1"><label for="pcNum">Número de tarjeta</label><input class="in mono" id="pcNum" inputmode="numeric" placeholder="0000 0000 0000 0000" autocomplete="off"></div>
          <div class="field"><label for="pcExp">Caducidad</label><input class="in mono" id="pcExp" placeholder="MM/AA" autocomplete="off"></div>
          <div class="field"><label for="pcCvc">CVC</label><input class="in mono" id="pcCvc" placeholder="123" autocomplete="off"></div>
          <div class="field" style="grid-column:1/-1"><label for="pcName">Titular</label><input class="in" id="pcName" value="${esc(u.name || "")}"></div>
          </div><p class="faint" style="font-size:11.5px;margin:0">Demo: no introduzcas datos reales. En producción este formulario lo sirve la pasarela de pago y los datos nunca pasan por MotorSubasta.</p>`
        : PAY.method === "sepa" ? `<div style="background:var(--surface-2);border-radius:12px;padding:14px">
          <div class="kv"><span>Beneficiario</span><b>MotorSubasta S.L.</b></div>
          <div class="kv"><span>IBAN</span><b class="mono">ES21 0000 0000 0000 0000 0000</b></div>
          <div class="kv"><span>Concepto</span><b class="mono">${v.id}-${(u.email || "demo").split("@")[0].toUpperCase()}</b></div>
          <p class="muted" style="font-size:13px;margin:10px 0 0">El lote queda reservado 48 h. En cuanto llegue la transferencia te avisamos por email y WhatsApp.</p></div>`
        : PAY.method === "bizum" ? `<div class="field"><label for="pbTel">Teléfono Bizum</label><input class="in" id="pbTel" value="${esc(u.phone || "")}"></div>`
        : `<div class="fgrid"><div class="field"><label for="pfMonths">Plazo</label><select class="in" id="pfMonths"><option>12 meses</option><option selected>24 meses</option></select></div>
          <div class="field"><label>Cuota estimada</label><input class="in tnum" id="pfQuota" value="" readonly></div></div>
          <p class="muted" style="font-size:13px;margin:0">Estudio sin coste. Te llamamos en 1 día laborable con la oferta en firme.</p>`}
      </div>
      <div class="panel" style="display:grid;gap:10px">
        <label style="display:flex;gap:11px;align-items:flex-start;font-size:13.5px;cursor:pointer;min-height:44px">
          <input type="checkbox" id="coTerms" style="margin-top:3px;width:17px;height:17px;accent-color:var(--accent)" ${PAY.terms ? "checked" : ""}>
          <span>Acepto las <a href="#/condiciones-puja">condiciones de puja</a> y los <a href="#/terminos">términos de uso</a>, y confirmo que el vehículo se vende en el estado en que se encuentra.</span></label>
        <label style="display:flex;gap:11px;align-items:flex-start;font-size:13.5px;cursor:pointer;min-height:44px">
          <input type="checkbox" id="coWa" checked style="margin-top:3px;width:17px;height:17px;accent-color:var(--accent)">
          <span>Quiero avisos por WhatsApp del estado del transporte y de la documentación.</span></label></div></div>`,
  ][s];
  return `<div class="wrap">
    <div class="admin-head"><div><div class="eyebrow">${ic("euro", "sm")} Pago del lote</div><h1 style="margin-top:8px">Completar la compra</h1>
      <p class="muted" style="margin:6px 0 0">Paso ${s + 1} de 4 · ${PAY_STEPS[s]}</p></div>
      <a class="btn sm ghost" href="#/subasta/${v.id}">${ic("left", "sm")}Volver al lote</a></div>
    <div class="stepper">${PAY_STEPS.map((t, i) => `<div class="${i === s ? "on" : i < s ? "done" : ""}"><b>${i < s ? "✓" : "PASO " + (i + 1)}</b>${t}</div>`).join("")}</div>
    <div class="co"><form onsubmit="return false" style="display:grid;gap:14px">${body}
      <div style="display:flex;justify-content:space-between;gap:10px">
        <button type="button" class="btn" id="coPrev" ${s === 0 ? "disabled" : ""}>${ic("left", "sm")}Anterior</button>
        <button type="button" class="btn primary" id="coNext">${s === 3 ? ic("lock", "sm") + "Pagar " + eur(payTotals(v).total) : "Siguiente " + ic("right", "sm")}</button></div></form>
      ${coSummary(v)}</div></div>`;
}
function mountPay(id) {
  const v = payLot(id); if (!v) return;
  if (PAY.done === id) return;
  const go = d => { PAY.step = Math.max(0, Math.min(3, PAY.step + d)); router(); scrollTo(0, 0); };
  $("#coPrev").onclick = () => go(-1);
  if ($("#coGest")) $("#coGest").onchange = e => { PAY.gest = +e.target.value; router(); };
  if ($("#coTrans")) $("#coTrans").onchange = e => { PAY.trans = e.target.value; router(); };
  $$("[data-pm]").forEach(l => l.onclick = () => { PAY.method = l.dataset.pm; router(); });
  if ($("#pfQuota")) {
    const q = () => { const m = +($("#pfMonths").value || "24").split(" ")[0]; $("#pfQuota").value = eur(payTotals(v).total * 1.09 / m) + " / mes"; };
    $("#pfMonths").onchange = q; q();
  }
  if ($("#pcNum")) $("#pcNum").oninput = e => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); };
  if ($("#pcExp")) $("#pcExp").oninput = e => { const d = e.target.value.replace(/\D/g, "").slice(0, 4); e.target.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d; };
  if ($("#coTerms")) $("#coTerms").onchange = e => PAY.terms = e.target.checked;
  $("#coNext").onclick = () => {
    if (PAY.step === 1) {
      const need = [["coName", "el nombre"], ["coMail", "el email"], ["coTel", "el teléfono"], ["coCif", "el NIF o CIF"], ["coAddr", "la dirección"]];
      for (const [f, l] of need) if (!$("#" + f).value.trim()) { toast("Falta " + l, "alert"); $("#" + f).focus(); return; }
      if (!/^[A-Za-z0-9]{8,10}$/.test($("#coCif").value.replace(/[\s-]/g, ""))) { toast("Revisa el NIF o CIF", "alert"); $("#coCif").focus(); return; }
      if ($("#coSave").checked && S.user) {
        S.user.name = $("#coName").value.trim(); S.user.phone = $("#coTel").value.trim();
        S.user.cif = $("#coCif").value.trim(); S.user.company = $("#coCoName").value.trim(); S.user.city = $("#coProv").value;
        saveUser(); renderHeader(route().path);
      }
    }
    if (PAY.step === 3) {
      if (!PAY.terms) { toast("Acepta las condiciones para completar el pago", "alert"); $("#coTerms").focus(); return; }
      if (PAY.method === "card") {
        const n = ($("#pcNum").value || "").replace(/\s/g, "");
        if (n.length < 15) { toast("Introduce un número de tarjeta de prueba (16 dígitos)", "alert"); $("#pcNum").focus(); return; }
      }
      const t = payTotals(v), ref = "C-2026-" + String(50 + S.purchases.length).padStart(4, "0");
      PAY.ref = ref; PAY.done = id;
      S.purchases.unshift({
        id: ref, ref: v.id, lot: v.title, img: v.img, amount: t.base, fee: t.fee, date: new Date().toLocaleDateString("es-ES"),
        st: PAY.method === "sepa" ? "pendiente" : "pagado", doc: PAY.gest ? "en trámite" : "por el comprador",
      });
      store.set("purchases", S.purchases);
      notify(`Pago de <b>${eur(t.total)}</b> confirmado para ${esc(v.title)}. Factura ${ref} disponible.`, "euro");
      toast("Pago completado · " + ref, "check");
      router(); scrollTo(0, 0);
      return;
    }
    go(1);
  };
}

/* ---------- alta de perfil (onboarding) ---------- */
var OB = { step: 0, role: "buyer", type: "empresa", cats: ["danado"], prov: "Alicante" };
var OB_STEPS = ["Tipo de cuenta", "Tus datos", "Intereses"];
function viewOnboard() {
  const u = S.user || {}, s = OB.step;
  const body = [
    `<div class="panel" style="display:grid;gap:16px"><div><h3 style="margin:0">¿Qué quieres hacer en MotorSubasta?</h3><p class="muted" style="margin:4px 0 0;font-size:13.5px">Puedes cambiarlo más tarde en tus ajustes.</p></div>
      <div class="opt-cards">${[["buyer", "gavel", "Comprar", "Pujar en subastas y comprar en el mercado"], ["seller", "store", "Vender", "Publicar vehículos propios y recibir ofertas"], ["dealer", "building", "Ambas cosas", "Compraventa profesional con acceso a Ofertas Ocultas"]]
        .map(([k, i, t, d]) => `<button type="button" class="opt ${OB.role === k ? "on" : ""}" data-obr="${k}"><b>${ic(i, "sm")}${t}</b><small>${d}</small></button>`).join("")}</div>
      <div class="lbl">Tipo de titular</div>
      <div class="seg" id="obType">${[["empresa", "Empresa o autónomo"], ["particular", "Particular"]].map(([k, t]) => `<button type="button" data-v="${k}" class="${OB.type === k ? "on" : ""}">${t}</button>`).join("")}</div>
      <div class="trow"><div><b>Trabajo con exportación</b><small>Te mostraremos antes los lotes aptos para exportar y la documentación DUA.</small></div>
        <label class="toggle"><input type="checkbox" id="obExp" aria-label="Exportación"><span></span></label></div></div>`,
    `<div class="panel" style="display:grid;gap:14px"><h3 style="margin:0">Tus datos</h3>
      <div class="fgrid">
        <div class="field"><label for="obName">Nombre y apellidos *</label><input class="in" id="obName" value="${esc(u.name || "")}"></div>
        <div class="field"><label for="obTel">Teléfono móvil *</label><input class="in" id="obTel" value="${esc(u.phone || "")}" placeholder="+34 600 000 000"></div>
        ${OB.type === "empresa" ? `<div class="field"><label for="obCo">Empresa *</label><input class="in" id="obCo" value="${esc(u.company || "")}"></div>
        <div class="field"><label for="obCif">CIF *</label><input class="in mono" id="obCif" value="${esc(u.cif || "")}" placeholder="B12345678"></div>`
        : `<div class="field"><label for="obCif">NIF *</label><input class="in mono" id="obCif" value="${esc(u.cif || "")}" placeholder="12345678Z"></div>`}
        <div class="field"><label for="obProv">Provincia *</label><select class="in" id="obProv">${PROVS.map(p => `<option ${p === OB.prov ? "selected" : ""}>${p}</option>`).join("")}</select></div>
        <div class="field"><label for="obCity">Ciudad *</label><input class="in" id="obCity" value="${esc(u.city || "")}"></div>
      </div>
      <div class="trow"><div><b>Avisos por WhatsApp</b><small>Inicio de sesión de subastas, pujas superadas y cierres inminentes.</small></div>
        <label class="toggle"><input type="checkbox" id="obWa" checked aria-label="WhatsApp"><span></span></label></div></div>`,
    `<div class="panel" style="display:grid;gap:16px"><div><h3 style="margin:0">¿Qué vehículos te interesan?</h3><p class="muted" style="margin:4px 0 0;font-size:13.5px">Con esto ajustamos tu portada y los avisos. Elige todas las que quieras.</p></div>
      <div class="chips-pick" id="obCats">${[["limpio", "Limpios"], ["danado", "Dañados"], ["siniestro", "Siniestros"], ["moto", "Motocicletas"], ["furgo", "Furgonetas"], ["pesado", "Transporte pesado"], ["nautica", "Náutica"]]
        .map(([k, t]) => `<button type="button" data-obc="${k}" class="${OB.cats.includes(k) ? "on" : ""}">${t}</button>`).join("")}</div>
      <div class="fgrid">
        <div class="field"><label for="obBudget">Presupuesto habitual por vehículo</label><select class="in" id="obBudget"><option>Hasta 1.000 €</option><option selected>1.000 – 5.000 €</option><option>5.000 – 15.000 €</option><option>Más de 15.000 €</option></select></div>
        <div class="field"><label for="obVol">Vehículos al mes</label><select class="in" id="obVol"><option>1 – 2</option><option selected>3 – 10</option><option>Más de 10</option></select></div>
      </div>
      <div style="background:var(--surface-2);border-radius:12px;padding:14px">
        <b style="font-size:14px">Después de este paso</b>
        <ol class="howpay" style="margin:8px 0 0"><li>Verificamos tu identidad (2 minutos, con el DNI).</li><li>Se activa tu límite de puja inicial de 5.000 €.</li><li>Ya puedes pujar en la siguiente sesión.</li></ol></div></div>`,
  ][s];
  return `<div class="wrap ob">
    <div class="admin-head"><div><div class="eyebrow">${ic("user", "sm")} Alta de cuenta</div><h1 style="margin-top:8px">Completa tu perfil</h1>
      <p class="muted" style="margin:6px 0 0">Nos faltan ${3 - s} ${3 - s === 1 ? "paso" : "pasos"} para dejar tu cuenta lista para pujar.</p></div>
      <a class="btn sm ghost" href="#/cuenta">Lo hago luego</a></div>
    <div class="stepper">${OB_STEPS.map((t, i) => `<div class="${i === s ? "on" : i < s ? "done" : ""}"><b>${i < s ? "✓" : "PASO " + (i + 1)}</b>${t}</div>`).join("")}</div>
    <form onsubmit="return false" style="display:grid;gap:14px">${body}
      <div style="display:flex;justify-content:space-between;gap:10px">
        <button type="button" class="btn" id="obPrev" ${s === 0 ? "disabled" : ""}>${ic("left", "sm")}Anterior</button>
        <button type="button" class="btn primary" id="obNext">${s === 2 ? ic("check", "sm") + "Guardar y verificar identidad" : "Siguiente " + ic("right", "sm")}</button></div></form></div>`;
}
function mountOnboard() {
  const go = d => { OB.step = Math.max(0, Math.min(2, OB.step + d)); router(); scrollTo(0, 0); };
  $("#obPrev").onclick = () => go(-1);
  $$("[data-obr]").forEach(b => b.onclick = () => { OB.role = b.dataset.obr; $$("[data-obr]").forEach(x => x.classList.toggle("on", x === b)); });
  $$("#obType button").forEach(b => b.onclick = () => { OB.type = b.dataset.v; router(); });
  $$("[data-obc]").forEach(b => b.onclick = () => {
    const k = b.dataset.obc, i = OB.cats.indexOf(k);
    if (i < 0) OB.cats.push(k); else OB.cats.splice(i, 1);
    b.classList.toggle("on", i < 0);
  });
  $("#obNext").onclick = () => {
    if (OB.step === 1) {
      for (const [f, l] of [["obName", "el nombre"], ["obTel", "el teléfono"], ["obCif", "el NIF o CIF"], ["obCity", "la ciudad"]]) {
        const e = $("#" + f); if (e && !e.value.trim()) { toast("Falta " + l, "alert"); e.focus(); return; }
      }
      if ($("#obCo") && !$("#obCo").value.trim()) { toast("Falta el nombre de la empresa", "alert"); $("#obCo").focus(); return; }
    }
    if (OB.step === 2) {
      if (S.user) {
        if ($("#obName")) S.user.name = $("#obName").value.trim();
        S.user.role = OB.role === "dealer" ? "dealer" : OB.role;
        S.user.onboarded = true; S.user.cats = OB.cats.slice();
        saveUser(); renderHeader(route().path);
      }
      toast("Perfil completado", "check");
      notify("Perfil completado. Solo falta <b>verificar tu identidad</b> para pujar.", "shield");
      location.hash = "#/verificacion";
      return;
    }
    go(1);
  };
}

/* ---------- admin: analítica ---------- */
function adAnalytics() {
  const closed = lots.filter(l => statusOf(l) === "end");
  const sold = closed.filter(l => l.hist.length);
  const sell = closed.length ? Math.round(sold.length / closed.length * 100) : 72;
  const avg = sold.length ? sold.reduce((a, l) => a + curPrice(l), 0) / sold.length : 1650;
  const bidsTotal = lots.reduce((a, l) => a + l.hist.length, 0);
  const funnel = [["Visitas", 12840, ""], ["Registros", 1126, "8,8%"], ["Verificados", 734, "65%"], ["Pujadores", 418, "57%"], ["Compradores", 163, "39%"]];
  const fmax = funnel[0][1];
  const cats = ["limpio", "danado", "siniestro"].map(k => {
    const ls = lots.filter(l => l.cat === k);
    const vol = ls.reduce((a, l) => a + curPrice(l), 0);
    return { k, n: ls.length, vol, bids: ls.reduce((a, l) => a + l.hist.length, 0) };
  });
  const cmax = Math.max(1, ...cats.map(c => c.vol));
  const months = ["Abr", "May", "Jun", "Jul", "Ago", "Sep"], rev = [4120, 5240, 6010, 5380, 4890, 8420];
  const W = 560, H = 190, rmax = 9000;
  const pts = rev.map((v, i) => [40 + i * ((W - 50) / 5), H - v / rmax * (H - 20) + 5]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const provs = [["Alicante", 38], ["Valencia", 17], ["Murcia", 12], ["Madrid", 9], ["Barcelona", 7], ["Resto", 17]];
  const top = [["AutoExport Ruse", 14, 21400, "Dealer"], ["Talleres Llorca", 11, 9870, "Comprador Pro"], ["Motor Benidorm", 8, 7120, "Comprador Pro"], ["Compraventa Elx", 6, 4310, "Comprador"], ["Desguaces Sax", 5, 2180, "Comprador"]];
  return `<div class="kpis">
    ${kpi("chart", "Tasa de venta", sell + "%", "lotes cerrados con puja")}
    ${kpi("euro", "Precio medio de cierre", eur(avg), "+6,4% vs. mes anterior")}
    ${kpi("gavel", "Pujas por lote", (bidsTotal / Math.max(1, lots.length)).toFixed(1), "media de la sesión")}
    ${kpi("clock", "Hasta la 1ª puja", "4 h 12 min", "mediana desde la publicación")}
    ${kpi("users", "Nuevos registros", "126", "últimos 30 días", "var(--ok)")}
    ${kpi("eye", "Visita → puja", "3,3%", "objetivo 4%", "var(--warn)")}
  </div>
  <div class="a-grid">
    <div class="panel"><div style="display:flex;justify-content:space-between;margin-bottom:14px"><h3 style="margin:0">Embudo de conversión</h3><span class="muted" style="font-size:12px">Últimos 30 días · % sobre el paso anterior</span></div>
      <div class="funnel">${funnel.map(([t, v, n], i) => `<div class="fr"><span>${t}</span><span class="bw"><span class="bar${i > 2 ? " b2" : ""}" style="width:${Math.max(4, v / fmax * 100)}%"></span></span><b>${num(v)}${n ? `<em>${n}</em>` : ""}</b></div>`).join("")}</div>
      <p class="muted" style="font-size:12.5px;margin:14px 0 0">${ic("alert", "sm")} El salto más caro es <b>registro → verificación</b>: 392 cuentas sin verificar no pueden pujar.
        <button class="btn xs" data-ana="verif" style="margin-left:6px">Ver pendientes</button></p></div>
    <div class="panel"><h3>Ingresos por mes</h3>
      <svg viewBox="0 0 ${W + 20} ${H + 34}" role="img" aria-label="Ingresos de los últimos seis meses" style="width:100%;height:auto">
        ${[0, 3000, 6000, 9000].map(v => `<line x1="38" x2="${W}" y1="${H - v / rmax * (H - 20) + 5}" y2="${H - v / rmax * (H - 20) + 5}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="0" y="${H - v / rmax * (H - 20) + 9}" style="fill:var(--faint);font:500 10px var(--mono)">${v / 1000}k</text>`).join("")}
        <path d="${line} L${pts[5][0].toFixed(1)} ${H + 5} L${pts[0][0].toFixed(1)} ${H + 5} Z" fill="var(--accent-soft)"/>
        <path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${pts.map((p, i) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${i === 5 ? 5 : 3.5}" fill="var(--bg)" stroke="var(--accent)" stroke-width="2.5"><title>${months[i]}: ${eur(rev[i])}</title></circle>
          <text x="${p[0].toFixed(1)}" y="${H + 26}" text-anchor="middle" style="fill:var(--faint);font:500 10.5px var(--mono)">${months[i]}</text>`).join("")}
        <text x="${pts[5][0].toFixed(1)}" y="${(pts[5][1] - 12).toFixed(1)}" text-anchor="end" style="fill:var(--text);font:600 12px var(--mono)">${eur(rev[5])}</text>
      </svg>
      <div class="kv" style="margin-top:8px"><span>Comisiones de compra</span><b class="tnum">${eur(5890)}</b></div>
      <div class="kv"><span>Suscripciones</span><b class="tnum">${eur(2310)}</b></div>
      <div class="kv"><span>Gestoría y transporte</span><b class="tnum">${eur(220)}</b></div></div>
  </div>
  <div class="a-grid" style="margin-top:14px">
    <div class="panel"><h3>Volumen por categoría</h3>
      <div class="hbars" style="margin-top:12px">${cats.map(c => `<div class="hb"><span><span class="chip ${CATS[c.k].chip}" style="height:20px">${CATS[c.k].short}</span> <span class="muted" style="font-size:12.5px">${c.n} lotes · ${c.bids} pujas</span></span><b class="tnum">${eur(c.vol)}</b><span class="tr"><i style="width:${Math.max(3, c.vol / cmax * 100)}%"></i></span></div>`).join("")}</div>
      <h3 style="margin:20px 0 10px">Compradores por provincia</h3>
      <div class="hbars">${provs.map(([p, v]) => `<div class="hb"><span>${p}</span><b class="tnum">${v}%</b><span class="tr"><i style="width:${v / 38 * 100}%"></i></span></div>`).join("")}</div></div>
    <div class="panel"><h3>Compradores más activos</h3>
      <div class="tbl-wrap" style="border:0;margin-top:10px"><table><thead><tr><th>Cuenta</th><th class="r">Lotes</th><th class="r">Volumen</th></tr></thead><tbody>
        ${top.map(([n, l, v, pl]) => `<tr><td><b>${n}</b><div class="faint" style="font-size:11.5px">${pl}</div></td><td class="r tnum">${l}</td><td class="r tnum">${eur(v)}</td></tr>`).join("")}
      </tbody></table></div>
      <h3 style="margin:20px 0 10px">Señales a vigilar</h3>
      <ul class="feed" style="margin:0">
        <li><span class="dot" style="background:var(--bad)"></span><div><b>3 lotes</b> cerraron sin ninguna puja esta semana<div class="faint" style="font-size:12px">Salida por encima del valor de mercado</div></div></li>
        <li><span class="dot" style="background:var(--warn)"></span><div><b>392 cuentas</b> registradas y sin verificar<div class="faint" style="font-size:12px">Campaña de recordatorio pendiente</div></div></li>
        <li><span class="dot" style="background:var(--ok)"></span><div><b>Ofertas Ocultas</b> convierte al 11,4%<div class="faint" style="font-size:12px">3,5× la media del mercado</div></div></li>
      </ul>
      <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button class="btn sm" id="anaExp">${ic("doc", "sm")}Exportar CSV</button><button class="btn sm ghost" data-ana="comunicaciones">${ic("msg", "sm")}Lanzar campaña</button></div></div>
  </div>`;
}
function adRender() {
  const b = $("#adBody"); if (!b) return;
  if (AD.tab !== "analisis") return renderAdmin();
  b.innerHTML = adAnalytics();
  $$("[data-ana]", b).forEach(x => x.onclick = () => {
    if (x.dataset.ana === "verif") { AD.tab = "tareas"; AD.sub = "verif"; } else AD.tab = x.dataset.ana;
    router();
  });
  if ($("#anaExp")) $("#anaExp").onclick = () => toast("Informe CSV generado (demo)", "doc");
  initReveal(b);
}
function mountAdmin() {
  $$("[data-tab]").forEach(x => x.onclick = () => { AD.tab = x.dataset.tab; $$("[data-tab]").forEach(y => y.classList.toggle("on", y === x)); adRender(); });
  if ($("#adCreate")) $("#adCreate").onclick = () => modal("Crear subasta", `<div class="field"><label for="ncV">Vehículo aprobado</label><select class="in" id="ncV">${market.map(m => `<option value="${m.id}">${m.year} ${m.title}</option>`).join("")}</select></div>
    <div class="fgrid"><div class="field"><label for="ncS">Salida (€)</label><input class="in" id="ncS" type="number" value="1000"></div><div class="field"><label for="ncD">Duración</label><select class="in" id="ncD"><option value="60">1 hora</option><option value="120" selected>2 horas</option><option value="1440">24 horas</option></select></div></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">Crear y programar</button></div>`, close => {
    $("#cNo").onclick = close;
    $("#cYes").onclick = () => {
      const m = market.find(q => q.id === $("#ncV").value), st = now() + 30 * MIN;
      lots.push({ id: "L" + (600 + lots.length), img: m.img, year: m.year, make: m.title.split(" ")[0], model: m.title.split(" ").slice(1).join(" "), title: m.year + " " + m.title, km: m.km, fuel: m.fuel, trans: m.trans, city: m.city, prov: "Alicante", cat: m.cat, start: +$("#ncS").value, plate: "••••", cv: 100, body: "—", startsAt: st, endsAt: st + +$("#ncD").value * MIN, panels: {}, noReserve: false, hist: [], watchers: 0, vin: "—", buyNow: null, keys: true, runs: true });
      close(); toast("Subasta creada: empieza en 30 minutos", "gavel"); AD.tab = "subastas"; router();
    };
  });
  adRender();
}

/* ---------- publicar: guarda en "mis vehículos" ---------- */
function mountPublish() {
  const grab = () => {
    if (!$("#pMake")) return;
    PUB.make = $("#pMake").value.trim(); PUB.model = $("#pModel").value.trim();
    PUB.year = +$("#pYear").value || new Date().getFullYear(); PUB.km = +$("#pKm").value || 0;
    PUB.city = $("#pCity").value.trim(); PUB.prov = $("#pProv").value; PUB.vin = $("#pVin").value.trim();
  };
  const go = d => { grab(); PUB.step = Math.max(0, Math.min(3, PUB.step + d)); router(); scrollTo(0, 0); };
  $("#pPrev").onclick = () => go(-1);
  $("#pNext").onclick = async () => {
    if (PUB.step === 0) {
      const v = $("#pVin").value.trim();
      if (v.length !== 17) { toast("Introduce un VIN de 17 caracteres o usa el botón de decodificar", "alert"); $("#pVin").focus(); return; }
      if (!$("#pMake").value.trim() || !$("#pModel").value.trim()) { toast("Completa marca y modelo", "alert"); return; }
      if (!$("#pCity").value.trim()) { toast("Indica la ciudad donde está el vehículo", "alert"); $("#pCity").focus(); return; }
    }
    if (PUB.step === 3) {
      const price = PUB.type === "subasta" ? (+($("#pStart") || {}).value || Math.round(PUB.full * .25)) : (+($("#pPrice") || {}).value || PUB.full);
      if (typeof LIVE !== "undefined" && LIVE) {
        const v = await sbPublishVehicle();
        if (!v) return;
        await sbLoadSellerData();
        toast("Vehículo enviado a revisión", "check");
        PUB.step = 0; PUB.panels = {};
        location.hash = canSell() ? "#/vender/vehiculos" : "#/cuenta";
        router(); return;
      }
      const id = "V-" + (105 + S.myVehicles.length);
      const pool = ["mercedes-s", "renault-clio", "suzuki-jimny", "ford-transit", "opel-astra", "toyota-yaris"];
      S.myVehicles.unshift({
        id, img: pool[S.myVehicles.length % pool.length],
        title: `${PUB.year || 2020} ${PUB.make || "Vehículo"} ${PUB.model || ""}`.trim(),
        km: PUB.km || 0, cat: PUB.cat, st: "revision", price, bids: 0, views: 0,
        date: new Date().toLocaleDateString("es-ES"), channel: PUB.type, vin: PUB.vin || "—", score: scoreOf(PUB.panels),
      });
      store.set("myvehicles", S.myVehicles);
      toast("Vehículo enviado a revisión", "check");
      notify(`<b>${esc(PUB.make + " " + PUB.model)}</b> está en revisión. Tiempo medio de aprobación: 2 h.`, "upload");
      PUB.step = 0; PUB.panels = {};
      location.hash = canSell() ? "#/vender/vehiculos" : "#/cuenta";
      return;
    }
    go(1);
  };
  $$("[data-pcat]").forEach(b => b.onclick = () => { PUB.cat = b.dataset.pcat; $$("[data-pcat]").forEach(x => x.classList.toggle("on", x === b)); });
  $$("#ptitle button").forEach(b => b.onclick = () => { PUB.title = b.dataset.v; $$("#ptitle button").forEach(x => x.classList.toggle("on", x === b)); });
  if ($("#pVin")) {
    ["pMake", "pModel", "pYear", "pKm", "pCity"].forEach(f => { const e = $("#" + f); if (e && PUB[f.slice(1).toLowerCase()] !== undefined) e.value = PUB[f.slice(1).toLowerCase()] || e.value; });
    $("#pVin").value = PUB.vin || "";
    $("#pVinN").textContent = ($("#pVin").value.length) + "/17 · autocompleta marca, modelo y datos técnicos";
    $("#pVin").oninput = e => { e.target.value = e.target.value.toUpperCase().replace(/[IOQ]/g, ""); $("#pVinN").textContent = e.target.value.length + "/17 · autocompleta marca, modelo y datos técnicos"; };
    $("#pDecode").onclick = () => { $("#pVin").value = "WBAPH5C55BA123456"; $("#pMake").value = "BMW"; $("#pModel").value = "320d Touring"; $("#pYear").value = 2011; $("#pKm").value = 243000; $("#pFuel").value = "Diésel"; $("#pVinN").textContent = "17/17 · VIN decodificado: BMW Serie 3 (E91), 2.0 diésel, 184 CV"; toast("VIN decodificado", "search"); };
  }
  const setPanel = (k, v) => { if (v) PUB.panels[k] = v; else delete PUB.panels[k]; router(); };
  $$("[data-prow]").forEach(row => $$("button", row).forEach(b => b.onclick = () => setPanel(row.dataset.prow, +b.dataset.s)));
  $$(".carmap rect").forEach(r => r.onclick = () => setPanel(r.dataset.panel, ((PUB.panels[r.dataset.panel] || 0) + 1) % 5));
  $$(".pills").forEach(g => $$(".pill", g).forEach(b => { if (!b.dataset.v) b.onclick = () => $$(".pill", g).forEach(x => x.classList.toggle("on", x === b)); }));
  if ($("#phAdd")) {
    let n = 0;
    $("#phAdd").onclick = () => { n = Math.min(50, n + 9); const c = $("#phCount"); c.textContent = n + " fotos"; c.className = "chip ok"; toast(n + " fotos añadidas", "upload"); };
    $("#genDesc").onclick = () => { $("#pDesc").value = `${$("#pDesc").value ? $("#pDesc").value + "\n\n" : ""}${PUB.year || ""} ${PUB.make || "Vehículo"} ${PUB.model || ""} ${CATS[PUB.cat].short.toLowerCase()} con título ${PUB.title}. ${PUB.km ? num(PUB.km) + " km. " : ""}Puntuación de condición ${scoreOf(PUB.panels)}/100. ${Object.keys(PUB.panels).length ? "Daños declarados en: " + PANELS.filter(p => PUB.panels[p[0]]).map(p => p[1].toLowerCase() + " (" + SEV[PUB.panels[p[0]]].toLowerCase() + ")").join(", ") + "." : "Sin daños declarados."} Se entrega con llaves y arranca correctamente. Ideal para ${PUB.cat === "limpio" ? "uso particular o reventa" : "taller o exportación"}.`.replace(/\s+/g, " ").trim(); };
  }
  $$("[data-ptype]").forEach(b => b.onclick = () => { grab(); PUB.type = b.dataset.ptype; router(); });
  const sum = () => {
    if (!$("#pSummary")) return;
    const sub = PUB.type === "subasta";
    const price = sub ? +($("#pStart").value || 0) : +($("#pPrice").value || 0);
    const rate = /Full|Dealer/.test(S.plan) ? 0 : /Pro/.test(S.plan) ? .015 : .03;
    $("#pSummary").innerHTML = `<div class="kv"><span>${sub ? "Puja de salida" : "Precio de venta"}</span><span class="tnum">${eur(price)}</span></div>
      <div class="kv"><span>Comisión de éxito vendedor (${(rate * 100).toFixed(1)}% · ${S.plan})</span><span class="tnum">${eur((sub ? PUB.full : price) * rate)}</span></div>
      <div class="kv"><span>Sesión</span><span>${sub ? CATS[PUB.cat].name + " · " + CATS[PUB.cat].session : "Mercado · 60 días"}</span></div>`;
    if ($("#pStartHint")) $("#pStartHint").textContent = price < PUB.full * .15 ? "Salida muy baja: atrae pujas, pero fija una reserva." : "Salida atractiva para compradores profesionales.";
  };
  if ($("#pFull")) { $("#pFull").oninput = e => { PUB.full = +e.target.value; $("#pStart").value = Math.round(PUB.full * .25); sum(); }; $("#pStart").oninput = sum; $("#pDate").valueAsDate = new Date(Date.now() + 2 * 86400000); $("#pBuy").onchange = e => PUB.buy = e.target.checked; }
  if ($("#pPrice")) { $("#pPrice").oninput = e => { PUB.full = +e.target.value; sum(); }; $("#pMcat").onchange = e => PUB.mcat = e.target.value; }
  if ($("#pDirect")) $("#pDirect").onchange = e => PUB.direct = e.target.checked;
  sum();
}

/* ---------- compras: enlaza al pago real ---------- */
function viewPurchases() {
  const pend = payUnpaid();
  return acctShell("#/cuenta/compras", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Comprador</div><h1 style="margin-top:8px">Mis compras</h1><p class="muted" style="margin:6px 0 0">Lotes ganados, pagos y estado de la documentación.</p></div></div>
    ${pend.length ? pend.map(l => `<div class="panel" style="margin-bottom:12px;border-color:var(--accent-line);background:var(--accent-soft)">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap">
        <div style="display:flex;gap:12px;align-items:center;min-width:0"><img src="${imgSrc(l.img)}" alt="" style="width:76px;height:56px;object-fit:cover;border-radius:10px;flex:none">
          <div style="min-width:0"><b>${esc(l.title)}</b><div class="muted" style="font-size:13px;margin-top:3px">Adjudicado por <b class="tnum">${eur(curPrice(l))}</b> · comisión ${eur(buyerFee(curPrice(l)))} + IVA</div>
          <div class="chip warn" style="margin-top:6px">${ic("clock", "sm")}Pendiente de pago</div></div></div>
        <a class="btn primary" href="#/pago/${l.id}">${ic("euro", "sm")}Pagar ahora</a></div></div>`).join("")
      : `<div class="panel" style="margin-bottom:12px;display:flex;gap:10px;align-items:center"><span class="chip ok">${ic("check", "sm")}Al día</span><span class="muted" style="font-size:13.5px">No tienes lotes pendientes de pago.</span></div>`}
    <div class="tbl-wrap"><table><thead><tr><th colspan="2">Vehículo</th><th class="r">Importe</th><th class="r">Comisión</th><th>Fecha</th><th>Pago</th><th>Documentación</th><th class="r">Factura</th></tr></thead><tbody>
      ${S.purchases.map(p => `<tr><td style="width:64px"><img class="th-img" src="${imgSrc(p.img)}" alt=""></td><td><b>${esc(p.lot)}</b><div class="faint" style="font-size:12px">${p.id}</div></td>
        <td class="r tnum">${eur(p.amount)}</td><td class="r tnum">${eur(p.fee * 1.21)}</td><td class="muted">${p.date}</td>
        <td><span class="chip ${p.st === "pendiente" ? "warn" : "ok"}">${p.st}</span></td><td><span class="chip ${p.doc === "completado" ? "ok" : "warn"}">${p.doc}</span></td>
        <td class="r"><button class="btn xs" data-inv="${p.id}">${ic("doc", "sm")}PDF</button></td></tr>`).join("")}
    </tbody></table></div>`);
}

/* ---------- aviso de pago en la página del lote ---------- */
function lotPayBanner(id) {
  const l = lots.find(x => x.id === id);
  if (!l || statusOf(l) !== "end") return;
  if (!(l.hist[0] && l.hist[0].who === "Tú")) return;
  if (S.purchases.some(p => p.ref === id)) return;
  const w = $("#app .wrap"); if (!w) return;
  const d = document.createElement("div");
  d.className = "panel";
  d.style.cssText = "margin-bottom:14px;border-color:var(--accent-line);background:var(--accent-soft)";
  d.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap">
    <div><b>${ic("check", "sm")} Has ganado este lote por ${eur(curPrice(l))}</b>
      <p class="muted" style="margin:4px 0 0;font-size:13.5px">Completa el pago en las próximas 48 h para reservar la retirada.</p></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn" href="#/contrato?lote=${l.id}">${ic("doc", "sm")}Contrato de compraventa</a><a class="btn primary" href="#/pago/${l.id}">${ic("euro", "sm")}Pagar ahora</a></div></div>`;
  w.insertBefore(d, w.firstChild);
}

/* ---------- aviso en el panel: termina el alta ---------- */
function acctNudge() {
  if (!S.user || S.user.onboarded) return;
  const w = $("#app .acctbody"); if (!w) return;
  const d = document.createElement("div");
  d.className = "panel";
  d.style.cssText = "margin-bottom:14px;border-color:var(--accent-line);background:var(--accent-soft)";
  d.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap">
    <div><b>${ic("user", "sm")} Termina de configurar tu cuenta</b>
      <p class="muted" style="margin:4px 0 0;font-size:13.5px">Con los datos fiscales y tus intereses podemos activar tu límite de puja y afinar los avisos. Tarda 2 minutos.</p></div>
    <a class="btn primary" href="#/completar-perfil">Completar perfil</a></div>`;
  w.insertBefore(d, w.firstChild);
}

/* ---------- rutas nuevas ---------- */
ADMIN_TABS.splice(1, 0, ["analisis", "Análisis", "chart"]);
GUARD.auth.push("/pago", "/completar-perfil");

(function addRoutes() {
  const extra = [
    [/^\/pago\/([\w-]+)$/, (q, m) => [viewPay(m[1]), () => mountPay(m[1])]],
    [/^\/completar-perfil$/, () => [viewOnboard(), mountOnboard]],
  ];
  const at = re => ROUTES.findIndex(r => String(r[0]) === String(re));
  // lot page: "you won — pay now" banner
  let i = at(/^\/subasta\/(\w+)$/);
  if (i >= 0) ROUTES[i] = [/^\/subasta\/(\w+)$/, (q, m) => [viewLot(m[1]), () => { mountLot(m[1]); lotPayBanner(m[1]); }]];
  // account panel: nudge to finish the profile
  i = at(/^\/cuenta$/);
  if (i >= 0) ROUTES[i] = [/^\/cuenta$/, () => [viewAccount(), () => { mountAcct(); acctNudge(); }]];
  // email confirmed -> finish the profile, then verify identity
  i = at(/^\/verificar-email$/);
  if (i >= 0) ROUTES[i] = [/^\/verificar-email$/, () => [viewVerifyEmail(), () => {
    $("#veResend").onclick = () => toast("Correo reenviado", "msg");
    $("#veDone").onclick = () => { toast("Correo confirmado", "check"); location.hash = S.user && S.user.onboarded ? "#/verificacion" : "#/completar-perfil"; };
  }]];
  ROUTES.unshift(...extra);
})();

/* reset the checkout when the user leaves the flow */
addEventListener("hashchange", () => {
  const p = route().path;
  if (!p.startsWith("/pago")) { PAY.done = null; PAY.step = 0; PAY.terms = false; PAY.gest = 0; PAY.trans = ""; PAY.method = "card"; }
  if (!p.startsWith("/completar-perfil") && OB.step && !(S.user && S.user.onboarded)) OB.step = 0;
});

/* ---------- boot ---------- */
router();
initReveal(document);
polish();
