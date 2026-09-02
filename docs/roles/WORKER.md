---
artifact_type: ROLE_CONTRACT
phase: "0"
ref: "VAAK-ACCESS-1-A"
from: architect_chief
to: reviewer_auditor
status: delivered_for_audit
blocking: false
created_at: "2026-08-26"
---

# Rol: Trabajador

## Propósito

Usuario interno con acceso mínimo por defecto. Puede usar sólo las secciones que un Admin habilite explícitamente mediante la futura matriz de autorización.

## Capacidades registradas

| ID | Capacidad | Alcance de datos | Estado | Evidencia/origen | Restricciones y riesgos | Última revisión |
|---|---|---|---|---|---|---|
| WRK-001 | Acceder a secciones habilitadas expresamente por Admin. | Datos y proyectos que la matriz futura asigne. | validado_por_humano | Instrucción humana, 2026-08-26. | Debe aplicarse mínimo privilegio y revocación efectiva; las secciones concretas siguen pendientes. | 2026-08-26 |
| WRK-002 | Ver todos los datos de los proyectos asignados. | Incluye Tax ID, direcciones, contactos, áreas, resultados y datos autorizados del proyecto. | validado_por_humano | Q-FUN-06 / FUN-041, VAAK-FUNCTIONAL-1-A, 2026-08-26. | No concede acceso a proyectos no asignados ni edición de información general del proyecto. | 2026-08-26 |
| WRK-003 | Consultar sus tareas asignadas y actualizar únicamente el estado de una tarea propia. | Tareas de proyectos asignados. | validado_por_humano | FUN-012, FUN-042, VAAK-FUNCTIONAL-1-A, 2026-08-26. | No edita texto, responsable, plazo, proyecto ni tareas ajenas; toda transición debe ser auditable. | 2026-08-26 |
| WRK-004 | Crear y gestionar SPEC dentro de proyectos asignados. | SPECs con código único, trazable y no reutilizable. | validado_por_humano | Q-FUN-01 / FUN-050--FUN-051, VAAK-FUNCTIONAL-1-A, 2026-08-26. | Fichas técnicas/imágenes reales y sus reglas siguen pendientes. | 2026-08-26 |
| WRK-005 | Añadir y gestionar proveedores asociados a proyectos asignados. | Proveedores y contactos del ámbito de proyecto. | validado_por_humano | Q-FUN-05 / FUN-024, VAAK-FUNCTIONAL-1-A, 2026-08-26. | Debe prevenir duplicados y conservar trazabilidad; no administra configuración global. | 2026-08-26 |
| WRK-006 | Crear y emitir Purchase Orders dentro de proyectos asignados. | POs y datos autorizados del proyecto, incluido Tax ID y delivery address. | validado_por_humano | Q-FUN-01 / FUN-052--FUN-053, VAAK-FUNCTIONAL-1-A, 2026-08-26. | No requiere revisión/emisión de Admin; numeración, precios, impuestos, moneda, PDF y lifecycle están pendientes. | 2026-08-26 |

## Mantenimiento de este contrato

Toda función, permiso, límite, flujo, dato visible, aprobación o integración que afecte al rol Trabajador debe actualizar este mismo contrato antes de declararse requisito consolidado. Cada capacidad afectada debe conservar identificador estable, descripción, alcance de datos, estado, evidencia/origen, restricciones, riesgos y fecha de última revisión.

Aplicar el [contrato global de mantenimiento y estados válidos](README.md). Si el cambio también afecta a otro rol, actualizar cada contrato afectado sin duplicar ni inventar evidencia. Este contrato es un requisito vivo: no concede permisos reales ni sustituye una matriz de autorización aprobada. Trazabilidad de esta regla: `VAAK-ACCESS-1-B`, 2026-08-26.

## Límites y decisiones pendientes

- No administra usuarios, roles, accesos de proyecto, configuración global ni proyectos o empresas ajenos.
- No edita información general de proyecto ni tareas que no le fueron asignadas.
- La implementación debe aplicar el alcance por proyecto, auditoría de accesos y límites de acciones sensibles.
