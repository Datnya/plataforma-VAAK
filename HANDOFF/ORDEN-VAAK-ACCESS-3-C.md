---
artifact_type: ORDEN
phase: "3"
ref: "VAAK-ACCESS-3-C"
from: architect_chief
to: reviewer_auditor
status: revised_for_review
blocking: true
created_at: "2026-08-31"
review_stage: design
cycle: 3
---

# ORDEN — Remediación estructural y evidencia adversarial de accesos en localhost

## 1. Mandato, autorización y condición de ejecución

La humana autorizó abrir una REF correctiva nueva después del VEREDICTO final `RECHAZADO` de `VAAK-ACCESS-3-B`:

> “okey lo autorizo, sigamos”

Esta ORDEN define la corrección de `H-F01`…`H-F07` exclusivamente en el prototipo local. La autorización no cubre backend, Supabase, Vercel, cPanel, hosting, deploy, producción, Git remoto, datos reales, activos de marca, proveedores reales, secretos, dependencias ni gasto externo.

No se inicia implementación hasta que un `reviewer_auditor` independiente emita VEREDICTO `APROBADO` sobre esta ORDEN. La aprobación de diseño no será un VEREDICTO de entrega. `VAAK-ACCESS-3-A` y `VAAK-ACCESS-3-B` permanecen cerradas como historial no aprobado; no se reescriben.

## 2. Diagnóstico de partida verificado

La inspección directa del 2026-08-31 reproduce el rechazo aunque las suites existentes terminen en verde:

```text
access-control: all assertions passed
access-integration: all assertions passed
39/39 PASS
```

Sondas independientes sobre el mismo código:

```json
{
  "sameReference": true,
  "inputMutated": true,
  "unknownSchemaValid": {"ok": true, "reason": null},
  "unknownPhaseEditUser": true,
  "missingTargetEditUser": true,
  "missingContextBanner": true,
  "mixedSupplierRead": false
}
```

También se verificó:

- `prototype/app.js` conserva `legacyHandler`, `legacyLayer01`…`legacyLayer12`, `aclOpenBase`, `aclLegacyHome`, `aclLegacyShell` y `aclLegacyToolPage`.
- `dispatchAction` existe una vez, pero delega en `legacyLayer12`; por tanto, el nombre único no representa una frontera única.
- `open` acepta callbacks mutantes, se reasigna y captura objetos/STORE obsoletos.
- tres rutas usan `FileReader` y dos cadenas `.then(...)`; sus callbacks pueden escribir después de una revocación sin una nueva autorización completa.
- `ACTION_POLICY` no existe; `authorizeAction` usa sets amplios y no recibe `phase`.
- `migrateState` devuelve la misma referencia y modifica su argumento.
- `validateState` acepta versiones desconocidas y no valida el grafo relacional.
- el arranque fabrica relaciones Client–PO por posición y vincula Supplier/Spec a todos los proyectos.
- `toolPage` reemplaza temporalmente `data[collection]` para filtrar y después lo restaura.
- no existe `confirmedRevision`; un checkbox representa una confirmación no revisionada.
- hay 97 llamadas ad hoc a `aclText(es,en)` y el catálogo estructurado cubre sólo una fracción de los estados de acceso.
- existen 41 acciones DOM observadas, pero la prueba nominal asigna criterios C01–C39 a aserciones distintas o más débiles que sus contratos.
- no existe `HANDOFF/evidence/VAAK-ACCESS-3-B/`.

### 2.1 Baseline local de integridad

No existe raíz Git verificable; esta REF usa hashes, tamaños y timestamps, sin afirmar un diff Git.

| Archivo | Bytes | SHA-256 de partida |
|---|---:|---|
| `LOGO VAAK.png` | 181914 | `840004A7CB7F417A0C300C85E18621335978A0E5C7FD4D4847660404CD1C362E` |
| `prototype/access-control.js` | 13197 | `57ADC35B6D35761F4F12837B22BDEF98F9D319D5A4F2A08816DCFA377B2B2263` |
| `prototype/app.js` | 138535 | `793C8C1EC03A2B049480E80FD06F132D148630663CDE066830BFA117CC7B2C3C` |
| `prototype/access-control.test.js` | 5499 | `8413B336F6A50A108809F6DC447E193EB307CD96D9D8916412FFB59E1EE31436` |
| `prototype/access-integration.test.js` | 1972 | `F5EA59A7C9B4E86D739BDFB6ED6F34A9EF6EE4E7853128B66D86214A5F876F00` |
| `prototype/access-acceptance.test.js` | 6223 | `7B8A9432D406493F5AAF2BDC51DE1125A0458AD45A5277FB6383B4240AD8C751` |
| `prototype/index.html` | 981 | `BE41C8B40B3074BB4772E17558A34008B5F504D2ADC6F46EEBFBF00B916F9F18` |
| `prototype/README.md` | 2894 | `753DE69C3C467681BCEDD2E640EDE6E288F7504C49C08A3924766594192B9339` |
| `docs/functional/VAAK-ROLE-PERMISSIONS.md` | 5413 | `74C9EE2E49BB37848F1A99482959B363F1863EEA0ABF392F1CB04B27EEEE06CD` |

El manifiesto ordenado de los cuatro archivos bajo `prototype/assets/` tiene SHA-256 agregado `ED143E69FA735B075806EE24F8BA1664CCF54081337E207DADFEFC4C534747E4`. Este valor y el hash del logo son invariantes de entrega.

## 3. Resultado exigido y no objetivos

Entregar una simulación local de autorización deny-by-default en la que:

1. toda intención protegida atraviese un único dispatcher real;
2. una tabla privada, exhaustiva y profundamente inmutable gobierne acción, fase, actor, target, recurso y scope;
3. toda apertura, commit y retorno asíncrono relea STORE/SESSION, resuelva nuevamente IDs canónicos y reautorice;
4. toda escritura se haga sobre un clon, se valide y se persista una sola vez desde una transacción central;
5. la migración sea pura, versionada, idempotente, transaccional y fail-closed;
6. validadores y selectores compartidos gobiernen rutas, métricas, listados, preview, descarga, open y commit sin mutar STORE;
7. los scopes Worker y Client funcionen con relaciones vivas inequívocas;
8. la confirmación de acceso use revisiones monotónicas y no sobreviva a cambios posteriores;
9. los flujos de acceso/recovery tengan catálogo ES/EN completo;
10. C01–C39 tengan pruebas conductuales equivalentes al criterio, controles adversariales y evidencia visual trazable.

El prototipo seguirá siendo manipulable desde DevTools y no equivale a autorización de servidor. Esta REF no adopta stack, ADR, backend ni seguridad real.

## 4. Trazabilidad H-F01…H-F07

| Hallazgo rechazado | Corrección obligatoria | Criterios principales |
|---|---|---|
| `H-F01` wrappers/aliases | desmantelamiento, dispatcher y render únicos, handlers privados | C09–C12, C29, C39 |
| `H-F02` policy incompleta | `ACTION_POLICY` privado y exhaustivo por fase/target/resource | C02, C07–C13 |
| `H-F03` TOCTOU open/async | token por IDs/revisiones, contexto fresco y commit central | C12, C32–C33 |
| `H-F04` migración/relaciones | pipeline puro/versionado/transaccional y grafo validado | C14–C22, C30–C31 |
| `H-F05` selectors/scopes | selectores puros y scopes own/foreign/mixed | C06–C08, C13, C29 |
| `H-F06` confirmación/i18n | reducer de draft revisionado y catálogo bilingüe | C23–C28, C35–C37 |
| `H-F07` evidencia débil | contrato de pruebas, fixtures, mutaciones y capturas | C01–C39 |

### 4.1 Matriz normativa cerrada de secciones

Esta matriz es la única autoridad de resultados positivos de la REF. `ALLOW` requiere además STORE válido, actor activo, grant efectivo cuando aplique y scope indicado. `DENY` es obligatorio aunque la interfaz anterior muestre el control. Toda capacidad `Proposed`, pendiente o fuera de `VAAK-ROLE-PERMISSIONS.md` se trata como negativa. La policy no puede derivar permisos de la implementación rechazada.

| Sección/ruta | Fase | Admin | Worker | Client | Scope/resultado | Fuente normativa |
|---|---|---:|---:|---:|---|---|
| `section.dashboard` / `home` interno | route/read | ALLOW | ALLOW | DENY | Worker: proyectos asignados | `View internal projects dashboard` Allowed A/W |
| `section.dashboard` / `home` portal Client | route/read | DENY | DENY | ALLOW | sólo reportes/PO explícitamente autorizados; no proyectos internos | CLT-001/CLT-003 |
| `section.tools` / `tools` | route/read | ALLOW | ALLOW | DENY | contenedor únicamente de herramientas con capacidad Allowed | ADM-007; WRK-004/005/006 |
| `section.team` / `team` | route/read | ALLOW | ALLOW | DENY | A/W lectura de tareas; Worker sólo estado propio | `View tasks` Allowed; WRK-003 |
| `section.users` / `users` | route/read | ALLOW | DENY | DENY | administración de cuentas/accesos | ADM-002/003/005/006 |
| `section.suppliers` / `suppliers` | route/read | ALLOW | ALLOW | DENY | Worker: vínculos a proyectos asignados | `View suppliers` Allowed; WRK-005 |
| `section.orders` / `orders` | route/read | DENY | DENY | ALLOW | Client: historial explícitamente autorizado | A/W `View purchase orders` Proposed; CLT-003 Allowed |
| `section.specs` / `specs` | route/read | ALLOW | ALLOW | DENY | Worker: proyecto asignado | `View SPECs` Allowed; WRK-004 |
| `section.settings` / `settings` | cualquier | DENY | DENY | DENY | sin settings aprobados | `Global settings`: Proposed A; Not allowed W/C |
| `project` derivada | route/read | ALLOW | ALLOW | DENY | proyecto vivo; Worker asignado | `View full project data` Allowed A/W; WRK-002 |

Ceilings efectivos con IDs reales exactos: Admin `{section.dashboard, section.tools, section.team, section.users, section.suppliers, section.specs}`; Worker `{section.dashboard, section.tools, section.team, section.suppliers, section.specs}`; Client `{section.dashboard, section.orders}`. Para Client, `section.dashboard` sólo habilita la modalidad contextual `home` del portal Client descrita en la segunda fila de la matriz; nunca habilita el dashboard interno ni proyectos. No existe `section.dashboard-client`. Admin no recibe las ocho secciones implícitamente: sólo las seis autorizadas arriba. `section.orders` para A/W y `section.settings` para todos permanecen negativas hasta decisión humana nueva.

### 4.2 Matriz normativa cerrada de acciones

Convenciones: `P1` = proyecto vivo y, para Worker, asignado; `OWN` = recurso propio; `AUTH` = relación Client–Company–Project–PO exacta; `DRAFT-P1` = draft de creación de PO ligado a P1. `SYSTEM` designa controles de sesión/presentación sin facultad de negocio. Toda acción no listada es `DENY` para todos y obliga a revisar esta ORDEN.

| Acción exacta | Fases permitidas | Target/recurso | Admin | Worker | Client | Scope/resultado | Fuente |
|---|---|---|---:|---:|---:|---|---|
| `eye` | execute | target forbidden; login field | SYSTEM | SYSTEM | SYSTEM | sólo signed_out; no STORE | Sign in Allowed A/W/C |
| `close` | execute | operation token opcional | SYSTEM | SYSTEM | SYSTEM | cierra UI/token; no STORE | control seguro de UI |
| `logout` | execute | target forbidden | ALLOW | ALLOW | ALLOW | elimina SESSION; no datos | cierre de sesión inherente a sign in |
| `reset-demo` | open,commit | recovery token | SYSTEM | SYSTEM | SYSTEM | sólo estado recovery y doble confirmación | recuperación local, sin autoridad de negocio |
| `notifications` | cualquier | — | DENY | DENY | DENY | capacidad fuera de matriz | fuera de matriz |
| `advanced-team-filters` | execute | vista team | ALLOW | ALLOW | DENY | filtro efímero sobre tareas visibles | `View tasks` Allowed A/W |
| `task` | open,commit | Task/OWN | DENY | ALLOW | DENY | sólo cambio de estado propio | WRK-003 |
| `advance-team-objective` | open,commit | Task/OWN | DENY | ALLOW | DENY | alias funcional sólo si resuelve la misma tarea propia | WRK-003 |
| `new-task` | cualquier | — | DENY | DENY | DENY | crear tareas Proposed | matriz funcional |
| `edit-task` | cualquier | — | DENY | DENY | DENY | editar/asignar tareas Proposed/Not allowed | matriz funcional |
| `assign-team-objective` | cualquier | — | DENY | DENY | DENY | fuera de Allowed | matriz funcional |
| `edit-team-objective` | cualquier | — | DENY | DENY | DENY | fuera de Allowed | matriz funcional |
| `delete-team-objective` | cualquier | — | DENY | DENY | DENY | fuera de Allowed | matriz funcional |
| `new-user` | open,commit | new User draft | ALLOW | DENY | DENY | alta y asignación confirmadas | ADM-002/003 |
| `edit-user` | open,commit | User requerido | ALLOW | DENY | DENY | cuenta/rol/access; último Admin | ADM-003/006 |
| `toggle-user` | open,commit | User requerido | ALLOW | DENY | DENY | disable/enable; último Admin | ADM-005 |
| `confirm-access-review` | execute | User access draft | ALLOW | DENY | DENY | sólo draft revisionado | ADM-003 |
| `request-role-change` | execute | User access draft | ALLOW | DENY | DENY | no muta draft | ADM-003 |
| `confirm-role-change` | execute | pending role decision | ALLOW | DENY | DENY | aplica preset, no confirma revisión | ADM-003 |
| `cancel-role-change` | execute | pending role decision | ALLOW | DENY | DENY | JSON de draft idéntico | ADM-003 |
| `request-tools-removal` | execute | User access draft | ALLOW | DENY | DENY | no muta draft | ADM-003 |
| `confirm-tools-removal` | execute | pending Tools decision | ALLOW | DENY | DENY | retira children, no confirma revisión | ADM-003 |
| `cancel-tools-removal` | execute | pending Tools decision | ALLOW | DENY | DENY | JSON de draft idéntico | ADM-003 |
| `new-project` | open,async-commit | Project draft + cover | ALLOW | DENY | DENY | proyecto administrativo nuevo | ADM-007 |
| `edit-project-card` | cualquier | — | DENY | DENY | DENY | edición general Proposed/Not allowed | matriz funcional |
| `add-team-member` | cualquier | — | DENY | DENY | DENY | gestión de contactos Proposed | matriz funcional |
| `remove-team-member` | cualquier | — | DENY | DENY | DENY | gestión de contactos Proposed | matriz funcional |
| `edit-banner` | cualquier | — | DENY | DENY | DENY | edición multimedia fuera de Allowed | fuera de matriz |
| `gallery` | cualquier | — | DENY | DENY | DENY | alta multimedia fuera de Allowed | fuera de matriz |
| `set-banner-cover` | cualquier | — | DENY | DENY | DENY | edición multimedia fuera de Allowed | fuera de matriz |
| `remove-banner-image` | cualquier | — | DENY | DENY | DENY | edición multimedia fuera de Allowed | fuera de matriz |
| `delete-viewed-image` | cualquier | — | DENY | DENY | DENY | edición multimedia fuera de Allowed | fuera de matriz |
| `banner-next` | execute | Project/P1 | ALLOW | ALLOW | DENY | lectura de datos del proyecto | WRK-002; view project data Allowed |
| `banner-prev` | execute | Project/P1 | ALLOW | ALLOW | DENY | lectura de datos del proyecto | WRK-002 |
| `view-image` | open | Project/P1 + image ID | ALLOW | ALLOW | DENY | sólo imagen del proyecto visible | WRK-002 |
| `new-supplier` | open,commit | Supplier draft + P1 links | ALLOW | ALLOW | DENY | Worker sólo proyectos propios | WRK-005 |
| `edit-supplier` | open,commit | Supplier requerido | ALLOW | ALLOW | DENY | Worker: own-only; mixed sólo lectura | WRK-005 |
| `toggle-supplier` | open,commit | Supplier requerido | ALLOW | ALLOW | DENY | misma regla global own-only | WRK-005 |
| `new-spec` | open,commit,async-commit | Spec draft/P1 | ALLOW | ALLOW | DENY | proyecto asignado; imagen opcional | WRK-004 |
| `preview-spec` | open | Spec requerido/P1 | ALLOW | ALLOW | DENY | sólo lectura en scope | `View SPECs` Allowed |
| `new-order` | open,commit | Order draft/DRAFT-P1 | ALLOW | ALLOW | DENY | crear/emitir; Worker P1 | WRK-006; create/issue Allowed |
| `po-preview-draft` | execute | DRAFT-P1 | ALLOW | ALLOW | DENY | preview efímero del draft, no PO persistida | parte necesaria de create/issue Allowed |
| `po-back` | execute | DRAFT-P1 | ALLOW | ALLOW | DENY | vuelve al draft; no STORE | parte necesaria de create/issue Allowed |
| `add-item` | execute | DRAFT-P1 | ALLOW | ALLOW | DENY | sólo draft efímero | WRK-006 |
| `remove-item` | execute | DRAFT-P1/item | ALLOW | ALLOW | DENY | sólo draft efímero | WRK-006 |
| `add-warehouse` | cualquier | — | DENY | DENY | DENY | modifica dirección de proyecto; no Allowed | edit project Proposed/Not allowed |
| `preview-order` | open | Order requerido/AUTH | DENY | DENY | ALLOW | Client sólo PO autorizada | A/W view Proposed; CLT-003 |
| `download-order` | cualquier | — | DENY | DENY | DENY | descarga/PDF fuera de matriz | guardrail funcional |
| `delete-order` | cualquier | — | DENY | DENY | DENY | eliminación fuera de matriz | guardrail funcional |

La implementación no debe renderizar controles `DENY` como facultades disponibles. Puede conservar plantillas inertes sólo si no son alcanzables y las pruebas demuestran denegación. C01, C03, C06, C08, C12, C13, C15–C17 y C29 se evalúan exclusivamente contra estas dos matrices.

## 5. Arquitectura obligatoria

### 5.1 Separación de módulos

La implementación deberá separar responsabilidades, aunque conserve JavaScript sin dependencias:

- `access-control.js`: catálogo, ceilings, policy privada, autorización pura, validación relacional, migraciones puras, selectores y catálogo i18n.
- `access-runtime.js`: carga fresca, SESSION, registro privado de operaciones, dispatcher, navegación, transacciones y recovery. Se crea obligatoriamente; no se permite volver a esconder el runtime al final de `app.js`.
- `app.js`: plantillas y adaptadores DOM. Recibe view-models; no decide autorización, no migra, no escribe STORE y no conserva callbacks mutantes.
- `access-test-fixtures.js`: fixtures versionados compartidos por las suites, sin credenciales reales.
- suites Node y harness visual definidos en §9–§10.

Las APIs públicas de control/runtime serán `Object.freeze(...)`. Los mapas internos `ACTION_POLICY`, `HANDLERS`, resolvers y el registro de tokens no se exportan ni se adjuntan a `window`. Las funciones públicas retornan copias o descriptores congelados, nunca referencias mutables a policy o estado.

### 5.2 Dispatcher y flujo único

El único flujo permitido es:

```text
DOM / llamada interna / submit / retorno FileReader
                       │
                       ▼
              dispatchAction(command)
                       │
             loadFreshContext()
                       │
       resolve actor + target + resource por ID
                       │
       authorize(command.action, command.phase)
                       │
        handler privado / operación presentada
                       │
        commitState(reducer, expectedRevision)
                       │
        validar → persistir una vez → releer
```

Contrato de `command`:

```js
{
  action: 'edit-user',
  phase: 'open' | 'commit' | 'async-commit' | 'execute',
  targetId: 'worker',
  resource: { type: 'user', id: 'worker' },
  operationToken: 'opaque-id',
  payload: { /* datos serializables, nunca objetos STORE */ }
}
```

Reglas no negociables:

1. `dispatchAction` se declara una sola vez como `const` o función no reasignable.
2. No existen `action`, `legacyHandler`, `legacyLayer*`, `baseAction`, `oldAction*`, `actionWith*`, `acl*Action*`, wrappers equivalentes ni llamadas directas a handlers.
3. `renderCurrentRoute`, `navigateTo`, `openAuthorizedOperation`, `refreshFromStorage` y `commitState` también tienen una única definición no reasignable.
4. `HANDLERS` es privado y profundamente congelado. Ningún handler llama otro handler; toda transición interna vuelve a `dispatchAction`.
5. `openAuthorizedOperation` sólo presenta un descriptor y un token emitidos por runtime. No recibe funciones/callbacks de mutación.
6. El submit serializa el formulario y despacha la misma acción con fase `commit` y token.
7. El token referencia en un `Map` privado: actorId, action, targetId, resourceType/resourceId, route, `openedStoreRevision`, `entityRevision`, `draftRevision` y expiración local. No guarda objetos de STORE.
8. Close/cancel elimina el token. Un token inexistente, reutilizado, expirado, de otra acción, target, actor, sesión o revisión se deniega.
9. FileReader/Promise sólo produce bytes/datos efímeros. Al finalizar despacha `async-commit`; el callback no toca STORE, `data`, proyecto, spec, banner ni modal directamente.
10. Una revocación cierra la operación, no persiste y muestra una clave i18n segura.
11. Los listeners de filtros sólo pueden modificar estado efímero de presentación. No pueden escribir STORE ni alterar colecciones canónicas.

### 5.3 `ACTION_POLICY` privado, inmutable y exhaustivo

Dentro del closure de `access-control.js` habrá una tabla creada con `deepFreeze`, no exportada:

```js
ACTION_POLICY[action] = {
  phases: ['open', 'commit'],
  roles: ['Admin'],
  permission: 'section.users',
  routeContext: ['users'],
  target: { mode: 'required', type: 'user' },
  resource: { resolver: 'userById', mode: 'required' },
  scope: 'admin-only',
  effect: 'write'
};
```

Cada acción declara explícitamente:

- fases permitidas entre `execute`, `open`, `commit`, `async-commit`;
- roles permitidos;
- permiso de sección o excepción exacta de recovery/login;
- contexto de ruta permitido;
- target `required|forbidden|optional` y tipo;
- resolver de recurso y obligatoriedad;
- scope;
- efecto `ui|read|write|destructive`.

No se permiten sets amplios como `NEUTRAL_ACTIONS`, `ADMIN_ACTIONS` o ramas que autoricen por pertenecer a una categoría. Acción desconocida, fase desconocida/no declarada, combinación action+phase inexistente, target requerido ausente, target prohibido presente, tipo incorrecto, recurso ausente/colgante/contradictorio, ruta incompatible o resolver desconocido se deniegan.

Las 41 acciones DOM observadas al inicio son baseline de inventario:

`add-item`, `add-team-member`, `add-warehouse`, `advance-team-objective`, `advanced-team-filters`, `assign-team-objective`, `banner-next`, `banner-prev`, `close`, `delete-order`, `delete-team-objective`, `delete-viewed-image`, `download-order`, `edit-banner`, `edit-project-card`, `edit-supplier`, `edit-task`, `edit-team-objective`, `edit-user`, `eye`, `gallery`, `logout`, `new-order`, `new-project`, `new-spec`, `new-supplier`, `new-task`, `new-user`, `notifications`, `po-back`, `preview-order`, `preview-spec`, `remove-banner-image`, `remove-item`, `remove-team-member`, `reset-demo`, `set-banner-cover`, `task`, `toggle-supplier`, `toggle-user`, `view-image`.

Además, toda acción interna nueva —incluyendo confirmación de revisión, solicitud/aceptación/cancelación de rol, retiro de Tools y recovery— se inventaría automáticamente. `listKnownActions()` puede devolver un array nuevo y congelado de nombres; no puede exponer la tabla. La prueba intentará mutar toda metadata pública y comprobará que la autorización no cambia.

### 5.4 Contexto fresco, STORE y transacción

`loadFreshContext()` ejecuta, en este orden:

1. leer literalmente `vaak-preview-v6` y `vaak-session-v6`;
2. distinguir STORE ausente, JSON inválido, versión conocida y versión desconocida;
3. preparar migración pura cuando corresponda;
4. validar estado y grafo completos;
5. materializar snapshot profundo inmutable;
6. reenlazar actor activo por SESSION;
7. resolver route, selectedProjectId, target y recurso por IDs;
8. validar operación/token si existe;
9. devolver `ready|signed_out|no_access|recovery` sin mutar globals.

STORE tendrá `meta.storeRevision` entero no negativo. Todo commit:

1. relee STORE/SESSION;
2. exige `storeRevision`, actor, target, resource y token esperados;
3. autoriza la fase fresca;
4. clona el snapshot;
5. aplica un reducer puro al clon;
6. incrementa `storeRevision` exactamente en uno;
7. valida el estado hipotético completo;
8. relee el raw inmediatamente antes de escribir y aborta si cambió;
9. ejecuta la única escritura `localStorage.setItem(STORE, ...)` del producto;
10. relee, parsea y valida el resultado persistido.

No habrá `save()`, escrituras dispersas, mutación de `data` antes de validar ni persistencia parcial. El reset usa la misma puerta transaccional especializada y exige recovery + token confirmado. La limitación de `localStorage` y una sesión por origen se documenta; no se presenta como transacción multiusuario real.

### 5.5 Migración pura, versionada y transaccional

El estado objetivo usa exactamente:

```js
schemaVersions: { access: 2, relations: 2, resources: 2 }
```

Este versionado global es distinto del versionado por cuenta: todo usuario no Admin objetivo usa exactamente `user.access = {version: 2, grants: {...}}`; Admin no persiste grants. `user.access.version: 1` sólo es una fuente conocida de migración y `user.access.version` ausente sólo es migrable bajo el shape pre-ACCESS reconocido.

La migración se divide en funciones puras por versión. `migrateState(input)`:

- usa `structuredClone` o clon equivalente;
- nunca modifica `input` ni comparte referencias mutables con la salida;
- devuelve `{ok, state, migrated, from, to, quarantine, errors}`;
- produce serialización canónica idempotente;
- no lee ni escribe localStorage, SESSION, DOM, fecha ni aleatoriedad;
- valida precondiciones de cada paso y el resultado final.

Semántica exacta:

- STORE ausente: sólo el runtime puede crear una copia nueva del seed objetivo.
- JSON inválido, schema desconocido, arrays con tipo incorrecto, IDs críticos duplicados, cero Admin activos o grafo contradictorio: `recovery`, sin seed automático.
- shape pre-ACCESS conocido sin propiedad `access`: migra una vez a defaults normativos exactos. Worker recibe únicamente `{section.dashboard:'enabled', section.tools:'enabled', section.team:'enabled', section.suppliers:'enabled', section.specs:'enabled'}`; Client recibe únicamente `{section.dashboard:'enabled'}` bajo modalidad contextual portal; Admin no persiste `access`.
- `access.version` desconocida/malformada: no recibe defaults; la cuenta queda sin grants efectivos o el estado entra en recovery según el error estructural.
- `schemaVersions` objetivo con arrays vacíos: los vacíos son decisiones válidas y permanecen vacíos.
- relaciones de autorización procedentes de ACCESS-3-A/3-B cuya procedencia no pueda probarse —memberships, Client, Supplier o Spec autofabricadas— pasan a `quarantine` informativa y no conceden acceso. No se infieren relaciones por posición, nombre, `visible`, texto, primer elemento ni producto cartesiano.
- entidades existentes se conservan byte-semánticamente salvo campos de versión, IDs seguros ya demostrables y metadata de cuarentena. No se añade Client B ni órdenes durante migración.
- el seed limpio objetivo sí incluye fixtures A/B definidos en §8.
- Spec legado obtiene `projectId` sólo por coincidencia única de ID/código estable; ambigüedad queda Admin-only con `scopeReviewRequired`, no como grant Worker.
- Supplier legado sin vínculo demostrable queda Admin-only.

La persistencia de una migración preparada ocurre una sola vez desde runtime, sólo si el raw de origen sigue idéntico; si cambió, se descarta y se recalcula desde el nuevo raw. Una falla no escribe ni una parte.

### 5.6 Validador relacional fail-closed

`validateState` valida tipos, versiones, IDs, cardinalidades y todas las claves foráneas. Como mínimo:

- usuarios/proyectos/órdenes/suppliers/specs/tasks tienen IDs únicos y tipos válidos;
- existe al menos un Admin activo;
- cada Order referencia exactamente un Project vivo;
- cada Spec operable por Worker tiene exactamente un `projectId` vivo;
- `projectMemberships` tiene pares únicos y FKs Worker/Project vivos;
- `projectCompanies` tiene como máximo una empresa por Project y pares únicos;
- `supplierProjectLinks` tiene pares únicos y FKs vivas;
- `clientProjectLinks` tiene tuplas singulares Client–Company–Project y coincide con `projectCompanies`;
- `clientOrderAuthorizations` tiene una autorización singular Client–Order–Company–Project, coincide con Order.projectId, projectCompanies y un clientProjectLink vivo;
- duplicados idénticos, duplicados contradictorios, relaciones colgantes, rol incorrecto o cardinalidad ambigua son inválidos;
- quarantine nunca es consultada por autorización.

Un estado global inválido no permite rutas ni acciones y entra en recovery. Los resolvers también fallan cerrados aunque reciban un estado previamente validado.

### 5.7 Selectores puros y scopes canónicos

Los selectores reciben un snapshot congelado y devuelven arrays/proyecciones nuevas. Deben conservar idéntico `canonicalJson(state)` antes/después y funcionar con `deepFreeze(state)`.

Selectores mínimos compartidos:

- `selectProjectsForActor`;
- `selectSuppliersForActor`;
- `selectSpecsForActor`;
- `selectOrdersForActor`;
- `selectTasksForActor`;
- `resolveProjectTarget`, `resolveSupplierTarget`, `resolveSpecTarget`, `resolveOrderTarget`, `resolveUserTarget`;
- `canReadClientOrder`.

Reglas:

- Admin: sólo las secciones y acciones `ALLOW` de §4.1–§4.2 dentro de STORE válido; `Proposed` y fuera de matriz permanecen negativas.
- Project: Admin y Worker pueden leer proyecto/datos/banner/galería/equipo; Worker sólo en proyectos asignados. Las ocho mutaciones `edit-project-card`, `add-team-member`, `remove-team-member`, `edit-banner`, `gallery`, `set-banner-cover`, `remove-banner-image` y `delete-viewed-image` son `DENY` para Admin, Worker y Client en todas las fases.
- Supplier `own-only`: lectura y mutación global permitidas.
- Supplier `foreign-only`: lectura y mutación denegadas.
- Supplier `mixed`: aparece como proyección contextual sólo por los proyectos propios; toda mutación del objeto global se deniega en open y commit.
- Supplier sin links o con links inválidos: Worker no lo ve ni muta.
- Spec: lectura/preview/creación sólo con `projectId` asignado; target ajeno o ambiguo falla.
- Order: Admin/Worker sólo crean/emiten mediante `new-order` y operan el draft P1; lectura de PO persistida, descarga y eliminación permanecen negativas. Client sólo lista y previsualiza una PO `AUTH`; descarga es negativa. `selectedProjectId` nunca sustituye el proyecto del target.
- Task: Worker sólo modifica su tarea propia; listados respetan la decisión funcional vigente.
- Client: `canReadClientOrder` es el único predicado de identidad–empresa–proyecto–PO y se reutiliza en Dashboard, Orders y preview. `download-order` permanece denegada por estar fuera de matriz. `visible` no autoriza.

Métricas, búsqueda, filtros, cards, tablas y botones usan las mismas proyecciones. Queda prohibido reemplazar temporalmente `data.orders`, `data.specs`, `data.suppliers` o cualquier colección.

### 5.8 Confirmación monotónica

El editor usa un reducer puro y este shape mínimo:

```js
{
  draftId: 'opaque',
  baseStoreRevision: 12,
  revision: 0,
  confirmedRevision: -1,
  role: 'Worker',
  grants: {},
  projectIds: [],
  clientProjectIds: [],
  clientOrderIds: [],
  pendingDecision: null
}
```

Invariantes:

- `revision` y `confirmedRevision` nunca disminuyen;
- todo cambio aplicado de identidad, rol, grant, proyecto o vínculo incrementa `revision` exactamente en uno;
- invalidar no borra ni incrementa `confirmedRevision`: queda menor que `revision`;
- confirmar revisión asigna `confirmedRevision = revision` y no modifica contenido;
- sólo se guarda cuando `confirmedRevision === revision` y `baseStoreRevision` sigue vigente;
- presets nunca confirman;
- solicitar cambio de rol no modifica draft; cancelar conserva JSON exacto; aceptar aplica preset compatible, limpia scopes incompatibles, incrementa revisión y exige nueva confirmación global;
- pasar Tools a `disabled` conserva hijos pero los vuelve inefectivos;
- pasar Tools a `none` abre decisión separada; cancelar conserva JSON exacto; aceptar elimina hijos asignables, incrementa revisión y exige reconfirmación;
- habilitar un hijo habilita Tools, incrementa revisión e invalida confirmación;
- autosuspensión, autodegradación y último Admin se validan sobre el estado hipotético antes de persistir.

### 5.9 Catálogo ES/EN

Todo texto alcanzable desde acceso, user management, policy denial, confirmaciones, no-access, recovery/reset y Client–PO usa `t(key, params)`. No se permiten pares ad hoc `aclText(es,en)` en esos módulos/flujos.

El catálogo cubre como mínimo: secciones, roles, estados, botones, campos, resúmenes, alta/edición, revisión, cambio de rol, Tools, proyectos/vínculos/PO, razones de denegación, stale/revocation, no-access, JSON/schema/relación inválidos, recovery, reset advertido/cancelado/confirmado y Client–PO.

La prueba:

- extrae todas las claves `t('...')` usadas y exige que existan;
- exige `es` y `en` no vacíos para cada clave requerida;
- compara placeholders y exige el mismo conjunto en ambos idiomas;
- falla ante clave usada huérfana o requerida no ejercitada sin justificación;
- inyecta un catálogo de prueba con una traducción retirada/vacía y demuestra fallo;
- ejecuta los flujos C37 en ambos idiomas y detecta texto del idioma contrario mediante listas de tokens controladas.

## 6. Fases de ejecución con gates

### Fase A — Desmantelamiento y runtime limpio

- registrar baseline;
- inventariar todas las entradas DOM/internas;
- crear `access-runtime.js`;
- eliminar aliases/wrappers/reasignaciones;
- centralizar navegación, render, modal y STORE;
- añadir pruebas estructurales y de wiring.

**Gate A:** cero símbolos prohibidos, una sola frontera y ninguna escritura STORE fuera de `commitState`.

### Fase B — Schema, migración y grafo

- introducir versiones 2/2/2 y `storeRevision`;
- implementar migraciones puras y transacción de persistencia;
- definir quarantine no efectiva;
- validar todo el grafo y recovery.

**Gate B:** input no mutado, salida sin referencias compartidas, segunda migración byte-idéntica, vacíos persistentes y variantes inválidas en recovery.

### Fase C — Policy, resolvers y selectors

- reemplazar sets por policy privada;
- cubrir inventario exacto;
- implementar selectores y scopes own/foreign/mixed;
- conectar route/list/metric/read/open/commit a la misma fuente.

**Gate C:** toda celda negativa de la matriz falla y ningún selector modifica snapshot.

### Fase D — Runtime TOCTOU, confirmaciones y Client

- tokens y reautorización open/commit/async;
- reducer monotónico;
- Client A/B y predicado único;
- reset de dos pasos.

**Gate D:** revocaciones antes de commit y async-commit no escriben; cancelaciones conservan JSON exacto.

### Fase E — I18N, harness y reconciliación

- completar catálogo;
- ejecutar flujos ES/EN;
- generar capturas requeridas;
- reconciliar README/matriz sin sobredeclarar.

**Gate E:** C01–C39 y todos sus subcasos verdes, evidencia completa y activos intactos.

No avanzar de fase con un gate rojo.

## 7. Fixtures canónicos obligatorios

Las suites compartirán fixtures congelados identificables:

| ID | Contenido mínimo | Propósito |
|---|---|---|
| `F00_VALID` | Admin A; Worker W; Client A/B; P1/P2; Co1/Co2; O1/O2; tasks own/foreign; Supplier own/foreign/mixed; Spec own/foreign; versiones 2/2/2 | matriz positiva/negativa base |
| `F01_CEILING_INJECTION` | Worker/Client con grants Admin inyectados | ceiling |
| `F02_UNKNOWN_POLICY` | ruta, permiso, acción, phase, resolver y combinación desconocidos | deny-by-default |
| `F03_BAD_TARGETS` | target ausente, prohibido, tipo erróneo, inexistente y ajeno | target/resource |
| `F04_RELATIONAL_DANGLING` | una FK colgante por clase relacional | validation/recovery |
| `F05_RELATIONAL_DUPLICATE` | duplicados idénticos y contradictorios | cardinalidad |
| `F06_CLIENT_CONTRADICTION` | autorización cuya company/project no coincide | aislamiento Client |
| `F07_NO_ADMIN` | cero Admin activos | recovery |
| `F08_INTENTIONAL_EMPTY` | versiones 2/2/2; `user.access.version:2` con `grants:{}`; `projectMemberships`, `projectCompanies`, `supplierProjectLinks`, `clientProjectLinks`, `clientOrderAuthorizations` y `quarantine` vacíos; cero entidades añadidas | no repoblar ni confundir objeto grants con arrays |
| `F09_PRE_ACCESS` | shape conocido sin access/versiones | migración única |
| `F10_UNKNOWN_SCHEMA` | al menos una versión futura/desconocida | recovery |
| `F11_MALFORMED_ACCESS` | grants/access con tipo o versión inválida | no defaults |
| `F12_STALE_COMMIT` | operación abierta, STORE revocado antes de commit | TOCTOU sync |
| `F13_STALE_ASYNC` | operación abierta, FileReader resuelto después de revocación | TOCTOU async |
| `F14_NO_ACCESS` | usuario activo con todas las rutas inefectivas | pantalla bilingüe |
| `F15_SHARED_SESSION` | dos runtimes sobre el mismo storage fake | SESSION por origen |
| `F16_LEGACY_3B_RELATIONS` | relaciones autofabricadas conocidas | quarantine sin grant |

Cada variante adversarial parte de un `F00_VALID` probado y cambia una sola dimensión salvo cuando el criterio sea contradicción relacional. Esto evita que una denegación pase por un error no relacionado.

## 8. Criterios de aceptación C01–C39

Cada criterio debe registrar sus subaserciones. `PASS` requiere todas; una captura, regex o aserción distinta no puede sustituirlas.

1. **C01 — Catálogo y rutas.** Exactamente ocho secciones; IDs/rutas únicos; ceilings con IDs reales exactamente iguales a §4.1 —A `{section.dashboard,section.tools,section.team,section.users,section.suppliers,section.specs}`, W `{section.dashboard,section.tools,section.team,section.suppliers,section.specs}`, C `{section.dashboard,section.orders}`—; `section.dashboard` Client se resuelve como portal contextual, nunca dashboard interno. Settings negativa para todos y Orders negativa A/W. `project` queda derivada. Prueba de las 24 celdas, no sólo `length===8`.
2. **C02 — Deny-by-default multidimensional.** Con `F02`, negar separadamente ruta, permiso, acción, fase, resolver y combinación action+phase desconocidos. Incluir `future` para cada dimensión y comprobar razón de denegación estable.
3. **C03 — Ceiling efectivo.** Con `F01`, inyectar cada grant como `enabled` en A/W/C; comprobar las 24 expectativas de §4.1. En particular `section.users` W/C, `section.settings` A/W/C y `section.orders` A/W siguen inefectivas.
4. **C04 — Admin autorizado/ruta derivada.** Admin activo sin grants persistidos abre sólo sus seis rutas `ALLOW`, no Orders/Settings. `project` exige Dashboard y projectId vivo para Admin/Worker; Worker además membership; Client falla siempre.
5. **C05 — Ruta Project Worker.** Worker abre P1 asignado y no P2; retirar membership cierra P1; deshabilitar Dashboard cierra ambos; selectedProjectId ajeno no altera el resultado.
6. **C06 — Project lectura y mutaciones negativas.** A/W leen P1 —Worker sólo asignado— mediante `banner-next`, `banner-prev`, `view-image`; C falla. `edit-project-card`, `add-team-member`, `remove-team-member`, `edit-banner`, `gallery`, `set-banner-cover`, `remove-banner-image` y `delete-viewed-image` se deniegan a los tres roles en todas las fases, porque son Proposed o fuera de matriz.
7. **C07 — Recursos Worker fail-closed.** Supplier/Spec/Order sin vínculo, con FK colgante, target inexistente, target ajeno y tipo incorrecto se deniegan. El estado relacional global inválido entra en recovery cuando corresponda.
8. **C08 — Selectores/scope uniforme por consumidor existente.** Supplier: list/metric/search/filter y `edit-supplier`/`toggle-supplier` open+commit; Spec: list/metric/search/filter y `preview-spec` open más `new-spec` open/commit; Order A/W: sólo `new-order`, draft preview/back/items y commit en P1/P2; Order Client: list/dashboard/Orders route y `preview-order`; `download-order`/`delete-order` negativas. Congelar snapshot y comparar JSON antes/después de cada selector/render.
9. **C09 — Inventario exhaustivo.** Extraer acciones de HTML, listeners, `dispatchAction({...})`, modal y async; igualdad exacta con `listKnownActions()`. Cero faltantes y cero policy huérfana salvo allowlist documentada de acciones internas realmente probadas.
10. **C10 — Policy privada/inmutable.** Intentar mutar arrays/metadata pública y confirmar que no cambia autorización. Verificar que `ACTION_POLICY`, `HANDLERS`, resolvers y Map de tokens no están exportados/window. Probar target required/forbidden/optional y resource required en acciones representativas de cada clase.
11. **C11 — Dispatcher único real.** Source invariant: una definición no reasignable de dispatcher/render/navigate/open/commit; cero aliases/wrappers prohibidos; cero callbacks mutantes a modal; cero handler directo. Runtime spy: DOM, acción interna, submit y retorno async incrementan el mismo contador de dispatcher y no otro entrypoint.
12. **C12 — Acciones administrativas exactas.** `new-user`, `edit-user`, `toggle-user`, `confirm-access-review`, `request|confirm|cancel-role-change` y `request|confirm|cancel-tools-removal` son positivas sólo para Admin con target/draft válido. `new-project` es positiva sólo para Admin. Todas las acciones Project/media/contact de C06 son negativas también para Admin. Probar cada ID y fase declarada.
13. **C13 — Worker operativo normativo.** `task`/`advance-team-objective` sólo tarea propia; `new-spec` P1 positivo/P2 negativo y `preview-spec` P1 positivo; Supplier own lectura+open+commit positivos, foreign negativos, mixed lectura contextual positiva y mutación global negativa; `new-order` y draft P1 positivos/P2 negativos. Lectura persistida, preview persistida, download y delete de PO son negativas para Worker.
14. **C14 — Seed adversarial.** Seed limpio tiene A/W/Client A/B, P1/P2, Co1/Co2, O1/O2, autorizaciones opuestas, suppliers own/foreign/mixed y specs own/foreign; valida 2/2/2. La migración no puede crear este seed desde STORE existente.
15. **C15 — Cross-client completo.** A y B: list/dashboard/Orders route y `preview-order` propios positivos; los mismos cuatro consumidores cruzados negativos con ID manipulado. `download-order` es negativa incluso para la PO propia. `F06` produce recovery/denegación, nunca lectura cruzada.
16. **C16 — Client sin mutaciones, IDs exactos.** Client A/B denegados para `new-order`, `po-preview-draft`, `po-back`, `add-item`, `remove-item`, `add-warehouse`, `delete-order` y todas las acciones Project/Supplier/Spec/Task/User de §4.2. No se crean acciones abstractas `emit` o `edit` que no estén en inventario.
17. **C17 — Predicado Client único.** Instrumentar `canReadClientOrder` y demostrar uso en Dashboard, Orders y `preview-order`. Con Orders `none`, Dashboard propio permite preview; ruta Orders falla. `download-order` falla en ambos contextos por norma, no por relación.
18. **C18 — `visible` no autoriza.** Alternar `visible` true/false en O propia/ajena/sin relaciones; el resultado sólo cambia por relaciones exactas, nunca por `visible`.
19. **C19 — Defaults legacy únicos.** `F09`: Worker recibe exactamente cinco grants enabled `{section.dashboard,section.tools,section.team,section.suppliers,section.specs}`; Client recibe exactamente `{section.dashboard}` con modalidad portal; `section.orders` Worker no se conserva ni se crea como enabled; Admin no persiste grants. Segunda migración idéntica. Un usuario ya versionado vacío no recibe defaults.
20. **C20 — Migración pura/cerrada.** Input no mutado, output referencia distinta y sin referencias anidadas compartidas; versión conocida migra; `F10` y `F11` no conceden defaults y producen recovery/estado inefectivo según contrato.
21. **C21 — Preservación/transacción.** Snapshot sanitizado antes/después demuestra conservación de entidades/valores; sólo cambian campos autorizados/versiones/quarantine. Simular falla de validación y cambio concurrente: cero escrituras parciales y raw original idéntico.
22. **C22 — Vacíos e idempotencia.** `F08` atraviesa migrate, persist, reload, storage event y segunda migración; todos los arrays siguen vacíos y JSON canónico es idéntico. Ningún `.length===0` activa bootstrap.
23. **C23 — Alta confirmada.** Nuevo usuario: botón final deshabilitado con `revision=0/confirmed=-1`; confirmar iguala revisiones y habilita; commit crea exactamente una cuenta; token reutilizado no crea otra.
24. **C24 — Invalidación monotónica.** Después de confirmar, cambiar individualmente identidad, rol aceptado, grant, Worker project, Client project y Client order incrementa revision una vez, deja confirmedRevision anterior e impide guardar. Ambos contadores nunca disminuyen.
25. **C25 — Cambio de rol.** Solicitar y cancelar conserva JSON exacto; aceptar aplica preset no confirmado, elimina grants/scopes incompatibles, incrementa revisión y exige nueva confirmación. Probar Worker→Client, Client→Worker y hacia/desde Admin; último Admin protegido.
26. **C26 — Ciclo de grant.** `none→enabled→disabled→enabled→none` conserva cada estado, incrementa revision por transición, exige reconfirmación y persiste el resultado final sin resucitar defaults tras reload.
27. **C27 — Disabled.** Grant disabled persiste en STORE/reload y aparece en resumen, pero no habilita nav/card/route/read/open/commit. Probar sección top-level y child.
28. **C28 — Tools.** disabled conserva hijos y los vuelve inefectivos; none abre confirmación; cancel conserva JSON; aceptar elimina hijos e incrementa revision; habilitar hijo habilita Tools e invalida confirmación. Probar ES y EN en runtime.
29. **C29 — Fuente común/no mutación.** Nav, cards, route, métricas, selectors, actions y commits consumen §4.1–§4.2 mediante policy/selectores compartidos. Source invariant prohíbe reemplazo temporal de colecciones; runtime usa deepFreeze y JSON equality. Supplier mixed cumple lectura contextual/mutación global negativa; ningún consumidor convierte Proposed/out-of-matrix en positivo.
30. **C30 — Invariante Admin.** Deshabilitar/degradar al último Admin, autodeshabilitación/autodegradación y commit concurrente que dejaría cero Admin fallan antes de escribir. Con dos Admin, deshabilitar uno ajeno funciona; siempre queda uno activo.
31. **C31 — Recovery/reset.** JSON inválido, `F07`, `F10`, `F04/F05/F06` no abren rutas ni reseedean. Recovery tiene precedencia, retira SESSION y cierra tokens. Reset open no escribe; cancelar conserva claves; commit sin confirmación falla; confirmado escribe seed una vez, elimina SESSION y vuelve a login.
32. **C32 — Relectura completa.** Spies de storage prueban lectura STORE+SESSION antes de render, navigate, open, commit, preview, download, async-commit y storage event. Actor/target/resource resueltos son objetos del snapshot fresco, no referencias de apertura.
33. **C33 — Revocación/TOCTOU.** Con `F12/F13`, revocar por separado cuenta, grant, membership, target y relación Client/Supplier/Spec/Order entre open y commit; modal cierra, STORE no cambia y razón localizada aparece. Repetir al menos membership y target en async-commit.
34. **C34 — SESSION compartida.** Dos runtimes sobre `F15`: cambiar/eliminar una única `vaak-session-v6` afecta ambos tras storage event; modal del actor anterior cierra. README documenta que pestañas no representan usuarios independientes.
35. **C35 — No-access bilingüe.** `F14` produce sólo pantalla no-access, sin rutas/cards protegidos, y logout funciona. Probar texto y acción en ES y EN.
36. **C36 — Catálogo completo.** Todas las claves usadas tienen es/en y placeholders equivalentes; retirar/vaciar una traducción o agregar una clave usada inexistente hace fallar la prueba. Cero texto ad hoc en los módulos/flujos protegidos.
37. **C37 — Recorrido ES/EN real.** Harness ejecuta alta, confirmación, edición Client, rol, Tools, disabled, denegación Worker, Client own/cross, recovery/reset y no-access en ambos idiomas; afirma estado DOM y ausencia de tokens del idioma contrario. Capturas §10 coinciden con resultados mecánicos.
38. **C38 — Límite e integridad.** Hash logo/manifiesto de cuatro assets idénticos; cero archivos tocados fuera de alcance, paquetes o red externa. El directorio de evidencia contiene exactamente 20 PNG más `manifest.json`; loopback 127.0.0.1 es la única red autorizada. No afirmar diff Git.
39. **C39 — Verificación agregada no recursiva.** `access-verify.js` ejecuta la lista hija cerrada de §9.2, que no contiene al runner; exige exit 0, contrato C01–C38 completo y evidencia visual recién generada. Sólo el padre añade C39 e imprime `39/39 PASS`.

### 8.1 Anexo cerrado de subaserciones y expectativas

Este anexo, no la suite, fija las claves obligatorias. Los nombres son exactos y no pueden omitirse, renombrarse, fusionarse ni marcarse N/A. `A/W/C` significa ejecutar los tres roles; `O/C/A` significa fases open/commit/async-commit cuando estén declaradas. Cada fixture base debe validar antes de alterar la dimensión bajo prueba.

| C | Claves obligatorias de subaserción | Fixture / acción-fase-target-resource | Expected exacto | Evidencia mínima |
|---|---|---|---|---|
| C01 | `catalog-8`,`unique-ids`,`unique-routes`,`ceiling-24`,`project-derived` | `F00`; 8 secciones × A/W/C | igualdad exacta con §4.1 | unit + matriz serializada |
| C02 | `unknown-route`,`unknown-permission`,`unknown-action`,`unknown-phase`,`unknown-resolver`,`unknown-combination` | `F02`; valores `future-*` separados | DENY con razón correspondiente | unit behavioral |
| C03 | `inject-admin-8`,`inject-worker-8`,`inject-client-8` | `F01`; cada grant enabled | 24 celdas iguales a §4.1 | unit behavioral |
| C04 | `admin-six-positive`,`admin-orders-negative`,`admin-settings-negative`,`project-admin-live`,`project-admin-missing`,`project-worker-member`,`project-client-negative` | `F00`; route/read | resultados §4.1 | unit/runtime |
| C05 | `worker-p1`,`worker-p2`,`membership-revoked`,`dashboard-disabled`,`selected-project-ignored` | route `project`; Project P1/P2 | `ALLOW,DENY,DENY,DENY,DENY` | unit/runtime |
| C06 | `project-read-a`,`project-read-w`,`project-read-c`,`project-mutations-a`,`project-mutations-w`,`project-mutations-c` | acciones exactas enumeradas en C06; phases de §4.2 | reads A/W allow; C deny; 8 mutaciones deny A/W/C | unit + policy matrix |
| C07 | `supplier-unlinked`,`supplier-dangling`,`spec-unlinked`,`spec-dangling`,`order-missing`,`order-wrong-type`,`foreign-target` | `F03/F04`; O/C según acción | DENY/recovery según validator | unit behavioral |
| C08 | `supplier-consumers`,`spec-consumers`,`order-create-consumers`,`client-order-consumers`,`selectors-frozen`,`render-json-equal` | `F00`; consumidores exactos C08 | §4.2 y JSON idéntico | unit/runtime/DOM |
| C09 | `dom-actions`,`internal-actions`,`modal-actions`,`async-actions`,`policy-exact-49`,`no-orphans` | inventario estático+runtime | conjunto exacto 41 baseline + 8 internas de §4.2 | source + runtime trace |
| C10 | `policy-private`,`handlers-private`,`resolvers-private`,`tokens-private`,`metadata-copy-frozen`,`target-required`,`target-forbidden`,`resource-required` | `F00/F03`; mutate public descriptors | no export; mutación sin efecto; invalid DENY | source + mutation test |
| C11 | `single-dispatch`,`single-render`,`single-navigate`,`single-open`,`single-commit`,`zero-legacy`,`zero-callback-modal`,`zero-direct-handler`,`dom-through-dispatch`,`internal-through-dispatch`,`submit-through-dispatch`,`async-through-dispatch` | source + runtime spies | conteos 1/0 y mismo dispatcher | source + runtime counter |
| C12 | `user-actions-admin`,`user-actions-worker`,`user-actions-client`,`new-project-admin`,`new-project-worker-client`,`project-denials-all`,`revoke-between-open-commit` | 10 acciones User, `new-project`, 8 negativas C06; phases exactas | sólo positives §4.2 | unit/runtime |
| C13 | `task-own`,`task-foreign`,`spec-p1`,`spec-p2`,`supplier-own`,`supplier-foreign`,`supplier-mixed-read`,`supplier-mixed-open`,`supplier-mixed-commit`,`order-create-p1`,`order-create-p2`,`order-persisted-read-negative`,`order-download-negative`,`order-delete-negative` | `F00`; targets canónicos | resultados C13 | unit/runtime |
| C14 | `seed-actors`,`seed-projects-companies`,`seed-orders-auth`,`seed-supplier-scopes`,`seed-spec-scopes`,`seed-valid-222`,`migration-not-seed` | clean seed vs STORE existente | composición exacta; migración no añade seed | unit snapshot |
| C15 | `client-a-dashboard-own`,`client-a-dashboard-cross`,`client-a-orders-route-allow`,`client-a-orders-list-own`,`client-a-orders-list-cross`,`client-a-preview-own`,`client-a-preview-cross`,`client-a-id-manipulated-cross`,`client-b-dashboard-own`,`client-b-dashboard-cross`,`client-b-orders-route-allow`,`client-b-orders-list-own`,`client-b-orders-list-cross`,`client-b-preview-own`,`client-b-preview-cross`,`client-b-id-manipulated-cross`,`client-a-download-own-negative`,`client-b-download-own-negative`,`client-contradiction` | `F00/F06`; A/O1 y B/O2; route home/orders; target propio/ajeno/ID manipulado | dashboard/list/preview propios ALLOW; Orders route ALLOW para A/B con grant; dashboard/list/preview/ID cruzados DENY; download propio DENY; contradicción recovery | unit/runtime/DOM |
| C16 | `client-new-order`,`client-po-preview-draft`,`client-po-back`,`client-add-item`,`client-remove-item`,`client-add-warehouse`,`client-delete-order`,`client-all-other-dom-actions` | A/B; cada ID §4.2 y fases declaradas | DENY para todos los intentos Client | policy matrix runtime |
| C17 | `predicate-dashboard`,`predicate-orders-route`,`predicate-preview`,`orders-none-dashboard-preview`,`orders-none-route-deny`,`download-both-contexts-deny` | Client A/O1; route home/orders | resultados C17 | call spy + runtime |
| C18 | `visible-own-true`,`visible-own-false`,`visible-foreign-true`,`visible-no-links` | O1/O2 con visible alternado | sólo AUTH altera lectura | unit property variants |
| C19 | `legacy-worker-default-section-dashboard`,`legacy-worker-default-section-tools`,`legacy-worker-default-section-team`,`legacy-worker-default-section-suppliers`,`legacy-worker-default-section-specs`,`legacy-worker-orders-not-enabled`,`legacy-client-section-dashboard-portal-only`,`legacy-admin-no-grants`,`legacy-second-pass-identical`,`versioned-empty-no-defaults`,`user-access-version-2` | `F09/F08` | Worker exactamente cinco IDs reales; Client exactamente dashboard contextual; Orders Worker ausente/inefectivo; segunda pasada idéntica | migration snapshots |
| C20 | `input-reference-different`,`input-json-unchanged`,`nested-references-different`,`known-migrates`,`unknown-schema-recovery`,`malformed-access-no-defaults` | `F09/F10/F11` | pure/fail-closed | unit + deep reference walk |
| C21 | `entities-preserved`,`only-authorized-fields`,`validation-failure-zero-write`,`concurrent-change-zero-write`,`single-success-write` | valid legacy + storage fake | raw original intact en fallas; 1 write éxito | storage spy/snapshots |
| C22 | `empty-grants-object`,`empty-memberships`,`empty-project-companies`,`empty-supplier-links`,`empty-client-project-links`,`empty-client-order-auth`,`empty-quarantine`,`reload-empty`,`storage-event-empty`,`second-pass-byte-identical`,`no-length-bootstrap` | `F08` | todas vacías/idénticas | unit/runtime/source |
| C23 | `new-disabled-initial`,`new-confirm-enables`,`new-single-create`,`new-token-reuse-deny` | Admin new-user O/C | estados y conteos exactos | reducer/runtime DOM |
| C24 | `revision-identity`,`revision-role`,`revision-grant`,`revision-worker-project`,`revision-client-project`,`revision-client-order`,`confirmed-stays-old`,`counters-monotonic`,`save-denied-after-each` | access draft | `revision +1`; confirmed sin cambio; commit deny | reducer property tests |
| C25 | `role-request-no-change`,`role-cancel-json-identical`,`role-accept-worker-client`,`role-accept-client-worker`,`role-to-admin`,`role-from-admin`,`preset-unconfirmed`,`scopes-cleared`,`last-admin-deny` | User draft | contrato §5.8 | reducer/runtime |
| C26 | `grant-none-enabled`,`grant-enabled-disabled`,`grant-disabled-enabled`,`grant-enabled-none`,`grant-revision-each`,`grant-reload-none` | access draft | estados exactos y no default resurrection | reducer/storage |
| C27 | `disabled-persist`,`disabled-summary`,`disabled-nav`,`disabled-card`,`disabled-route`,`disabled-read`,`disabled-open`,`disabled-commit`,`disabled-child` | top-level + child | persist/visible summary; autoridad DENY | runtime/DOM |
| C28 | `tools-disabled-keeps-children`,`tools-disabled-ineffective`,`tools-none-request`,`tools-none-cancel-json`,`tools-none-confirm-removes`,`tools-confirm-revision`,`child-enables-tools`,`tools-es`,`tools-en` | access draft | contrato §5.8 | reducer/runtime/i18n |
| C29 | `nav-policy`,`cards-policy`,`routes-policy`,`metrics-selectors`,`actions-policy`,`commits-policy`,`mixed-all-consumers`,`zero-collection-replacement`,`frozen-state`,`no-proposed-positive` | `F00`; §4 matrices | misma decisión y cero mutación | source/runtime |
| C30 | `last-admin-disable`,`last-admin-demote`,`self-disable`,`self-demote`,`concurrent-zero-admin`,`two-admin-disable-one`,`one-admin-remains` | variants Admin | cinco deny sin write; caso two-admin allow | unit/storage spy |
| C31 | `invalid-json`,`no-admin`,`unknown-schema`,`dangling`,`duplicate`,`contradiction`,`recovery-precedence`,`session-removed`,`tokens-closed`,`reset-open-zero-write`,`reset-cancel-zero-write`,`reset-unconfirmed-deny`,`reset-confirm-one-write`,`reset-login` | `F04/F05/F06/F07/F10` | recovery/reset exactos | runtime/storage/DOM |
| C32 | `read-render`,`read-navigate`,`read-open`,`read-commit`,`read-preview`,`read-download`,`read-async`,`read-storage-event`,`fresh-actor`,`fresh-target`,`fresh-resource` | storage read spy; `download-order` se despacha aunque termine DENY | STORE+SESSION leídos antes de decidir, incluida descarga denegada; referencias frescas | runtime spy |
| C33 | `revoke-account`,`revoke-grant`,`revoke-membership`,`revoke-target`,`revoke-client-link`,`revoke-supplier-link`,`revoke-spec-project`,`revoke-order-project`,`async-revoke-membership`,`async-revoke-target`,`zero-write-all`,`localized-reason` | `F12/F13` | deny/cierra modal/0 writes | runtime/storage/i18n |
| C34 | `shared-session-set`,`shared-session-remove`,`tab-a-refresh`,`tab-b-refresh`,`stale-modal-close`,`readme-session-limit` | `F15` | ambos runtimes reflejan misma SESSION | runtime + docs source |
| C35 | `no-access-es`,`no-access-en`,`no-protected-routes`,`no-protected-cards`,`logout-es`,`logout-en` | `F14` | sólo no-access + logout | DOM/runtime |
| C36 | `all-used-keys-exist`,`all-required-es`,`all-required-en`,`placeholder-parity`,`no-orphan-required`,`missing-key-mutant-fails`,`empty-translation-mutant-fails`,`zero-protected-acltext` | catálogo + source | todos true; mutantes detectados | unit/source |
| C37 | `flow-new-user-es-en`,`flow-edit-client-es-en`,`flow-role-es-en`,`flow-tools-es-en`,`flow-disabled-es-en`,`flow-worker-denial-es-en`,`flow-client-own-cross-es-en`,`flow-recovery-reset-es-en`,`flow-no-access-es-en`,`no-language-mix`,`twenty-correlated-results` | harness scenarios §10 | DOM assertions pass en ambos idiomas | browser result callbacks + PNG |
| C38 | `logo-hash`,`assets-count-4`,`assets-manifest-hash`,`excluded-roots-unchanged`,`no-packages`,`no-external-network`,`loopback-only`,`exact-20-png`,`manifest-one`,`fresh-mtimes`,`hashes-match` | baseline + generated evidence | igualdad/alcance exactos | hashes/network log/filesystem |
| C39 | `child-list-exact`,`runner-not-child`,`all-child-exit-zero`,`c01-c38-contract-complete`,`evidence-current-run`,`failed-zero`,`final-39-of-39` | `access-verify.js` | sólo padre imprime `39/39 PASS` | subprocess report |

El contrato máquina de la ENTREGA debe reflejar literalmente estas claves. El Auditor comparará igualdad de conjuntos contra este anexo; agregar subpruebas es permitido, eliminar o reemplazar una clave no.

## 9. Contrato de pruebas y comandos

### 9.1 Regla contra pruebas nominales débiles

La fuente normativa es el anexo §8.1. `access-verify.js` contendrá una copia literal y congelada de las 39 claves de criterio y de todas sus subaserciones; el `reviewer_auditor` comprobará igualdad con §8.1. `access-acceptance.test.js` sólo ejecuta y reporta C01–C38: no define qué es obligatorio ni contiene C39.

```js
{
  id: 'C33',
  requiredAssertions: ['revoke-account', 'revoke-grant', /* ...exactamente §8.1... */],
  evidenceKinds: ['runtime', 'storage-spy', 'i18n']
}
```

El runner padre debe:

- comprobar igualdad exacta de IDs `C01`…`C39`, sin duplicados;
- rechazar claves faltantes, renombradas o inesperadas frente a §8.1;
- exigir todos los `requiredAssertions` y las expectativas exactas del anexo;
- impedir `PASS` si sólo hubo regex cuando el criterio exige runtime;
- impedir `PASS` si el fixture base ya era inválido por otra razón;
- imprimir por criterio subaserciones ejecutadas, fixture, expected/actual y evidencia;
- imprimir total exacto de subaserciones normativas más cualquier extra identificado separadamente;
- incluir controles negativos de la propia suite: policy mutable, traducción retirada, stale commit, unknown phase y relación contradictoria deben ser detectados por mutantes/inyección, no editando producto.

`access-verify.js` es el único propietario de C39. Usa `child_process.spawnSync` sobre `CHILD_COMMANDS`, una lista literal `Object.freeze` que no contiene `access-verify.js`, valida cada exit code/reporte JSON y falla si detecta su propio nombre en cualquier comando hijo. No existe modo recursivo, variable de entorno de recursión ni llamada del acceptance al padre.

### 9.2 Comandos obligatorios

El comando de auditoría es único:

```powershell
node prototype/access-verify.js
```

El padre ejecuta exactamente esta lista cerrada y no recursiva, en este orden:

```text
node --check prototype/access-control.js
node --check prototype/access-runtime.js
node --check prototype/app.js
node --check prototype/presentation.js
node --check prototype/access-test-fixtures.js
node --check prototype/access-evidence.test.js
node prototype/access-control.test.js --report-json
node prototype/access-runtime.test.js --report-json
node prototype/access-integration.test.js --report-json
node prototype/access-acceptance.test.js --child --report-json
node prototype/access-evidence.test.js --generate --report-json
```

Ningún comando hijo puede invocar `access-verify.js`. `access-acceptance.test.js --child` reporta exclusivamente C01–C38 y sus claves; `access-evidence.test.js --generate` reporta las claves browser/filesystem de C37/C38. El padre fusiona reportes, valida §8.1, agrega C39 y sólo entonces imprime una única línea final `39/39 PASS`.

Además, la ENTREGA incluye salida literal de una verificación estructural automatizada que pruebe:

- cero símbolos/aliases/wrappers prohibidos;
- una sola definición no reasignable de funciones frontera;
- cero callbacks mutantes en modal;
- cero llamada directa a handlers;
- una sola escritura STORE central;
- cero bootstrap por arrays vacíos/posición/producto cartesiano;
- cero reemplazo temporal de colecciones;
- inventario action/policy exacto;
- policy/handlers privados.

No instalar test runner ni dependencia. Si Node, Edge/Chrome o loopback local no están disponibles, emitir HALLAZGO bloqueante; no rebajar criterios.

## 10. Harness y capturas obligatorias

Crear `access-browser-harness.html/js` sin paquetes. Debe usar las mismas APIs de producto con un storage adapter aislado (`vaak-access-3-c-test-*`), limpiar esas claves antes/después de cada escenario y nunca tocar `vaak-preview-v6`/`vaak-session-v6`.

Para esta evidencia se autoriza expresamente red **sólo loopback** en `127.0.0.1`; toda red externa permanece prohibida. `access-evidence.test.js --generate` debe, durante la misma corrida del padre:

1. resolver Edge instalado y usarlo con preferencia; si no existe, resolver Chrome. Rutas aceptadas: `%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe`, `%ProgramFiles%\Microsoft\Edge\Application\msedge.exe`, `%ProgramFiles%\Google\Chrome\Application\chrome.exe` y `%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe`;
2. registrar `browserPath` y salida literal `--version`;
3. levantar un servidor Node estático efímero ligado únicamente a `127.0.0.1` y puerto asignado por el SO; rechazar Host no loopback y traversal;
4. servir CSP `default-src 'self' data: blob:; connect-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; object-src 'none'; frame-src 'self'`; el harness y sus dependencias tendrán cero URL `http(s)` externa, incluida Google Fonts;
5. borrar únicamente los 20 nombres esperados y `manifest.json` dentro de la ruta exacta validada `HANDOFF/evidence/VAAK-ACCESS-3-C/`; registrar `runId` y `runStartedAt` después de limpiar;
6. lanzar un proceso headless nuevo por escenario/idioma con perfil temporal, `--headless=new`, `--disable-gpu`, `--hide-scrollbars`, `--window-size=1440,1000`, `--virtual-time-budget=10000`, `--disable-background-networking`, `--disable-component-update`, `--disable-sync`, `--no-first-run` y `--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost`;
7. abrir sólo `http://127.0.0.1:<port>/prototype/access-browser-harness.html?scenario=<id>&lang=<es|en>&run=<runId>&token=<nonce>` y escribir cada PNG mediante `--screenshot=<absolutePath>`;
8. hacer que el harness ejecute assertions DOM con el runtime real y envíe por `fetch` loopback a `/__result` un resultado firmado por nonce de corrida `{runId,token,scenario,lang,pass,assertionKeys,stateHash}` antes de mostrar el marcador DOM `data-harness-status="pass"`;
9. aceptar una captura sólo si el servidor recibió exactamente un resultado correlacionado, `pass:true`, las assertionKeys esperadas y el proceso browser terminó 0;
10. registrar todas las solicitudes recibidas y `performance.getEntriesByType('resource')`; fallar si cualquier URL no es loopback/data/blob o si stderr muestra una dependencia externa del harness;
11. comprobar PNG válido, dimensiones `1440×1000`, mtime posterior a `runStartedAt` y SHA-256 calculado después del proceso;
12. cerrar servidor, eliminar perfiles temporales y limpiar storage de prueba aun si falla.

Persistir exactamente 20 PNG, dos por escenario, en `HANDOFF/evidence/VAAK-ACCESS-3-C/`:

1. `01-new-worker-unconfirmed-{es,en}.png`
2. `02-new-worker-confirmed-{es,en}.png`
3. `03-edit-client-{es,en}.png`
4. `04-role-confirmation-{es,en}.png`
5. `05-tools-removal-{es,en}.png`
6. `06-worker-foreign-denied-{es,en}.png`
7. `07-client-own-cross-{es,en}.png`
8. `08-recovery-no-admin-{es,en}.png`
9. `09-reset-confirmation-{es,en}.png`
10. `10-no-access-{es,en}.png`

Cada captura debe mostrar la interfaz necesaria para identificar actor/estado/idioma, sin contraseñas ni DevTools. El directorio contiene **exactamente 21 archivos**: los 20 PNG anteriores y `manifest.json`; no se permite `.md` dentro. `manifest.json` incluye `runId`, inicio/fin UTC, browser/path/version, flags, host/port, declaración `externalNetworkBlocked:true`, log resumido de orígenes, y por PNG: nombre, escenario, idioma, fixture, criterios/subaserciones, token correlacionado no reutilizable, dimensiones, timestamp, bytes, SHA-256 y `stateHash`. El propio manifiesto no se autoenumera ni requiere hash de sí mismo.

C39 falla si un PNG precede `runStartedAt`, falta el callback correlacionado, el manifiesto corresponde a otro runId, aparece un archivo 22, se usó URL externa o el generador no se ejecutó en la corrida actual. Las capturas complementan assertions DOM/runtime; nunca las sustituyen.

## 11. Archivos permitidos

Producto/pruebas:

- `prototype/access-control.js`
- `prototype/access-runtime.js` (nuevo y obligatorio)
- `prototype/access-test-fixtures.js` (nuevo)
- `prototype/app.js`
- `prototype/access-control.test.js`
- `prototype/access-runtime.test.js` (nuevo)
- `prototype/access-integration.test.js`
- `prototype/access-acceptance.test.js`
- `prototype/access-evidence.test.js` (nuevo)
- `prototype/access-verify.js` (nuevo; runner padre no recursivo)
- `prototype/access-browser-harness.html` (nuevo)
- `prototype/access-browser-harness.js` (nuevo)
- `prototype/refinements.css`
- `prototype/presentation.js` sólo si la integración i18n lo exige
- `prototype/index.html` por orden de carga/cachebuster local
- `prototype/README.md`
- `docs/functional/VAAK-ROLE-PERMISSIONS.md`, sólo reconciliación factual

Handoff/evidencia:

- `HANDOFF/ENTREGA-VAAK-ACCESS-3-C.md`
- `HANDOFF/evidence/VAAK-ACCESS-3-C/` y sus 20 PNG + manifiesto

No modificar `PROJECT-BRAIN.md`, `PROJECT-STATE.md`, ADR, contratos aprobados de roles, otros handoffs, `LOGO VAAK.png`, `prototype/assets/`, staging, backend, Supabase, Vercel, cPanel, hosting, GitHub remoto ni archivos ajenos. No inicializar Git, instalar paquetes ni usar red externa. La única excepción de red es loopback `127.0.0.1` durante el harness §10; quedan prohibidos otros hosts localhost, LAN, Internet y toda URL externa.

## 12. Evidencia exigida en ENTREGA

La ENTREGA deberá incluir:

1. tabla exacta de archivos creados/modificados y propósito;
2. hashes/timestamps antes/después y manifiesto de assets;
3. declaración de ausencia de Git verificable y de diff Git;
4. outputs literales de §9;
5. matriz C01–C39 con subaserciones, fixtures, evidencia, expected/actual;
6. inventario DOM/interno/policy;
7. informe de policy privacy/deep-freeze;
8. informe de una sola frontera y una sola escritura STORE;
9. snapshots sanitizados input/output/segunda migración y prueba de no mutación/no referencias compartidas;
10. pruebas de schemas desconocidos, tipos malformados, duplicados, dangling y contradicciones;
11. matriz Admin/Worker/Client A/B × route/action/phase/target/resource;
12. matriz Supplier own/foreign/mixed y Spec/Order own/foreign por selector/read/open/commit;
13. matriz Client A/B list/dashboard/orders/preview/download/mutation;
14. trazas storage-spy de render/navigate/open/commit/async/storage;
15. trazas de stale modal y stale async con cero escrituras;
16. trazas revision/confirmedRevision, rol y Tools accept/cancel;
17. reporte de catálogo y prueba mutante i18n;
18. manifiesto y hashes de 20 capturas;
19. README/matriz reconciliados como “entregado para auditoría”, nunca “aprobado”;
20. desviaciones/HALLAZGOS explícitos; no usar “ninguno” si faltó una prueba.

## 13. Documentación y límites

`prototype/README.md` debe documentar:

- cuentas ficticias del seed objetivo;
- claves STORE/SESSION y `storeRevision`;
- una sola sesión por origen y efecto entre pestañas;
- recovery y reset confirmado;
- quarantine de relaciones legacy ambiguas;
- manipulación inevitable de demo cliente;
- ausencia de seguridad real/backend/deploy.

`VAAK-ROLE-PERMISSIONS.md` conserva decisiones funcionales y sólo actualiza el estado local: 3-A y 3-B rechazadas; 3-C entregada para auditoría cuando ocurra. No alterar Allowed/Proposed/Not allowed ni presentar esta ORDEN como aprobación.

## 14. Condiciones de detención

Detener y emitir HALLAZGO/PREGUNTA si:

- la solución requiere backend, red externa, dependencia, deploy o cambio de activo; la única excepción permitida es loopback `127.0.0.1` exclusivamente durante el harness §10;
- una relación sólo puede recuperarse inventando autoridad;
- no puede eliminarse un wrapper sin romper funcionalidad fuera del alcance y no existe aislamiento seguro;
- un gate de fase queda rojo;
- no se pueden ejecutar las pruebas conductuales o las 20 capturas;
- la suite sólo puede lograr 39/39 debilitando un criterio.

No push, merge, deploy, producción, secretos, dinero ni proveedores reales.

## 15. Instrucción al reviewer_auditor

Auditar esta ORDEN contra el VEREDICTO `VAAK-ACCESS-3-B-ENTREGA.md` y el código real. Priorizar:

1. que crear `access-runtime.js` implique eliminar, no encapsular, las capas viejas;
2. que policy y handlers sean privados/inmutables y la autorización cubra phase/target/resource;
3. que toda escritura y retorno async reautoricen desde STORE/SESSION frescos;
4. que migración pura y validator relacional no legitimen relaciones 3-B autofabricadas;
5. que Supplier mixed sea visible contextualmente pero inmutable globalmente;
6. que `confirmedRevision` sea realmente monotónico e invalidable;
7. que C01–C39 exijan sus subcasos y que C39 ejecute suites independientes;
8. que capturas, hashes y outputs sean evidencia complementaria verificable.

No aprobar por la presencia de nombres, regex o `39/39 PASS`. APROBADO requiere que esta ORDEN sea implementable sin ambigüedad y que sus pruebas no puedan pasar conservando `H-F01`…`H-F07`.
