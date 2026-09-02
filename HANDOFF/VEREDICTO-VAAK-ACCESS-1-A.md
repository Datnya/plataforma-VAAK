---
artifact_type: VEREDICTO
phase: "0"
ref: "VAAK-ACCESS-1-A"
from: reviewer_auditor
to: architect_chief
status: rejected
blocking: true
created_at: "2026-08-26"
---

# VEREDICTO — Auditoría final de contratos de acceso y corrección documental

## Resultado

**RECHAZADO**

La entrega queda rechazada por un incumplimiento documental concreto. No se autoriza ninguna modificación adicional dentro de esta REF sin una decisión humana, porque esta es la revisión final solicitada.

## Auditoría final independiente

Se revisaron la ORDEN, el VEREDICTO inicial, la ENTREGA, la PREGUNTA, los cuatro documentos de roles, las restricciones de hosting y `PROJECT-STATE.md`.

| Criterio | Resultado | Verificación |
|---|---|---|
| Los tres roles no conceden permisos no otorgados | Conforme | `ADMIN.md` condiciona alcance a matriz futura y niega acceso interorganización; `WORKER.md` parte de mínimo privilegio y niega usuarios, roles, privilegios globales y proyectos ajenos; `CLIENT.md` limita reportes y tracking a datos autorizados. Todos se presentan como requisitos, no permisos implementados. |
| Privacidad y anti-enumeración del tracking | Conforme | `CLIENT.md` exige código opaco de alta entropía, generación criptográfica, expiración, revocación, reemplazo, auditoría sin secreto legible, limitación de tasa, respuesta uniforme, anti-automatización, minimización de respuesta y autorización adicional para detalle. |
| Actualización obligatoria por cada función en cada contrato | **No conforme** | `docs/roles/README.md` establece el contrato de mantenimiento global, pero `ADMIN.md`, `WORKER.md` y `CLIENT.md` no contienen ni referencian explícitamente la obligación de actualizar su propio contrato cuando una función los afecte. El requisito auditado exige que cada documento la defina; no basta con que exista sólo en el índice. |
| Corrección excepcional de hosting | Conforme | `02-hosting-constraints.md` registra exactamente el `include_path=.:/opt/alt/php73/usr/share/pear` observado bajo PHP 7.3 y aclara que no prueba su valor bajo PHP 8.4. También registra que las notificaciones de Resource Usage son administradas o restringidas por proveedor/administrador, sin inventar alertas ni límites. |
| Topología sin elección silenciosa | Conforme | `PREGUNTA-VAAK-ACCESS-1-A.md` presenta A y B como alternativas pendientes, declara expresamente que no elige una y prohíbe configurar acceso remoto a MySQL o conectar servicios sin decisión humana y evaluación de seguridad. |
| GitHub y Vercel no presentados como almacenamiento de datos | Conforme | La PREGUNTA y `PROJECT-STATE.md` indican que GitHub es repositorio/trazabilidad, no datos operativos, adjuntos, respaldos, `.env` ni exportaciones; Vercel no se trata como base de datos. |

## Corrección requerida, si la humana autoriza una nueva REF

Crear una nueva REF documental y añadir en cada uno de `docs/roles/ADMIN.md`, `docs/roles/WORKER.md` y `docs/roles/CLIENT.md` una cláusula explícita y equivalente: toda función, permiso, dato visible, aprobación o integración que afecte al rol debe actualizar ese contrato antes de declararse requisito consolidado, conservando identificador, estado, evidencia, restricciones, riesgos y fecha de revisión.

No se requieren cambios a la corrección de hosting, a la seguridad de tracking ni a la PREGUNTA de topología.

## Límites conservados

- Esta auditoría no prueba ni altera cPanel, Vercel, GitHub, MySQL remoto, credenciales, despliegues o datos reales.
- No se seleccionó topología, stack definitivo, versión de PHP ni ADR.
- El rechazo es documental y no invalida la evidencia conforme detallada arriba.
