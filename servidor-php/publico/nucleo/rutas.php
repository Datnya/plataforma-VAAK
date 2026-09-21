<?php
// Las rutas /api/* de VAAK. Cada funcion reproduce la ruta equivalente de
// staging/app/api (Next.js), con las mismas respuestas y codigos de estado.
declare(strict_types=1);

// ======================= INICIO DE SESION =======================

// POST /api/auth/login  (antes: auth/login/route.ts)
function ruta_login(): void {
  $falla = fn(string $error, int $estado, array $extra = []) => vaak_fallar(['ok' => false, 'error' => $error] + $extra, $estado);
  if (!vaak_origen_permitido() || !vaak_csrf_valido() || !vaak_es_json()) $falla('session_expired', 403);
  $datos = vaak_cuerpo_json();
  if ($datos === null) $falla('missing_fields', 400);
  $identificador = (string)($datos['username'] ?? $datos['email'] ?? '');
  if (class_exists('Normalizer')) $identificador = Normalizer::normalize($identificador, Normalizer::FORM_C) ?: $identificador;
  $identificador = mb_strtolower(trim($identificador));
  $clave = (string)($datos['password'] ?? '');
  if ($identificador === '' || $clave === '') $falla('missing_fields', 400);

  $db = vaak_db();
  $llave = vaak_hmac(($_SERVER['REMOTE_ADDR'] ?? 'unknown') . '|' . $identificador);

  // Primero se revisa si ya esta bloqueado, sin contar este intento.
  $q = $db->prepare('SELECT blocked_until FROM vaak_auth_rate_limits WHERE attempt_key = ?');
  $q->execute([$llave]);
  $bloqueo = $q->fetchColumn();
  if ($bloqueo) {
    $faltan = (int)ceil(strtotime($bloqueo . ' UTC') - microtime(true));
    if ($faltan > 0) $falla('too_many_attempts', 429, ['retryAfterSeconds' => $faltan]);
  }

  // Solo los fallos reales (usuario inexistente o contrasena errada) cuentan.
  $registrarFallo = function () use ($db, $llave): int {
    $limite = 8; $ventana = 900; $castigo = 900;
    $db->beginTransaction();
    $q = $db->prepare('SELECT attempts, window_started_at, blocked_until FROM vaak_auth_rate_limits WHERE attempt_key = ? FOR UPDATE');
    $q->execute([$llave]);
    $fila = $q->fetch();
    $ahora = microtime(true);
    if (!$fila) {
      $db->prepare('INSERT INTO vaak_auth_rate_limits (attempt_key, attempts, window_started_at, updated_at) VALUES (?, 1, UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))')->execute([$llave]);
      $db->commit();
      return 0;
    }
    $reinicia = strtotime($fila['window_started_at'] . ' UTC') < $ahora - $ventana;
    $intentos = $reinicia ? 1 : (int)$fila['attempts'] + 1;
    $bloqueadoHasta = $fila['blocked_until'];
    if ($intentos > $limite) $bloqueadoHasta = gmdate('Y-m-d H:i:s', (int)$ahora + $castigo);
    $db->prepare('UPDATE vaak_auth_rate_limits SET attempts = ?, window_started_at = IF(?, UTC_TIMESTAMP(3), window_started_at), blocked_until = ?, updated_at = UTC_TIMESTAMP(3) WHERE attempt_key = ?')
      ->execute([$intentos, $reinicia ? 1 : 0, $bloqueadoHasta, $llave]);
    $db->commit();
    if ($bloqueadoHasta && strtotime($bloqueadoHasta . ' UTC') > $ahora) return max(1, (int)ceil(strtotime($bloqueadoHasta . ' UTC') - $ahora));
    return 0;
  };

  $campo = str_contains($identificador, '@') ? 'login_email' : 'username';
  $q = $db->prepare("SELECT id, login_email, active, password_hash FROM vaak_profiles WHERE $campo = ? LIMIT 1");
  $q->execute([$identificador]);
  $perfil = $q->fetch();
  if (!$perfil || !$perfil['login_email']) {
    $espera = $registrarFallo();
    if ($espera) $falla('too_many_attempts', 429, ['retryAfterSeconds' => $espera]);
    $falla('user_not_found', 401);
  }
  if ((int)$perfil['active'] === 0) $falla('user_inactive', 403);
  if (!password_verify($clave, $perfil['password_hash'])) {
    $espera = $registrarFallo();
    if ($espera) $falla('too_many_attempts', 429, ['retryAfterSeconds' => $espera]);
    $falla('invalid_password', 401);
  }
  $q = $db->prepare("SELECT company_id, role, project_scope, local_project_ids FROM vaak_user_company_memberships WHERE user_id = ? AND status = 'active' ORDER BY created_at LIMIT 1");
  $q->execute([$perfil['id']]);
  $membresia = $q->fetch();
  if (!$membresia) $falla('no_membership', 403);

  // Hash con parametros viejos (por ejemplo, importado de Supabase): se actualiza.
  if (password_needs_rehash($perfil['password_hash'], PASSWORD_BCRYPT)) {
    $db->prepare('UPDATE vaak_profiles SET password_hash = ? WHERE id = ?')->execute([password_hash($clave, PASSWORD_BCRYPT), $perfil['id']]);
  }
  $db->prepare('DELETE FROM vaak_auth_rate_limits WHERE attempt_key = ?')->execute([$llave]);
  $db->prepare('UPDATE vaak_profiles SET last_seen_at = UTC_TIMESTAMP(3), signed_out_at = NULL WHERE id = ?')->execute([$perfil['id']]);
  vaak_crear_sesion($perfil['id']);
  if ($membresia['role'] === 'client') {
    try { vaak_registrar_acceso_cliente($perfil['id'], $membresia); } catch (Throwable $e) { error_log('[VAAK] registro de acceso: ' . $e->getMessage()); }
  }
  $token = vaak_emitir_csrf();
  vaak_json(['ok' => true], 200, ['x-vaak-csrf' => $token]);
}

// GET /api/auth/session  (antes: auth/session/route.ts)
function ruta_sesion(): void {
  $cuerpo = ['authenticated' => false];
  $userId = vaak_usuario_actual();
  if ($userId) {
    $db = vaak_db();
    $q = $db->prepare("SELECT company_id, role, access, project_scope, local_project_ids FROM vaak_user_company_memberships WHERE user_id = ? AND status = 'active' LIMIT 1");
    $q->execute([$userId]);
    $m = $q->fetch();
    $q = $db->prepare('SELECT display_name, username, login_email, legacy_id, active, team, position, phone, avatar_url FROM vaak_profiles WHERE id = ?');
    $q->execute([$userId]);
    $p = $q->fetch();
    if ($m && $p && (int)$p['active'] !== 0) {
      $u = [
        'id' => $p['legacy_id'] ?: 'remote-' . $userId,
        'authId' => $userId,
        'name' => $p['display_name'] ?: ($p['login_email'] ?: 'VAAK user'),
        'username' => $p['username'],
        'email' => $p['login_email'],
        'role' => vaak_rol_app($m['role']),
        'active' => true,
      ];
      if ($m['role'] !== 'admin') $u['access'] = vaak_json_objeto($m['access']);
      $u['projectScope'] = $m['project_scope'];
      $u['projectIds'] = vaak_json_lista($m['local_project_ids']);
      foreach (['team' => 'team', 'position' => 'position', 'phone' => 'phone', 'avatar_url' => 'profilePhoto'] as $col => $campo) {
        if ($p[$col] !== null && $p[$col] !== '') $u[$campo] = $p[$col];
      }
      $cuerpo['authenticated'] = true;
      $cuerpo['user'] = $u;
      // Administradores y trabajadores reciben el directorio de la empresa: de ahi
      // salen los proyectos asignados a cada trabajador y cliente, iguales para todos.
      // Los trabajadores reciben una version reducida (sin datos de contacto ni permisos).
      if ($m['role'] === 'admin') $cuerpo['users'] = vaak_listar_usuarios($m['company_id']);
      elseif ($m['role'] !== 'client') {
        $cuerpo['users'] = vaak_directorio_para_trabajador(vaak_listar_usuarios($m['company_id']), [
          'userId' => $userId, 'role' => $m['role'], 'projectScope' => $m['project_scope'] ?: null, 'projectIds' => vaak_json_lista($m['local_project_ids']),
        ]);
      }
    }
  }
  $cuerpo['csrfToken'] = vaak_emitir_csrf();
  vaak_json($cuerpo, $cuerpo['authenticated'] ? 200 : 401);
}

// POST /api/auth/logout
function ruta_logout(): void {
  vaak_exigir_escritura();
  $userId = vaak_usuario_actual();
  if ($userId) vaak_db()->prepare('UPDATE vaak_profiles SET signed_out_at = UTC_TIMESTAMP(3) WHERE id = ?')->execute([$userId]);
  vaak_cerrar_sesion();
  vaak_json(['ok' => true]);
}

// ======================= USUARIOS =======================

function vaak_texto_valido($valor, int $max = 160): bool {
  return is_string($valor) && trim($valor) !== '' && mb_strlen(trim($valor)) <= $max;
}

// GET /api/admin/users
function ruta_usuarios_listar(): void {
  $admin = vaak_admin();
  if (!$admin) vaak_fallar(['ok' => false], 403);
  vaak_json(['ok' => true, 'users' => vaak_listar_usuarios($admin['companyId'])]);
}

// POST /api/admin/users
function ruta_usuarios_crear(): void {
  if (!vaak_origen_permitido() || !vaak_csrf_valido() || !vaak_es_json()) vaak_fallar(['ok' => false], 403);
  $admin = vaak_admin();
  if (!$admin) vaak_fallar(['ok' => false], 403);
  $b = vaak_cuerpo_json();
  if ($b === null) vaak_fallar(['ok' => false, 'error' => 'invalid_request'], 400);
  if (!vaak_texto_valido($b['name'] ?? null) || !vaak_texto_valido($b['username'] ?? null, 80) || !vaak_texto_valido($b['email'] ?? null, 254)
    || !vaak_texto_valido($b['password'] ?? null, 256) || strlen((string)$b['password']) < 8) {
    vaak_fallar(['ok' => false, 'error' => 'invalid_request'], 400);
  }
  if (!preg_match('/^[^@\s]+@[^@\s]+\.[^@\s]+$/', (string)$b['email']) || !in_array($b['role'] ?? '', ['Admin', 'Worker', 'Client'], true)) {
    vaak_fallar(['ok' => false, 'error' => 'invalid_request'], 400);
  }
  $idem = vaak_cabecera('idempotency-key') ?: (string)($b['idempotencyKey'] ?? '');
  if (!preg_match('/^[0-9a-f-]{36}$/i', $idem)) vaak_fallar(['ok' => false, 'error' => 'idempotency_key_required'], 400);

  $db = vaak_db();
  $q = $db->prepare('SELECT user_id, legacy_id FROM vaak_user_provisioning WHERE idempotency_key = ?');
  $q->execute([$idem]);
  $previo = $q->fetch();
  if ($previo && $previo['user_id']) { vaak_json(['ok' => true, 'id' => $previo['legacy_id'], 'replayed' => true]); return; }

  $usuario = mb_strtolower(trim((string)$b['username']));
  $correo = mb_strtolower(trim((string)$b['email']));
  $q = $db->prepare('SELECT id FROM vaak_profiles WHERE username = ? OR login_email = ? LIMIT 1');
  $q->execute([$usuario, $correo]);
  if ($q->fetch()) vaak_fallar(['ok' => false, 'error' => 'identity_exists'], 409);

  $legacyId = vaak_texto_valido($b['legacyId'] ?? null, 100) ? trim((string)$b['legacyId']) : 'u-' . vaak_uuid();
  $userId = vaak_uuid();
  $proyectos = array_values(array_filter(is_array($b['projectIds'] ?? null) ? $b['projectIds'] : [], fn($x) => vaak_texto_valido($x, 100)));
  try {
    $db->beginTransaction();
    $db->prepare('INSERT INTO vaak_user_provisioning (idempotency_key, company_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE company_id = company_id')->execute([$idem, $admin['companyId']]);
    $db->prepare('INSERT INTO vaak_profiles (id, display_name, username, login_email, legacy_id, password_hash, locale, team, position, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      ->execute([$userId, trim((string)$b['name']), $usuario, $correo, $legacyId, password_hash((string)$b['password'], PASSWORD_BCRYPT), 'en',
        is_string($b['team'] ?? null) ? $b['team'] : '', is_string($b['position'] ?? null) ? $b['position'] : '', is_string($b['phone'] ?? null) ? $b['phone'] : '']);
    $db->prepare('INSERT INTO vaak_user_company_memberships (id, user_id, company_id, role, status, access, project_scope, local_project_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      ->execute([vaak_uuid(), $userId, $admin['companyId'], vaak_rol_db((string)$b['role']), 'active',
        json_encode(vaak_cuerpo_objeto()->access ?? ['version' => 2, 'grants' => new stdClass()]), ($b['projectScope'] ?? '') === 'all' ? 'all' : 'selected', json_encode($proyectos)]);
    $db->prepare('UPDATE vaak_user_provisioning SET user_id = ?, legacy_id = ? WHERE idempotency_key = ?')->execute([$userId, $legacyId, $idem]);
    $db->commit();
  } catch (Throwable $e) {
    if ($db->inTransaction()) $db->rollBack();
    if (vaak_bd_errno($e) === 1062) vaak_fallar(['ok' => false, 'error' => 'identity_exists'], 409);
    vaak_fallar(['ok' => false, 'error' => 'provisioning_failed'], 500);
  }
  vaak_json(['ok' => true, 'id' => $legacyId], 201);
}

function vaak_usuario_por_legacy(string $legacyId): ?array {
  $q = vaak_db()->prepare('SELECT id, login_email FROM vaak_profiles WHERE legacy_id = ?');
  $q->execute([$legacyId]);
  return $q->fetch() ?: null;
}

// PATCH /api/admin/users/{id}
function ruta_usuarios_editar(string $legacyId): void {
  vaak_exigir_escritura();
  $admin = vaak_admin();
  if (!$admin) vaak_fallar(['ok' => false], 403);
  $objetivo = vaak_usuario_por_legacy($legacyId);
  if (!$objetivo) vaak_fallar(['ok' => false], 404);
  $b = vaak_cuerpo_json();
  if ($b === null) vaak_fallar(['ok' => false], 400);
  if ($objetivo['id'] === $admin['userId'] && ($b['active'] ?? null) === false) vaak_fallar(['ok' => false, 'error' => 'cannot_disable_self'], 409);

  $db = vaak_db();
  $perfil = [];
  if (is_string($b['name'] ?? null) && trim($b['name']) !== '') $perfil['display_name'] = trim($b['name']);
  if (is_string($b['username'] ?? null) && trim($b['username']) !== '') $perfil['username'] = mb_strtolower(trim($b['username']));
  if (is_string($b['email'] ?? null) && trim($b['email']) !== '') $perfil['login_email'] = mb_strtolower(trim($b['email']));
  foreach (['team', 'position', 'phone'] as $k) if (is_string($b[$k] ?? null)) $perfil[$k] = trim($b[$k]) !== '' ? trim($b[$k]) : null;
  if (is_bool($b['active'] ?? null)) $perfil['active'] = $b['active'] ? 1 : 0;
  if (is_string($b['password'] ?? null) && strlen($b['password']) >= 8) $perfil['password_hash'] = password_hash($b['password'], PASSWORD_BCRYPT);

  $membresia = [];
  if (in_array($b['role'] ?? '', ['Admin', 'Worker', 'Client'], true)) $membresia['role'] = vaak_rol_db($b['role']);
  if (is_bool($b['active'] ?? null)) $membresia['status'] = $b['active'] ? 'active' : 'disabled';
  if (!empty($b['access'])) $membresia['access'] = json_encode(vaak_cuerpo_objeto()->access);
  if (!empty($b['projectScope'])) $membresia['project_scope'] = $b['projectScope'] === 'all' ? 'all' : 'selected';
  if (is_array($b['projectIds'] ?? null)) $membresia['local_project_ids'] = json_encode(array_values($b['projectIds']));

  // No se puede quitar el ultimo administrador activo.
  $dejaDeSerAdmin = (isset($membresia['role']) && $membresia['role'] !== 'admin') || (isset($membresia['status']) && $membresia['status'] !== 'active');
  if ($dejaDeSerAdmin && vaak_es_ultimo_admin($objetivo['id'], $admin['companyId'])) vaak_fallar(['ok' => false, 'error' => 'last_active_admin'], 409);

  try {
    $db->beginTransaction();
    if ($perfil) {
      $sets = implode(', ', array_map(fn($k) => "$k = ?", array_keys($perfil)));
      $db->prepare("UPDATE vaak_profiles SET $sets WHERE id = ?")->execute([...array_values($perfil), $objetivo['id']]);
    }
    if ($membresia) {
      $sets = implode(', ', array_map(fn($k) => "$k = ?", array_keys($membresia)));
      $db->prepare("UPDATE vaak_user_company_memberships SET $sets WHERE user_id = ? AND company_id = ?")->execute([...array_values($membresia), $objetivo['id'], $admin['companyId']]);
    }
    // Deshabilitar a alguien cierra sus sesiones abiertas.
    if (($perfil['active'] ?? 1) === 0 || isset($perfil['password_hash'])) {
      $db->prepare('DELETE FROM vaak_sessions WHERE user_id = ? AND user_id <> ?')->execute([$objetivo['id'], $admin['userId']]);
    }
    $db->prepare("INSERT INTO vaak_audit_events (company_id, actor_user_id, action, resource_type, resource_id) VALUES (?, ?, 'user.updated', 'user', ?)")->execute([$admin['companyId'], $admin['userId'], $objetivo['id']]);
    $db->commit();
  } catch (Throwable $e) {
    if ($db->inTransaction()) $db->rollBack();
    if (vaak_bd_errno($e) === 1062) vaak_fallar(['ok' => false, 'error' => 'identity_conflict'], 409);
    vaak_fallar(['ok' => false, 'error' => 'membership_update_failed'], 409);
  }
  vaak_json(['ok' => true]);
}

// DELETE /api/admin/users/{id}
function ruta_usuarios_eliminar(string $legacyId): void {
  vaak_exigir_escritura();
  $admin = vaak_admin();
  if (!$admin) vaak_fallar(['ok' => false], 403);
  $objetivo = vaak_usuario_por_legacy($legacyId);
  if (!$objetivo) vaak_fallar(['ok' => false], 404);
  if ($objetivo['id'] === $admin['userId']) vaak_fallar(['ok' => false, 'error' => 'cannot_delete_self'], 409);
  if (vaak_es_ultimo_admin($objetivo['id'], $admin['companyId'])) vaak_fallar(['ok' => false, 'error' => 'last_active_admin'], 409);
  vaak_db()->prepare('DELETE FROM vaak_profiles WHERE id = ?')->execute([$objetivo['id']]);
  vaak_db()->prepare("INSERT INTO vaak_audit_events (company_id, actor_user_id, action, resource_type, resource_id) VALUES (?, ?, 'user.deleted', 'user', ?)")->execute([$admin['companyId'], $admin['userId'], $objetivo['id']]);
  vaak_json(['ok' => true]);
}

// GET /api/admin/presence
function ruta_presencia_listar(): void {
  $admin = vaak_admin();
  if (!$admin) vaak_fallar(['ok' => false], 403);
  $q = vaak_db()->prepare('SELECT m.user_id, p.legacy_id, p.last_seen_at, p.signed_out_at FROM vaak_user_company_memberships m JOIN vaak_profiles p ON p.id = m.user_id WHERE m.company_id = ?');
  $q->execute([$admin['companyId']]);
  $presencia = array_map(fn($r) => [
    'id' => $r['legacy_id'] ?: 'remote-' . $r['user_id'],
    'lastSeenAt' => vaak_iso($r['last_seen_at']),
    'signedOutAt' => vaak_iso($r['signed_out_at']),
  ], $q->fetchAll());
  vaak_json(['ok' => true, 'serverNow' => vaak_iso(vaak_ahora_db()), 'presence' => $presencia]);
}

// ======================= MI PERFIL =======================

// PUT /api/me/photo
function ruta_foto_guardar(): void {
  vaak_exigir_escritura(['ok' => false, 'error' => 'forbidden']);
  $userId = vaak_usuario_actual();
  if (!$userId) vaak_fallar(['ok' => false, 'error' => 'unauthenticated'], 401);
  $b = vaak_cuerpo_json();
  if ($b === null) vaak_fallar(['ok' => false, 'error' => 'invalid_photo'], 400);
  $foto = is_string($b['photo'] ?? null) ? $b['photo'] : '';
  if (strlen($foto) > 700000) vaak_fallar(['ok' => false, 'error' => 'photo_too_large'], 413);
  if (!preg_match('#^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$#', $foto)) vaak_fallar(['ok' => false, 'error' => 'invalid_photo'], 400);
  vaak_db()->prepare('UPDATE vaak_profiles SET avatar_url = ? WHERE id = ?')->execute([$foto, $userId]);
  vaak_json(['ok' => true]);
}

// DELETE /api/me/photo
function ruta_foto_quitar(): void {
  vaak_exigir_escritura(['ok' => false, 'error' => 'forbidden']);
  $userId = vaak_usuario_actual();
  if (!$userId) vaak_fallar(['ok' => false, 'error' => 'unauthenticated'], 401);
  vaak_db()->prepare('UPDATE vaak_profiles SET avatar_url = NULL WHERE id = ?')->execute([$userId]);
  vaak_json(['ok' => true]);
}

// POST /api/me/presence
function ruta_presencia_latido(): void {
  vaak_exigir_escritura();
  $userId = vaak_usuario_actual();
  if (!$userId) vaak_fallar(['ok' => false], 401);
  $ahora = vaak_ahora_db();
  vaak_db()->prepare('UPDATE vaak_profiles SET last_seen_at = ?, signed_out_at = NULL WHERE id = ?')->execute([$ahora, $userId]);
  vaak_json(['ok' => true, 'serverNow' => vaak_iso($ahora)]);
}

// ======================= DATOS COMPARTIDOS =======================

const VAAK_MAX_ESTADO = 4000000;

// Los clientes solo reciben sus proyectos y lo que pertenece a ellos.
// Trabaja con objetos (json_decode sin true) para no convertir {} en [].
function vaak_estado_para_miembro($estado, array $miembro) {
  if (!is_object($estado) || $miembro['role'] !== 'client') return $estado;
  $store = is_object($estado->store ?? null) ? $estado->store : new stdClass();
  $lista = fn($v) => is_array($v) ? $v : [];
  $permitidos = $miembro['projectScope'] === 'all'
    ? array_map(fn($p) => is_object($p) ? ($p->id ?? null) : null, $lista($store->projects ?? []))
    : $miembro['projectIds'];
  $permitidos = array_flip(array_filter($permitidos, fn($x) => is_string($x) || is_int($x)));
  $delProyecto = fn($x) => is_object($x) && isset($x->projectId) && (is_string($x->projectId) || is_int($x->projectId)) && isset($permitidos[$x->projectId]);
  return (object)[
    'version' => $estado->version ?? null,
    'store' => (object)[
      'projects' => array_values(array_filter($lista($store->projects ?? []), fn($p) => is_object($p) && isset($p->id) && (is_string($p->id) || is_int($p->id)) && isset($permitidos[$p->id]))),
      'orders' => array_values(array_filter($lista($store->orders ?? []), $delProyecto)),
      'specs' => array_values(array_filter($lista($store->specs ?? []), $delProyecto)),
      'projectCompanies' => array_values(array_filter($lista($store->projectCompanies ?? []), $delProyecto)),
      'suppliers' => [],
      'tasks' => [],
      'supplierProjectLinks' => [],
    ],
    'extras' => new stdClass(),
    'partial' => true,
  ];
}

// ---- Trabajadores (auditoría, 21-sep-2026) ----
// Antes recibían el documento completo de la empresa (todos los proyectos, órdenes y precios) y
// podían reemplazarlo entero desde la consola del navegador. Ahora reciben solo sus proyectos y, al
// guardar, el servidor toma de lo enviado únicamente lo que su rol puede cambiar; el resto queda
// como estaba. Las reglas son las mismas que aplica la aplicación (access-control.js).

// Id del usuario dentro de la aplicación (el mismo que usa el directorio).
function vaak_id_app(string $userId): string {
  $q = vaak_db()->prepare('SELECT legacy_id FROM vaak_profiles WHERE id = ?');
  $q->execute([$userId]);
  $legacy = $q->fetchColumn();
  return $legacy ? (string)$legacy : 'remote-' . $userId;
}

function vaak_id_de($x): ?string {
  return is_object($x) && isset($x->id) && (is_string($x->id) || is_int($x->id)) ? (string)$x->id : null;
}
function vaak_lista($v): array { return is_array($v) ? $v : []; }
function vaak_en_alcance(?array $permitidos, $projectId): bool {
  if (!is_string($projectId) && !is_int($projectId)) return false;
  return $permitidos === null || isset($permitidos[(string)$projectId]);
}
function vaak_asignada(object $tarea, string $miId): bool {
  $lista = is_array($tarea->assignees ?? null) && $tarea->assignees ? $tarea->assignees : [$tarea->assignee ?? null];
  return in_array($miId, $lista, true);
}
// Los extras son textos JSON; se leen sin convertir {} en [].
function vaak_extra($extras, string $clave) {
  $texto = is_object($extras) ? ($extras->{$clave} ?? null) : null;
  return is_string($texto) ? json_decode($texto) : null;
}
function vaak_texto_extra($valor): string { return json_encode($valor, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); }

// Lo que ve un trabajador: sus proyectos con sus órdenes, specs y vínculos; todos los proveedores
// (el catálogo de la empresa, igual que en la aplicación); solo sus tareas; los borradores de sus
// proyectos y sus propias notificaciones descartadas.
function vaak_estado_para_trabajador($estado, array $miembro, string $miId) {
  if (!is_object($estado)) return $estado;
  $permitidos = vaak_proyectos_permitidos($miembro);
  $s = is_object($estado->store ?? null) ? $estado->store : new stdClass();
  $delProyecto = fn($x) => is_object($x) && vaak_en_alcance($permitidos, $x->projectId ?? null);
  $store = (object)[
    'projects' => array_values(array_filter(vaak_lista($s->projects ?? null), fn($p) => vaak_en_alcance($permitidos, vaak_id_de($p)))),
    'orders' => array_values(array_filter(vaak_lista($s->orders ?? null), $delProyecto)),
    'suppliers' => vaak_lista($s->suppliers ?? null),
    'specs' => array_values(array_filter(vaak_lista($s->specs ?? null), $delProyecto)),
    'tasks' => array_values(array_filter(vaak_lista($s->tasks ?? null), fn($t) => is_object($t) && vaak_asignada($t, $miId))),
    'projectCompanies' => array_values(array_filter(vaak_lista($s->projectCompanies ?? null), $delProyecto)),
    'supplierProjectLinks' => array_values(array_filter(vaak_lista($s->supplierProjectLinks ?? null), $delProyecto)),
  ];
  $extras = is_object($estado->extras ?? null) ? clone $estado->extras : new stdClass();
  $borradores = vaak_extra($extras, 'vaak-oc-drafts');
  if (is_array($borradores)) {
    $extras->{'vaak-oc-drafts'} = vaak_texto_extra(array_values(array_filter($borradores, fn($d) => is_object($d) && (empty($d->projectId) || vaak_en_alcance($permitidos, $d->projectId)))));
  }
  $descartadas = vaak_extra($extras, 'vaak-dismissed-notifs');
  if (is_object($descartadas)) {
    $propias = new stdClass();
    if (isset($descartadas->{$miId})) $propias->{$miId} = $descartadas->{$miId};
    $extras->{'vaak-dismissed-notifs'} = vaak_texto_extra($propias);
  }
  return (object)['version' => $estado->version ?? 1, 'store' => $store, 'extras' => $extras];
}

// Datos de la ficha del proyecto que solo cambia un administrador (editar proyecto, términos,
// portada, galería y equipo). El trabajador sí cambia requerimientos de pago, áreas, etc.
const VAAK_CAMPOS_PROYECTO_ADMIN = ['id', 'name', 'code', 'ruc', 'city', 'legal', 'phone', 'fiscal', 'contact', 'country', 'cover', 'gallery', 'team', 'terms'];

// Recorre la lista actual reemplazando lo que el trabajador puede cambiar y agrega lo nuevo al final.
// $puede(actual|null, enviado|null) devuelve el elemento que queda (o null para quitarlo).
function vaak_combinar_lista(array $actual, array $enviado, callable $puede): array {
  $enviados = [];
  foreach ($enviado as $x) { $id = vaak_id_de($x); if ($id !== null && !isset($enviados[$id])) $enviados[$id] = $x; }
  $salida = []; $vistos = [];
  foreach ($actual as $x) {
    $id = vaak_id_de($x);
    if ($id === null) { $salida[] = $x; continue; }
    $vistos[$id] = true;
    $queda = $puede($x, $enviados[$id] ?? null);
    if ($queda !== null) $salida[] = $queda;
  }
  foreach ($enviados as $id => $x) {
    if (isset($vistos[$id])) continue;
    $queda = $puede(null, $x);
    if ($queda !== null) $salida[] = $queda;
  }
  return $salida;
}

// Vínculos sin id propio (proyecto-empresa, proveedor-proyecto): se conservan los que están fuera
// de sus proyectos y se toman de lo enviado los de sus proyectos.
function vaak_combinar_vinculos(array $actual, array $enviado, ?array $permitidos): array {
  $fuera = array_filter($actual, fn($x) => !is_object($x) || !vaak_en_alcance($permitidos, $x->projectId ?? null));
  $dentro = array_filter($enviado, fn($x) => is_object($x) && vaak_en_alcance($permitidos, $x->projectId ?? null));
  return array_values(array_merge($fuera, $dentro));
}

function vaak_combinar_trabajador($actual, object $enviado, array $miembro, string $miId): object {
  $permitidos = vaak_proyectos_permitidos($miembro);
  $a = is_object($actual->store ?? null) ? $actual->store : new stdClass();
  $e = $enviado->store;
  $store = clone $a;

  // Proyectos: no crea ni borra; en los suyos cambia todo menos la ficha del proyecto.
  $store->projects = vaak_combinar_lista(vaak_lista($a->projects ?? null), vaak_lista($e->projects ?? null), function ($viejo, $nuevo) use ($permitidos) {
    if ($viejo === null) return null;
    if ($nuevo === null || !vaak_en_alcance($permitidos, vaak_id_de($viejo)) || !is_object($nuevo)) return $viejo;
    $queda = clone $nuevo;
    foreach (VAAK_CAMPOS_PROYECTO_ADMIN as $campo) {
      if (property_exists($viejo, $campo)) $queda->{$campo} = $viejo->{$campo}; else unset($queda->{$campo});
    }
    return $queda;
  });

  // Órdenes y specs: libres dentro de sus proyectos; no puede tocar ni traer a los suyos los de otros.
  foreach (['orders', 'specs'] as $coleccion) {
    $store->{$coleccion} = vaak_combinar_lista(vaak_lista($a->{$coleccion} ?? null), vaak_lista($e->{$coleccion} ?? null), function ($viejo, $nuevo) use ($permitidos) {
      if ($viejo !== null && !vaak_en_alcance($permitidos, $viejo->projectId ?? null)) return $viejo;
      if ($nuevo !== null && !vaak_en_alcance($permitidos, $nuevo->projectId ?? null)) return $viejo;
      return $nuevo;
    });
  }

  // Proveedores: crea libremente; edita o borra solo los que están vinculados únicamente a sus proyectos.
  $vinculos = vaak_lista($a->supplierProjectLinks ?? null);
  $esPropio = function (string $id) use ($vinculos, $permitidos): bool {
    if ($permitidos === null) return true;
    $suyos = array_filter($vinculos, fn($l) => is_object($l) && (string)($l->supplierId ?? '') === $id);
    if (!$suyos) return false;
    foreach ($suyos as $l) if (!vaak_en_alcance($permitidos, $l->projectId ?? null)) return false;
    return true;
  };
  $store->suppliers = vaak_combinar_lista(vaak_lista($a->suppliers ?? null), vaak_lista($e->suppliers ?? null), function ($viejo, $nuevo) use ($esPropio) {
    if ($viejo === null) return $nuevo;
    return $esPropio(vaak_id_de($viejo)) ? $nuevo : $viejo;
  });
  $store->supplierProjectLinks = vaak_combinar_vinculos($vinculos, vaak_lista($e->supplierProjectLinks ?? null), $permitidos);
  // La empresa de cada proyecto la define el administrador.
  $store->projectCompanies = vaak_lista($a->projectCompanies ?? null);

  // Tareas: solo actualiza las suyas (no crea, no borra ni cambia a quién están asignadas).
  $store->tasks = vaak_combinar_lista(vaak_lista($a->tasks ?? null), vaak_lista($e->tasks ?? null), function ($viejo, $nuevo) use ($miId) {
    if ($viejo === null) return null;
    if ($nuevo === null || !is_object($nuevo) || !vaak_asignada($viejo, $miId)) return $viejo;
    $queda = clone $nuevo;
    foreach (['assignees', 'assignee', 'projectId'] as $campo) {
      if (property_exists($viejo, $campo)) $queda->{$campo} = $viejo->{$campo}; else unset($queda->{$campo});
    }
    return $queda;
  });

  // Extras: catálogos compartidos; borradores solo de sus proyectos; sus notificaciones; el
  // contacto de la empresa lo define el administrador.
  $ea = is_object($actual->extras ?? null) ? $actual->extras : new stdClass();
  $ee = is_object($enviado->extras ?? null) ? $enviado->extras : new stdClass();
  $extras = clone $ea;
  foreach (['vaak-custom-oc-rubros', 'vaak-custom-rubros', 'vaak-removed-spec-rubros'] as $clave) {
    if (property_exists($ee, $clave) && ($ee->{$clave} === null || is_string($ee->{$clave}))) $extras->{$clave} = $ee->{$clave};
  }
  $bActual = vaak_lista(vaak_extra($ea, 'vaak-oc-drafts'));
  $bEnviado = vaak_lista(vaak_extra($ee, 'vaak-oc-drafts'));
  $suyo = fn($d) => is_object($d) && (empty($d->projectId) || vaak_en_alcance($permitidos, $d->projectId));
  $idsAjenos = [];
  foreach ($bActual as $d) if (!$suyo($d) && isset($d->draftId)) $idsAjenos[(string)$d->draftId] = true;
  $borradores = array_merge(
    array_filter($bActual, fn($d) => !$suyo($d)),
    array_filter($bEnviado, fn($d) => $suyo($d) && !isset($idsAjenos[(string)($d->draftId ?? '')]))
  );
  if ($borradores || property_exists($ea, 'vaak-oc-drafts')) $extras->{'vaak-oc-drafts'} = vaak_texto_extra(array_values($borradores));
  $dActual = vaak_extra($ea, 'vaak-dismissed-notifs');
  $dEnviado = vaak_extra($ee, 'vaak-dismissed-notifs');
  $descartadas = is_object($dActual) ? $dActual : new stdClass();
  if (is_object($dEnviado) && isset($dEnviado->{$miId}) && is_array($dEnviado->{$miId})) $descartadas->{$miId} = $dEnviado->{$miId};
  if (is_object($dEnviado) || is_object($dActual)) $extras->{'vaak-dismissed-notifs'} = vaak_texto_extra($descartadas);

  return (object)['version' => $actual->version ?? 1, 'store' => $store, 'extras' => $extras];
}

// Arma la respuesta insertando el documento guardado tal cual (sin decodificarlo).
function vaak_json_con_estado(array $cuerpo, ?string $estadoTexto, int $estado = 200): void {
  $base = json_encode($cuerpo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  http_response_code($estado);
  header('Content-Type: application/json; charset=utf-8');
  vaak_no_store();
  echo substr($base, 0, -1) . ',"state":' . ($estadoTexto ?? 'null') . '}';
}

// GET /api/data
function ruta_datos_leer(): void {
  $miembro = vaak_miembro();
  if (!$miembro) vaak_fallar(['ok' => false, 'error' => 'unauthorized'], 401);
  $q = vaak_db()->prepare('SELECT state, revision, updated_at FROM vaak_company_data WHERE company_id = ?');
  $q->execute([$miembro['companyId']]);
  $fila = $q->fetch();
  $revision = $fila ? (int)$fila['revision'] : 0;
  $desde = isset($_GET['since']) ? (int)$_GET['since'] : -1;
  $rol = $miembro['role'];
  if ($fila && $desde === $revision) { vaak_json(['ok' => true, 'role' => $rol, 'revision' => $revision, 'unchanged' => true]); return; }
  $cuerpo = ['ok' => true, 'role' => $rol, 'revision' => $revision, 'updatedAt' => $fila ? vaak_iso($fila['updated_at']) : null];
  if (!$fila) { vaak_json_con_estado($cuerpo, null); return; }
  if ($rol === 'client') {
    $filtrado = vaak_estado_para_miembro(json_decode($fila['state']), $miembro);
    vaak_json_con_estado($cuerpo, json_encode($filtrado, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    return;
  }
  if ($rol !== 'admin') {
    $filtrado = vaak_estado_para_trabajador(json_decode($fila['state']), $miembro, vaak_id_app($miembro['userId']));
    vaak_json_con_estado($cuerpo, json_encode($filtrado, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    return;
  }
  vaak_json_con_estado($cuerpo, $fila['state']);
}

// PUT /api/data  — solo se guarda sobre la revision que el navegador conoce.
function ruta_datos_guardar(): void {
  vaak_exigir_escritura(['ok' => false, 'error' => 'forbidden']);
  $miembro = vaak_miembro();
  if (!$miembro) vaak_fallar(['ok' => false, 'error' => 'unauthorized'], 401);
  if ($miembro['role'] === 'client') vaak_fallar(['ok' => false, 'error' => 'forbidden'], 403);
  $crudo = vaak_cuerpo_crudo();
  if (strlen($crudo) > VAAK_MAX_ESTADO) vaak_fallar(['ok' => false, 'error' => 'too_large'], 413);
  $b = json_decode($crudo);
  if (!is_object($b)) vaak_fallar(['ok' => false, 'error' => 'invalid_json'], 400);
  $base = $b->baseRevision ?? null;
  $estado = $b->state ?? null;
  if (!is_int($base) || $base < 0 || !is_object($estado) || !is_object($estado->store ?? null) || !is_array($estado->store->projects ?? null)) {
    vaak_fallar(['ok' => false, 'error' => 'invalid_state'], 400);
  }
  $texto = json_encode($estado, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  $db = vaak_db();
  $empresa = $miembro['companyId'];
  $conflicto = function () use ($db, $empresa): never {
    $q = $db->prepare('SELECT state, revision FROM vaak_company_data WHERE company_id = ?');
    $q->execute([$empresa]);
    $f = $q->fetch();
    vaak_json_con_estado(['ok' => false, 'error' => 'conflict', 'revision' => $f ? (int)$f['revision'] : 0], $f ? $f['state'] : null, 409);
    throw new VaakYaRespondido();
  };

  if ($base === 0) {
    // Solo un administrador publica el espacio de trabajo inicial.
    if ($miembro['role'] !== 'admin') $conflicto();
    try {
      $db->prepare('INSERT INTO vaak_company_data (company_id, state, revision, updated_at, updated_by) VALUES (?, ?, 1, UTC_TIMESTAMP(3), ?)')->execute([$empresa, $texto, $miembro['userId']]);
    } catch (mysqli_sql_exception $e) {
      if (vaak_bd_errno($e) === 1062) $conflicto();
      vaak_fallar(['ok' => false, 'error' => 'service_unavailable'], 503);
    }
    vaak_json(['ok' => true, 'revision' => 1]);
    return;
  }

  $db->beginTransaction();
  $q = $db->prepare('SELECT state, revision, updated_by FROM vaak_company_data WHERE company_id = ? FOR UPDATE');
  $q->execute([$empresa]);
  $actual = $q->fetch();
  if (!$actual || (int)$actual['revision'] !== $base) { $db->rollBack(); $conflicto(); }
  // Un trabajador solo cambia lo que su rol permite; si algo de lo enviado no se aceptó, se le
  // devuelve su vista corregida para que su navegador la adopte y no lo vuelva a enviar.
  $vistaCorregida = null;
  if ($miembro['role'] !== 'admin') {
    $miId = vaak_id_app($miembro['userId']);
    $combinado = vaak_combinar_trabajador(json_decode($actual['state']), $estado, $miembro, $miId);
    $texto = json_encode($combinado, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $vista = json_encode(vaak_estado_para_trabajador($combinado, $miembro, $miId), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($vista !== json_encode(vaak_estado_para_trabajador($estado, $miembro, $miId), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) $vistaCorregida = $vista;
  }
  // Copia de la version anterior; se conservan las ultimas 150.
  $db->prepare('INSERT INTO vaak_company_data_history (company_id, revision, state, updated_by) VALUES (?, ?, ?, ?)')->execute([$empresa, $actual['revision'], $actual['state'], $actual['updated_by']]);
  $q = $db->prepare('SELECT id FROM vaak_company_data_history WHERE company_id = ? ORDER BY id DESC LIMIT 1 OFFSET 149');
  $q->execute([$empresa]);
  $corte = $q->fetchColumn();
  if ($corte) $db->prepare('DELETE FROM vaak_company_data_history WHERE company_id = ? AND id < ?')->execute([$empresa, $corte]);
  $db->prepare('UPDATE vaak_company_data SET state = ?, revision = ?, updated_at = UTC_TIMESTAMP(3), updated_by = ? WHERE company_id = ?')->execute([$texto, $base + 1, $miembro['userId'], $empresa]);
  $db->commit();
  if ($vistaCorregida !== null) { vaak_json_con_estado(['ok' => true, 'revision' => $base + 1, 'corrected' => true], $vistaCorregida); return; }
  vaak_json(['ok' => true, 'revision' => $base + 1]);
}

// PUT /api/data/assets — guarda una imagen; su id es el SHA-256 del archivo.
function ruta_imagen_guardar(): void {
  vaak_exigir_escritura(['ok' => false, 'error' => 'forbidden']);
  $miembro = vaak_miembro();
  if (!$miembro) vaak_fallar(['ok' => false, 'error' => 'unauthorized'], 401);
  if ($miembro['role'] === 'client') vaak_fallar(['ok' => false, 'error' => 'forbidden'], 403);
  $b = vaak_cuerpo_json() ?? [];
  $id = (string)($b['id'] ?? '');
  if (!preg_match('/^[0-9a-f]{64}$/', $id) || !preg_match('#^data:(image/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$#', (string)($b['dataUrl'] ?? ''), $m)) {
    vaak_fallar(['ok' => false, 'error' => 'invalid_asset'], 400);
  }
  $bytes = base64_decode($m[2], true);
  if ($bytes === false || $bytes === '' || strlen($bytes) > 3200000) vaak_fallar(['ok' => false, 'error' => 'too_large'], 413);
  if (hash('sha256', $bytes) !== $id) vaak_fallar(['ok' => false, 'error' => 'hash_mismatch'], 400);
  vaak_db()->prepare('INSERT IGNORE INTO vaak_company_assets (company_id, id, mime, data, byte_size, created_by) VALUES (?, ?, ?, ?, ?, ?)')
    ->execute([$miembro['companyId'], $id, $m[1], $bytes, strlen($bytes), $miembro['userId']]);
  vaak_json(['ok' => true, 'url' => '/api/data/assets/' . $id]);
}

// GET /api/data/assets/{id}
function ruta_imagen_leer(string $id): void {
  if (!preg_match('/^[0-9a-f]{64}$/', $id)) vaak_fallar(['ok' => false], 404);
  $miembro = vaak_miembro();
  if (!$miembro) vaak_fallar(['ok' => false], 401);
  $q = vaak_db()->prepare('SELECT mime, data FROM vaak_company_assets WHERE company_id = ? AND id = ?');
  $q->execute([$miembro['companyId'], $id]);
  $f = $q->fetch();
  if (!$f) vaak_fallar(['ok' => false], 404);
  http_response_code(200);
  header('Content-Type: ' . $f['mime']);
  header('Cache-Control: private, max-age=31536000, immutable');
  header('Content-Length: ' . strlen($f['data']));
  echo $f['data'];
}

// ======================= REGISTRO DE ACCESOS DE CLIENTES =======================
// Se guarda en la base del hosting al iniciar sesion un cliente, con el nombre,
// cargo y proyectos que tenia en ese momento (si luego cambian, el registro no).

function vaak_registrar_acceso_cliente(string $userId, array $membresia): void {
  $db = vaak_db();
  $q = $db->prepare('SELECT display_name, login_email, position FROM vaak_profiles WHERE id = ?');
  $q->execute([$userId]);
  $p = $q->fetch() ?: [];
  $q = $db->prepare('SELECT state FROM vaak_company_data WHERE company_id = ?');
  $q->execute([$membresia['company_id']]);
  $estado = json_decode((string)($q->fetchColumn() ?: 'null'));
  $ids = array_flip(array_map('strval', vaak_json_lista($membresia['local_project_ids'])));
  $nombres = [];
  foreach ((is_object($estado) && is_array($estado->store->projects ?? null)) ? $estado->store->projects : [] as $proyecto) {
    if (!is_object($proyecto) || !isset($proyecto->id)) continue;
    if ($membresia['project_scope'] === 'all' || isset($ids[(string)$proyecto->id])) $nombres[] = (string)($proyecto->name ?? '');
  }
  $db->prepare('INSERT INTO vaak_client_access_log (company_id, user_id, name, position, project) VALUES (?, ?, ?, ?, ?)')
    ->execute([$membresia['company_id'], $userId, (string)($p['display_name'] ?? $p['login_email'] ?? ''), (string)($p['position'] ?? ''), implode(', ', array_filter($nombres))]);
}

// GET /api/admin/access-log — administradores y trabajadores (la seccion se
// muestra segun los permisos de cada uno). Del mas antiguo al mas reciente.
function ruta_accesos_listar(): void {
  $miembro = vaak_miembro();
  if (!$miembro) vaak_fallar(['ok' => false, 'error' => 'unauthorized'], 401);
  if ($miembro['role'] === 'client') vaak_fallar(['ok' => false, 'error' => 'forbidden'], 403);
  $q = vaak_db()->prepare('SELECT name, position, project, created_at FROM vaak_client_access_log WHERE company_id = ? ORDER BY id DESC LIMIT 5000');
  $q->execute([$miembro['companyId']]);
  $filas = array_reverse($q->fetchAll());
  // Un trabajador solo ve los ingresos de clientes de sus proyectos.
  $permitidos = vaak_proyectos_permitidos($miembro);
  if ($permitidos !== null) {
    $q = vaak_db()->prepare('SELECT state FROM vaak_company_data WHERE company_id = ?');
    $q->execute([$miembro['companyId']]);
    $estado = json_decode((string)($q->fetchColumn() ?: 'null'));
    $nombres = [];
    foreach (vaak_lista(is_object($estado) ? ($estado->store->projects ?? null) : null) as $p) {
      if (vaak_en_alcance($permitidos, vaak_id_de($p)) && is_string($p->name ?? null) && $p->name !== '') $nombres[] = $p->name;
    }
    $filas = array_values(array_filter($filas, function ($f) use ($nombres) {
      $suyos = array_map('trim', explode(',', (string)$f['project']));
      return (bool)array_intersect($suyos, $nombres);
    }));
  }
  vaak_json(['ok' => true, 'entries' => array_map(fn($f) => [
    'name' => $f['name'], 'position' => $f['position'], 'project' => $f['project'], 'date' => vaak_iso($f['created_at']),
  ], $filas)]);
}

// DELETE /api/admin/access-log — vacia el registro. Solo administradores.
function ruta_accesos_vaciar(): void {
  vaak_exigir_escritura();
  $admin = vaak_admin();
  if (!$admin) vaak_fallar(['ok' => false, 'error' => 'forbidden'], 403);
  $q = vaak_db()->prepare('DELETE FROM vaak_client_access_log WHERE company_id = ?');
  $q->execute([$admin['companyId']]);
  vaak_db()->prepare("INSERT INTO vaak_audit_events (company_id, actor_user_id, action, resource_type, resource_id) VALUES (?, ?, 'access_log.cleared', 'access_log', NULL)")->execute([$admin['companyId'], $admin['userId']]);
  vaak_json(['ok' => true]);
}

// ======================= DATOS DE DEMOSTRACION =======================
// Hasta el 21-sep-2026 el primer ingreso de un administrador publicaba los datos de ejemplo del
// prototipo (Hotel Costa Azul, Logistics Center, PO-2026-001...). Se reconocen por sus ids fijos:
// los registros reales llevan ids generados (p-1790..., o-...).
const VAAK_DEMO = [
  'projects' => ['p1', 'p2'],
  'orders' => ['o1', 'o2'],
  'suppliers' => ['s-own', 's-foreign', 's-mixed'],
  'specs' => ['sp-own', 'sp-foreign', 'sp-bath', 'sp-kitchen', 'sp-land', 'sp-furn'],
  'tasks' => ['t-own', 't-foreign'],
];

// Devuelve el documento sin los datos de demostración y el resumen de lo que se quita.
function vaak_sin_demo(object $estado): array {
  $s = is_object($estado->store ?? null) ? clone $estado->store : new stdClass();
  $demoP = array_flip(VAAK_DEMO['projects']);
  $resumen = ['projects' => [], 'orders' => [], 'suppliers' => [], 'specs' => [], 'tasks' => [], 'invoices' => 0, 'realesDentro' => []];
  $quitar = function (string $coleccion, callable $esDemo) use ($s, &$resumen) {
    $queda = [];
    foreach (vaak_lista($s->{$coleccion} ?? null) as $x) {
      if ($esDemo($x)) { $resumen[$coleccion][] = is_object($x) ? (string)($x->number ?? $x->name ?? $x->title ?? $x->id ?? '') : ''; continue; }
      $queda[] = $x;
    }
    $s->{$coleccion} = $queda;
  };
  $enDemo = fn($x) => is_object($x) && isset($x->projectId) && is_string($x->projectId) && isset($demoP[$x->projectId]);
  foreach (vaak_lista($s->projects ?? null) as $p) {
    if (vaak_id_de($p) !== null && isset($demoP[vaak_id_de($p)])) $resumen['invoices'] += count(vaak_lista($p->invoices ?? null));
  }
  // Registros creados a mano dentro de un proyecto de demostración: se avisan antes de quitarlos.
  foreach (['orders', 'specs'] as $c) {
    foreach (vaak_lista($s->{$c} ?? null) as $x) {
      if ($enDemo($x) && !in_array(vaak_id_de($x), VAAK_DEMO[$c], true)) $resumen['realesDentro'][] = (string)($x->number ?? $x->name ?? $x->id ?? '');
    }
  }
  $quitar('projects', fn($p) => vaak_id_de($p) !== null && isset($demoP[vaak_id_de($p)]));
  foreach (['orders', 'specs', 'suppliers', 'tasks'] as $c) {
    $ids = array_flip(VAAK_DEMO[$c]);
    $quitar($c, fn($x) => (vaak_id_de($x) !== null && isset($ids[vaak_id_de($x)])) || ($c !== 'suppliers' && $enDemo($x)));
  }
  $demoS = array_flip(VAAK_DEMO['suppliers']);
  $s->projectCompanies = array_values(array_filter(vaak_lista($s->projectCompanies ?? null), fn($l) => !$enDemo($l)));
  $s->supplierProjectLinks = array_values(array_filter(vaak_lista($s->supplierProjectLinks ?? null), fn($l) => !$enDemo($l) && !(is_object($l) && isset($demoS[(string)($l->supplierId ?? '')]))));
  $extras = is_object($estado->extras ?? null) ? clone $estado->extras : new stdClass();
  $borradores = vaak_extra($extras, 'vaak-oc-drafts');
  if (is_array($borradores)) $extras->{'vaak-oc-drafts'} = vaak_texto_extra(array_values(array_filter($borradores, fn($d) => !$enDemo($d))));
  $total = count($resumen['projects']) + count($resumen['orders']) + count($resumen['suppliers']) + count($resumen['specs']) + count($resumen['tasks']);
  return [(object)['version' => $estado->version ?? 1, 'store' => $s, 'extras' => $extras], $resumen, $total];
}

// POST /api/admin/demo-cleanup  {confirm:false} = solo muestra lo que se quitaría; {confirm:true} lo quita.
// La versión anterior queda en el historial (vaak_company_data_history), así que se puede recuperar.
function ruta_demo_limpiar(): void {
  vaak_exigir_escritura();
  $admin = vaak_admin();
  if (!$admin) vaak_fallar(['ok' => false, 'error' => 'forbidden'], 403);
  $b = vaak_cuerpo_json() ?? [];
  $db = vaak_db();
  $db->beginTransaction();
  $q = $db->prepare('SELECT state, revision, updated_by FROM vaak_company_data WHERE company_id = ? FOR UPDATE');
  $q->execute([$admin['companyId']]);
  $fila = $q->fetch();
  $estado = $fila ? json_decode($fila['state']) : null;
  if (!is_object($estado)) { $db->rollBack(); vaak_json(['ok' => true, 'total' => 0, 'summary' => null]); return; }
  [$limpio, $resumen, $total] = vaak_sin_demo($estado);
  if (($b['confirm'] ?? false) !== true || $total === 0) { $db->rollBack(); vaak_json(['ok' => true, 'total' => $total, 'summary' => $resumen]); return; }
  $db->prepare('INSERT INTO vaak_company_data_history (company_id, revision, state, updated_by) VALUES (?, ?, ?, ?)')->execute([$admin['companyId'], $fila['revision'], $fila['state'], $fila['updated_by']]);
  $nueva = (int)$fila['revision'] + 1;
  $db->prepare('UPDATE vaak_company_data SET state = ?, revision = ?, updated_at = UTC_TIMESTAMP(3), updated_by = ? WHERE company_id = ?')
    ->execute([json_encode($limpio, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $nueva, $admin['userId'], $admin['companyId']]);
  $db->prepare("INSERT INTO vaak_audit_events (company_id, actor_user_id, action, resource_type, resource_id) VALUES (?, ?, 'demo.removed', 'company_data', NULL)")->execute([$admin['companyId'], $admin['userId']]);
  $db->commit();
  vaak_json(['ok' => true, 'removed' => true, 'total' => $total, 'summary' => $resumen, 'revision' => $nueva]);
}

// GET /api/health
function ruta_salud(): void {
  try {
    vaak_db()->query('SELECT 1');
    vaak_json(['ok' => true, 'service' => 'vaak-' . (vaak_config()['entorno'] ?? 'php'), 'releaseId' => (string)(vaak_config()['release_id'] ?? 'local')]);
  } catch (Throwable $e) {
    vaak_json(['ok' => false, 'error' => 'environment_not_configured'], 503);
  }
}
