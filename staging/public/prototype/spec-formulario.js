// Formulario de spec (pedido de Datnya, 18-sep-2026):
// «Unidad de medida» pasa a ser un desplegable con opciones fijas y «Otro» para escribirla.
// El campo real sigue siendo el cuadro `unit` (queda oculto salvo con «Otro»), así el guardado,
// las revisiones y la ficha técnica no cambian. Aplica al spec nuevo, a editar y a la revisión.
(() => {
  "use strict";
  const UNITS = ["Each", "Un.", "Lot.", "Case", "Box", "SQM", "M2", "M", "Yard", "SQY", "Pies", "Pie2", "Pack"];
  const OTHER = "__otro__";
  const bridge = () => window.VAAKAppBridge;
  const spanish = () => {
    try {
      const id = sessionStorage.getItem("vaak-session-tab-v1");
      const stored = localStorage.getItem("vaak-language-" + (id || "guest"));
      return stored ? stored === "es" : document.documentElement.lang === "es";
    } catch { return false; }
  };
  const es = (a, b) => (spanish() ? a : b);
  // «EACH», «each» o «Un» valen como «Each» o «Un.» para elegir la opción (el valor guardado no se toca).
  const key = (value) => String(value || "").trim().toLowerCase().replace(/\.$/, "");
  const match = (value) => UNITS.find((unit) => key(unit) === key(value)) || null;

  function enhance(input) {
    if (input.dataset.unitReady) return;
    input.dataset.unitReady = "1";
    const select = document.createElement("select");
    select.className = "spec-unit-select";
    select.setAttribute("translate", "no");
    select.setAttribute("aria-label", es("Unidad de medida", "Unit of measure"));
    select.innerHTML = `<option value="">${es("Selecciona una unidad...", "Select a unit...")}</option>${UNITS.map((unit) => `<option value="${unit}">${unit}</option>`).join("")}<option value="${OTHER}">${es("Otro (escribir)", "Other (type it)")}</option>`;
    const current = input.value.trim();
    const known = match(current);
    select.value = !current ? "" : known || OTHER;
    input.before(select);
    input.placeholder = es("Escribe la unidad de medida", "Type the unit of measure");
    input.setAttribute("translate", "no");
    const showOther = () => {
      const other = select.value === OTHER;
      input.hidden = !other;
      input.required = other;
      if (other) input.style.marginTop = ".45rem";
    };
    showOther();
    select.addEventListener("change", () => {
      if (select.value === OTHER) {
        if (match(input.value)) input.value = "";
        showOther();
        input.focus();
      } else {
        // Si la opción equivale a lo guardado (EACH = Each), se deja lo guardado para no marcar un cambio.
        if (!(select.value && key(select.value) === key(input.value))) input.value = select.value;
        showOther();
      }
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  function scan() {
    const op = bridge()?.getActiveOperation();
    document.querySelectorAll("#modal-root input[name='unit']").forEach((input) => {
      const form = input.form;
      const isSpec = op?.kind === "spec-editor" || form?.dataset.recordType === "spec" || /spec/i.test(form?.id || "");
      if (isSpec) enhance(input);
    });
  }
  const modalRoot = document.getElementById("modal-root");
  if (modalRoot) new MutationObserver(scan).observe(modalRoot, { childList: true, subtree: true });

  const style = document.createElement("style");
  style.textContent = ".spec-unit-select{width:100%}";
  document.head.appendChild(style);
})();
