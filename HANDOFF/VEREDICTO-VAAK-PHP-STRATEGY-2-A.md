---
artifact_type: VEREDICTO
phase: "0"
ref: "VAAK-PHP-STRATEGY-2-A"
from: reviewer_auditor
to: architect_chief
status: approved
blocking: false
created_at: "2026-08-28"
updated_at: "2026-08-28"
review_cycle: 2
---

# VEREDICTO — Estrategia segura de PHP para staging

## Resultado

**APROBADO**

La ORDEN revisada corrige los siete cambios obligatorios del ciclo 1 y es conforme con la instrucción humana literal, las fuentes verificables y los frenos de `AGENTS.md`. Puede presentarse a la humana como estrategia lista para decidir.

Esta aprobación **no autoriza implementación**. No permite cambiar PHP, contratar o aprovisionar infraestructura, preparar o cargar una release, instalar dependencias, crear base de datos o cron, desplegar Laravel, modificar el sitio principal ni adoptar stack o ADR. Cualquier ejecución posterior requiere una REF aplicable, revisión independiente y autorización humana explícita.

## Control de ciclo e independencia

- REF estable: `VAAK-PHP-STRATEGY-2-A`.
- Ciclo 1: `CAMBIOS SOLICITADOS` por falta de fidelidad a las cinco opciones, ticket redundante y estrategia incompleta.
- Ciclo 2: `APROBADO` tras verificar las correcciones de forma independiente.

El rol personalizado `reviewer_auditor` no estuvo disponible por incompatibilidad de modelo. Se utilizó un agente separado equivalente, instruido con `AGENTS.md` y los cinco archivos de `HANDOFF/`, independiente del agente que revisó la ORDEN. Este agente no editó la ORDEN ni implementó.

## Fuentes contrastadas

Se contrastaron la ORDEN revisada, el VEREDICTO del ciclo 1, la formulación humana literal de las cinco opciones, `AGENTS.md`, `PROJECT-BRAIN.md`, `PROJECT-STATE.md`, los cinco archivos de gobierno de `HANDOFF/`, `02-hosting-constraints.md`, `03-staging-preflight-hpgilatam.md` y los artefactos ORDEN, ENTREGA y VEREDICTO de `VAAK-HOSTING-1-A`. Las fuentes canónicas no presentan modificaciones posteriores al ciclo 1; la ORDEN revisada es el único insumo de estrategia actualizado para este ciclo.

## Auditoría de los cambios obligatorios

| # | Cambio exigido en ciclo 1 | Verificación del ciclo 2 | Resultado |
|---:|---|---|---|
| 1 | Comparar fielmente las cinco opciones humanas | La nueva tabla conserva las cinco estrategias y su sentido: desarrollo compatible, compatibilidad del sitio principal, staging independiente, preparación externa de Laravel y alternativa para hosting compartido. Reconoce correctamente que 3 y 4 pueden complementarse. | Corregido |
| 2 | Eliminar el ticket redundante de aislamiento | La ORDEN registra que soporte ya confirmó ausencia de MultiPHP y selector global; declara que no volverá a pedir esa confirmación. El próximo paso no requiere ticket. | Corregido |
| 3 | Priorizar entorno separado | Staging temporal externo, cuenta cPanel separada o entorno administrado independiente queda como dirección prioritaria antes de cualquier prueba con PHP moderno. La compatibilidad del sitio principal se reserva para un trabajo futuro opcional sobre réplica. | Corregido |
| 4 | Completar Composer/release fuera del servidor | Define local/CI equivalente al destino, `composer.lock`, instalación de producción sin dependencias de desarrollo, comprobación de plataforma, activos compilados, `vendor/`, artefacto inmutable, manifiesto, hashes y exclusión de secretos. Prohíbe Composer y Node en el servidor. | Corregido |
| 5 | Un único próximo paso humano no mutante | Solicita una sola respuesta `A` o `B` para elegir qué categoría de entorno independiente comparar documentalmente. No contrata, aprovisiona, cotiza de forma vinculante, crea recursos, carga datos ni despliega. | Corregido |
| 6 | Corregir disponibilidad y alcance de evidencia | SSH, Terminal y Composer se tratan como no disponibles bajo la evidencia vigente. Extensiones y límites quedan expresamente acotados a la configuración PHP actual y no se extrapolan a PHP 8.3/8.4. | Corregido |
| 7 | Preservar interfaz, frenos y ausencia de stack/ADR | Declara impacto actual cero y mantiene intactos prototipo, navegación, estilos, roles, idioma, datos, sitio principal y staging. No selecciona Laravel, versión PHP, proveedor, topología final ni ADR; no autoriza despliegue. | Corregido |

## Verificaciones específicas solicitadas

### Sin petición redundante a soporte

**Conforme.** No se solicita confirmar de nuevo MultiPHP ni el alcance global de PHP Selector. Las comprobaciones operativas del proveedor quedan fuera del paso humano actual.

### Staging independiente prioritario

**Conforme.** La estrategia reduce primero el radio de impacto mediante un entorno separado. El webroot actual independiente no se confunde con aislamiento de runtime.

### Release Composer preparada fuera

**Conforme.** La especificación es reproducible y no depende de CLI en el hosting. Su preparación efectiva sólo procede si una decisión futura adopta un stack que la necesite; por ahora no se crea ni se carga ningún artefacto.

### Único próximo paso humano

**Conforme.** La humana debe responder únicamente:

- `A`: comparar documentalmente una cuenta cPanel separada temporal; o
- `B`: comparar documentalmente un entorno PHP administrado externo temporal.

La elección define sólo la categoría que estudiará una REF posterior. No activa proveedor ni freno de gasto.

### Interfaz, stack y despliegue

**Conforme.** El impacto actual sobre la interfaz es cero. La ORDEN no adopta stack, versión PHP, Laravel, proveedor, topología final ni ADR. Tampoco autoriza desarrollo de Laravel, build, carga, migración o despliegue.

## Estrategia aprobada para presentar a la humana

1. Mantener sin cambios el PHP global 7.3 de la cuenta actual; es congelamiento operativo, no runtime elegido para VAAK.
2. Evaluar primero un staging realmente independiente mediante la elección documental `A/B`.
3. Mantener la compatibilidad del sitio principal como análisis futuro separado si se contempla una actualización global; un inventario por sí solo no basta.
4. Si posteriormente se adopta un stack con Composer, construir la release reproducible fuera del servidor y desplegarla sólo tras los controles, VEREDICTO y autorización correspondientes.
5. Mantener abierta la evaluación de otra solución adecuada para hosting compartido sin convertir esta estrategia en ADR.

## Cierre

La revisión 2 queda **APROBADA** y cierra la auditoría de esta ORDEN. El único siguiente paso permitido es presentar a la humana la elección documental `A/B`. La aprobación no inicia ejecución ni modifica el estado remoto.
