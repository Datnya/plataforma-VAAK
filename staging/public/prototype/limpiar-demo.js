// Quitar los datos de demostración (auditoría, 21-sep-2026). Hasta esa fecha el primer ingreso de
// un administrador publicaba los ejemplos del prototipo (Hotel Costa Azul, Logistics Center,
// PO-2026-001...). Si el servidor todavía los tiene, al administrador le aparece un aviso para
// revisarlos y quitarlos; el servidor guarda antes la versión anterior en su historial.
(() => {
  "use strict";
  const spanish = () => {
    try {
      const id = sessionStorage.getItem("vaak-session-tab-v1");
      const stored = localStorage.getItem("vaak-language-" + (id || "guest"));
      return stored ? stored === "es" : document.documentElement.lang === "es";
    } catch { return false; }
  };
  const es = (a, b) => (spanish() ? a : b);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const request = (url, options) => window.VAAKRemote.request(url, options);
  const preguntar = (confirm) => request("/api/admin/demo-cleanup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ confirm }) });

  const style = document.createElement("style");
  style.textContent = ".vaak-demo-aviso{position:fixed;left:50%;bottom:1rem;transform:translateX(-50%);z-index:1200;display:flex;flex-wrap:wrap;align-items:center;gap:.7rem;width:min(640px,calc(100% - 2rem));padding:.8rem 1rem;border:1px solid #e3c98f;border-radius:12px;background:#fff8e8;color:#5b4030;box-shadow:0 10px 30px rgba(39,27,21,.18);font-size:.9rem}.vaak-demo-aviso p{flex:1 1 260px;margin:0}.vaak-demo-aviso button{white-space:nowrap}"
    + ".vaak-confirm-backdrop{position:fixed;inset:0;z-index:1300;display:grid;place-items:center;padding:1rem;background:rgba(39,27,21,.55)}.vaak-confirm{width:min(520px,100%);max-height:90vh;overflow:auto;border-radius:14px;background:#fff;box-shadow:0 24px 60px rgba(39,27,21,.35)}.vaak-confirm-head{display:flex;align-items:center;gap:.7rem;padding:1.1rem 1.3rem .4rem}.vaak-confirm-icon{display:grid;place-items:center;flex:0 0 38px;width:38px;height:38px;border-radius:50%;background:#f6ead3;color:#876312;font-weight:800;font-size:1.1rem}.vaak-confirm-head h3{margin:0;font-size:1.15rem;color:#35251d}.vaak-confirm-body{padding:.4rem 1.3rem 1rem;color:#4f4038;font-size:.9rem;line-height:1.55}.vaak-confirm-body p{margin:.45rem 0}.vaak-confirm-body ul{margin:.45rem 0 .2rem;padding-left:1.15rem}.vaak-confirm-foot{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.6rem;padding:.9rem 1.3rem 1.2rem;border-top:1px solid #eee4da}"
    + ".vaak-demo-error{margin:.6rem 0 0;padding:.6rem .8rem;border-radius:8px;background:#fdecea;color:#a61b1b;font-weight:600}.vaak-demo-alerta{padding:.6rem .8rem;border-radius:8px;background:#fdf1dc;color:#7a4b06}"
    + ".vaak-demo-spin{display:inline-block;width:1em;height:1em;margin-right:.45rem;vertical-align:-.15em;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:vaak-demo-giro .7s linear infinite}@keyframes vaak-demo-giro{to{transform:rotate(360deg)}}";
  document.head.appendChild(style);

  const lista = (titulo, items) => (items.length ? `<p><strong>${titulo}</strong></p><ul translate="no" class="notranslate">${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "");
  const motivo = (error) => {
    if (error?.status === 403) return es("Solo un administrador puede hacerlo.", "Only an administrator can do this.");
    if (error?.status === 401) return es("Tu sesión terminó. Vuelve a iniciar sesión.", "Your session ended. Sign in again.");
    if (!navigator.onLine) return es("No hay conexión a internet.", "There is no internet connection.");
    return es("El servidor no respondió (", "The server did not respond (") + esc(error?.code || error?.message || "error") + ").";
  };

  function abrir(resumen, aviso) {
    const r = resumen.summary || {};
    const backdrop = document.createElement("div");
    backdrop.className = "vaak-confirm-backdrop";
    const reales = r.realesDentro || [];
    backdrop.innerHTML = `<div class="vaak-confirm" role="alertdialog" aria-modal="true"><div class="vaak-confirm-head"><span class="vaak-confirm-icon" aria-hidden="true">!</span><h3>${es("Quitar los datos de demostración", "Remove the demo data")}</h3></div><div class="vaak-confirm-body">`
      + `<p>${es("Estos registros son los ejemplos que traía la plataforma, no datos de tu empresa:", "These records are the examples the platform came with, not your company's data:")}</p>`
      + lista(es("Proyectos", "Projects"), r.projects || []) + lista(es("Órdenes de compra", "Purchase orders"), r.orders || [])
      + lista(es("Proveedores", "Suppliers"), r.suppliers || []) + lista("Specs", r.specs || []) + lista(es("Tareas", "Tasks"), r.tasks || [])
      + (r.invoices ? `<p>${es("Requerimientos de pago dentro de esos proyectos:", "Payment requests inside those projects:")} ${r.invoices}</p>` : "")
      + (reales.length ? `<p class="vaak-demo-alerta">${es("Atención: dentro de los proyectos de demostración también hay registros creados después, que se quitarán con ellos:", "Warning: the demo projects also contain records created later, which will be removed with them:")} <span translate="no" class="notranslate">${reales.map(esc).join(", ")}</span></p>` : "")
      + `<p>${es("Se guarda una copia de la versión actual en el historial del servidor antes de quitarlos.", "A copy of the current version is kept in the server history before removing them.")}</p><div data-error></div></div>`
      + `<div class="vaak-confirm-foot"><button type="button" class="secondary" data-choice="no">${es("Cancelar", "Cancel")}</button><button type="button" class="danger" data-choice="yes">${es("Quitar datos de demostración", "Remove demo data")}</button></div></div>`;
    document.body.appendChild(backdrop);
    const cerrar = () => backdrop.remove();
    backdrop.querySelector('[data-choice="no"]').addEventListener("click", cerrar);
    const boton = backdrop.querySelector('[data-choice="yes"]');
    boton.addEventListener("click", async () => {
      const texto = boton.innerHTML;
      boton.disabled = true;
      boton.innerHTML = `<span class="vaak-demo-spin" aria-hidden="true"></span>${es("Quitando…", "Removing…")}`;
      backdrop.querySelector("[data-error]").innerHTML = "";
      try {
        const hecho = await preguntar(true);
        await window.VAAKSharedSync?.pull();
        cerrar();
        aviso.innerHTML = `<p>${es("Listo: se quitaron", "Done: removed")} ${hecho.total} ${es("registros de demostración.", "demo records.")}</p><button type="button" class="secondary">${es("Cerrar", "Close")}</button>`;
        aviso.querySelector("button").addEventListener("click", () => aviso.remove());
      } catch (error) {
        boton.disabled = false;
        boton.innerHTML = texto;
        backdrop.querySelector("[data-error]").innerHTML = `<p class="vaak-demo-error">${es("No se pudieron quitar: ", "Could not remove them: ")}${motivo(error)}</p>`;
      }
    });
  }

  let revisado = null;
  async function revisar() {
    const view = window.VAAKAppBridge?.getView?.();
    const user = view?.user;
    if (!user || user.role !== "Admin" || revisado === user.id || !window.VAAKRemote) return;
    revisado = user.id;
    let resumen;
    try { resumen = await preguntar(false); } catch { revisado = null; return; }
    if (!resumen.total) return;
    document.querySelector(".vaak-demo-aviso")?.remove();
    const aviso = document.createElement("div");
    aviso.className = "vaak-demo-aviso";
    aviso.setAttribute("role", "status");
    aviso.innerHTML = `<p>${es("La plataforma todavía tiene datos de demostración", "The platform still has demo data")} (${resumen.total} ${es("registros", "records")}).</p><button type="button" class="primary">${es("Revisar y quitar", "Review and remove")}</button>`;
    aviso.querySelector("button").addEventListener("click", () => abrir(resumen, aviso));
    document.body.appendChild(aviso);
  }
  window.addEventListener("vaak:session", (event) => {
    if (!event.detail?.authenticated) { revisado = null; document.querySelector(".vaak-demo-aviso")?.remove(); return; }
    setTimeout(revisar, 4000);
  });
  setInterval(revisar, 15000);
})();
