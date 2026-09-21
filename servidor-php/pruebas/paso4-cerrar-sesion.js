// Paso 4: al cerrar sesión no debe quedar ningún dato de la empresa en el navegador.
const fs = require("fs"); const path = require("path");
const CLAVE = fs.readFileSync(path.join(__dirname, ".local", "clave-admin.txt"), "utf8").trim();
module.exports = async (run) => {
  await run.ir("http://127.0.0.1:8095/"); await run.eval(`localStorage.clear(); sessionStorage.clear(); return 1;`);
  await run.enviar("Network.clearBrowserCookies"); await run.ir("http://127.0.0.1:8095/");
  const r = await run.eval(`
    const wait=ms=>new Promise(r=>setTimeout(r,ms)); await wait(1200);
    const u=document.querySelector('input[name=username], input[type=text], input[type=email]'), p=document.querySelector('input[type=password]');
    const setv=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))}; setv(u,'auditor.admin'); setv(p,${JSON.stringify(CLAVE)}); p.form.requestSubmit(); await wait(6000);
    const antes=Object.keys(localStorage).map(k=>k+':'+localStorage.getItem(k).length);
    document.querySelector("[data-command='logout']").click(); await wait(3000);
    const despues=Object.keys(localStorage).map(k=>k+':'+localStorage.getItem(k).length);
    const texto=Object.values(localStorage).join('|');
    return {antes, despues, quedaEmpresa:/Hotel Auditor|MUEBLES|AUD-001/.test(texto), pantallaLogin:!!document.querySelector('input[type=password]')};`);
  console.log(JSON.stringify({ r, errores: run.errores }, null, 1));
};
