// Saldo de cada OC frente a sus requerimientos de pago (RP).
// Saldo = total de la OC − suma de los RP generados para esa OC (con o sin pago
// registrado), en el orden en que se crearon. Solo se descuentan los RP en la
// misma moneda que la OC. Lo usan la tarjeta del RP, el aviso del formulario
// (advierte pero deja guardar) y el reporte de requerimientos de pago en Excel.
(() => {
  "use strict";
  const Money = () => window.VAAKMoney;
  const code = (value) => Money().codeOf(value) || String(value || "");

  const orderCurrency = (order) => order.amountCurrency || Money().currencyFrom(order.amount, "S/");
  const orderTotal = (order) => Money().round(order.amountValue || order.amount || 0);
  const amountOf = (invoice) => Money().round(invoice.totalRequest ?? invoice.invoiceTotal ?? 0);
  const sameCurrency = (invoice, order) => code(invoice.currency || "S/") === code(orderCurrency(order));

  const orderOf = (invoice, orders, projectId) => (orders || []).find((order) =>
    order.projectId === projectId && ((invoice.orderId && order.id === invoice.orderId) || (invoice.poNumber && order.number === invoice.poNumber))) || null;

  // RP de una OC, del más antiguo al más reciente.
  const invoicesOf = (project, order) => (project?.invoices || [])
    .filter((invoice) => (invoice.orderId && invoice.orderId === order.id) || (invoice.poNumber && invoice.poNumber === order.number))
    .map((invoice, index) => ({ invoice, index }))
    .sort((a, b) => String(a.invoice.createdAt || "").localeCompare(String(b.invoice.createdAt || "")) || a.index - b.index)
    .map((entry) => entry.invoice);

  const sumOf = (list, order) => Money().round(list.filter((invoice) => sameCurrency(invoice, order)).reduce((sum, invoice) => sum + amountOf(invoice), 0));

  // Estado de la OC justo después de un RP (incluido).
  function afterInvoice(project, orders, invoice) {
    const order = orderOf(invoice, orders, project?.id);
    if (!order) return null;
    const list = invoicesOf(project, order);
    const position = list.findIndex((item) => item === invoice || (item.id && item.id === invoice.id));
    const upTo = position < 0 ? list.concat(invoice) : list.slice(0, position + 1);
    const total = orderTotal(order), requested = sumOf(upTo, order);
    return { order, currency: orderCurrency(order), total, requested, balance: Money().round(total - requested), sameCurrency: sameCurrency(invoice, order) };
  }

  // Cuánto queda por solicitar de una OC (sin contar el RP `exceptId`).
  function remaining(project, order, exceptId) {
    const list = invoicesOf(project, order).filter((invoice) => !exceptId || invoice.id !== exceptId);
    const requested = sumOf(list, order);
    return { total: orderTotal(order), requested, balance: Money().round(orderTotal(order) - requested), currency: orderCurrency(order) };
  }

  // Bloque para la tarjeta del RP. `h` trae las utilidades de la app: es, fmtMoney, escape.
  function cardMarkup(invoice, project, orders, h) {
    const info = afterInvoice(project, orders, invoice);
    const money = (amount, currency) => h.escape(h.fmtMoney(`${currency} ${amount}`));
    if (!info) {
      return `<div class="card-v2-note rp-saldo rp-saldo-warn"><div><strong>${h.es("OC no encontrada", "PO not found")}</strong><small>${h.es("No se puede calcular el saldo: la OC de este requerimiento ya no existe.", "The balance cannot be calculated: this request's PO no longer exists.")}</small></div></div>`;
    }
    if (!info.sameCurrency) {
      return `<div class="card-v2-note rp-saldo rp-saldo-warn"><div><strong>${h.es("Moneda distinta a la OC", "Currency differs from the PO")}</strong><small>${h.es(`Este requerimiento está en ${h.escape(invoice.currency || "S/")} y la OC ${h.escape(info.order.number)} en ${h.escape(info.currency)}: no se descuenta del saldo de la OC.`, `This request is in ${h.escape(invoice.currency || "S/")} and PO ${h.escape(info.order.number)} in ${h.escape(info.currency)}: it is not deducted from the PO balance.`)}</small></div></div>`;
    }
    const exceeded = info.balance < -0.005;
    const detail = h.es(
      `Total OC ${money(info.total, info.currency)} · Solicitado hasta este RP ${money(info.requested, info.currency)}`,
      `PO total ${money(info.total, info.currency)} · Requested up to this request ${money(info.requested, info.currency)}`);
    if (exceeded) {
      return `<div class="card-v2-note rp-saldo rp-saldo-over" role="alert"><div><strong>${h.es("EXCEDIDO: los requerimientos superan la OC por", "EXCEEDED: requests exceed the PO by")} ${money(-info.balance, info.currency)}</strong><small>${detail}</small></div></div>`;
    }
    return `<div class="card-v2-note rp-saldo"><div><strong>${h.es("Falta para completar la OC:", "Left to complete the PO:")} ${money(info.balance, info.currency)}</strong><small>${detail}</small></div></div>`;
  }

  const style = document.createElement("style");
  style.textContent = ".rp-oc-number{display:block;margin:0 0 .15rem;font-size:1.28rem;font-weight:800;line-height:1.15;color:#5b4030;letter-spacing:.01em}.rp-oc-number small{display:inline;margin-right:.35rem;font-size:.72rem;font-weight:700;color:#9b7a5f;letter-spacing:.06em;text-transform:uppercase}.rp-saldo strong{color:#2f5233}.rp-saldo small{display:block;margin-top:.15rem}.rp-saldo-over{border-color:#e74c3c!important;background:#fdf0ef!important}.rp-saldo-over strong{color:#c0392b}.rp-saldo-warn strong{color:#876312}"
    // Mismo cuadro de confirmación que define staging-bridge.js; se repite aquí para no depender de él.
    + ".vaak-confirm-backdrop{position:fixed;inset:0;z-index:1300;display:grid;place-items:center;padding:1rem;background:rgba(39,27,21,.55)}.vaak-confirm{width:min(480px,100%);max-height:90vh;overflow:auto;border-radius:14px;background:#fff;box-shadow:0 24px 60px rgba(39,27,21,.35)}.vaak-confirm-head{display:flex;align-items:center;gap:.7rem;padding:1.1rem 1.3rem .4rem}.vaak-confirm-icon{display:grid;place-items:center;flex:0 0 38px;width:38px;height:38px;border-radius:50%;background:#f6ead3;color:#876312;font-weight:800;font-size:1.1rem}.vaak-confirm-head h3{margin:0;font-size:1.15rem;color:#35251d}.vaak-confirm-body{padding:.4rem 1.3rem 1rem;color:#4f4038;font-size:.9rem;line-height:1.55}.vaak-confirm-body p{margin:.45rem 0}.vaak-confirm-body ul{margin:.45rem 0 .2rem;padding-left:1.15rem}.vaak-confirm-foot{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.6rem;padding:.9rem 1.3rem 1.2rem;border-top:1px solid #eee4da}.vaak-confirm-foot .danger{padding:.76rem 1.1rem}";
  document.head.appendChild(style);

  window.VAAKSaldoOC = Object.freeze({ orderOf, invoicesOf, afterInvoice, remaining, cardMarkup, orderTotal, orderCurrency });

  // Al generar un RP que hace pasar el total de la OC: se advierte y se pide confirmar;
  // si se confirma, se guarda igual (decisión de Datnya: advertir y dejar guardar).
  const spanish = () => {
    try {
      const id = sessionStorage.getItem("vaak-session-tab-v1");
      const stored = localStorage.getItem("vaak-language-" + (id || "guest"));
      return stored ? stored === "es" : document.documentElement.lang === "es";
    } catch { return false; }
  };
  const es = (a, b) => (spanish() ? a : b);
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const show = (currency, amount) => `${currency} ${Money().format(amount)}`;
  // Sirve para el formulario de RP nuevo y para la revisión de un RP (que no se cuenta a sí mismo).
  const isRevision = (form) => form.id === "record-revision-form" && form.dataset.recordType === "invoice";
  function excessFor(form) {
    let state;
    try { state = JSON.parse(localStorage.getItem("vaak-local-v8") || "null"); } catch { return null; }
    const projectId = form.dataset.projectId || (isRevision(form) ? form.dataset.targetId : "");
    const project = (state?.projects || []).find((p) => p.id === projectId);
    const order = (state?.orders || []).find((o) => o.projectId === projectId && o.number === form.elements.namedItem("poNumber")?.value);
    if (!project || !order) return null;
    const currency = form.elements.namedItem("currency")?.value || "S/";
    if (code(currency) !== code(orderCurrency(order))) return null;
    const amount = Money().round(form.elements.namedItem("totalRequest")?.value || 0);
    const exceptId = isRevision(form) ? form.dataset.invoiceId : null;
    if (exceptId) {
      // Revisión que no toca el monto, la OC ni la moneda: no se vuelve a advertir.
      const before = (project.invoices || []).find((invoice) => invoice.id === exceptId);
      if (before && Money().round(amountOf(before)) === amount && before.poNumber === order.number && code(before.currency || "S/") === code(currency)) return null;
    }
    const left = remaining(project, order, exceptId);
    const excess = Money().round(amount - left.balance);
    return excess > 0.005 ? { order, amount, excess, revision: Boolean(exceptId), ...left } : null;
  }
  function confirmExcess(info) {
    return new Promise((resolve) => {
      const backdrop = document.createElement("div");
      backdrop.className = "vaak-confirm-backdrop";
      backdrop.setAttribute("translate", "no");
      const c = info.currency;
      const text = es(
        [`Con este requerimiento${info.revision ? " (revisado)" : ""}, lo solicitado para la OC <strong>${escapeHtml(info.order.number)}</strong> superará su total.`,
          `<ul><li>Total de la OC: <strong>${escapeHtml(show(c, info.total))}</strong></li><li>Ya solicitado en otros requerimientos: <strong>${escapeHtml(show(c, info.requested))}</strong></li><li>Saldo disponible: <strong>${escapeHtml(show(c, Math.max(0, info.balance)))}</strong></li><li>Este requerimiento: <strong>${escapeHtml(show(c, info.amount))}</strong></li></ul>`,
          `Se pagaría de más por <strong style="color:#c0392b">${escapeHtml(show(c, info.excess))}</strong>. ${info.revision ? "¿Deseas guardar la revisión de todas formas?" : "¿Deseas generarlo de todas formas?"}`],
        [`With this request${info.revision ? " (revised)" : ""}, the amount requested for PO <strong>${escapeHtml(info.order.number)}</strong> will exceed its total.`,
          `<ul><li>PO total: <strong>${escapeHtml(show(c, info.total))}</strong></li><li>Already requested: <strong>${escapeHtml(show(c, info.requested))}</strong></li><li>Available balance: <strong>${escapeHtml(show(c, Math.max(0, info.balance)))}</strong></li><li>This request: <strong>${escapeHtml(show(c, info.amount))}</strong></li></ul>`,
          `It would overpay by <strong style="color:#c0392b">${escapeHtml(show(c, info.excess))}</strong>. ${info.revision ? "Do you want to save the revision anyway?" : "Do you want to generate it anyway?"}`]);
      backdrop.innerHTML = `<div class="vaak-confirm" role="alertdialog" aria-modal="true"><div class="vaak-confirm-head"><span class="vaak-confirm-icon" aria-hidden="true">!</span><h3>${es("El requerimiento supera el saldo de la OC", "The request exceeds the PO balance")}</h3></div><div class="vaak-confirm-body">${text.map((t) => (t.startsWith("<ul>") ? t : `<p>${t}</p>`)).join("")}</div><div class="vaak-confirm-foot"><button type="button" class="secondary" data-choice="no">${es("Revisar el monto", "Review the amount")}</button><button type="button" class="danger" data-choice="yes">${info.revision ? es("Sí, guardar de todas formas", "Yes, save anyway") : es("Sí, generar de todas formas", "Yes, generate anyway")}</button></div></div>`;
      const close = (result) => { backdrop.remove(); resolve(result); };
      backdrop.addEventListener("click", (event) => { const choice = event.target.closest("[data-choice]")?.dataset.choice; if (choice) close(choice === "yes"); });
      document.body.appendChild(backdrop);
      backdrop.querySelector("[data-choice='no']").focus();
    });
  }
  window.addEventListener("submit", async (event) => {
    const form = event.target;
    if (form.id !== "invoice-editor-form" && !isRevision(form)) return;
    if (form.dataset.excessConfirmed) { delete form.dataset.excessConfirmed; return; }
    const info = excessFor(form);
    if (!info) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (await confirmExcess(info)) { form.dataset.excessConfirmed = "1"; form.requestSubmit(); }
    else form.elements.namedItem("totalRequest")?.focus();
  }, true);
})();
