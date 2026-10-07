/* ============================================================
   v12 — Contrato de compraventa de vehículo (gratis)
   Formulario guiado · validación DNI/NIE/CIF/VIN · importe en letras
   firma en pantalla · PDF con fuente Unicode · copia traducida
   Nada sale del navegador: el borrador vive en este dispositivo.
   ============================================================ */

Object.assign(P, {
  pen: '<path d="M12 20h9"/><path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7.4 18.6a2 2 0 0 1-.9.5l-2.9.8.8-2.9a2 2 0 0 1 .5-.9z"/>',
  download: '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
});

/* ---------- datos de referencia ---------- */
const CV_PROV = ["Álava", "Albacete", "Alicante", "Almería", "Ávila", "Badajoz", "Illes Balears", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Castellón",
  "Ciudad Real", "Córdoba", "A Coruña", "Cuenca", "Girona", "Granada", "Guadalajara", "Gipuzkoa", "Huelva", "Huesca", "Jaén", "León", "Lleida", "La Rioja",
  "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Ourense", "Asturias", "Palencia", "Las Palmas", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife",
  "Cantabria", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Bizkaia", "Zamora", "Zaragoza", "Ceuta", "Melilla"];
/* el código postal empieza por el código INE de la provincia (01 … 52), que es el orden de la lista */
const cvProvFromCP = cp => { const n = +String(cp).slice(0, 2); return /^\d{5}$/.test(cp) && n >= 1 && n <= 52 ? CV_PROV[n - 1] : ""; };
const CV_MAKES = ["Abarth", "Alfa Romeo", "Audi", "BMW", "BYD", "Citroën", "Cupra", "Dacia", "DS", "Fiat", "Ford", "Honda", "Hyundai", "Iveco", "Jaguar", "Jeep",
  "Kia", "Land Rover", "Lexus", "Mazda", "Mercedes-Benz", "MG", "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot", "Porsche", "Renault", "SEAT", "Škoda",
  "Smart", "SsangYong", "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo", "Yamaha", "Kawasaki", "Piaggio", "DAF", "MAN", "Scania"];
const CV_FUEL = ["Gasolina", "Diésel", "Híbrido", "Híbrido enchufable", "Eléctrico", "GLP", "GNC"];

/* textos del contrato: plantillas con {campos}. Son también las claves de traducción. */
const CVX = {
  title: "CONTRATO DE COMPRAVENTA DE VEHÍCULO USADO",
  place: "En {lugar}, a {fecha}.",
  reunidos: "REUNIDOS",
  selPart: "De una parte, como VENDEDOR, D./Dña. {nombre}, mayor de edad, con {docTipo} n.º {doc} y domicilio en {dom}, {cp} {mun} ({prov}).",
  selEmp: "De una parte, como VENDEDOR, la entidad {razon}, con CIF {cif} y domicilio social en {dom}, {cp} {mun} ({prov}), representada por D./Dña. {rep}, con DNI/NIE {repDoc}, en calidad de {cargo}.",
  comPart: "Y de otra parte, como COMPRADOR, D./Dña. {nombre}, mayor de edad, con {docTipo} n.º {doc} y domicilio en {dom}, {cp} {mun} ({prov}).",
  comEmp: "Y de otra parte, como COMPRADOR, la entidad {razon}, con CIF {cif} y domicilio social en {dom}, {cp} {mun} ({prov}), representada por D./Dña. {rep}, con DNI/NIE {repDoc}, en calidad de {cargo}.",
  capacidad: "Ambas partes se reconocen mutuamente la capacidad legal necesaria para otorgar el presente contrato de compraventa, que se regirá por las siguientes",
  clausulas: "CLÁUSULAS",
  ord: ["PRIMERA", "SEGUNDA", "TERCERA", "CUARTA", "QUINTA", "SEXTA", "SÉPTIMA", "OCTAVA", "NOVENA", "DÉCIMA"],
  hObjeto: "Objeto", hPrecio: "Precio y forma de pago", hEstado: "Estado del vehículo", hCargas: "Titularidad y cargas",
  hEntrega: "Entrega y responsabilidad", hTransf: "Transferencia, impuestos y gastos", hSeguro: "Seguro", hOtras: "Otras condiciones", hLey: "Ley aplicable y jurisdicción",
  objeto: "El VENDEDOR vende al COMPRADOR, que compra, el vehículo de su propiedad que se describe a continuación:",
  vMarca: "Marca", vModelo: "Modelo", vMat: "Matrícula", vVin: "N.º de bastidor (VIN)", vFmat: "Primera matriculación", vKm: "Kilometraje", vColor: "Color", vComb: "Combustible",
  precio: "El precio de la compraventa se fija en {precio} €{letras}, que el COMPRADOR abona mediante {forma}.",
  senal: "De dicho importe, el VENDEDOR reconoce haber recibido con anterioridad {senal} € en concepto de señal.",
  recibo: "El VENDEDOR declara recibido el precio en su totalidad, sirviendo el presente documento como la más eficaz carta de pago.",
  estado: "El COMPRADOR declara haber examinado el vehículo y lo acepta en el estado de uso y conservación en que se encuentra, que conoce.",
  danos: "El VENDEDOR ha informado de los siguientes daños o defectos, que el COMPRADOR acepta: {danos}.",
  km: "El VENDEDOR declara que el kilometraje indicado es, a su leal saber y entender, el real.",
  vicios: "Todo ello sin perjuicio del saneamiento por vicios ocultos previsto en los artículos 1484 y siguientes del Código Civil.",
  sinGar: "Las partes pactan expresamente que la venta se realiza sin garantía, con renuncia del COMPRADOR a reclamar por vicios o defectos del vehículo, salvo los que el VENDEDOR hubiera ocultado de mala fe.",
  consumo: "Al tratarse de la venta de un profesional a un consumidor, el vehículo cuenta con la garantía legal prevista en el texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios.",
  cargas: "El VENDEDOR declara ser el único propietario del vehículo, que se encuentra libre de cargas, gravámenes, embargos y reservas de dominio, y al corriente del pago del Impuesto sobre Vehículos de Tracción Mecánica. Responderá de cualquier deuda, sanción o carga anterior a la entrega.",
  entrega: "El vehículo se entrega el {fecha} a las {hora} horas, junto con {llaves} llave(s) y la siguiente documentación: {docs}.",
  resp: "Desde ese momento el COMPRADOR asume la responsabilidad por las infracciones, sanciones, daños y cualquier otra obligación derivada de la tenencia y el uso del vehículo.",
  transf: "El VENDEDOR notificará la venta a la Dirección General de Tráfico en el plazo de diez días. El COMPRADOR solicitará el cambio de titularidad en el plazo de treinta días, conforme al Reglamento General de Vehículos, y liquidará el impuesto que corresponda.",
  gComprador: "Los gastos de la transferencia, impuestos y tasas serán a cargo del COMPRADOR.",
  gVendedor: "Los gastos de la transferencia, impuestos y tasas serán a cargo del VENDEDOR.",
  gMitad: "Los gastos de la transferencia, impuestos y tasas se abonarán por mitad entre ambas partes.",
  seguro: "El COMPRADOR no circulará con el vehículo sin haber contratado previamente el seguro obligatorio.",
  ley: "El presente contrato se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales que resulten competentes conforme a la ley.",
  cierre: "Y en prueba de conformidad, las partes firman el presente contrato por duplicado y a un solo efecto, en el lugar y la fecha indicados.",
  fSel: "EL VENDEDOR", fCom: "EL COMPRADOR",
  pie: "Modelo orientativo generado gratis con MotorSubasta · motorsubasta.com",
  pag: "Página {n} de {total}",
  copia: "Traducción de cortesía sin valor legal. En caso de discrepancia prevalece el texto en español.",
  formas: { transferencia: "transferencia bancaria", efectivo: "pago en efectivo", bizum: "Bizum", cheque: "cheque bancario", financiacion: "financiación" },
  docsTxt: { permiso: "permiso de circulación", ficha: "tarjeta de inspección técnica (ficha técnica)", ivtm: "último recibo del impuesto de circulación", itv: "informe de la última ITV", manual: "manual y libro de mantenimiento" },
  sinDocs: "sin documentación adicional",
};

/* ---------- importe en letras (castellano) ---------- */
function numToEs(n) {
  const U = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis",
    "diecisiete", "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];
  const D = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  const C = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];
  const lt100 = x => x < 30 ? U[x] : D[Math.floor(x / 10)] + (x % 10 ? " y " + U[x % 10] : "");
  const lt1000 = x => x === 100 ? "cien" : [C[Math.floor(x / 100)], x % 100 ? lt100(x % 100) : ""].filter(Boolean).join(" ");
  const apoc = s => s.replace(/veintiuno$/, "veintiún").replace(/(^|\s)uno$/, "$1un");
  if (!n) return "cero";
  const m = Math.floor(n / 1e6), t = Math.floor(n % 1e6 / 1000), r = n % 1000, out = [];
  if (m) out.push(m === 1 ? "un millón" : apoc(lt1000(m)) + " millones");
  if (t) out.push(t === 1 ? "mil" : apoc(lt1000(t)) + " mil");
  if (r) out.push(lt1000(r));
  return out.join(" ");
}
function eurosEnLetras(v) {
  if (!(v >= 0) || v >= 1e9) return "";
  const e = Math.floor(v + 1e-9), c = Math.round((v - e) * 100);
  const apoc = s => s.replace(/veintiuno$/, "veintiún").replace(/(^|\s)uno$/, "$1un");
  let w = apoc(numToEs(e));
  if (e >= 1e6 && e % 1e6 === 0) w += " de";
  w += e === 1 ? " euro" : " euros";
  if (c) w += " con " + apoc(numToEs(c)) + (c === 1 ? " céntimo" : " céntimos");
  return w;
}

/* ---------- validadores ---------- */
function cvDocOk(type, raw) {
  const v = String(raw || "").toUpperCase().replace(/[\s.\-]/g, "");
  if (!v) return null;
  const L = "TRWAGMYFPDXBNJZSQVHLCKE";
  if (type === "DNI") { const m = v.match(/^(\d{8})([A-Z])$/); return !!m && L[+m[1] % 23] === m[2]; }
  if (type === "NIE") { const m = v.match(/^([XYZ])(\d{7})([A-Z])$/); return !!m && L[+("XYZ".indexOf(m[1]) + m[2]) % 23] === m[3]; }
  if (type === "CIF") {
    const m = v.match(/^([ABCDEFGHJNPQRSUVW])(\d{7})([0-9A-J])$/); if (!m) return false;
    let a = 0, b = 0;
    for (let i = 0; i < 7; i++) { const d = +m[2][i]; if (i % 2 === 0) { const x = d * 2; b += Math.floor(x / 10) + x % 10; } else a += d; }
    const ctrl = (10 - (a + b) % 10) % 10, ch = "JABCDEFGHI"[ctrl];
    if ("PQRSNW".includes(m[1])) return m[3] === ch;
    if ("ABEH".includes(m[1])) return m[3] === String(ctrl);
    return m[3] === String(ctrl) || m[3] === ch;
  }
  if (type === "PAS") return /^[A-Z0-9]{5,15}$/.test(v);
  return true;
}
/* DNI o NIE sin decir cuál: lo deduce por la primera letra */
const cvDniNieOk = v => { const s = String(v || "").toUpperCase(); return /^[XYZ]/.test(s) ? cvDocOk("NIE", s) : cvDocOk("DNI", s); };
function cvPlateOk(raw) {
  const v = String(raw || "").toUpperCase().replace(/[\s\-]/g, "");
  if (!v) return null;
  return /^\d{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$/.test(v) || /^[A-Z]{1,2}\d{4}[A-Z]{0,2}$/.test(v) || /^(E|H|R|C|S|P|T|V)\d{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$/.test(v);
}
function cvVinOk(raw) {
  const v = String(raw || "").toUpperCase().replace(/\s/g, "");
  if (!v) return null;
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(v);
}
const cvFmtPlate = s => { const v = String(s || "").toUpperCase().replace(/[\s\-]/g, ""); const m = v.match(/^(\d{4})([A-Z]{3})$/); return m ? m[1] + " " + m[2] : v; };

/* ---------- estado ---------- */
const cvToday = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const cvNowHM = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
function cvParty() { return { tipo: "particular", nombre: "", docTipo: "DNI", doc: "", dom: "", cp: "", mun: "", prov: "", tel: "", email: "", razon: "", cif: "", rep: "", repDoc: "", cargo: "administrador" }; }
function cvDefaults() {
  return {
    v: 1, sel: cvParty(), com: cvParty(),
    veh: { marca: "", modelo: "", matricula: "", vin: "", fmat: "", km: "", color: "", comb: "Gasolina", llaves: "2" },
    pago: { precio: "", forma: "transferencia", senal: "", gastos: "comprador" },
    entrega: { fecha: cvToday(), hora: cvNowHM() },
    estado: { danos: false, danosTxt: "", sinGar: false },
    docs: { permiso: true, ficha: true, ivtm: true, itv: true, manual: false },
    extra: "", lugar: "", fecha: cvToday(), copia: true, recordar: true,
  };
}
function cvMerge(base, saved) {
  if (!saved || typeof saved !== "object") return base;
  for (const k of Object.keys(base)) {
    if (saved[k] == null) continue;
    base[k] = base[k] && typeof base[k] === "object" && !Array.isArray(base[k]) ? cvMerge(base[k], saved[k]) : saved[k];
  }
  return base;
}
var CV = null, CV_SIG = { sel: null, com: null }, CV_PREV = "es", CV_REF = null;
function cvState() {
  if (!CV) {
    CV = cvMerge(cvDefaults(), store.get("contrato", null));
    if (!CV.entrega.fecha) CV.entrega.fecha = cvToday();
    if (!CV.fecha) CV.fecha = cvToday();
  }
  if (!CV_REF) CV_REF = "CV-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  return CV;
}
const cvGet = p => p.split(".").reduce((o, k) => o == null ? o : o[k], cvState());
function cvSet(p, v) { const ks = p.split("."), last = ks.pop(); ks.reduce((o, k) => o[k], cvState())[last] = v; }
let cvSaveT = 0;
function cvSave() {
  clearTimeout(cvSaveT);
  cvSaveT = setTimeout(() => {
    if (CV.recordar) store.set("contrato", CV); else store.set("contrato", null);
    const s = $("#cvSaved"); if (s) { s.classList.add("on"); clearTimeout(s._t); s._t = setTimeout(() => s.classList.remove("on"), 1400); }
  }, 350);
}

/* ---------- campos obligatorios y avisos ---------- */
function cvRequired() {
  const c = cvState(), r = [];
  for (const side of ["sel", "com"]) {
    const p = c[side];
    if (p.tipo === "empresa") r.push([side + ".razon", p.razon], [side + ".cif", p.cif], [side + ".rep", p.rep]);
    else r.push([side + ".nombre", p.nombre], [side + ".doc", p.doc]);
    r.push([side + ".dom", p.dom], [side + ".mun", p.mun]);
  }
  r.push(["veh.marca", c.veh.marca], ["veh.modelo", c.veh.modelo], ["veh.matricula", c.veh.matricula], ["veh.vin", c.veh.vin], ["pago.precio", c.pago.precio], ["lugar", c.lugar]);
  return r;
}
function cvWarnings() {
  const c = cvState(), w = {};
  for (const side of ["sel", "com"]) {
    const p = c[side];
    if (p.tipo === "particular" && p.doc && cvDocOk(p.docTipo, p.doc) === false) w[side + ".doc"] = p.docTipo === "PAS" ? "Revisa el número de pasaporte" : `La letra no cuadra con el número de ${p.docTipo}`;
    if (p.tipo === "empresa" && p.cif && cvDocOk("CIF", p.cif) === false) w[side + ".cif"] = "El dígito de control del CIF no es correcto";
    if (p.tipo === "empresa" && p.repDoc && cvDniNieOk(p.repDoc) === false) w[side + ".repDoc"] = "Revisa el DNI o NIE";
    if (p.cp && !/^\d{5}$/.test(p.cp)) w[side + ".cp"] = "El código postal tiene 5 cifras";
    if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) w[side + ".email"] = "Revisa el email";
  }
  if (c.veh.matricula && cvPlateOk(c.veh.matricula) === false) w["veh.matricula"] = "Formato no habitual (ej. 1234 BCD o A-1234-AB)";
  if (c.veh.vin && cvVinOk(c.veh.vin) === false) w["veh.vin"] = "El bastidor tiene 17 caracteres y no usa I, O ni Q";
  const pr = +c.pago.precio;
  if (c.pago.precio && !(pr > 0)) w["pago.precio"] = "Indica un importe válido";
  if (c.pago.senal && +c.pago.senal > pr) w["pago.senal"] = "La señal no puede superar el precio";
  if (c.pago.forma === "efectivo" && pr >= 1000 && (c.sel.tipo === "empresa" || c.com.tipo === "empresa"))
    w["pago.forma"] = "Si interviene una empresa o profesional, el pago en efectivo debe ser inferior a 1.000 €";
  return w;
}
const cvProConsumer = () => { const c = cvState(); return c.sel.tipo === "empresa" && c.com.tipo === "particular"; };

/* ---------- contenido del contrato (uno solo para vista previa, PDF y copia traducida) ---------- */
const CV_HOLE_A = "\u0001", CV_HOLE_B = "\u0002";
function cvBlocks(lang) {
  const c = cvState(), es = !lang || lang === "es";
  const T = (s, vars) => { let out = es || typeof tr !== "function" ? s : tr(s, null, lang); if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m); return out.replace(/([^.])\.\.(?!\.)/g, "$1."); };
  const hole = label => CV_HOLE_A + (es ? label : T(label)) + CV_HOLE_B;
  const val = (x, label) => String(x == null ? "" : x).trim() ? String(x).trim() : hole(label);
  const loc = (window.LANG_LOCALE && !es ? LANG_LOCALE[lang] : "es-ES") || "es-ES";
  const fDate = d => { if (!d) return hole("fecha"); const [y, m, dd] = d.split("-").map(Number); return new Date(y, m - 1, dd).toLocaleDateString(loc, { day: "numeric", month: "long", year: "numeric" }); };
  const money = v => (+v).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" });
  const party = (side, key) => {
    const p = c[side], emp = p.tipo === "empresa";
    const docName = { DNI: "DNI", NIE: "NIE", PAS: es ? "pasaporte" : T("pasaporte") }[p.docTipo] || "DNI";
    return T(CVX[key + (emp ? "Emp" : "Part")], {
      nombre: val(p.nombre, "nombre y apellidos"), docTipo: docName, doc: val(String(p.doc).toUpperCase(), "documento"),
      razon: val(p.razon, "razón social"), cif: val(String(p.cif).toUpperCase(), "CIF"), rep: val(p.rep, "representante"),
      repDoc: val(String(p.repDoc).toUpperCase(), "DNI/NIE"), cargo: val(es ? p.cargo : T(p.cargo || ""), "cargo"),
      dom: val(p.dom, "domicilio"), cp: p.cp || "", mun: val(p.mun, "municipio"), prov: val(p.prov, "provincia"),
    }).replace(/,\s+(?=\S)/g, ", ").replace(/ \(\)/, "").replace(/\s{2,}/g, " ");
  };
  const B = [];
  B.push({ t: "title", s: T(CVX.title) });
  B.push({ t: "place", s: T(CVX.place, { lugar: val(c.lugar, "lugar"), fecha: fDate(c.fecha) }) });
  B.push({ t: "h", s: T(CVX.reunidos), center: true });
  B.push({ t: "p", s: party("sel", "sel") });
  B.push({ t: "p", s: party("com", "com") });
  B.push({ t: "p", s: T(CVX.capacidad) });
  B.push({ t: "h", s: T(CVX.clausulas), center: true });
  let n = 0; const H = k => ({ t: "h", s: T(CVX.ord[n++]) + ". " + T(CVX[k]) });

  B.push(H("hObjeto"));
  B.push({ t: "p", s: T(CVX.objeto) });
  const v = c.veh;
  B.push({ t: "kv", rows: [
    [T(CVX.vMarca), val(v.marca, "marca")], [T(CVX.vModelo), val(v.modelo, "modelo")],
    [T(CVX.vMat), val(cvFmtPlate(v.matricula), "matrícula")], [T(CVX.vVin), val(String(v.vin).toUpperCase(), "bastidor")],
    [T(CVX.vFmat), v.fmat ? fDate(v.fmat) : "—"], [T(CVX.vKm), v.km ? (+v.km).toLocaleString("es-ES") + " km" : "—"],
    [T(CVX.vColor), v.color || "—"], [T(CVX.vComb), es ? v.comb : T(v.comb)],
  ] });

  B.push(H("hPrecio"));
  const pr = +c.pago.precio;
  const letras = es && pr > 0 ? " (" + eurosEnLetras(pr) + ")" : "";
  B.push({ t: "p", s: T(CVX.precio, { precio: pr > 0 ? money(pr) : hole("importe"), letras, forma: T(CVX.formas[c.pago.forma] || CVX.formas.transferencia) }) });
  if (+c.pago.senal > 0) B.push({ t: "p", s: T(CVX.senal, { senal: money(+c.pago.senal) }) });
  B.push({ t: "p", s: T(CVX.recibo) });

  B.push(H("hEstado"));
  B.push({ t: "p", s: T(CVX.estado) });
  if (c.estado.danos) B.push({ t: "p", s: T(CVX.danos, { danos: val(c.estado.danosTxt.replace(/\s+/g, " ").replace(/\.$/, ""), "daños conocidos") }) });
  B.push({ t: "p", s: T(CVX.km) });
  B.push({ t: "p", s: T(cvProConsumer() ? CVX.consumo : c.estado.sinGar ? CVX.sinGar : CVX.vicios) });

  B.push(H("hCargas"));
  B.push({ t: "p", s: T(CVX.cargas) });

  B.push(H("hEntrega"));
  const docs = Object.keys(CVX.docsTxt).filter(k => c.docs[k]).map(k => T(CVX.docsTxt[k]));
  const docsTxt = docs.length ? (docs.length > 1 ? docs.slice(0, -1).join(", ") + (es ? " y " : ", ") + docs.slice(-1) : docs[0]) : T(CVX.sinDocs);
  B.push({ t: "p", s: T(CVX.entrega, { fecha: fDate(c.entrega.fecha), hora: c.entrega.hora || hole("hora"), llaves: c.veh.llaves || "1", docs: docsTxt }) });
  B.push({ t: "p", s: T(CVX.resp) });

  B.push(H("hTransf"));
  B.push({ t: "p", s: T(CVX.transf) });
  B.push({ t: "p", s: T({ comprador: CVX.gComprador, vendedor: CVX.gVendedor, mitad: CVX.gMitad }[c.pago.gastos] || CVX.gComprador) });

  B.push(H("hSeguro"));
  B.push({ t: "p", s: T(CVX.seguro) });

  if (c.extra.trim()) { B.push(H("hOtras")); B.push({ t: "p", s: c.extra.trim(), user: true }); }

  B.push(H("hLey"));
  B.push({ t: "p", s: T(CVX.ley) });
  B.push({ t: "p", s: T(CVX.cierre) });
  const who = side => { const p = c[side]; return p.tipo === "empresa" ? [p.razon, p.rep && (p.rep + (p.repDoc ? " · " + String(p.repDoc).toUpperCase() : ""))].filter(Boolean).join("\n") : [p.nombre, p.doc && String(p.doc).toUpperCase()].filter(Boolean).join(" · "); };
  B.push({ t: "sig", sel: { label: T(CVX.fSel), who: who("sel"), img: CV_SIG.sel }, com: { label: T(CVX.fCom), who: who("com"), img: CV_SIG.com } });
  return B;
}

/* vista previa: misma estructura, huecos resaltados */
function cvPreviewHTML(lang) {
  const holes = s => esc(s).replace(new RegExp(CV_HOLE_A + "([^" + CV_HOLE_B + "]*)" + CV_HOLE_B, "g"), '<mark>$1</mark>');
  return cvBlocks(lang).map(b => {
    if (b.t === "title") return `<h4 class="cvt">${holes(b.s)}</h4>`;
    if (b.t === "place") return `<p class="cvplace">${holes(b.s)}</p>`;
    if (b.t === "h") return `<h5 class="${b.center ? "c" : ""}">${holes(b.s)}</h5>`;
    if (b.t === "p") return `<p>${holes(b.s)}</p>`;
    if (b.t === "kv") return `<table class="cvkv">${b.rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${holes(v)}</td></tr>`).join("")}</table>`;
    if (b.t === "sig") return `<div class="cvsigs">${["sel", "com"].map(k => `<div><span class="lab">${esc(b[k].label)}</span>${b[k].img ? `<img src="${b[k].img}" alt="">` : '<i class="line"></i>'}<small>${esc(b[k].who || "")}</small></div>`).join("")}</div>`;
    return "";
  }).join("");
}

/* ---------- vista ---------- */
function cvField(path, label, o = {}) {
  const id = "cv_" + path.replace(/\./g, "_"), v = cvGet(path);
  const attrs = [o.type ? `type="${o.type}"` : "", o.ph ? `placeholder="${esc(o.ph)}"` : "", o.ac ? `autocomplete="${o.ac}"` : "", o.im ? `inputmode="${o.im}"` : "",
    o.list ? `list="${o.list}"` : "", o.max ? `maxlength="${o.max}"` : "", o.step ? `step="${o.step}"` : "", o.min != null ? `min="${o.min}"` : ""].join(" ");
  return `<div class="field ${o.full ? "full" : ""}"><label for="${id}">${label}${o.req ? ' <i class="req">*</i>' : ""}</label>
    <input class="in ${o.mono ? "mono" : ""} ${o.up ? "up" : ""}" id="${id}" data-cv="${path}" value="${esc(v == null ? "" : v)}" ${attrs}>
    <small class="cvhint" data-hint="${path}">${o.help || ""}</small></div>`;
}
function cvSelect(path, label, opts, o = {}) {
  const id = "cv_" + path.replace(/\./g, "_"), v = cvGet(path);
  return `<div class="field ${o.full ? "full" : ""}"><label for="${id}">${label}</label><select class="in" id="${id}" data-cv="${path}">${opts.map(([k, t]) => `<option value="${esc(k)}" ${String(v) === String(k) ? "selected" : ""}>${t}</option>`).join("")}</select></div>`;
}
function cvSeg(path, opts) {
  const v = cvGet(path);
  return `<div class="seg cvseg" role="radiogroup">${opts.map(([k, t, i]) => `<button type="button" role="radio" aria-checked="${v === k}" class="${v === k ? "on" : ""}" data-cvseg="${path}" data-v="${k}">${i ? ic(i, "sm") : ""}${t}</button>`).join("")}</div>`;
}
function cvCheck(path, label, o = {}) {
  return `<label class="cvchk ${o.dis ? "dis" : ""}"><input type="checkbox" data-cvchk="${path}" ${cvGet(path) ? "checked" : ""} ${o.dis ? "disabled" : ""}><span>${label}</span></label>`;
}
function cvPartyHTML(side) {
  const p = cvState()[side], emp = p.tipo === "empresa", who = side === "sel" ? "vendedor" : "comprador";
  return `${cvSeg(side + ".tipo", [["particular", "Particular", "user"], ["empresa", "Empresa o autónomo", "building"]])}
  <div class="fgrid">${emp ? `
    ${cvField(side + ".razon", "Razón social", { req: 1, full: 1, ac: "organization" })}
    ${cvField(side + ".cif", "CIF / NIF", { req: 1, mono: 1, up: 1, ph: "B12345674", max: 12 })}
    ${cvField(side + ".cargo", "Cargo del representante", { ph: "administrador" })}
    ${cvField(side + ".rep", "Representante (nombre y apellidos)", { req: 1, ac: "name" })}
    ${cvField(side + ".repDoc", "DNI / NIE del representante", { mono: 1, up: 1, max: 12 })}`
    : `${cvField(side + ".nombre", "Nombre y apellidos", { req: 1, full: 1, ac: side === "sel" ? "name" : "off" })}
    ${cvSelect(side + ".docTipo", "Documento", [["DNI", "DNI"], ["NIE", "NIE"], ["PAS", "Pasaporte"]])}
    ${cvField(side + ".doc", "Número de documento", { req: 1, mono: 1, up: 1, ph: p.docTipo === "NIE" ? "X1234567L" : p.docTipo === "PAS" ? "PAA123456" : "12345678Z", max: 15 })}`}
    ${cvField(side + ".dom", "Domicilio (calle, número, piso)", { req: 1, full: 1, ac: side === "sel" ? "street-address" : "off" })}
    ${cvField(side + ".cp", "Código postal", { mono: 1, im: "numeric", max: 5, ph: "03509" })}
    ${cvField(side + ".mun", "Municipio", { req: 1 })}
    ${cvField(side + ".prov", "Provincia", { list: "cvProvList" })}
    ${cvField(side + ".tel", "Teléfono", { type: "tel", ac: "off", ph: "+34 600 000 000" })}
    ${cvField(side + ".email", "Email", { type: "email", ac: "off", full: 1, help: `Opcional · para que el ${who} reciba su copia` })}
  </div>`;
}
function cvSec(n, id, title, sub, body) {
  return `<section class="cvsec" id="${id}" data-rev><header><span class="n">${n}</span><div><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ""}</div></header>${body}</section>`;
}
function viewContract(query) {
  const c = cvState();
  if (query && query.lote) cvPrefillFromLot(query.lote);
  const pc = cvProConsumer();
  return `<div class="wrap cvwrap">
  <section class="cvhero" data-rev>
    <div class="eyebrow">${ic("doc", "sm")}Herramienta gratuita · sin registro</div>
    <h1>Contrato de compraventa de vehículo</h1>
    <p class="lead">Rellénalo en tres minutos, firmad en la pantalla y descarga el PDF listo para el cambio de titularidad en la DGT.</p>
    <div class="cvbadges">
      <span>${ic("shield", "sm")}Tus datos no salen de tu dispositivo</span>
      <span>${ic("pen", "sm")}Firma en pantalla</span>
      <span>${ic("download", "sm")}PDF al instante</span>
      <span>${ic("globe", "sm")}Copia traducida opcional</span>
    </div>
  </section>

  <div class="cvgrid">
    <form class="cvform" id="cvForm" novalidate autocomplete="on" onsubmit="return false">
      <div class="cvprog" id="cvProg"></div>
      ${cvSec(1, "cvSel", "Vendedor", "Quien vende y entrega el vehículo.", cvPartyHTML("sel"))}
      ${cvSec(2, "cvCom", "Comprador", "Quien compra y hará el cambio de titularidad.", cvPartyHTML("com"))}
      ${cvSec(3, "cvVeh", "Vehículo", "Los datos están en el permiso de circulación y en la ficha técnica.", `<div class="fgrid">
        ${cvField("veh.marca", "Marca", { req: 1, list: "cvMakeList" })}
        ${cvField("veh.modelo", "Modelo y versión", { req: 1, ph: "Golf 2.0 TDI" })}
        ${cvField("veh.matricula", "Matrícula", { req: 1, mono: 1, up: 1, ph: "1234 BCD", max: 10 })}
        ${cvField("veh.vin", "N.º de bastidor (VIN)", { req: 1, mono: 1, up: 1, ph: "VF1RFB00X12345678", max: 17, help: "17 caracteres · casilla E del permiso" })}
        ${cvField("veh.fmat", "Fecha de primera matriculación", { type: "date" })}
        ${cvField("veh.km", "Kilómetros", { im: "numeric", ph: "128000" })}
        ${cvField("veh.color", "Color", { ph: "Gris" })}
        ${cvSelect("veh.comb", "Combustible", CV_FUEL.map(f => [f, f]))}
        ${cvSelect("veh.llaves", "Llaves que se entregan", [["1", "1"], ["2", "2"], ["3", "3"]])}
      </div>`)}
      ${cvSec(4, "cvPago", "Precio y pago", "", `<div class="fgrid">
        <div class="field"><label for="cv_pago_precio">Precio de venta (€) <i class="req">*</i></label>
          <div class="cvmoney"><input class="in tnum" id="cv_pago_precio" data-cv="pago.precio" inputmode="decimal" placeholder="4500" value="${esc(c.pago.precio)}"><span>€</span></div>
          <small class="cvhint" data-hint="pago.precio"></small></div>
        ${cvField("pago.senal", "Señal ya entregada (€)", { im: "decimal", ph: "0", help: "Opcional" })}
        <div class="field full"><div class="cvwords" id="cvWords" translate="no"></div></div>
        <div class="field full"><span class="lbl">Forma de pago</span>${cvSeg("pago.forma", [["transferencia", "Transferencia"], ["efectivo", "Efectivo"], ["bizum", "Bizum"], ["cheque", "Cheque"], ["financiacion", "Financiación"]])}<small class="cvhint" data-hint="pago.forma"></small></div>
        <div class="field full"><span class="lbl">Gastos de transferencia e impuestos</span>${cvSeg("pago.gastos", [["comprador", "Los paga el comprador"], ["vendedor", "El vendedor"], ["mitad", "A medias"]])}</div>
        ${cvField("entrega.fecha", "Fecha de entrega", { type: "date" })}
        ${cvField("entrega.hora", "Hora de entrega", { type: "time", help: "Desde esta hora responde el comprador" })}
      </div>`)}
      ${cvSec(5, "cvEst", "Estado y documentación", "", `
        ${cvCheck("estado.danos", "El vehículo tiene daños o defectos conocidos")}
        <div class="field cvdanos" ${c.estado.danos ? "" : "hidden"}><label for="cv_estado_danosTxt">Describe los daños o defectos</label><textarea class="in" id="cv_estado_danosTxt" data-cv="estado.danosTxt" rows="3" placeholder="Golpe en la aleta delantera derecha; embrague con desgaste">${esc(c.estado.danosTxt)}</textarea></div>
        ${cvCheck("estado.sinGar", pc ? "Venta sin garantía (no disponible: vende un profesional a un particular)" : "Venta sin garantía · para piezas o reparación", { dis: pc })}
        <span class="lbl" style="display:block;margin:16px 0 6px">Documentación que se entrega</span>
        <div class="cvdocs">${Object.entries({ permiso: "Permiso de circulación", ficha: "Ficha técnica (tarjeta ITV)", ivtm: "Último recibo del impuesto de circulación", itv: "Informe de la última ITV", manual: "Manual y libro de mantenimiento" }).map(([k, t]) => cvCheck("docs." + k, t)).join("")}</div>
        <div class="field" style="margin-top:14px"><label for="cv_extra">Otras condiciones <span class="muted">(opcional)</span></label><textarea class="in" id="cv_extra" data-cv="extra" rows="3" placeholder="El vendedor entrega también un juego de neumáticos de invierno.">${esc(c.extra)}</textarea></div>`)}
      ${cvSec(6, "cvFir", "Lugar, fecha y firmas", "Podéis firmar aquí con el dedo o el ratón, o imprimir el PDF y firmarlo a mano.", `<div class="fgrid">
        ${cvField("lugar", "Lugar de la firma", { req: 1, ph: "Alicante" })}
        ${cvField("fecha", "Fecha del contrato", { type: "date" })}
      </div>
      <div class="cvpads">${["sel", "com"].map(k => `<div class="cvpad"><div class="cvpad-h"><b>Firma del ${k === "sel" ? "vendedor" : "comprador"}</b><button type="button" class="btn sm ghost" data-sigclr="${k}">${ic("undo", "sm")}Borrar</button></div>
        <canvas data-sig="${k}" aria-label="Recuadro de firma del ${k === "sel" ? "vendedor" : "comprador"}"></canvas><small>${ic("pen", "sm")}Firma dentro del recuadro</small></div>`).join("")}</div>
      <p class="cvnote">${ic("lock", "sm")}Las firmas no se guardan: desaparecen al cerrar la página.</p>`)}
      <datalist id="cvProvList">${CV_PROV.map(p => `<option value="${p}">`).join("")}</datalist>
      <datalist id="cvMakeList">${CV_MAKES.map(p => `<option value="${p}">`).join("")}</datalist>
    </form>

    <aside class="cvside">
      <div class="cvcard">
        <div class="cvcard-h"><b>Vista previa</b><div class="cvprevtabs" id="cvPrevTabs"></div></div>
        <div class="cvpaper" id="cvPaper" translate="no"></div>
      </div>
      <div class="cvactions">
        <button type="button" class="btn primary lg" id="cvPdf">${ic("download", "sm")}Descargar PDF</button>
        <button type="button" class="btn" id="cvShare" hidden>${ic("share", "sm")}Compartir</button>
        <div class="cvopts">
          <label class="cvchk" id="cvCopiaRow" hidden><input type="checkbox" data-cvchk="copia" ${c.copia ? "checked" : ""}><span id="cvCopiaTxt">Añadir copia traducida</span></label>
          <label class="cvchk"><input type="checkbox" data-cvchk="recordar" ${c.recordar ? "checked" : ""}><span>Recordar los datos en este dispositivo</span></label>
        </div>
        <div class="cvmeta"><span id="cvSaved">${ic("check", "sm")}Borrador guardado</span><button type="button" class="link" id="cvReset">${ic("trash", "sm")}Vaciar formulario</button></div>
      </div>
      <div class="panel cvafter">
        <h4>Después de firmar</h4>
        <ol>
          <li><b>Vendedor · 10 días.</b> Notifica la venta a la DGT (sede electrónica o Jefatura de Tráfico) con una copia del contrato.</li>
          <li><b>Comprador · 30 días hábiles.</b> Liquida el impuesto de transmisiones (normalmente el modelo 620) en la Hacienda de tu comunidad. Si compras a un profesional, la operación suele llevar IVA y no hay ITP.</li>
          <li><b>Comprador · 30 días.</b> Solicita el cambio de titularidad en la DGT y paga la tasa de tráfico.</li>
          <li><b>Antes de circular.</b> Contrata el seguro obligatorio a tu nombre.</li>
        </ol>
        <p class="muted" style="margin:10px 0 0;font-size:12.5px">Modelo orientativo. Ante una situación especial (herencias, vehículos embargados, financiación pendiente) consulta con una gestoría.</p>
      </div>
    </aside>
  </div>
  <div class="cvbar"><span id="cvBarProg"></span><button type="button" class="btn primary" id="cvPdf2">${ic("download", "sm")}PDF</button></div>
</div>`;
}

/* ---------- prellenado desde un lote ganado ---------- */
function cvPrefillFromLot(id) {
  const l = lots.find(x => x.id === id); if (!l) return;
  const c = cvState();
  if (c._lote === id) return;
  Object.assign(c.veh, {
    marca: l.make || c.veh.marca, modelo: l.model || c.veh.modelo,
    matricula: l.plate && !/•/.test(l.plate) ? l.plate : c.veh.matricula,
    vin: l.vin && l.vin.length === 17 ? l.vin : c.veh.vin,
    km: l.km ? String(l.km) : c.veh.km, comb: CV_FUEL.includes(l.fuel) ? l.fuel : c.veh.comb,
  });
  if (l.hist && l.hist[0] && l.hist[0].who === "Tú") c.pago.precio = String(curPrice(l));
  if (S.user) Object.assign(c.com, { nombre: c.com.nombre || S.user.name || "", tel: c.com.tel || S.user.phone || "", email: c.com.email || S.user.email || "", mun: c.com.mun || S.user.city || "" });
  if (l.city && !c.lugar) c.lugar = l.city;
  c._lote = id;
  cvSave();
}

/* ---------- comportamiento ---------- */
function cvUpdate(opts = {}) {
  const c = cvState(), req = cvRequired(), done = req.filter(([, v]) => String(v || "").trim()).length, warn = cvWarnings();
  const pct = Math.round(done / req.length * 100);
  const prog = $("#cvProg");
  if (prog) prog.innerHTML = `<div class="bar"><i style="width:${pct}%"></i></div><span><b class="tnum">${done}</b> de <b class="tnum">${req.length}</b> datos obligatorios</span>${done < req.length ? `<small>Lo que falte quedará como línea para rellenar a mano.</small>` : `<small class="ok">${ic("check", "sm")}Contrato completo</small>`}`;
  const bar = $("#cvBarProg"); if (bar) bar.textContent = `${done}/${req.length}`;
  $$("[data-hint]").forEach(h => {
    const p = h.dataset.hint;
    if (!h.dataset.base) h.dataset.base = h.textContent;
    h.textContent = warn[p] || h.dataset.base;
    h.classList.toggle("warn", !!warn[p]);
    const inp = $(`[data-cv="${p}"]`); if (inp) inp.classList.toggle("bad", !!warn[p]);
  });
  const w = $("#cvWords");
  if (w) { const pr = +String(c.pago.precio).replace(",", "."); w.innerHTML = pr > 0 ? `${ic("doc", "sm")}<span>${esc(eurosEnLetras(pr))}</span>` : ""; }
  const dn = $(".cvdanos"); if (dn) dn.hidden = !c.estado.danos;
  const lang = window.LANG || "es";
  const tabs = $("#cvPrevTabs");
  if (tabs) tabs.innerHTML = lang === "es" ? "" : `<button type="button" class="${CV_PREV === "es" ? "on" : ""}" data-prev="es">Español · oficial</button><button type="button" class="${CV_PREV !== "es" ? "on" : ""}" data-prev="${lang}">${(window.LANG_NAMES || {})[lang] || lang.toUpperCase()}</button>`;
  if (lang === "es") CV_PREV = "es";
  const row = $("#cvCopiaRow"); if (row) row.hidden = lang === "es";
  const ct = $("#cvCopiaTxt"); if (ct) ct.textContent = "Añadir copia traducida (" + ((window.LANG_NAMES || {})[lang] || "") + ")";
  if (!opts.noPreview) { const paper = $("#cvPaper"); if (paper) paper.innerHTML = cvPreviewHTML(CV_PREV); }
}
let cvPrevT = 0;
function cvChanged() { cvSave(); clearTimeout(cvPrevT); cvUpdate({ noPreview: true }); cvPrevT = setTimeout(() => cvUpdate(), 140); }

function mountContract() {
  const form = $("#cvForm"); if (!form) return;
  cvState();
  form.addEventListener("input", e => {
    const el = e.target, p = el.dataset.cv; if (!p) return;
    let v = el.value;
    if (el.classList.contains("up")) { const s = el.selectionStart; v = v.toUpperCase(); if (v !== el.value) { el.value = v; try { el.setSelectionRange(s, s); } catch (x) {} } }
    if (p === "pago.precio" || p === "pago.senal") v = v.replace(/[^\d.,]/g, "").replace(",", ".");
    if (p === "veh.km") v = v.replace(/\D/g, "");
    cvSet(p, v);
    if (/\.cp$/.test(p)) { const side = p.split(".")[0], pr = cvProvFromCP(v); if (pr && !cvState()[side].prov) { cvSet(side + ".prov", pr); const pi = $(`[data-cv="${side}.prov"]`); if (pi) pi.value = pr; } }
    cvChanged();
  });
  form.addEventListener("change", e => {
    const el = e.target;
    if (el.dataset.cv) { cvSet(el.dataset.cv, el.value); if (/docTipo$/.test(el.dataset.cv)) cvRerenderParty(el.dataset.cv.split(".")[0]); cvChanged(); }
    if (el.dataset.cvchk) { cvSet(el.dataset.cvchk, el.checked); cvChanged(); }
  });
  form.addEventListener("focusout", e => {
    const el = e.target, p = el.dataset && el.dataset.cv; if (!p) return;
    if (p === "veh.matricula") { el.value = cvFmtPlate(el.value); cvSet(p, el.value); cvChanged(); }
  });
  form.addEventListener("click", e => {
    const b = e.target.closest("[data-cvseg]"); if (!b) return;
    cvSet(b.dataset.cvseg, b.dataset.v);
    if (/\.tipo$/.test(b.dataset.cvseg)) { cvRerenderParty(b.dataset.cvseg.split(".")[0]); cvRerenderEstado(); }
    else $$(`[data-cvseg="${b.dataset.cvseg}"]`).forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); });
    cvChanged();
  });
  $(".cvside").addEventListener("change", e => { const el = e.target; if (el.dataset.cvchk) { cvSet(el.dataset.cvchk, el.checked); cvChanged(); } });
  $(".cvside").addEventListener("click", e => { const t = e.target.closest("[data-prev]"); if (t) { CV_PREV = t.dataset.prev; cvUpdate(); } });
  $("#cvReset").onclick = () => modal("Vaciar formulario", `<p style="margin:0">Se borrarán todos los datos del contrato y las firmas de este dispositivo.</p>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="rNo">Cancelar</button><button class="btn primary" id="rYes">${ic("trash", "sm")}Vaciar</button></div>`, close => {
      $("#rNo").onclick = close;
      $("#rYes").onclick = () => { close(); CV = cvDefaults(); CV_SIG = { sel: null, com: null }; store.set("contrato", null); router(); toast("Formulario vacío", "trash"); };
    });
  $("#cvPdf").onclick = () => cvMakePdf("save");
  $("#cvPdf2").onclick = () => cvMakePdf("save");
  if (navigator.canShare && window.File) { const sh = $("#cvShare"); sh.hidden = false; sh.onclick = () => cvMakePdf("share"); }
  $$("canvas[data-sig]").forEach(cv => sigPad(cv, cv.dataset.sig));
  $$("[data-sigclr]").forEach(b => b.onclick = () => { const k = b.dataset.sigclr; CV_SIG[k] = null; const cv = $(`canvas[data-sig="${k}"]`); cv._clear && cv._clear(); cvUpdate(); });
  cvUpdate();
}
function cvRerenderParty(side) {
  const sec = $(side === "sel" ? "#cvSel" : "#cvCom"); if (!sec) return;
  const head = sec.querySelector("header").outerHTML;
  sec.innerHTML = head + cvPartyHTML(side);
}
function cvRerenderEstado() {
  const pc = cvProConsumer(), lab = $('[data-cvchk="estado.sinGar"]'); if (!lab) return;
  if (pc) { cvSet("estado.sinGar", false); lab.checked = false; }
  lab.disabled = pc; lab.parentElement.classList.toggle("dis", pc);
  lab.nextElementSibling.textContent = pc ? "Venta sin garantía (no disponible: vende un profesional a un particular)" : "Venta sin garantía · para piezas o reparación";
}

/* ---------- firma en pantalla: trazo suave con grosor según velocidad ---------- */
function sigPad(canvas, key) {
  const ctx = canvas.getContext("2d");
  let pts = [], drawing = false, lastW = 2.4, dpr = 1;
  function setup() {
    const r = canvas.getBoundingClientRect(); dpr = Math.min(3, devicePixelRatio || 1);
    const keep = CV_SIG[key];
    canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#13204a"; ctx.fillStyle = "#13204a";
    if (keep) { const im = new Image(); im.onload = () => ctx.drawImage(im, 0, 0, r.width, r.height); im.src = keep; }
  }
  const pos = e => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }; };
  canvas.addEventListener("pointerdown", e => { e.preventDefault(); canvas.setPointerCapture(e.pointerId); drawing = true; pts = [pos(e)]; lastW = 2.4;
    ctx.beginPath(); ctx.arc(pts[0].x, pts[0].y, 1.1, 0, 7); ctx.fill(); canvas.classList.add("signing"); });
  canvas.addEventListener("pointermove", e => {
    if (!drawing) return; e.preventDefault();
    const p = pos(e), a = pts[pts.length - 1]; pts.push(p);
    const dist = Math.hypot(p.x - a.x, p.y - a.y), dt = Math.max(1, p.t - a.t), vel = dist / dt;
    const w = Math.max(1.1, Math.min(3.4, 3.6 - vel * 1.6)); lastW = lastW * .6 + w * .4;
    if (pts.length < 3) return;
    const p0 = pts[pts.length - 3], p1 = pts[pts.length - 2];
    const m0 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 }, m1 = { x: (p1.x + p.x) / 2, y: (p1.y + p.y) / 2 };
    ctx.lineWidth = lastW; ctx.beginPath(); ctx.moveTo(m0.x, m0.y); ctx.quadraticCurveTo(p1.x, p1.y, m1.x, m1.y); ctx.stroke();
  });
  const end = () => { if (!drawing) return; drawing = false; canvas.classList.remove("signing"); CV_SIG[key] = cvTrimSig(canvas); cvUpdate(); };
  canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end); canvas.addEventListener("lostpointercapture", end);
  canvas._clear = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); };
  new ResizeObserver(() => setup()).observe(canvas);
  setup();
}
/* recorta la firma al trazo para que encaje bien en el PDF */
function cvTrimSig(canvas) {
  const w = canvas.width, h = canvas.height, d = canvas.getContext("2d").getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (d[(y * w + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return null;
  const pad = 8, sx = Math.max(0, x0 - pad), sy = Math.max(0, y0 - pad), sw = Math.min(w, x1 + pad) - sx, sh = Math.min(h, y1 + pad) - sy;
  const o = document.createElement("canvas"); o.width = sw; o.height = sh;
  o.getContext("2d").drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
  return o.toDataURL("image/png");
}

/* ---------- PDF ---------- */
var CV_FONTS = null;
function cvLoadScript(src) { return new Promise((ok, ko) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => ko(new Error("No se pudo cargar " + src)); document.head.appendChild(s); }); }
const cvB64 = buf => { const b = new Uint8Array(buf); let s = ""; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); };
async function cvLoadPdfKit() {
  if (!window.jspdf) await cvLoadScript("vendor/jspdf.umd.min.js");
  if (!CV_FONTS) {
    const [r, b] = await Promise.all(["Regular", "Bold"].map(w => fetch(`fonts/ms-sans-${w}.ttf`).then(x => { if (!x.ok) throw new Error("fuente"); return x.arrayBuffer(); })));
    CV_FONTS = { r: cvB64(r), b: cvB64(b) };
  }
}
function cvImgSize(src) { return new Promise(ok => { const im = new Image(); im.onload = () => ok([im.naturalWidth, im.naturalHeight]); im.onerror = () => ok([3, 1]); im.src = src; }); }

async function cvBuildPdf() {
  await cvLoadPdfKit();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.addFileToVFS("MS-R.ttf", CV_FONTS.r); doc.addFont("MS-R.ttf", "MS", "normal");
  doc.addFileToVFS("MS-B.ttf", CV_FONTS.b); doc.addFont("MS-B.ttf", "MS", "bold");
  doc.setProperties({ title: "Contrato de compraventa de vehículo", subject: CV_REF, creator: "MotorSubasta", author: "MotorSubasta" });
  const W = 210, Hh = 297, L = 20, R = 20, TOP = 22, BOT = 24, CW = W - L - R;
  let y = TOP;
  const ink = () => doc.setTextColor(22, 22, 26), grey = () => doc.setTextColor(110, 110, 118);
  const ensure = h => { if (y + h > Hh - BOT) { doc.addPage(); y = TOP; } };
  const fill = s => s.replace(new RegExp(CV_HOLE_A + "[^" + CV_HOLE_B + "]*" + CV_HOLE_B, "g"), "____________________");
  const sigDims = {};
  for (const k of ["sel", "com"]) if (CV_SIG[k]) sigDims[k] = await cvImgSize(CV_SIG[k]);

  const render = (blocks, note) => {
    if (note) { doc.setFont("MS", "normal"); doc.setFontSize(8.5); grey(); const ls = doc.splitTextToSize(note, CW); doc.text(ls, L, y); y += ls.length * 3.8 + 4; }
    for (const b of blocks) {
      if (b.t === "title") { doc.setFont("MS", "bold"); doc.setFontSize(14.5); ink(); const ls = doc.splitTextToSize(b.s, CW); ensure(ls.length * 6.2 + 4); doc.text(ls, W / 2, y, { align: "center" }); y += ls.length * 6.2 + 1;
        doc.setDrawColor(226, 113, 34); doc.setLineWidth(.6); doc.line(W / 2 - 14, y, W / 2 + 14, y); y += 10; continue; }
      if (b.t === "place") { doc.setFont("MS", "normal"); doc.setFontSize(10); ink(); ensure(6); doc.text(fill(b.s), W - R, y, { align: "right" }); y += 9; continue; }
      if (b.t === "h") { doc.setFont("MS", "bold"); doc.setFontSize(10.5); ink(); ensure(13); y += 2; doc.text(b.s, b.center ? W / 2 : L, y, b.center ? { align: "center" } : {}); y += 6; continue; }
      if (b.t === "p") {
        doc.setFont("MS", "normal"); doc.setFontSize(10); ink();
        const ls = doc.splitTextToSize(fill(b.s), CW), lh = 5;
        ls.forEach((ln, i) => {
          ensure(lh);
          const words = ln.trim().split(/\s+/);
          // justificado a mano: todas las líneas menos la última del párrafo
          if (i < ls.length - 1 && words.length > 4) {
            const ww = words.map(w => doc.getTextWidth(w)), gap = (CW - ww.reduce((a, b) => a + b, 0)) / (words.length - 1);
            if (gap < 4) { let x = L; words.forEach((w, j) => { doc.text(w, x, y); x += ww[j] + gap; }); y += lh; return; }
          }
          doc.text(ln, L, y); y += lh;
        });
        y += 2.6; continue;
      }
      if (b.t === "kv") {
        const rh = 7.2; ensure(rh * b.rows.length + 4);
        doc.setDrawColor(222, 222, 228); doc.setLineWidth(.25);
        b.rows.forEach(([k, v], i) => {
          if (i % 2 === 0) { doc.setFillColor(247, 246, 244); doc.rect(L, y - 4.9, CW, rh, "F"); }
          doc.setFont("MS", "normal"); doc.setFontSize(9); grey(); doc.text(k, L + 3, y);
          doc.setFont("MS", "bold"); doc.setFontSize(10); ink(); doc.text(doc.splitTextToSize(fill(v), CW - 65)[0] || "", L + 62, y);
          y += rh;
        });
        doc.line(L, y - 4.9, L + CW, y - 4.9); y += 3; continue;
      }
      if (b.t === "sig") {
        ensure(48); y += 6;
        const bw = (CW - 12) / 2;
        [["sel", L], ["com", L + bw + 12]].forEach(([k, x]) => {
          const s = b[k];
          doc.setFont("MS", "bold"); doc.setFontSize(9.5); ink(); doc.text(s.label, x, y);
          doc.setDrawColor(200, 200, 206); doc.setLineWidth(.3); doc.roundedRect(x, y + 3, bw, 28, 2, 2);
          if (s.img && sigDims[k]) {
            const [iw, ih] = sigDims[k], maxW = bw - 8, maxH = 23, sc = Math.min(maxW / iw, maxH / ih);
            const w2 = iw * sc, h2 = ih * sc;
            doc.addImage(s.img, "PNG", x + (bw - w2) / 2, y + 3 + (28 - h2) / 2, w2, h2, undefined, "FAST");
          }
          doc.setFont("MS", "normal"); doc.setFontSize(8.5); grey();
          const ls = doc.splitTextToSize(s.who || " ", bw); doc.text(ls, x, y + 36);
        });
        y += 46; continue;
      }
    }
  };
  render(cvBlocks("es"));
  const lang = window.LANG || "es";
  if (lang !== "es" && cvState().copia) { doc.addPage(); y = TOP; render(cvBlocks(lang), (typeof tr === "function" ? tr(CVX.copia, null, lang) : CVX.copia)); }

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i); doc.setFont("MS", "normal"); doc.setFontSize(7.5); grey();
    doc.setDrawColor(230, 230, 234); doc.setLineWidth(.2); doc.line(L, Hh - 15, W - R, Hh - 15);
    doc.text("Ref. " + CV_REF, L, Hh - 10);
    doc.text(CVX.pie, W / 2, Hh - 10, { align: "center" });
    doc.text(CVX.pag.replace("{n}", i).replace("{total}", total), W - R, Hh - 10, { align: "right" });
  }
  return doc;
}
async function cvMakePdf(mode) {
  const btns = ["#cvPdf", "#cvPdf2", "#cvShare"].map(s => $(s)).filter(Boolean);
  btns.forEach(b => { b.disabled = true; b.classList.add("busy"); });
  try {
    const doc = await cvBuildPdf(), c = cvState();
    const plate = cvFmtPlate(c.veh.matricula).replace(/\s/g, "") || "vehiculo";
    const name = `contrato-compraventa-${plate}-${c.fecha || cvToday()}.pdf`;
    if (mode === "share") {
      const file = new File([doc.output("blob")], name, { type: "application/pdf" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: "Contrato de compraventa" });
      else doc.save(name);
    } else doc.save(name);
    window.CV_LAST_PDF = { name, pages: doc.getNumberOfPages(), bytes: doc.output("arraybuffer").byteLength };
    toast("Contrato descargado", "download");
  } catch (e) {
    if (e && e.name === "AbortError") return;
    console.error(e);
    toast("No se pudo generar el PDF. Revisa tu conexión e inténtalo de nuevo.", "alert");
  } finally {
    btns.forEach(b => { b.disabled = false; b.classList.remove("busy"); });
  }
}

/* ---------- ruta ---------- */
ROUTES.unshift([/^\/contrato$/, q => [viewContract(q), mountContract]]);
