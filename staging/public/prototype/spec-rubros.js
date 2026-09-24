// Campo «Rubro del spec» (23-sep-2026, pedido de Datnya):
// - se escribe para buscar y se elige de una lista, sin la división OS&E / FF&E;
// - el botón «+» agrega un rubro que queda guardado EN ESE PROYECTO (project.rubrosPropios), así
//   aparece en todos los specs de ese proyecto, nuevos o editados;
// - cada rubro de la lista trae un ✕ que lo elimina (pregunta antes): si es del proyecto sale de su
//   lista; si es del catálogo se guarda como quitado en «vaak-removed-oc-rubros» (se sincroniza).
// El <select name="category"> original sigue existiendo (oculto): guarda el valor, así el resto de
// la plataforma —guardado, revisiones, ficha técnica— no cambia.
(() => {
  "use strict";
  const STORE = "vaak-local-v8";
  const QUITADOS = "vaak-removed-oc-rubros";
  const bridge = () => window.VAAKAppBridge;
  const spanish = () => {
    try {
      const id = sessionStorage.getItem("vaak-session-tab-v1");
      const stored = localStorage.getItem("vaak-language-" + (id || "guest"));
      return stored ? stored === "es" : document.documentElement.lang === "es";
    } catch { return false; }
  };
  const es = (a, b) => (spanish() ? a : b);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const leer = () => { try { return JSON.parse(localStorage.getItem(STORE) || "null"); } catch { return null; } };
  const norm = (v) => String(v || "").trim().toLowerCase();
  const esAdmin = () => bridge()?.getView()?.user?.role === "Admin";

  const proyectoDe = (form) => {
    const op = bridge()?.getActiveOperation();
    const id = op?.target?.projectId || form?.dataset.projectId || bridge()?.getView()?.selectedProjectId;
    return (leer()?.projects || []).find((p) => p.id === id) || null;
  };
  const rubrosDelProyecto = (project) => (Array.isArray(project?.rubrosPropios) ? project.rubrosPropios : []).map((x) => String(x || "").trim()).filter(Boolean);
  const catalogo = () => { try { return bridge()?.getRubros() || []; } catch { return []; } };

  // Lista que se muestra: el catálogo (sin los quitados, eso ya lo filtra getRubros) y los del proyecto.
  function opciones(project) {
    const propios = rubrosDelProyecto(project).map((name) => ({ name, propio: true }));
    const cat = catalogo().map((r) => ({ name: r.name, code: r.code, propio: false }));
    const vistos = new Set();
    return [...propios, ...cat].filter((r) => { const k = norm(r.name); if (vistos.has(k)) return false; vistos.add(k); return true; });
  }

  function guardarProyecto(projectId, cambiar) {
    const state = leer();
    const project = (state?.projects || []).find((p) => p.id === projectId);
    if (!project) return es("El proyecto ya no existe. Recarga la página.", "The project no longer exists. Reload the page.");
    cambiar(project);
    state.meta = { ...(state.meta || {}), storeRevision: Number(state.meta?.storeRevision || 0) + 1 };
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { return es("No se pudo guardar en este navegador.", "Could not save in this browser."); }
    return "";
  }

  function quitarDelCatalogo(code, name) {
    try {
      const quitados = JSON.parse(localStorage.getItem(QUITADOS) || "[]");
      const marca = code || name;
      if (!quitados.includes(marca)) quitados.push(marca);
      localStorage.setItem(QUITADOS, JSON.stringify(quitados));
      const custom = JSON.parse(localStorage.getItem("vaak-custom-oc-rubros") || "[]").filter((r) => r.code !== code && r.name !== name);
      localStorage.setItem("vaak-custom-oc-rubros", JSON.stringify(custom));
      return "";
    } catch { return es("No se pudo guardar el cambio.", "The change could not be saved."); }
  }

  const estilo = document.createElement("style");
  estilo.textContent = ".sr-combo{position:relative;flex:1;min-width:0}.sr-combo input{width:100%}"
    + ".sr-list{position:absolute;z-index:40;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;border:1px solid #e0d4c4;border-radius:10px;background:#fff;box-shadow:0 14px 32px rgba(39,27,21,.18)}"
    + ".sr-row{display:flex;align-items:center;gap:.4rem;border-bottom:1px solid #f1e9de}.sr-row:last-child{border-bottom:0}"
    + ".sr-pick{flex:1;min-width:0;padding:.55rem .7rem;border:0;background:none;text-align:left;font-size:.84rem;color:#4f4038;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
    + ".sr-row:hover .sr-pick,.sr-pick:focus{background:#faf5ee}.sr-row.is-selected .sr-pick{font-weight:800;color:#8a6a33}"
    + ".sr-own{margin-left:.4rem;padding:.05rem .35rem;border-radius:6px;background:#f2e7d5;color:#7a5a20;font-size:.62rem;font-weight:800;text-transform:uppercase}"
    + ".sr-del{flex:0 0 auto;margin-right:.35rem;padding:.2rem .45rem;border:0;border-radius:6px;background:none;color:#b42318;font-size:.85rem;font-weight:800;cursor:pointer}.sr-del:hover{background:#fdecea}"
    + ".sr-empty{padding:.6rem .7rem;color:#8b7a6c;font-size:.8rem}";
  document.head.appendChild(estilo);

  function preguntar(texto, alConfirmar) {
    document.querySelectorAll(".vaak-confirm-backdrop[data-sr-confirm]").forEach((x) => x.remove());
    const fondo = document.createElement("div");
    fondo.className = "vaak-confirm-backdrop";
    fondo.dataset.srConfirm = "1";
    fondo.innerHTML = `<div class="vaak-confirm" role="alertdialog" aria-modal="true"><div class="vaak-confirm-head"><span class="vaak-confirm-icon" aria-hidden="true">!</span><h3>${es("Eliminar rubro", "Delete category")}</h3></div><div class="vaak-confirm-body"><p>${texto}</p><p>${es("Los specs y las órdenes que ya lo usan no cambian.", "Specs and orders already using it are not changed.")}</p></div><div class="vaak-confirm-foot"><button type="button" class="secondary" data-sr-no>${es("Cancelar", "Cancel")}</button><button type="button" class="danger" data-sr-yes>${es("Sí, eliminar", "Yes, delete")}</button></div></div>`;
    document.body.appendChild(fondo);
    fondo.addEventListener("click", (e) => {
      if (e.target.closest("[data-sr-no]")) { fondo.remove(); return; }
      if (e.target.closest("[data-sr-yes]")) { fondo.remove(); alConfirmar(); }
    });
  }

  function pedirNombre(alConfirmar) {
    document.querySelectorAll(".vaak-confirm-backdrop[data-sr-nuevo]").forEach((x) => x.remove());
    const fondo = document.createElement("div");
    fondo.className = "vaak-confirm-backdrop";
    fondo.dataset.srNuevo = "1";
    fondo.innerHTML = `<div class="vaak-confirm" role="dialog" aria-modal="true"><div class="vaak-confirm-head"><span class="vaak-confirm-icon" aria-hidden="true">+</span><h3>${es("Agregar rubro", "Add category")}</h3></div><div class="vaak-confirm-body"><p>${es("El rubro quedará disponible en los specs de este proyecto.", "The category will be available in the specs of this project.")}</p><label class="field"><input data-sr-nombre type="text" maxlength="60" autocomplete="off" placeholder="${es("Nombre del rubro (por ejemplo: ILUMINACIÓN)", "Category name (for example: LIGHTING)")}"></label><p class="vaak-demo-error" data-sr-error hidden></p></div><div class="vaak-confirm-foot"><button type="button" class="secondary" data-sr-no>${es("Cancelar", "Cancel")}</button><button type="button" class="primary" data-sr-ok>${es("Agregar", "Add")}</button></div></div>`;
    document.body.appendChild(fondo);
    const campo = fondo.querySelector("[data-sr-nombre]");
    campo.focus();
    const fallar = (t) => { const p = fondo.querySelector("[data-sr-error]"); p.textContent = t; p.hidden = false; campo.focus(); };
    const aceptar = () => {
      const nombre = campo.value.trim();
      if (!nombre) return fallar(es("Escribe el nombre del rubro.", "Type the category name."));
      const error = alConfirmar(nombre);
      if (error) return fallar(error);
      fondo.remove();
    };
    fondo.addEventListener("click", (e) => {
      if (e.target.closest("[data-sr-no]")) { fondo.remove(); return; }
      if (e.target.closest("[data-sr-ok]")) aceptar();
    });
    campo.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); aceptar(); } });
  }

  function montar(select) {
    if (select.dataset.srListo) return;
    select.dataset.srListo = "1";
    const form = select.closest("form");
    const caja = select.closest(".rubro-dynamic-select") || select.parentElement;
    select.hidden = true;
    const combo = document.createElement("div");
    combo.className = "sr-combo";
    combo.innerHTML = `<input type="text" class="sr-input" autocomplete="off" translate="no" placeholder="${es("Busca o elige un rubro...", "Search or pick a category...")}"><div class="sr-list notranslate" translate="no" hidden></div>`;
    select.after(combo);
    const campo = combo.querySelector(".sr-input");
    const lista = combo.querySelector(".sr-list");

    const elegido = () => select.value;
    const pintar = (filtro = "") => {
      const project = proyectoDe(form);
      const q = norm(filtro);
      const items = opciones(project).filter((r) => !q || norm(r.name).includes(q));
      const puedeBorrar = esAdmin();
      lista.innerHTML = items.length
        ? items.map((r) => `<div class="sr-row${norm(r.name) === norm(elegido()) ? " is-selected" : ""}"><button type="button" class="sr-pick" data-sr-pick="${esc(r.name)}">${esc(r.name)}${r.propio ? `<span class="sr-own">${es("proyecto", "project")}</span>` : ""}</button>${puedeBorrar ? `<button type="button" class="sr-del" data-sr-del="${esc(r.name)}" data-sr-code="${esc(r.code || "")}" data-sr-own="${r.propio ? "1" : ""}" title="${es("Eliminar rubro", "Delete category")}">✕</button>` : ""}</div>`).join("")
        : `<p class="sr-empty">${es("No hay rubros con ese texto. Usa «+» para agregarlo.", "No categories match. Use «+» to add it.")}</p>`;
    };
    // Al enfocar se ve la lista completa y el texto queda seleccionado para escribir encima.
    const abrir = () => { pintar(""); lista.hidden = false; campo.select?.(); };
    const cerrar = () => { lista.hidden = true; campo.value = elegido() || ""; };

    const asegurarOpcion = (nombre) => {
      if ([...select.options].some((o) => o.value === nombre)) return;
      const opcion = document.createElement("option");
      opcion.value = nombre; opcion.textContent = nombre;
      const otros = [...select.options].find((o) => o.value === "Otros");
      if (otros) select.insertBefore(opcion, otros); else select.appendChild(opcion);
    };
    const seleccionar = (nombre) => {
      asegurarOpcion(nombre);
      select.value = nombre;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      campo.value = nombre;
      lista.hidden = true;
    };

    combo.addEventListener("sr-elegir", (e) => seleccionar(e.detail));
    campo.value = elegido() === "Otros" ? "" : elegido() || "";
    campo.addEventListener("focus", abrir);
    campo.addEventListener("input", () => { pintar(campo.value); lista.hidden = false; });
    campo.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { cerrar(); return; }
      if (e.key === "Enter") {
        e.preventDefault();
        const primero = lista.querySelector("[data-sr-pick]");
        if (primero) seleccionar(primero.dataset.srPick);
      }
    });
    document.addEventListener("click", (e) => { if (!combo.contains(e.target) && !lista.hidden) cerrar(); }, true);

    lista.addEventListener("click", (e) => {
      const pick = e.target.closest("[data-sr-pick]");
      if (pick) { e.preventDefault(); seleccionar(pick.dataset.srPick); return; }
      const del = e.target.closest("[data-sr-del]");
      if (!del) return;
      e.preventDefault();
      const nombre = del.dataset.srDel, code = del.dataset.srCode, propio = del.dataset.srOwn === "1";
      const texto = propio
        ? es(`¿Eliminar «${esc(nombre)}» de los rubros de este proyecto?`, `Remove «${esc(nombre)}» from this project's categories?`)
        : es(`¿Eliminar «${esc(nombre)}» del catálogo? Dejará de aparecer en todos los proyectos.`, `Delete «${esc(nombre)}» from the catalog? It will no longer appear in any project.`);
      preguntar(texto, () => {
        const project = proyectoDe(form);
        const error = propio
          ? guardarProyecto(project?.id, (p) => { p.rubrosPropios = (p.rubrosPropios || []).filter((x) => norm(x) !== norm(nombre)); })
          : quitarDelCatalogo(code, nombre);
        if (error) return;
        if (norm(elegido()) === norm(nombre)) { select.value = ""; campo.value = ""; }
        pintar(campo.value);
      });
    });

    combo.dataset.srForm = "1";
  }

  // El «+» del campo: el manejador viejo de app.js escucha en document y corta la propagación, así
  // que este se registra en window (la fase de captura pasa antes por window).
  window.addEventListener("click", (event) => {
    const mas = event.target.closest?.("[data-add-rubro]");
    if (!mas) return;
    const caja = mas.closest(".rubro-dynamic-select");
    const select = caja?.querySelector("select[name='category']");
    const combo = caja?.querySelector(".sr-combo");
    if (!select || !combo) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const form = select.closest("form");
    const project = proyectoDe(form);
    if (!project) return;
    pedirNombre((nombre) => {
      if (opciones(project).some((r) => norm(r.name) === norm(nombre))) return es("Ese rubro ya está en la lista.", "That category is already in the list.");
      const error = guardarProyecto(project.id, (p) => { p.rubrosPropios = [...new Set([...(p.rubrosPropios || []), nombre])]; });
      if (error) return error;
      combo.dispatchEvent(new CustomEvent("sr-elegir", { detail: nombre }));
      return "";
    });
  }, true);

  const revisar = () => document.querySelectorAll("#modal-root select.spec-rubro-select, #modal-root select[name='category']").forEach(montar);
  const raiz = document.getElementById("modal-root");
  if (raiz) new MutationObserver(revisar).observe(raiz, { childList: true, subtree: true });
  revisar();
})();
