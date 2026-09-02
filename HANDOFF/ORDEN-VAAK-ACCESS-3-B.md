---
artifact_type: ORDEN
phase: "3"
ref: "VAAK-ACCESS-3-B"
from: architect_chief
to: reviewer_auditor
status: revised_for_review
blocking: true
created_at: "2026-08-31"
---

# ORDEN — Corrección cerrada de accesos granulares en localhost

> Revisión 2 limitada a `H-R1-01`…`H-R1-04` de `HANDOFF/VEREDICTO-VAAK-ACCESS-3-B-R1.md`. Se conserva la REF, el alcance local y todo lo declarado conforme por el Auditor.

## 1. Mandato, autorización y estado del ciclo

Abrir una referencia correctiva nueva y solucionar exclusivamente las brechas `H-E01` a `H-E07` registradas en `HANDOFF/VEREDICTO-VAAK-ACCESS-3-A-ENTREGA.md`, preservando los aspectos conformes de `VAAK-ACCESS-3-A` y sin ampliar el alcance fuera del prototipo local.

La instrucción humana exacta que origina esta REF es:

> “sí, autorizo, procede”

La instrucción fue dada en respuesta a abrir una nueva referencia correctiva y solucionar las siete brechas en localhost. Por tanto, existe autorización humana para ejecutar la corrección local una vez que el `reviewer_auditor` emita VEREDICTO `APROBADO` sobre esta ORDEN. Mientras el VEREDICTO no sea `APROBADO`, la implementación permanece bloqueada. La autorización no incluye backend, Supabase, Vercel, cPanel, deploy, producción, Git remoto, activos de marca, proveedores reales, secretos ni gasto externo.

`VAAK-ACCESS-3-A` se conserva como historial no aprobado. Esta REF no reabre ni altera sus artefactos; corrige sus siete brechas bajo el identificador estable `VAAK-ACCESS-3-B`.

## 2. Resultado exigido

Entregar una simulación local de autorización coherente y auditable en la que:

1. exista un único dispatcher operativo que no pueda ser sustituido por wrappers posteriores;
2. toda apertura y todo commit sensible se autoricen con STORE y SESSION recién leídos;
3. la política deniegue por defecto según acción, fase, target y recurso canónico;
4. Worker sólo liste y consulte proyectos asignados; las mutaciones del objeto Project, sus datos, banner y equipo permanecen Admin-only. Worker sólo puede mutar Suppliers, Specs y Orders dentro de su scope, y un Supplier global compartido sólo cuando todos sus proyectos vinculados estén dentro de ese scope;
5. la migración sea versionada, transaccional, idempotente y distinga ausencia migrable de corrupción o arrays intencionalmente vacíos;
6. Client use un mismo predicado de identidad–empresa–proyecto–PO en Dashboard, historial, preview y descarga;
7. un STORE sin Admin activo o estructuralmente inválido entre en recuperación cerrada, sin regeneración silenciosa;
8. las confirmaciones de accesos, rol y retiro de Tools sean explícitas e invalidables;
9. todo texto nuevo de acceso y recuperación tenga catálogo completo Español/English;
10. los 39 criterios originales dispongan de prueba reproducible y evidencia caso por caso;
11. README y matriz funcional describan sólo comportamiento demostrado, sin declarar seguridad real ni aprobación inexistente.

El objetivo no es blindar `localStorage` contra DevTools. El resultado sigue siendo una demo cliente manipulable. “No reemplazable” significa que, dentro del código entregado y de sus flujos DOM/internos, no existe una referencia mutable, wrapper, callback o handler exportado que pueda evitar la frontera única. La seguridad real continúa fuera de alcance.

### 2.1 Trazabilidad cerrada de brechas

| Brecha | Corrección ordenada | Secciones rectoras |
|---|---|---|
| `H-E01` | Eliminar wrappers, dispatcher único y reautorización antes de open/commit | §5.1, §5.2, Fase A, C11–C12/C32–C33 |
| `H-E02` | Policy exhaustiva por acción+fase+target+recurso y scopes Worker Supplier/Spec/Order | §5.3, §5.4, Fase C, C07–C10/C13 |
| `H-E03` | Migración transaccional versionada, vacíos intencionales y corrupción cerrada | §5.5, Fase B, C19–C22 |
| `H-E04` | Predicado Client–PO único, modalidades coherentes y seed A/B negativo | §5.6, Fase D, C14–C18 |
| `H-E05` | Validador global, recovery exclusivo, reset confirmado y relectura/rebind | §5.2, §5.7, Fase E, C30–C35 |
| `H-E06` | Draft revisionado, rol/Tools confirmados y catálogo ES/EN completo | §5.8, §5.9, Fase E, C23–C28/C36–C37 |
| `H-E07` | Suite reproducible 39/39, evidencia completa y documentación reconciliada | Fase F, §8–§11, C38–C39 |

## 3. Evidencia de partida verificada

La inspección directa del legado confirma:

- `prototype/app.js` tiene aproximadamente 132 KB y fue construido por capas acumulativas.
- Hay una definición inicial y doce reasignaciones posteriores de `action`: trece implementaciones encadenadas en total.
- Hay una definición inicial y cuatro reasignaciones posteriores de `render`: cinco capas en total.
- Hay treinta llamadas a `open()`; el `onsubmit` actual conserva callbacks arbitrarios y referencias capturadas antes de una revocación.
- `dispatchAction` sólo delega a la variable mutable `action`.
- Las redefiniciones finales de `new-user` y `edit-user` se ejecutan antes del guard instalado en una capa anterior.
- `access-control.js` concede varias acciones “neutrales” sin target ni recurso; Suppliers y Specs no resuelven proyecto y las mutaciones de Order pueden depender del proyecto seleccionado en vez del target.
- `migrateState` interpreta cualquier `access.version !== 1` como cuenta migrable y concede defaults.
- Arrays relacionales vacíos se repueblan por longitud; Client links y autorizaciones se fabrican en `app.js` por posición del primer Client/proyecto/orden.
- Specs sólo conservan nombre y número visibles de proyecto; Suppliers no tienen vínculo relacional a proyectos.
- El seed integrado sólo tiene un Client y una PO.
- STORE inválido o sin Admin puede abrir rutas internas o regenerar seed silenciosamente.
- La prueba actual tiene 21 aserciones, no 39 casos de aceptación ni integración de la frontera DOM/modal.
- `prototype/README.md` y `docs/functional/VAAK-ROLE-PERMISSIONS.md` sobredeclaran guards centrales y deny-by-default.
- No existe raíz Git verificable. La evidencia de archivos deberá apoyarse en inventario, hashes y timestamps, sin afirmar un diff Git inexistente.

Esta base obliga a una normalización estructural del tramo de autorización. Queda expresamente prohibido resolver `H-E01` añadiendo una decimocuarta capa sobre `action` o una sexta capa sobre `render`.

## 4. Invariantes que deben conservarse de ACCESS-3-A

- Catálogo exacto de ocho secciones y ceilings por rol.
- Acceso Admin implícito a las ocho rutas del catálogo, sujeto a cuenta activa y STORE global válido. `project` es una ruta derivada no catalogada y exige además `section.dashboard`, rol Admin/Worker y `projectId` existente; Worker requiere membresía y Client siempre se deniega.
- `section.users` inefectivo para Worker y Client aunque se inyecte en STORE.
- Dependencia efectiva de Tools cuando está `disabled`.
- `project` exclusivo de Admin/Worker; Worker necesita membresía; Client siempre denegado.
- Protección de autosuspensión/degradación y del último Admin activo.
- Pantalla bilingüe de usuario activo sin rutas efectivas.
- Denegación nominal de rutas, permisos y acciones desconocidas.
- Ausencia de cambios en logo, backend, Supabase, Vercel, cPanel, despliegue y producción.

Estos puntos deben volver a probarse. “Conservar” no permite copiar sus implementaciones vulnerables ni dar por válida la evidencia anterior.

## 5. Arquitectura correctiva

### 5.1 Frontera única y no sustituible

Refactorizar el tramo de interacción de `prototype/app.js`; no anexar otro parche al final.

La arquitectura obligatoria es:

```text
evento DOM / llamada interna / submit modal
                    │
                    ▼
        dispatchAction(command)  ← única entrada
                    │
         reloadAndValidateContext()
                    │
       resolve target + resource canónicos
                    │
       authorizeAction(fase open/commit)
                    │
        handler privado o commit transaccional
                    │
        validate resulting state → persist → reread
```

Requisitos estructurales:

1. Eliminar todas las definiciones y reasignaciones de `action`, sus aliases `baseAction`, `oldAction*`, `actionWith*`, `aclLegacyAction`, `aclUserActionBase` y toda llamada directa `action(...)`.
2. Consolidar las cinco capas de `render` en una función final de renderizado por tabla de rutas. No dejar aliases `oldRender*`, `renderWith*` o wrappers que puedan saltarse relectura y guard.
3. Crear un registro privado e inmutable de handlers. Puede vivir en `prototype/app.js` o en un nuevo `prototype/access-runtime.js` sin dependencias, pero no debe exportar handlers ni un método de ejecución sin autorización.
4. El runtime público, si se separa, debe exponerse mediante `Object.freeze`; los listeners deben capturar referencias `const` a `dispatchAction`, `navigateTo`, `renderCurrentRoute` y `refreshFromStorage`, no consultar funciones mutables en `window`.
5. Debe existir exactamente una declaración de `dispatchAction`. Ninguna asignación posterior puede reemplazarla.
6. Todo evento `[data-action]`, acción interna, tecla de proyecto, navegación y submit sensible entra por esa frontera. Los listeners auxiliares de filtros pueden modificar sólo presentación efímera y no STORE.
7. `open()` deja de aceptar callbacks mutantes arbitrarios. Debe ser una función de presentación que reciba un descriptor de operación autorizado y un token opaco, o reemplazarse por `openAuthorizedOperation` que sólo pueda ser invocada desde el dispatcher.
8. El token de modal almacena IDs y contexto mínimo —acción, fase, target ID, tipo de recurso, resource ID/proyecto y revisión del draft—, nunca referencias a objetos de STORE.
9. El submit del modal vuelve a entrar a `dispatchAction` con fase `commit`; relee STORE y SESSION, resuelve nuevamente actor, target y recurso por ID, reautoriza y sólo entonces ejecuta la mutación.
10. Operaciones asíncronas de imagen/archivo vuelven a reautorizar después de terminar la lectura y antes de escribir. Una autorización anterior al `FileReader` no basta.
11. Una operación revocada cierra el modal, descarta su draft sin mutar STORE, informa en el idioma activo y reubica al usuario o devuelve login/recuperación.
12. Acciones internas como volver al formulario de PO, reabrir banner o avanzar un flujo deben despachar un comando nuevo; no pueden invocar handlers privados directamente.

La prueba estructural deberá devolver cero coincidencias para los patrones prohibidos de wrappers y una sola frontera observable.

### 5.2 Contexto fresco en render, navegación, apertura y commit

Crear una única rutina pura o controlada, equivalente a `reloadAndValidateContext()`, que en cada uso:

1. lea el valor actual de `vaak-preview-v6`;
2. lea el valor actual de `vaak-session-v6`;
3. distinga STORE ausente de STORE presente pero inválido;
4. ejecute migración versionada sólo si el shape corresponde a una versión conocida;
5. valide el estado completo y el invariante de al menos un Admin activo;
6. reconstruya `data` desde el snapshot válido;
7. reenlace `user` al objeto actual del STORE mediante SESSION;
8. revalide `route`, `selectedProjectId`, operación modal, target y recurso;
9. retire SESSION si la cuenta no existe, está inactiva o ya no es válida;
10. entre en recuperación si el STORE es estructuralmente inválido o no tiene Admin activo.

Debe ejecutarse antes de:

- cada render interno;
- cada navegación;
- fase `open` de cada acción;
- fase `commit` de cada mutación;
- preview y descarga;
- evento `storage`;
- retorno de cualquier operación asíncrona antes de persistir.

Toda escritura debe realizarse sobre un clon, validar el estado hipotético completo, persistir una sola vez y volver a leer STORE/SESSION. No se permite mutar primero el objeto global y validar después.

### 5.3 Política deny-by-default por acción, fase, target y recurso

`prototype/access-control.js` debe sustituir sets amplios por una tabla exhaustiva e inmutable, por ejemplo:

```js
ACTION_POLICY[action] = {
  phases: ['open', 'commit'],
  roles: ['Admin', 'Worker'],
  permission: 'section.orders',
  target: 'required' | 'forbidden' | 'optional',
  resolver: 'order' | 'spec' | 'supplier' | 'project' | 'task' | 'modal-draft',
  scope: 'assigned-project' | 'own-task' | 'client-order' | 'admin' | 'ui-only',
  mutatesStore: true | false
};
```

La forma exacta puede variar, pero debe cumplir:

- acción desconocida: denegada;
- fase no declarada: denegada;
- target requerido ausente, inexistente o de tipo incorrecto: denegado;
- resource ID ausente, inexistente, colgante o contradictorio: denegado;
- recurso recibido del DOM no se confía: sólo se aceptan IDs y se resuelve el objeto canónico desde el snapshot fresco;
- un proyecto seleccionado no sustituye al proyecto del target;
- un permiso de sección no concede alcance global de datos;
- listados, métricas, filtros, preview, descarga, apertura y commit usan selectores/predicados comunes.

Sólo pueden tratarse como `ui-only` acciones sin lectura ni mutación de datos protegidos, y aun así deben tener regla explícita y contexto válido. `po-back`, `delete-viewed-image`, `add-item` y `remove-item` salen del conjunto neutral: pertenecen a un draft de PO o a un recurso Project autorizado. `banner-prev`, `banner-next`, `view-image`, filtros avanzados y controles similares deben comprobar la ruta/recurso contextual que muestran.

La tabla debe cubrir las cuarenta acciones observadas en el DOM/código y `edit-user-access` si se conserva como acción explícita. Toda acción nueva de esta REF —incluyendo confirmaciones, recovery y reset— debe incorporarse al inventario y política antes de usarse.

### 5.4 Modelo relacional y scopes Worker

Adoptar un modelo local con IDs estables y cardinalidad validable:

```js
schemaVersions: {
  access: 2,
  relations: 1,
  resources: 1
},
projectMemberships: [
  { userId: 'worker', projectId: 'p1' }
],
projectCompanies: [
  { projectId: 'p1', companyId: 'company-1' }
],
supplierProjectLinks: [
  { supplierId: 'sp1', projectId: 'p1' }
],
clientProjectLinks: [
  { clientId: 'client-a', companyId: 'company-1', projectId: 'p1' }
],
clientOrderAuthorizations: [
  { clientId: 'client-a', orderId: 'o1', companyId: 'company-1', projectId: 'p1' }
]
```

Además:

- cada Order tiene `projectId` existente;
- cada Spec tiene `projectId` existente; `project` y `projectNumber` pueden quedar como texto de presentación, nunca como autoridad runtime;
- Supplier usa `supplierProjectLinks` porque puede pertenecer a varios proyectos;
- Worker usa `projectMemberships`;
- Client usa vínculos singulares Client–Company–Project y autorizaciones singulares Client–Order–Company–Project;
- claves naturales relacionales duplicadas se consideran inválidas; duplicados contradictorios o vínculos colgantes fallan cerrados;
- no se infiere scope runtime por nombre de proyecto, proveedor, empresa, texto de formulario, posición de arrays o `visible`.

Crear selectores puros y compartidos, como mínimo equivalentes a:

- `selectProjectsForActor`;
- `selectSuppliersForActor`;
- `selectSpecsForActor`;
- `selectOrdersForActor`;
- `resolveSupplierTarget`;
- `resolveSpecTarget`;
- `resolveOrderTarget`;
- `isAssignedProject`;
- `canReadClientOrder`.

Reglas Worker:

- Supplier — lectura: Worker puede listar, contabilizar, buscar y consultar un Supplier cuando existe al menos un `supplierProjectLink` vivo hacia uno de sus proyectos asignados; el selector sólo expone el Supplier dentro de ese contexto permitido.
- Supplier — mutación global: como el objeto Supplier es único, Worker sólo puede abrir y confirmar edición, habilitación o deshabilitación si existe al menos un vínculo y **todos** los proyectos vivos vinculados al Supplier están dentro de sus proyectos asignados. Si no hay vínculos, existe un vínculo colgante o el conjunto es mixto —al menos un proyecto asignado y otro ajeno—, la operación falla cerrada antes de `open` y nuevamente antes de `commit`. Admin conserva la operación global.
- Supplier — creación y vínculos: Worker puede crear un Supplier sólo seleccionando uno o más proyectos propios y no puede agregar, retirar ni alterar vínculos que involucren proyectos ajenos. Esta REF no introduce atributos Supplier por proyecto ni una operación nueva por vínculo.
- Spec: listar/previsualizar/crear sólo con `projectId` asignado; toda creación usa selector de proyecto por ID, no input libre como autoridad.
- Order: listar/métrica/previsualizar/descargar/eliminar/crear sólo por el `projectId` canónico de la orden o del draft; `selectedProjectId` no autoriza una orden target de otro proyecto.
- Recurso inexistente o sin relación inequívoca: denegado.

Los fixtures de Supplier deben cubrir tres casos separados: `own-only` —todos los links dentro del scope Worker, lectura y mutación permitidas—; `foreign-only` —ningún link dentro del scope, lectura y mutación denegadas—; y `mixed` —al menos un link propio y uno ajeno, lectura contextual permitida pero toda mutación global denegada en `open` y `commit`. El mismo predicado debe gobernar selector, métricas, acciones y commit.

Debe eliminarse el patrón que modifica temporalmente `data.orders` para renderizar una lista filtrada. La UI consume selectores y no altera el STORE ni el objeto global durante render.

### 5.5 Migración segura y versionada

Implementar migración pura, transaccional y con resultado estructurado, por ejemplo `{ok, state, migrated, warnings, errors}`. No debe mutar el argumento original.

Reglas obligatorias:

1. Usar presencia de propiedad y versión conocida; nunca `array.length === 0` como señal de migración.
2. STORE ausente significa primera ejecución y puede crear el seed limpio versionado.
3. STORE presente con JSON inválido, schema desconocido, arrays de tipo incorrecto, IDs duplicados críticos, vínculos colgantes/contradictorios o cero Admin activos entra en recuperación; no se reemplaza por seed.
4. Usuario pre-ACCESS sin propiedad `access` es migrable una sola vez a defaults compatibles.
5. Usuario con `access.version` presente pero desconocida/malformada no recibe defaults. Sus accesos quedan inefectivos o el estado se rechaza según la severidad estructural; nunca falla abierto.
6. `schemaVersions.relations === 1` con arrays vacíos representa una decisión válida e intencional y debe permanecer vacío tras recarga, relectura y segunda migración.
7. Si faltan versiones pero existe shape de `VAAK-ACCESS-3-A`, no confiar silenciosamente en relaciones Client–PO cuya procedencia no puede distinguirse de la autofabricación. Conservar entidades operativas y poner esas relaciones en cuarentena/no efectivas hasta revisión Admin explícita; no convertirlas en grants.
8. Los arrays de cuarentena, si se usan, son informativos y jamás consultados por autorización.
9. Worker existente puede recibir la compatibilidad aprobada de todos los proyectos sólo en el paso explícito pre-ACCESS → versión relacional 1. La marca evita repetirla; vaciar después sus membresías debe persistir.
10. Specs legadas sólo pueden mapear `projectId` durante migración si un `projectNumber` estable coincide de forma única con `project.code`; cero o varias coincidencias dejan la Spec sin scope Worker y requieren revisión Admin.
11. Suppliers legados no se vinculan por nombre. Sólo el seed conocido puede declarar links por IDs conocidos; proveedores personalizados sin link quedan Admin-only hasta asignación explícita.
12. Nunca fabricar autorización Client–PO desde `visible`, primera posición, nombre, empresa textual o coincidencia aproximada.
13. Conservar exactamente proyectos, órdenes, specs, proveedores, tareas, imágenes, credenciales ficticias y preferencias de idioma; sólo añadir versionado, IDs/relaciones seguros o metadatos de cuarentena.
14. Ejecutar validación antes y después de cada paso; si falla, no persistir el resultado parcial.

### 5.6 Predicado único Client–PO y seed negativo

`canReadClientOrder(state, actorId, orderId)` debe ser el único predicado de identidad y recurso para Client. Sólo devuelve permitido cuando, en un estado global válido:

1. el actor existe, está activo y tiene rol Client;
2. la PO existe y tiene `projectId` válido;
3. existe exactamente un vínculo Client–Company–Project coincidente;
4. existe exactamente una autorización Client–Order–Company–Project coincidente;
5. existe exactamente una relación Project–Company coincidente;
6. no hay duplicados ni contradicciones para esa clave.

La modalidad de entrada se evalúa aparte, sin bifurcar este predicado:

- Dashboard Client: exige Dashboard efectivo y usa `selectReadableClientOrders` basado en `canReadClientOrder`.
- Ruta Orders: exige Tools + Orders efectivos y usa el mismo selector.
- Preview/download desde Dashboard: exige que la ruta actual sea Dashboard efectiva y vuelve a ejecutar `canReadClientOrder` para el target.
- Preview/download desde Orders: exige la ruta Orders efectiva y vuelve a ejecutar el mismo predicado.

El contexto se deriva del runtime actual y no de un atributo DOM confiable. Si una PO aparece en Dashboard, su preview y descarga deben funcionar bajo Dashboard aunque `section.orders` esté en `none`; esto no concede acceso a la ruta Orders. `visible` queda sólo como dato legado de presentación.

El seed limpio versionado debe incluir al menos:

- Admin activo;
- Worker activo;
- Client A y Client B activos con credenciales ficticias distintas;
- dos empresas;
- dos proyectos asociados a empresas distintas;
- PO A y PO B en proyectos distintos;
- autorización A exclusivamente para Client A y autorización B exclusivamente para Client B;
- Suppliers y Specs con vínculos de proyecto por ID para probar scope Worker.

Client A y B deben fallar al listar, previsualizar o descargar la PO ajena y al intentar cualquier mutación de PO, incluso por ID/DOM manipulado.

### 5.7 Fallo cerrado y recuperación/reset

Definir estados runtime explícitos: `ready`, `signed_out`, `no_access` y `recovery`. `recovery` tiene precedencia sobre sesión y rutas.

Cuando STORE esté presente pero no pueda validarse o no tenga Admin activo:

- no promover usuarios;
- no aplicar seed automáticamente;
- no mostrar rutas internas;
- retirar SESSION;
- cerrar modal y descartar drafts;
- mostrar únicamente una pantalla bilingüe de recuperación con causa no sensible;
- ofrecer `Restablecer demo / Reset demo` mediante una acción pública específica y deny-by-default para todo lo demás.

El reset es destructivo sólo para los datos ficticios locales y requiere dos pasos: advertencia explícita más confirmación inequívoca —checkbox/frase o segundo modal— en el idioma activo. El commit de reset vuelve a leer STORE/SESSION, valida el token de confirmación, reemplaza STORE por una copia nueva del seed versionado, elimina SESSION, relee ambas claves y presenta login. Cancelar no modifica ninguna clave.

Debe documentarse y probarse que `vaak-session-v6` es una única sesión compartida por origen: dos pestañas del mismo navegador no representan usuarios independientes y un cambio de SESSION afecta ambas.

### 5.8 UX de confirmación invalidable

El editor de accesos debe usar estado de draft explícito con una revisión monotónica:

```js
{
  revision: 7,
  confirmedRevision: null,
  role: 'Worker',
  grants: {},
  projectIds: [],
  clientProjectIds: [],
  clientOrderIds: []
}
```

Reglas:

- presets nunca establecen `confirmedRevision`;
- `Confirmar accesos / Confirm access` guarda la revisión actual;
- el botón final de alta/edición permanece deshabilitado salvo `confirmedRevision === revision`;
- cualquier cambio de identidad con impacto, rol, grant, proyecto Worker, vínculo Client o PO Client incrementa `revision` e invalida confirmación;
- cambiar rol solicita confirmación independiente antes de aplicar el preset destino; cancelar conserva el draft anterior;
- aceptar cambio de rol elimina grants prohibidos, carga preset sólo como ayuda, limpia scopes incompatibles e invalida revisión;
- cambiar a o desde Admin exige nueva confirmación del resumen completo;
- pasar Tools a `disabled` conserva hijos y los vuelve inefectivos;
- pasar Tools a `none` solicita confirmación independiente antes de retirar hijos asignables; cancelar restaura Tools; aceptar retira hijos e invalida revisión;
- habilitar un hijo habilita Tools y vuelve a invalidar revisión;
- guardar resuelve de nuevo el usuario target por ID y protege Admin activo, autosuspensión y último Admin sobre el estado hipotético completo.

La tabla de usuarios debe mantener resumen de enabled/disabled y mostrar `Acceso total fijo / Fixed full access` para Admin.

### 5.9 Catálogo ES/EN completo

Crear un catálogo estructurado de textos de autorización y recuperación, con función `t(key, params)` y sin pares ad hoc dispersos para los flujos nuevos. Debe cubrir:

- nombres de secciones, roles y estados;
- alta/edición y resúmenes;
- confirmación de accesos;
- confirmación/cancelación de cambio de rol;
- confirmación/cancelación de retiro de Tools;
- proyectos/vínculos/POs;
- denegaciones por ruta, acción, target y recurso;
- revocación durante modal;
- usuario sin accesos;
- STORE inválido, sin Admin y recovery;
- advertencia, confirmación, cancelación y éxito de reset;
- errores de migración seguros;
- acciones y mensajes Client–PO.

La prueba de completitud debe recorrer recursivamente todas las claves requeridas, exigir `es` y `en` no vacíos y detectar valores idénticos cuando lingüísticamente no corresponda. `userRoleLabel`, roles en tablas, mensajes y botones no pueden quedar fijos en español al elegir English. `presentation.js` puede conservar traducción heredada, pero no es autoridad de los textos de acceso.

## 6. Fases de ejecución

### Fase A — Baseline y desmantelamiento de bypasses

- Registrar hashes/timestamps iniciales de archivos en alcance y del logo.
- Inventariar rutas, acciones DOM, llamadas internas, aperturas y commits.
- Convertir la cadena de `action` en registro privado y dispatcher único.
- Consolidar wrappers de `render` en una tabla final.
- Sustituir callbacks mutantes de modal por descriptores open/commit.
- Añadir prueba estructural que falle si reaparece un wrapper o llamada directa.

No avanzar si queda una ruta de mutación que no pueda nombrarse y despacharse.

### Fase B — Schema, migración y validación

- Implementar versiones access/relations/resources.
- Implementar migración transaccional por shapes conocidos.
- Añadir `supplierProjectLinks`, `clientProjectLinks` singulares y `projectId` canónico de Specs.
- Eliminar bootstraps por `length` y fabricación de Client links en `app.js`.
- Implementar validación global, cuarentena segura y estados de recovery.

No avanzar si una segunda migración cambia el JSON o si un array vacío se repuebla.

### Fase C — Política y scopes de recursos

- Implementar tabla de políticas por fase/target/recurso.
- Crear resolvers y selectores compartidos.
- Aplicar scope Worker completo a Suppliers, Specs y Orders.
- Eliminar filtros por mutación temporal del STORE.
- Reautorizar preview/download y todo commit.

No avanzar con una acción sin policy o un target inexistente permitido.

### Fase D — Client PO y seed adversarial

- Implementar predicado único Client–PO.
- Reutilizarlo en Dashboard, Orders, preview y download según modalidad de entrada.
- Incorporar dos Clients, dos empresas/proyectos y autorizaciones opuestas al seed limpio.
- Probar aislamiento cruzado y toda mutación denegada.

### Fase E — Recuperación, confirmaciones e idioma

- Implementar recovery exclusivo y reset de dos pasos.
- Releer/rebind en render, navegación, open, commit y storage.
- Implementar draft revisionado, confirmación invalidable, cambio de rol y retiro de Tools.
- Completar catálogo ES/EN y corregir etiquetas mezcladas.

### Fase F — Aceptación, evidencia y reconciliación documental

- Implementar 39 casos identificados `C01`…`C39`.
- Ejecutar pruebas puras, runtime, source invariants y harness visual local.
- Corregir README y matriz sin declarar aprobación.
- Preparar `HANDOFF/ENTREGA-VAAK-ACCESS-3-B.md` con evidencia literal.

No se acepta una ENTREGA con casos omitidos, “no aplicable” sin fundamento o capturas sustituyendo pruebas mecánicas.

## 7. Archivos permitidos y límites

Archivos probables dentro de alcance:

- `prototype/access-control.js` — schema, catálogo, migración, validación, políticas, resolvers, selectores e i18n puros.
- `prototype/access-runtime.js` — opcional; controlador cerrado y testeable si separar el dispatcher reduce riesgo.
- `prototype/app.js` — normalización de wrappers, handlers privados, render final, modal open/commit y UX.
- `prototype/access-control.test.js` — ampliar pruebas puras.
- `prototype/access-runtime.test.js` — opcional si se crea runtime separado.
- `prototype/access-acceptance.test.js` — matriz mecánica `C01`…`C39` y pruebas de invariantes de fuente.
- `prototype/access-browser-harness.html` y `prototype/access-browser-harness.js` — opcionales para recorrido local reproducible ES/EN y DOM/modal.
- `prototype/refinements.css` — recovery, confirmaciones y estados del editor.
- `prototype/presentation.js` — sólo integración de idioma heredado necesaria.
- `prototype/index.html` — orden de carga y cachebuster local si se añade runtime/harness.
- `prototype/README.md` — límites, cuentas seed, reset confirmado y SESSION compartida.
- `docs/functional/VAAK-ROLE-PERMISSIONS.md` — reconciliación de sobredeclaraciones, sin cambiar decisiones aprobadas.
- `HANDOFF/ENTREGA-VAAK-ACCESS-3-B.md` — evidencia de la ejecución.
- `HANDOFF/evidence/VAAK-ACCESS-3-B/` — exclusivamente capturas PNG de evidencia visual de esta REF, con inventario y hashes en la ENTREGA; no es un directorio de producto ni de activos.

No modificar `PROJECT-BRAIN.md`, `PROJECT-STATE.md`, contratos de roles ya aprobados, ADR, stack, otros handoffs, activos de proyecto/PO existentes ni archivos fuera de esta lista salvo HALLAZGO bloqueante y autorización humana posterior.

Prohibido modificar:

- `LOGO VAAK.png` y cualquier activo de marca;
- `prototype/assets/` y cualquier otro directorio de activos; no crear, reemplazar ni modificar imágenes de producto o marca;
- backend, Supabase, Vercel, cPanel, hosting, GitHub remoto, deploy o producción;
- credenciales, datos o proveedores reales;
- dependencias, package managers o SDK remotos.

No inicializar Git. No instalar paquetes. No usar red.

## 8. Criterios mecánicos de aceptación C01–C39

Cada criterio debe existir como caso identificable y emitir `PASS`/`FAIL` con evidencia reproducible.

1. **C01 — Catálogo:** exactamente ocho secciones, ceilings por rol y mapeo exhaustivo de rutas conocidas.
2. **C02 — Desconocidos:** ruta, permiso, acción, fase y combinación sin policy se deniegan.
3. **C03 — Ceiling:** grants prohibidos inyectados para Worker/Client son inefectivos.
4. **C04 — Admin implícito y ruta derivada:** Admin activo en STORE válido abre sin grants persistidos las ocho rutas del catálogo. `project` no pertenece al catálogo: requiere `section.dashboard`, rol Admin/Worker y un `projectId` existente; Worker requiere además membresía y Client siempre se deniega. `project` sin ID, inexistente o colgante se deniega también para Admin.
5. **C05 — Project route:** exige Dashboard, Admin/Worker y proyecto existente/asignado; Client siempre falla.
6. **C06 — Worker projects:** Worker sólo lista y abre proyectos asignados para lectura. Toda mutación del objeto Project, datos generales, áreas, banner, galería y equipo del cliente permanece Admin-only, incluso sobre un proyecto asignado; las operaciones Supplier/Spec/Order se evalúan separadamente en C13.
7. **C07 — Resource scope:** Supplier/Spec/Order sin vínculo inequívoco falla para Worker; Supplier `foreign-only` y Supplier con vínculos colgantes fallan, y Supplier `mixed` deniega toda mutación global.
8. **C08 — Predicado uniforme Worker:** listados, métricas, filtros, preview, download, open y commit usan el mismo scope canónico; para Supplier, los fixtures `own-only`, `foreign-only` y `mixed` demuestran que la lectura contextual y la mutación global aplican las reglas de §5.4 sin efecto fuera de scope.
9. **C09 — Inventario:** todas las acciones DOM/internas y las nuevas de 3-B existen en policy; cero faltantes y cero policy huérfana sin justificación.
10. **C10 — Target/resource:** target requerido inexistente, ID ajeno, recurso colgante o contexto no resoluble se deniega.
11. **C11 — Dispatcher único:** DOM e interna atraviesan la misma declaración; cero `action` wrappers/aliases/llamadas directas y cero bypass de handlers.
12. **C12 — Admin-only:** usuarios, roles, cuentas, accesos, proyectos, datos generales, banners y equipo del cliente se deniegan a Worker/Client antes de open y commit.
13. **C13 — Worker operativo:** tarea propia y Spec/Order de proyecto asignado funcionan; Supplier `own-only` permite lectura y mutación, `foreign-only` las deniega y `mixed` permite sólo lectura contextual mientras deniega mutación global en `open` y `commit`.
14. **C14 — Seed adversarial:** STORE limpio contiene Client A/B, empresas/proyectos/POs distintos y autorizaciones opuestas.
15. **C15 — Cross-client read:** A no lista/previsualiza/descarga B y B no lista/previsualiza/descarga A, incluso por ID manipulado.
16. **C16 — Client mutations:** Client no abre project ni crea, edita, emite, elimina o modifica drafts de PO.
17. **C17 — Coherencia Client:** Dashboard, Orders, preview y download reutilizan `canReadClientOrder`; preview/download desde Dashboard funcionan sin grant Orders.
18. **C18 — Visible no autoriza:** `visible: true` sin relaciones exactas nunca concede acceso.
19. **C19 — Defaults únicos:** Worker pre-ACCESS recibe los seis defaults compatibles y Client sólo Dashboard una vez.
20. **C20 — Migración cerrada:** ausencia conocida migra; versión repetida es idempotente; versión/access malformada no concede defaults; schema desconocido entra en recovery.
21. **C21 — Preservación:** entidades y valores preexistentes se conservan; sólo se añaden campos/versiones/relaciones autorizados o cuarentena.
22. **C22 — Vacíos persistentes:** memberships, links y authorizations intencionalmente vacíos permanecen vacíos tras reload, storage event y segunda migración.
23. **C23 — Alta confirmada:** usuario nuevo no puede guardarse hasta confirmación explícita de la revisión actual; botón deshabilitado antes.
24. **C24 — Invalidación:** cambiar rol, grant, proyecto o vínculo incrementa revisión e invalida confirmación.
25. **C25 — Cambio de rol:** confirmación separada, cancelación no mutante, preset destino no confirmado y grants incompatibles inefectivos.
26. **C26 — Ciclo de grant:** `none → enabled → disabled → enabled → none` se conserva correctamente.
27. **C27 — Disabled:** persiste después de recarga, pero no habilita navegación ni acción.
28. **C28 — Tools:** disabled conserva hijos y los deniega; none exige confirmación y retira hijos sólo al aceptar; habilitar hijo habilita Tools.
29. **C29 — Fuente común:** navegación, cards, rutas, selectores, acciones y commits dependen de la misma política/estado efectivo; el Supplier `mixed` debe ser visible sólo en el contexto propio y la misma fuente debe bloquear su mutación global antes de `open` y `commit`.
30. **C30 — Admin invariant:** ninguna mutación hipotética puede dejar cero Admin activos; autosuspensión/degradación y último Admin fallan antes de persistir.
31. **C31 — Recovery:** STORE sin Admin o estructuralmente inválido no abre rutas ni se reseedea; sólo muestra recovery.
32. **C32 — Relectura:** render, navigate, open, commit, async commit y storage releen STORE/SESSION y reenlazan actor/target/recurso.
33. **C33 — Revocación:** cuenta, grant, proyecto o recurso revocado cierra modal, expulsa de vista y bloquea commit obsoleto en misma pestaña y evento storage.
34. **C34 — SESSION compartida:** limitación de una clave por origen documentada y demostrada en harness.
35. **C35 — Sin acceso:** usuario activo sin rutas recibe pantalla bilingüe y puede cerrar sesión.
36. **C36 — I18N completo:** todas las claves requeridas tienen `es`/`en` válidos y la prueba falla al retirar o vaciar cualquiera.
37. **C37 — Recorrido ES/EN:** alta, edición, rol, Tools, disabled, denegación, recovery/reset, Client–PO y no-access completan el flujo en ambos idiomas sin texto nuevo mezclado.
38. **C38 — Límite:** inventario/hashes demuestra sin cambios de logo, `prototype/assets/` u otros activos y sin backend, SDK, red o despliegue; las únicas imágenes nuevas permitidas son capturas de evidencia bajo `HANDOFF/evidence/VAAK-ACCESS-3-B/`; no afirmar diff Git.
39. **C39 — Comandos verdes:** todas las validaciones obligatorias terminan con código cero y la suite informa exactamente `39/39 PASS` más subpruebas.

## 9. Validaciones obligatorias

Como mínimo, la ENTREGA debe incluir salida literal de:

```powershell
node --check prototype/access-control.js
node --check prototype/app.js
node --check prototype/presentation.js
node prototype/access-control.test.js
node prototype/access-acceptance.test.js
```

Si existe `prototype/access-runtime.js`:

```powershell
node --check prototype/access-runtime.js
node prototype/access-runtime.test.js
```

Pruebas estructurales mínimas automatizadas sobre `app.js`:

- cero definiciones/reasignaciones de `action`;
- cero aliases de la antigua cadena;
- una declaración de `dispatchAction`;
- cero invocaciones directas a handler privado desde DOM/internas;
- cero callbacks mutantes arbitrarios pasados a `open()`;
- cero bootstrap relacional por `.length`;
- cero fabricación “firstClient/firstProject/firstOrder”;
- cero filtrado mediante reemplazo temporal de `data.orders`, `data.specs` o `data.suppliers`;
- todas las acciones observadas incluidas en policy.

El harness visual, si se crea, debe poder abrirse desde servidor estático local sin paquetes. Debe mostrar casos, resultado y razón; no puede escribir fuera de claves de prueba aisladas o debe restaurar el snapshot al finalizar.

Si Node no estuviera disponible, no instalar dependencias: emitir HALLAZGO bloqueante. En el estado actual Node sí produjo salida válida en ACCESS-3-A, por lo que la ausencia posterior debe explicarse.

## 10. Evidencia exigida en ENTREGA

La ENTREGA debe contener:

1. tabla exacta de archivos creados/modificados con propósito;
2. hashes SHA-256 y timestamps antes/después de todos los archivos en alcance y del logo;
3. declaración expresa de que no existe Git verificable y que no se presenta un diff Git;
4. salida literal de todos los comandos;
5. tabla `C01`…`C39` con estado, nombre de prueba, fixture, resultado y evidencia;
6. inventario automático de acciones DOM, internas y policy;
7. salida del chequeo de wrappers prohibidos;
8. snapshots sanitizados pre/migración/post/segunda migración, sin contraseñas;
9. prueba de arrays vacíos antes/después de reload y segunda migración;
10. prueba de acceso malformado, schema desconocido, vínculo colgante, duplicado y contradicción;
11. matriz Admin/Worker/Client A/Client B × ruta × proyecto × acción × target × fase open/commit;
12. prueba Worker Supplier/Spec/Order positiva en proyecto asignado y negativa en proyecto ajeno/target inexistente; para Supplier incluir fixtures `own-only`, `foreign-only` y `mixed`, con matriz separada de lectura, `open` y `commit`;
13. prueba Client A/B de listado, preview, download y mutaciones cruzadas;
14. prueba Dashboard Client con PO autorizada y `section.orders:none` cuyo preview/download sí funciona desde Dashboard pero cuya ruta Orders falla;
15. prueba de STORE sin Admin y STORE inválido sin reseed automático;
16. prueba de reset cancelado y reset confirmado con relectura de STORE/SESSION;
17. prueba de modal abierto y revocación antes de commit para usuario, Supplier, Spec, Order y al menos una operación asíncrona;
18. prueba de confirmación revisionada, cambio de rol y retiro de Tools aceptado/cancelado;
19. reporte de completitud I18N y recorrido ES/EN;
20. capturas representativas en ambos idiomas de:

   - alta Worker antes y después de confirmar;
   - edición Client en English;
   - confirmación de cambio de rol;
   - confirmación de retiro de Tools;
   - Worker rechazado en Supplier/Spec/Order ajeno;
   - Client A con su PO y rechazo de PO B;
   - recovery por STORE sin Admin;
   - reset advertido/confirmado;
   - pantalla sin accesos;

   Las capturas persistentes se guardan exclusivamente como PNG bajo `HANDOFF/evidence/VAAK-ACCESS-3-B/`. La ENTREGA debe inventariar cada archivo con propósito y SHA-256. No se permite persistir capturas en `prototype/`, `prototype/assets/`, la raíz u otra ruta; las vistas previas efímeras de herramientas pueden usarse sin persistir. Las capturas complementan, pero nunca sustituyen, las pruebas mecánicas `C01`…`C39`.

21. README y matriz reconciliados con citas al comportamiento probado, usando estado “entregado para auditoría” o equivalente, nunca “aprobado”;
22. lista de desviaciones y HALLAZGOS. Si algo no se ejecutó, no se permite declarar “ninguno”.

## 11. Corrección de sobredeclaraciones

`prototype/README.md` debe reemplazar afirmaciones absolutas como “central guards” o “accurately exercise” por una descripción verificable de la frontera, pruebas y límites reales. Debe documentar:

- cuatro cuentas ficticias del seed si se añade Client B;
- STORE y SESSION usados;
- sesión única compartida por origen;
- recuperación y reset confirmado;
- manipulación inevitable de la demo cliente;
- no equivalencia con seguridad real.

`docs/functional/VAAK-ROLE-PERMISSIONS.md` debe preservar la matriz funcional aprobada y reconciliar únicamente su sección de implementación local:

- `VAAK-ACCESS-3-A` fue entregada pero no aprobada;
- `VAAK-ACCESS-3-B` es corrección local entregada para auditoría cuando corresponda;
- ninguna afirmación de cumplimiento se presenta antes de evidencia y VEREDICTO;
- no se altera la exigencia futura de enforcement servidor/RLS.

No modificar decisiones humanas, estados `Allowed/Proposed/Not allowed` ni source traceability funcional.

## 12. Riesgos y tratamiento

| Riesgo | Severidad | Tratamiento obligatorio |
|---|---:|---|
| Añadir otro wrapper y conservar bypass | Crítica | Eliminación estructural, dispatcher único y prueba de fuente |
| Callback autorizado con actor/recurso obsoleto | Crítica | Token por IDs, relectura y reautorización en commit |
| Worker usa selected project para target ajeno | Crítica | Resolver target canónico y su projectId |
| Scope sólo en UI/lista | Crítica | Selectores comunes y policy en open/commit/preview/download |
| Array vacío se interpreta como no migrado | Crítica | Versiones explícitas y presencia de propiedad |
| Corrupción recibe defaults | Crítica | Migración por shapes conocidos y recovery/fallo cerrado |
| Relación 3-A autofabricada se legitima | Crítica | Cuarentena no efectiva y revisión Admin explícita |
| Client ve PO por `visible` o posición | Crítica | Predicado relacional único y seed cruzado |
| STORE inválido se reemplaza por seed | Alta | Recovery exclusivo; reset de dos pasos |
| Confirmación queda vigente tras cambio | Alta | `revision`/`confirmedRevision` |
| Inglés mezcla textos españoles | Alta | Catálogo estructurado y recorrido E2E |
| Pruebas puras no prueban wiring | Alta | Source invariants + runtime tests + harness DOM/modal |
| Documentación declara más de lo probado | Alta | Reconciliación factual antes de ENTREGA |
| Confundir demo con seguridad real | Crítica | Advertencia visible y alcance local reiterado |

## 13. Frenos y condiciones de detención

Detener y emitir HALLAZGO/PREGUNTA si:

- la corrección requiere backend, Supabase, Vercel, deploy, red o dependencias;
- se descubre que una relación no puede migrarse sin inventar autorización;
- se necesitaría modificar marca o datos no ficticios;
- el refactor amenaza capacidades fuera de H-E01…H-E07 y no puede aislarse;
- una prueba de scope o último Admin falla después de la fase correspondiente;
- no puede producirse evidencia reproducible de los 39 criterios.

No hacer push, merge, deploy, cambios remotos ni operaciones de producción. No gastar dinero. No activar proveedores. No tocar secretos.

## 14. Instrucción al reviewer_auditor

Auditar esta ORDEN contra la instrucción humana original, `ORDEN-VAAK-ACCESS-3-A.md`, el VEREDICTO de entrega y el código verificable. Priorizar:

1. que la solución elimine la cadena vulnerable en vez de cubrirla con otro wrapper;
2. que open y commit compartan relectura, resolución y policy;
3. que migración ausente/corrupta/vacía tenga semántica inequívoca;
4. que Supplier/Spec/Order resuelvan scope Worker por IDs;
5. que Client PO conserve un solo predicado con modalidades de entrada coherentes;
6. que recovery no reseedee ni promueva;
7. que confirmaciones e idioma sean mecánicamente verificables;
8. que los 39 criterios y la evidencia no sobredeclaren cobertura.

Si el VEREDICTO es `APROBADO`, la autorización humana ya registrada habilita al Ejecutor a implementar exclusivamente esta ORDEN en localhost. Si solicita cambios, conservar la REF `VAAK-ACCESS-3-B` y revisar sólo los puntos señalados. Si es `RECHAZADO`, detener y escalar al humano.
