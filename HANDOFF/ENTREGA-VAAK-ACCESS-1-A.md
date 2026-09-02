---
artifact_type: ENTREGA
phase: "0"
ref: "VAAK-ACCESS-1-A"
from: architect_chief
to: reviewer_auditor
status: ready_for_review
blocking: false
created_at: "2026-08-26"
---

# ENTREGA — Contratos de acceso y corrección documental

## Alcance ejecutado

- Se corrigió `docs/research/VAAK-RESEARCH-0-A/02-hosting-constraints.md` con el `include_path` observado bajo PHP 7.3 y la restricción de notificaciones de Resource Usage administradas por el proveedor.
- Se matizaron 100 GB, CPU/RAM y límites de correo como información humana/comercial que no equivale a límites técnicos efectivos observados en cPanel.
- Se crearon contratos vivos para Admin, Trabajador y Cliente, más su índice de mantenimiento, en `docs/roles/`.
- Se registraron roles, tracking seguro y topología pendiente en `PROJECT-STATE.md`, por autorización humana explícita posterior a la ORDEN.
- Se creó la PREGUNTA única de topología sin elegir alternativa.

## Archivos modificados o creados

| Ruta | Cambio |
|---|---|
| `docs/research/VAAK-RESEARCH-0-A/02-hosting-constraints.md` | Corrección factual y matiz de evidencia comercial. |
| `docs/roles/README.md` | Contrato de mantenimiento e índice de roles. |
| `docs/roles/ADMIN.md` | Requisitos y límites del rol Admin. |
| `docs/roles/WORKER.md` | Requisitos y límites del rol Trabajador. |
| `docs/roles/CLIENT.md` | Requisitos y controles de tracking del rol Cliente. |
| `PROJECT-STATE.md` | Registro de roles y topología pendiente, autorizado por la humana. |
| `HANDOFF/PREGUNTA-VAAK-ACCESS-1-A.md` | Pregunta única de topología A/B sin decisión. |
| `HANDOFF/ENTREGA-VAAK-ACCESS-1-A.md` | Esta entrega. |

## Validaciones requeridas

- Estructura de frontmatter YAML comprobada en los cuatro contratos de roles, PREGUNTA y ENTREGA: delimitadores, ocho campos obligatorios y REF estable.
- Presencia de los controles de anti-enumeración, expiración/revocación, rate limiting y minimización de respuesta en `CLIENT.md`.
- Confirmación de que no se modificaron código, cPanel, Vercel, GitHub remoto, credenciales, infraestructura ni datos reales.

## Desviación controlada

La ORDEN inicial excluía `PROJECT-STATE.md`, pero la instrucción humana explícita posterior ordenó registrar allí roles y topología. Se hizo únicamente esa actualización documental, sin cambiar decisiones de producto o infraestructura.

## Lista para auditoría

Sí. No se emitió ADR, no se seleccionó topología y no se implementó autorización real.
