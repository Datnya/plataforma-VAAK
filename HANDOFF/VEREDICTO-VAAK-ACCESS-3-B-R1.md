---
artifact_type: VEREDICTO
phase: "3"
ref: "VAAK-ACCESS-3-B"
from: reviewer_auditor
to: architect_chief
status: changes_requested
blocking: true
created_at: "2026-08-31"
review_stage: order
result: CAMBIOS_SOLICITADOS
---

# VEREDICTO R1 — Corrección cerrada de accesos granulares en localhost

## RESULTADO

**CAMBIOS SOLICITADOS**

La ORDEN 3-B corrige de forma sustancial la dirección de `H-E01` a `H-E07`: exige desmontar la cadena de wrappers en vez de cubrirla, reautorizar `open` y `commit` sobre snapshots frescos, versionar la migración y las relaciones, resolver Supplier/Spec/Order por IDs, unificar Client–PO, fallar cerrado en recovery y producir evidencia identificable `C01`…`C39`. El alcance permanece local, sin backend, red, dependencias, staging ni despliegue.

No obstante, la ORDEN no es todavía ejecutable de forma inequívoca. Conserva una contradicción de facultades de Worker, deja abierta una mutación transversal de Supplier compartido y exige capturas persistentes fuera de una lista de archivos que prohíbe crearlas. Estos puntos afectan criterios mecánicos y no pueden quedar a decisión del Ejecutor.

## Evidencia independiente contrastada

Se leyeron completos `PROJECT-BRAIN.md`, `PROJECT-STATE.md`, los cinco documentos base de `HANDOFF/`, `ORDEN-VAAK-ACCESS-3-A.md`, `VEREDICTO-VAAK-ACCESS-3-A-ENTREGA.md` y `ORDEN-VAAK-ACCESS-3-B.md`. También se contrastaron `prototype/app.js`, `prototype/access-control.js` y las pruebas actuales.

La línea base verificable confirma la necesidad del refactor ordenado:

```text
prototype/app.js: 1 definición + 12 reasignaciones de action (13 capas)
prototype/app.js: 1 definición + 4 reasignaciones de render (5 capas)
prototype/app.js: 30 llamadas a open() además de su declaración
prototype/access-control.test.js: 21 aserciones

node --check prototype/access-control.js  -> exit 0
node --check prototype/app.js             -> exit 0
node --check prototype/presentation.js    -> exit 0
node prototype/access-control.test.js     -> access-control: all assertions passed; exit 0
```

Los comandos verdes sólo validan la línea base actual; no subsanan los bypasses y fallos cerrados ya demostrados en la entrega 3-A.

## Hallazgos bloqueantes

### H-R1-01 — C06 contradice el límite Admin-only para proyectos — CRÍTICA

`C06` ordena que Worker “sólo lista, abre y muta proyectos asignados”. Esto concede literalmente mutación de proyectos asignados. En cambio:

- §4 conserva `project` como ruta de consulta para Admin/Worker con membresía;
- §5.3 mantiene las mutaciones de proyecto dentro de Admin-only;
- `C12` exige denegar a Worker/Client proyectos, datos generales, banners y equipo del cliente antes de `open` y `commit`;
- el resultado §2 sólo autoriza a Worker a operar Supplier, Spec y Order dentro de proyectos asignados;
- el criterio 6 original de 3-A exigía impedir listar, abrir o mutar un proyecto **no asignado**, pero no otorgaba mutación del proyecto asignado.

Corrección requerida: reescribir `C06` para permitir a Worker únicamente listar y abrir proyectos asignados. Debe declarar expresamente que la mutación del objeto Project y sus datos Admin-only continúa denegada; las mutaciones operativas de Supplier/Spec/Order dentro del proyecto quedan en `C13`. Ajustar cualquier matriz/evidencia que reproduzca la concesión contradictoria.

### H-R1-02 — Supplier compartido permite efecto fuera del scope Worker — CRÍTICA

§5.4 permite a Worker listar, editar y habilitar un Supplier cuando **al menos un** vínculo apunta a un proyecto asignado. El modelo conserva un único objeto Supplier global que puede tener varios `supplierProjectLinks`. Si `sp1` está vinculado a `p1` y `p2`, un Worker asignado sólo a `p1` podría editar nombre, contacto o estado global de `sp1`, alterando también el recurso usado por `p2` no asignado.

Esto impide demostrar de forma cerrada `C07`, `C08`, `C13` y `C29`: el target sería visible por un vínculo permitido, pero el efecto de la mutación cruzaría proyectos.

Corrección requerida: fijar el predicado para Suppliers multi-proyecto. Como mínimo, lectura/listado puede usar existencia de un vínculo asignado, pero una mutación global debe denegarse si existe cualquier vínculo vivo a un proyecto no asignado; Admin conserva la operación. Alternativamente, la ORDEN puede limitar la mutación Worker a atributos o relaciones inequívocamente project-scoped, sin introducir una capacidad de producto nueva. Añadir fixtures positivo, ajeno y compartido a `C07/C08/C13` y a la matriz de `open/commit`.

### H-R1-03 — La evidencia visual exigida no tiene destino de persistencia autorizado — ALTA

§10 exige capturas representativas en ambos idiomas. §7 permite una lista cerrada de archivos y luego prohíbe modificar o crear archivos fuera de ella, salvo HALLAZGO y autorización posterior. No existe ruta autorizada para PNG/JPEG ni se define que las capturas puedan quedar embebidas en la ENTREGA. El Ejecutor no puede satisfacer literalmente ambas reglas.

Corrección requerida: autorizar una ruta de evidencia no-producto, por ejemplo `HANDOFF/evidence/VAAK-ACCESS-3-B/`, con inventario y hashes, o indicar expresamente un mecanismo de incrustación persistente dentro de `HANDOFF/ENTREGA-VAAK-ACCESS-3-B.md`. Las capturas siguen siendo evidencia complementaria: no sustituyen las pruebas mecánicas de `C01`…`C39`.

### H-R1-04 — C04 no distingue rutas de catálogo de la ruta derivada `project` — ALTA

`C04` afirma que Admin abre “todas las rutas conocidas” sin grants persistidos, mientras `C05`, §5.2 y §5.3 exigen que `project` tenga un proyecto existente y recurso resoluble. Si `project` forma parte de “todas”, `C04` puede interpretarse como permitirla sin `projectId`, contradiciendo el fallo cerrado de `C02/C05/C10`.

Corrección requerida: precisar que Admin abre todas las rutas del catálogo sin grants persistidos y abre `project` únicamente con un `projectId` existente. `project` sin ID, inexistente o colgante debe denegarse también para Admin.

## Contraste de H-E01 a H-E07

| Brecha previa | Juicio sobre la ORDEN 3-B |
|---|---|
| `H-E01` | Dirección conforme: desmantela wrappers, prohíbe handlers directos y reingresa submit/async por un dispatcher único. |
| `H-E02` | Parcial: Order y Spec quedan canónicos; Supplier multi-proyecto mantiene una mutación transversal no resuelta (`H-R1-02`). |
| `H-E03` | Conforme en diseño: versiones separadas, presencia de propiedad, cuarentena, vacíos intencionales e idempotencia transaccional. |
| `H-E04` | Conforme en diseño: predicado Client–PO único, modalidad separada y seed A/B negativo. |
| `H-E05` | Conforme en diseño: validador global, precedencia de recovery, relectura/rebind y reset de dos pasos sin reseed silencioso. |
| `H-E06` | Conforme en diseño: revisión monotónica, confirmaciones separadas de rol/Tools y catálogo ES/EN probado. |
| `H-E07` | Parcial: la matriz C01–C39 y evidencia son exhaustivas, pero `C04/C06` son ambiguo/contradictorio y las capturas carecen de destino permitido. |

## Auditoría de C01–C39

- **Aptos sin cambio material:** `C01–C03`, `C05`, `C07`, `C09–C12`, `C14–C36` y `C39`, sujetos a la implementación y evidencia posterior.
- **Requieren precisión textual:** `C04` por la ruta derivada `project`; `C06` por la contradicción de mutación de Project.
- **Requieren fixture/predicado adicional:** `C08` y `C13` para Supplier compartido; `C29` debe comprobar que ese mismo scope gobierna listado, acción y commit.
- **Requieren habilitar evidencia persistente:** `C37–C38` y §10 para conservar el recorrido/capturas sin violar §7. El límite de marca/backend/deploy de `C38` es correcto.

La suite exigida debe mantener exactamente los 39 casos principales. Las correcciones anteriores se incorporan como subpruebas o fixtures dentro de los criterios existentes; no amplían producto ni requieren crear un criterio 40.

## Aspectos conformes que deben conservarse

- Prohibición expresa de una capa adicional de `action` o `render`.
- Dispatcher único con fase `open/commit`, IDs canónicos y relectura de STORE/SESSION.
- Escritura sobre clon, validación hipotética y persistencia única seguida de relectura.
- Migración por shapes conocidos, sin defaults por corrupción ni bootstrap por arrays vacíos.
- `projectId` canónico para Spec/Order y relaciones Supplier por IDs.
- Client–PO basado en identidad, empresa, proyecto y autorización singular; `visible` no autoriza.
- Recovery exclusivo sin promoción, reset bilingüe de dos pasos y SESSION única documentada.
- Confirmación revisionada e invalidable, cambio de rol separado y semántica Tools `disabled/none`.
- Catálogo ES/EN estructurado y reconciliación documental sin sobredeclarar seguridad.
- Alcance localhost sin backend, Supabase, Vercel, cPanel, red, dependencias, deploy, producción ni activos de marca.

## Cierre

La REF `VAAK-ACCESS-3-B` permanece bloqueada. La autorización humana previa para ejecutar en localhost está reconocida en la ORDEN, pero sólo se vuelve operativa después de un VEREDICTO `APROBADO`; este resultado no autoriza implementación.

El Arquitecto debe revisar únicamente `H-R1-01` a `H-R1-04`, conservar la misma REF y devolver la ORDEN corregida al Auditor. No se solicita rediseñar los apartados ya conformes.
