# 01 — Protocolo de Handoff: El lenguaje entre los agentes

> **Qué aprenderás aquí:** el formato exacto de los mensajes que usan los dos agentes para comunicarse. Entender esto es entender cómo se elimina la ambigüedad en un proyecto de IA.

---

## ¿Por qué existe un protocolo?

Sin formato fijo, los dos agentes se comunicarían en prosa libre. Esto genera problemas reales:
- El Ejecutor interpreta mal el alcance y construye de más (o de menos)
- El Arquitecto no sabe qué parte auditar porque el reporte no tiene estructura
- El humano tiene que "traducir" entre los dos, que es trabajo cognitivo innecesario
- Las preguntas bloqueantes se mezclan con reportes de progreso

El protocolo resuelve esto con **5 tipos de mensaje, cada uno con estructura fija**. Si un handoff no encaja en uno de los 5 tipos, no es un handoff válido.

---

## Tu rol como humano: el transporte

Tú eres el cable entre los dos paneles. Tu trabajo es mecánico:

```
Panel Izquierdo (Arquitecto)     Tú          Panel Derecho (Ejecutor)
         │                        │                    │
         │── emite ORDEN ────────►│                    │
         │                        │── pegas ORDEN ────►│
         │                        │                    │── construye
         │                        │◄── ENTREGA ────────│
         │◄── pegas ENTREGA ──────│                    │
         │── audita               │                    │
         │── emite VEREDICTO ────►│                    │
         │                        │── pegas VEREDICTO ►│
```

El protocolo está diseñado para que ese copiado sea **mecánico**. No tienes que decidir qué pegar ni cuándo — la estructura del mensaje lo hace obvio.

**Excepción:** Cuando un mensaje tiene `PARA: [tu nombre]` en la cabecera, está dirigido a ti, no al otro agente. En ese caso tú tomas la decisión y respondes.

---

## La cabecera obligatoria

Todo mensaje de handoff empieza así:

```
=== HANDOFF ===
TIPO: <ORDEN|ENTREGA|PREGUNTA|HALLAZGO|VEREDICTO>
FASE: <número de fase>  ·  REF: <id corto, ej. M-3 o 49-J>
```

- `TIPO` → qué clase de mensaje es (uno de los 5 tipos)
- `FASE` → en qué fase del proyecto estamos
- `REF` → identificador único de la tarea. **Este ID no cambia** desde la ORDEN hasta el VEREDICTO. Es el hilo que conecta toda la conversación de esa tarea.

---

## Los 5 tipos de mensaje

### Tipo 1 — ORDEN (Arquitecto → Ejecutor)

**¿Qué es?** Una tarea aprobada y lista para construir. El Arquitecto la emite después de haberla planificado.

**¿Por qué esta estructura?** Porque el Ejecutor necesita exactamente 6 cosas para trabajar sin adivinar:

```
=== HANDOFF ===
TIPO: ORDEN
FASE: 3  ·  REF: M-3

TAREA: <una frase que describe qué construir>
       Ejemplo: "Migrar almacenamiento de archivos a Supabase Storage"

CONTEXTO: <por qué se hace y qué decisión lo respalda>
          Ejemplo: "El proveedor InsForge está siendo reemplazado por Supabase (ADR-002).
          El shape-adapter de M-2 ya existe; M-3 crea los buckets reales."

CRITERIOS DE ACEPTACIÓN:
  - <criterio 1 — verificable mecánicamente>
  - <criterio 2>
  - Ejemplo: "8 buckets creados en Supabase con visibilidad correcta"
  - Ejemplo: "npm run verify verde (705+ tests)"
  - Ejemplo: "uploadAuto usa crypto.randomUUID() — ya no deriva path de nombre+tamaño"

ARCHIVOS PROBABLES: <orientativo — dónde se va a tocar código>
  - src/lib/insforge-compat/wrap.ts
  - src/lib/engines/storage.ts
  - supabase/migrations/070_storage_buckets_rls.sql

FRENOS APLICABLES: <qué NO hacer sin aprobación>
  - No push a main / No abrir PR
  - No buckets públicos por defecto
  - Si mover archivos reales implica costo >$5 → parar y consultar

EVIDENCIA ESPERADA: <qué prueba debe traer la ENTREGA>
  - Lista de buckets + policies (SQL)
  - Test de aislamiento cross-org
  - npm run verify verde
  - git log -1
```

**Lección clave:** Los criterios de aceptación son la diferencia entre "hiciste lo que pedí" y "hiciste lo que imaginé". Escríbelos verificables: algo que pueda correrse o verse, no algo subjetivo.

---

### Tipo 2 — ENTREGA (Ejecutor → Arquitecto)

**¿Qué es?** El reporte de trabajo terminado. Sin este formato completo, el Arquitecto lo devuelve.

**¿Por qué se exige evidencia?** Porque "funciona" no es un estado. "700/700 tests pasan, aquí la salida" sí lo es.

```
=== HANDOFF ===
TIPO: ENTREGA
FASE: 3  ·  REF: M-3

TAREA COMPLETADA: <la frase exacta de la ORDEN>

QUÉ SE HIZO:
  - <lista de archivos creados o modificados con una línea de descripción cada uno>
  - Ejemplo: "supabase/migrations/070_storage_buckets_rls.sql — 8 buckets + RLS policies"
  - Ejemplo: "src/lib/insforge-compat/wrap.ts — uploadAuto ahora usa crypto.randomUUID()"

EVIDENCIA:
  - Tests: 710/710 pasan (npx vitest run — salida adjunta)
  - Type-check: npx tsc --noEmit → 0 errores
  - Buckets: [lista de buckets con su visibilidad public/private]
  - Test aislamiento: org B no puede leer archivo de org A → HTTP 403

DESVIACIONES: <nada, O qué se hizo distinto al plan y por qué>
  Ejemplo: "music bucket creado como PUBLIC en vez de PRIVATE — los renders
  de Remotion necesitan URLs permanentes sin auth. HALLAZGO abierto para M-4."

PENDIENTES: <nada, O qué quedó fuera de alcance explícitamente>
  Ejemplo: "Pipeline webhook uploads no tienen prefijo org/ — deuda documentada
  en HALLAZGO M-3-H1 en el SQL de migración."

LISTO PARA AUDITORÍA: sí
```

**Lección clave:** La sección DESVIACIONES es donde el Ejecutor gana credibilidad. Un agente que esconde lo que no hizo o lo que cambió destruye la confianza. Uno que lo reporta explícitamente permite que el Arquitecto tome una decisión informada.

---

### Tipo 3 — PREGUNTA (cualquiera ↔ cualquiera)

**¿Qué es?** Una aclaración que bloquea (o podría bloquear) el avance. Puede ir en cualquier dirección.

**¿Por qué una sola pregunta?** Porque múltiples preguntas en un solo mensaje crean respuestas parciales y confusión. Una pregunta, una respuesta, continúa.

```
=== HANDOFF ===
TIPO: PREGUNTA
FASE: 3  ·  REF: M-3

BLOQUEA: sí   ← ¿se puede seguir trabajando sin esta respuesta?

PREGUNTA: ¿El bucket "music" debe ser público o privado?

OPCIONES:
  A) Público — URLs permanentes funcionan sin auth. Remotion puede acceder sin credenciales.
               Riesgo: quien tenga el URL puede descargar el archivo.
  B) Privado — Requiere signed URLs (caducan). Más seguro pero necesita cambios en Remotion
               y en cómo se guardan las URLs en la DB.

RECOMENDACIÓN: Opción A por ahora. Los GUIDs son prácticamente inguessables, y el cambio
              a signed URLs puede hacerse en una fase futura sin romper nada.
```

**Lección clave:** El campo `BLOQUEA` es crítico. Una PREGUNTA con `BLOQUEA: sí` tiene prioridad sobre todo lo demás. El Ejecutor no hace nada hasta que llegue la respuesta. `BLOQUEA: no` significa que puede seguir con otras partes mientras espera.

---

### Tipo 4 — HALLAZGO (Ejecutor → Arquitecto)

**¿Qué es?** Algo no previsto que el Ejecutor descubre al construir. Puede ser un bug, una suposición incorrecta del plan, una incompatibilidad, un riesgo de seguridad.

**¿Por qué reportar en vez de arreglar en silencio?** Porque el Ejecutor no tiene el contexto completo para decidir el impacto. Un parche silencioso puede arreglar un síntoma y romper algo más grave.

```
=== HANDOFF ===
TIPO: HALLAZGO
FASE: 3  ·  REF: M-3-H1

QUÉ SE ENCONTRÓ:
  Los uploads del pipeline (webhooks Suno/Replicate, LangGraph nodes) usan el cliente
  anon (sin auth). Las políticas RLS de INSERT que requieren auth.uid() los bloquearán.

EVIDENCIA:
  - src/lib/engines/storage.ts importa `insforge` (anon singleton, sin sesión)
  - Supabase Storage RLS con authenticated role → estos uploads fallarían con error 403
  - 4 rutas afectadas: webhooks/suno, webhooks/replicate, job-queue.ts, voiceover-director.ts

IMPACTO:
  El pipeline de generación de contenido no puede subir archivos con las políticas RLS actuales.
  Afecta el flujo principal del producto.

SE DETUVO EN:
  Cambio de cliente para engines/storage.ts a getAdminInsforge() (service-role, bypasa RLS).
  No aplicado aún. Esperando confirmación del impacto de seguridad de usar service-role.

RECOMENDACIÓN:
  Opción A (recomendada): cambiar engines/storage.ts a getAdminInsforge() — service-role
  bypasa RLS pero es código servidor. El aislamiento se mantiene a nivel DB (pipeline_runs.org_id).
  Opción B: crear políticas RLS adicionales que permitan anon INSERT — menos seguro.
```

**Lección clave:** Un HALLAZGO no es un fracaso. Frecuentemente es lo más valioso de una sub-fase. Descubrir un problema antes de llegar a producción es exactamente para lo que existe el Ejecutor.

---

### Tipo 5 — VEREDICTO (Arquitecto → Ejecutor)

**¿Qué es?** El resultado de la auditoría del Arquitecto. Tres resultados posibles: APROBADO, CAMBIOS SOLICITADOS, RECHAZADO.

**¿Por qué el Arquitecto audita en vez de confiar?** Porque "me dijeron que funciona" no es auditoría. El Arquitecto abre los archivos, corre los greps de verificación, lee los tests. Forma su propio juicio.

```
=== HANDOFF ===
TIPO: VEREDICTO
FASE: 3  ·  REF: M-3

RESULTADO: APROBADO

AUDITORÍA: Revisé lo siguiente:
  - 070_storage_buckets_rls.sql: 8 buckets con visibilidad correcta. RLS policies en
    voice-samples cubren INSERT/SELECT/UPDATE/DELETE con sub-query en profiles. ✓
  - wrap.ts: uploadAuto usa crypto.randomUUID(). Firma acepta opts.orgId. ✓
  - engines/storage.ts: importa getAdminInsforge(). uploadBuffer usa data.url. ✓
  - brand/page.tsx: llama /api/brand/upload-asset, no uploadAuto directo. ✓
  - Rutas con prefijo org/: upload-photo, upload-audio, generate-sfx confirmados. ✓
  - Test vitest: 712/712 pasan (count sube vs baseline de 705). ✓
  - HALLAZGO M-3-H1 documentado en el SQL. Aceptado como deuda para M-4.

SI APROBADO — SIGUIENTE: M-4 (Cutover: reseed + middleware + tooling + merge a develop).
  Brief en docs/handoff/EXECUTOR-PHASE-M-4.md. ORDEN M-4 se emite en la próxima sesión.

NOTAS EN PARALELO:
  - Revisar NEXT_PUBLIC_INSFORGE_URL en .env.local — ya no debe usarse en código nuevo.
  - El HALLAZGO M-3-H1 (signed URLs) queda como open item en PROJECT-STATE §6.
```

**Lección clave:** El Veredicto incluye exactamente QUÉ se revisó. Esto importa por dos razones: (1) el Ejecutor sabe que fue auditado de verdad y (2) si algo falla más tarde, hay un registro de qué se verificó y qué no.

---

## Las 7 reglas del protocolo

Estas reglas son lo que convierte el formato en un sistema que funciona de verdad:

| # | Regla | Por qué existe |
|---|-------|----------------|
| 1 | **Un handoff, un propósito** | No mezclar ENTREGA con PREGUNTA en el mismo mensaje |
| 2 | **REF es obligatorio y estable** | El ID de tarea viaja desde ORDEN hasta VEREDICTO sin cambiar |
| 3 | **Toda ENTREGA pasa por VEREDICTO** | El Ejecutor no avanza sin aprobación explícita |
| 4 | **BLOQUEA: sí tiene prioridad** | Una pregunta bloqueante se responde antes que cualquier otra cosa |
| 5 | **Sin evidencia no hay ENTREGA** | "Funciona" no es un estado verificable |
| 6 | **Las decisiones se escriben como ADR** | El chat es transporte, los ADR son memoria permanente |
| 7 | **PROJECT-STATE se actualiza con cada VEREDICTO** | Es la única fuente de verdad del avance |

---

## ¿Qué es un ADR?

Un **Architecture Decision Record** (Registro de Decisión de Arquitectura) es un documento corto que captura:
- **Qué decisión se tomó** (qué librería, qué patrón, qué convención)
- **Por qué** (las alternativas consideradas y el razonamiento)
- **Consecuencias** (qué implica esta decisión para el futuro)

Cuando el Arquitecto emite un VEREDICTO que produce una decisión de arquitectura, esa decisión NO vive en el chat (el chat se borra, el contexto se resetea). Vive en un archivo `docs/architecture/ADR-XXX-nombre.md`.

**Ejemplo real de este proyecto:**
- `ADR-001` — Cómo escribir políticas RLS para que funcionen con Supabase (surgió como HALLAZGO durante una sub-fase)
- `ADR-002` — Cómo envolver el cliente Supabase para que parezca InsForge (0 cambios en 578 puntos del código)
- `ADR-004` — Cómo manejar secretos en la CLI (surgió después de un incidente de leak accidental)

Nota que dos de los tres ADR de arriba surgieron de HALLAZGOs — problemas descubiertos durante la construcción. Ese es el sistema funcionando correctamente.
