// Bloque de revisiones compartido por los tres formatos imprimibles.
//
// La orden de compra ya imprimia su historial entre lineas de asteriscos.
// Las fichas tecnicas y las solicitudes de pago usan exactamente el mismo
// bloque, asi que vive aqui una sola vez en lugar de repetirse tres veces.
(function (root) {
  "use strict";

  const LABELS = Object.freeze({
    // Orden de compra
    supplier: "Supplier", source: "Source", date: "Date", deliveryDate: "Delivery date",
    incoterm: "Incoterm", shippingInstructions: "Shipping instructions",
    destination: "Final destination", terms: "Payment terms", productionTime: "Production time",
    warranty: "Warranty", sideMark: "Side mark", specifiedBy: "Specified by",
    preparedBy: "Prepared by", freight: "Freight", freightCurrency: "Freight currency",
    taxType: "Tax type", taxRate: "Tax rate", cifLabel: "Value title", cifValue: "CIF value",
    amountCurrency: "Currency", contactName: "Project contact",
    contactPhone: "Contact phone", contactEmail: "Contact email",
    adjustments: "Discounts / surcharges", item: "Item",
    // Ficha tecnica
    name: "Description", code: "Item code", productCode: "Product code",
    category: "Category", area: "Area", vendorSource: "Vendor / source",
    size: "Size", color: "Finish / colour", material: "Material",
    quantity: "Quantity", unit: "Unit", cost: "Cost", description: "Notes",
    reference: "Notes", specStatus: "Status", procurementTeam: "Procurement",
    // Solicitud de pago
    requestDetail: "Request detail", poRef: "PO reference", payableTo: "Payable to",
    requestDate: "Request date", dueDate: "Due date", totalRequest: "Total for this request",
    goods: "Goods", packing: "Packing", additionalCharges: "Additional charges",
    overage: "Overage", customs: "Customs", salesTax: "Sales tax",
    invoiceTotal: "Invoice total", paymentAmount: "Payment amount",
    invoiceDate: "Invoice date", invoiceCurrency: "Invoice currency",
    paymentPayableTo: "Payment payable to", currency: "Currency",
    breakdownExtras: "Other breakdown lines", poReferenceArea: "PO reference",
  });

  const PARTS = Object.freeze({
    description: "description", quantity: "quantity", unitCost: "unit cost",
    currency: "currency", added: "added", removed: "removed",
  });

  const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const stamp = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value || "");
    return date.toLocaleString("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  function changeLine(change) {
    if (change.field === "item") {
      const where = "Item " + (Number(change.index || 0) + 1);
      if (change.part === "added") return where + " added: " + change.to;
      if (change.part === "removed") return where + " removed: " + change.from;
      return where + " " + (PARTS[change.part] || change.part) + ": " +
        (change.from || "—") + " → " + (change.to || "—");
    }
    return (LABELS[change.field] || change.field) + ": " +
      (change.from || "—") + " → " + (change.to || "—");
  }

  // Devuelve el bloque completo, o cadena vacia si el documento no tiene
  // revisiones. La mas reciente va primero.
  function html(record) {
    const list = Array.isArray(record && record.revisions) ? record.revisions : [];
    if (!list.length) return "";
    const stars = "*".repeat(78);
    const body = list
      .slice()
      .reverse()
      .map(
        (entry) =>
          `<p class="hpg-ref-revision-head">Revision ${esc(entry.version)} — ${esc(entry.userName || "")} · ${esc(stamp(entry.at))}</p>` +
          (entry.changes || []).map((change) => `<p>• ${esc(changeLine(change))}${change.reason ? ` <span class="hpg-ref-revision-why">(Reason: ${esc(change.reason)})</span>` : ""}</p>`).join("") +
          // Las revisiones antiguas tienen un solo motivo general.
          (entry.reason ? `<p class="hpg-ref-revision-reason">Reason: ${esc(entry.reason)}</p>` : "")
      )
      .join("");
    const legend = `<p class="hpg-ref-revision-legend">Values changed in Revision ${esc(list[list.length - 1].version)} are shown in <span class="rev-mark">blue</span> on this document.</p>`;
    return `<div class="hpg-ref-revision"><p class="hpg-ref-stars">${stars}</p>${legend}${body}<p class="hpg-ref-stars">${stars}</p></div>`;
  }

  // Cambios de la ÚLTIMA revisión: los formatos pintan esos valores en azul (pedido de Datnya,
  // 18-sep-2026: el valor nuevo se ve en otro color, no solo entre los asteriscos).
  function lastChanges(record) {
    const list = Array.isArray(record && record.revisions) ? record.revisions : [];
    return list.length ? (list[list.length - 1].changes || []) : [];
  }
  function changed(record, fields) {
    const last = lastChanges(record);
    return fields.some((field) => last.some((change) => change.field === field));
  }
  const mark = (on, html) => (on ? `<span class="rev-mark">${html}</span>` : html);

  if (root.document && !root.document.getElementById("vaak-rev-mark-style")) {
    const style = root.document.createElement("style");
    style.id = "vaak-rev-mark-style";
    style.textContent = ".rev-mark,.rev-mark *{color:#1d5fbf!important;font-weight:700!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}.hpg-ref-revision-legend{font-style:italic}.hpg-ref-total .rev-mark,.hpg-ref-total .rev-mark *,.pr-total-primary .rev-mark,.pr-request-box aside .rev-mark,.hpg-ref-number .rev-mark{color:#a9d4ff!important}";
    root.document.head.appendChild(style);
  }

  root.VAAKRevisionBlock = Object.freeze({ html, changeLine, labels: LABELS, lastChanges, changed, mark });
})(typeof globalThis !== "undefined" ? globalThis : this);
