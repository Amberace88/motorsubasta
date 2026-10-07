/* ============================================================
   v9 — conexión con Supabase (auth, inventario, pujas en tiempo real)
   Si la librería o la red no están disponibles, la página sigue
   funcionando con los datos de demostración del navegador.
   ============================================================ */

var SB_URL = "https://fcyirclkkhlfrnmrvbja.supabase.co";
var SB_KEY = "sb_publishable_Gtn25ABW2Fw045QOBXrR-w_9Rj26Sl7";
var sb = null, LIVE = false, SB_READY = false;

/* ---------- utilidades de mapeo ---------- */
var BIDNAMES = {};
function bidderName(id) {
  if (!id) return "Pujador";
  if (S.user && id === S.user.id) return "Tú";
  if (!BIDNAMES[id]) BIDNAMES[id] = "Pujador #" + id.replace(/\D/g, "").slice(0, 4).padStart(4, "0");
  return BIDNAMES[id];
}
function photoStem(p) {
  if (!p) return "opel-astra";
  return String(p).replace(/^img\//, "").replace(/\.(jpe?g|png|webp)$/i, "");
}
function mapLot(a) {
  const v = a.vehicles || {};
  const st = a.auction_state || {};
  return {
    id: a.id,
    // referencia legible y estable a partir del uuid (MS-1000 … MS-9999)
    ref: "MS-" + (1000 + parseInt(String(a.id).replace(/[^0-9a-f]/gi, "").slice(0, 7) || "0", 16) % 9000),
    img: photoStem((v.photos || [])[0]),
    photos: (v.photos || []).map(photoStem),
    year: v.year, make: v.make, model: v.model,
    title: v.year + " " + v.make + " " + v.model,
    km: v.km || 0, fuel: v.fuel || "—", trans: v.transmission || "—",
    city: v.city || "—", prov: v.province || v.city || "—",
    cat: v.category || "limpio",
    start: +a.start_price || 0,
    cv: v.power_cv || 0, cc: v.displacement || 0, seats: v.seats || 5,
    body: v.body_type || "—", plate: v.plate || "••••",
    vin: v.vin || "—", firstReg: v.first_reg || (v.year + "-01-01"),
    panels: v.panels || {},
    startsAt: +new Date(a.starts_at), endsAt: +new Date(a.ends_at),
    buyNow: a.buy_now_price ? +a.buy_now_price : null,
    noReserve: !a.reserve_price,
    reserve: a.reserve_price ? +a.reserve_price : null,
    featured: !!a.featured,
    runs: v.runs !== false, keys: v.has_keys !== false,
    sellerType: v.profiles && v.profiles.company ? "Profesional" : "Particular",
    watchers: a.views || 0,
    hist: (a.bids || []).slice().sort((x, y) => new Date(y.created_at) - new Date(x.created_at))
      .map(b => ({ who: bidderName(b.bidder_id), amt: +b.amount, t: +new Date(b.created_at), auto: b.is_auto })),
    dbStatus: a.status,
    sellerId: v.seller_id || null,
    decision: a.decision || null,
    topBid: a.top_bid != null ? +a.top_bid : null,
    topBidder: a.top_bidder || null,
    secondBid: a.second_bid != null ? +a.second_bid : null,
    counterPrice: a.counter_price != null ? +a.counter_price : null,
    decisionDeadline: a.decision_deadline ? +new Date(a.decision_deadline) : null,
    finalPrice: a.final_price != null ? +a.final_price : null,
  };
}
function mapMarket(l) {
  const v = l.vehicles || {};
  return {
    id: l.id, img: photoStem((v.photos || [])[0]),
    title: v.make + " " + v.model, year: v.year, km: v.km || 0,
    fuel: v.fuel || "—", trans: v.transmission || "—", city: v.city || "—",
    cat: v.category || "limpio", type: l.listing_type || "Vehículos ligeros",
    price: +l.price, neg: !!l.negotiable,
    seller: (v.profiles && v.profiles.company) || "MotorSubasta",
    days: Math.max(0, Math.round((Date.now() - new Date(l.created_at)) / 86400000)),
  };
}

/* ---------- carga del inventario ---------- */
const AUCTION_SELECT = `id, session, starts_at, ends_at, start_price, reserve_price, buy_now_price,
  featured, status, views, winner_id, final_price,
  top_bid, top_bidder, second_bid, counter_price, decision, decision_deadline,
  vehicles ( make, model, year, km, fuel, transmission, body_type, power_cv, displacement, seats,
             vin, plate, first_reg, category, title, panels, runs, has_keys, photos, city, province,
             seller_id, profiles:seller_id ( company, full_name ) ),
  bids ( id, bidder_id, amount, is_auto, created_at )`;

async function sbLoadInventory() {
  const { data, error } = await sb.from("auctions").select(AUCTION_SELECT)
    .in("status", ["programada", "viva", "cerrada", "adjudicada"])
    .order("starts_at", { ascending: true });
  if (error) { console.warn("auctions:", error.message); return false; }
  const mapped = (data || []).map(mapLot);
  lots.length = 0; mapped.forEach(l => lots.push(l));
  const { data: ls } = await sb.from("listings")
    .select(`id, price, negotiable, listing_type, created_at,
             vehicles ( make, model, year, km, fuel, transmission, category, photos, city,
                        profiles:seller_id ( company ) )`)
    .eq("status", "activo").order("created_at", { ascending: false });
  if (ls) { market.length = 0; ls.map(mapMarket).forEach(m => market.push(m)); }
  return true;
}

/* ---------- sesión y perfil ---------- */
async function sbLoadProfile(user) {
  if (!user) { S.user = null; store.set("user", null); return; }
  SB_LOADING = true;
  const { data: p } = await sb.from("profiles").select("*").eq("id", user.id).single();
  S.user = {
    id: user.id, email: user.email,
    name: (p && p.full_name) || user.user_metadata?.full_name || user.email.split("@")[0],
    role: (p && p.role) || user.user_metadata?.role || "buyer",
    plan: (p && p.plan) || "Comprador Gratis",
    verified: !!p && p.verification === "verificado",
    vstep: p && p.verification === "enviado" ? 1 : p && p.verification === "revision" ? 2 : 0,
    company: (p && p.company) || "", cif: (p && p.cif) || "",
    city: (p && p.city) || "", phone: (p && p.phone) || "",
    onboarded: !!(p && p.cif && p.city),
  };
  S.plan = S.user.plan; store.set("plan", S.plan);
  SB_LOADING = false;
  await sbLoadUserData();
}
async function sbLoadUserData() {
  if (!LIVE || !S.user) return;
  const [{ data: w }, { data: n }, { data: mb }] = await Promise.all([
    sb.from("watchlist").select("auction_id").eq("user_id", S.user.id),
    sb.from("notifications").select("*").order("created_at", { ascending: false }).limit(30),
    sb.from("bids").select("auction_id, amount").eq("bidder_id", S.user.id),
  ]);
  if (w) { S.favs = new Set(w.map(x => x.auction_id)); store.set("favs", [...S.favs]); }
  if (n) {
    S.notes = n.map(x => ({ t: +new Date(x.created_at), txt: (x.title ? "<b>" + esc(x.title) + "</b> — " : "") + esc(x.body), icon: x.icon || "bell", unread: !x.read, link: x.link }));
  }
  if (mb) { S.myBids = {}; mb.forEach(b => { S.myBids[b.auction_id] = Math.max(S.myBids[b.auction_id] || 0, +b.amount); }); saveBids(); }
  await sbLoadSellerData();
  await sbLoadPurchases();
}
var VSTATE = { borrador: "borrador", revision: "revision", aprobado: "revision", subasta: "subasta", mercado: "mercado", vendido: "vendido", rechazado: "borrador" };
async function sbLoadSellerData() {
  if (!canSell()) return;
  const { data } = await sb.from("vehicles")
    .select("id, make, model, year, km, category, status, photos, created_at, auctions(id,start_price,status), listings(price)")
    .eq("seller_id", S.user.id).order("created_at", { ascending: false });
  if (!data) return;
  S.myVehicles = data.map(v => ({
    id: v.id, img: photoStem((v.photos || [])[0]),
    title: v.year + " " + v.make + " " + v.model, km: v.km || 0, cat: v.category,
    st: VSTATE[v.status] || "revision",
    price: (v.listings && v.listings[0] && +v.listings[0].price) || (v.auctions && v.auctions[0] && +v.auctions[0].start_price) || 0,
    bids: 0, views: 0, date: new Date(v.created_at).toLocaleDateString("es-ES"),
  }));
  const { data: of } = await sb.from("offers")
    .select("id, amount, message, status, created_at, vehicles!inner(make,model,year,seller_id,photos)")
    .eq("vehicles.seller_id", S.user.id).order("created_at", { ascending: false });
  if (of) {
    S.sellerOffers = of.map(o => ({
      id: o.id, title: o.vehicles.year + " " + o.vehicles.make + " " + o.vehicles.model,
      img: photoStem((o.vehicles.photos || [])[0]), amount: +o.amount, msg: o.message || "",
      st: { nueva: "new", aceptada: "acc", rechazada: "rej", contraoferta: "cnt", caducada: "rej" }[o.status] || "new",
      d: Math.max(0, Math.round((Date.now() - new Date(o.created_at)) / 86400000)),
    }));
  }
}
async function sbLoadPurchases() {
  const { data } = await sb.from("orders")
    .select("id, amount, fee, status, created_at, auction_id, auctions(vehicles(make,model,year,photos))")
    .eq("buyer_id", S.user.id).order("created_at", { ascending: false });
  if (!data) return;
  S.purchases = data.map(o => {
    const v = (o.auctions && o.auctions.vehicles) || {};
    return {
      id: "C-" + String(o.id).slice(0, 8).toUpperCase(), ref: o.auction_id,
      lot: (v.year || "") + " " + (v.make || "") + " " + (v.model || ""),
      img: photoStem((v.photos || [])[0]), amount: +o.amount, fee: +o.fee,
      date: new Date(o.created_at).toLocaleDateString("es-ES"),
      st: o.status === "pendiente_pago" ? "pendiente" : "pagado",
      doc: o.status === "documentacion" ? "en trámite" : o.status === "entregado" ? "completado" : "por el comprador",
    };
  });
}
var SB_LOADING = false;
function saveUser() {
  if (!LIVE) { store.set("user", S.user); return; }
  store.set("user", null);
  if (!S.user || !sb || SB_LOADING) return;
  sb.from("profiles").update({
    full_name: S.user.name, phone: S.user.phone, company: S.user.company,
    cif: S.user.cif, city: S.user.city, province: S.user.city,
  }).eq("id", S.user.id).then(r => { if (r.error) console.warn("perfil:", r.error.message); });
}
async function logout() {
  if (LIVE && sb) await sb.auth.signOut();
  S.user = null; S.myBids = {}; S.favs = new Set(); store.set("user", null);
  toast("Sesión cerrada", "logout"); location.hash = "#/"; router();
}

/* ---------- login / registro contra Supabase ---------- */
function mountLogin(q) {
  const next = q.next ? decodeURIComponent(q.next) : "#/cuenta";
  const err = m => { $("#liErr").innerHTML = `<div class="err">${ic("alert", "sm")}${m}</div>`; };
  const busy = on => { const b = $("#liGo"); b.disabled = on; b.textContent = on ? "Entrando…" : "Iniciar sesión"; };
  $("#liEye").onclick = () => { const i = $("#liPass"); i.type = i.type === "password" ? "text" : "password"; };
  const signIn = async (email, pass) => {
    if (!LIVE) {
      const u = DEMO_USERS.find(x => x.email === email);
      if (!u) return err("No existe ninguna cuenta con ese correo.");
      if (pass !== u.pass) return err("Contraseña incorrecta. En la demo es demo1234.");
      login(u); toast("Bienvenido, " + u.name.split(" ")[0], "check"); location.hash = next; return;
    }
    busy(true);
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    busy(false);
    if (error) return err(/Invalid/i.test(error.message) ? "Correo o contraseña incorrectos." : error.message);
    await sbLoadProfile(data.user);
    await sbLoadInventory();
    toast("Bienvenido, " + S.user.name.split(" ")[0], "check");
    location.hash = next; router();
  };
  $$("[data-demo]").forEach(b => b.onclick = () => signIn(b.dataset.demo, "demo1234"));
  $("#liGoogle").onclick = async () => {
    if (!LIVE) return toast("Google OAuth se conecta en la versión con servidor", "globe2");
    const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + location.pathname } });
    if (error) toast("Google aún no está activado en este proyecto", "alert");
  };
  $("#liGo").onclick = () => {
    const m = $("#liMail").value.trim().toLowerCase(), p = $("#liPass").value;
    if (!m) return err("Introduce tu correo electrónico.");
    if (!p) return err("Introduce tu contraseña.");
    signIn(m, p);
  };
  $("#loginForm").addEventListener("keydown", e => { if (e.key === "Enter") $("#liGo").click(); });
}
function mountRegister() {
  let role = "buyer";
  $$("[data-role]").forEach(b => b.onclick = () => { role = b.dataset.role; $$("[data-role]").forEach(x => x.classList.toggle("on", x === b)); });
  $("#rgEye").onclick = () => { const i = $("#rgPass"); i.type = i.type === "password" ? "text" : "password"; };
  const strength = p => (p.length >= 8) + /[A-Z]/.test(p) + /[a-z]/.test(p) + /\d/.test(p);
  $("#rgPass").oninput = e => {
    const s = strength(e.target.value), m = $("#rgMeter");
    m.style.width = (s / 4 * 100) + "%";
    m.style.background = s < 2 ? "var(--bad)" : s < 4 ? "var(--warn)" : "var(--ok)";
    $("#rgHint").textContent = s === 4 ? "Contraseña segura" : "Mínimo 8 caracteres, con mayúscula, minúscula y número";
  };
  $("#rgGoogle").onclick = () => toast(LIVE ? "Activa Google en Authentication → Providers" : "Google OAuth se conecta en la versión con servidor", "globe2");
  $("#rgGo").onclick = async () => {
    const err = m => { $("#rgErr").innerHTML = `<div class="err">${ic("alert", "sm")}${m}</div>`; };
    const n = $("#rgName").value.trim(), l = $("#rgLast").value.trim(), m = $("#rgMail").value.trim(), p = $("#rgPass").value;
    if (!n || !l) return err("Introduce tu nombre y apellidos.");
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(m)) return err("El correo electrónico no es válido.");
    if (strength(p) < 4) return err("La contraseña debe tener 8 caracteres, mayúscula, minúscula y número.");
    if (p !== $("#rgPass2").value) return err("Las contraseñas no coinciden.");
    if (!$("#rgOk").checked) return err("Debes aceptar las condiciones de uso.");
    if (!LIVE) {
      login({ email: m, name: n + " " + l, role, plan: role === "seller" ? "Vendedor Gratis" : "Comprador Gratis", verified: false, company: $("#rgCo").value.trim(), city: "", phone: "" });
      toast("Cuenta creada. Revisa tu correo para confirmarla.", "check");
      location.hash = "#/verificar-email"; return;
    }
    const b = $("#rgGo"); b.disabled = true; b.textContent = "Creando cuenta…";
    const { data, error } = await sb.auth.signUp({
      email: m, password: p,
      options: { data: { full_name: n + " " + l, role }, emailRedirectTo: location.origin + location.pathname },
    });
    b.disabled = false; b.textContent = "Crear cuenta";
    if (error) return err(/already/i.test(error.message) ? "Ya existe una cuenta con ese correo." : error.message);
    if (data.session) {
      await sbLoadProfile(data.user);
      if ($("#rgCo").value.trim()) await sb.from("profiles").update({ company: $("#rgCo").value.trim() }).eq("id", data.user.id);
      toast("Cuenta creada", "check"); location.hash = "#/completar-perfil"; router();
    } else {
      toast("Cuenta creada. Revisa tu correo para confirmarla.", "check");
      location.hash = "#/verificar-email"; router();
    }
  };
}

/* ---------- pujas reales ---------- */
async function placeBid(l, who, amt) {
  if (!LIVE) {
    l.hist.unshift({ who, amt, t: now() });
    if (who === "Tú") { S.myBids[l.id] = amt; saveBids(); S.favs.add(l.id); store.set("favs", [...S.favs]); }
    if (S.settings.antisnipe && l.endsAt - now() < 2 * MIN) l.endsAt += 2 * MIN;
    refresh(); return;
  }
  if (who !== "Tú") return;
  const { data, error } = await sb.rpc("place_bid", { p_auction: l.id, p_amount: amt });
  if (error) { toast("No se pudo registrar la puja: " + error.message, "alert"); return; }
  const r = Array.isArray(data) ? data[0] : data;
  if (!r || !r.ok) { toast((r && r.message) || "Puja rechazada", "alert"); await sbRefreshLot(l.id); return; }
  S.myBids[l.id] = amt; saveBids();
  toast("Puja registrada: " + eur(amt), "gavel");
  await sbRefreshLot(l.id);
}
async function sbRefreshLot(id) {
  if (!LIVE) return;
  const { data } = await sb.from("auctions").select(AUCTION_SELECT).eq("id", id).single();
  if (!data) return;
  const i = lots.findIndex(x => x.id === id);
  if (i >= 0) lots[i] = mapLot(data);
  refresh();
  if (route().path === "/subasta/" + id) renderBidbox(lots[i]);
}

/* ---------- favoritos en la base de datos ---------- */
async function toggleFav(id) {
  const had = S.favs.has(id);
  had ? S.favs.delete(id) : S.favs.add(id);
  store.set("favs", [...S.favs]);
  toast(had ? "Quitado de favoritos" : "Añadido a favoritos. Te avisaremos antes del cierre.", "heart");
  renderHeader(route().path);
  if (!LIVE || !S.user) return;
  if (had) await sb.from("watchlist").delete().eq("user_id", S.user.id).eq("auction_id", id);
  else await sb.from("watchlist").upsert({ user_id: S.user.id, auction_id: id });
}

/* ---------- publicar vehículo en la base de datos ---------- */
async function sbPublishVehicle() {
  if (!LIVE || !S.user) return null;
  const price = PUB.type === "subasta" ? Math.round(PUB.full * .25) : PUB.full;
  const { data: v, error } = await sb.from("vehicles").insert({
    seller_id: S.user.id, make: PUB.make || "Vehículo", model: PUB.model || "",
    year: PUB.year || new Date().getFullYear(), km: PUB.km || 0,
    category: PUB.cat, title: PUB.title, panels: PUB.panels, vin: PUB.vin || null,
    city: PUB.city || S.user.city, province: PUB.prov || S.user.city,
    photos: [], status: "revision",
  }).select().single();
  if (error) { toast("No se pudo guardar: " + error.message, "alert"); return null; }
  if (PUB.type === "mercado") {
    await sb.from("listings").insert({ vehicle_id: v.id, price, listing_type: PUB.mcat, status: "activo" });
  }
  return v;
}

/* ---------- verificación de identidad real ---------- */
async function sbSetVerification(state) {
  if (!LIVE || !S.user) return;
  await sb.from("profiles").update({
    verification: state,
    verified_at: state === "verificado" ? new Date().toISOString() : null,
  }).eq("id", S.user.id);
}

/* ---------- tiempo real ---------- */
function sbRealtime() {
  sb.channel("ms-bids")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "bids" }, async p => {
      const b = p.new, l = lots.find(x => x.id === b.auction_id);
      if (!l) return;
      if (l.hist[0] && l.hist[0].t === +new Date(b.created_at) && l.hist[0].amt === +b.amount) return;
      l.hist.unshift({ who: bidderName(b.bidder_id), amt: +b.amount, t: +new Date(b.created_at), auto: b.is_auto });
      if (S.user && b.bidder_id !== S.user.id && S.myBids[l.id] && +b.amount > S.myBids[l.id]) {
        notify(`Te han superado en <b>${esc(l.title)}</b>: ${eur(+b.amount)}`, "alert");
      }
      refresh();
      if (route().path === "/subasta/" + l.id) renderBidbox(l);
    })
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "auctions" }, p => {
      const l = lots.find(x => x.id === p.new.id);
      if (!l) return;
      l.endsAt = +new Date(p.new.ends_at); l.startsAt = +new Date(p.new.starts_at); l.dbStatus = p.new.status;
      refresh();
    })
    .subscribe();
}

/* ---------- rutas con identificadores UUID ---------- */
(function fixRoutes() {
  const swap = (oldRe, newEntry) => {
    const i = ROUTES.findIndex(r => String(r[0]) === String(oldRe));
    if (i >= 0) ROUTES[i] = newEntry;
  };
  swap(/^\/subasta\/(\w+)$/, [/^\/subasta\/([\w-]+)$/, (q, m) => [viewLot(m[1]), () => { mountLot(m[1]); lotPayBanner(m[1]); }]]);
  const vi = ROUTES.findIndex(r => String(r[0]) === String(/^\/verificacion$/));
  if (vi >= 0) ROUTES[vi] = [/^\/verificacion$/, () => [viewVerification(), () => {
    if (!$("#vfStart")) return;
    $("#vfStart").onclick = async () => {
      S.user.vstep = 1; saveUser(); router(); toast("Documento enviado. Revisión en curso…", "upload");
      await sbSetVerification("enviado");
      setTimeout(async () => {
        if (!S.user) return;
        S.user.vstep = 2; await sbSetVerification("revision");
        if (route().path === "/verificacion") router();
      }, 2500);
      setTimeout(async () => {
        if (!S.user) return;
        S.user.verified = true; S.user.vstep = 3;
        await sbSetVerification("verificado");
        renderHeader(route().path);
        if (route().path === "/verificacion") router();
        toast("¡Identidad verificada!", "check");
        notify("Tu identidad ha sido <b>verificada</b>. Ya puedes pujar.", "shield");
      }, 5200);
    };
  }]];
  swap(/^\/mercado\/(\w+)$/, [/^\/mercado\/([\w-]+)$/, (q, m) => [viewMarketItem(m[1]), () => {
    const it = market.find(x => x.id === m[1]);
    if (it) { $("#miOffer").onclick = () => offerModal(it); $("#miRes").onclick = () => toast("Reserva de 48 h confirmada", "lock"); }
  }]]);
})();

/* ---------- arranque ---------- */
async function sbBoot() {
  if (typeof window.supabase === "undefined" || !window.supabase.createClient) {
    console.info("MotorSubasta: modo demostración (sin Supabase)");
    return;
  }
  try {
    sb = window.supabase.createClient(SB_URL, SB_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      realtime: { params: { eventsPerSecond: 5 } },
    });
    const ok = await sbLoadInventory();
    if (!ok) { console.warn("MotorSubasta: sin datos remotos, sigo en modo demostración"); return; }
    LIVE = true; SB_READY = true;
    const { data: { session } } = await sb.auth.getSession();
    if (session) await sbLoadProfile(session.user); else { S.user = null; store.set("user", null); }
    sb.auth.onAuthStateChange(async (ev, s) => {
      if (ev === "SIGNED_IN" && s) { await sbLoadProfile(s.user); renderHeader(route().path); }
      if (ev === "SIGNED_OUT") { S.user = null; renderHeader(route().path); }
    });
    sbRealtime();
    router();
    const tag = document.createElement("div");
    tag.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:60;font:600 11px/1 var(--mono);letter-spacing:.06em;padding:7px 10px;border-radius:7px;background:var(--ok-soft);color:var(--ok);border:1px solid color-mix(in srgb,var(--ok) 40%,transparent);pointer-events:none;opacity:.92";
    tag.textContent = "DATOS EN VIVO · SUPABASE";
    document.body.appendChild(tag);
    setTimeout(() => { tag.style.transition = "opacity .6s"; tag.style.opacity = "0"; setTimeout(() => tag.remove(), 700); }, 4000);
    console.info("MotorSubasta: conectado a Supabase ·", lots.length, "lotes ·", market.length, "anuncios");
  } catch (e) {
    console.warn("MotorSubasta: Supabase no disponible —", e.message);
    LIVE = false;
  }
}

/* el simulador de pujas solo tiene sentido sin servidor */
(function guardSim() {
  const realSim = simBid;
  window.simBid = function () { if (!LIVE) realSim(); };
})();

sbBoot();
