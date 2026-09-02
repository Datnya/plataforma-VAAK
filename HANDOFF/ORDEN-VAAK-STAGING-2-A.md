---
artifact_type: ORDEN
phase: "staging"
ref: "VAAK-STAGING-2-A"
from: architect_chief
to: reviewer_auditor
status: draft_for_review
blocking: true
created_at: "2026-08-26"
---

# ORDEN — Análisis y remediación previa a Laravel en `staging.hpgilatam.com`

## Instrucción humana original

> Analizar el informe completo de preflight de `staging.hpgilatam.com` como documentación técnica de referencia, usar únicamente hechos confirmados y definir conclusiones, bloqueantes, siguiente paso y riesgos antes de continuar el despliegue de staging.

## Evidencia primaria revisada

`C:\Users\HP\Downloads\Informe_Preflight_Staging_HPG_Latam_Codex.pdf`, 23 páginas, revisado íntegramente (texto y capturas). La evidencia se limita al estado observado durante el preflight; no demuestra valores de PHP distintos de 7.3 ni capacidades que no se mostraron.

## 1. Conclusión técnica del entorno actual

### Viabilidad

El entorno es **viable de forma condicionada** para un monolito Laravel desplegado como paquete preconstruido, sin SSH, Terminal, Composer ni procesos persistentes en el servidor. Hay MySQL 8.0.43, File Manager, FTP, cron cada minuto, ModSecurity activo para staging y un docroot aislado que ya termina en `public`:

`/home/wwwhpgilatam/staging.hpgilatam.com/public`

No es aún viable para desplegar Laravel ni para seleccionar definitivamente PHP/Laravel. Tres bloqueantes preceden cualquier carga de archivos o configuración de aplicación:

1. La consulta pública devolvió `DNS_PROBE_FINISHED_NXDOMAIN`, aunque cPanel muestra un registro `A` para `staging.hpgilatam.com` hacia `144.217.195.178`, con TTL de 14,400 segundos.
2. El certificado Let's Encrypt que muestra cPanel para staging aparece expirado; HTTPS no puede validarse.
3. PHP 8.4 aparece disponible en el selector global, pero MultiPHP Manager no está disponible y no hay evidencia de que PHP 8.4 pueda asignarse exclusivamente a staging sin afectar otros dominios. Las extensiones y límites comprobados corresponden al contexto PHP 7.3.

### Hechos aptos para diseño, no para inferencias adicionales

| Área | Hecho confirmado | Implicación limitada |
|---|---|---|
| PHP | Selector actualmente en 7.3; ofrece 7.4 a 8.4 | No diseñar para 7.3; no afirmar todavía que staging tendrá 8.4 ni que el cambio será aislado. |
| Extensiones/límites visibles | `pdo_mysql`, `mbstring`, `xml`, `curl`, `zip`, `gd`, `mysqli`, `mysqlnd`, `pdo`, `openssl`, `json`, `fileinfo`, `intl` y `bcmath` activos; `imagick` disponible pero desactivado. 512M, 64M/64M y 900 s visibles | Evidencia únicamente bajo PHP 7.3; se deben revalidar después de elegir una versión moderna. |
| Base de datos | MySQL 8.0.43 por `localhost`/socket; phpMyAdmin disponible | Compatible en principio con Laravel/MySQL moderno; límites globales no son capacidad reservada. |
| Publicación | File Manager y FTP disponibles; carpeta staging separada de `public_html` | Puede existir un flujo de release empaquetada; SFTP, SSH y Composer no están confirmados. |
| Programación | Cron mínimo de un minuto; `/usr/local/bin/php` como ejemplo | Sólo permite planear una prueba inocua posterior; no confirma el PHP real de cron ni `artisan`. |
| Seguridad/observabilidad | ModSecurity activo en staging; Errors y eventos suEXEC visibles | Mantener WAF activo; investigar bloqueos legítimos antes de tocar reglas. Raw Access no es visible. |
| Recursos/recuperación | 100 GB de cuota, ~6.14 GB usados; 250,000 inodos, 28,614 usados; JetBackup 5 no se pudo inspeccionar | CPU, RAM, I/O, IOPS, EP, NPROC y restauración siguen desconocidos. |

## 2. Puntos que deben resolverse antes de un despliegue Laravel

### Bloqueantes en orden estricto

| Orden | Bloqueante | Estado probado | Quién puede resolver o confirmar | Criterio de salida |
|---:|---|---|---|---|
| 1 | Autoridad y publicación DNS | Registro presente en la zona de cPanel, pero resolución pública `NXDOMAIN` | Humana puede revisar sin editar Zone Editor; proveedor o administrador DNS debe confirmar/corregir si la zona de cPanel no es autoritativa | Consulta pública devuelve el `A` de staging hacia el hosting esperado, tras propagación verificable. |
| 2 | TLS válido | Certificado de staging marcado expirado; AutoSSL no visible | Humana puede revisar SSL Certificates; proveedor/administrador DNS o hosting interviene si no hay emisión/renovación disponible | Certificado vigente cubre exactamente `staging.hpgilatam.com` y HTTPS responde sin error de certificado. |
| 3 | Alcance de PHP moderno | PHP 8.4 disponible globalmente; asignación por dominio no demostrada | Humana puede revisar PHP Selector sin aplicar cambios; proveedor debe confirmar el alcance y el mecanismo seguro | Confirmación escrita de si PHP se asigna por dominio o a toda la cuenta, y ruta aprobable para PHP 8.4 en staging. |
| 4 | Runtime PHP moderno | Extensiones/límites observados sólo en PHP 7.3 | Se verifica mediante una prueba posterior, deliberadamente separada y autorizada | En el PHP elegido para staging se comprueban versión, extensiones requeridas, límites y funciones deshabilitadas. |
| 5 | Recuperación verificable | JetBackup 5 existe, pero no mostró retención, restauración ni descarga | Humana puede volver a revisar; proveedor debe aclarar si persiste inaccesible | Estrategia practicable de backup/restauración de archivos y base antes de datos o cambios destructivos. |
| 6 | Método de release seguro | File Manager/FTP sí; SFTP/SSH/Composer no confirmados | Humana puede revisar capacidades; el flujo se define en una REF posterior | Release preconstruida, con `vendor/` y activos compilados, transferible sin ejecutar Composer/CLI en servidor, y con rollback de archivos definido. |

No crear base de datos, usuario MySQL, `.env`, cron ni release hasta que los bloqueantes 1-4 estén resueltos y 5-6 tengan una ruta documentada y autorizada.

## 3. Plan de remediación propuesto (sin autorizar acciones)

### Fase A — DNS: primera dependencia real

1. **Revisión humana, sin editar:** en Zone Editor, conservar evidencia saneada de los registros `A` de `staging` y `www.staging`, sus destinos y TTL; verificar que la zona mostrada corresponde a `hpgilatam.com`.
2. **Escalación a proveedor/DNS:** solicitar confirmación de que `ns1.hpserverdns.com` y `ns2.hpserverdns.com` son los nameservers autoritativos públicos efectivos del dominio y de que el registro `A` de `staging.hpgilatam.com` está publicado desde la zona autoritativa. Incluir la evidencia concreta: zona de cPanel muestra `A → 144.217.195.178`, mientras la consulta pública observada devuelve `NXDOMAIN`.
3. **Verificación posterior, sin forzar cambios:** esperar la confirmación o corrección del responsable DNS y comprobar que staging resuelve públicamente. No editar DNS desde cPanel salvo una REF posterior aprobada y autorización humana explícita.

### Fase B — TLS, sólo después de DNS

1. Con DNS público resuelto, revisar si cPanel ofrece emisión/renovación para el certificado expirado.
2. Si esa acción no está disponible o falla, escalar al proveedor con el estado del certificado expirado y la confirmación DNS.
3. Verificar nombre cubierto, vigencia y HTTPS antes de cualquier autenticación, envío de credenciales o carga de datos.

### Fase C — PHP: decidir el mecanismo antes de seleccionar

1. No seleccionar PHP 8.4 aún.
2. Pedir al proveedor una respuesta explícita: si PHP Selector modifica toda la cuenta o admite alcance por dominio/subdominio; si PHP 8.4 está disponible para `staging.hpgilatam.com`; y si las extensiones requeridas se mantienen bajo dicha versión.
3. Sólo tras esa respuesta, proponer una REF de cambio acotado para seleccionar el PHP de staging y comprobarlo con un archivo de diagnóstico temporal que no revele secretos y que se elimine bajo la misma fase autorizada.

### Fase D — Recuperación y release, todavía sin desplegar

1. Obtener del proveedor o de JetBackup una confirmación de retención, restauración y descarga para archivos y MySQL.
2. Definir un paquete de release preparado localmente/CI: código auditado, `vendor/` generado fuera del hosting, activos compilados y un manifiesto de integridad; no usar Composer ni Node en el servidor.
3. En una REF posterior independiente, diseñar el layout fuera del docroot y dentro de la raíz pública ya creada, permisos mínimos, exclusiones de secretos y un rollback por release anterior. No asumir symlinks, `storage:link` ni CLI.

## 4. Riesgos e incompatibilidades relevantes

- **DNS/TLS:** es el bloqueo crítico inmediato. Mientras staging sea `NXDOMAIN` y el certificado esté expirado, no se debe publicar Laravel ni enviar credenciales de aplicación.
- **Selector PHP global:** cambiar PHP sin confirmar su alcance podría afectar `hpgilatam.com` u otros dominios. Por eso PHP 8.4 es una opción condicionada, no una selección hecha.
- **Despliegue sin CLI:** Laravel sigue siendo posible, pero debe llegar con dependencias y activos ya preparados. Flujos que exijan `composer install`, `php artisan`, Node, workers, Horizon, Octane, WebSockets, Docker o demonios persistentes en el hosting son incompatibles o no demostrados.
- **Cron:** el intervalo de un minuto es compatible con planificar un scheduler, pero no con tareas pesadas o permanentes. La versión PHP efectiva, arranque de Laravel y control de solapamiento no están demostrados.
- **Backups:** JetBackup no validado significa que no debe haber migraciones ni carga de datos reales hasta conocer una restauración factible.
- **WAF:** ModSecurity debe permanecer activo. Cualquier bloqueo de una petición válida requiere revisión del evento, no desactivación preventiva.
- **Recursos:** CPU, RAM, I/O, IOPS, EP y NPROC no están publicados; la arquitectura debe mantenerse conservadora y no prometer capacidades de alta concurrencia, procesamiento pesado o trabajos continuos.

## Respuesta directa a los cuatro puntos solicitados

1. **Conclusión técnica:** cPanel compartido/administrado con bases suficientes para Laravel empaquetado y MySQL local, pero todavía no listo para desplegar debido a DNS público, TLS y PHP moderno por dominio sin confirmar.
2. **Antes de Laravel:** resolver DNS público, obtener TLS vigente, confirmar el alcance de PHP 8.4 y revalidar su runtime; además confirmar recuperación y el procedimiento de release sin CLI.
3. **Siguiente paso exacto:** abrir primero un ticket al proveedor o administrador DNS solicitando confirmación/corrección de la zona DNS autoritativa para `staging.hpgilatam.com`, adjuntando el conflicto `A` visible en cPanel frente a `NXDOMAIN` público. No renovar SSL ni cambiar PHP antes de que DNS público esté resuelto.
4. **Riesgo/incompatibilidad:** no hay una incompatibilidad demostrada con Laravel modular y MySQL 8; sí la habría con despliegues que dependan de CLI en servidor o procesos persistentes. La selección Laravel 13 + PHP 8.4 permanece condicionada hasta confirmar la asignación segura de PHP para staging.

## Alcance y frenos

Esta ORDEN no autoriza ningún cambio en cPanel, DNS, SSL/TLS, PHP, cron, ModSecurity, MySQL, archivos, permisos, GitHub, Vercel ni datos. No se autoriza subir Laravel, crear base/usuario, generar `.env`, instalar dependencias, ejecutar comandos, forzar certificados ni cambiar registros.

Una REF posterior deberá separar expresamente: cambios DNS/TLS si fueran necesarios; selección de PHP; despliegue mínimo; creación de MySQL; secreto `.env`; cron inocuo; y prueba de recuperación. Cada uno exige VEREDICTO `APROBADO` y autorización humana específica.

## Criterios de aceptación para auditoría

- Usa el PDF completo como evidencia primaria y no presenta el selector PHP global como asignación por dominio.
- Clasifica DNS, TLS y PHP como bloqueantes previos a Laravel y los ordena correctamente.
- Separa acciones de lectura disponibles para la humana de dependencias del proveedor/DNS.
- No asume SSH, SFTP, Composer, CLI, workers, recursos no publicados ni restauración de backups.
- Responde los cuatro puntos de la instrucción humana y no autoriza cambios remotos.

## Fuentes

- `AGENTS.md`
- `PROJECT-BRAIN.md`
- `PROJECT-STATE.md`
- `docs/research/VAAK-RESEARCH-0-A/02-hosting-constraints.md`
- `HANDOFF/ORDEN-VAAK-STAGING-1-A.md`
- `HANDOFF/VEREDICTO-VAAK-STAGING-1-A.md`
- `C:\Users\HP\Downloads\Informe_Preflight_Staging_HPG_Latam_Codex.pdf` (23 páginas, evidencia primaria)
