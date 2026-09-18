<?php
// Crea la empresa y su primer administrador en una base vacia.
// Uso (en la computadora o por consola):
//   php crear-admin.php <carpeta con config.php> "Nombre empresa" usuario correo clave "Nombre completo"
// En el traslado real no hace falta: los usuarios se importan desde Supabase.
declare(strict_types=1);
[$_, $carpeta, $empresa, $usuario, $correo, $clave, $nombre] = array_pad($argv, 7, null);
if (!$nombre) { fwrite(STDERR, "Faltan datos. Revisa el uso al inicio del archivo.\n"); exit(1); }
require rtrim($carpeta, '/\\') . '/arranque.php';
require rtrim($carpeta, '/\\') . '/sesion.php';
$db = vaak_db();
$empresaId = $db->query('SELECT id FROM vaak_companies LIMIT 1')->fetchColumn() ?: null;
if (!$empresaId) {
  $empresaId = vaak_uuid();
  $db->prepare('INSERT INTO vaak_companies (id, name) VALUES (?, ?)')->execute([$empresaId, $empresa]);
}
$userId = vaak_uuid();
$db->prepare('INSERT INTO vaak_profiles (id, display_name, username, login_email, legacy_id, password_hash) VALUES (?, ?, ?, ?, ?, ?)')
  ->execute([$userId, $nombre, mb_strtolower($usuario), mb_strtolower($correo), 'u-' . vaak_uuid(), password_hash($clave, PASSWORD_BCRYPT)]);
$db->prepare("INSERT INTO vaak_user_company_memberships (id, user_id, company_id, role, status, access, project_scope, local_project_ids) VALUES (?, ?, ?, 'admin', 'active', NULL, 'all', '[]')")
  ->execute([vaak_uuid(), $userId, $empresaId]);
echo "Administrador creado: $usuario\n";
