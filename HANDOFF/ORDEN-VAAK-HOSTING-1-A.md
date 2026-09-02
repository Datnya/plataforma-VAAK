---
artifact_type: ORDEN
phase: "0"
ref: "VAAK-HOSTING-1-A"
from: architect_chief
to: reviewer_auditor
status: revised_for_review
blocking: true
created_at: "2026-08-26"
---

# ORDEN — Arquitectura y viabilidad en hosting cPanel

## Instrucción humana original

> Antes de comenzar a programar la plataforma: recomendar arquitectura y versión PHP; decidir nativo o framework; definir dependencias sin Composer/SSH en producción; diseñar MySQL 8; identificar incompatibilidades, verificaciones y alertas. No asumir capacidades no confirmadas.

## Evidencia vinculante de producción

| Área | Confirmado | No confirmado / prohibido asumir |
|---|---|---|
| PHP | Selector con 7.4, 8.0–8.4; actual 7.3 no se usará | Versión definitiva; extensiones por versión; límites de ejecución/memoria/upload |
| Aplicación | cPanel, carga PHP, cron PHP (`/usr/local/bin/php`) | terminal, SSH, Composer, CLI de producción, root, Docker, Node persistente, workers/daemons |
| Base de datos | MySQL 8.0.43 local por socket; phpMyAdmin; Remote DB opcional | cuota de BD, tamaño, I/O, backups/restauración y privilegios exactos |
| Recursos | 100 GB NVMe; 250,000 inodes, 28,614 usados | CPU, RAM, I/O, IOPS, EP, NPROC, concurrencia, límites de proveedor |
| Agenda | Cron Jobs disponibles; sin jobs actuales | frecuencia mínima y comportamiento de solapamiento |

## Recomendación provisional concreta

Proponer como primera opción condicionada una aplicación web **monolito modular Laravel 13 + PHP 8.4 + MySQL 8.0**, con Blade, Livewire y Alpine.js; Tailwind se compila en el entorno de desarrollo/CI y se sube como activo estático. La condición es verificar en staging la compatibilidad real de PHP 8.4, extensiones, dependencias y cron. La contingencia explícita, solo si esa prueba falla por restricciones demostrables del proveedor o extensiones, es **Laravel 12 + PHP 8.3 + MySQL 8.0**. La interfaz inicial en Vercel se limita a prototipos o, si se mantiene desacoplada, a un frontend estático/API explícitamente aprobado: no se debe prometer que el monolito Laravel correrá en Vercel.

PHP 8.4 es la primera opción condicionada por su mayor horizonte de soporte junto con Laravel 13. PHP 8.3 con Laravel 12 queda como contingencia compatible. No se seleccionará ninguna versión en producción ni se aprobará un ADR antes de las pruebas de staging; no adoptar PHP 7.3, 7.4, 8.0 ni 8.1.

Laravel se prefiere sobre PHP nativo: aporta autenticación, CSRF, validación, autorización, migraciones, ORM, sesiones, cifrado y una estructura mantenible. El uso debe mantenerse deliberadamente sobrio: sin Octane, Horizon, Redis obligatorio, WebSockets, colas con worker residente ni SSR Node en producción.

Esta es una recomendación técnica provisional, **no un ADR ni autorización de implementación**.

## Arquitectura objetivo condicionada

```text
Navegador
  -> Apache/LiteSpeed de cPanel -> public/index.php (Laravel/PHP-FPM o equivalente)
      -> módulos de dominio (proyectos, SPEC, compras, facturas, entregas, reportes, auditoría)
      -> MySQL local 8.0.43 (PDO; conexión local)
      -> filesystem privado de la cuenta para adjuntos, con descargas autenticadas
      -> cron PHP breve e idempotente para tareas diferidas
```

- Un único código desplegable, módulos con límites claros; no microservicios.
- Peticiones HTTP cortas; operaciones masivas fragmentadas y reanudables.
- Cache inicial: archivos o base de datos solo para datos no críticos, sin depender de Redis.
- Alertas y correos: guardar primero una notificación en BD; enviar en lotes mediante cron, respetando 100 mensajes/hora/usuario y 250/hora/dominio.
- Importaciones/exportaciones: Excel en lotes; prevalidación, informe de errores y trazabilidad. No procesarlas íntegramente dentro de una sola petición web si su volumen no está medido.

## Base de datos MySQL 8.0.43 — directrices de diseño

1. InnoDB, `utf8mb4`, claves primarias `BIGINT UNSIGNED` o UUID binario solo si existe motivo de integración; escoger una convención antes de la primera migración.
2. Normalizar el núcleo: organizaciones/usuarios/roles, proyectos, áreas/ambientes, SPEC e ítems, proveedores, órdenes y líneas, facturas/pagos, entregas/recepciones, monedas/tipos de cambio, adjuntos y auditoría.
3. Montos como `DECIMAL(p,s)`, nunca `FLOAT`; guardar moneda ISO y tipo de cambio histórico aplicado al documento.
4. Cantidades como `DECIMAL` cuando puedan ser fraccionarias; fechas en UTC y zona de presentación por decisión posterior.
5. Todas las relaciones críticas con FK e índices para sus claves foráneas y filtros frecuentes (`organization_id`, `project_id`, estado, fecha, proveedor, orden). Toda consulta y mutación exige alcance por organización/proyecto y autorización en servidor; no confiar en filtros del navegador. Revisar `EXPLAIN` con datos de prueba antes de índices compuestos adicionales.
6. Usar transacciones para operaciones financieras, compras, pagos, recepciones e inventario. Definir restricciones `UNIQUE`, checks o validaciones transaccionales para invariantes de negocio y transiciones de estado; aplicar concurrencia optimista para ediciones ordinarias y bloqueo pesimista breve para saldos, recepciones y confirmaciones que no puedan competir.
7. Documentos financieros y sus movimientos se conservan: no se borran físicamente; las correcciones usan reversos, anulaciones o notas de crédito con relación y motivo. La auditoría append-only registra actor, entidad, id, acción, fecha, correlación y cambio estructurado, y la aplicación prohíbe actualizarla o borrarla. Su límite de amenaza es explícito: ofrece trazabilidad frente a usuarios de aplicación, no inmutabilidad frente a un administrador MySQL; cualquier control externo/tamper-evident queda condicionado a un ADR y capacidad adicional.
8. Adjuntos fuera de la BD salvo metadatos, hash y ruta; límites de tipo/tamaño y descarga autenticada desde controlador. Guardarlos en una ruta privada no servida por HTTP, sin requerir `storage:link` ni symlinks en producción. No inferir que 100 GB permite conservar archivos sin política de retención.
9. Migraciones y semillas se ejecutan fuera de producción o mediante una vía explícitamente verificada; phpMyAdmin no sustituye un despliegue repetible.

## Dependencias y despliegue reproducible sin CLI en producción

1. Fijar la versión de PHP de producción antes de construir el artefacto; desarrollar y probar localmente con la misma versión menor (8.4 para la primera opción condicionada; 8.3 solo para la contingencia).
2. En entorno local/CI controlado: ejecutar Composer con `composer.lock`, instalar dependencias de producción (`--no-dev --prefer-dist --optimize-autoloader`) y compilar CSS/JS.
3. Empaquetar una release inmutable con `vendor/`, activos compilados y un manifiesto de compatibilidad: commit/versión, PHP exacto, extensiones requeridas, hash de `composer.lock`, hashes del artefacto y de activos, fecha y lista de dependencias con binarios o artefactos dependientes de plataforma. No ejecutar `composer update` en producción ni incluir dependencias con binarios no comprobados en ese hosting.
4. Subir por cPanel File Manager/FTP/SFTP solo lo que corresponda a la release. No desplegar hasta verificar el document root hacia `public/` o una alternativa equivalente revisada, rewrite funcional e inaccesibilidad HTTP de `.env`, `vendor/`, `storage/` y backups. Mantener el proyecto fuera de `public_html` cuando sea posible.
5. Guardar `.env` y secretos solo en el servidor, nunca en el paquete ni repositorio. Generar `APP_KEY` criptográficamente seguro en un entorno controlado y transferirlo por un canal seguro al `.env` de producción; no regenerarlo en cada release. Probar permisos mínimos de `storage/` y `bootstrap/cache`.
6. Ejecutar migraciones solamente mediante un mecanismo aprobado y verificado. Si no existe CLI, preparar migraciones SQL revisadas, backup/restauración probada y un procedimiento manual explícito; no automatizar cambios destructivos.
7. No habilitar `config:cache`, `route:cache` o `view:cache` generados en otro sistema hasta validar que no contienen rutas/configuración incompatibles con producción. Preferir comando cron/CLI confirmado o prescindir inicialmente de esos caches.
8. Antes del primer despliegue, verificar un usuario MySQL de privilegio mínimo y realizar backup/exportación junto con una restauración no destructiva de archivos y base de datos en staging. Desplegar primero a subdominio de staging, realizar smoke tests y conservar la release anterior para rollback por archivos. El rollback de código es independiente del rollback de esquema; este último requiere plan separado y autorización humana si es destructivo.

## Cron y trabajos diferidos

- Usar cron para un comando PHP corto que despache una iteración acotada de trabajos de BD: notificaciones, recordatorios, conciliaciones ligeras, importaciones/exportaciones por lotes.
- Implementar bloqueo distribuido en MySQL, idempotencia, límite por ejecución, reintento con backoff y registro de fallo; evitar solapamientos.
- Mientras no se confirme frecuencia, diseñar para que el trabajo funcione aunque corra cada 15 minutos o más lento. No basar funciones críticas en ejecución por minuto.
- Si una tarea requiere baja latencia, streaming, alto volumen o ejecución constante, marcarla incompatible con este hosting hasta confirmar un servicio externo/VPS aprobado.
- Antes de contar con cron Laravel, ejecutar en staging un job inocuo que pruebe: ruta efectiva del binario PHP, versión y extensiones, arranque de `artisan` de la release, escritura de un registro verificable y prevención de solapamiento. Hasta superar esa prueba, notificaciones y lotes son diseño condicionado, no capacidad confirmada.

## Alternativas descartadas por ahora

| Alternativa | Decisión | Motivo |
|---|---|---|
| PHP nativo | No recomendada | Aumenta el costo de controles de seguridad, arquitectura y mantenimiento para un dominio con roles, auditoría y transacciones. |
| SPA React/Next SSR + API separada | No para producción actual | Requeriría Node/SSR o dos despliegues y aumenta complejidad; Node persistente no está confirmado. |
| Laravel Octane/Horizon/Redis/WebSockets | No | Requieren procesos persistentes o infraestructura no confirmada. |
| Microservicios/Docker | No | No hay Docker, root ni capacidad operacional confirmada. |
| PostgreSQL / BD remota por defecto | No | MySQL local 8 está confirmado; DB remota agrega latencia, seguridad y dependencia sin necesidad demostrada. |
| Laravel 13 / PHP 8.4 | Primera opción condicionada | Requiere comprobar extensiones, paquetes, cron y staging antes de fijarla. |
| Laravel 12 / PHP 8.3 | Contingencia | Solo si la primera opción falla por restricción comprobada del proveedor o extensiones. |

## Requerimientos incompatibles o condicionados

| Posible capacidad futura | Estado en este hosting | Tratamiento antes de implementar |
|---|---|---|
| Chat en tiempo real, presencia, WebSockets | No compatible asumido | Usar polling moderado o aprobar proveedor/VPS. |
| Colas en tiempo real, PDFs/Excel muy pesados, IA, vídeo | Condicionada | Lotes por cron o servicio externo autorizado; medir límites y costos. |
| Importaciones masivas sin interrupción | Condicionada | Particionar, guardar progreso, límites y reanudación; no usar una petición única. |
| Notificaciones inmediatas garantizadas | Condicionada | Dependen de frecuencia cron; diseñar alertas en-app y correo diferido. |
| Archivos muy grandes / antivirus / OCR | No confirmada | Verificar límite de subida, ejecución y almacenamiento; considerar servicio especializado. |
| Alta concurrencia o SLA estricto | No demostrada | Medir carga y límites; prever ruta de migración a VPS/servicio administrado. |

## Matriz de verificaciones pendientes antes de implementar

| Prioridad | Verificación concreta | Decisión que desbloquea | Responsable/evidencia esperada |
|---|---|---|---|
| Bloqueante | Confirmar PHP 8.4 y extensiones Laravel: ctype, curl, dom, fileinfo, filter, hash, mbstring, openssl, pdo_mysql, session, tokenizer, xml, `zip` y `gd` o Imagick según funcionalidad aprobada; repetir para PHP 8.3 si se activa contingencia | Framework y paquete exactos | Capturas de Select PHP Version / `phpinfo()` sin secretos |
| Bloqueante | Confirmar document root configurable a `public/` o alternativa equivalente, rewrite funcional, permisos mínimos y que `.env`, `vendor/`, `storage/` y backups no son accesibles por HTTP | Disposición segura de release | Prueba en subdominio staging |
| Bloqueante | Confirmar método seguro de transferencia (SFTP/FTP), límites de upload/ejecución y cuota de BD | Pipeline de despliegue, adjuntos e importación | Panel/proveedor |
| Bloqueante | Ejecutar cron inocuo de staging: binario/ruta y versión PHP efectiva, extensiones, `artisan`, registro verificable y no solapamiento; confirmar frecuencia mínima | Alertas y tareas diferidas | Job inocuo y salida capturada |
| Bloqueante | Confirmar usuario MySQL con mínimo privilegio, backup/exportación y restauración no destructiva de archivos y BD | Seguridad y recuperación inicial | Evidencia de staging/documentación del proveedor |
| Alta | Confirmar `max_execution_time`, `memory_limit`, `post_max_size`, `upload_max_filesize`, `max_input_vars`, OPcache y `disable_functions` | Importación, exportación, adjuntos y optimización | `phpinfo()`/selector cPanel |
| Alta | Confirmar backups: frecuencia, retención, restauración de archivos y MySQL, cuota de BD y exportación manual | Plan de recuperación | Política del proveedor y prueba no destructiva |
| Alta | Confirmar límites efectivos CPU/RAM/I/O/EP/NPROC/concurrencia y política de suspensión | Presupuesto de carga y escalabilidad | Ticket/proveedor por escrito |
| Alta | Confirmar TLS, WAF/ModSecurity, logs de acceso/error, SMTP autenticado y política de salida; custodiar sus credenciales fuera del repositorio | Seguridad y alertas | Panel y prueba de staging |
| Media | Confirmar cuota/tamaño máximo de cada BD, usuarios/privilegios y si hay eventos MySQL | Diseño operativo y mantenimiento | phpMyAdmin/panel |
| Media | Decidir si Vercel es solo prototipo o frontend definitivo separado | Topología frontend/backend y CORS/auth | Decisión humana |
| Media | Estimar usuarios concurrentes, volumen inicial/crecimiento y tamaño de adjuntos | Índices, lotes, retención y umbral de migración | Cliente/negocio |

`allow_url_fopen` no es requisito de la plataforma: integraciones externas deben usar clientes HTTP con TLS y controles explícitos, o quedar condicionadas a una capacidad aprobada.

## Criterios de aceptación para la auditoría

- La evidencia humana está transcrita sin introducir capacidades no confirmadas.
- La recomendación principal define framework, PHP, base de datos, ejecución diferida y topología operativa.
- Todo uso de Composer, Node, cron, adjuntos y despliegue declara sus condiciones y no depende de CLI de producción.
- Las alternativas descartadas y las incompatibilidades son explícitas.
- La matriz separa verificaciones bloqueantes, altas y medias y vincula cada una a una decisión.
- No se modifica código, stack definitivo, ADR, `PROJECT-STATE.md` ni configuración de producción.

## Frenos aplicables

- Esta ORDEN no autoriza instalar Laravel, Composer, Node ni dependencias; tampoco seleccionar PHP en producción.
- No crear ni modificar bases de datos, cron, PHP selector, cuentas, dominio, cPanel ni despliegues.
- No subir fuentes o datos de la clienta, ni activar correo real, ni usar acceso remoto MySQL.
- La aprobación del Auditor solo habilita presentar la propuesta al humano. Adoptar el stack definitivo requiere autorización humana y ADR aprobado.

## Fuentes técnicas consultadas

- Laravel 12 requiere PHP >=8.2 y enumera las extensiones base: https://laravel.com/framework/docs/12.x/deployment
- Compatibilidad de Laravel 12 y PHP 8.2–8.5: https://laravel.com/framework/docs/12.x/releases
