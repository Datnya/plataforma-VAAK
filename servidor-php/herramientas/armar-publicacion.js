// Arma la carpeta que se sube al hosting del cliente:
//   interfaz (staging/public/prototype) + servidor PHP (servidor-php/publico).
// Uso: node servidor-php/herramientas/armar-publicacion.js <destino> [ruta a config.php] [--instalacion] [--sin-comprimir]
//   --instalacion   incluye verificar.php (solo para una instalación nueva; después se borra del hosting).
//   --sin-comprimir deja el código legible (para buscar un error; nunca para subir al hosting).
// Quita de la interfaz lo que dependia de Supabase (su libreria y el aviso de
// recuperacion de contrasena por enlace), porque en el hosting no existe.
// Desde la auditoría del 21-sep-2026 además:
//   - usa el punto de partida VACÍO de servidor-php/publico/access-test-fixtures.js (sin datos de demo);
//   - comprime el código (JavaScript y CSS): quita comentarios, espacios y acorta los nombres internos.
const fs = require("fs");
const path = require("path");

const RAIZ = path.resolve(__dirname, "..", "..");
const INTERFAZ = path.join(RAIZ, "staging", "public", "prototype");
const SERVIDOR = path.join(RAIZ, "servidor-php", "publico");
const argumentos = process.argv.slice(2);
const banderas = new Set(argumentos.filter((a) => a.startsWith("--")));
const [destinoArg, config] = argumentos.filter((a) => !a.startsWith("--"));
const destino = path.resolve(destinoArg || path.join(RAIZ, "servidor-php", "salida", "prueba"));
const instalacion = banderas.has("--instalacion");
const comprimir = !banderas.has("--sin-comprimir");

// Archivos de la interfaz que no van al hosting.
const OMITIR = new Set(["password-recovery.js", "LOGO VAAK.png"]);

function copiar(origen, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const nombre of fs.readdirSync(origen)) {
    if (OMITIR.has(nombre)) continue;
    const o = path.join(origen, nombre), d = path.join(dest, nombre);
    if (fs.statSync(o).isDirectory()) copiar(o, d);
    else fs.copyFileSync(o, d);
  }
}

(async () => {
  fs.rmSync(destino, { recursive: true, force: true });
  copiar(INTERFAZ, destino);
  copiar(SERVIDOR, destino); // también pisa access-test-fixtures.js con el punto de partida vacío

  // verificar.php muestra el estado de la instalación: solo va en una instalación nueva.
  if (!instalacion) fs.rmSync(path.join(destino, "verificar.php"), { force: true });

  // index.html sin Supabase.
  const ruta = path.join(destino, "index.html");
  let html = fs.readFileSync(ruta, "utf8");
  const antes = html.length;
  const quitar = [
    /[ \t]*<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase[^"]*"><\/script>\r?\n?/g,
    /[ \t]*<script>window\.VAAK_SUPABASE[^<]*<\/script>\r?\n?/g,
    /[ \t]*<script src="password-recovery\.js[^"]*"><\/script>\r?\n?/g,
  ];
  const encontrados = quitar.map((re) => (html.match(re) || []).length);
  quitar.forEach((re) => { html = html.replace(re, ""); });
  if (encontrados.some((n) => n !== 1)) {
    console.error("AVISO: index.html cambio y no se pudo limpiar como se esperaba:", encontrados);
    process.exit(1);
  }
  // En el hosting la plataforma vive en la raiz, no en /prototype/.
  if (!html.includes('<base href="/prototype/" />')) {
    console.error("AVISO: index.html ya no tiene <base href=\"/prototype/\" />; revisa el armado.");
    process.exit(1);
  }
  html = html.replace('<base href="/prototype/" />', '<base href="/" />');
  // Scripts escritos dentro de index.html → inicio.js. La política de seguridad del hosting
  // (Content-Security-Policy en .htaccess) solo deja ejecutar archivos del propio sitio.
  const enLinea = [...html.matchAll(/[ \t]*<script>([^<]*)<\/script>\r?\n?/g)];
  if (enLinea.length) {
    fs.writeFileSync(path.join(destino, "inicio.js"), enLinea.map((m) => m[1].trim().replace(/;?$/, ";")).join("\n") + "\n");
    let primero = true;
    html = html.replace(/([ \t]*)<script>[^<]*<\/script>(\r?\n?)/g, (_, sangria, fin) => {
      if (!primero) return "";
      primero = false;
      return `${sangria}<script src="inicio.js?v=${Date.now().toString(36)}"></script>${fin}`;
    });
  }
  if (/<script>/.test(html) || /\son[a-z]+=/i.test(html)) {
    console.error("AVISO: index.html todavía tiene código escrito dentro; la política de seguridad lo bloquearía.");
    process.exit(1);
  }
  fs.writeFileSync(ruta, html);

  const rutaApp = path.join(destino, "app.js");
  const app = fs.readFileSync(rutaApp, "utf8");
  fs.writeFileSync(rutaApp, app.split("${location.origin}/prototype/assets/").join("${location.origin}/assets/"));

  // Datos de demostración: nunca en el hosting (el archivo del servidor trae el punto de partida vacío).
  const semilla = fs.readFileSync(path.join(destino, "access-test-fixtures.js"), "utf8");
  if (/Morgan Lee|Hotel Costa Azul|@vaak\.pe|datnyamonzon/i.test(semilla)) {
    console.error("AVISO: el paquete lleva datos de demostración en access-test-fixtures.js; no se arma.");
    process.exit(1);
  }

  let ahorro = 0;
  if (comprimir) {
    let terser, csso;
    try { terser = require("terser"); csso = require("csso"); }
    catch { console.error("Faltan las herramientas de compresión. Ejecuta una vez: npm install (en servidor-php/herramientas)."); process.exit(1); }
    for (const nombre of fs.readdirSync(destino)) {
      const archivo = path.join(destino, nombre);
      if (!fs.statSync(archivo).isFile()) continue;
      const original = fs.readFileSync(archivo, "utf8");
      let salida = null;
      if (nombre.endsWith(".js")) {
        // Sin «toplevel»: los nombres globales que usan los demás archivos (VAAK…) se conservan.
        const r = await terser.minify(original, { compress: { passes: 2 }, mangle: true, format: { comments: false } });
        if (!r.code) { console.error("No se pudo comprimir " + nombre); process.exit(1); }
        salida = r.code;
      } else if (nombre.endsWith(".css")) {
        salida = csso.minify(original, { restructure: false }).css;
      }
      if (salida !== null) { ahorro += original.length - salida.length; fs.writeFileSync(archivo, salida); }
    }
  }

  if (config) fs.copyFileSync(path.resolve(config), path.join(destino, "nucleo", "config.php"));
  fs.rmSync(path.join(destino, "nucleo", "config.ejemplo.php"), { force: true });

  console.log(`Listo: ${destino}`);
  console.log(`index.html: ${antes - html.length} caracteres de Supabase quitados${config ? "; config.php incluido" : "; falta config.php"}`);
  console.log(`${instalacion ? "Con" : "Sin"} verificar.php · código ${comprimir ? `comprimido (${Math.round(ahorro / 1024)} KB menos)` : "SIN comprimir (no subir así)"}`);
})();
