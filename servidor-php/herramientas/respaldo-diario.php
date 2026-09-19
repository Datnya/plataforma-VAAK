<?php
/**
 * Copia de seguridad diaria de la base de datos de una copia de VAAK.
 *
 * Lo ejecuta el hosting solo, una vez al día (cPanel → Trabajos de cron). Guarda un archivo
 * comprimido por día en una carpeta privada (fuera de la web, nadie puede descargarlo desde
 * internet) y borra las copias con más de DIAS_A_GUARDAR días.
 *
 * No pide contraseñas: las lee del mismo `nucleo/config.php` de esa copia.
 *
 * Uso (cron):
 *   /opt/alt/php82/usr/bin/php /home/USUARIO/vaak-respaldos/respaldo-diario.php \
 *     /home/USUARIO/plataforma.hpgilatam.com/nucleo/config.php
 *
 * Escrito para PHP 7.3 o superior (la cuenta del cliente usa 7.3 por defecto).
 */

const DIAS_A_GUARDAR = 14;

$config = isset($argv[1]) ? $argv[1] : '';
if ($config === '' || !is_file($config)) {
    fwrite(STDERR, "No encuentro config.php. Pásalo como primer dato: respaldo-diario.php /ruta/nucleo/config.php\n");
    exit(1);
}

$datos = require $config;
$db = isset($datos['db']) && is_array($datos['db']) ? $datos['db'] : array();
$host = isset($db['host']) ? $db['host'] : 'localhost';
$puerto = isset($db['port']) ? (int)$db['port'] : 3306;
$base = isset($db['nombre']) ? $db['nombre'] : '';
$usuario = isset($db['usuario']) ? $db['usuario'] : '';
$clave = isset($db['clave']) ? $db['clave'] : '';
$entorno = isset($datos['entorno']) ? $datos['entorno'] : 'copia';
if ($base === '' || $usuario === '') {
    fwrite(STDERR, "El config.php no tiene los datos de la base.\n");
    exit(1);
}

$carpeta = __DIR__ . '/copias';
if (!is_dir($carpeta) && !mkdir($carpeta, 0700, true)) {
    fwrite(STDERR, "No pude crear la carpeta $carpeta\n");
    exit(1);
}

$bd = @new mysqli($host, $usuario, $clave, $base, $puerto);
if ($bd->connect_errno) {
    fwrite(STDERR, "No pude conectar con la base: " . $bd->connect_error . "\n");
    exit(1);
}
$bd->set_charset('utf8mb4');

$sql = "-- Copia de seguridad de $base (" . $entorno . ") — " . date('d/m/Y H:i') . "\n";
$sql .= "SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS=0;\n\n";

$tablas = array();
$lista = $bd->query('SHOW TABLES');
while ($fila = $lista->fetch_row()) { $tablas[] = $fila[0]; }

foreach ($tablas as $tabla) {
    $crear = $bd->query('SHOW CREATE TABLE `' . $tabla . '`')->fetch_row();
    $sql .= "DROP TABLE IF EXISTS `$tabla`;\n" . $crear[1] . ";\n\n";

    $filas = $bd->query('SELECT * FROM `' . $tabla . '`');
    $columnas = array();
    foreach ($filas->fetch_fields() as $campo) { $columnas[] = '`' . $campo->name . '`'; }
    $cabecera = 'INSERT INTO `' . $tabla . '` (' . implode(',', $columnas) . ') VALUES ';

    $pendientes = array();
    while ($fila = $filas->fetch_row()) {
        $valores = array();
        foreach ($fila as $valor) {
            $valores[] = $valor === null ? 'NULL' : "'" . $bd->real_escape_string($valor) . "'";
        }
        $pendientes[] = '(' . implode(',', $valores) . ')';
        // De 200 en 200 para no llenar la memoria con tablas grandes.
        if (count($pendientes) >= 200) {
            $sql .= $cabecera . implode(",\n", $pendientes) . ";\n";
            $pendientes = array();
        }
    }
    if ($pendientes) { $sql .= $cabecera . implode(",\n", $pendientes) . ";\n"; }
    $sql .= "\n";
}
$sql .= "SET FOREIGN_KEY_CHECKS=1;\n";
$bd->close();

$archivo = $carpeta . '/' . $base . '-' . date('Y-m-d') . '.sql.gz';
if (file_put_contents($archivo, gzencode($sql, 6)) === false) {
    fwrite(STDERR, "No pude escribir $archivo\n");
    exit(1);
}
@chmod($archivo, 0600);

// Borrar las copias viejas.
$borradas = 0;
$limite = time() - (DIAS_A_GUARDAR * 86400);
foreach (glob($carpeta . '/' . $base . '-*.sql.gz') as $viejo) {
    if (filemtime($viejo) < $limite && @unlink($viejo)) { $borradas++; }
}

$resumen = date('d/m/Y H:i') . " — copia de $base: " . count($tablas) . " tablas, "
    . round(filesize($archivo) / 1024) . " KB. Copias viejas borradas: $borradas.\n";
file_put_contents($carpeta . '/registro.log', $resumen, FILE_APPEND);
echo $resumen;
