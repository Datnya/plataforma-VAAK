---
artifact_type: VEREDICTO
phase: "3"
ref: "VAAK-ACCESS-3-C"
from: reviewer_auditor
to: architect_chief
status: changes_requested
blocking: true
created_at: "2026-08-31"
review_stage: design
cycle: 2
result: CAMBIOS_SOLICITADOS
---

# VEREDICTO R2 de diseño — VAAK-ACCESS-3-C

## RESULTADO: CAMBIOS SOLICITADOS

La revisión R2 resolvió completamente `H-R1-03` y avanzó de forma sustancial en los otros tres hallazgos. Sin embargo, `H-R1-01`, `H-R1-02` y `H-R1-04` conservan contradicciones internas puntuales. La ORDEN todavía no puede aprobarse porque esas contradicciones permiten resultados distintos según qué apartado use el Ejecutor como autoridad.

Esta auditoría se limitó exclusivamente a verificar `H-R1-01`…`H-R1-04` y las contradicciones introducidas por sus correcciones. No se reabrieron los apartados conformes de R1 ni se auditó una implementación futura.

## Resultado por hallazgo R1

| Hallazgo | Estado R2 | Verificación |
|---|---|---|
| `H-R1-01` — autoridad normativa | PARCIAL | Las matrices §4.1–§4.2 eliminan la mayoría de permisos inventados, pero tres cruces aún se contradicen. |
| `H-R1-02` — equivalencia C01–C39 | PARCIAL | §8.1 ya es fuente normativa externa a la suite, pero omite subcasos literales exigidos por C15/C32 y mantiene un default Worker no cerrado. |
| `H-R1-03` — recursión C39 | RESUELTO | `access-verify.js` es padre único, no aparece en `CHILD_COMMANDS`, acceptance reporta C01–C38 y sólo el padre agrega C39. |
| `H-R1-04` — capturas reproducibles | PARCIAL | §10 define generación correlacionada y offline sobre loopback, pero §§11 y 14 todavía prohíben esa misma red sin exceptuar loopback. |

## Hallazgos bloqueantes restantes

### H-R2-01 — La matriz normativa aún tiene tres representaciones incompatibles — CRÍTICA

1. §4.1 define el ID real `section.dashboard` tanto para el dashboard interno como para el portal Client, pero el ceiling exacto y C01/C03 usan el pseudo-ID `dashboard-client`. El catálogo sigue teniendo ocho secciones y no define `section.dashboard-client`. Por tanto, una prueba de grants no puede saber si debe inyectar `section.dashboard`, un ID inexistente o una modalidad contextual.

2. §4.2 y C06 deniegan a los tres roles `edit-project-card`, `add-team-member`, `remove-team-member`, `edit-banner`, `gallery`, `set-banner-cover`, `remove-banner-image` y `delete-viewed-image`. No obstante, §5.7 todavía afirma que “Project, datos, banner, galería y equipo son Admin-only”, expresión que concede semánticamente Admin mientras la matriz lo deniega.

3. C19 conserva “exactamente seis defaults compatibles” para Worker, pero el ceiling Worker de §4.1 contiene sólo cinco secciones. El sexto default histórico es Orders, ahora negativo para Worker. La ORDEN no enumera el conjunto persistido ni declara expresamente si ese grant legado debe eliminarse o conservarse inefectivo; llamarlo compatible contradice la matriz cerrada.

**Corrección requerida:** usar IDs reales en los ceilings —por ejemplo `section.dashboard` con modalidad Client resuelta por actor/contexto— o introducir formalmente otro ID y ajustar el catálogo. Sustituir “Admin-only” en §5.7 por la regla exacta de §4.2: lectura A/W y las ocho mutaciones `DENY` para todos. Enumerar literalmente los defaults de C19 y alinearlos con el ceiling normativo; no persistir como `enabled` una capacidad `Proposed` salvo que se documente como estado legado inefectivo y se pruebe que nunca aparece como acceso habilitado.

### H-R2-02 — El anexo cerrado todavía no equivale a dos criterios completos — ALTA

El anexo §8.1 ya impide que la suite invente libremente los nombres de prueba, lo cual corrige el núcleo de R1. Quedan dos omisiones mecánicas:

- C15 exige para Client A y B cuatro consumidores propios y cruzados: dashboard, listado/ruta Orders, preview y manipulación por ID. Sus claves sólo separan `list` y `preview`; no existen claves distintas para dashboard y Orders route/card. Un único `client-*-list-*` puede volver a colapsar dos superficies, justamente el tipo de equivalencia nominal que se intenta impedir.
- C32 exige relectura STORE+SESSION antes de `download`, aun cuando la policy finalmente lo deniegue. El anexo incluye `read-preview` pero omite `read-download`.

Además, `legacy-worker-defaults-6` no fija los seis IDs y hereda la ambigüedad de `H-R2-01`.

**Corrección requerida:** añadir claves separadas de C15 para dashboard y Orders route/list, propias y cruzadas, para ambos clientes; añadir `read-download` a C32; y hacer que C19 enumere el conjunto exacto esperado. Reflejar literalmente esas claves en el contrato congelado de `access-verify.js`. No se solicita rediseñar los demás criterios.

### H-R2-03 — La excepción loopback se contradice con dos prohibiciones absolutas — ALTA

§10 autoriza expresamente `127.0.0.1` y obliga a levantar un servidor Node local para generar las 20 capturas. En cambio:

- §11 termina con “No inicializar Git, instalar paquetes ni usar red”.
- §14 ordena detenerse si “la solución requiere backend, red, dependencia…”.

Leídas literalmente, ambas reglas obligan a detener el mecanismo que §10 exige. La regla específica no elimina la contradicción documental porque C38 pretende demostrar el límite de red y el Ejecutor recibe simultáneamente una condición de detención.

**Corrección requerida:** sustituir en §§11 y 14 `red` por `red externa`, dejando explícita la misma excepción única de §10: loopback `127.0.0.1` sólo durante el harness. Mantener bloqueados localhost no-loopback, LAN, Internet y cualquier URL externa.

## Correcciones R2 conformes que deben conservarse

- Matrices normativas que convierten `Proposed`, pendientes y fuera de matriz en `DENY`.
- Orders persistidas negativas para Admin/Worker; descarga y eliminación negativas para todos; Client sólo list/preview con relación exacta.
- `user.access.version: 2`, F08 con colecciones vacías enumeradas y separación respecto de `schemaVersions`.
- Anexo §8.1 como fuente de expectativas y comparación de conjuntos por el Auditor.
- Runner padre `access-verify.js`, lista hija cerrada no recursiva y propiedad exclusiva de C39.
- Generación de 20 PNG en la misma corrida, callbacks correlacionados, CSP local, bloqueo externo, dimensiones/hashes y directorio exacto de 21 archivos.

## Cierre

La REF `VAAK-ACCESS-3-C` permanece bloqueada en diseño. El Arquitecto debe corregir únicamente `H-R2-01`…`H-R2-03`, conservar la misma REF y devolverla para el ciclo 3. No se autoriza implementación ni edición de producto con este VEREDICTO.
