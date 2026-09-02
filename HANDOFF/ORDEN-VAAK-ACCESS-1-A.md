---
artifact_type: ORDEN
phase: "0"
ref: "VAAK-ACCESS-1-A"
from: architect_chief
to: reviewer_auditor
status: draft_for_review
blocking: true
created_at: "2026-08-26"
---

# ORDEN — Contratos vivos de acceso y corrección documental

## 1. Mandato humano conservado

La humana autorizó de manera expresa una corrección documental excepcional para cerrar los faltantes señalados en `VAAK-HOSTING-1-A`. También aportó requisitos de acceso para tres roles y solicitó contratos Markdown vivos, actualizables cuando se descubran funciones nuevas:

- **Admin:** acceso total a las secciones de la plataforma; puede crear usuarios y asignar roles.
- **Trabajador:** acceso limitado a las secciones que el Admin le habilite.
- **Cliente:** puede consultar el historial de reportes de su proyecto/empresa y consultar el estado de su producto mediante un código de tracking.

La humana describe una topología temporal: un dominio de trabajo en Vercel, hosting actual de la clienta y una cuenta GitHub de desarrollo; al finalizar, un dominio oficial provisto por la clienta y eliminación del proyecto de la cuenta GitHub de la humana. Esta descripción no decide por sí sola dónde ejecuta backend/API, dónde residen los datos operativos ni qué datos pueden llegar a terceros.

## 2. Alcance documental autorizado

Tras recibir esta ORDEN, el ejecutor documental podrá realizar exclusivamente estas modificaciones, sin código de producto, cPanel, base de datos remota, despliegues, proveedores, credenciales, Git remoto ni cambios de infraestructura:

1. Corregir `docs/research/VAAK-RESEARCH-0-A/02-hosting-constraints.md` para registrar literalmente:
   - El `include_path` observado: `.:/opt/alt/php73/usr/share/pear`.
   - Que las notificaciones de **Resource Usage** están administradas o restringidas por el proveedor/administrador del hosting.
   - Que los datos comerciales del plan relativos a CPU, RAM y límites generales de correo son información aportada por la humana, pero no verificable desde el cPanel observado; no sustituyen límites técnicos efectivos ni autorizan inferencias de capacidad.
2. Crear `docs/roles/README.md`, `docs/roles/ADMIN.md`, `docs/roles/WORKER.md` y `docs/roles/CLIENT.md` como contratos vivos de requisitos humanos, no como especificaciones implementadas ni autorizaciones de acceso reales.
3. Registrar la topología temporal en un artefacto documental nuevo de la REF como una **PREGUNTA/condición operativa**, sin elegir alternativa, y enlazarla desde el índice de roles si ayuda a evitar ambigüedad.
4. Crear `HANDOFF/ENTREGA-VAAK-ACCESS-1-A.md` con evidencia de los únicos archivos modificados o creados, para revisión independiente.

No modificar en esta REF `AGENTS.md`, `PROJECT-BRAIN.md`, `PROJECT-STATE.md`, ADRs, código, configuración de despliegue ni documentos de producto distintos a los expresamente nombrados arriba.

## 3. Corrección de restricciones de hosting

La corrección debe mantener la distinción entre hechos observados, datos aportados por la humana, límites desconocidos y condiciones de staging. En particular:

- `include_path` corresponde a la configuración observada bajo PHP 7.3; no demuestra su valor ni disponibilidad bajo PHP 8.4 y no será dependencia de la plataforma.
- La restricción de notificaciones de Resource Usage significa que no se debe prometer alerta automática de límites desde cPanel; la telemetría y reacción deben seguir siendo una verificación pendiente.
- Los valores comerciales de CPU/RAM y los límites de correo no deben presentarse como medición de cPanel, garantía de recursos dedicados, capacidad de concurrencia ni permiso para campañas de correo.
- La recomendación Laravel 13 + PHP 8.4 sigue condicionada a staging y no se convierte en ADR ni decisión definitiva.

## 4. Contratos vivos de roles

`docs/roles/README.md` deberá establecer este contrato de mantenimiento:

- Cada nueva función descubierta se registra en el archivo del rol afectado antes de declarar que el requisito está consolidado.
- Toda capacidad lleva al menos: identificador estable, descripción, alcance de datos, estado (`propuesto`, `validado_por_humano`, `pendiente_de_diseño`, `implementado_y_verificado`), evidencia/fuente, restricciones, riesgos y fecha de última revisión.
- Los permisos reales se determinarán más adelante mediante una matriz de autorización aprobada; estos documentos no conceden acceso ni sustituyen pruebas de autorización.
- Si una función afecta varios roles, se referencia en cada contrato afectado y se conserva una única fuente de evidencia.
- Todo cambio material de rol, datos visibles, delegación, aprobación o acceso externo debe pasar por el ciclo Arquitecto → Auditor y, cuando corresponda, por decisión humana.

### ADMIN.md

Debe documentar como requisitos humanos iniciales: administración integral de la plataforma, alta de usuarios, asignación de rol y futura administración explícita de permisos del Trabajador. Debe dejar pendientes el modelo de delegación, baja/suspensión, recuperación de cuenta, segregación de funciones, auditoría y restricciones de datos por empresa/proyecto.

### WORKER.md

Debe documentar acceso mínimo por defecto y acceso sólo a secciones habilitadas explícitamente por Admin. Debe prohibir asumir administración de usuarios, roles, privilegios globales o acceso a proyectos ajenos. Las acciones funcionales concretas quedan pendientes del catálogo de requisitos y de una matriz aprobada.

### CLIENT.md

Debe documentar acceso limitado al historial de reportes de su propio proyecto/empresa y la consulta de estado del producto mediante tracking. Debe dejar en estado pendiente el alcance exacto de reportes, vínculo identidad-proyecto/empresa, autenticación, privacidad, soporte y datos que puede visualizar cada estado logístico.

## 5. Requisitos de seguridad para consulta de tracking de cliente

La futura función de tracking debe quedar registrada como requisito de seguridad, no implementada:

- Código opaco de alta entropía, generado criptográficamente; no secuencial, no derivado de identificadores internos, empresa, orden o fechas.
- Capacidad de expiración, revocación y reemplazo del código; registrar emisión, uso relevante, revocación y responsable sin guardar el secreto en texto legible en auditoría.
- Rate limiting, respuesta uniforme ante códigos inválidos y controles contra enumeración/automatización; los valores concretos quedan pendientes de diseño y límites reales del hosting.
- Minimización de respuesta: no filtrar identidad, dirección, montos, órdenes internas, historial completo ni si un código existe cuando no supera los controles aplicables.
- Autorización adicional cuando el nivel de detalle exceda una consulta pública mínima; el código por sí solo no debe convertirse en acceso general a datos de empresa o reportes.
- Estados logísticos deben provenir de una fuente trazable y mostrar sólo la información autorizada para el Cliente.

## 6. Topología temporal: PREGUNTA bloqueante de decisión

Crear una PREGUNTA documental con la misma REF que deje claras estas invariantes:

- **GitHub es repositorio de código y trazabilidad de desarrollo; no es almacenamiento de datos operativos, adjuntos de clientes, backups de producción, archivos `.env` ni exportaciones de base de datos.**
- **Vercel no es una base de datos.** La existencia de un dominio temporal de Vercel no define dónde se alojan datos, adjuntos ni servicios de backend.
- Los datos operativos finales deberán residir bajo control de la clienta en una infraestructura autorizada y compatible; la migración, retención y eliminación segura requieren un plan aprobado antes de usar datos reales.

La PREGUNTA debe exponer sin resolver estas alternativas:

| Alternativa | Descripción | Condición pendiente |
|---|---|---|
| A | Frontend y API temporal en Vercel, con backend/datos en cPanel mediante una interfaz segura | Definir si cPanel puede exponer API segura, CORS, autenticación, límites y operación sin procesos persistentes. |
| B | Vercel sólo como prototipo/interfaz temporal; monolito Laravel y MySQL en cPanel para los entornos con datos operativos | Verificar staging, publicación segura, despliegue empaquetado y dominio temporal compatible. |

No seleccionar A o B, no configurar Remote Database Access y no conectar Vercel con MySQL remoto hasta una decisión humana y evaluación de seguridad. La intención de borrar un repositorio GitHub al final no sustituye controles de datos, historial de despliegue, copias de trabajo ni procedimiento de cierre seguro.

## 7. Criterios de aceptación para la ENTREGA

El Auditor deberá poder comprobar de forma independiente que:

1. Los dos faltantes del veredicto previo se registran con su alcance correcto y los datos comerciales quedan matizados como no verificables desde cPanel.
2. Existen los cuatro documentos de roles con frontmatter YAML válido y ninguno representa un permiso implementado o aprobado de forma inexistente.
3. Cada contrato de rol tiene mantenimiento por función, estados, fuente/evidencia, límites de datos y restricciones de seguridad.
4. `CLIENT.md` registra todos los controles de tracking de la sección 5 y no expone datos por simple conocimiento de un código.
5. La topología se presenta como PREGUNTA/condición, sin decisión silenciosa y sin declarar GitHub o Vercel como almacenes de datos operativos.
6. No hay cambios fuera del alcance autorizado; especialmente no hay código de producto, despliegue, modificación de cPanel, Git remoto ni actualización de State.
7. La ENTREGA contiene rutas, resumen de diffs y evidencia de validación de frontmatter.

## 8. Próximo destinatario

`reviewer_auditor` debe auditar esta ORDEN antes de cualquier corrección o creación documental. Si solicita cambios, el Arquitecto revisará exclusivamente esos hallazgos con la REF `VAAK-ACCESS-1-A`; máximo tres ciclos.

