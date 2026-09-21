<?php
// Tareas sobre la base de pruebas local (nunca sobre la del hosting). Uso:
//   php ayudante.php instalar          crea la base vaak_pruebas con servidor-php/sql/esquema.sql
//   php ayudante.php crear-admin       crea auditor.admin (si no existe) y guarda su clave en .local/
//   php ayudante.php vaciar            borra los datos de la empresa, sesiones y bloqueos
//   php ayudante.php sin-bloqueos      quita los bloqueos por intentos fallidos
//   php ayudante.php borrar-usuarios   quita trab.prueba y clie.prueba
//   php ayudante.php asignar           asigna trab.prueba y clie.prueba al primer proyecto
//   php ayudante.php poner-demo        mete los datos de demostración antiguos (para probar su limpieza)
declare(strict_types=1);
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
const BASE = 'vaak_pruebas';
$puerto = (int)(getenv('VAAK_MYSQL_PUERTO') ?: 3307);
$accion = $argv[1] ?? '';
$db = new mysqli('127.0.0.1', 'root', '', '', $puerto);
$db->set_charset('utf8mb4');
$local = __DIR__ . '/.local';
if (!is_dir($local)) mkdir($local, 0700, true);

if ($accion === 'instalar') {
  $existe = $db->query("SHOW DATABASES LIKE '" . BASE . "'")->num_rows > 0;
  if ($existe) { echo "La base " . BASE . " ya existe\n"; exit(0); }
  $db->query('CREATE DATABASE ' . BASE . ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  $db->select_db(BASE);
  $db->multi_query(file_get_contents(dirname(__DIR__) . '/sql/esquema.sql'));
  do { if ($r = $db->store_result()) $r->free(); } while ($db->more_results() && $db->next_result());
  echo "Base " . BASE . " creada\n";
  exit(0);
}
$db->select_db(BASE);

switch ($accion) {
  case 'crear-admin':
    if ($db->query("SELECT 1 FROM vaak_profiles WHERE username = 'auditor.admin'")->num_rows) { echo "auditor.admin ya existe\n"; break; }
    $clave = 'Aud-' . bin2hex(random_bytes(6));
    file_put_contents("$local/clave-admin.txt", $clave);
    passthru(escapeshellarg(PHP_BINARY) . ' -d extension_dir=' . escapeshellarg((string)ini_get('extension_dir')) . ' -d extension=mysqli ' . escapeshellarg(dirname(__DIR__) . '/herramientas/crear-admin.php') . ' ' . escapeshellarg("$local/sitio/nucleo") . ' "Empresa de prueba" auditor.admin auditor@ejemplo.test ' . escapeshellarg($clave) . ' "Auditor Admin"');
    break;
  case 'vaciar':
    foreach (['vaak_company_data', 'vaak_company_data_history', 'vaak_auth_rate_limits', 'vaak_sessions', 'vaak_client_access_log'] as $t) $db->query("DELETE FROM $t");
    echo "Datos vaciados\n";
    break;
  case 'sin-bloqueos':
    $db->query('DELETE FROM vaak_auth_rate_limits');
    break;
  case 'borrar-usuarios':
    $db->query('SET FOREIGN_KEY_CHECKS=0');
    $ids = "SELECT id FROM vaak_profiles WHERE username IN ('trab.prueba','clie.prueba')";
    $db->query("DELETE FROM vaak_sessions WHERE user_id IN ($ids)");
    $db->query("DELETE FROM vaak_user_company_memberships WHERE user_id IN ($ids)");
    $db->query("DELETE FROM vaak_profiles WHERE username IN ('trab.prueba','clie.prueba')");
    $db->query('SET FOREIGN_KEY_CHECKS=1');
    break;
  case 'asignar':
    $st = json_decode((string)($db->query('SELECT state FROM vaak_company_data')->fetch_row()[0] ?? 'null'));
    $id = $st->store->projects[0]->id ?? null;
    if (!$id) { fwrite(STDERR, "No hay proyectos\n"); exit(1); }
    $lista = json_encode([$id]);
    $q = $db->prepare("UPDATE vaak_user_company_memberships m JOIN vaak_profiles p ON p.id = m.user_id SET m.local_project_ids = ?, m.project_scope = 'selected' WHERE p.username IN ('trab.prueba','clie.prueba')");
    $q->bind_param('s', $lista); $q->execute();
    echo "Asignados al proyecto $id\n";
    break;
  case 'poner-demo':
    $st = json_decode((string)$db->query('SELECT state FROM vaak_company_data')->fetch_row()[0]);
    $demo = json_decode(file_get_contents("$local/demo.json"));
    foreach (['projects', 'orders', 'suppliers', 'specs', 'tasks', 'projectCompanies', 'supplierProjectLinks'] as $k) $st->store->{$k} = array_merge($demo->{$k}, $st->store->{$k} ?? []);
    $st->store->orders[] = (object)['id' => 'o-real-1', 'projectId' => 'p1', 'number' => 'PO-REAL-EN-DEMO', 'amount' => '$ 5.00'];
    $json = json_encode($st, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $q = $db->prepare('UPDATE vaak_company_data SET state = ?, revision = revision + 1');
    $q->bind_param('s', $json); $q->execute();
    echo "Datos de demostración agregados\n";
    break;
  default:
    fwrite(STDERR, "Acción desconocida: $accion\n");
    exit(1);
}
