# Contrato funcional de la interfaz local VAAK

Este documento conserva el comportamiento acordado de la demo local. Un cambio de diseño no debe sustituir ni eliminar estas funciones sin actualizar este contrato.

## Proyecto

- **Datos generales:** el lápiz abre un formulario editable con razón social, dirección fiscal, dirección de almacén, ciudad y país. El botón `Guardar cambios` actualiza sólo esta tarjeta.
- **Áreas del proyecto:** el lápiz abre un formulario editable con número de habitaciones, residencias y áreas comunes. El botón `Guardar cambios` actualiza sólo esta tarjeta.
- **Equipo del cliente:** el botón `+` abre el formulario `Agregar miembro del equipo` con nombre y apellido, cargo y teléfono; `Guardar cambios` añade el contacto a la lista del proyecto. También permite eliminar cada miembro tras una confirmación explícita y conservar el contacto al cancelar.
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

### Revisión 2026-09-02 · formularios, guardado y botones

- **Editar datos del usuario:** `Guardar cambios` persiste nombre, correo y usuario. El botón de guardar nunca se deshabilita al editar en modo edición simple; la revisión de accesos (`confirmedRevision`/`revision`) sólo bloquea el guardado en `Nuevo usuario` y `Editar accesos`, no en la edición de datos.
- **Contraseña del usuario (solo Admin):** el formulario `Editar datos del usuario` incluye el campo `Contraseña del usuario`, precargado con la contraseña vigente y censurado por defecto (`type="password"`). El ícono del ojo alterna entre censurado y visible sin recargar el formulario. Al guardar, si el campo tiene valor, la contraseña se actualiza en el estado local; si se deja igual, se conserva.
- **Agregar miembro del equipo del cliente:** el botón `+` abre un formulario real (nombre, cargo, teléfono) y `Guardar cambios` lo añade al proyecto. Ya no abre un aviso genérico "Confirmación".
- **Colisión de `data-action` en formularios:** ningún `<form>` de un diálogo debe llevar un atributo `data-action`/`data-command` cuyo valor coincida con el selector de un botón disparador (p. ej. `assign-team-objective`). El delegador global de clics encuentra el `<form>` en cada clic interno y reconstruye el diálogo, impidiendo enfocar campos y abrir desplegables. El dato que necesita el `submit` se guarda en un atributo propio (`data-submit-action`).
- **Verificación realizada:** se abrieron y, cuando aplica, se guardaron: `nuevo/editar/deshabilitar usuario`, `editar accesos`, `nuevo/editar/deshabilitar proveedor`, `nuevo spec`, `ficha técnica`, `nuevo proyecto`, `editar datos generales/áreas`, `editar banner`, `agregar/eliminar miembro del equipo`, `nueva orden`, `previsualizar/descargar/eliminar orden`, `limpiar filtros` y filtros de estado, `nueva factura`, `previsualizar factura`, `actualizar tracking`, `asignar/editar objetivo`, `notificaciones`, `foto de perfil`, `idioma` y `cerrar sesión`. Todos ejecutan su acción; los cambios se reflejan tras `renderCurrentRoute` sin recargar.

### Revisión 2026-09-02 · proveedores y foto de perfil

- **Columnas de contacto del proveedor:** la celda única `Contacto` se dividió en `Nombre del contacto` y `Número de contacto`. La tabla pasó de 6 a 7 columnas; se ajustaron los anchos en `.supplier-directory`.
- **Filtros de proveedor eliminados:** se quitaron los botones `Todos`, `Activos`, `Inactivos`, `Servicios`, `Materiales` de la barra de gestión de proveedores. Sólo queda el buscador (que ahora también busca por contacto y número).
- **Formulario de proveedor:** `Editar` y `Nuevo` incluyen nombre del proveedor, RUC, nombre del contacto, número de contacto, correo electrónico, rubro (texto libre) y estado (`Activo`/`Inactivo`). El commit de `edit-supplier`/`new-supplier` persiste `contact`, `phone`, `category` y `active`.
- **Diálogo de foto de perfil rediseñado:** orden pregunta → círculo de previsualización de la foto actual → `Editar foto de perfil` (habilita arrastre y barra de zoom sólo al pulsarlo) → `Cambiar foto de perfil` (subir imagen nueva). `Guardar foto` acepta tanto un archivo subido como el reencuadre de la foto actual (`canvas.toDataURL`). El campo de archivo queda oculto y se dispara desde `Cambiar foto de perfil`.
- Se añadió la regla global `[hidden]{display:none!important}` para que el atributo `hidden` gane sobre `display:flex/grid` al alternar visibilidad de sub-bloques del diálogo.

### Revisión 2026-09-02 · usuarios, accesos de cliente y specs

- **Filtro de rol como desplegable:** en gestión de usuarios los botones `Todos/Administradores/Trabajadores/Clientes` se reemplazaron por un `<select id="user-role-filter">` con etiqueta `Filtrar por:`. Un handler `change` oculta/muestra las filas por `data-user-row`.
- **Cambio de rol sin ventana emergente:** al elegir el `Tipo de usuario` en `Nuevo usuario` ya no aparece `window.confirm`. El flujo `request-role-change` → `confirm-role-change` se ejecuta directo y refresca el editor de accesos.
- **Sin "Órdenes autorizadas":** se eliminó del editor de accesos la lista de checkboxes por orden (`data-scope="client-order"`). En su lugar hay una nota. `applyUserScopes` ya no crea filas en `clientOrderAuthorizations`.
- **Visibilidad de cliente por proyecto:** `canReadClientOrder` ahora devuelve `true` si el cliente tiene un `clientProjectLink` al proyecto de la orden (antes exigía una fila en `clientOrderAuthorizations`). Con esto, dar acceso a un proyecto muestra al cliente todas sus órdenes (y el buscador de tracking por código de orden). Las facturas de cliente por proyecto quedan pendientes de una vista dedicada.
- **Biblioteca de specs rediseñada:** `specs()` renderiza tarjetas (`.spec-card-horizontal`) con código, nombre, proyecto, tipo, círculos de color (`specColors`/`.spec-swatch`) y monto. `preview-spec` genera la ficha técnica con el diseño del formato HPG (`tmp/pdfs/spec-template/spec-1.png`). El editor de spec suma `colores` (texto por comas) y `descripción`; el commit persiste `description`. Se enriqueció la semilla `specs` con 6 ejemplos (tipos Cocina, Baño, Mueble, Paisajismo, Iluminación, Mobiliario).

### Revisión 2026-09-02 · correcciones funcionales y formato moneda

- **Editar spec:** cada tarjeta de spec incluye el botón `Editar` que abre el formulario de edición con nombre, tipo, colores (selector visual con círculos y botón agregar/eliminar), monto (con selector de moneda S/ o $) y descripción. La política ACL `edit-spec` autoriza la acción para Admin y Worker en la ruta `specs`.
- **Banner: guardar imagen corregido:** el formulario de edición de imágenes del banner (`banner-editor-form`) ahora almacena el `operationToken` del descriptor, lo que permite que el commit `edit-banner` valide correctamente el token y persista las imágenes.
- **Factura PDF sin textos sobrepuestos:** se agregaron las posiciones CSS faltantes para los campos del PDF de Payment Request: `pr-payable-address`, `pr-payable-contact`, `pr-po-ref`, `pr-invoice-date`, `pr-due-date`, `pr-terms`, `pr-invoice-payable`, `pr-invoice-currency`, y `pr-breakdown-0` a `pr-breakdown-7`. Las posiciones de `pr-invoice` y `pr-invoice-total` se reubicaron a la fila de datos (top:58%).
- **Tracking: número alineado a la izquierda:** se corrigió `text-align:left` en el primer div de `.tracking-card` para que el número de tracking quede pegado a la izquierda de la tarjeta.
- **Tracking: botón copiar ampliado:** el botón de copiar número de tracking mide 30×30 px, incluye un ícono SVG de portapapeles y muestra el tooltip `Copiar en el portapapeles` al pasar el mouse.
- **Formato moneda en todos los montos:** la función `fmtMoney` formatea automáticamente cualquier monto a `S/ 450.00` o conserva el prefijo si ya lo tiene (`$ 920.00`, `PEN 4,500.00`). Se aplica en tarjetas de spec, órdenes de compra (historial, previsualización, impresión), y facturas.
- **Progreso automático de objetivos:** el campo de progreso en objetivos del equipo ya no es editable manualmente. Se calcula automáticamente según el estado: Pendiente = 0%, En proceso = 50%, Completado = 100%.

## Regla común de formularios

- Todo formulario y confirmación se abre en un diálogo. Debe permitir escribir, elegir listas, editar los valores precargados y enviar su acción indicada.
- La `X`, el botón `Cancelar`/`No, volver` y un clic fuera del panel cierran el diálogo sin guardar ni eliminar. El cierre es único y prioritario para que ningún módulo lo intercepte.
- Una confirmación sólo se utiliza para eliminar, deshabilitar o confirmar una acción irreversible; nunca reemplaza un formulario de edición.
- Al guardar correctamente, el diálogo se cierra, se actualiza la vista correspondiente y se muestra un mensaje de resultado.
- El botón de guardar de un formulario de edición de datos permanece habilitado; sólo los flujos con revisión de accesos (`Nuevo usuario`, `Editar accesos`) pueden condicionar el guardado a una confirmación previa.
- Un `<form>` de diálogo no debe reutilizar como `data-action`/`data-command` un valor que dispare handlers globales de clic; usa un atributo propio para lo que necesite el `submit`.

## Inventario de formularios y confirmaciones

- **Acceso:** inicio de sesión valida usuario y contraseña; el ojo alterna la visibilidad de la contraseña sin cambiar su tipografía.
- **Gestión de usuarios:** el filtro por rol es un **desplegable** único (`Filtrar por: Todos / Administradores / Trabajadores / Clientes`), no una fila de botones. `Nuevo usuario`, `Editar` y `Editar accesos` abren los formularios correspondientes. `Editar` (datos del usuario) permite modificar nombre, correo, usuario y —solo para Admin— ver/editar la contraseña del usuario mediante un campo censurado con ícono de ojo; `Guardar cambios` persiste todos esos campos. En `Nuevo usuario`, cambiar el `Tipo de usuario` aplica el cambio de rol de inmediato, **sin ventana emergente de confirmación**. El formulario de accesos **no** incluye un campo de "Órdenes autorizadas": para un cliente, dar acceso a un proyecto le habilita todas las órdenes de compra y facturas de ese proyecto más el buscador de tracking. Los accesos se activan o desactivan por sección y por proyecto para trabajadores y clientes; el administrador conserva acceso total. Las confirmaciones de deshabilitar se resuelven por separado.
- **Gestión de proveedores:** la tabla muestra columnas separadas para `Nombre del contacto` (nombre completo) y `Número de contacto` (WhatsApp o celular); no se combinan en una sola celda. La barra superior sólo tiene el buscador — no lleva botones de filtro (`Todos`, `Activos`, `Inactivos`, `Servicios`, `Materiales`). `Nuevo` y `Editar` abren un formulario con: nombre del proveedor, RUC, nombre del contacto, número de contacto, correo electrónico, rubro (campo de texto libre, se escribe el rubro; no es una lista) y estado (`Activo`/`Inactivo`). `Guardar cambios` persiste todos esos campos.
- **Biblioteca de specs:** el listado muestra cada spec en una tarjeta con código, nombre, proyecto, `Tipo de spec` (texto: Cocina, Baño, Mueble, Paisajismo, Iluminación, etc.), `Colores` disponibles como círculos de color, y `Monto`. Cada tarjeta tiene el botón `Ficha técnica`, que abre una visualización (no confirmación) con el diseño del formato HPG `Technical Specification Sheet` (referencia local `tmp/pdfs/spec-template/spec-1.png`): encabezado con logo HPG y código de ítem, cuadro proyecto/categoría/cliente/fecha/área/estado, banda `ESPECIFICACIÓN` con modelo, referencia, medidas, acabado/color (con círculos) y monto, e imagen referencial; luego descripción, diseño y acabado, construcción y fabricación, notas del proyecto, la tabla `POR / CANT. / ÍTEM / ÍTEM #` y el pie de HPG. `Agregar nuevo spec` abre un formulario con nombre, tipo de spec, colores disponibles (texto separado por comas), monto, proyecto y descripción opcional.
- **Nuevo proyecto:** solicita razón social, dirección fiscal, ciudad, país, representante legal, teléfono y portada. Tras guardar, el proyecto aparece en el panel.
- **Proyecto:** los tres lápices mantienen su formulario específico: datos generales, áreas y equipo del cliente. El editor del banner permite agregar/eliminar imágenes hasta cinco sin sustituir los otros formularios.
- **Órdenes de compra:** `Generar nueva orden de compra` abre el formulario de datos, ítems dinámicos y moneda. `Continuar` muestra la previsualización conservando los datos para volver a editar; `Generar` guarda la orden. Tracking, previsualización, descarga y eliminación son flujos independientes.
- **Facturas:** `Generar nueva factura` abre únicamente el formulario Payment Request; el contacto se selecciona o busca entre los contactos registrados. Al guardar genera la previsualización PDF del formato HPG.
- **Equipo:** `Asignar objetivo` y el lápiz de cada objetivo abren campos editables de objetivo, descripción, asignado, período, vencimiento y referencia. Guardar crea/actualiza el objetivo; sus campos son editables y la X/cancelar/clic exterior cierran sin cambios.
- **Perfil:** el avatar abre el diálogo de foto de perfil con este orden fijo: (1) la pregunta `¿Deseas cambiar tu foto de perfil?`; (2) un círculo grande centrado que previsualiza la foto actual del usuario (o sus iniciales si no tiene); (3) centrado bajo el círculo, el botón `Editar foto de perfil`, que sólo al pulsarlo habilita arrastrar la foto dentro del círculo y muestra la barra de zoom (alejar/acercar) al lado; (4) el botón `Cambiar foto de perfil`, que abre el explorador para subir una imagen nueva desde el equipo. `Guardar foto` conserva el encuadre actual del círculo. La X/cancelar/clic exterior cierran sin cambios y no debe bloquear la página Equipo.
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
