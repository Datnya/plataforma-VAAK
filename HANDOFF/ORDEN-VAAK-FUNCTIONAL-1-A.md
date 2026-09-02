---
artifact_type: ORDEN
phase: "functional_blueprint"
ref: "VAAK-FUNCTIONAL-1-A"
from: architect_chief
to: reviewer_auditor
status: revised_for_review
blocking: true
created_at: "2026-08-26"
updated_at: "2026-08-26"
---

# ORDEN — Blueprint funcional previo a implementación de Plataforma VAAK

## Mandato humano conservado

La humana solicita definir la experiencia funcional previa a implementar una plataforma íntegramente en **English**. El acceso inicial debe ser por login de nombre de usuario y contraseña, con control opcional para mostrar/ocultar la contraseña, y usar `LOGO VAAK.png` como activo de marca. Al iniciar sesión, Admin y Worker ven un dashboard de proyectos; Admin tiene herramientas de administración; Worker sólo ve los proyectos habilitados y tiene capacidades limitadas. Ambos pueden generar órdenes de compra dentro de un proyecto y gestionar SPEC según el mandato, mientras que Client debe contar con una experiencia demostrable separada. La plataforma debe tener datos ficticios de demostración: un proyecto y tres cuentas de ejemplo (Admin, Worker y Client), sin publicar secretos o credenciales en documentos.

La humana definió también: datos generales del proyecto, áreas/tipologías, miembros del equipo del cliente, objetivos/tareas con estado y fechas, vista personal de objetivos para Worker, proveedores, SPEC, futuras fichas técnicas y órdenes de compra con plantilla que será proporcionada después. Resolvió expresamente que Worker emite órdenes de compra, gestiona SPEC y añade proveedores dentro de los proyectos que tenga asignados; Admin no revisa ni emite esas órdenes como requisito. Client inicia sesión para consultar reportes autorizados y su historial autorizado de órdenes de compra, mientras que tracking permanece público y separado. Todo requisito que afecte un rol debe actualizar su contrato vivo antes de consolidarse.

Esta ORDEN convierte ese mandato en un blueprint documental, sin implementar producto, crear usuarios, persistir datos, desplegar ni modificar cPanel, Vercel, GitHub, MySQL, contratos de rol o `PROJECT-STATE.md`.

## Evidencia y límites de interpretación

| Fuente | Uso en esta REF | Límite |
|---|---|---|
| Instrucción humana vigente, 2026-08-26 | Fuente primaria de los requisitos funcionales y de roles de esta ORDEN. | Si contradice evidencia anterior, se registra la contradicción; no se resuelve por inferencia. |
| `LOGO VAAK.png` | Activo local autorizado para la futura pantalla de login y referencia visual de paleta. El archivo muestra marrones oscuros y acentos dorados sobre fondo oscuro. | No fija hexadecimal, tipografía, licencia de fuentes ni implementación de diseño; los tokens se validarán con contraste y accesibilidad. |
| `docs/ux/VAAK-UX-REFERENCE.md` y matriz UX | Referencia para proyectos centrados en tarjetas, detalle contextual y superficies sobrias. | No concede permisos ni convierte datos del PDF de referencia en semillas. |
| `docs/roles/*.md` | Contratos vivos de acceso existentes. | No son matriz de autorización ni permisos implementados; se actualizarán sólo en la siguiente ejecución documental aprobada. |
| Restricciones de staging/hosting | Límites de implementación futura. | DNS/TLS/PHP siguen bloqueados; esta REF no avanza infraestructura. |

## 1. Blueprint funcional a documentar tras VEREDICTO APROBADO

El ejecutor documental elaborará un único blueprint trazable que separe requisito humano, decisión pendiente y criterio de aceptación. Debe usar etiquetas y ejemplos de interfaz en **English**, aunque el documento de gobierno pueda estar en español.

### 1.1 Identidad, idioma y acceso

| ID | Requisito humano | Estado documental inicial | Límite / criterio futuro |
|---|---|---|---|
| FUN-001 | Toda la interfaz visible al usuario se escribe en English. | validado_por_humano | Incluye labels, estados, validaciones, navegación, documentos y ayudas; no obliga a traducir documentación interna. |
| FUN-002 | Pantalla inicial de login con el logo local VAAK y branding brown, white and gold. | validado_por_humano | Diseñar contraste suficiente; usar el activo local autorizado, no logos del PDF de referencia. |
| FUN-003 | Inicio de sesión por username y password, con botón/icono de ojo para alternar visibilidad de contraseña. | validado_por_humano | El control nunca revela contraseña guardada, sólo el valor introducido localmente; recuperación, bloqueo, MFA y política de contraseña siguen pendientes. |
| FUN-004 | La cabecera posterior al login muestra el nombre del usuario autenticado y su rol. | validado_por_humano | Definir una etiqueta inglesa de rol y no confiar en datos editables del cliente. |

**Etiquetas de referencia en English:** `Sign in`, `Username`, `Password`, `Show password`, `Hide password`, `Signed in as`, `Administrator`, `Worker`, `Client`.

### 1.2 Dashboard de Admin y Worker

| ID | Requisito humano | Admin | Worker | Límite / criterio futuro |
|---|---|---|---|---|
| FUN-010 | Dashboard inicial con los proyectos registrados, cada uno con imagen general. | Ve los proyectos dentro de su ámbito autorizado. | Ve sólo proyectos a los que Admin le conceda acceso. | Imagen de portada requiere activo autorizado y control de acceso; el ejemplo usa datos ficticios. |
| FUN-011 | La cabecera del dashboard muestra nombre y rol. | Sí. | Sí. | Derivado de FUN-004. |
| FUN-012 | Dashboard de Worker con vista de sus objetivos asignados, plazo y estado. | No se exige una vista equivalente, aunque podrá acceder a la gestión de tareas si se aprueba. | Sólo objetivos asignados a ese Worker y de proyectos autorizados. | Definir orden, vencimiento, zona horaria y si muestra objetivos finalizados. |
| FUN-013 | Admin dispone de una sección Tools. | Sí. | No, salvo futura autorización explícita. | Debe agrupar acciones administrativas sin dar acceso por ocultamiento visual solamente. |

### 1.3 Herramientas de Admin

| ID | Herramienta / capacidad | Alcance solicitado | Límite que debe documentar el blueprint |
|---|---|---|---|
| FUN-020 | `Create New User` | Crear cuentas y asignar un rol. | No definir aún invitación, recuperación, datos obligatorios, política de contraseña o activación sin la matriz de autorización. |
| FUN-021 | `User Management` | Listar todos los usuarios; filtrar por rol; crear, editar username/password, disable y delete. | `Delete` es una operación destructiva: definir confirmación, impacto en historial y conservación/auditoría antes de implementar. `Disable` debe revocar sesiones y no borrar trazabilidad. |
| FUN-022 | `Add New Project` | Crear un proyecto. | Definir campos mínimos, propietario/ámbito y auditoría. |
| FUN-023 | `Official VAAK Platform Guide` | Enlace o acceso al manual PDF que la humana proporcionará. | No inventar ni incluir el manual; definir sólo placeholder privado y control de acceso. |
| FUN-024 | `Supplier Management` | Vista general de proveedores y `Add New Supplier`. | Admin administra el catálogo global; Worker puede añadir y gestionar proveedores dentro de sus proyectos asignados. Definir campos, deduplicación, contacto, ámbito y trazabilidad. |

### 1.4 Detalle de proyecto

El blueprint debe describir una ruta conceptual `Projects → Project details` y estos bloques visibles para Admin/Worker, sujeto a la política de lectura definida:

| ID | Tarjeta / datos requeridos | Capacidad solicitada | Criterio futuro |
|---|---|---|---|
| FUN-030 | `General Information` | Legal business name, `Tax ID`, tax ID type/country, fiscal address, delivery/warehouse address, installation start date y hotel opening date. | Separar datos fiscales, direcciones y fechas; Worker asignado tiene lectura completa, pero no edición de esta tarjeta. Definir formato y auditoría de edición. |
| FUN-031 | `Project Areas` | Room count y room types; residence count y residence types; common areas con nombre y floor. | Definir entidades/cantidades, no sólo texto libre; aún no reemplaza el modelo heredado de áreas/ambientes. |
| FUN-032 | `Client Team Members` | First name, last name, job title, phone y email; botón `Add New Member`. | Diferenciar contacto de cliente y cuenta Client; tratar teléfono/correo como datos personales. |
| FUN-033 | `Project Results` | Objetivo/tarea, fecha de alta, usuario responsable, due date y estado. | Estados solicitados: `Pending`/red, `In Progress`/yellow, `Completed`/green. El color no puede ser el único indicador. |

### 1.5 Tareas y alcance operativo de Worker

| ID | Regla solicitada | Interpretación limitada que debe conservarse |
|---|---|---|
| FUN-040 | Admin puede ver y editar el detalle del proyecto y sus objetivos. | Alcance de edición completo sólo tras matriz de autorización, auditoría y reglas de cambios. |
| FUN-041 | Worker puede ver el detalle completo de los proyectos que Admin le asigne. | Regla base de lectura total por proyecto asignado: incluye Tax ID, direcciones y contactos. No puede editar la información general del proyecto ni objetivos/tareas ajenas. |
| FUN-042 | Si una tarea está asignada al Worker, puede actualizar su estado. | Excepción explícita a FUN-041: sólo cambia el estado de su propia tarea, no responsable, fecha, texto, proyecto ni tareas ajenas. Debe quedar auditado. |

Worker puede crear y gestionar SPEC, proveedores y órdenes de compra únicamente dentro de proyectos asignados. Cada creación, edición, emisión y cambio de estado debe conservar quién lo realizó, cuándo y dentro de qué proyecto. Worker no gestiona usuarios, roles, accesos de proyecto, configuración global, ni edita los datos generales del proyecto u objetivos que no le fueron asignados. El blueprint debe separar estado de tarea, asignación, fecha límite, checklist y resultado de proyecto. Debe prever que una tarea puede no estar asignada; no debe inventar notificaciones, Kanban ni automatizaciones.

### 1.6 SPEC y órdenes de compra

| ID | Requisito humano | Reglas mínimas a diseñar | Dependencia |
|---|---|---|---|
| FUN-050 | Cada SPEC tiene código identificable y futura ficha técnica con imagen de muestra. | Código único, trazable y no reutilizable; ficha e imagen sólo cuando exista fuente/autorización. | Fichas reales y su plantilla aún no existen. |
| FUN-051 | Admin y Worker visualizan los SPEC registrados y pueden añadir nuevos SPEC. | Worker crea y gestiona SPEC sólo en proyectos asignados; el código debe ser único, trazable y no reutilizable. | Fichas reales y su plantilla aún no existen. |
| FUN-052 | Admin y Worker generan y emiten órdenes de compra dentro de un proyecto mediante formulario. | Worker puede emitir POs de proyectos asignados sin revisión/emisión obligatoria de Admin. Una PO hereda/selecciona datos autorizados del proyecto: cliente, Tax ID y delivery warehouse address; registra date of issue e issuer. | Diseño de PO prometido por la humana; no crear plantilla ni numeración definitiva. |
| FUN-053 | Los SPEC se seleccionan por código al crear una PO. | Debe validar que el SPEC es visible/usable para el proyecto y preservar una instantánea histórica de datos comerciales una vez aprobada la regla. | Catálogo, cantidades, precios, impuestos, monedas, aprobaciones y lifecycle aún requieren definición. |

No se presupone que `generate` significa enviar, aprobar, firmar, descargar públicamente o producir un PDF definitivo. La plantilla de PO que entregue la humana desencadenará una REF específica para campos, numeración, seguridad, PDF y conservación.

### 1.7 Experiencia de Client

El contrato vigente exige historial de reportes autorizados y de órdenes de compra autorizadas de su proyecto/empresa, además de consulta de tracking. La humana pide además una cuenta de demostración Client. El blueprint debe mantener las dos experiencias separadas:

- `Client portal`: login, sólo reportes y Purchase Orders explícitamente autorizados de su empresa/proyecto, con control de datos visibles.
- `Tracking lookup`: consulta mínima por código opaco, con rate limiting, respuesta uniforme, expiración/revocación y sin revelar órdenes, importes, direcciones, identidad o reportes por la sola posesión del código.

No se le concede a Client dashboard interno, gestión de proyectos, equipos, proveedores, SPEC, creación/edición de PO, pagos ni tareas.

### 1.8 Datos ficticios y pruebas visuales futuras

La futura implementación podrá incluir exactamente como mínimo:

- un proyecto ficticio y una imagen/portada con titularidad demostrable o un placeholder neutro;
- una cuenta de prueba por rol: Admin, Worker y Client;
- un conjunto reducido de áreas, un contacto ficticio de cliente, tareas y SPEC ficticios necesarios para recorrer las pantallas.

No incluir datos del PDF de referencia, datos de la clienta, personas reales, direcciones reales, contactos reales, claves ni hashes de contraseñas en documentación, GitHub, Vercel o capturas. Las credenciales temporales se generarán únicamente durante una fase de implementación autorizada, se entregarán fuera de la documentación versionada y deberán requerir cambio/rotación antes de cualquier uso no local.

## 2. Decisiones humanas resueltas

Las seis decisiones que antes aparecían como Q-FUN fueron resueltas por la humana el 2026-08-26. Ya no deben tratarse como ambigüedades ni como permisos inferidos; son requisitos documentales que la siguiente fase debe traducir en matriz de autorización propuesta, sin implementar código.

| ID | Decisión humana | Regla resultante | Límite obligatorio |
|---|---|---|---|
| Q-FUN-01 | Worker emite POs y gestiona SPEC como parte de su trabajo. | Puede crear, editar dentro de su ámbito y emitir POs de proyectos asignados; no requiere revisión/emisión de Admin. | Scope estricto por proyecto, trazabilidad y sin administración de usuarios/global settings. |
| Q-FUN-02 | Client usa login y el tracking público sigue separado. | Client consulta sólo reportes y su historial de POs autorizados. | Tracking por código no otorga acceso al portal ni a datos comerciales. |
| Q-FUN-03 | Deshabilitación inmediata; eliminación conservadora. | Admin puede deshabilitar de inmediato; el usuario se archiva lógicamente o sólo se elimina si no tiene actividad. | Deshabilitar revoca acceso y conserva historial; no borrar actividad. |
| Q-FUN-04 | Identificador fiscal genérico. | Usar `Tax ID` con tipo y país según diseño. | No fijar una norma nacional única sin evidencia posterior. |
| Q-FUN-05 | Worker añade proveedores. | Puede añadir y gestionar proveedores asociados a proyectos asignados. | Prevenir duplicados y registrar trazabilidad; no configura catálogos globales fuera de su ámbito. |
| Q-FUN-06 | Lectura íntegra del proyecto asignado. | Worker ve todos los datos de cada proyecto habilitado. | No obtiene acceso a proyectos no asignados ni facultad de editar su información general. |

Persisten decisiones de diseño no resueltas —campos completos y lifecycle de PO, numeración, impuestos, monedas, precios, aprobación comercial, visibilidad exacta de cada documento Client y plantilla PDF—, pero no invalidan las seis reglas anteriores ni pueden resolverse silenciosamente.

## 3. Entregables documentales autorizables después de auditoría

Si el `reviewer_auditor` aprueba esta ORDEN, una ejecución documental posterior podrá, con la misma REF y sin código:

1. Crear `docs/functional/` con un blueprint de pantallas, navegación, módulos, reglas de estado, datos y criterios de aceptación trazables a FUN-001…FUN-053.
2. Crear una matriz de autorización propuesta que distinga lectura, creación, edición, emisión, desactivación y eliminación por rol, proyecto y excepción; deberá reflejar las decisiones Q-FUN-01…Q-FUN-06 sin inventar los flujos aún pendientes.
3. Actualizar `docs/roles/ADMIN.md`, `WORKER.md` y `CLIENT.md` con las capacidades humanas confirmadas, su fuente, límites y fecha, sin presentar decisiones abiertas como permisos aprobados.
4. Crear una ENTREGA de la REF con diffs, validación de frontmatter/enlaces y comprobación de que no se incorporaron datos reales o credenciales.

No se permitirá todavía crear código, usuarios, fixtures, bases de datos, archivos PDF, cuentas, credenciales, despliegues ni cambios de infraestructura. Las modificaciones a `PROJECT-STATE.md` sólo se propondrán cuando exista una ENTREGA auditada.

## 4. Criterios de aceptación de auditoría

El Auditor debe poder confirmar que la ORDEN:

1. Preserva los requisitos de login, branding, interfaz English, dashboard, herramientas Admin, detalle de proyecto, tareas, SPEC y PO sin declarar implementación.
2. Diferencia permisos confirmados, límites de Worker y decisiones de diseño aún pendientes, sin ampliar el contrato Client ni convertir tracking en acceso general.
3. Incorpora explícitamente Q-FUN-01 a Q-FUN-06 como decisiones humanas resueltas y elimina la contradicción previa entre Worker read-only y SPEC/PO sin ampliar su ámbito.
4. Exige que los contratos de los tres roles se actualicen en una ejecución documental posterior, con fuente, identificadores y fechas.
5. Define datos de demostración sólo como ficticios y prohíbe publicar/documentar credenciales, secretos o datos del prototipo PDF.
6. Mantiene el bloqueo DNS/TLS/PHP y no habilita despliegue, cPanel, Vercel, GitHub, MySQL, Composer ni código de producto.
7. Usa `LOGO VAAK.png` sólo como activo local autorizado y no infiere tokens visuales finales sin validación de contraste.

## Frenos aplicables

- Sin VEREDICTO APROBADO y autorización humana no hay implementación, fixtures, usuarios ni código.
- No modificar DNS, TLS, PHP, cPanel, MySQL, cron, ModSecurity, hosting, Vercel, GitHub ni secretos.
- No crear usuarios de prueba ni documentar sus contraseñas; no usar datos reales de la clienta o del PDF UX.
- No emitir, enviar, firmar, aprobar o publicar órdenes de compra, fichas SPEC, reportes, payment requests ni tracking.
- No asumir que el staging bloqueado es apto para desplegar.

## Próximo destinatario

`reviewer_auditor` debe auditar esta ORDEN de manera independiente. Si el resultado es `APROBADO`, se podrá preparar únicamente la documentación funcional y las actualizaciones de contratos de rol que correspondan. La implementación de permisos y escrituras sensibles sigue bloqueada hasta una fase de implementación aprobada y autorizada por la humana.

## Fuentes

- Instrucción humana vigente, 2026-08-26.
- `AGENTS.md`
- `PROJECT-BRAIN.md`
- `PROJECT-STATE.md`
- `docs/roles/README.md`, `ADMIN.md`, `WORKER.md`, `CLIENT.md`
- `docs/ux/VAAK-UX-REFERENCE.md`
- `docs/research/VAAK-RESEARCH-0-A/04-interface-requirements-matrix.md`
- `HANDOFF/ORDEN-VAAK-UX-1-A.md`, `HANDOFF/VEREDICTO-VAAK-UX-1-A.md`
- `HANDOFF/ORDEN-VAAK-STAGING-2-A.md`, `HANDOFF/VEREDICTO-VAAK-STAGING-2-A.md`
- `LOGO VAAK.png` (SHA-256: `840004A7CB7F417A0C300C85E18621335978A0E5C7FD4D4847660404CD1C362E`)
