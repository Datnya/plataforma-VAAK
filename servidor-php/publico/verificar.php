<?php
// Pagina de revision para la instalacion en el hosting: dice si la version de
// PHP, las extensiones, la configuracion y la base de datos estan listas.
// No muestra claves. Escrita para funcionar incluso en PHP viejo (7.x), asi
// avisa con claridad si el subdominio todavia no usa PHP 8.2.
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
$filas = array();
$bien = true;
function fila(&$filas, &$bien, $ok, $que, $detalle) {
  $filas[] = array($ok, $que, $detalle);
  if (!$ok) $bien = false;
}
fila($filas, $bien, version_compare(PHP_VERSION, '8.2.0', '>='), 'Versión de PHP', PHP_VERSION . ' (se necesita 8.2 o más)');
foreach (array('mysqli', 'mysqlnd', 'openssl', 'json') as $ext) {
  fila($filas, $bien, extension_loaded($ext), 'Extensión ' . $ext, extension_loaded($ext) ? 'activa' : 'falta activarla');
}
$ruta = __DIR__ . '/nucleo/config.php';
$config = is_file($ruta) ? require $ruta : null;
fila($filas, $bien, is_array($config), 'Archivo de configuración', is_array($config) ? 'encontrado' : 'no se encontró nucleo/config.php');
if (is_array($config)) {
  $clavePuesta = isset($config['db']['clave']) && $config['db']['clave'] !== '' && strpos($config['db']['clave'], 'PEGA-AQUI') === false;
  fila($filas, $bien, $clavePuesta, 'Contraseña de la base de datos', $clavePuesta ? 'escrita' : 'todavía no se pegó en nucleo/config.php');
  if ($clavePuesta && extension_loaded('mysqli')) {
    try {
      $c = $config['db'];
      mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
      $db = new mysqli($c['host'], $c['usuario'], $c['clave'], $c['nombre'], isset($c['port']) ? (int)$c['port'] : 3306);
      $valor = function ($sql) use ($db) { $f = $db->query($sql)->fetch_row(); return $f[0]; };
      fila($filas, $bien, true, 'Conexión a la base de datos', 'correcta (MySQL ' . $valor('SELECT VERSION()') . ')');
      $tablas = (int)$valor("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name LIKE 'vaak\_%'");
      fila($filas, $bien, $tablas >= 10, 'Tablas de VAAK', $tablas >= 10 ? "$tablas tablas creadas" : "hay $tablas de 10: falta importar esquema.sql en phpMyAdmin");
      if ($tablas >= 10) {
        $admins = (int)$valor("SELECT COUNT(*) FROM vaak_user_company_memberships WHERE role = 'admin' AND status = 'active'");
        fila($filas, $bien, $admins > 0, 'Administrador', $admins > 0 ? "$admins administrador(es) activo(s)" : 'no hay ningún administrador: falta importar el archivo del primer administrador');
      }
    } catch (Throwable $e) {
      $codigo = $e instanceof mysqli_sql_exception ? (int)$e->getCode() : 0;
      $motivo = $codigo === 1045 ? 'usuario o contraseña incorrectos' : ($codigo === 1049 ? 'no existe una base de datos con ese nombre' : ($codigo === 1044 ? 'el usuario no tiene permiso sobre esa base de datos' : 'no se pudo conectar (código ' . $codigo . ')'));
      fila($filas, $bien, false, 'Conexión a la base de datos', $motivo);
    }
  }
}
?><!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VAAK · Revisión de instalación</title>
<style>body{font-family:Arial,sans-serif;max-width:680px;margin:32px auto;padding:0 16px;color:#1d2733}h1{font-size:22px}table{border-collapse:collapse;width:100%}td{padding:10px;border-bottom:1px solid #e3e7ec;vertical-align:top}.ok{color:#1b7a3d;font-weight:bold}.no{color:#c62828;font-weight:bold}.resumen{padding:14px;border-radius:8px;margin:16px 0;font-weight:bold}.bien{background:#e6f4ea;color:#1b7a3d}.mal{background:#fdecea;color:#c62828}</style></head>
<body><h1>VAAK · Revisión de instalación</h1>
<div class="resumen <?php echo $bien ? 'bien' : 'mal'; ?>"><?php echo $bien ? 'Todo listo. Ya puedes entrar a la plataforma.' : 'Hay puntos por resolver (en rojo). Envía una captura de esta página.'; ?></div>
<table><?php foreach ($filas as $f) { ?><tr><td class="<?php echo $f[0] ? 'ok' : 'no'; ?>"><?php echo $f[0] ? '✔' : '✘'; ?></td><td><?php echo htmlspecialchars($f[1]); ?></td><td><?php echo htmlspecialchars($f[2]); ?></td></tr><?php } ?></table>
<?php if (isset($_GET['detalle'])) { ?>
<h2 style="font-size:16px;margin-top:28px">Detalle técnico</h2>
<pre style="white-space:pre-wrap;font-size:12px;background:#f4f6f8;padding:12px;border-radius:6px"><?php
echo htmlspecialchars('SAPI: ' . PHP_SAPI . "\nBinario: " . PHP_BINARY . "\nphp.ini: " . var_export(php_ini_loaded_file(), true)
  . "\nIni adicionales: " . var_export(php_ini_scanned_files(), true) . "\nextension_dir: " . ini_get('extension_dir')
  . "\nuser_ini.filename: " . ini_get('user_ini.filename') . "\nExtensiones: " . implode(', ', get_loaded_extensions())
  . "\nMódulos disponibles: " . (is_dir(ini_get('extension_dir')) ? implode(', ', array_map(function ($f) { return basename($f, '.so'); }, glob(ini_get('extension_dir') . '/*.so') ?: array())) : 'carpeta no visible'));
?></pre>
<?php } ?>
</body></html>
