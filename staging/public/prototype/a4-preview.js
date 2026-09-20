// Previsualizacion en A4 real.
//
// Las tres hojas (orden de compra, solicitud de pago y ficha tecnica) estan
// disenadas a 794px de ancho, que es un A4 a 96dpi. Cuando el cuadro emergente
// es mas angosto que eso, la hoja se sale y el contenido se desconfigura.
//
// Aqui la hoja se mantiene SIEMPRE a 794px y, si no cabe, se reduce
// visualmente con un escalado. Asi se ve completa y con la misma composicion
// que tendra impresa, solo que mas pequena. Al imprimir el escalado se anula
// (ver la regla @media print), de modo que el PDF sale intacto.
(() => {
  "use strict";
  const HOJAS = ".hpg-reference-po,.hpg-payment-request,.hpg-technical-sheet";
  const ANCHO_A4 = 794;
  let pendiente = false;
  // Zoom con lupa (pedido de Datnya, 20-sep-2026): 1 = como entra en la ventana.
  let zoom = 1;
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3;
  const esp = () => {
    try {
      const id = sessionStorage.getItem("vaak-session-tab-v1");
      const guardado = localStorage.getItem("vaak-language-" + (id || "guest"));
      return guardado ? guardado === "es" : document.documentElement.lang === "es";
    } catch { return false; }
  };

  const contenedor = () => document.getElementById("modal-root");

  function envolver(hoja) {
    const padre = hoja.parentElement;
    if (padre && padre.classList.contains("a4-stage")) return padre;
    const escenario = document.createElement("div");
    escenario.className = "a4-stage";
    padre.insertBefore(escenario, hoja);
    escenario.appendChild(hoja);
    return escenario;
  }

  function anchoDisponible(elemento) {
    const caja = elemento.parentElement;
    if (!caja) return 0;
    const estilo = getComputedStyle(caja);
    return (
      caja.clientWidth -
      parseFloat(estilo.paddingLeft || 0) -
      parseFloat(estilo.paddingRight || 0)
    );
  }

  function ajustar(hoja) {
    const escenario = envolver(hoja);
    barra(escenario);
    const disponible = anchoDisponible(escenario);
    if (disponible <= 0) return;
    const escala = Math.min(1, disponible / ANCHO_A4) * zoom;
    // offsetHeight es la altura sin escalar, que es la que hay que convertir.
    const alto = hoja.offsetHeight;
    hoja.style.transformOrigin = "top left";
    // Con la lupa la escala puede pasar de 1: entonces también hay que aplicarla.
    hoja.style.transform = escala !== 1 ? `scale(${escala})` : "";
    escenario.style.width = Math.round(ANCHO_A4 * escala) + "px";
    escenario.style.height = alto ? Math.ceil(alto * escala) + "px" : "";
  }

  // Barra con la lupa, encima de la hoja.
  function barra(escenario) {
    const caja = escenario.parentElement;
    if (!caja || caja.querySelector(".a4-zoom")) return;
    const barraZoom = document.createElement("div");
    barraZoom.className = "a4-zoom";
    barraZoom.innerHTML =
      `<button type="button" data-zoom="-" title="${esp() ? "Alejar" : "Zoom out"}" aria-label="${esp() ? "Alejar" : "Zoom out"}">🔍−</button>` +
      `<span data-zoom-valor>100%</span>` +
      `<button type="button" data-zoom="+" title="${esp() ? "Acercar" : "Zoom in"}" aria-label="${esp() ? "Acercar" : "Zoom in"}">🔍+</button>` +
      `<button type="button" data-zoom="1" title="${esp() ? "Ajustar a la ventana" : "Fit to window"}">${esp() ? "Ajustar" : "Fit"}</button>`;
    caja.insertBefore(barraZoom, escenario);
    barraZoom.addEventListener("click", (evento) => {
      const boton = evento.target.closest("[data-zoom]");
      if (!boton) return;
      evento.preventDefault();
      const paso = boton.dataset.zoom;
      if (paso === "1") zoom = 1;
      else if (paso === "+") zoom = Math.min(ZOOM_MAX, Math.round((zoom + 0.25) * 100) / 100);
      else zoom = Math.max(ZOOM_MIN, Math.round((zoom - 0.25) * 100) / 100);
      ajustarTodo();
    });
  }

  function ajustarTodo() {
    pendiente = false;
    const host = contenedor();
    if (!host) return;
    host.querySelectorAll(HOJAS).forEach((hoja) => {
      ajustar(hoja);
      observarAlto(hoja);
    });
    host.querySelectorAll("[data-zoom-valor]").forEach((etiqueta) => {
      etiqueta.textContent = Math.round(zoom * 100) + "%";
    });
    if (!host.querySelector(HOJAS)) zoom = 1; // al cerrar la ventana, vuelve al tamaño normal
  }

  function programar() {
    if (pendiente) return;
    pendiente = true;
    // setTimeout y no requestAnimationFrame: rAF no corre si la pestana esta
    // en segundo plano, y entonces la hoja se quedaria sin ajustar.
    setTimeout(ajustarTodo, 0);
  }

  // La altura cambia cuando cargan las imagenes o cambia el contenido.
  const observadorAlto =
    typeof ResizeObserver === "function"
      ? new ResizeObserver(() => programar())
      : null;
  const observadas = new WeakSet();
  function observarAlto(hoja) {
    if (!observadorAlto || observadas.has(hoja)) return;
    observadas.add(hoja);
    observadorAlto.observe(hoja);
  }

  function arrancar() {
    const host = contenedor();
    if (!host) return;
    new MutationObserver(programar).observe(host, {
      childList: true,
      subtree: true,
    });
    addEventListener("resize", programar);
    // Al imprimir se quita el escalado; al terminar se vuelve a poner.
    addEventListener("beforeprint", () =>
      document.querySelectorAll(HOJAS).forEach((hoja) => {
        hoja.style.transform = "";
      })
    );
    addEventListener("afterprint", programar);
    programar();
  }

  window.VAAKA4Preview = { ajustar: ajustarTodo, programar };

  if (document.readyState === "loading")
    addEventListener("DOMContentLoaded", arrancar);
  else arrancar();
})();
