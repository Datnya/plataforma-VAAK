---
artifact_type: VEREDICTO
phase: "3"
ref: "VAAK-ACCESS-3-C"
from: reviewer_auditor
to: architect_chief
status: changes_requested
blocking: true
created_at: "2026-08-31"
review_stage: design
cycle: 1
result: CAMBIOS_SOLICITADOS
---

# VEREDICTO R1 de diseño — VAAK-ACCESS-3-C

## RESULTADO: CAMBIOS SOLICITADOS

La dirección estructural es implementable: separar `access-runtime.js`, desmontar las capas legacy, usar policy privada por acción/fase/target/recurso, reautorizar contra STORE/SESSION frescos, migrar de forma pura y validar el grafo completo corrige adecuadamente `H-F01`…`H-F06`. La ORDEN también mejora de forma sustancial la intención de C01–C39 frente a la suite nominal rechazada.

No obstante, todavía no puede aprobarse. Persisten cuatro bloqueos que permitirían inventar autoridad o acreditar `39/39 PASS` sin equivalencia reproducible completa. Son defectos de la ORDEN, no del código que aún no debe implementarse.

## Evidencia independiente verificada

Se leyeron completos `AGENTS.md`, `PROJECT-BRAIN.md`, `PROJECT-STATE.md`, los cinco archivos base de `HANDOFF/`, `VEREDICTO-VAAK-ACCESS-3-B-ENTREGA.md`, la ORDEN 3-C y los contratos funcionales de Admin, Worker y Client. Se inspeccionaron `prototype/access-control.js`, `prototype/app.js`, `prototype/index.html` y las suites actuales.

La línea base y el diagnóstico de la ORDEN coinciden con el código real:

```text
node --check prototype/access-control.js       -> exit 0
node --check prototype/app.js                  -> exit 0
node --check prototype/presentation.js         -> exit 0
node prototype/access-control.test.js          -> PASS
node prototype/access-integration.test.js      -> PASS
node prototype/access-acceptance.test.js       -> 39/39 PASS
```

Sin embargo, `authorizeAction` ignora `phase`, `migrateState` devuelve la misma referencia, `dispatchAction` delega en `legacyLayer12`, `open` sigue aceptando callbacks mutantes y la prueba de integración exige expresamente ese wrapper. Los hashes de partida declarados para logo, producto, pruebas y matriz funcional coinciden con los archivos actuales. Hay cuatro assets bajo `prototype/assets/`. El workspace no es Git.

## Hallazgos bloqueantes

### H-R1-01 — Ceilings y acciones positivas carecen de autoridad normativa exacta — CRÍTICA

C01 y C03 exigen ceilings “exactos”, pero la ORDEN no incluye la tabla esperada Admin/Worker/Client para las ocho secciones. Dejar que el Ejecutor derive esa tabla del código perpetuaría autoridad no aprobada: el catálogo actual declara `section.settings` asignable a Worker y Client, mientras `VAAK-ROLE-PERMISSIONS.md` marca Global settings como `Not allowed` para ambos y sólo `Proposed` para Admin.

Hay ampliaciones similares en acciones. §5.7 permite a Worker leer, previsualizar, descargar y eliminar Orders de proyecto asignado; la fuente aprobada autoriza crear/emitir POs, deja su lectura Admin/Worker como `Proposed` y declara descarga fuera de la matriz. C06/C12 exigen positivos Admin para edición de proyecto, áreas/equipo/banner/galería, aunque varias de esas facultades siguen `Proposed` o pendientes. Un comportamiento existente del prototipo y una ORDEN anterior rechazada en entrega no sustituyen una decisión humana.

**Corrección requerida:** incorporar una matriz normativa completa `sección/acción/fase/rol/scope/resultado/fuente`. Todo positivo debe enlazar a una capacidad `Allowed` o a una autorización humana específica para esta simulación. Mantener negativos los casos `Proposed`, pendientes o fuera de matriz; si se desean positivos locales para Settings, edición de áreas/equipo, lectura/eliminación/descarga de PO u otra facultad no aprobada, elevar una PREGUNTA concreta al humano en vez de decidirla en la ORDEN. C01, C03, C06, C08, C12, C13, C15–C17 y C29 deben usar esa misma tabla.

### H-R1-02 — La equivalencia C01–C39 sigue siendo parcialmente auto-definida — ALTA

El manifiesto de §9.1 permite que la propia suite implementada declare sus `requiredAssertions`; C39 sólo comprobaría lo que ese mismo manifiesto decidió exigir. Así, una omisión puede desaparecer tanto del test como de su lista esperada.

Además, C08 aplica en bloque “listado, métrica, búsqueda, filtro, preview/download, open y commit” a Supplier, Spec y Order sin especificar qué consumidores existen para cada recurso; C12 usa familias (`role/account/access/banner/team`) en vez de IDs de acción; C16 menciona `emit` y `edit` sin mapearlos al inventario real; y F08 habla de “arrays de grants”, aunque `grants` es un objeto y no enumera qué colecciones deben permanecer vacías. Tampoco se fija la versión objetivo de `user.access`, separada de `schemaVersions.access`.

**Corrección requerida:** hacer que la ORDEN sea la fuente de expectativas, con un anexo cerrado C01–C39 que enumere para cada criterio: claves obligatorias de subaserción, fixture, acción exacta, fase, target/resource, expected y tipo de evidencia. Definir matrices distintas por Supplier/Spec/Order y mapear cada familia de C12/C16 a acciones reales o declarar que no existe. Enumerar las colecciones de F08 y el versionado objetivo completo. La suite puede implementar ese contrato, pero no redefinirlo.

### H-R1-03 — C39 se ejecutaría a sí mismo o carece de runner padre — CRÍTICA

§9.1 ordena que C39 use `spawnSync` para ejecutar suites independientes y C39 exige ejecutar todos los comandos de §9.2. Esa lista contiene `node prototype/access-acceptance.test.js`, donde reside C39. No existe otro runner agregado en archivos permitidos ni en comandos. La lectura literal produce recursión; omitir el propio comando incumple “todos”.

**Corrección requerida:** crear un runner padre separado, por ejemplo `prototype/access-verify.js`, añadirlo a archivos permitidos y asignarle C39. Debe ejecutar una lista cerrada que no se incluya a sí misma, validar C01–C38 y sus subaserciones contra el anexo normativo, validar evidencia visual y sólo entonces imprimir `39/39 PASS`. Alternativamente, definir de forma inequívoca un modo hijo con variable de entorno y demostrar que no puede recursar, aunque el runner separado es más auditable.

### H-R1-04 — Las 20 capturas son factibles, pero el contrato no las genera ni valida de forma reproducible — ALTA

La máquina tiene Edge y Chrome instalados, por lo que el volumen de 20 PNG es viable sin instalar paquetes. Pero ninguno de los comandos obligatorios abre el harness o un navegador, genera capturas nuevas ni correlaciona cada PNG con una ejecución DOM de C37. `access-evidence.test.js` podría limitarse a verificar archivos preexistentes. Además, C38 dice “Sólo PNG” bajo el directorio de evidencia, mientras §10–§11 exigen allí un manifiesto JSON o Markdown.

El límite de red también es ambiguo: la ORDEN prohíbe red, pero una ejecución localhost reproducible normalmente usa loopback; el `prototype/index.html` actual referencia Google Fonts externos. Sin un bloqueo explícito, una captura puede intentar red externa y C38 no podría acreditar lo contrario.

**Corrección requerida:** especificar un comando obligatorio que genere las 20 capturas durante la corrida auditada. Puede hacer que `access-evidence.test.js` levante un servidor estático Node sólo en `127.0.0.1`, lance Edge/Chrome headless, bloquee toda solicitud no-loopback, espere un marcador de éxito del harness, capture cada escenario/idioma y limpie las claves aisladas. Registrar navegador/versión, dimensiones, timestamps y hashes de esa misma corrida; C39 debe fallar ante PNG previo, faltante o no correlacionado. Autorizar expresamente loopback local y prohibir red externa. Definir el contenido exacto del directorio como 20 PNG más un manifiesto, o ubicar el manifiesto fuera de él.

## Implementabilidad de la arquitectura

Fuera de los bloqueos anteriores, la arquitectura es realizable en JavaScript sin dependencias. El refactor será amplio porque `app.js` conserva escrituras dispersas, callbacks, reasignaciones y estado global, pero la separación propuesta permite reemplazarlos en fases verificables. La limitación de `localStorage` está correctamente reconocida: el compare-before-write sirve como simulación y prueba de stale state, no como transacción multiusuario real.

La ausencia de Git no bloquea la REF. Para C38, la Fase A debe producir antes de editar un manifiesto completo pre/post de todas las rutas permitidas y de las raíces excluidas relevantes; los hashes parciales actuales por sí solos no prueban que staging u otro árbol no fue tocado.

## Aspectos conformes que deben conservarse

- Eliminación real de `legacyHandler`, `legacyLayer*`, wrappers `acl*` y callbacks mutantes, no encapsulación.
- Policy, handlers, resolvers y tokens privados; autorización por acción, fase, target, recurso, ruta y scope.
- Relectura y reautorización fresca para render, open, commit y async-commit.
- Migración pura, cuarentena sin efecto, validador relacional global y recovery sin reseed silencioso.
- Supplier mixed visible sólo de forma contextual e inmutable globalmente.
- Confirmación monotónica con cancelación no mutante y protección del último Admin.
- Capturas como evidencia complementaria, nunca sustituto de assertions runtime/DOM.
- Alcance exclusivamente local, sin backend, staging, Supabase, Vercel, cPanel, deploy, producción, dependencias, secretos, gasto ni Git remoto.

## Cierre

La REF `VAAK-ACCESS-3-C` permanece bloqueada en diseño. Este es el ciclo 1: el Arquitecto debe corregir únicamente `H-R1-01`…`H-R1-04`, conservar la misma REF y devolver la ORDEN revisada. No se autoriza implementación ni edición de producto con este VEREDICTO.
