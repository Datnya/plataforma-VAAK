---
artifact_type: PROJECT_STATE
phase: "0"
ref: "VAAK-RESEARCH-0-A"
from: architect_chief
to: reviewer_auditor
status: in_progress
blocking: false
created_at: "2026-08-25"
---

# PROJECT-STATE.md — Investigación de modernización VAAK

> Fuente de verdad compartida para la REF `VAAK-RESEARCH-0-A`.
> `architect_chief` la actualiza al cierre de cada subfase y VEREDICTO; `reviewer_auditor` la contrasta contra evidencia.

**Última actualización:** 2026-08-28 · **Por:** Codex (estrategia PHP/staging independiente aprobada documentalmente; investigación R0–R7 sigue abierta)

## 1. Qué es el proyecto

Investigación previa a la modernización de una plataforma empresarial de gestión. Debe reconstruir con trazabilidad las funciones del software antiguo y los requerimientos OS&E, y después comparar stacks compatibles con las restricciones reales de Perú Hosting. No existe aplicación persistente de producto ni stack autorizado; sí existe un prototipo visual local, estático y aprobado bajo `VAAK-IMPLEMENTATION-1-A`.

## 2. Fase actual

**→ Fase 0 — Investigación. R0 y el procesamiento documental tienen evidencia operativa posterior al checkpoint inicial; la investigación aún no cuenta con ENTREGA/VEREDICTO final R6–R7.**

- REF estable: `VAAK-RESEARCH-0-A`.
- ORDEN vigente: `HANDOFF/ORDEN-VAAK-RESEARCH-0-A.md`.
- Autorización: el VEREDICTO R2 aprobado y la instrucción humana vigente habilitan R0–R7, salvo frenos humanos.
- Límite actual de este checkpoint: no analizar contenido, no crear cuaderno remoto y no editar producto.

## 3. Mapa de subfases

| Subfase | Resultado | Estado |
|---|---|---|
| R0 | Manifiesto, memoria, preflight MCP/privacidad, título idempotente y creación segura del cuaderno | ⚠️ EVIDENCIA OPERATIVA POSTERIOR; falta consolidación auditada |
| R1 | Piloto DOCX+PDF y cobertura recuperable de los 12 documentos lógicos | ⚠️ PROCESAMIENTO LOCAL EVIDENCIADO; falta consolidación auditada |
| R2 | Fichas documentales y matriz funcional trazable | ⬜ PENDIENTE DE CONSOLIDACIÓN |
| R3 | Catálogo consolidado, procesos actual/objetivo y contradicciones | ⬜ PENDIENTE DE CONSOLIDACIÓN |
| R4 | Restricciones verificadas del hosting y sobre de carga | ⚠️ EVIDENCIA REGISTRADA; falta consolidación dentro de la investigación R0–R7 |
| R5 | Comparación de al menos tres alternativas | ⬜ PENDIENTE |
| R6 | ENTREGA final consolidada por el Arquitecto | ⬜ PENDIENTE |
| R7 | Auditoría final independiente | ⬜ PENDIENTE |

## 4. Registro de ORDEN y VEREDICTOS

| Ciclo | Artefacto | Estado/resultado | Evidencia |
|---:|---|---|---|
| 1 | `HANDOFF/ORDEN-VAAK-RESEARCH-0-A.md` (versión inicial) | `draft_for_review` | ORDEN emitida con la REF estable |
| 1 | `HANDOFF/VEREDICTO-INICIAL-VAAK-RESEARCH-0-A.md` | `CAMBIOS SOLICITADOS` | H-01…H-05 y N-01/N-02 |
| 2 | `HANDOFF/ORDEN-VAAK-RESEARCH-0-A.md` (revisión 2) | `revised_for_review` | Correcciones incorporadas sin iniciar investigación |
| 2 | `HANDOFF/VEREDICTO-INICIAL-R2-VAAK-RESEARCH-0-A.md` | `APROBADO` | R0 autorizado; `blocking: false` |
| Hosting | `HANDOFF/ORDEN-VAAK-HOSTING-1-A.md` | `revised_for_review` | Recomendación condicionada: Laravel 13 + PHP 8.4, con contingencia Laravel 12 + PHP 8.3 |
| Hosting | `HANDOFF/VEREDICTO-VAAK-HOSTING-1-A.md` | `RECHAZADO` | Tercera revisión: recomendación técnicamente condicionada, pero rechazo formal por omisión documental; no es ADR ni autoriza producción |
| PHP/staging | `HANDOFF/VEREDICTO-VAAK-PHP-STRATEGY-2-A.md` | `APROBADO` (ciclo 2) | Mantener PHP global sin cambios; priorizar staging temporal independiente y release externa reproducible; no autoriza contratación ni despliegue |

El contador global lleva dos ciclos. R7 será la tercera revisión ordinaria disponible. Si R7 solicita cambios, se detiene el ciclo y se escala al humano; no habrá una cuarta revisión silenciosa con esta REF.

## 5. Evidencia verificada en R0

### MCP de NotebookLM

- Autenticación restaurada el 2026-08-25.
- `notebook_list` ejecutado exitosamente el 2026-08-25.
- Resultado: 4 cuadernos; 4 propios; 0 compartidos; 0 compartidos por esta cuenta.
- Título estable planificado: `VAAK — Investigación de stack y modernización — VAAK-RESEARCH-0-A`.
- Coincidencias exactas del título estable en la lista actual: 0.
- Se observó un cuaderno diferente llamado `Guía de Cargos e Informes de Artículos en Exxpedite`, con 12 fuentes; no se reutilizó, renombró ni eliminó.
- No se invocó `notebook_create`, `notebook_add_text`, `notebook_add_drive` ni `notebook_add_url` en este checkpoint.

### Corpus local (checkpoint inicial)

- 12/12 documentos obligatorios existen y fueron identificados sin abrir su contenido funcional.
- 11 archivos DOCX y 1 archivo PDF.
- Tamaño total verificado: 5,240,006 bytes.
- Tamaños y hashes SHA-256 constan en `docs/research/VAAK-RESEARCH-0-A/00-source-manifest.md`.
- Este checkpoint dejó pendientes los conteos, extracción, escaneo y análisis profundo; la evidencia local posterior se registra en la reconciliación, sin atribuirle aprobación.

## 6. Decisiones vigentes

1. La única REF de esta investigación es `VAAK-RESEARCH-0-A`.
2. Los documentos lógicos obligatorios usan IDs `LEG-01`…`LEG-11` y `NEW-01`.
3. La ruta remota aprobada es `extracción local trazable → notebook_add_text`; el MCP activo no ofrece carga local directa.
4. Antes de cargar contenido se debe verificar que el cuaderno sea propio/no compartido y completar detección de secretos/datos sensibles.
5. El título remoto estable será `VAAK — Investigación de stack y modernización — VAAK-RESEARCH-0-A`.
6. Ningún cuaderno preexistente se reutiliza, renombra o elimina sin procedencia inequívoca y autorización aplicable.
7. `VAAK PROCUREMENT - FF&E INPUTS (1).pdf` no pertenece al corpus obligatorio de doce documentos; `VAAK-UX-1-A` autorizó su uso como referencia UX suplementaria, pero no su carga a NotebookLM ni la reutilización de datos o activos fuera de ese alcance.
8. No hay stack seleccionado ni ADR tecnológico aprobado.
9. `architect_chief` mantiene este estado; `reviewer_auditor` lo audita, pero no lo edita.

## 6B. Evidencia humana de hosting VAAK-HOSTING-1-A (2026-08-26)

La ficha entregada por la humana se registró íntegramente en `docs/research/VAAK-RESEARCH-0-A/02-hosting-constraints.md`. Los hechos de mayor impacto son: PHP seleccionable hasta 8.4 (dominio hoy en 7.3, que no se usará), MySQL 8.0.43 local, cron PHP disponible y ausencia no confirmada de SSH, terminal y Composer en producción. Los recursos CPU/RAM/I/O/EP/NPROC/concurrencia y varios límites operativos siguen desconocidos.

El VEREDICTO final `VAAK-HOSTING-1-A` fue `RECHAZADO` por una omisión documental en su tercera revisión. La recomendación de monolito modular Laravel 13 + PHP 8.4 + MySQL 8.0.43 fue considerada técnicamente conforme y permanece reutilizable sólo como evidencia condicionada, con Laravel 12 + PHP 8.3 como contingencia demostrable. No hay versión PHP, framework ni ADR tecnológico final; tampoco existe autorización para modificar cPanel, instalar dependencias, crear BD, configurar cron o desplegar.

Las pruebas bloqueantes incluyen extensiones de PHP, webroot seguro y rewrite, transferencia y permisos, cron inocuo, backups/restauración, privilegios/quotas MySQL, SMTP/TLS/WAF/logs y límites efectivos del proveedor. Los procesos persistentes, WebSockets, Horizon, Octane, Docker, Node persistente y workers no forman parte de la capacidad asumida.

## 6C. Contratos de acceso y topología temporal VAAK-ACCESS-1-A (2026-08-26)

La humana definió tres roles de requisitos: **Admin**, con administración integral de usuarios, roles y permisos; **Trabajador**, con mínimo privilegio y sólo secciones habilitadas explícitamente por Admin; y **Cliente**, con lectura limitada de reportes autorizados de su propio proyecto/empresa y consulta de tracking. Los contratos vivos se mantienen en `docs/roles/`; describen requisitos, no accesos reales ni un modelo de autorización ya aprobado.

El tracking de Cliente debe usar códigos opacos de alta entropía, limitación de tasa, expiración, revocación, respuesta mínima uniforme y controles contra enumeración. El código no otorga acceso general a reportes ni a datos empresariales.

La topología temporal Vercel/cPanel/GitHub sigue **pendiente de decisión humana** en `HANDOFF/PREGUNTA-VAAK-ACCESS-1-A.md`. GitHub no alojará datos operativos, adjuntos, respaldos, `.env` ni exportaciones de base de datos; Vercel no se tratará como base de datos. No se configuró conexión remota a MySQL ni infraestructura alguna.

## 6D. Preflight de staging HPG Latam VAAK-STAGING-2-A (2026-08-26)

La evidencia primaria `C:\Users\HP\Downloads\Informe_Preflight_Staging_HPG_Latam_Codex.pdf` (23 páginas) fue revisada y resumida en `docs/research/VAAK-RESEARCH-0-A/03-staging-preflight-hpgilatam.md`. Se confirma que `staging.hpgilatam.com` tiene document root aislado en `/home/wwwhpgilatam/staging.hpgilatam.com/public`; el informe confirma MySQL 8.0.43 local, File Manager, FTP, cron mínimo de un minuto y ModSecurity activo para staging. No se realizó cambio remoto.

El conflicto histórico de DNS/TLS quedó superado el 2026-08-28: la zona autoritativa real está en Microsoft, se publicó `staging A 144.217.195.178` con TTL de una hora y se reemitió un certificado Let's Encrypt válido. HTTPS responde correctamente. El bloqueo vigente es PHP: soporte confirmó hosting compartido sin MultiPHP y un PHP Selector global, por lo que cambiar desde PHP 7.3 puede afectar `hpgilatam.com`.

PHP 8.4 sigue siendo sólo una opción del selector global, no una asignación aislable para staging. Las extensiones observadas y los límites `memory_limit=512M`, `upload_max_filesize=64M`, `post_max_size=64M`, `max_execution_time=900` y `max_input_time=900` pertenecen a la configuración actual y no se extrapolan a PHP moderno. Bajo la evidencia vigente SSH, Terminal, SFTP y Composer en servidor se tratan como no disponibles. Backups: semanales, retención dos semanas, externos y restauración por ticket; no existe prueba de restauración. La REF `VAAK-PHP-STRATEGY-2-A` aprobó documentalmente priorizar staging temporal independiente y preparar una futura release reproducible fuera del servidor, sin adoptar Laravel/PHP ni autorizar despliegue.

## 6O. Estrategia PHP y staging independiente VAAK-PHP-STRATEGY-2-A (2026-08-28)

El VEREDICTO del ciclo 2 fue `APROBADO`. No se tocará el selector PHP global ni se usará el sitio principal como banco de pruebas. La dirección segura es evaluar un entorno temporal independiente para desarrollo/preflight; sólo si después se adopta un stack con Composer, la release se construirá fuera del servidor con runtime equivalente, `composer.lock`, `vendor/`, activos compilados, hashes/manifiesto y sin secretos. El único siguiente paso es una decisión humana no mutante entre obtener una propuesta documentada de cuenta cPanel separada del proveedor actual o comparar primero una alternativa externa independiente. La interfaz local no cambia por esta decisión.

## 6E. Referencia UX VAAK-UX-1-A (2026-08-26)

La humana autorizó `VAAK PROCUREMENT - FF&E INPUTS (1).pdf` como referencia visual y fuente suplementaria de especificaciones. Sus seis páginas fueron revisadas visualmente y se registraron en `docs/ux/VAAK-UX-REFERENCE.md` y `docs/research/VAAK-RESEARCH-0-A/04-interface-requirements-matrix.md`.

Requisitos explícitos registrados: dashboard con fotografías de proyectos; información relevante en la página inicial de cada proyecto; información general/comités/fechas; habitaciones y tipologías; áreas comunes con venue y ubicación; miembros del equipo cliente y cargos; categorías con tareas internas, checklist y responsables; y PDF de fichas SPEC, órdenes de compra y payment requests. Navegación, tablero Kanban, acciones de edición, filtros, estados, bibliotecas, plantilla y generación efectiva de PDFs siguen como inferencias o pendientes de diseño.

El PDF contiene datos aparentes de personas, negocios, contactos, imágenes, documentos e importes. No se reutilizan como datos de producto, semillas, demos o activos sin autorización. No se actualizaron los contratos de roles: el PDF no asigna facultades inequívocas a Admin, Trabajador o Cliente y no amplía permisos. Esta evidencia no cambia la arquitectura, el stack, staging ni los bloqueos DNS/TLS/PHP.

## 6F. Blueprint funcional VAAK-FUNCTIONAL-1-A (2026-08-26)

El VEREDICTO final `VAAK-FUNCTIONAL-1-A` fue `APROBADO`. Se entregaron `docs/functional/VAAK-FUNCTIONAL-BLUEPRINT.md` y `docs/functional/VAAK-ROLE-PERMISSIONS.md`, junto con contratos actualizados de Admin, Worker y Client. Son requisitos trazables aprobados, no código ni permisos implementados.

Decisiones humanas registradas: Worker ve todos los datos de sus proyectos asignados; puede gestionar SPECs y proveedores, y crear/emitir Purchase Orders en ese ámbito sin revisión obligatoria de Admin. Sólo puede cambiar el estado de sus propias tareas. Admin supervisa y administra usuarios, con deshabilitación inmediata y conservación de actividad mediante archivo lógico; la eliminación física queda limitada a cuentas sin actividad y requiere diseño posterior. Client inicia sesión sólo para reportes y POs autorizadas; tracking sigue siendo público, mínimo y separado del portal.

En el blueprint aprobado, la interfaz final para la clienta se especificó en English y `Tax ID` quedó como término genérico; el prototipo local posterior trabaja temporalmente en español con preferencia individual por usuario. Esta sección histórica no creó código ni infraestructura. DNS/TLS de staging quedaron resueltos el 2026-08-28; permanece bloqueado el runtime PHP por su alcance global, además de las decisiones sobre plantilla/lifecycle de PO, seguridad de sesión, permisos de edición y visibilidad detallada de documentos Client.

## 6G. ORDEN de implementación local VAAK-IMPLEMENTATION-1-A (2026-08-26)

La ORDEN `VAAK-IMPLEMENTATION-1-A` fue aprobada, recibió autorización humana y se ejecutó dentro del alcance local sin dependencias. El incremento produjo el prototipo visual descartable registrado en §6H; no adopta Laravel/PHP ni crea usuarios, credenciales, persistencia, repositorio Git o infraestructura.

## 6H. Ejecución local VAAK-IMPLEMENTATION-1-A (2026-08-26)

La ORDEN `VAAK-IMPLEMENTATION-1-A` recibió VEREDICTO independiente `APROBADO` y autorización humana explícita para ejecutar exclusivamente el prototipo visual local. Se crearon `prototype/index.html`, `prototype/styles.css`, `prototype/app.js` y `prototype/README.md`; la ENTREGA y el VEREDICTO final aprobado constan en `HANDOFF/`.

El artefacto presenta Login, Admin, Worker, Client y Public Tracking mediante selector visual, usando el logo VAAK local autorizado, estética brown/white/gold y texto visible en English. No contiene autenticación, backend, datos persistentes, cuentas, contraseñas, secretos, dependencias, recursos remotos, Git, infraestructura ni despliegue. La inspección estructural confirmó las referencias exclusivamente locales y ausencia de manifests/configuración excluida; una coincidencia del término `password` corresponde al eye toggle permitido.

El navegador de revisión bloqueó la ruta local `file://`; no se intentó eludirlo ni se levantó un servidor. La comprobación visual humana es abrir directamente `prototype/index.html` y cambiar las vistas con **Preview**. El VEREDICTO final aprobó y cerró esta REF; cualquier incremento posterior requiere otra REF.

## 6I. Transferencia documental VAAK-TRANSFER-1-A (2026-08-26)

La ORDEN `VAAK-TRANSFER-1-A` recibió VEREDICTO `APROBADO` y autorización humana para ejecución documental. Se creó el archivo raíz exacto `Transferencia de información.md`, se reconciliaron hechos obsoletos demostrables de Brain/State y se preparó `HANDOFF/ENTREGA-VAAK-TRANSFER-1-A.md`. La humana indicó después que este trabajo documental no requiere un ciclo adversarial final y estableció handoff selectivo como regla general. La transferencia queda activa por instrucción humana directa; los artefactos de la REF se conservan como historial. No autoriza código, Git, dependencias, copia física, cuentas, red, despliegue ni infraestructura.

La ORDEN exige exponer y reconciliar sin borrar historia las desalineaciones ya verificadas: el prototipo tiene VEREDICTO final aprobado aunque este State aún lo describe pendiente; la REF Hosting fue formalmente rechazada aunque su recomendación técnica condicionada se consideró conforme; la topología A/B no está reconciliada; y el PDF UX pasó de suplementario no autorizado a referencia UX aprobada sin integrarse al corpus principal de doce documentos.

## 6J. Demo local interactiva de interfaz (2026-08-27)

Por autorización humana, `prototype/` dejó de ser sólo una maqueta de navegación y ahora es una demo local interactiva sin dependencias. Incluye tres cuentas ficticias de demostración (Admin, Worker y Client), persistencia exclusivamente mediante `localStorage`, formularios y operaciones de UI para proyectos, usuarios, proveedores, SPECs, objetivos, Purchase Orders, historial Client y tracking público mínimo. El logo VAAK se amplió para darle mayor presencia visual.

No es autenticación ni autorización real: credenciales y datos son ficticios, visibles en el código cliente y sólo aptos para esta demo. No hay backend, base de datos, red, PDFs, correos, APIs, despliegue ni conexión con staging. La implementación real de identidad, seguridad y permisos de servidor sigue pendiente y requerirá el tratamiento proporcional al riesgo definido en `AGENTS.md`.

## 6K. Refinamiento visual de interfaz local (2026-08-27)

Por instrucción humana, la interfaz local adopta navegación horizontal superior sin barra lateral, una estética profesional basada sólo en la dirección visual de la referencia aprobada, tarjetas de portafolio y perfil de usuario destacado. Se eliminó del contenido visible toda indicación de que la interfaz es una versión local o de demostración. El activo `LOGO VAAK.png` se sirve desde la raíz del workspace para resolver correctamente su ruta compartida; el servidor local se abre en `http://127.0.0.1:4173/`.

## 6L. Ajuste de login y orden del dashboard (2026-08-27)

Por instrucción humana, el login muestra el logo VAAK centrado en el panel blanco, encima de “Welcome to VAAK”; el panel marrón conserva únicamente el hook “Clear progress for every project.”. El logo se amplió tanto en el login como en la cabecera del dashboard. Para Admin y Worker, la primera sección funcional del dashboard es `PROJECTS`, con tres tarjetas ficticias navegables; cada tarjeta abre ahora los datos del proyecto seleccionado. Debajo se muestra `GENERAL OBJECTIVES` con descripción, fecha de creación, fecha de vencimiento, responsable y estado. Estos cambios siguen siendo solamente interfaz y datos ficticios de navegador; no modifican la arquitectura ni los contratos de roles.

## 6M. Imágenes de proyectos, herramientas y Purchase Orders por proyecto (2026-08-27)

Se generaron y guardaron tres imágenes referenciales ficticias con la habilidad de generación de imágenes en `prototype/assets/projects/`; se usan como cubiertas de las tres tarjetas de proyecto. Las tarjetas completas son navegables y ya no muestran estado. La navegación superior para Admin y Worker se redujo a `Dashboard` y `Tools`; las herramientas Admin se presentan como tarjetas para gestión de usuarios, proveedores y configuración del sistema. La vista del proyecto incluye galería con máximo de cinco imágenes adicionales y el formulario de alta incluye cubierta de proyecto. También incorpora historial de Purchase Orders y generación de una nueva PO: el registro se vincula al proyecto y se publica automáticamente en el historial visible del portal Client en esta interfaz local. No hay almacenamiento ni autorización de servidor.

## 6N. Idioma individual y corrección de navegación (2026-08-27)

La interfaz local se trabaja en español por preferencia humana. La preferencia Español/English se almacena de forma independiente por sesión de usuario en el navegador. Se corrigió una regresión de la capa de traducción: el observador de mutaciones se activaba sobre sus propias modificaciones de texto y podía bloquear la interacción después de un cambio de vista. Ahora modifica sólo contenido nuevo y únicamente cuando una traducción cambia el texto. La navegación de tarjetas de proyecto, botones y demás secciones conserva el flujo de rutas local.

## 6O. Corrección visual del staging Vercel (2026-08-29)

Por instrucción humana, el despliegue temporal en `https://vaak-hpg-staging.vercel.app` vuelve a servir como capa visual canónica la interfaz completa de `prototype/`, sin rediseñar el login, dashboard, navegación, proyectos ni herramientas. Se eliminaron del contenido visible los avisos de entorno temporal, prueba o datos ficticios. El acceso del prototipo se conectó a Supabase mediante un puente de autenticación que conserva los nombres de usuario `admin.vaak`, `worker.vaak` y `client.vaak`; la validación de sesión, membresía activa y rol se ejecuta en servidor. Las operaciones funcionales heredadas del prototipo continúan almacenándose localmente en el navegador hasta su migración progresiva a las tablas `vaak_*`; por tanto, esta corrección garantiza fidelidad visual y autenticación real de staging, pero no declara todavía persistencia remota completa de cada módulo. Release verificado: `vaak-staging-20260829-002`, deployment `dpl_Bx5fEarYBMwAtBUnU9UDR3grADQU`.

## 6A. Reconciliación documental VAAK-BRAIN-1-A (2026-08-26)

Esta sección preserva el checkpoint inicial y corrige únicamente afirmaciones desmentidas por artefactos locales verificables. La existencia de artefactos no equivale a cierre ni aprobación de R0–R7.

| Afirmación previa | Evidencia verificable | Estado reconciliado |
|---|---|---|
| No se contaron páginas/secciones ni se ejecutó extracción/renderizado. | `docs/research/VAAK-RESEARCH-0-A/_working/corpus-summary.json` describe 12 documentos, 61 páginas renderizadas y textos de trabajo; existen 99 archivos de trabajo y 61 imágenes de página. | Obsoleta: se ejecutaron procesamiento, extracción y renderizado locales posteriores al checkpoint. |
| La detección de secretos estaba pendiente. | El mismo resumen registra `blocking_secret_findings: []` y `secret_findings: []` para los 12 documentos. | Obsoleta para las copias analizadas; no sustituye un control futuro si cambian las fuentes. |
| El análisis documental todavía no se había iniciado. | El resumen contiene metadatos, estructura y texto de trabajo de los 12 documentos. | Obsoleta: el análisis técnico/documental fue iniciado. La consolidación funcional y auditoría siguen pendientes. |
| No se creó el cuaderno remoto. | No existe en el workspace una evidencia local canónica que permita comprobarlo por sí sola. | No se modifica aquí; requiere evidencia MCP trazable para declararlo como hecho de State. |

**Inventario observado:** 99 archivos en `docs/research/VAAK-RESEARCH-0-A/_working/`, 61 imágenes de página y 11 PDF de trabajo renderizados. El manifiesto inicial sigue siendo historial y no fue reescrito.

## 7. Preguntas abiertas

### Condicionan el cierre de la recomendación

1. ¿Qué runtime, extensiones, webroot/rewrite, transferencia segura y límites efectivos tendrá el staging independiente que se decida evaluar? En la cuenta actual no se usará el selector PHP global para esta prueba.
2. ¿Cuáles son los límites reales de CPU, procesos, memoria contabilizada, I/O, conexiones, base de datos, archivos y restauración de backups?
3. ¿El frontend se moverá físicamente desde Vercel al hosting final o seguirá en Vercel bajo el dominio oficial?

### No bloquean R0–R3

4. ¿Cuántos usuarios totales/concurrentes se esperan ahora y a tres años?
5. ¿Qué roles, aprobaciones y segregación de funciones existen?
6. ¿Qué volumen de base/archivos existe y cuánto crece?
7. ¿Qué mecanismos de exportación/API/backup ofrece el sistema antiguo?
8. ¿Qué integraciones son obligatorias?
9. ¿Qué datos sensibles, retención y auditoría exige la empresa?
10. ¿Se exige móvil, WCAG formal, offline o idiomas adicionales?
11. ¿Debe añadirse `VAAK PROCUREMENT - FF&E INPUTS (1).pdf` al corpus principal o a NotebookLM? Actualmente sólo está autorizado como referencia UX suplementaria.
12. ¿Qué funciones antiguas se descartan y cuáles son críticas para el primer lanzamiento?

## 8. Riesgos abiertos

| # | Riesgo | Severidad | Mitigación/estado |
|---:|---|---|---|
| 1 | La autenticación MCP puede volver a expirar | Alta | Verificar `notebook_list` antes de cada operación remota sensible |
| 2 | Duplicar cuaderno o fuentes por reintentos | Alta | Título estable, búsqueda previa, hashes y ledger idempotente |
| 3 | Cargar inadvertidamente secretos o datos restringidos | Crítica | Escaneo/clasificación previa; bloquear el documento ante hallazgo |
| 4 | Propiedad/no compartición no comprobada tras crear | Alta | Recuperar metadatos antes de la primera fuente |
| 5 | Extracción textual pierde tablas, capturas o diagramas | Alta | Conteo/renderizado y revisión visual posterior, aún pendiente |
| 6 | Manuales no reflejan el uso real | Alta | Trazabilidad, confianza y validación posterior con usuarios |
| 7 | Restricciones comerciales y técnicas del hosting son incompletas | Crítica | Checklist de staging, evidencia del proveedor y recomendación condicionada |
| 8 | Faltan datos reales de carga | Alta | Escenarios bajo/esperado/límite aprobados en la ORDEN |
| 9 | Solo queda una revisión ordinaria bajo el contador global | Alta | Preparar R6 con evidencia completa; escalar si R7 solicita cambios |

## 9. Desviaciones y límites del checkpoint

- R0 se inició de forma escalonada por instrucción humana: este checkpoint crea memoria y manifiesto, pero no completa R0.
- No se creó el cuaderno remoto, aunque forma parte del resultado final de R0.
- No se abrió ni analizó contenido funcional de los doce documentos.
- El checkpoint inicial no ejecutó esos controles, pero hay evidencia posterior de procesamiento local, extracción, renderizado y escaneo sin hallazgos bloqueantes; falta consolidarla y auditarla bajo la REF de investigación.
- No se creó el ledger remoto ni se ejecutó el piloto de R1.
- No se modificó código, dependencias, configuración de runtime ni producto.

## 10. Siguiente paso

El siguiente paso inmediato es copiar la carpeta completa al nuevo equipo y verificar integridad y rutas con `Transferencia de información.md`. No hace falta activar handoff para esa comprobación de bajo riesgo; se usará sólo si la humana lo pide o aparece complejidad/riesgo material. Para staging sigue pendiente revalidar o resolver DNS público antes de TLS o PHP. La investigación R0–R7 continúa abierta: consolidar evidencia R0–R4, recuperar evidencia MCP trazable y completar R2–R7 sin adoptar stack ni ADR.

## 11. Frenos humanos vigentes

Siguen requiriendo autorización humana específica: operaciones destructivas; producción/despliegue/push/merge; secretos o cambios sensibles; gasto externo mayor a USD 5; proveedores en modo real; adopción definitiva del stack; cambio de producto o ADR aprobado; compartir el cuaderno; cargar fuentes fuera del corpus autorizado.

## 12. Actualización local — VAAK-UI-ACCESS-4-A

El 2026-09-01 se completó en localhost la reconstrucción fiel aceptada por la humana y el control de accesos por usuario. El diseño R2 fue aprobado antes de implementar. Admin conserva acceso inmutable; Worker/Client tienen siete permisos editables y alcance de proyectos seleccionado o dinámico `all`. No hubo deploy ni cambios en staging. Evidencia: `HANDOFF/ENTREGA-VAAK-UI-ACCESS-4-A.md`.
