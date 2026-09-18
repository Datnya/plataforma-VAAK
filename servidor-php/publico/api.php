<?php
// Punto de entrada unico de /api/*. El .htaccess envia aqui todas las
// peticiones a /api/..., con la ruta en ?ruta=.
declare(strict_types=1);

require __DIR__ . '/nucleo/arranque.php';
require __DIR__ . '/nucleo/sesion.php';
require __DIR__ . '/nucleo/rutas.php';

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$ruta = trim((string)($_GET['ruta'] ?? ''), '/');
// Si el hosting no reescribe, tambien se acepta /api.php/auth/session.
if ($ruta === '' && !empty($_SERVER['PATH_INFO'])) $ruta = trim((string)$_SERVER['PATH_INFO'], '/');

$tabla = [
  'POST auth/login' => 'ruta_login',
  'GET auth/session' => 'ruta_sesion',
  'POST auth/logout' => 'ruta_logout',
  'GET admin/users' => 'ruta_usuarios_listar',
  'POST admin/users' => 'ruta_usuarios_crear',
  'GET admin/presence' => 'ruta_presencia_listar',
  'PUT me/photo' => 'ruta_foto_guardar',
  'DELETE me/photo' => 'ruta_foto_quitar',
  'POST me/presence' => 'ruta_presencia_latido',
  'GET data' => 'ruta_datos_leer',
  'PUT data' => 'ruta_datos_guardar',
  'PUT data/assets' => 'ruta_imagen_guardar',
  'GET health' => 'ruta_salud',
  'GET admin/access-log' => 'ruta_accesos_listar',
  'DELETE admin/access-log' => 'ruta_accesos_vaciar',
];

try {
  $clave = $metodo . ' ' . $ruta;
  if (isset($tabla[$clave])) {
    $tabla[$clave]();
  } elseif (preg_match('#^admin/users/([^/]+)$#', $ruta, $m) && in_array($metodo, ['PATCH', 'DELETE'], true)) {
    $metodo === 'PATCH' ? ruta_usuarios_editar(rawurldecode($m[1])) : ruta_usuarios_eliminar(rawurldecode($m[1]));
  } elseif (preg_match('#^data/assets/([0-9a-f]{64})$#', $ruta, $m) && $metodo === 'GET') {
    ruta_imagen_leer($m[1]);
  } else {
    vaak_json(['ok' => false, 'error' => 'not_found'], 404);
  }
} catch (VaakYaRespondido $r) {
  // nada: la respuesta ya se envio
} catch (VaakRespuesta $r) {
  vaak_json($r->cuerpo, $r->estado);
} catch (Throwable $e) {
  error_log('[VAAK] ' . $e->getMessage() . ' en ' . $e->getFile() . ':' . $e->getLine());
  vaak_json(['ok' => false, 'error' => 'service_unavailable'], 503);
}
