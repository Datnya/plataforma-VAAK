<?php
// Arranque comun del servidor de VAAK: configuracion, base de datos y
// utilidades para responder. Reemplaza a Next.js + Supabase en el hosting
// del cliente, respondiendo en las mismas rutas y con los mismos formatos.
declare(strict_types=1);

const VAAK_CSRF_COOKIE = 'vaak-csrf';
const VAAK_SESSION_COOKIE = 'vaak-sesion';
const VAAK_SESSION_DAYS = 30;

function vaak_config(): array {
  static $config = null;
  if ($config === null) {
    $ruta = __DIR__ . '/config.php';
    if (!is_file($ruta)) throw new RuntimeException('config_missing');
    $config = require $ruta;
  }
  return $config;
}

function vaak_db(): PDO {
  static $pdo = null;
  if ($pdo === null) {
    $c = vaak_config()['db'];
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $c['host'], (int)($c['port'] ?? 3306), $c['nombre']);
    $pdo = new PDO($dsn, $c['usuario'], $c['clave'], [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $pdo->exec("SET time_zone = '+00:00'");
  }
  return $pdo;
}

// ---------- respuestas ----------
function vaak_no_store(): void {
  header('Cache-Control: no-store, max-age=0');
}

function vaak_json($cuerpo, int $estado = 200, array $cabeceras = []): void {
  http_response_code($estado);
  header('Content-Type: application/json; charset=utf-8');
  vaak_no_store();
  foreach ($cabeceras as $nombre => $valor) header($nombre . ': ' . $valor);
  echo json_encode($cuerpo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

// Error controlado: corta la ejecucion y responde.
final class VaakRespuesta extends Exception {
  public function __construct(public $cuerpo, public int $estado) { parent::__construct('respuesta'); }
}
// La respuesta ya se envio (por ejemplo, un 409 con el documento incluido).
final class VaakYaRespondido extends Exception {}
function vaak_fallar($cuerpo, int $estado): never {
  throw new VaakRespuesta($cuerpo, $estado);
}

// ---------- entrada ----------
function vaak_cuerpo_crudo(): string {
  static $crudo = null;
  if ($crudo === null) $crudo = (string)file_get_contents('php://input');
  return $crudo;
}
function vaak_cuerpo_json(): ?array {
  $datos = json_decode(vaak_cuerpo_crudo(), true);
  return is_array($datos) ? $datos : null;
}
function vaak_cabecera(string $nombre): string {
  $clave = 'HTTP_' . strtoupper(str_replace('-', '_', $nombre));
  if ($nombre === 'content-type') return (string)($_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '');
  return (string)($_SERVER[$clave] ?? '');
}
// El mismo cuerpo, pero con los objetos como objetos (para reenviarlos intactos).
function vaak_cuerpo_objeto() {
  return json_decode(vaak_cuerpo_crudo());
}
function vaak_es_json(): bool {
  return str_starts_with(strtolower(vaak_cabecera('content-type')), 'application/json');
}

// ---------- fechas y ids ----------
// Las fechas se guardan en UTC y se entregan en ISO 8601, igual que Supabase.
function vaak_ahora_db(): string {
  return (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format('Y-m-d H:i:s.v');
}
function vaak_iso(?string $valor): ?string {
  if ($valor === null || $valor === '') return null;
  $fecha = new DateTimeImmutable($valor, new DateTimeZone('UTC'));
  return $fecha->format('Y-m-d\TH:i:s.v\Z');
}
function vaak_uuid(): string {
  $b = random_bytes(16);
  $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
  $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
  return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
}
function vaak_base64url(string $bytes): string {
  return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');
}

// ---------- seguridad ----------
function vaak_hmac(string $valor): string {
  return vaak_base64url(hash_hmac('sha256', $valor, vaak_config()['secreto_hmac'], true));
}

function vaak_es_https(): bool {
  return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || strtolower((string)($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https'
    || (int)($_SERVER['SERVER_PORT'] ?? 0) === 443;
}

function vaak_origen_propio(): string {
  return (vaak_es_https() ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? '');
}

// Solo se aceptan cambios que vienen de la propia plataforma.
function vaak_origen_permitido(): bool {
  $origen = vaak_cabecera('origin');
  if ($origen === '') return false;
  $permitidos = array_filter(array_map('trim', explode(',', (string)(vaak_config()['origenes'] ?? ''))));
  return in_array($origen, $permitidos, true) || $origen === vaak_origen_propio();
}

function vaak_cookie(string $nombre, string $valor, int $segundos, string $samesite): void {
  setcookie($nombre, $valor, [
    'expires' => $segundos > 0 ? time() + $segundos : time() - 3600,
    'path' => '/',
    'secure' => vaak_es_https(),
    'httponly' => true,
    'samesite' => $samesite,
  ]);
}

// CSRF de doble envio: la cookie guarda el HMAC del token y el navegador
// devuelve el token en la cabecera x-vaak-csrf.
function vaak_emitir_csrf(): string {
  $token = vaak_base64url(random_bytes(32));
  vaak_cookie(VAAK_CSRF_COOKIE, vaak_hmac($token), 3600, 'Strict');
  return $token;
}

function vaak_csrf_valido(): bool {
  $token = vaak_cabecera('x-vaak-csrf');
  $cookie = (string)($_COOKIE[VAAK_CSRF_COOKIE] ?? '');
  if ($token === '' || $cookie === '') return false;
  return hash_equals(vaak_hmac($token), $cookie);
}

// Toda escritura exige origen propio y token CSRF.
function vaak_exigir_escritura(array $siFalla = ['ok' => false]): void {
  if (!vaak_origen_permitido() || !vaak_csrf_valido()) vaak_fallar($siFalla, 403);
}
