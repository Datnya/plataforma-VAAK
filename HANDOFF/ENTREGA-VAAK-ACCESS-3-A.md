---
artifact_type: ENTREGA
phase: "3"
ref: "VAAK-ACCESS-3-A"
from: executor
to: reviewer_auditor
status: delivered_for_audit
blocking: true
created_at: "2026-08-31"
---

# ENTREGA — Gestión granular de accesos en localhost

## Tarea completada

Se implementó en el prototipo local un modelo de accesos por usuario administrado exclusivamente por Admin, integrado en el alta y edición de usuarios y aplicado a navegación, rutas, acciones, proyectos y órdenes autorizadas.

## Archivos modificados

- `prototype/access-control.js` — catálogo bilingüe, defaults, migración, límites por rol, guards de rutas/acciones, proyectos y órdenes Client.
- `prototype/access-control.test.js` — pruebas puras de catálogo, ceilings, migración, aislamiento, dependencia Tools, último Admin y deny-by-default.
- `prototype/app.js` — integración de permisos, navegación, formularios, sesión, alcance y auditoría local.
- `prototype/refinements.css` — diseño responsivo del editor de accesos.
- `prototype/index.html` — carga del módulo y cachebusters locales.
- `prototype/README.md` — funcionamiento y límite de seguridad del prototipo.
- `docs/functional/VAAK-ROLE-PERMISSIONS.md` — nota de implementación local vinculada a la REF.
- `HANDOFF/ORDEN-VAAK-ACCESS-3-A.md` y VEREDICTOS R1/R2 — artefactos de gobierno previos.

## Evidencia automática

```text
node --check prototype/access-control.js  -> exit 0
node --check prototype/app.js             -> exit 0
node --check prototype/presentation.js    -> exit 0
node prototype/access-control.test.js     -> access-control: all assertions passed
Inventario data-action                    -> actions: 40 unknown: 0
```

## Evidencia interactiva en localhost

- Admin: Gestión de usuarios muestra resumen de accesos y abre Nuevo usuario/Editar y gestionar accesos.
- Nuevo Worker: ocho secciones visibles, Gestión de usuarios bloqueada por rol, tres estados por permiso, proyectos asignables y confirmación obligatoria.
- Worker: al deshabilitar Tools desapareció Herramientas, se conservaron Panel principal y Equipo y luego se restauró el default.
- Client: sólo Panel principal por default; mostró exclusivamente la PO vinculada mediante autorización individual.
- Español: tabla, editor, estados, avisos y confirmación verificados.
- English: tabla completa y modal New user verificados sin textos nuevos mezclados; al final se restauró Español.
- Login: logo completo y por encima de las capas, sin cambio de tamaño o posición.

## Invariantes y negativas cubiertas

- Admin conserva acceso total implícito y no editable granularmente.
- Worker/Client no reciben `section.users`, incluso ante grants manipulados.
- El último Admin activo no puede deshabilitarse o degradarse mediante la aplicación.
- Las rutas desconocidas, acciones desconocidas y recursos no resolubles se deniegan.
- `project` exige Admin o Worker asignado; Client queda excluido.
- Preview/download de Client revalidan Client–empresa–proyecto–orden; las mutaciones de PO están prohibidas.
- Deshabilitar Tools conserva grants hijos pero los vuelve inefectivos.
- Recargas no reponen defaults después de una edición Admin.
- Eventos `storage` releen STORE y SESSION y reevalúan sesión y ruta.

## Desviaciones y límites

- No se añadió backend, Supabase, Vercel, RLS ni despliegue.
- La traza, los roles y permisos siguen siendo manipulables porque residen en `localStorage`; simulan la autorización para validar la interfaz, no seguridad real.
- No se modificaron activos de marca ni se publicó ningún cambio online.

LISTO PARA AUDITORÍA: sí
