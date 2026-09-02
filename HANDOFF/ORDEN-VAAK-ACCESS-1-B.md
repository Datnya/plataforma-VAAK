---
artifact_type: ORDEN
phase: "0"
ref: "VAAK-ACCESS-1-B"
from: architect_chief
to: reviewer_auditor
status: draft_for_review
blocking: false
created_at: "2026-08-26"
---

# ORDEN — Corrección excepcional de mantenimiento de contratos de roles

## Tarea única

Corregir exclusivamente el hallazgo documental del VEREDICTO `VAAK-ACCESS-1-A`: añadir una sección visible de mantenimiento en cada contrato individual de rol:

- `docs/roles/ADMIN.md`
- `docs/roles/WORKER.md`
- `docs/roles/CLIENT.md`

## Contexto y trazabilidad

La humana autorizó expresamente esta REF excepcional después del rechazo final de `VAAK-ACCESS-1-A`. El Auditor verificó que el índice `docs/roles/README.md` contiene la regla global, pero que los tres contratos individuales no la contienen ni la enlazan de forma explícita.

Esta ORDEN conserva el alcance mínimo: corrige la trazabilidad del mantenimiento de roles sin alterar capacidades, permisos, modelo de autorización, seguridad de tracking, hosting, topología Vercel/cPanel/GitHub, `PROJECT-STATE.md`, `PROJECT-BRAIN.md` ni código de producto.

## Cambio mínimo requerido

En cada contrato individual, agregar una sección visible —por ejemplo, `## Mantenimiento de este contrato`— que establezca explícitamente que:

1. Toda función, permiso, límite, flujo, dato visible, aprobación o integración que afecte a ese rol debe actualizar **ese mismo contrato** antes de declararse requisito consolidado.
2. La actualización debe conservar, para cada capacidad afectada, identificador estable, descripción, alcance de datos, estado, evidencia/origen, restricciones, riesgos y fecha de última revisión.
3. El contrato debe enlazar de forma relativa a `README.md` como fuente del contrato global de mantenimiento y de los estados válidos.
4. Si el cambio afecta a más de un rol, cada contrato afectado debe reflejarlo sin duplicar ni inventar evidencia.
5. Los contratos continúan siendo requisitos vivos; no conceden permisos reales ni sustituyen una matriz de autorización aprobada.

La redacción puede adaptarse al rol, pero no puede omitir ninguno de los cinco elementos anteriores.

## Límites estrictos

- No crear, quitar ni cambiar capacidades, permisos, restricciones o estados ya registrados en los contratos.
- No modificar `docs/roles/README.md`, hosting, topología, PREGUNTAS, `PROJECT-STATE.md`, `PROJECT-BRAIN.md`, ADRs o cualquier archivo fuera de los tres contratos y la futura ENTREGA de esta REF.
- No tocar código, dependencias, credenciales, cPanel, Vercel, GitHub remoto, MySQL, datos reales ni infraestructura.
- No convertir la recomendación de stack o topología en una decisión/ADR.

## Criterios exactos para auditoría

El `reviewer_auditor` debe poder verificar independientemente que:

1. Sólo se modificaron `ADMIN.md`, `WORKER.md`, `CLIENT.md` y, para reportar, `HANDOFF/ENTREGA-VAAK-ACCESS-1-B.md`; no existen cambios fuera de ese alcance.
2. Cada uno de los tres contratos contiene una sección visible y específica de mantenimiento que nombra su propio contrato como destino de actualización.
3. Cada sección exige actualizar el contrato ante una función, permiso, límite o flujo que afecte al rol, e incluye también datos visibles, aprobaciones e integraciones para no dejar vacíos de alcance.
4. Cada sección exige los ocho metadatos: identificador estable, descripción, alcance de datos, estado, evidencia/origen, restricciones, riesgos y fecha de última revisión.
5. Cada contrato enlaza funcionalmente a `README.md` y no contradice la regla global ni los estados válidos del índice.
6. Ningún texto declara capacidades implementadas, permisos aprobados, decisiones de topología, cambios de hosting o controles de infraestructura inexistentes.
7. Se conservan YAML frontmatter válido, la REF histórica `VAAK-ACCESS-1-A` de las capacidades existentes y la trazabilidad de que esta modificación procede de `VAAK-ACCESS-1-B`; si para reflejar esta última referencia se actualiza frontmatter, debe hacerlo de forma coherente y sin borrar la procedencia anterior de las capacidades.
8. La ENTREGA identifica los tres diffs, cita esta ORDEN y el VEREDICTO previo, declara explícitamente que no hubo cambios de producto ni infraestructura, y aporta evidencia de validación de frontmatter y de los enlaces relativos.

## Evidencia esperada en la ENTREGA

- Tabla de los tres archivos modificados, con la sección añadida y su enlace a `README.md`.
- Diff o descripción precisa que demuestre que las tablas de capacidades no cambiaron.
- Validación de YAML frontmatter y comprobación de que los enlaces relativos a `README.md` resuelven.
- Declaración de alcance: sin cambios a cPanel, Vercel, GitHub remoto, MySQL, credenciales, datos reales, topología, hosting ni código.

## Siguiente paso

Esta ORDEN se entrega a `reviewer_auditor` para revisión independiente antes de cualquier modificación documental. Mantener la REF `VAAK-ACCESS-1-B` durante todo el ciclo.
