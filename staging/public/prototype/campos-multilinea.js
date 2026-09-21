// Campos de varias líneas (pedido de Datnya, 20-sep-2026: «al dar Enter, el texto debe bajar al
// siguiente renglón»; en «Términos de pago» no se podía).
//
// Los campos largos de los formularios eran de una sola línea: el Enter no bajaba de renglón y,
// además, enviaba el formulario. Aquí se convierten en campos que crecen solos al escribir, sin
// cambiar su nombre ni su valor (se guarda y se imprime igual). En los campos que siguen siendo
// de una línea, el Enter ya no envía el formulario sin querer.
(() => {
  "use strict";
  // Campos que aceptan varias líneas, por formulario.
  const LARGOS = new Set([
    // Orden de compra
    "incoterm", "destination", "freight", "paymentTerms", "productionTime", "warranty", "sideMark", "billTo", "shippingInstructions",
    // Requerimiento de pago
    "sourceManufacturer", "payableTo",
  ]);
  // Solo en el formulario del spec (nuevo, editar o revisión): en el proyecto o el proveedor
  // «name» es un nombre corto y no debe aceptar varias líneas.
  const SOLO_SPEC = new Set(["name", "size", "material", "color"]);
  const esSpec = (form) => window.VAAKAppBridge?.getActiveOperation()?.kind === "spec-editor" || form.dataset.recordType === "spec";

  function alto(area) {
    area.style.height = "auto";
    area.style.height = Math.max(area.scrollHeight, 42) + "px";
  }

  function convertir(input) {
    const area = document.createElement("textarea");
    area.className = (input.className ? input.className + " " : "") + "vaak-multilinea";
    area.name = input.name;
    area.value = input.value;
    area.rows = 1;
    if (input.placeholder) area.placeholder = input.placeholder;
    if (input.required) area.required = true;
    if (input.readOnly) area.readOnly = true;
    if (input.title) area.title = input.title;
    if (input.maxLength > 0) area.maxLength = input.maxLength;
    if (input.getAttribute("translate")) area.setAttribute("translate", input.getAttribute("translate"));
    if (input.id) area.id = input.id;
    // La plataforma, en varios sitios, hace `campo.type = "text"` (al renombrar «Incoterm», al
    // relabelar «Bill To» o el flete). Un textarea no tiene ese dato y daba error en la consola:
    // aquí se le hace creer que es de texto, sin cambiar nada.
    try { Object.defineProperty(area, "type", { get: () => "text", set: () => {}, configurable: true }); } catch {}
    input.replaceWith(area);
    alto(area);
    area.addEventListener("input", () => alto(area));
    return area;
  }

  function revisar(form) {
    if (!form) return;
    // Sin candado: el formulario agrega campos (incoterm, garantía…) después de abrirse.
    form.querySelectorAll("input[name]").forEach((input) => {
      const tipo = (input.type || "text").toLowerCase();
      if (tipo !== "text" || input.list) return;
      if (!LARGOS.has(input.name) && !(SOLO_SPEC.has(input.name) && esSpec(form))) return;
      convertir(input);
    });
  }

  // En los campos de una sola línea, Enter ya no envía el formulario por error.
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey || event.ctrlKey || event.metaKey) return;
    const el = event.target;
    if (!el || !el.form || !el.closest("#modal-root")) return;
    if (el.tagName === "INPUT" && (el.type || "text").toLowerCase() === "text") event.preventDefault();
  });

  const modalRoot = document.getElementById("modal-root");
  const repasar = () => document.querySelectorAll("#modal-root form").forEach(revisar);
  if (modalRoot) new MutationObserver(repasar).observe(modalRoot, { childList: true, subtree: true });
  repasar();

  const style = document.createElement("style");
  style.textContent = "textarea.vaak-multilinea{min-height:42px;line-height:1.35;resize:vertical;overflow:hidden}";
  document.head.appendChild(style);
})();
