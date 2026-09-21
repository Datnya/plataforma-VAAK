// Paso 2: recorrer todas las pantallas y herramientas como administrador, trabajador y cliente.
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

// Recorre: inicio, herramientas y cada tarjeta de herramienta, proyecto y sus botones principales.
const RECORRER = `
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const cerrar=async()=>{document.querySelector('#modal-root [data-command="close"]')?.click(); document.querySelectorAll('.modal-backdrop:not(#modal-root *)').forEach(e=>e.remove()); await wait(300);};
  const titulo=()=>document.querySelector('main h1, #app h1, h1')?.textContent?.trim()||'(sin título)';
  const salida=[];
  const ir=async(sel,nombre)=>{const b=document.querySelector(sel); if(!b){salida.push({pantalla:nombre,estado:'NO ENCONTRADO'});return false} b.click(); await wait(1500); salida.push({pantalla:nombre,titulo:titulo(),vacia:!document.querySelector('#app')?.innerText?.trim()}); return true;};
  await ir('[data-route="home"]','Inicio');
  await ir('[data-route="tools"]','Herramientas');
  const tarjetas=[...document.querySelectorAll('#app [data-route], #app [data-action]')].filter(b=>b.closest('main, #app') && !['home','tools'].includes(b.dataset.route)).map(b=>({ruta:b.dataset.route||'', accion:b.dataset.action||'', texto:b.textContent.trim().slice(0,40)}));
  const vistas=new Set();
  for(const t of tarjetas){
    const clave=t.ruta||t.accion; if(vistas.has(clave)) continue; vistas.add(clave);
    await ir('[data-route="tools"]','(volver)'); salida.pop();
    const sel=t.ruta?'[data-route="'+t.ruta+'"]':'[data-action="'+t.accion+'"]';
    const b=document.querySelector(sel); if(!b) continue; b.click(); await wait(1500);
    const modal=document.querySelector('#modal-root .modal, .modal-backdrop .modal');
    salida.push({herramienta:t.texto, abre:modal?('ventana: '+(modal.querySelector('h2')?.textContent||'').trim()):('pantalla: '+titulo())});
    await cerrar();
  }
  // Proyecto: abrir el primero y sus botones principales.
  await ir('[data-route="home"]','(volver)'); salida.pop();
  const proyecto=document.querySelector('.project-card, [data-project-id], [data-project]');
  if(proyecto){ proyecto.click(); await wait(1800); salida.push({pantalla:'Proyecto', titulo:titulo()});
    for(const [sel,nombre] of [['[data-action="new-order"]','Nueva OC'],['[data-new-invoice]','Nuevo requerimiento'],['[data-action="new-spec"]','Nuevo spec'],['[data-project-areas]','Ver áreas'],['[data-action="project-terms"]','Términos del proyecto'],['[data-action="view-drafts"]','Borradores'],['[data-action="preview-spec"]','Ficha técnica'],['[data-preview-tracking],[data-action="preview-order"]','Ver OC'],['[data-preview-invoice]','Ver requerimiento'],['[data-revise-order]','Cambio de orden'],['[data-register-payment],[data-payment-register]','Registrar pago'],['[data-action="edit-project-card"]','Editar ficha del proyecto']]){
      const b=document.querySelector(sel); if(!b){salida.push({boton:nombre, estado:'no aparece'}); continue}
      b.click(); await wait(1400);
      const modal=document.querySelector('#modal-root .modal, #project-areas-modal .modal, .modal-backdrop .modal');
      salida.push({boton:nombre, abre:modal?(modal.querySelector('h2')?.textContent||'(ventana)').trim():'(nada)'});
      await cerrar(); document.getElementById('project-areas-modal')?.remove();
    }
  } else salida.push({pantalla:'Proyecto', estado:'no hay proyectos'});
  return salida;`;

module.exports = async (run) => {
  const informe = {};
  for (const [rol, usuario, clave] of [["Administrador", "auditor.admin", CLAVE], ["Trabajador", "trab.prueba", CLAVES.trab], ["Cliente", "clie.prueba", CLAVES.clie]]) {
    run.errores.length = 0; run.consola.length = 0;
    await run.ir("http://127.0.0.1:8095/");
    await run.eval(`localStorage.clear(); sessionStorage.clear(); document.cookie.split(';').forEach(c=>{document.cookie=c.split('=')[0]+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'}); return 1;`);
    await run.enviar("Network.clearBrowserCookies");
    await run.ir("http://127.0.0.1:8095/");
    const entro = await run.eval(LOGIN(usuario, clave));
    const recorrido = entro === "sin-sesion" ? [] : await run.eval(RECORRER);
    informe[rol] = { entro, recorrido, erroresJS: [...run.errores], consola: run.consola.filter((c) => !/api\/auth\/session/.test(c)).slice(0, 10) };
  }
  console.log(JSON.stringify(informe, null, 1));
};
