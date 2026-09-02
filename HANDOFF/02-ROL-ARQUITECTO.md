# 04 — El Estado del Proyecto: la memoria compartida que nunca se pierde

> **Qué aprenderás aquí:** qué es PROJECT-STATE.md, por qué existe, qué secciones tiene, y cómo mantenerlo actualizado para que dos agentes con contexto fresco puedan retomar un proyecto complejo en segundos.

---

## El problema que resuelve

Los modelos de lenguaje tienen contexto finito. Cuando una sesión de Claude Code termina, el agente "olvida" todo lo que pasó. Si tu proyecto tiene 30 sub-fases completadas, el agente del día de mañana no sabe nada de ellas.

Hay dos enfoques para resolver esto:

**Enfoque malo:** Pasarle al agente un resumen en el prompt de sistema. El problema: tú tienes que mantener ese resumen manualmente, inevitablemente se desactualiza, y cuando el agente pregunta "¿qué hicimos en la sub-fase 12?" no hay manera de saberlo con certeza.

**Enfoque del protocolo:** Un archivo estructurado (`PROJECT-STATE.md`) que el Arquitecto actualiza después de cada VEREDICTO. Es la única fuente de verdad. Si el archivo y la memoria de un agente discrepan, **el archivo gana**.

---

## Qué es PROJECT-STATE.md

Es el **diario de decisiones y avance del proyecto**. No es un documento de diseño (eso son los ADRs). No es un plan de fases (eso es el roadmap). Es el estado actual verificado.

Una sesión de Claude Code siempre empieza con:
```
Paso 1: Leer PROJECT-STATE.md
```

En 2 minutos, el agente sabe exactamente dónde está el proyecto, qué está aprobado, qué está en progreso, qué riesgos están abiertos, y qué sigue.

---

## Las 8 secciones del PROJECT-STATE

### Sección 1: Encabezado y fecha

```markdown
# PROJECT-STATE.md — [Nombre del proyecto]

> Fuente de verdad compartida. El Arquitecto lo actualiza con cada VEREDICTO.
> Si este archivo y la memoria de un agente discrepan, este archivo gana.

**Última actualización:** 2026-06-15 · **Por:** Arquitecto (VEREDICTO M-3 APROBADO)
```

La fecha y el contexto del último VEREDICTO son críticos. Dicen cuándo fue la última actualización verificada y por qué se actualizó.

### Sección 2: Qué es el proyecto (2-3 líneas)

No es la documentación completa del producto. Es lo mínimo para que un agente con contexto fresco entienda el dominio en 10 segundos.

```markdown
## 1. Qué es el proyecto

SaaS de automatización de contenido en video. Pipeline de IA (LangGraph) que 
genera video/audio desde texto, marketplace de clonación de voz, y publicación 
automática a redes sociales. Stack: Next.js 16 + Supabase + Tailwind v4 + Remotion.
```

### Sección 3: Fase actual (la más importante)

```markdown
## 2. Fase actual

**→ Phase 3 — Migración de Storage. M-2 APROBADO (2026-06-10, commit abc1234); M-3 SIGUIENTE.**

Rama dedicada: `migration/supabase` desde `develop`.
Plan completo: `docs/phases/PHASE-3-MIGRATION.md`.
Briefs de sub-fases: `docs/handoff/EXECUTOR-PHASE-M-{1,2,3,4}.md`.
```

### Sección 4: Mapa de fases (tabla de estado)

```markdown
## 3. Mapa de fases

| Sub-fase | Descripción | Estado |
|----------|-------------|--------|
| M-1 | Fundación: schema + RLS en Supabase | ✅ APROBADO (commit 3d38e0f) |
| M-2 | Client shim — misma interfaz, nuevo backend | ✅ APROBADO (commit 15eade9) |
| M-3 | Storage — buckets + políticas + rutas | ⬜ SIGUIENTE |
| M-4 | Cutover — reseed + middleware + merge | ⬜ |
```

Los estados posibles:
- `⬜ PENDIENTE` — no empezada
- `🔄 EN PROGRESO` — ORDEN emitida, esperando ENTREGA
- `📋 EN REVISIÓN` — ENTREGA recibida, Arquitecto auditando
- `✅ APROBADO (commit X)` — VEREDICTO APROBADO, commit registrado
- `⏸️ PAUSADA` — en espera de algo externo

### Sección 5: Decisiones registradas (ADRs)

```markdown
## 4. Decisiones registradas (ADRs)

- **ADR-001 — Convención RLS**: toda policy usa `profiles WHERE id = auth.uid()`.
  Surgió como HALLAZGO en sub-fase 49-J. Afecta 49-C y todos los futuros cambios de RLS.
  
- **ADR-002 — Client shim de Supabase**: conservar nombres `getServerInsforge/getAdminInsforge`.
  Elimina churn en 578 puntos del código al migrar de proveedor.
  
- **ADR-003 — Prisma como herramienta de migración**: Prisma gestiona el schema.
  No se usa como ORM en runtime. Decisión de Rodrigo 2026-05-28.
```

Este resumen de ADRs permite que un agente nuevo sepa qué decisiones ya se tomaron sin tener que leer todos los archivos de arquitectura.

### Sección 6: Lo que la última fase dejó verificado

```markdown
## 5. Lo que la última fase dejó verificado

- **M-2 APROBADO 2026-06-10** (auditado de primera mano):
  - 705 tests verdes. 0 errores TS.
  - Shim funciona: `.database.from()`, `.storage.from()`, `.auth` — todos operativos.
  - Auth SSR: cookies correctas en rutas protegidas.
  - Mocks intactos: 83 sites de `.database.from()` sin cambios.
```

Esto documenta exactamente qué se verificó en el último VEREDICTO. Si algo falla después, este registro permite saber si fue auditado o asumido.

### Sección 7: Pendientes y riesgos abiertos

```markdown
## 6. Pendientes y riesgos abiertos

| # | Pendiente | Severidad | Sub-fase |
|---|-----------|-----------|----------|
| 1 | URLs de pipeline usan host del proveedor anterior | ALTA | M-3 |
| 2 | music/renders deberían ser privados con signed URLs | MEDIA | M-4 |
| 3 | Secreto de Stripe sin rotar (incidente 2026-06-01) | BAJA | M-4 runbook |
```

Los riesgos abiertos son deuda explícita. No son secretos. Están visibles para que el Arquitecto los evalúe en cada sub-fase siguiente.

### Sección 8: Foco de auditoría para la fase actual

```markdown
## 7. Foco de auditoría (Phase M-3)

El Arquitecto vigila con prioridad:
1. Buckets privados no expuestos como públicos
2. RLS de voice-samples: aislamiento cross-org real (no solo el SQL)
3. uploadAuto usa UUID, no nombre+tamaño
4. Rutas autenticadas tienen prefijo org/ en los paths de storage
```

Este foco se actualiza con cada VEREDICTO. Le dice al Arquitecto siguiente qué mirar con más atención.

---

## Cómo actualizar PROJECT-STATE después de cada VEREDICTO

El Arquitecto actualiza PROJECT-STATE antes de entregar el VEREDICTO al humano:

1. **Cambia el estado de la sub-fase** de `🔄 EN PROGRESO` a `✅ APROBADO (commit X)` o `📋 EN REVISIÓN` según corresponda
2. **Actualiza la sección "Fase actual"** para reflejar la siguiente sub-fase
3. **Registra lo que se verificó** en la sección "Lo que la última fase dejó verificado"
4. **Agrega nuevos riesgos** identificados en la auditoría a "Pendientes y riesgos abiertos"
5. **Actualiza el foco de auditoría** para la próxima sub-fase
6. **Agrega nuevos ADRs** si el VEREDICTO produjo decisiones de arquitectura
7. **Actualiza la fecha** en el encabezado

Este proceso toma 5-10 minutos y evita horas de re-contexto en sesiones futuras.

---

## Ejemplo real: cómo un HALLAZGO enriquece el PROJECT-STATE

En el proyecto real de este protocolo, durante la migración de base de datos, el Ejecutor descubrió que la sintaxis `CREATE POLICY IF NOT EXISTS` (que el proveedor anterior toleraba) hace que Supabase falle con error de sintaxis.

El flujo fue:
1. **HALLAZGO** del Ejecutor → describe el problema con evidencia
2. **Decisión del Arquitecto** → la convención correcta es `DROP POLICY IF EXISTS + CREATE POLICY`
3. **ADR-003** → standing rule sobre cómo manejar policies en el futuro
4. **PROJECT-STATE actualizado** → el HALLAZGO queda documentado con la fecha, la causa, y la resolución

Resultado: todos los agentes futuros que trabajen en este proyecto saben que existe esta restricción, qué la causó, y cómo manejarla. No tienen que descubrirla de nuevo.

---

## La regla de oro del PROJECT-STATE

**Si pasó algo importante (un HALLAZGO, una decisión, una aprobación, un cambio de plan), y no está en PROJECT-STATE, no pasó.**

Para los agentes, la realidad es lo que pueden leer. Un incidente que no se documentó es invisible para el siguiente agente que trabaje en el proyecto. Un riesgo no escrito es un riesgo no gestionado.

Este archivo es la diferencia entre un proyecto con historia trazable y una serie de chats que nadie puede seguir.

---

## Plantilla de PROJECT-STATE para tu proyecto

```markdown
# PROJECT-STATE.md — [Tu proyecto]

> Fuente de verdad compartida. El Arquitecto lo actualiza con cada VEREDICTO.
> Si este archivo y la memoria de un agente discrepan, este archivo gana.

**Última actualización:** [fecha]  ·  **Por:** Arquitecto ([VEREDICTO X APROBADO/EN REVISIÓN])

---

## 1. Qué es el proyecto

[2-3 líneas: qué hace el producto, para quién, tecnologías principales]

## 2. Fase actual

**→ [Fase X — Descripción]. [Sub-fase anterior] APROBADA; [Sub-fase siguiente] SIGUIENTE.**

Rama: `[rama-actual]` desde `[rama-base]`.
Plan: `docs/phases/PHASE-X.md`.

## 3. Mapa de fases

| Sub-fase | Descripción | Estado |
|----------|-------------|--------|
| X-1 | [primera sub-fase] | ⬜ PENDIENTE |

## 4. Decisiones registradas (ADRs)

[Vacío al inicio — se llena con cada decisión de arquitectura]

## 5. Lo que la última fase dejó verificado

[Vacío al inicio — se llena con el primer VEREDICTO]

## 6. Pendientes y riesgos abiertos

| # | Pendiente | Severidad | Sub-fase |
|---|-----------|-----------|----------|

## 7. Foco de auditoría para la fase actual

[Lo que el Arquitecto vigila especialmente en esta fase]
```
