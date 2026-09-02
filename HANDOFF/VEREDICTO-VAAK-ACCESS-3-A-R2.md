---
artifact_type: VEREDICTO
phase: "3"
ref: "VAAK-ACCESS-3-A"
from: reviewer_auditor
to: architect_chief
status: approved
blocking: true
created_at: "2026-08-31"
---

# VEREDICTO R2 — Accesos granulares administrados por Admin

## RESULTADO

**APROBADO**

La ORDEN revisada resuelve de forma suficiente y verificable los hallazgos H-01 a H-06 del VEREDICTO R1. Mantiene la misma REF, conserva los aspectos previamente conformes y no amplía el alcance a backend, staging, despliegue, producción o infraestructura.

Esta aprobación valida la ORDEN como base lista para decisión humana. **No autoriza implementación.** Antes de crear o modificar `prototype/access-control.js`, `prototype/app.js`, documentación funcional o cualquier otro archivo permitido por la ORDEN, sigue siendo necesaria autorización humana explícita para comenzar la ejecución.

## Auditoría independiente de correcciones

| Hallazgo R1 | Resultado R2 | Evidencia en la ORDEN revisada |
|---|---|---|
| H-01 — Separar sección, ruta y recurso | Subsanado | §§3.2, 3.3, 3.5 y 6.1 definen membresías por IDs, excluyen siempre a Client de `project`, limitan Worker a proyectos asignados y exigen el mismo scope en listados, métricas y handlers por ID. Los criterios 5–8 incluyen positivos y negativos verificables. |
| H-02 — Política exhaustiva de acciones | Subsanado | §3.7 incorpora política pura deny-by-default, un único `dispatchAction`, objetivo y recurso obligatorios, y el inventario completo de las 40 acciones únicas observadas en `prototype/app.js`, incluida la llamada interna `action('edit-banner')`. §6.2 prohíbe handlers legados previos a autorización. |
| H-03 — Autorización individual de POs Client | Subsanado | §§3.2 y 3.6 sustituyen `visible` como autoridad por relaciones Client–empresa–proyecto–PO y un predicado único para Dashboard, historial, preview y descarga. Los criterios 14–18 exigen aislamiento entre dos Clients e intentos directos por ID. |
| H-04 — Migración frente a alta nueva | Subsanado | §4 separa ambos flujos. Los presets no autorizan, `accessReviewed` comienza falso, existe confirmación separada y cualquier cambio de rol, grant, proyecto o vínculo invalida la revisión. Los criterios 19–25 cubren compatibilidad e intervención explícita de Admin. |
| H-05 — Último Admin y revocación | Subsanado | §§5 y 6.3 limitan el invariante a mutaciones de la aplicación, validan el estado hipotético, fallan cerrados ante STORE corrupto, prohíben promoción automática y exigen releer STORE/SESSION, reenlazar `user`, retirar sesiones inválidas y expulsar rutas revocadas. |
| H-06 — Evidencia reproducible y ES/EN | Subsanado | §11 amplía a 39 criterios mecánicos y §12 exige inventario automático, matrices actor–ruta–recurso–acción, idempotencia, aislamiento Client, último Admin, revocación y completitud bilingüe. §7.3 conserva textos de autorización estructurados fuera de la sustitución frágil de `presentation.js`. |

## Contraste con el repositorio

- El prototipo sigue usando `vaak-preview-v6` y `vaak-session-v6`; no existe todavía `prototype/access-control.js`, por lo que no se inició implementación anticipada.
- `prototype/app.js` conserva los bypass y límites que la ORDEN debe corregir: asignación directa de `route`/`selected`, uso global de `visible` y múltiples envolturas de `render()`/`action()`.
- La extracción independiente del código encontró 40 valores únicos de `data-action`; todos aparecen en el inventario obligatorio de §3.7. La única llamada interna literal observada, `action('edit-banner')`, también está identificada.
- Las rutas verificables continúan siendo `home`, `project`, `tools`, `team`, `users`, `suppliers`, `orders`, `specs` y `settings`; todas quedan cubiertas por el catálogo y las reglas derivadas.
- Desde la persistencia de R1 sólo se modificaron `HANDOFF/ORDEN-VAAK-ACCESS-3-A.md` y el propio VEREDICTO R1. No se modificaron `prototype/app.js`, `prototype/presentation.js`, `prototype/index.html`, `prototype/refinements.css`, backend, Supabase, Vercel, cPanel ni configuración de despliegue.

## Aspectos conformes preservados

- Catálogo exacto de ocho secciones y ceilings por rol.
- Acceso Admin implícito y `section.users` prohibido para Worker y Client.
- Estados `enabled`, `disabled` y `none` con dependencia coherente de Tools.
- Migración versionada, idempotente y con fallo cerrado.
- Pantalla sin accesos, recuperación explícita y UX completa ES/EN.
- Traza local declarada manipulable y sin pretensión de auditoría segura.
- Reconocimiento expreso de que `localStorage`, roles, grants y sesiones sólo simulan autorización.
- Prohibición de modificar marca, backend, proveedores, infraestructura o despliegue.

## Foco obligatorio para la futura auditoría de ENTREGA

La aprobación documental no presume que los controles funcionen. La ENTREGA deberá demostrar los 39 criterios, incluyendo que los commits de formularios y callbacks abiertos antes de una revocación vuelven a pasar por la política y no conservan autorización obsoleta. Cualquier acción, ruta o recurso ausente del registro deny-by-default será una regresión bloqueante.

## Cierre

La revisión R2 queda **APROBADA**. La REF continúa bloqueada exclusivamente a la espera de autorización humana explícita para implementar. Una vez autorizada y ejecutada, la ENTREGA deberá volver a auditoría independiente antes de declarar completado el incremento.
