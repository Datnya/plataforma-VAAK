// Formulario de requerimiento de pago (RP) — pedido de Datnya, 18-sep-2026:
// - «Partes» (proveedor / fabricante, pagar a, dirección fiscal, contacto) se llenan solas con
//   los datos de la OC elegida (dirección y contacto que se guardaron en la OC; si la OC no los
//   tiene, los del proveedor registrado).
// - «Referencia OC / área» = solo el número de la OC.
// - «Monto total de factura» = «Total de la solicitud» (se copia solo, no se edita).
// - «Desglose de montos»: botón para agregar conceptos propios (título + monto). Se guardan en
//   `breakdownExtras` como texto legible «Título: monto | Título: monto».
// - «Monto a pagar» = suma de todo el desglose (no se edita).
// - «Realizar el pago a» = proveedor de la OC (no se edita).
// Aplica al formulario nuevo y a la revisión del RP.
(() => {
  "use strict";
  const BASE = ["goods", "freight", "packing", "additionalCharges", "overage", "customs", "salesTax"];
  // «Partes»: se llenan con la OC elegida y no se editan (pedido de Datnya, 20-sep-2026).
  const PARTES = ["sourceManufacturer", "payableTo", "payableAddress", "payableContact"];
  const Money = () => window.VAAKMoney;
  const spanish = () => {
    try {
      const id = sessionStorage.getItem("vaak-session-tab-v1");
      const stored = localStorage.getItem("vaak-language-" + (id || "guest"));
      return stored ? stored === "es" : document.documentElement.lang === "es";
    } catch { return false; }
  };
  const es = (a, b) => (spanish() ? a : b);
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const readState = () => { try { return JSON.parse(localStorage.getItem("vaak-local-v8") || "null"); } catch { return null; } };
  const num = (value) => Money().round(String(value ?? "").replace(/,/g, "")) || 0;
  const filled = (value) => String(value ?? "").trim() !== "";

  // «Seguro: 100.00 | Instalación: 50.00» <-> [{label, amount}]
  function parseExtras(text) {
    return String(text || "").split(" | ").map((part) => {
      const cut = part.lastIndexOf(": ");
      return cut < 0 ? null : { label: part.slice(0, cut).trim(), amount: part.slice(cut + 2).trim() };
    }).filter((item) => item && item.label);
  }
  const cleanLabel = (label) => String(label || "").replace(/\|/g, "/").replace(/:\s/g, ":").trim();
  const serializeExtras = (list) => list.filter((item) => cleanLabel(item.label) && filled(item.amount))
    .map((item) => `${cleanLabel(item.label)}: ${Money().fixed(num(item.amount))}`).join(" | ");
  window.VAAKDesgloseRP = Object.freeze({ parseExtras });

  const kindOf = (form) => form?.id === "invoice-editor-form" ? "new"
    : form?.id === "record-revision-form" && form.dataset.recordType === "invoice" ? "rev" : "";
  const setValue = (field, value) => {
    if (!field) return;
    const text = field.type === "number" ? String(Money().round(value).toFixed(2)) : (value === "" ? "" : Money().format(value));
    if (field.value === text) return;
    field.value = text;
    field.dispatchEvent(new Event("input", { bubbles: true }));
  };
  const lock = (field, title) => {
    if (!field) return;
    field.readOnly = true;
    field.tabIndex = -1;
    field.classList.add("rp-locked");
    if (title) field.title = title;
  };

  function extrasOf(form) {
    return [...form.querySelectorAll(".rp-extra-row")].map((row) => ({
      label: row.querySelector("[data-extra-label]").value,
      amount: row.querySelector("[data-extra-amount]").value,
    }));
  }

  function recalc(form) {
    const field = (name) => form.elements.namedItem(name);
    // Monto total de factura = total de la solicitud.
    const total = field("totalRequest");
    if (total && field("invoiceTotal")) {
      if (filled(total.value)) setValue(field("invoiceTotal"), num(total.value));
      else if (field("invoiceTotal").value) { field("invoiceTotal").value = ""; field("invoiceTotal").dispatchEvent(new Event("input", { bubbles: true })); }
    }
    // Desglose extra -> campo oculto.
    const hidden = field("breakdownExtras");
    if (hidden) {
      const text = serializeExtras(extrasOf(form));
      if (hidden.value !== text) { hidden.value = text; hidden.dispatchEvent(new Event("input", { bubbles: true })); hidden.dispatchEvent(new Event("change", { bubbles: true })); }
    }
    // Monto a pagar = suma del desglose.
    const lines = [...BASE.map((name) => field(name)?.value), ...extrasOf(form).filter((item) => cleanLabel(item.label)).map((item) => item.amount)];
    const sum = Money().round(lines.filter(filled).reduce((acc, value) => acc + num(value), 0));
    setValue(field("paymentAmount"), sum);
  }

  function addRow(form, item = { label: "", amount: "" }) {
    const list = form.querySelector(".rp-extra-list");
    const row = document.createElement("div");
    row.className = "rp-extra-row";
    row.innerHTML = `<label class="field"><span>${es("Concepto", "Concept")}</span><input data-extra-label maxlength="40" translate="no" placeholder="${es("Ej. Seguro, Instalación", "E.g. Insurance, Installation")}" value="${escapeHtml(item.label)}"></label><label class="field"><span>${es("Monto", "Amount")}</span><input data-extra-amount inputmode="decimal" placeholder="0.00" value="${escapeHtml(filled(item.amount) ? Money().format(num(item.amount)) : "")}"></label><button type="button" class="danger" data-extra-remove title="${es("Quitar concepto", "Remove line")}">✕</button>`;
    list.appendChild(row);
    return row;
  }

  function setup(form) {
    const kind = kindOf(form);
    if (!kind || form.dataset.rpReady) return;
    const field = (name) => form.elements.namedItem(name);
    if (!field("paymentAmount") && !field("goods")) return;
    form.dataset.rpReady = "1";
    lock(field("invoiceTotal"), es("Es el mismo «Total de la solicitud».", "Same as «Total for this request»."));
    lock(field("paymentAmount"), es("Suma de todo el desglose de montos.", "Sum of the whole amount breakdown."));
    lock(field("paymentPayableTo"), es("Siempre es el proveedor de la OC elegida.", "Always the supplier of the selected PO."));
    for (const nombre of PARTES) {
      lock(field(nombre), es("Se completa con los datos de la OC elegida; no se escribe a mano.", "Filled from the selected PO; it is not typed in."));
    }

    // Campo oculto con los conceptos propios.
    let hidden = field("breakdownExtras");
    if (hidden) {
      hidden.closest("label, .field")?.setAttribute("hidden", "");
    } else {
      hidden = document.createElement("input");
      hidden.type = "hidden"; hidden.name = "breakdownExtras";
      form.appendChild(hidden);
    }
    // Editor de conceptos debajo del desglose.
    const anchor = form.querySelector(".invoice-breakdown") || field("salesTax")?.closest("label, .field");
    if (!anchor) return;
    const box = document.createElement("div");
    box.className = "rp-extras field-full full";
    box.innerHTML = `<div class="rp-extra-list"></div><button type="button" class="secondary rp-extra-add" data-extra-add>＋ ${es("Agregar concepto al desglose", "Add breakdown line")}</button><small class="rp-extra-hint">${es("Solo salen en el formato los conceptos con monto. «Monto a pagar» es la suma de todo el desglose.", "Only lines with an amount are printed. «Payment amount» is the sum of the whole breakdown.")}</small>`;
    anchor.after(box);
    parseExtras(hidden.value).forEach((item) => addRow(form, item));
    // En la revisión no se recalcula al abrir: así un RP antiguo no aparece «cambiado» sin tocarlo.
    if (kind === "new") recalc(form);
  }

  function aviso(field, texto) {
    const caja = field.closest("label, .field");
    if (!caja) return;
    let nota = caja.querySelector(".rp-falta");
    if (!texto) { nota?.remove(); return; }
    if (!nota) {
      nota = document.createElement("small");
      nota.className = "rp-falta";
      caja.appendChild(nota);
    }
    nota.textContent = texto;
  }

  // Al elegir la OC (después de que la plataforma llena el formulario).
  function fromOrder(form) {
    const state = readState();
    const order = (state?.orders || []).find((item) => item.projectId === form.dataset.projectId && item.number === form.elements.namedItem("poNumber")?.value);
    if (!order) return;
    const name = order.supplier || order.manufacturer || "";
    const supplier = (state.suppliers || []).find((item) => (order.supplierId && item.id === order.supplierId) || String(item.name || "").trim().toLowerCase() === name.trim().toLowerCase()) || {};
    const put = (fieldName, value) => {
      const field = form.elements.namedItem(fieldName);
      if (!field) return;
      field.value = value || "";
      field.dispatchEvent(new Event("input", { bubbles: true }));
      // Si la OC no trae el dato, no se puede exigir aquí: se avisa debajo del campo.
      if (PARTES.includes(fieldName)) {
        if (field.required && !value) field.required = false;
        aviso(field, value ? "" : es("La OC elegida no tiene este dato. Complétalo en la OC o en el proveedor.", "The selected PO does not have this detail. Add it on the PO or on the supplier."));
      }
    };
    put("sourceManufacturer", [name, order.source || order.manufacturer || name].filter(Boolean).join(" / "));
    put("payableTo", name);
    put("payableAddress", order.supplierAddress || supplier.address || "");
    put("payableContact", order.supplierContact || supplier.contactName || supplier.contact || "");
    put("paymentPayableTo", name);
    const ref = form.elements.namedItem("poReferenceArea");
    if (ref) ref.value = order.number || "";
    recalc(form);
  }

  document.addEventListener("change", (event) => {
    const form = event.target.form;
    if (kindOf(form) === "new" && event.target.name === "poNumber") fromOrder(form);
  });
  document.addEventListener("input", (event) => {
    const form = event.target.form || event.target.closest?.("form");
    if (!kindOf(form)) return;
    const name = event.target.name;
    if (name === "totalRequest" || BASE.includes(name) || event.target.matches("[data-extra-label], [data-extra-amount]")) recalc(form);
  });
  document.addEventListener("focusout", (event) => {
    if (event.target.matches?.("[data-extra-amount]") && filled(event.target.value)) event.target.value = Money().format(num(event.target.value));
  });
  document.addEventListener("click", (event) => {
    const add = event.target.closest?.("[data-extra-add]");
    const remove = event.target.closest?.("[data-extra-remove]");
    if (!add && !remove) return;
    const form = (add || remove).closest("form");
    if (!kindOf(form)) return;
    event.preventDefault();
    if (add) addRow(form).querySelector("[data-extra-label]").focus();
    else { remove.closest(".rp-extra-row").remove(); recalc(form); }
  });
  // ---- Registro del pago («Pago realizado») ----
  // «Monto pendiente a cancelar» = monto a pagar del RP − valor pagado (automático, no se edita).
  // Botón para agregar campos propios (título + monto): se guardan en `paymentExtras` con el mismo
  // formato legible del desglose. No se restan del pendiente (son datos informativos del pago).
  function paymentTotal() {
    const invoice = window.VAAKAppBridge?.getActiveOperation()?.target || {};
    return num(invoice.paymentAmount || invoice.totalRequest || invoice.invoiceTotal || 0);
  }
  function recalcPayment(form) {
    const paid = form.elements.namedItem("paidAmount"), pending = form.elements.namedItem("pendingAmount");
    if (paid && pending && filled(paid.value)) pending.value = Math.max(0, Money().round(paymentTotal() - num(paid.value))).toFixed(2);
    else if (pending && !filled(paid?.value)) pending.value = "";
    const hidden = form.elements.namedItem("paymentExtras");
    if (hidden) hidden.value = serializeExtras(extrasOf(form));
  }
  function setupPayment(form) {
    if (form.dataset.rpReady) return;
    form.dataset.rpReady = "1";
    const pending = form.elements.namedItem("pendingAmount");
    if (pending) {
      lock(pending, es("Se calcula solo: monto a pagar del requerimiento menos el valor pagado.", "Calculated automatically: request payment amount minus amount paid."));
      const hint = document.createElement("small");
      hint.className = "rp-extra-hint";
      hint.textContent = es(`Monto a pagar del requerimiento: ${Money().format(paymentTotal())}`, `Request payment amount: ${Money().format(paymentTotal())}`);
      pending.after(hint);
    }
    const hidden = document.createElement("input");
    hidden.type = "hidden"; hidden.name = "paymentExtras";
    form.appendChild(hidden);
    const grid = form.querySelector("fieldset .rev-grid");
    if (!grid) return;
    const box = document.createElement("div");
    box.className = "rp-extras";
    box.innerHTML = `<div class="rp-extra-list"></div><button type="button" class="secondary rp-extra-add" data-extra-add>＋ ${es("Agregar campo al pago", "Add payment field")}</button>`;
    grid.after(box);
    const invoice = window.VAAKAppBridge?.getActiveOperation()?.target || {};
    parseExtras(invoice.paymentExtras).forEach((item) => addRow(form, item));
    recalcPayment(form);
  }
  document.addEventListener("input", (event) => {
    const form = event.target.closest?.("#payment-register-form");
    if (form && (event.target.name === "paidAmount" || event.target.matches("[data-extra-label], [data-extra-amount]"))) recalcPayment(form);
  });
  document.addEventListener("click", (event) => {
    const form = event.target.closest?.("#payment-register-form");
    if (!form) return;
    const add = event.target.closest("[data-extra-add]"), remove = event.target.closest("[data-extra-remove]");
    if (!add && !remove) return;
    event.preventDefault();
    if (add) addRow(form).querySelector("[data-extra-label]").focus();
    else { remove.closest(".rp-extra-row").remove(); recalcPayment(form); }
  });
  // Antes de guardar, asegurar que los campos propios vayan en el formulario.
  document.addEventListener("submit", (event) => { if (event.target.id === "payment-register-form") recalcPayment(event.target); }, true);

  const modalRoot = document.getElementById("modal-root");
  const scan = () => {
    document.querySelectorAll("#invoice-editor-form, #record-revision-form").forEach(setup);
    const payment = document.getElementById("payment-register-form");
    if (payment) setupPayment(payment);
  };
  if (modalRoot) new MutationObserver(scan).observe(modalRoot, { childList: true, subtree: true });

  const style = document.createElement("style");
  style.textContent = ".rp-locked{background:#f3eee7!important;color:#5b4030!important;cursor:not-allowed}"
    + ".rp-extras{grid-column:1/-1;margin-top:.6rem}.rp-extra-list{display:grid;gap:.5rem}.rp-extra-row{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr) auto;gap:.6rem;align-items:end}.rp-extra-row .field{margin:0}.rp-extra-row button{height:42px;padding:0 .8rem}"
    + ".rp-extra-add{margin-top:.6rem}.rp-extra-hint{display:block;margin-top:.4rem;color:#7a6a5f;font-size:.75rem}"
    + ".rp-falta{display:block;margin-top:.3rem;color:#c0392b;font-size:.75rem;font-weight:600}"
    + ".rp-oc-inline{white-space:nowrap}.rp-oc-inline b{color:#5b4030;font-size:1.08em;font-weight:800;letter-spacing:.01em}";
  document.head.appendChild(style);
})();
