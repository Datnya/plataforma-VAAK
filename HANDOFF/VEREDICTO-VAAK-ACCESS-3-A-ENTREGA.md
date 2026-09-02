---
artifact_type: VEREDICTO
phase: "3"
ref: "VAAK-ACCESS-3-A"
from: reviewer_auditor
to: architect_chief
status: changes_requested
blocking: true
created_at: "2026-08-31"
review_stage: delivery
result: CAMBIOS_SOLICITADOS
---

# VEREDICTO DE ENTREGA — Accesos granulares administrados por Admin

## RESULTADO

**CAMBIOS SOLICITADOS**

La entrega no satisface la ORDEN aprobada. Los cuatro comandos obligatorios terminan con código cero y el inventario contiene las 40 acciones observadas, pero la integración real conserva bypasses de wrappers acumulados y la política pura concede acciones y recursos fuera de alcance. También se reponen relaciones retiradas, no existe recuperación cerrada ante un STORE sin Admin activo y la evidencia entregada no demuestra los 39 criterios.

El incremento continúa siendo una simulación local manipulable; este veredicto no evalúa ni autoriza seguridad real, backend, staging o despliegue.

## Evidencia independiente ejecutada

```text
node --check prototype/access-control.js  -> exit 0
node --check prototype/app.js             -> exit 0
node --check prototype/presentation.js    -> exit 0
node prototype/access-control.test.js     -> access-control: all assertions passed; exit 0

Inventario independiente:
observed_count=40
known_count=41
missing=
unobserved_policy=edit-user-access
```

El test entregado contiene 21 aserciones y no es una matriz caso por caso de los 39 criterios ni una prueba de integración DOM. Una batería adversarial adicional, ejecutada sin editar archivos, produjo estos resultados:

```text
malformed access fails closed: actual=true expected=false FAIL
empty memberships stay intentionally empty: actual=1 expected=0 FAIL
worker cannot delete order in unassigned project by ID: actual=true expected=false FAIL
worker supplier mutation requires project-linked target: actual=true expected=false FAIL
worker spec mutation requires project-linked target: actual=true expected=false FAIL
client cannot mutate PO form via add-item: actual=true expected=false FAIL
dashboard-authorized Client can preview its displayed PO: actual=false expected=true FAIL
STORE without active Admin fails closed on internal route: actual=true expected=false FAIL
dangling Client order relation fails closed: actual=true expected=false FAIL
duplicate contradictory Client authorization fails closed: actual=true expected=false FAIL
```

La comparación positiva Client A → PO de Client B sí devolvió `false` para `preview-order` y `download-order` en un estado limpio construido por la prueba; esa protección puntual no subsana los hallazgos siguientes.

## Hallazgos bloqueantes

### H-E01 — Bypass Admin-only y autorización obsoleta por wrappers acumulados — CRÍTICA

- `prototype/app.js:163-164` instala el guard central, pero `prototype/app.js:193-201` vuelve a redefinir `action` y ejecuta `new-user` y `edit-user` antes de delegar a `aclUserActionBase`. Un Worker o Client puede inyectar un elemento con esos `data-action` y abrir/confirmar las mutaciones sin pasar por `authorizeAction`.
- El archivo contiene 13 definiciones/reasignaciones de `action` y 5 de `render`. `dispatchAction` (`prototype/app.js:161`) sólo llama a la variable `action`; no constituye una frontera de autorización ineludible.
- `open()` (`prototype/app.js:14`) conserva callbacks de submit sin relectura de STORE/SESSION ni reautorización. Una revocación posterior a abrir un modal no invalida el commit. Esto afecta, entre otros, alta/edición de usuarios, proyectos, proveedores, SPECs, POs, banners y objetivos.
- `po-back` está clasificada como neutral y abre `showPoForm`; un Client puede invocarla mediante DOM manipulado y el callback genera una PO sin una segunda autorización.

Corrección exigida: un único dispatcher no reemplazable debe autorizar antes de abrir y nuevamente antes de cada commit; ningún wrapper final ni callback puede ejecutar handlers directamente. Las acciones internas y DOM deben entrar por la misma frontera con actor, objetivo, recurso y estado recién leídos.

### H-E02 — La política de acciones no aplica deny-by-default a objetivo y recurso — CRÍTICA

- `prototype/access-control.js:26` considera neutrales `po-back`, `delete-viewed-image`, `add-item` y `remove-item`; `prototype/access-control.js:108` las concede a cualquier usuario activo.
- Suppliers y Specs sólo comprueban rol/sección (`prototype/access-control.js:110-111`), sin resolver el objetivo ni su proyecto. IDs inexistentes o fuera de alcance resultaron autorizados.
- Las mutaciones de Orders comprueban el proyecto seleccionado, no el proyecto de la orden objetivo (`prototype/access-control.js:112`). Un Worker asignado a `p1` obtuvo autorización para `delete-order` sobre una orden de `p2` manteniendo `selectedProjectId=p1`.
- No existe una relación Supplier–proyecto estable ni `projectId` estable en los SPECs heredados; el prototipo conserva nombres visibles (`prototype/app.js:52-58`) como datos operativos.

Corrección exigida: sacar las acciones mutantes del conjunto neutral, resolver cada target por ID, exigir recurso existente y aplicar el mismo predicado de proyecto en listados, métricas, previews, descargas y commits. Un recurso sin vínculo inequívoco debe denegarse.

### H-E03 — Migración y relectura reponen concesiones retiradas y fallan abiertas — CRÍTICA

- Toda versión distinta de `1`, incluso malformada, recibe defaults amplios (`prototype/access-control.js:44-46`) en vez de fallo cerrado.
- Si `projectMemberships` queda vacío, cada ejecución vuelve a asignar todos los proyectos a todos los Workers (`prototype/access-control.js:61-64`). Una retirada intencional de todas las asignaciones no sobrevive a la recarga.
- Si `clientLinks` o `clientOrderAuthorizations` quedan vacíos, `prototype/app.js:151-153` vuelve a fabricar relaciones para el primer Client, primer proyecto y primera orden. Esto viola idempotencia, no reposición de defaults y la prohibición de fabricar autorizaciones Client–PO.
- `canViewClientOrder` usa el primer vínculo coincidente y no valida existencia del proyecto ni unicidad/contradicciones (`prototype/access-control.js:83-89`); relaciones colgantes o duplicadas pueden conceder acceso.

Corrección exigida: distinguir ausencia migrable de corrupción; marcar la migración de relaciones con versión propia; no usar `array.length===0` como señal de migración; validar IDs, cardinalidad y contradicciones antes de conceder.

### H-E04 — Client PO no usa un predicado coherente de extremo a extremo — ALTA

- El Dashboard Client muestra órdenes con `canViewClientOrder` (`prototype/app.js:173`) aunque el Client sólo tenga Dashboard.
- `preview-order` y `download-order` exigen además `section.orders` (`prototype/access-control.js:97-100`). El Client migrado por default ve su documento en Dashboard, pero no puede abrirlo ni descargarlo.
- El seed real sólo contiene un Client y una orden (`prototype/app.js:2`); no cumple el seed limpio de dos Clients, dos empresas/proyectos y autorizaciones distintas. Los dos Clients existen únicamente en el test puro.
- La fabricación automática de `clientOrderAuthorizations` en `prototype/app.js:153` sustituye una autorización explícita por posición dentro de arrays.

Corrección exigida: definir la modalidad de lectura según contexto sin bifurcar el predicado de identidad/empresa/proyecto/PO, incorporar el seed negativo exigido y probar listado, preview, descarga y mutaciones por ID para ambos Clients.

### H-E05 — No existe fallo cerrado ni recuperación ante STORE sin Admin activo — ALTA

- `authorizeRoute` no valida el invariante global de Admin activo; un Worker en un estado sin Admin obtuvo acceso a `home`.
- No hay pantalla de recuperación ni reset confirmado en la integración final. `prototype/README.md` sólo instruye borrar manualmente las claves.
- Ante JSON/estado inválido, el listener `storage` reemplaza silenciosamente por el seed (`prototype/app.js:210`), lo que reintroduce accesos en lugar de conservar un estado cerrado.
- La relectura sólo ocurre en el evento `storage`; `render` y `dispatchAction` no releen STORE y SESSION. Los cambios de la misma pestaña no disparan `storage`, y un modal abierto permanece con su callback autorizado de forma obsoleta.
- La limitación de una única `vaak-session-v6` compartida entre pestañas no está documentada ni demostrada.

Corrección exigida: validador global de STORE, estado de recuperación exclusivo, reset con confirmación destructiva local, relectura/rebind antes de render, navegación, dispatch y commit sensible, y cierre de modales al revocar.

### H-E06 — Confirmaciones de alta, cambio de rol, Tools e idioma están incompletas — ALTA

- El botón de alta no permanece deshabilitado; sólo existe un checkbox HTML `required` dentro del formulario genérico.
- Cambiar grants, proyectos o vínculos después de marcar `accessReviewed` no invalida la confirmación. El único listener nuevo de cambio atiende `access-role-select` (`prototype/app.js:204`).
- El cambio de rol no tiene confirmación separada; sólo vuelve a renderizar el editor.
- Retirar Tools elimina hijos en `applyGrantDraft`, pero no existe la confirmación exigida antes de hacerlo.
- `labelsComplete()` sólo comprueba las ocho etiquetas del catálogo (`prototype/access-control.js:134`); no existe catálogo ni test de completitud para validaciones, confirmaciones, denegaciones y recuperación.
- `userRoleLabel` permanece fijo en español (`prototype/app.js:70`) y se usa en la tabla final (`prototype/app.js:191`), por lo que el recorrido English mezcla `Administrador/Trabajador/Cliente`.

Corrección exigida: estado de revisión explícito e invalidable por toda modificación, confirmación de rol independiente, confirmación de retiro de Tools, catálogo ES/EN completo y pruebas de recorrido de extremo a extremo.

### H-E07 — Evidencia de ENTREGA insuficiente y afirmaciones documentales sobredeclaradas — ALTA

- La ENTREGA no aporta el resultado caso por caso de los 39 criterios, snapshots de migración/idempotencia, matrices actor–ruta–recurso–acción, evidencia de revocación, capturas exigidas ni recorrido visual completo ES/EN.
- `prototype/README.md` afirma “Central route and action guards” y `docs/functional/VAAK-ROLE-PERMISSIONS.md` afirma que navegación, rutas y acciones usan la misma fuente deny-by-default; ambas afirmaciones quedan refutadas por H-E01 y H-E02.
- No existe raíz Git verificable. El inventario por timestamp muestra como modificados para la entrega únicamente `prototype/app.js`, `prototype/refinements.css`, `prototype/index.html`, `prototype/access-control.js`, `prototype/access-control.test.js`, `prototype/README.md`, `docs/functional/VAAK-ROLE-PERMISSIONS.md` y la ENTREGA, pero sin Git no puede demostrarse un diff exacto.
- El logo conserva fecha `2026-08-25T16:42:03-05:00` y SHA-256 `840004A7CB7F417A0C300C85E18621335978A0E5C7FD4D4847660404CD1C362E`; no se observó modificación de marca. Tampoco se observaron llamadas de backend/SDK en `access-control.js` o `app.js`.

Corrección exigida: después de corregir la implementación, generar evidencia reproducible completa y reconciliar README/matriz con el comportamiento real.

## Contraste de los 39 criterios

| # | Estado | Evidencia resumida |
|---:|---|---|
| 1 | CUMPLE | Ocho secciones exactas, ceilings y rutas base en `CATALOG`/`ROUTES`. |
| 2 | CUMPLE | Ruta, permiso y acción desconocidos se deniegan en las funciones puras. |
| 3 | CUMPLE | `allowedForRole` impide hacer efectivo `section.users` inyectado en Worker/Client. |
| 4 | CUMPLE | Admin obtiene grants implícitos para las rutas conocidas; `project` exige recurso existente. |
| 5 | CUMPLE | `project` exige Dashboard y membresía; Client queda excluido. |
| 6 | CUMPLE | Dashboard filtra tarjetas Worker y el guard rechaza abrir proyectos no asignados; las mutaciones de proyecto están clasificadas Admin-only. |
| 7 | NO CUMPLE | Suppliers/Specs carecen de relación por proyecto y Orders permite target fuera de scope. |
| 8 | NO CUMPLE | Listas/handlers de Suppliers y Specs no comparten scope por proyecto. |
| 9 | CUMPLE | 40 acciones observadas, cero faltantes en `KNOWN_ACTIONS`; una política no observada adicional. |
| 10 | NO CUMPLE | IDs inexistentes de Supplier/Spec y varias acciones neutrales se autorizan sin objetivo resoluble. |
| 11 | NO CUMPLE | El wrapper final y los callbacks eluden la frontera central. |
| 12 | NO CUMPLE | `new-user` y `edit-user` se interceptan antes del guard Admin-only. |
| 13 | NO CUMPLE | Tarea propia funciona, pero Supplier/Spec/PO no respetan todo el scope Worker. |
| 14 | NO CUMPLE | El seed real contiene un Client y una PO; no hay demostración integrada de dos Clients. |
| 15 | CUMPLE PARCIAL | La función pura deniega preview/download cruzado en un estado limpio, pero no existe el escenario integrado exigido y las relaciones contradictorias no fallan cerradas. |
| 16 | NO CUMPLE | Client no abre `project`, pero `po-back`/callbacks permiten alcanzar creación de PO por DOM manipulado. |
| 17 | NO CUMPLE | Dashboard puede listar una PO que preview/download deniegan por falta de `section.orders`. |
| 18 | NO CUMPLE | La integración fabrica autorización para la primera PO sin decisión explícita. |
| 19 | CUMPLE | Defaults migrados: Worker recibe seis secciones y Client sólo Dashboard. |
| 20 | NO CUMPLE | Versión malformada recibe defaults; relaciones vacías se repueblan. |
| 21 | CUMPLE | Prueba independiente confirmó preservación de proyectos, órdenes, specs, proveedores, tareas, imágenes e idioma durante `migrateState`. |
| 22 | NO CUMPLE | Membresías y autorizaciones vacías se vuelven a aplicar tras recarga. |
| 23 | NO CUMPLE | Checkbox obligatorio evita submit normal, pero el botón no se deshabilita ni se prueba revisión completa. |
| 24 | NO CUMPLE | Cambios de grant/proyecto/vínculo no invalidan `accessReviewed`. |
| 25 | NO CUMPLE | No hay confirmación separada para cambio de rol. |
| 26 | CUMPLE | El selector permite `none → enabled → disabled → enabled → none`. |
| 27 | CUMPLE | `disabled` se persiste y `hasAccess` lo excluye de navegación efectiva. |
| 28 | NO CUMPLE | La dependencia técnica funciona, pero retirar Tools no solicita confirmación. |
| 29 | NO CUMPLE | Wrappers y callbacks impiden una única decisión efectiva para UI/guard/acción. |
| 30 | CUMPLE | `validAdminMutation` y los flujos finales impiden autosuspensión/degradación que deje cero Admin activos mediante esos controles. |
| 31 | NO CUMPLE | STORE sin Admin abre rutas Worker; no existe recuperación cerrada. |
| 32 | NO CUMPLE | `storage` relee claves, pero no valida integralmente ni cierra modales/recursos; render/dispatch no releen. |
| 33 | NO CUMPLE | La cuenta deshabilitada sale en evento externo, pero revocación en misma pestaña y callbacks abiertos conservan capacidad obsoleta. |
| 34 | NO CUMPLE | La SESSION única entre pestañas no está documentada ni demostrada. |
| 35 | CUMPLE | Existe pantalla bilingüe sin accesos con cierre de sesión. |
| 36 | NO CUMPLE | `labelsComplete` cubre sólo ocho labels; no mensajes, confirmaciones ni recuperación. |
| 37 | NO CUMPLE | No hay E2E ES/EN y `userRoleLabel` mezcla español en English. |
| 38 | CUMPLE CON LÍMITE | Logo sin modificación observada y sin backend/SDK nuevo; no hay Git para diff concluyente. |
| 39 | CUMPLE | Los cuatro comandos obligatorios terminaron con código cero. |

## Aspectos conformes que deben conservarse

- Catálogo exacto de ocho secciones, ceilings y Admin implícito.
- Dependencia efectiva de Tools cuando está `disabled`.
- Denegación de rutas y acciones desconocidas.
- Guard de `project` para Worker/Client.
- Protección de último Admin dentro de los flujos que sí llegan a `validAdminMutation`.
- Pantalla bilingüe sin accesos.
- Inventario de 40 acciones sin faltantes nominales.
- Ausencia observada de cambios en logo, backend, Supabase, Vercel, cPanel o despliegue.

## Cierre y escalamiento

La entrega queda **NO APROBADA** y la REF permanece bloqueada. Ésta es la tercera revisión formal asociada a `VAAK-ACCESS-3-A` (R1, R2 y auditoría de ENTREGA). Conforme al límite de gobierno, no procede una cuarta revisión silenciosa con la misma REF: se escala al humano con los hallazgos H-E01…H-E07 para decidir si autoriza una corrección excepcional bajo esta REF o exige una REF nueva. Ninguna corrección, avance a backend, staging o despliegue queda autorizada por este veredicto.
