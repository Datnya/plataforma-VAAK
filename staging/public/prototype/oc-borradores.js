// Borradores de OC (corrección del 18-sep-2026, pedido de Datnya: «no tiene que volver a fallar
// ni borrarse ningún campo»).
//
// Antes, «Continuar» un borrador abría el formulario, esperaba 0,1 s y pegaba los valores sin
// avisar al formulario. Se perdían: los ítems desde el segundo, los descuentos/recargos, la
// dirección del proveedor elegida y el total (quedaba el guardado, no el recalculado). Con una
// conexión lenta se perdía todo lo que el formulario agrega después (incoterm, garantía, etc.).
//
// Ahora: se abre el proyecto del borrador si hace falta, se espera a que el formulario esté
// completo y se restaura cada campo en orden, disparando los mismos eventos que al escribir
// (así se llenan las listas que dependen de otro campo y se recalculan los totales).
// Al guardar, también se incluyen los campos que estén deshabilitados en ese momento.
(() => {
  "use strict";
  const DRAFTS = "vaak-oc-drafts";
  const bridge = () => window.VAAKAppBridge;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const spanish = () => {
    try {
      const id = sessionStorage.getItem("vaak-session-tab-v1");
      const stored = localStorage.getItem("vaak-language-" + (id || "guest"));
      return stored ? stored === "es" : document.documentElement.lang === "es";
    } catch { return false; }
  };
  const es = (a, b) => (spanish() ? a : b);
  const drafts = () => { try { return JSON.parse(localStorage.getItem(DRAFTS) || "[]"); } catch { return []; } };

  async function until(check, timeout = 8000, paso = 25) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const value = check();
      if (value) return value;
      await wait(paso);
    }
    return null;
  }
  // Espera corta: lo justo para que el formulario reaccione al valor anterior.
  const respira = (ms = 40) => wait(ms);

  // Mientras se abre y se llena el borrador, una capa tapa el formulario a medio armar
  // (antes se veía el texto desordenado unos segundos) y muestra que está cargando.
  function tapar() {
    if (document.getElementById("oc-draft-cargando")) return;
    const capa = document.createElement("div");
    capa.id = "oc-draft-cargando";
    capa.setAttribute("role", "status");
    capa.innerHTML = `<div class="oc-draft-cargando-caja"><span class="login-spinner" aria-hidden="true"></span><span>${es("Abriendo el borrador…", "Opening the draft…")}</span></div>`;
    document.body.appendChild(capa);
  }
  const destapar = () => document.getElementById("oc-draft-cargando")?.remove();

  function notice(text) {
    document.getElementById("oc-draft-notice")?.remove();
    const box = document.createElement("div");
    box.id = "oc-draft-notice";
    box.setAttribute("role", "alert");
    box.style.cssText = "position:fixed;left:50%;top:1.2rem;z-index:1400;transform:translateX(-50%);max-width:min(560px,92vw);padding:.8rem 1.1rem;border:1px solid #e74c3c;border-radius:10px;background:#fdf0ef;color:#c0392b;font-weight:600;font-size:.88rem;box-shadow:0 12px 30px rgba(39,27,21,.2)";
    box.textContent = text;
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 7000);
  }

  // Asigna un valor como si lo escribiera el usuario. Si es una lista y la opción no existe, la agrega.
  function put(element, value) {
    if (!element || value === undefined || value === null) return false;
    const text = String(value);
    if (element.tagName === "SELECT" && text && ![...element.options].some((option) => option.value === text)) {
      element.add(new Option(text, text));
    }
    element.value = text;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  // Campos que se calculan solos, que no se restauran o que se restauran aparte.
  const SKIP = new Set(["amountValue", "amountCurrency", "taxAmount", "projectId", "conditionsJson", "warehouse", "addressMode",
    "supplierAddress", "supplierContact", "supplierPhone", "supplierEmail", "specifiedBy", "preparedBy", "draftId", "draftDate", "items", "adjustments"]);
  const FIRST = ["ocTeam", "ocRubro", "supplier"];

  async function restore(form, draft) {
    const field = (name) => form.elements.namedItem(name);
    for (const name of FIRST) { put(field(name), draft[name]); await respira(); }

    // Dirección del proveedor (lista de oc-direcciones.js).
    const choice = form.querySelector("[data-oc-supplier-address]");
    if (choice && draft.supplierAddress) { put(choice, draft.supplierAddress); await respira(20); }
    for (const name of ["supplierContact", "supplierPhone", "supplierEmail"]) if (draft[name]) put(field(name), draft[name]);

    // Resto de campos simples.
    for (const [name, value] of Object.entries(draft)) {
      if (SKIP.has(name) || FIRST.includes(name) || /^item(Spec|Quantity|Currency|Cost)\d+$/.test(name) || /^adj(Concept|Sign|Amount)/.test(name)) continue;
      if (typeof value !== "string") continue;
      const element = field(name);
      if (element && element.type !== "hidden" && !(element instanceof RadioNodeList)) put(element, value);
    }
    await respira(20);

    // Ítems: todos, no solo el primero.
    const items = Array.isArray(draft.items) && draft.items.length ? draft.items
      : Object.keys(draft).filter((key) => /^itemSpec\d+$/.test(key)).map((key) => {
          const i = key.slice(8);
          return { specId: draft[key], quantity: draft[`itemQuantity${i}`], currency: draft[`itemCurrency${i}`], unitCost: draft[`itemCost${i}`] };
        });
    for (let k = 0; k < items.length; k++) {
      let rows = [...form.querySelectorAll("#po-items [data-item-index]")];
      if (k >= rows.length) {
        form.querySelector("[data-po-add-item]")?.click();
        rows = await until(() => { const list = [...form.querySelectorAll("#po-items [data-item-index]")]; return list.length > k ? list : null; }, 3000, 15) || rows;
      }
      const row = rows[k];
      if (!row) break;
      const i = row.dataset.itemIndex;
      const item = items[k] || {};
      put(field(`itemSpec${i}`), item.specId || "");
      // El costo y la moneda los pone la plataforma al elegir el spec: se espera a que aparezcan.
      if (item.specId) await until(() => String(field(`itemCost${i}`)?.value || "").trim() !== "", 600, 15);
      if (item.currency) put(field(`itemCurrency${i}`), item.currency);
      if (item.quantity !== undefined && item.quantity !== "") put(field(`itemQuantity${i}`), item.quantity);
      if (item.unitCost !== undefined && item.unitCost !== "") put(field(`itemCost${i}`), item.unitCost);
    }

    // Descuentos y recargos.
    for (const adjustment of Array.isArray(draft.adjustments) ? draft.adjustments : []) {
      const list = form.querySelector(".po-adjust-list");
      const before = list ? list.children.length : 0;
      form.querySelector("[data-adjust-add]")?.click();
      const row = await until(() => (list && list.children.length > before ? list.lastElementChild : null), 2000, 15);
      if (!row) break;
      const amount = Number(adjustment.amount) || 0;
      put(row.querySelector("[name^='adjConcept']"), adjustment.concept || "");
      put(row.querySelector("[name^='adjSign']"), amount < 0 ? "-" : "+");
      put(row.querySelector("[name^='adjAmount']"), Math.abs(amount));
    }

    // Recalcular totales con los valores ya puestos.
    const firstQty = form.querySelector("#po-items [name^='itemQuantity']");
    firstQty?.dispatchEvent(new Event("input", { bubbles: true }));
    firstQty?.dispatchEvent(new Event("change", { bubbles: true }));
  }

  let busy = false;
  async function resume(draftId) {
    const draft = drafts().find((item) => item.draftId === draftId);
    if (!draft) { notice(es("No se encontró el borrador. Puede que otra persona lo haya eliminado o ya emitido.", "Draft not found. Someone may have deleted or issued it.")); return; }
    busy = true;
    tapar();
    try {
      const modalRoot = document.getElementById("modal-root");
      if (modalRoot) modalRoot.innerHTML = "";
      // Abrir el proyecto del borrador si no está abierto.
      if (draft.projectId && (bridge()?.getView()?.selectedProjectId !== draft.projectId || !document.querySelector('[data-action="new-order"]'))) {
        const go = document.createElement("button");
        go.type = "button"; go.hidden = true; go.dataset.project = draft.projectId;
        document.body.appendChild(go); go.click(); go.remove();
      }
      const opener = await until(() => document.querySelector('[data-action="new-order"]'));
      if (!opener) { notice(es("No se pudo abrir el formulario de OC para este borrador. Abre el proyecto y vuelve a intentarlo.", "The PO form could not be opened for this draft. Open the project and try again.")); return; }
      opener.click();
      // Esperar a que el formulario esté completo (direcciones, título del CIF y campos comerciales).
      const form = await until(() => {
        const candidate = document.getElementById("authorized-form");
        return candidate && bridge()?.getActiveOperation()?.kind === "order-editor" && candidate.dataset.ocAddressesReady && candidate.elements.namedItem("cifLabel") && candidate.elements.namedItem("incoterm") ? candidate : null;
      });
      if (!form) { notice(es("El formulario tardó demasiado en abrir. Vuelve a pulsar «Continuar» en el borrador.", "The form took too long to open. Press «Resume» on the draft again.")); return; }
      form.dataset.draftId = draftId;
      form.classList.add("oc-draft-loading");
      await restore(form, draft);
      form.classList.remove("oc-draft-loading");
      // Un respiro para que la plataforma termine de acomodar el formato antes de mostrarlo.
      await respira(60);
    } catch (error) {
      notice(es("No se pudo cargar el borrador completo: ", "The draft could not be fully loaded: ") + (error?.message || error));
    } finally {
      destapar();
      busy = false;
    }
  }

  window.addEventListener("click", (event) => {
    const button = event.target.closest?.('[data-action="resume-draft"]');
    if (button) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (!busy) resume(button.dataset.draftId);
      return;
    }
    // Al guardar el borrador, que también se guarden los campos deshabilitados en ese momento.
    const save = event.target.closest?.("[data-po-save-draft]");
    if (save) {
      const form = save.closest("form");
      const disabled = form ? [...form.elements].filter((element) => element.name && element.disabled) : [];
      disabled.forEach((element) => { element.disabled = false; });
      setTimeout(() => disabled.forEach((element) => { if (element.isConnected) element.disabled = true; }), 0);
    }
  }, true);

  const style = document.createElement("style");
  style.textContent = "form.oc-draft-loading{pointer-events:none}"
    + "#oc-draft-cargando{position:fixed;inset:0;z-index:1450;display:grid;place-items:center;background:#fcfbfa}"
    + ".oc-draft-cargando-caja{display:flex;align-items:center;gap:.7rem;padding:1rem 1.4rem;border:1px solid #e4d8c8;border-radius:12px;background:#fff;color:#5b4030;font-weight:700;font-size:.95rem;box-shadow:0 18px 40px rgba(39,27,21,.18)}"
    + ".oc-draft-cargando-caja .login-spinner{display:inline-block;width:1.1em;height:1.1em;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:vaak-login-spin .7s linear infinite}"
    + "@keyframes vaak-login-spin{to{transform:rotate(360deg)}}";
  document.head.appendChild(style);
})();
