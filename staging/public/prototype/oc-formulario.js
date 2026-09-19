// Ajustes del formulario de OC (pedido de Datnya, 18-sep-2026):
// - «Valor CIF»: el título es editable (CIF, FOB, DDP, otro incoterm…). Se guarda en la OC
//   como `cifLabel` y el PDF lo imprime tal cual en la línea del valor.
// - «Especificado por»: siempre el nombre de quien llena el formulario, sin poder editarlo
//   (el motor también lo fija al emitir la OC). En la revisión de una OC queda de solo lectura.
(() => {
  "use strict";
  const bridge = () => window.VAAKAppBridge;
  const DEFAULT_LABEL = "CIF Value";
  const spanish = () => {
    try {
      const id = sessionStorage.getItem("vaak-session-tab-v1");
      const stored = localStorage.getItem("vaak-language-" + (id || "guest"));
      return stored ? stored === "es" : document.documentElement.lang === "es";
    } catch { return false; }
  };
  const es = (a, b) => (spanish() ? a : b);
  const draftOf = (form) => {
    if (!form.dataset.draftId) return null;
    try { return JSON.parse(localStorage.getItem("vaak-oc-drafts") || "[]").find((d) => d.draftId === form.dataset.draftId) || null; } catch { return null; }
  };

  function setupOrderForm(form) {
    const name = bridge()?.getView()?.user?.name || "";
    const specified = form.elements.namedItem("specifiedBy");
    if (specified) {
      specified.readOnly = true;
      specified.tabIndex = -1;
      specified.classList.add("oc-locked");
      if (name && specified.value !== name) specified.value = name;
      specified.title = es("Se completa con tu nombre y no se puede editar.", "Filled with your name; it cannot be edited.");
    }
    const cif = form.elements.namedItem("cifValue");
    if (!cif || form.elements.namedItem("cifLabel")) return;
    const field = cif.closest("label, .field");
    if (!field) return;
    const title = document.createElement("input");
    title.type = "text";
    title.name = "cifLabel";
    title.maxLength = 40;
    title.className = "oc-cif-label";
    title.setAttribute("translate", "no");
    title.value = draftOf(form)?.cifLabel || DEFAULT_LABEL;
    title.title = es("Título editable: se imprime así en la OC (ej. CIF Value, FOB Value, DDP)", "Editable title: printed like this on the PO (e.g. CIF Value, FOB Value, DDP)");
    title.setAttribute("aria-label", es("Título del valor", "Value title"));
    // El texto «Valor CIF» del campo pasa a ser un cuadro editable.
    const text = [...field.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    const labelEl = !text ? field.querySelector(":scope > label") : null;
    const wrap = document.createElement("span");
    wrap.className = "oc-cif-title";
    wrap.appendChild(title);
    const hint = document.createElement("small");
    hint.textContent = es("✎ título editable", "✎ editable title");
    wrap.appendChild(hint);
    if (text) text.replaceWith(wrap); else if (labelEl) labelEl.replaceWith(wrap); else field.prepend(wrap);
    // Al hacer clic en el título no debe saltar el foco al monto.
    title.addEventListener("click", (event) => event.stopPropagation());
  }

  function setupRevisionForm(form) {
    const specified = form.elements.namedItem("specifiedBy");
    if (specified && !specified.readOnly) { specified.readOnly = true; specified.tabIndex = -1; specified.classList.add("oc-locked"); }
  }

  function scan() {
    const op = bridge()?.getActiveOperation();
    const form = document.getElementById("authorized-form");
    if (form && op?.kind === "order-editor") setupOrderForm(form);
    const revision = document.getElementById("record-revision-form");
    if (revision && revision.dataset.recordType === "order") setupRevisionForm(revision);
  }
  const modalRoot = document.getElementById("modal-root");
  if (modalRoot) new MutationObserver(scan).observe(modalRoot, { childList: true, subtree: true });

  const style = document.createElement("style");
  style.textContent = ".oc-cif-title{display:flex;align-items:center;gap:.4rem;margin-bottom:.3rem}.oc-cif-title input{flex:1 1 auto;min-width:0;padding:.25rem .5rem!important;border:1px dashed #c9ab86!important;border-radius:6px;background:#fffdf8!important;font-weight:700;font-size:.8rem;color:#5b4030}.oc-cif-title small{white-space:nowrap;color:#9b7a5f;font-size:.7rem}"
    + "input.oc-locked{background:#f3eee7!important;color:#5b4030;cursor:not-allowed}";
  document.head.appendChild(style);
})();
