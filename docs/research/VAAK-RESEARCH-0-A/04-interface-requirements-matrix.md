---
artifact_type: INTERFACE_REQUIREMENTS_MATRIX
phase: "research"
ref: "VAAK-UX-1-A"
from: architect_chief
to: reviewer_auditor
status: delivered_for_audit
blocking: false
created_at: "2026-08-26"
---

# Matriz de requisitos de interfaz - Referencia UX VAAK

## Lectura de la matriz

Fuente primaria única: `VAAK PROCUREMENT - FF&E INPUTS (1).pdf`, revisado visualmente completo (páginas 1-6). `Explícito` significa anotación o etiqueta del cliente; `inferencia` significa patrón visible que requiere validación. Los roles son posibles impactos documentales, no permisos concedidos. Ninguna fila autoriza producto, acceso, persistencia, infraestructura o generación real de PDFs.

| ID | Requisito / referencia | Origen | Evidencia | Rol potencial | Datos mínimos | Estado | Riesgo / dependencia | Criterio de aceptación documental |
|---|---|---|---|---|---|---|---|---|
| UXR-001 | Mostrar un dashboard inicial donde puedan verse proyectos con fotografías. | PDF p. 1, anotación. | Explícito | Admin, Trabajador: pendiente; Cliente: no inferido. | Proyecto; imagen sólo si autorizada. | pendiente_de_diseño | Licencia/privacidad de imágenes; autorización de visibilidad. | La futura especificación separa listado, metadatos y uso autorizado de imágenes. |
| UXR-002 | Mantener información relevante del proyecto disponible en su página inicial. | PDF p. 2, anotación. | Explícito | Admin, Trabajador: pendiente; Cliente: no inferido. | Proyecto y resumen por definir. | pendiente_de_diseño | Datos visibles y permisos no definidos. | Se valida con usuarias qué información es relevante y para quién. |
| UXR-003 | Registrar información general y comités de proyecto. | PDF p. 3, anotación. | Explícito | Admin, Trabajador: pendiente. | Proyecto; comité; datos de contacto por definir. | pendiente_de_diseño | Posibles datos personales/comerciales. | La definición identifica campos, fuente, retención y autorizaciones. |
| UXR-004 | Registrar inicio de instalación y apertura de hotel modificable. | PDF p. 3, anotación. | Explícito | Admin, Trabajador: pendiente. | Fechas de proyecto. | pendiente_de_diseño | Quién modifica, auditoría y zona horaria no definidos. | La futura historia define reglas de edición, historial y presentación. |
| UXR-005 | Representar habitaciones y sus tipologías. | PDF p. 3, anotación. | Explícito | Admin, Trabajador: pendiente. | Área/habitación; tipología; cantidad. | pendiente_de_diseño | Taxonomía y vínculo con SPEC pendientes. | Se define catálogo, cantidades y relación con el dominio validado. |
| UXR-006 | Representar áreas comunes con venue y ubicación. | PDF p. 3, anotación. | Explícito | Admin, Trabajador: pendiente. | Área común; venue; ubicación. | pendiente_de_diseño | Taxonomía, precisión de ubicación y visibilidad pendientes. | La definición distingue área, venue y ubicación sin asumir campos finales. |
| UXR-007 | Registrar miembros del equipo del cliente y sus cargos. | PDF p. 4, anotación. | Explícito | Admin, Trabajador: pendiente; Cliente: no inferido. | Persona de contacto; cargo; proyecto. | pendiente_de_diseño | No equivale a cuenta de plataforma; datos personales. | La historia separa contacto de cliente, cuenta, rol y permiso. |
| UXR-008 | Desglosar resultados del proyecto por categorías. | PDF p. 4, anotación. | Explícito | Admin, Trabajador: pendiente. | Proyecto; categoría de resultado. | pendiente_de_diseño | Semántica de resultado y relación con módulos pendientes. | El catálogo define categorías y evidencia de cierre sin fijarlas aquí. |
| UXR-009 | Permitir tareas internas por categoría, marcables como checklist y asignables a responsables. | PDF p. 4, anotación. | Explícito | Admin, Trabajador: pendiente; Cliente: no inferido. | Tarea; categoría; responsable; estado. | pendiente_de_diseño | Flujo, permisos, fechas y notificaciones no definidos. | La futura especificación define acciones, transición, trazabilidad y matriz de autorización. |
| UXR-010 | Generar fichas PDF de cada SPEC. | PDF p. 5, anotación. | Explícito | Admin, Trabajador: pendiente; Cliente: no inferido. | SPEC y campos autorizados. | pendiente_de_diseño | Documento técnico; contenido, versión y acceso no definidos. | Se aprueba plantilla, datos, autorización y conservación antes de implementar. |
| UXR-011 | Generar órdenes de compra en PDF. | PDF p. 5, anotación. | Explícito | Admin, Trabajador: pendiente; Cliente: no inferido. | OC y datos comerciales autorizados. | pendiente_de_diseño | Datos financieros, aprobación, numeración, acceso. | Se aprueba flujo y plantilla antes de cualquier generación. |
| UXR-012 | Generar payment requests en PDF. | PDF p. 6, anotación. | Explícito | Admin, Trabajador: pendiente; Cliente: no inferido. | Solicitud, compra/factura y datos financieros autorizados. | pendiente_de_diseño | Financiero; cálculo, aprobación, acceso y retención. | Se aprueba flujo financiero y plantilla antes de implementar. |
| UXR-013 | Usar tarjetas de proyecto con portada, identificador, nombre y datos de recencia. | PDF p. 1, composición. | Inferencia | Admin, Trabajador: pendiente. | Proyecto; metadatos por definir. | pendiente_de_diseño | No confirma orden, filtro, menú ni política de imágenes. | Una decisión UX posterior confirma o descarta el patrón y sus datos. |
| UXR-014 | Usar breadcrumb o contexto de navegación al entrar a un proyecto. | PDF p. 2, composición. | Inferencia | Admin, Trabajador: pendiente. | Ruta de navegación. | pendiente_de_diseño | Rutas y comportamiento responsive no definidos. | Prototipo posterior valida orientación sin imponer arquitectura. |
| UXR-015 | Ofrecer una vista tipo tablero para tareas/resultados. | PDF p. 4, ejemplo visual. | Inferencia | Admin, Trabajador: pendiente. | Tarea; columna/estado. | pendiente_de_diseño | No es requisito de Kanban; estados y permisos no definidos. | Decisión humana posterior acepta, sustituye o descarta este patrón. |
| UXR-016 | Mostrar fechas de vencimiento y estados de tarea como indicadores visibles. | PDF pp. 2 y 4, composición. | Inferencia | Admin, Trabajador: pendiente. | Fecha; estado; proyecto/tarea. | pendiente_de_diseño | Semántica, alertas, zona horaria y visibilidad pendientes. | La definición futura establece fuente, cálculo y política de vencimiento. |

## Exclusiones y controles

- Los nombres de proyectos, contactos, direcciones, fotografías, marcas, importes, referencias, artículos y datos financieros del PDF no son requisitos de contenido ni ejemplos reutilizables.
- Los miembros del equipo del cliente no implican cuentas Cliente ni acceso a la plataforma.
- Ninguna fila habilita edición, asignación, emisión, descarga, firma, envío, almacenamiento, integración o permiso por rol.
- Las salidas PDF requieren una REF posterior para aprobar datos, plantilla, seguridad, retención y flujo de autorización.

## Mantenimiento

Toda nueva observación del prototipo debe añadirse con ID estable, página/origen, clasificación de evidencia y estado. Si una capacidad pasa a afectar un rol de manera explícita y aprobada, abrir la REF de acceso aplicable y actualizar los contratos vivos antes de consolidarla.
