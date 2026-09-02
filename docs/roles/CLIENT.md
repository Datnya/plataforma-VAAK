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

# Rol: Cliente

## Propósito

Usuario externo limitado a consultar reportes autorizados de su propio proyecto/empresa y el estado autorizado de un producto mediante tracking.

## Capacidades registradas

| ID | Capacidad | Alcance de datos | Estado | Evidencia/origen | Restricciones y riesgos | Última revisión |
|---|---|---|---|---|---|---|
| CLT-001 | Consultar historial de reportes autorizados. | Sólo proyecto/empresa asociado al Cliente. | validado_por_humano | Instrucción humana, 2026-08-26. | Vínculo identidad-proyecto/empresa, reportes visibles, autenticación y soporte siguen pendientes. | 2026-08-26 |
| CLT-002 | Consultar estado actual de un producto mediante código de tracking. | Estado logístico mínimo autorizado. | validado_por_humano | Instrucción humana, 2026-08-26. | No expone identidad, dirección, montos, órdenes internas ni historial completo por conocer un código. | 2026-08-26 |
| CLT-003 | Consultar historial de Purchase Orders explícitamente autorizadas. | Sólo POs autorizadas de su empresa/proyecto asociado. | validado_por_humano | Q-FUN-02, VAAK-FUNCTIONAL-1-A, 2026-08-26. | No puede crear, editar, emitir ni descubrir POs no autorizadas; datos visibles requieren política posterior. | 2026-08-26 |

## Mantenimiento de este contrato

Toda función, permiso, límite, flujo, dato visible, aprobación o integración que afecte al rol Cliente debe actualizar este mismo contrato antes de declararse requisito consolidado. Cada capacidad afectada debe conservar identificador estable, descripción, alcance de datos, estado, evidencia/origen, restricciones, riesgos y fecha de última revisión.

Aplicar el [contrato global de mantenimiento y estados válidos](README.md). Si el cambio también afecta a otro rol, actualizar cada contrato afectado sin duplicar ni inventar evidencia. Este contrato es un requisito vivo: no concede permisos reales ni sustituye una matriz de autorización aprobada. Trazabilidad de esta regla: `VAAK-ACCESS-1-B`, 2026-08-26.

## Requisitos de seguridad del tracking

- El código será opaco, de alta entropía y generado criptográficamente; nunca secuencial ni derivado de IDs internos, empresa, orden o fechas.
- Debe poder expirar, revocarse y reemplazarse. La auditoría registra emisión, revocación y uso relevante sin conservar el secreto legible.
- Requiere limitación de tasa, respuesta uniforme ante códigos inválidos, protección contra automatización y ausencia de enumeración. Valores concretos quedan pendientes de diseño y límites del hosting.
- La respuesta debe ser mínima: sólo estado logístico autorizado y proveniente de una fuente trazable. Mayor detalle requiere autorización adicional.

## Límites y decisiones pendientes

- La relación entre identidad, empresa, proyecto, producto, reportes y POs aún no está diseñada.
- El tracking no sustituye autenticación para datos sensibles ni otorga acceso general a la plataforma.
- Se deben definir estados logísticos, expiración, atención al cliente y política de privacidad antes de implementar.
