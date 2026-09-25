// Paso 11: las tres secciones del proyecto (specs, órdenes de compra y requerimientos de pago)
// muestran solo los últimos registros, y el registro completo se abre en un cuadro con buscador y
// filtros. Además, la ficha técnica abierta desde el cuadro tiene que quedar ENCIMA del cuadro.
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
    const proyecto=(estado.projects||[]).find(p=>p.id===pid)||{};
    const specs=(estado.specs||[]).filter(s=>s.projectId===pid), ordenes=(estado.orders||[]).filter(o=>o.projectId===pid), rps=proyecto.invoices||[];
    out.pagina={
      specs:{enProyecto:specs.length, visibles:qq('#app .spec-card').length, boton:!!q('[data-lst-ver-specs]')},
      oc:{enProyecto:ordenes.length, visibles:qq('#app .project-orders-unified .tracking-card').length, boton:!!q('[data-lst-ver-oc]'),
          botonJuntoAlDeGenerar:!!q('.project-purchase-subsection .section-head-actions [data-lst-ver-oc]'),
          registroViejoFuera:!q('#app .project-order-register')},
      rp:{enProyecto:rps.length, visibles:qq('#app .invoice-record').length, boton:!!q('[data-lst-ver-rp]'),
          botonJuntoAlDeGenerar:!!q('.project-invoice-section .section-head-actions [data-lst-ver-rp]')}};
    // --- Cuadro de specs + ficha técnica encima
    if (q('[data-lst-ver-specs]')) {
      q('[data-lst-ver-specs]').click(); await wait(1200);
      out.cuadroSpecs={abre:!!q('.lst-fondo'), total:q('[data-lst-total]')?.textContent, tarjetas:qq('.lst-fondo .spec-card').length,
        rubros:qq('.lst-fondo [data-lst-rubro] option').length, equipos:qq('.lst-fondo [data-lst-grupo=equipo] .lst-chip').length};
      const buscar=q('.lst-fondo [data-lst-q]');
      buscar.value='zzzzz'; buscar.dispatchEvent(new Event('input',{bubbles:true})); await wait(500);
      out.cuadroSpecs.busquedaSinResultados=q('[data-lst-total]')?.textContent;
      buscar.value=(specs[0]?.name||'').slice(0,10); buscar.dispatchEvent(new Event('input',{bubbles:true})); await wait(500);
      out.cuadroSpecs.busquedaPorNombre=q('[data-lst-total]')?.textContent;
      // La ficha técnica se abre desde dentro del cuadro: debe quedar delante.
      q('.lst-fondo [data-action="preview-spec"]')?.click(); await wait(1500);
      const arriba=document.elementFromPoint(Math.round(innerWidth/2), Math.round(innerHeight/2));
      out.fichaTecnica={abre:!!q('#modal-root .modal-backdrop'), hayFicha:!!q('.hpg-technical-sheet'),
        cuadroDetras:!!q('.lst-fondo.lst-atras'), loQueSeVeEnElCentro:arriba?.closest('#modal-root')?'ficha':arriba?.closest('.lst-fondo')?'cuadro':'otra cosa'};
      q('#modal-root [data-command="close"]')?.click(); await wait(800);
      out.fichaTecnica.alCerrarVuelveElCuadro=!q('.lst-fondo.lst-atras') && !!q('.lst-fondo');
      q('.lst-fondo [data-lst-cerrar]')?.click(); await wait(400);
    }
    // --- Cuadro de órdenes de compra
    if (q('[data-lst-ver-oc]')) {
      q('[data-lst-ver-oc]').click(); await wait(1200);
      out.cuadroOC={abre:!!q('.lst-fondo'), total:q('[data-lst-total]')?.textContent, tarjetas:qq('.lst-fondo .tracking-card').length,
        estados:qq('.lst-fondo [data-lst-grupo=estado] .lst-chip').length, equipos:qq('.lst-fondo [data-lst-grupo=equipo] .lst-chip').length,
        fechas:qq('.lst-fondo [data-lst-desde], .lst-fondo [data-lst-hasta]').length};
      const buscarOC=q('.lst-fondo [data-lst-q]');
      buscarOC.value=(ordenes[0]?.number||'').slice(0,8); buscarOC.dispatchEvent(new Event('input',{bubbles:true})); await wait(500);
      out.cuadroOC.busquedaPorNumero=q('[data-lst-total]')?.textContent;
      buscarOC.value=(ordenes[0]?.supplier||'').slice(0,8); buscarOC.dispatchEvent(new Event('input',{bubbles:true})); await wait(500);
      out.cuadroOC.busquedaPorProveedor=q('[data-lst-total]')?.textContent;
      buscarOC.value=''; buscarOC.dispatchEvent(new Event('input',{bubbles:true})); await wait(300);
      const desde=q('.lst-fondo [data-lst-desde]'); desde.value='2030-01-01'; desde.dispatchEvent(new Event('change',{bubbles:true})); await wait(500);
      out.cuadroOC.desde2030=q('[data-lst-total]')?.textContent;
      q('.lst-fondo [data-lst-cerrar]')?.click(); await wait(400);
    }
    // --- Cuadro de requerimientos de pago
    if (q('[data-lst-ver-rp]')) {
      q('[data-lst-ver-rp]').click(); await wait(1200);
      out.cuadroRP={abre:!!q('.lst-fondo'), total:q('[data-lst-total]')?.textContent, tarjetas:qq('.lst-fondo .invoice-record').length,
        pago:qq('.lst-fondo [data-lst-grupo=pago] .lst-chip').length, equipos:qq('.lst-fondo [data-lst-grupo=equipo] .lst-chip').length,
        fechas:qq('.lst-fondo [data-lst-desde], .lst-fondo [data-lst-hasta]').length};
      const buscarRP=q('.lst-fondo [data-lst-q]');
      buscarRP.value=(rps[0]?.number||'').slice(0,8); buscarRP.dispatchEvent(new Event('input',{bubbles:true})); await wait(500);
      out.cuadroRP.busquedaPorNumero=q('[data-lst-total]')?.textContent;
      buscarRP.value=(rps[0]?.poNumber||'').slice(0,8); buscarRP.dispatchEvent(new Event('input',{bubbles:true})); await wait(500);
      out.cuadroRP.busquedaPorOC=q('[data-lst-total]')?.textContent;
      buscarRP.value='zzzzz'; buscarRP.dispatchEvent(new Event('input',{bubbles:true})); await wait(500);
      out.cuadroRP.busquedaSinResultados=q('[data-lst-total]')?.textContent;
      buscarRP.value=''; buscarRP.dispatchEvent(new Event('input',{bubbles:true})); await wait(300);
      qq('.lst-fondo [data-lst-grupo=pago] .lst-chip').find(b=>b.dataset.valor==='pendiente')?.click(); await wait(500);
      out.cuadroRP.sinPago=q('[data-lst-total]')?.textContent;
      qq('.lst-fondo [data-lst-grupo=pago] .lst-chip').find(b=>b.dataset.valor==='pagado')?.click(); await wait(500);
      out.cuadroRP.conPago=q('[data-lst-total]')?.textContent;
      q('.lst-fondo [data-lst-cerrar]')?.click();
    }
    return out;`);
  r.errores = run.errores;
  console.log(JSON.stringify(r, null, 1));
};
