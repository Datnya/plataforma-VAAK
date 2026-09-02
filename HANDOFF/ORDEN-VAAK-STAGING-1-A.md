---
artifact_type: ORDEN
phase: "0"
ref: "VAAK-STAGING-1-A"
from: architect_chief
to: reviewer_auditor
status: draft_for_review
blocking: true
created_at: "2026-08-26"
---

# ORDEN — Preflight no mutante de staging `staging.hpgilatam.com`

## Instrucción humana original

> El dominio base es `hpgilatam.com`. cPanel es accesible. El subdominio `staging.hpgilatam.com` ya existe con raíz independiente `/home/wwwhpgilatam/staging.hpgilatam.com/public`; no se ha subido Laravel ni se ha realizado configuración adicional. Indicar el siguiente paso antes de modificar cualquier otra configuración.

## Tarea

Ejecutar y documentar un **preflight exclusivamente de lectura** del staging existente. Determinar si puede pasar a una fase posterior de cambios controlados sin cambiar PHP, DNS, SSL, cPanel, cron, base de datos, archivos ni infraestructura.

## Contexto y límites vinculantes

- La topología elegida para evaluación es la alternativa B: Vercel queda limitado a prototipos visuales; el futuro monolito integrado y MySQL local se probarán en cPanel staging antes del dominio oficial.
- El docroot declarado es independiente y termina en `public`. Aún no se ha demostrado que corresponda a `public/` de una release Laravel ni que la publicación sea segura.
- La arquitectura recomendada sigue siendo condicionada: Laravel 13 + PHP 8.4 + MySQL 8.0.43, con Laravel 12 + PHP 8.3 sólo como contingencia demostrable. No es ADR ni selección definitiva.
- No asumir SSH, terminal, Composer o CLI en producción; tampoco procesos persistentes, límites no publicados ni acceso remoto a MySQL.
- El objetivo de esta REF es evidencia. No usar credenciales en capturas ni copiar secretos al repositorio.

## Alcance permitido: observación y evidencia

### 1. Dominio, DNS y TLS

Verificar en cPanel y mediante navegador/consulta pública no autenticada, sin editar registros:

- `staging.hpgilatam.com` aparece como subdominio activo y mantiene exactamente el docroot declarado.
- Estado de resolución DNS (`A` y `AAAA` si existe), destino observado y si coincide con el hosting esperado. Si aún propaga, registrar hora, TTL visible y estado como pendiente; no forzar cambios.
- Estado de SSL/TLS en la herramienta disponible: certificado emitido, nombre cubierto, emisor, vencimiento y redirección HTTP→HTTPS si ya está configurada. Si AutoSSL está pendiente, sólo registrar el estado; no ejecutar ni forzar emisión.
- Respuesta HTTP actual de `/`, incluyendo código y encabezados de red no sensibles. No publicar rutas internas, usuarios, tokens ni configuraciones completas.

### 2. Selector PHP y extensiones

Inspeccionar, sin guardar cambios, qué selector aplica a `staging.hpgilatam.com` y qué versiones ofrece realmente para ese subdominio.

- Registrar versión PHP actual asignada a staging y si PHP 8.4 puede seleccionarse específicamente para él.
- Registrar disponibilidad visible de extensiones requeridas para la primera opción: `ctype`, `curl`, `dom`, `fileinfo`, `filter`, `hash`, `mbstring`, `openssl`, `pdo_mysql`, `session`, `tokenizer`, `xml`, `zip` y `gd` o Imagick según la funcionalidad futura.
- Registrar, si el panel lo muestra sin cambiar valores: `memory_limit`, `max_execution_time`, `post_max_size`, `upload_max_filesize`, `max_input_vars`, `disable_functions` y OPcache.
- No seleccionar PHP 8.4, no modificar extensiones ni INI y no usar el `include_path` de PHP 7.3 como evidencia de PHP 8.4.

### 3. Publicación y transferencia

Determinar por observación si existe una ruta práctica y segura de despliegue empaquetado, sin transferir ninguna release:

- Métodos disponibles y habilitados: File Manager, SFTP, FTPS o FTP; no intentar credenciales nuevas ni conexiones remotas como parte de este preflight.
- Tamaño máximo de subida, cuotas disponibles y restricciones relevantes del File Manager/transferencia, si el panel las expone.
- Opciones disponibles para proteger el árbol de aplicación fuera de la raíz web y posibilidad de que la raíz de un subdominio apunte a una carpeta `public` de una release. No crear carpetas, archivos ni reglas.
- Mecanismos observables de logs de error/acceso y de protección WAF/ModSecurity; no deshabilitarlos ni alterar reglas.

### 4. MySQL y recuperación

Inspeccionar la capacidad existente sin crear bases, usuarios ni conexiones:

- Confirmar que MySQL 8.0.43/phpMyAdmin siguen disponibles y registrar cuota/tamaño máximo de base de datos, número máximo de bases/usuarios y privilegios mostrados, si el panel los expone.
- Confirmar que MySQL local se presenta como `localhost` y que Remote Database Access sigue siendo opcional; no autorizar hosts remotos.
- Registrar capacidades visibles de exportación y restauración, frecuencia/retención de backups y si existe restauración de staging no destructiva. No ejecutar exportaciones ni restauraciones.
- Identificar el canal seguro para crear posteriormente una cuenta MySQL de mínimo privilegio, sin crearla ahora.

### 5. Cron y correo

Inspeccionar sin crear tareas ni enviar correo:

- Confirmar que Cron Jobs está disponible, la frecuencia mínima seleccionable, la ruta PHP mostrada, interfaz para evitar/gestionar solapamientos si existe y el modo de entrega de salida.
- Registrar que aún no se ha comprobado la versión PHP efectiva de cron ni el arranque de `artisan`; éstos requieren una prueba inocua posterior aprobada.
- Identificar la configuración disponible para SMTP autenticado/TLS y los límites publicados de envío, sin enviar mensajes ni almacenar credenciales.

### 6. Seguridad y límites operativos

Registrar sólo hechos visibles:

- Estado de Resource Usage, inodes actuales/límite y si el panel confirma que las notificaciones están administradas por el proveedor.
- Estado visible de backups, SSL, WAF/ModSecurity y logs.
- Límites de CPU, RAM, I/O, IOPS, EP, NPROC, concurrencia y cuota DB: registrar como **desconocidos** si el panel no los muestra; no inferirlos del plan comercial ni de variables globales MySQL.
- Cualquier aviso del proveedor que impida Laravel, archivos privados, cron, despliegue empaquetado o almacenamiento de adjuntos.

## Evidencia a capturar

Crear una entrega documental que contenga, sin secretos ni datos personales:

1. Fecha/hora y cuenta/entorno identificados sólo de forma no sensible; URL de staging y docroot observado.
2. Capturas o transcripción mínima de Domains/Subdomains, PHP Selector, MultiPHP/Select PHP Version, extensiones y límites visibles.
3. Resultado de DNS y HTTPS, con estado de certificado/propagación y código HTTP de `/`.
4. Inventario de métodos de transferencia, webroot posible, logs/WAF, cron y SMTP visibles.
5. Inventario MySQL/phpMyAdmin, cuotas/privilegios si se muestran, y capacidades de backup/restauración sin ejecutar acciones.
6. Tabla que separe: **confirmado**, **no confirmado**, **bloqueante para la siguiente fase** y **riesgo/escalación a proveedor**.
7. Declaración explícita de que no se subieron archivos, no se creó BD/usuario, no se modificó selector PHP, cron, DNS, SSL, permisos, cPanel ni infraestructura.

Las capturas se deben conservar fuera del repositorio si contienen identificadores de cuenta, rutas internas adicionales o datos operativos; la ENTREGA sólo enlaza una descripción saneada o evidencia redaccionada.

## Criterios para autorizar cambios posteriores

No autorizar todavía cambios. Sólo se podrá proponer una REF posterior si la evidencia demuestra o deja una ruta explícita para demostrar:

1. El subdominio resuelve al hosting correcto y TLS puede protegerlo antes de cualquier autenticación o dato.
2. PHP 8.4 y las extensiones obligatorias están disponibles para staging, o existe una evidencia concreta que active la contingencia PHP 8.3/Laravel 12.
3. Se puede desplegar una release empaquetada sin Composer/SSH en servidor y con el document root seguro hacia el futuro `public/`, sin exposición HTTP de `.env`, `vendor`, `storage` ni respaldos.
4. Existe un mecanismo seguro para transferir artefactos y un plan verificable de rollback por archivos; todavía no se ejecuta ninguno.
5. MySQL local permite planificar una cuenta de mínimo privilegio y hay una estrategia de recuperación que pueda probarse sin destruir datos.
6. Cron permite al menos diseñar una prueba inocua posterior; su frecuencia efectiva y PHP real quedan pendientes hasta esa prueba.
7. WAF, logs, SMTP/TLS, backups y límites críticos están confirmados o escalados por escrito al proveedor.
8. La humana autoriza explícitamente la siguiente REF de cambios concretos. Esa REF debe separar: selección PHP, release mínima de prueba, creación de BD, secreto `.env`, cron inocuo y cualquier acción de DNS/SSL.

## Criterios de aceptación para auditoría

- La propuesta conserva el carácter no mutante y no presume capacidades ausentes.
- Incluye preflight de cPanel/DNS/TLS/PHP/extensiones/transferencia/MySQL/cron/seguridad.
- Separa evidencia admisible de capturas sensibles y prohíbe secretos en el repositorio.
- Identifica criterios objetivos para una futura autorización, sin aprobar por sí misma Laravel, PHP, despliegue ni infraestructura.
- No modifica ningún archivo distinto de esta ORDEN ni realiza cambios remotos.

## Frenos aplicables

- Prohibido subir archivos, crear directorios, base de datos, usuario MySQL, cron, certificado, regla DNS, redirección, cuenta de correo, acceso remoto MySQL o cambio de selector PHP.
- Prohibido habilitar o deshabilitar ModSecurity/WAF, alterar permisos, emitir/forzar SSL, ejecutar Composer/artisan, instalar dependencias o desplegar Laravel.
- No capturar, registrar ni compartir contraseñas, claves, tokens, contenido de `.env`, datos reales ni información sensible de la clienta.
- Cualquier cambio posterior en cPanel, datos de staging, credenciales, SSL/DNS o despliegue requiere VEREDICTO `APROBADO` de esta REF y autorización humana específica de la siguiente REF.

## Fuentes

- `AGENTS.md`
- `PROJECT-BRAIN.md`
- `PROJECT-STATE.md`
- `docs/research/VAAK-RESEARCH-0-A/02-hosting-constraints.md`
- `HANDOFF/ORDEN-VAAK-HOSTING-1-A.md`
- Evidencia humana de la presente REF (2026-08-26)
