---
artifact_type: VEREDICTO
phase: "0"
ref: "VAAK-HOSTING-1-A"
from: reviewer_auditor
to: architect_chief
status: rejected
blocking: true
created_at: "2026-08-26"
---

# VEREDICTO — Arquitectura y viabilidad en hosting cPanel

## Resultado

**RECHAZADO**

Esta es la tercera y última revisión de la REF. La sección **Auditoría final 3** de este mismo documento sustituye el resultado de la revisión 2 para el cierre de la REF.

La ORDEN revisada es una recomendación técnica condicionada, no un ADR ni una autorización de implementación. Respeta las restricciones verificadas del hosting y deja como bloqueantes las comprobaciones que siguen sin evidencia.

## Auditoría independiente de la revisión 2

Se revisaron `AGENTS.md`, `PROJECT-BRAIN.md`, `PROJECT-STATE.md`, los cinco documentos de `HANDOFF/`, la ORDEN vigente y el VEREDICTO previo. También se contrastó el soporte declarado para Laravel 13 y PHP 8.4 contra la documentación oficial vigente.

| Hallazgo previo | Verificación de corrección | Resultado |
|---|---|---|
| H-01 — ciclo de soporte | La primera opción es Laravel 13 + PHP 8.4, expresamente condicionada a staging; Laravel 12 + PHP 8.3 queda solo como contingencia demostrable. No se adopta PHP ni se crea ADR. | Corregido |
| H-02 — cron | Exige un job inocuo en staging que confirme binario, versión PHP efectiva, extensiones, arranque de `artisan`, registro y no solapamiento. Hasta entonces cron Laravel, alertas y lotes permanecen condicionados. | Corregido |
| H-03 — despliegue sin CLI | Define artefacto con `vendor/` y assets compilados, manifiesto de compatibilidad y hashes; prohíbe Composer en producción, binarios no validados, secretos en el paquete y symlinks requeridos para adjuntos privados. | Corregido |
| H-04 — exposición y recuperación | Condiciona el despliegue a webroot seguro, rewrite, inaccesibilidad de archivos sensibles, usuario MySQL mínimo, backup/restauración no destructiva y rollback de código separado del esquema. | Corregido |
| H-05 — integridad y concurrencia | Exige autorización y alcance en servidor, transacciones, invariantes, concurrencia según operación, conservación de documentos financieros y expresa el límite de amenaza de la auditoría de aplicación. | Corregido |
| H-06 — extensiones y límites | Incluye `zip`, `gd` o Imagick según función, límites PHP, SMTP autenticado, cuotas/restauración de BD y descarta `allow_url_fopen` como dependencia. | Corregido |

## Límites y condiciones que permanecen vigentes

- No se han comprobado PHP 8.4 con las extensiones necesarias, el webroot seguro, el método de transferencia, los límites de recursos, SMTP, backups/restauración ni el cron Laravel. Son verificaciones bloqueantes de staging, no capacidades asumidas.
- La arquitectura aprobada para presentar al humano es un monolito modular Laravel con MySQL local y procesos breves por cron; excluye workers persistentes, Node persistente, Docker, microservicios, Octane, Horizon, Redis obligatorio y WebSockets en este hosting.
- La aprobación no permite instalar dependencias, seleccionar PHP en producción, modificar cPanel, crear base de datos, programar cron, desplegar ni migrar datos. Esas acciones requieren autorización humana explícita y los frenos aplicables.

## Base técnica verificada

Laravel 13 requiere PHP 8.3 como mínimo, admite PHP 8.3–8.5 y mantiene correcciones de seguridad hasta el 17 de marzo de 2028. PHP 8.4 continúa con soporte de seguridad hasta el 31 de diciembre de 2028. Estas fechas justifican la preferencia condicionada, no sustituyen la prueba real del proveedor.

Fuentes: https://laravel.com/framework/docs/13.x/releases y https://www.php.net/supported-versions.php

## Siguiente paso

Presentar esta recomendación al humano. Antes de cualquier implementación o cambio en producción, el humano debe autorizarlo de forma explícita y decidir si se abre el ADR tecnológico después de completar las verificaciones bloqueantes.

## Auditoría final 3 — evidencia y cierre

Se leyeron `AGENTS.md`, `PROJECT-BRAIN.md`, `PROJECT-STATE.md`, los cinco documentos de `HANDOFF/`, la ORDEN, la ENTREGA y `docs/research/VAAK-RESEARCH-0-A/02-hosting-constraints.md`.

| Criterio | Resultado | Evidencia |
|---|---|---|
| Capacidades no confirmadas | Conforme | Se mantienen desconocidos CPU, RAM, I/O, IOPS, EP, NPROC, concurrencia, límites PHP, cuotas, SSH, Terminal y Composer de producción. |
| Recomendación condicionada | Conforme | Laravel 13 + PHP 8.4 sigue condicionado a staging; Laravel 12 + PHP 8.3 es contingencia. No hay ADR ni selección definitiva. |
| Bloqueantes | Conforme | Extensiones, webroot/rewrite, transferencia, cron inocuo, privilegios/recuperación MySQL, SMTP/TLS/WAF/logs y límites reales siguen explícitos. |
| Producto y cPanel | Conforme dentro de la evidencia disponible | La entrega es documental y el workspace no presenta código de producto ni configuración cPanel creada por esta REF. Sin Git ni telemetría cPanel no es posible demostrar negativamente cambios remotos; no hay evidencia local de ellos. |
| Fidelidad de ficha humana | No conforme | Se declara que la ficha fue registrada íntegramente, pero el registro canónico omite el `include_path` observado y que las notificaciones de Resource Usage son administradas/restringidas por el proveedor. También no clasifica los datos comerciales del plan sobre CPU/RAM y límites generales de correo como no verificables desde cPanel. |

El faltante no habilita ninguna capacidad adicional ni cambia por sí mismo la recomendación técnica, pero impide aprobar una entrega que afirma fidelidad íntegra. Al haberse agotado los tres ciclos, se escala al humano: debe autorizar expresamente una corrección documental excepcional o aceptar que esos datos no formen parte del registro canónico. No se abre un cuarto ciclo silencioso.
