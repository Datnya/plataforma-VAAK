// Paso 5: el administrador ve el aviso de datos de demostración, revisa la lista y los quita.
const fs = require("fs"); const path = require("path");
const CLAVE = fs.readFileSync(path.join(__dirname, ".local", "clave-admin.txt"), "utf8").trim();
const CLAVES = JSON.parse(fs.readFileSync(path.join(__dirname, ".local", "claves-roles.json"), "utf8"));
const LOGIN = (u, c) => `const wait=ms=>new Promise(r=>setTimeout(r,ms)); await wait(1200);
  const a=document.querySelector('input[name=username], input[type=text], input[type=email]'), p=document.querySelector('input[type=password]'); if(!a) return 'ya';
  const setv=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))}; setv(a,${JSON.stringify(u)}); setv(p,${JSON.stringify(c)}); p.form.requestSubmit(); await wait(9000); return window.VAAKAppBridge?.getView()?.user?.role;`;
module.exports = async (run) => {
  const informe = {};
  // El trabajador no debe ver el aviso.
  await run.ir("http://127.0.0.1:8095/"); await run.eval(`localStorage.clear(); sessionStorage.clear(); return 1;`); await run.enviar("Network.clearBrowserCookies"); await run.ir("http://127.0.0.1:8095/");
  informe.trabajador = await run.eval(LOGIN("trab.prueba", CLAVES.trab));
  informe.trabajadorVeAviso = await run.eval(`return !!document.querySelector('.vaak-demo-aviso');`);
  await run.eval(`localStorage.clear(); sessionStorage.clear(); return 1;`); await run.enviar("Network.clearBrowserCookies"); await run.ir("http://127.0.0.1:8095/");
  informe.admin = await run.eval(LOGIN("auditor.admin", CLAVE));
  informe.aviso = await run.eval(`return document.querySelector('.vaak-demo-aviso')?.innerText || null;`);
  informe.ventana = await run.eval(`const wait=ms=>new Promise(r=>setTimeout(r,ms)); document.querySelector('.vaak-demo-aviso button').click(); await wait(500); return document.querySelector('.vaak-confirm-backdrop .vaak-confirm')?.innerText;`);
  informe.resultado = await run.eval(`const wait=ms=>new Promise(r=>setTimeout(r,ms)); const b=document.querySelector('.vaak-confirm-backdrop [data-choice="yes"]'); b.click(); await wait(150); const girando=!!b.querySelector('.vaak-demo-spin'); await wait(4000);
    const st=JSON.parse(localStorage.getItem('vaak-local-v8')); const d=await (await fetch('/api/data',{credentials:'same-origin'})).json(); const t=JSON.stringify(d.state);
    return {girando, aviso:document.querySelector('.vaak-demo-aviso')?.innerText, localProyectos:st.projects.map(p=>p.name), servidorTieneDemo:/Hotel Costa Azul|Logistics Center|PO-2026-001|Proveedor P1|Morgan/.test(t), servidorProyectos:d.state.store.projects.map(p=>p.name), proveedores:d.state.store.suppliers.map(s=>s.name), specs:d.state.store.specs.length};`);
  informe.errores = run.errores;
  console.log(JSON.stringify(informe, null, 1));
};
