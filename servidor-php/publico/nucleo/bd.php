<?php
// Conexion a MySQL con mysqli. En el hosting del cliente (PHP 8.2 por carpeta)
// solo vienen activas mysqli y mysqlnd; pdo_mysql no. Estas dos clases ofrecen
// lo poco de PDO que usa el servidor (prepare, execute, fetch, fetchAll,
// fetchColumn, query, exec y transacciones), asi el resto del codigo no cambia.
// Los errores de MySQL llegan como mysqli_sql_exception; vaak_bd_errno() da su
// numero (1062 = registro duplicado).
declare(strict_types=1);

final class VaakBd {
  private mysqli $cn;
  private bool $enTransaccion = false;

  public function __construct(array $c) {
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $this->cn = mysqli_init();
    // Numeros como numeros tambien en consultas sin parametros (igual que PDO).
    $this->cn->options(MYSQLI_OPT_INT_AND_FLOAT_NATIVE, 1);
    $this->cn->real_connect($c['host'], $c['usuario'], $c['clave'], $c['nombre'], (int)($c['port'] ?? 3306));
    $this->cn->set_charset('utf8mb4');
  }

  public function prepare(string $sql): VaakSentencia {
    return new VaakSentencia($this->cn->prepare($sql));
  }

  public function query(string $sql): VaakSentencia {
    $r = $this->cn->query($sql);
    return VaakSentencia::conResultado($r instanceof mysqli_result ? $r : null);
  }

  public function exec(string $sql): int {
    $this->cn->query($sql);
    return max(0, (int)$this->cn->affected_rows);
  }

  public function beginTransaction(): bool {
    $this->cn->begin_transaction();
    return $this->enTransaccion = true;
  }

  public function commit(): bool {
    $this->cn->commit();
    $this->enTransaccion = false;
    return true;
  }

  public function rollBack(): bool {
    $this->cn->rollback();
    $this->enTransaccion = false;
    return true;
  }

  public function inTransaction(): bool {
    return $this->enTransaccion;
  }
}

final class VaakSentencia {
  private ?mysqli_stmt $st;
  private ?mysqli_result $res = null;

  public function __construct(?mysqli_stmt $st) {
    $this->st = $st;
  }

  public static function conResultado(?mysqli_result $res): self {
    $s = new self(null);
    $s->res = $res;
    return $s;
  }

  public function execute(array $valores = []): bool {
    if ($this->res) { $this->res->free(); $this->res = null; }
    if ($valores) {
      $tipos = '';
      $vinculos = [];
      foreach (array_values($valores) as $i => $v) {
        if (is_bool($v)) $v = (int)$v;
        $tipos .= is_int($v) ? 'i' : (is_float($v) ? 'd' : 's');
        $vinculos[$i] = $v;
      }
      $this->st->bind_param($tipos, ...$vinculos);
    }
    $this->st->execute();
    $r = $this->st->get_result();
    $this->res = $r instanceof mysqli_result ? $r : null;
    return true;
  }

  /** @return array<string,mixed>|false */
  public function fetch() {
    $fila = $this->res ? $this->res->fetch_assoc() : null;
    return $fila ?? false;
  }

  public function fetchAll(): array {
    return $this->res ? $this->res->fetch_all(MYSQLI_ASSOC) : [];
  }

  /** @return mixed|false */
  public function fetchColumn() {
    $fila = $this->res ? $this->res->fetch_row() : null;
    return $fila ? $fila[0] : false;
  }
}

function vaak_bd_errno(Throwable $e): int {
  return $e instanceof mysqli_sql_exception ? (int)$e->getCode() : 0;
}
