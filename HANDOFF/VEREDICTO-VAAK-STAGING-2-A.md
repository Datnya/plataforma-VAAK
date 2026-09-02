---
artifact_type: VEREDICTO
phase: "staging"
ref: "VAAK-STAGING-2-A"
from: reviewer_auditor
to: architect_chief
status: approved
blocking: true
created_at: "2026-08-26"
updated_at: "2026-08-26"
---

# VEREDICTO — Preflight y remediación previa a Laravel en `staging.hpgilatam.com`

## RESULTADO: APROBADO

## Auditoría independiente final

Revisé `AGENTS.md`, `PROJECT-BRAIN.md`, `PROJECT-STATE.md`, la ORDEN, la ENTREGA, el registro de preflight y el informe fuente `C:\Users\HP\Downloads\Informe_Preflight_Staging_HPG_Latam_Codex.pdf` completo (23 páginas, incluidas sus capturas). La ORDEN y los registros son fieles al PDF y conservan la distinción entre evidencia confirmada y capacidades no demostradas.

### Evidencia y conclusiones

- La ORDEN usa como hechos del informe: docroot aislado terminado en `public`, MySQL 8.0.43 local, File Manager y FTP disponibles, cron mínimo de un minuto, ModSecurity activo para staging, y límites/recursos expresamente visibles.
- No convierte el PHP 8.4 disponible en el selector en una asignación confirmada para `staging.hpgilatam.com`; conserva que las extensiones y límites observados corresponden a PHP 7.3.
- No supone SSH, SFTP, Terminal, Composer, CLI, restauración de JetBackup, recursos no publicados, workers ni procesos persistentes.
- El PDF no expone contraseñas, tokens, claves privadas ni credenciales FTP: la captura FTP redacciona los identificadores de acceso. Las rutas, versiones, IPs de infraestructura y valores de cPanel documentados no se tratan como secretos de aplicación en los artefactos.

### Priorización de bloqueantes

La prioridad es correcta y se mantiene condicionada a la evidencia del PDF:

1. Resolver o confirmar la publicación autoritativa de DNS: la zona de cPanel muestra un registro `A` para staging, mientras la prueba pública documentada devolvió `DNS_PROBE_FINISHED_NXDOMAIN`.
2. Sólo cuando el DNS público esté resuelto, validar o gestionar un certificado TLS vigente para el nombre exacto.
3. Después, confirmar el alcance seguro de una versión PHP moderna para staging y revalidar su runtime antes de Laravel.

La ORDEN distingue adecuadamente revisiones de sólo lectura realizables desde cPanel de la escalación necesaria al proveedor o al administrador DNS. No ordena editar registros, renovar certificados, cambiar PHP, cargar archivos, crear base de datos, preparar secretos ni desplegar Laravel.

## Control de alcance

La recomendación de arquitectura sigue siendo condicionada y no adopta un stack ni emite un ADR. No hay indicación de cambio remoto ni evidencia de que se haya modificado DNS, TLS, PHP, cPanel, archivos, MySQL, cron, ModSecurity, GitHub, Vercel o datos reales durante esta REF.

## Límites de esta aprobación

Este VEREDICTO aprueba únicamente el análisis y la secuencia propuesta. No autoriza cambios en cPanel, DNS, TLS, PHP, archivos, permisos, MySQL, cron, ModSecurity, GitHub, Vercel ni datos. Cualquier cambio remoto requiere una REF posterior con VEREDICTO `APROBADO` y autorización humana explícita.

## Siguiente acción autorizable para el humano

Solicitar al proveedor o administrador DNS la confirmación o corrección de la zona DNS autoritativa de `staging.hpgilatam.com`, aportando el conflicto documentado entre el `A` mostrado en cPanel y el `NXDOMAIN` público. No iniciar TLS ni PHP antes de contar con una resolución pública verificable.
