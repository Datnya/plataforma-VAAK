<?php
// Sesiones y usuarios. Reemplaza a Supabase Auth: la cookie lleva un token
// aleatorio y la base guarda solo su hash.
declare(strict_types=1);

function vaak_hash_token(string $token): string {
  return hash('sha256', $token);
}

function vaak_crear_sesion(string $userId): void {
  $token = vaak_base64url(random_bytes(32));
  $vence = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->modify('+' . VAAK_SESSION_DAYS . ' days')->format('Y-m-d H:i:s.v');
  vaak_db()->prepare('INSERT INTO vaak_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    ->execute([vaak_hash_token($token), $userId, $vence]);
  vaak_cookie(VAAK_SESSION_COOKIE, $token, VAAK_SESSION_DAYS * 86400, 'Lax');
}

function vaak_cerrar_sesion(): void {
  $token = (string)($_COOKIE[VAAK_SESSION_COOKIE] ?? '');
  if ($token !== '') vaak_db()->prepare('DELETE FROM vaak_sessions WHERE token_hash = ?')->execute([vaak_hash_token($token)]);
  vaak_cookie(VAAK_SESSION_COOKIE, '', 0, 'Lax');
}

// Id del usuario con sesion valida, o null. La sesion se renueva sola si se usa.
function vaak_usuario_actual(): ?string {
  static $resuelto = false, $id = null;
  if ($resuelto) return $id;
  $resuelto = true;
  $token = (string)($_COOKIE[VAAK_SESSION_COOKIE] ?? '');
  if ($token === '' || strlen($token) > 100) return null;
  $fila = vaak_db()->prepare('SELECT s.user_id, s.last_used_at FROM vaak_sessions s JOIN vaak_profiles p ON p.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP(3) AND p.active = 1');
  $fila->execute([vaak_hash_token($token)]);
  $dato = $fila->fetch();
  if (!$dato) return null;
  // Renueva la vigencia como maximo una vez al dia.
  if (strtotime($dato['last_used_at'] . ' UTC') < time() - 86400) {
    $vence = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->modify('+' . VAAK_SESSION_DAYS . ' days')->format('Y-m-d H:i:s.v');
    vaak_db()->prepare('UPDATE vaak_sessions SET last_used_at = UTC_TIMESTAMP(3), expires_at = ? WHERE token_hash = ?')->execute([$vence, vaak_hash_token($token)]);
    vaak_cookie(VAAK_SESSION_COOKIE, $token, VAAK_SESSION_DAYS * 86400, 'Lax');
  }
  $id = $dato['user_id'];
  return $id;
}

function vaak_rol_app(string $rol): string {
  return $rol === 'admin' ? 'Admin' : ($rol === 'client' ? 'Client' : 'Worker');
}
function vaak_rol_db(string $rol): string {
  return $rol === 'Admin' ? 'admin' : ($rol === 'Client' ? 'client' : 'worker');
}
function vaak_json_lista($valor): array {
  if (is_array($valor)) return $valor;
  $datos = json_decode((string)$valor, true);
  return is_array($datos) ? $datos : [];
}
// Se decodifica como objeto para que {} siga siendo {} al responder.
function vaak_json_objeto($valor) {
  if ($valor === null || $valor === '') return null;
  return json_decode((string)$valor);
}

// Miembro activo de la empresa (cualquier rol). Igual que requireMember().
function vaak_miembro(): ?array {
  $userId = vaak_usuario_actual();
  if (!$userId) return null;
  $q = vaak_db()->prepare("SELECT company_id, role, project_scope, local_project_ids FROM vaak_user_company_memberships WHERE user_id = ? AND status = 'active' ORDER BY created_at LIMIT 1");
  $q->execute([$userId]);
  $m = $q->fetch();
  if (!$m) return null;
  return [
    'userId' => $userId,
    'companyId' => $m['company_id'],
    'role' => $m['role'],
    'projectScope' => $m['project_scope'] ?: null,
    'projectIds' => vaak_json_lista($m['local_project_ids']),
  ];
}

// Administrador activo. Igual que requireRemoteAdmin().
function vaak_admin(): ?array {
  $userId = vaak_usuario_actual();
  if (!$userId) return null;
  $q = vaak_db()->prepare("SELECT company_id FROM vaak_user_company_memberships WHERE user_id = ? AND role = 'admin' AND status = 'active' LIMIT 1");
  $q->execute([$userId]);
  $m = $q->fetch();
  return $m ? ['userId' => $userId, 'companyId' => $m['company_id']] : null;
}

// Directorio de usuarios de la empresa, con el mismo formato que listCompanyUsers().
function vaak_listar_usuarios(string $companyId): array {
  $q = vaak_db()->prepare('SELECT m.user_id, m.role, m.status, m.access, m.project_scope, m.local_project_ids, p.display_name, p.username, p.login_email, p.legacy_id, p.active, p.team, p.position, p.phone, p.avatar_url, p.last_seen_at, p.signed_out_at FROM vaak_user_company_memberships m JOIN vaak_profiles p ON p.id = m.user_id WHERE m.company_id = ? ORDER BY m.created_at');
  $q->execute([$companyId]);
  $salida = [];
  foreach ($q->fetchAll() as $r) {
    $u = [
      'id' => $r['legacy_id'] ?: 'remote-' . $r['user_id'],
      'authId' => $r['user_id'],
      'name' => $r['display_name'],
      'username' => $r['username'],
      'email' => $r['login_email'],
      'role' => vaak_rol_app($r['role']),
      'active' => $r['status'] === 'active' && (int)$r['active'] !== 0,
    ];
    if ($r['role'] !== 'admin') $u['access'] = vaak_json_objeto($r['access']);
    $u['projectScope'] = $r['project_scope'];
    $u['projectIds'] = vaak_json_lista($r['local_project_ids']);
    foreach (['team' => 'team', 'position' => 'position', 'phone' => 'phone', 'avatar_url' => 'profilePhoto'] as $col => $campo) {
      if ($r[$col] !== null && $r[$col] !== '') $u[$campo] = $r[$col];
    }
    $u['lastSeenAt'] = vaak_iso($r['last_seen_at']);
    $u['signedOutAt'] = vaak_iso($r['signed_out_at']);
    $salida[] = $u;
  }
  return $salida;
}

// Nunca dejar a la empresa sin un administrador activo (antes lo hacia un trigger).
function vaak_es_ultimo_admin(string $userId, string $companyId): bool {
  $q = vaak_db()->prepare("SELECT role, status FROM vaak_user_company_memberships WHERE user_id = ? AND company_id = ?");
  $q->execute([$userId, $companyId]);
  $m = $q->fetch();
  if (!$m || $m['role'] !== 'admin' || $m['status'] !== 'active') return false;
  $otros = vaak_db()->prepare("SELECT COUNT(*) FROM vaak_user_company_memberships WHERE company_id = ? AND user_id <> ? AND role = 'admin' AND status = 'active'");
  $otros->execute([$companyId, $userId]);
  return (int)$otros->fetchColumn() === 0;
}
