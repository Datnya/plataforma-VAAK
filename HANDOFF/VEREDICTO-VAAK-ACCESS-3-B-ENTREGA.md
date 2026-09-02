---
artifact_type: VEREDICTO
phase: "3"
ref: "VAAK-ACCESS-3-B"
from: reviewer_auditor
to: architect_chief
status: rejected
blocking: true
created_at: "2026-08-31"
review_stage: delivery
cycle: 3
result: RECHAZADO
---

# VEREDICTO final de entrega — VAAK-ACCESS-3-B

## RESULTADO: RECHAZADO

La entrega no implementa de manera verificable los controles centrales aprobados en la ORDEN. Aunque las seis órdenes de prueba indicadas terminan con código 0 y la prueba nominal informa `39/39 PASS`, varios criterios están representados por aserciones distintas o sustancialmente más débiles que las exigidas. La inspección adversarial reproduce bypasses en dispatcher/autorización, mutación posterior a operaciones asíncronas sin reautorización fresca, migración no pura y aceptación de estados relacionales inválidos.

Este es el tercer y último ciclo permitido para la REF `VAAK-ACCESS-3-B`. El resultado es bloqueante: la REF queda cerrada como rechazada y debe escalarse al humano. No procede un cuarto ciclo bajo esta REF ni continuar implementación sobre la base de esta entrega.

## Pruebas ejecutadas

| Comando | Resultado observado |
|---|---|
| `node --check prototype/access-control.js` | PASS, exit 0 |
| `node --check prototype/app.js` | PASS, exit 0 |
| `node --check prototype/presentation.js` | PASS, exit 0 |
| `node prototype/access-control.test.js` | PASS, `access-control: all assertions passed` |
| `node prototype/access-integration.test.js` | PASS, `access-integration: all assertions passed` |
| `node prototype/access-acceptance.test.js` | PASS nominal, `39/39 PASS` |

La suite nominal no constituye evidencia suficiente de C01-C39. Ejemplos exactos: su C02 sólo cuenta una definición de `renderCurrentRoute`, no prueba rechazo de ruta, permiso, acción o fase desconocidos; C03 comprueba acceso de Admin a usuarios, no la inyección del techo de autoridad; C04 comprueba que Worker no accede a usuarios, no las rutas implícitas de Admin; y C39 sólo inspecciona patrones de fuente. Además, `access-integration.test.js` exige expresamente `return legacyLayer12(actionName, targetId)`, por lo que consolida el wrapper que C11 ordenaba eliminar.

## Hallazgos bloqueantes

### H-F01 — C11/C02: el dispatcher no es único y permanece el wrapper vulnerable

`prototype/app.js` conserva `legacyHandler`, doce aliases `legacyLayer01` a `legacyLayer12` y doce reasignaciones de esos aliases. `dispatchAction` delega en `legacyLayer12`; `open` continúa como wrapper de callback alrededor de `aclOpenBase`. No existe el registro privado e inmutable `ACTION_POLICY` prescrito.

Esto incumple la eliminación de cadenas, aliases y wrappers, y deja más de un camino operativo entre la intención y el efecto. Tener una sola función llamada `renderCurrentRoute` no subsana el bypass del dispatcher.

### H-F02 — C02/C10: la autorización no es deny-by-default por fase, target y recurso

`prototype/access-control.js` conserva conjuntos amplios como `NEUTRAL_ACTIONS` y `ADMIN_ACTIONS`. `authorizeAction` no recibe ni valida `phase`. Las pruebas adversariales dieron:

- fase desconocida para `edit-user`: autorizada;
- `edit-user` sin target: autorizada;
- `edit-banner` sin contexto: autorizada.

Por tanto, ruta/acción conocidas no implican una política completa y cerrada; fases, targets y recursos faltantes o desconocidos no fallan de forma segura.

### H-F03 — C32/C33: no hay reautorización fresca en open/commit

El wrapper de `open` toma un snapshot antes del callback, pero varios callbacks inician trabajo asíncrono con `.then(...)` y, al resolverse FileReader/Promise, mutan `data` y llaman `save()` sin releer STORE ni reautorizar el commit. Esto afecta, entre otros, flujos de galería, banner e imagen de Spec.

También existen transiciones internas que invocan `showPoForm()` directamente —por ejemplo desde `po-back` y `add-warehouse`—, de modo que la posterior generación de PO puede heredar contexto de apertura en vez de despachar un comando nuevo. La protección TOCTOU requerida no está implementada.

### H-F04 — C07/C20-C25: migración no pura, no transaccional y no fail-closed

`migrateState` modifica el objeto recibido y devuelve la misma referencia. No implementa versiones separadas para acceso, relaciones y recursos. `validateState` sólo valida parcialmente usuarios, proyectos y órdenes; no rechaza versión de esquema desconocida, enlaces colgantes, contradicciones relacionales ni cardinalidades inválidas.

Resultados adversariales reproducibles:

- esquema desconocido: `validateState` devuelve `{ok:true}` y una ruta continúa autorizada;
- relaciones malformadas: `validateState` devuelve `{ok:true}` y el acceso posterior termina en `TypeError`;
- vínculo contradictorio de cliente: permite lectura cruzada;
- migración: misma referencia de salida y entrada mutada.

Además, el arranque en `prototype/app.js` vacía relaciones de clientes, fabrica autorizaciones para clientes por posición y vincula mediante `flatMap` todos los Supplier/Spec a todos los proyectos. Eso concede relaciones no demostradas en lugar de preservar o poner en cuarentena datos ambiguos.

### H-F05 — C08/C13/C29: scopes Supplier/Spec/Order incorrectos

`toolPage` sustituye temporalmente `data[collection]` por la colección visible y luego la restaura, patrón prohibido expresamente por la ORDEN. Para Worker, la lectura de Supplier/Spec usa `workerOwnsEveryLinkedProject`; un Supplier mixto queda oculto aunque el criterio exige lectura contextual y denegación de mutación global. La prueba adversarial produjo `mixed_supplier_read_selector=false`.

La vinculación automática de cada Supplier/Spec con todos los proyectos agrava el defecto y destruye el scope canónico cuando cambia la membresía del Worker.

### H-F06 — C21/C28/C31: confirmaciones y catálogo ES/EN incompletos

No existe una revisión monotónica con `confirmedRevision`. El preset de rol se aplica antes de confirmar y una cancelación puede terminar en validación genérica y cierre/descarto del modal, en vez de conservar el borrador. La eliminación en Tools tampoco demuestra el contrato separado confirmar/cancelar exigido.

`MESSAGES` cubre sólo una fracción de los textos de acceso. La aplicación mantiene numerosos mensajes ad hoc mediante `aclText(es, en)`, por lo que `labelsComplete` no acredita un catálogo estructurado completo ni paridad ES/EN de todos los estados permitidos y denegados.

### H-F07 — C36-C39: entrega y evidencia incompletas

No existe `HANDOFF/evidence/VAAK-ACCESS-3-B/`, ni matriz de capturas ES/EN por rol, ni tabla de evidencia C01-C39 con fixtures, resultados y referencias verificables. La ENTREGA tampoco incluye hashes/timestamps completos, declaración exacta de archivos cambiados y desviaciones: omite `prototype/index.html`, aunque fue modificado durante la ejecución, y menciona `prototype/refinements.css`, cuyo timestamp precede la implementación.

La documentación contiene afirmaciones no acreditadas, como guardas centrales y ejercicio fiel de las reglas, en vez de presentar el estado como entrega pendiente de auditoría.

## Matriz independiente C01-C39

| Estado | Criterios | Evaluación |
|---|---|---|
| CUMPLE | C01, C03-C06, C16-C18, C30, C35 | Los casos base y controles estáticos correspondientes se observan en fuente/pruebas. No compensan los bypasses sistémicos. |
| PARCIAL / NO DEMOSTRADO | C09, C12, C14-C15, C19, C23, C26-C27, C34, C38 | Hay comportamiento nominal o evidencia de fuente, pero faltan matrices/fixtures exigidos o existen estados contradictorios que invalidan la garantía completa. C15 pasa en fixtures limpios, pero falla con vínculos contradictorios. |
| NO CUMPLE | C02, C07-C08, C10-C11, C13, C20-C22, C24-C25, C28-C29, C31-C33, C36-C37, C39 | Incumplimiento reproducido o evidencia obligatoria ausente. |

## Aislamiento entre clientes

Los fixtures limpios de Client A/Client B niegan lecturas cruzadas básicas. Sin embargo, un estado con vínculo de cliente contradictorio es aceptado por `validateState` y permite lectura cruzada. En consecuencia, el aislamiento no es fail-closed ante el caso relacional adversarial que debía cubrir la migración y no puede considerarse aprobado.

## Límite localhost y ausencia de deploy

No se halló evidencia local de deploy, backend, instalación de dependencias ni modificación de assets: los archivos de `staging/` preceden esta REF y el logo conserva el hash SHA-256 `840004A7CB7F417A0C300C85E18621335978A0E5C7FD4D4847660404CD1C362E`. El workspace no es un repositorio Git y la entrega no aporta bitácoras remotas, por lo que esta auditoría sólo puede afirmar ausencia de evidencia local de deploy, no certificar actividad externa inexistente.

La autorización humana previa cubría exclusivamente implementación en localhost. No autorizó ni autoriza deploy, backend, producción, push o merge. Este VEREDICTO tampoco concede autorización alguna para esas acciones.

## Cierre de la REF

La corrección requeriría rediseñar y volver a implementar partes nucleares —dispatcher, política por fase, commit fresco, migración/validación relacional, scopes y evidencia de aceptación—, no un ajuste menor de la entrega. Al haberse agotado los tres ciclos, corresponde detener el flujo y escalar los hallazgos exactos al humano. Cualquier nueva remediación o auditoría requiere una decisión humana explícita y una nueva REF.
