// Impresión de la OC en A4 (pedido de Datnya, 18-sep-2026):
// si el bloque de firmas (APPROVALS) no cabe al final de una hoja y por eso saltaría a la
// siguiente dejando un espacio en blanco, se reduce su alto (arriba y abajo, nunca de ancho)
// lo justo para que quepa. Si ni reduciéndolo cabe, pasa a la hoja siguiente como antes.
//
// Antes de imprimir se simula la paginación sobre una copia invisible de la hoja con las
// mismas medidas que tendrá en el papel: A4 menos el marco de la hoja (12 mm arriba y 15 mm
// abajo, que ponen el thead y el tfoot de .hpg-print-frame) y 11 mm de relleno a los lados.
(() => {
  "use strict";
  const MM = 96 / 25.4;
  const PAGE_HEIGHT = (297 - 12 - 15) * MM;
  const PAGE_WIDTH = (210 - 11 - 11) * MM;
  const SAFETY = 6;
  const BOX_MIN = 128; // alto normal de cada recuadro de firma (purchase-order-reference.css)

  function measureSheet(sheet) {
    const holder = document.createElement("div");
    holder.style.cssText = `position:absolute;left:-20000px;top:0;width:${PAGE_WIDTH}px;visibility:hidden;pointer-events:none`;
    const clone = sheet.cloneNode(true);
    clone.style.cssText = `width:${PAGE_WIDTH}px!important;max-width:none!important;padding:0!important;margin:0!important;transform:none!important;min-height:0!important`;
    clone.classList.remove("po-approvals-compact");
    clone.querySelector(".hpg-ref-footer")?.remove();
    holder.appendChild(clone);
    document.body.appendChild(holder);
    return { clone, done: () => holder.remove() };
  }

  // Bloques que la impresora no parte (en el orden de la hoja), hasta las firmas.
  function blocksOf(clone, hasta) {
    const base = clone.getBoundingClientRect().top;
    const box = (element) => { const r = element.getBoundingClientRect(); return { top: r.top - base, bottom: r.bottom - base }; };
    const list = [];
    let pendingLabel = null;
    const push = (element, extra = {}) => {
      const b = { ...box(element), ...extra };
      if (pendingLabel) { b.top = pendingLabel.top; pendingLabel = null; }
      list.push(b);
    };
    let theadHeight = 0;
    const cuerpo = clone.querySelector(".hpg-print-frame > tbody > tr > td") || clone;
    for (const child of cuerpo.children) {
      if (child.matches("style, .hpg-ref-footer")) continue;
      if (child.matches(hasta)) break;
      if (child.matches("h2.hpg-ref-section-label")) { pendingLabel = box(child); continue; }
      if (child.matches("table.hpg-ref-items")) {
        const head = child.tHead;
        if (head) { theadHeight = head.getBoundingClientRect().height; push(head); }
        child.querySelectorAll("tbody > tr").forEach((row) => push(row, { row: true }));
        continue;
      }
      if (child.matches(".hpg-ref-totals")) {
        const label = child.querySelector(".hpg-ref-section-label");
        if (label) pendingLabel = box(label);
        child.querySelectorAll(".hpg-ref-totals-lines > p").forEach((line) => push(line));
        continue;
      }
      push(child);
    }
    return { list, theadHeight };
  }

  // Desplazamiento que provocan los saltos de página antes de las firmas.
  function shiftBefore(list, theadHeight) {
    let shift = 0;
    for (const b of list) {
      const top = b.top + shift, bottom = b.bottom + shift, height = b.bottom - b.top;
      const pageEnd = (Math.floor(top / PAGE_HEIGHT) + 1) * PAGE_HEIGHT;
      if (bottom > pageEnd + 0.5 && height <= PAGE_HEIGHT) shift += pageEnd + (b.row ? theadHeight : 0) - top;
    }
    return shift;
  }

  function fits(clone, shift, selector = ".hpg-ref-approvals-section") {
    const section = clone.querySelector(selector);
    if (!section) return true;
    const base = clone.getBoundingClientRect().top;
    const r = section.getBoundingClientRect();
    const top = r.top - base + shift, bottom = r.bottom - base + shift;
    const pageEnd = (Math.floor(top / PAGE_HEIGHT) + 1) * PAGE_HEIGHT;
    return bottom <= pageEnd - SAFETY;
  }

  // La página NO lleva margen propio: los márgenes de arriba y abajo los pone el marco de la
  // propia hoja (la fila de cabecera y el pie del <table class="hpg-print-frame">, que el
  // navegador repite en cada página) y los laterales, el relleno de la hoja.
  // Si la página tuviera margen, Chrome imprimiría ahí su encabezado con la fecha, la hora y el
  // título de la pestaña (lo vio Datnya el 20-sep). Este <style> se agrega el último para ganarle
  // al `@page` de los otros formatos.
  function ponerMargenes() {
    quitarMargenes();
    const style = document.createElement("style");
    style.id = "vaak-oc-margenes";
    style.media = "print";
    style.textContent = "@page{size:A4;margin:0}";
    document.head.appendChild(style);
  }
  const quitarMargenes = () => document.getElementById("vaak-oc-margenes")?.remove();

  function prepare() {
    reset();
    if (!document.body.classList.contains("print-order")) return;
    const sheet = document.querySelector("#modal-root .hpg-reference-po");
    if (!sheet) return;
    ponerMargenes();
    const { clone, done } = measureSheet(sheet);
    try {
      // Sin firmas no hay nada que compactar, pero las condiciones se revisan igual.
      if (!clone.querySelector(".hpg-ref-approvals-section")) { condiciones(clone, sheet); return; }
      const { list, theadHeight } = blocksOf(clone, ".hpg-ref-approvals-section");
      const shift = shiftBefore(list, theadHeight);
      if (fits(clone, shift)) { condiciones(clone, sheet); return; } // cabe normal: nada que hacer
      clone.classList.add("po-approvals-compact");
      clone.style.setProperty("--po-approval-min", "0px");
      if (!fits(clone, shift)) { clone.classList.remove("po-approvals-compact"); condiciones(clone, sheet); return; } // ni compacto cabe: pasa a la hoja siguiente
      // El alto más grande (hasta el normal) con el que todavía cabe.
      let low = 0, high = BOX_MIN;
      while (high - low > 1) {
        const mid = Math.floor((low + high) / 2);
        clone.style.setProperty("--po-approval-min", mid + "px");
        if (fits(clone, shift)) low = mid; else high = mid;
      }
      sheet.classList.add("po-approvals-compact");
      sheet.style.setProperty("--po-approval-min", low + "px");
      condiciones(clone, sheet);
    } finally {
      done();
    }
  }

  // Si «TERMS AND CONDITIONS» no cabe entera al final de la hoja, pasa completa a la siguiente
  // (antes el título quedaba en una hoja y las condiciones en la otra; lo vio Datnya el 20-sep).
  function condiciones(clone, sheet) {
    const seccion = clone.querySelector(".hpg-ref-conditions");
    if (!seccion) return;
    const { list, theadHeight } = blocksOf(clone, ".hpg-ref-conditions");
    const shift = shiftBefore(list, theadHeight);
    const base = clone.getBoundingClientRect().top;
    const caja = seccion.getBoundingClientRect();
    const alto = caja.height;
    if (alto > PAGE_HEIGHT) return; // más larga que una hoja: se parte igual, no hay remedio
    if (fits(clone, shift, ".hpg-ref-conditions")) return;
    sheet.classList.add("po-conditions-next-page");
  }

  function reset() {
    quitarMargenes();
    document.querySelectorAll(".hpg-reference-po.po-conditions-next-page").forEach((sheet) => sheet.classList.remove("po-conditions-next-page"));
    document.querySelectorAll(".hpg-reference-po.po-approvals-compact").forEach((sheet) => {
      sheet.classList.remove("po-approvals-compact");
      sheet.style.removeProperty("--po-approval-min");
    });
  }

  const style = document.createElement("style");
  style.textContent = "";
  document.head.appendChild(style);

  window.addEventListener("beforeprint", prepare);
  window.addEventListener("afterprint", reset);
  window.VAAKOcImpresion = Object.freeze({ prepare, reset });
})();
