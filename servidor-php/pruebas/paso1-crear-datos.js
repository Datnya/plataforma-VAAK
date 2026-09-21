// Crea desde la interfaz, como lo haría una persona: un proyecto (con portada), dos proveedores y
// dos specs. Así se prueban esos formularios y quedan datos para el resto de la auditoría.
const fs = require("fs");
const path = require("path");
const CLAVE = fs.readFileSync(path.join(__dirname, ".local", "clave-admin.txt"), "utf8").trim();
module.exports = async (run) => {
  await run.ir("http://127.0.0.1:8095/");
  await run.eval(`const wait=ms=>new Promise(r=>setTimeout(r,ms)); await wait(1200); const u=document.querySelector('input[name=username], input[type=text], input[type=email]'), p=document.querySelector('input[type=password]'); if(!u) return; const setv=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))}; setv(u,'auditor.admin'); setv(p,${JSON.stringify(CLAVE)}); p.form.requestSubmit(); await wait(5000); return 1;`);
  const r = await run.eval(`
    const wait=ms=>new Promise(r=>setTimeout(r,ms)); const out={};
    const llenar=(f,datos)=>{for(const [n,v] of Object.entries(datos)){const e=f.elements.namedItem(n); if(!e){out.faltan=(out.faltan||[]).concat(n); continue} e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true}));}};
    const estado=()=>JSON.parse(localStorage.getItem('vaak-local-v8')||'{}');
    // 1) Proyecto con portada (imagen PNG pequeña generada aquí).
    let f;
    for(const [nombre,codigo] of [['Oficina Secreta','SEC-002'],['Hotel Auditoría','AUD-001']]){
    document.querySelector('[data-route="home"]')?.click(); await wait(800);
    document.querySelector('[data-action="new-project"]').click(); await wait(1200);
    f=document.querySelector('#modal-root form');
    llenar(f,{name:nombre,code:codigo,ruc:'20123456789',legal:nombre+' S.A.C.',address:'Av. Prueba 123, Lima',city:'Lima',country:'Perú',contact:'Gerencia',phone:'987654321'});
    const lienzo=document.createElement('canvas'); lienzo.width=64; lienzo.height=40; const c=lienzo.getContext('2d'); c.fillStyle='#8a6a4a'; c.fillRect(0,0,64,40);
    const blob=await new Promise(ok=>lienzo.toBlob(ok,'image/png')); const dt=new DataTransfer(); dt.items.add(new File([blob],'portada.png',{type:'image/png'}));
    const archivo=f.elements.namedItem('coverFile'); archivo.files=dt.files; archivo.dispatchEvent(new Event('change',{bubbles:true})); await wait(1200);
    f.requestSubmit(); await wait(3000);
    }
    out.proyecto={abierto:!!document.querySelector('#modal-root form'), proyectos:(estado().projects||[]).map(p=>p.name+' ('+p.code+')'), error:document.querySelector('#modal-root .vaak-form-error:not([hidden]), #modal-root .rev-error:not([hidden])')?.textContent||null};
    document.querySelector('#modal-root [data-command="close"]')?.click(); await wait(300);
    // 2) Dos proveedores.
    for(const [nombre,correo] of [['Muebles Andinos SAC','ventas@muebles.test'],['Iluminación Lima EIRL','info@luz.test']]){
      document.querySelector('[data-route="tools"]')?.click(); await wait(800); document.querySelector('[data-route="suppliers"]')?.click(); await wait(1000);
      document.querySelector('[data-action="new-supplier"]').click(); await wait(1000); f=document.querySelector('#modal-root form');
      out.camposProveedor=out.camposProveedor||[...f.elements].filter(e=>e.name).map(e=>e.name+(e.required?'*':''));
      llenar(f,{name:nombre,ruc:'20'+String(Math.random()).slice(2,11),email:correo,address:'Av. Proveedor 456, Lima',contact:'Ventas',phone:'912345678'});
      for(const e of f.querySelectorAll('[required]')) if(!e.value){ if(e.tagName==='SELECT') e.value=[...e.options].map(o=>o.value).find(Boolean)||''; else e.value='Dato de prueba'; e.dispatchEvent(new Event('input',{bubbles:true})); }
      f.requestSubmit(); await wait(2000); document.querySelector('#modal-root [data-command="close"]')?.click(); await wait(300);
    }
    out.proveedores=(estado().suppliers||[]).map(s=>s.name);
    // 3) Dos specs en el proyecto.
    document.querySelector('[data-route="home"]')?.click(); await wait(1000);
    document.querySelector('.project-card, [data-project-id], [data-project]')?.click(); await wait(1500);
    for(const [nombre,cant,costo] of [['Sillón lounge de prueba','4','850'],['Lámpara de pie de prueba','6','320']]){
      const b=[...document.querySelectorAll('button')].find(x=>/Add new spec|Agregar nuevo spec/.test(x.textContent)); if(!b){out.sinBotonSpec=true; break}
      b.click(); await wait(1200); f=document.querySelector('#modal-root form');
      out.camposSpec=out.camposSpec||[...f.elements].filter(e=>e.name).map(e=>e.name+(e.required?'*':''));
      llenar(f,{name:nombre,size:'90 x 80 x 75 cm',material:'Madera',color:'Natural',quantity:cant,costValue:costo,description:'Spec creado en la auditoría.'});
      const unidad=f.querySelector('.spec-unit-select'); if(unidad){unidad.value='Each'; unidad.dispatchEvent(new Event('change',{bubbles:true}));}
      const vendor=f.elements.namedItem('vendorSource'); if(vendor){vendor.value=[...vendor.options].map(o=>o.value).find(Boolean)||''; vendor.dispatchEvent(new Event('change',{bubbles:true}));}
      for(const e of f.querySelectorAll('[required]')) if(!e.value){ if(e.tagName==='SELECT') e.value=[...e.options].map(o=>o.value).find(Boolean)||''; else e.value='Dato de prueba'; e.dispatchEvent(new Event('input',{bubbles:true})); }
      f.requestSubmit(); await wait(2000); document.querySelector('#modal-root [data-command="close"]')?.click(); await wait(300);
    }
    out.specs=(estado().specs||[]).map(s=>s.name+' x'+s.quantity+' '+(s.unit||''));
    await wait(4000);
    const d=await (await fetch('/api/data',{credentials:'same-origin'})).json(); const t=JSON.stringify(d.state||{});
    out.servidor={revision:d.revision, proyecto:t.includes('Hotel Auditoría'), proveedores:t.includes('MUEBLES ANDINOS'), specs:t.includes('Sillón lounge de prueba')};
    return out;`);
  console.log(JSON.stringify({ r, errores: run.errores, consola: run.consola.filter((c) => !/auth\/session/.test(c)) }, null, 1));
};
