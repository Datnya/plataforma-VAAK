---
artifact_type: ORDEN
phase: "documentation_transfer"
ref: "VAAK-TRANSFER-1-A"
from: architect_chief
to: reviewer_auditor
status: draft_for_review
blocking: true
created_at: "2026-08-26"
---

=== HANDOFF ===
TIPO: ORDEN
FASE: documentation_transfer · REF: VAAK-TRANSFER-1-A

# ORDEN — Transferencia documental de Plataforma VAAK entre equipos Windows

## INSTRUCCIÓN HUMANA ORIGINAL (conservada literalmente)

> "Hola, ¿qué tal? Mañana voy a entrar a otra computadora. Necesito que todo el contexto del proyecto que llevamos avanzando lo coloques en un formato Markdown llamado Transferencia de información.md. Dentro de ese archivo vamos a colocar todo el contexto y todo lo necesario para seguir trabajando desde local desde ese nuevo ordenador, ¿sí? Así que actualiza todas las documentaciones que requieras actualizar y crea el archivo Markdown."

## TAREA

Después de VEREDICTO `APROBADO` de esta ORDEN y autorización humana aplicable, crear en la raíz del workspace el archivo exacto `Transferencia de información.md`. Debe permitir copiar el proyecto a otro equipo Windows, verificar su integridad y reanudar el trabajo local desde Codex sin depender de la memoria del chat.

La ejecución podrá reconciliar `PROJECT-STATE.md` y `PROJECT-BRAIN.md` sólo donde sea necesario para que la transferencia no contradiga evidencia verificable. No se autoriza código de producto, dependencias, Git, despliegue, cPanel, Vercel, DNS/TLS/PHP, MySQL, secretos ni infraestructura.

## CONTEXTO VERIFICADO

- La raíz actual es `C:\Users\HP\OneDrive\Desktop\Plataforma VAAK` y no es una raíz Git verificable.
- Codex debe iniciarse desde la raíz del workspace mientras no exista una raíz Git; iniciar desde subdirectorios puede omitir el `AGENTS.md` raíz.
- Existen agentes locales configurados en `.codex/agents/architect-chief.toml` y `.codex/agents/reviewer-auditor.toml`; `.codex/config.toml` habilita dos agentes.
- `PROJECT-BRAIN.md` está activo y `PROJECT-STATE.md` mantiene la investigación principal `VAAK-RESEARCH-0-A` abierta.
- `VAAK-IMPLEMENTATION-1-A` tiene ENTREGA y VEREDICTO final `APROBADO`; el prototipo local está en `prototype/` y sigue siendo estático, descartable y sin backend.
- No existe ADR tecnológico ni stack definitivo. Laravel 13 + PHP 8.4 + MySQL 8.0.43 es sólo una recomendación condicionada; Laravel 12 + PHP 8.3 es contingencia.
- NotebookLM es integración auxiliar no canónica. `mcp_config.json` contiene una ruta absoluta dependiente del equipo actual y la autenticación/token no viajan automáticamente.
- El informe de preflight primario está fuera del workspace: `C:\Users\HP\Downloads\Informe_Preflight_Staging_HPG_Latam_Codex.pdf`.
- El corpus obligatorio local, el PDF UX autorizado, `LOGO VAAK.png`, documentación canónica, HANDOFF y prototipo existen dentro del workspace y deben inventariarse.

## CONTRADICCIONES VERIFICABLES QUE LA EJECUCIÓN DEBE EXPONER Y RECONCILIAR

No resolver por intuición ni borrar historia. La transferencia debe incluir una tabla `afirmación / evidencia / estado reconciliado / acción pendiente` para, como mínimo:

1. `PROJECT-STATE.md` todavía describe `VAAK-IMPLEMENTATION-1-A` como pendiente de auditoría, pero `HANDOFF/VEREDICTO-VAAK-IMPLEMENTATION-1-A.md` está `approved`.
2. El State atribuye a `VAAK-HOSTING-1-A` una aprobación técnica, pero su VEREDICTO final está formalmente `RECHAZADO` por una omisión documental. La recomendación condicionada fue considerada técnicamente conforme; los datos omitidos se corrigieron después en `VAAK-ACCESS-1-A`, y la cláusula de mantenimiento se cerró con `VAAK-ACCESS-1-B` aprobado. No llamar “aprobada” a la REF de Hosting.
3. `docs/roles/README.md` y partes del State mantienen la topología A/B como pendiente, mientras `HANDOFF/ORDEN-VAAK-STAGING-1-A.md` declara la alternativa B elegida para evaluación. Registrar esta desalineación y pedir confirmación humana antes de convertirla en decisión estable o ADR.
4. El manifiesto inicial y una decisión antigua del State excluyen `VAAK PROCUREMENT - FF&E INPUTS (1).pdf`, pero `VAAK-UX-1-A` autorizó posteriormente su uso como referencia visual y fuente suplementaria de especificaciones. Sigue fuera de los doce documentos lógicos del corpus principal, pero ya no está “no autorizado” para UX.
5. El encabezado y algunos textos generales del State dicen que no existe implementación autorizada; esto debe matizarse: no existe aplicación de producto persistente, pero sí un prototipo visual local aprobado y cerrado.

Si aparece otra contradicción material al ejecutar, registrarla. Si afecta producto, ADR, seguridad o infraestructura, emitir PREGUNTA al humano; no decidir silenciosamente.

## CONTENIDO OBLIGATORIO DE `Transferencia de información.md`

### 1. Identidad y alcance

- Nombre, objetivo de negocio y dominio FF&E/OS&E.
- Qué está aprobado, qué es sólo evidencia, qué está condicionado y qué permanece pendiente.
- Declaración visible: el archivo es índice de transferencia derivado; no sustituye `AGENTS.md`, `PROJECT-BRAIN.md`, `PROJECT-STATE.md`, ADRs ni artefactos HANDOFF.

### 2. Guía de copia a otro Windows

- Copiar la carpeta raíz completa conservando nombres, espacios, acentos y estructura relativa.
- Recomendar una ruta local corta y estable, por ejemplo `C:\Projects\Plataforma VAAK`, sin imponerla como ruta canónica.
- Incluir explícitamente `.codex/`, `HANDOFF/`, `docs/`, `prototype/`, `Documentos de plataforma antigua/`, los PDF raíz, `LOGO VAAK.png`, `AGENTS.md`, Brain, State y `mcp_config.json`.
- Explicar que rutas absolutas del equipo viejo deben revalidarse y no deben reemplazarse globalmente sin inspección.
- No recomendar copiar credenciales, cookies, tokens, perfiles del navegador, `.env` ni secretos.

### 3. Arranque de Codex y orden de lectura

- Abrir Codex desde la nueva raíz, nunca desde `HANDOFF/`, `docs/` o `prototype/` mientras no haya Git root verificable.
- Orden mínimo: `AGENTS.md` → `PROJECT-BRAIN.md` → `PROJECT-STATE.md` → ORDEN/ENTREGA/VEREDICTO de la REF activa → documentación funcional/roles/UX/research pertinente.
- Confirmar los dos agentes y su secuencia obligatoria: `architect_chief` primero, `reviewer_auditor` después; misma REF; máximo tres ciclos.
- Incluir un prompt de reanudación recomendado que pida leer la transferencia y las fuentes canónicas, verificar rutas/integridad y no implementar hasta identificar la REF activa.

### 4. Estado exacto de REFs

Incluir una tabla con REF, propósito, ORDEN, ENTREGA, VEREDICTO final real, estado y consecuencia. Debe cubrir como mínimo:

- `VAAK-RESEARCH-0-A`: abierta; R0–R7 sin ENTREGA/VEREDICTO final.
- `VAAK-BRAIN-1-A`: aprobada y cerrada.
- `VAAK-HOSTING-1-A`: formalmente rechazada; recomendación técnica condicionada reutilizable como evidencia, no ADR.
- `VAAK-ACCESS-1-A`: rechazada por cláusula documental faltante; correcciones de hosting y requisitos no invalidados.
- `VAAK-ACCESS-1-B`: aprobada y cerrada.
- `VAAK-STAGING-1-A`: preflight de sólo lectura aprobado.
- `VAAK-STAGING-2-A`: análisis aprobado; cambios remotos no autorizados.
- `VAAK-UX-1-A`: aprobada y cerrada.
- `VAAK-FUNCTIONAL-1-A`: aprobada y cerrada.
- `VAAK-IMPLEMENTATION-1-A`: prototipo visual aprobado y cerrado.
- `VAAK-TRANSFER-1-A`: estado actual según el último artefacto disponible al momento de generar la transferencia.

### 5. Decisiones funcionales y roles

- UI visible completamente en English; branding VAAK brown/white/gold y logo local autorizado.
- Login previsto con username/password y eye toggle; seguridad de autenticación aún no diseñada.
- Admin: supervisión y administración de usuarios/roles/accesos, deshabilitación inmediata, archivo lógico para preservar historial y herramientas administrativas.
- Worker: ve todos los datos de proyectos asignados; cambia sólo estado de tareas propias; gestiona SPECs, proveedores y crea/emite POs dentro de proyectos asignados sin revisión obligatoria de Admin.
- Client: portal autenticado sólo para reportes y PO history autorizados; tracking público mínimo y separado.
- Enumerar decisiones funcionales pendientes: modelo detallado de áreas/tareas, lifecycle/campos/numeración/impuestos/moneda/PDF de PO, seguridad de sesión/MFA/recuperación, grants documentales Client, proveedores, PDFs SPEC/payment requests y accesibilidad final.

### 6. Hosting y staging

- Dominio base `hpgilatam.com`; staging `staging.hpgilatam.com`; docroot independiente `/home/wwwhpgilatam/staging.hpgilatam.com/public`.
- Hechos confirmados: PHP seleccionable 7.4–8.4 pero asignación moderna por subdominio no demostrada; MySQL 8.0.43 local; File Manager/FTP; cron; ModSecurity; límites/inodos documentados.
- Capacidades no asumibles: SSH, Terminal, Composer/CLI en producción, SFTP, Docker, root, Node persistente, workers/daemons, Redis/Horizon/Octane/WebSockets y límites CPU/RAM/I/O/EP/NPROC no publicados.
- Bloqueos registrados por el preflight: conflicto DNS `A` visible frente a `NXDOMAIN`, TLS expirado, alcance de PHP moderno, recuperación/JetBackup y release segura sin CLI. Marcar que el informe es histórico y debe revalidarse en el nuevo equipo antes de afirmar estado actual.
- No declarar Laravel/PHP como stack adoptado.

### 7. Prototipo aprobado

- Inventario de `prototype/index.html`, `styles.css`, `app.js` y `README.md`.
- Cómo abrir `prototype/index.html` localmente y usar `Preview`.
- Límites: sin autenticación, autorización, backend, base de datos, cuentas, credenciales, persistencia, red ni despliegue.

### 8. Investigación y NotebookLM

- Explicar el corpus principal de doce documentos (`LEG-01`…`LEG-11`, `NEW-01`) y remitir al manifiesto.
- Registrar que existen artefactos locales de extracción/renderizado bajo `_working/`, pero R2–R7 y el cierre final de la investigación siguen pendientes.
- NotebookLM es auxiliar no canónico; las conclusiones críticas deben volver a los originales.
- No copiar como hecho vigente el número de cuadernos, sesión, propiedad, compartición o IDs remotos sin volver a consultar el MCP.
- Explicar que `mcp_config.json` apunta a `C:\Users\HP\.notebooklm-mcp\venv\Scripts\notebooklm-mcp.exe`; en otro equipo se debe instalar/reautenticar y actualizar la ruta local. El archivo no contiene el token y copiarlo no copia la sesión.

### 9. Archivos externos que no viajan automáticamente

- Señalar al menos `C:\Users\HP\Downloads\Informe_Preflight_Staging_HPG_Latam_Codex.pdf` como evidencia externa a copiar por separado o volver a suministrar.
- Diferenciar archivos fuente dentro del workspace de cachés temporales, capturas renderizadas y estado remoto de NotebookLM/cPanel/Vercel/GitHub.
- Advertir que accesos de cPanel, Google/NotebookLM, Vercel y GitHub dependen de cuentas/sesiones externas y no deben documentarse como secretos.

### 10. Inventario crítico e integridad

- Tabla de rutas críticas con propósito y condición de copia.
- Checklist mecánico posterior a la copia: existencia de archivos, conteos por grupo, hashes SHA-256 de las fuentes del manifiesto, presencia de los cuatro archivos del prototipo y frontmatter de gobierno.
- Incluir comandos PowerShell de sólo lectura, seguros y ajustables a la nueva ruta para: `Get-ChildItem`, `Get-FileHash`, `Test-Path`, `rg --files` y `git rev-parse --show-toplevel` como comprobación esperada de “no Git” hasta decisión humana.
- No incrustar un hash global de toda la carpeta si incluye temporales volátiles; usar manifiesto crítico y explicar exclusiones.

### 11. Seguridad y secretos

- No incluir contraseñas, tokens, cookies, claves, `.env`, credenciales cPanel/FTP/MySQL/Google/Vercel/GitHub ni datos personales innecesarios.
- No recomendar subir el workspace a repositorios o nubes nuevas. GitHub es código/trazabilidad, nunca almacén de datos operativos, adjuntos, backups o dumps.
- Tratar los PDF y manuales del cliente como material sensible; evitar repositorios públicos y equipos no cifrados/no autorizados.

### 12. Preguntas, bloqueos y siguiente instrucción

- Presentar bloqueos externos y decisiones pendientes sin inventar respuestas.
- El siguiente paso recomendado debe ser documental y exacto: abrir Codex desde la nueva raíz, verificar integridad/rutas, leer fuentes canónicas y retomar `VAAK-RESEARCH-0-A` mediante una nueva ORDEN o subfase aprobada; no iniciar Laravel ni staging automáticamente.
- Incluir un prompt listo para pegar que pida la verificación de transferencia y la selección de la próxima REF sin modificar infraestructura.

## ALCANCE

- Crear únicamente `Transferencia de información.md` en la raíz.
- Reconciliar sólo afirmaciones demostrablemente obsoletas o contradictorias de `PROJECT-STATE.md` y, si una decisión estable realmente cambió, el resumen correspondiente de `PROJECT-BRAIN.md`.
- Crear `HANDOFF/ENTREGA-VAAK-TRANSFER-1-A.md` con evidencia mecánica y lista exacta de cambios.

## FUERA DE ALCANCE

- Código de producto o cambios a `prototype/`.
- Instalar dependencias, crear Git, commits, ramas o repositorios.
- Configurar Codex, MCP, NotebookLM, navegador, cuentas o sesiones en el equipo actual o futuro.
- Copiar físicamente el workspace, mover archivos, empaquetar o borrar temporales.
- Modificar cPanel, Vercel, GitHub, DNS, TLS, PHP, MySQL, cron, ModSecurity, backups o despliegues.
- Crear/adoptar ADR, stack, arquitectura definitiva o nueva decisión de producto.
- Incorporar secretos, credenciales o datos remotos a la documentación.

## ARCHIVOS PROBABLES

- `Transferencia de información.md` — nuevo archivo raíz exacto.
- `PROJECT-STATE.md` — reconciliación dinámica estrictamente necesaria.
- `PROJECT-BRAIN.md` — sólo si una corrección estable demostrada es imprescindible; de lo contrario no modificar.
- `HANDOFF/ENTREGA-VAAK-TRANSFER-1-A.md` — evidencia de ejecución.

## CRITERIOS DE ACEPTACIÓN MECÁNICOS

1. Existe exactamente un archivo raíz llamado `Transferencia de información.md`; no existe variante sin acento, con guion o en subcarpeta.
2. El archivo inicia con YAML válido y contiene `artifact_type`, `phase`, `ref`, `from`, `to`, `status`, `blocking` y `created_at`, usando REF `VAAK-TRANSFER-1-A`.
3. Contiene las doce secciones obligatorias anteriores y la instrucción humana original o un enlace inequívoco a esta ORDEN.
4. Cada estado de REF coincide con su último VEREDICTO real; rechazos y condiciones no se reetiquetan como aprobaciones.
5. La transferencia distingue `verificado`, `decisión humana`, `recomendación condicionada`, `contradicción`, `pendiente` y `requiere revalidación`.
6. No declara stack ni ADR tecnológico adoptado.
7. Incluye rutas relativas para el proyecto y marca como dependientes del equipo todas las rutas absolutas.
8. Incluye la ruta externa del informe de staging y explica que no viaja con la carpeta.
9. Incluye guía de copia/reanudación Windows, orden de lectura, arranque Codex desde raíz, inventario crítico, comandos PowerShell de sólo lectura y checklist de integridad.
10. Incluye los tres roles y sus límites funcionales aprobados, además de Client portal/tracking separados.
11. Incluye hosting/staging, prototipo aprobado, investigación abierta y NotebookLM no canónico sin tratar estado remoto histórico como vigente.
12. Una búsqueda de patrones de secretos no encuentra valores sensibles; las menciones de palabras como `password` o `token` son únicamente reglas de exclusión o requisitos funcionales.
13. Los enlaces relativos a archivos canónicos resuelven desde la raíz nueva; no se enlazan temporales como fuentes canónicas.
14. `PROJECT-STATE.md` queda reconciliado con el VEREDICTO final del prototipo y registra esta REF; cualquier otra corrección conserva historia y fuente.
15. `PROJECT-BRAIN.md` sólo cambia si se demuestra una corrección estable; la ENTREGA debe justificar cada línea modificada o declarar “sin cambios”.
16. No cambian archivos fuera de los cuatro permitidos y no se ejecutan acciones de código, Git, red, cuenta, infraestructura o despliegue.

## EVIDENCIA ESPERADA EN LA ENTREGA

- Lista exacta de archivos creados/modificados y motivo.
- Validación de frontmatter y presencia de las doce secciones.
- Inventario de enlaces relativos y resultado de resolución.
- Tabla de contradicciones reconciliadas con fuente.
- Comandos/salidas de existencia, conteos críticos y hashes del corpus contra `00-source-manifest.md`.
- Búsqueda saneada de patrones de secretos, sin imprimir valores.
- Confirmación de que `Transferencia de información.md` está en la raíz y que no se tocó código, Git, dependencias, cuentas, red ni infraestructura.

## RIESGOS

- Convertir una recomendación condicionada en stack definitivo.
- Copiar estado histórico de NotebookLM, DNS/TLS o cPanel como si fuera vigente.
- Omitir archivos externos o rutas absolutas dependientes del equipo.
- Transferir secretos/sesiones o datos sensibles por canales no autorizados.
- Reconciliar el State borrando historial o resolviendo una contradicción de producto sin decisión humana.
- Suponer que OneDrive, GitHub o NotebookLM constituyen backup completo del workspace.

## FRENOS

- No escribir la transferencia antes del VEREDICTO `APROBADO` de esta ORDEN.
- No implementar, instalar, desplegar, inicializar Git, mover/copiar/borrar archivos ni tocar infraestructura.
- No copiar ni solicitar secretos; no autenticar servicios.
- Toda contradicción que requiera una decisión material se eleva al humano.

## CONDICIÓN PARA AVANZAR

`reviewer_auditor` debe auditar esta ORDEN contra la instrucción humana literal y el estado verificable del workspace. Sólo un resultado `APROBADO` habilita crear `Transferencia de información.md` y la ENTREGA documental bajo esta misma REF. La autorización humana original cubre esa ejecución documental una vez aprobada; no cubre código, Git, cuentas, red, despliegue ni infraestructura.
