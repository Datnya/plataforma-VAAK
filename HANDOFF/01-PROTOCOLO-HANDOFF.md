# 05 — Cómo Implementarlo en Tu Propio Proyecto

> **Qué aprenderás aquí:** los pasos concretos para adoptar este sistema en tu proyecto desde cero, errores comunes, adaptaciones según el tamaño del proyecto, y preguntas frecuentes de la comunidad.

---

## Antes de empezar: ¿es este sistema para ti?

Este sistema añade estructura. La estructura tiene costo de entrada. Vale la pena cuando:

✅ Tu proyecto tiene **más de una semana de trabajo** de desarrollo  
✅ Trabajas en **fases o sprints** con objetivos claros por entrega  
✅ El proyecto tiene **historial** que importa (decisiones pasadas afectan trabajo futuro)  
✅ Quieres poder **retomar el proyecto** días o semanas después sin re-explicar todo  
✅ Necesitas **trazabilidad** (saber por qué se tomó cada decisión)  

Probablemente no vale la pena cuando:  
❌ Es un script de 200 líneas o un prototipo de un día  
❌ Eres el único que lo toca y nunca lo retomas  
❌ El proyecto no tiene sub-fases claras (es un cambio único y puntual)  

---

## Paso 1: Estructura de carpetas inicial

Crea esta estructura en tu proyecto:

```
tu-proyecto/
├── docs/
│   ├── architecture/          ← ADRs (Architecture Decision Records)
│   │   └── ADR-001-xxx.md
│   ├── handoff/               ← Briefs detallados de cada sub-fase
│   │   └── EXECUTOR-PHASE-1-A.md
│   └── community/             ← Este sistema (copia de aquí)
│       ├── README.md
│       ├── 01-PROTOCOLO-HANDOFF.md
│       ├── 02-ROL-ARQUITECTO.md
│       ├── 03-ROL-EJECUTOR.md
│       ├── 04-ESTADO-PROYECTO.md
│       └── 05-COMO-IMPLEMENTARLO.md
├── CLAUDE.md                  ← Instrucciones globales para Claude Code
└── PROJECT-STATE.md           ← Estado actual del proyecto
```

---

## Paso 2: Configura tu CLAUDE.md

El `CLAUDE.md` es el documento que Claude Code lee automáticamente al arrancar en tu proyecto. Aquí configuras el comportamiento por defecto.

```markdown
# CLAUDE.md — [Tu proyecto]

## INICIO DE SESIÓN OBLIGATORIO

1. Leer `PROJECT-STATE.md` — estado actual y decisiones
2. Seleccionar rol según panel (Arquitecto = izquierdo, Ejecutor = derecho)
3. Anunciar: `[Aplicando rol de Arquitecto/Ejecutor...]`

## PROTOCOLO

- Handoff: `docs/community/01-PROTOCOLO-HANDOFF.md`
- Arquitecto: `docs/community/02-ROL-ARQUITECTO.md`
- Ejecutor: `docs/community/03-ROL-EJECUTOR.md`

## STACK DEL PROYECTO

[Lista tu stack aquí: framework, DB, lenguaje, herramientas de test]

## REGLAS NO NEGOCIABLES

1. Sin evidencia no hay ENTREGA
2. [Tu regla específica, ej: "cero regresiones — X tests base"]
3. Secretos solo en .env.local
4. [Tu regla de bundler/framework si aplica]

## FRENOS (consultar al humano)

- Operaciones destructivas en DB
- Push a rama principal
- Gasto estimado >$[tu límite] en APIs externas
- Activar modo producción de cualquier proveedor

## COMANDOS DE VALIDACIÓN

npm run verify   # o tu comando equivalente
npx tsc --noEmit
npx vitest run   # o tu runner de tests
```

---

## Paso 3: Crea tu PROJECT-STATE.md inicial

No esperes tener el proyecto "perfecto" para empezar. Escribe el estado real, incluyendo deuda técnica y decisiones pendientes.

**Ejemplo para un proyecto nuevo:**

```markdown
# PROJECT-STATE.md — Mi SaaS de [dominio]

> Fuente de verdad compartida. El Arquitecto lo actualiza con cada VEREDICTO.

**Última actualización:** [hoy]  ·  **Por:** Rodrigo (inicio del proyecto)

## 1. Qué es el proyecto

Aplicación web para [qué hace]. Stack: [framework] + [DB] + [auth]. 
Usuarios objetivo: [quiénes].

## 2. Fase actual

**→ Phase 1 — Fundación. SIGUIENTE: 1-A (Schema de DB).**

Rama principal: `main`. Rama de desarrollo: `develop`.

## 3. Mapa de fases

| Sub-fase | Descripción | Estado |
|----------|-------------|--------|
| 1-A | Schema de DB y migraciones base | ⬜ SIGUIENTE |
| 1-B | Auth (login, registro, sesiones) | ⬜ |
| 1-C | Layout principal y navegación | ⬜ |

## 4. Decisiones registradas

[Ninguna aún]

## 5. Verificado en la última fase

[Ninguno — proyecto nuevo]

## 6. Pendientes y riesgos

[Ninguno conocido aún]

## 7. Foco de auditoría — Phase 1

- Que el schema de DB tenga RLS habilitado desde el inicio
- Que las rutas de auth no acepten usuarios sin verificar email
```

---

## Paso 4: Configura los dos paneles

**Panel izquierdo (Arquitecto):**

En el primer mensaje al panel izquierdo, pega esto:

```
Eres el Arquitecto de este proyecto. Lee PROJECT-STATE.md y dime:
1. Cuál es la siguiente sub-fase
2. Qué necesitas para emitir la primera ORDEN
3. Si hay alguna decisión de arquitectura pendiente que debería ser ADR
```

**Panel derecho (Ejecutor):**

En el primer mensaje al panel derecho, pega esto:

```
Eres el Ejecutor de este proyecto. Lee PROJECT-STATE.md y confirma:
1. Cuál es la sub-fase actual
2. Que entiendes el protocolo de ENTREGA (con evidencia)
3. Espera la ORDEN del Arquitecto antes de hacer nada
```

---

## Paso 5: La primera ORDEN

Cuando el Arquitecto emita la primera ORDEN, cópiala al Ejecutor. El Ejecutor pedirá el brief si no existe, o pedirá aclaraciones si algo no está claro.

Si es tu primer proyecto con este sistema, el Arquitecto puede necesitar que le digas:

```
"No tenemos brief para esta sub-fase todavía. 
¿Puedes crear el brief de [sub-fase 1-A] antes de emitir la ORDEN?"
```

El Arquitecto generará el brief y luego emitirá la ORDEN formal.

---

## Errores comunes y cómo evitarlos

### Error 1: Saltarse el VEREDICTO y avanzar
**Síntoma:** El Ejecutor entrega la sub-fase A y empieza la B sin esperar aprobación.  
**Consecuencia:** El Arquitecto descubre un bug en A cuando B ya está construida sobre él.  
**Fix:** El Ejecutor no toca la siguiente sub-fase hasta recibir `RESULTADO: APROBADO`.

### Error 2: Evidencia "de palabra"
**Síntoma:** La ENTREGA dice "los tests pasan" sin incluir la salida del comando.  
**Consecuencia:** El Arquitecto no puede verificar. Devuelve la ENTREGA.  
**Fix:** Siempre incluir el output literal del comando, no una afirmación sobre él.

### Error 3: Decisiones que se quedan en el chat
**Síntoma:** "Decidimos en la sesión anterior usar Redis para caché" — pero no está en ADR.  
**Consecuencia:** El siguiente agente (o tú mismo en dos semanas) no sabe de esa decisión.  
**Fix:** Toda decisión que afecta el futuro → ADR antes de cerrar la sesión.

### Error 4: PROJECT-STATE desactualizado
**Síntoma:** El archivo dice "sub-fase 3 en progreso" pero ya se aprobó hace dos sesiones.  
**Consecuencia:** Los agentes nuevos empiezan de un estado equivocado.  
**Fix:** El Arquitecto actualiza PROJECT-STATE antes de emitir el VEREDICTO, no después.

### Error 5: Frenos ignorados por "urgencia"
**Síntoma:** "Es solo un push rápido a main para ver si funciona en producción."  
**Consecuencia:** Un cambio no auditado en producción que falla silenciosamente.  
**Fix:** Los frenos no tienen excepción. Si hay urgencia real, el humano lo autoriza explícitamente.

### Error 6: HALLAZGOs ocultados
**Síntoma:** El Ejecutor encuentra un bug, lo parchea, no lo menciona, reporta ENTREGA.  
**Consecuencia:** El Arquitecto aprueba asumiendo que no había problemas. El bug puede reaparecer.  
**Fix:** Todo lo no previsto → HALLAZGO. Siempre.

---

## Variantes del sistema por tamaño de proyecto

### Proyecto pequeño (< 10 sub-fases)
Puedes usar un solo Claude Code con roles alternados:
1. Pídele que piense como Arquitecto y planifique la fase
2. Pídele que piense como Ejecutor y construya
3. Pídele que vuelva al rol de Arquitecto para auditar

El sacrificio: el agente que construyó tiene sesgo al auditar. Compénsalo siendo más exigente con la evidencia.

### Proyecto mediano (10-30 sub-fases)
Dos paneles de Claude Code (dos tabs). Uno por rol. El humano es el transporte.

### Proyecto grande (30+ sub-fases, equipo)
Considera dos instancias de Claude Code con CLAUDE.md separados — uno configurado como Arquitecto, otro como Ejecutor. Puede haber múltiples Ejecutores trabajando sub-fases en paralelo (pero cada uno espera VEREDICTO antes de avanzar).

---

## Preguntas frecuentes de la comunidad

**¿Necesito dos cuentas de Claude?**  
No. Dos tabs del mismo Claude Code funcionan. La disciplina del protocolo es lo que importa, no la infraestructura.

**¿Y si el Ejecutor "no quiere" esperar el VEREDICTO?**  
Los agentes hacen lo que el prompt les dice. Si el CLAUDE.md dice "no avanzas sin VEREDICTO APROBADO", el agente lo respeta. El prompt de configuración es la ley.

**¿Qué pasa si el Arquitecto aprueba algo que después resulta tener un bug?**  
Eso es exactamente lo que la sección "Lo que la última fase dejó verificado" documenta. El VEREDICTO captura qué se revisó y qué no. Si el bug estaba en algo que el Arquitecto no revisó, el PROJECT-STATE lo dejará claro. Si el bug estaba en algo que el Arquitecto sí revisó, el proceso de auditoría necesita mejorarse.

**¿Los ADRs son obligatorios para decisiones pequeñas?**  
No. Un ADR es para decisiones que afectan múltiples sub-fases o que sería costoso revertir. "¿Cómo nombro esta variable?" no es ADR. "¿Qué convención de paths usamos en todos los uploads de storage?" sí lo es.

**¿Puedo adaptar los 5 tipos de handoff?**  
Sí, pero con cuidado. Los 5 tipos cubren todos los flujos de comunicación relevantes. Si añades tipos, asegúrate de que no se solapen con los existentes. Lo más común es añadir variantes del VEREDICTO (por ejemplo, "APROBADO CON CONDICIONES") o tipos específicos del dominio.

**¿Cuánto tiempo agrega este sistema?**  
En las primeras 2-3 sub-fases, aproximadamente 20% más de tiempo (escribir briefs, el protocolo de ENTREGA, etc.). A partir de la sub-fase 5, recuperas ese tiempo porque no hay re-trabajo, los agentes tienen contexto inmediato, y los bugs se detectan temprano.

---

## El principio que lo une todo

Este sistema existe porque trabajar con IA sin estructura genera la ilusión de velocidad pero la realidad del caos.

La estructura no frena el progreso — **define exactamente qué significa progreso** en cada momento.

Cuando el Ejecutor entrega con evidencia, cuando el Arquitecto audita de primera mano, cuando el PROJECT-STATE refleja la realidad, cuando los HALLAZGOs se reportan en vez de ocultarse — en ese momento tienes un proceso de desarrollo que escala, que se puede retomar, y que produce software en el que confías.

Eso es lo que vale el costo de entrada.

---

## Recursos adicionales

- [01-PROTOCOLO-HANDOFF.md](01-PROTOCOLO-HANDOFF.md) — Los 5 tipos de mensaje con ejemplos completos
- [02-ROL-ARQUITECTO.md](02-ROL-ARQUITECTO.md) — Cómo piensa y audita el Arquitecto
- [03-ROL-EJECUTOR.md](03-ROL-EJECUTOR.md) — Cómo construye y reporta el Ejecutor
- [04-ESTADO-PROYECTO.md](04-ESTADO-PROYECTO.md) — La memoria compartida entre sesiones
- [README.md](README.md) — El panorama completo en 5 minutos
