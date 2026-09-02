---
artifact_type: HALLAZGO
phase: "R4"
ref: "VAAK-HOSTING-1-A"
from: architect_chief
to: reviewer_auditor
status: evidence_recorded_for_review
blocking: false
created_at: "2026-08-26"
---

# Restricciones verificadas del hosting — VAAK

## Alcance y fuente

Ficha aportada por la humana el 2026-08-26. Es evidencia de producción para investigación y diseño, no autorización para cambiar cPanel, instalar software, desplegar ni seleccionar definitivamente versión de PHP o framework.

## Hechos verificados

| Área | Evidencia confirmada |
|---|---|
| PHP | Dominio en PHP 7.3 actualmente; selector disponible para PHP 7.4 y 8.0 a 8.4. No diseñar para PHP 7.3. Ajustes observados: `allow_url_fopen` y `file_uploads` activados; `display_errors` desactivado; `error_reporting=E_ALL`; `log_errors` activado; `include_path=.:/opt/alt/php73/usr/share/pear`. Este `include_path` fue observado bajo PHP 7.3 y no demuestra su valor ni disponibilidad bajo PHP 8.4. |
| Aplicación | cPanel permite carga de archivos mediante PHP. Terminal, SSH y Composer no aparecen; Composer instalado en servidor no fue confirmado. |
| Base de datos | MySQL Community 8.0.43 local por socket en `localhost`; phpMyAdmin 5.2.3; Remote Database Access disponible, pero no requerido. Variables observadas: `max_connections=1000`, `max_user_connections=0`, `max_allowed_packet=1 GiB`, `wait_timeout=28800`, `innodb_lock_wait_timeout=50`, `lock_wait_timeout=31536000`. |
| Tareas programadas | Cron Jobs disponible, sin tareas actuales; permite scripts PHP y muestra `/usr/local/bin/php`. Puede enviar salida por correo. Frecuencia mínima no verificada. |
| Recursos | El panel observó 250,000 inodes de límite, 28,614 usados (11.4%) y ningún fallo de recursos en las últimas 24 horas. La sección Resource Usage indica que sus notificaciones al alcanzar límites son administradas o restringidas por el proveedor/administrador; no se debe prometer una alerta automática desde cPanel. Los 100 GB SSD NVMe y las referencias comerciales de CPU/RAM fueron aportados por la humana, no medidos ni verificables desde el cPanel observado. |
| Correo | Límite comercial informado por la humana: 100 mensajes/hora por usuario y 250/hora por dominio; no destinado a boletines, publicidad o promociones. No equivale a una capacidad técnica verificada de envío, ni autoriza campañas. |

## Desconocidos: no asumir

- Versión definitiva de PHP ni extensiones disponibles por versión.
- CPU, RAM, I/O, IOPS, Entry Processes, NPROC, concurrencia web efectiva, cuota/tamaño de base de datos, límites de ejecución, memoria, subida, entrada o funciones deshabilitadas.
- Método de transferencia disponible y seguro, webroot configurable, reglas rewrite, permisos efectivos y comportamiento de backups/restauración.
- Privilegios reales del usuario MySQL, SMTP autenticado, TLS/WAF/logs, frecuencia mínima del cron y su política de solapamiento.
- Cualquier límite adicional del proveedor pese a los valores globales observados de MySQL. `max_connections=1000` no reserva 1000 conexiones para VAAK y `max_user_connections=0` no garantiza conexiones ilimitadas.
- Valores efectivos de CPU, RAM, almacenamiento, correo y notificaciones del plan: la ficha comercial no sustituye límites técnicos, telemetría ni condiciones aplicadas por el proveedor a esta cuenta.

## Prohibiciones de diseño actuales

- No depender de SSH, terminal, Composer ejecutable, Docker, root, instalación de paquetes de sistema, Node.js persistente, workers/daemons permanentes, Redis obligatorio, Horizon, Octane ni WebSockets.
- No tratar Remote Database Access como topología predeterminada: la aplicación y MySQL deben comunicarse localmente mientras coexistan en este hosting.
- No depender de `allow_url_fopen` para integraciones externas; usar clientes HTTP con TLS y controles explícitos si se autorizan.
- No usar los límites globales MySQL como capacidad exclusiva de la aplicación ni inferir recursos compartidos no publicados.

## Compatibilidad condicionada propuesta

La recomendación auditada en `HANDOFF/ORDEN-VAAK-HOSTING-1-A.md` es un monolito modular **Laravel 13 + PHP 8.4 + MySQL 8.0.43**, con Blade, Livewire, Alpine y activos precompilados. Es una primera opción condicionada, no un ADR ni una selección de producción.

La contingencia es Laravel 12 + PHP 8.3 solo si staging demuestra una restricción real para la primera opción. Composer y los activos se preparan en desarrollo/CI con versiones bloqueadas y se suben dentro de una release con `vendor/` y manifiesto; nunca se ejecuta Composer en producción por defecto.

Cron solo puede ejecutar trabajos PHP breves, idempotentes y acotados después de su prueba en staging. Alertas de baja latencia, procesos continuos, chat en tiempo real, tareas pesadas de PDF/Excel/IA/vídeo, archivos grandes y alta concurrencia permanecen condicionados o incompatibles hasta nueva evidencia o una infraestructura aprobada.

## Checklist bloqueante de staging

- [x] Confirmar alcance del selector: soporte confirmó hosting compartido sin MultiPHP y PHP Selector global; no se cambiará en esta cuenta para probar staging.
- [ ] Obtener y aprobar un staging temporal independiente antes de seleccionar PHP moderno o ejecutar pruebas de framework.
- [ ] En el entorno independiente aprobado, comprobar versión y extensiones requeridas: ctype, curl, dom, fileinfo, filter, hash, mbstring, openssl, pdo_mysql, session, tokenizer, xml, zip y gd o Imagick según funcionalidad.
- [ ] Confirmar document root seguro hacia `public/` (o alternativa equivalente), rewrite y que `.env`, `vendor/`, `storage/` y respaldos no sean accesibles por HTTP.
- [ ] Verificar transferencia segura, cuotas y límites de subida/ejecución, además de permisos mínimos para archivos temporales, `storage/` y caché.
- [ ] Ejecutar un cron inocuo que confirme ruta, versión y extensiones de PHP, arranque de la release, registro verificable y prevención de solapamientos; documentar frecuencia mínima.
- [ ] Confirmar usuario MySQL de mínimo privilegio, cuota de base de datos y restauración no destructiva de base y archivos desde backup/exportación.
- [ ] Confirmar SMTP autenticado, TLS, WAF/ModSecurity, logs, política de backups, retención y límites efectivos de recursos con el proveedor.

## Implicaciones de diseño ya aplicables

Usar MySQL local con InnoDB, `utf8mb4`, claves foráneas, índices medidos, `DECIMAL` para montos/cantidades, transacciones para movimientos financieros y auditoría de aplicación append-only. Guardar adjuntos fuera de la base con metadatos y acceso autenticado; definir retención antes de asumir que el espacio libre cubre el crecimiento. Las importaciones, exportaciones y correos deben fragmentarse, registrar avance y poder reanudarse.

## Actualización confirmada 2026-08-28 — runtime compartido

- DNS autoritativo publicado desde Microsoft: `staging A 144.217.195.178`, TTL 1 hora; DNS y HTTPS están operativos con Let's Encrypt válido.
- `staging.hpgilatam.com` conserva webroot independiente, pero no runtime independiente.
- El proveedor confirmó ausencia de MultiPHP y alcance global del selector; el sitio principal permanece en PHP 7.3 y no se autoriza cambiarlo.
- Extensiones activas observadas: `pdo_mysql`, `mbstring`, `xml`, `curl`, `zip`, `gd`, `mysqli`, `mysqlnd`, `pdo`, `openssl`, `json`, `fileinfo`, `intl`, `bcmath`; Imagick disponible pero desactivado. Estos hechos corresponden a la configuración actual.
- Límites observados: 512M de memoria, 64M de subida/post y 900 s de ejecución/entrada. No constituyen presupuesto recomendado para procesos largos.
- Cron mínimo de un minuto; backups semanales, dos semanas de retención, almacenamiento externo y restauración por ticket.
- La estrategia aprobada en `VAAK-PHP-STRATEGY-2-A` prioriza staging independiente. Composer/Node y la release se prepararían fuera del servidor sólo tras decisión tecnológica posterior.
