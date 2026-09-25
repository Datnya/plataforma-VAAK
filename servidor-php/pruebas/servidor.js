// Auditoría del servidor de VAAK por roles (copia local idéntica a la oficial, base vacía de prueba).
const BASE = "http://127.0.0.1:8095";
const ORIGEN = BASE;
const resultados = [];
const anotar = (area, prueba, ok, detalle = "") => resultados.push({ area, prueba, ok, detalle });

class Agente {
  constructor(nombre) { this.nombre = nombre; this.cookies = {}; this.csrf = ""; }
  cabeceraCookies() { return Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join("; "); }
  guardar(res) {
    const lista = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    for (const c of lista) {
      const [par, ...atributos] = c.split(";");
      const i = par.indexOf("=");
      this.cookies[par.slice(0, i).trim()] = par.slice(i + 1).trim();
      this.ultimaCookie = { par: par.slice(0, i).trim(), atributos: atributos.map((a) => a.trim().toLowerCase()) };
      (this.todas ||= []).push(this.ultimaCookie);
    }
  }
  async pedir(metodo, ruta, cuerpo, extra = {}) {
    const cab = { Cookie: this.cabeceraCookies(), Origin: ORIGEN, ...extra };
    if (cuerpo !== undefined) cab["Content-Type"] = "application/json";
    if (this.csrf && !("x-vaak-csrf" in extra)) cab["x-vaak-csrf"] = this.csrf;
    const res = await fetch(BASE + ruta, { method: metodo, headers: cab, body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo), redirect: "manual" });
    this.guardar(res);
    let json = null; const texto = await res.text();
    try { json = JSON.parse(texto); } catch {}
    return { estado: res.status, json, texto };
  }
  async sesion() { const r = await this.pedir("GET", "/api/auth/session"); if (r.json?.csrfToken) this.csrf = r.json.csrfToken; return r; }
  async entrar(usuario, clave) { await this.sesion(); const r = await this.pedir("POST", "/api/auth/login", { username: usuario, password: clave }); await this.sesion(); return r; }
}

const uuid = () => crypto.randomUUID();

(async () => {
  const claveAdmin = process.argv[2] || require("fs").readFileSync(require("path").join(__dirname, ".local", "clave-admin.txt"), "utf8").trim();
  const admin = new Agente("admin");
  const r0 = await admin.entrar("auditor.admin", claveAdmin);
  anotar("Acceso", "El administrador puede iniciar sesión", r0.estado === 200, `HTTP ${r0.estado}`);
  const cookieSesion = (admin.todas || []).find((c) => /sesion|session|vaak/.test(c.par) && c.par !== "vaak-csrf");
  anotar("Sesión", "La cookie de sesión es HttpOnly (JavaScript no puede leerla)", !!cookieSesion?.atributos.includes("httponly"), cookieSesion ? cookieSesion.par + ": " + cookieSesion.atributos.join(", ") : "sin cookie");
  anotar("Sesión", "La cookie de sesión tiene SameSite (protege de otros sitios)", !!cookieSesion?.atributos.some((a) => a.startsWith("samesite")), cookieSesion?.atributos.join(", ") || "");

  // Crear un trabajador y un cliente.
  const claveT = "Trab-" + uuid().slice(0, 8), claveC = "Clie-" + uuid().slice(0, 8);
  const mkUser = (datos) => admin.pedir("POST", "/api/admin/users", { ...datos, idempotencyKey: uuid() });
  const rt = await mkUser({ name: "Trabajador Prueba", username: "trab.prueba", email: "trab@ejemplo.test", password: claveT, role: "Worker", projectScope: "selected", projectIds: ["pA"] });
  const rc = await mkUser({ name: "Cliente Prueba", username: "clie.prueba", email: "clie@ejemplo.test", password: claveC, role: "Client", projectScope: "selected", projectIds: ["pA"] });
  if (rt.estado === 201) require("fs").writeFileSync(require("path").join(__dirname, ".local", "claves-roles.json"), JSON.stringify({ trab: claveT, clie: claveC }));
  anotar("Usuarios", "El administrador crea un trabajador y un cliente", rt.estado === 201 && rc.estado === 201, `trabajador ${rt.estado}, cliente ${rc.estado}`);
  const rDup = await mkUser({ name: "Duplicado", username: "trab.prueba", email: "otro@ejemplo.test", password: "Clave12345", role: "Worker" });
  anotar("Usuarios", "No se puede crear un usuario repetido", rDup.estado === 409, `HTTP ${rDup.estado}`);
  const rCorta = await mkUser({ name: "Corta", username: "corta", email: "corta@ejemplo.test", password: "123", role: "Worker" });
  anotar("Usuarios", "No acepta contraseñas de menos de 8 caracteres", rCorta.estado === 400, `HTTP ${rCorta.estado}`);

  // Datos de la empresa: dos proyectos (el cliente solo tiene A).
  const estado = { version: 1, store: {
    projects: [{ id: "pA", code: "PRJ-A", name: "Proyecto A" }, { id: "pB", code: "PRJ-B", name: "Proyecto B SECRETO" }],
    orders: [{ id: "oA", projectId: "pA", number: "PRJ-A-0001", amount: "$ 100.00" }, { id: "oB", projectId: "pB", number: "PRJ-B-0001", amount: "$ 999.00" }],
    specs: [{ id: "sA", projectId: "pA", name: "Spec A" }, { id: "sB", projectId: "pB", name: "Spec B" }],
    suppliers: [{ id: "s1", name: "Proveedor con precios" }], tasks: [], projectCompanies: [], supplierProjectLinks: [] } };
  const rs = await admin.pedir("PUT", "/api/data", { baseRevision: 0, state: estado });
  anotar("Datos", "El administrador guarda los datos de la empresa", rs.estado === 200, `HTTP ${rs.estado}`);

  // Sin sesión.
  const anon = new Agente("anon");
  const ra = await anon.pedir("GET", "/api/data");
  anotar("Acceso", "Sin iniciar sesión no se pueden leer datos", ra.estado === 401, `HTTP ${ra.estado}`);
  const rau = await anon.pedir("GET", "/api/admin/users");
  anotar("Acceso", "Sin iniciar sesión no se ve la lista de usuarios", rau.estado === 401 || rau.estado === 403, `HTTP ${rau.estado}`);

  // Cliente.
  const cli = new Agente("cliente");
  const rcl = await cli.entrar("clie.prueba", claveC);
  anotar("Acceso", "El cliente puede iniciar sesión", rcl.estado === 200, `HTTP ${rcl.estado}`);
  const dc = await cli.pedir("GET", "/api/data");
  const texto = dc.texto || "";
  anotar("Permisos", "El cliente NO recibe el proyecto que no es suyo", !texto.includes("SECRETO") && !texto.includes("PRJ-B-0001"), texto.includes("SECRETO") ? "¡recibe el proyecto B!" : "solo proyecto A");
  anotar("Permisos", "El cliente NO recibe la lista de proveedores", !texto.includes("Proveedor con precios"), "");
  const sc = await cli.sesion();
  anotar("Permisos", "El cliente NO recibe el directorio de usuarios", !sc.json?.users, sc.json?.users ? `recibe ${sc.json.users.length} usuarios` : "no lo recibe");
  const wc = await cli.pedir("PUT", "/api/data", { baseRevision: 1, state: estado });
  anotar("Permisos", "El cliente NO puede modificar datos", wc.estado === 403, `HTTP ${wc.estado}`);
  const uc = await cli.pedir("GET", "/api/admin/users");
  anotar("Permisos", "El cliente NO puede ver la gestión de usuarios", uc.estado === 403, `HTTP ${uc.estado}`);
  const nc = await cli.pedir("POST", "/api/admin/users", { name: "X", username: "hack", email: "h@ejemplo.test", password: "Clave12345", role: "Admin", idempotencyKey: uuid() });
  anotar("Permisos", "El cliente NO puede crearse un administrador", nc.estado === 403, `HTTP ${nc.estado}`);

  // Codigo de las pantallas: cada rol recibe el suyo (24-sep-2026). Aunque el cliente mire el
  // codigo con «Inspeccionar», no puede rehacer la pantalla del administrador: no la tiene.
  const DEL_EQUIPO = [
    ["el formulario de orden de compra", "po-form-grid"],
    ["el formulario de requerimiento de pago", "invoice-breakdown"],
    ["el registro del pago", "payment-register-form"],
    ["el cambio de orden", "order-revision-form"],
    ["el editor de accesos", "access-editor-host"],
    ["el catálogo de rubros", "data-add-rubro"],
    ["la base de RUC de proveedores", "ALICORP"],
    ["el directorio de usuarios", "user-directory"],
  ];
  const appCliente = await cli.pedir("GET", "/api/app");
  const appAdmin = await admin.pedir("GET", "/api/app");
  anotar("Código", "El cliente recibe su propio código, más liviano", appCliente.texto.length < appAdmin.texto.length * 0.8,
    `cliente ${Math.round(appCliente.texto.length / 1024)} KB, equipo ${Math.round(appAdmin.texto.length / 1024)} KB`);
  for (const [que, marca] of DEL_EQUIPO) {
    anotar("Código", `El cliente NO recibe ${que}`, !appCliente.texto.includes(marca), appCliente.texto.includes(marca) ? `encontró «${marca}»` : "");
  }
  anotar("Código", "El equipo sí recibe sus pantallas completas", DEL_EQUIPO.every(([, marca]) => appAdmin.texto.includes(marca)), "");
  const sinSesion = await new Agente("anonimo").pedir("GET", "/api/app");
  anotar("Código", "Sin sesión no se entrega ningún código de pantallas", sinSesion.estado === 401, `HTTP ${sinSesion.estado}`);

  // Trabajador.
  const tra = new Agente("trabajador");
  await tra.entrar("trab.prueba", claveT);
  const st = await tra.sesion();
  const dir = st.json?.users || [];
  const otros = dir.filter((u) => u.username !== "trab.prueba");
  anotar("Permisos", "El trabajador NO recibe correos, teléfonos, usuarios ni permisos de los demás", otros.every((u) => !u.email && !u.phone && !u.username && !u.access), `recibe ${dir.length} usuarios; con correo: ${otros.filter((u) => u.email).length}`);
  const ut = await tra.pedir("GET", "/api/admin/users");
  anotar("Permisos", "El trabajador NO puede usar la gestión de usuarios", ut.estado === 403, `HTTP ${ut.estado}`);
  const nt = await tra.pedir("POST", "/api/admin/users", { name: "X", username: "hack2", email: "h2@ejemplo.test", password: "Clave12345", role: "Admin", idempotencyKey: uuid() });
  anotar("Permisos", "El trabajador NO puede crearse un administrador", nt.estado === 403, `HTTP ${nt.estado}`);
  const dt = await tra.pedir("GET", "/api/data");
  const txt = dt.texto || "";
  anotar("Permisos", "El trabajador recibe solo el proyecto que tiene asignado", !txt.includes("SECRETO") && !txt.includes("PRJ-B-0001") && txt.includes("PRJ-A-0001"), txt.includes("SECRETO") ? "recibe también el proyecto B" : "solo el suyo");
  const leerAdmin = async () => (await admin.pedir("GET", "/api/data")).json;
  const escribirTrab = async (cambiar) => { const d = (await tra.pedir("GET", "/api/data")).json; const st = JSON.parse(JSON.stringify(d.state)); cambiar(st.store); return tra.pedir("PUT", "/api/data", { baseRevision: d.revision, state: st }); };
  // Ataque 1: borrar todo.
  const w1 = await escribirTrab((s) => { s.projects = []; s.orders = []; s.specs = []; s.suppliers = []; });
  let adm = await leerAdmin();
  anotar("Permisos", "Un trabajador NO puede borrar proyectos ni datos ajenos desde la consola (solo lo que su rol permite)", adm.state.store.projects.length === 2 && adm.state.store.orders.some((o) => o.id === "oB") && adm.state.store.suppliers.length === 1, `HTTP ${w1.estado}; quedan ${adm.state.store.projects.length} proyectos, ${adm.state.store.orders.length} órdenes, ${adm.state.store.suppliers.length} proveedores; corregido: ${!!w1.json?.corrected}`);
  // Ataque 2: meter un proyecto nuevo y modificar el proyecto B (que no ve) enviándolo.
  const w2 = await escribirTrab((s) => { s.projects.push({ id: "pB", code: "PRJ-B", name: "B HACKEADO" }, { id: "pX", code: "X", name: "Proyecto inventado" }); s.orders.push({ id: "oB", projectId: "pB", number: "PRJ-B-0001", amount: "$ 1.00" }); });
  adm = await leerAdmin();
  const pB = adm.state.store.projects.find((p) => p.id === "pB"), oB = adm.state.store.orders.find((o) => o.id === "oB");
  anotar("Permisos", "Un trabajador NO puede cambiar proyectos ajenos ni crear proyectos", pB?.name === "Proyecto B SECRETO" && oB?.amount === "$ 999.00" && !adm.state.store.projects.some((p) => p.id === "pX"), `HTTP ${w2.estado}; B: ${pB?.name}, orden B: ${oB?.amount}`);
  // Ataque 3: cambiar la ficha de su propio proyecto (solo administrador).
  await escribirTrab((s) => { s.projects[0].name = "A renombrado"; s.projects[0].ruc = "0"; });
  adm = await leerAdmin();
  anotar("Permisos", "Un trabajador NO puede cambiar la ficha (nombre, RUC) de su proyecto", adm.state.store.projects.find((p) => p.id === "pA")?.name === "Proyecto A", adm.state.store.projects.find((p) => p.id === "pA")?.name);
  // Trabajo normal: nueva orden y requerimiento en su proyecto, nuevo proveedor.
  const w4 = await escribirTrab((s) => { s.orders.push({ id: "oA2", projectId: "pA", number: "PRJ-A-0002", amount: "$ 50.00" }); s.projects[0].invoices = [{ id: "iA", number: "PR-A-1" }]; s.suppliers.push({ id: "s2", name: "Proveedor nuevo" }); s.supplierProjectLinks.push({ supplierId: "s2", projectId: "pA" }); });
  adm = await leerAdmin();
  anotar("Datos", "El trabajador SÍ puede crear órdenes, requerimientos y proveedores en su proyecto", w4.estado === 200 && adm.state.store.orders.some((o) => o.id === "oA2") && adm.state.store.projects.find((p) => p.id === "pA")?.invoices?.length === 1 && adm.state.store.suppliers.some((x) => x.id === "s2") && !w4.json?.corrected, `HTTP ${w4.estado}; corregido: ${!!w4.json?.corrected}`);
  const estadoActual = adm.state; const revActual = adm.revision;
  // Protección contra otros sitios (CSRF) y origen.
  const sinToken = await admin.pedir("PUT", "/api/data", { baseRevision: revActual, state: estadoActual }, { "x-vaak-csrf": "" });
  anotar("Ataques", "Sin el token de seguridad no se puede escribir (CSRF)", sinToken.estado === 403, `HTTP ${sinToken.estado}`);
  const otroOrigen = await admin.pedir("PUT", "/api/data", { baseRevision: revActual, state: estadoActual }, { Origin: "https://sitio-malo.test" });
  anotar("Ataques", "Desde otro sitio web no se puede escribir", otroOrigen.estado === 403, `HTTP ${otroOrigen.estado}`);

  // Contraseñas.
  const listado = await admin.pedir("GET", "/api/admin/users");
  anotar("Contraseñas", "La lista de usuarios NO incluye contraseñas ni su cifrado", !/password|hash|\$2y\$/i.test(listado.texto || ""), "");

  // Fuerza bruta.
  const bruto = new Agente("bruto");
  let bloqueado = null;
  for (let i = 1; i <= 12; i++) {
    await bruto.sesion();
    const r = await bruto.pedir("POST", "/api/auth/login", { username: "auditor.admin", password: "mala-" + i });
    if (r.estado === 429) { bloqueado = i; break; }
  }
  anotar("Ataques", "Tras varios intentos fallidos el acceso se bloquea", bloqueado !== null, bloqueado ? `bloqueado en el intento ${bloqueado}` : "no se bloqueó en 12 intentos");

  // Cerrar sesión.
  await cli.pedir("POST", "/api/auth/logout", {});
  const tras = await cli.pedir("GET", "/api/data");
  anotar("Sesión", "Al cerrar sesión ya no se pueden leer datos", tras.estado === 401, `HTTP ${tras.estado}`);

  // Imágenes.
  const falsa = await admin.pedir("PUT", "/api/data/assets", { id: "0".repeat(64), dataUrl: "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==" });
  anotar("Ataques", "No se puede subir un archivo que no sea imagen", falsa.estado === 400, `HTTP ${falsa.estado}`);

  console.log(JSON.stringify(resultados, null, 1));
})().catch((e) => { console.error("FALLO", e); process.exit(1); });
