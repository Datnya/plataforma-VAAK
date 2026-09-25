<?php
// Arranque comun del servidor de VAAK: configuracion, base de datos y
// utilidades para responder. Reemplaza a Next.js + Supabase en el hosting
// del cliente, respondiendo en las mismas rutas y con los mismos formatos.
declare(strict_types=1);

require_once __DIR__ . '/bd.php';

// El hosting no trae mbstring para PHP 8.2; estas dos bastan para lo que se usa.
if (!function_exists('mb_strtolower')) {
  function mb_strtolower(string $texto): string {
    static $mapa = null;
    if ($mapa === null) {
      $mayus = 'ÁÉÍÓÚÜÑÀÈÌÒÙÂÊÎÔÛÄËÏÖÇÃÕÅÆØÝŸŠŽŒ';
      $minus = 'áéíóúüñàèìòùâêîôûäëïöçãõåæøýÿšžœ';
      $mapa = array_combine(preg_split('//u', $mayus, -1, PREG_SPLIT_NO_EMPTY), preg_split('//u', $minus, -1, PREG_SPLIT_NO_EMPTY));
    }
    return strtr(strtolower($texto), $mapa);
  }
}
if (!function_exists('mb_strlen')) {
  function mb_strlen(string $texto): int {
    return (int)preg_match_all('/./us', $texto);
  }
}

const VAAK_CSRF_COOKIE = 'vaak-csrf';
const VAAK_SESSION_COOKIE = 'vaak-sesion';
// La sesión se cierra sola tras 12 horas sin usar la plataforma (antes duraba 30 días: auditoría
// del 21-sep-2026). Mientras se usa se va renovando, así que nadie pierde la sesión trabajando.
const VAAK_SESSION_HOURS = 12;

function vaak_config(): array {
  static $config = null;
  if ($config === null) {
    $ruta = __DIR__ . '/config.php';
    if (!is_file($ruta)) throw new RuntimeException('config_missing');
    $config = require $ruta;
  }
  return $config;
}

function vaak_db(): VaakBd {
  static $db = null;
  if ($db === null) {
    $db = new VaakBd(vaak_config()['db']);
    $db->exec("SET time_zone = '+00:00'");
  }
  return $db;
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
// Memoria que PHP permite usar en esta peticion, en bytes (0 = sin limite).
function vaak_memoria_disponible(): int {
  $valor = trim((string)ini_get('memory_limit'));
  if ($valor === '' || $valor === '-1') return 0;
  $numero = (float)$valor;
  $sufijo = strtolower(substr($valor, -1));
  if ($sufijo === 'g') $numero *= 1024 * 1024 * 1024;
  elseif ($sufijo === 'm') $numero *= 1024 * 1024;
  elseif ($sufijo === 'k') $numero *= 1024;
  return (int)$numero;
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
