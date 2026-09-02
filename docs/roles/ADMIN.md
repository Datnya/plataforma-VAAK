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

# Rol: Admin

## Propósito

Administrador de la plataforma. Requisito humano inicial: control integral de secciones, usuarios, roles y permisos dentro del alcance que se apruebe.

## Capacidades registradas

| ID | Capacidad | Alcance de datos | Estado | Evidencia/origen | Restricciones y riesgos | Última revisión |
|---|---|---|---|---|---|---|
| ADM-001 | Acceder a todas las secciones autorizadas de la plataforma. | Datos de la organización/proyectos que la futura matriz autorice. | validado_por_humano | Instrucción humana, 2026-08-26. | No implica acceso entre organizaciones ni exclusión de controles de auditoría. | 2026-08-26 |
| ADM-002 | Crear nuevos usuarios. | Datos mínimos de identidad y cuenta por definir. | validado_por_humano | Instrucción humana, 2026-08-26. | Alta, invitación, verificación, recuperación y privacidad siguen pendientes. | 2026-08-26 |
| ADM-003 | Asignar rol a nuevos usuarios y administrar permisos de Trabajador. | Roles y asignaciones de secciones futuras. | validado_por_humano | Instrucción humana, 2026-08-26. | Requiere matriz de autorización, trazabilidad y segregación de funciones antes de implementación. | 2026-08-26 |
| ADM-004 | Supervisar proyectos y operaciones, incluyendo SPEC, proveedores, tareas y Purchase Orders. | Proyectos y datos bajo ámbito autorizado. | validado_por_humano | FUN-010--FUN-053, VAAK-FUNCTIONAL-1-A, 2026-08-26. | La capacidad de Worker para emitir POs no exige revisión/emisión de Admin. Flujos de aprobación y edición detallada pendientes. | 2026-08-26 |
| ADM-005 | Deshabilitar a un usuario de inmediato. | Cuenta, sesiones y trazabilidad de actividad. | validado_por_humano | Q-FUN-03, VAAK-FUNCTIONAL-1-A, 2026-08-26. | Debe revocar acceso sin borrar actividad; requiere auditoría al implementarse. | 2026-08-26 |
| ADM-006 | Archivar lógicamente usuarios con actividad; eliminar físicamente sólo cuentas sin actividad. | Datos de cuenta e historial. | validado_por_humano | Q-FUN-03, VAAK-FUNCTIONAL-1-A, 2026-08-26. | Confirmación, impacto, retención y mecanismo técnico permanecen pendientes. | 2026-08-26 |
| ADM-007 | Consultar y gestionar herramientas administrativas: proyectos, usuarios, proveedores y guía oficial privada. | Datos autorizados de la organización. | validado_por_humano | FUN-013, FUN-020--FUN-024, VAAK-FUNCTIONAL-1-A, 2026-08-26. | La guía PDF aún no existe; no implica administración de infraestructura. | 2026-08-26 |

## Mantenimiento de este contrato

Toda función, permiso, límite, flujo, dato visible, aprobación o integración que afecte al rol Admin debe actualizar este mismo contrato antes de declararse requisito consolidado. Cada capacidad afectada debe conservar identificador estable, descripción, alcance de datos, estado, evidencia/origen, restricciones, riesgos y fecha de última revisión.

Aplicar el [contrato global de mantenimiento y estados válidos](README.md). Si el cambio también afecta a otro rol, actualizar cada contrato afectado sin duplicar ni inventar evidencia. Este contrato es un requisito vivo: no concede permisos reales ni sustituye una matriz de autorización aprobada. Trazabilidad de esta regla: `VAAK-ACCESS-1-B`, 2026-08-26.

## Límites y decisiones pendientes

- No se ha definido delegación entre administradores, recuperación de cuenta, aprobación de cambios críticos ni segregación de funciones.
- Todo cambio de rol, permiso o visibilidad deberá dejar historial auditable cuando la arquitectura de producto sea aprobada.
- Este contrato no convierte al Admin en acceso irrestricto a datos de otras empresas/proyectos ni en administrador de infraestructura.
