// Arma la carpeta que se sube al hosting del cliente:
//   interfaz (staging/public/prototype) + servidor PHP (servidor-php/publico).
// Uso: node servidor-php/herramientas/armar-publicacion.js <destino> [ruta a config.php]
// Quita de la interfaz lo que dependia de Supabase (su libreria y el aviso de
// recuperacion de contrasena por enlace), porque en el hosting no existe.
const fs = require("fs");
const path = require("path");

const RAIZ = path.resolve(__dirname, "..", "..");
const INTERFAZ = path.join(RAIZ, "staging", "public", "prototype");
const SERVIDOR = path.join(RAIZ, "servidor-php", "publico");
const destino = path.resolve(process.argv[2] || path.join(RAIZ, "servidor-php", "salida", "prueba"));
const config = process.argv[3];

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

fs.rmSync(destino, { recursive: true, force: true });
copiar(INTERFAZ, destino);
copiar(SERVIDOR, destino);

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
fs.writeFileSync(ruta, html);

const rutaApp = path.join(destino, "app.js");
const app = fs.readFileSync(rutaApp, "utf8");
fs.writeFileSync(rutaApp, app.split("${location.origin}/prototype/assets/").join("${location.origin}/assets/"));

if (config) fs.copyFileSync(path.resolve(config), path.join(destino, "nucleo", "config.php"));
fs.rmSync(path.join(destino, "nucleo", "config.ejemplo.php"), { force: true });

console.log(`Listo: ${destino}`);
console.log(`index.html: ${antes - html.length} caracteres de Supabase quitados${config ? "; config.php incluido" : "; falta config.php"}`);
