---
artifact_type: ROLE_CONTRACT_INDEX
phase: "0"
ref: "VAAK-ACCESS-1-A"
from: architect_chief
to: reviewer_auditor
status: draft_for_review
blocking: false
created_at: "2026-08-26"
---

# Contratos vivos de roles — Plataforma VAAK

Estos contratos registran requisitos humanos por rol. No conceden permisos reales, no sustituyen una matriz de autorización aprobada y no prueban una implementación.

## Contrato de mantenimiento

- Toda función, permiso, dato visible, aprobación o integración nueva debe actualizar el contrato de cada rol afectado antes de declararse como requisito consolidado.
- Cada capacidad debe tener identificador estable, descripción, alcance de datos, estado, evidencia/origen, restricciones, riesgos y fecha de revisión.
- Si una capacidad afecta más de un rol, se referencia en cada contrato y conserva una única fuente de evidencia trazable.
- Cambios materiales de rol, delegación, visibilidad de datos, aprobación o acceso externo pasan por Arquitecto → Auditor y por decisión humana cuando aplique.
- Los estados válidos son `propuesto`, `validado_por_humano`, `pendiente_de_diseño` e `implementado_y_verificado`. El último no puede usarse sin evidencia independiente.

## Índice

| Rol | Contrato | Propósito actual |
|---|---|---|
| Admin | `ADMIN.md` | Administración integral, usuarios, roles y permisos. |
| Trabajador | `WORKER.md` | Acceso mínimo por secciones habilitadas. |
| Cliente | `CLIENT.md` | Reportes propios autorizados y tracking con privacidad. |

## Dependencia operativa abierta

La topología temporal entre Vercel, cPanel y GitHub no está decidida. Ver `HANDOFF/PREGUNTA-VAAK-ACCESS-1-A.md`; ningún contrato autoriza datos reales o conexiones entre esos servicios.
