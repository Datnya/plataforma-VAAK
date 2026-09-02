---
artifact_type: ORDEN
phase: "0"
ref: "VAAK-RESEARCH-0-A"
from: architect_chief
to: reviewer_auditor
status: revised_for_review
blocking: true
created_at: "2026-08-25"
---

=== HANDOFF ===
TIPO: ORDEN
FASE: 0 · REF: VAAK-RESEARCH-0-A

# Plan inicial de investigación: modernización de la plataforma empresarial VAAK

> Revisión 2 para auditoría adversarial, corregida contra H-01…H-05 y N-01/N-02 del VEREDICTO inicial. No autoriza todavía la investigación, la creación del cuaderno, la carga de documentos ni ninguna implementación.

## INSTRUCCIÓN HUMANA ORIGINAL (preservada)

Investigar, mediante un cuaderno nuevo en NotebookLM y el MCP ya configurado, qué stack tecnológico conviene para sustituir el software empresarial antiguo. Considerar en profundidad todos los manuales de `Documentos de plataforma antigua`, el PDF `OS&E_Requerimiento Sistema (1).pdf`, las funciones existentes y las nuevas solicitadas; la plataforma debe ser rápida, moderna/minimalista, permitir trabajo remoto, y finalmente alojarse en el Plan Avanzado de Perú Hosting (100 GB NVMe, transferencia ilimitada, 2.4 GB RAM dedicada, entorno de hosting compartido/administrado aún por confirmar). El frontend se trabajará inicialmente en Vercel y luego se moverá al dominio oficial. Deben identificarse incertidumbres críticas del hosting y no asumirse acceso root, contenedores, procesos persistentes ni bases externas sin evidencia.

## TAREA

Preparar una investigación documental, técnica y trazable que produzca una recomendación de stack y arquitectura de despliegue para reemplazar el sistema antiguo, sin implementar el producto. La recomendación deberá demostrar cobertura funcional, viabilidad operativa en el hosting real, seguridad para trabajo remoto y una ruta de migración desde Vercel al entorno definitivo.

## TRAZABILIDAD DE ESTA REVISIÓN

| Hallazgo | Corrección incorporada | Verificación prevista |
|---|---|---|
| H-01 | Ruta `notebook_add_text`, extracción trazable, piloto DOCX+PDF, fragmentación e idempotencia | Evidencia MCP, cita contrastada y ledger sin duplicados |
| H-02 | `PROJECT-STATE.md` se crea en R0 y lo actualiza el Arquitecto en cada subfase/VEREDICTO | Historial de estado contra artefactos y evidencia |
| H-03 | Cierre `architect_chief → reviewer_auditor`, retorno controlado y máximo global de tres ciclos | ENTREGA, VEREDICTO y contador por la misma REF |
| H-04 | Sobre de carga con datos reales o escenarios bajo/esperado/límite | Presupuestos y sensibilidad por alternativa |
| H-05 | NFR frontend medibles y dimensión ponderada propia | Cobertura NFR-FE-01…09 por alternativa |
| N-01 | La autorización humana vigente habilita R0–R7 después de la aprobación | No se solicita un segundo “adelante”; los frenos permanecen |
| N-02 | Propiedad/no compartición y detección de secretos antes de cargar | Metadatos MCP y registro de clasificación previa |

## CONTEXTO Y ESTADO VERIFICABLE

### Hechos verificados en el workspace

- Existe `Documentos de plataforma antigua/` con 11 manuales DOCX.
- Existe el documento obligatorio `OS&E_Requerimiento Sistema (1).pdf`.
- Existe además `VAAK PROCUREMENT - FF&E INPUTS (1).pdf`; no forma parte explícita del corpus obligatorio y queda como fuente suplementaria pendiente de confirmación.
- El MCP de NotebookLM fue configurado previamente, pero su funcionamiento y permisos de escritura deberán volver a verificarse al iniciar la ejecución.
- La superficie MCP observada permite `notebook_create`, `notebook_add_text`, `notebook_add_drive` y `notebook_add_url`; no expone carga directa de archivos locales DOCX/PDF. La ruta prevista será extracción local trazable + `notebook_add_text`.
- Existe un cuaderno remoto distinto, `Guía de Cargos e Informes de Artículos en Exxpedite`, con doce fuentes. No se presume que sea el cuaderno solicitado y no se reutilizará, renombrará ni eliminará sin evidencia y autorización.
- No existe `PROJECT-STATE.md`. Es una precondición de gobierno pendiente; no se presume ningún avance anterior.
- La instrucción humana vigente ya autoriza crear el cuaderno, incorporar el corpus indicado y ejecutar R0–R7 una vez que el Auditor apruebe esta ORDEN. No hará falta un segundo “adelante”, salvo que se active un freno humano.

### Información aportada por el humano, pendiente de evidencia del proveedor

- Plan Avanzado de Perú Hosting: hasta 100 sitios, 100 GB SSD NVMe, transferencia mensual ilimitada, 2.4 GB de RAM dedicada, SSL, panel de control y backups semanales.
- Límites de correo: 100 mensajes/hora/usuario y 250 mensajes/hora/dominio; no se autoriza uso de boletines o publicidad.
- Se desconoce el entorno efectivo: panel, sistema operativo, runtimes, versiones, base de datos, límites de CPU, I/O, procesos, cron, conexiones, ejecución, inodos y políticas de uso.

### Invariantes

- No asumir acceso root, Docker/contenedores, procesos persistentes, colas residentes, WebSockets, Redis, workers propios, almacenamiento tipo objeto ni bases de datos externas.
- No confundir “usar el dominio oficial” con “alojar el frontend en el hosting”; ambas opciones deberán distinguirse.
- No recomendar un stack que dependa de una capacidad del hosting sin evidencia verificable.
- Toda función atribuida al sistema antiguo o solicitada para el nuevo debe conservar vínculo a una fuente concreta.
- El cuaderno de NotebookLM debe verificarse como propio y no compartido antes de cargar la primera fuente; no basta asumir privacidad por defecto.
- Cada documento conserva un ID lógico aunque deba representarse mediante varios fragmentos físicos en NotebookLM.
- La carga será idempotente: ningún reintento puede duplicar cuadernos ni fragmentos silenciosamente.
- Ningún texto se cargará antes de buscar y clasificar credenciales, secretos, tokens, datos personales o información que requiera una decisión de seguridad.
- Los documentos fuente permanecen inalterados.

## ALCANCE

1. Inventariar y validar la integridad del corpus obligatorio.
2. Analizar exhaustivamente los 11 manuales y el PDF de requerimientos.
3. Construir un catálogo normalizado de procesos, funciones, roles, datos, reportes, reglas, integraciones y restricciones.
4. Separar claramente:
   - comportamiento actual documentado;
   - problema o limitación actual;
   - requisito nuevo explícito;
   - mejora propuesta por inferencia;
   - pregunta pendiente de validación humana.
5. Crear un cuaderno nuevo en NotebookLM mediante MCP, verificar propiedad/no compartición y cargar representaciones textuales trazables de las fuentes mediante `notebook_add_text`.
6. Ejecutar consultas por documento y consultas cruzadas en NotebookLM, exigiendo citas a las fuentes.
7. Investigar con fuentes primarias y actuales las capacidades y restricciones de las alternativas tecnológicas y del proveedor de hosting.
8. Comparar al menos tres alternativas de arquitectura/stack mediante puertas de viabilidad y una matriz ponderada.
9. Recomendar una opción principal, una alternativa conservadora y una alternativa condicionada, indicando supuestos, costos, riesgos y condiciones de descarte.
10. Proponer una arquitectura lógica, estrategia de despliegue, seguridad multiusuario, respaldo, migración de datos y roadmap por fases, sin escribir código.
11. Definir un sobre de carga con escenarios bajo, esperado y límite cuando falten métricas reales, y evaluar cada alternativa contra los tres.
12. Evaluar requisitos no funcionales medibles de frontend: rendimiento, accesibilidad, responsive, consistencia visual, tablas/formularios y portabilidad.

## FUERA DE ALCANCE

- Implementar frontend, backend, base de datos, pruebas, prototipos o migraciones.
- Instalar dependencias o modificar configuración de runtime/producto.
- Desplegar en Vercel, Perú Hosting o el dominio oficial.
- Acceder a producción, solicitar o manipular secretos y credenciales del cliente.
- Migrar datos reales o alterar el software antiguo.
- Activar servicios externos de pago o estimar como aprobada una erogación mayor a USD 5.
- Tomar como definitiva una decisión de stack antes del VEREDICTO y la decisión humana.
- Compartir públicamente el cuaderno o cargar fuentes ajenas al corpus autorizado.

## DEPENDENCIAS Y PRECONDICIONES

1. VEREDICTO `APROBADO` del `reviewer_auditor` sobre esta REF.
2. Tras ese VEREDICTO, la autorización humana ya emitida habilita R0–R7 sin pedir una segunda confirmación. Cualquier freno de `AGENTS.md` sigue requiriendo autorización nueva y específica.
3. MCP de NotebookLM autenticado, con capacidad comprobada para listar, crear, usar `notebook_add_text` y consultar fuentes.
4. Los 12 documentos obligatorios deben poder abrirse y extraerse; cualquier archivo corrupto, protegido o ilegible genera HALLAZGO.
5. R0 debe crear `PROJECT-STATE.md` antes de R1 y registrar allí esta REF, el cuaderno, la evidencia, riesgos y siguiente paso.
6. R1 depende de un piloto satisfactorio con un DOCX y el PDF obligatorio mediante la ruta soportada.
7. R5/R6 dependen de un sobre de carga validado por el cliente o, si aún no hay datos, de tres escenarios explícitos y una recomendación marcada como condicionada.
8. Antes de cerrar la recomendación final, obtener evidencia técnica del hosting o declarar la recomendación como condicional.

## CORPUS DOCUMENTAL OBLIGATORIO

### Manuales del sistema antiguo

1. `Documentos de plataforma antigua/Exx-AddingAreaQuantities-Español.docx`
2. `Documentos de plataforma antigua/Exx-AddingRoomQties-Español.docx`
3. `Documentos de plataforma antigua/Exx-DetailingSpecItems-Español.docx`
4. `Documentos de plataforma antigua/Exx-EnteringSpecItems-Español.docx`
5. `Documentos de plataforma antigua/Exx-Manufacturers-Sources-Español.docx`
6. `Documentos de plataforma antigua/Exx-SetupProject-Español.docx`
7. `Documentos de plataforma antigua/Exx-SetupProjectAreas-Español.docx`
8. `Documentos de plataforma antigua/Exx-SpecInstructions-Español.docx`
9. `Documentos de plataforma antigua/Exx-SpecItemCharges-Español.docx`
10. `Documentos de plataforma antigua/Exx-SpecItemRpts-Español.docx`
11. `Documentos de plataforma antigua/Exx-WorkingwCurrency-Español.docx`

### Requerimientos nuevos

12. `OS&E_Requerimiento Sistema (1).pdf`

### Fuente suplementaria no autorizada todavía

- `VAAK PROCUREMENT - FF&E INPUTS (1).pdf` — inventariar, pero no cargar ni usar como requisito hasta recibir confirmación humana.

## METODOLOGÍA DOCUMENTAL

### Etapa D1 — Manifiesto e integridad

- Registrar para cada archivo: nombre, ruta, tipo, tamaño, hash SHA-256, número de páginas o secciones, idioma, fecha interna si existe y estado de lectura.
- Detectar duplicados, páginas vacías, anexos, tablas, imágenes con texto, vínculos rotos, protección y necesidad de OCR.
- No modificar los originales; cualquier conversión será una copia de trabajo identificada.

### Etapa D2 — Extracción y lectura profunda

- Extraer texto, tablas y estructura preservando referencias de página, encabezado, sección, tabla o figura.
- Revisar visualmente las páginas con diagramas, formularios, capturas o tablas que la extracción textual no represente bien.
- Producir una ficha por documento con propósito, actores, precondiciones, flujo principal, excepciones, datos, cálculos, salidas e incertidumbres.
- No convertir ejemplos del manual en requisitos generales sin marcarlos como inferencia.

### Etapa D3 — Modelo funcional normalizado

- Consolidar funciones duplicadas o relacionadas sin perder su procedencia.
- Organizar como mínimo: proyectos, áreas, habitaciones, cantidades, ítems/especificaciones, instrucciones, cargos, monedas, fabricantes/proveedores, reportes y nuevas solicitudes OS&E.
- Identificar entidades, relaciones, estados, permisos, cálculos, adjuntos, importaciones/exportaciones, auditoría y dependencias entre módulos.
- Crear mapas de proceso “actual” y “objetivo”, distinguiendo paridad, modernización y funcionalidad nueva.

### Etapa D4 — Control de contradicciones

- Registrar versiones incompatibles, terminología ambigua y reglas contradictorias.
- Si una contradicción afecta producto o arquitectura, emitir PREGUNTA al humano; no resolverla silenciosamente.
- Asignar confianza `alta`, `media` o `baja` según calidad y convergencia de evidencia.

## METODOLOGÍA EN NOTEBOOKLM

### Ruta soportada y piloto obligatorio

1. Verificar sesión MCP, listar cuadernos y registrar el inventario de operaciones disponibles. Debe constar que el MCP activo no carga directamente archivos locales y que la ruta elegida es `extracción local trazable → notebook_add_text`.
2. Antes de crear, buscar el título estable exacto `VAAK — Investigación de stack y modernización — VAAK-RESEARCH-0-A`:
   - si no existe, crear un cuaderno nuevo;
   - si existe y su ID coincide con el registrado en `PROJECT-STATE.md` para esta REF, verificar propiedad/no compartición y reanudar;
   - si existe pero no hay procedencia inequívoca, detener con HALLAZGO; no reutilizar, renombrar ni borrar;
   - el cuaderno distinto ya observado no cuenta como coincidencia y permanece intacto.
3. Recuperar metadatos del cuaderno recién creado y guardar evidencia de que pertenece a la cuenta autenticada y no está compartido. No cargar contenido antes de superar esta comprobación.
4. Ejecutar una detección local previa de secretos y datos sensibles sobre el contenido extraído. Registrar por documento `sin hallazgos`, `dato personal esperado y autorizado` o `posible secreto/bloqueado`. Un posible secreto, credencial o token detiene la carga de ese documento hasta decisión humana; la autorización del corpus no autoriza secretos inadvertidos.
5. Preparar una representación textual por documento lógico con encabezado trazable: ID lógico, nombre/ruta original, SHA-256, tipo, fecha de extracción, páginas/secciones cubiertas, método de extracción y listado de tablas/figuras/elementos visuales que requieren revisión manual.
6. Ejecutar primero un piloto con:
   - un DOCX representativo que contenga estructura y, preferentemente, tablas o capturas;
   - `OS&E_Requerimiento Sistema (1).pdf`.
7. Para cada piloto, cargar mediante `notebook_add_text`, recuperar contenido con el MCP y obtener al menos una respuesta con cita útil que pueda verificarse contra el original. Si cualquiera falla, R1 se detiene y se emite HALLAZGO.

### Fragmentación e idempotencia

8. Cada original recibe un ID lógico estable: `LEG-01`…`LEG-11` y `NEW-01`. “Doce documentos cubiertos” se refiere a estos doce IDs lógicos, no necesariamente a doce fuentes físicas.
9. Si el piloto demuestra que una representación excede el tamaño aceptado o degrada recuperación/citas, fragmentar solo en límites de sección/página. Los títulos físicos seguirán `[{ID lógico}] [{parte:03d}/{total:03d}] {nombre original}`.
10. Cada fragmento registra: ID lógico, número/total, rango de páginas/secciones, hash del original, hash del texto normalizado y versión de extracción. Ningún fragmento puede mezclar documentos.
11. Antes de cada `notebook_add_text`, consultar el ledger y las fuentes existentes:
    - título + hash iguales: omitir como ya cargado;
    - título igual + hash distinto: detener con HALLAZGO; no sobrescribir ni duplicar;
    - título ausente: cargar y registrar el ID remoto devuelto.
12. Los reintentos usan el ledger como clave idempotente. Si una llamada queda en estado incierto, verificar la lista remota antes de repetir. No se elimina una fuente para “limpiar” sin autorización humana.

### Carga completa y consulta

13. Tras aprobar el piloto, añadir exclusivamente los doce documentos lógicos obligatorios, salvo autorización posterior para la fuente suplementaria.
14. Confirmar documento por documento que todos sus fragmentos fueron ingeridos, son recuperables y conservan citas útiles; una llamada exitosa sin recuperación de contenido no cuenta como evidencia.
15. Ejecutar una batería reproducible de consultas:
   - resumen estructural por documento;
   - funciones, actores, datos, reglas, cálculos, reportes y excepciones;
   - diferencias entre sistema actual y requerimientos nuevos;
   - contradicciones y vacíos;
   - requisitos no funcionales inferibles, siempre etiquetados como inferencia;
   - trazabilidad inversa desde cada requisito consolidado hacia sus fuentes.
16. Verificar manualmente cada afirmación crítica contra el archivo original. NotebookLM es herramienta de síntesis, no fuente de verdad autónoma.
17. Conservar un ledger de cuaderno/fuentes/fragmentos y un registro de consultas, respuestas relevantes, citas y verificaciones/correcciones.
18. Si NotebookLM omite o interpreta mal una fuente, reextraerla en formato compatible, incrementar la versión de extracción y documentar la desviación; no completar el vacío por intuición.

## MEMORIA OPERATIVA Y RESPONSABILIDAD DE ESTADO

En R0, después del VEREDICTO inicial `APROBADO`, `architect_chief` creará `PROJECT-STATE.md` con frontmatter válido y, como mínimo:

```yaml
---
artifact_type: PROJECT_STATE
phase: "0"
ref: "VAAK-RESEARCH-0-A"
from: architect_chief
to: reviewer_auditor
status: in_progress
blocking: false
created_at: "2026-08-25"
---
```

El Arquitecto actualizará `PROJECT-STATE.md` al cierre de cada subfase y de cada VEREDICTO. Cada actualización debe registrar estado, evidencia verificada, decisiones, preguntas, riesgos, desviaciones, artefactos/IDs remotos y siguiente paso. El `reviewer_auditor` no edita ese archivo: lo contrasta de forma independiente contra la evidencia y reporta cualquier divergencia.

## INVESTIGACIÓN TÉCNICA EXTERNA

- Priorizar documentación oficial del proveedor de hosting, de los runtimes, frameworks, bases de datos y plataformas evaluadas.
- Registrar URL, título, organización, fecha de consulta y versión aplicable.
- Separar evidencia actual de documentación histórica o de terceros.
- Validar especialmente: runtime soportado, despliegue, memoria, CPU, almacenamiento, base de datos, concurrencia, cron/jobs, procesos persistentes, WebSockets, correo, copias de seguridad, restauración, seguridad, logs y mantenimiento.
- No añadir fuentes externas al cuaderno del cliente sin registrar claramente su categoría y sin mezclar hechos del negocio con documentación de tecnología.

## SOBRE DE CARGA OBLIGATORIO

Antes de puntuar R5, se registrarán datos reales del cliente para: usuarios totales y concurrentes; solicitudes interactivas; registros por entidad y crecimiento; tamaño/frecuencia/concurrencia de importaciones y reportes; número/tamaño/crecimiento de adjuntos; jobs; conexiones de base de datos; picos; y correo transaccional. Si esos datos todavía no existen, se usarán los siguientes escenarios de trabajo, expresamente etiquetados como supuestos y no como hechos:

| Variable | Bajo | Esperado | Límite de evaluación |
|---|---:|---:|---:|
| Usuarios totales / concurrentes | 10 / 3 | 30 / 10 | 75 / 25 |
| Solicitudes interactivas pico | 10/min | 40/min | 100/min |
| Registros principales acumulados | 25,000 | 250,000 | 1,000,000 |
| Importación máxima | 2,000 filas / 5 MB | 20,000 filas / 25 MB | 100,000 filas / 100 MB |
| Reporte máximo | 10,000 filas / 10 MB | 100,000 filas / 50 MB | 500,000 filas / 200 MB |
| Adjuntos: promedio / máximo | 2 / 10 MB | 5 / 25 MB | 10 / 50 MB |
| Almacenamiento inicial / crecimiento anual | 10 / 5 GB | 40 / 15 GB | 80 / 20 GB |
| Correo pico por dominio | 25/h | 125/h | 240/h |
| Correo pico por usuario | 20/h | 60/h | 90/h |

Reglas de evaluación:

- R5 y R6 quedan condicionadas si se usan supuestos; la entrega mostrará sensibilidad por escenario y qué dato real podría cambiar el resultado.
- El presupuesto debe cubrir memoria sostenida/pico, CPU, I/O, conexiones de base de datos, tiempo máximo de request/job, tamaño de respuesta y crecimiento de backup. Como baseline conservador hasta conocer cómo se contabilizan los 2.4 GB, ninguna alternativa puede presupuestar más de 60% de esa RAM como uso sostenido ni 75% como pico de la aplicación; el resto se reserva para runtime, base de datos y variabilidad. Si el proveedor comparte o mide la RAM de otra forma, se recalcula.
- Los reportes/importaciones que excedan el tiempo de request confirmado deben tener estrategia acotada de lotes, paginación y reanudación, sin asumir workers persistentes.
- El correo debe implementar cola durable o mecanismo equivalente permitido por el hosting, throttling por usuario y dominio, reintento con backoff e idempotency key. Nunca se diseñará para superar 100 mensajes/hora/usuario ni 250/hora/dominio; el escenario límite reserva margen con 90 y 240.
- Toda medición o estimación debe indicar hardware/entorno, dataset, concurrencia, versión, método y margen de error.

## REQUISITOS NO FUNCIONALES DE FRONTEND

Los umbrales siguientes son baseline de investigación (`NFR-*`) y permanecen como supuestos hasta validación humana y contraste con la documentación oficial vigente:

| ID | Criterio medible |
|---|---|
| NFR-FE-01 | En páginas críticas, Core Web Vitals p75 objetivo: LCP ≤ 2.5 s, INP ≤ 200 ms y CLS ≤ 0.1, medidos por separado en móvil y escritorio bajo entorno declarado. |
| NFR-FE-02 | Presupuesto inicial por ruta crítica: JavaScript comprimido ≤ 250 KB y transferencia inicial total ≤ 1.5 MB, excluyendo recursos ya cacheados; toda excepción se justifica. |
| NFR-FE-03 | WCAG 2.2 nivel AA como objetivo: navegación por teclado, foco visible, semántica, contraste y nombres accesibles; auditoría automática más revisión manual de flujos críticos. |
| NFR-FE-04 | Responsive verificable entre 360 px y 1440 px o más; sin scroll horizontal no intencional. Las tablas densas pueden usar scroll/columnas configurables de forma explícita. |
| NFR-FE-05 | Tablas empresariales usan paginación/virtualización según volumen, filtros persistentes y estados de carga/vacío/error; no renderizan conjuntos completos del escenario esperado en el cliente. |
| NFR-FE-06 | Formularios críticos tienen validación accesible, prevención de doble envío, conservación controlada de borrador y mensajes de error accionables. |
| NFR-FE-07 | “Minimalista y moderno” se evalúa por design tokens documentados, componentes reutilizables, jerarquía consistente, densidad adecuada y ausencia de variantes ad hoc; la aprobación estética final corresponde al humano/cliente. |
| NFR-FE-08 | Debe existir una estrategia explícita de renderizado, caché e invalidación por tipo de pantalla, compatible tanto con Vercel inicial como con el destino confirmado. |
| NFR-FE-09 | El mismo build o una variante documentada debe poder migrar Vercel → destino sin reescribir la interfaz; diferencias de CORS, cookies, assets, variables y fallback/rollback quedan inventariadas. |

Cada alternativa tecnológica recibirá evidencia separada para estos NFR; no basta con afirmar que el framework “es rápido”, “responsive” o “moderno”.

## PUERTAS DE VIABILIDAD DEL STACK

Una alternativa queda `NO VIABLE` o `CONDICIONADA` si no demuestra:

1. Runtime y versión disponibles en el hosting final.
2. Método de despliegue permitido sin root ni contenedores.
3. Base de datos compatible, límites conocidos y estrategia de backup/restauración.
4. Operación dentro de 2.4 GB de RAM con margen y sin depender de procesos persistentes no confirmados.
5. Manejo viable de tareas programadas, reportes pesados, importaciones y correo bajo los límites del plan.
6. Autenticación segura, HTTPS, control de acceso por rol, sesiones y auditoría para trabajo remoto.
7. Estrategia de archivos que no trate el disco local del servidor como almacenamiento ilimitado o infalible.
8. Ruta explícita desde Vercel al dominio/hosting definitivo, incluyendo CORS, cookies, variables, builds y rollback.
9. Mantenimiento, actualizaciones de seguridad y observabilidad realizables por el equipo.
10. Cobertura de los requisitos funcionales críticos sin adaptaciones desproporcionadas.
11. Sobre de carga evaluado en los tres escenarios o reemplazado por datos reales validados, con presupuesto de recursos explícito.
12. Cumplimiento o brechas justificadas de NFR-FE-01…NFR-FE-09.

## MATRIZ PONDERADA DE EVALUACIÓN

La puntuación será de 0 a 5 por criterio y deberá citar evidencia. Los pesos iniciales quedan sujetos a auditoría:

| Criterio | Peso |
|---|---:|
| Compatibilidad demostrable con el hosting y despliegue | 20% |
| Cobertura funcional y modelado del dominio | 18% |
| Seguridad, permisos, auditoría y trabajo remoto | 14% |
| Rendimiento y uso de recursos contra el sobre de carga | 12% |
| Frontend: rendimiento, accesibilidad, responsive y sistema visual | 12% |
| Mantenibilidad, ecosistema y disponibilidad de soporte | 8% |
| Datos, archivos, backups y recuperación | 6% |
| Migración/interoperabilidad con el sistema antiguo | 5% |
| Portabilidad Vercel → dominio/hosting final | 5% |
| **Total** | **100%** |

Reglas de puntuación:

- Ninguna puntuación compensa el incumplimiento de una puerta crítica de seguridad o despliegue.
- `0`: incompatible o sin solución; `1`: evidencia muy débil; `2`: viable con riesgo alto; `3`: viable con condiciones; `4`: buen ajuste demostrado; `5`: ajuste sobresaliente con evidencia directa.
- Toda cifra debe mostrar fuente, versión, supuesto y nivel de confianza.
- El resultado numérico orienta, pero no sustituye el análisis de riesgos ni la decisión humana.

## MATRIZ DE EVIDENCIA EXIGIDA

Cada requisito o hallazgo deberá ocupar una fila con estos campos mínimos:

| Campo | Evidencia exigida |
|---|---|
| ID estable | `LEG-*`, `NEW-*`, `NFR-*`, `HOST-*` o `RISK-*` |
| Categoría | Módulo/proceso/requisito no funcional/restricción |
| Actor y rol | Quién inicia, consulta, aprueba o administra |
| Comportamiento actual | Qué hace el sistema antiguo, sin modernizarlo en la descripción |
| Necesidad objetivo | Paridad, mejora o función nueva |
| Fuente primaria | Archivo exacto |
| Localización | Página, sección, tabla, figura o encabezado |
| Extracto o paráfrasis fiel | Evidencia suficiente y breve, sin perder contexto |
| Regla/dato implicado | Entidades, campos, cálculos, estados y permisos |
| Prioridad | Crítica/alta/media/baja, indicando quién la definió |
| Implicación técnica | Capacidad que el stack debe soportar |
| Verificación cruzada | Segunda fuente o revisión manual |
| Confianza | Alta/media/baja y motivo |
| Conflicto/pregunta | Contradicción o dato faltante, si aplica |
| Estado | Confirmado/inferido/pendiente/descartado |

Evidencia adicional obligatoria por alternativa tecnológica:

| Dimensión | Prueba requerida |
|---|---|
| Hosting | Documento oficial o respuesta verificable del proveedor |
| Runtime | Versiones, proceso de build/deploy y límites |
| Base de datos | Motor, versión, cuotas, conexiones, backup y restauración |
| Rendimiento | Resultados o estimaciones reproducibles para bajo/esperado/límite; memoria, CPU, I/O, conexiones y tiempos |
| Frontend NFR | Cobertura individual de NFR-FE-01…NFR-FE-09, método de medición y brechas |
| Seguridad | Modelo de roles, sesiones, aislamiento, cifrado y auditoría |
| Operación | Logs, monitoreo, cron/jobs, recuperación y actualización |
| Portabilidad | Pasos y dependencias para transición desde Vercel |
| Costos | Componentes incluidos, opcionales y recurrentes; supuestos visibles |
| Funciones | Mapeo requisito → capacidad del stack → brecha |

## SUBFASES PROPUESTAS

| Subfase | Resultado verificable | Dependencia |
|---|---|---|
| R0 | Manifiesto; inventario MCP; detección previa de secretos; `PROJECT-STATE.md` creado; título estable comprobado; cuaderno creado y verificado propio/no compartido | VEREDICTO APROBADO; la autorización humana vigente basta |
| R1 | Piloto DOCX+PDF por `notebook_add_text`; ledger idempotente; después, cobertura recuperable de los 12 documentos lógicos | R0 |
| R2 | Fichas de los 12 documentos y matriz funcional trazable | R1 |
| R3 | Catálogo consolidado, procesos actual/objetivo y contradicciones | R2 |
| R4 | Ficha técnica verificable del hosting, sobre de carga y preguntas al proveedor/cliente | R0; solo recopilación independiente puede solaparse con R1–R3 |
| R5 | Al menos tres alternativas sometidas a puertas, escenarios, NFR frontend y puntuación | R3 + R4; si faltan datos reales, resultado condicionado |
| R6 | `architect_chief` consolida ENTREGA final, arquitectura, migración, roadmap y riesgos; actualiza `PROJECT-STATE.md` | R5 |
| R7 | `reviewer_auditor` audita independientemente; bucle de corrección secuencial y cierre | R6 |

### Gobierno al cierre de cada subfase y de la investigación

1. Los dos agentes no trabajan en paralelo sobre el mismo artefacto. El posible solapamiento de R4 se limita a recopilación independiente; toda síntesis y revisión es secuencial.
2. Al cerrar R0–R5, `architect_chief` consolida evidencia y actualiza `PROJECT-STATE.md`; `reviewer_auditor` contrasta el estado cuando emite un VEREDICTO aplicable.
3. En R6, `architect_chief` produce la ENTREGA final con esta misma REF y actualiza el estado.
4. En R7, `reviewer_auditor` lee la instrucción original, la ORDEN vigente, la ENTREGA, los artefactos y el estado verificable; después emite VEREDICTO independiente.
5. Si el resultado es `CAMBIOS SOLICITADOS`, el Arquitecto corrige únicamente los hallazgos enumerados, conserva `VAAK-RESEARCH-0-A`, actualiza estado y devuelve al Auditor. Si es `RECHAZADO`, se detiene y escala al humano.
6. El límite es máximo tres ciclos de revisión para esta REF, contado globalmente mediante un ledger de VEREDICTOS que incluye la revisión inicial ya emitida. No se crea una cuarta ronda silenciosa: al agotar el límite se escala al humano con el desacuerdo exacto.
7. Un VEREDICTO `APROBADO` del Auditor habilita presentar la recomendación al humano, pero no adopta definitivamente el stack ni autoriza implementación.

## PREGUNTAS NO BLOQUEANTES PARA INICIAR R0–R3

Estas preguntas no impiden analizar el corpus. Las marcadas con `Condiciona cierre` impiden convertir la recomendación en definitiva si siguen sin respuesta.

1. **Condiciona cierre:** ¿Qué panel y tecnologías muestra Perú Hosting (cPanel/Plesk, PHP, Node.js, Python, MySQL/MariaDB/PostgreSQL, SSH, Composer, cron)?
2. **Condiciona cierre:** ¿Cuáles son los límites reales de CPU, procesos, ejecución, conexiones, I/O, inodos, tamaño de base de datos, archivos y retención/restauración de backups?
3. **Condiciona cierre:** Cuando se dice “pasar el frontend al dominio oficial”, ¿se desea mover también el hosting desde Vercel o mantener Vercel y apuntar el dominio?
4. ¿Cuántos usuarios totales y concurrentes se esperan ahora y a 3 años, y qué sedes/zonas horarias usarán?
5. ¿Qué roles, aprobaciones y segregación de funciones existen en la empresa?
6. ¿Cuánto ocupan hoy la base de datos y los archivos, y cuánto crecen al mes?
7. ¿El sistema antiguo permite exportación, acceso a su base, API o respaldos estructurados?
8. ¿Qué integraciones son obligatorias (correo, contabilidad, ERP, proveedores, Excel, firmas, pagos u otras)?
9. ¿Qué datos sensibles o personales se manejarán y qué retención/auditoría exige la empresa?
10. ¿Se requiere uso móvil, accesibilidad formal, operación offline o idiomas adicionales?
11. ¿Debe incorporarse `VAAK PROCUREMENT - FF&E INPUTS (1).pdf` al cuaderno y a la matriz de requisitos?
12. ¿Qué funciones del software antiguo ya no deben migrarse y cuáles son críticas para el primer lanzamiento?

## RIESGOS

| Riesgo | Severidad inicial | Mitigación prevista |
|---|---|---|
| Las cifras comerciales del hosting no describen sus límites técnicos | Crítica | Evidencia directa del panel/proveedor; recomendación condicional si falta |
| Manuales incompletos o desactualizados frente al uso real | Alta | Entrevista/validación humana y etiquetado de confianza |
| Pérdida de tablas, capturas o diagramas durante extracción | Alta | Renderizado visual y verificación por página |
| Síntesis incorrecta o cita defectuosa de NotebookLM | Alta | Verificación contra originales y trazabilidad inversa |
| Duplicación de cuaderno o fragmentos por reintentos | Alta | Título estable, ledger de IDs/hashes y comprobación remota antes de repetir |
| Pérdida de contexto entre subfases o agentes | Alta | `PROJECT-STATE.md` actualizado por el Arquitecto en cada cierre/veredicto |
| Arquitectura incompatible con hosting compartido | Crítica | Puertas de viabilidad antes de puntuar |
| Rendimiento insuficiente para concurrencia o reportes | Alta | Modelo de carga, presupuestos de memoria y consultas; supuestos explícitos |
| Seguridad insuficiente al habilitar acceso remoto multiusuario | Crítica | Roles, mínimo privilegio, sesiones, auditoría, backups y pruebas previstas |
| Crecimiento de adjuntos agota almacenamiento o backups | Alta | Proyección de capacidad y política de archivos/retención |
| Frontend separado en Vercel introduce CORS/cookies/latencia | Media | Evaluar topologías y ruta de transición por separado |
| Dependencia de servicios externos no autorizados | Alta | Identificar costos y mantener alternativas sin activación real |
| Carga de documentación confidencial a un servicio externo | Alta | Verificar propiedad/no compartición, escanear secretos antes de cargar, mínimo corpus autorizado y detener ante restricciones |
| Migración sin exportación fiable del sistema antiguo | Alta | Descubrimiento temprano y estrategia por escenarios |

## RECUPERACIÓN Y CONTROL DE CAMBIOS

- Los originales son de solo lectura y se registran por hash.
- Cada corrección conserva la REF `VAAK-RESEARCH-0-A` y añade historial de revisión, sin reemplazar silenciosamente evidencia.
- Si una fuente falla en NotebookLM, se conserva el error, se usa una copia de trabajo trazable y se vuelve a verificar.
- Si el cuaderno se crea incorrectamente, no se elimina sin autorización humana; se detiene su uso y se documenta el reemplazo propuesto.
- Ninguna conclusión aprobada se modifica sin ADR o nuevo handoff, según impacto.

## FRENOS HUMANOS

Detener y pedir autorización explícita antes de:

- subir documentos no incluidos en el corpus autorizado o compartir el cuaderno;
- revelar o modificar credenciales, tokens, secretos o controles de seguridad;
- contratar/activar servicios, proveedores o pruebas con costo estimado mayor a USD 5;
- usar producción, migrar datos reales, desplegar, publicar, hacer push o merge;
- borrar cuadernos, fuentes o datos, o ejecutar cualquier acción irreversible;
- adoptar como definitiva una arquitectura, stack o cambio de producto/ADR;
- contactar al cliente o al proveedor en nombre del humano.

## CRITERIOS DE ACEPTACIÓN

La investigación posterior solo podrá declararse lista para auditoría si entrega evidencia de que:

1. Los 12 archivos obligatorios figuran en un manifiesto con hash y estado de lectura.
2. R0 registra que el MCP no permite carga local directa y documenta la ruta soportada `extracción trazable → notebook_add_text`.
3. Antes de la carga completa existe un piloto verificable con un DOCX y `OS&E_Requerimiento Sistema (1).pdf`: alta por `notebook_add_text`, recuperación y al menos una cita útil contrastada por original.
4. Los 12 documentos lógicos (`LEG-01`…`LEG-11`, `NEW-01`) tienen cobertura recuperable en el cuaderno, aunque la cantidad física de fuentes sea mayor por fragmentación; toda excepción tiene HALLAZGO.
5. Cada fragmento conserva ID lógico, parte/total, rango, hash original, hash textual, versión e ID remoto; un reintento probado no crea duplicados.
6. El cuaderno se buscó por título exacto antes de crear y su ID quedó en el ledger; el cuaderno distinto preexistente no fue reutilizado, renombrado ni eliminado.
7. Antes de la primera carga se recuperaron metadatos que demuestran que el cuaderno es propio y no compartido.
8. Cada documento tiene resultado de detección previa de secretos/datos sensibles; cualquier posible secreto fue bloqueado y escalado sin cargarse.
9. Cada documento tiene ficha de análisis y evidencia localizada; ninguna fuente fue cubierta solo por un resumen global.
10. Existe una matriz requisito-fuente sin filas críticas carentes de archivo y localización.
11. Las funciones actuales, nuevas, inferidas y descartadas están separadas explícitamente.
12. Roles, procesos, entidades, estados, cálculos, reportes, archivos, permisos e integraciones están catalogados.
13. Las contradicciones y lagunas tienen severidad, impacto y pregunta asociada.
14. Las afirmaciones críticas de NotebookLM fueron verificadas contra los originales.
15. `PROJECT-STATE.md` fue creado en R0 por `architect_chief` y su historial demuestra actualización al cierre de cada subfase y cada VEREDICTO con todos los campos exigidos.
16. Existe un sobre de carga con datos reales o los escenarios bajo/esperado/límite; cada alternativa muestra memoria, conexiones, tiempos, crecimiento y comportamiento de correo para los tres.
17. El diseño de correo demuestra throttling, reintento e idempotencia sin exceder 100 mensajes/hora/usuario ni 250/hora/dominio.
18. Al menos tres alternativas fueron evaluadas con la misma matriz y las mismas puertas de viabilidad.
19. Cada alternativa tiene cobertura verificable de NFR-FE-01…NFR-FE-09; “moderno/minimalista” no se usa como puntuación subjetiva sin criterios.
20. Cada puntuación tecnológica cita una fuente primaria actual y una versión o fecha aplicable.
21. Ninguna alternativa presume capacidades del hosting no demostradas; lo desconocido aparece como condición o causa de descarte.
22. La recomendación incluye opción principal, conservadora y condicionada, con costos, ventajas, desventajas y riesgos residuales.
23. Se presenta una arquitectura lógica y de despliegue, estrategia de seguridad, datos/archivos, backups, observabilidad y recuperación.
24. Se presenta una ruta explícita Vercel → dominio/hosting definitivo, incluyendo escenarios si el frontend permanece en Vercel.
25. Se presenta una estrategia de migración del legado por escenarios y un roadmap por fases, sin implementación.
26. El informe contiene ledger de cuaderno/fuentes/fragmentos, registro de consultas de NotebookLM y niveles de confianza suficientes para reproducir la conclusión.
27. R6 contiene una ENTREGA formal del Arquitecto; R7 contiene VEREDICTO independiente del Auditor y, si aplica, correcciones secuenciales con esta REF y contador global no mayor a tres ciclos.

## ARCHIVOS/ARTEFACTOS PROBABLES

Únicamente documentación de investigación y gobierno, con rutas finales sujetas al VEREDICTO:

- `HANDOFF/ORDEN-VAAK-RESEARCH-0-A.md` — esta ORDEN.
- `HANDOFF/ENTREGA-VAAK-RESEARCH-0-A.md` — índice de entrega y evidencia.
- `HANDOFF/VEREDICTO-VAAK-RESEARCH-0-A.md` — auditoría independiente.
- `PROJECT-STATE.md` — memoria verificable creada en R0 y mantenida por el Arquitecto.
- `docs/research/VAAK-RESEARCH-0-A/00-source-manifest.md`
- `docs/research/VAAK-RESEARCH-0-A/01-functional-requirements-matrix.md`
- `docs/research/VAAK-RESEARCH-0-A/02-hosting-constraints.md`
- `docs/research/VAAK-RESEARCH-0-A/03-stack-evaluation-matrix.md`
- `docs/research/VAAK-RESEARCH-0-A/04-architecture-recommendation.md`
- `docs/research/VAAK-RESEARCH-0-A/05-migration-roadmap.md`
- `docs/research/VAAK-RESEARCH-0-A/06-notebooklm-evidence-log.md`
- `docs/research/VAAK-RESEARCH-0-A/07-notebooklm-source-ledger.md`
- `docs/research/VAAK-RESEARCH-0-A/08-load-envelope-and-nfr.md`

## EVIDENCIA ESPERADA EN LA ENTREGA

- Ruta, ID, propiedad y estado no compartido del cuaderno; listado de fuentes recuperado por MCP.
- Inventario de capacidades MCP y evidencia del piloto DOCX+PDF por `notebook_add_text`.
- Ledger idempotente de documentos/fragmentos con títulos, hashes, rangos e IDs remotos.
- Registro de detección previa de secretos/datos sensibles y decisiones de carga.
- Manifiesto con hashes y conteo de documentos/páginas.
- Fichas documentales y matriz completa exportable.
- Registro de consultas/citas de NotebookLM y verificaciones manuales.
- Fuentes oficiales del hosting y de cada tecnología evaluada.
- Matriz de puertas de viabilidad y puntuación con cálculo reproducible.
- Sobre de carga bajo/esperado/límite y cobertura NFR-FE-01…NFR-FE-09 por alternativa.
- Historial de `PROJECT-STATE.md` y contador de VEREDICTOS de esta REF.
- Lista de hechos, supuestos, inferencias, preguntas y conflictos.
- Recomendación y alternativas con trazabilidad a funciones y restricciones.
- Registro de desviaciones y HALLAZGOS.

## FORMATO DE ENTREGA FINAL

1. **Veredicto ejecutivo:** recomendación principal, grado de confianza y condiciones críticas.
2. **Resumen para negocio:** problemas actuales, mejoras esperadas y decisiones que requiere la clienta.
3. **Mapa funcional:** módulos y flujos actuales/nuevos, con cobertura y prioridades.
4. **Restricciones verificadas:** hosting, operación, seguridad, datos y correo.
5. **Alternativas comparadas:** puertas, puntuaciones, ventajas, desventajas, costos y descartes.
6. **Arquitectura recomendada:** componentes, datos, archivos, autenticación, permisos, reportes, jobs, backups y observabilidad.
7. **Despliegue y portabilidad:** desarrollo inicial en Vercel y escenarios para dominio/hosting final.
8. **Migración:** inventario, extracción, limpieza, pruebas, ensayo, cutover y rollback, sin ejecutar datos reales.
9. **Roadmap:** fases pequeñas, dependencias, criterios de aceptación y riesgos.
10. **Preguntas y decisiones humanas:** bloqueantes y no bloqueantes, con opciones y recomendación.
11. **Anexos auditables:** matrices, manifiesto, ledger idempotente, piloto, registro NotebookLM, sobre de carga, NFR, estado, fuentes y glosario.

## CONDICIÓN PARA AVANZAR

El `reviewer_auditor` debe revisar esta propuesta corregida contra la instrucción humana, el VEREDICTO inicial, las fuentes de gobierno y el estado verificable del workspace. Un VEREDICTO `APROBADO` habilita R0 porque la autorización humana vigente ya cubre la investigación R0–R7; no se necesita un segundo “adelante”. Continúan bloqueadas y requieren autorización nueva todas las acciones incluidas en FRENOS HUMANOS. Esta ORDEN en estado `revised_for_review` no habilita investigación antes de la aprobación ni autoriza implementación o adopción definitiva del stack.
