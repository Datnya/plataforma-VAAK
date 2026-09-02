---
artifact_type: TRANSFER_GUIDE
phase: "documentation_transfer"
ref: "VAAK-TRANSFER-1-A"
from: codex
to: human
status: active
blocking: false
created_at: "2026-08-26"
updated_at: "2026-08-26"
---

# Transferencia de información — Plataforma VAAK

> Este archivo es un índice de transferencia derivado para reanudar el proyecto en otro equipo Windows. No sustituye [AGENTS.md](AGENTS.md), [PROJECT-BRAIN.md](PROJECT-BRAIN.md), [PROJECT-STATE.md](PROJECT-STATE.md), los futuros ADR ni los artefactos de [HANDOFF/](HANDOFF/). Ante discrepancias, prevalecen las fuentes canónicas y la evidencia verificable según su ámbito.

La instrucción humana original y el alcance aprobado se conservan literalmente en [HANDOFF/ORDEN-VAAK-TRANSFER-1-A.md](HANDOFF/ORDEN-VAAK-TRANSFER-1-A.md). Esta entrega no autoriza código adicional, despliegue, Git, cuentas, secretos ni cambios de infraestructura.

## 1. Identidad, objetivo y alcance real

**Nombre:** Plataforma VAAK.

**Objetivo de negocio:** modernizar la gestión empresarial de la clienta y reemplazar un software legado local, lento y con acceso remoto limitado por una plataforma web rápida, moderna, minimalista, multiusuario, segura, trazable y mantenible.

**Dominio funcional:** gestión de proyectos y compras de FF&E/OS&E. Incluye como vocabulario y alcance progresivo: proyectos, áreas y ambientes, SPEC, fabricantes/proveedores, cantidades, cargos, monedas, órdenes de compra, facturas, pagos, entregas, reportes y auditoría.

### Clasificación de lo existente

| Clasificación | Estado transferido |
|---|---|
| Aprobado | Gobierno proporcional con handoff selectivo; Brain activo; contratos funcionales de Admin/Worker/Client; referencia UX; análisis de staging; prototipo visual local estático. |
| Evidencia, no decisión | Corpus legado, requerimiento OS&E, preflight histórico de cPanel, restricciones de hosting y artefactos locales de extracción/renderizado. |
| Recomendación condicionada | Monolito modular Laravel 13 + PHP 8.4 + MySQL 8.0.43; contingencia Laravel 12 + PHP 8.3 si staging demuestra una incompatibilidad. |
| Pendiente | ADR tecnológico, arquitectura definitiva, topología temporal reconciliada, investigación R2–R7, seguridad de autenticación, modelo de datos, PDFs operativos y despliegue. |
| No existe | Aplicación persistente, backend, base de datos del producto, cuentas reales o demo, credenciales, despliegue Laravel y conexión operativa Vercel–cPanel. |

## 2. Cómo copiar el workspace a otro Windows

La opción más segura es copiar la carpeta raíz completa, conservando exactamente nombres, espacios, acentos, archivos ocultos y estructura relativa. Una ruta corta y estable sugerida es `C:\Projects\Plataforma VAAK`; es sólo una recomendación local, no una ruta canónica.

### Debe viajar con la carpeta

- `.codex/`, incluidos `config.toml` y los dos agentes locales.
- `HANDOFF/`, `docs/`, `prototype/` y `Documentos de plataforma antigua/`.
- `AGENTS.md`, `PROJECT-BRAIN.md`, `PROJECT-STATE.md` y este archivo.
- `OS&E_Requerimiento Sistema (1).pdf`, `VAAK PROCUREMENT - FF&E INPUTS (1).pdf` y `LOGO VAAK.png`.
- `mcp_config.json`, entendiendo que su ruta absoluta debe corregirse o recrearse en el equipo nuevo.
- `tmp/` si se desea conservar la evidencia renderizada completa. Es material de trabajo regenerable, no fuente canónica; si se omite por espacio, registrar la omisión y conservar los originales.

### No copiar como parte del proyecto

- Contraseñas, claves, tokens, cookies, perfiles de navegador, archivos `.env` o credenciales de cPanel, FTP, MySQL, Google, NotebookLM, Vercel o GitHub.
- Carpetas privadas de perfiles de aplicaciones o sesiones del equipo anterior.
- Dumps, backups, adjuntos o datos operativos reales que no estén autorizados y clasificados.

Las rutas absolutas del equipo anterior son evidencia histórica y dependiente del dispositivo. No ejecutar reemplazos globales de `C:\Users\HP\...`: inspeccionar cada referencia, decidir si debe seguir siendo histórica o actualizarse y verificar el destino.

## 3. Arranque de Codex y criterio de trabajo

1. Abrir Codex seleccionando la nueva **raíz del workspace**. No iniciar desde `HANDOFF/`, `docs/` ni `prototype/` mientras no exista una raíz Git verificable.
2. Leer, en este orden: [AGENTS.md](AGENTS.md) → [PROJECT-BRAIN.md](PROJECT-BRAIN.md) → [PROJECT-STATE.md](PROJECT-STATE.md) → ORDEN/ENTREGA/VEREDICTO de la REF activa → documentación funcional, roles, UX o research pertinente.
3. Confirmar que `.codex/config.toml` y los perfiles locales existen; son herramientas disponibles, no un flujo obligatorio para cada acción.
4. Resolver directamente tareas pequeñas, claras, locales y reversibles. No crear una REF ni activar dos agentes sólo por documentación rutinaria, consultas, inspecciones o ajustes acotados.
5. Activar `architect_chief` → `reviewer_auditor` sólo si la humana lo solicita o si hay complejidad/riesgo material: arquitectura transversal, seguridad, datos, producción, despliegue, infraestructura o decisiones costosas de revertir. En ese caso aplicar la REF estable y el máximo de tres ciclos descritos en `AGENTS.md`.

### Orden de lectura por tema

- Gobierno: los cinco archivos raíz de [HANDOFF/](HANDOFF/) indicados por `AGENTS.md`.
- Funcional: [blueprint](docs/functional/VAAK-FUNCTIONAL-BLUEPRINT.md), [matriz de permisos](docs/functional/VAAK-ROLE-PERMISSIONS.md) y [roles](docs/roles/README.md).
- UX: [referencia UX](docs/ux/VAAK-UX-REFERENCE.md) y [matriz trazable](docs/research/VAAK-RESEARCH-0-A/04-interface-requirements-matrix.md).
- Hosting/staging: [restricciones](docs/research/VAAK-RESEARCH-0-A/02-hosting-constraints.md) y [preflight](docs/research/VAAK-RESEARCH-0-A/03-staging-preflight-hpgilatam.md).
- Investigación: [manifiesto del corpus](docs/research/VAAK-RESEARCH-0-A/00-source-manifest.md) y ORDEN `VAAK-RESEARCH-0-A`.

## 4. Estado exacto de las REF

| REF | Propósito | Artefactos | Veredicto final real | Estado y consecuencia |
|---|---|---|---|---|
| `VAAK-RESEARCH-0-A` | Investigación de funciones y stack | ORDEN; sin ENTREGA final | Sólo el plan R2 fue `APROBADO` | **Abierta.** R0–R4 tienen evidencia parcial; R2–R7 y cierre final siguen pendientes. No hay stack adoptado. |
| `VAAK-BRAIN-1-A` | Memoria estable | ORDEN, ENTREGA, VEREDICTO | `APROBADO` | **Cerrada.** `PROJECT-BRAIN.md` está activo. |
| `VAAK-HOSTING-1-A` | Viabilidad técnica en cPanel | ORDEN, ENTREGA, VEREDICTO | `RECHAZADO` | **Cerrada por rechazo.** La recomendación técnica condicionada es evidencia reutilizable, no ADR ni REF aprobada. |
| `VAAK-ACCESS-1-A` | Roles, tracking, hosting y topología | ORDEN, ENTREGA, PREGUNTA, VEREDICTO | `RECHAZADO` | **Cerrada por rechazo documental.** Las correcciones de hosting y requisitos conformes no fueron invalidados. |
| `VAAK-ACCESS-1-B` | Cláusula viva de mantenimiento de roles | ORDEN, ENTREGA, VEREDICTO | `APROBADO` | **Cerrada.** Cada contrato debe actualizarse cuando cambien sus capacidades. |
| `VAAK-STAGING-1-A` | Preflight de sólo lectura | ORDEN y VEREDICTO; no ENTREGA propia | `APROBADO` | **Cerrada para su alcance.** Autorizó únicamente observación. |
| `VAAK-STAGING-2-A` | Análisis del informe de preflight | ORDEN, ENTREGA, VEREDICTO | `APROBADO` | **Cerrada.** No autorizó cambios remotos. |
| `VAAK-UX-1-A` | Referencia visual y requisitos suplementarios | ORDEN, ENTREGA, VEREDICTO | `APROBADO` | **Cerrada.** El PDF UX es referencia autorizada, no plantilla ni fuente de datos demo. |
| `VAAK-FUNCTIONAL-1-A` | Blueprint y permisos | ORDEN, ENTREGA, VEREDICTO | `APROBADO` | **Cerrada.** Requisitos funcionales aprobados; no son permisos implementados. |
| `VAAK-IMPLEMENTATION-1-A` | Prototipo visual local | ORDEN, ENTREGA, VEREDICTO | `APROBADO` | **Cerrada.** Sólo prototipo estático y descartable. |
| `VAAK-TRANSFER-1-A` | Transferencia a otro Windows | ORDEN, VEREDICTO de planificación, transferencia y ENTREGA histórica | La humana dispensó la auditoría final por ser una tarea documental sencilla y cambió la política a handoff selectivo | **Activa/completada por instrucción humana directa.** Los artefactos handoff se conservan como historial. |

### Contradicciones reconciliadas

| Afirmación | Evidencia | Estado reconciliado | Acción pendiente |
|---|---|---|---|
| El prototipo esperaba auditoría. | `HANDOFF/VEREDICTO-VAAK-IMPLEMENTATION-1-A.md` tiene `status: approved`. | Obsoleta: el prototipo está aprobado y cerrado. | Ninguna dentro de esa REF; todo incremento nuevo necesita otra REF. |
| Hosting fue aprobado. | El último `VEREDICTO-VAAK-HOSTING-1-A.md` dice `RECHAZADO`. | La REF fue rechazada por omisión documental; su recomendación condicionada fue técnicamente considerada conforme. | No llamarla aprobación ni ADR. Revalidar antes de adoptar stack. |
| La topología A/B está pendiente, pero Staging 1 declara B elegida para evaluación. | `PREGUNTA-VAAK-ACCESS-1-A.md` no decide; `ORDEN-VAAK-STAGING-1-A.md` usa B para evaluar. | Contradicción no resuelta: B fue supuesto operativo de evaluación, no decisión estable ni ADR. | Solicitar confirmación humana antes de estabilizarla. |
| El PDF `VAAK PROCUREMENT - FF&E INPUTS (1).pdf` no estaba autorizado. | `VAAK-UX-1-A` lo aprobó posteriormente como referencia UX. | Autorizado para UX y especificaciones suplementarias; sigue fuera del corpus principal de 12 documentos. | No cargarlo a NotebookLM ni reutilizar sus datos/activos sin alcance adicional. |
| No existe implementación autorizada. | `VAAK-IMPLEMENTATION-1-A` aprobó cuatro archivos en `prototype/`. | No existe aplicación persistente; sí existe un prototipo visual local aprobado. | Mantener esta distinción. |

## 5. Decisiones funcionales, UX y roles

Toda interfaz visible al usuario debe estar en **English**. La dirección de marca autorizada usa `LOGO VAAK.png` y una paleta brown/white/gold; tipografías, tokens y contraste final aún requieren validación.

El login previsto usa `Username`, `Password` y un eye toggle `Show password` / `Hide password`. Recuperación, MFA, política de contraseña, bloqueo y duración de sesión no están diseñados.

| Rol | Capacidades aprobadas | Límites principales |
|---|---|---|
| Admin | Supervisa proyectos y operaciones; administra usuarios, roles y accesos; crea usuarios; deshabilita acceso inmediatamente; gestiona proyectos/proveedores y herramientas administrativas. | Deshabilitar conserva historial. Cuentas con actividad se archivan lógicamente; borrado físico sólo se considerará para cuentas sin actividad y con diseño posterior. No implica acceso a infraestructura ni entre organizaciones. |
| Worker | Ve todos los datos de proyectos asignados; cambia sólo el estado de tareas propias; gestiona SPEC y proveedores; crea y emite Purchase Orders dentro de proyectos asignados sin revisión obligatoria de Admin. | No administra usuarios/roles/accesos/global settings, no ve proyectos ajenos, no edita información general del proyecto ni tareas ajenas. |
| Client | Portal autenticado para reportes y Purchase Order History explícitamente autorizados de su empresa/proyecto. | No crea ni edita POs, SPEC, proveedores, tareas o proyectos. Public Tracking es una superficie separada, mínima y no concede acceso al portal. |

El tracking público futuro debe usar código opaco de alta entropía, expiración/revocación, limitación de tasa, respuesta uniforme y mínima, protección contra enumeración y auditoría sin conservar el secreto legible.

### Pendientes funcionales relevantes

- Modelo detallado de áreas, tipologías, resultados, checklist y transiciones de tareas.
- Campos, numeración, precios, impuestos, moneda, lifecycle, aprobación, firma, envío, retención y plantilla PDF de Purchase Orders.
- Seguridad de sesión, recuperación, MFA, política de contraseña y alcance documental exacto de Client.
- Modelo/catálogo de proveedores y prevención de duplicados.
- Plantillas, versiones, permisos y retención de PDFs de SPEC y payment requests.
- Accesibilidad final, responsive, contraste, tipografía, carga de imágenes y comportamiento móvil.

## 6. Hosting, staging y recomendación tecnológica no adoptada

**Dominio base:** `hpgilatam.com`. **Staging:** `staging.hpgilatam.com`. **Document root independiente:** `/home/wwwhpgilatam/staging.hpgilatam.com/public`.

### Hechos documentados

- PHP seleccionable 7.4–8.4; el contexto observado estaba en 7.3. No se demostró una asignación moderna aislada para staging.
- MySQL Community 8.0.43 local, phpMyAdmin 5.2.3 y acceso remoto configurable pero no requerido.
- File Manager y FTP disponibles; cron disponible con frecuencia mínima observada de un minuto; ModSecurity activo.
- Cuota observada: 100 GB con aproximadamente 6.14 GB usados; 250,000 inodos con 28,614 usados en el momento del informe.
- Extensiones y límites documentados pertenecían al contexto PHP 7.3, no prueban PHP 8.4.

### No asumir

SSH, Terminal, SFTP, Composer/CLI en producción, Docker, root, instalación libre de paquetes, Node persistente, workers/daemons, Redis, Horizon, Octane, WebSockets, ni límites no publicados de CPU, RAM, I/O, IOPS, EP, NPROC o concurrencia.

### Bloqueos históricos y estado actualizado

1. `NXDOMAIN`: **resuelto** mediante zona autoritativa Microsoft, `A staging -> 144.217.195.178`, TTL 1 hora.
2. TLS: **resuelto** mediante nuevo certificado Let's Encrypt; HTTPS válido.
3. PHP: **bloqueante vigente**. Soporte confirmó ausencia de MultiPHP y selector global; el sitio principal permanece en PHP 7.3.
4. Backups: política confirmada (semanal, dos semanas, externo, restauración por ticket), pero restauración no probada.

El informe PDF sigue siendo snapshot histórico. La actualización humana del 2026-08-28 supera su estado de DNS/TLS, pero no autoriza cambios de PHP ni despliegue.

La REF `VAAK-PHP-STRATEGY-2-A` aprobó como estrategia documental no tocar el PHP global y priorizar un staging temporal independiente. No existe ADR ni stack adoptado. Si posteriormente se adopta un stack con Composer, dependencias y activos se construirán fuera del servidor como release reproducible; no hay autorización para contratar, aprovisionar o desplegar.

## 7. Prototipo visual aprobado

| Archivo | Propósito |
|---|---|
| [prototype/index.html](prototype/index.html) | Vistas Login, Admin, Worker, Client y Public Tracking. |
| [prototype/styles.css](prototype/styles.css) | Layout y dirección visual responsive brown/white/gold. |
| [prototype/app.js](prototype/app.js) | Selector de vistas y eye toggle visual. |
| [prototype/README.md](prototype/README.md) | Instrucciones y límites. |

Para revisarlo, abrir `prototype/index.html` directamente en un navegador moderno y cambiar superficies con el selector **Preview** inferior.

Es sólo una maqueta: no tiene autenticación, autorización de servidor, backend, base de datos, cuentas, credenciales, persistencia, llamadas de red, generación real de documentos ni despliegue.

## 8. Investigación y NotebookLM

El corpus principal obligatorio contiene 12 documentos lógicos: `LEG-01`…`LEG-11` en `Documentos de plataforma antigua/` y `NEW-01`, `OS&E_Requerimiento Sistema (1).pdf`. Sus rutas, tamaños y SHA-256 están en el [manifiesto](docs/research/VAAK-RESEARCH-0-A/00-source-manifest.md). Al preparar esta transferencia, los 12 hashes coincidían.

Existen artefactos locales de extracción y renderizado bajo `docs/research/VAAK-RESEARCH-0-A/_working/`. Son evidencia de trabajo, no sustituyen originales ni prueban que R2–R7 estén cerradas. La investigación principal sigue abierta.

`VAAK PROCUREMENT - FF&E INPUTS (1).pdf` es una referencia UX suplementaria aprobada, no el documento número 13 del corpus principal. No reutilizar nombres, imágenes, contactos, importes o activos del PDF como datos demo.

NotebookLM es auxiliar y no canónico. Toda conclusión crítica debe volver a originales o evidencia aprobada. Los números de cuadernos, sesión, propiedad, compartición e identificadores remotos registrados en sesiones anteriores son históricos: consultar nuevamente el MCP antes de usarlos como estado vigente.

`mcp_config.json` apunta actualmente a `C:\Users\HP\.notebooklm-mcp\venv\Scripts\notebooklm-mcp.exe`. En otro equipo se debe instalar el servidor de forma compatible, autenticarse de nuevo mediante el navegador y ajustar la ruta local en la configuración. Copiar `mcp_config.json` no copia la sesión ni el token. No copiar el directorio de credenciales del equipo anterior.

## 9. Archivos externos y estado no portable

La evidencia primaria de staging está fuera del workspace actual:

`C:\Users\HP\Downloads\Informe_Preflight_Staging_HPG_Latam_Codex.pdf`

Debe copiarse por separado mediante un canal autorizado o suministrarse de nuevo en el equipo destino. La ruta cambiará y no debe actualizarse en documentos históricos; el nuevo agente puede registrar una ruta nueva en una REF posterior si necesita volver a analizarlo.

Las fuentes originales dentro del workspace son canónicas en su ámbito. `tmp/` contiene cachés, capturas y renderizados regenerables. Tampoco viajan automáticamente el estado remoto de NotebookLM, cPanel, DNS, Vercel o GitHub ni las sesiones de sus cuentas. Reautenticarse de forma normal sin escribir accesos en Markdown.

## 10. Inventario crítico, integridad y comprobaciones PowerShell

| Ruta relativa | Propósito | Condición de copia |
|---|---|---|
| `.codex/` | Configuración de los dos agentes | Copiar; revisar compatibilidad/modelo y rutas en el nuevo Codex. |
| `AGENTS.md` | Gobierno obligatorio | Copiar sin renombrar. |
| `PROJECT-BRAIN.md` / `PROJECT-STATE.md` | Contexto estable / estado dinámico | Copiar; leer completos al iniciar. |
| `HANDOFF/` | Trazabilidad por REF | Copiar completo. |
| `docs/functional/`, `docs/roles/`, `docs/ux/`, `docs/research/` | Especificaciones y evidencia | Copiar completo. |
| `Documentos de plataforma antigua/` | 11 fuentes legado | Copiar; verificar SHA-256. |
| `OS&E_Requerimiento Sistema (1).pdf` | Requerimiento principal `NEW-01` | Copiar; verificar SHA-256. |
| `VAAK PROCUREMENT - FF&E INPUTS (1).pdf` | Referencia UX suplementaria | Copiar como material sensible. |
| `LOGO VAAK.png` | Activo local autorizado | Copiar. |
| `prototype/` | Prototipo aprobado | Copiar los cuatro archivos. |
| `mcp_config.json` | Configuración MCP dependiente del equipo | Copiar como referencia; ajustar tras reinstalar/reautenticar. |
| `tmp/` | Renderizados/cachés de trabajo | Copia completa recomendada; regenerable y no canónica. |

Después de copiar, abrir PowerShell y ajustar sólo el valor de `$vaakRoot`:

```powershell
$vaakRoot = 'C:\Projects\Plataforma VAAK'
Set-Location -LiteralPath $vaakRoot

Get-ChildItem -LiteralPath $vaakRoot -Force
Test-Path -LiteralPath (Join-Path $vaakRoot 'AGENTS.md')
Test-Path -LiteralPath (Join-Path $vaakRoot 'PROJECT-BRAIN.md')
Test-Path -LiteralPath (Join-Path $vaakRoot 'PROJECT-STATE.md')
Test-Path -LiteralPath (Join-Path $vaakRoot 'Transferencia de información.md')
Get-ChildItem -LiteralPath (Join-Path $vaakRoot 'Documentos de plataforma antigua') -File
Get-ChildItem -LiteralPath (Join-Path $vaakRoot 'prototype') -File
rg --files $vaakRoot
git -C $vaakRoot rev-parse --show-toplevel
```

El último comando debe seguir informando que no es un repositorio Git hasta que la humana autorice una decisión distinta. No inicializar Git para “corregir” ese resultado.

### Verificación de los 12 hashes contra el manifiesto

Este bloque sólo lee el manifiesto y calcula hashes; no modifica archivos:

```powershell
$vaakRoot = 'C:\Projects\Plataforma VAAK'
$manifestPath = Join-Path $vaakRoot 'docs\research\VAAK-RESEARCH-0-A\00-source-manifest.md'
$manifestText = Get-Content -Raw -LiteralPath $manifestPath
$pattern = '\| (LEG-\d{2}|NEW-01) \| `([^`]+)` \| (DOCX|PDF) \| [\d,]+ \| `([a-f0-9]{64})`'
$rows = foreach ($match in [regex]::Matches($manifestText, $pattern)) {
    $sourcePath = Join-Path $vaakRoot $match.Groups[2].Value
    $expectedHash = $match.Groups[4].Value.ToUpperInvariant()
    $actualHash = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash
    [pscustomobject]@{
        Id = $match.Groups[1].Value
        Exists = Test-Path -LiteralPath $sourcePath
        HashMatches = $actualHash -eq $expectedHash
    }
}
$rows
```

Resultado esperado: 12 filas, `Exists=True` y `HashMatches=True`. No se usa un hash global porque `tmp/`, logs y otros artefactos de trabajo pueden variar sin alterar las fuentes canónicas.

### Checklist posterior a la copia

- [ ] La raíz contiene `AGENTS.md`, Brain, State y esta transferencia con el mismo nombre y acento.
- [ ] `.codex/agents/` contiene exactamente los dos perfiles previstos.
- [ ] El corpus contiene 11 DOCX y el PDF `NEW-01`; 12/12 hashes coinciden.
- [ ] `prototype/` contiene `index.html`, `styles.css`, `app.js` y `README.md`.
- [ ] Existen los PDF raíz y `LOGO VAAK.png`.
- [ ] Los enlaces canónicos de este archivo resuelven desde la raíz nueva.
- [ ] El informe externo de staging fue suministrado por separado si se necesita.
- [ ] `git rev-parse` sigue confirmando “no Git”, salvo decisión humana posterior.
- [ ] Las rutas absolutas de MCP y de archivos externos fueron revalidadas individualmente.

## 11. Seguridad, privacidad y secretos

- No incluir ni copiar contraseñas, tokens, cookies, claves, `.env`, credenciales cPanel/FTP/MySQL/Google/NotebookLM/Vercel/GitHub ni datos personales innecesarios.
- Tratar manuales y PDF de la clienta como material sensible. Evitar repositorios públicos, enlaces abiertos y equipos no autorizados o sin cifrado de disco.
- No subir el workspace a una nube o repositorio nuevo como paso implícito de transferencia.
- GitHub, si se autoriza posteriormente, será para código y trazabilidad; nunca para datos operativos, adjuntos, backups, `.env` o dumps de base de datos.
- Vercel no es una base de datos. No conectar Vercel a MySQL remoto ni exponer una API sin REF, análisis de seguridad y autorización.
- No incorporar secretos en capturas, logs, HANDOFF, README, commits o prompts.

## 12. Bloqueos, preguntas y primera instrucción recomendada

### Bloqueos y decisiones pendientes

- Confirmar con la humana si la topología B deja de ser sólo una hipótesis evaluada y se adopta como dirección temporal; todavía no es ADR.
- Revalidar DNS público y TLS de staging antes de PHP o Laravel.
- Confirmar PHP moderno por subdominio, extensiones, límites, backup/restauración y release segura sin CLI.
- Completar y auditar la investigación `VAAK-RESEARCH-0-A`, incluidas R2–R7.
- Decidir stack únicamente mediante una REF/ADR posterior con evidencia vigente.
- Resolver las decisiones funcionales y de seguridad enumeradas en la sección 5 antes de una aplicación persistente.

### Primera instrucción para pegar en el nuevo Codex

```text
Abre y trabaja desde la raíz local de Plataforma VAAK. Lee completos, en este orden, AGENTS.md, Transferencia de información.md, PROJECT-BRAIN.md y PROJECT-STATE.md; después lee la documentación pertinente a la tarea. Verifica con operaciones de sólo lectura que las rutas críticas existen, que los 12 hashes del corpus coinciden con 00-source-manifest.md, que prototype/ contiene cuatro archivos, que los dos perfiles de agentes locales están presentes y que el workspace sigue sin raíz Git. No instales, no autentiques servicios, no inicialices Git, no modifiques infraestructura y no implementes todavía. Informa cualquier diferencia. Trabaja directamente en tareas pequeñas y reversibles; activa handoff únicamente si yo lo pido o si justificas que existe complejidad o riesgo material.
```

**Siguiente paso recomendado:** en el equipo nuevo, verificar primero la transferencia y las rutas. Después retomar `VAAK-RESEARCH-0-A` de forma directa y proporcional; usar una REF/handoff sólo si la humana lo solicita o el siguiente alcance lo justifica por riesgo o complejidad. No iniciar Laravel, staging, Git ni integraciones remotas automáticamente.
