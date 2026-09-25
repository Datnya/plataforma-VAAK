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
  // Usuario inexistente y contraseña incorrecta dan la misma respuesta (y tardan lo mismo): así nadie
  // puede averiguar qué nombres de usuario existen. Si está desactivado solo se dice con la clave correcta.
  $existe = $perfil && $perfil['login_email'];
  $claveOk = password_verify($clave, $existe ? $perfil['password_hash'] : '$2y$10$lJoGzsZI2ilhkJW.UqtjRuEW4xxyV4GLc6wMeIWQyiRFjSHKnhSIS');
  if (!$existe || !$claveOk) {
    $espera = $registrarFallo();
    if ($espera) $falla('too_many_attempts', 429, ['retryAfterSeconds' => $espera]);
    $falla('invalid_credentials', 401);
  }
  if ((int)$perfil['active'] === 0) $falla('user_inactive', 403);
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

// 24-sep-2026: el documento de la empresa puede pesar hasta 12 MB (antes 4 MB, y al pasarse el
// guardado se rechazaba sin que el usuario se enterara). El navegador puede mandarlo comprimido
// (cabecera x-vaak-gzip), asi que por la red viaja unas diez veces mas liviano.
const VAAK_MAX_ESTADO = 8000000;
const VAAK_MAX_ESTADO_COMPRIMIDO = 3000000;

function vaak_cuerpo_estado(): string {
  $crudo = vaak_cuerpo_crudo();
  if (strtolower(vaak_cabecera("x-vaak-gzip")) !== "1") return $crudo;
  if (strlen($crudo) > VAAK_MAX_ESTADO_COMPRIMIDO) vaak_fallar(["ok" => false, "error" => "too_large"], 413);
  if (!function_exists("gzdecode")) vaak_fallar(["ok" => false, "error" => "gzip_not_supported"], 415);
  $texto = @gzdecode(base64_decode($crudo, true) ?: "");
  if ($texto === false) vaak_fallar(["ok" => false, "error" => "invalid_json"], 400);
  return $texto;
}

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
  // Solo órdenes aprobadas (no borradores, pendientes ni anuladas) y solo los requerimientos de pago
  // de esas órdenes (decisión de Datnya, 22-sep-2026).
  $ordenes = array_values(array_filter($lista($store->orders ?? []), fn($o) => $delProyecto($o) && empty($o->isDraft) && strtolower((string)($o->status ?? 'approved')) === 'approved'));
  $visibles = [];
  foreach ($ordenes as $o) { if (isset($o->number)) $visibles['n:' . $o->number] = true; if (isset($o->id)) $visibles['i:' . $o->id] = true; }
  $proyectos = [];
  foreach ($lista($store->projects ?? []) as $p) {
    if (!is_object($p) || !isset($p->id) || !(is_string($p->id) || is_int($p->id)) || !isset($permitidos[$p->id])) continue;
    $p = clone $p;
    $p->invoices = array_values(array_filter($lista($p->invoices ?? null), fn($r) => is_object($r) && (isset($visibles['n:' . ($r->poNumber ?? '')]) || isset($visibles['i:' . ($r->orderId ?? '')]))));
    $proyectos[] = $p;
  }
  return (object)[
    'version' => $estado->version ?? null,
    'store' => (object)[
      'projects' => $proyectos,
      'orders' => $ordenes,
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
  foreach (['vaak-custom-oc-rubros', 'vaak-custom-rubros', 'vaak-removed-spec-rubros', 'vaak-removed-oc-rubros'] as $clave) {
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

// ================= REGISTROS EN FILAS (etapa 1 de la migracion, 25-sep-2026) =================
// Cada spec, orden de compra y requerimiento de pago vive en su propia fila de
// vaak_company_records; el documento de la empresa se queda con lo demas (proyectos, proveedores,
// usuarios, catalogos, objetivos). Ver docs/migracion/PLAN-MIGRACION-GUARDADO.md.
//
// Las pantallas NO cambian: GET /api/data devuelve el mismo estado de siempre, armado con el
// documento y sus filas, en el mismo orden (por eso cada fila guarda su posicion original).
// Si la tabla todavia no esta importada, todo sigue funcionando como antes.

function vaak_registros_hay_tabla(): bool {
  static $hay = null;
  if ($hay !== null) return $hay;
  try { vaak_db()->query('SELECT 1 FROM vaak_company_records LIMIT 1'); $hay = true; }
  catch (Throwable $e) { $hay = false; }
  return $hay;
}

// Saca del estado los registros. Devuelve las filas; el estado queda con las listas vacias.
// OJO: modifica el objeto recibido (hay que clonarlo antes si se necesita el original).
function vaak_registros_separar(object $estado): array {
  $filas = [];
  $store = $estado->store ?? null;
  if (!is_object($store)) return $filas;
  // Devuelve lo que NO pudo pasar a una fila (sin id, repetido o que no es un registro). Eso se
  // queda en el documento: nada se tira, aunque venga con una forma rara.
  $tomar = function (array $lista, string $kind, string $proyecto = '') use (&$filas) {
    $pos = 0;
    $quedan = [];
    foreach ($lista as $registro) {
      if (!is_object($registro)) { $quedan[] = $registro; continue; }
      $id = (string)($registro->id ?? '');
      if ($id === '' || isset($filas[$kind . "\0" . $id])) { $quedan[] = $registro; continue; }
      $datos = json_encode($registro, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
      $proyectoId = $proyecto !== '' ? $proyecto : (string)($registro->projectId ?? '');
      $posicion = $pos++;
      $filas[$kind . "\0" . $id] = [
        'kind' => $kind, 'id' => $id, 'project_id' => $proyectoId,
        'created_at' => (string)($registro->createdAt ?? ''), 'pos' => $posicion,
        'hash' => md5($posicion . '|' . $proyectoId . '|' . $datos), 'data' => $datos,
      ];
    }
    return $quedan;
  };
  if (is_array($store->specs ?? null)) $store->specs = $tomar($store->specs, 'spec');
  if (is_array($store->orders ?? null)) $store->orders = $tomar($store->orders, 'order');
  foreach (vaak_lista($store->projects ?? null) as $proyecto) {
    if (!is_object($proyecto) || !is_array($proyecto->invoices ?? null)) continue;
    $proyecto->invoices = $tomar($proyecto->invoices, 'invoice', (string)($proyecto->id ?? ''));
  }
  return $filas;
}

// Vuelve a armar el estado completo: el documento con sus registros, en su orden.
function vaak_registros_unir(object $estado, array $filas): object {
  $store = $estado->store ?? null;
  if (!is_object($store) || !$filas) return $estado;
  $specs = []; $ordenes = []; $porProyecto = [];
  foreach ($filas as $fila) {
    $registro = json_decode($fila['data']);
    if (!is_object($registro)) continue;
    if ($fila['kind'] === 'spec') $specs[] = $registro;
    elseif ($fila['kind'] === 'order') $ordenes[] = $registro;
    else $porProyecto[(string)$fila['project_id']][] = $registro;
  }
  if ($specs) $store->specs = array_merge(is_array($store->specs ?? null) ? $store->specs : [], $specs);
  if ($ordenes) $store->orders = array_merge(is_array($store->orders ?? null) ? $store->orders : [], $ordenes);
  foreach (vaak_lista($store->projects ?? null) as $proyecto) {
    if (!is_object($proyecto)) continue;
    $id = (string)($proyecto->id ?? '');
    if (!isset($porProyecto[$id])) continue;
    $proyecto->invoices = array_merge(is_array($proyecto->invoices ?? null) ? $proyecto->invoices : [], $porProyecto[$id]);
  }
  return $estado;
}

function vaak_registros_leer(string $empresa): array {
  if (!vaak_registros_hay_tabla()) return [];
  $q = vaak_db()->prepare('SELECT kind, id, project_id, data FROM vaak_company_records WHERE company_id = ? ORDER BY kind, pos, id');
  $q->execute([$empresa]);
  return $q->fetchAll();
}

// Deja la tabla con exactamente estas filas: escribe las nuevas o cambiadas y borra las que ya no
// estan. Se llama SIEMPRE dentro de la misma transaccion que guarda el documento.
function vaak_registros_guardar(string $empresa, array $filas): void {
  if (!vaak_registros_hay_tabla()) return;
  $db = vaak_db();
  $q = $db->prepare('SELECT kind, id, hash FROM vaak_company_records WHERE company_id = ?');
  $q->execute([$empresa]);
  $actuales = [];
  foreach ($q->fetchAll() as $f) $actuales[$f['kind'] . "\0" . $f['id']] = $f['hash'];
  $guardar = $db->prepare('INSERT INTO vaak_company_records (company_id, kind, id, project_id, created_at, pos, hash, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    . ' ON DUPLICATE KEY UPDATE project_id = VALUES(project_id), created_at = VALUES(created_at), pos = VALUES(pos), hash = VALUES(hash), data = VALUES(data)');
  foreach ($filas as $clave => $fila) {
    if (($actuales[$clave] ?? null) === $fila['hash']) continue;
    $guardar->execute([$empresa, $fila['kind'], $fila['id'], $fila['project_id'], $fila['created_at'], $fila['pos'], $fila['hash'], $fila['data']]);
  }
  $borrar = null;
  foreach (array_keys($actuales) as $clave) {
    if (isset($filas[$clave])) continue;
    [$kind, $id] = explode("\0", $clave, 2);
    $borrar = $borrar ?: $db->prepare('DELETE FROM vaak_company_records WHERE company_id = ? AND kind = ? AND id = ?');
    $borrar->execute([$empresa, $kind, $id]);
  }
}

// El estado completo tal como lo conoce la plataforma: documento + registros.
function vaak_estado_completo(string $empresa, ?string $documento): ?object {
  $estado = json_decode((string)($documento ?? 'null'));
  if (!is_object($estado)) return null;
  return vaak_registros_unir($estado, vaak_registros_leer($empresa));
}

// POST /api/admin/migrar-registros — pasa los registros del documento a sus filas.
// Solo administrador. Copia, verifica y recien entonces vacia las listas del documento; si la
// comprobacion falla, la transaccion se deshace y NO cambia nada. Se puede repetir sin riesgo.
function ruta_registros_migrar(): void {
  vaak_exigir_escritura();
  $admin = vaak_admin();
  if (!$admin) vaak_fallar(['ok' => false, 'error' => 'forbidden'], 403);
  if (!vaak_registros_hay_tabla()) vaak_fallar(['ok' => false, 'error' => 'sin_tabla'], 503);
  $empresa = $admin['companyId'];
  $db = vaak_db();
  $db->beginTransaction();
  $q = $db->prepare('SELECT state, revision FROM vaak_company_data WHERE company_id = ? FOR UPDATE');
  $q->execute([$empresa]);
  $fila = $q->fetch();
  if (!$fila) { $db->rollBack(); vaak_json(['ok' => true, 'sinDatos' => true]); return; }
  // Estado completo de hoy (documento + lo que ya estuviera en filas): es el patron a respetar.
  $antes = vaak_estado_completo($empresa, $fila['state']);
  if (!$antes) { $db->rollBack(); vaak_fallar(['ok' => false, 'error' => 'estado_invalido'], 500); }
  $textoAntes = json_encode($antes, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  // Cuantos registros hay ANTES, para detectar ids repetidos (dos registros con el mismo id se
  // convertirian en uno solo). La comprobacion final lo atraparia igual, pero asi se dice por que.
  $cuantos = fn($lista) => count(vaak_lista($lista));
  $totalAntes = $cuantos($antes->store->specs ?? null) + $cuantos($antes->store->orders ?? null);
  foreach (vaak_lista($antes->store->projects ?? null) as $p) $totalAntes += $cuantos(is_object($p) ? ($p->invoices ?? null) : null);
  $filas = vaak_registros_separar($antes); // $antes queda sin registros: es el documento nuevo
  $conteo = ['spec' => 0, 'order' => 0, 'invoice' => 0];
  foreach ($filas as $f) $conteo[$f['kind']]++;
  if (count($filas) !== $totalAntes) {
    $db->rollBack();
    vaak_fallar(['ok' => false, 'error' => 'ids_repetidos', 'detalle' => 'hay registros con el mismo id; no se cambio nada', 'enDocumento' => $totalAntes, 'enFilas' => count($filas)], 409);
  }
  vaak_registros_guardar($empresa, $filas);
  $documento = json_encode($antes, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  $db->prepare('UPDATE vaak_company_data SET state = ?, updated_at = UTC_TIMESTAMP(3) WHERE company_id = ?')->execute([$documento, $empresa]);
  // Comprobacion: lo que la plataforma devolvera tiene que ser IDENTICO a lo que habia.
  $despues = vaak_estado_completo($empresa, $documento);
  $textoDespues = $despues ? json_encode($despues, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : '';
  if ($textoDespues !== $textoAntes) {
    $db->rollBack();
    vaak_fallar(['ok' => false, 'error' => 'verificacion_fallida', 'detalle' => 'el estado reconstruido no coincide; no se cambio nada'], 500);
  }
  $db->prepare("INSERT INTO vaak_audit_events (company_id, actor_user_id, action, resource_type, resource_id) VALUES (?, ?, 'records.migrated', 'company_data', NULL)")->execute([$empresa, $admin['userId']]);
  $db->commit();
  vaak_json(['ok' => true, 'verificado' => true, 'registros' => $conteo, 'documento' => strlen($documento), 'estadoCompleto' => strlen($textoAntes), 'revision' => (int)$fila['revision']]);
}

// POST /api/admin/revertir-registros — la vuelta atras de la migracion.
// Devuelve los registros al documento y vacia la tabla, con la misma verificacion. Sirve para
// volver a la version anterior de la plataforma sin perder nada. Solo administrador.
function ruta_registros_revertir(): void {
  vaak_exigir_escritura();
  $admin = vaak_admin();
  if (!$admin) vaak_fallar(['ok' => false, 'error' => 'forbidden'], 403);
  if (!vaak_registros_hay_tabla()) vaak_fallar(['ok' => false, 'error' => 'sin_tabla'], 503);
  $empresa = $admin['companyId'];
  $db = vaak_db();
  $db->beginTransaction();
  $q = $db->prepare('SELECT state, revision FROM vaak_company_data WHERE company_id = ? FOR UPDATE');
  $q->execute([$empresa]);
  $fila = $q->fetch();
  if (!$fila) { $db->rollBack(); vaak_json(['ok' => true, 'sinDatos' => true]); return; }
  $completo = vaak_estado_completo($empresa, $fila['state']);
  if (!$completo) { $db->rollBack(); vaak_fallar(['ok' => false, 'error' => 'estado_invalido'], 500); }
  $texto = json_encode($completo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  if (strlen($texto) > VAAK_MAX_ESTADO) {
    $db->rollBack();
    vaak_fallar(['ok' => false, 'error' => 'no_cabe', 'detalle' => 'ya hay mas datos de los que entran en el documento unico', 'bytes' => strlen($texto)], 409);
  }
  $db->prepare('UPDATE vaak_company_data SET state = ?, updated_at = UTC_TIMESTAMP(3) WHERE company_id = ?')->execute([$texto, $empresa]);
  $db->prepare('DELETE FROM vaak_company_records WHERE company_id = ?')->execute([$empresa]);
  // Comprobacion: el documento solo tiene que devolver exactamente lo mismo.
  $q = $db->prepare('SELECT state FROM vaak_company_data WHERE company_id = ?');
  $q->execute([$empresa]);
  $despues = vaak_estado_completo($empresa, (string)$q->fetchColumn());
  if (!$despues || json_encode($despues, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !== $texto) {
    $db->rollBack();
    vaak_fallar(['ok' => false, 'error' => 'verificacion_fallida', 'detalle' => 'no se cambio nada'], 500);
  }
  $db->prepare("INSERT INTO vaak_audit_events (company_id, actor_user_id, action, resource_type, resource_id) VALUES (?, ?, 'records.reverted', 'company_data', NULL)")->execute([$empresa, $admin['userId']]);
  $db->commit();
  vaak_json(['ok' => true, 'verificado' => true, 'bytes' => strlen($texto), 'revision' => (int)$fila['revision']]);
}

// GET /api/admin/registros — cuantos registros hay en filas y cuantos quedan en el documento.
function ruta_registros_contar(): void {
  $miembro = vaak_miembro();
  if (!$miembro || $miembro['role'] === 'client') vaak_fallar(['ok' => false, 'error' => 'forbidden'], 403);
  $empresa = $miembro['companyId'];
  $filas = ['spec' => 0, 'order' => 0, 'invoice' => 0];
  if (vaak_registros_hay_tabla()) {
    $q = vaak_db()->prepare('SELECT kind, COUNT(*) AS total FROM vaak_company_records WHERE company_id = ? GROUP BY kind');
    $q->execute([$empresa]);
    foreach ($q->fetchAll() as $f) $filas[(string)$f['kind']] = (int)$f['total'];
  }
  $q = vaak_db()->prepare('SELECT state FROM vaak_company_data WHERE company_id = ?');
  $q->execute([$empresa]);
  $estado = json_decode((string)($q->fetchColumn() ?: 'null'));
  $enDocumento = ['spec' => 0, 'order' => 0, 'invoice' => 0];
  if (is_object($estado) && is_object($estado->store ?? null)) {
    $enDocumento['spec'] = count(vaak_lista($estado->store->specs ?? null));
    $enDocumento['order'] = count(vaak_lista($estado->store->orders ?? null));
    foreach (vaak_lista($estado->store->projects ?? null) as $p) $enDocumento['invoice'] += count(vaak_lista(is_object($p) ? ($p->invoices ?? null) : null));
  }
  vaak_json(['ok' => true, 'tabla' => vaak_registros_hay_tabla(), 'enFilas' => $filas, 'enDocumento' => $enDocumento]);
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
  // El estado que ve la plataforma es el documento con sus registros (etapa 1 de la migracion).
  $completo = vaak_estado_completo($miembro['companyId'], $fila['state']);
  if (!$completo) { vaak_json_con_estado($cuerpo, $fila['state']); return; }
  if ($rol === 'client') {
    $filtrado = vaak_estado_para_miembro($completo, $miembro);
    vaak_json_con_estado($cuerpo, json_encode($filtrado, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    return;
  }
  if ($rol !== 'admin') {
    $filtrado = vaak_estado_para_trabajador($completo, $miembro, vaak_id_app($miembro['userId']));
    vaak_json_con_estado($cuerpo, json_encode($filtrado, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    return;
  }
  vaak_json_con_estado($cuerpo, json_encode($completo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

// PUT /api/data  — solo se guarda sobre la revision que el navegador conoce.
function ruta_datos_guardar(): void {
  vaak_exigir_escritura(['ok' => false, 'error' => 'forbidden']);
  $miembro = vaak_miembro();
  if (!$miembro) vaak_fallar(['ok' => false, 'error' => 'unauthorized'], 401);
  if ($miembro['role'] === 'client') vaak_fallar(['ok' => false, 'error' => 'forbidden'], 403);
  $crudo = vaak_cuerpo_estado();
  if (strlen($crudo) > VAAK_MAX_ESTADO) vaak_fallar(['ok' => false, 'error' => 'too_large'], 413);
  // Procesar el documento necesita unas diez veces su tamano en memoria: si no alcanza, se dice.
  $memoria = vaak_memoria_disponible();
  if ($memoria > 0 && strlen($crudo) * 10 > $memoria) vaak_fallar(['ok' => false, 'error' => 'too_large'], 413);
  $b = json_decode($crudo);
  if (!is_object($b)) vaak_fallar(['ok' => false, 'error' => 'invalid_json'], 400);
  $base = $b->baseRevision ?? null;
  $estado = $b->state ?? null;
  if (!is_int($base) || $base < 0 || !is_object($estado) || !is_object($estado->store ?? null) || !is_array($estado->store->projects ?? null)) {
    vaak_fallar(['ok' => false, 'error' => 'invalid_state'], 400);
  }
  // Los datos de demostración (ids fijos p1, o1, t-own…) nunca se guardan: un navegador con una copia
  // vieja podía volver a subirlos después de quitarlos (22-sep-2026). Se le devuelve la versión limpia.
  $demoQuitada = null;
  // Solo se revisa si el texto menciona algun id de demostracion: clonar el documento entero en
  // cada guardado gastaba memoria de mas (24-sep-2026).
  $hayPista = false;
  foreach (array_merge(VAAK_DEMO['projects'], VAAK_DEMO['orders'], VAAK_DEMO['suppliers'], VAAK_DEMO['specs'], VAAK_DEMO['tasks']) as $idDemo) {
    if (strpos($crudo, '"' . $idDemo . '"') !== false) { $hayPista = true; break; }
  }
  if ($hayPista) {
    [$sinDemo, , $demoTotal] = vaak_sin_demo($estado);
    if ($demoTotal > 0) { $estado = $sinDemo; $demoQuitada = true; }
  }
  $texto = json_encode($estado, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  $db = vaak_db();
  $empresa = $miembro['companyId'];
  $conflicto = function () use ($db, $empresa): never {
    $q = $db->prepare('SELECT state, revision FROM vaak_company_data WHERE company_id = ?');
    $q->execute([$empresa]);
    $f = $q->fetch();
    // Se devuelve el estado COMPLETO (documento + registros): si se devolviera solo el documento,
    // el navegador adoptaria una copia sin specs ni ordenes y las borraria al guardar.
    $completo = $f ? vaak_estado_completo($empresa, $f['state']) : null;
    $texto = $completo ? json_encode($completo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : ($f ? $f['state'] : null);
    vaak_json_con_estado(['ok' => false, 'error' => 'conflict', 'revision' => $f ? (int)$f['revision'] : 0], $texto, 409);
    throw new VaakYaRespondido();
  };

  if ($base === 0) {
    // Solo un administrador publica el espacio de trabajo inicial.
    if ($miembro['role'] !== 'admin') $conflicto();
    try {
      $db->beginTransaction();
      // Sin la tabla nueva, el documento sigue llevando los registros, igual que antes.
      $primeras = vaak_registros_hay_tabla() ? vaak_registros_separar($estado) : [];
      $documento = $primeras ? json_encode($estado, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : $texto;
      $db->prepare('INSERT INTO vaak_company_data (company_id, state, revision, updated_at, updated_by) VALUES (?, ?, 1, UTC_TIMESTAMP(3), ?)')->execute([$empresa, $documento, $miembro['userId']]);
      vaak_registros_guardar($empresa, $primeras);
      $db->commit();
    } catch (mysqli_sql_exception $e) {
      if ($db->inTransaction()) $db->rollBack();
      if (vaak_bd_errno($e) === 1062) $conflicto();
      vaak_fallar(['ok' => false, 'error' => 'service_unavailable'], 503);
    }
    if ($demoQuitada) { vaak_json_con_estado(['ok' => true, 'revision' => 1, 'corrected' => true], $texto); return; }
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
  $vistaCorregida = $demoQuitada ? $texto : null;
  if ($miembro['role'] !== 'admin') {
    $miId = vaak_id_app($miembro['userId']);
    // El estado guardado se arma con sus registros: si se combinara solo el documento, el
    // trabajador borraria todos los specs y ordenes que no vienen en su envio.
    $combinado = vaak_combinar_trabajador(vaak_estado_completo($empresa, $actual['state']), $estado, $miembro, $miId);
    $combinado = vaak_sin_demo($combinado)[0];
    $texto = json_encode($combinado, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $vista = json_encode(vaak_estado_para_trabajador($combinado, $miembro, $miId), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $vistaCorregida = ($demoQuitada || $vista !== json_encode(vaak_estado_para_trabajador($estado, $miembro, $miId), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) ? $vista : null;
  }
  // Copia de la version anterior; se conservan las ultimas 150. Mientras el estado completo quepa
  // en el tope, la copia guarda TODO (documento y registros), igual que antes de la migracion: es
  // la red de seguridad que ya existia. Cuando no quepa, guarda el documento solo.
  $anterior = $actual['state'];
  if (vaak_registros_hay_tabla()) {
    $completoAnterior = vaak_estado_completo($empresa, $actual['state']);
    if ($completoAnterior) {
      $textoAnterior = json_encode($completoAnterior, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
      if (strlen($textoAnterior) <= VAAK_MAX_ESTADO) $anterior = $textoAnterior;
    }
  }
  $db->prepare('INSERT INTO vaak_company_data_history (company_id, revision, state, updated_by) VALUES (?, ?, ?, ?)')->execute([$empresa, $actual['revision'], $anterior, $actual['updated_by']]);
  $q = $db->prepare('SELECT id FROM vaak_company_data_history WHERE company_id = ? ORDER BY id DESC LIMIT 1 OFFSET 149');
  $q->execute([$empresa]);
  $corte = $q->fetchColumn();
  if ($corte) $db->prepare('DELETE FROM vaak_company_data_history WHERE company_id = ? AND id < ?')->execute([$empresa, $corte]);
  // Los registros van a su tabla y el documento se queda con lo demas, todo en esta transaccion.
  // Si la tabla todavia no existe NO se separa nada: el documento sigue llevandolos, como antes.
  $documento = $texto;
  $filasNuevas = [];
  if (vaak_registros_hay_tabla()) {
    $paraGuardar = json_decode($texto);
    if (is_object($paraGuardar)) {
      $filasNuevas = vaak_registros_separar($paraGuardar);
      $documento = json_encode($paraGuardar, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
  }
  $db->prepare('UPDATE vaak_company_data SET state = ?, revision = ?, updated_at = UTC_TIMESTAMP(3), updated_by = ? WHERE company_id = ?')->execute([$documento, $base + 1, $miembro['userId'], $empresa]);
  vaak_registros_guardar($empresa, $filasNuevas);
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
  // Los datos de demostracion tambien pueden estar en las filas de registros (etapa 1).
  $estado = $fila ? vaak_estado_completo($admin['companyId'], $fila['state']) : null;
  if (!is_object($estado)) { $db->rollBack(); vaak_json(['ok' => true, 'total' => 0, 'summary' => null]); return; }
  $textoCompleto = json_encode($estado, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  [$limpio, $resumen, $total] = vaak_sin_demo($estado);
  if (($b['confirm'] ?? false) !== true || $total === 0) { $db->rollBack(); vaak_json(['ok' => true, 'total' => $total, 'summary' => $resumen]); return; }
  $db->prepare('INSERT INTO vaak_company_data_history (company_id, revision, state, updated_by) VALUES (?, ?, ?, ?)')->execute([$admin['companyId'], $fila['revision'], strlen($textoCompleto) <= VAAK_MAX_ESTADO ? $textoCompleto : $fila['state'], $fila['updated_by']]);
  $nueva = (int)$fila['revision'] + 1;
  // Sin la tabla nueva no se separa nada: el documento sigue llevando los registros.
  $filasLimpias = vaak_registros_hay_tabla() ? vaak_registros_separar($limpio) : [];
  $db->prepare('UPDATE vaak_company_data SET state = ?, revision = ?, updated_at = UTC_TIMESTAMP(3), updated_by = ? WHERE company_id = ?')
    ->execute([json_encode($limpio, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $nueva, $admin['userId'], $admin['companyId']]);
  vaak_registros_guardar($admin['companyId'], $filasLimpias);
  $db->prepare("INSERT INTO vaak_audit_events (company_id, actor_user_id, action, resource_type, resource_id) VALUES (?, ?, 'demo.removed', 'company_data', NULL)")->execute([$admin['companyId'], $admin['userId']]);
  $db->commit();
  vaak_json(['ok' => true, 'removed' => true, 'total' => $total, 'summary' => $resumen, 'revision' => $nueva]);
}

// ======================= PANTALLAS INTERNAS =======================
// GET /api/app — el código de todas las pantallas internas (lo arma armar-publicacion.js en
// nucleo/interfaz.js, carpeta que no se sirve). Como en la banca en línea: sin sesión solo se ve el
// inicio de sesión, y copiar la página no permite reproducir el interior de la plataforma.
// No se guarda en la caché del navegador, para que no quede en el equipo al cerrar sesión.
function ruta_interfaz(): void {
  vaak_no_store();
  header('Content-Type: application/javascript; charset=utf-8');
  $miembro = vaak_miembro();
  if (!$miembro) { http_response_code(401); echo "/* Sign in to use the platform. */\n"; return; }
  // Cada rol recibe su propio codigo (24-sep-2026): el cliente NUNCA recibe las pantallas del
  // administrador ni del trabajador, ni siquiera vacias. Las arma armar-publicacion.js.
  $archivo = __DIR__ . '/interfaz.js';
  if (($miembro['role'] ?? '') === 'client' && is_file(__DIR__ . '/interfaz-cliente.js')) {
    $archivo = __DIR__ . '/interfaz-cliente.js';
  }
  if (!is_file($archivo)) { http_response_code(404); echo "/* not found */\n"; return; }
  header('Content-Length: ' . filesize($archivo));
  readfile($archivo);
}

// GET /api/estilos — los estilos de las pantallas internas y de las fichas (OC, requerimiento de
// pago, ficha técnica), también solo con sesión. En público solo queda acceso.css (inicio de sesión).
function ruta_estilos(): void {
  vaak_no_store();
  header('Content-Type: text/css; charset=utf-8');
  if (!vaak_miembro()) { http_response_code(401); echo "/* Sign in to use the platform. */\n"; return; }
  $archivo = __DIR__ . '/estilos.css';
  if (!is_file($archivo)) { http_response_code(404); echo "/* not found */\n"; return; }
  header('Content-Length: ' . filesize($archivo));
  readfile($archivo);
}

// GET /api/health
function ruta_salud(): void {
  try {
    vaak_db()->query('SELECT 1');
    vaak_json(['ok' => true, 'service' => 'vaak-' . (vaak_config()['entorno'] ?? 'php'), 'releaseId' => (string)(vaak_config()['release_id'] ?? 'local'), 'gzip' => function_exists('gzdecode'), 'maxState' => VAAK_MAX_ESTADO, 'memoryLimit' => ini_get('memory_limit')]);
  } catch (Throwable $e) {
    vaak_json(['ok' => false, 'error' => 'environment_not_configured'], 503);
  }
}
