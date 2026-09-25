// Paso 11: la página del proyecto muestra solo los últimos registros y el registro completo se abre
// en un cuadro con buscador y filtros (specs y órdenes de compra).
const fs = require("fs"); const path = require("path");
const CLAVE = fs.readFileSync(path.join(__dirname, ".local", "clave-admin.txt"), "utf8").trim();
module.exports = async (run) => {
  await run.ir("http://127.0.0.1:8095/");
  await run.eval("localStorage.clear(); sessionStorage.clear(); return 1");
  await run.enviar("Network.clearBrowserCookies");
  await run.ir("http://127.0.0.1:8095/");
  const r = await run.eval(`const wait=ms=>new Promise(r=>setTimeout(r,ms)); const q=(s)=>document.querySelector(s); const qq=(s)=>[...document.querySelectorAll(s)];
    const f0=document.getElementById('login'); f0.elements.username.value='auditor.admin'; f0.elements.password.value=${JSON.stringify(CLAVE)}; f0.requestSubmit(); await wait(8000);
    const out={};
    q('.project-card, [data-project-id], [data-project]')?.click(); await wait(3000);
    const estado=JSON.parse(localStorage.getItem('vaak-local-v8'));
    const pid=window.VAAKAppBridge.getView().selectedProjectId;
    const specs=(estado.specs||[]).filter(s=>s.projectId===pid), ordenes=(estado.orders||[]).filter(o=>o.projectId===pid);
    out.pagina={specsEnProyecto:specs.length, specsVisibles:qq('#app .spec-card').length, ordenesEnProyecto:ordenes.length,
      ordenesVisibles:qq('#app .project-order-register-row').length,
      botonSpecs:!!q('[data-lst-ver-specs]'), botonOC:!!q('[data-lst-ver-oc]'),
      buscadorFueraDeLaPagina:!q('#app #project-spec-search')};
    if (q('[data-lst-ver-specs]')) {
      q('[data-lst-ver-specs]').click(); await wait(1200);
      out.cuadroSpecs={abre:!!q('.lst-fondo'), total:q('[data-lst-total]')?.textContent, tarjetas:qq('.lst-fondo .spec-card').length,
        rubrosEnFiltro:qq('.lst-fondo [data-lst-rubro] option').length, equipos:qq('.lst-fondo [data-lst-grupo=equipo] .lst-chip').length};
      const buscar=q('.lst-fondo [data-lst-q]');
      buscar.value='zzzzz'; buscar.dispatchEvent(new Event('input',{bubbles:true})); await wait(500);
      out.cuadroSpecs.busquedaSinResultados=q('[data-lst-total]')?.textContent;
      buscar.value=(specs[0]?.name||'').slice(0,10); buscar.dispatchEvent(new Event('input',{bubbles:true})); await wait(500);
      out.cuadroSpecs.busquedaPorNombre=q('[data-lst-total]')?.textContent;
      q('.lst-fondo [data-lst-cerrar]').click(); await wait(400);
    }
    if (q('[data-lst-ver-oc]')) {
      q('[data-lst-ver-oc]').click(); await wait(1200);
      out.cuadroOC={abre:!!q('.lst-fondo'), total:q('[data-lst-total]')?.textContent, filas:qq('.lst-fondo .project-order-register-row').length,
        estados:qq('.lst-fondo [data-lst-grupo=estado] .lst-chip').length, fechas:qq('.lst-fondo [data-lst-desde], .lst-fondo [data-lst-hasta]').length};
      const buscarOC=q('.lst-fondo [data-lst-q]');
      buscarOC.value=(ordenes[0]?.number||'').slice(0,8); buscarOC.dispatchEvent(new Event('input',{bubbles:true})); await wait(500);
      out.cuadroOC.busquedaPorNumero=q('[data-lst-total]')?.textContent;
      q('.lst-fondo [data-lst-cerrar]').click();
    }
    return out;`);
  r.errores = run.errores;
  console.log(JSON.stringify(r, null, 1));
};
