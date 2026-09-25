// Prueba de la migración del guardado (etapa 1, 25-sep-2026).
//
// Lo único que importa aquí: DESPUÉS DE MIGRAR, LA PLATAFORMA TIENE QUE DEVOLVER EXACTAMENTE
// LO MISMO QUE ANTES. Se compara el estado completo carácter por carácter, en los dos sentidos
// (migrar y revertir), y se prueba con volumen real.
const BASE = "http://127.0.0.1:8095";
const resultados = [];
const anotar = (prueba, ok, detalle = "") => resultados.push({ prueba, ok, detalle });

class Agente {
  constructor() { this.cookies = {}; this.csrf = ""; }
  cabecera() { return Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join("; "); }
  async pedir(metodo, ruta, cuerpo) {
    const cab = { Cookie: this.cabecera(), Origin: BASE };
    if (cuerpo !== undefined) cab["Content-Type"] = "application/json";
    if (this.csrf) cab["x-vaak-csrf"] = this.csrf;
    const res = await fetch(BASE + ruta, { method: metodo, headers: cab, body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) });
    (res.headers.getSetCookie ? res.headers.getSetCookie() : []).forEach((c) => {
      const [par] = c.split(";"); const i = par.indexOf("=");
      this.cookies[par.slice(0, i).trim()] = par.slice(i + 1).trim();
    });
    const texto = await res.text();
    let json = null; try { json = JSON.parse(texto); } catch {}
    if (json?.csrfToken) this.csrf = json.csrfToken;
    return { estado: res.status, json, texto };
  }
  async entrar(usuario, clave) {
    await this.pedir("GET", "/api/auth/session");
    const r = await this.pedir("POST", "/api/auth/login", { username: usuario, password: clave });
    await this.pedir("GET", "/api/auth/session");
    return r;
  }
}

// Registros de prueba con la forma real: un spec ~520 bytes, una OC ~3,7 KB.
const spec = (i, projectId) => ({
  id: `sp-m-${i}`, projectId, name: `Spec de migración ${i}`, code: `SPEC-${String(i).padStart(5, "0")}`,
  productCode: `PC-${i}`, size: "120 x 60 x 45 cm", quantity: String((i % 9) + 1), unit: "Each",
  material: "Madera maciza", category: "BANQUET EQUIPMENT", color: "Natural", cost: `S/ ${(100 + i).toFixed(2)}`,
  description: "Descripción larga del spec para que pese lo mismo que uno real. ".repeat(3),
  procurementTeam: i % 2 ? "FFE" : "OSE", vendorSource: "MUEBLES ANDINOS SAC", area: "BANQUETE",
  specStatus: "Approved", reference: `Nota ${i}`, image: "", createdBy: "u-1", createdByName: "Auditor Admin",
  createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, i % 60)).toISOString(),
});
const orden = (i, projectId) => ({
  id: `o-m-${i}`, projectId, number: `MIG-${String(i).padStart(4, "0")}`, ocTeam: i % 2 ? "FFE" : "OSE",
  supplier: "MUEBLES ANDINOS SAC", source: "MUEBLES ANDINOS SAC", date: "2026-09-25", amount: `S/ ${(1000 + i).toFixed(2)}`,
  amountCurrency: "S/", amountValue: (1000 + i).toFixed(2), status: "approved", trackingNumber: `TRK-2026-${100000 + i}`,
  trackingStatus: "Preparation", terms: "Pago contra entrega.\nSegunda línea de términos.",
  items: [{ description: `Spec de migración ${i}`, specId: `sp-m-${i}`, quantity: 2, currency: "S/", unitCost: 500,
    specSnapshot: { code: `SPEC-${String(i).padStart(5, "0")}`, productCode: `PC-${i}`, image: "", name: `Spec de migración ${i}`,
      size: "120 x 60 x 45 cm", material: "Madera maciza", description: "Descripción congelada.", unit: "Each", color: "Natural" } }],
  createdBy: "u-1", createdByName: "Auditor Admin", createdAt: new Date(Date.UTC(2026, 1, 1, 0, 0, i % 60)).toISOString(),
});
const requerimiento = (i) => ({
  id: `inv-m-${i}`, number: `PR-MIG-${String(i).padStart(4, "0")}`, poNumber: `MIG-${String(i).padStart(4, "0")}`,
  requestDate: "2026-09-25", currency: "S/", invoiceCurrency: "S/", requestDetail: `Requerimiento ${i}`,
  totalRequest: (1000 + i).toFixed(2), invoiceTotal: (1000 + i).toFixed(2), paymentAmount: (1000 + i).toFixed(2),
  payableTo: "MUEBLES ANDINOS SAC", paymentPayableTo: "MUEBLES ANDINOS SAC", invoiceNumber: `F-${i}`,
  issuedBy: "Auditor Admin", createdAt: new Date(Date.UTC(2026, 2, 1, 0, 0, i % 60)).toISOString(),
});

(async () => {
  const clave = process.argv[2] || require("fs").readFileSync(require("path").join(__dirname, ".local", "clave-admin.txt"), "utf8").trim();
  const admin = new Agente();
  const entrada = await admin.entrar("auditor.admin", clave);
  anotar("El administrador entra", entrada.estado === 200, `HTTP ${entrada.estado}`);

  const antes = await admin.pedir("GET", "/api/data");
  const estado = antes.json?.state;
  if (!estado?.store?.projects?.length) {
    anotar("Hay un proyecto para la prueba", false, `GET ${antes.estado}: ${antes.texto.slice(0, 160)}`);
    console.log(JSON.stringify(resultados, null, 1));
    return;
  }
  const projectId = estado.store.projects[0].id;
  let revision = antes.json.revision;

  // --- Estado de prueba: 400 specs, 150 OC y 80 requerimientos sobre lo que ya hay.
  const copia = JSON.parse(JSON.stringify(estado));
  copia.store.specs = [...(copia.store.specs || []), ...Array.from({ length: 400 }, (_, i) => spec(i, projectId))];
  copia.store.orders = [...(copia.store.orders || []), ...Array.from({ length: 150 }, (_, i) => orden(i, projectId))];
  const proyecto = copia.store.projects[0];
  proyecto.invoices = [...(proyecto.invoices || []), ...Array.from({ length: 80 }, (_, i) => requerimiento(i))];

  const guardado = await admin.pedir("PUT", "/api/data", { baseRevision: revision, state: copia });
  anotar("Se guarda un estado con 630 registros", guardado.estado === 200, `HTTP ${guardado.estado}`);
  revision = guardado.json?.revision ?? revision;

  // --- 1) Lo guardado se devuelve idéntico.
  const leido = await admin.pedir("GET", "/api/data");
  const textoEsperado = JSON.stringify(copia);
  const textoLeido = JSON.stringify(leido.json?.state);
  anotar("Lo que se devuelve es idéntico a lo que se guardó", textoLeido === textoEsperado,
    textoLeido === textoEsperado ? `${(textoLeido.length / 1024).toFixed(0)} KB` : `difieren: ${textoEsperado.length} vs ${textoLeido.length}`);

  // --- 2) Los registros están en su tabla y el documento quedó sin ellos.
  const cuenta = await admin.pedir("GET", "/api/admin/registros");
  const f = cuenta.json?.enFilas || {}, d = cuenta.json?.enDocumento || {};
  anotar("Cada registro tiene su propia fila", f.spec >= 400 && f.order >= 150 && f.invoice >= 80,
    `specs ${f.spec}, OC ${f.order}, requerimientos ${f.invoice}`);
  anotar("El documento ya no carga los registros", (d.spec || 0) + (d.order || 0) + (d.invoice || 0) === 0,
    `quedan ${(d.spec || 0) + (d.order || 0) + (d.invoice || 0)}`);

  // --- 3) Volver atrás devuelve todo al documento, sin perder nada.
  const revertido = await admin.pedir("POST", "/api/admin/revertir-registros", {});
  anotar("La vuelta atrás funciona y se verifica sola", revertido.estado === 200 && revertido.json?.verificado === true, `HTTP ${revertido.estado}`);
  const trasRevertir = await admin.pedir("GET", "/api/data");
  anotar("Tras volver atrás, el estado sigue siendo idéntico", JSON.stringify(trasRevertir.json?.state) === textoEsperado, "");
  const cuenta2 = await admin.pedir("GET", "/api/admin/registros");
  anotar("Tras volver atrás, los registros están de nuevo en el documento",
    (cuenta2.json?.enDocumento?.spec || 0) >= 400 && (cuenta2.json?.enFilas?.spec || 0) === 0, "");

  // --- 4) Migrar otra vez (el caso real: documento viejo lleno de registros).
  const migrado = await admin.pedir("POST", "/api/admin/migrar-registros", {});
  anotar("La migración termina y se verifica sola", migrado.estado === 200 && migrado.json?.verificado === true,
    migrado.json?.registros ? `specs ${migrado.json.registros.spec}, OC ${migrado.json.registros.order}, requerimientos ${migrado.json.registros.invoice}` : `HTTP ${migrado.estado}`);
  const trasMigrar = await admin.pedir("GET", "/api/data");
  anotar("Tras migrar, el estado sigue siendo idéntico", JSON.stringify(trasMigrar.json?.state) === textoEsperado, "");
  anotar("El documento quedó pequeño", (migrado.json?.documento || 0) < (migrado.json?.estadoCompleto || 1) / 2,
    `documento ${Math.round((migrado.json?.documento || 0) / 1024)} KB de ${Math.round((migrado.json?.estadoCompleto || 0) / 1024)} KB`);

  // --- 5) Migrar de nuevo no rompe nada (se puede repetir).
  const otraVez = await admin.pedir("POST", "/api/admin/migrar-registros", {});
  anotar("Migrar dos veces no cambia nada", otraVez.estado === 200 && JSON.stringify((await admin.pedir("GET", "/api/data")).json?.state) === textoEsperado, "");

  // --- 6) Seguir trabajando después de migrar: editar un spec y borrar una OC.
  const actual = await admin.pedir("GET", "/api/data");
  const trabajo = JSON.parse(JSON.stringify(actual.json.state));
  trabajo.store.specs.find((s) => s.id === "sp-m-5").name = "Spec editado después de migrar";
  trabajo.store.orders = trabajo.store.orders.filter((o) => o.id !== "o-m-7");
  const r6 = await admin.pedir("PUT", "/api/data", { baseRevision: actual.json.revision, state: trabajo });
  const tras6 = await admin.pedir("GET", "/api/data");
  anotar("Después de migrar se sigue editando y borrando", r6.estado === 200
    && tras6.json?.state?.store?.specs.find((s) => s.id === "sp-m-5")?.name === "Spec editado después de migrar"
    && !tras6.json?.state?.store?.orders.some((o) => o.id === "o-m-7"), `HTTP ${r6.estado}`);

  // --- 7) Registros raros: sin id o con el id repetido. No pueden tener fila propia, así que se
  // quedan en el documento. Lo que no puede pasar es que desaparezcan.
  const base7 = await admin.pedir("GET", "/api/data");
  const raro = JSON.parse(JSON.stringify(base7.json.state));
  raro.store.specs.push({ projectId, name: "Spec sin id", code: "SIN-ID" });          // sin id
  raro.store.specs.push({ id: "sp-m-9", projectId, name: "Spec con id repetido" });   // id repetido
  const r7 = await admin.pedir("PUT", "/api/data", { baseRevision: base7.json.revision, state: raro });
  const tras7 = await admin.pedir("GET", "/api/data");
  const lista7 = tras7.json?.state?.store?.specs || [];
  anotar("Un spec sin id no se pierde", r7.estado === 200 && lista7.some((s) => s.code === "SIN-ID"), `HTTP ${r7.estado}`);
  anotar("Un spec con id repetido no se pierde", lista7.filter((s) => s.id === "sp-m-9").length === 2,
    `hay ${lista7.filter((s) => s.id === "sp-m-9").length} con ese id`);

  console.log(JSON.stringify(resultados, null, 1));
})().catch((e) => { console.error("FALLO", e); console.log(JSON.stringify(resultados, null, 1)); process.exit(1); });
