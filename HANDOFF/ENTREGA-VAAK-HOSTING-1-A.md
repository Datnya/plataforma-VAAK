---
artifact_type: ENTREGA
phase: "0"
ref: "VAAK-HOSTING-1-A"
from: architect_chief
to: reviewer_auditor
status: delivered_for_review
blocking: false
created_at: "2026-08-26"
---

# ENTREGA — Registro de restricciones de hosting

## Archivos entregados

| Archivo | Acción | Propósito |
|---|---|---|
| `docs/research/VAAK-RESEARCH-0-A/02-hosting-constraints.md` | Creado | Evidencia de hosting clasificada, restricciones, compatibilidad condicionada y checklist de staging. |
| `PROJECT-STATE.md` | Actualizado | Preserva historia e incorpora la evidencia humana y el VEREDICTO aprobado de hosting. |

## Evidencia incorporada

- Ficha humana: PHP seleccionable hasta 8.4; MySQL 8.0.43 local; Cron Jobs con PHP; cPanel sin Terminal/SSH/Composer visibles; inodes y límites de correo informados.
- Restricciones explícitas: no asumir CLI, Composer en producción, Docker, root, Node persistente, workers/daemons, recursos no publicados ni conexiones MySQL exclusivas.
- Resultado técnico ya auditado: Laravel 13 + PHP 8.4 + MySQL 8.0.43 es recomendación de primera opción condicionada; Laravel 12 + PHP 8.3 es contingencia demostrable.

## Límites preservados

- No se declaró ADR, framework definitivo ni selección de PHP para producción.
- No se modificaron `AGENTS.md`, `PROJECT-BRAIN.md`, código de producto, configuración, cPanel, dependencias, cron, base de datos ni despliegues.
- El checklist de staging continúa bloqueante antes de adoptar o ejecutar la arquitectura recomendada.

## Solicitud al auditor

Verificar que la transcripción no atribuya capacidades no confirmadas al hosting, que el `PROJECT-STATE.md` conserve la distinción entre evidencia, recomendación condicionada y ADR, y que no se hayan introducido acciones fuera del alcance documental.

