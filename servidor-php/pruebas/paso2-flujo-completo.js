// Paso 3: flujo completo en el servidor real (copia local): OC → requerimiento → pago → cambio → reportes,
// y comprobar que otro usuario lo ve (datos compartidos). También el ancho de celular.
const fs = require("fs");
const path = require("path");
const CLAVE = fs.readFileSync(path.join(__dirname, ".local", "clave-admin.txt"), "utf8").trim();
const CLAVES = JSON.parse(fs.readFileSync(path.join(__dirname, ".local", "claves-roles.json"), "utf8"));
const LOGIN = (usuario, clave) => `
  const wait=ms=>new Promise(r=>setTimeout(r,ms)); await wait(1200);
  const u=document.querySelector('input[name=username], input[type=text], input[type=email]'), p=document.querySelector('input[type=password]');
  if(!u||!p) return 'ya-dentro';
  const setv=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))};
  setv(u,${JSON.stringify(usuario)}); setv(p,${JSON.stringify(clave)}); (p.form||document.querySelector('form')).requestSubmit();
  await wait(5000); return window.VAAKAppBridge?.getView()?.user?.role || 'sin-sesion';`;
const LIMPIAR = `localStorage.clear(); sessionStorage.clear(); return 1;`;

module.exports = async (run) => {
  const informe = {};
  await run.ir("http://127.0.0.1:8095/"); await run.eval(LIMPIAR); await run.enviar("Network.clearBrowserCookies"); await run.ir("http://127.0.0.1:8095/");
  informe.entra = await run.eval(LOGIN("auditor.admin", CLAVE));
  informe.flujo = await run.eval(`
    const wait=ms=>new Promise(r=>setTimeout(r,ms)); const r={};
    document.querySelector('.project-card, [data-project-id], [data-project]')?.click(); await wait(1800);
    // 1) OC nueva
    document.querySelector('[data-action="new-order"]').click(); await wait(1500);
    let f=document.getElementById('authorized-form'); const set=async(n,v)=>{const e=f.elements.namedItem(n); if(!e) return; e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); await wait(150);};
    await set('ocTeam','FFE'); await set('ocRubro','ADM'); const prov=[...f.elements.namedItem('supplier').options].map(o=>o.value).find(Boolean); await set('supplier',prov); await set('source',prov);
    const spec=[...f.elements.namedItem('itemSpec0').options].map(o=>o.value).find(Boolean); await set('itemSpec0',spec); await set('itemQuantity0','1'); await set('paymentTerms','Contado'); await set('specifiedBy','ESTUDIO XYZ');
    [...document.querySelectorAll('.modal-foot button')].find(b=>/Continue|Continuar/.test(b.textContent)).click(); await wait(1500);
    [...document.querySelectorAll('.modal-foot button')].find(b=>/Generate purchase|Generar orden/.test(b.textContent))?.click(); await wait(2500);
    let st=JSON.parse(localStorage.getItem('vaak-local-v8')); const oc=st.orders.at(-1); r.oc={numero:oc.number, total:oc.amount, especificadoPor:oc.specifiedBy};
    // 2) Requerimiento de pago
    document.querySelector('[data-new-invoice]').click(); await wait(1500); f=document.getElementById('invoice-editor-form');
    const po=f.elements.namedItem('poNumber'); po.value=oc.number; po.dispatchEvent(new Event('change',{bubbles:true})); await wait(900);
    for(const [n,v] of [['invoiceNumber','F-AUD-1'],['invoiceDate','2026-09-21'],['dueDate','2026-10-21']]){const e=f.elements.namedItem(n); e.value=v; e.dispatchEvent(new Event('input',{bubbles:true}));}
    for(const e of f.querySelectorAll('[required]')) if(!e.value && !e.readOnly){e.value='Prueba'; e.dispatchEvent(new Event('input',{bubbles:true}));}
    f.querySelector('.modal-foot .primary').click(); await wait(1500); document.querySelector('.vaak-confirm-backdrop [data-choice="yes"]')?.click(); await wait(2000);
    st=JSON.parse(localStorage.getItem('vaak-local-v8')); const inv=st.projects.find(p=>(p.invoices||[]).length)?.invoices.at(-1); r.requerimiento={numero:inv?.number, oc:inv?.poNumber, total:inv?.totalRequest, terminos:inv?.paymentTerms};
    // 3) Registrar pago
    const card=[...document.querySelectorAll('.invoice-record')].at(-1);
    [...card.querySelectorAll('button')].find(b=>/Register payment|Registrar pago/.test(b.textContent))?.click(); await wait(1400);
    f=document.getElementById('payment-register-form');
    if(f){ for(const [n,v] of [['paidAmount','100'],['paymentDate','2026-09-21'],['transferNumber','TRF-1'],['paymentComments','Abono']]){const e=f.elements.namedItem(n); e.value=v; e.dispatchEvent(new Event('input',{bubbles:true}));} await wait(300); f.requestSubmit(); await wait(2000); }
    st=JSON.parse(localStorage.getItem('vaak-local-v8')); const inv2=st.projects.find(p=>(p.invoices||[]).length)?.invoices.at(-1); r.pago={pagado:inv2?.paidAmount, pendiente:inv2?.pendingAmount};
    // 4) Cambio de orden
    document.querySelector('[data-revise-order="'+oc.id+'"]')?.click(); await wait(1500); f=document.getElementById('order-revision-form');
    if(f){const w=f.elements.namedItem('warranty'); w.value='2 años'; w.dispatchEvent(new Event('input',{bubbles:true})); await wait(600); f.querySelectorAll('[data-reason-key]').forEach(x=>{x.value='Acuerdo'; x.dispatchEvent(new Event('input',{bubbles:true}));}); f.requestSubmit(); await wait(2000);}
    st=JSON.parse(localStorage.getItem('vaak-local-v8')); const oc2=st.orders.find(o=>o.id===oc.id); r.cambio={revision:oc2?.revision, garantia:oc2?.warranty};
    // 5) Reportes (sin descargar: se captura el archivo)
    const blobs=[]; const orig=URL.createObjectURL; URL.createObjectURL=b=>{blobs.push(b); return orig(b)}; HTMLAnchorElement.prototype.click=function(){};
    for(const b of document.querySelectorAll('[data-project-report]')){ b.click(); await wait(2500); }
    r.reportes=blobs.map(b=>b.size+' bytes');
    // 6) ¿Llegó al servidor?
    await wait(4000);
    const resp=await fetch('/api/data',{credentials:'same-origin'}); const datos=await resp.json();
    const texto=JSON.stringify(datos.state||{}); r.servidor={revision:datos.revision, tieneOC:texto.includes(oc.number), tieneRequerimiento:texto.includes(inv?.number||'@@'), tieneCambio:texto.includes('2 años')};
    return r;`);
  informe.erroresAdmin = [...run.errores];
  // Otro usuario (trabajador) en una sesión nueva: ¿ve lo mismo?
  run.errores.length = 0;
  await run.eval(LIMPIAR); await run.enviar("Network.clearBrowserCookies"); await run.ir("http://127.0.0.1:8095/");
  informe.trabajador = await run.eval(LOGIN("trab.prueba", CLAVES.trab));
  informe.trabajadorVe = await run.eval(`const wait=ms=>new Promise(r=>setTimeout(r,ms)); await wait(2500); const st=JSON.parse(localStorage.getItem('vaak-local-v8')||'{}'); const todo=Object.keys(localStorage).map(k=>localStorage.getItem(k)).join('|'); return {proyectos:(st.projects||[]).map(p=>p.code), ordenes:(st.orders||[]).map(o=>o.number), requerimientos:(st.projects||[]).flatMap(p=>(p.invoices||[]).map(i=>i.number)), veProyectoAjeno:/AUD-001|Hotel Auditor/.test(todo), correosAjenos:(st.users||[]).filter(u=>u.email&&u.username!=='trab.prueba').length};`);
  informe.trabajadorEscribe = await run.eval(`
    const wait=ms=>new Promise(r=>setTimeout(r,ms));
    document.querySelector('.project-card, [data-project-id], [data-project]')?.click(); await wait(1500);
    const b=[...document.querySelectorAll('button')].find(x=>/Add new spec|Agregar nuevo spec/.test(x.textContent)); if(!b) return 'sin botón de spec';
    b.click(); await wait(1200); const f=document.querySelector('#modal-root form');
    const e=f.elements.namedItem('name'); e.value='Spec del trabajador'; e.dispatchEvent(new Event('input',{bubbles:true}));
    for(const x of f.querySelectorAll('[required]')) if(!x.value){ if(x.tagName==='SELECT') x.value=[...x.options].map(o=>o.value).find(Boolean)||''; else x.value='Dato'; x.dispatchEvent(new Event('input',{bubbles:true})); }
    f.requestSubmit(); await wait(2500); document.querySelector('#modal-root [data-command="close"]')?.click();
    await wait(5000); const d=await (await fetch('/api/data',{credentials:'same-origin'})).json();
    return {enServidor:JSON.stringify(d.state).includes('Spec del trabajador'), revision:d.revision};`);
  // Celular: ¿hay desborde horizontal en las pantallas principales?
  await run.ancho(375, 812);
  informe.celular = await run.eval(`
    const wait=ms=>new Promise(r=>setTimeout(r,ms)); const res=[];
    const medir=(n)=>res.push({pantalla:n, desbordaPx:Math.max(0,document.documentElement.scrollWidth-innerWidth)});
    document.querySelector('[data-route="home"]')?.click(); await wait(1200); medir('Inicio');
    document.querySelector('.project-card, [data-project-id], [data-project]')?.click(); await wait(1500); medir('Proyecto');
    document.querySelector('[data-action="new-order"]')?.click(); await wait(1400); medir('Formulario de OC'); document.querySelector('#modal-root [data-command="close"]')?.click(); await wait(300);
    document.querySelector('[data-route="tools"]')?.click(); await wait(1200); medir('Herramientas');
    return res;`);
  informe.erroresTrabajador = [...run.errores];
  console.log(JSON.stringify(informe, null, 1));
};
