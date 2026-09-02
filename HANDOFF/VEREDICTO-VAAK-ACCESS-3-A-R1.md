---
artifact_type: VEREDICTO
phase: "3"
ref: "VAAK-ACCESS-3-A"
from: reviewer_auditor
to: architect_chief
status: changes_requested
blocking: true
created_at: "2026-08-31"
---

# VEREDICTO — Accesos granulares administrados por Admin

## RESULTADO

**CAMBIOS SOLICITADOS**

La propuesta establece correctamente el catálogo de ocho secciones, los estados `enabled`/`disabled`/`none`, la dependencia de Tools, los accesos implícitos de Admin, la migración versionada y la advertencia de que `localStorage` no proporciona seguridad real.

No obstante, aún existen brechas bloqueantes entre permiso de sección, alcance de datos y autorización de acciones. En particular, la propuesta permitiría interpretar `section.dashboard` como acceso a `project`, no define una autorización individual verificable para órdenes Client y conserva reglas actuales que permiten a Worker mutaciones de proyecto no aprobadas.

## Evidencia independiente verificada

- `prototype/app.js` asigna directamente `route` desde `data-route` y `data-project`.
- `render()` y `action()` están envueltos y redefinidos varias veces, por lo que un guard parcial puede ser eludido por capas anteriores o llamadas internas.
- La vista Client de `home` usa el indicador global `order.visible`, mientras `purchaseOrderHistoryPage()` enumera todas las órdenes.
- `details()` expone información completa del proyecto y varias mutaciones cuando el rol no es Client.
- Worker puede alcanzar actualmente edición de datos generales, banners, equipo del cliente y otras acciones que los contratos aprobados no le conceden.
- `presentation.js` traduce principalmente mediante sustitución textual y `MutationObserver`; el catálogo nuevo necesita etiquetas bilingües estructuradas.
- La sesión y todos los datos operativos permanecen en `vaak-session-v6` y `vaak-preview-v6`.

## Cambios puntuales obligatorios

### H-01 — Separar permiso de sección, ruta y alcance de recursos

Corregir la regla por la que `project` hereda únicamente `section.dashboard`.

- `project` debe requerir Dashboard efectivo, rol Admin o Worker y asociación del usuario con el proyecto.
- Client debe ser rechazado en `project` incluso con Dashboard habilitado.
- Un grant de Suppliers, Specs u Orders no debe conceder acceso global a recursos: Worker permanece limitado a proyectos asignados.
- Definir un vínculo local verificable de proyectos por usuario. Si un recurso carece de vínculo suficiente, la decisión debe fallar cerrada.
- Añadir pruebas negativas para Client intentando abrir `project` y Worker intentando consultar o mutar un proyecto no asignado.

### H-02 — Crear una política exhaustiva de acciones con denegación por defecto

La lista “como mínimo” de §6.2 no cubre todas las acciones mutantes existentes.

- Inventariar todos los valores actuales de `data-action`.
- Incorporar en la fuente pura una política que reciba actor, acción, objetivo y recurso.
- Toda acción desconocida o sin política explícita debe denegarse.
- Hacer pasar por el mismo dispatcher tanto los eventos DOM como las llamadas internas a `action()`.
- Mantener Admin-only para usuarios, roles, cuentas y accesos.
- Restringir a Admin las mutaciones de datos generales del proyecto, áreas/contactos pendientes de aprobación, banners y equipo del cliente.
- Worker sólo puede cambiar el estado de su propia tarea y operar Suppliers, Specs y POs dentro de proyectos asignados.
- Añadir pruebas por acción y por intento de invocación DOM manipulada.

### H-03 — Definir autorización individual de Purchase Orders para Client

`visible: true` es un indicador global y no demuestra autorización para un Client concreto.

- Definir una relación explícita entre usuario Client, empresa/proyecto vinculado y PO autorizada.
- Utilizar un único predicado para Dashboard Client, historial, preview y descarga.
- Resolver nuevamente la autorización al recibir un ID de orden; no basta con filtrar botones o listados.
- Client nunca puede crear, editar, emitir ni eliminar órdenes.
- Añadir al menos dos Clients y órdenes con autorizaciones diferentes para demostrar aislamiento negativo entre usuarios, proyectos y empresas.

### H-04 — Separar migración compatible de selección para usuarios nuevos

Los defaults amplios son razonables para conservar la navegación de usuarios existentes, pero no deben convertirse en una concesión silenciosa durante el alta.

- Mantener los defaults de compatibilidad únicamente para la migración de cuentas existentes.
- En un usuario nuevo, exigir que Admin revise y confirme expresamente todos los accesos asignables antes de guardar. Puede mostrarse un preset, pero no considerarse selección resuelta sin confirmación.
- Al cambiar de rol, exigir confirmación y una nueva revisión de accesos del rol destino.
- Los grants prohibidos deben retirarse o permanecer inefectivos de manera determinista.
- Convertir el criterio 7 en una comprobación mecánica de esta confirmación explícita.

### H-05 — Precisar último Admin, estado manipulado y revocación de sesión

La afirmación “no puede existir estado persistente sin un Admin activo” no puede garantizarse frente a manipulación directa de `localStorage`.

- Reformular el invariante: ninguna mutación autorizada por la aplicación puede escribir un estado sin Admin activo.
- Validar el estado hipotético antes de deshabilitar, degradar o modificar un Admin, incluyendo autosuspensión y último Admin.
- Ante almacenamiento manipulado sin Admin activo, fallar cerrado y ofrecer recuperación/reset de demo; no promover automáticamente otro usuario.
- En eventos `storage`, volver a leer STORE y SESSION, reenlazar el objeto `user` y reevaluar cuenta, ruta y permisos.
- Si la cuenta fue eliminada o deshabilitada, retirar la sesión y mostrar login.
- Si se revoca el acceso de una cuenta activa, expulsarla inmediatamente de la ruta afectada y denegar acciones posteriores.
- Documentar que una sola clave SESSION compartida limita la simulación de sesiones independientes entre pestañas.

### H-06 — Completar criterios y evidencia reproducible

Ampliar las pruebas puras para cubrir:

- catálogo y ceilings por rol;
- rutas conocidas, desconocidas y derivadas;
- política exhaustiva de acciones;
- dependencia Tools en `enabled`, `disabled` y `none`;
- último Admin y autosuspensión;
- migración ausente, repetida, malformada y ya versionada;
- conservación exacta de proyectos, órdenes, specs, proveedores, tareas e idioma;
- autorización individual de órdenes Client;
- cambio de rol y no reposición de defaults;
- decisión de sesión ante cuenta deshabilitada o grant revocado.

Añadir una comprobación de completitud ES/EN para cada etiqueta y mensaje del nuevo catálogo. La interfaz de accesos no debe depender del reemplazo textual de `presentation.js`, aunque esa capa pueda seguir traduciendo contenido heredado.

## Aspectos conformes que deben conservarse

- Catálogo de ocho secciones con IDs estables.
- `section.users` prohibido para Worker y Client.
- Acceso Admin implícito y no editable granularmente.
- Estados diferenciados `enabled`, `disabled` y `none`.
- Dependencia de Tools y conservación de hijos al deshabilitar el contenedor.
- Retiro confirmado de Tools y sus hijos asignables.
- Pantalla bilingüe para cuentas sin rutas efectivas.
- Migración versionada, idempotente y con fallo cerrado.
- Traza local expresamente declarada manipulable.
- Limitación explícita: roles, sesiones, grants y auditoría en `localStorage` sólo simulan autorización.
- Prohibición de tocar backend, Supabase, Vercel, cPanel, despliegue, producción o marca.

## Cierre

La REF permanece bloqueada para implementación. El Arquitecto debe corregir únicamente H-01 a H-06, conservar `VAAK-ACCESS-3-A` y devolver la ORDEN revisada para nueva auditoría independiente.
