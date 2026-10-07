/* ============================================================
   v7 — cuentas, roles y páginas públicas que faltaban
   (auth simulada en el navegador; lista para conectar a Supabase)
   ============================================================ */

/* ---------- real fee table from the live platform ---------- */
FEES.length = 0;
FEES.push([0, 499, 39], [500, 999, 79], [1000, 1999, 139], [2000, 3999, 219], [4000, 5999, 279],
  [6000, 7999, 319], [8000, 9999, 359], [10000, 12999, 399], [13000, 15999, 459]);
GESTORIA.length = 0;
GESTORIA.push(["Transferencia vehículo estándar", 149], ["Transferencia cliente final (IGIC/IPSI)", 199], ["Transferencia ciclomotor", 79],
  ["Baja tráfico", 129], ["Transferencia a tercero", 109], ["Gestión DUA + transporte interinsular", 229],
  ["Duplicado permiso / ficha técnica", 89], ["Gestiones adicionales", 69], ["Informe DGT", 15],
  ["Reforma vehículo", 49], ["Levantamiento reserva dominio", 59]);

/* ---------- accounts ---------- */
var DEMO_USERS = [
  { email: "comprador@demo.es", pass: "demo1234", name: "Marta Ruiz", role: "buyer", plan: "Comprador Pro", verified: true, company: "Talleres Llorca S.L.", cif: "B53122990", city: "Alicante", phone: "+34 600 111 222" },
  { email: "vendedor@demo.es", pass: "demo1234", name: "Carlos Soler", role: "seller", plan: "Vendedor Pro", verified: true, company: "Autos Finestrat S.L.", cif: "B54880123", city: "Finestrat", phone: "+34 600 333 444" },
  { email: "dealer@demo.es", pass: "demo1234", name: "AutoExport Ruse", role: "dealer", plan: "Comprador Dealer", verified: true, company: "AutoExport Ruse EOOD", cif: "BG204551221", city: "Ruse", phone: "+359 88 123 456" },
  { email: "admin@motorsubasta.com", pass: "demo1234", name: "Eddie", role: "admin", plan: "Combinado Full", verified: true, company: "MotorSubasta", cif: "B12345678", city: "Alicante", phone: "+34 900 000 000" },
];
S.user = store.get("user", null);
function saveUser() { store.set("user", S.user); }
function isLogged() { return !!S.user; }
function roleIs(...r) { return S.user && r.includes(S.user.role); }
function canSell() { return roleIs("seller", "admin"); }
function initials(n) { return (n || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase(); }
function login(u) {
  S.user = { ...u }; delete S.user.pass;
  S.user.since = S.user.since || "2026";
  S.plan = S.user.plan; store.set("plan", S.plan);
  saveUser(); renderHeader(route().path);
}
function logout() { S.user = null; saveUser(); toast("Sesión cerrada", "logout"); location.hash = "#/"; }

/* bidding gate: login + identity verification, like the live platform */
function gate(action = "pujar") {
  if (!isLogged()) {
    modal("Inicia sesión para " + action, `<p style="margin:0">Las pujas son vinculantes, así que solo los usuarios registrados y verificados pueden ${action}.</p>
      <div style="display:flex;gap:8px"><a class="btn primary" href="#/login" id="gl">Iniciar sesión</a><a class="btn" href="#/registro" id="gr">Crear cuenta</a></div>
      <small class="muted">Cuentas de prueba: comprador@demo.es · vendedor@demo.es · admin@motorsubasta.com — contraseña <b>demo1234</b></small>`, close => {
      $("#gl").onclick = close; $("#gr").onclick = close;
    });
    return false;
  }
  if (!S.user.verified) {
    modal("Verifica tu identidad", `<p style="margin:0">Tu cuenta está pendiente de verificación. Es un paso único y tarda unos minutos.</p>
      <a class="btn primary" href="#/verificacion" id="gv">Ir a verificación</a>`, close => { $("#gv").onclick = close; });
    return false;
  }
  return true;
}
function quickBid(id, amount) {
  if (!gate("pujar")) return;
  const l = lots.find(x => x.id === id); if (!l) return;
  if (l.cat === "oculta" && !/Dealer|Full/.test(S.plan)) { toast("Lote exclusivo para planes Dealer", "lock"); location.hash = "#/precios"; return; }
  const min = l.hist.length ? curPrice(l) + inc(curPrice(l)) : l.start;
  const v = Math.max(min, amount), pre = isPre(l);
  modal(pre ? "Confirmar puja anticipada" : "Confirmar puja", `
    <div style="display:flex;gap:12px;align-items:center"><img src="${imgSrc(l.img)}" alt="" style="width:92px;height:66px;object-fit:cover;border-radius:10px"><div><b>${esc(l.title)}</b><div class="muted" style="font-size:13px">${CATS[l.cat].name} · ${esc(l.city)}</div></div></div>
    <div class="kv total" style="border:0;margin:0;padding:0"><span>Tu puja</span><span class="tnum">${eur(v)}</span></div>
    <div class="kv"><span>Comisión estimada (${S.plan})</span><span class="tnum">${eur(buyerFee(v) * (1 - planDisc()) * 1.21)}</span></div>
    <div class="lead-note" style="background:var(--warn-soft);color:var(--warn)">${ic("alert", "sm")}${pre ? "Tu puja anticipada se aplica al abrir la sesión y se mantiene activa." : "La puja es vinculante durante 30 días y no se puede retirar."}</div>
    <label><input type="checkbox" id="cOk"> <span>Acepto las condiciones de puja</span></label>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes" disabled>${pre ? "Pre-pujar" : "Pujar"} ${eur(v)}</button></div>`, close => {
    $("#cOk").onchange = e => { $("#cYes").disabled = !e.target.checked; };
    $("#cNo").onclick = close;
    $("#cYes").onclick = () => {
      close(); placeBid(l, "Tú", v);
      toast((pre ? "Puja anticipada de " : "Puja de ") + eur(v) + " registrada", "gavel");
      notify(`${pre ? "Puja anticipada" : "Puja"} de <b>${eur(v)}</b> en ${esc(l.title)}.`, "gavel");
    };
  });
}

/* ---------- header: role aware ---------- */
NAV.length = 0;
NAV.push(["#/", "Inicio", "home"], ["#/subastas", "Subastas", "gavel"], ["#/mercado", "Mercado", "store"],
  ["#/precios", "Precios", "euro"], ["#/empresa", "Empresa", "building"], ["#/seguros", "Seguros", "umbrella"], ["#/contrato", "Contrato", "doc"]);
function renderHeader(path) {
  const liveN = lots.filter(l => statusOf(l) === "live").length;
  const soonN = lots.filter(l => statusOf(l) === "soon").length;
  // en directo: punto que late · solo puja anticipada: punto fijo
  const dot = liveN ? '<span class="live-dot" title="Subastas en directo"></span>'
    : soonN ? '<span class="live-dot idle" title="Puja anticipada abierta"></span>' : "";
  // admins swap "Empresa" (still in the footer and the mobile menu) for the admin panel,
  // so the header never carries more than five links
  const nav = roleIs("admin") ? NAV.filter(n => n[0] !== "#/empresa") : [...NAV];
  const link = ([h, t, i]) => {
    const on = h === "#/" ? path === "/" : path.startsWith(h.slice(1).replace(/s$/, ""));
    return `<a href="${h}" class="${on ? "on" : ""}">${ic(i, "sm")}${t}${h === "#/subastas" ? dot : ""}</a>`;
  };
  // en escritorio el logo ya lleva a Inicio: así caben las cinco secciones
  // Empresa vive en el pie y en el menú móvil; el admin cambia además Precios por su panel
  const deskHide = ["#/", "#/empresa"];
  $("#nav").innerHTML = nav.filter(n => !deskHide.includes(n[0])).map(link).join("") + '<span class="ind"></span>';
  const links = nav.map(link).join("");
  $("#mnav").innerHTML = links + `<a href="#/como-funciona">${ic("doc", "sm")}Cómo funciona</a><a href="#/tarifas">${ic("euro", "sm")}Tarifas</a><a href="#/faq">${ic("msg", "sm")}Ayuda</a>` + (isLogged()
    ? `<a href="#/cuenta">${ic("user", "sm")}Mi cuenta</a>${canSell() ? `<a href="#/vender">${ic("truck", "sm")}Panel de vendedor</a>` : ""}<a href="#/valoracion">${ic("car", "sm")}Valoración gratuita</a>`
    : `<a href="#/login">${ic("user", "sm")}Iniciar sesión</a><a href="#/registro">${ic("plus", "sm")}Crear cuenta</a>`);
  $("#valBtn").innerHTML = ic("car", "sm") + "Valoración";
  $("#favBtn").innerHTML = ic("heart") + (S.favs.size ? `<span class="badge-n">${S.favs.size}</span>` : "");
  const u = S.notesUnread();
  $("#bellBtn").innerHTML = ic("bell") + (u ? `<span class="badge-n">${u}</span>` : "");
  $("#burger").innerHTML = ic("menu");
  const chip = $("#userBtn");
  chip.innerHTML = isLogged()
    ? `<span class="avatar">${initials(S.user.name)}</span><span class="nm">${esc(S.user.name.split(" ")[0])} · ${ROLE_LABEL[S.user.role]}</span>`
    : `<span class="avatar">${ic("user", "sm")}</span><span class="nm">Entrar</span>`;
  moveInd();
}
var ROLE_LABEL = { buyer: "Comprador", seller: "Vendedor", dealer: "Dealer", admin: "Admin" };
$("#userBtn").onclick = e => {
  e.stopPropagation();
  const m = $("#userMenu");
  if (!isLogged()) {
    m.innerHTML = `<a href="#/login">${ic("user", "sm")}Iniciar sesión</a><a href="#/registro">${ic("plus", "sm")}Crear cuenta</a>
      <div style="padding:8px 10px 4px;border-top:1px solid var(--line);margin-top:4px"><small class="muted">Demo: comprador@demo.es / demo1234</small></div>`;
  } else if (roleIs("admin")) {
    m.innerHTML = `<div style="padding:8px 10px 10px;border-bottom:1px solid var(--line);margin-bottom:4px"><b>${esc(S.user.name)}</b><small class="muted" style="display:block">${esc(S.user.email)}</small><span class="chip vip" style="margin-top:6px">${ic("shield", "sm")}Administrador</span></div>
      <a href="#/admin">${ic("chart", "sm")}Panel de control</a>
      <a href="#/admin/analitica">${ic("gauge", "sm")}Analítica</a>
      <a href="#/admin/vehiculos">${ic("car", "sm")}Vehículos</a>
      <a href="#/admin/subastas">${ic("gavel", "sm")}Subastas</a>
      <a href="#/admin/mercado">${ic("store", "sm")}Mercado</a>
      <a href="#/admin/operaciones">${ic("truck", "sm")}Operaciones</a>
      <a href="#/admin/usuarios">${ic("users", "sm")}Usuarios</a>
      <a href="#/admin/ajustes">${ic("gear", "sm")}Ajustes</a>
      <button id="logoutBtn" style="color:var(--bad);border-top:1px solid var(--line);margin-top:4px">${ic("logout", "sm")}Cerrar sesión</button>`;
  } else {
    m.innerHTML = `<div style="padding:8px 10px 10px;border-bottom:1px solid var(--line);margin-bottom:4px"><b>${esc(S.user.name)}</b><small class="muted" style="display:block">${esc(S.user.email)}</small><span class="chip acc" style="margin-top:6px">${S.user.plan}</span></div>
      <a href="#/cuenta">${ic("chart", "sm")}Mi panel</a>
      <a href="#/cuenta/pujas">${ic("gavel", "sm")}Mis pujas</a>
      <a href="#/favoritos">${ic("heart", "sm")}Favoritos</a>
      <a href="#/cuenta/compras">${ic("truck", "sm")}Mis compras</a>
      ${canSell() ? `<a href="#/vender">${ic("store", "sm")}Panel de vendedor</a>` : ""}
      <a href="#/cuenta/suscripcion">${ic("euro", "sm")}Suscripción</a>
      <a href="#/cuenta/ajustes">${ic("gear", "sm")}Ajustes</a>
      ${roleIs("admin") ? `<a href="#/admin">${ic("shield", "sm")}Administración</a>` : ""}
      <button id="logoutBtn" style="color:var(--bad)">${ic("logout", "sm")}Cerrar sesión</button>`;
  }
  m.hidden = !m.hidden;
  if ($("#logoutBtn")) $("#logoutBtn").onclick = () => { m.hidden = true; logout(); };
};

/* ---------- auth pages ---------- */
function authShell(title, sub, body, foot) {
  return `<div class="authwrap">
    <aside class="authside">
      <img class="lg lg-d" src="img/logo-dark.png" alt="MotorSubasta"><img class="lg lg-l" src="img/logo-light.png" alt="MotorSubasta">
      <h2>Compra y vende vehículos en toda España</h2>
      <p>Una sola cuenta para el Mercado gratuito y, muy pronto, las subastas profesionales.</p>
      <ul class="checks">
        <li>${ic("check", "sm")}Publicar en el Mercado es gratis</li><li>${ic("check", "sm")}Tus datos son privados: tú eliges tu contacto</li>
        <li>${ic("check", "sm")}Contrato, gestoría y transporte</li><li>${ic("check", "sm")}Subastas anónimas y verificadas</li></ul>
      <small class="faint">© 2026 MotorSubasta · Alicante, España</small>
    </aside>
    <div class="authcard">
      <h1>${title}</h1><p class="muted">${sub}</p>
      ${body}
      <div class="authfoot">${foot}</div>
    </div>
  </div>`;
}
function viewLogin(q) {
  return authShell("Bienvenido de nuevo", "Introduce tus credenciales para acceder a tu cuenta", `
    <form id="loginForm" onsubmit="return false" style="display:grid;gap:14px">
      <div class="field"><label for="liMail">Correo electrónico</label><input class="in" id="liMail" type="email" autocomplete="username" placeholder="tu@empresa.es"></div>
      <div class="field"><label for="liPass">Contraseña</label><div class="pwrap"><input class="in" id="liPass" type="password" autocomplete="current-password" placeholder="••••••••"><button type="button" class="peye" id="liEye" aria-label="Mostrar contraseña">${ic("eye", "sm")}</button></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
        <label style="min-height:auto"><input type="checkbox" id="liRem" checked> <span style="font-size:13.5px">Recordarme</span></label>
        <a class="link" href="#/recuperar" style="font-size:13.5px">¿Olvidaste tu contraseña?</a></div>
      <div id="liErr"></div>
      <button class="btn primary block" id="liGo">Iniciar sesión</button>
      <div class="orline"><span>o continuar con</span></div>
      <button class="btn block" id="liGoogle" type="button">${ic("globe2", "sm")}Continuar con Google</button>
      <div class="demobox"><b>Cuentas de prueba</b>
        ${DEMO_USERS.map(u => `<button type="button" class="demorow" data-demo="${u.email}"><span class="avatar">${initials(u.name)}</span><span><b>${ROLE_LABEL[u.role]}</b><small>${u.email}</small></span><span class="chip">Entrar</span></button>`).join("")}
        <small class="muted">Contraseña para todas: <b>demo1234</b></small></div>
    </form>`, `¿No tienes cuenta? <a class="link" href="#/registro">Regístrate</a>`);
}
function mountLogin(q) {
  const next = q.next ? decodeURIComponent(q.next) : "#/cuenta";
  const err = m => { $("#liErr").innerHTML = `<div class="err">${ic("alert", "sm")}${m}</div>`; };
  const doLogin = u => { login(u); toast("Bienvenido, " + u.name.split(" ")[0], "check"); location.hash = next; };
  $("#liEye").onclick = () => { const i = $("#liPass"); i.type = i.type === "password" ? "text" : "password"; };
  $$("[data-demo]").forEach(b => b.onclick = () => doLogin(DEMO_USERS.find(u => u.email === b.dataset.demo)));
  $("#liGoogle").onclick = () => toast("Google OAuth se conecta en la versión con servidor", "globe2");
  $("#liGo").onclick = () => {
    const m = $("#liMail").value.trim().toLowerCase(), p = $("#liPass").value;
    const u = DEMO_USERS.find(x => x.email === m);
    if (!m) return err("Introduce tu correo electrónico.");
    if (!u) return err("No existe ninguna cuenta con ese correo. Usa una cuenta de prueba o regístrate.");
    if (p !== u.pass) return err("Contraseña incorrecta. En la demo es demo1234.");
    doLogin(u);
  };
  $("#loginForm").addEventListener("keydown", e => { if (e.key === "Enter") $("#liGo").click(); });
}
function viewRegister() {
  return authShell("Crear una cuenta", "Regístrate en menos de un minuto", `
    <form id="regForm" onsubmit="return false" style="display:grid;gap:14px">
      <div><div class="lbl" style="margin-bottom:8px">¿Cómo vas a usar MotorSubasta?</div>
        <div class="opt-cards" style="grid-template-columns:1fr 1fr">
          <button type="button" class="opt on" data-role="buyer"><b>${ic("gavel", "sm")}Comprar</b><small>Pujar en subastas y comprar en el mercado</small></button>
          <button type="button" class="opt" data-role="seller"><b>${ic("store", "sm")}Vender</b><small>Publicar vehículos en subasta o a precio fijo</small></button>
        </div></div>
      <div class="fgrid">
        <div class="field"><label for="rgName">Nombre *</label><input class="in" id="rgName"></div>
        <div class="field"><label for="rgLast">Apellidos *</label><input class="in" id="rgLast"></div>
        <div class="field full"><label for="rgMail">Correo electrónico *</label><input class="in" id="rgMail" type="email"></div>
        <div class="field"><label for="rgPass">Contraseña *</label><div class="pwrap"><input class="in" id="rgPass" type="password"><button type="button" class="peye" id="rgEye" aria-label="Mostrar contraseña">${ic("eye", "sm")}</button></div><div class="pmeter"><i id="rgMeter"></i></div><small class="muted" id="rgHint">Mínimo 8 caracteres, con mayúscula, minúscula y número</small></div>
        <div class="field"><label for="rgPass2">Confirmar contraseña *</label><input class="in" id="rgPass2" type="password"></div>
        <div class="field full"><label for="rgCo">Empresa (opcional)</label><input class="in" id="rgCo" placeholder="Autos Ejemplo S.L."></div>
      </div>
      <label><input type="checkbox" id="rgOk"> <span style="font-size:13.5px">He leído y acepto las <a class="link" href="#/terminos">condiciones de uso</a> y la <a class="link" href="#/privacidad">política de privacidad</a></span></label>
      <div id="rgErr"></div>
      <button class="btn primary block" id="rgGo">Crear cuenta</button>
      <div class="orline"><span>o continuar con</span></div>
      <button class="btn block" type="button" id="rgGoogle">${ic("globe2", "sm")}Registrarse con Google</button>
    </form>`, `¿Ya tienes cuenta? <a class="link" href="#/login">Iniciar sesión</a>`);
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
  $("#rgGoogle").onclick = () => toast("Google OAuth se conecta en la versión con servidor", "globe2");
  $("#rgGo").onclick = () => {
    const err = m => { $("#rgErr").innerHTML = `<div class="err">${ic("alert", "sm")}${m}</div>`; };
    const n = $("#rgName").value.trim(), l = $("#rgLast").value.trim(), m = $("#rgMail").value.trim(), p = $("#rgPass").value;
    if (!n || !l) return err("Introduce tu nombre y apellidos.");
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(m)) return err("El correo electrónico no es válido.");
    if (strength(p) < 4) return err("La contraseña debe tener 8 caracteres, mayúscula, minúscula y número.");
    if (p !== $("#rgPass2").value) return err("Las contraseñas no coinciden.");
    if (!$("#rgOk").checked) return err("Debes aceptar las condiciones de uso.");
    login({ email: m, name: n + " " + l, role, plan: role === "seller" ? "Vendedor Gratis" : "Comprador Gratis", verified: false, company: $("#rgCo").value.trim(), city: "", phone: "" });
    toast("Cuenta creada. Revisa tu correo para confirmarla.", "check");
    location.hash = "#/verificar-email";
  };
}
function viewForgot() {
  return authShell("Recuperar contraseña", "Te enviamos un enlace para restablecerla", `
    <form onsubmit="return false" style="display:grid;gap:14px">
      <div class="field"><label for="fgMail">Correo electrónico</label><input class="in" id="fgMail" type="email"></div>
      <button class="btn primary block" id="fgGo">Enviar enlace</button>
    </form>`, `<a class="link" href="#/login">Volver a iniciar sesión</a>`);
}
function viewVerifyEmail() {
  return authShell("Confirma tu correo", "Te hemos enviado un enlace de confirmación", `
    <div class="panel" style="display:grid;gap:12px;justify-items:center;text-align:center">
      ${ic("msg", "lg")}<b>Revisa ${S.user ? esc(S.user.email) : "tu bandeja de entrada"}</b>
      <p class="muted" style="margin:0;font-size:13.5px">Haz clic en el enlace del correo para activar la cuenta. ¿No lo encuentras? Mira en spam.</p>
      <button class="btn sm" id="veResend">Reenviar correo</button>
      <button class="btn primary" id="veDone">Ya lo he confirmado</button>
    </div>`, `<a class="link" href="#/">Volver al inicio</a>`);
}
function viewVerification() {
  const v = S.user && S.user.verified;
  const step = v ? 3 : (S.user && S.user.vstep) || 0;
  const steps = [["Documento enviado", "Tu documento ha sido enviado y está siendo procesado"], ["En revisión", "Nuestro equipo está revisando tu verificación"], ["Verificación completa", "Tu identidad ha sido verificada correctamente"]];
  return `<div class="wrap">
    <div class="admin-head"><div><div class="eyebrow">Cuenta</div><h1 style="margin-top:8px">Verificación de identidad</h1><p class="muted" style="margin:6px 0 0">Verifica tu identidad para pujar, publicar vehículos y recibir pagos.</p></div>
      <span class="chip ${v ? "ok" : "warn"}">${v ? "Verificado" : step ? "En progreso" : "Pendiente"}</span></div>
    <div class="form-shell" style="margin-top:0">
      <div class="panel" style="display:grid;gap:18px">
        <div><div style="display:flex;justify-content:space-between;font-size:13px"><b>Progreso de verificación</b><span class="tnum">${v ? 100 : step * 33}%</span></div>
          <div class="bar" style="margin-top:8px"><i style="width:${v ? 100 : step * 33}%"></i></div></div>
        <ol class="vsteps">${steps.map(([t, d], i) => `<li class="${i < step || v ? "done" : i === step ? "now" : ""}"><span class="n">${i < step || v ? ic("check", "sm") : i + 1}</span><div><b>${t}</b><small>${d}</small></div></li>`).join("")}</ol>
        ${v ? `<div class="lead-note win">${ic("check", "sm")}Identidad verificada. Ya puedes pujar y vender.</div>`
          : `<div class="drop" id="vfDrop">${ic("upload", "lg")}<b>Sube tu documento de identidad</b><span style="font-size:13px">DNI, NIE, pasaporte o permiso de conducir · JPG o PDF</span><button class="btn sm primary" id="vfStart">Iniciar verificación con Veriff</button></div>`}
      </div>
      <div class="side-list">
        <div class="panel">${ic("shield", "lg")}<div><b>¿Por qué necesito verificarme?</b><p>Mantiene el mercado seguro y genera confianza entre compradores y vendedores.</p></div></div>
        <div class="panel">${ic("doc", "lg")}<div><b>¿Qué documentos se aceptan?</b><p>Pasaporte, DNI/NIE, permiso de conducir o permiso de residencia.</p></div></div>
        <div class="panel">${ic("lock", "lg")}<div><b>¿Están seguros mis datos?</b><p>Los procesa Veriff, cifrados y conforme al RGPD.</p></div></div>
      </div>
    </div></div>`;
}

/* ---------- public pages that were missing ---------- */
function viewFees() {
  return `<div class="wrap">
  <div class="admin-head"><div><div class="eyebrow">Prima del comprador</div><h1 style="margin-top:8px">Tarifas del comprador</h1><p class="muted" style="margin:6px 0 0;max-width:62ch">Tarifas transparentes basadas en el precio del vehículo. Sin costes ocultos: sabes lo que pagarás antes de pujar.</p></div></div>
  <div class="cats" style="grid-template-columns:repeat(3,1fr)">
    <div class="panel" data-rev>${ic("eye", "lg")}<h3 style="margin:10px 0 6px;font-size:17px">Precios transparentes</h3><p class="muted" style="margin:0;font-size:13.5px">Sabes exactamente lo que pagarás antes de pujar. Sin sorpresas.</p></div>
    <div class="panel" data-rev style="--d:70ms">${ic("euro", "lg")}<h3 style="margin:10px 0 6px;font-size:17px">Tarifas competitivas</h3><p class="muted" style="margin:0;font-size:13.5px">Desde 39 € para vehículos de menos de 500 €.</p></div>
    <div class="panel" data-rev style="--d:140ms">${ic("shield", "lg")}<h3 style="margin:10px 0 6px;font-size:17px">Qué incluye</h3><p class="muted" style="margin:0;font-size:13.5px">Acceso a la plataforma, transacción segura y soporte al comprador.</p></div>
  </div>
  <div class="form-shell" style="margin-top:22px">
    <div class="panel"><h3>${ic("chart")} Calculadora de tarifas</h3>
      <div class="field" style="margin:14px 0"><label for="feeIn">Precio del vehículo</label><div class="money"><span>€</span><input class="in tnum" id="feeIn" type="number" value="3500"></div></div>
      <div id="feeOut"></div>
      <small class="muted">Las tarifas solo se aplican cuando ganas una subasta. Los descuentos de suscripción se aplican automáticamente.</small>
    </div>
    <div class="side-list">
      <div class="estimate"><span class="eyebrow">Con tu plan</span><div class="rng tnum" id="feePlan">—</div><small class="muted" id="feePlanNote">Inicia sesión para ver tu descuento aplicado.</small></div>
      <div class="panel">${ic("alert", "lg")}<div><b>Tarifa de reactivación</b><p>349 € + IVA por incumplir el compromiso de compra.</p></div></div>
    </div>
  </div>
  <section style="margin-top:34px"><div class="sec-head"><div><div class="eyebrow">Tarifas</div><h2 style="margin-top:8px">Honorarios por operación completada</h2><p>Precios sin IVA. No incluyen transporte ni gestoría.</p></div></div>
    <div class="tbl-wrap"><table><thead><tr><th>Precio del vehículo</th><th class="r">Honorarios MotorSubasta</th><th class="r">Pro (−5%)</th><th class="r">Dealer (−10%)</th></tr></thead><tbody>
      ${FEES.map(([a, b, c]) => `<tr><td class="tnum">${num(a)} € – ${num(b)} €</td><td class="r tnum">${c} € + IVA</td><td class="r tnum muted">${Math.round(c * .95)} €</td><td class="r tnum muted">${Math.round(c * .9)} €</td></tr>`).join("")}
      <tr><td>16.000 € +</td><td class="r">2,8% del precio + IVA</td><td class="r muted">2,66%</td><td class="r muted">2,52%</td></tr></tbody></table></div></section>
  <section style="margin-top:28px" class="commit">
    <div><h3 style="font-size:19px;margin-bottom:12px">${ic("doc")} Tarifas servicio gestoría</h3><div class="tbl-wrap"><table><tbody>${GESTORIA.map(([n, p]) => `<tr><td>${n}</td><td class="r tnum">${p} € + IVA</td></tr>`).join("")}</tbody></table></div></div>
    <div><h3 style="font-size:19px;margin-bottom:12px">${ic("msg")} Preguntas frecuentes</h3><div class="faq">
      ${[["¿Qué es la prima del comprador?", "Es el honorario de gestión que cobra MotorSubasta por cada operación completada. Se calcula según el precio de adjudicación."],
        ["¿Cuándo pago la tarifa?", "Solo cuando ganas una subasta y la operación se completa. Si no ganas, no pagas nada."],
        ["¿El IVA está incluido?", "No. Las tarifas se muestran sin IVA; el 21% se añade en la factura."],
        ["¿Hay descuentos para suscriptores?", "Sí: −5% con Comprador Pro y −10% con Comprador Dealer o Combinado Full."],
        ["¿Cómo se calcula en vehículos de alto valor?", "A partir de 16.000 € se aplica el 2,8% del precio de adjudicación."],
        ["¿La tarifa es reembolsable?", "Se devuelve si la operación se cancela por causa del vendedor o si el lote no supera la verificación."]].map(([q, a]) => `<details><summary>${q}${ic("chev", "chev")}</summary><p>${a}</p></details>`).join("")}
    </div></div>
  </section></div>`;
}
function mountFees() {
  const calc = () => {
    const p = +$("#feeIn").value || 0, base = buyerFee(p), iva = base * .21;
    $("#feeOut").innerHTML = `<div class="kv"><span>Tarifa base</span><span class="tnum">${eur(base)}</span></div>
      <div class="kv"><span>IVA (21%)</span><span class="tnum">${eur(iva)}</span></div>
      <div class="kv total"><span>Tarifa total</span><span class="tnum">${eur(base + iva)}</span></div>
      <div class="kv"><span>Precio final con el vehículo</span><span class="tnum">${eur(p + base + iva)}</span></div>`;
    const disc = planDisc();
    $("#feePlan").textContent = eur(base * (1 - disc) * 1.21);
    $("#feePlanNote").textContent = disc ? `Incluye el −${Math.round(disc * 100)}% de tu plan ${S.plan}.` : "Sin descuento: con Comprador Pro ahorrarías un 5%.";
  };
  $("#feeIn").oninput = calc; calc();
}
function viewHowItWorks() {
  const steps = [["El vendedor registra el vehículo", "Fotos, documentación y estado declarado por paneles."],
    ["Revisión del equipo", "Nuestro equipo revisa el anuncio para verificar precisión y completitud."],
    ["Validación de documentación", "Permiso de circulación, ficha técnica e informe DGT."],
    ["Programación de subasta", "El vehículo entra en la categoría y franja horaria que le corresponde."],
    ["Subasta en vivo", "La sesión abre a la hora programada para todos los compradores verificados."],
    ["Pujas en tiempo real", "Los compradores compiten en vivo. Todas las pujas son vinculantes."],
    ["Fin de la subasta", "Cierra la puja. El mejor postor gana si se alcanza la reserva."],
    ["Decisión del vendedor", "Si la puja queda por debajo de la reserva, el vendedor tiene 24 h para aceptar o contraofertar."],
    ["Pago del comprador", "El ganador completa el pago seguro en 48 horas."],
    ["Gestión de documentos", "Nuestra gestoría tramita el cambio de titularidad y el papeleo con la DGT."],
    ["Transporte y entrega", "El vehículo se transporta al comprador. Operación completada."]];
  return `<div class="wrap">
  <div class="admin-head"><div><div class="eyebrow">Cómo funciona</div><h1 style="margin-top:8px">El proceso de subasta, paso a paso</h1><p class="muted" style="margin:6px 0 0;max-width:68ch">Desde la publicación hasta la entrega, un proceso de 11 pasos que mantiene la operación transparente y segura para comprador y vendedor.</p></div></div>
  <ol class="timeline">${steps.map(([t, d], i) => `<li data-rev style="--d:${Math.min(i, 8) * 45}ms"><span class="n">${String(i + 1).padStart(2, "0")}</span><div><b>${t}</b><p>${d}</p></div></li>`).join("")}</ol>
  <div class="commit" style="margin-top:28px">
    <div class="panel" data-rev><h3>${ic("gavel")} Para compradores</h3><ul class="checks">
      <li>${ic("check", "sm")}<span><b>Vendedores verificados.</b> Aseguradoras, flotas y concesionarios.</span></li>
      <li>${ic("check", "sm")}<span><b>Precios competitivos.</b> Mecánica de subasta transparente.</span></li>
      <li>${ic("check", "sm")}<span><b>Contraoferta 24 h.</b> Aunque te superen, el vendedor puede aceptar tu oferta.</span></li>
      <li>${ic("check", "sm")}<span><b>Documentación completa.</b> Historial, informe DGT y evaluación de estado.</span></li></ul></div>
    <div class="panel" data-rev style="--d:80ms"><h3>${ic("store")} Para vendedores</h3><ul class="checks">
      <li>${ic("check", "sm")}<span><b>Compradores cualificados.</b> Cientos de profesionales verificados.</span></li>
      <li>${ic("check", "sm")}<span><b>Maximiza ingresos.</b> La contraoferta incrementa las ventas cerradas.</span></li>
      <li>${ic("check", "sm")}<span><b>Ventas rápidas.</b> Media de 7 días desde la publicación.</span></li>
      <li>${ic("check", "sm")}<span><b>Sin complicaciones.</b> Documentación, transferencia y transporte los gestionamos nosotros.</span></li></ul></div>
  </div>
  <div class="cats" style="grid-template-columns:repeat(3,1fr);margin-top:16px">
    <div class="panel" data-rev style="border-color:color-mix(in srgb,var(--warn) 34%,var(--line))"><span class="chip warn">${ic("alert", "sm")}Importante</span><h3 style="margin:10px 0 6px;font-size:17px">Pujas vinculantes</h3><p class="muted" style="margin:0;font-size:13.5px">Toda puja es una oferta legalmente vinculante. Puja solo si estás listo para comprar.</p></div>
    <div class="panel" data-rev style="--d:70ms"><span class="chip">${ic("clock", "sm")}30 días</span><h3 style="margin:10px 0 6px;font-size:17px">Validez</h3><p class="muted" style="margin:0;font-size:13.5px">Las pujas ganadoras son válidas 30 días para completar pago y transferencia.</p></div>
    <div class="panel" data-rev style="--d:140ms"><span class="chip bad">${ic("euro", "sm")}349 € + IVA</span><h3 style="margin:10px 0 6px;font-size:17px">Incumplimiento</h3><p class="muted" style="margin:0;font-size:13.5px">No completar una compra conlleva tarifa de reactivación de cuenta.</p></div>
  </div>
  <div class="panel" data-rev style="margin-top:24px;display:flex;gap:18px;align-items:center;justify-content:space-between;flex-wrap:wrap;background:linear-gradient(120deg,var(--accent-soft),var(--surface) 62%)">
    <div><h2 style="font-size:24px;letter-spacing:-.03em">¿Listo para empezar?</h2><p class="muted" style="margin:6px 0 0">Únete a los profesionales que ya compran y venden en MotorSubasta.</p></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn primary" href="#/registro">Crear cuenta gratis</a><a class="btn" href="#/subastas">Ver subastas</a></div>
  </div></div>`;
}
function viewFaq() {
  const groups = [["Pujas", [["¿Cómo hago una puja?", "Entra en el lote, elige el importe (o usa los botones rápidos +50 / +100 / +200) y confirma. Si la sesión aún no ha abierto, tu puja queda registrada como puja anticipada."],
    ["¿Qué es la puja automática?", "Fijas tu máximo y el sistema puja por ti el mínimo necesario para mantenerte en cabeza, sin revelar tu límite."],
    ["¿Qué pasa si pujo en el último minuto?", "Cualquier puja en los dos últimos minutos amplía el cierre dos minutos (anti-sniping), para que todos puedan responder."],
    ["¿Puedo retirar una puja?", "No. Las pujas son vinculantes durante 30 días naturales."]]],
    ["Vender", [["¿Cómo publico un vehículo?", "Desde Publicar vehículo: datos del coche, condición por panel, fotos y tipo de publicación (subasta o mercado). Nuestro equipo lo revisa antes de programarlo."],
      ["¿Cuáles son las comisiones de venta?", "Según plan: 3% en Vendedor Gratis, 2% en Pro y 1,5% en Dealer/Full, sobre el precio de adjudicación."],
      ["¿Puedo poner precio de reserva?", "Sí. Si la puja no llega a la reserva, decides en 24 h si aceptas, rechazas o contraofertas."]]],
    ["Pagos y cuenta", [["¿Qué métodos de pago se aceptan?", "Transferencia SEPA y tarjeta. Las empresas pueden domiciliar la suscripción."],
      ["¿Cuándo cobro como vendedor?", "Cuando el comprador paga, los fondos se transfieren a tu cuenta menos la comisión de plataforma."],
      ["¿Por qué debería suscribirme?", "Los planes incluyen puja automática, alertas, Ofertas Ocultas y un descuento en la comisión de compra."],
      ["¿Puedo cancelar en cualquier momento?", "Sí. El plan sigue activo hasta el final del periodo pagado y no se renueva."]]]];
  return `<div class="wrap">
  <div class="admin-head"><div><div class="eyebrow">Centro de ayuda</div><h1 style="margin-top:8px">Preguntas frecuentes</h1><p class="muted" style="margin:6px 0 0">Respuestas sobre la plataforma, las subastas y los servicios.</p></div>
    <div class="search" style="max-width:320px">${ic("search")}<input class="in" id="faqQ" placeholder="Buscar en la ayuda…" aria-label="Buscar en la ayuda"></div></div>
  <div id="faqBody">${groups.map(([g, items]) => `<section class="faqgroup"><h2>${g}</h2><div class="faq">${items.map(([q, a]) => `<details><summary>${q}${ic("chev", "chev")}</summary><p>${a}</p></details>`).join("")}</div></section>`).join("")}</div>
  <div class="panel" style="margin-top:24px;display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap">
    <div><b>¿Aún tienes preguntas?</b><p class="muted" style="margin:4px 0 0;font-size:13.5px">Escríbenos y te respondemos lo antes posible.</p></div>
    <div style="display:flex;gap:10px"><a class="btn" href="mailto:info@motorsubasta.com">info@motorsubasta.com</a><a class="btn primary" href="#/contacto">Contactar</a></div>
  </div></div>`;
}
function mountFaq() {
  $("#faqQ").oninput = e => {
    const q = e.target.value.toLowerCase();
    $$("#faqBody details").forEach(d => { d.hidden = q && !d.textContent.toLowerCase().includes(q); });
    $$("#faqBody .faqgroup").forEach(g => { g.hidden = ![...g.querySelectorAll("details")].some(d => !d.hidden); });
  };
}
function viewContact() {
  return `<div class="wrap">
  <div class="admin-head"><div><div class="eyebrow">Contacto</div><h1 style="margin-top:8px">¿Hablamos?</h1><p class="muted" style="margin:6px 0 0">¿Tienes alguna pregunta o sugerencia? Escríbenos y te responderemos pronto.</p></div></div>
  <div class="form-shell" style="margin-top:0">
    <form class="panel" onsubmit="return false" style="display:grid;gap:14px">
      <div class="fgrid">
        <div class="field"><label for="coName">Nombre *</label><input class="in" id="coName" value="${isLogged() ? esc(S.user.name) : ""}"></div>
        <div class="field"><label for="coMail">Email *</label><input class="in" id="coMail" type="email" value="${isLogged() ? esc(S.user.email) : ""}"></div>
        <div class="field"><label for="coTel">Teléfono (opcional)</label><input class="in" id="coTel"></div>
        <div class="field"><label for="coSub">Asunto *</label><select class="in" id="coSub"><option>Consulta general</option><option>Soporte técnico</option><option>Colaboración / partnership</option><option>Prensa</option><option>Otro</option></select></div>
        <div class="field full"><label for="coMsg">Mensaje *</label><textarea class="in" id="coMsg" style="min-height:150px"></textarea></div>
      </div>
      <button class="btn primary" id="coGo">Enviar mensaje</button>
    </form>
    <div class="side-list">
      <div class="panel">${ic("msg", "lg")}<div><b>info@motorsubasta.com</b><p>Respuesta en 24 h laborables.</p></div></div>
      <div class="panel">${ic("bell", "lg")}<div><b>+34 900 000 000</b><p>L–V de 9:00 a 18:00 CET.</p></div></div>
      <div class="panel">${ic("pin", "lg")}<div><b>Alicante, España</b><p>Visitas con cita previa.</p></div></div>
      <div class="panel">${ic("truck", "lg")}<div><b>¿Vendes flota?</b><p>Escríbenos para condiciones de volumen y recogida.</p></div></div>
    </div>
  </div></div>`;
}
function viewLegal(kind) {
  const terms = [["Objeto", "Estas condiciones regulan el acceso y uso de la plataforma MotorSubasta, que pone en contacto a vendedores de vehículos con compradores profesionales en España."],
    ["Cuentas y verificación", "Para pujar o publicar es obligatorio registrarse y superar la verificación de identidad. La cuenta es personal e intransferible."],
    ["Carácter vinculante de las pujas", "Toda puja constituye una oferta de compra vinculante durante 30 días naturales. No puede retirarse ni cancelarse."],
    ["Adjudicación y aceptación", "Si el lote tiene reserva, el vendedor dispone de 24 horas para aceptar, rechazar o contraofertar la mejor puja."],
    ["Pago y plazos", "El comprador dispone de 48–72 horas para completar el pago. La retirada se coordina con el vendedor en 3–10 días laborables."],
    ["Incumplimiento", "El impago o la no retirada conllevan penalización, posible bloqueo de cuenta y una tarifa de reactivación de 349 € + IVA. La operación puede ofrecerse al segundo mejor postor."],
    ["Estado de los vehículos", "La información la aporta el vendedor. MotorSubasta verifica la documentación y publica la evaluación por paneles, sin garantizar vicios ocultos salvo lo previsto por ley."],
    ["Comisiones", "Las comisiones aplicables son las publicadas en la página de tarifas en el momento de la adjudicación."],
    ["Ley aplicable", "Estas condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados de Alicante."]];
  const priv = [["Responsable", "MotorSubasta, con domicilio en Alicante (España), correo info@motorsubasta.com."],
    ["Datos que tratamos", "Datos identificativos y de contacto, datos de empresa (CIF, dirección fiscal), documento de identidad para la verificación, y datos de uso de la plataforma."],
    ["Finalidades", "Gestionar tu cuenta y las operaciones de compraventa, verificar la identidad, emitir facturas, prevenir el fraude y enviarte avisos de subastas."],
    ["Base jurídica", "Ejecución del contrato, cumplimiento de obligaciones legales e interés legítimo en la prevención del fraude."],
    ["Encargados", "Veriff (verificación de identidad), proveedor de pagos, proveedor de correo y hosting en la UE. Todos con contrato de encargo de tratamiento."],
    ["Conservación", "Mientras la cuenta esté activa y después durante los plazos legales de facturación y responsabilidad."],
    ["Tus derechos", "Acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a info@motorsubasta.com. También puedes reclamar ante la AEPD."],
    ["Cookies", "Usamos cookies técnicas necesarias y, con tu consentimiento, cookies de medición. Puedes cambiar tu elección en cualquier momento."]];
  const bid = [["Qué significa pujar", "Una puja es un compromiso real de compra, no una expresión de interés."],
    ["Incrementos", "El incremento mínimo depende del tramo de precio: 25 € hasta 1.000 €, 50 € hasta 5.000 €, 100 € hasta 15.000 € y 250 € por encima."],
    ["Anti-sniping", "Una puja en los dos últimos minutos amplía el cierre dos minutos."],
    ["Puja anticipada", "Antes de que abra la sesión puedes dejar tu puja; se aplica automáticamente al abrir."],
    ["Puja automática", "Fijas un máximo y el sistema puja por ti el mínimo necesario."],
    ["Sin reserva", "Los lotes marcados «sin reserva» se adjudican al mejor postor, sea cual sea el importe."]];
  const sets = { terminos: ["Condiciones de uso", terms], privacidad: ["Política de privacidad", priv], "condiciones-puja": ["Condiciones de puja", bid] };
  const [title, items] = sets[kind] || sets.terminos;
  return `<div class="wrap legal">
    <div class="admin-head"><div><div class="eyebrow">Legal</div><h1 style="margin-top:8px">${title}</h1><p class="muted" style="margin:6px 0 0">Última actualización: 6 de octubre de 2026</p></div>
      <div class="seg"><a class="btn xs ghost" href="#/terminos">Condiciones</a><a class="btn xs ghost" href="#/privacidad">Privacidad</a><a class="btn xs ghost" href="#/condiciones-puja">Puja</a></div></div>
    <div class="form-shell" style="margin-top:0">
      <div class="panel" style="display:grid;gap:20px">${items.map(([t, d], i) => `<section id="s${i}"><h3 style="font-size:17px;margin-bottom:6px">${i + 1}. ${t}</h3><p class="muted" style="margin:0;max-width:70ch">${d}</p></section>`).join("")}</div>
      <div class="side-list" style="position:sticky;top:78px"><div class="panel"><div class="lbl" style="margin-bottom:8px">En esta página</div><div style="display:grid;gap:7px">${items.map(([t], i) => `<a class="link" style="font-size:13px" href="#s${i}">${i + 1}. ${t}</a>`).join("")}</div></div></div>
    </div></div>`;
}
function viewHidden() {
  const locked = !/Dealer|Full/.test(S.plan);
  const list = lots.filter(l => l.cat === "oculta").concat(lots.slice(0, 6));
  return `<div class="wrap">
  <div class="admin-head"><div><div class="eyebrow" style="color:var(--vip)">Acceso premium</div><h1 style="margin-top:8px">Ofertas ocultas</h1><p class="muted" style="margin:6px 0 0;max-width:64ch">Oportunidades exclusivas por debajo de mercado para suscriptores Dealer y Combinado Full.</p></div>
    <span class="chip ${locked ? "vip" : "ok"}">${locked ? "Bloqueado con tu plan" : "Acceso activo"}</span></div>
  ${locked ? `<div class="panel" style="display:flex;gap:18px;align-items:center;justify-content:space-between;flex-wrap:wrap;background:linear-gradient(120deg,var(--vip-soft),var(--surface) 62%);margin-bottom:16px">
    <div style="display:flex;gap:14px;align-items:center">${ic("lock", "lg")}<div><b>Desbloquea ${list.length} lotes exclusivos</b><p class="muted" style="margin:4px 0 0;font-size:13.5px">Con Comprador Dealer (99,99 €/mes) o Combinado Full.</p></div></div>
    <a class="btn primary" href="#/precios">Ver planes</a></div>` : ""}
  <div class="grid">${list.map((l, i) => lotCard(l, i)).join("")}</div></div>`;
}
