/* ============================================================
   v18 — una sola cuenta · privacidad · cabecera adaptable
   · registro único: comprar, vender o las dos cosas (particular o empresa)
   · activar la venta en un clic desde cualquier cuenta
   · la API ya no expone quién vende ni quién puja: cada uno ve lo suyo con funciones propias
   · tiempo real con alias (tabla live_ticks)
   · cabecera que se compacta sola cuando no caben los enlaces (cualquier idioma)
   (todo en funciones: la primera pintura ocurre antes de que esta capa se ejecute)
   ============================================================ */

/* ---------- identidad propia ---------- */
function myBidIds() { return window.__myBidIds || (window.__myBidIds = new Set()); }
function myRoles() { return window.__myRoles || (window.__myRoles = {}); }
function myRole(aid, k) { const r = myRoles()[aid]; return !!(r && r[k]); }
function bidWho(b) {
  if (b.bidder_id) return bidderName(b.bidder_id);
  if (myBidIds().has(b.id)) return "Tú";
  return "Pujador " + (b.bidder_alias || "·····");
}
function applyMine() {
  const uid = S.user && S.user.id;
  lots.forEach(l => {
    l.hist.forEach(h => { if (h.bid != null && myBidIds().has(h.bid)) h.who = "Tú"; });
    const r = myRoles()[l.id];
    if (r && uid) { if (r.is_seller) l.sellerId = uid; if (r.is_top) l.topBidder = uid; }
  });
}
async function sbLoadMine() {
  if (!live() || !S.user) return;
  const r1 = await sb.rpc("my_bids");
  let mb = r1.data;
  if (r1.error) { const r = await sb.from("bids").select("id, auction_id, amount").eq("bidder_id", S.user.id); mb = r.data; }
  if (mb) { myBidIds().clear(); S.myBids = {}; mb.forEach(b => { myBidIds().add(b.id); S.myBids[b.auction_id] = Math.max(S.myBids[b.auction_id] || 0, +b.amount); }); saveBids(); }
  const r2 = await sb.rpc("my_auction_roles");
  if (!r2.error && r2.data) { const m = myRoles(); Object.keys(m).forEach(k => delete m[k]); r2.data.forEach(x => { m[x.auction_id] = x; }); }
  applyMine();
}
async function sbLoadUserData() {
  if (!live() || !S.user) return;
  const [{ data: w }, { data: n }] = await Promise.all([
    sb.from("watchlist").select("auction_id").eq("user_id", S.user.id),
    sb.from("notifications").select("*").order("created_at", { ascending: false }).limit(30),
  ]);
  if (w) { S.favs = new Set(w.map(x => x.auction_id).concat([...S.favs].filter(id => !lots.some(l => l.id === id)))); store.set("favs", [...S.favs]); }
  if (n) S.notes = n.map(x => ({ t: +new Date(x.created_at), txt: (x.title ? "<b>" + esc(x.title) + "</b> — " : "") + esc(x.body), icon: x.icon || "bell", unread: !x.read, link: x.link }));
  await sbLoadMine();
  await sbLoadSellerData();
  await sbLoadPurchases();
  if (roleIs("admin")) await sbLoadUsers();
}

/* vendedor: sus vehículos y las ofertas del Mercado */
async function sbLoadSellerData() {
  if (!live() || !canSell()) return;
  const r = await sb.rpc("my_vehicles");
  if (!r.error && r.data) {
    S.myVehicles = r.data.map(v => ({
      id: v.id, ref: v.ref, img: photoStem((v.photos || [])[0]), title: [v.year, v.make, v.model].filter(Boolean).join(" "), km: v.km || 0, cat: v.category,
      st: VSTATE[v.status] || "revision", price: +(v.price || v.start_price || 0), bids: v.bids || 0, views: 0,
      date: new Date(v.created_at).toLocaleDateString("es-ES"), vin: v.vin || "", plate: v.plate || "",
      channel: v.listing_id ? "mercado" : v.auction_id ? "subasta" : (v.status === "subasta" ? "subasta" : "mercado"),
      listingId: v.listing_id, lst: v.listing_status, auctionId: v.auction_id,
    }));
  }
  const o = await sb.rpc("my_received_offers");
  if (!o.error && o.data) {
    S.sellerOffers = o.data.map(x => ({
      id: x.id, listing: x.listing_id, title: x.title, img: photoStem(x.photo), amount: +x.amount, msg: x.message || "", counter: x.counter ? +x.counter : null,
      st: { nueva: "new", aceptada: "acc", rechazada: "rej", contraoferta: "cnt", caducada: "rej" }[x.status] || "new",
      buyer: x.buyer_name || "Comprador", buyerKind: x.buyer_kind, contact: { phone: x.buyer_phone, whatsapp: x.buyer_whatsapp, email: x.buyer_email },
      d: (d => d === 0 ? "hoy" : d === 1 ? "hace 1 día" : `hace ${d} días`)(Math.max(0, Math.round((Date.now() - new Date(x.created_at)) / 86400000))),
    }));
  }
}
async function sbLoadMyOffers() {
  if (!live() || !S.user) return;
  const { data, error } = await sb.rpc("my_sent_offers");
  if (error || !data) return;
  store.set("myoffers", data.map(o => ({ id: o.id, listing: o.listing_id, title: o.title, img: photoStem(o.photo), amount: +o.amount, msg: o.message || "", status: o.status, counter: o.counter ? +o.counter : null, neg: o.negotiable, at: o.created_at })));
}

/* ofertas y mensajes recibidos (Mercado: la comunicación es abierta) */
function viewSellerOffers() {
  const list = S.sellerOffers || [];
  const ctBtns = o => {
    const c = o.contact || {}, wa = c.whatsapp && c.whatsapp.replace(/[^\d]/g, ""), t = encodeURIComponent(`Hola ${o.buyer}, te escribo por tu oferta de ${eur(o.amount)} por el ${o.title} en MotorSubasta.`);
    return [wa ? `<a class="btn xs ctbtn wa" href="https://wa.me/${wa}?text=${t}" target="_blank" rel="noopener">${ic("msg", "sm")}WhatsApp</a>` : "",
      c.phone ? `<a class="btn xs" href="tel:${esc(c.phone.replace(/\s/g, ""))}">${ic("bell", "sm")}Llamar</a>` : "",
      c.email ? `<a class="btn xs" href="mailto:${esc(c.email)}?subject=${encodeURIComponent(o.title)}&body=${t}">${ic("doc", "sm")}Email</a>` : ""].join("");
  };
  return sellShell("#/vender/ofertas", `
    <div class="admin-head" style="margin-top:0"><div><div class="eyebrow">Mercado</div><h1 style="margin-top:8px">Ofertas y mensajes</h1>
      <p class="muted" style="margin:6px 0 0">Lo que te envían los compradores de tus anuncios. Responde aquí o por el contacto que el comprador haya permitido.</p></div></div>
    ${list.length ? `<div style="display:grid;gap:12px">${list.map(o => `<div class="panel offer" data-rev>
      <img src="${pimg(o.img)}" alt="">
      <div><b>${esc(o.title)}</b><div class="muted" style="font-size:13px">${esc(o.buyer)}${o.buyerKind ? ` · ${o.buyerKind === "profesional" ? "Profesional" : "Particular"}` : ""} · ${esc(String(o.d))}</div>${o.msg ? `<p class="muted" style="margin:8px 0 0;font-size:13.5px">“${esc(o.msg)}”</p>` : ""}
        <div class="my-a" style="justify-content:flex-start;margin-top:8px">${ctBtns(o)}</div></div>
      <div class="oamt"><small class="muted">Oferta</small><b class="tnum">${eur(o.amount)}</b><small class="muted">${o.counter ? "Tu contraoferta " + eur(o.counter) : "sin comisiones"}</small></div>
      <div class="oact">${o.st === "new" ? `<button class="btn sm primary" data-off="${o.id}" data-a="acc">Aceptar</button>
        <button class="btn sm" data-off="${o.id}" data-a="cnt">Contraofertar</button>
        <button class="btn sm bad" data-off="${o.id}" data-a="rej">Rechazar</button>`
        : `<span class="chip ${o.st === "acc" ? "ok" : o.st === "cnt" ? "info" : "bad"}">${o.st === "acc" ? "Aceptada" : o.st === "cnt" ? "Contraoferta" : "Rechazada"}</span>`}</div>
    </div>`).join("")}</div>` : `<div class="panel empty">${ic("msg", "lg")}<b>Aún no has recibido ofertas</b><span>Cuando un comprador te escriba desde un anuncio, aparecerá aquí.</span><a class="btn" href="#/vender/anuncios">Ver mis anuncios</a></div>`}`);
}

/* pujas: tras pujar, actualizar lo propio */
(function hookBid() {
  const base = placeBid;
  placeBid = async function (l, who, amt) { await base(l, who, amt); if (live() && who === "Tú") { await sbLoadMine(); await sbRefreshLot(l.id); applyMine(); } };
})();

/* tiempo real sin datos personales */
function sbRealtime() {
  sb.channel("ms-live")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_ticks" }, async p => {
      const t = p.new, l = lots.find(x => x.id === t.auction_id); if (!l) return;
      const mine = S.myBids[l.id];
      await sbRefreshLot(l.id); applyMine();
      const nl = lots.find(x => x.id === t.auction_id);
      if (t.kind === "bid" && mine && +t.amount > mine && nl && nl.hist[0] && nl.hist[0].who !== "Tú") notify(`Te han superado en <b>${esc(nl.title)}</b>: ${eur(+t.amount)}`, "alert");
      refresh(); if (route().path === "/subasta/" + l.id && nl) renderBidbox(nl);
    })
    .subscribe();
}

/* ---------- registro único ---------- */
function regState() { return window.__reg || (window.__reg = { buy: true, sell: false, kind: "particular" }); }
function viewRegister() {
  const r = regState();
  return authShell("Crear una cuenta", "Una sola cuenta para comprar y vender", `
    <form id="regForm" onsubmit="return false" style="display:grid;gap:14px">
      <div><div class="lbl" style="margin-bottom:8px">¿Qué quieres hacer? <span class="muted" style="font-weight:500">· puedes elegir las dos</span></div>
        <div class="opt-cards regwant" style="grid-template-columns:1fr 1fr">
          <button type="button" class="opt ${r.buy ? "on" : ""}" data-want="buy" aria-pressed="${r.buy}"><b>${ic("search", "sm")}Comprar<i class="ck">${ic("check", "sm")}</i></b><small>Mercado y subastas</small></button>
          <button type="button" class="opt ${r.sell ? "on" : ""}" data-want="sell" aria-pressed="${r.sell}"><b>${ic("store", "sm")}Vender<i class="ck">${ic("check", "sm")}</i></b><small>Anuncios gratis y subastas</small></button>
        </div></div>
      <div class="seg regkind" id="rgKind">${[["particular", "Particular", "user"], ["empresa", "Empresa o autónomo", "building"]].map(([k, t, i]) => `<button type="button" data-v="${k}" class="${r.kind === k ? "on" : ""}">${ic(i, "sm")}${t}</button>`).join("")}</div>
      <div class="fgrid">
        <div class="field"><label for="rgName">Nombre *</label><input class="in" id="rgName" autocomplete="given-name"></div>
        <div class="field"><label for="rgLast">Apellidos *</label><input class="in" id="rgLast" autocomplete="family-name"></div>
        <div class="field full ${r.kind === "empresa" ? "" : "hidden"}" id="rgCoF"><label for="rgCo">Empresa *</label><input class="in" id="rgCo" placeholder="Autos Ejemplo S.L." autocomplete="organization"></div>
        <div class="field full"><label for="rgMail">Correo electrónico *</label><input class="in" id="rgMail" type="email" autocomplete="email"></div>
        <div class="field"><label for="rgPass">Contraseña *</label><div class="pwrap"><input class="in" id="rgPass" type="password" autocomplete="new-password"><button type="button" class="peye" id="rgEye" aria-label="Mostrar contraseña">${ic("eye", "sm")}</button></div></div>
        <div class="field"><label for="rgPass2">Confirmar contraseña *</label><input class="in" id="rgPass2" type="password" autocomplete="new-password"></div>
        <div class="field full pmeter-row"><div class="pmeter"><i id="rgMeter"></i></div><small class="muted" id="rgHint">Mínimo 8 caracteres, con mayúscula, minúscula y número</small></div>
      </div>
      <div class="privnote">${ic("lock", "sm")}<span>Tus datos son privados. En las subastas nadie ve quién compra ni quién vende; en el Mercado solo se muestra el contacto que tú elijas.</span></div>
      <label><input type="checkbox" id="rgOk"> <span style="font-size:13.5px">He leído y acepto las <a class="link" href="#/terminos">condiciones de uso</a> y la <a class="link" href="#/privacidad">política de privacidad</a></span></label>
      <div id="rgErr"></div>
      <button class="btn primary block" id="rgGo">Crear cuenta</button>
      <div class="orline"><span>o continuar con</span></div>
      <button class="btn block" type="button" id="rgGoogle">${ic("globe2", "sm")}Registrarse con Google</button>
    </form>`, `¿Ya tienes cuenta? <a class="link" href="#/login">Iniciar sesión</a>`);
}
function mountRegister() {
  const r = regState();
  $$("[data-want]").forEach(b => b.onclick = () => {
    const k = b.dataset.want; r[k] = !r[k]; if (!r.buy && !r.sell) r[k === "buy" ? "sell" : "buy"] = true;
    $$("[data-want]").forEach(x => { const on = r[x.dataset.want]; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); });
  });
  $$("#rgKind button").forEach(b => b.onclick = () => { r.kind = b.dataset.v; $$("#rgKind button").forEach(x => x.classList.toggle("on", x === b)); $("#rgCoF").classList.toggle("hidden", r.kind !== "empresa"); });
  $("#rgEye").onclick = () => { const i = $("#rgPass"); i.type = i.type === "password" ? "text" : "password"; };
  const strength = p => (p.length >= 8) + /[A-Z]/.test(p) + /[a-z]/.test(p) + /\d/.test(p);
  $("#rgPass").oninput = e => { const s = strength(e.target.value), m = $("#rgMeter"); m.style.width = (s / 4 * 100) + "%"; m.style.background = s < 2 ? "var(--bad)" : s < 4 ? "var(--warn)" : "var(--ok)"; $("#rgHint").textContent = s === 4 ? "Contraseña segura" : "Mínimo 8 caracteres, con mayúscula, minúscula y número"; };
  $("#rgGoogle").onclick = () => toast(live() ? "Activa Google en Authentication → Providers" : "Google OAuth se conecta en la versión con servidor", "globe2");
  $("#rgGo").onclick = async () => {
    const err = m => { $("#rgErr").innerHTML = `<div class="err">${ic("alert", "sm")}${m}</div>`; };
    const n = $("#rgName").value.trim(), l = $("#rgLast").value.trim(), m = $("#rgMail").value.trim(), p = $("#rgPass").value, co = r.kind === "empresa" ? $("#rgCo").value.trim() : "";
    if (!n || !l) return err("Introduce tu nombre y apellidos.");
    if (r.kind === "empresa" && co.length < 2) return err("Indica el nombre de la empresa.");
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(m)) return err("El correo electrónico no es válido.");
    if (strength(p) < 4) return err("La contraseña debe tener 8 caracteres, mayúscula, minúscula y número.");
    if (p !== $("#rgPass2").value) return err("Las contraseñas no coinciden.");
    if (!$("#rgOk").checked) return err("Debes aceptar las condiciones de uso.");
    const role = r.sell ? "seller" : "buyer";
    if (!live()) {
      login({ email: m, name: n + " " + l, role, plan: "Comprador Gratis", verified: false, company: co, city: "", phone: "" });
      toast("Cuenta creada. Revisa tu correo para confirmarla.", "check"); location.hash = "#/verificar-email"; return;
    }
    const b = $("#rgGo"); b.disabled = true; b.textContent = "Creando cuenta…";
    const { data, error } = await sb.auth.signUp({ email: m, password: p, options: { data: { full_name: n + " " + l, role, company: co }, emailRedirectTo: location.origin + location.pathname } });
    b.disabled = false; b.textContent = "Crear cuenta";
    if (error) return err(/already/i.test(error.message) ? "Ya existe una cuenta con ese correo." : error.message);
    if (data.session) { await sbLoadProfile(data.user); toast("Cuenta creada", "check"); location.hash = "#/completar-perfil"; router(); }
    else { toast("Cuenta creada. Revisa tu correo para confirmarla.", "check"); location.hash = "#/verificar-email"; router(); }
  };
}

/* activar la venta en la misma cuenta */
async function activateSelling() {
  if (!S.user) { location.hash = "#/registro"; return; }
  if (live() && S.user.id) { const { error } = await sb.from("profiles").update({ role: "seller" }).eq("id", S.user.id); if (error) return toast("No se ha podido activar: " + error.message, "alert"); }
  S.user.role = "seller"; saveUser(); renderHeader(route().path);
  toast("Venta activada: ya puedes publicar vehículos", "check"); router();
}
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-actsell]"); if (b) { e.preventDefault(); activateSelling(); } });

/* ---------- admin: usuarios reales ---------- */
async function sbLoadUsers() {
  if (!live() || !roleIs("admin")) return;
  const { data } = await sb.from("profiles").select("id, email, full_name, company, role, verification, blocked, created_at").order("created_at", { ascending: false }).limit(1000);
  if (!data) return;
  S.users.length = 0;
  data.forEach(p => S.users.push({ id: p.id, mail: p.email || "—", co: p.company || p.full_name || "—", role: (typeof ROLE_LABEL !== "undefined" && ROLE_LABEL[p.role]) || p.role, st: p.blocked ? "blk" : p.verification === "verificado" ? "ok" : "pend", d: new Date(p.created_at).toLocaleDateString("es-ES") }));
}
document.addEventListener("click", async e => {
  const x = e.target.closest && e.target.closest("[data-uact]"); if (!x || !live()) return;
  const u = S.users.find(q => q.mail === x.dataset.mail); if (!u || !u.id) return;
  const patch = x.dataset.uact === "ok" ? { verification: "verificado", verified_at: new Date().toISOString(), blocked: false } : { blocked: true };
  const { error } = await sb.from("profiles").update(patch).eq("id", u.id);
  if (error) toast("No se ha podido actualizar: " + error.message, "alert");
}, true);

/* ---------- cabecera: se compacta sola si los enlaces no caben ---------- */
function fitHeader() {
  const top = $("#top"), nav = $("#nav"); if (!top || !nav) return;
  top.classList.remove("hc1", "hc2", "hc3");
  if (getComputedStyle(nav).display === "none") return;
  const over = () => nav.scrollWidth > nav.clientWidth + 1;
  for (const c of ["hc1", "hc2", "hc3"]) { if (!over()) break; top.classList.add(c); }
}
(function hookHeader() {
  const base = renderHeader;
  renderHeader = function (p) { base(p); fitHeader(); setTimeout(fitHeader, 120); setTimeout(fitHeader, 700); };
  let t; addEventListener("resize", () => { clearTimeout(t); t = setTimeout(fitHeader, 80); });
  try { new MutationObserver(() => { clearTimeout(t); t = setTimeout(fitHeader, 60); }).observe(document.querySelector("#nav"), { subtree: true, childList: true, characterData: true }); } catch (e) {}
})();

(function privacyRoutes() {
  ROUTES.unshift([/^\/registro$/, () => [viewRegister(), mountRegister]]);
  ROUTES.unshift([/^\/vender\/ofertas$/, () => [viewSellerOffers(), () => { try { mountSeller(); } catch (e) {} try { mountAcct(); } catch (e) {} }]]);
  patchRoute(/^\/admin$/, () => { if (live() && roleIs("admin") && !window.__usersLoaded) { window.__usersLoaded = true; sbLoadUsers().then(() => { if (route().path === "/admin") reAdmin(); }); } });
})();
