---
artifact_type: UX_REFERENCE
phase: "research"
ref: "VAAK-UX-1-A"
from: architect_chief
to: reviewer_auditor
status: delivered_for_audit
blocking: false
created_at: "2026-08-26"
---

# Referencia UX y visual - Plataforma VAAK

## Propósito y límites

Esta guía documenta la referencia visual autorizada por la humana: `VAAK PROCUREMENT - FF&E INPUTS (1).pdf` (seis páginas). Sirve para orientar la futura experiencia de interfaz; no es una especificación de implementación, una decisión de librería, una matriz de permisos ni una autorización para reutilizar contenido del PDF.

Las anotaciones amarillas del PDF se tratan como requisitos explícitos. La composición, controles y estilos que sólo aparecen en los mockups se clasifican como inferencias pendientes de validación. La matriz trazable está en `../research/VAAK-RESEARCH-0-A/04-interface-requirements-matrix.md`.

## Principios de referencia

| ID | Principio | Estado | Evidencia y límite |
|---|---|---|---|
| UX-P-01 | Priorizar una entrada centrada en proyectos, con contexto claro al pasar de listado a detalle. | pendiente_de_diseño | Páginas 1-2; el dashboard con fotos es explícito, la estructura de navegación es inferida. |
| UX-P-02 | Mostrar información relevante del proyecto de forma resumida y escaneable antes de obligar a navegar a vistas secundarias. | validado_por_humano | Página 2: anotación sobre información a mano; no define el conjunto final de datos. |
| UX-P-03 | Usar jerarquía visual sobria: superficies claras, bloques delimitados, títulos legibles y espacios amplios. | pendiente_de_diseño | Patrón visual de las seis páginas; no fija colores, tipografías ni tokens exactos. |
| UX-P-04 | Separar información de proyecto, áreas, equipo, resultados y documentos para reducir mezcla de contexto. | pendiente_de_diseño | Páginas 2-6; la separación de módulos es una propuesta derivada, no un modelo de datos. |
| UX-P-05 | Mantener estados, fechas y responsables comprensibles sin exponer información sensible por defecto. | pendiente_de_diseño | Página 4; visibilidad por rol y semántica de estados siguen pendientes. |
| UX-P-06 | Tratar documentos operativos y financieros como privados, autorizados y auditables. | pendiente_de_diseño | Páginas 5-6; no se autoriza generación, descarga, firma ni almacenamiento. |

## Interacción y composición observadas

| Patrón | Clasificación | Uso futuro permitido en documentación | No decidido |
|---|---|---|---|
| Tarjetas de proyectos con portada, identificador, nombre y recencia. | Mixto: fotos explícitas; composición inferida. | Referencia para inventario y prototipos posteriores con contenido ficticio. | Orden, filtros, carga de imágenes, menú contextual y acceso. |
| Breadcrumb y cabecera contextual de proyecto. | Inferencia visual. | Patrón de orientación propuesto. | Rutas, navegación móvil y autorización. |
| Bloques de resumen y tablas compactas. | Inferencia visual. | Patrón de lectura y agrupación. | Campos definitivos, orden y edición. |
| Fechas destacadas y estado visible. | Mixto: fechas explícitas; presentación inferida. | Requisito de registrar fechas relevantes. | Cálculo, alertas, zonas horarias y estados finales. |
| Lista de tareas y alternativa tipo tablero. | Mixto: tareas/checklist/responsable explícitos; tablero inferido. | Registrar ambos como referencia con distinta certeza. | Flujo de trabajo, transiciones y permisos. |
| Acciones de cambio de portada, agregar miembro o nueva tarea. | Inferencia de interacción. | Mantener como preguntas de diseño. | Quién puede ejecutar, validaciones, auditoría y persistencia. |

## Inventario de pantallas y módulos

| Página | Módulo observado | Evidencia explícita | Inferencias que deben validarse |
|---:|---|---|---|
| 1 | Dashboard de proyectos. | Dashboard inicial donde se puedan ver proyectos con fotos. | Pestañas, iconos, menú de tarjeta, recencia y cuadrícula. |
| 2 | Portada y resumen de proyecto. | Página inicial con información necesaria a mano; portada cambiable. | Breadcrumb, disposición de secciones, control de portada. |
| 3 | Información general y áreas. | Comités, inicio de instalación, apertura de hotel modificable; habitaciones/tipologías y áreas comunes con venue/ubicación. | Etiquetas exactas, estructura de campos, cálculos de cantidades. |
| 4 | Equipo del cliente y resultados. | Miembros del equipo del cliente y cargos; categorías con tareas internas, checklist y responsables. | Tablero Kanban, columnas, vencimientos y estados. |
| 5 | Documentos SPEC y orden de compra. | Fichas de cada SPEC y órdenes de compra en PDF. | Plantilla, campos, idioma, numeración, aprobación, firma y envío. |
| 6 | Payment request. | Payment request en PDF. | Plantilla, importes/cálculos, monedas, aprobación, firma, envío y acceso. |

## Requisitos explícitos frente a inferencias

### Explícitos del PDF

- Dashboard inicial con fotografías para ver proyectos.
- Página inicial de proyecto con información relevante disponible.
- Información general, comités, inicio de instalación y apertura de hotel modificable.
- Áreas del proyecto: habitaciones y tipologías; áreas comunes, venue y ubicación.
- Miembros del equipo del cliente y sus cargos.
- Resultados por categorías con tareas internas, checklist y asignación de responsables.
- PDF de ficha de cada SPEC, orden de compra y payment request.

### Inferencias pendientes de validación humana

- Navegación mediante breadcrumbs, menú contextual, notificaciones, ayuda y avatar.
- Uso de una estética cálida/minimalista concreta, fotos como portada, tarjetas, iconografía y colores observados.
- Tablero Kanban, columnas de estado, filtros, orden, vistas, recordatorios y vencimientos como comportamiento.
- Edición de portada, alta de miembros, creación de tareas, modificación de datos o generación/descarga de PDF por un rol específico.

## Patrón de documentos PDF

Los tres documentos son salidas requeridas, no plantillas aprobadas. El diseño futuro deberá tratarlos así:

| Salida | Propósito observado | Datos sensibles potenciales | Decisiones pendientes |
|---|---|---|---|
| Ficha SPEC | Presentar la especificación técnica de un ítem. | Proyecto, proveedor/fabricante, producto, imágenes y cantidades. | Plantilla, campos requeridos, revisión, versión y destinatario. |
| Orden de compra | Comunicar una compra. | Contrapartes, contactos, precios, condiciones, destino y moneda. | Numeración, aprobación, impuestos, firma, exportación y acceso. |
| Payment request | Solicitar un pago asociado a compra/factura. | Factura, proveedor, importes, moneda, datos de pago y dirección. | Cálculos, estados, aprobaciones, retención, exportación y acceso. |

Ningún PDF debe exponerse mediante enlaces públicos. La futura entrega, vista o descarga requerirá autorización por rol, auditoría y minimización de datos; esa definición no corresponde a esta REF.

## Accesibilidad y responsive

El PDF es una referencia de escritorio y no demuestra comportamiento móvil ni cumplimiento WCAG. Para una futura fase se deberá decidir y verificar: navegación por teclado, foco visible, contraste, texto alternativo, tamaños táctiles, reflujo de tablas, carga progresiva de imágenes y representación segura de documentos. No se asume ninguna solución técnica en esta guía.

## Datos de muestra y activos excluidos

No reutilizar fotografías, marcas, logotipos, nombres, personas, empresas, direcciones, teléfonos, correos, proyectos, proveedores, códigos, fechas, importes, monedas, artículos, tareas ni documentos visibles en el PDF. Se consideran referencia confidencial y, en el caso de activos, no demuestran licencia de uso.

Usar sólo datos ficticios o material con autorización/titularidad verificable en cualquier futura maqueta, prueba, demo, semilla, captura o documento. No incluir datos de muestra del PDF en repositorios, Vercel, GitHub, staging ni artefactos de producto.

## Trazabilidad y mantenimiento

Fuente primaria: `VAAK PROCUREMENT - FF&E INPUTS (1).pdf`, páginas 1-6, revisadas visualmente el 2026-08-26. Cambios a esta guía requieren conservar REF, fuente, fecha y clasificación de evidencia. Las funciones que afecten roles deben pasar por una REF de acceso y actualizar los contratos correspondientes según `docs/roles/README.md`.
