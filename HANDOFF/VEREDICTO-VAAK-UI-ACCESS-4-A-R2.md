---
artifact_type: VEREDICTO
phase: "ui_access"
ref: "VAAK-UI-ACCESS-4-A"
from: reviewer_auditor
to: architect_chief
status: approved
blocking: false
created_at: "2026-09-01"
review_stage: design
cycle: 2
result: APROBADO
---

# VEREDICTO R2 de diseño — VAAK-UI-ACCESS-4-A

## RESULTADO: APROBADO

La ORDEN revisada resuelve `H-R1-01`…`H-R1-05`, incorpora la aceptación humana de una reconstrucción fiel ante la imposibilidad de recuperar el archivo pre-3-C y preserva los aspectos conformes de R1. Esta aprobación corresponde únicamente al diseño de la misma REF; no declara implementado ni verificado el producto.

## Verificación acotada

| Hallazgo R1 | Corrección verificada en R2 | Estado |
|---|---|---|
| `H-R1-01` — baseline incompleto | §§1–3 reconocen el archivo de 138,535 bytes/hash `793C8C...` como huella histórica no recuperable, registran la aceptación humana y relegan el archivo de staging de 53,565 bytes a evidencia parcial de sólo lectura. El corpus cerrado, las nueve rutas y las 41 acciones sustituyen la falsa promesa byte-equivalente. | RESUELTO |
| `H-R1-02` — comparación visual inválida | §§9 y 11 eliminan el falso `before`: exigen ledger de procedencia, checkpoint `reconstructed-pre-access`, serie final comparable, revisión visual de todas las referencias y gates exactos 9/41. Las capturas 3-C quedan separadas y no acreditan superficies que no muestran. | RESUELTO |
| `H-R1-03` — SESSION compartida | §8 usa actor tab-local en `sessionStorage`, v8 compartido en `localStorage`, bootstrap legacy de una sola vez y pruebas reales Admin/Worker y Admin/Client bajo el mismo origen y mediante `storage` event real. | RESUELTO |
| `H-R1-04` — migración multi-clave | §7 define un único estado canónico `vaak-local-v8`, una sola escritura, fuentes v6/v7 intactas, validadores y mapping por entidad, idempotencia y fallos inyectados sin prometer rollback multi-clave. | RESUELTO |
| `H-R1-05` — alcance de Admin | §§4–5 separan siete secciones Admin fijas ON y scope `all` implícito de las capacidades funcionales. La matriz enumera exactamente las 41 acciones y mantiene `Proposed`/fuera de matriz como `DENY`. | RESUELTO |

## Conformidades preservadas

Se mantienen sin debilitamiento:

- siete renglones visibles para Worker/Client y ceilings exactos por rol;
- Admin total e inmutable en secciones, sin grants ni scope editables;
- Tools como dependencia efectiva de Suppliers/Specs sin borrar preferencias;
- `project` derivado, `all` dinámico para proyectos actuales/futuros y `selected` explícito;
- intersección de scope Client con autorización de PO;
- revalidación de rutas/acciones, fallback, logout y modal stale;
- conservación de `refinements.css`, `presentation.js`, `styles.css`, logo y activos;
- límites estrictos de localhost, sin staging, bridge remoto, backend, deploy, dependencias ni red externa.

## Límite del VEREDICTO

La futura ejecución deberá demostrar los gates, matrices, migración, sesiones simultáneas y evidencia visual exigidos en la ORDEN. Este VEREDICTO no aprueba anticipadamente una ENTREGA ni autoriza desviaciones del corpus o de los contratos funcionales.
