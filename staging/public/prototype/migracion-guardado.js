// Tarjeta «Guardado de la plataforma» en Configuración del sistema (solo administrador).
// Etapa 1 de la migración (25-sep-2026): pasa cada spec, orden de compra y requerimiento de pago
// a su propia fila de la base, y permite volver atrás. La plataforma hace la copia, la verifica
// campo por campo y, si algo no coincide, no cambia nada.
// Ver docs/migracion/PLAN-MIGRACION-GUARDADO.md.
(() => {
  "use strict";
  const bridge = () => window.VAAKAppBridge;
  const remoto = () => window.VAAKRemote;
  const spanish = () => {
    try {
      const id = sessionStorage.getItem("vaak-session-tab-v1");
      const v = localStorage.getItem("vaak-language-" + (id || "guest"));
      return v ? v === "es" : document.documentElement.lang === "es";
    } catch { return false; }
  };
  const es = (a, b) => (spanish() ? a : b);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const esAdmin = () => bridge()?.getView?.()?.user?.role === "Admin";

  const estilo = document.createElement("style");
  estilo.textContent = ".mig-tabla{width:100%;margin:.8rem 0;border-collapse:collapse;font-size:.85rem}"
    + ".mig-tabla th,.mig-tabla td{padding:.45rem .6rem;border-bottom:1px solid #eee4da;text-align:left}"
    + ".mig-tabla th{color:#7a6a5f;font-size:.74rem;text-transform:uppercase;letter-spacing:.03em}"
    + ".mig-acciones{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:.8rem}"
    + ".mig-aviso{margin-top:.8rem;padding:.7rem .85rem;border-radius:9px;font-size:.84rem;line-height:1.45}"
    + ".mig-aviso.ok{background:#eef7ee;color:#2f6b34;border:1px solid #cfe6d0}"
    + ".mig-aviso.mal{background:#fdecea;color:#b42318;border:1px solid #f4c7c2}"
    + ".mig-estado{color:#7a6a5f;font-size:.82rem}";
  document.head.appendChild(estilo);

  let contando = false;

  async function contar(tarjeta) {
    if (contando) return;
    contando = true;
    try {
      const datos = await remoto().request("/api/admin/registros");
      const filas = datos.enFilas || {}, doc = datos.enDocumento || {};
      const linea = (etiqueta, clave) => `<tr><td>${etiqueta}</td><td>${Number(filas[clave] || 0).toLocaleString("es-PE")}</td><td>${Number(doc[clave] || 0).toLocaleString("es-PE")}</td></tr>`;
      tarjeta.querySelector("[data-mig-tabla]").innerHTML =
        `<table class="mig-tabla"><thead><tr><th>${es("Registro", "Record")}</th><th>${es("En su propia fila", "In its own row")}</th><th>${es("Todavía en el documento", "Still in the document")}</th></tr></thead><tbody>`
        + linea(es("Specs", "Specs"), "spec") + linea(es("Órdenes de compra", "Purchase orders"), "order") + linea(es("Requerimientos de pago", "Payment requests"), "invoice")
        + `</tbody></table>`;
      const pendientes = (doc.spec || 0) + (doc.order || 0) + (doc.invoice || 0);
      const migrados = (filas.spec || 0) + (filas.order || 0) + (filas.invoice || 0);
      tarjeta.querySelector("[data-mig-estado]").textContent = !datos.tabla
        ? es("La tabla nueva todavía no está creada en la base de datos.", "The new table is not created in the database yet.")
        : pendientes > 0
          ? es(`Faltan ${pendientes} registros por pasar a su fila.`, `${pendientes} records still to move.`)
          : es(`Todo está guardado por filas (${migrados} registros).`, `Everything is stored in rows (${migrados} records).`);
      tarjeta.querySelector("[data-mig-migrar]").disabled = !datos.tabla || pendientes === 0;
      tarjeta.querySelector("[data-mig-revertir]").disabled = !datos.tabla || migrados === 0;
    } catch (e) {
      tarjeta.querySelector("[data-mig-estado]").textContent = es("No se pudo leer el estado del guardado.", "Could not read the storage status.");
    } finally { contando = false; }
  }

  function avisar(tarjeta, texto, bien) {
    const caja = tarjeta.querySelector("[data-mig-aviso]");
    caja.className = "mig-aviso " + (bien ? "ok" : "mal");
    caja.innerHTML = texto;
    caja.hidden = false;
  }

  async function ejecutar(tarjeta, boton, ruta, textoOcupado) {
    const original = boton.innerHTML;
    boton.disabled = true;
    boton.innerHTML = `<span class="login-spinner" aria-hidden="true"></span>${textoOcupado}`;
    try {
      const datos = await remoto().request(ruta, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const r = datos.registros;
      avisar(tarjeta, r
        ? es(`Listo y verificado: ${r.spec} specs, ${r.order} órdenes de compra y ${r.invoice} requerimientos de pago pasaron a su propia fila. La plataforma comprobó que devuelve exactamente los mismos datos que antes.`,
             `Done and verified: ${r.spec} specs, ${r.order} purchase orders and ${r.invoice} payment requests moved to their own row. The platform checked that it returns exactly the same data as before.`)
        : es("Listo y verificado: los registros volvieron al documento y no se perdió nada.", "Done and verified: the records went back into the document and nothing was lost."), true);
    } catch (e) {
      const motivo = e?.code === "sin_tabla" ? es("falta crear la tabla nueva en la base de datos", "the new table is not created yet")
        : e?.code === "verificacion_fallida" ? es("la comprobación no coincidió, así que NO se cambió nada", "the check did not match, so nothing was changed")
        : e?.code === "no_cabe" ? es("ya hay más datos de los que entran en el documento único: no se puede volver atrás", "there is already more data than fits in the single document: it cannot be reverted")
        : e?.code === "forbidden" ? es("solo un administrador puede hacerlo", "only an administrator can do this")
        : (e?.code || es("error del servidor", "server error"));
      avisar(tarjeta, es(`No se hizo el cambio: ${motivo}.`, `The change was not made: ${motivo}.`), false);
    } finally {
      boton.disabled = false;
      boton.innerHTML = original;
      contar(tarjeta);
    }
  }

  function preguntar(texto, alConfirmar) {
    document.querySelectorAll(".vaak-confirm-backdrop[data-mig-confirm]").forEach((x) => x.remove());
    const fondo = document.createElement("div");
    fondo.className = "vaak-confirm-backdrop";
    fondo.dataset.migConfirm = "1";
    fondo.innerHTML = `<div class="vaak-confirm" role="alertdialog" aria-modal="true"><div class="vaak-confirm-head"><span class="vaak-confirm-icon" aria-hidden="true">!</span><h3>${es("Cambiar el guardado", "Change the storage")}</h3></div><div class="vaak-confirm-body"><p>${texto}</p><p>${es("Nada se borra: la plataforma copia, comprueba y solo entonces guarda el cambio. Si algo no coincide, no cambia nada.", "Nothing is deleted: the platform copies, checks and only then saves the change. If anything does not match, nothing changes.")}</p></div><div class="vaak-confirm-foot"><button type="button" class="secondary" data-mig-no>${es("Cancelar", "Cancel")}</button><button type="button" class="primary" data-mig-si>${es("Sí, continuar", "Yes, continue")}</button></div></div>`;
    document.body.appendChild(fondo);
    fondo.addEventListener("click", (e) => {
      if (e.target.closest("[data-mig-no]")) { fondo.remove(); return; }
      if (e.target.closest("[data-mig-si]")) { fondo.remove(); alConfirmar(); }
    });
  }

  function poner() {
    if (!esAdmin() || !remoto()) return;
    const pantalla = document.querySelector(".user-management");
    if (!pantalla || !document.querySelector(".settings-card") || document.querySelector(".mig-card")) return;
    const tarjeta = document.createElement("article");
    tarjeta.className = "panel settings-card mig-card";
    tarjeta.innerHTML = `<div class="settings-rubros-head"><div><h2>${es("Guardado de la plataforma", "Platform storage")}</h2>`
      + `<p>${es("Cada spec, orden de compra y requerimiento de pago pasa a tener su propia fila en la base de datos, en vez de vivir todos dentro de un mismo documento. Así la plataforma puede guardar muchos más registros. Las pantallas no cambian en nada.", "Each spec, purchase order and payment request gets its own row in the database instead of living inside a single document. That lets the platform store far more records. No screen changes.")}</p></div></div>`
      + `<div data-mig-tabla></div><p class="mig-estado" data-mig-estado>${es("Leyendo…", "Reading…")}</p>`
      + `<div class="mig-acciones"><button type="button" class="primary" data-mig-migrar disabled>${es("Pasar los registros a su propia fila", "Move records to their own row")}</button>`
      + `<button type="button" class="secondary" data-mig-revertir disabled>${es("Volver atrás", "Undo")}</button></div>`
      + `<p class="mig-aviso" data-mig-aviso hidden></p>`;
    pantalla.appendChild(tarjeta);
    tarjeta.addEventListener("click", (event) => {
      const migrar = event.target.closest("[data-mig-migrar]");
      const revertir = event.target.closest("[data-mig-revertir]");
      if (migrar) {
        preguntar(es("Se va a copiar cada spec, orden de compra y requerimiento de pago a su propia fila.", "Each spec, purchase order and payment request will be copied to its own row."),
          () => ejecutar(tarjeta, migrar, "/api/admin/migrar-registros", es("Pasando…", "Moving…")));
      } else if (revertir) {
        preguntar(es("Se van a devolver todos los registros al documento único, como estaban antes.", "All records will be moved back into the single document, as they were before."),
          () => ejecutar(tarjeta, revertir, "/api/admin/revertir-registros", es("Volviendo…", "Undoing…")));
      }
    });
    contar(tarjeta);
  }

  const app = document.getElementById("app");
  if (app) new MutationObserver(poner).observe(app, { childList: true, subtree: true });
  poner();
})();
