# Sistema de Desarrollo con Doble Agente IA — Guía para la Comunidad

> Este sistema fue diseñado para proyectos reales de SaaS. Lo que lees aquí es el protocolo exacto que usamos para construir un producto de automatización de medios con IA — con Claude Code como cerebro técnico y un humano como director de producto.

---

## ¿Qué es este sistema?

Es un **protocolo de trabajo que divide la inteligencia artificial en dos roles** para construir software de manera estructurada, auditable y sin caos.

En lugar de pedirle todo a un solo chat de IA, separas el trabajo en dos instancias especializadas:

```
┌─────────────────────┐        HANDOFF         ┌─────────────────────┐
│      ARQUITECTO     │ ─────────────────────► │      EJECUTOR       │
│  (panel izquierdo)  │ ◄───────────────────── │  (panel derecho)    │
│                     │        ENTREGA          │                     │
│  Piensa. Audita.    │                         │  Construye. Prueba. │
│  Decide. Dirige.    │                         │  Reporta. Pregunta. │
└─────────────────────┘                         └─────────────────────┘
                              ▲   ▲
                              │   │
                         TÚ eres el transporte.
                    Copias y pegas entre los dos paneles.
```

**El humano** (tú) no escribe código ni toma decisiones técnicas menores. Tú:
- Defines qué quieres construir
- Apruebas las fases antes de que empiecen
- Intervienes cuando hay dinero, seguridad, o algo destructivo en juego

---

## Los 5 documentos del sistema

| Archivo | Para qué | Léelo si... |
|---------|----------|-------------|
| [01-PROTOCOLO-HANDOFF.md](01-PROTOCOLO-HANDOFF.md) | El lenguaje que hablan los dos agentes entre sí | Quieres entender cómo se comunican |
| [02-ROL-ARQUITECTO.md](02-ROL-ARQUITECTO.md) | Qué hace el agente que piensa y audita | Vas a configurar el panel izquierdo |
| [03-ROL-EJECUTOR.md](03-ROL-EJECUTOR.md) | Qué hace el agente que construye | Vas a configurar el panel derecho |
| [04-ESTADO-PROYECTO.md](04-ESTADO-PROYECTO.md) | Cómo mantener sincronía entre sesiones | Tu proyecto tiene historia acumulada |
| [05-COMO-IMPLEMENTARLO.md](05-COMO-IMPLEMENTARLO.md) | Guía paso a paso para tu propio proyecto | Quieres adoptarlo desde cero |

---

## ¿Por qué funciona?

### El problema que resuelve

Cuando trabajas con IA en modo libre (un solo chat, sin estructura), pasan estas cosas malas:
- El agente empieza a implementar sin entender el contexto real
- Las decisiones se toman y se olvidan — no quedan registradas en ningún lado
- No sabes si lo que se construyó es correcto porque nadie lo auditó
- El chat crece tanto que el agente "olvida" contexto importante
- Mezclas diseño con construcción y terminas con código que nadie revisó

### Lo que este sistema aporta

1. **Separación de poderes.** Un agente no puede aprobar su propio trabajo.
2. **Trazabilidad.** Cada decisión queda escrita en un ADR (Architecture Decision Record). Cada tarea tiene su hilo desde ORDEN hasta VEREDICTO.
3. **Frenos explícitos.** Hay una lista de cosas que NINGÚN agente puede hacer sin tu aprobación — dinero, datos de producción, secretos.
4. **Evidencia obligatoria.** Un agente no puede decir "está listo" sin mostrar pruebas: tests que pasan, type-check limpio, output real.
5. **Un solo estado de verdad.** El archivo PROJECT-STATE.md es la memoria compartida. Si hay conflicto entre lo que "recuerda" un agente y lo que dice ese archivo, gana el archivo.

---

## El ciclo de una tarea (en 60 segundos)

```
1. Arquitecto lee el PROJECT-STATE → sabe en qué punto está el proyecto
2. Arquitecto emite una ORDEN con:
   - Qué construir (una frase)
   - Por qué (contexto + decisión que lo respalda)
   - Cómo saber que está listo (criterios verificables)
   - Qué NO hacer (frenos)
3. Tú copias la ORDEN y la pegas en el Ejecutor
4. Ejecutor lee el brief detallado, implementa, escribe tests
5. Ejecutor emite una ENTREGA con evidencia (tests, type-check, output)
6. Tú copias la ENTREGA y la pegas en el Arquitecto
7. Arquitecto audita ABRIENDO LOS ARCHIVOS (no de oídas)
8. Arquitecto emite VEREDICTO: APROBADO / CAMBIOS / RECHAZADO
9. Si APROBADO: Arquitecto actualiza PROJECT-STATE → siguiente tarea
10. Si CAMBIOS: Ejecutor corrige y vuelve al paso 5
```

---

## Nivel de aprendizaje que obtienes

Al usar este sistema aprenderás:

- **Cómo estructurar proyectos de software con IA** de manera no-caótica
- **Cómo escribir criterios de aceptación** que un agente pueda verificar mecánicamente
- **Cómo registrar decisiones de arquitectura** (ADRs) para que no se pierdan
- **Cómo auditar código generado por IA** sin ser un experto en el lenguaje
- **Cómo manejar secretos y seguridad** en flujos automatizados
- **Cómo dividir una feature grande** en sub-fases verificables una por una

---

## Empezar en 10 minutos

1. Lee [05-COMO-IMPLEMENTARLO.md](05-COMO-IMPLEMENTARLO.md)
2. Abre dos ventanas/tabs de Claude Code en tu proyecto
3. Pega el contenido de `ARCHITECT.md` (adaptado a tu proyecto) en el panel izquierdo
4. Pega el contenido de `EXECUTOR.md` (adaptado a tu proyecto) en el panel derecho
5. Crea tu `PROJECT-STATE.md` inicial con el estado actual de tu proyecto
6. Pide al Arquitecto que planifique la primera fase

> **Nota:** No necesitas dos suscripciones separadas. Puedes usar dos tabs del mismo Claude Code, o alternar roles en una sola ventana si tu proyecto es pequeño. La clave es la disciplina del protocolo, no la infraestructura.
