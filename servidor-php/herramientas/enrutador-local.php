<?php
// Solo para probar en la computadora con el servidor integrado de PHP:
//   php -S 127.0.0.1:8090 -t <carpeta publicada> herramientas/enrutador-local.php
// Imita lo que hace el .htaccess en el hosting.
$ruta = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$raiz = $_SERVER['DOCUMENT_ROOT'];
if (str_starts_with($ruta, '/nucleo')) { http_response_code(403); exit; }
if (str_starts_with($ruta, '/prototype/')) { header('Location: ' . substr($ruta, 10), true, 301); exit; }
if (str_starts_with($ruta, '/api/')) {
  $_GET['ruta'] = substr($ruta, 5);
  require $raiz . '/api.php';
  return true;
}
if ($ruta === '/' || $ruta === '/login') { readfile($raiz . '/index.html'); return true; }
return false; // archivo estatico
