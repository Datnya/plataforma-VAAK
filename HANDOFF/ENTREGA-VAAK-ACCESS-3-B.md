---
artifact_type: ENTREGA
phase: "3"
ref: "VAAK-ACCESS-3-B"
from: codex_executor
to: reviewer_auditor
status: delivered_for_audit
blocking: true
created_at: "2026-08-31"
---

# Entrega correctiva de accesos locales

## Alcance ejecutado

- Implementación exclusiva en localhost; no hubo deploy, backend, Supabase, Vercel ni cambios de producción.
- Editor de accesos administrado únicamente por Admin para crear y editar usuarios Worker/Client.
- Estados de permiso `enabled`, `disabled` y `none` para ocho secciones, con techo por rol.
- Asignación de proyectos para Worker y vínculos explícitos proyecto/orden para Client.
- Despachador DOM único `dispatchAction`, render protegido `renderCurrentRoute`, relectura de STORE/SESSION y reautorización antes del commit.
- Migración idempotente, fallo cerrado ante estado dañado/sin Admin y recuperación local confirmada.
- Segundo cliente ficticio para probar aislamiento entre cuentas.
- Etiquetas ES/EN del editor y mensajes críticos.

## Evidencia automatizada

Comandos ejecutados desde la raíz:

```text
node --check prototype/access-control.js
node --check prototype/app.js
node --check prototype/presentation.js
node prototype/access-control.test.js
node prototype/access-integration.test.js
node prototype/access-acceptance.test.js
```

Resultado:

```text
access-control: all assertions passed
access-integration: all assertions passed
39/39 PASS
```

La suite `access-acceptance.test.js` registra exactamente C01–C39. Incluye catálogo, techos de rol, alcance de proyecto, aislamiento de dos clientes, recursos inexistentes, último Admin, migración, dispatcher único, relectura, confirmación de revisión y recuperación.

## Evidencia de navegador

Microsoft Edge en modo headless cargó `http://127.0.0.1:4173/prototype/` y devolvió el DOM completo del login en español, con logo VAAK, campos Usuario/Contraseña, botón Ingresar y soporte. El servidor respondió HTTP 200.

Pruebas interactivas realizadas durante la implementación:

- Admin abrió Gestión de usuarios y el editor de accesos.
- El botón de guardado inició deshabilitado, se habilitó al confirmar revisión y volvió a deshabilitarse al modificar un permiso.
- Un cambio de sesión desde otra pestaña cerró el modal y reenlazó el actor.
- `client.vaak` visualizó sólo su orden autorizada.
- `client2.vaak` visualizó sólo `PO-2026-002` y no la orden del primer cliente.
- El cambio de idioma mostró etiquetas de rol en inglés; se restauró español al finalizar.

## Archivos principales

- `prototype/access-control.js`
- `prototype/app.js`
- `prototype/access-control.test.js`
- `prototype/access-integration.test.js`
- `prototype/access-acceptance.test.js`
- `prototype/refinements.css`
- `prototype/README.md`
- `docs/functional/VAAK-ROLE-PERMISSIONS.md`

## Limitación explícita

La autenticación y autorización siguen siendo una simulación cliente sobre `localStorage`. Una sola sesión se comparte entre pestañas del mismo origen. La seguridad real requiere backend, identidad, RLS/políticas de base de datos y auditoría inmutable; eso queda fuera de este alcance local.
