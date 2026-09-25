// Secciones de specs y de órdenes de compra del proyecto (24-sep-2026, pedido de Datnya).
// En la página solo quedan los 5 últimos registros y un botón que abre el registro completo en un
// cuadro emergente, con su buscador y sus filtros. Así la página no se alarga aunque el proyecto
// tenga miles de specs, y llegar a la sección siguiente cuesta un solo desplazamiento.
// El cuadro dibuja las MISMAS tarjetas de la página (window.VAAKAppBridge.specCardsHtml /
// orderCardsHtml), de a 40 por vez, para que abra rápido con muchos registros.
(() => {
  "use strict";
  const STORE = "vaak-local-v8";
  const PAGINA = 40;
  const ULTIMOS = 5;
  const bridge = () => window.VAAKAppBridge;
  const spanish = () => {
    try {
      const id = sessionStorage.getItem("vaak-session-tab-v1");
      const v = localStorage.getItem("vaak-language-" + (id || "guest"));
      return v ? v === "es" : document.documentElement.lang === "es";
    } catch { return false; }
  };
  const es = (a, b) => (spanish() ? a : b);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const leer = () => { try { return JSON.parse(localStorage.getItem(STORE) || "null"); } catch { return null; } };
  // Búsqueda sin tildes ni mayúsculas.
  const norm = (v) => String(v ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const equipoDe = (valor) => (String(valor || "").toUpperCase().includes("FF") ? "FFE" : "OSE");
  // Las fechas se guardan como dd/mm/aaaa o aaaa-mm-dd según el campo.
  const aFecha = (valor) => {
    const texto = String(valor || "").trim();
    let m = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return Date.UTC(+m[3], +m[2] - 1, +m[1]);
    m = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3]);
    const d = Date.parse(texto);
    return Number.isNaN(d) ? null : d;
  };

  const estilo = document.createElement("style");
  estilo.textContent = ".lst-acciones{display:flex;flex-wrap:wrap;align-items:center;gap:.7rem;margin:.2rem 0 1rem}.lst-acciones small{color:#8b7a6c;font-size:.8rem}"
    + ".lst-fondo{position:fixed;inset:0;z-index:1250;display:grid;place-items:center;padding:1rem;background:rgba(39,27,21,.55)}"
    + ".lst-fondo.lst-atras{z-index:5}" // con una ficha o una orden abierta encima, este cuadro pasa detrás
    + ".lst-nota{margin:.2rem 0 1rem;color:#8b7a6c;font-size:.8rem}"
    + ".lst-caja{display:flex;flex-direction:column;width:min(1100px,100%);max-height:92vh;border-radius:14px;background:#fcfbfa;box-shadow:0 24px 60px rgba(39,27,21,.35);overflow:hidden}"
    + ".lst-cabecera{display:flex;align-items:center;justify-content:space-between;gap:.8rem;padding:1rem 1.2rem .6rem;background:#fff;border-bottom:1px solid #eee4da}.lst-cabecera h2{margin:0;font-size:1.15rem;color:#35251d}"
    + ".lst-filtros{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;padding:.8rem 1.2rem;background:#fff;border-bottom:1px solid #eee4da}"
    + ".lst-filtros input[type=search],.lst-filtros input[type=date],.lst-filtros select{height:42px;padding:0 .8rem;border:1px solid #e0d4c4;border-radius:9px;background:#fff;font-size:.85rem}"
    + ".lst-filtros .lst-buscar{flex:1 1 260px;min-width:0}.lst-filtros .lst-buscar input{width:100%}"
    + ".lst-grupo{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center}.lst-grupo span{color:#7a6a5f;font-size:.76rem;font-weight:800;text-transform:uppercase}"
    + ".lst-chip{padding:.45rem .8rem;border:1px solid #e0d4c4;border-radius:999px;background:#fff;color:#5b4030;font-size:.8rem;font-weight:700;cursor:pointer}.lst-chip.is-activo{border-color:#b8893f;background:#f6ead3;color:#7a5a20}"
    + ".lst-cuerpo{flex:1;overflow:auto;padding:1rem 1.2rem}.lst-total{padding:0 1.2rem .6rem;color:#7a6a5f;font-size:.82rem}"
    + ".lst-vacio{padding:1.4rem;text-align:center;color:#8b7a6c}.lst-mas{display:block;margin:1rem auto 0}"
    + "@media (max-width:640px){.lst-caja{max-height:96vh}.lst-filtros{gap:.45rem}.lst-filtros input,.lst-filtros select{height:38px}}";
  document.head.appendChild(estilo);

  // ---- Datos ----
  const proyectoActual = () => {
    const id = bridge()?.getView?.()?.selectedProjectId;
    const estado = leer();
    return { estado, proyecto: (estado?.projects || []).find((p) => p.id === id) || null };
  };
  const specsDe = (estado, projectId) => (estado?.specs || []).filter((s) => s.projectId === projectId);
  const ordenesDe = (estado, projectId) => (estado?.orders || []).filter((o) => o.projectId === projectId);
  // Los últimos son los más nuevos: por fecha de creación y, si no la tienen, por el orden de la lista.
  const ultimos = (lista, campo) => lista.map((x, i) => ({ x, i })).sort((a, b) => {
    const fa = Date.parse(a.x[campo] || "") || 0, fb = Date.parse(b.x[campo] || "") || 0;
    return fb - fa || b.i - a.i;
  }).map((p) => p.x);

  const rubrosDisponibles = (proyecto, equipo) => {
    const propios = (Array.isArray(proyecto?.rubrosPropios) ? proyecto.rubrosPropios : []).map((n) => ({ name: String(n), team: "" }));
    let cat = [];
    try { cat = (bridge()?.getRubros() || []).map((r) => ({ name: r.name, team: r.team === "FFE" ? "FFE" : "OSE" })); } catch { cat = []; }
    const todos = [...propios, ...cat];
    const vistos = new Set();
    return todos.filter((r) => {
      if (equipo && r.team && r.team !== equipo) return false;
      const k = norm(r.name);
      if (!k || vistos.has(k)) return false;
      vistos.add(k);
      return true;
    });
  };

  // ---- Cuadro emergente con el registro completo ----
  function abrirCuadro({ titulo, filtros, cuenta, dibujar }) {
    document.querySelector(".lst-fondo")?.remove();
    const fondo = document.createElement("div");
    fondo.className = "lst-fondo";
    fondo.innerHTML = `<section class="lst-caja" role="dialog" aria-modal="true"><header class="lst-cabecera"><h2>${titulo}</h2><button type="button" class="ghost" data-lst-cerrar>✕</button></header><div class="lst-filtros">${filtros}</div><p class="lst-total" data-lst-total></p><div class="lst-cuerpo" data-lst-cuerpo></div></section>`;
    document.body.appendChild(fondo);
    const cuerpo = fondo.querySelector("[data-lst-cuerpo]");
    const total = fondo.querySelector("[data-lst-total]");
    let mostrados = 0, lista = [];

    const pintarMas = () => {
      const trozo = lista.slice(mostrados, mostrados + PAGINA);
      if (trozo.length) cuerpo.insertAdjacentHTML("beforeend", dibujar(trozo));
      mostrados += trozo.length;
      fondo.querySelector("[data-lst-mas]")?.remove();
      if (mostrados < lista.length) {
        cuerpo.insertAdjacentHTML("beforeend", `<button type="button" class="secondary lst-mas" data-lst-mas>${es("Mostrar más", "Show more")} (${lista.length - mostrados})</button>`);
      }
    };
    const refrescar = () => {
      lista = cuenta(fondo);
      mostrados = 0;
      cuerpo.innerHTML = lista.length ? "" : `<p class="lst-vacio">${es("No hay registros con esos filtros.", "No records match these filters.")}</p>`;
      total.textContent = `${lista.length} ${es(lista.length === 1 ? "registro" : "registros", lista.length === 1 ? "record" : "records")}`;
      pintarMas();
    };

    fondo.addEventListener("click", (event) => {
      if (event.target === fondo || event.target.closest("[data-lst-cerrar]")) { fondo.remove(); return; }
      if (event.target.closest("[data-lst-mas]")) { event.preventDefault(); pintarMas(); return; }
      const chip = event.target.closest(".lst-chip");
      if (chip) {
        event.preventDefault();
        chip.parentElement.querySelectorAll(".lst-chip").forEach((x) => x.classList.toggle("is-activo", x === chip));
        refrescar();
      }
    });
    fondo.addEventListener("input", (event) => { if (event.target.closest(".lst-filtros")) refrescar(); });
    fondo.addEventListener("change", (event) => { if (event.target.closest(".lst-filtros")) refrescar(); });
    cuerpo.addEventListener("scroll", () => {
      if (cuerpo.scrollTop + cuerpo.clientHeight > cuerpo.scrollHeight - 200) fondo.querySelector("[data-lst-mas]")?.click();
    });
    document.addEventListener("keydown", function salir(e) { if (e.key === "Escape") { fondo.remove(); document.removeEventListener("keydown", salir); } });
    refrescar();
    return fondo;
  }

  const chips = (etiqueta, opciones, clave) => `<div class="lst-grupo" data-lst-grupo="${clave}"><span>${etiqueta}</span>${opciones.map((o, i) => `<button type="button" class="lst-chip${i === 0 ? " is-activo" : ""}" data-valor="${esc(o.valor)}">${esc(o.texto)}</button>`).join("")}</div>`;
  const valorChip = (fondo, clave) => fondo.querySelector(`[data-lst-grupo="${clave}"] .lst-chip.is-activo`)?.dataset.valor || "";

  // ---- Specs ----
  function abrirSpecs() {
    const { estado, proyecto } = proyectoActual();
    if (!proyecto) return;
    const filtros = `<label class="lst-buscar"><input type="search" data-lst-q placeholder="${es("Buscar por nombre, código o proveedor...", "Search by name, code or supplier...")}"></label>`
      + chips(es("Equipo", "Team"), [{ valor: "", texto: es("Todos", "All") }, { valor: "FFE", texto: "FF&E" }, { valor: "OSE", texto: "OS&E" }], "equipo")
      + `<select data-lst-rubro><option value="">${es("Todos los rubros", "All categories")}</option></select>`;
    const fondo = abrirCuadro({
      titulo: es("Specs registrados", "Registered specs"),
      filtros,
      cuenta: (caja) => {
        const q = norm(caja.querySelector("[data-lst-q]").value);
        const equipo = valorChip(caja, "equipo");
        const rubro = norm(caja.querySelector("[data-lst-rubro]").value);
        const actual = leer();
        return ultimos(specsDe(actual, proyecto.id), "createdAt").filter((s) => {
          if (equipo && equipoDe(s.procurementTeam) !== equipo) return false;
          if (rubro && norm(s.category) !== rubro) return false;
          if (!q) return true;
          return norm([s.name, s.code, s.productCode, s.vendorSource, s.category, s.area].join(" ")).includes(q);
        });
      },
      dibujar: (trozo) => bridge()?.specCardsHtml?.(trozo) || "",
    });
    // El filtro de rubros se rearma con el equipo elegido.
    const select = fondo.querySelector("[data-lst-rubro]");
    const llenarRubros = () => {
      const equipo = valorChip(fondo, "equipo");
      const elegido = select.value;
      select.innerHTML = `<option value="">${es("Todos los rubros", "All categories")}</option>`
        + rubrosDisponibles(proyecto, equipo).map((r) => `<option value="${esc(r.name)}"${r.name === elegido ? " selected" : ""}>${esc(r.name)}</option>`).join("");
      select.setAttribute("translate", "no");
    };
    llenarRubros();
    fondo.addEventListener("click", (e) => { if (e.target.closest('[data-lst-grupo="equipo"] .lst-chip')) llenarRubros(); });
  }

  // ---- Requerimientos de pago ----
  // Viven dentro del proyecto (project.invoices). El equipo sale de la OC a la que pertenecen.
  function abrirRequerimientos() {
    const { proyecto } = proyectoActual();
    if (!proyecto) return;
    const ordenDe = (estado, invoice) => (estado?.orders || []).find((o) =>
      (invoice.orderId && o.id === invoice.orderId) || (invoice.poNumber && o.number === invoice.poNumber)) || null;
    const filtros = `<label class="lst-buscar"><input type="search" data-lst-q placeholder="${es("Buscar por N° de requerimiento, OC, factura o proveedor...", "Search by request no., PO, invoice or supplier...")}"></label>`
      + chips(es("Pago", "Payment"), [
        { valor: "", texto: es("Todos", "All") },
        { valor: "pagado", texto: es("Con pago registrado", "Payment recorded") },
        { valor: "pendiente", texto: es("Sin pago", "Not paid") },
      ], "pago")
      + chips(es("Equipo", "Team"), [{ valor: "", texto: es("Todos", "All") }, { valor: "FFE", texto: "FF&E" }, { valor: "OSE", texto: "OS&E" }], "equipo")
      + `<div class="lst-grupo"><span>${es("Solicitado", "Requested")}</span><input type="date" data-lst-desde aria-label="${es("Desde", "From")}"><input type="date" data-lst-hasta aria-label="${es("Hasta", "To")}"></div>`;
    abrirCuadro({
      titulo: es("Requerimientos de pago registrados", "Registered payment requests"),
      filtros,
      cuenta: (caja) => {
        const q = norm(caja.querySelector("[data-lst-q]").value);
        const pago = valorChip(caja, "pago");
        const equipo = valorChip(caja, "equipo");
        const desde = caja.querySelector("[data-lst-desde]").value ? aFecha(caja.querySelector("[data-lst-desde]").value) : null;
        const hasta = caja.querySelector("[data-lst-hasta]").value ? aFecha(caja.querySelector("[data-lst-hasta]").value) : null;
        const actual = leer();
        const proyectoActualizado = (actual?.projects || []).find((p) => p.id === proyecto.id) || proyecto;
        return ultimos(proyectoActualizado.invoices || [], "createdAt").filter((inv) => {
          const tienePago = String(inv.paidAmount ?? "").trim() !== "" || Boolean(inv.paymentRegisteredAt);
          if (pago === "pagado" && !tienePago) return false;
          if (pago === "pendiente" && tienePago) return false;
          if (equipo) {
            const orden = ordenDe(actual, inv);
            if (!orden || equipoDe(orden.ocTeam) !== equipo) return false;
          }
          const fecha = aFecha(inv.requestDate || inv.createdAt);
          if (desde !== null && (fecha === null || fecha < desde)) return false;
          if (hasta !== null && (fecha === null || fecha > hasta)) return false;
          if (!q) return true;
          return norm([inv.number, inv.poNumber, inv.poReferenceArea, inv.invoiceNumber, inv.payableTo, inv.paymentPayableTo, inv.sourceManufacturer].join(" ")).includes(q);
        });
      },
      dibujar: (trozo) => bridge()?.invoiceCardsHtml?.(trozo) || "",
    });
  }

  // ---- Órdenes de compra ----
  function abrirOrdenes() {
    const { proyecto } = proyectoActual();
    if (!proyecto) return;
    const filtros = `<label class="lst-buscar"><input type="search" data-lst-q placeholder="${es("Buscar por N° de orden o proveedor...", "Search by PO number or supplier...")}"></label>`
      + chips(es("Estado", "Status"), [
        { valor: "", texto: es("Todas", "All") },
        { valor: "approved", texto: es("Aprobada", "Approved") },
        { valor: "cancelled", texto: es("Anulada", "Cancelled") },
        { valor: "pending", texto: es("Pendiente", "Pending") },
      ], "estado")
      + chips(es("Equipo", "Team"), [{ valor: "", texto: es("Todos", "All") }, { valor: "FFE", texto: "FF&E" }, { valor: "OSE", texto: "OS&E" }], "equipo")
      + `<div class="lst-grupo"><span>${es("Emitida", "Issued")}</span><input type="date" data-lst-desde aria-label="${es("Desde", "From")}"><input type="date" data-lst-hasta aria-label="${es("Hasta", "To")}"></div>`;
    abrirCuadro({
      titulo: es("Órdenes de compra registradas", "Registered purchase orders"),
      filtros,
      cuenta: (caja) => {
        const q = norm(caja.querySelector("[data-lst-q]").value);
        const estadoFiltro = valorChip(caja, "estado");
        const equipo = valorChip(caja, "equipo");
        const desde = caja.querySelector("[data-lst-desde]").value ? aFecha(caja.querySelector("[data-lst-desde]").value) : null;
        const hasta = caja.querySelector("[data-lst-hasta]").value ? aFecha(caja.querySelector("[data-lst-hasta]").value) : null;
        const actual = leer();
        return ultimos(ordenesDe(actual, proyecto.id), "createdAt").filter((o) => {
          const estadoOC = o.isDraft ? "draft" : String(o.status || "approved").toLowerCase();
          if (estadoFiltro && estadoOC !== estadoFiltro) return false;
          if (equipo && equipoDe(o.ocTeam) !== equipo) return false;
          const fecha = aFecha(o.date || o.createdAt);
          if (desde !== null && (fecha === null || fecha < desde)) return false;
          if (hasta !== null && (fecha === null || fecha > hasta)) return false;
          if (!q) return true;
          return norm([o.number, o.supplier, o.manufacturer, o.source, o.trackingNumber].join(" ")).includes(q);
        });
      },
      dibujar: (trozo) => bridge()?.orderCardsHtml?.(trozo) || "",
    });
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-lst-ver-specs]")) { event.preventDefault(); abrirSpecs(); return; }
    if (event.target.closest("[data-lst-ver-oc]")) { event.preventDefault(); abrirOrdenes(); return; }
    if (event.target.closest("[data-lst-ver-rp]")) { event.preventDefault(); abrirRequerimientos(); }
  });

  // La ficha técnica, la orden y el requerimiento se abren en el cuadro de siempre (#modal-root).
  // Mientras haya uno abierto, este cuadro se queda DETRÁS (pedido de Datnya, 25-sep-2026: la ficha
  // se abría por debajo y había que cerrar el registro para verla). Al cerrarlo, vuelve al frente.
  const raizModal = document.getElementById("modal-root");
  const ordenarCapas = () => {
    const fondo = document.querySelector(".lst-fondo");
    if (!fondo) return;
    fondo.classList.toggle("lst-atras", Boolean(raizModal && raizModal.querySelector(".modal-backdrop")));
  };
  if (raizModal) new MutationObserver(ordenarCapas).observe(raizModal, { childList: true, subtree: true });
})();
