// Mini-control de Chrome por su protocolo interno (DevTools Protocol), sin librerías.
// Uso: node navegador.js <archivo-de-pasos.js>
// El archivo de pasos exporta async function(run) donde run.eval(expr) evalúa en la página.
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const CHROME = process.env.VAAK_CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PUERTO = 9333;
const PERFIL = path.join(require("os").tmpdir(), "vaak-pruebas-chrome");

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function abrirChrome() {
  fs.rmSync(PERFIL, { recursive: true, force: true });
  const proc = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${PERFIL}`, "--window-size=1366,900", "about:blank"], { stdio: "ignore" });
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PUERTO}/json/list`); const l = await r.json(); const p = l.find((t) => t.type === "page"); if (p) return { proc, url: p.webSocketDebuggerUrl }; } catch {}
    await esperar(200);
  }
  throw new Error("Chrome no arrancó");
}

async function conectar(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
  let id = 0; const pendientes = new Map(); const errores = []; const consola = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pendientes.has(d.id)) { pendientes.get(d.id)(d); pendientes.delete(d.id); return; }
    if (d.method === "Runtime.exceptionThrown") errores.push(d.params.exceptionDetails?.exception?.description || d.params.exceptionDetails?.text);
    if (d.method === "Runtime.consoleAPICalled" && ["error", "assert"].includes(d.params.type)) consola.push(d.params.args.map((a) => a.value ?? a.description).join(" "));
    if (d.method === "Log.entryAdded" && d.params.entry.level === "error") consola.push("[red] " + d.params.entry.text + " " + (d.params.entry.url || ""));
  };
  const enviar = (method, params = {}) => new Promise((ok) => { const n = ++id; pendientes.set(n, ok); ws.send(JSON.stringify({ id: n, method, params })); });
  await enviar("Runtime.enable"); await enviar("Page.enable"); await enviar("Log.enable");
  return {
    enviar, errores, consola,
    async ir(url) { await enviar("Page.navigate", { url }); await esperar(2500); },
    async eval(expresion) {
      const r = await enviar("Runtime.evaluate", { expression: `(async()=>{${expresion}})()`, awaitPromise: true, returnByValue: true });
      if (r.result?.exceptionDetails) return { __error: r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text };
      return r.result?.result?.value;
    },
    async ancho(w, h) { await enviar("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 }); },
    async captura(archivo) { const r = await enviar("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(archivo, Buffer.from(r.result.data, "base64")); },
    cerrar() { ws.close(); },
  };
}

(async () => {
  const pasos = require(path.resolve(process.argv[2]));
  const { proc, url } = await abrirChrome();
  const run = await conectar(url);
  try { await pasos(run); }
  catch (e) { console.error("FALLO:", e); }
  finally { run.cerrar(); proc.kill(); }
})();
