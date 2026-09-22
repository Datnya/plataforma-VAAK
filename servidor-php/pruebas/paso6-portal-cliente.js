// Paso 6: el cliente ve su proyecto (nombre y banner), solo sus OC aprobadas y los requerimientos de
// pago de esas OC, descarga sus reportes Excel de solo lectura y encuentra su envío por tracking.
const fs = require("fs"); const path = require("path");
const CLAVES = JSON.parse(fs.readFileSync(path.join(__dirname, ".local", "claves-roles.json"), "utf8"));
module.exports = async (run) => {
  await run.ir("http://127.0.0.1:8095/"); await run.eval(`localStorage.clear(); sessionStorage.clear(); return 1`);
  await run.enviar("Network.clearBrowserCookies"); await run.ir("http://127.0.0.1:8095/");
  const r = await run.eval(`const wait=ms=>new Promise(r=>setTimeout(r,ms));
    const f=document.getElementById('login'); f.elements.username.value='clie.prueba'; f.elements.password.value=${JSON.stringify(CLAVES.clie)}; f.requestSubmit(); await wait(8000);
    const local=JSON.parse(localStorage.getItem('vaak-local-v8')||'{}');
    const out={rol:window.VAAKAppBridge?.getView()?.user?.role, proyecto:document.querySelector('.client-banner-title')?.textContent,
      historiales:[...document.querySelectorAll('.client-history-card h2')].map(h=>h.textContent),
      filasOC:document.querySelectorAll('.client-history-card:first-child tbody tr:not(:has(.empty))').length,
      soloAprobadas:(local.orders||[]).every(o=>!o.isDraft&&String(o.status||'approved')==='approved'),
      botonesReporte:document.querySelectorAll('[data-client-report]').length, avisoLegal:!!document.querySelector('.client-report-notice')};
    const blobs=[]; const orig=URL.createObjectURL; URL.createObjectURL=b=>{blobs.push(b); return orig(b)}; HTMLAnchorElement.prototype.click=function(){};
    for(const b of document.querySelectorAll('[data-client-report]')){ b.click(); await wait(4000); }
    out.excel=[]; for(const b of blobs){ const t=new TextDecoder('latin1').decode(new Uint8Array(await b.arrayBuffer())); out.excel.push({bytes:b.size}); }
    out.erroresReporte=[...document.querySelectorAll('.client-report-error')].map(e=>e.textContent);
    const trk=(local.orders||[])[0]?.trackingNumber;
    if(trk){ document.querySelector('[data-route="tracking"]')?.click(); await wait(1500); document.querySelector('#client-tracking-code').value=trk; document.getElementById('client-tracking-search-btn').click(); await wait(800);
      out.tracking=document.querySelector('#client-tracking-result')?.innerText.includes(trk)?'encontrado':'NO encontrado'; }
    return out;`);
  r.errores = run.errores;
  console.log(JSON.stringify(r, null, 1));
};
