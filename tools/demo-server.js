// Servidor de DEMO para revisar cambios de interfaz sin tocar datos reales.
// Sirve los archivos reales de staging/public/prototype tal cual estan en disco,
// y solo reescribe index.html en memoria para desactivar las piezas que necesitan
// backend (login remoto, sincronizacion compartida, recuperacion de contrasena).
// No modifica ningun archivo del repositorio.

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, '..', 'staging', 'public', 'prototype');
const PORT = 4174;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".pdf": "application/pdf",
};

// Piezas que solo funcionan con el backend de Next.js: en demo se omiten.
const SOLO_CON_SERVIDOR = [
  "staging-bridge.js",
  "shared-sync.js",
  "password-recovery.js",
];

function demoIndex() {
  let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

  // 1. Quitar los scripts que exigen backend.
  for (const archivo of SOLO_CON_SERVIDOR) {
    const re = new RegExp(
      `[ \\t]*<script src="${archivo.replace(".", "\\.")}[^"]*"></script>\\r?\\n?`,
      "g"
    );
    html = html.replace(re, "");
  }

  // 2. Quitar la exigencia de login contra el servidor.
  html = html.replace(
    /[ \t]*<script>window\.VAAK_REMOTE_AUTH_REQUIRED[^<]*<\/script>\r?\n?/g,
    ""
  );

  // 3. Quitar el cliente de Supabase (solo lo usaba password-recovery.js).
  html = html.replace(
    /[ \t]*<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase[^"]*"><\/script>\r?\n?/g,
    ""
  );
  html = html.replace(
    /[ \t]*<script>window\.VAAK_SUPABASE[^<]*<\/script>\r?\n?/g,
    ""
  );

  // 4. No borrar la sesion en cada recarga (en demo queremos seguir dentro).
  html = html.replace(
    /[ \t]*<script>localStorage\.removeItem\('vaak-session-v6'\)<\/script>\r?\n?/g,
    ""
  );

  // 5. Aviso visible para no confundir la demo con el sitio real.
  const aviso = `    <script>
      window.VAAK_DEMO_LOCAL = true;
      addEventListener("DOMContentLoaded", () => {
        const b = document.createElement("div");
        b.textContent = "MODO DEMO LOCAL \\u2014 datos de prueba, no afecta a la plataforma real \\u00b7 usuarios: admin.vaak / worker.vaak / client.vaak (cualquier contrase\\u00f1a)";
        b.setAttribute("translate", "no");
        b.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#7c2d12;color:#fff;font:600 12px/1.6 system-ui,sans-serif;text-align:center;letter-spacing:.04em;padding:5px 8px;pointer-events:none";
        document.body.appendChild(b);
      });
    </script>
`;
  html = html.replace("  </body>", aviso + "  </body>");

  return html;
}

// En la copia de produccion las contrasenas se borran a proposito: solo se entra
// por Supabase. Para la demo se acepta cualquier contrasena, sin tocar el archivo.
const CHEQUEO_CLAVE = "matchUser.password!==password";

function demoAppJs() {
  const js = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const veces = js.split(CHEQUEO_CLAVE).length - 1;
  if (veces !== 1) {
    // Si app.js cambia y el parche deja de aplicar, es mejor avisar que fallar en silencio.
    console.warn(
      "\n  AVISO: no se pudo aplicar el parche de login de demo (" +
        veces +
        " coincidencias de '" +
        CHEQUEO_CLAVE +
        "').\n  El login de la demo no va a funcionar hasta actualizar tools/demo-server.js.\n"
    );
    return js;
  }
  return js.replace(CHEQUEO_CLAVE, "false");
}

const server = http.createServer((req, res) => {
  let ruta = decodeURIComponent(req.url.split("?")[0]);
  if (ruta.startsWith("/prototype")) ruta = ruta.slice("/prototype".length);
  if (ruta === "" || ruta === "/") ruta = "/index.html";

  if (ruta === "/index.html") {
    const html = demoIndex();
    res.writeHead(200, {
      "Content-Type": TYPES[".html"],
      "Cache-Control": "no-store",
    });
    return res.end(html);
  }

  if (ruta === "/app.js") {
    res.writeHead(200, {
      "Content-Type": TYPES[".js"],
      "Cache-Control": "no-store",
    });
    return res.end(demoAppJs());
  }

  // Nunca salir de la carpeta del prototipo.
  const destino = path.join(ROOT, path.normalize(ruta).replace(/^[\\/]+/, ""));
  if (!destino.startsWith(ROOT)) {
    res.writeHead(403).end("Prohibido");
    return;
  }

  fs.readFile(destino, (err, datos) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("No encontrado: " + ruta);
    }
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(destino).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(datos);
  });
});

server.listen(PORT, () => {
  console.log("Demo VAAK lista en http://localhost:" + PORT + "/prototype/");
  console.log("Sirviendo los archivos reales de: " + ROOT);
});
