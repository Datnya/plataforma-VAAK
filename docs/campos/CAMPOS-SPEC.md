# Formulario de SPEC — qué hace cada campo

**Para qué sirve este documento.** Es el inventario exacto del formulario de spec: cada
campo, cómo se llama por dentro, de dónde saca su contenido, qué obliga, qué calcula y
dónde vuelve a salir después (tarjeta, ficha técnica, orden de compra, reportes).
Se escribió el 24-sep-2026, antes de cambiar la forma de guardar los datos, para que
cualquier persona o modelo de IA pueda reconstruir el comportamiento sin adivinar.

**Regla de oro:** si un cambio futuro rompe algo de lo que está escrito aquí, el cambio
está mal hecho, no el documento. Si el código y este documento se contradicen, gana el
código, pero hay que corregir el documento en el mismo commit.

---

## 1. Dónde vive

| Parte | Archivo |
| --- | --- |
| Cuerpo del formulario (campos base) | `staging/public/prototype/app.js` (constructor del modal, rama `spec-editor`) |
| Bloque de ficha técnica que se añade al final | `staging/public/prototype/app.js` (`technicalFields`) |
| Retoques: quitar campos viejos, renombrar etiquetas | `app.js` → `enhanceTechnicalSheetEditor()` |
| Campo «Código del producto» | `app.js` → `enhanceSpecProductCodeField()` |
| Campo «Material» | `app.js` → `addSpecMaterialField()` |
| «Unidad de medida» (lista + escribir) | `staging/public/prototype/spec-formulario.js` |
| «Rubro del spec» (buscador, «+», ✕) | `staging/public/prototype/spec-rubros.js` |
| «Área» (agrupada por equipo) | `staging/public/prototype/proyecto-areas.js` |
| Guardado real del registro | `staging/public/prototype/access-runtime.js` (`new-spec`, `edit-spec`) |
| Permisos | `staging/public/prototype/access-control.js` (`ACTION_POLICY`) |
| Ficha técnica impresa | `staging/public/prototype/technical-sheet-template.js` |
| Tarjeta del spec | `app.js` → `specCardBody()` |
| Cuadro «Ver todos los specs registrados» | `staging/public/prototype/listados.js` |

## 2. Cómo se abre y quién puede

- Desde la página del proyecto: botón **«Agregar nuevo spec»** (`data-action="new-project-spec"`).
  El proyecto queda fijado: no se pregunta.
- Desde la sección **Specs**: el formulario muestra además el campo «Proyecto».
- Permisos (`ACTION_POLICY`): `new-spec` y `edit-spec` son de **Admin y Trabajador**.
  El Cliente nunca ve estos botones; sí puede abrir la ficha técnica (`preview-spec`) y
  las versiones (`spec-versions`) de los specs de sus proyectos.
- Un spec **cerrado** (toda su cantidad ya está pedida en órdenes de compra) no se puede
  editar: la tarjeta muestra «Cerrado · usado por completo en una OC» y, en su lugar,
  Admin y Trabajador tienen el botón **«Cambio de spec»** (revisión con motivo).

## 3. Tabla rápida de campos

Orden real en pantalla, de arriba hacia abajo.

| # | Etiqueta que ve el usuario | Nombre interno | Control | Obligatorio | Se guarda como |
| --- | --- | --- | --- | --- | --- |
| 1 | Descripción | `name` | texto | **Sí** | `name` |
| 2 | Código del spec | `code` | texto | No | `code` |
| 3 | Código del producto | `productCode` | texto | No | `productCode` |
| 4 | Tamaño (según pedido) | `size` | texto | No | `size` |
| 5 | Cantidad | `quantity` | texto | No | `quantity` |
| 6 | Unidad de medida | `unit` | lista + texto | Solo con «Otro» | `unit` |
| 7 | Rubro del spec | `category` | buscador con lista | No | `category` |
| 8 | Acabado / color | `color` | texto | No | `color` |
| 9 | Monto | `costCurrency` + `costValue` | moneda + número | No | `cost` (texto «S/ 850.00») |
| 10 | Proyecto (solo al crear desde Specs) | `projectId` | lista | Sí | `projectId` |
| 11 | Imagen del spec | `specImageFile` | archivo | No | `image` (data URL) |
| 12 | Descripción detallada | `description` | área de texto (12 líneas) | No | `description` |
| 13 | Equipo de compras | `procurementTeam` | lista FF&E / OS&E | Sí (tiene valor por defecto) | `procurementTeam` |
| 14 | Proveedor / fuente | `vendorSource` | lista de proveedores | No | `vendorSource` |
| 15 | Área | `area` | lista agrupada por equipo | No | `area` |
| 16 | Estado de la ficha | `specStatus` | lista fija | No | `specStatus` |
| 17 | Notas | `reference` | texto | No | `reference` |
| 18 | Material | `material` | texto | No | `material` |

Campos que **no se escriben** y los pone la plataforma sola: `id`, `createdAt`,
`createdBy`, `createdByName`, `revisions`.

## 4. Campo por campo

### 1. Descripción (`name`)
- Es el **único campo obligatorio** del formulario.
- La etiqueta original del código es «Nombre»; se renombra a «Descripción» al abrir.
- Dónde sale después: título grande de la tarjeta del spec; en la ficha técnica sale dos
  veces, en la fila **DESCRIPTION** del bloque SPECIFICATION y en la columna **ITEM** de la
  tabla final; en la orden de compra es el texto de la línea del ítem.

### 2. Código del spec (`code`)
- **Sale vacío siempre** (pedido del 18-sep-2026). Solo tiene un texto de ayuda: `SPEC-001`.
- Se escribe a mano; no hay numeración automática ni validación de repetidos.
- Si se deja vacío, la plataforma **muestra** un código derivado del identificador interno
  (`SPEC-` + los últimos 3 dígitos del id), pero **no lo guarda**: el campo sigue vacío al
  volver a editar. Eso lo hace `specCode()` en `app.js`.
- Dónde sale: renglón pequeño arriba del nombre en la tarjeta; **ITEM CODE** en la cabecera
  de la ficha técnica y columna **ITEM #** en su tabla final; columna ITEM de la orden de compra.

### 3. Código del producto (`productCode`)
- Es el código que le da **el proveedor** al producto (texto de ayuda: «Código asignado por
  el proveedor»). Se inserta justo debajo del código del spec.
- Dónde sale: fila **PRODUCT CODE** de la ficha técnica y, en la orden de compra, debajo del
  código del ítem.

### 4. Tamaño (según pedido) (`size`)
- En el código se llama «Medidas»; la etiqueta final es «Tamaño (según pedido)».
- Texto libre. Ejemplo de ayuda: `120 x 60 x 45 cm`.
- Dónde sale: fila **SIZE** de la ficha técnica y como segunda línea de la descripción del
  ítem en la orden de compra.

### 5. Cantidad (`quantity`)
- Texto libre, pero la plataforma lee solo los números que contenga.
- **Es el tope de compra del spec.** Al armar una orden de compra, la cantidad disponible es
  `cantidad del spec − lo ya pedido en otras OC vigentes` (las OC anuladas no cuentan).
  El formulario de la OC avisa en rojo si se pasa y no deja emitir.
- Cuando ese saldo llega a cero el spec queda **cerrado**: ya no se edita ni se vuelve a pedir.
- Si un spec viejo no tiene `quantity` pero sí el campo antiguo `quantityOrdered`, se usa ese.
- Si no hay cantidad declarada, **no hay tope**: se puede pedir cuantas veces se quiera.
- Dónde sale: «Cantidad» en la tarjeta (junto con la unidad) y fila **QTY.** de la ficha técnica.

### 6. Unidad de medida (`unit`)
- Se muestra como **lista desplegable** con: Each, Un., Lot., Case, Box, SQM, M2, M, Yard,
  SQY, Pies, Pie2, Pack, y la opción **«Otro (escribir)»**.
- El cuadro de texto real (`unit`) sigue existiendo: está oculto y solo aparece —y se vuelve
  obligatorio— cuando se elige «Otro».
- Si el spec ya traía `EACH` o `each`, la lista lo reconoce como «Each» y **no cambia el valor
  guardado** (así no aparece como una modificación al revisar).
- Dónde sale: pegada a la cantidad en la tarjeta y en la fila **QTY.** de la ficha técnica.

### 7. Rubro del spec (`category`)
- Es un **buscador**: se escribe para filtrar y se elige de la lista. Por dentro sigue siendo
  el `<select name="category">` de siempre (queda oculto), por eso el guardado, las revisiones
  y la ficha técnica no cambiaron.
- La lista junta dos orígenes: los **rubros propios del proyecto** (marcados con la etiqueta
  «proyecto», guardados en `project.rubrosPropios`) y el **catálogo general** de rubros
  (Configuración del sistema → Rubros de órdenes de compra), sin los que se hayan eliminado.
- Botón **«+»**: pregunta el nombre y guarda el rubro **en ese proyecto**. Queda disponible en
  todos los specs de ese proyecto, nuevos o editados. Avisa si ya existe.
- **✕ en cada renglón (solo Admin):** pregunta antes de borrar. Si el rubro es del proyecto,
  sale de su lista; si es del catálogo, deja de aparecer en todos los proyectos (se anota en
  `vaak-removed-oc-rubros`, que se sincroniza con el servidor). **Los specs y las órdenes que
  ya lo usaban no cambian.**
- La lista no se traduce nunca (`translate="no"`): los nombres escritos a mano se respetan.
- Dónde sale: «Rubro» en la tarjeta y **CATEGORY** en la ficha técnica.

### 8. Acabado / color (`color`)
- La etiqueta del código es «Colores disponibles»; en pantalla dice «Acabado / color».
- Texto libre.
- Dónde sale: fila **FINISH / COLOR** de la ficha técnica.

### 9. Monto (`costCurrency` + `costValue` → `cost`)
- Dos controles: la **moneda** (lista) y el **valor** (número con dos decimales).
- Monedas disponibles: `$` (USD), `S/` (PEN), `€` (EUR), MXN, COP, CLP, ARS, BRL, UYU, PYG,
  BOB, VES, CRC, GTQ, HNL, NIO, PAB, DOP, CUP. La lista es una sola en toda la plataforma.
- Se guarda como **un solo texto**: «S/ 850.00». Al reabrir el formulario, la moneda se
  reconoce del propio texto; si el texto trae `USD`, `PEN` o `EUR` se convierte a su símbolo
  para que la lista lo muestre seleccionado. **Nunca se convierte el importe** entre monedas.
- Dónde sale: «Monto» en la tarjeta. **No se imprime en la ficha técnica** (la ficha no lleva
  precios). Sí alimenta el costo unitario sugerido al agregar el spec a una orden de compra.

### 10. Proyecto (`projectId`)
- Solo aparece cuando el spec se crea desde la sección **Specs**. Si se crea desde la página
  de un proyecto, el proyecto ya viene fijado y el campo no se muestra.
- Al editar, si se envía un proyecto distinto, el spec se muda de proyecto.

### 11. Imagen del spec (`specImageFile` → `image`)
- Acepta JPG, PNG o WEBP (el aviso dice máx. 2 MB). Se guarda **dentro del registro** como
  texto data-URL, no como archivo aparte.
- Al editar, si no se elige una imagen nueva, **se conserva la anterior**.
- Dónde sale: recuadro de la ficha técnica y columna IMAGE de la orden de compra.
- Es, con diferencia, lo que más pesa de un spec. Un spec sin imagen ocupa unos 520 bytes.

### 12. Descripción detallada (`description`)
- Área de texto de 12 líneas, sin límite de caracteres.
- Dónde sale: sección **DESCRIPTION** de la ficha técnica y tercera línea del ítem en la OC.

### 13. Equipo de compras (`procurementTeam`)
- Lista con dos valores: **FF&E** (`FFE`) y **OS&E** (`OSE`). Si no se elige nada se guarda `FFE`.
- Dónde sale: encabezado de la ficha técnica («HPG International - FF&E Procurement») y como
  filtro estático en el cuadro «Ver todos los specs registrados».

### 14. Proveedor / fuente (`vendorSource`)
- Lista con los **proveedores activos** registrados en la plataforma. Si el spec trae un
  proveedor que ya no está activo, ese valor se agrega igual a la lista para no perderlo.
- Se guarda el **nombre**, no un identificador.
- Dónde sale: **VENDOR / SOURCE** en la ficha técnica; también se busca por él en el cuadro
  «Ver todos los specs registrados».

### 15. Área (`area`)
- Lista con **las áreas de ese proyecto**, agrupadas en dos bloques: **OS&E** y **FF&E**.
- Las áreas salen de la tarjeta «Áreas del proyecto»: las del catálogo (`project.areaCodes`)
  más las escritas a mano (`project.areasPropias`, cada una con su equipo).
- Si el spec ya tenía un área que hoy no está en el proyecto, esa área se mantiene arriba para
  no perder el dato.
- Si el proyecto no tiene ninguna área, debajo del campo sale el aviso: «Este proyecto no tiene
  áreas seleccionadas. Un administrador puede elegirlas en Áreas del proyecto → Ver áreas».
- Dónde sale: **AREA** en la ficha técnica y en la columna ITEM de la orden de compra.

### 16. Estado de la ficha (`specStatus`)
- Lista fija, en inglés porque así se imprime: `In Stock Option - Issued for Review`,
  `Pending Review`, `Approved`, `For Production`. Puede quedar vacío.
- Dónde sale: **STATUS** en la ficha técnica.

### 17. Notas (`reference`)
- La etiqueta interna es `reference` (era «Referencia»); en pantalla dice «Notas».
- Dónde sale: fila **NOTES** de la ficha técnica. Si el spec no tiene código, este campo
  sirve de respaldo para el ITEM CODE.

### 18. Material (`material`)
- Texto libre. Ejemplo de ayuda: «Madera maciza, acero inoxidable».
- Dónde sale: línea «Material:» dentro de la descripción del ítem en la orden de compra.

### Campos que ya no se muestran
`designFinish` (Diseño y acabado), `construction` (Construcción y fabricación) y `notes`
(Notas del proyecto) **se eliminan del formulario al abrirlo**. El código que los crea sigue
ahí; si un spec antiguo los tiene guardados, el valor se conserva pero no se edita ni se imprime.
Igual pasa con `quantityOrdered`, que solo se lee como respaldo de la cantidad.

## 5. Qué pasa al guardar

Al crear (`new-spec`) la plataforma arma el registro con **todos** los campos de arriba más:

| Campo automático | Contenido |
| --- | --- |
| `id` | `sp-` + la fecha y hora en milisegundos |
| `createdAt` | fecha y hora exactas (formato ISO) |
| `createdBy` / `createdByName` | identificador y nombre de quien lo creó |

`createdAt` es lo que ordena la lista: la página del proyecto muestra **los 5 specs más
recientes** y el resto se ve con «Ver todos los specs registrados».

Al editar (`edit-spec`):
1. Si el spec está **cerrado** (toda su cantidad ya pedida), el guardado se rechaza.
2. Antes de cambiar nada, se **congela** una copia del spec dentro de cada orden de compra que
   ya lo tenga (`specSnapshot`: código, código de producto, imagen, nombre, tamaño, material,
   descripción, unidad y color). Así una OC ya emitida **nunca cambia** porque alguien editó el
   spec después.
3. Se conservan `id`, `createdAt`, `createdBy` y las revisiones. La imagen solo se reemplaza si
   se subió una nueva.

**Cambio de spec (revisión).** Para un spec cerrado, Admin y Trabajador usan «Cambio de spec»:
se compara campo por campo y **cada cambio pide su motivo**. Los campos que se comparan son:
`name`, `code`, `productCode`, `category`, `area`, `vendorSource`, `size`, `color`, `material`,
`quantity`, `unit`, `cost`, `description`, `reference`, `specStatus`, `procurementTeam`.
Un monto escrito distinto pero con el mismo valor («$ 1,450.00» y «$ 1450.00») **no cuenta**
como cambio. Queda guardada la versión anterior completa y sube el número de revisión; lo
cambiado se imprime en azul en la ficha técnica.

## 6. Dónde se guarda hoy

Todos los specs viven en la lista `specs` del documento único de la empresa: en el navegador
en `localStorage` (`vaak-local-v8`) y en el servidor en la tabla `vaak_company_data`.
`shared-sync.js` sincroniza cada 20 segundos. Si el documento pasa del tope del servidor,
**no se guarda en silencio**: sale el aviso rojo «no se pudo guardar» con el botón «Reintentar
ahora». Esto es justo lo que cambia con la migración a tablas propias.

## 7. Lo que no se puede perder al cambiar el guardado

1. Las 18 etiquetas, en el mismo orden y con los mismos textos de ayuda.
2. «Descripción» sigue siendo el único campo obligatorio.
3. El código del spec sigue saliendo **vacío**, y la plataforma sigue **mostrando** uno
   derivado del id cuando falta.
4. El rubro sigue siendo buscador con «+» por proyecto y ✕ que pregunta antes de borrar.
5. El área sigue agrupada en OS&E y FF&E y limitada a las áreas del proyecto.
6. La moneda del spec se respeta tal cual, **sin conversión**.
7. La cantidad sigue siendo el tope de compra, y el spec agotado sigue quedando cerrado.
8. Editar un spec sigue **sin alterar** las órdenes de compra ya emitidas (`specSnapshot`).
9. La ficha técnica imprime exactamente los mismos casilleros.
10. La página del proyecto sigue mostrando los 5 más recientes, con el cuadro «Ver todos».

## 8. Pruebas que lo verifican

`bash servidor-php/pruebas/probar.sh` — pasos 2 (crear spec), 4 (OC con specs), 8 (revisión
con motivo), 10 (roles) y 11 (últimos 5 + cuadro con buscador y filtros).

## 9. Formato de la ficha técnica (25-sep-2026)

La cabecera de la ficha (logo, recuadro **ITEM CODE**, título y el renglón «HPG International -
FF&E Procurement») tenía **altura fija**. Cuando el código del spec era largo y ocupaba dos
líneas, ese renglón se desbordaba y quedaba pegado —o encima— de la tabla del proyecto: por eso
unas fichas se veían bien y otras no.

Ahora:

- la cabecera **crece** si el contenido lo necesita, y la separación bajo el título es **siempre
  11 px**, la del documento de referencia de HPG;
- los códigos de más de 10 caracteres se **achican** lo justo para caber en una sola línea
  (17 px), y los de más de 16, un poco más (13 px).

Comprobado con `CG-01A`, `GR-10-CG-01A` y `GR-10-CG-01A-REV2`: los tres en una línea y con el
mismo espaciado. Se toca en `technical-sheet-reference.css` (regla `.hpg-ts-header`) y en
`technical-sheet-template.js` (la clase del código).
