---
artifact_type: ORDEN
phase: "1"
ref: "VAAK-BRAIN-1-A"
from: architect_chief
to: reviewer_auditor
status: revised_for_review
blocking: true
created_at: "2026-08-25"
---

=== HANDOFF ===
TIPO: ORDEN
FASE: 1 · REF: VAAK-BRAIN-1-A

# Cerebro persistente del proyecto VAAK

> Revisión 2 para auditoría adversarial. Incorpora H-01…H-06 del VEREDICTO inicial y no autoriza todavía editar `AGENTS.md`, crear `PROJECT-BRAIN.md` ni corregir `PROJECT-STATE.md`.

## TAREA

Crear, tras VEREDICTO `APROBADO` y autorización humana de ejecución, una arquitectura documental persistente y versionable formada por:

- `AGENTS.md`: reglas breves y obligatorias que Codex carga nativamente.
- `PROJECT-BRAIN.md`: contexto estable y canónico del proyecto.
- `PROJECT-STATE.md`: estado dinámico, evidencia reciente, riesgos y siguiente paso.

`PROJECT-BRAIN.md` es una convención interna de VAAK, no un estándar oficial ni un archivo autodescubierto por Codex; Codex lo leerá porque `AGENTS.md` lo ordenará. `CHATGPT.md` no se descubre por defecto y no se configurará como fallback en esta REF. ChatGPT Projects y las memorias de ChatGPT/Codex son capas auxiliares; no sustituyen los archivos versionados del workspace.

## TRAZABILIDAD DE LA REVISIÓN 2

| Hallazgo | Corrección incorporada | Verificación exigida |
|---|---|---|
| H-01 | Iniciar Codex desde la raíz; probar raíz y subdirectorio; prohibido inicializar Git | Evidencia de `codex status` o prueba equivalente en ambos CWD |
| H-02 | Precedencia separada por ámbito | Tres jerarquías explícitas y regla de conflicto |
| H-03 | Brain conserva solo el principio estable del hosting | Sin cifras/cuotas; enlace a la fuente vigente de restricciones |
| H-04 | Brain declarado convención interna no autodescubierta; `CHATGPT.md` no es fallback | Texto literal en TAREA y criterios |
| H-05 | Medición de la cadena combinada `< 32768` bytes, además de `AGENTS.md ≤ 8 KiB` | Inventario global→CWD y suma de bytes |
| H-06 | Arquitecto propietario, Auditor verificador, humano autoridad; Brain nace en borrador | Frontmatter `draft_for_review` y transición controlada |

## CONTEXTO VERIFICADO

- Codex descubre `AGENTS.md` desde la capa global hasta raíz/subdirectorios, concatena la cadena y aplica un límite combinado predeterminado de 32 KiB.
- El workspace solo contiene un `AGENTS.md` de proyecto, de 3,385 bytes; el `AGENTS.md` global está vacío, no existe override global y no se observó un límite personalizado.
- El workspace no tiene actualmente una raíz Git verificable. Si Codex no detecta raíz de proyecto, una sesión iniciada desde un subdirectorio puede comprobar únicamente ese directorio y omitir el `AGENTS.md` del workspace.
- `PROJECT-BRAIN.md` todavía no existe.
- `PROJECT-STATE.md` existe, pero requiere reconciliación: afirma que no hubo extracción/renderizado, mientras `_working/` contiene 99 artefactos posteriores. Su presencia no demuestra que estén validados o aprobados.
- Fuente oficial para el comportamiento de instrucciones: [OpenAI — Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md).

## PRECONDICIONES DE EJECUCIÓN

1. Mientras no exista una raíz de proyecto verificable, toda sesión de Codex para esta REF debe iniciarse desde `C:\Users\HP\OneDrive\Desktop\Plataforma VAAK`.
2. B3 debe probar el descubrimiento desde la raíz y desde al menos un subdirectorio (`HANDOFF/` o `docs/research/`).
3. Si la prueba anidada no carga el `AGENTS.md` raíz, documentar la limitación y escalar por separado la decisión de crear una raíz Git o aplicar otra solución.
4. No inicializar Git, no crear `.git` y no modificar configuración de descubrimiento dentro de `VAAK-BRAIN-1-A`.

## PROPÓSITO Y PRECEDENCIA POR ÁMBITOS

No existe una precedencia total entre Brain y State. Cada archivo manda únicamente en su ámbito.

### Reglas y decisiones normativas

1. Instrucción humana vigente.
2. `AGENTS.md`.
3. ADR aprobado.
4. Handoff aprobado de la REF activa.

### Contexto estable

1. Evidencia primaria y decisiones humanas/ADRs aprobados.
2. `PROJECT-BRAIN.md` como resumen canónico derivado.

### Estado actual

1. Evidencia reciente y VEREDICTO aplicable.
2. `PROJECT-STATE.md` como resumen dinámico derivado.

Brain nunca prevalece sobre State para progreso actual. State no modifica una decisión estable sin instrucción humana o ADR. Las memorias, chats y copias en ChatGPT Projects no tienen autoridad canónica. Todo conflicto entre ámbitos se registra como HALLAZGO y no se resuelve silenciosamente.

### Verdad descriptiva verificable

Los archivos reales, hashes, pruebas y salidas verificables prevalecen sobre resúmenes acerca de lo que existe. Si contradicen Brain o State, no se corrige silenciosamente: se registra HALLAZGO, se reconcilia y se conserva la evidencia.

## ESTRUCTURA DE `PROJECT-BRAIN.md`

Debe iniciar con frontmatter válido y mantenerse compacto —objetivo máximo 16 KiB— mediante estas secciones:

1. Propósito, alcance y modo de uso.
2. Jerarquía de fuentes y resolución de conflictos.
3. Identidad del proyecto y objetivo de negocio.
4. Usuarios, dominio y glosario estable.
5. Alcance, límites e invariantes duraderos.
6. Principio estable de adecuación al hosting y enlace a la fuente canónica de restricciones vigentes, sin copiar cifras, cuotas o versiones.
7. Mapa estable del repositorio y fuentes canónicas.
8. Gobierno adversarial, roles y frenos humanos.
9. Índice de ADRs y decisiones humanas aprobadas, sin duplicar su contenido.
10. Principios duraderos de seguridad, calidad, trazabilidad y trabajo remoto.
11. Herramientas e integraciones disponibles a nivel de capacidad, sin sesiones ni credenciales.
12. Procedencia, responsable, fecha de verificación y reglas de mantenimiento.

Frontmatter inicial previsto:

```yaml
---
artifact_type: PROJECT_BRAIN
phase: "governance"
ref: "VAAK-PROJECT-BRAIN"
from: architect_chief
to: reviewer_auditor
status: draft_for_review
blocking: true
created_at: "YYYY-MM-DD"
---
```

`architect_chief` es el propietario de mantenimiento; `reviewer_auditor` es el verificador independiente; el humano es la autoridad sobre decisiones de producto y ADR. El Brain solo podrá cambiar de `draft_for_review` a `active` después del VEREDICTO final correspondiente. Esa transición no permite cambios de contenido no auditados.

## CONTENIDO ESTABLE A INCORPORAR

- Nombre y propósito de Plataforma VAAK: modernizar la gestión empresarial de la clienta y sustituir el software local antiguo por una plataforma web apta para trabajo remoto.
- Objetivos permanentes: rapidez, interfaz moderna/minimalista, seguridad multiusuario y mantenibilidad.
- Dominio general FF&E/OS&E y corpus documental legado, remitiendo al manifiesto en vez de duplicar detalles.
- Principio estable de hosting: la solución debe ajustarse al hosting vigente de la clienta; no asumir root, contenedores, procesos persistentes o servicios externos sin evidencia.
- Enlace a restricciones vigentes: usar `PROJECT-STATE.md` como referencia actual hasta que exista y sea auditado `docs/research/VAAK-RESEARCH-0-A/02-hosting-constraints.md`; después enlazar ese artefacto. No copiar al Brain cifras, cuotas, versiones ni estado de verificación.
- Separación entre dominio oficial y ubicación real del hosting.
- Gobierno con `architect_chief` y `reviewer_auditor`, flujo secuencial, REF estable, evidencia obligatoria y máximo de tres ciclos.
- Frenos humanos definidos en `AGENTS.md`.
- NotebookLM como herramienta de investigación, nunca como fuente canónica autónoma.
- Estado arquitectónico real: no hay stack final ni ADR tecnológico aprobado.

Cada afirmación estable debe indicar fuente o categoría: `verificado`, `decisión humana`, `ADR aprobado` o `supuesto explícito`.

## EXCLUSIONES VOLÁTILES

No incluir en `PROJECT-BRAIN.md`:

- fase/subfase actual, progreso, siguiente tarea o REF activa;
- autenticación MCP, IDs de cuadernos, conteos remotos o estado de compartición;
- ramas, commits, resultados de tests, timestamps operativos o archivos temporales;
- hashes, páginas, fragmentos y estado de ingestión del corpus;
- preguntas abiertas, riesgos coyunturales y desviaciones en curso;
- puntuaciones de stacks, candidatos todavía no aprobados o supuestos de carga temporales;
- secretos, tokens, credenciales, datos personales o rutas sensibles innecesarias;
- contenido duplicado de ADRs, handoffs, matrices o manuales.

Todo lo anterior pertenece a `PROJECT-STATE.md`, manifiestos, ADRs o artefactos de investigación según corresponda.

## CAMBIO MÍNIMO PROPUESTO A `AGENTS.md`

Agregar una única sección breve, sin configurar fallback filenames ni aumentar `project_doc_max_bytes`:

```markdown
## Contexto persistente obligatorio

Antes de planificar, auditar o ejecutar:
1. Leer `PROJECT-BRAIN.md` completo para el contexto estable.
2. Leer `PROJECT-STATE.md` completo para el estado dinámico.
3. Leer la ORDEN, el VEREDICTO y los ADRs relevantes.

La memoria de ChatGPT/Codex no sustituye estos archivos. Ante contradicción, aplicar la precedencia por ámbitos y registrar HALLAZGO; no corregir silenciosamente.
```

El `AGENTS.md` resultante deberá conservar su contenido vigente y permanecer ≤8 KiB. Además, B3 inventariará todos los archivos de instrucciones realmente descubiertos desde el alcance global hasta el CWD, registrará sus bytes y confirmará que la cadena combinada sea `< 32768` bytes con `project_doc_max_bytes` sin personalizar.

## RECONCILIACIÓN DE `PROJECT-STATE.md`

1. Calcular hash/tamaño del State vigente y levantar inventario de artefactos posteriores.
2. Construir una tabla `afirmación → evidencia → vigente/obsoleta/no verificada`.
3. No interpretar la existencia de `_working/` como trabajo aprobado; verificar procedencia y validez.
4. Corregir únicamente afirmaciones demostrablemente obsoletas. Para lo ambiguo, registrar HALLAZGO o PREGUNTA.
5. Preservar la REF de investigación y añadir el workstream `VAAK-BRAIN-1-A`; no migrar silenciosamente el identificador del State.
6. Mantener historial, decisiones, riesgos, desviaciones y siguiente paso.
7. La actualización corresponde al Arquitecto; el Auditor solo contrasta evidencia.

## ALCANCE

- Crear `PROJECT-BRAIN.md` con la estructura aprobada.
- Aplicar el bloque mínimo aprobado a `AGENTS.md`.
- Reconciliar `PROJECT-STATE.md` sin borrar historia.
- Verificar jerarquía, tamaño, enlaces, ausencia de secretos y lectura desde una sesión nueva de Codex.

## FUERA DE ALCANCE

- Código, pruebas, dependencias, configuración de runtime o producto.
- Elegir stack o cerrar arquitectura funcional/técnica.
- Desplegar, publicar, hacer push/merge o tocar producción.
- Modificar ADRs o decisiones de producto aprobadas.
- Crear/sincronizar un ChatGPT Project o depender de memoria remota.
- Inicializar Git, crear `.git` o cambiar `project_doc_fallback_filenames`/`project_doc_max_bytes`.

## SUBFASES

| Subfase | Resultado |
|---|---|
| B0 | Baseline y reconciliación verificable de `PROJECT-STATE.md` |
| B1 | Borrador de `PROJECT-BRAIN.md` con trazabilidad y sin datos volátiles |
| B2 | Cambio mínimo de lectura obligatoria en `AGENTS.md` |
| B3 | Validaciones raíz/subdirectorio, cadena combinada, tamaño local, precedencia, enlaces, secretos y sesión nueva |
| B4 | ENTREGA al Auditor con evidencia y misma REF |

## CRITERIOS DE ACEPTACIÓN

1. Solo cambian `PROJECT-BRAIN.md`, `AGENTS.md`, `PROJECT-STATE.md` y artefactos HANDOFF de esta REF.
2. Los tres documentos tienen roles no solapados: reglas, contexto estable y estado dinámico.
3. `PROJECT-BRAIN.md` contiene las doce secciones, frontmatter válido, fuente/clasificación por afirmación y tamaño ≤16 KiB.
4. No contiene ninguno de los datos volátiles o sensibles excluidos.
5. `AGENTS.md` conserva todas sus reglas actuales, contiene exactamente una instrucción de lectura del Brain/State y mide ≤8 KiB.
6. B3 inventaría la cadena efectiva global→CWD tanto desde la raíz como desde un subdirectorio, registra bytes por archivo y confirma una suma `< 32768` bytes con el límite predeterminado sin personalizar.
7. La prueba desde raíz demuestra que se carga `AGENTS.md`. La prueba desde subdirectorio demuestra si también se carga; si falla, se documenta la limitación y se escala sin inicializar Git.
8. `PROJECT-BRAIN.md` declara literalmente que es una convención interna no autodescubierta y que se lee por mandato de `AGENTS.md`.
9. No se crea `CHATGPT.md`; se declara que no se descubre por defecto y no se configura como fallback en esta REF.
10. El Brain contiene solo el principio estable del hosting y un enlace a restricciones vigentes; no contiene cifras, cuotas, versiones ni estado operativo.
11. `PROJECT-BRAIN.md` nace con `status: draft_for_review`; `architect_chief` figura como propietario, `reviewer_auditor` como verificador y el humano como autoridad de producto/ADR.
12. `PROJECT-STATE.md` incluye la reconciliación de sus afirmaciones obsoletas con evidencia; no declara aprobados los artefactos `_working/` sin VEREDICTO.
13. Todos los enlaces/rutas canónicos referidos existen o están marcados explícitamente como pendientes.
14. Un escaneo confirma ausencia de secretos, tokens y credenciales en los tres documentos.
15. Una sesión nueva desde la raíz puede identificar la precedencia por ámbitos y resumir Brain + State sin usar memoria del chat anterior.
16. La ENTREGA incluye diff, tamaños antes/después, evidencia de validación, desviaciones y lista exacta de archivos.
17. `reviewer_auditor` emite VEREDICTO antes de considerar activo el Brain; ningún cambio de contenido queda fuera de esa auditoría.

## MANTENIMIENTO Y ANTIDESACTUALIZACIÓN

- `AGENTS.md`: cambia solo cuando cambia una regla obligatoria; mantenerlo breve.
- `PROJECT-BRAIN.md`: `architect_chief` es propietario y lo actualiza únicamente ante cambio humano estable, ADR aprobado, invariante nuevo o corrección factual demostrada.
- `PROJECT-STATE.md`: actualizar al cierre de cada subfase y VEREDICTO, y antes de emitir una ORDEN si existe evidencia posterior a su última actualización.
- Toda actualización registra responsable, fecha, fuente y motivo.
- No copiar texto extenso: enlazar ADRs, handoffs, manifiestos e investigación.
- En cada inicio del Arquitecto, comparar fechas/hashes del State con artefactos recientes; divergencias generan reconciliación o HALLAZGO.
- `reviewer_auditor` verifica que Brain no absorbió volatilidad y que State no contradice evidencia; el humano conserva autoridad sobre producto y ADR.

## RIESGOS

- Duplicación entre Brain y State produce contradicciones.
- `AGENTS.md` crece hasta truncar instrucciones posteriores.
- La cadena global→CWD supera 32,768 bytes aunque el archivo raíz sea pequeño.
- Una sesión anidada omite el `AGENTS.md` raíz porque no existe raíz de proyecto verificable.
- Un resumen estable convierte supuestos en hechos.
- La reconciliación borra historia o atribuye aprobación inexistente.
- Copias en ChatGPT Projects divergen del repositorio.

Mitigación común: contenido mínimo, enlaces canónicos, procedencia, revisión adversarial y actualización por eventos verificables.

## FRENOS HUMANOS

Se mantienen todos los de `AGENTS.md`: operaciones destructivas; producción/despliegue/push/merge; secretos o cambios sensibles; gasto mayor a USD 5; proveedores reales; cambio de producto o ADR aprobado. Adoptar una arquitectura tecnológica continúa siendo una decisión humana posterior.

## ARCHIVOS PROBABLES

- `PROJECT-BRAIN.md`
- `AGENTS.md`
- `PROJECT-STATE.md`
- `HANDOFF/ENTREGA-VAAK-BRAIN-1-A.md`
- `HANDOFF/VEREDICTO-VAAK-BRAIN-1-A.md`

## EVIDENCIA ESPERADA

- Hash y tamaño antes/después de los documentos existentes.
- Diff limitado a los archivos autorizados.
- Tabla de reconciliación del State.
- Matriz `dato estable → fuente → sección del Brain`.
- Comprobaciones de frontmatter, límites de bytes, enlaces y secretos.
- Inventario y suma de la cadena combinada global→CWD desde raíz y subdirectorio.
- Evidencia de sesiones nuevas desde raíz/subdirectorio y de lectura Brain/State cuando las reglas estén efectivamente cargadas.

## CONDICIÓN PARA AVANZAR

Esta ORDEN permanece `revised_for_review`. Debe recibir VEREDICTO `APROBADO` del `reviewer_auditor` y autorización humana explícita antes de editar `PROJECT-BRAIN.md`, `AGENTS.md` o `PROJECT-STATE.md`. No autoriza inicializar Git, implementar producto ni cerrar decisiones finales de arquitectura.
