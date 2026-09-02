---
artifact_type: ORDEN
phase: "3"
ref: "VAAK-ACCESS-3-A"
from: architect_chief
to: reviewer_auditor
status: revised_for_review
blocking: true
created_at: "2026-08-31"
---

# ORDEN — Accesos granulares administrados por Admin

> Revisión 2 limitada a los hallazgos H-01…H-06 de `HANDOFF/VEREDICTO-VAAK-ACCESS-3-A-R1.md`. Se conservan la misma REF, el alcance local y todos los aspectos declarados conformes por el Auditor.

## 1. Tarea

Diseñar e implementar, exclusivamente en el prototipo local, un modelo de accesos granulares por usuario con estas reglas:

- Sólo un usuario con rol `Admin` puede agregar, retirar, habilitar o deshabilitar accesos de usuarios `Worker` y `Client`.
- La creación de usuarios debe incluir selección explícita de accesos.
- La edición de usuarios existentes debe permitir consultar y modificar esos accesos.
- El catálogo debe cubrir `Dashboard`, `Tools`, `Team`, `User Management`, `Supplier Management`, `Purchase Order History`, `Specs Library`, `Settings` y las rutas derivadas existentes.
- La visibilidad de navegación, las rutas y las acciones deben depender de una única fuente de autorización local.
- El logo, backend, staging, despliegue, producción e infraestructura quedan fuera del alcance.

Esta ORDEN no aprueba su propia implementación. Requiere VEREDICTO `APROBADO` del `reviewer_auditor` y autorización humana explícita antes de editar archivos.

## 2. Estado verificable y conflicto de alcance

Evidencia observada:

- `prototype/app.js` usa `vaak-preview-v6` y `vaak-session-v6` en `localStorage`.
- Los usuarios existentes tienen `role` y `active`, pero no un modelo de permisos.
- La navegación se oculta principalmente mediante condiciones por rol.
- `render()` acepta rutas internas sin un guard central.
- El manejador de navegación asigna directamente `route=t.dataset.route`.
- `project` expone datos y mutaciones sin una relación local verificable entre usuario y proyecto; Client debe quedar excluido de esa ruta.
- Los recursos Suppliers, Specs y Orders no tienen una política uniforme de alcance por proyecto para Worker.
- Los eventos DOM y llamadas internas atraviesan distintas redefiniciones de `action()`, por lo que la autorización debe preceder a cualquier handler y denegar acciones desconocidas.
- La autorización Client de órdenes usa actualmente `visible`, un indicador global que no identifica al Client autorizado.
- Gestión de usuarios permite crear, editar, cambiar rol y deshabilitar cuentas.
- Existen las rutas internas `home`, `project`, `tools`, `team`, `users`, `suppliers`, `orders`, `specs` y `settings`.
- `prototype/presentation.js` aplica la preferencia individual Español/English mediante sustitución de textos y `MutationObserver`.

`PROJECT-STATE.md` §6O registra una capa posterior de staging con Vercel/Supabase, mientras el pedido humano acota esta REF a prototipo estático, sesión y `localStorage`, sin backend ni deploy. La interpretación operativa obligatoria es:

1. Esta ORDEN sólo puede modificar el prototipo local.
2. No se debe negar ni borrar el estado histórico de staging.
3. No se debe tocar ni sincronizar Vercel, Supabase, cPanel, GitHub remoto o producción.
4. Llevar este modelo a staging o backend requerirá otra REF de seguridad y datos.

## 3. Arquitectura propuesta

### 3.1 Fuente única de accesos

Crear un módulo local y puro, sin dependencias, que sea la única fuente para:

- catálogo de secciones;
- límites por rol;
- defaults;
- normalización y migración;
- cálculo de acceso efectivo;
- dependencias entre rutas;
- validación de transiciones;
- protección de invariantes Admin;
- pertenencia verificable de usuarios y recursos a proyectos;
- autorización individual Client–Purchase Order;
- política exhaustiva de rutas y acciones con denegación por defecto;
- catálogo estructurado de textos ES/EN para toda la interfaz nueva.

Archivo propuesto:

- `prototype/access-control.js`

Debe ser utilizable por el navegador y por pruebas Node sin duplicar la lógica.

`prototype/app.js` consumirá ese módulo. No deberá mantener matrices paralelas por rol para navegación, rutas o tarjetas de herramientas.

### 3.2 Persistencia

Cada usuario no Admin tendrá una estructura versionada:

```js
access: {
  version: 1,
  grants: {
    "section.dashboard": "enabled",
    "section.tools": "enabled",
    "section.suppliers": "disabled"
  }
}
```

Semántica:

- Clave ausente: acceso retirado, estado `none`.
- `enabled`: acceso agregado y habilitado.
- `disabled`: asignación conservada, pero acceso efectivo denegado.
- `user.active === false`: deniega todos los accesos y la sesión, sin alterar los grants guardados.
- Un valor desconocido o malformado debe normalizarse a `none`, nunca conceder acceso.
- Los accesos Admin son implícitos; no dependen de `grants`.

Registrar además una traza local de demostración, por ejemplo `data.accessEvents`, con actor, usuario objetivo, permiso, estado anterior, estado nuevo y fecha. Esta traza es manipulable y no constituye auditoría segura.

El STORE debe incorporar relaciones locales separadas de los objetos operativos para no convertir nombres visibles o `visible: true` en autorización:

```js
projectMemberships: [
  { userId: "worker", projectId: "p1" }
],
projectCompanies: [
  { projectId: "p1", companyId: "company-1" }
],
clientLinks: [
  { clientId: "client", companyId: "company-1", projectIds: ["p1"] }
],
clientOrderAuthorizations: [
  { clientId: "client", orderId: "o1", companyId: "company-1", projectId: "p1" }
]
```

Las relaciones deben usar IDs estables, no nombres de proyecto, empresa, usuario o proveedor. Un vínculo ausente, duplicado, contradictorio o referido a un recurso inexistente debe fallar cerrado.

### 3.3 Catálogo y límites por rol

| ID estable | Ruta | ES / EN | Admin | Worker | Client | Default migración Worker | Default migración Client |
|---|---|---|---|---|---|---|---|
| `section.dashboard` | `home` | Panel principal / Dashboard | Fijo | Asignable | Asignable | `enabled` | `enabled` |
| `section.tools` | `tools` | Herramientas / Tools | Fijo | Asignable | Asignable | `enabled` | `none` |
| `section.team` | `team` | Equipo / Team | Fijo | Asignable | Prohibido | `enabled` | `none` |
| `section.users` | `users` | Gestión de usuarios / User Management | Fijo | Prohibido | Prohibido | `none` | `none` |
| `section.suppliers` | `suppliers` | Gestión de proveedores / Supplier Management | Fijo | Asignable | Prohibido | `enabled` | `none` |
| `section.orders` | `orders` | Historial de órdenes / Purchase Order History | Fijo | Asignable | Asignable sólo lectura autorizada | `enabled` | `none` |
| `section.specs` | `specs` | Biblioteca de specs / Specs Library | Fijo | Asignable | Prohibido | `enabled` | `none` |
| `section.settings` | `settings` | Configuración / Settings | Fijo | Asignable, sólo preferencia propia | Asignable, sólo preferencia propia | `none` | `none` |

Rutas derivadas:

- `project` no es un permiso independiente: requiere `section.dashboard` efectivo, rol `Admin` o `Worker` y pertenencia del actor al proyecto solicitado. Admin puede acceder a todos los proyectos locales; Worker sólo a los IDs presentes en `projectMemberships`.
- Client debe ser rechazado siempre en `project`, incluso con Dashboard habilitado o con una relación Client–proyecto válida para documentos.
- Login y cierre de sesión no forman parte del catálogo.
- Tracking público permanece separado y no puede concederse mediante permisos de usuario.
- La vista Client incluida en `home` sigue limitada al portal Client.
- No se crean nuevas facultades de datos o proyectos.

Las entradas prohibidas deben aparecer en el editor para que el catálogo sea completo, pero bloqueadas y explicadas como “Sólo Admin” o “No disponible para este rol”. Una asignación manipulada que intente concederlas debe ser ignorada por el cálculo efectivo.

### 3.4 Dependencia de Tools

`section.tools` es el contenedor de `users`, `suppliers`, `orders`, `specs` y `settings`.

Reglas:

- Habilitar un hijo debe habilitar automáticamente `section.tools`.
- Deshabilitar `section.tools` conserva los estados hijos, pero hace que todos sean inefectivos.
- Retirar `section.tools` debe mostrar confirmación y retirar también sus hijos asignables.
- Una ruta hija requiere acceso efectivo tanto a `section.tools` como a su propio permiso.
- `section.users` sigue siendo Admin-only aunque exista un valor manipulado en `grants`.

### 3.5 Alcance de proyecto y recursos

El permiso de sección sólo habilita la entrada a una capacidad; nunca concede acceso global a sus datos.

- Admin conserva alcance local total dentro del prototipo.
- Worker sólo puede listar, consultar o mutar proyectos presentes en `projectMemberships` para su usuario.
- Cada Order debe resolver un `projectId` existente.
- Cada Spec debe resolver un `projectId` estable; el nombre visible no es autorización.
- Cada Supplier accesible a Worker debe tener una relación explícita con uno o más proyectos. Un proveedor sin relación sólo es visible para Admin.
- Los listados, contadores, búsquedas, previews, descargas y handlers por ID deben aplicar el mismo predicado de alcance que la ruta.
- Si un recurso no permite determinar inequívocamente su proyecto, Worker recibe denegación; no se infiere alcance por coincidencias de texto.
- La selección de proyectos asignados debe estar disponible para Admin en la creación y edición de Worker y debe confirmarse junto con los accesos.

Los defaults de migración pueden asignar al Worker existente todos los proyectos que actualmente veía para preservar compatibilidad. Un Worker nuevo no recibe proyectos hasta que Admin los seleccione y confirme expresamente.

### 3.6 Autorización individual de Purchase Orders para Client

La autorización Client debe depender de un único predicado puro, reutilizado por Dashboard Client, historial, preview y descarga. El predicado sólo permite una PO cuando se cumplen simultáneamente:

1. actor activo con rol Client;
2. `section.orders` efectivo cuando se usa la ruta Orders; el Dashboard Client puede mostrar sus documentos autorizados sin convertir la ruta `project` en accesible;
3. relación `clientLinks` entre Client, empresa y proyecto;
4. PO existente y vinculada al mismo proyecto;
5. relación individual `clientOrderAuthorizations` para ese `clientId` y `orderId` con empresa y proyecto coincidentes.

`visible` deja de ser autoridad y sólo puede conservarse como dato legado de presentación. Toda operación por ID debe volver a resolver el predicado; filtrar el listado u ocultar botones no basta.

El seed limpio y las pruebas deben contener al menos dos Clients ficticios, dos empresas/proyectos y órdenes con autorizaciones distintas. Client A no puede listar, previsualizar ni descargar la PO de Client B, y viceversa. Ningún Client puede crear, editar, emitir o eliminar POs.

### 3.7 Política exhaustiva de acciones

La fuente pura debe exponer una función equivalente a `authorizeAction({ actor, action, targetId, resource, state })`. Toda acción desconocida, sin política o con objetivo que no pueda resolverse se deniega.

El inventario inicial obligatorio comprende todos los valores observados de `data-action` y llamadas internas: `add-item`, `add-team-member`, `add-warehouse`, `advance-team-objective`, `advanced-team-filters`, `assign-team-objective`, `banner-next`, `banner-prev`, `close`, `delete-order`, `delete-team-objective`, `delete-viewed-image`, `download-order`, `edit-banner`, `edit-project-card`, `edit-supplier`, `edit-task`, `edit-team-objective`, `edit-user`, `eye`, `gallery`, `logout`, `new-order`, `new-project`, `new-spec`, `new-supplier`, `new-task`, `new-user`, `notifications`, `po-back`, `preview-order`, `preview-spec`, `remove-banner-image`, `remove-item`, `remove-team-member`, `set-banner-cover`, `task`, `toggle-supplier`, `toggle-user`, `view-image` y la llamada interna actual `action('edit-banner')`.

Toda acción nueva de edición de accesos, proyectos asignados o autorizaciones de PO debe añadirse explícitamente al registro y a sus pruebas antes de usarse. Eventos DOM y llamadas internas deben pasar por un único `dispatchAction`; ningún handler legado puede invocarse antes de autorizar.

## 4. Defaults compatibles, migración y altas nuevas

La migración compatible y la selección de accesos de un usuario nuevo son flujos distintos y no pueden compartir una señal de confirmación.

### 4.1 Migración de cuentas existentes

La migración debe ejecutarse una sola vez por usuario existente sin `access.version === 1`.

Defaults compatibles con la interfaz observada:

- Admin: acceso implícito total a todas las secciones.
- Worker existente: Dashboard, Tools, Team, Suppliers, Orders y Specs habilitados; para preservar su visibilidad previa puede recibir membresía inicial a todos los proyectos existentes.
- Client existente: Dashboard habilitado; los demás sin acceso. Cualquier documento Client requiere además las relaciones individuales definidas en §3.6.
- Settings no se habilita por defecto para Worker o Client porque actualmente no aparece en su navegación.
- `project` no se almacena como grant independiente.

Requisitos de migración:

1. No borrar proyectos, órdenes, specs, proveedores, tareas, imágenes, contraseñas de demo ni preferencias de idioma existentes.
2. No reponer defaults después de que un Admin haya modificado accesos.
3. Una recarga debe conservar `enabled`, `disabled` y `none`.
4. Los datos malformados deben fallar cerrados para Worker/Client.
5. La migración debe ser idempotente.
6. Si un usuario cambia de Worker a Client o viceversa, mostrar confirmación, cargar sólo como preset los defaults del rol destino y exigir revisión expresa antes de guardar; no reactivar silenciosamente grants incompatibles.
7. Al cambiar a Admin, los permisos pasan a ser implícitos. Si luego se revierte el rol, cargar como preset los defaults del rol destino y exigir nueva confirmación.
8. La migración no puede fabricar autorizaciones Client–PO a partir de `visible`, nombres o coincidencias de proyecto.
9. Proyectos, órdenes, specs, proveedores, tareas, imágenes y preferencias de idioma deben conservar sus registros y valores; las nuevas relaciones se almacenan separadamente.

### 4.2 Alta de usuarios y cambio de rol

Los presets del formulario sirven sólo como ayuda visual. No constituyen autorización ni selección resuelta.

- Worker y Client nuevos deben comenzar con `accessReviewed: false`.
- Admin debe revisar todas las entradas asignables, la selección de proyectos aplicable y cualquier vínculo Client antes de pulsar `Confirmar accesos / Confirm access`.
- El botón final de alta permanece deshabilitado hasta esa confirmación explícita.
- Cambiar un permiso, proyecto, vínculo o rol después de confirmar restablece `accessReviewed: false`.
- Cambiar de rol exige confirmación separada y una nueva revisión completa del catálogo permitido para el rol destino.
- Los grants prohibidos se eliminan del borrador o se normalizan de forma determinista a `none`; nunca sobreviven como efectivos.
- Para un Admin nuevo, el formulario muestra acceso total fijo y exige confirmar expresamente ese resumen antes de guardar.
- `accessReviewed` es estado transitorio del formulario o evidencia del evento de creación; no debe utilizarse como permiso en runtime.

## 5. Invariantes Admin

Son obligatorios y no dependen de ocultamiento visual:

1. Sólo `Admin` puede crear usuarios, cambiar roles, habilitar/deshabilitar cuentas y editar accesos.
2. Worker y Client no pueden recibir `section.users`.
3. Los accesos de una cuenta Admin no pueden editarse granularmente.
4. Admin siempre conserva acceso efectivo a todas las rutas internas.
5. El Admin autenticado no puede deshabilitarse ni degradarse a sí mismo.
6. No se puede deshabilitar ni degradar al último Admin activo.
7. Ninguna mutación autorizada por la aplicación puede escribir un estado resultante sin al menos un Admin activo. Esta garantía no se extiende a manipulación externa de `localStorage`.
8. Una acción manipulada desde el DOM debe volver a comprobar actor, objetivo y rol.
9. La cuenta deshabilitada pierde la sesión, aunque sus grants permanezcan guardados.
10. El cambio de permisos de otro usuario no debe modificar los permisos del Admin actor.
11. Antes de deshabilitar, degradar, eliminar o modificar un Admin se debe construir y validar el estado hipotético completo; si deja cero Admin activos, la escritura se rechaza.
12. Si al cargar STORE no existe un Admin activo por manipulación o corrupción, la aplicación falla cerrada: no promueve usuarios, no habilita rutas internas y ofrece únicamente recuperación/reset explícito de la demo.
13. El reset de recuperación debe advertir que elimina el estado local de la demo, requerir confirmación y restaurar el seed conocido con Admin activo.

## 6. Guards y ocultamiento UI

### 6.1 Guard de ruta

Toda transición debe pasar por una función única, por ejemplo `navigateTo(route)`.

El guard debe:

- comprobar sesión y `user.active`;
- rechazar rutas desconocidas;
- resolver permiso requerido mediante la tabla de rutas;
- comprobar límite por rol, estado del grant y dependencia de Tools;
- para `project`, comprobar rol Admin/Worker y pertenencia al `projectId`; Client se deniega incondicionalmente;
- filtrar Dashboard Worker y todo recurso operativo por los proyectos asignados;
- impedir que los wrappers actuales de `render()` eludan la decisión;
- redirigir a la primera ruta efectiva disponible;
- mostrar un mensaje localizado cuando el acceso fue denegado;
- mostrar una pantalla “Sin accesos habilitados / No enabled access” con cierre de sesión si no hay rutas efectivas.

No debe quedar ninguna asignación directa de `route`, `selected` o recurso objetivo desde eventos sin pasar por el guard correspondiente. Una ruta autorizada no autoriza por sí sola el recurso solicitado.

### 6.2 Guard de acciones

El ocultamiento de botones no es suficiente. Todas las acciones del inventario §3.7 deben mapearse explícitamente a permiso, rol, modalidad, objetivo y alcance de recurso. La ausencia de una regla produce denegación.

Reglas obligatorias:

- `new-user`, `edit-user`, `toggle-user` y cambios de acceso: Admin-only.
- Creación de proyecto, datos generales, áreas/contactos pendientes de aprobación, banners, imágenes y equipo del cliente: Admin-only.
- Acciones de proveedores: requieren `section.suppliers`; Worker sólo sobre proveedores vinculados a sus proyectos; Client prohibido.
- Acciones de specs: requieren `section.specs`; Worker sólo sobre specs de proyectos asignados; Client prohibido.
- Acciones de órdenes: requieren `section.orders`; Worker sólo en proyectos asignados; Client sólo puede preview/download de POs individualmente autorizadas y nunca crear, editar, emitir o eliminar.
- Acciones de Team: requieren `section.team`; Worker sólo actualiza su propio objetivo según las reglas vigentes.
- Settings sólo modifica la preferencia del usuario autenticado.
- Acciones derivadas de Project requieren `section.dashboard`, rol Admin/Worker y pertenencia al proyecto.
- Acciones neutrales de interfaz —por ejemplo `close`, `eye`, `logout` y navegación de un modal ya autorizado— también deben tener política explícita; no quedan implícitamente permitidas.
- Tanto clicks manipulados como llamadas internas usan `dispatchAction`; la función que ejecuta handlers no debe exportarse como bypass.

### 6.3 Relectura de STORE y SESSION

En cada evento `storage` relevante se debe:

1. volver a leer y parsear `STORE` desde `localStorage`;
2. volver a leer `SESSION` desde `localStorage`;
3. normalizar el estado con fallo cerrado;
4. reenlazar `user` al objeto actualizado dentro del STORE, sin conservar referencias antiguas;
5. reevaluar cuenta activa, rol, ruta, proyecto seleccionado, permisos y alcance del recurso;
6. retirar SESSION y mostrar login si la cuenta fue eliminada, deshabilitada o dejó de ser válida;
7. expulsar inmediatamente al usuario de una ruta/proyecto revocado y denegar cualquier acción posterior.

La misma revalidación debe ejecutarse antes de renderizar y despachar acciones sensibles. Documentar que una única clave `vaak-session-v6` compartida por origen limita la simulación: dos pestañas del mismo navegador no representan sesiones independientes y un cambio de SESSION afecta a ambas.

## 7. UX bilingüe de creación y edición

### 7.1 Nuevo usuario

El modal debe incluir:

- identidad y credenciales ficticias actuales;
- tipo de usuario;
- sección obligatoria `Accesos / Access`;
- catálogo completo agrupado en navegación y herramientas;
- estados `Habilitado / Enabled`, `Deshabilitado / Disabled`, `Sin acceso / No access`;
- explicación de que deshabilitar conserva la asignación;
- resumen antes de guardar;
- control explícito `Confirmar accesos / Confirm access`, separado del botón de creación;
- aviso de acceso total fijo si el rol seleccionado es Admin.

Cambiar el rol antes de guardar debe recalcular el preset, mostrar entradas prohibidas bloqueadas y restablecer la confirmación. El alta no puede completarse hasta que Admin confirme nuevamente accesos y alcance de proyecto.

### 7.2 Usuario existente

La gestión de usuarios debe ofrecer una acción visible `Editar accesos / Edit access` para Worker y Client. Puede integrarse en el modal de perfil, pero la separación entre datos personales, estado de cuenta y accesos debe ser inequívoca.

La tabla debe resumir, sin exponer claves internas:

- cantidad de accesos habilitados;
- cantidad deshabilitada;
- cuenta activa/inactiva.

Para Admin debe mostrar `Acceso total fijo / Fixed full access`.

Para Worker, la edición debe incluir sus proyectos asignados. Para Client, debe mostrar sus vínculos de empresa/proyecto y, cuando corresponda, las autorizaciones individuales de PO sin convertirlas en acceso a `project`.

### 7.3 Idioma

Todo texto nuevo debe existir en Español e English:

- títulos;
- etiquetas;
- estados;
- explicaciones;
- confirmaciones;
- errores;
- toasts;
- pantalla sin accesos;
- mensajes de ruta denegada.

Reutilizar la preferencia individual `vaak-language-<session>`. La semántica de estados no debe depender únicamente de sustituciones frágiles de texto: el catálogo debe conservar etiquetas explícitas por idioma.

Todas las claves nuevas deben tener valores no vacíos y distintos para `es` y `en` cuando lingüísticamente corresponda. Alta, edición, cambio de rol, confirmación, denegaciones, recuperación, pantalla sin acceso y autorizaciones Client–PO deben recorrerse completamente en ambos idiomas; `presentation.js` puede seguir atendiendo contenido heredado, pero no es la fuente de los textos de autorización.

## 8. Fases de ejecución

### Fase A — Contrato y modelo puro

- Crear catálogo, defaults, límites, normalización y funciones puras.
- Crear relaciones puras de proyecto, empresa y PO y el registro exhaustivo de acciones.
- Añadir pruebas sin dependencias.
- No conectar todavía la UI.
- Actualizar los contratos vivos de Admin, Worker y Client y la matriz funcional sin borrar decisiones históricas.

### Fase B — Persistencia y migración

- Incorporar `access.version`.
- Migrar usuarios existentes de forma idempotente.
- Incorporar membresías y autorizaciones locales separadas, con fallo cerrado.
- Registrar eventos locales de cambios de acceso.
- Verificar que la recarga no reponga defaults.

### Fase C — Guards

- Centralizar navegación.
- Aplicar guard final en `render()`.
- Sustituir entradas directas a `action()` por un dispatcher único de política deny-by-default.
- Revalidar STORE y SESSION en render, navegación, acciones y evento `storage`.

### Fase D — UX

- Añadir selector de accesos al alta.
- Añadir edición de accesos para Worker/Client.
- Añadir confirmación explícita separada, proyectos Worker y relaciones Client–PO.
- Ocultar navegación y tarjetas con la misma fuente efectiva.
- Añadir resumen, confirmaciones y estados bloqueados.

### Fase E — Idioma, regresión y evidencia

- Completar y probar todos los flujos nuevos en ES/EN.
- Ejecutar pruebas puras, sintaxis y matriz interactiva.
- Preparar ENTREGA para auditoría independiente.

No avanzar a una fase posterior si la anterior deja un HALLAZGO que cambie el catálogo, los límites por rol o los invariantes Admin.

## 9. Archivos probables

Código y documentación permitidos:

- `prototype/access-control.js` — nuevo modelo puro.
- `prototype/access-control.test.js` — pruebas Node sin dependencias.
- `prototype/app.js` — migración, guards, UI y acciones.
- `prototype/refinements.css` — editor de accesos y estados responsivos.
- `prototype/presentation.js` — textos bilingües complementarios.
- `prototype/index.html` — carga del módulo antes de `app.js` y cachebuster.
- `prototype/README.md` — limitación de seguridad, modelo local y claves reales de reset.
- `docs/roles/ADMIN.md`
- `docs/roles/WORKER.md`
- `docs/roles/CLIENT.md`
- `docs/functional/VAAK-ROLE-PERMISSIONS.md`
- `HANDOFF/ENTREGA-VAAK-ACCESS-3-A.md` — sólo después de ejecución autorizada.

No modificar:

- `LOGO VAAK.png` ni activos de marca;
- backend, Supabase, Vercel, cPanel o infraestructura;
- credenciales o datos reales;
- `PROJECT-BRAIN.md`;
- `PROJECT-STATE.md` antes del VEREDICTO correspondiente;
- ADR o decisiones de stack.

## 10. Riesgos

| Riesgo | Severidad | Tratamiento |
|---|---:|---|
| Confundir permisos locales con seguridad real | Crítica | Aviso visible en README, ENTREGA y VEREDICTO; nunca declarar autorización segura |
| Manipulación de `localStorage`, sesión o JavaScript | Crítica | Aceptada sólo como límite del prototipo; backend obligatorio para seguridad |
| Ruta oculta pero accesible por evento o estado interno | Alta | Guard central en navegación y render |
| Acción oculta pero invocable mediante DOM manipulado | Alta | Guard de acción independiente |
| Acción existente o nueva queda fuera de la política | Crítica | Inventario exhaustivo, deny-by-default y test de completitud |
| Worker consulta o muta un proyecto/recurso no asignado | Crítica | Membresías por ID, scope en listas y handlers, fallo cerrado |
| Exponer órdenes globales a Client | Crítica | Client sólo lectura y sólo registros autorizados/visibles; test negativo obligatorio |
| `visible` se interpreta como autorización Client | Crítica | Relación Client–empresa–proyecto–PO y predicado único por ID |
| Reponer defaults y borrar decisiones Admin | Alta | Migración versionada e idempotente |
| Dejar grants incompatibles después de cambiar rol | Alta | Confirmación y defaults del rol destino |
| Bloquear o degradar al último Admin | Alta | Invariante mecánico |
| Tools e hijos quedan inconsistentes | Media | Reglas de dependencia y pruebas |
| Textos mezclados ES/EN | Media | Catálogo bilingüe y recorrido visual en ambos idiomas |
| Wrappers acumulados de `render()` eluden el guard | Alta | Guard efectivo en la capa exterior y prueba de todas las rutas |
| Sesión abierta conserva acceso revocado | Alta | Revalidación y listener `storage` |
| STORE manipulado queda sin Admin activo | Alta | Estado de recuperación cerrado; nunca promover automáticamente |
| Preset de alta concede accesos sin revisión humana | Alta | Confirmación explícita invalidada por cada cambio |

## 11. Criterios mecánicos de aceptación

1. El catálogo contiene exactamente las ocho secciones indicadas, ceilings por rol y mapeos de todas las rutas conocidas.
2. Una ruta desconocida, un permiso desconocido y una combinación sin regla se deniegan.
3. Las entradas prohibidas para Worker/Client no producen acceso efectivo aunque se inyecten manualmente en `localStorage`.
4. Admin puede abrir todas las rutas sin grants persistidos.
5. `project` exige Dashboard, rol Admin/Worker y proyecto asignado; Client se deniega siempre.
6. Worker puede abrir un proyecto asignado y no puede listar, abrir ni mutar uno no asignado.
7. Suppliers, Specs y Orders sin vínculo de proyecto suficiente fallan cerrados para Worker.
8. Listados, métricas, preview, descarga y handlers por ID aplican el mismo scope de proyecto.
9. El registro de política contiene todas las acciones enumeradas en §3.7 y cada acción nueva de esta REF.
10. Toda acción desconocida o sin objetivo/recurso resoluble se deniega.
11. Un click DOM manipulado y una llamada interna atraviesan el mismo `dispatchAction` y producen la misma decisión.
12. Admin-only se cumple para usuarios, roles, cuentas, accesos, proyectos, datos generales, áreas/contactos no aprobados, banners y equipo del cliente.
13. Worker sólo cambia el estado de su propia tarea y opera Suppliers, Specs y POs de proyectos asignados.
14. Dos Clients ficticios con empresas/proyectos y POs diferentes sólo pueden listar su propia autorización individual.
15. Client A no puede previsualizar ni descargar por ID la PO de Client B, aunque manipule DOM, route o action.
16. Ningún Client puede abrir `project` ni crear, editar, emitir o eliminar POs.
17. Dashboard Client, Orders, preview y descarga usan el mismo predicado Client–empresa–proyecto–PO.
18. `visible: true` por sí solo nunca autoriza una PO.
19. Worker migrado conserva Dashboard, Tools, Team, Suppliers, Orders y Specs; Client migrado conserva únicamente Dashboard.
20. La migración ausente, repetida, malformada y ya versionada produce resultados deterministas, idempotentes y cerrados.
21. La migración conserva exactamente registros y valores preexistentes de proyectos, órdenes, specs, proveedores, tareas, imágenes y preferencias de idioma; sólo añade relaciones/versionado separados.
22. Los defaults de migración no vuelven a aplicarse después de una modificación Admin.
23. Un Worker o Client nuevo no puede guardarse hasta pulsar la confirmación explícita después de revisar todos los accesos y proyectos/vínculos aplicables.
24. El preset de alta no establece por sí mismo la confirmación; cualquier cambio posterior de rol, grant, proyecto o vínculo la invalida.
25. Cambiar de rol requiere confirmación y nueva revisión; grants prohibidos quedan `none` o inefectivos de forma determinista.
26. Editar un usuario permite pasar un acceso por `none → enabled → disabled → enabled → none`.
27. `disabled` permanece guardado después de recargar, pero no aparece en navegación.
28. Deshabilitar Tools deniega sus hijos sin borrar estados; retirarlo retira hijos asignables tras confirmación.
29. Navegación, tarjetas, guards y acciones usan la misma decisión de acceso efectivo.
30. Ninguna mutación autorizada puede dejar cero Admin activos; autosuspensión y degradación del último Admin se rechazan antes de escribir.
31. Un STORE manipulado sin Admin activo no promueve usuarios ni abre rutas; presenta recuperación cerrada y reset explícitamente confirmado.
32. En `storage`, la aplicación relee STORE y SESSION, reenlaza `user` y recalcula cuenta, ruta, proyecto, permisos y recursos.
33. Una cuenta eliminada/deshabilitada pierde SESSION y vuelve a login; un grant o proyecto revocado expulsa de la vista afectada y bloquea acciones posteriores.
34. La limitación de una SESSION compartida entre pestañas queda documentada y demostrada.
35. Un usuario sin rutas efectivas recibe la pantalla bilingüe de acceso vacío y puede cerrar sesión.
36. Cada clave nueva de catálogo, validación, confirmación, denegación y recuperación tiene valores completos `es` y `en`; una prueba de completitud falla ante claves ausentes o vacías.
37. Alta, edición, cambio de rol, acceso deshabilitado, ruta denegada, recuperación, Client–PO y pantalla sin acceso se recorren de extremo a extremo en Español y English sin texto nuevo mezclado.
38. No se modifica el logo ni se añade backend, llamada API, SDK remoto o configuración de despliegue.
39. Las pruebas y sintaxis terminan con código de salida cero:

```powershell
node --check prototype/access-control.js
node --check prototype/app.js
node --check prototype/presentation.js
node prototype/access-control.test.js
```

Si Node no está disponible, no instalar dependencias: emitir HALLAZGO y aportar validación equivalente en navegador.

## 12. Evidencia esperada en la ENTREGA

- Tabla exacta de archivos creados o modificados.
- Salida literal de los cuatro comandos de validación.
- Resultado caso por caso de los 39 criterios.
- Snapshot sanitizado de la migración de Admin, Worker y Client, omitiendo contraseñas.
- Evidencia de idempotencia antes/después de una segunda migración.
- Inventario generado de todas las acciones y comparación automática contra el registro de políticas, sin entradas faltantes.
- Matriz actor–ruta–proyecto–acción con positivos y negativos de Admin, Worker, Client A y Client B.
- Evidencia negativa de Worker accediendo a un proyecto/recurso no asignado y de Client intentando `project` o `users`.
- Evidencia de aislamiento Client A/Client B en listado, preview, descarga e intento mutante de Orders.
- Evidencia de confirmación de alta separada del preset y reiniciada después de cambio de rol/grant/proyecto.
- Evidencia de último Admin protegido mediante mutación autorizada y de recuperación cerrada ante STORE manipulado.
- Evidencia literal de relectura STORE/SESSION y expulsión por cuenta o grant revocado.
- Resultado de completitud de claves ES/EN y matriz visual completa en ambos idiomas.
- Capturas representativas:

  - alta de Worker en Español;
  - edición de Client en English;
  - entrada prohibida de User Management;
  - acceso deshabilitado;
  - navegación Worker compatible;
  - Client Orders en modo lectura;
  - aislamiento entre los dos Clients de prueba;
  - Worker rechazado en proyecto no asignado;
  - recuperación por STORE sin Admin activo;
  - pantalla sin accesos.

- Declaración expresa: sin cambios en logo, backend, Supabase, Vercel, cPanel, producción, despliegue, proveedores reales o secretos.
- Lista de desviaciones y HALLAZGOS; no se acepta “ninguno” si algún criterio no fue ejecutado.

## 13. Límite de seguridad y arquitectura futura

Este incremento sólo simula autorización. `localStorage`, el rol, los grants, las sesiones y la traza local pueden ser leídos o alterados por cualquier persona con acceso al navegador.

La implementación futura deberá:

- resolver identidad, rol y permisos exclusivamente en servidor;
- denegar por defecto;
- impedir que el cliente envíe un rol o grant confiable;
- restringir mutaciones de permisos a Admin mediante endpoint/RPC protegido;
- almacenar actor, objetivo, estado anterior, estado nuevo y timestamp en auditoría inmutable;
- invalidar o versionar sesiones al revocar permisos;
- aplicar alcance de proyecto/empresa por separado;
- aplicar RLS o controles equivalentes a cada consulta y mutación;
- impedir que Client descubra documentos, proyectos u órdenes no vinculados explícitamente;
- probar aislamiento entre usuarios, proyectos y empresas;
- no derivar políticas RLS de valores guardados en el navegador.

Esta dirección futura no selecciona backend, proveedor, schema definitivo ni ADR y no autoriza cambios en Supabase.

## 14. Frenos y siguiente paso

La REF queda bloqueada para implementación.

El `reviewer_auditor` debe revisar esta misma `VAAK-ACCESS-3-A`, contrastar catálogo, role ceilings, defaults, invariantes, guards, UX bilingüe, criterios y límite de seguridad. Si emite `APROBADO`, todavía será necesaria autorización humana explícita para comenzar la ejecución.
