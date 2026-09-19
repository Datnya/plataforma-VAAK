// Direcciones en el formulario de la OC (pedido de Datnya, 18-sep-2026):
// - «Dirección del proveedor»: las direcciones del proveedor elegido. Por defecto
//   su dirección fiscal (la del formulario de proveedores); se pueden agregar más.
//   Se guarda en la OC como supplierAddress (el PDF la imprime en MANUFACTURER).
//   BILL TO sigue siendo la dirección fiscal del hotel (campo «Bill To», sin cambios).
// - «Dirección de entrega / almacén del hotel (Ship To)»: los almacenes del proyecto
//   (un hotel puede tener varios); se pueden agregar más. Se guarda como shipTo.
// Las direcciones agregadas quedan en el proveedor (`addresses`) o en el proyecto
// (`warehouses`) dentro de los datos compartidos: todos los usuarios las ven.
// Las OC nuevas llevan addressMode = 'v2' para que el PDF use esta distribución;
// las OC anteriores se siguen imprimiendo como antes.
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
  const clean = (list) => { const seen = new Set(); return list.map((x) => String(x || "").trim()).filter((x) => { const k = x.toLowerCase(); if (!x || seen.has(k)) return false; seen.add(k); return true; }); };

  const supplierByName = (state, name) => (state?.suppliers || []).find((s) => String(s.name || "").trim().toLowerCase() === String(name || "").trim().toLowerCase());
  const supplierAddresses = (state, name) => { const s = supplierByName(state, name); return s ? clean([s.address, ...(s.addresses || [])]) : []; };
  const projectWarehouses = (state, projectId) => { const p = (state?.projects || []).find((x) => x.id === projectId); return p ? clean([p.warehouse, ...(p.warehouses || [])]) : []; };

  // Guarda una dirección nueva en los datos compartidos (se sincroniza sola con el servidor).
  function saveAddress(kind, key, value) {
    const state = readState();
    if (!state) return false;
    if (kind === "supplier") {
      const supplier = supplierByName(state, key);
      if (!supplier) return false;
      supplier.addresses = clean([...(supplier.addresses || []), value]).filter((x) => x.toLowerCase() !== String(supplier.address || "").trim().toLowerCase());
    } else {
      const project = (state.projects || []).find((x) => x.id === key);
      if (!project) return false;
      project.warehouses = clean([...(project.warehouses || []), value]).filter((x) => x.toLowerCase() !== String(project.warehouse || "").trim().toLowerCase());
    }
    state.meta = { ...(state.meta || {}), storeRevision: Number(state.meta?.storeRevision || 0) + 1 };
    localStorage.setItem(STORE, JSON.stringify(state));
    return true;
  }

  const fillSelect = (select, values, selected, emptyText) => {
    select.setAttribute("translate", "no"); // son direcciones escritas por el usuario
    const list = clean(values);
    if (selected && !list.some((x) => x.toLowerCase() === selected.toLowerCase())) list.push(selected);
    select.innerHTML = list.length
      ? list.map((x) => `<option value="${escapeHtml(x)}"${x === selected ? " selected" : ""}>${escapeHtml(x)}</option>`).join("")
      : `<option value="">${escapeHtml(emptyText)}</option>`;
    if (list.length && !selected) select.value = list[0];
  };

  function syncSupplierFields(form) {
    const choice = form.querySelector("[data-oc-supplier-address]");
    const value = choice?.value || "";
    const field = form.elements.namedItem("supplierAddress");
    if (field) field.value = value;
  }
  function syncShipFields(form) {
    const ship = form.elements.namedItem("shipTo");
    const warehouse = form.elements.namedItem("warehouse");
    if (warehouse && ship) warehouse.value = ship.value;
  }

  function refreshSupplierOptions(form, preferred) {
    const choice = form.querySelector("[data-oc-supplier-address]");
    if (!choice) return;
    const supplier = form.elements.namedItem("supplier")?.value || "";
    const addresses = supplierAddresses(readState(), supplier);
    fillSelect(choice, addresses, preferred ?? "", supplier ? es("Este proveedor no tiene dirección registrada: agrega una", "This supplier has no saved address: add one") : es("Primero selecciona un proveedor", "Select a supplier first"));
    choice.disabled = !supplier;
    form.querySelector("[data-oc-add-address='supplier']").disabled = !supplier;
    syncSupplierFields(form);
  }
  function refreshShipOptions(form, preferred) {
    const ship = form.elements.namedItem("shipTo");
    if (!ship || ship.tagName !== "SELECT") return;
    fillSelect(ship, projectWarehouses(readState(), form.elements.namedItem("projectId")?.value), preferred ?? ship.value, es("El proyecto no tiene almacenes registrados: agrega uno", "The project has no saved warehouses: add one"));
    syncShipFields(form);
  }

  function setup(form) {
    if (form.dataset.ocAddressesReady) return;
    const supplierSelect = form.elements.namedItem("supplier");
    const oldWarehouse = form.elements.namedItem("warehouse");
    const shipInput = form.elements.namedItem("shipTo");
    if (!supplierSelect || !oldWarehouse || !shipInput || oldWarehouse.tagName !== "SELECT") return;
    form.dataset.ocAddressesReady = "1";
    const draft = form.dataset.draftId ? (() => { try { return JSON.parse(localStorage.getItem("vaak-oc-drafts") || "[]").find((d) => d.draftId === form.dataset.draftId) || null; } catch { return null; } })() : null;
    const initialShip = draft?.shipTo || shipInput.value || "";
    const initialSupplierAddress = draft?.supplierAddress || "";

    // 1) El antiguo «Dirección de almacén guardada» pasa a ser «Dirección del proveedor».
    const supplierField = oldWarehouse.closest(".field");
    supplierField.querySelector("label").textContent = es("Dirección del proveedor", "Supplier address");
    oldWarehouse.removeAttribute("name");
    oldWarehouse.dataset.ocSupplierAddress = "1";
    const oldButton = supplierField.querySelector("[data-action='add-warehouse']");
    if (oldButton) { oldButton.removeAttribute("data-action"); oldButton.dataset.ocAddAddress = "supplier"; }
    const hiddenWarehouse = document.createElement("input");
    hiddenWarehouse.type = "hidden"; hiddenWarehouse.name = "warehouse";
    form.appendChild(hiddenWarehouse);
    const mode = document.createElement("input");
    mode.type = "hidden"; mode.name = "addressMode"; mode.value = "v2";
    form.appendChild(mode);
    // Justo debajo del proveedor, para que se vea que dependen uno del otro.
    supplierSelect.closest(".field")?.after(supplierField);

    // 2) «Enviar a (Ship To)»: lista de almacenes del hotel con su botón para agregar.
    const shipField = shipInput.closest(".field");
    shipField.classList.add("field-full");
    shipField.querySelector("label").textContent = es("Dirección de entrega / almacén del hotel (Ship To)", "Delivery address / hotel warehouse (Ship To)");
    const shipSelect = document.createElement("select");
    shipSelect.name = "shipTo"; shipSelect.className = "warehouse-select";
    const wrap = document.createElement("div");
    wrap.className = "warehouse-input";
    wrap.appendChild(shipSelect);
    const shipButton = document.createElement("button");
    shipButton.type = "button"; shipButton.className = "secondary"; shipButton.dataset.ocAddAddress = "project";
    shipButton.textContent = es("Agregar nueva dirección", "Add new address");
    wrap.appendChild(shipButton);
    shipInput.replaceWith(wrap);

    refreshSupplierOptions(form, initialSupplierAddress || undefined);
    refreshShipOptions(form, initialShip);
  }

  function askAddress(kind, form) {
    document.getElementById("oc-address-modal")?.remove();
    const overlay = document.createElement("div");
    overlay.id = "oc-address-modal"; overlay.className = "modal-backdrop"; overlay.style.zIndex = "1100";
    const supplier = form.elements.namedItem("supplier")?.value || "";
    const title = kind === "supplier" ? es("Nueva dirección del proveedor", "New supplier address") : es("Nuevo almacén del hotel", "New hotel warehouse");
    const intro = kind === "supplier"
      ? es(`Se guardará en el proveedor «${escapeHtml(supplier)}» y todos los usuarios podrán elegirla en sus próximas OC.`, `It will be saved to supplier «${escapeHtml(supplier)}» and every user will be able to choose it in future POs.`)
      : es("Se guardará en este proyecto y todos los usuarios podrán elegirla en sus próximas OC.", "It will be saved to this project and every user will be able to choose it in future POs.");
    overlay.innerHTML = `<section class="modal" style="max-width:480px" role="dialog" aria-modal="true"><header class="modal-head"><h2>${title}</h2><button type="button" class="ghost" data-oc-address-close>✕</button></header><div class="modal-body"><p>${intro}</p><input type="text" id="oc-address-input" class="confirm-text-input" maxlength="300" placeholder="${es("Ej: Av. Los Olivos 123, Lima", "E.g. 123 Main St, Lima")}" style="margin-top:.5rem"><p class="vaak-form-error" data-oc-address-error hidden style="margin:.7rem 0 0"></p></div><footer class="modal-foot"><button type="button" class="secondary" data-oc-address-close>${es("Cancelar", "Cancel")}</button><button type="button" class="primary" data-oc-address-save>${es("Agregar", "Add")}</button></footer></section>`;
    document.body.appendChild(overlay);
    const input = overlay.querySelector("#oc-address-input");
    const error = overlay.querySelector("[data-oc-address-error]");
    input.focus();
    const save = () => {
      const value = input.value.trim();
      const fail = (text) => { error.textContent = text; error.hidden = false; input.focus(); };
      if (value.length < 5) return fail(es("Escribe la dirección completa (al menos 5 caracteres).", "Type the full address (at least 5 characters)."));
      const key = kind === "supplier" ? supplier : form.elements.namedItem("projectId")?.value;
      if (!saveAddress(kind, key, value)) return fail(kind === "supplier" ? es("No se pudo guardar: el proveedor ya no existe. Recarga la página.", "Could not save: the supplier no longer exists. Reload the page.") : es("No se pudo guardar: el proyecto ya no existe. Recarga la página.", "Could not save: the project no longer exists. Reload the page."));
      if (kind === "supplier") refreshSupplierOptions(form, value); else refreshShipOptions(form, value);
      overlay.remove();
    };
    overlay.addEventListener("click", (event) => {
      if (event.target.closest("[data-oc-address-close]")) overlay.remove();
      else if (event.target.closest("[data-oc-address-save]")) save();
    });
    input.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); save(); } });
  }

  const orderForm = () => {
    const form = document.getElementById("authorized-form");
    return form && bridge()?.getActiveOperation()?.kind === "order-editor" ? form : null;
  };
  const modalRoot = document.getElementById("modal-root");
  if (modalRoot) new MutationObserver(() => { const form = orderForm(); if (form) setup(form); }).observe(modalRoot, { childList: true, subtree: true });

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-oc-add-address]");
    if (!button) return;
    const form = button.closest("form");
    if (!form || !form.dataset.ocAddressesReady) return;
    event.preventDefault(); event.stopImmediatePropagation();
    askAddress(button.dataset.ocAddAddress, form);
  }, true);
  document.addEventListener("change", (event) => {
    const form = event.target.form;
    if (!form || !form.dataset.ocAddressesReady) return;
    if (event.target.name === "supplier") refreshSupplierOptions(form);
    else if (event.target.matches("[data-oc-supplier-address]")) syncSupplierFields(form);
    else if (event.target.name === "shipTo") syncShipFields(form);
  });
})();
