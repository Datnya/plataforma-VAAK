// Impresión de la OC en A4 (pedido de Datnya, 18-sep-2026):
// si el bloque de firmas (APPROVALS) no cabe al final de una hoja y por eso saltaría a la
// siguiente dejando un espacio en blanco, se reduce su alto (arriba y abajo, nunca de ancho)
// lo justo para que quepa. Si ni reduciéndolo cabe, pasa a la hoja siguiente como antes.
//
// Antes de imprimir se simula la paginación sobre una copia invisible de la hoja con las
// mismas medidas que tendrá en el papel (A4 con márgenes 12 mm arriba, 15 mm abajo y 11 mm a
// los lados, igual que @page vaak-po en purchase-order-reference.css).
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
    for (const child of clone.children) {
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

  // Márgenes de la hoja: se ponen al imprimir, desde aquí. Antes estaban en una «página con
  // nombre» (@page vaak-po) y Chrome no siempre la aplica: entonces mandaba el `@page{margin:0}`
  // de otro formato y la OC salía pegada al borde (lo vio Datnya el 20-sep). Este <style> se
  // agrega el último, así gana siempre.
  const MARGENES = "12mm 11mm 15mm";
  function ponerMargenes(sheet) {
    quitarMargenes();
    const numero = (sheet.querySelector(".hpg-ref-number strong") || {}).textContent || "";
    const limpio = String(numero).replace(/[\\"<>\r\n]/g, "").trim();
    const tipo = "font-family:Montserrat,Arial,sans-serif;font-size:7px;letter-spacing:.05em;color:#a9927a;vertical-align:top;padding-top:3mm";
    const pie = marginBoxes()
      ? `@bottom-left{content:"HPG International Latinoamericana SAC · RUC 20600893123 · hpgilatam.com";${tipo}}@bottom-right{content:"${limpio ? limpio + " · " : ""}Page " counter(page) " of " counter(pages);${tipo}}`
      : "";
    const style = document.createElement("style");
    style.id = "vaak-oc-margenes";
    style.media = "print";
    style.textContent = `@page{size:A4;margin:${MARGENES}}${pie ? "@page{" + pie + "}" : ""}`;
    document.head.appendChild(style);
  }
  const quitarMargenes = () => document.getElementById("vaak-oc-margenes")?.remove();

  // El pie en todas las hojas usa los márgenes de página (@bottom-left / @bottom-right), que
  // solo entienden los navegadores que tienen CSSMarginRule (Chrome, Edge, Opera, Brave 131+).
  // En los demás el pie sale una vez, al final (como antes), y se avisa en pantalla.
  const marginBoxes = () => typeof window.CSSMarginRule === "function";
  function footerFallback(sheet) {
    sheet.classList.add("po-footer-fallback");
    document.getElementById("po-footer-notice")?.remove();
    const note = document.createElement("div");
    note.id = "po-footer-notice";
    note.setAttribute("role", "status");
    let spanish = false;
    try { const id = sessionStorage.getItem("vaak-session-tab-v1"); spanish = (localStorage.getItem("vaak-language-" + (id || "guest")) || document.documentElement.lang) === "es"; } catch {}
    note.textContent = spanish
      ? "Este navegador no permite repetir el pie de página en cada hoja: saldrá una vez, al final. Para tenerlo en todas las hojas, descarga el PDF desde Chrome o Edge."
      : "This browser cannot repeat the footer on every page: it will appear once, at the end. To have it on every page, download the PDF from Chrome or Edge.";
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 12000);
  }

  function prepare() {
    reset();
    if (!document.body.classList.contains("print-order")) return;
    const sheet = document.querySelector("#modal-root .hpg-reference-po");
    if (!sheet) return;
    ponerMargenes(sheet);
    if (!marginBoxes()) footerFallback(sheet);
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
    document.querySelectorAll(".hpg-reference-po.po-footer-fallback").forEach((sheet) => sheet.classList.remove("po-footer-fallback"));
    document.querySelectorAll(".hpg-reference-po.po-conditions-next-page").forEach((sheet) => sheet.classList.remove("po-conditions-next-page"));
    document.querySelectorAll(".hpg-reference-po.po-approvals-compact").forEach((sheet) => {
      sheet.classList.remove("po-approvals-compact");
      sheet.style.removeProperty("--po-approval-min");
    });
  }

  const style = document.createElement("style");
  style.textContent = "@media print{.hpg-reference-po.po-footer-fallback .hpg-ref-footer{display:flex!important}#po-footer-notice{display:none!important}}"
    + "#po-footer-notice{position:fixed;left:50%;bottom:1.2rem;z-index:1500;transform:translateX(-50%);max-width:min(560px,92vw);padding:.8rem 1.1rem;border:1px solid #d9b25c;border-radius:10px;background:#fff8e6;color:#6e5312;font-weight:600;font-size:.86rem;box-shadow:0 12px 30px rgba(39,27,21,.2)}";
  document.head.appendChild(style);

  window.addEventListener("beforeprint", prepare);
  window.addEventListener("afterprint", reset);
  window.VAAKOcImpresion = Object.freeze({ prepare, reset });
})();
