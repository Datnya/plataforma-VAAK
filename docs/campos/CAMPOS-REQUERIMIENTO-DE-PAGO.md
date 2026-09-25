# Formulario de REQUERIMIENTO DE PAGO (RP) — qué hace cada campo

**Para qué sirve este documento.** Es el inventario exacto del formulario de requerimiento de
pago: cada campo, cómo se llama por dentro, de dónde saca su contenido, qué se calcula solo,
qué está bloqueado y dónde vuelve a salir después (documento impreso, tarjeta, saldo de la OC,
reportes de Excel). Se escribió el 24-sep-2026, antes de cambiar la forma de guardar los datos.

**Regla de oro:** si un cambio futuro rompe algo de lo que está escrito aquí, el cambio está
mal hecho, no el documento. Si el código y el documento se contradicen, gana el código, pero
hay que corregir el documento en el mismo commit.

---

## 1. Dónde vive

| Parte | Archivo |
| --- | --- |
| Cuerpo del formulario | `staging/public/prototype/app.js` → `showInvoiceEditor()` |
| Relleno automático al elegir la OC | `app.js` → `populateInvoiceFromOrder()`, `invoiceOrderDefaults()` |
| Avisos de moneda y de exceso sobre la OC | `app.js` → `alertaMontoSolicitud()` |
| Campos bloqueados, desglose propio y sumas | `staging/public/prototype/rp-formulario.js` |
| Saldo de la OC frente a sus RP | `staging/public/prototype/oc-saldo.js` |
| Guardado real | `staging/public/prototype/access-runtime.js` (`new-invoice`, `revise-invoice`, `register-payment`) |
| Numeración | `access-runtime.js` → `nextPaymentRequestNumber()` |
| Documento impreso | `staging/public/prototype/payment-request-template.js` |
| Registro del pago | `app.js` (formulario `payment-register-form`) + `rp-formulario.js` |
| Sección del proyecto y cuadro «Ver todos los requerimientos registrados» | `app.js` → `invoiceSection()`, `listados.js` |

## 2. Cómo se abre y quién puede

- Desde la página del proyecto: **«Generar nuevo requerimiento»**.
- Permisos: `new-invoice`, `revise-invoice` y `register-payment` son de **Admin y Trabajador**.
  El Cliente solo puede ver el documento (`preview-invoice`) y las versiones
  (`invoice-versions`) de sus propios proyectos; el servidor además le entrega únicamente los
  requerimientos que corresponden a sus proyectos.
- El formulario se guarda de una sola vez con **«Generar requerimiento»**. No tiene vista previa
  intermedia: la previsualización se abre después, desde la tarjeta del requerimiento.

## 3. Cabecera fija (no se escribe)

- **Proyecto**: código · nombre del proyecto.
- **Solicitado por**: siempre «HPG International Latinoamericana SAC».
- **Número de solicitud**: se asigna al guardar (ver sección 6).

## 4. Tabla rápida de campos

| Bloque | Etiqueta | Nombre interno | Control | Obligatorio | Cómo se llena |
| --- | --- | --- | --- | --- | --- |
| Solicitud | N° de OC | `poNumber` | lista de OC del proyecto | **Sí** | se elige |
| Solicitud | Fecha de solicitud | `requestDate` | fecha | **Sí** | hoy |
| Solicitud | Moneda | `currency` | lista de monedas | **Sí** | la de la OC elegida |
| Solicitud | Detalle de la solicitud | `requestDetail` | área de texto | **Sí** | texto automático, editable |
| Solicitud | Total de la solicitud | `totalRequest` | monto | **Sí** | saldo de la OC, editable |
| Partes | Proveedor / fabricante | `sourceManufacturer` | texto **bloqueado** | — | de la OC |
| Partes | Pagar a: | `payableTo` | texto **bloqueado** | — | de la OC |
| Partes | Dirección fiscal del proveedor | `payableAddress` | área de texto **bloqueada** | — | de la OC o del proveedor |
| Partes | Contacto | `payableContact` | texto **bloqueado** con lista de ayuda | **Sí** | de la OC o del proveedor |
| Factura | Código de factura | `invoiceNumber` | texto | **Sí** | se escribe |
| Factura | Referencia OC / área | `poReferenceArea` | texto | No | número de la OC |
| Factura | Fecha de factura | `invoiceDate` | fecha | **Sí** | se escribe |
| Factura | Fecha de vencimiento | `dueDate` | fecha | No | se escribe |
| Factura | Términos de pago | `paymentTerms` | texto | No | de la OC, **editable** |
| Factura | Monto total de factura | `invoiceTotal` | monto **bloqueado** | — | copia del total de la solicitud |
| Desglose | Mercadería | `goods` | monto | No | suma de los ítems de la OC |
| Desglose | Flete | `freight` | monto | No | se escribe |
| Desglose | Embalaje | `packing` | monto | No | se escribe |
| Desglose | Cargos adicionales | `additionalCharges` | monto | No | se escribe |
| Desglose | Sobrecosto | `overage` | monto | No | se escribe |
| Desglose | Aduanas | `customs` | monto | No | se escribe |
| Desglose | Impuesto a las ventas | `salesTax` | monto | No | se escribe |
| Desglose | Conceptos propios | `breakdownExtras` | filas concepto + monto | No | se agregan |
| Pago | Realizar el pago a | `paymentPayableTo` | texto **bloqueado** | — | proveedor de la OC |
| Pago | Monto a pagar | `paymentAmount` | monto **bloqueado** | — | suma de todo el desglose |

## 5. Campo por campo

### N° de OC (`poNumber`)
- Lista con **todas las órdenes de compra del proyecto**, mostradas como «número · proveedor».
- **Es el campo que dispara todo el relleno automático.** Al elegir una OC se completan:
  proveedor/fabricante, pagar a, dirección fiscal, contacto, referencia OC, moneda, detalle de
  la solicitud, mercadería, total de la solicitud, realizar el pago a y términos de pago.
- Se guarda el **número** de la OC, no su identificador. El saldo se calcula emparejando por
  `orderId` si existe y, si no, por el número.

### Fecha de solicitud (`requestDate`)
- Obligatoria, con la **fecha de hoy** puesta al abrir.
- Dónde sale: **REQUEST DATE** en la cabecera del documento y en el pie de página.

### Moneda (`currency`)
- Obligatoria. **Siempre se pone sola con la moneda de la OC elegida** (corrección del
  22-sep-2026: antes se quedaba en soles aunque la OC estuviera en dólares).
- Si aun así se cambia a una moneda distinta a la de la OC, aparece el aviso rojo: «estás
  eligiendo una moneda que no es la misma que la de la OC seleccionada». **No se convierte nada.**
- Dónde sale: «Currency» en la cabecera y columna **CURR** del detalle de factura.

### Detalle de la solicitud (`requestDetail`)
- Obligatorio. Se rellena solo con: «Payment request corresponding to Purchase Order [número],
  awarded to supplier [proveedor].» Se puede reescribir.
- Dónde sale: recuadro **REQUEST DETAIL** del documento.

### Total de la solicitud (`totalRequest`)
- Obligatorio. Se rellena con el **saldo disponible de la OC** (total de la OC menos lo ya
  solicitado en requerimientos anteriores de esa misma OC, en la misma moneda).
- Si se escribe un importe mayor que el saldo, sale un aviso rojo con las cuatro cifras: total
  de la OC, lo ya solicitado, el saldo disponible y **cuánto se pagaría de más**. El aviso
  **advierte pero deja guardar**: la decisión es de quien firma.
- Dónde sale: **TOTAL FOR THIS REQUEST** y primera cifra de PAYMENT REQUEST TOTALS.

### Partes (`sourceManufacturer`, `payableTo`, `payableAddress`, `payableContact`)
- Los cuatro están **bloqueados**: se llenan con los datos de la OC elegida (los que la OC
  guardó al emitirse) y, si la OC no los tiene, con los del proveedor registrado.
- Si algún dato falta, debajo del campo sale en rojo: «La OC elegida no tiene este dato.
  Complétalo en la OC o en el proveedor», y ese campo deja de ser obligatorio para no trabar
  el guardado.
- El contacto tiene una lista de ayuda con el equipo del proyecto, los usuarios activos y los
  contactos de proveedores.
- Dónde salen: bloque **PARTIES** del documento (SOURCE / MANUFACTURER y PAYABLE TO con su
  dirección y contacto).

### Código de factura (`invoiceNumber`) · Fecha de factura (`invoiceDate`) · Vencimiento (`dueDate`)
- El código y la fecha de factura son obligatorios; el vencimiento no.
- Dónde salen: columnas **INVOICE #**, **INV. DATE** y **DUE DATE**.

### Referencia OC / área (`poReferenceArea`)
- Se llena con **solo el número de la OC** (pedido del 18-sep-2026).
- Dónde sale: columna **PO REF #**.

### Términos de pago (`paymentTerms`)
- Se copia de la OC elegida: primero los términos de pago y, si no los tiene, los términos
  comerciales. **Es editable**: de todo el bloque automático, este es el único que se escribe.
- Dónde sale: columna **PAYMENT TERMS**.

### Monto total de factura (`invoiceTotal`)
- **Bloqueado.** Es siempre igual al «Total de la solicitud» y se actualiza al escribirlo.
- Dónde sale: **TOTAL AMOUNT** del detalle de factura.

### Desglose de montos
- Siete conceptos fijos: **Mercadería, Flete, Embalaje, Cargos adicionales, Sobrecosto,
  Aduanas, Impuesto a las ventas**. «Mercadería» viene con la suma de los ítems de la OC
  (cantidad × costo unitario); los demás se escriben.
- Botón **«Agregar concepto al desglose»**: filas con **concepto** (hasta 40 caracteres) y
  **monto**, con ✕ para quitarlas. Se guardan en un solo texto legible en `breakdownExtras`,
  con el formato `Seguro: 100.00 | Instalación: 50.00`.
- **Solo se imprimen los conceptos que tengan monto.**
- Dónde salen: las columnas del detalle de factura y la fila de PAYMENT REQUEST TOTALS.

### Realizar el pago a (`paymentPayableTo`)
- **Bloqueado**: siempre el proveedor de la OC elegida.
- Dónde sale: la frase final del documento, «Please make payments payable to …».

### Monto a pagar (`paymentAmount`)
- **Bloqueado y calculado**: es la **suma de todo el desglose** (los siete conceptos fijos más
  los conceptos propios). No es el total de la solicitud.
- Si el monto a pagar supera el saldo de la OC, aparece el mismo aviso rojo de exceso, en el
  bloque de pago.
- Dónde sale: la cifra grande al final de la frase de pago.

## 6. Qué pasa al guardar

El requerimiento se guarda **dentro del proyecto**, en su lista `invoices`, con:

| Campo automático | Contenido |
| --- | --- |
| `id` | `inv-` + fecha y hora en milisegundos |
| `number` | `PR-CÓDIGO DEL PROYECTO-0001`, correlativo dentro del proyecto |
| `issuedBy` | nombre de quien lo generó |
| `createdAt` | fecha y hora exactas |
| `requestedBy` | siempre «HPG International Latinoamericana SAC» |
| `invoiceCurrency` | copia de la moneda elegida |

Los importes se guardan con los **decimales de la OC de la que salen**: dos casi siempre, tres
solo si esa OC se trabajó con tres (ver «Totales» en el documento de la orden de compra). Así el
requerimiento se ve con los mismos decimales que su OC en la pantalla, en el PDF y en el Excel.

## 6 bis. Dónde se ve el requerimiento en la página

La sección **Requerimiento de pago → Historial** muestra **los 5 más recientes**, con un aviso de cuántos hay en total. El resto se ve con el botón **«Ver todos los requerimientos registrados»**, a la izquierda de «Emisión de nueva solicitud de pago» (25-sep-2026). Ese cuadro:

- **busca** por número de requerimiento, número de OC, código de factura y proveedor;
- **filtra** por pago (todos / con pago registrado / sin pago), por equipo **FF&E u OS&E** —el equipo sale de la OC a la que pertenece el requerimiento— y por **rango de fecha de solicitud**;
- dibuja las mismas tarjetas de la página, de a 40 por vez, así abre rápido con miles de registros;
- si desde ahí se abre un requerimiento o una orden, **el documento queda por delante** y el cuadro pasa detrás hasta que se cierre.

## 7. Registro del pago («Pago realizado»)

Es un formulario aparte, que se abre desde la tarjeta del requerimiento. Su aviso lo dice
claro: **estos datos no salen en el PDF, solo se usan en el reporte de Excel, y deben llenarse
todos a la vez.**

| Campo | Nombre interno | Nota |
| --- | --- | --- |
| Valor pagado | `paidAmount` | obligatorio; lleva la moneda del requerimiento en la etiqueta |
| Día del pago | `paymentDate` | obligatorio, no se rellena solo |
| Número de transferencia | `transferNumber` | obligatorio, hasta 60 caracteres |
| Monto pendiente a cancelar | `pendingAmount` | **bloqueado**: monto a pagar del RP − valor pagado, nunca negativo |
| Comentarios | `paymentComments` | obligatorio, hasta 400 caracteres |
| Campos propios del pago | `paymentExtras` | botón «Agregar campo al pago»; mismo formato `Título: monto`; **no** se restan del pendiente |

Al guardar quedan registrados quién y cuándo (`paymentRegisteredByName`, `paymentRegisteredAt`),
y esa línea se muestra al reabrir el formulario.

## 8. Revisión del requerimiento

Botón de revisión, solo Admin/Trabajador. Se comparan estos campos y **cada cambio pide su
motivo**: detalle de la solicitud, N° de OC, referencia OC, código de factura, proveedor/
fabricante, pagar a, dirección, contacto, términos de pago, fecha de solicitud, vencimiento,
fecha de factura, moneda, total de la solicitud, los siete conceptos del desglose, los
conceptos propios y «realizar el pago a».

**«Monto total de factura» y «Monto a pagar» no se comparan**: los calcula la plataforma, y si
se compararan un solo cambio pediría tres motivos (lo vio Datnya el 20-sep-2026). Se guardan
igual, pero sin motivo propio.

Un importe escrito con otro formato («$ 1,450.00» y «$ 1450.00») no cuenta como cambio. En el
documento impreso, lo cambiado sale en azul.

## 9. El saldo de la OC

Regla, en `oc-saldo.js`: **saldo = total de la OC − suma de los requerimientos de esa OC**, en
el orden en que se crearon, contando los tengan o no pago registrado, y **solo los que estén en
la misma moneda que la OC**. Ese saldo lo usan tres cosas: el relleno automático del total de
la solicitud, los avisos rojos de exceso y el reporte de requerimientos en Excel.

## 10. Dónde se guarda hoy

Cada requerimiento vive **dentro de su proyecto** (`project.invoices`), en el documento único
de la empresa (`vaak-local-v8` en el navegador, `vaak_company_data` en MySQL). Pesa alrededor
de 1,2 KB. Es el único de los tres registros que no tiene lista propia en la raíz de los datos:
al migrar el guardado hay que recordar que **los requerimientos cuelgan del proyecto**, no de
una lista general.

## 11. Lo que no se puede perder al cambiar el guardado

1. Elegir la OC sigue rellenando los nueve datos automáticos de una sola vez.
2. La moneda sigue siendo siempre la de la OC, **sin conversión**, y avisa si se cambia.
3. «Total de la solicitud» sigue naciendo con el saldo disponible de la OC.
4. Los avisos rojos de exceso siguen **advirtiendo sin bloquear**, con las cuatro cifras.
5. Las cuatro «Partes» siguen bloqueadas, con su nota roja cuando la OC no tiene el dato.
6. «Monto total de factura» sigue copiando el total de la solicitud, y «Monto a pagar» sigue
   siendo la suma de todo el desglose. Los dos, bloqueados.
7. Los conceptos propios siguen guardándose como `Título: monto | Título: monto`, y solo se
   imprimen los que tienen monto.
8. La numeración sigue siendo `PR-CÓDIGO-0001` por proyecto.
9. El registro del pago sigue siendo aparte, obligatorio completo, y **no** sale en el PDF.
10. La revisión sigue sin pedir motivo por los dos campos calculados.
11. El saldo de la OC se sigue calculando igual, solo con requerimientos de la misma moneda.

## 12. Pruebas que lo verifican

`bash servidor-php/pruebas/probar.sh` — pasos 5 (requerimiento + pago registrado), 7 (revisión
con motivo), 9 (reporte de requerimientos en Excel) y 10 (lo que ve cada rol).
