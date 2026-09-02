---
artifact_type: ORDEN
phase: "ui_access"
ref: "VAAK-UI-ACCESS-4-A"
from: architect_chief
to: reviewer_auditor
status: revised_for_review
blocking: true
created_at: "2026-09-01"
review_stage: design
cycle: 2
---

# ORDEN — Reconstrucción fiel de interfaz y control de accesos local

## 1. Mandato y estado de esta ORDEN

Esta ORDEN conserva la REF única y estable `VAAK-UI-ACCESS-4-A`. Es un diseño sometido a revisión independiente; no es una implementación, una ENTREGA ni una aprobación.

Instrucción humana vigente, conservada sin reinterpretación silenciosa:

> Restaurar exactamente la interfaz anterior a VAAK-ACCESS-3-C en todas las vistas (login, dashboard, Herramientas, Equipo, Gestión de usuarios, Gestión de proveedores, Biblioteca de specs, Historial de OC, proyectos y herramientas) y agregar únicamente control de accesos en Gestión de usuarios. Admin siempre tiene acceso total e inmutable. Para Worker/Client: botón separado “Editar accesos” por usuario abre modal con interruptores prendido/apagado para Panel principal, Herramientas, Equipo, Gestión de usuarios, Gestión de proveedores, Biblioteca de specs e Historial de OC; el rol limita lo funcionalmente válido. Nuevo usuario incluye selección de accesos. También permisos por proyecto con opción dinámica “Todos los proyectos”, que comprende proyectos actuales y futuros; o selección explícita. Cambios se aplican inmediatamente a sesiones abiertas mediante storage event: redirigir a primera ruta aún permitida sin pedir contraseña; si queda sin accesos o cuenta deshabilitada, cerrar sesión. Sólo localhost; no deploy/staging/backend/Supabase/Vercel/red externa/dependencias/activos.

Decisión humana posterior a `VEREDICTO-VAAK-UI-ACCESS-4-A-R1.md`, vigente para R2:

> El `prototype/app.js` pre-3-C exacto de 138,535 bytes no es recuperable localmente. Se autoriza expresamente una reconstrucción fiel basada en la evidencia disponible y se autoriza proceder con esta revisión de diseño.

Esta aceptación cambia la naturaleza verificable del resultado: ya no se promete una restauración byte-equivalente ni una comparación contra un ejecutable pre-3-C recuperado. Se exige una **reconstrucción fiel aceptada por la humana**, con cobertura completa de inventario y evidencia visual plural. La autorización permite resolver la ORDEN; no sustituye el VEREDICTO R2 ni habilita implementación mientras `blocking: true`.

El rol personalizado `architect_chief` no pudo ejecutarse porque el modelo fijado en su configuración no estaba disponible. Codex actúa en esta REF como sustituto independiente del Arquitecto Jefe, inspecciona evidencia primaria y emite únicamente esta ORDEN. No implementa ni aprueba su propio trabajo. La revisión deberá corresponder a un `reviewer_auditor` independiente.

La implementación queda bloqueada hasta que concurran ambas condiciones de `AGENTS.md`:

1. VEREDICTO de diseño `APROBADO` del `reviewer_auditor` para esta misma REF.
2. Autorización humana explícita para comenzar la ejecución. La autorización recién registrada expresa intención de proceder, pero la ejecución sigue condicionada al VEREDICTO R2 `APROBADO`; una vez aprobado, no será necesario pedir una tercera confirmación para el alcance exacto de esta ORDEN.

## 2. Diagnóstico verificado en fuentes reales

No existe raíz Git verificable (`git rev-parse --show-toplevel` devuelve ausencia de repositorio). No se afirmará diff, commit, rama ni capacidad de rollback Git. La integridad se controla con bytes, SHA-256, timestamps, inventarios y evidencia visual.

### 2.1 Evidencia histórica y estado actual

| Archivo/evidencia | Función en esta REF | Bytes | SHA-256 verificado | Regla |
|---|---|---:|---|---|
| Registro pre-3-C de `prototype/app.js` en `ORDEN-VAAK-ACCESS-3-C.md` y su VEREDICTO R1 | Huella del baseline completo no recuperable | 138,535 | `793C8C1EC03A2B049480E80FD06F132D148630663CDE066830BFA117CC7B2C3C` | Autoridad de integridad e inventario, no archivo ejecutable disponible |
| `staging/public/prototype/app.js` | Evidencia histórica parcial del 2026-08-28 | 53,565 | `389FDC52F9A4D50388C4C781A5E15EE8349F7BFDF8B51A879B30895234EBF8DE` | Sólo lectura; fuente parcial, nunca baseline completo |
| `prototype/app.js` | Reemplazo actual producido en 3-C | 31,169 | `9A779DA1F9BD3A19D81FCD81EFE7543ADF5BBDD7123B3320DDE28F50388A6DB2` | No usar como baseline visual |
| `prototype/refinements.css` | Capas visuales posteriores que deben conservarse | 53,975 | `B5EAA908787C64802F93B88DE39C80986DA8862DB4417C4B8D08123DA418D86D` | Preservar login, usuarios, proveedores, OC, proyecto, equipo y demás refinamientos |
| `prototype/presentation.js` | Catálogo/presentación ES/EN posterior | 16,611 | `360D6DE3011B361748C81DAC9B65A9556D2087E37C3DEF81F71389724A2BD76B` | Preservar entradas y comportamiento existentes |
| `prototype/styles.css` | Hoja base | 14,677 | `A04365DD8B66288D8A8DF28FF92B2E562A7651496A81379F2E6792EEFCCF0D49` | Invariante; coincide exactamente con baseline |
| `staging/public/prototype/styles.css` | Comparador de hoja base | 14,677 | `A04365DD8B66288D8A8DF28FF92B2E562A7651496A81379F2E6792EEFCCF0D49` | Sólo lectura |

Timestamp verificado de la evidencia parcial `staging/public/prototype/app.js`: `2026-08-28 19:39:00`; el archivo se conserva dentro del snapshot de staging del 2026-08-29 indicado por la humana. Timestamp del reemplazo actual `prototype/app.js`: `2026-08-31 23:20:54`.

El archivo pre-3-C de 138,535 bytes no está disponible en el workspace, cachés inspeccionadas ni Git —no existe repositorio— y no puede recuperarse por hash. El comparador del archivo parcial contra el actual no reconstruye esa pérdida. R2 adopta por decisión humana una reconstrucción fiel: ninguna fuente aislada es baseline completo y toda afirmación de equivalencia debe apoyarse en el conjunto de evidencia de §2.2.

### 2.2 Corpus cerrado de reconstrucción

La reconstrucción usa, en orden de autoridad, este corpus verificable:

1. huella histórica pre-3-C de 138,535 bytes/hash `793C8C...`, inventario de nueve rutas y 41 acciones registrado y auditado antes del reemplazo;
2. `ORDEN-VAAK-ACCESS-3-C.md`, `VEREDICTO-VAAK-ACCESS-3-C-R1.md` y `VEREDICTO-VAAK-UI-ACCESS-4-A-R1.md` para nombres, rutas, acciones, capacidades y regresiones observadas;
3. `staging/public/prototype/app.js` de 53,565 bytes como implementación parcial de vistas y flujos existentes al 28 de agosto;
4. `prototype/refinements.css` y `prototype/presentation.js` actuales como evidencia posterior de estructura visual, clases, textos, formularios y estados;
5. las 20 capturas y `manifest.json` disponibles en `HANDOFF/evidence/VAAK-ACCESS-3-C/`, únicamente para los flujos de acceso que muestran; no prueban por sí solas la UI pre-3-C completa;
6. contratos funcionales y artefactos de UX ya aprobados, sin inventar capacidades ni reutilizar datos/activos fuera de su alcance.

El estado pre-3-C completo contenía como mínimo:

- login original, dashboard con portafolio, fechas y objetivos generales;
- detalle completo de proyecto, banner, información general, áreas, equipo cliente, galería e historial de OC;
- Herramientas y sus tarjetas;
- Gestión de usuarios y acciones de cuenta;
- Gestión de proveedores;
- Equipo/objetivos, filtros, estados, progreso y formularios;
- alta de proyecto y carga de imágenes;
- formulario extenso de OC, ítems dinámicos, direcciones, monedas, previsualización, impresión/descarga local e historial con filtros;
- Biblioteca de specs, formulario completo y ficha técnica;
- catálogo bilingüe y preferencia individual de idioma.

La evidencia parcial declara 23 funciones de vista/flujo (`shell`, `card`, `task`, `home`, `details`, `tools`, `toolPage`, `login`, `open`, `poForm`, `formDataToOrder`, `previewOrder`, `showPoForm`, `printOrder`, `confirmDelete`, `action`, `render`, `fillOrderForm`, `updateMoneyDisplays`, `filterHistory`, `specForm`, `specPreview`, entre otras auxiliares). El inventario completo pre-3-C añade rutas y acciones posteriores ausentes de esa copia. La versión actual de 3-C reduce el conjunto a 16 funciones de UI simplificadas. La reconstrucción se considera fiel sólo si satisface los gates cerrados de nueve rutas, 41 acciones, formularios y capturas; no por semejanza con el archivo parcial.

#### Inventario histórico obligatorio

Rutas exactas: `home`, `project`, `tools`, `team`, `users`, `suppliers`, `orders`, `specs`, `settings`.

Acciones DOM exactas (41): `add-item`, `add-team-member`, `add-warehouse`, `advance-team-objective`, `advanced-team-filters`, `assign-team-objective`, `banner-next`, `banner-prev`, `close`, `delete-order`, `delete-team-objective`, `delete-viewed-image`, `download-order`, `edit-banner`, `edit-project-card`, `edit-supplier`, `edit-task`, `edit-team-objective`, `edit-user`, `eye`, `gallery`, `logout`, `new-order`, `new-project`, `new-spec`, `new-supplier`, `new-task`, `new-user`, `notifications`, `po-back`, `preview-order`, `preview-spec`, `remove-banner-image`, `remove-item`, `remove-team-member`, `reset-demo`, `set-banner-cover`, `task`, `toggle-supplier`, `toggle-user`, `view-image`.

Las nueve rutas y 41 acciones deben existir como contratos reconocibles y exhaustivos; existencia no equivale a autorización. `settings` se reconstruye como superficie histórica pero permanece inaccesible por contrato vigente. Acciones `Proposed` o `Not allowed` pueden conservar control/plantilla inerte para fidelidad, pero deben quedar ocultas o denegadas según §5.

### 2.3 Capas posteriores que no deben perderse

`prototype/refinements.css` contiene bloques posteriores identificados expresamente para:

- rediseño de login;
- portafolio/dashboard y branding compacto;
- Gestión de usuarios;
- jerarquía de métricas, cabecera y navegación;
- Gestión de proveedores;
- directorio de Herramientas;
- Historial de OC;
- rediseño del detalle de proyecto y banner;
- objetivos de Equipo;
- editor de accesos por usuario.

`prototype/presentation.js` conserva el catálogo ES/EN posterior para esas vistas y sus flujos. La reconstrucción no puede volver a las copias más antiguas de `refinements.css` o `presentation.js` alojadas en staging. Debe combinar todo el corpus §2.2 con las capas posteriores locales, ajustando únicamente incompatibilidades necesarias y el nuevo editor de accesos.

### 2.4 Estado local y claves observadas

- La evidencia histórica parcial usa `vaak-preview-v6` como STORE y `vaak-session-v6` como SESSION.
- 3-C introdujo `vaak-preview-v7`, además de `access-control.js`, `access-runtime.js` y fixtures propios.
- `prototype/index.html` actual carga módulos 3-C y dejó de cargar `presentation.js`; el snapshot parcial de staging carga además un puente remoto que está fuera de alcance y no debe copiarse.
- La existencia simultánea posible de `vaak-preview-v6` y `vaak-preview-v7` obliga a una migración aditiva, no destructiva.
- `storage` sólo dispara el evento en otros documentos del mismo origen; la pestaña que guarda debe reconciliarse mediante llamada local inmediata. Ambos caminos deben compartir la misma función de reconciliación.

## 3. Resultado exigido

Reconstruir fielmente en `prototype/` la composición visual y funcional anterior a 3-C a partir del corpus cerrado de §2.2, conforme a la aceptación humana de R2, conservando las capas posteriores locales de CSS/presentación y añadiendo sólo la administración de acceso solicitada. El resultado no se denominará copia exacta, restauración byte-equivalente ni recuperación del archivo perdido; se denominará **reconstrucción fiel basada en evidencia**.

El incremento de acceso debe ser un overlay acotado:

1. no rediseña login, dashboard, navegación, Herramientas, Equipo, proyectos, proveedores, specs, OC ni sus formularios;
2. mantiene todos los textos, jerarquías, clases DOM, tarjetas, métricas, filtros, modales, campos y acciones preexistentes salvo ocultación/denegación derivada de permisos;
3. modifica Gestión de usuarios sólo para separar `Editar` de `Editar accesos`, añadir el modal de interruptores/alcance y añadir la misma selección al alta;
4. aplica permisos de ruta, visibilidad y acción de forma consistente en localhost;
5. conserva datos locales existentes y no elimina ninguna clave legacy o 3-C;
6. reacciona inmediatamente a cambios de cuenta/permisos en pestañas abiertas;
7. sigue siendo una simulación de navegador, no autorización de servidor.

### Límite de la reconstrucción autorizada

La humana autoriza reconstruir la interfaz porque el archivo completo no es recuperable. Esta autorización **no** permite rediseñarla libremente ni repetir la reducción de 3-C. No se acepta una nueva aplicación meramente parecida, una UI simplificada, una copia de la versión actual de 31,169 bytes ni una reinterpretación de producto. Toda reconstrucción debe conservar el corpus, las nueve rutas, las 41 acciones, la riqueza de formularios y las superficies históricas, y debe explicar la procedencia de cada vista. Si una decisión no puede resolverse con evidencia, se detiene esa superficie y se emite HALLAZGO; no se inventa.

Fuera de la reconstrucción necesaria para recuperar las superficies perdidas, el control de acceso sigue siendo un overlay acotado. Gestión de usuarios puede cambiar sólo en los puntos autorizados; el resto no se rediseña por conveniencia técnica.

## 4. Matriz normativa de secciones

La interfaz del modal muestra exactamente siete interruptores binarios: prendido/apagado. No existen estados `none/enabled/disabled` visibles, permisos ocultos adicionales ni una octava sección de configuración.

| ID estable | Etiqueta ES | Ruta/consumidor | Admin | Worker | Client | Dependencia/alcance |
|---|---|---|---:|---:|---:|---|
| `section.dashboard` | Panel principal | `home`; tarjetas y detalle `project` | FIJO ON | editable | editable | datos limitados por project scope |
| `section.tools` | Herramientas | contenedor `tools` | FIJO ON | editable | bloqueado OFF | no concede por sí solo herramientas hijas |
| `section.team` | Equipo | `team` | FIJO ON | editable | bloqueado OFF | Worker sólo capacidades válidas sobre sus tareas/proyectos |
| `section.users` | Gestión de usuarios | `users` | FIJO ON | bloqueado OFF | bloqueado OFF | sólo Admin administra cuentas/accesos |
| `section.suppliers` | Gestión de proveedores | `suppliers` | FIJO ON | editable | bloqueado OFF | Worker sólo proyectos permitidos; requiere Tools efectivo |
| `section.specs` | Biblioteca de specs | `specs` | FIJO ON | editable | bloqueado OFF | Worker sólo proyectos permitidos; requiere Tools efectivo |
| `section.orders` | Historial de OC | `orders` e historial Client | FIJO ON | bloqueado OFF | editable | Admin conserva acceso total por instrucción vigente; Client sólo lectura y project scope |

Reglas exactas:

- Admin siempre obtiene las siete secciones, sin grants persistidos editables. No aparece botón activo `Editar accesos` para Admin; la UI muestra `Acceso total · Inmutable` o un modal estrictamente informativo sin controles. No existe ruta para apagar un permiso Admin mediante DOM, storage o migración.
- El techo de Worker es `{dashboard, tools, team, suppliers, specs}`.
- El techo de Client es `{dashboard, orders}`.
- Los siete renglones se muestran para Worker/Client; los incompatibles con el rol aparecen apagados, deshabilitados y con explicación de rol. Un valor inyectado fuera del techo es inefectivo.
- `section.tools` es un contenedor. Si está apagado, `suppliers` y `specs` son inefectivos aunque sus preferencias sigan prendidas; al reactivar Tools vuelven a su preferencia anterior. No se borran preferencias hijas silenciosamente.
- Client no necesita Tools para `orders`: puede entrar desde el portal Client o por fallback directo a Historial de OC.
- `project` no es un octavo interruptor: deriva de Panel principal y del project scope.
- Si un usuario conserva al menos una ruta efectiva, una revocación redirige sin cerrar sesión. Si no conserva ninguna, se cierra sesión.

## 5. Matriz de capacidades por rol

El interruptor habilita una sección; nunca convierte una capacidad funcionalmente inválida en válida. `Admin total e inmutable` significa las siete secciones ON y scope `all` implícito, no todas las mutaciones históricas. Se conservan los contratos vivos y la instrucción humana más reciente.

| Área | Admin | Worker | Client |
|---|---|---|---|
| Usuarios, roles y accesos | gestión total local; permisos propios inmutables | DENY | DENY |
| Proyectos | lectura total; alta de proyecto permitida; edición general, áreas/contactos y media siguen `Proposed`/DENY | lectura y acciones ya válidas sólo en scope | sin vista interna de proyecto salvo presentación Client expresamente existente |
| Equipo | lectura y filtros; crear/editar/asignar/eliminar tareas sigue `Proposed`/DENY | consulta y actualización sólo del estado de tarea propia; sin editar/asignar/eliminar tareas ajenas | DENY |
| Proveedores | flujo baseline | alta/gestión sólo en proyectos permitidos | DENY |
| Specs | flujo baseline | alta/gestión sólo en proyectos permitidos | DENY |
| Crear/emitir OC | permitido en scope total | permitido sólo en proyectos permitidos | DENY |
| Historial de OC | sección ON, pero preview/descarga/eliminación de PO persistida permanecen `Proposed`/fuera de matriz y se deniegan | el interruptor de sección no está disponible; la creación desde proyecto se rige por Dashboard + scope | lectura/preview de OC autorizadas dentro de project scope; sin crear, editar, descargar ni eliminar |
| Configuración/funciones no listadas | no se crea permiso nuevo | DENY salvo capacidad ya validada | DENY |

### 5.1 Matriz exacta de las 41 acciones para Admin

| Resultado Admin | Acciones | Fundamento |
|---|---|---|
| `SYSTEM`, sólo en su contexto | `eye`, `close`, `logout`, `reset-demo` | login, cierre de UI/sesión y recovery local; no capacidad de negocio |
| `ALLOW` | `advanced-team-filters`, `banner-next`, `banner-prev`, `view-image`, `new-user`, `edit-user`, `toggle-user`, `new-project`, `new-supplier`, `edit-supplier`, `toggle-supplier`, `new-spec`, `preview-spec`, `new-order`, `po-back`, `add-item`, `remove-item` | lectura/supervisión, gestión de usuarios, proveedores/SPEC y creación/emisión de OC ya Allowed; cada acción conserva fase/target válido |
| `DENY` | `task`, `advance-team-objective` | actualización de estado reservada al Worker sobre tarea propia |
| `DENY` | `new-task`, `edit-task`, `assign-team-objective`, `edit-team-objective`, `delete-team-objective` | crear/editar/asignar tareas permanece Proposed |
| `DENY` | `edit-project-card`, `add-team-member`, `remove-team-member`, `edit-banner`, `gallery`, `set-banner-cover`, `remove-banner-image`, `delete-viewed-image`, `add-warehouse` | edición general, contactos/áreas y media de proyecto no está Allowed |
| `DENY` | `preview-order`, `download-order`, `delete-order` | vista persistida Admin está Proposed; descarga/eliminación fuera de matriz |
| `DENY` | `notifications` | capacidad fuera de matriz vigente |

Acciones internas nuevas del editor —abrir/cerrar `Editar accesos`, cambiar switch/scope, confirmar y guardar— son `ALLOW` sólo para Admin sobre Worker/Client válidos. No forman parte de las 41 históricas y deben inventariarse aparte para no alterar el gate.

Una acción que la interfaz histórica mostraba pero contradice un contrato vigente debe conservar fidelidad estructural sin presentarse como facultad disponible: ocultar el control para el rol o denegar su ejecución directa. Esta REF no amplía `Proposed` a `Allowed`; la instrucción humana sólo fija ON las siete secciones Admin.

## 6. Permisos por proyecto

Worker y Client reciben un selector de alcance por proyecto dentro del alta y de `Editar accesos`:

```js
projectScope: {
  mode: 'all' | 'selected',
  projectIds: ['p1', 'p2']
}
```

Semántica obligatoria:

- `mode: 'all'` es un centinela dinámico. No se expande a una lista al guardar. Comprende todos los proyectos existentes y cualquier proyecto creado después.
- `mode: 'selected'` usa IDs estables explícitos. Un proyecto futuro no queda autorizado automáticamente.
- Cambiar de `all` a `selected` exige seleccionar explícitamente; no se preselecciona silenciosamente todo el catálogo.
- IDs inexistentes no conceden acceso y no se sustituyen por posición/nombre. Se conservan en datos de migración para no perder intención, pero se marcan como huérfanos en la UI Admin.
- El alcance se calcula de nuevo en cada render, navegación y acción. Nunca se captura como array efectivo permanente.
- Admin usa `all` implícito e inmutable; no persiste selección.
- Para Worker, el scope limita proyectos, tareas, proveedores, specs y creación/emisión de OC.
- Para Client, el scope limita Panel e Historial de OC. Si existen autorizaciones explícitas Client–PO previas, se intersectan con el scope; el proyecto no puede ampliar una relación de OC más restrictiva ya conservada.
- Un usuario puede tener secciones prendidas y cero proyectos seleccionados. Conserva la sesión si existe una ruta efectiva, pero las vistas project-bound muestran estado vacío; no se inventan relaciones.

## 7. Modelo de acceso y migración compatible

### 7.1 Estado canónico de una sola clave

Para evitar una falsa transacción entre claves, la reconstrucción usa un único estado canónico nuevo `vaak-local-v8`. Contiene dominio, acceso, relaciones y metadata de migración en un solo JSON. Cada mutación válida se materializa mediante una única llamada `localStorage.setItem('vaak-local-v8', nextRaw)`. Las claves fuente `vaak-preview-v6` y `vaak-preview-v7` quedan intactas, sólo lectura y recuperables; no existe una segunda escritura coordinada.

```js
{
  schemaVersion: 8,
  revision: 12,
  domain: {
    users: [], projects: [], tasks: [], orders: [], suppliers: [], specs: []
  },
  relations: {
    projectMemberships: [], projectCompanies: [], supplierProjectLinks: [],
    clientProjectLinks: [], clientOrderAuthorizations: [], quarantine: []
  },
  access: { users: {} },
  migration: {
    state: "complete",
    source: "v6|v7|merged|seed",
    sourceFingerprints: {},
    conflicts: [], unmapped: []
  }
}
```

Admin no necesita objeto de grants; su permiso se deriva siempre del rol. `revision` aumenta exactamente una vez por guardado válido —dominio o acceso— y permite invalidar operaciones stale y notificar otras pestañas mediante el storage event de la misma clave.

### 7.2 Validadores de fuentes

Un JSON parseable no basta:

- v6 reconocido: objeto con arrays `users`, `projects`, `tasks`, `orders`; `suppliers` y `specs` pueden faltar y se normalizan como arrays vacíos sólo en la proyección v8. Cada entidad exige `id` string único; User exige `name`, `username`, `role ∈ {Admin,Worker,Client}`, `active` boolean; Project exige `id`, `name`; Task exige `id`, `assignee`; Order exige `id`, `projectId`. Debe existir al menos un Admin activo.
- v7 reconocido: `schemaVersions === {access:2,relations:2,resources:2}`, `meta.storeRevision` entero no negativo, las seis colecciones de dominio y seis colecciones relacionales como arrays, IDs únicos, FKs/roles/cardinalidades conforme al validador relacional de 3-C y al menos un Admin activo.
- access 3-C reconocido: para no Admin, `user.access.version === 2` y `grants` objeto con valores `enabled|disabled`; Admin puede omitir access.
- cualquier fuente desconocida, malformada o contradictoria se conserva intacta y no se usa para conceder autoridad. Si no hay otra fuente válida, el arranque queda en recovery; no reseedea.

### 7.3 Mapping exacto hacia v8

- User: conservar todos los campos enumerables; exigir/mapear `id,name,email?,username,password?,role,active`; access se extrae a `access.users[userId]` y no se usa como sustituto de identidad.
- Project: conservar todos los campos enumerables y normalizar sólo ausentes usados por la UI con valores neutros: `code,name,legal,tax,fiscal,warehouse,installation,opening,rooms,residences,areas,cover,gallery,team,warehouses,city,country,contact,phone`. Un default neutro no concede relación ni elimina el raw original.
- Task: conservar campos; exigir `id,assignee`; normalizar `title,status,progress,created,due,period,reference` sin reasignar actor/proyecto.
- Order: conservar campos, ítems, condiciones, monedas y aprobaciones; exigir `id,projectId`; normalizar aliases visuales `supplier ?? manufacturer` y `date ?? deliveryDate` sólo en el view-model, no reescribir fuente.
- Supplier y Spec: conservar campos; una relación de proyecto sólo procede de `supplierProjectLinks`/`projectId` demostrable. Ausencia queda sin scope, nunca `all` implícito por posición.
- Relaciones v7 válidas se copian a `relations`; relaciones v6 inexistentes no se inventan. `visible` de una OC no crea autorización Client.
- Al unir v6+v7, v6 conserva precedencia visual para IDs coincidentes. Un registro v7-only se proyecta por las reglas anteriores. Un mismo ID con JSON canónico distinto se registra en `migration.conflicts` y la variante v7 sigue disponible en su clave original; no se fusionan campos silenciosamente.
- `migration.unmapped` registra tipo/ID/campos no consumidos sin incluir contraseñas en evidencia. Los datos permanecen también en los raw fuente.

### 7.4 Protocolo idempotente de una sola escritura

La migración debe ser pura antes de persistir, idempotente y aditiva:

1. Si `vaak-local-v8` existe y valida, usarlo; no releer ni reimportar fuentes. Ésta es la condición de reanudación/idempotencia.
2. Si v8 falta, leer sin modificar `vaak-preview-v6`, `vaak-preview-v7`, `vaak-session-v6` y access 3-C embebido.
3. Validar cada fuente según §7.2 y construir en memoria un candidato v8 completo según §7.3.
4. Migrar grants 3-C reconocidos: `enabled→true`, `disabled`/ausente/`none→false`, recortados por techo del rol.
5. Migrar memberships Worker y links Client demostrables a `mode:'selected'`. Sin relación demostrable, cuentas preexistentes reciben el default legacy documentado `mode:'all'`; usuarios nuevos nunca.
6. Usuario legacy sin access: Worker prende sus cinco secciones y Client Panel+Historial, con `source:'legacy-compat'`. Usuario nuevo inicia editable OFF y `selected:[]`.
7. Validar el candidato completo, serializarlo canónicamente y ejecutar **una sola escritura** a `vaak-local-v8`.
8. Si esa escritura falla por cuota/excepción, no existe cambio en las fuentes ni otra clave parcial; reportar recovery/HALLAZGO. Si reemplaza un v8 previo, `setItem` fallido debe dejar su valor anterior verificablemente idéntico.
9. Releer v8, comparar JSON canónico y validar. Si la relectura no coincide, no tocar fuentes y detener; no hay rollback multi-clave que prometer.
10. Nunca ejecutar `localStorage.clear()`, eliminar/reescribir v6/v7, escribir una proyección a v6, reseedear por arrays vacíos ni coordinar dos `setItem` como si fueran transacción.
11. STORE ausente en una instalación realmente nueva —v6, v7 y v8 ausentes— puede crear el seed reconstruido mediante la misma única escritura v8. Fuente inválida no equivale a ausente.

La ENTREGA debe inyectar fallo antes y durante el único `setItem` y demostrar: fuentes raw idénticas, v8 previo idéntico si existía, o v8 ausente si era primera migración. Debe incluir snapshots sanitizados para: sólo v6, sólo v7, ambos, conflicto de ID, access 3-C, legacy sin access, arrays vacíos, JSON inválido, schema futuro y segunda carga con v8 ya completo.

## 8. Sesiones abiertas y `storage` event

### 8.1 Sesión por pestaña

El actor canónico de cada pestaña se guarda en `sessionStorage` bajo `vaak-session-tab-v1`. Dominio/accesos permanecen compartidos en `localStorage` mediante `vaak-local-v8`. Así dos pestañas del mismo origen pueden mantener simultáneamente Admin y Worker/Client, y ambas reciben el `storage` event de v8.

Precedencia y compatibilidad legacy:

1. Si `sessionStorage['vaak-session-tab-v1']` contiene un userId válido/activo, usarlo; nunca sustituirlo desde localStorage.
2. Si no existe actor tab-local y tampoco existe `sessionStorage['vaak-session-bootstrap-v1']`, se permite copiar una sola vez el userId válido de `localStorage['vaak-session-v6']` a la sesión de esa pestaña y fijar el marker tab-local `legacy-copied`.
3. Si el legacy está ausente/inválido, fijar el marker `checked-empty` y mostrar login.
4. Login exitoso escribe sólo `sessionStorage['vaak-session-tab-v1']` y marker `login`; no cambia el actor de otras pestañas.
5. Logout elimina sólo el actor tab-local y fija marker `logged-out`; una recarga de esa pestaña no vuelve a importar el legacy.
6. No borrar, reescribir ni usar después como sesión activa `localStorage['vaak-session-v6']`; queda preservado como evidencia compatible. Una pestaña nueva sin marker puede heredarlo una vez durante la ventana de compatibilidad, limitación documentada de localhost. Tras login/logout propio, manda siempre sessionStorage.
7. Cuenta eliminada/deshabilitada o sin rutas borra sólo la sesión tab-local afectada. No cierra sesiones de otros actores por compartir origen.
8. SESSION nunca se incluye en `vaak-local-v8`; no se promete transacción entre sessionStorage y localStorage.

Implementar una única función `reconcileAccessChange()` usada por:

- la pestaña Admin inmediatamente después de guardar/deshabilitar;
- `window.addEventListener('storage', ...)` en otras pestañas del mismo origen cuando cambie `vaak-local-v8`;
- render, navegación y apertura/commit de acciones protegidas.

Algoritmo obligatorio:

1. releer actor desde sessionStorage y usuario/estado/rol/acceso/proyectos desde v8;
2. si la cuenta ya no existe, está deshabilitada o no tiene ninguna ruta efectiva, retirar la SESSION de esa pestaña/origen, cerrar modal, limpiar estado efímero y mostrar login;
3. si la ruta actual sigue permitida, conservarla y rerenderizar sin pedir contraseña;
4. si dejó de estar permitida, cerrar cualquier modal de esa ruta y navegar a la primera ruta efectiva en este orden estable: `home`, `tools`, `team`, `users`, `suppliers`, `specs`, `orders`;
5. una ruta `project` revocada intenta primero `home`; si `home` no está permitida, usa el orden anterior;
6. volver a verificar project scope y permiso al ejecutar/guardar una acción; un modal abierto antes de una revocación no puede guardar después;
7. el cambio de idioma no altera permisos ni sesión.

No se promete sincronización entre perfiles de navegador, dispositivos u orígenes distintos: `localStorage` y `storage` no la ofrecen. La evidencia debe probar bajo un mismo origen real: pestaña A=Admin y B=Worker; A=Admin y C=Client; B/C con sessionStorage distinto; A modifica v8; B/C recibe el evento real, relee su actor tab-local y redirige/cierra según corresponda. También se prueba el camino inmediato de la pestaña escritora. No se acepta simular actores cambiando una SESSION global ni llamar manualmente al listener como única evidencia. No se presenta esta simulación como revocación de servidor.

## 9. Estrategia de restauración por fases

### Fase A — Congelar evidencia y construir comparador

- registrar hashes/tamaños/timestamps actuales y de todas las fuentes del corpus;
- levantar sólo loopback para capturas;
- construir un ledger de procedencia por vista usando el corpus §2.2;
- catalogar las 20 capturas disponibles de 3-C y declarar para cada una qué elemento de acceso demuestra y qué elemento histórico no puede demostrar;
- extraer del archivo parcial, CSS, presentación y handoffs las clases DOM, formularios, campos, textos y comportamientos recuperables;
- congelar como contrato máquina las nueve rutas y 41 acciones exactas de §2.2; las acciones internas nuevas se registran en un inventario separado.

**Gate A:** corpus/ledger completo; conjunto de rutas exactamente igual a las nueve históricas; conjunto de acciones históricas exactamente igual a las 41 —cero faltantes, cero sustituciones y cero internas mezcladas—; manifest de las 20 capturas disponibles leído y hashes verificados. No se exige un `before` ejecutable inexistente.

### Fase B — Reconstrucción fiel

- usar `staging/public/prototype/app.js` como esqueleto histórico parcial, no como archivo completo ni destino;
- reconstruir las superficies ausentes con evidencia de refinements/presentation/handoffs, conservando la riqueza funcional documentada;
- reactivar `presentation.js` en localhost;
- adaptar únicamente rutas locales/base href/cachebuster, sin copiar el puente de staging;
- implementar las nueve rutas y 41 contratos de acción antes de integrar acceso;
- capturar un checkpoint `reconstructed-pre-access` de todas las vistas históricas.

**Gate B:** nueve rutas presentes; 41 acciones reconocidas; Login, Dashboard, Herramientas, Equipo, Usuarios, Proveedores, Specs, Historial, Proyecto y Settings histórico/inaccesible renderizan su superficie esperada; formularios completos de proyecto/OC/spec/equipo/usuarios conservan campos del corpus; toda captura se abre visualmente. Si una ruta/acción/campo exigido falta, no avanzar.

### Fase C — Overlay de acceso

- implementar el store separado, matriz, role ceilings, project scope y helpers puros;
- añadir gates localizados en navegación, render y acciones;
- modificar sólo Gestión de usuarios y alta de usuario para el nuevo control;
- mantener las plantillas reconstruidas fielmente intactas fuera de esas zonas.

**Gate C:** permisos conductuales completos sin diferencias visuales fuera de Gestión de usuarios, controles ocultados por permiso y estados vacíos derivados.

### Fase D — Migración y sesiones

- construir/migrar una sola vez a v8 mediante una única escritura, preservando v6/v7;
- migrar actor por pestaña a sessionStorage según §8.1;
- implementar reconciliación inmediata y por storage event;
- cubrir stale modal, ruta revocada, sin acceso y cuenta deshabilitada.

**Gate D:** cero pérdida de fuentes, fallo de única escritura sin estado parcial, segunda carga idempotente y revocación Admin→Worker/Admin→Client demostrada con actores simultáneos del mismo origen.

### Fase E — Comparación final y ENTREGA

- capturar `reconstructed-pre-access` y `final-with-access` con los mismos fixtures, rutas y viewports;
- comparar ambas series para demostrar que el overlay de acceso no rediseñó la reconstrucción;
- contrastar visualmente la reconstrucción contra cada referencia disponible aplicable y registrar conformidad/desviación por región, sin fabricar un `before` pre-3-C;
- ejecutar matriz completa de acceso/migración/sesión;
- documentar límites localhost.

**Gate E:** inventario final conserva 9/41; toda diferencia entre checkpoint y final fuera de Gestión de usuarios u ocultación por permisos es cero o HALLAZGO bloqueante; referencias disponibles fueron abiertas y auditadas; ninguna afirmación usa “exacto” o “byte-equivalente”. No emitir ENTREGA con una desviación no autorizada.

## 10. Archivos permitidos durante una futura ejecución

### Producto local

- `prototype/app.js` — reconstrucción fiel desde el corpus y puntos mínimos de integración.
- `prototype/access-control.js` — matriz, ceilings, scopes, migración y decisiones puras; puede reemplazarse respecto de 3-C.
- `prototype/access-runtime.js` — sólo si se mantiene como adaptador acotado de storage/eventos; no debe volver a renderizar toda la aplicación.
- `prototype/access-test-fixtures.js` — fixtures locales.
- `prototype/index.html` — orden de scripts/cachebusters y carga de `presentation.js`.
- `prototype/refinements.css` — conservar todos los bloques actuales; sólo ajustar/agregar estilos del editor de accesos. No reemplazar por staging.
- `prototype/presentation.js` — conservar catálogo y comportamiento actuales; sólo agregar claves del acceso si faltan. No eliminar traducciones.
- `prototype/README.md` — límites, claves y cuentas ficticias.

### Pruebas y evidencia

- `prototype/access-control.test.js`
- `prototype/access-runtime.test.js`
- `prototype/access-integration.test.js`
- `prototype/access-acceptance.test.js`
- `prototype/access-verify.js`
- `prototype/access-browser-harness.html`
- `prototype/access-browser-harness.js`
- `prototype/access-evidence.test.js`
- `HANDOFF/evidence/VAAK-UI-ACCESS-4-A/`
- `HANDOFF/ENTREGA-VAAK-UI-ACCESS-4-A.md`
- `docs/functional/VAAK-ROLE-PERMISSIONS.md` sólo para reconciliación factual del estado local, sin cambiar capacidades Allowed/Proposed/Not allowed salvo la instrucción humana explícita registrada en esta REF.

No se permiten cambios en `staging/`, `styles.css`, `LOGO VAAK.png`, `prototype/assets/`, `PROJECT-BRAIN.md`, `PROJECT-STATE.md`, otros handoffs, backend, Supabase, Vercel, cPanel, hosting, configuración remota, proveedores, datos reales o activos. No inicializar Git, instalar paquetes ni crear dependencias.

## 11. Criterios de aceptación visuales

### 11.1 Matriz mínima de capturas de reconstrucción/checkpoint/final

Con fixture idéntico, idioma idéntico y viewport `1440×1000`, capturar el checkpoint `reconstructed-pre-access` y el resultado `final-with-access` para:

1. Login.
2. Dashboard Admin.
3. Dashboard Worker.
4. Portal/Dashboard Client.
5. Herramientas Admin.
6. Herramientas Worker.
7. Equipo.
8. Gestión de usuarios.
9. Gestión de proveedores.
10. Biblioteca de specs.
11. Historial de OC.
12. Detalle de proyecto: cabecera/banner.
13. Detalle de proyecto: datos, áreas y equipo cliente.
14. Galería e historial de OC del proyecto.
15. Modal Nuevo proyecto.
16. Modal/formulario y preview de OC.
17. Modal/formulario y ficha técnica de spec.
18. Modal editar usuario existente.
19. Modal separado Editar accesos Worker.
20. Alta de usuario con selección de accesos/proyectos.

Repetir en viewport móvil `390×844` al menos Login, Dashboard, Herramientas, Gestión de usuarios, Editar accesos y detalle de proyecto.

Las 20 PNG existentes de `HANDOFF/evidence/VAAK-ACCESS-3-C/` forman una serie `available-access-reference`, no un `before` histórico. Deben permanecer separadas y sin alteración. Sirven para contrastar alta/confirmación/edición Client/cambio de rol/Tools/denegaciones/recovery/no-access; no pueden justificar Equipo, Settings, formularios completos ni otras superficies que 3-C había reducido.

### 11.2 Regla de fidelidad y no regresión

- Para capturas 1–18, `reconstructed-pre-access` se audita contra el ledger de procedencia y toda referencia aplicable del corpus. No se calcula una falsa igualdad píxel a píxel con el snapshot parcial.
- `final-with-access` sí debe coincidir con `reconstructed-pre-access` en layout, navegación, jerarquía, textos, campos, cards, métricas, filtros, modales, colores y responsive fuera del acceso autorizado.
- Diferencias permitidas entre checkpoint/final: controles ocultos por permiso; columna/botón `Editar accesos`; modal de acceso; selección de accesos en alta; estados de denegación/fallback solicitados.
- Diferencias no permitidas: pérdida de campos, resumen en lugar de formulario completo, eliminación de filtros, cambio arbitrario de cards/tablas, nuevo login/cabecera/métricas, textos genéricos, sustitución gratuita de iconos, reducción de proyecto/PO/spec/equipo o desaparición de cualquiera de las 41 acciones como contrato.
- La evidencia incluye checkpoint, final, diff/overlay y clasificación de cada región distinta. Para referencias históricas parciales o capturas disponibles se registra comparación visual lado a lado y procedencia, no porcentaje engañoso de “exactitud”.
- El Auditor debe abrir todas las imágenes —incluidas las 20 disponibles— y revisar al menos una evidencia por cada ruta; un test de hashes/nombres no basta.

## 12. Criterios de aceptación conductuales

1. Admin ve y abre las siete secciones con acceso total; no puede editar sus grants ni project scope.
2. Worker sólo puede prender Panel, Herramientas, Equipo, Proveedores y Specs; Users/Historial permanecen OFF e inmutables aunque se manipule storage.
3. Client sólo puede prender Panel e Historial; las otras cinco permanecen OFF e inmutables.
4. Gestión de usuarios conserva el botón/flujo `Editar` y añade un botón separado exacto `Editar accesos` sólo para Worker/Client.
5. `Editar accesos` no altera nombre, email, usuario, contraseña, rol ni estado de cuenta.
6. Alta de usuario exige rol, interruptores válidos y project scope; no crea la cuenta con valores no confirmados.
7. Cambiar rol recalcula techo, apaga valores incompatibles y exige confirmación explícita antes de guardar; no convierte permisos inválidos.
8. Tools OFF vuelve inefectivos Suppliers/Specs y Tools ON restaura su preferencia sin resucitar un permiso borrado.
9. `all` incluye automáticamente un proyecto creado después; `selected` no lo incluye.
10. Worker no ve ni opera recursos de proyectos fuera de scope; Client no ve OC fuera de scope/autorización conservada.
11. Toda ruta pegada/manipulada se deniega igual que la navegación oculta.
12. Toda acción protegida revalida rol, sección y scope al abrir y al guardar.
13. Revocar la ruta actual en otra pestaña redirige a la primera ruta permitida sin login.
14. Revocar una ruta no actual actualiza navegación/cards sin cerrar sesión.
15. Quitar el último acceso o deshabilitar cuenta elimina la SESSION tab-local, cierra modal y muestra login.
16. Un modal abierto antes de revocación no puede persistir después; cero escritura de dominio.
17. La pestaña que guarda aplica el cambio inmediatamente aunque no recibe su propio storage event.
18. Las otras pestañas reaccionan al storage event una sola vez, sin loop ni recarga infinita.
19. Migración a v8 conserva entidades, campos y raw v6/v7 de origen; conflictos no se sobrescriben; segunda carga es idempotente.
20. JSON inválido, schema futuro o cuota agotada no reseedean ni borran datos.
21. Preferencia ES/EN y catálogo posterior funcionan en todas las vistas restauradas y en el editor de accesos.
22. `styles.css`, logo y activos mantienen hashes iniciales.
23. No hay solicitudes externas; únicamente loopback `127.0.0.1` para servir y capturar evidencia.
24. No hay cambios fuera de archivos permitidos y no se afirma diff Git.

## 13. Evidencia esperada en la ENTREGA

La futura ENTREGA debe contener:

- tabla de archivos modificados/creados con propósito;
- hashes, bytes y timestamps antes/después;
- comprobación de las huellas históricas del corpus y de invariantes `styles.css`, logo y activos;
- ledger del corpus versus checkpoint/final de rutas, vistas, acciones, formularios, campos y clases principales;
- matriz Admin/Worker/Client × siete secciones × ON/OFF × ruta directa;
- matriz de acciones por rol y project scope;
- snapshots sanitizados de migración para todos los casos de §7.2;
- trazas de `revision`, escritura única de access store y cero borrado de claves legacy;
- prueba de `all` con proyecto futuro y de `selected` sin proyecto futuro;
- prueba real de pestañas simultáneas Admin/Worker y Admin/Client: fallback, no reprompt, no-access logout, disabled logout y stale modal;
- capturas checkpoint/final, referencias disponibles y diffs de §11, con manifest SHA-256;
- log de red que demuestre sólo loopback/data/blob y cero staging/Supabase/Vercel/Internet;
- salida literal de sintaxis/tests y resultado por criterio, no sólo una línea global PASS;
- declaración explícita de que es localhost y no seguridad real;
- desviaciones y HALLAZGOS. Si hay una diferencia visual no autorizada, no declarar listo para auditoría.

## 14. Frenos y condiciones de detención

Detener y emitir HALLAZGO o PREGUNTA con la misma REF si:

- reconstruir una vista exige modificar staging o copiar `staging-bridge.js`;
- se propone rediseñar libremente, eliminar una vista/campo/flujo del corpus o simplificar un formulario;
- se necesita backend, Supabase, Vercel, deploy, staging, LAN, red externa, paquete o dependencia;
- se requiere modificar `styles.css`, logo o activos;
- la migración sólo puede continuar borrando, sobrescribiendo conflictos, reseedeando o inventando relaciones;
- no se puede demostrar fidelidad contra el corpus y no regresión checkpoint/final;
- `storage` event no puede verificarse con dos pestañas del mismo origen;
- una decisión de permisos no está cubierta por la matriz y ampliaría una capacidad de rol;
- una prueba sólo puede pasar debilitando un criterio.

Frenos permanentes: no deploy, no staging, no backend, no Supabase, no Vercel, no cPanel/hosting, no Git push/merge, no producción, no secretos, no datos reales, no proveedores reales, no gasto externo, no dependencias, no activos y no red externa. La única red autorizada es loopback `127.0.0.1` para ejecución local y evidencia.

## 15. Instrucción al `reviewer_auditor`

Auditar esta ORDEN contra la instrucción humana, los archivos reales y los contratos funcionales. Priorizar:

1. que la fuente de reconstrucción sea el corpus combinado de §2.2 y la aceptación humana explícita de reconstrucción fiel; el archivo de 53,565 bytes es sólo evidencia parcial y staging nunca se modifica;
2. que `refinements.css` y `presentation.js` posteriores se conserven, mientras `styles.css` permanece idéntico;
3. que la reconstrucción autorizada siga el corpus y que, una vez alcanzado el checkpoint fiel, el acceso se integre como overlay localizado sin volver a sustituir la interfaz;
4. que las siete secciones, role ceilings, Tools y project scope tengan semántica única;
5. que Admin sea total e inmutable y que la UI no permita grants inválidos a Worker/Client;
6. que `all` sea dinámico para proyectos actuales y futuros;
7. que la proyección v6/v7→v8 use una sola escritura, sea idempotente, no destructiva y verificable ante fallo;
8. que sessionStorage por pestaña y el storage event compartido cubran Admin/Worker y Admin/Client simultáneos, además de la pestaña escritora;
9. que la fidelidad contra referencias y la comparación visual checkpoint/final sean obligatorias en todas las vistas y no una afirmación de palabra;
10. que localhost y archivos permitidos estén cerrados sin excepciones implícitas.

El Auditor puede emitir `APROBADO`, `CAMBIOS SOLICITADOS` o `RECHAZADO`. Un `APROBADO` valida únicamente el diseño y no autoriza implementación. El Arquitecto sustituto no emitirá VEREDICTO sobre esta ORDEN ni sobre una futura ENTREGA.
