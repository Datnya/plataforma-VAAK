# AGENTS.md — Gobierno adversarial de VAAK

Estas instrucciones aplican a todo el workspace.

## Objetivo y criterio de uso

Trabajar con criterio proporcional al riesgo. El flujo normal para tareas pequeñas, claras, locales y reversibles es ejecución directa por Codex, con la verificación necesaria y sin crear una REF ni activar agentes adicionales.

El ciclo adversarial se reserva para cuando el humano lo solicite expresamente o cuando la tarea sea materialmente compleja o riesgosa, por ejemplo: arquitectura transversal, autenticación/autorización, seguridad, migraciones de datos, producción, despliegues, infraestructura, decisiones difíciles de revertir o cambios que afecten varias áreas críticas.

Cuando se active, operar un ciclo secuencial entre dos agentes personalizados:

1. `architect_chief` formula la arquitectura, el plan por fases y el borrador de ORDEN.
2. `reviewer_auditor` lo audita de forma independiente y emite VEREDICTO.
3. Si el resultado es `CAMBIOS SOLICITADOS`, el Arquitecto revisa únicamente los puntos señalados y devuelve la misma `REF` al Auditor.
4. Si el resultado es `RECHAZADO`, se detiene el ciclo y se escala al humano.
5. Si el resultado es `APROBADO`, se presenta al humano como base lista para decidir. La aprobación del Auditor no autoriza implementación.

Máximo tres ciclos de revisión por REF. Si no hay aprobación, escalar al humano con el desacuerdo exacto.

## Regla de ejecución cuando se activa handoff

Para el alcance sometido a handoff, no editar código del producto, instalar dependencias, ejecutar migraciones, desplegar, hacer push/merge ni iniciar implementación hasta que:

- exista VEREDICTO `APROBADO` del `reviewer_auditor`, y
- el humano autorice explícitamente comenzar la ejecución.

## Activación y orquestación

No activar handoff por defecto para documentación sencilla, consultas, inspecciones de sólo lectura, ajustes locales acotados, mantenimiento rutinario o cambios fácilmente reversibles. En esos casos, actuar directamente y mantener actualizadas sólo las fuentes afectadas.

Activar handoff cuando:

- el humano lo pida explícitamente;
- exista riesgo material de seguridad, datos, producción, infraestructura o gasto;
- se vaya a adoptar o modificar una arquitectura/ADR;
- el alcance sea transversal y la revisión independiente aporte valor claro.

Si se activa:

1. Conservar el texto original sin reinterpretarlo silenciosamente.
2. Invocar primero a `architect_chief` y esperar su artefacto completo.
3. Invocar después a `reviewer_auditor` con la instrucción original, el artefacto del Arquitecto y el estado verificable del repositorio.
4. Esperar el VEREDICTO antes de continuar.
5. Mantener una sola `REF` durante toda la revisión.
6. Entregar al humano el resultado consolidado y los desacuerdos visibles.

Los dos agentes no deben trabajar en paralelo sobre la misma propuesta: la independencia se conserva mediante revisión secuencial, no mediante escrituras concurrentes.

Si hay duda razonable y la tarea es local, reversible y de bajo riesgo, preferir ejecución directa. Si Codex activa handoff sin petición expresa, debe explicar brevemente por qué el riesgo o complejidad lo justifica.

## Frontmatter de artefactos handoff

Todo plan, ADR, ORDEN, PREGUNTA, HALLAZGO o VEREDICTO creado dentro de un ciclo handoff debe empezar con YAML válido:

```yaml
---
artifact_type: ORDEN
phase: "0"
ref: "VAAK-0-A"
from: architect_chief
to: reviewer_auditor
status: draft_for_review
blocking: true
created_at: "YYYY-MM-DD"
---
```

La `REF` es obligatoria, única y estable. Las fechas usan ISO 8601. `status` describe el estado real; no usar `approved` antes del VEREDICTO correspondiente.

## Fuentes de gobierno del handoff

Cuando se active handoff, leer los cinco archivos de `HANDOFF/` completos. Sus nombres y títulos internos están desalineados; para evitar inferencias erróneas, el contenido vigente se interpreta así:

- `HANDOFF/README.md`: rol y principios del Arquitecto.
- `HANDOFF/01-PROTOCOLO-HANDOFF.md`: guía de implementación del sistema.
- `HANDOFF/02-ROL-ARQUITECTO.md`: estructura y mantenimiento de PROJECT-STATE.
- `HANDOFF/03-ROL-EJECUTOR.md`: introducción y ciclo general de doble agente.
- `HANDOFF/04-ESTADO-PROYECTO.md`: protocolo formal de los cinco mensajes.

Si una memoria de agente contradice un archivo verificable, gana el archivo. Si dos documentos se contradicen, detenerse y elevar una PREGUNTA al humano.

## Contexto persistente

Antes de planificación amplia, auditoría, implementación o cambios con impacto acumulativo, leer `PROJECT-BRAIN.md` completo (contexto estable), `PROJECT-STATE.md` completo (estado dinámico) y los ADR/artefactos pertinentes. Para tareas pequeñas basta leer las fuentes necesarias de forma proporcional. La memoria de ChatGPT/Codex no sustituye los archivos. Mientras no exista una raíz Git verificable, iniciar Codex desde la raíz del workspace; no inicializar Git ni configurar archivos fallback sin autorización humana.

## Frenos humanos

Requieren autorización humana explícita:

- operaciones destructivas o irreversibles;
- producción, despliegue, push o merge a rama principal;
- secretos, credenciales o cambios de seguridad sensibles;
- gasto externo estimado mayor a USD 5;
- activar proveedores en modo real;
- modificar una decisión de producto o ADR aprobado.
