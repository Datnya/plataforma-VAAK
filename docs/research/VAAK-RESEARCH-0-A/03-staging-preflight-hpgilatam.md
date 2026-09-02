---
artifact_type: RESEARCH_NOTE
phase: "staging"
ref: "VAAK-STAGING-2-A"
from: architect_chief
to: reviewer_auditor
status: delivered_for_audit
blocking: true
created_at: "2026-08-26"
---

# Preflight de staging - HPG Latam

## Propósito y fuente

Resumen trazable del preflight de solo lectura de `staging.hpgilatam.com`. Su fuente primaria es `C:\Users\HP\Downloads\Informe_Preflight_Staging_HPG_Latam_Codex.pdf` (23 páginas, revisado completo, incluidas las capturas). No sustituye la fuente ni autoriza cambios remotos.

## Hechos confirmados

| Área | Hecho observado | Alcance de la conclusión |
|---|---|---|
| Staging | `staging.hpgilatam.com` tiene raíz independiente `/home/wwwhpgilatam/staging.hpgilatam.com/public` y no comparte document root con el dominio principal. | El layout es apto para que `public/` sea la única parte web de una futura release Laravel. |
| PHP | PHP Selector está en 7.3 y ofrece 7.4 a 8.4; MultiPHP Manager no es visible. | PHP 8.4 está disponible para la cuenta, pero no se demostró que pueda asignarse sólo a staging. |
| Runtime visible | Bajo el contexto PHP 7.3 se observan `pdo_mysql`, `mbstring`, `xml`, `curl`, `zip`, `gd`, `mysqli`, `mysqlnd`, `openssl`, `fileinfo`, `intl` y `bcmath`; `imagick` está disponible pero desactivado. Límites: 512M de memoria, 64M de subida/post y 900 s de ejecución. | Ninguna extensión ni límite queda confirmado todavía para una versión moderna de PHP. |
| Base de datos | MySQL 8.0.43 local mediante socket, phpMyAdmin 5.2.3 y Remote Database Access visible. | Un monolito con MySQL local es compatible en principio; los límites globales MySQL no son recursos reservados. |
| Publicación | File Manager y FTP están disponibles; SSH, Terminal, SFTP y Composer no se confirmaron. | La release debe poder subirse preconstruida, sin CLI ni Composer en el servidor. |
| Cron | Disponible, sin tareas actuales, con mínimo cada minuto y ejemplo `/usr/local/bin/php`. | Permite planear una comprobación futura, no confirma qué PHP usará cron ni que pueda ejecutar `artisan`. |
| Seguridad y logs | ModSecurity está activo para staging. `Errors` y eventos suEXEC están visibles; Raw Access no. | Mantener el WAF activo y analizar eventos ante bloqueos; no desactivarlo preventivamente. |
| Capacidad | Cuota 100 GB, aproximadamente 6.14 GB usados; 250,000 inodos, 28,614 usados; sin fallos recientes visibles. | CPU, RAM, I/O, IOPS, EP, NPROC y concurrencia siguen desconocidos. |
| Copias | JetBackup 5 existe, pero no permitió comprobar retención, descarga ni restauración. | Aún no hay estrategia de recuperación demostrada. |

## Bloqueantes antes de Laravel

1. **DNS público.** La zona de cPanel muestra `staging.hpgilatam.com A 144.217.195.178` y TTL 14,400 s, pero la prueba pública documentada devolvió `DNS_PROBE_FINISHED_NXDOMAIN`. No se puede inferir que la zona de cPanel sea la autoritativa ni que el registro esté publicado.
2. **TLS.** El certificado Let's Encrypt mostrado para staging figura como expirado. La renovación/emisión y HTTPS sólo se revisan después de que DNS público resuelva el nombre exacto.
3. **PHP por subdominio.** Debe confirmarse con proveedor o mecanismo comprobable si PHP 8.4 puede aplicarse a staging sin afectar otros dominios. Sólo después se revalidan versión, extensiones, límites y funciones deshabilitadas.
4. **Recuperación y release.** Antes de datos, migraciones o cambios difíciles de revertir, hay que documentar una ruta de backup/restauración. La release debe prepararse fuera del hosting con dependencias y activos compilados; no se presupone Composer, Node ni comandos en el servidor.

## Secuencia obligatoria

1. Solicitar al proveedor o administrador DNS que confirme/corrija la publicación autoritativa de `staging.hpgilatam.com`, aportando el conflicto entre el A visible en cPanel y `NXDOMAIN` público.
2. Tras confirmación, comprobar resolución pública hacia el hosting esperado.
3. Sólo entonces comprobar o gestionar un certificado TLS vigente que cubra `staging.hpgilatam.com`, y validar HTTPS.
4. Confirmar el alcance seguro de PHP 8.4 para staging; no cambiarlo hasta una REF posterior aprobada y autorización humana específica.
5. Diseñar en una REF separada la prueba de runtime PHP moderno, el método de release empaquetada, recuperación, base de datos, secretos y cron inocuo.

## Riesgos y compatibilidad

- No hay incompatibilidad demostrada con un monolito Laravel y MySQL 8.0.43; la selección Laravel/PHP sigue condicionada y no es ADR.
- Son incompatibles o no demostrados los flujos que exijan SSH, Composer/Node en el servidor, Docker, workers, demonios, Horizon, Octane o WebSockets.
- No crear base de datos, usuario, `.env`, cron, release ni archivos de diagnóstico mientras no se cierren DNS, TLS y el alcance de PHP.
- Si se requiere acceso remoto a MySQL, debe justificarse y aprobarse por separado; mientras aplicación y base coexistan en este hosting se prioriza conexión local.

## Límites de esta evidencia

El PDF documenta un estado observado de cPanel y una prueba pública en ese momento. No demuestra el estado actual posterior, los límites no mostrados, ni acciones que el proveedor pueda realizar. No contiene ni debe reproducir credenciales, identificadores FTP u otros secretos.

## Actualización posterior verificada por gestión humana — 2026-08-28

Esta actualización no reescribe el snapshot del PDF; registra hechos posteriores que lo superan:

1. La zona DNS autoritativa está en Microsoft, no en cPanel. Se creó `A staging -> 144.217.195.178`, TTL 1 hora; el `NXDOMAIN` quedó resuelto.
2. Se reemitió Let's Encrypt para `staging.hpgilatam.com`; HTTPS funciona sin advertencias. `Index of /` confirma que el subdominio llega al hosting y que aún no existe aplicación.
3. Soporte confirmó hosting compartido sin MultiPHP. PHP Selector es global y cualquier cambio puede afectar `hpgilatam.com`, hoy en PHP 7.3. No cambiar PHP.
4. Backups confirmados por soporte: semanales, retención dos semanas, externos; restauración por ticket de cuenta, archivo o MySQL, sujeta a puntos disponibles. No hay prueba de restauración ni RTO garantizado.
5. SSH, Terminal, SFTP y Composer en el servidor se tratan como no disponibles bajo la evidencia vigente. File Manager y FTP sí están disponibles.
6. La estrategia aprobada por `VAAK-PHP-STRATEGY-2-A` es no desplegar en esta cuenta y priorizar staging temporal independiente; una futura release con Composer se construiría fuera del servidor.

DNS y TLS dejan de ser bloqueantes actuales. El bloqueo vigente es el acoplamiento del runtime PHP global con el sitio principal.
