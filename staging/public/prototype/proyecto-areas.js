// Áreas de cada proyecto (pedido de Datnya, 18-sep-2026).
// - Las áreas son los rubros de «Configuración del sistema → Rubros de órdenes de compra».
// - Cada proyecto guarda los códigos de sus áreas en `areaCodes` (datos compartidos).
//   Si el proyecto aún no tiene selección (`areaCodes` sin definir), tiene TODAS las áreas.
// - Tarjeta «Áreas del proyecto» → botón «Ver áreas» → cuadro al centro con el nombre del área y,
//   para el administrador, el botón de quitar. Desde el 22-sep-2026 ya no se muestran rubro,
//   código ni tipo, y cada área aparece una sola vez aunque varios rubros la compartan; quitar un
//   área quita todos sus rubros. Trabajadores y clientes solo las ven.
// - En el formulario de spec (nuevo, editar y revisión), «Área» y «Rubro del spec» muestran
//   solo las áreas del proyecto.
(() => {
  "use strict";
  const STORE = "vaak-local-v8";
  const bridge = () => window.VAAKAppBridge;
  const spanish = () => {
    try {
      const id = sessionStorage.getItem("vaak-session-tab-v1");
      const stored = localStorage.getItem("vaak-language-" + (id || "guest"));
      return stored ? stored === "es" : document.documentElement.lang === "es";
    } catch { return false; }
  };
  const es = (a, b) => (spanish() ? a : b);
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const readState = () => { try { return JSON.parse(localStorage.getItem(STORE) || "null"); } catch { return null; } };
  const catalog = () => { try { return bridge()?.getRubros() || []; } catch { return []; } };
  const isAdmin = () => bridge()?.getView()?.user?.role === "Admin";
  const projectOf = (state, id) => (state?.projects || []).find((p) => p.id === id) || null;

  // Rubros del proyecto, en el orden del catálogo.
  function projectAreas(project) {
    const all = catalog();
    if (!project || !Array.isArray(project.areaCodes)) return all;
    const codes = new Set(project.areaCodes);
    return all.filter((r) => codes.has(r.code));
  }

  function saveAreaCodes(projectId, codes) {
    if (!isAdmin()) return es("Solo un administrador puede cambiar las áreas del proyecto.", "Only an administrator can change the project areas.");
    const state = readState();
    const project = projectOf(state, projectId);
    if (!project) return es("No se pudo guardar: el proyecto ya no existe. Recarga la página.", "Could not save: the project no longer exists. Reload the page.");
    project.areaCodes = [...new Set(codes)];
    state.meta = { ...(state.meta || {}), storeRevision: Number(state.meta?.storeRevision || 0) + 1 };
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { return es("No se pudo guardar en este navegador. Intenta de nuevo.", "Could not save in this browser. Try again."); }
    return "";
  }

  // Cada area (BANQUETE, ADMINISTRATION...) se muestra una sola vez, aunque varios rubros la
  // compartan (pedido de Datnya, 22-sep-2026).
  const nombreDeArea = (r) => String(r?.area || r?.name || "").trim();
  const areasUnicas = (lista) => [...new Set((lista || []).map(nombreDeArea).filter(Boolean))];
  const teamPill = (r) => `<span class="rubro-team-pill rubro-team-${r.team === "FFE" ? "ffe" : "ose"}">${r.team === "FFE" ? "FF&amp;E" : "OS&amp;E"}</span>`;
  const searchKey = (r) => escapeHtml(`${r.name} ${r.code} ${r.area} ${r.team === "FFE" ? "ff&e ffe" : "os&e ose"}`.toLowerCase());

  // ---- Cuadro «Áreas del proyecto» ----
  function openAreas(projectId) {
    document.getElementById("project-areas-modal")?.remove();
    const overlay = document.createElement("div");
    overlay.id = "project-areas-modal";
    overlay.className = "modal-backdrop";
    overlay.style.zIndex = "1100";
    document.body.appendChild(overlay);
    const admin = isAdmin();
    let mode = "view";
    let pendingRemove = null;
    let selected = null;

    const render = () => {
      const state = readState();
      const project = projectOf(state, projectId);
      if (!project) { overlay.remove(); return; }
      const areas = projectAreas(project);
      const all = catalog();
      let body, foot;
      if (mode === "view") {
        const nombres = areasUnicas(areas);
        const rows = nombres.map((nombre) => `<tr data-search="${escapeHtml(nombre.toLowerCase())}"><td><strong>${escapeHtml(nombre)}</strong></td>${admin ? `<td><button type="button" class="danger" data-area-remove="${escapeHtml(nombre)}" title="${es("Quitar del proyecto", "Remove from project")}">✕</button></td>` : ""}</tr>`).join("");
        const confirmBar = pendingRemove ? `<div class="pa-confirm" role="alert"><span>${es(`¿Quitar «${escapeHtml(pendingRemove)}» de este proyecto? Los specs que ya la usan no cambian.`, `Remove «${escapeHtml(pendingRemove)}» from this project? Specs already using it are not changed.`)}</span><div><button type="button" class="secondary" data-area-remove-cancel>${es("Cancelar", "Cancel")}</button><button type="button" class="danger" data-area-remove-yes>${es("Sí, quitar", "Yes, remove")}</button></div></div>` : "";
        body = `<div class="pa-toolbar"><label class="user-search"><input data-pa-search type="search" placeholder="${es("Buscar área...", "Search area...")}"></label><span class="rubros-count">${nombres.length} ${es(nombres.length === 1 ? "área" : "áreas", nombres.length === 1 ? "area" : "areas")}${Array.isArray(project.areaCodes) ? "" : ` · ${es("todas (aún no se seleccionaron)", "all (not selected yet)")}`}</span></div>${confirmBar}${nombres.length ? `<div class="pa-table-wrap"><table class="user-directory settings-rubros-table" translate="no"><thead><tr><th>${es("ÁREA", "AREA")}</th>${admin ? `<th>${es("QUITAR", "REMOVE")}</th>` : ""}</tr></thead><tbody>${rows}</tbody></table></div>` : `<p class="pa-empty">${admin ? es("Este proyecto no tiene áreas. Pulsa «Seleccionar áreas» para agregarlas.", "This project has no areas. Press «Select areas» to add them.") : es("Este proyecto todavía no tiene áreas seleccionadas.", "This project has no areas selected yet.")}</p>`}<p class="vaak-form-error" data-pa-error hidden></p>`;
        foot = `<button type="button" class="secondary" data-pa-close>${es("Cerrar", "Close")}</button>${admin ? `<button type="button" class="primary" data-pa-select>${es("Seleccionar áreas", "Select areas")}</button>` : ""}`;
      } else {
        if (!selected) selected = new Set(areasUnicas(areas));
        const opciones = areasUnicas(all).map((nombre) => `<label class="pa-option" data-search="${escapeHtml(nombre.toLowerCase())}"><input type="checkbox" value="${escapeHtml(nombre)}"${selected.has(nombre) ? " checked" : ""}><strong>${escapeHtml(nombre)}</strong></label>`).join("");
        body = `<p class="pa-intro">${es("Marca las áreas que tiene este proyecto. Solo esas aparecerán en el campo «Área» de sus specs.", "Tick the areas this project has. Only those will appear in the «Area» field of its specs.")}</p><div class="pa-toolbar"><label class="user-search"><input data-pa-search type="search" placeholder="${es("Buscar área...", "Search area...")}"></label><span class="rubros-count" data-pa-count>${selected.size} ${es("de", "of")} ${areasUnicas(all).length} ${es("seleccionadas", "selected")}</span></div><div class="pa-bulk"><button type="button" class="secondary" data-pa-all>${es("Marcar todas", "Select all")}</button><button type="button" class="secondary" data-pa-none>${es("Quitar todas", "Clear all")}</button></div><div class="pa-options" translate="no">${opciones}</div><p class="vaak-form-error" data-pa-error hidden></p>`;
        foot = `<button type="button" class="secondary" data-pa-back>${es("Cancelar", "Cancel")}</button><button type="button" class="primary" data-pa-save>${es("Guardar selección", "Save selection")}</button>`;
      }
      overlay.innerHTML = `<section class="modal pa-modal" role="dialog" aria-modal="true"><header class="modal-head"><div><h2>${mode === "view" ? es("Áreas del proyecto", "Project areas") : es("Seleccionar áreas del proyecto", "Select project areas")}</h2><small class="pa-project" translate="no">${escapeHtml([project.code, project.name].filter(Boolean).join(" · "))}</small></div><button type="button" class="ghost" data-pa-close>✕</button></header><div class="modal-body">${body}</div><footer class="modal-foot">${foot}</footer></section>`;
    };

    const fail = (text) => { const error = overlay.querySelector("[data-pa-error]"); if (error) { error.textContent = text; error.hidden = false; } };
    const done = () => { overlay.remove(); bridge()?.rerender(); };

    overlay.addEventListener("input", (event) => {
      if (!event.target.matches("[data-pa-search]")) return;
      const term = event.target.value.trim().toLowerCase();
      overlay.querySelectorAll("[data-search]").forEach((row) => { row.hidden = Boolean(term) && !row.dataset.search.includes(term); });
    });
    overlay.addEventListener("change", (event) => {
      if (event.target.type !== "checkbox" || !selected) return;
      if (event.target.checked) selected.add(event.target.value); else selected.delete(event.target.value);
      const count = overlay.querySelector("[data-pa-count]");
      if (count) count.textContent = `${selected.size} ${es("de", "of")} ${areasUnicas(catalog()).length} ${es("seleccionadas", "selected")}`;
    });
    overlay.addEventListener("click", (event) => {
      const t = event.target.closest("button");
      if (!t) return;
      if (t.matches("[data-pa-close]")) { overlay.remove(); return; }
      if (!admin) return;
      if (t.matches("[data-pa-select]")) { mode = "select"; selected = null; pendingRemove = null; render(); return; }
      if (t.matches("[data-pa-back]")) { mode = "view"; selected = null; render(); return; }
      if (t.matches("[data-pa-all], [data-pa-none]")) {
        const on = t.matches("[data-pa-all]");
        overlay.querySelectorAll(".pa-option:not([hidden]) input[type=checkbox]").forEach((box) => { box.checked = on; if (on) selected.add(box.value); else selected.delete(box.value); });
        overlay.querySelector("[data-pa-count]").textContent = `${selected.size} ${es("de", "of")} ${areasUnicas(catalog()).length} ${es("seleccionadas", "selected")}`;
        return;
      }
      if (t.matches("[data-pa-save]")) {
        t.disabled = true; t.classList.add("vaak-busy");
        t.innerHTML = `<span class="login-spinner" aria-hidden="true"></span>${es("Guardando…", "Saving…")}`;
        const order = catalog().filter((r) => selected.has(nombreDeArea(r))).map((r) => r.code);
        const error = saveAreaCodes(projectId, order);
        if (error) { t.disabled = false; t.classList.remove("vaak-busy"); t.textContent = es("Guardar selección", "Save selection"); fail(error); return; }
        mode = "view"; selected = null; render(); bridge()?.rerender();
        return;
      }
      if (t.matches("[data-area-remove]")) {
        pendingRemove = t.dataset.areaRemove;
        render(); return;
      }
      if (t.matches("[data-area-remove-cancel]")) { pendingRemove = null; render(); return; }
      if (t.matches("[data-area-remove-yes]") && pendingRemove) {
        const project = projectOf(readState(), projectId);
        const codes = projectAreas(project).filter((r) => nombreDeArea(r) !== pendingRemove).map((r) => r.code);
        const error = saveAreaCodes(projectId, codes);
        if (error) { fail(error); return; }
        pendingRemove = null; render(); bridge()?.rerender();
      }
    });
    overlay.addEventListener("keydown", (event) => { if (event.key === "Escape") done(); });
    render();
  }

  // ---- Botón «Ver áreas» en la tarjeta del proyecto ----
  function decorateCard() {
    const card = document.querySelector(".project-areas-card");
    if (!card || card.querySelector("[data-project-areas]")) return;
    const projectId = bridge()?.getView()?.selectedProjectId;
    const project = projectOf(readState(), projectId);
    if (!project) return;
    const total = areasUnicas(projectAreas(project)).length;
    const footer = document.createElement("div");
    footer.className = "pa-card-foot";
    footer.innerHTML = `<span>${total} ${es(total === 1 ? "área registrada" : "áreas registradas", total === 1 ? "registered area" : "registered areas")}</span><button type="button" class="secondary" data-project-areas="${escapeHtml(project.id)}">${es("Ver áreas", "View areas")}</button>`;
    card.appendChild(footer);
  }

  // ---- Campos «Área» y «Rubro del spec» del formulario de spec: solo las áreas del proyecto ----
  function filterSpecArea() {
    const op = bridge()?.getActiveOperation();
    const selects = "select[name='area'], select[name='category']";
    if (op?.kind === "spec-editor") {
      const projectId = op.target?.projectId || bridge()?.getView()?.selectedProjectId;
      for (const select of document.querySelectorAll("#modal-root " + selects)) filterSelect(select, projectId);
    }
    // Revisión de un spec: el proyecto es el del spec.
    const revision = document.querySelector("#modal-root form#record-revision-form[data-record-type='spec']");
    if (revision) {
      const spec = (readState()?.specs || []).find((item) => item.id === revision.dataset.targetId);
      for (const select of revision.querySelectorAll(selects)) filterSelect(select, spec?.projectId || bridge()?.getView()?.selectedProjectId);
    }
  }
  function filterSelect(select, projectId) {
    if (select.dataset.projectAreasReady) return;
    select.dataset.projectAreasReady = "1";
    const project = projectOf(readState(), projectId);
    if (!project) return;
    const allowed = new Set(projectAreas(project).map((r) => r.name));
    const current = select.value;
    select.querySelectorAll("option").forEach((option) => {
      // «Otros» (rubro escrito a mano) se mantiene en «Rubro del spec».
      if (option.value && option.value !== "Otros" && !allowed.has(option.value) && option.value !== current) option.remove();
    });
    select.querySelectorAll("optgroup").forEach((group) => { if (!group.querySelector("option")) group.remove(); });
    if (!allowed.size) {
      const hint = document.createElement("small");
      hint.className = "pa-spec-hint";
      hint.textContent = es("Este proyecto no tiene áreas seleccionadas. Un administrador puede elegirlas en «Áreas del proyecto → Ver áreas».", "This project has no areas selected. An administrator can choose them in «Project areas → View areas».");
      select.after(hint);
    }
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-project-areas]");
    if (!button) return;
    event.preventDefault();
    openAreas(button.dataset.projectAreas);
  });
  const app = document.getElementById("app");
  if (app) new MutationObserver(decorateCard).observe(app, { childList: true, subtree: true });
  const modalRoot = document.getElementById("modal-root");
  if (modalRoot) new MutationObserver(filterSpecArea).observe(modalRoot, { childList: true, subtree: true });

  const style = document.createElement("style");
  style.textContent = ".pa-card-foot{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-top:.9rem;padding:.8rem 1.1rem 0;border-top:1px solid #eee4da;font-size:.82rem;color:#7a6a5f}.pa-card-foot button{padding:.5rem .95rem}"
    + ".pa-modal{width:min(820px,100%);max-width:820px}.pa-modal .modal-head small{display:block;margin-top:.15rem;color:#9b7a5f;font-size:.8rem}.pa-toolbar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.6rem;margin-bottom:.8rem}.pa-toolbar .user-search{flex:1 1 260px}.pa-toolbar input{width:100%}"
    + ".pa-table-wrap{max-height:52vh;overflow:auto;border:1px solid #eee4da;border-radius:10px}.pa-table-wrap table{margin:0}.pa-table-wrap td button{padding:.3rem .55rem}.pa-empty{padding:1.2rem;border:1px dashed #dccbba;border-radius:10px;text-align:center;color:#7a6a5f}"
    + ".pa-confirm{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.6rem;margin-bottom:.8rem;padding:.7rem .9rem;border:1px solid #e74c3c;border-radius:8px;background:#fdf0ef;color:#c0392b;font-size:.85rem;font-weight:600}.pa-confirm div{display:flex;gap:.5rem}"
    + ".pa-intro{margin:0 0 .8rem;color:#4f4038;font-size:.88rem}.pa-bulk{display:flex;gap:.5rem;margin-bottom:.7rem}.pa-bulk button{padding:.45rem .85rem}.pa-options{max-height:48vh;overflow:auto;padding-right:.3rem}"
    + ".pa-group{margin:0 0 .8rem;padding:.4rem .7rem .6rem;border:1px solid #eee4da;border-radius:10px}.pa-group legend{padding:0 .4rem;font-weight:800;color:#5b4030;font-size:.8rem}"
    + ".pa-option{display:grid;grid-template-columns:auto 1fr auto auto;align-items:center;gap:.6rem;padding:.4rem .3rem;border-bottom:1px solid #f3ede5;cursor:pointer;font-size:.86rem}.pa-option:last-child{border-bottom:0}.pa-option small{color:#7a6a5f}.pa-option[hidden]{display:none}"
    + ".pa-spec-hint{display:block;margin-top:.35rem;color:#c0392b;font-size:.76rem;font-weight:600}";
  document.head.appendChild(style);
})();
