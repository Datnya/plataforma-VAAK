# Formulario de ORDEN DE COMPRA (OC) — qué hace cada campo

**Para qué sirve este documento.** Es el inventario exacto del formulario de orden de compra:
cada campo, cómo se llama por dentro, de dónde saca su contenido, qué obliga, qué calcula y
dónde vuelve a salir después (documento impreso, registro del proyecto, requerimientos de pago,
seguimiento y reportes). Se escribió el 24-sep-2026, antes de cambiar la forma de guardar los
datos, para poder reconstruir el comportamiento sin adivinar.

**Regla de oro:** si un cambio futuro rompe algo de lo que está escrito aquí, el cambio está
mal hecho, no el documento. Si el código y el documento se contradicen, gana el código, pero
hay que corregir el documento en el mismo commit.

---

## 1. Dónde vive

| Parte | Archivo |
| --- | --- |
| Cuerpo del formulario | `staging/public/prototype/app.js` (rama `order-editor`) |
| Proveedor y fabricante como listas + panel de datos | `app.js` → `enhanceOrderParties()`, `fillOrderParty()` |
| Renombrados (Ship To, Bill To, Incoterm, fechas) | `app.js` → `applyPurchaseOrderFieldSemantics()` |
| Valores por defecto del documento | `app.js` → `applyPurchaseOrderDocumentDefaults()`, `applyOrderFormDefaults()` |
| Campos comerciales, impuesto, ajustes | `app.js` → `ensureReferencePurchaseOrderFields()` |
| Cálculo de totales | `app.js` → `syncReferencePurchaseOrderTotal()` |
| Tope de cantidad por spec | `app.js` → `aplicarTopeCantidad()`, `saldoDelSpec()` |
| Título editable del valor CIF y «Preparado por» | `staging/public/prototype/oc-formulario.js` |
| Direcciones de proveedor y almacenes | `staging/public/prototype/oc-direcciones.js` |
| Borradores | `staging/public/prototype/oc-borradores.js` |
| Guardado real | `staging/public/prototype/access-runtime.js` (`new-order`, `revise-order`) |
| Numeración | `access-runtime.js` → `nextPurchaseOrderNumber()` |
| Documento impreso | `staging/public/prototype/purchase-order-template.js` |
| Registro del proyecto y cuadro «Ver registro completo» | `app.js` → `filaDelRegistro()`, `listados.js` |

## 2. Cómo se abre, quién puede y cuántos pasos tiene

- Se abre desde la página del proyecto: **«Nueva orden de compra»**.
- Permisos: `new-order` es de **Admin y Trabajador**. El Cliente solo ve las OC **aprobadas**
  de sus proyectos (`preview-order`, `order-versions`) y nunca puede crear ni editar.
- El formulario tiene **dos pasos**:
  1. Se llenan los campos y se pulsa **«Continuar»**. La plataforma muestra la **vista previa
     del documento tal como se imprimirá**, con el número «BORRADOR».
  2. Desde ahí: **«Volver al formulario»** o **«Generar orden de compra»**. Recién al generar
     se crea la OC y se le asigna el número definitivo.
- En cualquier momento se puede usar **«Guardar como borrador»**: el borrador guarda todos los
  campos, los ítems, los descuentos/recargos y las direcciones elegidas, y al continuarlo se
  restauran uno por uno disparando los mismos eventos que al escribir, para que se recalculen
  los totales y las listas dependientes.

## 3. Tabla rápida de campos

Orden real en pantalla. Los campos marcados «(añadido)» no están en el HTML original: los
agrega la propia plataforma al abrir el formulario.

| # | Etiqueta que ve el usuario | Nombre interno | Control | Obligatorio |
| --- | --- | --- | --- | --- |
| 1 | Tipo de OC | `ocTeam` | lista FF&E / OS&E | **Sí** |
| 2 | Rubro | `ocRubro` | buscador + lista agrupada | **Sí** |
| 3 | Proveedor (Manufacturer) | `supplier` | lista de proveedores | **Sí** |
| 4 | Fecha de emisión | `date` | fecha | **Sí** |
| 5 | Contacto del proyecto | `projectContact` | lista de clientes del proyecto | No |
| 6 | Fabricante (Source) | `source` | lista de proveedores | **Sí** |
| 7 | Dirección de almacén guardada | `warehouse` | lista de almacenes del proyecto | No |
| 8 | Dirección de entrega / almacén (Ship To) | `shipTo` | texto | No |
| 9 | Destino final | `destination` | texto | No |
| 10 | Dirección fiscal (Bill To) | `billTo` | texto | No |
| 11 | Incoterm | `incoterm` | texto | No |
| 12 | Fecha de entrega de los productos | `deliveryDate` | fecha | No |
| 13 | Flete | `freight` | texto libre | No |
| 14 | Términos | `terms` | área de texto (varias líneas) | No |
| 15 | Especificado por | `specifiedBy` | texto | No |
| 16 | Marca lateral | `sideMark` | texto | No |
| 17 | Preparado por | `preparedBy` | texto bloqueado | — |
| 18 | Términos de pago (añadido) | `paymentTerms` | texto | No |
| 19 | Tiempo de producción (añadido) | `productionTime` | texto | No |
| 20 | Garantía (añadido) | `warranty` | texto | No |
| 21 | Valor CIF (añadido, título editable) | `cifLabel` + `cifValue` | texto + número | No |
| 22 | Tipo de impuesto (añadido) | `taxType` | lista IGV / IVA / VAT | No |
| 23 | Contacto del proyecto impreso (añadido) | `contactName`, `contactPhone`, `contactEmail` | textos | No |
| 24 | Porcentaje del impuesto (añadido) | `taxRate` | número | No |
| 25 | Monto del impuesto (añadido) | `taxAmount` | número bloqueado | — |
| 26 | Descuentos o recargos (añadido) | `adjConcept{n}`, `adjAmount{n}`, `adjSign{n}` | filas repetibles | No |
| 27 | Ítems / Specs | `itemSpec{n}`, `itemQuantity{n}`, `itemCurrency{n}`, `itemCost{n}` | por fila | **Sí** (la primera fila) |

Ocultos: `projectId`, `amountCurrency`, `amountValue`, y los datos del proveedor
(`supplierAddress`, `supplierContact`, `supplierPhone`, `supplierEmail`) y del fabricante
(`sourceAddress`, `sourceContact`, `sourcePhone`, `sourceEmail`).

## 4. Campo por campo

### 1. Tipo de OC (`ocTeam`)
- Obligatorio: **FF&E** o **OS&E**.
- **Define la numeración**: las FF&E numeran desde `0001` y las OS&E desde `8001`, cada serie
  independiente dentro del mismo proyecto.

### 2. Rubro (`ocRubro`)
- Un cuadro de búsqueda encima de la lista, que filtra las opciones mientras se escribe.
- La lista viene del catálogo de rubros, **agrupada en OS&E y FF&E**, sin los rubros eliminados
  (`vaak-removed-oc-rubros`) y con los añadidos a mano (`vaak-custom-oc-rubros`).
- Se guarda el **código** del rubro, no su nombre.
- Dónde sale: línea «Area:» del bloque PROJECT en el documento impreso y como referencia
  «Referencia OC / área» del requerimiento de pago.

### 3. Proveedor (Manufacturer) (`supplier`)
- La etiqueta original «Proveedor» se cambia a **«Proveedor (Manufacturer)»**.
- Lista de **proveedores activos**. Obligatorio.
- Al elegirlo se abre debajo un panel con su **dirección, contacto, teléfono y correo**, y esos
  datos se copian a campos ocultos que quedan guardados **dentro de la OC**. Por eso, si el
  proveedor cambia de dirección mañana, la OC ya emitida sigue mostrando la de ese día.
- Dónde sale: bloque **MANUFACTURER** del documento; es también el proveedor que hereda el
  requerimiento de pago (campos «Pagar a» y «Realizar el pago a»).

### 4. Fecha de emisión (`date`)
- Obligatoria. Se rellena sola con **la fecha de hoy** al abrir el formulario.
- Se imprime junto a «Preparado por» en el bloque PREP BY / DATE, con formato `24 Sept. 2026`.
- Es el campo por el que se filtra «desde / hasta» en el cuadro «Ver registro completo».

### 5. Contacto del proyecto (`projectContact`)
- Lista con los **usuarios Cliente** vinculados a ese proyecto (por alcance total, por lista de
  proyectos o por vínculo directo). Guarda el nombre.
- No es lo mismo que el «Contacto del proyecto impreso» (campo 23), que sí sale en el PDF.

### 6. Fabricante (Source) (`source`)
- El campo de texto «Fuente» se convierte en **lista de proveedores** y se renombra
  «Fabricante (Source)». Obligatorio, con el mismo panel de datos que el proveedor.
- Dónde sale: bloque **SOURCE** del documento.
- Los campos «Fabricante» (`manufacturer`), «Contacto del fabricante» y «Contacto de la fuente»
  del HTML original **se eliminan al abrir**: quedaron reemplazados por estas dos listas.

### 7. Dirección de almacén guardada (`warehouse`)
- Lista con los almacenes del proyecto: el del proyecto (`project.warehouse`) más los añadidos
  (`project.warehouses`). El botón **«Agregar nueva dirección»** guarda una nueva en el
  proyecto, dentro de los datos compartidos, así la ven todos los usuarios.
- Al elegir una, **se copia al campo «Ship To»**.

### 8. Dirección de entrega / almacén (Ship To) (`shipTo`)
- Se rellena sola con el almacén del proyecto; se puede escribir encima.
- Dónde sale: bloque **SHIP TO** del documento, debajo de la razón social del proyecto.

### 9. Destino final (`destination`)
- Si tiene contenido, se imprime como **Final Destination** dentro del bloque SHIP TO.

### 10. Dirección fiscal (Bill To) (`billTo`)
- Se rellena sola con la dirección fiscal del proyecto (`project.fiscal`).
- Dónde sale: bloque **BILL TO**, que siempre lleva impreso el aviso
  «*DO NOT SHIP TO BILL TO ADDRESS UNLESS OTHERWISE STATED».

### 11. Incoterm (`incoterm`)
- Es el campo que el HTML llama «Instrucciones de envío»: se renombra a **Incoterm** y cambia a
  texto (ejemplos de ayuda: CIF, FOB, DDP / «CIF Acajutla»).
- Dónde sale: casillero **INCOTERM** de los términos comerciales.

### 12. Fecha de entrega de los productos (`deliveryDate`)
- Fecha. Dónde sale: casillero **DELIVERY DATE**.

### 13. Flete (`freight`)
- Nace como monto con moneda y **se convierte en texto libre**: admite «Incluido», «USD 450»,
  «por confirmar». La lista de moneda se elimina.
- Dónde sale: casillero **FREIGHT**. Si va vacío, el documento imprime «Included».

### 14. Términos (`terms`)
- Área de texto que crece sola; Enter crea una línea nueva y se respetan todas.
- Dónde sale: casillero **TERMS**.
- Ojo: si el proyecto tiene condiciones propias (`project.terms`), se copian a la OC como
  `conditions` y se imprimen en el bloque de condiciones del documento.

### 15. Especificado por (`specifiedBy`)
- **Texto libre** (pedido del 22-sep-2026): el especificador no es necesariamente alguien de
  HPG. Si se deja vacío, se guarda el nombre de quien emite la OC.
- Dónde sale: casillero **SPECIFIED BY**.

### 16. Marca lateral (`sideMark`)
- Se rellena sola con el **nombre del proyecto**; se puede cambiar.
- Dónde sale: casillero **SIDE MARK** y, además, en la columna ITEM de cada línea.

### 17. Preparado por (`preparedBy`)
- **Bloqueado**: siempre el nombre de quien está llenando la OC. No se puede escribir.
- Dónde sale: casillero **PREP BY / DATE** junto con la fecha de emisión.

### 18. Términos de pago (`paymentTerms`)
- Texto libre (ejemplo: «50% anticipo, 50% contra entrega»).
- Dónde sale: casillero de términos de pago del documento y **se copia solo** al requerimiento
  de pago que se genere para esta OC.

### 19. Tiempo de producción (`productionTime`) · 20. Garantía (`warranty`)
- Textos libres (ejemplos: «45 días desde la aprobación», «3 años por defectos de fabricación»).
- Se imprimen en el bloque de términos comerciales.

### 21. Valor CIF (`cifValue`) con título editable (`cifLabel`)
- El **título** del campo es un cuadro editable: por defecto dice `CIF Value` y se puede cambiar
  por FOB Value, DDP, etc. Se guarda en `cifLabel` y el documento lo imprime tal cual.
- El **valor** es un número y **se suma al total de la OC**.

### 22. Tipo de impuesto (`taxType`) · 24. Porcentaje (`taxRate`) · 25. Monto (`taxAmount`)
- Sin impuesto (vacío), **IGV**, **IVA** o **VAT**.
- Al elegir un tipo aparecen el porcentaje y el monto; si no hay tipo, ambos quedan ocultos.
- **IGV fija el 18% y bloquea el porcentaje** (Perú). IVA y VAT se escriben, con una ayuda:
  IVA → México 16 · Colombia/Chile 19 · España/Argentina 21; VAT → Reino Unido 20 · Alemania 19
  · Francia 20.
- El **monto del impuesto no se escribe**: es `subtotal × porcentaje ÷ 100`, siempre bloqueado, y
  se redondea a los decimales de esa OC (ver «Totales»).

### 23. Contacto del proyecto impreso (`contactName`, `contactPhone`, `contactEmail`)
- Bloque propio con el aviso «(sale impreso en la OC)». Viene relleno con el contacto de la
  empresa y se puede cambiar en cada OC.
- Dónde sale: bloque **PROJECT CONTACT** de la cabecera del documento.

### 26. Descuentos o recargos (`adjConcept{n}`, `adjAmount{n}`, `adjSign{n}`)
- Filas que se agregan con «Agregar concepto»: un **concepto**, un **monto** y el signo
  **+ o −**. Solo cuentan las filas que tengan concepto y monto.
- Entran en el total de la OC y se imprimen como líneas propias.

### 27. Ítems / Specs
Cada fila tiene cuatro controles:
- **Spec** (`itemSpec{n}`): lista con los specs **de ese proyecto que no estén cerrados**.
  Obligatorio en la primera fila. Al elegirlo se traen su nombre, su costo y su unidad.
- **Cantidad** (`itemQuantity{n}`): mínimo 1. El máximo es el **saldo del spec**: su cantidad
  menos lo ya pedido en otras OC vigentes y menos lo puesto en otras filas de esta misma OC.
  Si se pasa, sale en rojo «Solo hay N disponibles…» y no deja emitir. Si el spec no declara
  cantidad, no hay tope.
- **Costo unitario** (`itemCost{n}`) con su **moneda** (`itemCurrency{n}`).
- **Subtotal**: cantidad × costo, calculado, no se escribe.

Botón **«Agregar otro ítem»** para sumar filas.

### Totales
- **La moneda de la OC es la de la primera fila.** Si se mezclan monedas entre filas, la
  plataforma **deja guardar** pero muestra un aviso rojo: nunca convierte importes.
- **Total de la OC** = subtotal de los ítems + impuesto + valor CIF + descuentos/recargos.
- **Decimales: los manda el formulario** (24-sep-2026). Si todos los importes escritos en esa OC
  —costos unitarios, valor CIF, descuentos o recargos— llevan **dos decimales**, entonces el
  impuesto y el total también salen con dos. Si alguien escribe **tres decimales** en cualquiera
  de esos importes, esa OC pasa a trabajarse con tres. Antes el impuesto se calculaba siempre con
  tres decimales y arrastraba un tercer decimal al total (IGV de 1.234,56 daba 222.221 y el total
  1,456.781, en vez de 222.22 y 1,456.78).
- Esos decimales son los que quedan guardados, así que la OC **se ve igual en todas partes**: el
  formulario, el documento impreso, la tarjeta del registro, el requerimiento de pago que se
  genere a partir de ella y el reporte de Excel.
- Se guarda en tres lugares a la vez: `amountValue` (número), `amountCurrency` (moneda) y
  `amount` (el texto «S/ 1234.00»), que es el que muestran las listas y los reportes.

## 5. Qué pasa al generar la orden

Además de todo lo escrito, el registro guarda:

| Campo automático | Contenido |
| --- | --- |
| `id` | `o-` + fecha y hora en milisegundos + correlativo |
| `number` | `CÓDIGO DEL PROYECTO-0001` (FF&E) o `-8001` (OS&E). **Si el proyecto no tiene código, la OC no se crea.** |
| `projectCode` | código del proyecto, copiado |
| `ocTeam` | FF&E u OS&E |
| `conditions` | condiciones del proyecto, si las tiene |
| `trackingNumber` | `TRK-año-######`, aleatorio y comprobado contra los ya emitidos |
| `trackingStatus` | empieza en **Preparación**; luego En tránsito, En reparto, Entregado |
| `trackingUpdatedBy` / `trackingUpdatedAt` | quién y cuándo tocó el seguimiento |
| `createdBy` / `createdByName` / `createdAt` | quién la emitió y cuándo |
| `items[].specSnapshot` | copia congelada del spec (código, código de producto, imagen, nombre, tamaño, material, descripción, unidad y color) |

El número se calcula mirando las OC **ya existentes de ese proyecto y de ese equipo**: es el
mayor usado + 1. El número de seguimiento, en cambio, es aleatorio a propósito: con datos
compartidos, dos personas emitiendo a la vez podrían repetir un correlativo.

`createdAt` ordena el registro: la página del proyecto muestra **las 5 OC más recientes** y el
resto se ve con **«Ver registro completo»** (busca por número, proveedor, fabricante, fuente y
número de seguimiento; filtra por estado, por equipo y por rango de fecha de emisión).

## 6. Cambio de orden (revisión)

Botón **«Cambio de orden»**, solo para OC aprobadas y solo Admin/Trabajador. Se comparan campo
por campo y **cada cambio pide su motivo**; si no hay cambios, no se guarda nada.

Campos que se pueden revisar: proveedor, fuente, fecha, fecha de entrega, incoterm,
instrucciones de envío, destino final, términos, tiempo de producción, garantía, marca lateral,
términos de pago, Ship To, Bill To, dirección del proveedor, contacto del proyecto, rubro,
especificado por, preparado por, contacto impreso (nombre, teléfono, correo), tipo/porcentaje/
monto de impuesto, título y valor CIF, los ítems y los descuentos o recargos.

Al guardar: se archiva una copia completa de la versión anterior, sube el número de revisión, la
OC queda **aprobada** otra vez y el total se recalcula. El documento imprime «Rev. N» junto al
número y marca en azul lo que cambió. Las versiones se consultan con «Ver versiones».

## 7. Dónde se guarda hoy

Las OC viven en la lista `orders` del documento único de la empresa (`vaak-local-v8` en el
navegador, `vaak_company_data` en MySQL). Los borradores viven aparte, **solo en el navegador**
(`vaak-oc-drafts`): no se sincronizan. Una OC pesa unos 3,7 KB, mucho más que un spec, porque
lleva sus ítems con la copia congelada de cada spec.

## 8. Lo que no se puede perder al cambiar el guardado

1. Los dos pasos: formulario → vista previa del documento → generar.
2. La numeración por proyecto y por equipo (FF&E desde 0001, OS&E desde 8001) y el rechazo
   cuando el proyecto no tiene código.
3. El número de seguimiento aleatorio y sin repetir, y el estado inicial «Preparación».
4. Proveedor y fabricante como listas, con sus datos copiados dentro de la OC.
5. El tope de cantidad por spec y el aviso rojo cuando se excede.
6. La moneda de la OC es la de la primera fila; **nunca** se convierten importes; mezclar
   monedas avisa en rojo pero deja guardar.
6 bis. Los decimales los manda el formulario: dos salvo que se escriban tres, y los mismos en el
   PDF, el requerimiento de pago, el registro y el Excel.
7. El total sigue siendo subtotal + impuesto + CIF + ajustes, con IGV fijo en 18%.
8. «Preparado por» bloqueado y «Especificado por» libre.
9. La copia congelada del spec en cada ítem.
10. El documento impreso mantiene todos sus casilleros y el aviso del Bill To.
11. La página del proyecto sigue mostrando las 5 más recientes, con «Ver registro completo».

## 9. Pruebas que lo verifican

`bash servidor-php/pruebas/probar.sh` — pasos 4 (emitir OC), 5 (requerimiento y pago),
6 (cambio de orden con motivo), 9 (reportes), 10 (roles) y 11 (últimas 5 + cuadro con filtros).
