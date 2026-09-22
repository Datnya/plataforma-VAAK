// Paso 4: sin sesión solo existe la pantalla de inicio (el código interno no se entrega), los
// errores de acceso no revelan qué usuarios existen, y al cerrar sesión no queda ningún dato de la
// empresa en el navegador y se vuelve a la pantalla pública.
const fs = require("fs"); const path = require("path");
const CLAVE = fs.readFileSync(path.join(__dirname, ".local", "clave-admin.txt"), "utf8").trim();
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
module.exports = async (run) => {
  const informe = {};
  await run.ir("http://127.0.0.1:8095/"); await run.eval(`localStorage.clear(); sessionStorage.clear(); return 1;`);
  await run.enviar("Network.clearBrowserCookies"); await run.ir("http://127.0.0.1:8095/");
  // 1) Sin sesión.
  informe.sinSesion = await run.eval(`
    const html=await (await fetch('/',{cache:'no-store'})).text();
    const app=await fetch('/api/app',{cache:'no-store'}); const cuerpo=await app.text();
    return {scriptsEnPagina:(html.match(/<script/g)||[]).length, soloAcceso:/<script src="acceso\\.js/.test(html), plataformaCargada:!!window.VAAKAppBridge,
      pantallaLogin:!!document.querySelector('#login input[type=password]'), codigoInternoSinSesion:app.status, entregaCodigo:cuerpo.includes('VAAKAppBridge'),
      appJsSuelto:(await fetch('/app.js')).status};`);
  // 2) Mismo mensaje para usuario inexistente y para contraseña errada.
  const intento = (u, c) => `const wait=ms=>new Promise(r=>setTimeout(r,ms));
    const f=document.getElementById('login'); f.elements.username.value=${JSON.stringify(u)}; f.elements.password.value=${JSON.stringify(c)};
    f.requestSubmit(); await wait(2500); return document.querySelector('.login-error')?.textContent||null;`;
  informe.usuarioInexistente = await run.eval(intento("no.existe.nadie", "Clave-cualquiera-1"));
  informe.claveErrada = await run.eval(intento("auditor.admin", "Clave-equivocada-1"));
  // 3) Entrar, y luego cerrar sesión (la página se recarga sola).
  informe.entra = await run.eval(`const wait=ms=>new Promise(r=>setTimeout(r,ms));
    const f=document.getElementById('login'); f.elements.username.value='auditor.admin'; f.elements.password.value=${JSON.stringify(CLAVE)};
    f.requestSubmit(); await wait(7000); return window.VAAKAppBridge?.getView()?.user?.role || 'sin-sesion';`);
  informe.antes = await run.eval(`return Object.keys(localStorage).map(k=>k+':'+localStorage.getItem(k).length);`);
  await run.eval(`document.querySelector("[data-command='logout']").click(); return 1;`);
  await esperar(5000);
  informe.despues = await run.eval(`
    const texto=Object.values(localStorage).join('|');
    return {claves:Object.keys(localStorage), quedaEmpresa:/Hotel Auditor|Oficina Secreta|MUEBLES|AUD-001|SEC-002/.test(texto),
      pantallaLogin:!!document.querySelector('#login input[type=password]'), plataformaCargada:!!window.VAAKAppBridge,
      codigoInterno:(await fetch('/api/app',{cache:'no-store'})).status};`);
  informe.errores = run.errores;
  console.log(JSON.stringify(informe, null, 1));
};
