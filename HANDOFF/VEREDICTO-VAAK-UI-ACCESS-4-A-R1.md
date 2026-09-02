---
artifact_type: VEREDICTO
phase: "ui_access"
ref: "VAAK-UI-ACCESS-4-A"
from: reviewer_auditor
to: architect_chief
status: changes_requested
blocking: true
created_at: "2026-09-01"
review_stage: design
cycle: 1
result: CAMBIOS_SOLICITADOS
---

# VEREDICTO R1 de diseño — VAAK-UI-ACCESS-4-A

## RESULTADO: CAMBIOS SOLICITADOS

La ORDEN no es implementable todavía como restauración **exacta**. El bloqueo principal es factual: presenta como baseline canónico un snapshot de staging de 53,565 bytes que no corresponde al estado local inmediatamente anterior a `VAAK-ACCESS-3-C`. Ese snapshot es más antiguo e incompleto. Si se usa para construir las capturas `before`, la comparación visual aprobaría como restauración la pérdida de vistas, rutas y acciones que la instrucción humana exige conservar.

También falta resolver una incompatibilidad entre la SESSION compartida por origen y la prueba de revocación Admin→Worker/Client en pestañas simultáneas, y la migración promete atomicidad entre varias claves de `localStorage` que el navegador no proporciona.

Este VEREDICTO valida únicamente el diseño. No autoriza implementación. La regla bloqueante de `AGENTS.md` permanece activa.

## Independencia y sustitución de roles

La instrucción humana informa que los roles personalizados fallaron. La propia ORDEN documenta específicamente que `architect_chief` no pudo ejecutarse porque su modelo configurado no estaba disponible. Por instrucción humana, esta revisión fue realizada por Codex como sustituto independiente de `reviewer_auditor`, sin participar en la redacción de la ORDEN y sin editar producto. Se abrieron y verificaron fuentes primarias; no se aceptaron las afirmaciones de la ORDEN como evidencia por sí mismas.

## Evidencia independiente revisada

Se leyeron completos:

- `AGENTS.md`, `PROJECT-BRAIN.md` y `PROJECT-STATE.md`;
- los cinco documentos base de `HANDOFF/` en la interpretación obligatoria indicada por `AGENTS.md`;
- `HANDOFF/ORDEN-VAAK-UI-ACCESS-4-A.md`;
- los contratos vivos `docs/roles/README.md`, `ADMIN.md`, `WORKER.md`, `CLIENT.md`;
- `docs/functional/VAAK-ROLE-PERMISSIONS.md` y `VAAK-FUNCTIONAL-BLUEPRINT.md`;
- evidencia pertinente de `VAAK-ACCESS-3-A`, `3-B` y `3-C`, incluida la línea base registrada en `ORDEN-VAAK-ACCESS-3-C.md`, su auditoría R1, su VEREDICTO R3 y su ENTREGA.

Se inspeccionaron directamente `prototype/`, `staging/public/prototype/`, el código de acceso vigente, STORE/SESSION, fixtures, pruebas, hojas de estilo y capa de presentación. Se confirmó que no existe raíz Git verificable.

Hashes y tamaños materiales confirmados:

| Archivo | Bytes | SHA-256 |
|---|---:|---|
| `staging/public/prototype/app.js` | 53,565 | `389FDC52F9A4D50388C4C781A5E15EE8349F7BFDF8B51A879B30895234EBF8DE` |
| `prototype/app.js` actual | 31,169 | `9A779DA1F9BD3A19D81FCD81EFE7543ADF5BBDD7123B3320DDE28F50388A6DB2` |
| `prototype/refinements.css` | 53,975 | `B5EAA908787C64802F93B88DE39C80986DA8862DB4417C4B8D08123DA418D86D` |
| `prototype/presentation.js` | 16,611 | `360D6DE3011B361748C81DAC9B65A9556D2087E37C3DEF81F71389724A2BD76B` |
| `prototype/styles.css` | 14,677 | `A04365DD8B66288D8A8DF28FF92B2E562A7651496A81379F2E6792EEFCCF0D49` |

## Hallazgos bloqueantes

### H-R1-01 — El baseline declarado no es el pre-3-C completo — CRÍTICA

La ORDEN afirma que `staging/public/prototype/app.js`, de 53,565 bytes y timestamp `2026-08-28 19:39:00`, es el baseline canónico anterior a 3-C. La evidencia histórica verificable de la propia secuencia de acceso contradice esa afirmación:

- `HANDOFF/ORDEN-VAAK-ACCESS-3-C.md` registra como línea base local inmediatamente anterior a su implementación `prototype/app.js` de **138,535 bytes**, SHA-256 `793C8C1EC03A2B049480E80FD06F132D148630663CDE066830BFA117CC7B2C3C`.
- `HANDOFF/VEREDICTO-VAAK-ACCESS-3-C-R1.md` dejó constancia de que ese hash y ese diagnóstico coincidían entonces con el archivo real auditado.
- La línea base pre-3-C observada tenía rutas `home`, `project`, `tools`, `team`, `users`, `suppliers`, `orders`, `specs` y `settings`, además de 41 acciones DOM.
- El snapshot de staging propuesto no contiene `data-route="team"`, `advanced-team-filters`, `new-user`, `new-supplier`, `edit-supplier`, `edit-banner`, `banner-next`, `notifications`, `set-banner-cover`, `assign-team-objective`, `edit-team-objective` ni `delete-team-objective`. La extracción directa encuentra sólo 25 acciones DOM únicas.

Por tanto, el archivo de 53,565 bytes puede servir como evidencia histórica parcial del 28 de agosto, pero no como restauración exacta de la interfaz inmediatamente anterior a 3-C. Tampoco basta combinarlo con CSS y traducciones posteriores: esas capas no reconstruyen plantillas, handlers, rutas ni datos que no están en el JavaScript.

**Cambio obligatorio:** sustituir la premisa del baseline. Antes de autorizar ejecución debe recuperarse y verificarse por SHA-256 el `app.js` pre-3-C de 138,535 bytes, o una copia byte-equivalente. Si no es recuperable, detenerse y elevar PREGUNTA al humano: la reconstrucción desde artefactos/capturas sería aproximada y no puede llamarse “restauración exacta” sin aceptación humana explícita. El archivo de staging no debe modificarse ni promoverse silenciosamente a baseline completo.

### H-R1-02 — Las pruebas visuales compararían contra una referencia incompleta — CRÍTICA

La matriz de capturas es amplia, pero su poder de detección depende del `before`. Con el snapshot de 53,565 bytes:

- no puede generarse un `before` válido de Equipo;
- no puede verificarse el flujo de alta de usuario preexistente, porque el snapshot no contiene `new-user`;
- no pueden preservarse ni compararse varias acciones de proyecto, proveedores, banner y objetivos que sí constan en el inventario pre-3-C;
- una igualdad visual contra ese snapshot certificaría precisamente una regresión respecto del baseline real de 138,535 bytes.

Además, §11.1 exige una captura de Equipo y §11.2 exige equivalencia de las capturas 1–18, mientras la Fase A define como fuente el snapshot que no tiene esa ruta. El gate es internamente imposible.

**Cambio obligatorio:** anclar `before`, inventario DOM/acciones y diffs al baseline pre-3-C recuperado y hash-verificado. La suite debe fallar si falta cualquiera de las nueve rutas históricas o cualquiera de las 41 acciones inventariadas, además de abrir visualmente todas las imágenes. Conservar los viewports, fixtures fijos, overlays y clasificación de regiones ya propuestos. Las capturas nuevas de acceso deben quedar separadas de la equivalencia histórica.

### H-R1-03 — La SESSION compartida impide demostrar la revocación Admin→otro usuario entre pestañas — ALTA

El estado real y `prototype/README.md` confirman una sola `vaak-session-v6` en `localStorage` por origen. Dos pestañas de `127.0.0.1` no pueden mantener simultáneamente una sesión Admin y una sesión Worker/Client: al cambiar esa clave, ambas convergen al mismo actor. Perfiles privados o distintos no comparten el mismo `localStorage`, de modo que tampoco reciben el `storage` event del access store.

La ORDEN exige a la vez que una pestaña Admin guarde/deshabilite y que otra pestaña con la sesión afectada redirija o cierre sin contraseña. Ese escenario no es reproducible con la arquitectura de SESSION vigente. Una prueba con dos pestañas del mismo actor no demuestra la revocación solicitada para otro usuario, y Admin no puede revocar sus propios grants inmutables.

**Cambio obligatorio:** definir un modelo de sesión por pestaña compatible con un access store compartido —por ejemplo, migración conservadora a `sessionStorage` para el actor de cada pestaña y `localStorage` sólo para dominio/accesos—, sin borrar `vaak-session-v6`. Especificar bootstrap, precedencia, logout, compatibilidad legacy y pruebas Admin/Worker y Admin/Client realmente simultáneas. Si se elige otra técnica, debe demostrar actores distintos bajo el mismo origen y recepción real del evento del access store.

### H-R1-04 — La migración multi-clave promete “cero escrituras” y atomicidad no disponibles — ALTA

§7.2 ordena persistir primero `vaak-access-v1` y después, cuando corresponda, proyectar/actualizar v6; simultáneamente exige que cuota agotada o validación fallida produzcan cero escrituras. `localStorage` sólo es atómico por llamada individual, no como transacción entre claves. Si la primera escritura tiene éxito y la segunda falla por cuota, ya existe un estado parcial que contradice el criterio.

La proyección “mediante copia” de v7 a v6 tampoco está definida por campos. Los shapes reales difieren: v7 incorpora `schemaVersions`, relaciones separadas, Client A/B, enlaces de proyecto/empresa/PO y entidades cuyos campos no coinciden necesariamente con los consumidores del app v6. Copiar entidades v7-only por ID puede conservar bytes pero producir vistas incompletas o perder semántica relacional. Tampoco se define un schema mínimo que distinga “JSON válido” de “v6 válido”.

**Cambio obligatorio:**

1. declarar honestamente el límite no transaccional y diseñar recuperación verificable de estado parcial, o evitar por diseño una operación que requiera dos escrituras coordinadas;
2. fijar schema/validadores exactos para v6, v7 y access 3-C;
3. especificar mapping por entidad y campo, incluidas relaciones y conflictos, sin convertir una copia estructural en compatibilidad funcional;
4. preservar siempre los raw originales y demostrar rollback/reanudación idempotente ante fallo inyectado en cada escritura;
5. ajustar el criterio “cero escrituras” a algo técnicamente demostrable, sin debilitar la no destrucción.

### H-R1-05 — “Admin total” mezcla acceso a secciones con capacidades funcionales pendientes — ALTA

La instrucción humana hace total e inmutable el **acceso** Admin a las siete secciones. La ORDEN lo representa correctamente en §4, pero §5 afirma a la vez “todas las vistas/acciones existentes del baseline local” para Proyectos. Los contratos aprobados mantienen como `Proposed` o pendientes la edición general de proyecto, áreas/contactos, configuración global y otras mutaciones. La propia §5 termina diciendo que una acción contraria al contrato debe ocultarse/denegarse y que esta REF sólo amplía el acceso Admin a las siete secciones. Ambas reglas no pueden coexistir sin una interpretación normativa explícita.

**Cambio obligatorio:** separar de forma inequívoca:

- acceso Admin fijo ON a las siete secciones y scope `all` implícito;
- capacidades de acción Admin, que siguen la matriz `Allowed/Proposed/Not allowed` salvo una nueva decisión humana explícita.

Eliminar o corregir la frase que concede “todas las acciones existentes”. Añadir una matriz exacta de acciones Admin para que “acceso total” no convierta silenciosamente capacidades `Proposed` en `Allowed`.

## Aspectos conformes que deben preservarse

No requieren rediseño en la revisión R2:

- siete renglones visibles exactos para Worker y Client;
- Admin con las siete secciones fijas ON, sin grants ni project scope editables;
- ceilings Worker `{dashboard, tools, team, suppliers, specs}` y Client `{dashboard, orders}`;
- filas incompatibles visibles OFF, deshabilitadas e inefectivas ante manipulación de storage;
- Tools como dependencia efectiva de Suppliers/Specs sin borrar preferencias hijas;
- `project` derivado de Dashboard y scope, no como octavo interruptor;
- `mode:'all'` como centinela dinámico que incluye proyectos futuros y `selected` como IDs explícitos;
- intersección Client scope × autorización explícita de PO;
- defaults nuevos apagados y defaults legacy de compatibilidad documentados;
- revalidación al abrir y guardar acciones, cierre de modal stale, fallback estable y logout por cuenta deshabilitada/sin rutas;
- conservación de `refinements.css`, `presentation.js`, `styles.css`, logo y activos locales;
- prohibición de staging, puente remoto, backend, deploy, dependencias y red externa;
- reconocimiento expreso de que localhost no es autorización real de servidor.

## Condiciones exactas para R2

La misma REF `VAAK-UI-ACCESS-4-A` puede volver a revisión sólo con una ORDEN revisada que:

1. identifique el baseline pre-3-C correcto de 138,535 bytes y hash `793C8C...`, junto con evidencia de recuperación, o eleve la imposibilidad al humano;
2. rehaga Gate A y la matriz visual contra ese baseline completo;
3. resuelva sesiones simultáneas de actores distintos bajo el mismo origen;
4. haga técnicamente coherente la migración v6/v7/access y sus fallos multi-clave;
5. separe acceso Admin a secciones de capacidades funcionales Admin;
6. preserve sin regresión todos los puntos conformes anteriores.

No se autoriza editar `prototype/`, instalar dependencias, ejecutar migraciones, generar una nueva implementación, desplegar ni tocar staging. Sólo procede revisar la ORDEN y devolverla con esta misma REF.
