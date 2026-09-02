---
artifact_type: ORDEN
phase: "research"
ref: "VAAK-UX-1-A"
from: architect_chief
to: reviewer_auditor
status: draft_for_review
blocking: false
created_at: "2026-08-26"
---

# ORDEN — Análisis y documentación UX de la referencia visual VAAK

## Instrucción humana conservada

> Mientras se resuelve el bloqueo externo de DNS/TLS/PHP para staging, avanzar sin desplegar ni implementar producto. Analizar a profundidad `VAAK PROCUREMENT - FF&E INPUTS (1).pdf` como prototipo visual y fuente de especificaciones, y usarlo como referencia para la futura plataforma.

La humana autoriza en esta REF que este PDF, que antes era suplementario, sea **referencia visual y fuente de especificaciones**. Esa autorización no convierte sus nombres, personas, proyectos, empresas, direcciones, correos, imágenes, importes ni fechas de muestra en datos reutilizables.

## Evidencia primaria revisada

`VAAK PROCUREMENT - FF&E INPUTS (1).pdf`, 6 páginas, revisado visualmente completo.

Sus anotaciones amarillas expresan solicitudes del cliente. Las pantallas y documentos mostrados son referencia; los textos de ejemplo se clasifican conforme a la sección siguiente. Cualquier necesidad de negocio que contradiga el corpus obligatorio o un requerimiento humano posterior deberá elevarse como HALLAZGO, no resolverse por inferencia.

## 1. Clasificación obligatoria de lo observado

| Clase | Qué entra | Tratamiento requerido |
|---|---|---|
| **Requisito explícito** | Anotaciones/etiquetas que piden dashboard con fotos de proyectos; información relevante por proyecto; información general, comités, inicio de instalación y apertura de hotel modificable; áreas, habitaciones/tipologías y áreas comunes/ubicación; equipo cliente y cargos; categorías de resultados con tareas internas, checklist y responsables; generación de PDF de SPEC, orden de compra y payment request | Registrar en una futura matriz de requisitos UX con fuente, estado y criterio de aceptación. No declararlo implementado. |
| **Inferencia visual** | Uso de tarjetas con portada, breadcrumbs, vista centrada por proyecto, paneles/tarjetas, tablas, indicadores de fecha/estado, tablero tipo Kanban, controles de menú/notificaciones/ayuda y estética cálida/minimalista | Proponerlo como decisión de UX pendiente de validación; no convertirlo en requisito funcional ni en permisión de rol. |
| **Dato de muestra no reutilizable** | Logotipos, fotografías, nombres de personas/empresas/proyectos, direcciones, teléfonos, correos, importes, monedas, referencias de PO/SPEC/solicitud, fechas, tareas y estados contenidos en los mockups | No copiar a fixtures, semillas, demostraciones públicas, capturas, pruebas, PDFs reales ni documentación de producto. Usar datos ficticios o aprobados y separar activos con licencia/consentimiento comprobable. |

## 2. Alcance documental a preparar tras esta ORDEN

Tras VEREDICTO `APROBADO`, el ejecutor documental podrá crear, sin implementar interfaz ni código, dos artefactos vivos bajo `docs/ux/`:

1. Un **sistema UX/visual de referencia**: principios de jerarquía, navegación, composición, responsive/accessibility por decidir, componentes y tokens visuales propuestos, inventario de patrones observados, límites de uso de marca e imágenes y trazabilidad por página del PDF.
2. Una **matriz de requisitos de interfaz**: requisito/ID, fuente exacta, tipo de evidencia (explícito/inferencia), roles potencialmente afectados, datos mínimos, estado, riesgo, dependencias con el dominio y criterio de aceptación verificable.

No se deben fijar colores exactos, tipografías, librerías UI, contratos de API, esquema de base de datos, flujos de autorización ni generación real de PDFs sin una REF específica y la decisión correspondiente. El sistema visual debe servir de guía compatible con una implementación server-rendered y conservadora para el hosting, sin suponer SPA, SSR Node, WebSockets ni procesos persistentes.

## 3. Módulos y flujos que la matriz debe registrar

| Módulo/flujo observable | Evidencia | Clasificación inicial | Límite de esta REF |
|---|---|---|---|
| Dashboard/listado de proyectos | Tarjetas con imagen de portada, nombre/código, recencia y menú contextual | Requisito explícito para tarjetas con fotos; resto inferencia visual | No definir filtros, orden, acceso ni carga de imágenes. |
| Entrada/portada de proyecto | Breadcrumb, portada cambiable y contexto de proyecto | Portada cambiable: explícito; breadcrumb: inferencia | No definir almacenamiento ni permisos de cambio. |
| Ficha general | Razón social, identificador fiscal, direcciones, comités, fechas de instalación/apertura y reunión semanal | Campos/fechas señalados explícitamente; layout inferido | Tratar datos personales y fiscales como sensibles por diseño. |
| Áreas y tipologías | Habitaciones, tipologías/cantidades y áreas comunes con venue/ubicación | Explícito | No consolidar taxonomía final sin matriz funcional. |
| Equipo del cliente | Lista de miembros y cargos | Explícito | No confundir con cuentas de usuario, roles de plataforma ni permisos. |
| Resultados/checklists/asignaciones | Categorías de proyecto con tareas internas, responsable, vencimiento y estados; alternativa tablero | Explícito para checklist/asignación; Kanban es inferencia | No adoptar gestor de tareas ni estados definitivos. |
| Documentos PDF | Fichas SPEC, órdenes de compra y payment requests | Explícito | No generar, guardar, firmar, enviar ni decidir plantillas finales aún. |

## 4. Impacto preliminar en contratos de roles

Este impacto es una hipótesis de documentación y debe quedar como `pendiente_de_diseño` hasta que haya matriz de autorización aprobada:

- **Admin:** posible administración de proyectos, información general, áreas, equipo, documentos, tareas y asignaciones. El PDF no demuestra que todo sea administrable por este rol ni define segregación de funciones.
- **Trabajador:** posible consulta o actualización limitada de módulos/tareas que Admin autorice. El PDF no define qué acciones puede realizar, por lo que no se presume edición, emisión de PDFs ni acceso a todos los proyectos.
- **Cliente:** el PDF ilustra miembros del equipo del cliente, no permisos de una cuenta Cliente. Sus vistas de reportes y tracking se mantienen restringidas por su contrato vigente; no se les concede acceso a fichas, órdenes, pagos, equipo o tablero por esta referencia.

Antes de actualizar contratos de roles, cada capacidad debe pasar por la futura matriz y por una REF de actualización que preserve fuente, fecha y alcance de datos visibles.

## 5. Riesgos de privacidad, propiedad y seguridad

- Las seis páginas exhiben datos que parecen identificables/comerciales: contactos, direcciones, teléfonos, correos, marcas, proyectos, proveedores, importes y documentos de compra/pago. Se tratan como confidenciales aunque su naturaleza exacta no esté confirmada.
- Las fotografías, logotipos y diseños son referencias visuales, no licencia para republicación ni para poblar ambientes de demostración. Requieren titularidad o autorización antes de uso productivo.
- Los PDF de compra/pago contienen información financiera y de contrapartes; la futura visualización/descarga deberá ser privada, autorizada, auditada y con mínimos datos por rol. No se usará un enlace público como sustituto de autorización.
- Una portada de proyecto no debe exponer metadatos, nombres de archivos o imágenes a usuarios sin permiso. El mecanismo de carga/transformación/almacenamiento queda fuera de alcance.

## 6. Criterios de aceptación de la futura ENTREGA documental

El Auditor deberá poder confirmar que:

1. La evidencia de las seis páginas se inventaría sin omitir las anotaciones explícitas ni presentar las inferencias como requisitos humanos.
2. Existe una separación visible entre requisitos explícitos, inferencias y datos de muestra no reutilizables, con trazabilidad al PDF/página.
3. El sistema UX y la matriz de interfaz son documentos Markdown con frontmatter válido, IDs estables, estado, fuente, riesgos y criterios verificables.
4. Registran dashboard de proyectos con tarjetas/portada, ficha general, áreas/tipologías, equipo cliente, resultados/checklists/asignaciones y los tres PDF solicitados.
5. El impacto de roles no amplía permisos ni contradice `docs/roles/`; las actualizaciones de contratos se postergan a una REF propia.
6. Documentan privacidad/licencia de datos e imágenes de muestra y no copian datos reales o aparentemente sensibles a artefactos de ejemplo.
7. No hay código de producto, dependencia, configuración de cPanel, DNS/TLS/PHP, datos remotos, despliegue, cambio de contratos de rol ni cambio de `PROJECT-STATE.md` en la ENTREGA.

## Frenos aplicables

Esta ORDEN no autoriza cambios remotos ni desarrollo de producto. Se mantienen los bloqueos de `VAAK-STAGING-2-A`: no subir Laravel, crear base, cambiar PHP, TLS, DNS, cron, ModSecurity, credenciales, GitHub, Vercel o datos operativos. Tampoco autoriza reutilizar fotografías, logos, nombres, contactos, importes ni plantillas financieras del PDF.

## Próximo destinatario

`reviewer_auditor` debe auditar esta ORDEN de manera independiente. Si emite `APROBADO`, la siguiente ejecución queda limitada a documentación UX/visual y matriz de requisitos; no a implementación.

## Fuentes

- `AGENTS.md`
- `PROJECT-BRAIN.md`
- `PROJECT-STATE.md`
- `HANDOFF/ORDEN-VAAK-STAGING-2-A.md`
- `HANDOFF/VEREDICTO-VAAK-STAGING-2-A.md`
- `VAAK PROCUREMENT - FF&E INPUTS (1).pdf` (6 páginas, referencia visual/especificaciones autorizada por la humana en esta REF)
