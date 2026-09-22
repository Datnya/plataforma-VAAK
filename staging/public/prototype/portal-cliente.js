// Portal del cliente (22-sep-2026): carrusel de imágenes del banner de su proyecto y la sección
// «Project reports», que descarga los Excel de sus OC aprobadas y de sus requerimientos de pago en
// versión de solo lectura (hojas bloqueadas y aviso legal de HPG). Los reportes se arman en el momento
// con la copia que el navegador mantiene sincronizada con el servidor, así que siempre traen lo último.
(() => {
  "use strict";
  const estado = () => { try { return JSON.parse(localStorage.getItem("vaak-local-v8") || "null"); } catch { return null; } };
  const aprobada = (o) => !o.isDraft && String(o.status || "approved").toLowerCase() === "approved";

  const style = document.createElement("style");
  style.textContent = ".client-banner{position:relative}.client-banner .client-banner-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:2}.client-banner .banner-prev{left:18px}.client-banner .banner-next{right:18px}.client-banner .client-banner-counter{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:2}"
    + ".client-reports-section{margin-top:2rem}.client-report-notice{margin:1rem 0 0;padding:.75rem 1rem;border-left:3px solid #b8893f;background:#fbf6ee;color:#6b5a4c;font-size:.78rem;line-height:1.5}"
    + ".client-report-error{flex-basis:100%;margin:.5rem 0 0;color:#b3261e;font-size:.8rem;font-weight:600}"
    + "@media (max-width:640px){.client-banner .client-banner-nav{top:16px;transform:none;width:36px;height:36px}.client-banner .banner-prev{left:auto;right:60px}.client-banner .banner-next{right:16px}.client-banner .client-banner-counter{left:auto;right:16px;bottom:auto;top:60px;transform:none}.client-history-card{overflow-x:auto;-webkit-overflow-scrolling:touch}.client-history-table{min-width:620px}.client-history-table td,.client-history-table th{white-space:nowrap}}"
    + ".client-report-spin{display:inline-block;width:1em;height:1em;margin-right:.45rem;vertical-align:-.15em;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:vaak-cliente-giro .7s linear infinite}@keyframes vaak-cliente-giro{to{transform:rotate(360deg)}}";
  document.head.appendChild(style);

  document.addEventListener("click", async (event) => {
    const nav = event.target.closest("[data-client-banner-nav]");
    if (nav) {
      const banner = nav.closest("[data-client-banner]");
      let imagenes = [];
      try { imagenes = JSON.parse(banner.dataset.bannerImages || "[]"); } catch {}
      if (imagenes.length < 2) return;
      const i = (Number(banner.dataset.bannerIndex || 0) + Number(nav.dataset.clientBannerNav) + imagenes.length) % imagenes.length;
      banner.dataset.bannerIndex = String(i);
      banner.style.backgroundImage = `url("${String(imagenes[i]).replace(/"/g, "%22")}")`;
      const contador = banner.querySelector(".client-banner-counter");
      if (contador) contador.textContent = `${i + 1} / ${imagenes.length}`;
      return;
    }

    const boton = event.target.closest("[data-client-report]");
    if (!boton || boton.disabled) return;
    event.preventDefault();
    const tarjeta = boton.closest(".project-report-card");
    tarjeta?.querySelector(".client-report-error")?.remove();
    const fallar = (texto) => {
      const p = document.createElement("p");
      p.className = "client-report-error";
      p.setAttribute("role", "alert");
      p.textContent = texto;
      tarjeta?.appendChild(p);
    };
    const s = estado();
    const proyecto = s?.projects?.find((p) => p.id === boton.dataset.projectId);
    if (!proyecto || !window.VAAKReports) return fallar("The report could not be generated: the project data is not loaded yet. Reload the page and try again.");
    const texto = boton.innerHTML;
    boton.disabled = true;
    boton.innerHTML = '<span class="client-report-spin" aria-hidden="true"></span>Generating...';
    try {
      // Antes de armarlo se trae lo último del servidor, para que el reporte esté al día.
      try { await window.VAAKSharedSync?.pull(); } catch {}
      const actual = estado() || s;
      const p = actual.projects.find((x) => x.id === proyecto.id) || proyecto;
      const ordenes = (actual.orders || []).filter((o) => o.projectId === p.id && aprobada(o));
      if (boton.dataset.clientReport === "orders") await window.VAAKReports.purchaseOrders(p, ordenes, actual.specs || [], { cliente: true });
      else await window.VAAKReports.invoices(p, ordenes, { cliente: true });
    } catch (error) {
      console.error(error);
      fallar("The report could not be generated (" + (error?.message || "unknown error") + "). Check your internet connection and try again.");
    } finally {
      boton.disabled = false;
      boton.innerHTML = texto;
    }
  }, true);
})();
