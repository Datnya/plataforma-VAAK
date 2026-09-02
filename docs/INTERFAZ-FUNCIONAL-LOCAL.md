# Contrato funcional de la interfaz local VAAK

Este documento conserva el comportamiento acordado de la demo local. Un cambio de diseño no debe sustituir ni eliminar estas funciones sin actualizar este contrato.

## Proyecto

- **Datos generales:** el lápiz abre un formulario editable con razón social, dirección fiscal, dirección de almacén, ciudad y país. El botón `Guardar cambios` actualiza sólo esta tarjeta.
- **Áreas del proyecto:** el lápiz abre un formulario editable con número de habitaciones, residencias y áreas comunes. El botón `Guardar cambios` actualiza sólo esta tarjeta.
- **Equipo del cliente:** permite agregar miembros, eliminar cada miembro tras una confirmación explícita y conservar el contacto al cancelar.
- **Banner:** el lápiz abre el gestor de imágenes; permite conservar, eliminar o agregar imágenes, con máximo de cinco. La imagen principal es la portada visible del banner.

## Órdenes de compra

- La orden se crea dentro de cada proyecto y recibe numeración y tracking consecutivos.
- Las acciones disponibles son previsualizar, descargar y editar el estado del tracking.
- En el listado del proyecto, Admin y Trabajador también pueden eliminar una orden emitida mediante el ícono rojo de papelera y una confirmación explícita. Al confirmar, desaparece de tracking y de los reportes del proyecto.
- La previsualización utiliza como diseño base el formato `VAAK Formato Orden de Compra HPG_En Blanco.pdf` de HPG; no se reemplaza por un diseño alterno.
- El tracking muestra el último usuario que actualizó el estado y admite: recojo de almacén, en envío, llegada al almacén del cliente y entregado.
- **Historial general:** cada fila permite `Ver` la orden usando el mismo formato PDF HPG, `Descargar` mediante el diálogo de impresión/guardar como PDF del navegador y `Eliminar` sólo tras la pregunta “¿ESTÁS SEGURO DE QUE DESEAS ELIMINAR ESTA ORDEN DE COMPRA?”. Cancelar conserva el registro.

## Auditoría ligera de controles (2026-09-02)

- Se verificaron los controles principales de navegación, tarjetas de herramientas, edición de proyecto, equipo, órdenes de compra, facturas y perfil.
- Los botones del historial general de órdenes quedan conectados al flujo funcional real; no deben actuar como controles sólo visuales ni mostrar una previsualización alternativa.
- Todo botón nuevo o modificado debe registrar aquí su acción, su resultado esperado y cualquier confirmación requerida antes de sustituir un flujo existente.

## Regla común de formularios

- Todo formulario y confirmación se abre en un diálogo. Debe permitir escribir, elegir listas, editar los valores precargados y enviar su acción indicada.
- La `X`, el botón `Cancelar`/`No, volver` y un clic fuera del panel cierran el diálogo sin guardar ni eliminar. El cierre es único y prioritario para que ningún módulo lo intercepte.
- Una confirmación sólo se utiliza para eliminar, deshabilitar o confirmar una acción irreversible; nunca reemplaza un formulario de edición.
- Al guardar correctamente, el diálogo se cierra, se actualiza la vista correspondiente y se muestra un mensaje de resultado.

## Inventario de formularios y confirmaciones

- **Acceso:** inicio de sesión valida usuario y contraseña; el ojo alterna la visibilidad de la contraseña sin cambiar su tipografía.
- **Gestión de usuarios:** `Nuevo usuario`, `Editar` y `Editar accesos` abren los formularios correspondientes. Los accesos se activan o desactivan por sección y por proyecto para trabajadores y clientes; el administrador conserva acceso total. Las confirmaciones de deshabilitar se resuelven por separado.
- **Gestión de proveedores y biblioteca de specs:** `Nuevo` y `Editar` abren campos editables; la ficha técnica se abre como visualización, no como confirmación.
- **Nuevo proyecto:** solicita razón social, dirección fiscal, ciudad, país, representante legal, teléfono y portada. Tras guardar, el proyecto aparece en el panel.
- **Proyecto:** los tres lápices mantienen su formulario específico: datos generales, áreas y equipo del cliente. El editor del banner permite agregar/eliminar imágenes hasta cinco sin sustituir los otros formularios.
- **Órdenes de compra:** `Generar nueva orden de compra` abre el formulario de datos, ítems dinámicos y moneda. `Continuar` muestra la previsualización conservando los datos para volver a editar; `Generar` guarda la orden. Tracking, previsualización, descarga y eliminación son flujos independientes.
- **Facturas:** `Generar nueva factura` abre únicamente el formulario Payment Request; el contacto se selecciona o busca entre los contactos registrados. Al guardar genera la previsualización PDF del formato HPG.
- **Equipo:** `Asignar objetivo` y el lápiz de cada objetivo abren campos editables de objetivo, descripción, asignado, período, vencimiento y referencia. Guardar crea/actualiza el objetivo; sus campos son editables y la X/cancelar/clic exterior cierran sin cambios.
- **Perfil:** el avatar abre el formulario de foto. Permite cargar, ajustar mediante arrastre y zoom, guardar o cancelar. No debe bloquear la página Equipo.
- **Eliminaciones:** miembros del equipo del cliente, imágenes, órdenes y facturas siempre solicitan una pregunta explícita con opciones de conservar o eliminar; ninguna eliminación se ejecuta al abrir el diálogo.

## Emisión de factura

- Cada proyecto muestra esta sección debajo de sus órdenes de compra, con historial y el botón `Generar nueva factura`.
- El formulario usa los campos del formato HPG `VAAK_Payment Request_En Blanco.pdf`: solicitud, proyecto, OC, moneda, detalle, partes, entrada de factura, desglose, pago y aprobaciones.
- La solicitud se numera de forma consecutiva a nivel general y se puede previsualizar con el mismo diseño antes de descargarla como PDF.
- Cada factura emitida incluye el ícono rojo de papelera. La confirmación identifica que se eliminará una factura y, al confirmarla, actualiza inmediatamente su historial y reporte.
- El formulario toma como referencia de llenado `VAAK_Payment Request (1).pdf`: el código de solicitud se genera automáticamente y los datos repetidos en el PDF (moneda, total y pagadero a) se completan desde un único campo fuente. El contacto usa un desplegable con búsqueda (`datalist`) de los contactos registrados.

## Reportes por proyecto

- Debajo de **Emisión de factura** aparece la sección **Reportes** para los usuarios que gestionan el proyecto.
- `Reporte de órdenes de compra` descarga un archivo Excel con el diseño de **PO Item Listing**, sus métricas y todos los ítems de las OC del proyecto actual.
- `Reporte de facturas` descarga un archivo Excel con el diseño de **Invoice Details**, sus métricas y todas las facturas del proyecto actual.
- Los archivos se generan en el navegador con los datos vigentes del proyecto; no mezclan órdenes ni facturas de otros proyectos.
- Al emitir o eliminar una orden/factura se vuelve a renderizar el proyecto, por lo que los contadores y las descargas reflejan el cambio sin recargar manualmente.

## Perfil de usuario

- Admin, trabajador y cliente pueden pulsar su avatar del encabezado y cargar una foto de perfil.
- La foto reemplaza las iniciales en el encabezado y se reutiliza en gestión de usuarios y listas de objetivos cuando se renderizan.
- En la demo local, el cambio se guarda en el almacenamiento local del navegador.
- La sincronización visual de avatares debe ser idempotente: nunca debe reconstruir una imagen que ya corresponde al usuario, para evitar bucles de actualización que bloqueen la sección Equipo.
