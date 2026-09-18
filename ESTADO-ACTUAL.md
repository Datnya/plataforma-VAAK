# VAAK — Estado actual de la plataforma

> **Si eres un modelo de IA que acaba de llegar a este proyecto: lee este documento completo antes de tocar nada.**
> Es la única fuente de verdad sobre el estado de la plataforma. La carpeta `HANDOFF/` es histórica y está desactualizada desde el 2 de septiembre de 2026; no la uses para entender el estado actual.

**Última actualización:** 17 de septiembre de 2026
**Último commit documentado:** `f7a0e1c` (ver `git log`)

---

## 1. Qué es esto

Plataforma de procura (compras) para hotelería. Gestiona proyectos, specs, órdenes de compra (OC), proveedores, facturas y usuarios.

- **Dueña:** Datnya Monzón (`datnyamonzon1@gmail.com`). **Habla español y no es desarrolladora.**
- **Producción:** https://plataforma-vaak.vercel.app
- **Repositorio:** https://github.com/Datnya/plataforma-VAAK — **público**
- **Supabase:** `ovflbrrnqgmooutlukyf.supabase.co`

---

## 2. Rama y despliegue — LO MÁS IMPORTANTE

```
Rama de trabajo:  main
Despliegue:       automático en Vercel con cada push a main
Root Directory:   staging
```

**No existen otras ramas de trabajo.** Todo se commitea y se pushea directamente a `main`, y Vercel despliega solo. Un push tarda entre 1 y 4 minutos en estar en vivo.

`git push` **funciona** desde la máquina de Datnya (las credenciales están en el Administrador de Credenciales de Windows). No uses el editor web de GitHub: un handoff antiguo decía que no había acceso a push, eso ya no es cierto.

### Cómo verificar que un cambio llegó a producción

No confíes en que el push bastó. Compara el archivo en vivo contra el local:

```bash
curl -s https://plataforma-vaak.vercel.app/prototype/app.js | sha256sum
sha256sum staging/public/prototype/app.js
```

Y revisa la salud del sitio: `curl -s https://plataforma-vaak.vercel.app/api/health`

---

## 3. Arquitectura — el punto que más confunde

Hay **dos copias del prototipo** y solo una llega a producción:

| Carpeta | Qué es |
|---|---|
| `staging/public/prototype/` | **LA COPIA VIVA.** Es lo que sirve Vercel. **Edita siempre aquí.** |
| `prototype/` (raíz) | Copia vieja de desarrollo con los tests. **Divergió, está obsoleta, no la toques.** |

La interfaz **no es React**. Es JavaScript "vanilla" en `staging/public/prototype/`. Next.js solo se usa para las rutas API (`/api/...`) y para reescribir `/` y `/login` hacia el prototipo estático (ver `staging/next.config.ts`).

### Archivos clave de `staging/public/prototype/`

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Carga los scripts **en orden** y lleva el `?v=N` de caché |
| `app.js` | La interfaz completa. Enorme y minificado (~300 KB, pocas líneas larguísimas) |
| `access-control.js` | ACL: `ACTION_POLICY`, permisos por rol, `validateState` |
| `access-runtime.js` | Motor: store en localStorage, acciones, tokens de operación |
| `access-test-fixtures.js` | Datos semilla de demostración |
| `staging-bridge.js` | Puente con el backend: login, sesión, usuarios, foto, presencia |
| `shared-sync.js` | Sincroniza los datos de la empresa entre todos los usuarios |
| `a4-preview.js` | Escala las previsualizaciones a A4 real |
| `revision-block.js` | Bloque de revisiones entre asteriscos, compartido por los tres formatos |
| `purchase-order-template.js` | Formato imprimible de la OC |
| `payment-request-template.js` | Formato de la factura |
| `technical-sheet-template.js` | Formato de la ficha técnica del spec |
| `money-utils.js` | Dinero y **catálogo de 19 monedas** |
| `presentation.js` | Traductor automático es/en de nodos de texto |

### ⚠️ Dos trampas que te van a morder

**1. Al editar `index.html` sube el `?v=N`.** Si no, los navegadores sirven la versión vieja y parecerá que tu cambio no funcionó.

**2. En producción, los usuarios NO pasan por el motor local.** `staging-bridge.js` intercepta el formulario de usuarios y lo envía a `/api/admin/users` (Supabase). El handler `new-user` de `access-runtime.js` **no se ejecuta en producción**, solo en la demo local. Si escribes lógica en ese handler, funcionará en tu demo y fallará en producción. Ya pasó una vez con el alta de clientes en la tarjeta de equipo. Lo que dependa de usuarios debe **deducirse** de la lista de usuarios que llega del servidor, no escribirse en el momento de crearlos.

**3. Los tres PDF se generan con `window.print()`** y una clase en el body (`print-order`, `print-invoice`, `print-spec`). La ficha técnica tenía un generador propio que rasterizaba la hoja y fallaba; se eliminó en favor de este camino común. Chrome descarta los fondos de color al imprimir salvo que el CSS los pida con `print-color-adjust: exact`. Sin esa regla los formatos salen casi en blanco. Ya está puesta en los tres `*-reference.css`; si creas un formato nuevo, ponla también.

**4. Nada de reglas responsive en los formatos imprimibles.** Al imprimir, el ancho de viewport es el de la pagina A4: **794px**. Cualquier `@media (max-width: …)` por encima de ese valor se activa dentro del PDF. Las hojas tenian reglas a 820px y 860px que colapsaban el formato a una columna, y por eso el PDF salia desconfigurado. Se eliminaron: las pantallas pequenas las resuelve `a4-preview.js` reduciendo la hoja completa. **Si agregas una media query a un `*-reference.css`, el PDF se rompe.**

**5. `presentation.js` traduce el texto que escribe el usuario.** Convierte "proveedor" en "Supplier" dentro de datos reales. **Todo elemento que muestre texto escrito por el usuario necesita `translate="no"`.** Ya pasó tres veces en términos y condiciones, nombres de proveedor y conceptos de descuento.

---

## 4. Dónde viven los datos

| Dato | Dónde |
|---|---|
| Usuarios, login, roles, foto, presencia | **Supabase** (servidor) |
| Proyectos, OC, proveedores, specs, tareas | **Compartidos** vía `/api/data` (tabla `vaak_company_data`) |
| Permisos de cliente y asignaciones de trabajador | ❌ **Solo en el navegador de cada usuario** (ver pendientes) |

`shared-sync.js` intercepta `localStorage.setItem`, empuja al servidor con control de concurrencia por `revision` y hace *pull* cada 20 s. La clave local es `vaak-local-v8`.

**Consecuencia:** cualquier cosa que hagas en producción la ve todo el equipo al instante. No experimentes ahí.

### Tablas de Supabase

`vaak_profiles`, `vaak_user_company_memberships`, `vaak_company_data`, `vaak_company_data_history` (150 revisiones de respaldo), `vaak_company_assets`, `vaak_auth_rate_limits`, `vaak_audit_events`.

Las 4 migraciones de `staging/supabase/migrations/` **ya están aplicadas**.

### Rutas API (`staging/app/api/`)

`auth/login`, `auth/logout`, `auth/session`, `admin/users`, `admin/users/[id]`, `admin/presence`, `me/photo`, `me/presence`, `data`, `data/assets`, `data/assets/[id]`, `storage/sign`, `tracking/[token]`, `health`. (14 en total)

Todas las que modifican datos exigen mismo origen y token CSRF en el header `x-vaak-csrf`.

---

## 5. Cómo probar sin romper nada

**Nunca pruebes en producción.** Hay un servidor de demostración:

```bash
node tools/demo-server.js
```

Abre http://localhost:4174/prototype/ y entra con `admin.vaak`, `worker.vaak` o `client.vaak` (**cualquier contraseña**).

Sirve los archivos reales de `staging/public/prototype/` y solo desactiva en memoria las piezas que necesitan backend. No modifica ningún archivo del repositorio.

**Limitación conocida:** el formulario de OC recalcula totales con `requestAnimationFrame`, que no se ejecuta si la pestaña está en segundo plano. Si automatizas pruebas, inyecta `window.requestAnimationFrame = cb => setTimeout(cb, 0)`.

### Flujo de trabajo que Datnya exige

1. Haces el cambio en `staging/public/prototype/`
2. Lo pruebas tú en el localhost
3. **Ella lo revisa y lo aprueba**
4. Recién entonces commit + push

No subas nada sin su visto bueno, salvo que te lo pida explícitamente.

---

## 6. Funciones implementadas (todas en producción)

### Proyectos
- Nombre, código, razón social e **Identificación fiscal / Tax ID** (sin límite de caracteres) como campos separados
- Al cambiar el código, las OC ya emitidas conservan el suyo
- Tarjetas: Datos generales · Áreas del proyecto · Equipo del cliente
- La tarjeta de equipo se **deduce automáticamente** de los usuarios con rol Cliente asignados al proyecto. No hay botón de agregar ni de quitar: se gestiona creando o editando el usuario cliente

### Términos y condiciones por proyecto
- Barra con icono de ojo bajo las tres tarjetas
- Admin edita; trabajador y cliente solo leen (aplicado en el motor, no solo escondiendo botones)
- Se copian a la OC al emitirla; las emitidas conservan los suyos
- **No existen términos estándar.** Un proyecto sin términos emite la OC sin esa sección

### Órdenes de compra
- Al abrir una versión guardada, el pie tiene «← Volver a versiones» para regresar al historial sin cerrar todo
- El número de tracking es **aleatorio y comprobado contra los ya emitidos**, tanto al emitir como al actualizar el estado de una orden antigua sin tracking (ese último caso todavía generaba un correlativo). Antes era correlativo y podía repetirse si dos personas emitían a la vez; además la interfaz inventaba uno por posición cuando la orden no lo tenía guardado, lo que producía duplicados visibles
- **Revisiones:** el botón "Realizar revisión" está en la tarjeta de seguimiento de cada OC (dentro del proyecto), junto a Actualizar estado / Ver orden / Descargar. Crea Rev. 1, 2, 3… (la primera revisión es la 1; el documento sin revisar es el «Original») con registro de qué cambió, por qué, quién y cuándo. El PDF lo imprime entre líneas de asteriscos. "Ver versiones" permite abrir cualquier versión anterior
- IGV fijo 18%; IVA y VAT con porcentaje editable según el país
- Descuentos y recargos manuales ilimitados (concepto + suma/resta + monto)
- Las líneas de impuesto y CIF desaparecen si están en cero
- La columna IMAGE aparece solo si algún spec tiene imagen
- Los specs ofrecidos son **solo los del proyecto**, y heredan cantidad, precio y moneda
- En el formulario de spec, «Proveedor / fuente» es un desplegable de los proveedores registrados; «Área» es un desplegable de los 65 rubros
- La ficha técnica compone la cantidad con la unidad (ej. «5 EACH») a partir de los campos «Cantidad» y «Unidad de medida». Existía un tercer campo, «Cantidad pedida», que repetía ambos y mandaba sobre ellos: se eliminó. Para los specs antiguos que solo tienen ese campo, la cantidad y la unidad se extraen de ahí
- **La vinculación de cantidades depende de que el spec tenga lleno el campo «Cantidad».** Si está vacío, la OC no puede prellenar ni poner tope: no hay con qué comparar
- **Todas las filas de la nueva OC jalan los datos del spec** (antes, desde la segunda fila no se llenaba la cantidad porque se armaban con otra plantilla). La moneda de la fila es la del costo del spec, cualquiera que sea (antes solo reconocía $ y S/). La cantidad se precarga con lo **disponible**, y si el mismo spec va en varias filas, entre todas no pueden pasar lo disponible
- **Terms** es un cuadro de texto largo: Enter crea una línea nueva, el cuadro crece hacia abajo y el A4 respeta los saltos de línea
- En la OC no se puede pedir más cantidad de la **disponible** en el spec (cantidad del spec menos lo ya pedido en otras OC no canceladas): avisa en rojo y no deja emitir
- **Specs consumidos:** si las OC ya usan toda la cantidad de un spec, el spec queda **cerrado**: la tarjeta dice «Cerrado · usado por completo en una OC», desaparecen Editar y Realizar revisión, y no se ofrece al generar una OC nueva. El motor (`specAgotado` en `access-runtime.js`) también rechaza editarlo o revisarlo. Al **revisar** una OC, sus propios specs siguen disponibles (se descuenta todo menos esa misma orden), y si la revisión baja la cantidad, el spec se reabre solo. Un spec sin «Cantidad» nunca se cierra
- **Reportes Excel:** la columna CUR muestra la moneda real de la OC o de la solicitud (antes todo lo que no era USD, EUR o COP salía como PEN). La unidad sale del spec cuando el item no la tiene
- **Reporte Excel de OC:** la columna ITEM # muestra el código del spec tal como se ve en pantalla (el guardado o el derivado de su id, misma regla que `specCode()`). Antes mostraba el id interno (`sp-1789657319006`)
- Contacto del proyecto configurable en Configuración del sistema, editable por documento

### Revisiones (los tres documentos)
Órdenes de compra, specs y solicitudes de pago comparten la misma dinámica: botón «Realizar revisión», **un motivo obligatorio por cada cambio** (no uno general), se guarda quién cambió qué y cuándo, sube el número de versión y se conserva una instantánea de la anterior.

**Motivo por cambio:** mientras se edita, el formulario lista en vivo cada cambio detectado con su casilla de motivo. Si falta uno, no guarda y lo marca en rojo. La lista usa el mismo cálculo que el motor (`VAAKRuntime.revisionChanges` y `revisionChangeKey`, exportados desde `access-runtime.js`), así lo que se ve es lo que se guarda. Cada cambio guarda su `reason`; el `reason` general de la entrada queda vacío. Las revisiones antiguas, con un solo motivo general, se siguen mostrando igual. Los montos se comparan por valor (`$ 1,450.00` = `$ 1450.00` no es un cambio). En la OC, el item conserva su descripción mientras no se cambie el spec.

**Status del documento (solo en pantalla, no en el PDF):** las tarjetas de OC, specs y solicitudes muestran la última versión, quién la hizo y cuándo; si no hay revisiones, «Original» con su autor y fecha. Los documentos creados antes del 17-sep no guardaban autor, así que muestran solo «Original». «Ver versiones» muestra el historial. Los tres formatos imprimen el bloque entre líneas de asteriscos (en la OC sobre los items, en la ficha y en la solicitud sobre DESCRIPTION y REQUEST DETAIL).

El motor es genérico: `diffRecord` y `pushRevision` en `access-runtime.js`, con una lista de campos por tipo de documento. Las OC solo se revisan si están aprobadas; los specs y las solicitudes, siempre.

### Catálogo de rubros
**65 rubros:** 40 OS&E + 25 FF&E, agrupados y con código. Se administran en Configuración del sistema y alimentan: campo de spec, formulario de OC, y categorías de proveedor.

### Gestión de usuarios
Los usuarios conectados ahora (punto verde) se muestran primero. El reordenamiento vive en `staging-bridge.js`, dentro de `paintPresence`, porque la presencia solo la conoce el puente. En la demo local no hay presencia, así que ahí no se reordena.

### Requerimiento de pago
La sección financiera del proyecto se llama «Requerimiento de pago», su botón «Emisión de nueva solicitud de pago» y su encabezado «Historial».

**Formulario:** «Pagar a:» (antes «Pagadero a»). «Dirección fiscal del proveedor» se llena sola al elegir la OC con la dirección registrada del proveedor (búsqueda por id o por nombre sin importar mayúsculas ni espacios). Los montos muestran el símbolo de la moneda elegida delante y se formatean como moneda (1,500.00). La moneda de la OC se precarga bien (antes se ponía PEN/USD, que no existen en el desplegable, y quedaba vacía). Si el total de la solicitud, el monto a pagar o la moneda no coinciden con la OC elegida, sale una **alerta en rojo que no bloquea** (hay pagos parciales y adelantos).

**Formato A4:** se quitó la columna PAYABLE TO de la tabla INVOICE ENTRY DETAILS. El recuadro PAYABLE TO de PARTIES y la frase «Please make payments payable to…» se mantienen, por decisión de Datnya.

El formato imprimible ya no recorta el texto: la hoja tiene `min-height` en vez de `height` fija y se quitaron los `max-height`, `overflow:hidden` y `text-overflow:ellipsis` que cortaban el detalle y las celdas. Con textos largos la hoja crece a más de una página.

Las solicitudes de pago se crean y se revisan. **No hay edición libre: todo cambio pasa por una revisión** y queda registrado.

**Registro del pago** (botón «Registrar pago» / «Editar pago» en cada solicitud, admin y trabajador): valor pagado, día del pago, número de transferencia, monto pendiente a cancelar y comentarios. Se llenan **todos juntos o ninguno** (error en rojo si falta uno; el motor también lo valida). Se guarda quién lo registró y cuándo, y se muestra bajo la solicitud. Campos: `paidAmount`, `paymentDate`, `transferNumber`, `pendingAmount`, `paymentComments`, `paymentRegisteredBy/ByName/At`. **No salen en el PDF ni en la previsualización** (a propósito se usan nombres nuevos: `paymentAmount` sí se imprime y no se tocó).

**Tarjetas (specs y solicitudes):** mismo diseño en ambas. Arriba el código/número y el status como etiqueta; en medio los datos (rubro, monto, cantidad / total de la solicitud); una franja verde con el pago registrado; abajo la acción principal a la izquierda (Ficha técnica / Ver) y las de edición a la derecha, todas con icono, texto y 34 px de alto. Plantillas en `specCardBody` e `invoiceCardMarkup`; estilos `.card-v2` y `.card-btn` en `refinements.css`. El botón Duplicar lo agrega `enhanceProjectSpecQuantities` después de pintar.

El reporte Excel se llama **«Reporte de requerimientos de pago»** (hoja «Payment Request Details»). Usa esos datos en PAYMENT EVIDENCE, AMOUNT PAID, TRANSFER DATE y HPG COMMENTS, y agrega al final PENDING BALANCE, PAYMENT REGISTERED BY y REGISTERED ON.

### Montos
- **Tres decimales** (pedido de Datnya: tenerlo siempre en cuenta). `Money.round` redondea a 3; `Money.fixed` guarda con 2 decimales mínimo y el tercero solo si existe (380.00, 12.345); `Money.format` agrega separador de miles para mostrar. Antes redondeaba a **un** decimal (99.99 → 100.00). Los formatos A4, los reportes y el Excel (formato `#,##0.00#`) usan la misma regla
- **Separador de miles en los formularios:** los campos de monto son numéricos y no pueden mostrar comas, así que `enmascararMonto` (en `app.js`) pone encima una capa con el monto formateado mientras el campo no se edita. El valor real no cambia: ningún cálculo ni envío se entera. Se aplica a los campos que reconoce `isMoneyInput` (costos, flete, CIF, impuesto, ajustes, montos de solicitud y de pago). El formulario de solicitud de pago usa campos de texto con símbolo de moneda (otro mecanismo, anterior)
- Los campos de monto ya no usan `step=0.10`, que hacía que el navegador rechazara montos con centavos

### Otros
- 19 monedas (Latinoamérica + dólar + euro). Sol y dólar se guardan con símbolo; el resto con código ISO
- Previsualizaciones en A4 real (794px) escaladas para caber
- **Los cuadros emergentes no se cierran al hacer clic fuera**, solo con Cerrar/Cancelar/X
- Usuarios cliente: sin interruptores de acceso, un solo proyecto, alta automática en la tarjeta de equipo
- **El cliente descarga sus OC:** botón «Descargar» en su historial y «Descargar PDF» dentro de la vista. Antes el botón de la vista existía pero respondía «no autorizado» porque la impresión exigía rol admin o trabajador. Ahora el cliente puede imprimir solo las OC que tiene permiso de ver (se comprueba con la política `preview-order`)
- **Pie de página de la ficha técnica:** quedaba a media hoja porque la regla genérica `.spec-preview footer{margin-top:1.5rem}` le ganaba a `.hpg-ts-footer{margin-top:auto}`. Se reforzó el selector

---

## 7. Pendientes reales

### 🔴 Permisos de cliente y asignaciones de trabajador no se comparten
`shared-sync.js` sincroniza `projects, orders, suppliers, specs, tasks, projectCompanies, supplierProjectLinks`.

Quedan **fuera**: `projectMemberships`, `clientProjectLinks`, `clientOrderAuthorizations`. Peor: `writeDoc()` las reconstruye desde la copia local de cada navegador.

**Síntoma:** agregas un cliente a un proyecto, los demás ven su nombre pero el permiso real no llega. Parece un bug aleatorio de permisos.

**Arreglo:** agregarlas a `COLLECTIONS` con su clave compuesta en `LINK_KEYS` y dejar de reconstruirlas desde lo local.

### 🟡 Proyectos con datos borrados
Un bug corregido el 17-sep (commit `2f33b09b`) borraba razón social, dirección fiscal, dirección de almacén, ciudad y país al guardar la tarjeta "Áreas del proyecto". Ya no ocurre, pero **lo ya borrado sigue borrado**. Se puede recuperar del historial de `vaak_company_data_history`. Falta que Datnya identifique qué proyectos quedaron afectados.

### 🟢 `VAAK_RELEASE_ID` en Vercel
Cosmético. `/api/health` devuelve `releaseId: "local"` porque la variable se perdió al sacar `.env.local` del repositorio. Se arregla agregándola en el panel de Vercel.

---

## 8. Cómo trabaja Datnya

- **Responde siempre en español**, claro y sin tecnicismos.
- Los botones deben mostrar **animación de carga**; los errores deben decir **el motivo, en rojo**.
- Pide **confirmación** antes de acciones sensibles (cambio de rol, cambio de código de proyecto).
- **Si algo no queda claro, pregúntale antes de implementar.** Lo dice explícitamente y lo agradece.
- Quiere ver todo funcionando en el link de Vercel.

### Notas técnicas para no repetir errores ya cometidos

- `app.js` está minificado. Para editarlo, escribe un script de parche con anclas de texto exactas que verifique que hay **exactamente una** coincidencia antes de tocar nada.
- En `String.replace()`, la secuencia `$'` es un comodín. **Usa siempre una función como reemplazo** (`.replace(a, () => b)`), o destrozarás el archivo.
- Valida con `node --check <archivo>` después de cada edición.
- `access-runtime.js` mezcla saltos de línea Windows (`
`) y Unix. Un ancla que cruce un salto de línea puede no coincidir: prefiere anclas dentro de una sola línea.
- El hook de `git-lfs` falla con un error de memoria después de cada commit. Es ruido, el commit se creó bien.

---

## 9. Historial

- **2 sep:** última actualización de `HANDOFF/` (59 documentos, ya obsoletos)
- **15 sep:** usuarios conectados a Supabase Auth
- **16 sep:** foto de perfil, presencia, campos de proyecto, datos compartidos entre usuarios
- **17 sep:** todo lo de la sección 6 (términos, revisiones, impuestos, monedas, A4, rubros, clientes, Tax ID, equipo del cliente automático, colores en los PDF, requerimiento de pago)
- **17 sep (tarde):** registro del pago, reporte de requerimientos de pago, revisiones numeradas desde 1, cierre de specs consumidos, códigos reales en el Excel de OC
- **17 sep (cierre):** tres decimales, separador de miles en formularios, filas de la OC con datos reales del spec y su moneda, terms con texto largo, moneda y unidad en los Excel, tracking aleatorio en todos los casos, rediseño de las tarjetas de specs y solicitudes
- **17 sep (noche):** motivo por cada cambio en las revisiones, status del documento, alerta de monto/moneda en la solicitud, «Pagar a:», montos con formato moneda, dirección fiscal automática, sin columna PAYABLE TO, descarga de OC para el cliente, pie de la ficha técnica

Para el detalle de cualquier cambio, los mensajes de commit son extensos y explican el porqué:

```bash
git log --since=2026-09-15
```
