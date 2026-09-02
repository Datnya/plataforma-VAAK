---
artifact_type: ORDEN
phase: "0"
ref: "VAAK-PHP-STRATEGY-2-A"
from: architect_chief
to: reviewer_auditor
status: revised_for_review
blocking: true
created_at: "2026-08-28"
updated_at: "2026-08-28"
revision_cycle: 2
---

# ORDEN — Estrategia segura de PHP para staging sin afectar el sitio principal

## Resultado arquitectónico propuesto

**No cambiar el PHP global, no desplegar y no adoptar todavía un stack.** Soporte ya confirmó que no hay MultiPHP y que PHP Selector es global; no se vuelve a pedir esa confirmación. La estrategia segura prioriza un staging temporal externo o una cuenta/entorno realmente independiente y, como mecanismo complementario futuro, una release reproducible preparada fuera del servidor. La futura producción permanece condicionada a evidencia, revisión independiente, decisión humana y una REF posterior.

La recomendación histórica Laravel/PHP puede seguir siendo insumo condicionado, pero esta REF no la ratifica, sustituye ni convierte en ADR.

## Instrucción humana original

> Asume estrictamente el rol architect_chief definido por C:\Users\HP\OneDrive\Desktop\Plataforma VAAK\AGENTS.md y HANDOFF/README.md. No implementes ni apruebes tu propio trabajo. Workspace: C:\Users\HP\OneDrive\Desktop\Plataforma VAAK. REF estable VAAK-PHP-STRATEGY-2-A. Lee completos AGENTS.md, PROJECT-BRAIN.md, PROJECT-STATE.md, los cinco archivos HANDOFF/, docs/research/VAAK-RESEARCH-0-A/02-hosting-constraints.md, docs/research/VAAK-RESEARCH-0-A/03-staging-preflight-hpgilatam.md y artefactos VAAK-HOSTING-1-A. Nueva evidencia humana: DNS autoritativo Microsoft, A staging 144.217.195.178 TTL1h y HTTPS Let's Encrypt válidos; webroot independiente /home/wwwhpgilatam/staging.hpgilatam.com/public; hosting compartido sin MultiPHP, PHP Selector global, sitio principal hoy PHP7.3 y versiones hasta 8.4 disponibles; extensiones Laravel relevantes activas, límites 512M/64M/900s; MySQL8.0.43 local; cron 1min; backups semanales/2 semanas externos/restauración por ticket; FTP/File Manager sí; SSH/Terminal/Composer no confirmados; ModSecurity activo; no hubo despliegue/cambios PHP/DB/cron. Crea HANDOFF/ORDEN-VAAK-PHP-STRATEGY-2-A.md con YAML válido. Compara las cinco opciones de la humana, recomienda estrategia segura sin desplegar, define el próximo paso humano exacto y evidencia, impacto sobre interfaz, hechos/inferencias/decisiones, y no adoptes stack ni ADR. Registra que el rol personalizado no pudo iniciarse por incompatibilidad de modelo y se usó agente separado equivalente.

## Procedencia del rol y separación de poderes

El rol personalizado `architect_chief` no pudo iniciarse por incompatibilidad de modelo. Se utilizó un agente separado equivalente, instruido con `AGENTS.md` y `HANDOFF/README.md`, exclusivamente para formular esta ORDEN. Este agente no implementa, no emite VEREDICTO y no aprueba su propio trabajo. La revisión independiente corresponde a `reviewer_auditor` y cualquier ejecución posterior requiere además autorización humana explícita.

## Control de revisión

**Ciclo 2 de la REF estable `VAAK-PHP-STRATEGY-2-A`.** Esta revisión corrige exclusivamente los siete hallazgos de `HANDOFF/VEREDICTO-VAAK-PHP-STRATEGY-2-A.md`. No reabre puntos declarados conformes ni emite un VEREDICTO.

## Fuentes leídas y alcance

Se leyeron completos:

- `AGENTS.md`, `PROJECT-BRAIN.md` y `PROJECT-STATE.md`.
- Los cinco archivos de gobierno: `HANDOFF/README.md`, `HANDOFF/01-PROTOCOLO-HANDOFF.md`, `HANDOFF/02-ROL-ARQUITECTO.md`, `HANDOFF/03-ROL-EJECUTOR.md` y `HANDOFF/04-ESTADO-PROYECTO.md`.
- `docs/research/VAAK-RESEARCH-0-A/02-hosting-constraints.md` y `docs/research/VAAK-RESEARCH-0-A/03-staging-preflight-hpgilatam.md`.
- `HANDOFF/ORDEN-VAAK-HOSTING-1-A.md`, `HANDOFF/ENTREGA-VAAK-HOSTING-1-A.md` y `HANDOFF/VEREDICTO-VAAK-HOSTING-1-A.md`.

Esta REF es de análisis y gobierno. No autoriza código, dependencias, cambios remotos ni pruebas mutantes.

## Hechos, inferencias y decisiones propuestas

### Hechos aportados por la humana el 2026-08-28

Se aceptan como evidencia humana reciente para esta propuesta, pero el Auditor debe distinguirlos de una verificación primaria adjunta:

1. El DNS autoritativo es Microsoft; `staging.hpgilatam.com` tiene `A 144.217.195.178`, TTL de una hora y HTTPS válido con Let's Encrypt.
2. El webroot de staging es independiente: `/home/wwwhpgilatam/staging.hpgilatam.com/public`.
3. El hosting es compartido, MultiPHP no está disponible y PHP Selector opera globalmente para la cuenta. El sitio principal usa hoy PHP 7.3; el selector ofrece versiones hasta PHP 8.4.
4. Las extensiones relevantes para Laravel están activas y se observan límites de 512 MB de memoria, 64 MB de subida/post y 900 segundos de ejecución. La evidencia entregada no demuestra todavía que esos mismos valores y extensiones se conserven tras cambiar a PHP 8.3 u 8.4.
5. MySQL 8.0.43 es local; cron admite frecuencia mínima de un minuto; ModSecurity está activo.
6. File Manager y FTP están disponibles. Bajo la evidencia humana vigente, SSH, Terminal y Composer en el servidor se tratan como **no disponibles**.
7. Hay backups externos semanales, retención de dos semanas y restauración por ticket. No se aportó prueba de restauración, RTO comprometido, granularidad ni punto de recuperación adicional.
8. No hubo despliegue ni cambios de PHP, base de datos o cron.

### Reconciliación con evidencia histórica

- El `NXDOMAIN` y el certificado expirado de `VAAK-STAGING-2-A` son observaciones históricas superadas por la evidencia humana más reciente; deben conservarse como historia, no como bloqueo actual.
- El webroot independiente queda reforzado por la evidencia nueva.
- El bloqueo que ahora domina no es DNS/TLS: es el **alcance global del selector PHP**, porque un cambio de runtime para staging puede afectar el sitio principal en PHP 7.3.
- La disponibilidad de extensiones bajo el runtime actual no demuestra compatibilidad bajo PHP 8.3/8.4. Tampoco demuestra compatibilidad del sitio principal con esas versiones.
- Backups semanales con dos semanas de retención reducen riesgo, pero no constituyen rollback probado ni garantizan recuperación rápida.

### Inferencias técnicas

1. Un cambio global directo a PHP 8.3 u 8.4 tiene radio de impacto sobre todos los sitios de la cuenta y puede romper el sitio principal, sus plugins, plantillas, formularios, integraciones o panel administrativo aunque staging esté vacío.
2. Mantener desarrollo compatible sin afectar producción permite avanzar únicamente fuera de la cuenta actual. No resuelve por sí solo dónde validar VAAK ni selecciona la versión PHP de producción.
3. El webroot aislado protege la separación de archivos públicos, pero **no aísla el runtime PHP global**.
4. La restauración por ticket no equivale a una reversión inmediata de un cambio PHP; cambiar el selector de vuelta podría no reparar datos, cachés o incompatibilidades que aparezcan durante la prueba.
5. Si más adelante se adopta un framework con Composer, la ausencia vigente de SSH, Terminal y Composer en el servidor obliga a preparar fuera del hosting una release reproducible con dependencias y activos incluidos. Esta inferencia no adopta Laravel ni autoriza preparar, contratar, subir o desplegar esa release.
6. Los límites observados son suficientes para un preflight futuro, no para justificar peticiones web de 900 segundos. Importaciones, PDFs y procesos largos seguirían requiriendo diseño acotado y reanudable.

### Decisiones propuestas para auditoría y posterior decisión humana

- Congelar el selector PHP global en 7.3. Esto es una medida temporal de no cambio, no una selección de runtime para VAAK.
- Priorizar un staging temporal externo, una cuenta cPanel separada o un entorno administrado realmente independiente antes de cualquier prueba con PHP moderno.
- Mantener la evaluación de compatibilidad del sitio principal como trabajo futuro y separado, sólo si se contempla una actualización global; deberá realizarse sobre una réplica independiente, con matriz funcional y rollback probado.
- Tratar la preparación externa de una release reproducible como complemento de un entorno independiente y como capacidad futura condicionada, no como autorización de implementación.
- No abrir ADR ni declarar versión/framework definitivos en esta REF.
- No cerrar como “verificados” PHP moderno, extensiones, cron Laravel, Composer, restauración ni release hasta contar con evidencia específica del entorno aislado.

## Comparación de las cinco opciones humanas

### Texto humano literal vinculante

1. mantener desarrollo compatible sin afectar producción;
2. evaluar compatibilidad del sitio principal antes de actualización global;
3. staging temporal externo/independiente;
4. preparar Laravel fuera del servidor y desplegar después;
5. otra solución adecuada a hosting compartido.

Las cinco estrategias no son necesariamente excluyentes: la 3 resuelve el aislamiento del runtime y la 4 puede complementar después el mecanismo de entrega.

| # | Estrategia humana literal | Qué resuelve | Condición o límite | Relación con otras opciones | Juicio del Arquitecto |
|---:|---|---|---|---|---|
| 1 | mantener desarrollo compatible sin afectar producción | Permite trabajar localmente con una versión utilizable sin cambiar la cuenta actual | No determina dónde validar ni desplegar; tampoco selecciona PHP definitivo | Puede preceder a 3 y, si luego se autoriza, a 4 | **Válida como medida de desarrollo**, insuficiente por sí sola |
| 2 | evaluar compatibilidad del sitio principal antes de actualización global | Prepara una posible modernización futura del sitio principal | Un inventario o escáner no autoriza el cambio. Exige réplica independiente, matriz funcional, prueba de plugins/integraciones y rollback demostrado | No sustituye 3 y no debe usarse para habilitar VAAK en la cuenta principal | **Trabajo futuro opcional**, no próximo paso |
| 3 | staging temporal externo/independiente | Elimina el acoplamiento con el PHP global 7.3 y reduce el radio de impacto | Deben compararse capacidades y costos antes de contratar o aprovisionar | Es la base segura que puede complementarse con 1 y 4 | **Recomendada como dirección prioritaria** |
| 4 | preparar Laravel fuera del servidor y desplegar después | Resuelve la ausencia de Composer/Node en el servidor mediante un artefacto preconstruido | “Después” sigue condicionado a entorno aprobado, VEREDICTO y autorización humana; no adopta Laravel | Complementa 3; no crea aislamiento por sí sola | **Recomendada como mecanismo futuro condicionado**, no para ejecutar ahora |
| 5 | otra solución adecuada a hosting compartido | Mantiene abierta una alternativa más simple o más compatible con restricciones reales | Requiere comparación posterior; no se selecciona framework, servicio ni topología en esta REF | Puede sustituir 4 si la evidencia demuestra mejor ajuste | **Abierta**, sin decisión tecnológica |

## Estrategia segura recomendada, sin despliegue

```text
Estado actual sin cambios
  -> decisión humana no mutante sobre el tipo de staging independiente a evaluar
  -> REF posterior compara capacidades, riesgos y costos de la dirección elegida
  -> sólo después: eventual autorización de contratación/aprovisionamiento
  -> build reproducible fuera del servidor, únicamente si se adopta después un stack que lo requiera
  -> sólo después de VEREDICTO y autorización: preflight o despliegue controlado
  -> ADR tecnológico, si corresponde, en una REF posterior
```

No se debe usar el sitio principal como banco de pruebas. La producción futura continúa condicionada. Ninguna versión PHP, framework, proveedor o topología queda seleccionada por esta ORDEN.

### Opción 4 — requisitos de una release externa reproducible

Sólo si una decisión posterior adopta Laravel u otro stack que use Composer, la preparación fuera del servidor deberá:

1. Usar en local/CI la misma versión menor de PHP y el mismo conjunto de extensiones demostrado para el entorno de destino.
2. Conservar `composer.lock` y ejecutar una instalación de producción reproducible, sin dependencias de desarrollo y sin actualizar versiones durante el despliegue (`composer install --no-dev --prefer-dist --optimize-autoloader`).
3. Comprobar los requisitos de plataforma en el entorno de build equivalente al destino.
4. Compilar CSS/JavaScript fuera del servidor e incluir `vendor/` y activos resultantes dentro de un artefacto inmutable.
5. Emitir un manifiesto con versión/commit, PHP objetivo, extensiones requeridas, hash de `composer.lock`, hashes del artefacto y fecha de build.
6. Excluir `.env`, credenciales, datos, backups y cualquier secreto.
7. No ejecutar Composer, Node ni herramientas de build en el servidor.

Esta especificación sólo hace auditable la estrategia humana 4. No autoriza crear Laravel, generar el artefacto, cargar archivos ni desplegar.

## Próximo paso humano exacto

La humana debe tomar **una sola decisión no mutante**: elegir qué alternativa de entorno independiente se autoriza únicamente para comparación documental en una REF posterior, sin contratar, aprovisionar ni desplegar:

- **A — Cuenta cPanel separada temporal:** una cuenta distinta de la actual, con su propio selector/runtime PHP, MySQL y webroot. Es la alternativa recomendada por similitud operativa con el hosting compartido futuro.
- **B — Entorno PHP administrado externo temporal:** un servicio administrado independiente que permita fijar PHP, extensiones y MySQL compatibles, sin tocar la cuenta actual.

**Decisión solicitada:** responder `A` o `B`. La elección sólo define qué categoría evaluar; no autoriza seleccionar proveedor, pedir cotización vinculante, contratar, crear recursos, cargar datos ni desplegar.

### Evidencia que debe volver

Una respuesta humana registrada con `A` o `B`. No se requiere ticket, captura, credencial, contratación ni cambio remoto en este paso.

## Impacto sobre la interfaz y el producto

**Impacto actual: cero.** Esta REF no modifica prototipo, navegación, estilos, responsive, roles, idioma, datos ficticios, sitio principal ni URL de staging. Los límites de 64 MB y 900 segundos permanecen como evidencia técnica para decisiones futuras; no crean requisitos ni cambios de interfaz en este ciclo.

## Alcance de una REF posterior de preflight

Sólo después de recibir la decisión humana `A` o `B` y de un VEREDICTO independiente se podrá redactar otra ORDEN para comparar documentalmente la alternativa elegida. Una eventual REF de preflight posterior deberá separar, como mínimo:

1. Confirmación del aislamiento real respecto de la cuenta actual y captura del estado previo.
2. Selección temporal de runtime únicamente en el entorno aislado, con autorización humana específica.
3. Verificación de versión, extensiones, `disable_functions`, OPcache y límites efectivos.
4. Confirmación de rewrite, protección de archivos sensibles, logs y comportamiento de ModSecurity.
5. Cron inocuo y no solapado, sin tareas de negocio.
6. Backup/exportación y prueba no destructiva de restauración antes de cualquier base o migración.
7. Criterios de reversión y evidencia del estado posterior.

Esto sigue siendo preflight; no equivale a despliegue ni adopción tecnológica.

## Criterios de aceptación para `reviewer_auditor`

- La REF y el frontmatter son válidos y permanecen estables.
- La evidencia reciente corrige el bloqueo histórico de DNS/TLS sin borrar su historia.
- El selector PHP global se trata como riesgo transversal para el sitio principal.
- Las cinco estrategias se preservan literalmente y se comparan sin sustituir su sentido.
- La recomendación no cambia PHP, no despliega, no crea BD/cron y no usa Composer/SSH.
- No se pide otra confirmación de MultiPHP o del selector global ya resuelto por soporte.
- La recomendación prioriza staging temporal independiente y describe una release externa reproducible sólo como mecanismo futuro condicionado.
- El próximo paso humano es una única decisión no mutante `A` o `B`, sin contratación ni despliegue.
- Se describe impacto sobre interfaz y se separan hechos, inferencias y decisiones propuestas.
- No se adopta Laravel, versión PHP, topología final ni ADR.
- Cualquier cuenta o entorno externo queda sujeto a freno humano de gasto y no se contrata.
- El rol que preparó la ORDEN no emite su propio VEREDICTO.

## Frenos aplicables

- No cambiar PHP global ni por dominio.
- No tocar el sitio principal, DNS, TLS, webroot, ModSecurity, archivos remotos ni permisos.
- No crear ni modificar base de datos, usuario, cron, `.env`, release o backup.
- No instalar ni ejecutar Composer, Node, Laravel o dependencias.
- No desplegar, migrar datos, activar proveedor, contratar hosting ni incurrir en gasto.
- No abrir ADR ni declarar stack definitivo.
- La aprobación del Auditor sólo permite presentar esta estrategia al humano; no autoriza ejecución.

## Solicitud de auditoría

`reviewer_auditor` debe auditar esta revisión 2 contra los siete cambios obligatorios de `HANDOFF/VEREDICTO-VAAK-PHP-STRATEGY-2-A.md`. Esta ORDEN no emite ni anticipa el resultado de esa auditoría.
