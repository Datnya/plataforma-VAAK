#!/usr/bin/env bash
# Pruebas completas de VAAK en la computadora, sobre una copia idéntica a la que se publica
# (armada con armar-publicacion.js) y una base MySQL local vacía. Nada toca el hosting.
# Ver README.md de esta carpeta. Uso: bash servidor-php/pruebas/probar.sh
set -e
P="$(cd "$(dirname "$0")" && pwd -W)"
R="$(cd "$P/../.." && pwd -W)"
H="${VAAK_HERRAMIENTAS:-C:/Users/HP/vaak-herramientas}"
L="$P/.local"
PHP="$H/php/php.exe -d extension_dir=$H/php/ext -d extension=mysqli"
MYSQLADMIN="$H/mysql/bin/mysqladmin.exe --protocol=tcp -P ${VAAK_MYSQL_PUERTO:-3307} -u root"
mkdir -p "$L"
ayudante() { $PHP "$P/ayudante.php" "$@"; }
paso() { echo; echo "===== $1"; }

paso "1. Base de datos local"
if ! $MYSQLADMIN ping >/dev/null 2>&1; then
  # Start-Process: el programa queda aparte y no retiene la salida de este script.
  powershell -NoProfile -Command "Start-Process -WindowStyle Hidden -FilePath '$H/mysql/bin/mysqld.exe' -ArgumentList '\"--datadir=$H/mysql-datos\" --port=${VAAK_MYSQL_PUERTO:-3307}'"
  for i in $(seq 1 30); do sleep 1; $MYSQLADMIN ping >/dev/null 2>&1 && break; done
fi
ayudante instalar

paso "2. Copia publicada (igual a la del hosting)"
node "$R/servidor-php/herramientas/armar-publicacion.js" "$L/armado" | tail -1
mkdir -p "$L/sitio" && find "$L/sitio" -mindepth 1 -delete && cp -r "$L/armado/." "$L/sitio/"
cat > "$L/sitio/nucleo/config.php" <<PHPCONF
<?php
return [
  'db' => ['host' => '127.0.0.1', 'port' => ${VAAK_MYSQL_PUERTO:-3307}, 'nombre' => 'vaak_pruebas', 'usuario' => 'root', 'clave' => ''],
  'secreto_hmac' => '$(node -e 'console.log(require("crypto").randomBytes(24).toString("hex"))')',
  'origenes' => '',
  'entorno' => 'pruebas',
  'release_id' => 'local',
];
PHPCONF
# La misma política de seguridad (CSP) que pone el .htaccess, para que el navegador la aplique.
node -e '
const fs=require("fs");const f=process.argv[1]+"/index.html";let h=fs.readFileSync(f,"utf8");
const csp="default-src \x27self\x27; script-src \x27self\x27; style-src \x27self\x27 \x27unsafe-inline\x27; img-src \x27self\x27 data: blob:; font-src \x27self\x27 data:; connect-src \x27self\x27; object-src \x27none\x27; base-uri \x27self\x27; form-action \x27self\x27";
fs.writeFileSync(f,h.replace("<head>","<head>\n    <meta http-equiv=\"Content-Security-Policy\" content=\""+csp+"\" />"));' "$L/sitio"
node -e 'require("fs").writeFileSync(process.argv[2], JSON.stringify(require(process.argv[1]).seed()))' "$R/staging/public/prototype/access-test-fixtures.js" "$L/demo.json"
ayudante crear-admin

paso "3. Servidor PHP en http://127.0.0.1:8095"
if curl -s http://127.0.0.1:8095/api/health | grep -q '"service":"vaak-pruebas"'; then echo "ya estaba encendido"; else
  if curl -s -o /dev/null http://127.0.0.1:8095/; then echo "El puerto 8095 lo usa otro programa: ciérralo y vuelve a correr."; exit 1; fi
  powershell -NoProfile -Command "Start-Process -WindowStyle Hidden -WorkingDirectory '$L/sitio' -FilePath '$H/php/php.exe' -ArgumentList '-d extension_dir=\"$H/php/ext\" -d extension=mysqli -S 127.0.0.1:8095 -t \"$L/sitio\" \"$R/servidor-php/herramientas/enrutador-local.php\"'"
  sleep 3
fi
curl -s http://127.0.0.1:8095/api/health; echo

paso "4. Seguridad del servidor por roles"
ayudante vaciar; ayudante borrar-usuarios
node "$P/servidor.js" > "$L/servidor.json"
node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");const a=JSON.parse(t.slice(t.indexOf("[")));a.forEach(x=>console.log((x.ok?"  ✔ ":"  ✘ ")+x.prueba+(x.ok?"":"  → "+x.detalle)));console.log("  "+a.filter(x=>x.ok).length+" de "+a.length+" correctas");if(a.some(x=>!x.ok))process.exitCode=1' "$L/servidor.json"

paso "5. Crear proyectos, proveedores y specs desde la pantalla"
ayudante vaciar
node "$P/navegador.js" "$P/paso1-crear-datos.js"
ayudante asignar; ayudante sin-bloqueos

paso "6. Flujo completo: OC, requerimiento, pago, cambio, reportes; lo que ve y hace el trabajador"
node "$P/navegador.js" "$P/paso2-flujo-completo.js"
ayudante sin-bloqueos

paso "7. Todas las pantallas con los tres roles"
node "$P/navegador.js" "$P/paso3-pantallas.js" > "$L/pantallas.json"
node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");const r=JSON.parse(t.slice(t.indexOf("{")));for(const [k,v] of Object.entries(r))console.log("  "+k+": entró como "+v.entro+"; errores de programa: "+v.erroresJS.length+"; errores en consola: "+v.consola.length)' "$L/pantallas.json"
ayudante sin-bloqueos

paso "8. Cerrar sesión borra los datos del navegador"
node "$P/navegador.js" "$P/paso4-cerrar-sesion.js"
ayudante sin-bloqueos

paso "9. Quitar datos de demostración"
ayudante poner-demo
node "$P/navegador.js" "$P/paso5-quitar-demo.js"
ayudante sin-bloqueos

paso "10. Portal del cliente: su proyecto, OC aprobadas, requerimientos, reportes de solo lectura y tracking"
node "$P/navegador.js" "$P/paso6-portal-cliente.js"
echo; echo "Listo. Resultados completos en $L"
