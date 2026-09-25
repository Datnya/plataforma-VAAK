# VAAK — Estado actual de la plataforma

> **Si eres un modelo de IA que acaba de llegar a este proyecto: lee este documento completo antes de tocar nada.**
> Es la única fuente de verdad sobre el estado de la plataforma. La carpeta `HANDOFF/` es histórica y está desactualizada desde el 2 de septiembre de 2026; no la uses para entender el estado actual.

**Última actualización:** 24 de septiembre de 2026 (en preparación: guardado sin fallos silenciosos y nuevas secciones de specs y OC)
**Último commit documentado:** el más reciente de `main` (ver `git log -1`); este documento se actualiza en el mismo commit que cada cambio

---

## ⭐ REGLAS DE TRABAJO DESDE EL 18-SEP-2026 — léelas antes que nada

La plataforma ya **no vive en Vercel**. Vive en el **hosting del cliente** (Perú Hosting, cPanel de la cuenta `wwwhpgilatam`), en **dos copias separadas**:

| | **PRUEBA (staging)** | **OFICIAL (producción)** |
|---|---|---|
| Link | `https://staging.hpgilatam.com` | `https://plataforma.hpgilatam.com` |
| Carpeta en el hosting | `/staging.hpgilatam.com/public` | `/plataforma.hpgilatam.com` |
| Base de datos MySQL | `wwwhpgilatam_vaakprueba` (usuario `wwwhpgilatam_vaak`) | `wwwhpgilatam_vaakoficial` (usuario `wwwhpgilatam_vaakoficial`) |
| Quién la usa | Datnya (y Claude) para probar | El cliente y su equipo, con datos **reales** |
| Datos | De prueba; se pueden borrar | **Reales. Nunca se borran ni se tocan a mano** |

### 1. Cómo se entrega un cambio (desde el 22-sep-2026: directo al OFICIAL)
Hasta el 21-sep cada cambio pasaba primero por PRUEBA (`staging.hpgilatam.com`). Desde el 22-sep **Datnya decidió publicar directo en el OFICIAL**, porque la plataforma ya está en uso y PRUEBA quedó atrasada. La red de seguridad es la batería local: **nada se entrega sin `bash servidor-php/pruebas/probar.sh` en verde** (10 pasos, sección 5).

Orden de trabajo, sin excepciones:
1. Datnya pide el cambio. Si algo no está claro, se le pregunta **antes** de programar.
2. Se hace **en el repositorio**: `staging/public/prototype/` para la interfaz, `servidor-php/publico/` para el servidor.
3. Se prueba en la copia local (`probar.sh`) y, si el cambio se ve en pantalla, además con una prueba puntual en el navegador. Nunca se dice «está listo» sin haberlo comprobado.
4. Se arma el paquete: `node servidor-php/herramientas/armar-publicacion.js "Claude outputs/actualizaciones/actualizacion-N/sitio"` y se comprime **sin `nucleo/config.php`** en `actualizacion-N.zip` (N es el número siguiente al último publicado; ver la tabla de actualizaciones).
5. Se actualiza **este documento** y se hace commit + push a `main` (GitHub: `Datnya/plataforma-VAAK`).
6. Se le entregan a Datnya los pasos del cPanel: Administrador de archivos → carpeta `/plataforma.hpgilatam.com` → **Cargar** el ZIP → clic derecho → **Extraer** (reemplazando) → **Eliminar** el ZIP → abrir la plataforma con **Ctrl + Shift + R**. Ella los ejecuta; Claude no entra al cPanel.
7. Después de publicar se comprueba desde internet lo que se pueda (por ejemplo `curl https://plataforma.hpgilatam.com/api/health`).

**Prohibido:** editar archivos a mano en el cPanel (el código vive en GitHub y lo editado a mano se pierde en la siguiente publicación); incluir `nucleo/config.php` en un ZIP; publicar algo que no pasó la batería de pruebas.

### 1 bis. GitHub: el molde de la plataforma, nunca datos del cliente
El 18-sep (noche) Datnya pidió pausar los commits mientras mandaba cambios; el **19-sep pidió retomarlos**: todo lo del 18 y 19 de septiembre ya está subido. Reglas:
- Al repositorio va **solo el funcionamiento** de la plataforma (código, `servidor-php/sql/esquema.sql`, este documento). Es el molde que Datnya va a **revender a otros clientes del rubro** cambiando logo, colores y nombre.
- **Nunca** van datos de HPG ni contraseñas: la carpeta `Claude outputs/` (paquetes con `config.php`) y `tmp/` están en `.gitignore` desde el 19-sep.
- **El repositorio es público** (`Datnya/plataforma-VAAK`). Se le recomendó pasarlo a privado antes de vender la plataforma (GitHub → Settings → Danger Zone → Change visibility).

### 2. Cómo se publica (hoy, a mano)
- Claude arma un ZIP **solo con los archivos que cambiaron**, con rutas `/` (ejemplo: `Claude outputs/instalacion-prueba/actualizacion-1.zip`, hecho con `ZipArchive` de PHP; los ZIP de PowerShell usan `\` y Linux los extrae mal).
- Datnya lo sube con **Administrador de archivos → Cargar** a la carpeta correcta (tabla de arriba) y hace **clic derecho → Extraer**, aceptando reemplazar.
- **Un ZIP de actualización nunca incluye `nucleo/config.php`**: cada copia tiene el suyo, con su propia base de datos, contraseña y secreto. Si se pisa, esa copia deja de funcionar.
- Si cambian `index.html` o `app.js` de `staging/public/prototype/`, se pasan por `servidor-php/herramientas/armar-publicacion.js` (quita Supabase y cambia la ruta base) y del resultado se toman los archivos cambiados.
- Comprobar desde internet: `curl https://<link>/verificar.php` (debe decir «Todo listo») y `curl https://<link>/api/health`.
- **Pendiente (etapa 6):** publicación automática GitHub → FTP (a PRUEBA con cada push a `main`; al OFICIAL con una acción manual tras el visto bueno). Datnya crea la cuenta FTP y guarda las claves ella misma en GitHub.

**Actualizaciones publicadas** (cada una vive en `Claude outputs/actualizaciones/actualizacion-N/`, que no va al repositorio; anotar aquí cada publicación):

| # | Qué trae | SQL a importar antes | PRUEBA | OFICIAL |
|---|---|---|---|---|
| 1 | Servidor con mysqli (sin pdo_mysql ni mbstring) | — | ✅ 18-sep | ✅ (venía en el ZIP de instalación) |
| 2 | Todo guardado en el hosting: borradores de OC y avisos descartados compartidos; registro de accesos de clientes en el servidor con botón «Vaciar registro»; permisos de proyectos iguales para todos (ver sección 7) | `actualizacion-2-registro-accesos.sql` (crea `vaak_client_access_log`) | ✅ 18-sep (comprobado desde internet: archivos iguales al repositorio, «Todo listo») | ⏳ (Datnya espera terminar los puntos pendientes) |
| 3 | OC: dirección del proveedor automática y almacenes del hotel (Ship To). Requerimientos de pago: número de OC en grande, saldo de la OC en cada tarjeta, aviso al pasarse del total (también al revisar) y columnas PO BALANCE / PO ALERT en el Excel (ver sección 6, «Saldo de la OC y direcciones») | — | ⏳ ZIP listo (aún sin subir): `actualizacion-3/actualizacion-3.zip`, 19 archivos: `index.html`, `app.js`, `access-runtime.js`, `purchase-order-template.js`, `purchase-order-reference.css`, `payment-request-template.js`, `payment-request-reference.css`, `technical-sheet-template.js`, `revision-block.js`, `reports.js`, `oc-saldo.js`, `oc-direcciones.js`, `oc-formulario.js`, `oc-borradores.js`, `oc-impresion.js`, `proyecto-areas.js`, `spec-formulario.js`, `rp-formulario.js`, `assets/reports/invoice-styles.xml`. **Incluye las tandas 2, 3, 4 y 5** (ver sección 6). Se arma comparando el sitio armado con lo publicado en PRUEBA (solo van los archivos distintos) | ⏳ |
| 6 | Auditoría de seguridad, fases 1 a 3 (ver «Dónde quedamos exactamente (21-sep)»). **Paquete completo** (59 archivos, todo el código va comprimido): `actualizacion-6/actualizacion-6.zip`. Tras extraerlo, **borrar `verificar.php`** de la carpeta. Luego, en la oficial, un administrador entra y usa el aviso «Revisar y quitar» para eliminar los datos de demostración | — | ⏳ (no prioritario) | ✅ 21-sep |
| 7 | Pantallas internas solo con sesión (`/api/app`), versiones por huella, mensaje único de acceso fallido, margen del pie de «Áreas del proyecto». Paquete completo: `actualizacion-7/actualizacion-7.zip` (32 archivos) | — | ⏳ | ✅ 22-sep |
| 8 | Estilos internos y de las fichas solo con sesión (`/api/estilos`), diseño para celular y tablet, los datos de demostración ya no pueden volver a guardarse, portal del cliente completo (proyecto, banner, OC aprobadas, RP, reportes Excel de solo lectura) | — | ⏳ | ✅ 22-sep (comprobado: la oficial sirve acceso.css y /api/estilos pide sesión) |
| 9 | Sin mayúscula automática en ningún campo, «Warehouse address» en el alta de proyecto, ficha del proyecto con todos los campos (contacto y teléfono incluidos) y «Specified by» libre en la OC | — | ⏳ | ✅ 23-sep |
| 10 | Monedas: la del spec manda en la OC y en el RP, sin conversiones; se permite mezclar monedas con aviso en rojo. Áreas del proyecto: solo el nombre del área (sin repetir) y quitar | — | ⏳ | ✅ 23-sep |
| 11 | Áreas del proyecto: agregar un área escribiéndola, marcar varias y quitarlas juntas. Código del spec vacío al crear | — | ⏳ | ✅ 23-sep |
| 13 | *(en preparación, sin ZIP todavía)* Guardado con aviso visible, envío comprimido y tope de 8 MB; secciones de specs y OC con los 5 últimos y registro completo en un cuadro con buscador y filtros | — | ⏳ | ⏳ |
| 12 | Campo de rubro del spec buscable, sin división por equipos, con «+» por proyecto y ✕ que elimina del catálogo; áreas con equipo OS&E/FF&E y campo «Área» agrupado; impresión con 2 decimales; sin la sección de rubros en Configuración del sistema. Paquete completo: `actualizacion-12/actualizacion-12.zip` | — | ⏳ | ⏳ |

Para publicar una actualización con SQL: 1) phpMyAdmin → base de ESA copia → Importar el `.sql` (una sola vez); 2) subir y extraer el ZIP en la carpeta de ESA copia; 3) `verificar.php` debe decir «Todo listo». Los paquetes de instalación completos de `Claude outputs/instalacion-*/` son del 18-sep: para una instalación nueva, regenerarlos con `armar-publicacion.js` y el `esquema.sql` actual.

### 3. Dónde se guardan los datos de la plataforma OFICIAL — MUY IMPORTANTE
- **Todo lo que el cliente carga en la plataforma oficial se guarda únicamente en SU hosting**, en la base de datos MySQL **`wwwhpgilatam_vaakoficial`**: proyectos, OC, specs, requerimientos de pago, proveedores, objetivos, usuarios (contraseñas cifradas con bcrypt, nunca en texto), fotos de perfil y todas las imágenes subidas (portadas, imágenes de specs). Nada va a Supabase, a Vercel ni a ningún servicio externo.
- Los **PDF y Excel** (OC, fichas técnicas, requerimientos de pago, reportes) **no se guardan como archivos**: se generan en el navegador en el momento, a partir de esos datos, y siempre se pueden volver a descargar.
- **El repositorio de GitHub (`Datnya/plataforma-VAAK`, público) guarda solo el código, nunca datos del cliente.** Nunca subir ahí `config.php`, contraseñas, exportaciones de la base ni capturas con datos reales.
- Actualizar la plataforma (subir archivos nuevos) **no toca la base de datos**: los datos del cliente se conservan.
- **Desde la actualización 2 no queda información solo en la computadora de nadie** (pedido expreso de Datnya: «NADA debe quedar guardado solo en la computadora de un usuario»). Los borradores de OC, los rubros personalizados (de OC y de specs), el contacto de la empresa y los avisos descartados (una lista por usuario) viajan en el documento compartido (`EXTRAS` de `shared-sync.js`, combinados elemento por elemento para no perder lo que dos personas guardan a la vez). El registro de accesos de clientes lo escribe **el servidor** en la tabla `vaak_client_access_log` cada vez que un cliente inicia sesión (antes lo escribía el navegador del cliente, que no puede guardar datos, así que nunca llegaba). Lo único que queda en cada navegador es: el idioma elegido, un caché de consultas de RUC a SUNAT, los datos de la sesión abierta y la copia de trabajo del documento compartido (`vaak-local-v8`, que se sincroniza). Si se agrega algo nuevo que use `localStorage`, **debe** ir a `EXTRAS` o al servidor.
- **Pendiente:** copias de seguridad de `wwwhpgilatam_vaakoficial` (cPanel → Copia de seguridad, o phpMyAdmin → Exportar), con la frecuencia que acuerde Datnya.

### 4. Vercel ya no es el entorno de prueba
`git push` a `main` **sigue desplegando en Vercel** (`plataforma-vaak.vercel.app`, Next.js + Supabase), pero **eso ya no publica nada en el hosting del cliente** y no se usa para probar. Se retira en la etapa 6. No mostrárselo al cliente.

### 5. Cuidados en el cPanel del cliente
- **Nunca** pulsar «Aplicar» en «Seleccionar versión de PHP»: cambia la versión de toda la cuenta, y la web del cliente (`hpgilatam.com`) usa PHP 7.3. Nuestras carpetas piden PHP 8.2 con una línea del `.htaccess`.
- No tocar `hpgilatam.com` (`/public_html`) ni `website.hpgilatam.com`. `hpginternational.com` está en otro servidor y no depende de este cPanel.
- Datnya no es técnica: guiarla **un paso a la vez**, con los nombres exactos de los botones (su cPanel mezcla español e inglés), y esperar su captura o su «listo». Las contraseñas **nunca** pasan por el chat: ella las pega en `config.php` con el editor del Administrador de archivos.

---

## 0. EN QUÉ ESTAMOS AHORA — léelo primero

> **Resumen para una IA que llega hoy (23-sep-2026).** La plataforma **ya vive en el hosting del cliente** y está en uso real. El traslado desde Vercel/Supabase terminó el 19-sep. Lo que sigue son mejoras, y cada una se entrega como un ZIP numerado que Datnya sube por el cPanel.

**Primeros pasos si eres una IA que recién llega:**
1. Lee este documento completo (sobre todo las «Reglas de trabajo» de arriba y la sección 5, «Cómo probar sin romper nada»).
2. Habla con Datnya **siempre en español**, sin tecnicismos, y guíala **un paso a la vez** con los nombres exactos de los botones del cPanel. Ella no es técnica.
3. Programa solo en `staging/public/prototype/` (interfaz) y `servidor-php/publico/` (servidor). La carpeta `prototype/` de la raíz y todo lo de `staging/app`, `staging/components` son restos de la versión vieja en Next.js: **no se usan**.
4. Prueba con `bash servidor-php/pruebas/probar.sh` antes de decir que algo está listo.
5. Entrega el cambio como un ZIP numerado (regla 1) y dale a Datnya los pasos del cPanel; ella lo sube a la plataforma oficial.
6. **Nunca** subas al repositorio datos del cliente, contraseñas ni `nucleo/config.php`; la carpeta `Claude outputs/` está fuera del repositorio por eso.
7. Antes de tocar el formulario de **spec**, de **orden de compra** o de **requerimiento de pago**, lee su documento en [`docs/campos/`](docs/campos/README.md): está cada campo explicado (qué hace, de dónde sale, qué calcula y dónde se imprime). Si cambias un campo, actualiza ese documento en el mismo commit.

**Qué es:** plataforma web de gestión de compras (proyectos, specs, órdenes de compra, requerimientos de pago, proveedores, reportes Excel y PDF) para **HPG INTERNATIONAL LATINOAMERICANA S.A.C.**. La desarrolla Datnya Monzón; el molde es suyo y se puede revender a otros clientes.

**Dónde vive cada cosa:**

| | Detalle |
|---|---|
| Plataforma OFICIAL | `https://plataforma.hpgilatam.com` → carpeta `/plataforma.hpgilatam.com` (sin `/public`), base MySQL `wwwhpgilatam_vaakoficial`. **Datos reales, en uso.** |
| Plataforma de PRUEBA | `https://staging.hpgilatam.com` → `/staging.hpgilatam.com/public`, base `wwwhpgilatam_vaakprueba`. **Desactualizada desde el 22-sep** (Datnya decidió publicar directo en la oficial; ponerla al día cuando se pueda). |
| Código de la interfaz | `staging/public/prototype/` (JS y CSS sueltos, sin framework). **Es la única copia viva.** La carpeta `prototype/` de la raíz es la copia vieja: solo histórico. |
| Código del servidor | `servidor-php/publico/` (PHP 8.2 + mysqli): `api.php` reparte las rutas y `nucleo/` tiene `arranque.php`, `sesion.php`, `rutas.php`, `bd.php` y el `config.php` de cada copia (nunca va al repositorio). |
| Armado del paquete | `node servidor-php/herramientas/armar-publicacion.js <destino>` deja la carpeta lista para el hosting. |
| Pruebas | `bash servidor-php/pruebas/probar.sh` (10 pasos, sección 5). |
| Documentos para el cliente | `Claude outputs/` (no va al repositorio): informe de seguridad firmado y los ZIP de cada actualización. |

**Cómo funciona por dentro:** toda la información de la empresa es **un solo documento JSON** por empresa en la tabla `vaak_company_data` (con historial de 150 versiones en `vaak_company_data_history`). El navegador guarda una copia de trabajo en `localStorage` (`vaak-local-v8`) y `shared-sync.js` la sincroniza cada 20 segundos (`GET/PUT /api/data`, control por número de revisión). Los usuarios, contraseñas (bcrypt), sesiones y el registro de accesos de clientes viven en tablas propias del servidor.

**Quién ve qué (lo aplica el servidor, no la pantalla):**
- **Administrador:** todo.
- **Trabajador:** solo sus proyectos asignados y lo que cuelga de ellos; del resto del equipo solo nombre, cargo y foto. Al guardar, el servidor combina su envío con lo guardado y acepta únicamente lo que su rol permite.
- **Cliente:** solo sus proyectos, sus **OC aprobadas** y los requerimientos de pago de esas OC. Solo lectura. Su portal siempre en **inglés**.
- **Sin sesión:** solo la pantalla de inicio; el código de las pantallas internas lo entrega `GET /api/app` (y sus estilos `GET /api/estilos`) únicamente con sesión válida.

**Pendientes reales:** copia de seguridad diaria (la programa el área de TI de HPG; `servidor-php/herramientas/respaldo-diario.php` está listo), poner al día la plataforma de PRUEBA y, más adelante, publicación automática por FTP.

### Historia del traslado (terminado; se conserva como referencia)

| # | Etapa | Quién | Estado |
|---|---|---|---|
| 1 | Preparar el hosting: subdominio **oficial** y subdominio de **prueba**, una base de datos MySQL para cada uno | Datnya, guiada | 🟡 **Subdominio de prueba confirmado (18-sep): `staging.hpgilatam.com`**, carpeta `/staging.hpgilatam.com/public`, responde por HTTPS y está vacía (solo `cgi-bin`). El dominio principal del cliente es `hpgilatam.com` (su web, en `/public_html` — **no tocar**); también existe `website.hpgilatam.com` (no es nuestro). **Base de datos de prueba creada (18-sep):** `wwwhpgilatam_vaakprueba`, usuario `wwwhpgilatam_vaak` con todos los privilegios (la contraseña la guarda Datnya; nunca va al chat ni al repositorio). Prefijo de la cuenta cPanel: `wwwhpgilatam_`. El cPanel está en español/inglés mezclado (el asistente se llama «Database Wizard»). **PHP:** la cuenta entera está en **PHP 7.3** (selector de CloudLinux, «Seleccionar versión de PHP»), y eso lo usa también la web del cliente: **no cambiarlo**. Nuestra carpeta pide PHP 8.2 sola con una línea en `servidor-php/publico/.htaccess` (`AddHandler application/x-httpd-alt-php82___lsphp .php`); **confirmado: la carpeta corre PHP 8.2.28** (LiteSpeed, `lsphp`). Pero la carpeta **solo carga las extensiones por defecto** (mysqli, mysqlnd, openssl, json…), **no las que se marquen en «Seleccionar versión de PHP» para 8.2** (se probó: marcar mbstring/pdo_mysql ahí no tiene efecto). Por eso el servidor **no usa PDO ni mbstring**: `nucleo/bd.php` da una capa mínima tipo PDO sobre **mysqli**, y `arranque.php` trae reemplazos de `mb_strtolower`/`mb_strlen` si falta mbstring. Probado en local con un PHP igual al del hosting (solo mysqli + openssl): las 45 pruebas bien y usuarios con acentos y mayúsculas. ⚠️ **En «Seleccionar versión de PHP» nunca pulsar «Aplicar»**: cambia la versión de toda la cuenta (la web del cliente, hpgilatam.com, usa PHP 7.3.33). Nota: la web que Datnya ve como «del cliente» también puede ser **hpginternational.com**, que está en **otro servidor** (IIS, 77.72.82.81) y nada del cPanel la afecta. Falta: definir el oficial (gratis si es subdominio de hpgilatam.com, p. ej. `plataforma.hpgilatam.com`; un dominio nuevo hay que comprarlo) |
| 2 | Construir el servidor PHP 8.2 + MySQL 8.0 con **las mismas rutas y respuestas** que `staging/app/api/*`, y probarlo completo en local | Claude | 🟢 Construido y probado en local (ver «Servidor PHP» abajo). Falta solo subirlo (etapa 3) |
| 3 | Subirlo al subdominio de prueba con una copia de los datos; Datnya lo revisa | Claude + Datnya | 🟡 **En curso** — ver «Dónde quedamos exactamente» justo debajo |
| 4 | ~~Trasladar los datos de Supabase~~ | — | ⛔ **No hace falta (decidido 18-sep):** Datnya confirmó que **todo lo que hay en Vercel/Supabase es de prueba** (proyectos, proveedores, usuarios). El cliente llenará sus datos reales en la plataforma oficial. No se copia nada |
| 5 | Publicar en el dominio oficial en un momento de baja actividad (≈1 hora sin usar la plataforma para la copia final) | Claude + Datnya | ⏳ |
| 6 | Publicación automática desde GitHub por FTP (prueba y oficial), retirar Vercel, actualizar este documento | Claude + Datnya | ⏳ |

### 📍 Dónde quedamos exactamente (24-sep) — en preparación: actualización 13 (SIN publicar todavía)
Las actualizaciones 1 a 12 están en la OFICIAL. Lo de hoy **está en el repositorio y probado, pero Datnya pidió no armar aún el ZIP** porque enviará más cambios.

**1. Guardado: ya no falla en silencio (lo más importante).** Se comprobó con datos reales: el documento de la empresa tenía un tope de 4 MB y, al pasarse, `PUT /api/data` respondía 413 y **el navegador no avisaba**: el spec quedaba en pantalla pero nunca llegaba al servidor. Medidas del ensayo (`servidor-php/pruebas/.local/limite.js`): un spec pesa ~520 bytes y una OC ~3,7 KB; 5.000 specs = 2,8 MB, 8.000 = 4,5 MB, 12.000 = 6,6 MB. Cambios:
- Tope de `VAAK_MAX_ESTADO` a **8 MB** y guardia por memoria: procesar el documento gasta ~10 veces su tamaño y con 11 MB PHP moría con «Allowed memory size exhausted» (respuesta rota). Ahora, si no alcanza la memoria, responde **413 claro** (`vaak_memoria_disponible()` en `arranque.php`).
- **Envío comprimido**: el navegador manda el documento en gzip+base64 con la cabecera `x-vaak-gzip: 1` (11 MB → 0,33 MB). El servidor lo descomprime si tiene `gzdecode`; si no, responde 415 y el navegador reenvía sin comprimir. `GET /api/health` informa `gzip`, `maxState` y `memoryLimit` (**verificar en la oficial tras publicar**).
- **Aviso visible en rojo** cuando el guardado no llega, con botón «Reintentar ahora» (`shared-sync.js`), explicando que lo último quedó solo en ese navegador.
- `.htaccess`: `php_value memory_limit 256M` (si el hosting lo ignora, no rompe nada).
- La limpieza de datos de demostración solo se ejecuta si el texto menciona un id de demo, para no clonar el documento entero en cada guardado.

**2. Cuántos registros aguanta (respuesta a Datnya).** Con el diseño actual —toda la empresa en un solo documento JSON— entran cómodamente **unos 5.000 specs por empresa**, pero **no** 5.000 OC (5.000 × 3,7 KB ≈ 18 MB). Para llegar a 5.000 + 5.000 **por proyecto** hay que guardar specs y órdenes en **sus propias tablas** y pedirlos por páginas: es el próximo proyecto grande, no un ajuste.

**3. Secciones del proyecto (specs y órdenes):** la página muestra solo los **5 más recientes** de cada una, con el botón «Ver todos los specs registrados» / «Ver registro completo» que abre un cuadro con el registro entero (`listados.js`, nuevo). El cuadro dibuja las mismas tarjetas de la página (`VAAKAppBridge.specCardsHtml` / `orderCardsHtml`, con `filaDelRegistro()` extraída en `app.js`) **de a 40 por vez**, así abre rápido con miles de registros. Filtros del cuadro de specs: buscador por **nombre, código y proveedor** (sin tildes), equipo **FF&E / OS&E** y rubro —la lista de rubros sale del catálogo vivo más los del proyecto y **se reduce al equipo elegido**—. Cuadro de OC: buscador por **N° de orden o proveedor**, estado (todas/aprobada/anulada/pendiente), **rango de fechas de emisión** y equipo. Probado con 600 specs y 60 OC: el cuadro abre en 1,4 s y los filtros responden. Antes, el buscador de la página no encontraba por proveedor y el filtro de rubros usaba una lista fija de 19 nombres en español que no tenía relación con el catálogo.
- Prueba permanente nueva: `servidor-php/pruebas/paso7-listados.js` (paso 11 de `probar.sh`).

**4. Diccionario de los tres formularios (`docs/campos/`, nuevo).** Pedido de Datnya: dejar por escrito, antes de cambiar el guardado, **qué hace exactamente cada campo** para que ningún modelo de IA tenga que recordarlo de memoria. Tres documentos, leídos directamente del código:
- [`docs/campos/CAMPOS-SPEC.md`](docs/campos/CAMPOS-SPEC.md) — 18 campos del formulario de spec, qué imprime la ficha técnica, el tope de compra por cantidad y el cambio de spec.
- [`docs/campos/CAMPOS-ORDEN-DE-COMPRA.md`](docs/campos/CAMPOS-ORDEN-DE-COMPRA.md) — 27 campos, los dos pasos (formulario → vista previa → generar), numeración por proyecto y equipo, totales, seguimiento y cambio de orden.
- [`docs/campos/CAMPOS-REQUERIMIENTO-DE-PAGO.md`](docs/campos/CAMPOS-REQUERIMIENTO-DE-PAGO.md) — relleno automático desde la OC, campos bloqueados, desglose, saldo y registro del pago.

Cada uno termina con «Lo que no se puede perder al cambiar el guardado» y con el paso de `probar.sh` que lo verifica. **Regla nueva: si se cambia un campo de estos formularios, se actualiza su documento en el mismo commit.**

**5 bis. Decimales de la orden de compra (pedido de Datnya, 24-sep).** El total de la OC salía con **tres decimales** aunque todo el formulario se hubiera llenado con dos: el impuesto se calculaba siempre a tres (IGV de 1.234,56 → 222.221) y arrastraba el tercer decimal al total (1,456.781). Ahora **los decimales los manda el formulario**: si los importes escritos (costos unitarios, valor CIF, descuentos/recargos) tienen dos decimales, el impuesto y el total salen con dos; si alguien escribe tres en cualquiera de esos campos, esa OC pasa a tres. Los decimales quedan guardados, así que la OC se ve igual en el formulario, el PDF, la tarjeta, el requerimiento de pago y el Excel. Cambios: `money-utils.js` suma `decimalsOf`, `roundTo`, `fixedTo` y `formatTo`; `app.js` calcula `decimalesDeLaOC(form)` y lo usa en `recalcPoTotals()` y `syncReferencePurchaseOrderTotal()` (esta última también la usa el cambio de orden); los documentos impresos de OC y requerimiento imprimen 2 o 3 decimales según el valor, ya no 2 fijos. Prueba permanente: el paso 6 de `probar.sh` carga 1.234,56 con IGV y comprueba `S/ 1,456.78` e impuesto `222.22`.

**5. Corrección encontrada al documentar:** «Especificado por» se escribe libre desde el 22-sep, pero al **generar** la OC el motor lo reemplazaba por el nombre de quien la emitía (`new-order` en `access-runtime.js`); solo se respetaba en el cambio de orden. Ahora se guarda lo escrito y, si se deja vacío, se usa el nombre de quien emite.

### 📍 Dónde quedamos exactamente (23-sep, noche) — actualización 12: rubros, áreas con equipo y decimales
Las actualizaciones 1 a 11 ya están en la OFICIAL. Lo nuevo es la **actualización 12** (`Claude outputs/actualizaciones/actualizacion-12/actualizacion-12.zip`, paquete completo, `probar.sh` en verde):
- **Campo «Rubro del spec» (nuevo módulo `spec-rubros.js`):** se escribe para buscar, la lista ya **no está dividida** en OS&E / FF&E, cada rubro trae un **✕** que lo elimina (pregunta antes) y el **«+»** agrega un rubro que queda guardado **en ese proyecto** (`project.rubrosPropios`), así aparece en todos sus specs, nuevos o editados. El `<select name="category">` original sigue existiendo oculto, así que el guardado, las revisiones y la ficha técnica no cambian. Antes el «+» guardaba en `vaak-custom-rubros`, una lista que ese desplegable no leía: por eso el rubro nuevo solo se veía en ese spec. Eliminar un rubro del catálogo se guarda en `vaak-removed-oc-rubros` (nueva clave sincronizada, también en la lista de extras que el servidor acepta de un trabajador) y `getOcRubros()` la respeta; antes solo se borraba de la memoria y volvía al recargar. La lista va con `translate="no"`: el traductor automático renombraba los rubros escritos a mano.
- **Áreas con equipo:** al agregar un área en «Ver áreas» se elige **OS&E o FF&E**; las 31 del catálogo lo heredan de sus rubros (se comprobó que ninguna mezcla equipos). En el cuadro el equipo aparece como etiqueta junto al nombre, y el campo **«Área» del formulario de spec** muestra solo las áreas del proyecto **agrupadas por equipo**. Las áreas escritas a mano se guardan como `{name, team}` (se siguen leyendo las viejas, que eran texto).
- **Impresión con 2 decimales:** la OC y el requerimiento de pago impresos (y sus previsualizaciones) muestran todos los montos con 2 decimales; los cálculos internos siguen con 3.
- **Configuración del sistema:** se quitó la sección «Rubros de órdenes de compra»; los rubros se administran desde el propio campo del spec.

### Dónde quedamos el 23-sep (tarde) — actualización 11: áreas que se agregan y código de spec vacío
La actualización 10 ya está en la OFICIAL. Lo nuevo es la **actualización 11** (`Claude outputs/actualizaciones/actualizacion-11/actualizacion-11.zip`, paquete completo, `probar.sh` en verde):
- **Cuadro «Áreas del proyecto» (`proyecto-areas.js`, reescrito):** el administrador puede **agregar un área escribiendo su nombre** (botón «Agregar área» en el pie, que abre un campo de texto; avisa si ya existe). Esa área vive **solo en ese proyecto**, en `project.areasPropias`, y no toca el catálogo de rubros de OC. Las áreas del catálogo siguen viniendo como hasta ahora (`project.areaCodes`). Además hay **casillas para marcar varias** y quitarlas de una vez («Marcar todas», «Quitar marcas», «Quitar marcadas (N)»), además del ✕ de cada fila; todo pide confirmación. Ya no existe la pantalla de «Seleccionar áreas». El campo «Área» del formulario de spec ofrece exactamente esas áreas, incluidas las escritas a mano.
- **Código del spec:** el formulario de spec nuevo abre con el campo **vacío** (antes proponía «SPEC-100»); el texto de ayuda sigue mostrando el formato «SPEC-001». Al editar, se mantiene el código guardado.

### Dónde quedamos el 23-sep (mañana) — actualización 10: monedas y áreas
Publicadas en la OFICIAL: actualizaciones 1 a 9. Lo nuevo es la **actualización 10** (`Claude outputs/actualizaciones/actualizacion-10/actualizacion-10.zip`, paquete completo, `probar.sh` en verde):
- **Monedas (el error que reportó Datnya):** un spec guardado como «USD 1250.00» no coincidía con el «$» de los selectores, así que la OC se quedaba en soles; y al corregir la moneda a mano, el importe se **convertía** con un tipo de cambio fijo de 3.75 y el costo del spec cambiaba. Arreglado en tres puntos: (1) `money-utils.js` → `currencyFrom()` devuelve siempre la forma canónica (símbolo para sol, dólar y euro; código ISO para el resto), así que specs, OC, RP, saldos y reportes hablan el mismo idioma; (2) `app.js` → se eliminó la conversión automática y la constante `USD_TO_PEN`: cambiar la moneda de un ítem ya no toca el importe; (3) `rp-formulario.js` → el requerimiento de pago toma la moneda de su OC (antes siempre soles).
- **Mezcla de monedas permitida con aviso:** antes una OC solo admitía una moneda (el selector de las demás filas quedaba bloqueado y no dejaba emitir). Ahora cada ítem conserva la moneda de su spec; si alguna difiere de la del primer ítem aparece un texto rojo bajo esa fila y **la OC se puede emitir igual**. El total se muestra en la moneda del primer ítem y **no se convierte nada** (decisión de Datnya). Se quitaron los dos rechazos de `access-runtime.js` y `avisarMonedaMixta()` reemplaza a `aplicarMonedaUnica()` en `app.js`; `syncReferencePurchaseOrderTotal` también usa la moneda del primer ítem.
- **Cuadro «Áreas del proyecto»:** en «Ver áreas» y en «Seleccionar áreas» quedan solo el **nombre del área** y el botón de quitar; se fueron rubro, código y tipo. Cada área aparece **una sola vez** aunque varios rubros la compartan (31 áreas en vez de 75 filas repetidas), y quitar un área quita todos sus rubros (`proyecto-areas.js`).

### Dónde quedamos el 22-sep (tarde) — actualización 8: estilos protegidos, celular y demo que no vuelve
La actualización 7 está en la **OFICIAL** (comprobado desde internet: `/api/app` 401 sin sesión, los .js viejos 403). Actualización 8 (`Claude outputs/actualizaciones/actualizacion-8/actualizacion-8.zip`, paquete completo, `probar.sh` en verde):
- **Estilos también protegidos:** en público solo queda `acceso.css` (la pantalla de inicio, ~12 KB, sacado de styles.css y refinements.css con las clases de `pantalla-acceso.html` mediante `csso` `usage`). Los de las pantallas internas y de las fichas (OC, requerimiento de pago, ficha técnica) van en `nucleo/estilos.css` y los entrega `GET /api/estilos` solo con sesión; sus rutas `assets/` pasan a `/assets/`. `acceso.js` carga primero los estilos y luego el código. El `.htaccess` bloquea todo .js y .css salvo `acceso.js`/`acceso.css`.
- **Celular y tablet:** bloque al final de `refinements.css` («Celular y tablet (22-sep-2026)»). Antes, en celular el menú (Dashboard/Tools/Team) y «Sign out» quedaban fuera de la pantalla y las ventanas se salían por la derecha. Ahora: encabezado en dos filas (logo + foto/Sign out; menú a lo ancho), ventanas al ancho de la pantalla, títulos con su botón apilados, specs en columna, métricas de usuarios en 2 columnas compactas, tabla de usuarios deslizable. Revisado con capturas a 375 px y 768 px.
- **Portal del cliente (22-sep):** (1) el cliente queda vinculado a su proyecto con solo asignárselo al crearlo (antes `selectProjectsForActor`/`canReadClientOrder` de `access-control.js` exigían además una empresa cliente en la ficha del proyecto, y el cliente veía «My project» vacío, sin banner, OC, RP ni tracking). (2) Ve **solo OC aprobadas** (no borradores, pendientes ni anuladas) y **solo los RP de esas OC**, siempre en su última versión (columna VERSION: Original / Rev. N); el servidor también le envía solo eso (`vaak_estado_para_miembro`). (3) Banner con carrusel (portada + galería, hasta 5). (4) «Invoice history» pasa a «Payment request history». (5) Sección **Project reports** debajo de los historiales (`portal-cliente.js`): descarga los Excel de OC y de RP con `VAAKReports.*(…, {cliente:true})` — hojas y libro **bloqueados** con SHA-512 (huella de una contraseña al azar que no se guardó; comprobado en Excel: abre, no deja editar), aviso legal de HPG dentro del Excel y en pantalla; antes de armarlo trae lo último del servidor. La interfaz del cliente siempre en inglés. Probado en `probar.sh` paso 10.
- **Formularios (22-sep, tarde; van en la actualización 9, la 8 ya está publicada):** (1) ningún campo pasa solo a «Primera Letra En Mayúscula» (se quitó el manejador `data-auto-titlecase` y sus 9 atributos en `app.js`: nombre y cargo de usuario, dirección/contactos de proveedor, dirección fiscal del proyecto); los `data-auto-upper` (código de proyecto, razón social, nombre de proveedor) siguen igual. (2) El alta de proyecto incluye **Warehouse address** y la ficha del proyecto («Editar datos generales») tiene ya los mismos campos que el alta —nombre, código, razón social, RUC, dirección fiscal, almacén, ciudad, país, contacto y teléfono— salvo la portada, que se cambia desde el banner (`app.js` + `access-runtime.js`). (3) En la OC y en el cambio de orden, **«Specified by» es texto libre** (solo «Prepared by» queda con el nombre de quien la llena) (`oc-formulario.js`).
- **La demostración no vuelve:** un navegador con copia vieja reenviaba las tareas de ejemplo (`t-own`, `t-foreign`) después de quitarlas (la combinación de `shared-sync.js` conserva lo que el navegador cambió aunque el servidor lo haya borrado). Ahora `PUT /api/data` descarta siempre los ids de demostración (`vaak_sin_demo`) y devuelve la versión limpia (`corrected`). **En la oficial pueden haber vuelto esas 2 tareas**: con la actualización 8 desaparecen solas al próximo guardado, o con el aviso «Review and remove».

### Dónde quedamos (22-sep, mañana) — actualización 7: pantallas internas solo con sesión
La actualización 6 está en la **OFICIAL** (21-sep; los datos de demo ya se quitaron; PRUEBA sigue atrasada, no es prioridad). El **Informe de Seguridad** para TI de HPG está en `Claude outputs/informe-seguridad/` (PDF firmado por Datnya; **no modificarlo** salvo pedido expreso). Actualización 7 (`Claude outputs/actualizaciones/actualizacion-7/actualizacion-7.zip`, paquete completo, probado con `probar.sh`):
- **Como en la banca en línea:** sin sesión el navegador solo recibe la pantalla de inicio (dibujada en `index.html` desde `servidor-php/herramientas/pantalla-acceso.html`, **siempre en inglés** por decisión de Datnya) y `servidor-php/publico/acceso.js`. Todo el código de las pantallas internas lo junta `armar-publicacion.js` en `nucleo/interfaz.js` (carpeta que no se sirve) y lo entrega `GET /api/app` solo con sesión, sin caché. Copiar la página ya no reproduce el interior. Al cerrar sesión (o si vence) la página se recarga y vuelve a ser solo el inicio. El `.htaccess` bloquea todo `.js` suelto excepto `acceso.js` (así los archivos de versiones anteriores que quedan en el hosting no se descargan). En la carpeta de desarrollo (`staging/public/prototype`) todo sigue igual: la separación la hace solo el armado.
- **Caché:** cada `?v=` es ahora la huella del contenido (antes se reutilizaban números y un navegador podía seguir con archivos viejos).
- **Inicio de sesión:** usuario inexistente y contraseña errada responden igual (`invalid_credentials`, «Incorrect username or password.»), para no revelar qué usuarios existen; «usuario desactivado» solo se dice con la contraseña correcta.
- **Tarjeta «Áreas del proyecto»:** el pie («N áreas registradas» y «Ver áreas») tiene el mismo margen lateral que las filas (`proyecto-areas.js`).

### Dónde quedamos el 21-sep — auditoría y arreglos de seguridad
Datnya pidió una **auditoría completa de la plataforma oficial** (un experto le mostró que con «Inspeccionar» del navegador se veían el código y los usuarios). Se encontraron 12 problemas y se resolvieron en 3 fases, **todas probadas en local con `servidor-php/pruebas/probar.sh`** (ver sección 5). **Aún no están publicados** en PRUEBA ni en OFICIAL: el siguiente paso es armar la actualización 6, que Datnya suba a PRUEBA, la revise y luego a OFICIAL. Después se rehace el **diagnóstico profesional para el cliente** (Datnya quiere entregarlo con todas las fases terminadas).

| # | Problema de la auditoría | Arreglo | Dónde |
|---|---|---|---|
| 1 | El primer ingreso de un administrador **publicaba los datos de demostración** (Hotel Costa Azul, Logistics Center, PO-2026-001, proveedores y specs de ejemplo) en la base oficial | El paquete publicado lleva una semilla **vacía** (`servidor-php/publico/access-test-fixtures.js`, con un único administrador de relleno «sistema» que la validación exige y que desaparece al llegar el directorio real); `armar-publicacion.js` **se niega a armar** si la semilla trae nombres de demo | Fase 1 |
| 2 | Los datos de demo que **ya están** en la oficial | Aviso para administradores «La plataforma todavía tiene datos de demostración» → ventana con la lista exacta (avisa si hay registros reales dentro de un proyecto demo) → «Quitar datos de demostración». Lo hace el servidor (`POST /api/admin/demo-cleanup`), reconociendo los ids fijos de la demo (`p1`, `p2`, `o1`, `o2`, `s-own`, `s-foreign`, `s-mixed`, `sp-*`, `t-own`, `t-foreign`); guarda antes la versión anterior en `vaak_company_data_history` | Fase 3 (`limpiar-demo.js`, `rutas.php`) |
| 3 | Al cerrar sesión **quedaban en el navegador** todos los datos de la empresa (proyectos, precios, directorio) | `shared-sync.js` borra `vaak-local-v8`, su META y los EXTRAS al quedar sin sesión | Fase 1 |
| 4 | El código se leía tal cual con «Inspeccionar» (comentarios, nombres internos) | `armar-publicacion.js` **comprime** todo el JS (terser) y CSS (csso) del paquete y saca el script que estaba dentro de `index.html` a `inicio.js`. Nota honesta: el código de una web **siempre** llega al navegador; comprimirlo lo hace ilegible, pero la seguridad real está en el servidor (puntos 5-7) | Fase 1 (`herramientas/package.json`: `npm install` en `servidor-php/herramientas` antes de armar) |
| 5 | El trabajador recibía el **directorio completo** (correos, usuarios, teléfonos y permisos de todos) | Recibe solo administradores y compañeros de sus proyectos, **sin** correo, usuario, teléfono ni permisos (`vaak_directorio_para_trabajador` en `sesion.php`) | Fase 2 |
| 6 | El trabajador recibía **todos los proyectos**, órdenes y precios aunque tuviera uno asignado | `GET /api/data` le entrega solo sus proyectos con sus órdenes, specs y vínculos, sus tareas, los borradores de sus proyectos y sus avisos descartados; los proveedores sí todos (catálogo de la empresa, igual que en la app) (`vaak_estado_para_trabajador`) | Fase 2 |
| 7 | Un trabajador podía **reemplazar o borrar todo** desde la consola del navegador (PUT /api/data con el documento que quisiera) | El servidor combina lo enviado con lo guardado y **solo acepta lo que su rol permite** (mismas reglas que `access-control.js`): no crea ni borra proyectos; no toca proyectos ajenos; en los suyos no cambia la ficha (`VAAK_CAMPOS_PROYECTO_ADMIN`: nombre, código, RUC, dirección, contacto, portada, galería, equipo, términos); órdenes y specs libres dentro de sus proyectos; proveedores: crea, y edita/borra solo los vinculados únicamente a sus proyectos; tareas: solo actualiza las suyas; la empresa de cada proyecto y el contacto de la empresa los define el administrador. Si algo se rechazó, responde `corrected: true` con su vista corregida y `shared-sync.js` la adopta (así no reenvía el cambio rechazado en bucle) (`vaak_combinar_trabajador`) | Fase 2 |
| 8 | El registro de accesos de clientes mostraba a un trabajador los de **todos** los proyectos | Solo los de sus proyectos | Fase 2 |
| 9 | `verificar.php` quedaba publicado (dice qué PHP y extensiones tiene el servidor) | `armar-publicacion.js` ya no lo incluye (solo con `--instalacion`). **En la oficial y en prueba hay que borrarlo a mano** al subir la actualización 6 | Fase 1 |
| 10 | Faltaban cabeceras de seguridad, compresión y caché | `.htaccess`: CSP estricta (`script-src 'self'`), HSTS, Permissions-Policy, COOP; gzip; caché (html sin caché, js/css 1 día, imágenes 7 días) | Fase 1 |
| 11 | La sesión duraba 30 días | 12 horas, renovadas cada 15 min de uso (`VAAK_SESSION_HOURS` en `arranque.php`) | Fase 1 |
| 12 | Las pruebas automáticas apuntaban a la copia vieja `prototype/` (y estaban desactualizadas) | Nueva batería en `servidor-php/pruebas/` contra la copia viva (sección 5). Las de `prototype/*.test.js` quedan como históricas: **no** reflejan el comportamiento actual (p. ej. los montos ya no se redondean) | Fase 3 |

Arreglos que salieron durante la auditoría: un administrador no podía crear proveedores si no existía el proyecto demo `p1` (la regla `new-supplier` de `access-control.js` exigía un proyecto seleccionado; ahora no), y `campos-multilinea.js` convertía en varias líneas el nombre de proyectos y proveedores (ahora nombre, medida, material y color solo en el formulario de spec).

**Sigue pendiente (decisión de Datnya: después):** copias de seguridad diarias (`respaldo-diario.php` listo, sin instalar; lo ve el equipo de TI del cliente).

### Dónde quedamos el 20-sep (tarde)
- **PRUEBA y OFICIAL tienen la actualización 4** (subida por Datnya el 20-sep). Lo nuevo es la **actualización 5**, probada en la demo local y empaquetada en `Claude outputs/actualizaciones/actualizacion-5/actualizacion-5.zip` (11 archivos, sin cambios en la base de datos). Ver sección 6, «Actualización 5».
- La oficial es `https://plataforma.hpgilatam.com` (raíz `/plataforma.hpgilatam.com`, **sin** `/public`); la de prueba es `/staging.hpgilatam.com/public`.
- **Pendiente principal: copias de seguridad diarias.** El equipo de TI del cliente debe confirmar qué copia hace el hosting; mientras tanto está listo y probado `servidor-php/herramientas/respaldo-diario.php` (sin instalar).
- Pendientes menores: los campos propios del «Pago realizado» (`paymentExtras`) no se restan del pendiente (falta confirmación de Datnya); el PDF de la OC ya no numera las hojas («Page 1 of 3») porque esa numeración obligaba a dejar margen de página y ahí Chrome imprimía su encabezado.

### Dónde quedamos el 20-sep (mañana)
- **PRUEBA y OFICIAL tenían la actualización 3 completa** (subida el 19-sep). Lo del **20-sep** es la **actualización 4**, probada en la demo local y empaquetada en `Claude outputs/actualizaciones/actualizacion-4/` (ver sección 6, «Actualización 4»).
- La plataforma OFICIAL se ve en internet con candado: `https://plataforma.hpgilatam.com` (DNS en Microsoft 365 + Let's Encrypt hasta el 18-dic-2026). La raíz del oficial es `/plataforma.hpgilatam.com` (**sin** `/public`; la de prueba sí lleva `/public`).
- **Pendiente principal: copias de seguridad diarias.** JetBackup 5 aparece en el cPanel pero su pantalla se queda cargando; Datnya decidió que el equipo de TI del cliente confirme qué copia hace el hosting. Mientras tanto está listo y probado `servidor-php/herramientas/respaldo-diario.php` (sin instalar: falta crear `/home/USUARIO/vaak-respaldos`, subir el archivo y programar el cron).
- Pendiente menor: los campos propios del «Pago realizado» (`paymentExtras`) no se restan del monto pendiente; falta que Datnya confirme si deben restarse.
- El repositorio sigue **público** a pedido de Datnya (trabaja con la IA desde ahí).

### Dónde quedamos el 19-sep
- **PRUEBA y OFICIAL están las dos al día** con la actualización 3 (tandas 2 a 5) y el HTTPS obligatorio. Comprobado archivo por archivo desde internet.
- **La plataforma OFICIAL ya se ve en internet y con candado**: `https://plataforma.hpgilatam.com` (DNS en Microsoft 365 + certificado Let's Encrypt hasta el 18-dic-2026).
- **Primer administrador oficial:** `datnya.monzon` / `datnyamonzon1@gmail.com`. La contraseña la cambia ella al entrar; las contraseñas nunca se guardan en texto (bcrypt), ni siquiera en los archivos de instalación.
- **GitHub al día** otra vez (ver regla 1 bis).
- **Copias de seguridad:** JetBackup 5 existe en el cPanel pero se quedó cargando (pantalla azul). Como alternativa propia está `servidor-php/herramientas/respaldo-diario.php`: lo ejecuta un cron una vez al día, lee la contraseña del `config.php` de esa copia, guarda `base-AAAA-MM-DD.sql.gz` en una carpeta privada fuera de la web y borra las de más de 14 días. **Probado de verdad** el 19-sep contra la base local: copió 11 tablas y, al restaurarla en una base vacía, volvieron las 11 tablas, los 3 perfiles y las 3 membresías con tildes correctas. Falta instalarlo en el hosting (carpeta `/home/USUARIO/vaak-respaldos` + cPanel → Trabajos de cron).
- **Pendiente principal: copias de seguridad diarias** de `wwwhpgilatam_vaakoficial`. Datnya no necesita descargarlas ella; hay que comprobar si el hosting ya las hace solo (cPanel → **JetBackup** → «Database Backups»). Si no las hace, se prepara una copia automática diaria dentro del hosting (carpeta privada, últimos 14 días).
- Pendiente menor: los campos propios del «Pago realizado» (`paymentExtras`) hoy NO se restan del monto pendiente; falta que Datnya confirme si deben restarse.

### Dónde quedamos el 18-sep (noche)
Datnya **no sabe usar cPanel**: se la guía **un paso a la vez**, con los nombres exactos de botones (su cPanel mezcla español e inglés), pidiendo captura o un «listo» antes del siguiente paso. Claude comprueba cada paso **desde internet** con `curl https://staging.hpgilatam.com/verificar.php` (con `?detalle=1` da versión de PHP, php.ini y extensiones), sin pedirle nada más.

Pasos del subdominio de prueba:
1. ✅ Base de datos `wwwhpgilatam_vaakprueba` + usuario `wwwhpgilatam_vaak` (Database Wizard).
2. ✅ `vaak-plataforma.zip` subido y extraído en `/staging.hpgilatam.com/public` (reemplazó un `.htaccess` de cPanel que solo definía el registro de errores; revisado, no hacía falta).
3. ✅ PHP 8.2 solo para la carpeta (línea `AddHandler` del `.htaccess`); la cuenta sigue en 7.3.
4. ✅ `actualizacion-1.zip` (servidor con mysqli) subido y extraído.
5. ✅ Datnya pegó la contraseña en `nucleo/config.php` con el editor del Administrador de archivos. `verificar.php`: conexión correcta (MySQL 8.0.43).
6. ✅ En phpMyAdmin se importaron `1-tablas.sql` (12 consultas; un aviso #1681 por `TINYINT(1)` es inofensivo) y `2-primer-administrador.sql` (3 filas). `verificar.php` dice «Todo listo» (10 tablas, 1 administrador). Claude probó desde internet: el inicio de sesión de `admin.prueba`, la sesión y `/api/data` responden bien (revisión 0, sin datos todavía).
7. ⏳ **Siguiente:** Datnya entra a `https://staging.hpgilatam.com` con `admin.prueba` y la contraseña temporal (se le dio en el chat) y la cambia desde Herramientas → Gestión de usuarios → Editar. Revisar juntos que la plataforma funcione (proyecto, OC, imágenes, usuarios).
8. ⛔ ~~Etapa 4~~: no se copian datos (todo en Vercel es de prueba). Se deja el texto siguiente solo como referencia histórica: **etapa 4** (copiar los datos reales de Supabase). Hay que preparar la consulta que Datnya ejecuta en el panel de Supabase (perfiles con hashes bcrypt de `auth.users`, membresías, `vaak_company_data`, imágenes) y un importador. Al importar, se vacían las tablas de prueba (el usuario `admin.prueba` desaparece y quedan los usuarios reales con sus contraseñas).
9. ⏳ **El cliente pide ya la plataforma oficial** para hacer sus pruebas ahí. Plan: el subdominio de prueba `staging.hpgilatam.com` se queda **para siempre** como entorno de prueba (primero se prueba ahí cada cambio, luego se pasa al oficial). Para el oficial: crear subdominio + base de datos propia, subir el mismo paquete, importar tablas y un primer administrador **real del cliente** (se crea con los datos que dé Datnya y contraseña temporal). Luego, **etapa 6**: publicación automática GitHub → FTP (Datnya crea la cuenta FTP y guarda las claves ella misma en GitHub). Los cambios de código nunca tocan la base de datos; `config.php` no va en los paquetes de actualización. Pendiente de Datnya: elegir el dominio oficial (`plataforma.hpgilatam.com` gratis, o un dominio nuevo que hay que comprar).

### 📍 Plataforma OFICIAL — en instalación (18-sep, noche)
- **Dominio oficial decidido: `plataforma.hpgilatam.com`** (subdominio gratis del dominio del cliente).
- Paquete listo en `Claude outputs/instalacion-oficial/` (no va al repositorio): `vaak-plataforma-oficial.zip` (con `nucleo/config.php` para la base `wwwhpgilatam_vaakoficial`, usuario **`wwwhpgilatam_vaakoficial`** (se creó con ese nombre, no `vkof`; Datnya lo corrigió a mano en `config.php` del hosting), origen `https://plataforma.hpgilatam.com`, secreto propio distinto del de prueba), `1-tablas.sql` y `2-primer-administrador.sql`.
- Primer administrador **real**: Datnya Monzón, usuario `datnya.monzon` (también entra con su correo `datnyamonzon1@gmail.com`); contraseña temporal dada en el chat, debe cambiarla. Ella creará las cuentas reales del cliente; luego los administradores del cliente podrán borrar la suya (la plataforma impide borrar al último administrador activo, así que primero debe existir otro).
- Pasos (mismos que en prueba) — ✅ 1 a 5 hechos (tablas y primer administrador importados; `verificar.php` dice «Todo listo») (subdominio creado en `/plataforma.hpgilatam.com`, base creada, ZIP extraído, contraseña y usuario en `config.php`: conexión correcta), ⏳ falta que el subdominio se vea en internet (DNS) y tenga candado (AutoSSL; si no aparece solo: cPanel → «SSL/TLS Status» → «Run AutoSSL»), luego Datnya entra y cambia su contraseña. El DNS público del subdominio aún no propagaba (se comprueba forzando la IP 144.217.195.178 con `curl --resolve`): 1) Dominios → Crear un dominio `plataforma.hpgilatam.com` · 2) Database Wizard: base `vaakoficial`, usuario `vkof`, todos los privilegios · 3) subir y extraer el ZIP en la carpeta del subdominio · 4) pegar la contraseña en `nucleo/config.php` · 5) phpMyAdmin: importar `1-tablas.sql` y `2-primer-administrador.sql` en `wwwhpgilatam_vaakoficial` · 6) comprobar `https://plataforma.hpgilatam.com/verificar.php` y el candado HTTPS (AutoSSL) · 7) entrar y cambiar la contraseña.
- **✅ 19-sep: actualizaciones 2 y 3 publicadas en la OFICIAL.** Se importó `actualizacion-2-registro-accesos.sql` en `wwwhpgilatam_vaakoficial` (11 tablas) y se extrajo `Claude outputs/actualizaciones/oficial-actualizacion-2-y-3/oficial-actualizacion-2-y-3.zip` (sitio completo, 57 archivos, sin `config.php`). ⚠️ **La raíz del oficial es `/plataforma.hpgilatam.com` (SIN `/public`)**; la de prueba sí es `/staging.hpgilatam.com/public`. Comprobado: los 45 archivos públicos iguales al armado, «Todo listo», http→https. PRUEBA también tiene la actualización 3 (subida por Datnya el 19-sep).
- **✅ 19-sep: la plataforma OFICIAL ya está en internet.** Datnya agregó en Microsoft 365 el registro **A `plataforma` → 144.217.195.178** y emitió en cPanel (SSL/TLS Certificates → Issue a certificate, solo `plataforma.hpgilatam.com`, sin el comodín) un certificado **Let's Encrypt válido hasta el 18-dic-2026** (se renueva solo con AutoSSL). Comprobado: DNS en Google, Cloudflare y Microsoft; `https://plataforma.hpgilatam.com/api/health` responde `vaak-oficial` con certificado válido.
- **Por qué el oficial no aparece en internet (averiguado el 18-sep, noche):** el DNS de `hpgilatam.com` **no está en el cPanel**, está en **Microsoft 365** del cliente (servidores `ns1…ns4.bdm.microsoftonline.com`, los del correo). Crear el subdominio en el cPanel prepara la carpeta, pero el nombre no existe en internet hasta agregar el registro en Microsoft 365. `staging.hpgilatam.com` sí tiene su registro allí (lo agregó alguien con acceso) y apunta a `144.217.195.178`; `plataforma.hpgilatam.com` no tiene ninguno (Google DNS responde «no existe»). **Solución:** quien administre el Microsoft 365 del cliente entra a admin.microsoft.com → Configuración → Dominios → hpgilatam.com → Registros DNS → Agregar registro: tipo **A**, nombre de host **plataforma**, dirección **144.217.195.178**, TTL 1 hora. Después, en cPanel → «SSL/TLS Status» → «Run AutoSSL» para el candado. Comprobar con `nslookup plataforma.hpgilatam.com 8.8.8.8`.
- Después: etapa 6 (publicación automática GitHub → FTP a prueba y oficial) y retirar Vercel.

**Mientras tanto la plataforma sigue funcionando en Vercel** y se puede seguir mejorando ahí. Todo cambio que se haga en `staging/public/prototype/` durante el traslado debe seguir funcionando con el servidor PHP (las rutas `/api/*` no cambian).

**Decisiones ya tomadas (no volver a discutirlas):**
- El cliente **no cambia su plan** (Perú Hosting, «Plan Avanzado», compartido con cPanel). Nada de VPS.
- Los datos van **dentro del hosting del cliente**: MySQL del propio cPanel. Nada de Supabase ni servicios externos.
- El servidor PHP responde **igual** que el actual para que la interfaz casi no cambie.
- El entorno de prueba final será un **subdominio de prueba en el mismo hosting** con su propia base de datos; Vercel se retira al terminar.
- Los usuarios conservan su contraseña (hashes bcrypt de Supabase → `password_verify` de PHP).
- Recuperar contraseña: el administrador la cambia desde «Editar usuario». Un «Olvidé mi contraseña» por correo queda como mejora opcional.

**Cómo se sube (decidido 18-sep):** Datnya no sabe usar cPanel, así que se le guía paso a paso. Claude prepara un ZIP; Datnya lo sube con el «Administrador de archivos» y lo extrae. **La contraseña de la base de datos no pasa por el chat:** Datnya la escribe ella misma en `nucleo/config.php` desde el Administrador de archivos. Las tablas se crean importando `esquema.sql` en phpMyAdmin. La cuenta FTP recién hace falta en la etapa 6 (publicación automática).

**Autorizaciones de Datnya:** aprobó el plan completo y autorizó todo lo necesario para que salga bien, incluida la descarga de PHP y MySQL para las pruebas locales.

### 🧩 Cómo replicar la plataforma para OTRO cliente (lo que se vende)
Todo lo necesario está en el repositorio; no hace falta nada de HPG:
1. Hosting del nuevo cliente: subdominio propio + base de datos MySQL propia (cPanel → Database Wizard) y su usuario con todos los privilegios.
2. Armar el sitio: `node servidor-php/herramientas/armar-publicacion.js <carpeta> [config.php]`. Sin `config.php` se copia todo menos ese archivo; se escribe a mano en el hosting (base, usuario, contraseña, `entorno`, `origen` y un `secreto` propio y distinto por copia).
3. Subir el ZIP a la carpeta del subdominio y extraerlo (ojo: la raíz del documento a veces es `/dominio` y a veces `/dominio/public`; se ve en cPanel → Dominios).
4. En phpMyAdmin importar `servidor-php/sql/esquema.sql` (11 tablas) y crear el primer administrador (ver `servidor-php/herramientas/crear-admin.php` o copiar el patrón de `2-primer-administrador.sql`: empresa, perfil con hash bcrypt y membresía admin).
5. Abrir `/verificar.php`: debe decir «Todo listo». Luego DNS del subdominio y AutoSSL para el candado.
6. Personalización del cliente: logo e imagen de portada en `assets/`, nombre de la empresa en la tabla `vaak_companies` y los colores en `styles.css` / `refinements.css`.

### Servidor PHP (etapa 2) — cómo está hecho y cómo probarlo
Todo está en `servidor-php/`:
- `publico/` — lo que va al hosting junto con la interfaz: `api.php` (recibe todas las rutas `/api/*`), `.htaccess` (direcciones, cabeceras de seguridad, redirige `/prototype/*` a la raíz) y `nucleo/` (código del servidor, **nunca se sirve**): `arranque.php` (base de datos, respuestas, CSRF), `sesion.php` (sesiones, roles, usuarios), `rutas.php` (una función por ruta, comentada con la ruta de Next.js que reproduce). `nucleo/config.ejemplo.php` muestra la configuración; el `config.php` real (claves de la base de datos) **no se sube al repositorio** (está en `.gitignore`).
- `sql/esquema.sql` — las tablas MySQL (mismos nombres `vaak_*` que en Supabase; sesiones y bloqueo de intentos en tablas propias; imágenes dentro de la base).
- `herramientas/armar-publicacion.js` — arma la carpeta lista para subir: copia `staging/public/prototype/` + `servidor-php/publico/`, quita Supabase y `password-recovery.js` de `index.html`, cambia `<base href="/prototype/">` por `/`. Uso: `node servidor-php/herramientas/armar-publicacion.js <destino> [config.php]`. Si `index.html` cambia y ya no puede limpiarlo, se detiene con un aviso.
- `herramientas/crear-admin.php` — crea empresa y primer administrador en una base vacía (en el traslado real no hace falta: los usuarios vienen de Supabase).
- `herramientas/enrutador-local.php` — imita el `.htaccess` para probar con `php -S`.

**Diferencias con la versión Vercel (a propósito):** la sesión es una cookie propia (`vaak-sesion`, 30 días) en vez de Supabase Auth; las imágenes se guardan en MySQL; no hay «Olvidé mi contraseña» por correo. Las respuestas JSON son idénticas, así que la interfaz no se tocó. **Rutas que solo existen en PHP** (actualización 2): `GET /api/admin/access-log` (administradores y trabajadores) y `DELETE /api/admin/access-log` (vaciar; solo administradores, con CSRF). Vercel no las tiene: ahí el registro sale vacío.

**Probado en local el 18-sep (PHP 8.2.33 + MySQL 8.0.46):** 45 pruebas automáticas de rutas, todas bien (inicio de sesión y sus errores, CSRF y origen, bloqueo tras muchos intentos, crear/editar/deshabilitar/borrar usuarios, protección del último administrador, guardado con revisiones y conflicto 409, el cliente solo recibe su proyecto, imágenes, foto de perfil, presencia, `{}` y acentos intactos). Además, la plataforma real en el navegador: administrador crea proyecto con portada y un cliente desde el formulario, recarga y todo sigue; el cliente ve solo su proyecto; el trabajador entra y ve los proyectos.

**Herramientas locales (solo en la computadora de Datnya, fuera del repositorio):** `C:/Users/HP/vaak-herramientas/` — `php/php.exe`, `mysql/bin/mysqld.exe` (datos en `mysql-datos`, puerto 3307, usuario root sin clave, base `vaak_prueba`), `config-local/config.php` y `sitio-local/` (la carpeta armada). Para probar: arrancar `mysqld.exe --datadir=... --port=3307`, armar con `armar-publicacion.js` y servir con `php -S 127.0.0.1:8090 -t C:/Users/HP/vaak-herramientas/sitio-local servidor-php/herramientas/enrutador-local.php`.

### Paquete de instalación del subdominio de prueba (etapa 3)
En `Claude outputs/instalacion-prueba/` (no se sube al repositorio): `vaak-plataforma.zip` (sitio armado, rutas con `/` para que Linux lo descomprima bien, incluye `nucleo/config.php` con la base `wwwhpgilatam_vaakprueba` y la contraseña por pegar: `PEGA-AQUI-LA-CONTRASEÑA`), `1-tablas.sql` (se importa en phpMyAdmin) y `2-primer-administrador.sql` (usuario temporal `admin.prueba`; su contraseña temporal se le dio a Datnya en el chat y debe cambiarla al entrar). `actualizacion-1.zip` lleva solo los 4 archivos que cambiaron al pasar a mysqli (se sube y se extrae encima). `verificar.php` (en la raíz del sitio; con `?detalle=1` muestra versión, php.ini y extensiones cargadas) muestra en español qué falta: versión de PHP, extensiones, contraseña, conexión, tablas y administrador. Probado en local de punta a punta.

### Otros entregables recientes
- **Guía práctica de uso** (50 páginas) en `Claude outputs/Guia-practica-VAAK.pdf` y **versión Word editable** `Claude outputs/Guia-practica-VAAK.docx` (Datnya ajustará textos ella misma). Las fuentes para regenerarla están en `Claude outputs/guia-fuente/`: capturas automáticas de la demo con datos ficticios (`capturas.js` + `datos.js`), maquetación (`construir.js` + `guia.css`) y Word (`extraer.js` + `construir-word.js`). **La carpeta `Claude outputs/` no se sube al repositorio** (el repositorio es público).
- La guía **no menciona el enlace de Vercel**; cuando exista el dominio oficial, Datnya lo agregará.

## 1. Qué es esto

Plataforma de procura (compras) para hotelería. Gestiona proyectos, specs, órdenes de compra (OC), proveedores, facturas y usuarios.

- **Dueña:** Datnya Monzón (`datnyamonzon1@gmail.com`). **Habla español y no es desarrolladora.**
- **Entorno de PRUEBA (no oficial):** https://plataforma-vaak.vercel.app — ver el aviso de abajo
- **Repositorio:** https://github.com/Datnya/plataforma-VAAK — **público**
- **Supabase:** `ovflbrrnqgmooutlukyf.supabase.co`

---

### ⚠️ El enlace de Vercel NO es el oficial

`plataforma-vaak.vercel.app` y el proyecto de Supabase actual son un **entorno de prueba**. Lo acordado con el cliente desde el inicio:

1. La plataforma se termina y se prueba aquí, en Vercel.
2. Cuando todas las secciones funcionen bien, Datnya **traslada la plataforma y sus datos al hosting propio del cliente**.
3. Se publica en un **dominio adicional** que Datnya creará en ese mismo hosting (el cliente ya tiene un dominio para su página web; la plataforma tendrá uno aparte).
4. La base de datos y el almacenamiento de la plataforma deben quedar **dentro del hosting del cliente**.

Consecuencias para quien trabaje aquí:
- No pongas el enlace de Vercel en documentos para el cliente (la guía de uso ya no lo menciona).
- Nada debe depender de Vercel de forma que impida el traslado. Hoy la plataforma depende de: un servidor **Node.js** capaz de ejecutar Next.js 16 (las rutas `/api/*`), y de **Supabase** para usuarios e inicio de sesión (Supabase Auth), las tablas `vaak_*` (PostgreSQL) y el almacenamiento de archivos.
- El traslado **está pendiente de definir** según el tipo de hosting del cliente (ver sección 7).

## 2. Rama y despliegue — LO MÁS IMPORTANTE

```
Rama de trabajo:  main (no hay otras ramas)
Código:           GitHub Datnya/plataforma-VAAK (público: solo código, nunca datos)
PRUEBA:           https://staging.hpgilatam.com     (hosting del cliente)
OFICIAL:          https://plataforma.hpgilatam.com  (hosting del cliente)
Vercel:           sigue desplegando con cada push, pero ya NO es el entorno de prueba
```

**Publicar = subir los archivos al hosting**: primero a PRUEBA y, con el visto bueno de Datnya, al OFICIAL. Un push a `main` guarda el código pero **no** actualiza el hosting (hasta que exista la publicación automática de la etapa 6). Ver «⭐ REGLAS DE TRABAJO» al inicio.

`git push` **funciona** desde la máquina de Datnya (las credenciales están en el Administrador de Credenciales de Windows). No uses el editor web de GitHub.

### Cómo verificar que un cambio llegó al hosting

Compara el archivo en vivo contra el armado local (el `app.js` publicado cambia `/prototype/assets/` por `/assets/`, así que compáralo con la salida de `armar-publicacion.js`):

```bash
curl -s https://staging.hpgilatam.com/money-utils.js | sha256sum
sha256sum staging/public/prototype/money-utils.js
```

Y revisa la instalación: `curl -s https://staging.hpgilatam.com/verificar.php` y `curl -s https://staging.hpgilatam.com/api/health` (igual con `plataforma.hpgilatam.com`).

---

## 3. Arquitectura — el punto que más confunde

> ⚠️ **Esta sección describe la versión de Vercel (Next.js + Supabase), que ya no es la que usa el cliente.** En el hosting del cliente el servidor es PHP + MySQL (`servidor-php/`) con las mismas rutas `/api/*`; la interfaz (`staging/public/prototype/`) es la misma. Ver «⭐ REGLAS DE TRABAJO» (punto 3: dónde se guardan los datos) y «Servidor PHP (etapa 2)» en la sección 0.


Hay **dos copias del prototipo** y solo una llega a producción:

| Carpeta | Qué es |
|---|---|
| `staging/public/prototype/` | **LA COPIA VIVA.** Es lo que sirve Vercel. **Edita siempre aquí.** |
| `prototype/` (raíz) | Copia vieja de desarrollo con los tests. **Divergió, está obsoleta, no la toques.** |

La interfaz **no es React**. Es JavaScript "vanilla" en `staging/public/prototype/`. Next.js solo se usa para las rutas API (`/api/...`) y para reescribir `/` y `/login` hacia el prototipo estático (ver `staging/next.config.ts`).

### Archivos clave de `staging/public/prototype/`

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Carga los scripts **en orden**. Al armar el paquete, `armar-publicacion.js` lo reescribe: deja solo la pantalla de inicio y `acceso.js`, y el resto del código se junta en `nucleo/interfaz.js` (lo entrega `/api/app` con sesión). El `?v=` es la huella del contenido |
| `app.js` | La interfaz completa. Enorme y minificado (~300 KB, pocas líneas larguísimas) |
| `access-control.js` | ACL: `ACTION_POLICY`, permisos por rol, `validateState` |
| `access-runtime.js` | Motor: store en localStorage, acciones, tokens de operación |
| `access-test-fixtures.js` | Datos semilla de demostración. **En el paquete publicado se reemplaza por el punto de partida VACÍO** de `servidor-php/publico/access-test-fixtures.js` |
| `staging-bridge.js` | Puente con el backend: login, sesión, usuarios, foto, presencia |
| `shared-sync.js` | Sincroniza los datos de la empresa entre todos los usuarios |
| `a4-preview.js` | Escala las previsualizaciones a A4 real |
| `revision-block.js` | Bloque de revisiones entre asteriscos, compartido por los tres formatos |
| `purchase-order-template.js` | Formato imprimible de la OC |
| `payment-request-template.js` | Formato del requerimiento de pago (solicitud de pago) |
| `reports.js` | Reportes Excel de OC y de requerimientos de pago (estilos en `assets/reports/*.xml`) |
| `technical-sheet-template.js` | Formato de la ficha técnica del spec |
| `money-utils.js` | Dinero y **catálogo de 19 monedas** |
| `oc-saldo.js` | Saldo de cada OC frente a sus requerimientos de pago: tarjeta del RP, aviso al pasarse (RP nuevo y revisión) y cálculo que usa el Excel (`window.VAAKSaldoOC`) |
| `limpiar-demo.js` | Aviso para el administrador si el servidor todavía tiene datos de demostración, con la ventana «Revisar y quitar» |
| `portal-cliente.js` | Portal del cliente: carrusel del banner y la sección «Project reports» (Excel de solo lectura) |
| `spec-rubros.js` | Campo «Rubro del spec»: buscador, lista sin división por equipos, ✕ que elimina del catálogo y «+» que agrega un rubro del proyecto (`project.rubrosPropios`) |
| `proyecto-areas.js` | Áreas de cada proyecto: botón «Ver áreas», cuadro con selección múltiple (solo admin) y filtro del campo «Área» del spec |
| `oc-formulario.js` | Formulario de OC: título editable del valor CIF (`cifLabel`) y «Especificado por» bloqueado con el nombre de quien llena |
| `spec-formulario.js` | Unidad de medida del spec como desplegable (Each, Un., Lot., Case, Box, SQM, M2, M, Yard, SQY, Pies, Pie2, Pack, Otro) |
| `oc-borradores.js` | Continuar un borrador de OC: restaura todos los campos en orden (ítems, descuentos, dirección del proveedor, totales) |
| `oc-impresion.js` | Al imprimir la OC, compacta las firmas si así caben en la hoja anterior |
| `rp-formulario.js` | Formulario de requerimiento de pago: partes desde la OC, total de factura = total de la solicitud, conceptos propios del desglose (`breakdownExtras`), monto a pagar = suma del desglose, «pagar a» bloqueado |
| `oc-direcciones.js` | Direcciones del formulario de OC: dirección del proveedor (automática) y almacenes del hotel (Ship To), con botón para agregar más |
| `presentation.js` | Traductor automático es/en de nodos de texto. **Ojo:** también traduce datos escritos por el usuario; los textos que no deben tocarse llevan `translate="no"` o `class="notranslate"` |
| `servidor-php/publico/acceso.js` | Pantalla de inicio de sesión publicada (lo único que se descarga sin sesión). Carga `/api/estilos` y `/api/app` al entrar |

### ⚠️ Trampas que te van a morder

**1. Al editar `index.html` sube el `?v=N`.** Si no, los navegadores sirven la versión vieja y parecerá que tu cambio no funcionó.

**2. En producción, los usuarios NO pasan por el motor local.** `staging-bridge.js` intercepta el formulario de usuarios y lo envía a `/api/admin/users` (Supabase). El handler `new-user` de `access-runtime.js` **no se ejecuta en producción**, solo en la demo local. Si escribes lógica en ese handler, funcionará en tu demo y fallará en producción. Ya pasó una vez con el alta de clientes en la tarjeta de equipo. Lo que dependa de usuarios debe **deducirse** de la lista de usuarios que llega del servidor, no escribirse en el momento de crearlos.

**3. Los tres PDF se generan con `window.print()`** y una clase en el body (`print-order`, `print-invoice`, `print-spec`). La ficha técnica tenía un generador propio que rasterizaba la hoja y fallaba; se eliminó en favor de este camino común. Chrome descarta los fondos de color al imprimir salvo que el CSS los pida con `print-color-adjust: exact`. Sin esa regla los formatos salen casi en blanco. Ya está puesta en los tres `*-reference.css`; si creas un formato nuevo, ponla también.

**4. Nada de reglas responsive en los formatos imprimibles.** Al imprimir, el ancho de viewport es el de la pagina A4: **794px**. Cualquier `@media (max-width: …)` por encima de ese valor se activa dentro del PDF. Las hojas tenian reglas a 820px y 860px que colapsaban el formato a una columna, y por eso el PDF salia desconfigurado. Se eliminaron: las pantallas pequenas las resuelve `a4-preview.js` reduciendo la hoja completa. **Si agregas una media query a un `*-reference.css`, el PDF se rompe.**

**5. `presentation.js` traduce el texto que escribe el usuario.** Convierte "proveedor" en "Supplier" dentro de datos reales. **Todo elemento que muestre texto escrito por el usuario necesita `translate="no"`.** Ya pasó tres veces en términos y condiciones, nombres de proveedor y conceptos de descuento.

---

## 4. Dónde viven los datos

> ⚠️ **Esta sección describe la versión de Vercel (Next.js + Supabase), que ya no es la que usa el cliente.** En el hosting del cliente el servidor es PHP + MySQL (`servidor-php/`) con las mismas rutas `/api/*`; la interfaz (`staging/public/prototype/`) es la misma. Ver «⭐ REGLAS DE TRABAJO» (punto 3: dónde se guardan los datos) y «Servidor PHP (etapa 2)» en la sección 0.


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

### Batería completa contra el servidor PHP real (desde el 21-sep) — úsala antes de cada actualización
```bash
bash servidor-php/pruebas/probar.sh
```
Arma el paquete igual que para el hosting (`armar-publicacion.js`), lo sirve con PHP 8.2 en `http://127.0.0.1:8095` sobre una base MySQL local **vacía** (`vaak_pruebas`, puerto 3307) y, con Chrome sin ventana, prueba: (4) 30 controles de seguridad del servidor por rol, incluidos los ataques desde la consola de un trabajador; (5) crear proyectos con portada, proveedores y specs desde la pantalla; (6) OC → requerimiento → pago → cambio de orden → reportes, que el trabajador ve solo su proyecto y que lo que él guarda llega al servidor, y el ancho de celular; (7) todas las pantallas con los tres roles sin errores de programa; (8) cerrar sesión borra los datos del navegador; (9) quitar los datos de demostración. Necesita PHP y MySQL portátiles en `C:/Users/HP/vaak-herramientas` (o `VAAK_HERRAMIENTAS=...`) y Chrome. Las claves de prueba se generan solas en `servidor-php/pruebas/.local/` (no va a GitHub). Nunca toca el hosting. El puerto 8095 debe estar libre.

### Flujo de trabajo que Datnya exige

1. Haces el cambio en `staging/public/prototype/`
2. Lo pruebas tú en el localhost (y, si el cambio depende de la sincronización, con la simulación descrita en las notas técnicas)
3. Actualizas **este documento** en el mismo commit
4. Commit + push a `main` y verificas que los archivos en vivo son idénticos a los locales

Datnya autoriza subir directamente una vez implementado y verificado. **Excepción:** si dice «no subas todavía» (por ejemplo, porque va a mandar más cambios), espera a que lo pida y súbelo todo junto.

---

## 6. Funciones implementadas (todas en producción)

### Proyectos
- **Eliminar proyecto (zona de riesgo):** borra el proyecto con **todo** su contenido: OC, specs, requerimientos de pago, vínculos con empresa/proveedores/trabajadores, borradores de OC y los **usuarios cliente vinculados solo a ese proyecto** (en producción se eliminan también en Supabase con `VAAKRemoteUsers.remove`, que agrega `staging-bridge.js`). La ventana muestra antes cuánto se va a borrar y los nombres de los clientes. Los proveedores no se borran: son un directorio de la empresa. La frase de confirmación ignora espacios repetidos, mayúsculas y tildes
- Si la operación queda vencida mientras la ventana está abierta (los datos cambiaron por detrás), se renueva y se confirma sola; si aun así falla, la ventana **no se cierra** y dice el motivo en rojo. Antes se cerraba con un aviso genérico y el proyecto seguía ahí: es la causa más probable del fallo reportado el 17-sep, que no se pudo reproducir en local
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
- **Una sola moneda por OC, siempre** (decisión de Datnya). La define el primer ítem; en las demás filas el selector de moneda queda bloqueado y la sigue. Un spec cuyo costo está en otra moneda se marca en rojo y no deja emitir. Aplica también a las revisiones. El motor rechaza una OC o una revisión con monedas mezcladas. El total se suma en la moneda de la OC (antes convertía dólares a soles con un tipo de cambio fijo de 3.75 y mostraba el total en S/)
- **Terms** es un cuadro de texto largo: Enter crea una línea nueva, el cuadro crece hacia abajo y el A4 respeta los saltos de línea
- En la OC no se puede pedir más cantidad de la **disponible** en el spec (cantidad del spec menos lo ya pedido en otras OC no canceladas): avisa en rojo y no deja emitir
- **Specs consumidos:** si las OC ya usan toda la cantidad de un spec, el spec queda **cerrado**: la tarjeta dice «Cerrado · usado por completo en una OC», desaparecen Editar y Realizar revisión, y no se ofrece al generar una OC nueva. El motor (`specAgotado` en `access-runtime.js`) también rechaza editarlo o revisarlo. Al **revisar** una OC, sus propios specs siguen disponibles (se descuenta todo menos esa misma orden), y si la revisión baja la cantidad, el spec se reabre solo. Un spec sin «Cantidad» nunca se cierra
- **Reportes Excel:** la columna CUR muestra la moneda real de la OC o de la solicitud (antes todo lo que no era USD, EUR o COP salía como PEN). La unidad sale del spec cuando el item no la tiene
- **Reporte Excel de OC:** la columna ITEM # muestra el código del spec tal como se ve en pantalla (el guardado o el derivado de su id, misma regla que `specCode()`). Antes mostraba el id interno (`sp-1789657319006`)
- **Eliminar OC** (historial de OC y registro del proyecto): la confirmación pregunta por la OC con su número, proveedor y monto, avisa que no se puede deshacer, y si falla lo dice dentro de la ventana
- Contacto del proyecto configurable en Configuración del sistema, editable por documento

### Saldo de la OC y direcciones (actualización 3, 18-sep)
Pedido de Datnya: «todo debe estar debidamente vinculado».
- **Dirección del proveedor en la OC** (`oc-direcciones.js`): el antiguo campo «Dirección de almacén guardada» (que mostraba el almacén del proyecto) pasa a ser **«Dirección del proveedor»**, justo debajo del proveedor, y se llena sola con la dirección registrada del proveedor elegido. Si tiene varias, se elige de la lista; «Agregar nueva dirección» la guarda en el proveedor (`addresses`, en los datos compartidos). Se guarda en la OC como `supplierAddress` y el PDF la imprime en **MANUFACTURER**. El RP toma esa dirección como «Dirección fiscal del proveedor».
- **Ship To:** «Dirección de entrega / almacén del hotel (Ship To)» es una lista con los almacenes del proyecto (`warehouse` + `warehouses`), con su botón para agregar más.
- **BILL TO sigue siendo la dirección fiscal del hotel** (campo «Dirección fiscal (Bill To)», visible y editable como antes). El modelo anterior había puesto ahí la dirección del proveedor y el PDF salía con el nombre del hotel junto a la dirección del proveedor; se corrigió.
- Las OC nuevas llevan `addressMode: "v2"`; las anteriores se imprimen igual que antes. Los selectores de direcciones llevan `translate="no"`.
- **Saldo de la OC en cada RP** (`oc-saldo.js`): saldo = total de la OC − suma de sus RP (con o sin pago registrado), en orden de creación. Solo se descuentan los RP en la misma moneda que la OC (si no, la tarjeta lo avisa en amarillo). Cada tarjeta muestra el **número de OC en grande** y «Falta para completar la OC: …»; si los RP ya superan la OC, franja roja «EXCEDIDO: los requerimientos superan la OC por …».
- **Aviso al pasarse:** el formulario de RP se precarga con el saldo (no con el total). Si el monto deja la OC pagada de más, sale el aviso en rojo y, al generar, una ventana al centro con total, ya solicitado, saldo y exceso: «Revisar el monto» o «Sí, generar de todas formas» (**se advierte pero se deja guardar**, porque VAAK admite RP que superan la OC). La **revisión de un RP** hace lo mismo sin contarse a sí misma, y solo si cambia el monto, la OC o la moneda.
- **Excel de requerimientos de pago:** columnas nuevas **PO BALANCE** (saldo tras ese RP) y **PO ALERT** («EXCEDIDO» u «OTRA MONEDA»); la fila excedida sale en rojo. Estilos nuevos 28-30 en `assets/reports/invoice-styles.xml`.
- Probado en la demo local: dirección automática y agregada; OC emitida con MANUFACTURER / SHIP TO / BILL TO correctos; RP de 10,000 sobre OC de 18,450 (saldo 8,450); segundo RP de 10,000 con aviso y confirmación (EXCEDIDO 1,550); revisión del primero a 9,000 (aviso, sin contarse) y a 8,000 (guarda, saldos 10,450 y 450); Excel con PO BALANCE -1550 y fila roja.

### Áreas del proyecto, contacto y ajustes de la OC (actualización 3, tanda 2, 18-sep noche)
- **Áreas del proyecto** (`proyecto-areas.js`): las áreas son los rubros de «Configuración del sistema → Rubros de órdenes de compra». Cada proyecto guarda sus códigos en `project.areaCodes` (datos compartidos; cada proyecto es independiente). **Si el proyecto aún no tiene selección, tiene todas las áreas** (así los proyectos existentes siguen funcionando). La tarjeta «Áreas del proyecto» muestra «N áreas registradas» y el botón **«Ver áreas»**: cuadro al centro con RUBRO, CÓDIGO, TIPO y ÁREA y buscador. El **administrador** tiene «Seleccionar áreas» (casillas agrupadas OS&E / FF&E, buscador, «Marcar todas» / «Quitar todas», «Guardar selección» con animación) y una ✕ por fila para quitar un área (pide confirmar). Trabajadores y clientes solo ven la lista. El puente `VAAKAppBridge` expone ahora `getView()` (usuario y proyecto abierto) y `getRubros()` (catálogo).
- **Campo «Área» del spec:** solo muestra las áreas del proyecto (si un spec antiguo tiene otra, se conserva). Si el proyecto no tiene ninguna, avisa en rojo que un administrador debe elegirlas. El campo **«Rubro del spec»** no se filtró (pendiente de consultar con Datnya).
- **Contacto del proyecto (OC):** el desplegable lista los mismos clientes que la tarjeta «Equipo del cliente» (usuarios Cliente activos del proyecto, por membresía del servidor). Antes leía `project.team` (antiguo, vacío en producción) y solo `clientProjectLinks`.
- **Título editable del valor CIF:** el título del campo es un cuadro editable (por defecto «CIF Value»). Se guarda como `cifLabel` y el PDF imprime ese título en la línea del valor. También se puede cambiar en la revisión de la OC (queda registrado como cambio).
- **«Especificado por»:** se llena con el nombre de quien llena el formulario y no se puede editar; el motor (`new-order` en `access-runtime.js`) lo fija también al emitir.
- Probado en la demo local: selección y quitar áreas, specs y la sincronización no borran `areaCodes`, spec con área filtrada (admin y trabajador), trabajador sin botones de edición, OC con «FOB Value» y «Especificado por: Morgan Lee», revisión de la OC cambiando a «DDP Value» con su motivo, sin errores en la consola.

### Tanda 3 de la actualización 3 (18-sep noche, sin commit)
- **«Rubro del spec»** también se filtra a las áreas del proyecto (se conserva «Otros» y el valor actual). Área y rubro se filtran también en la **revisión** del spec.
- **Unidad de medida** (`spec-formulario.js`): desplegable con Each, Un., Lot., Case, Box, SQM, M2, M, Yard, SQY, Pies, Pie2, Pack y «Otro (escribir)». El campo real sigue siendo `unit` (oculto salvo con «Otro»); un valor antiguo como «EACH» se muestra como «Each» sin cambiar lo guardado; uno desconocido («Rollo») aparece como «Otro». También en la revisión del spec.
- **Borradores de OC** (`oc-borradores.js`): causa: «Continuar» abría el formulario, esperaba 0,1 s y pegaba los valores sin eventos. Se perdían los ítems desde el segundo, los descuentos/recargos, la dirección del proveedor elegida, y el total quedaba el guardado (no el recalculado); con conexión lenta, además, los campos que el formulario agrega después. Ahora se abre el proyecto del borrador si hace falta, se espera a que el formulario esté completo y se restaura todo en orden con eventos (el formulario se ve atenuado mientras carga). Al guardar se incluyen también los campos deshabilitados. Probado: 2 ítems + descuento + FOB + dirección → guardar → continuar → todo igual y total 1,014.00 recalculado.
- **Formularios que «se bloqueaban»** (`access-runtime.js`, `operationToken`/`validateToken`): cada formulario abierto tiene un permiso que vencía a los **15 minutos** y se anulaba con **cualquier** cambio en los datos de la empresa (`storeRevision`: la sincronización cada 20 s, otro usuario, la relectura de usuarios cada 60 s). Al pulsar Guardar/Continuar el motor lo rechazaba. Ahora dura 12 h (y se renueva al usarse) y solo se anula si cambió **el mismo registro** que se está editando. Probado: spec guardado tras un cambio simulado de otro proyecto.
- **PDF de la OC** (`purchase-order-reference.css`, `purchase-order-template.js`, `oc-impresion.js`): la hoja usa la página con nombre `@page vaak-po` (márgenes 12 mm arriba, 15 mm abajo, 11 mm a los lados en **todas** las hojas; antes el margen era el relleno de la hoja y solo existía en la primera). El pie va en los márgenes de página (`@bottom-left` fijo y `@bottom-right` con «PO número · Page X of Y» desde un `<style>` del propio formato; requiere Chrome/Edge 131 o más nuevo) y el pie dentro de la hoja se oculta al imprimir. Las firmas ya no fuerzan salto de página; `oc-impresion.js` simula la paginación antes de imprimir y, si no caben al final de una hoja, las compacta en alto (`po-approvals-compact` + `--po-approval-min`) lo justo para que quepan; si ni así caben, pasan a la hoja siguiente. Los otros formatos (solicitud de pago, ficha técnica) no cambian.
- **Texto justificado** en las celdas ITEM y DESCRIPTION de la OC (`hpg-ref-item-cell`, `hpg-ref-desc-cell`; la última línea queda a la izquierda). Además se corrigió un error de anchos: **sin columna IMAGE**, DESCRIPTION medía 14 % y QTY 38 % (se corrían una columna); ahora la tabla lleva `hpg-ref-no-image` con anchos propios (ITEM 17 %, DESCRIPTION 45 %).
- Probado imprimiendo a PDF con Chrome sin ventana una OC de prueba de 6 y 8 ítems: margen arriba en todas las hojas, pie «Page X of N» en todas, firmas compactadas al final de la hoja 2 en vez de saltar a la 3, sin fondo beige en la última hoja.

### Tanda 4 de la actualización 3 (18-sep noche, sin commit)
- **Pie de página en otros navegadores:** el pie en todas las hojas usa los márgenes de página, que entienden Chrome, Edge, Opera y Brave (131 o más nuevo; se detecta con `window.CSSMarginRule`). En otro navegador (Firefox, Safari antiguos) `oc-impresion.js` muestra el pie una vez al final, como antes, y avisa en pantalla que para tenerlo en todas las hojas se use Chrome o Edge. No se pudo probar en Firefox/Safari (no están en la computadora).
- **Requerimiento de pago** (`rp-formulario.js`, más `invoiceOrderDefaults` en `app.js`):
  - Al elegir la OC se llenan «Proveedor / fabricante», «Pagar a», «Dirección fiscal del proveedor» y «Contacto» con lo guardado en la OC (`supplierAddress`, `supplierContact`) y, si falta, con el proveedor registrado. Siguen siendo editables.
  - «Referencia OC / área» = solo el número de la OC (antes `número-rubro`, p. ej. P163-0001-RESTT).
  - «Monto total de factura» = «Total de la solicitud» (se copia solo, bloqueado).
  - «Desglose de montos»: botón «Agregar concepto al desglose» (título + monto, se pueden quitar). Se guardan en `breakdownExtras` como texto legible «Título: monto | Título: monto» (así las revisiones muestran el cambio entendible). Agregado a `INVOICE_FIELDS` (`access-runtime.js`) y a los campos de la revisión del RP.
  - «Monto a pagar» = suma de todo el desglose (bloqueado). En la revisión no se recalcula al abrir (un RP antiguo no aparece «cambiado»), solo al tocar el desglose o el total.
  - «Realizar el pago a» = proveedor de la OC, bloqueado.
- **Formato A4 del RP** (`payment-request-template.js`, `payment-request-reference.css`): en el desglose y en «PAYMENT REQUEST TOTALS» solo salen los conceptos con monto (vacíos o cero no salen) más los conceptos propios; la grilla se ajusta a la cantidad (hasta 8 por fila). Tabla INVOICE ENTRY DETAILS con columnas 11/11/9/9/37/6/17 %: INV. DATE y DUE DATE más a la izquierda y PAYMENT TERMS en una línea (probado con 43 caracteres).
- **Tarjeta del RP:** el número de OC sale a la derecha de la fecha («F001-123 · 2026-09-18 · OC PRJ-041-0001», en negrita); se quitó la línea grande de arriba para no repetirlo.
- **Permisos de formularios:** los de «crear» (`new-*`, p. ej. nuevo RP, cuyo destino es el proyecto) ya no se anulan aunque cambie el proyecto mientras el formulario está abierto.
- Probado en la demo: RP con OC PRJ-041-0001 → partes llenas, referencia sin rubro, total 300 → total de factura 300, flete 50 + «Seguro de carga» 25 + mercadería 380 → monto a pagar 455; formato con solo TOTAL, GOODS, FREIGHT y SEGURO DE CARGA; revisión cambiando el seguro a 40 → monto a pagar 470 y dos cambios registrados con motivo; sin errores en la consola.

### HTTPS obligatorio (actualización 3, 18-sep noche, sin commit)
`servidor-php/publico/.htaccess` redirige `http://` → `https://` (301), salvo `/.well-known/` (lo usa AutoSSL para el certificado). Antes, en PRUEBA, `http://staging.hpgilatam.com` abría sin cifrado. El ZIP de la actualización 3 incluye este `.htaccess` (20 archivos en total). **Seguridad que depende del hosting** (firewall, DDoS, antivirus del servidor): no se pudo confirmar con Perú Hosting (Datnya no tiene contacto directo); lo que sí se sabe es que la cuenta usa CloudLinux con LiteSpeed y AutoSSL. **Pendiente:** copias de seguridad de la base oficial.

### Actualización 5 (20-sep, tarde)
Todo probado en la demo local antes de empaquetar.
- **El PDF de la OC ya no sale con «20/9/26, 15:18 VAAK — Procurement Platform» arriba.** Ese texto lo imprime Chrome en el margen de la página cuando hay margen disponible. Ahora la página va con `margin:0` y los márgenes (12 mm arriba, 15 mm abajo) los pone un **marco dentro de la hoja**: `<table class="hpg-print-frame">` con una fila de cabecera vacía y un pie que el navegador repite en cada página (`purchase-order-template.js` + reglas en `purchase-order-reference.css`; `oc-impresion.js` solo inyecta `@page{size:A4;margin:0}`). Los laterales (11 mm) son el relleno de la hoja. Comprobado en PDF de 2 y 3 hojas: márgenes en todas, pie en todas, cabecera de la tabla de ítems repetida y la sección de condiciones entera en una hoja. **Efecto secundario:** se perdió el «Page X of Y», que venía de las cajas de margen (se puede numerar aparte si Datnya lo pide).
- **Cambio de orden con todos los campos:** se agregaron al formulario Flete, Términos de pago, Tiempo de producción, Garantía, Marca lateral, Dirección del proveedor, Ship To, Bill To, Rubro/área y Contacto del proyecto. `REVISABLE_FIELDS` (en `access-runtime.js`) incluye ahora `paymentTerms`, `shipTo`, `billTo`, `supplierAddress`, `projectContact` y `ocRubro`; los nombres salen en la lista de motivos y en el bloque impreso (`revision-block.js`). No se agregó «Tipo de OC» (FF&E/OS&E) porque de él depende la numeración.
- **Saltos de línea en la revisión:** `campo()` del formulario de cambio de orden dibuja un textarea cuando el valor guardado tiene saltos (un `<input>` los borra al cargarlos).
- **Términos de pago del RP:** al elegir la OC se copian de ella (`order.paymentTerms` y, si no, `order.terms`); el campo sigue siendo editable (`rp-formulario.js`).
- **Montos que se veían dobles** (registro del pago, cambio de RP, etc.): la capa `.money-mask` que muestra el monto formateado se colaba por reglas como `.field span{display:block}` y quedaba encima del número que se escribe. Se fijó con `.money-mask{display:none!important}` y `.is-masked>.money-mask{display:flex!important}` (`refinements.css`). Comprobados 16 campos de monto en los seis formularios: con el cursor dentro se ve solo lo que se escribe; fuera, solo el monto con formato.
- **Un cambio = un motivo:** «Monto total de factura» y «Monto a pagar» los calcula la plataforma, así que ya no se comparan como cambios propios (`INVOICE_DIFF_FIELDS` en `access-runtime.js`); se guardan igual. Antes, cambiar el total pedía dos motivos por el mismo cambio.
- **Avisos apilados:** el aviso «el requerimiento supera el saldo de la OC» se repetía uno encima de otro si se pulsaba Guardar varias veces; ahora se reemplaza (`oc-saldo.js`).
- Probado: cambiar «Total de la solicitud» → un solo cambio y un solo motivo, un solo aviso aunque se pulse Guardar tres veces, y al confirmar se guarda con el total de factura recalculado; cambiar «Mercadería» → un cambio, con el monto a pagar recalculado solo.

### Actualización 4 (20-sep)
Todo probado en la demo local; el paquete está en `Claude outputs/actualizaciones/actualizacion-4/`.
- **«Preparado por» (OC)**: es siempre quien llena el formulario y no se edita (`app.js`, `oc-formulario.js`); el motor lo fija al emitir (`new-order` en `access-runtime.js`), igual que «Especificado por». Al continuar un borrador de otra persona se pone el nombre de quien lo abre.
- **Bug al abrir un borrador de OC**: se veía el formulario a medio armar unos segundos. Ahora `oc-borradores.js` tapa la pantalla con «Abriendo el borrador…» (con su animación) hasta que está listo, y las esperas fijas bajaron de más de 1 s a **225 ms** en total (se espera por condición, no por tiempo).
- **Márgenes del PDF de la OC**: estaban puestos con una «página con nombre» (`@page vaak-po`) y el Chrome de Datnya no la aplicaba, así que mandaba el `@page{margin:0}` de otro formato y la hoja salía pegada al borde. Ahora `oc-impresion.js` inyecta al imprimir un `<style>` con `@page{size:A4;margin:12mm 11mm 15mm}` (va último, gana siempre) y, si el navegador admite cajas de margen, también el pie (`@bottom-left` / `@bottom-right` con «PO · Page X of Y»). Comprobado imprimiendo a PDF con Chrome sin ventana, con y sin soporte de cajas de margen.
- **«TERMS AND CONDITIONS» entera en una hoja**: si no cabe al final de la hoja, la sección completa pasa a la siguiente (`condiciones()` en `oc-impresion.js` + `break-after:avoid` en sus títulos). Antes el título quedaba en una hoja y las condiciones en la otra.
- **Campos de varias líneas** (`campos-multilinea.js`, nuevo): Enter baja de renglón y el campo crece solo en Incoterm, Flete, Términos y condiciones de pago, Tiempo de producción, Garantía, Marca lateral, Destino final y Dirección fiscal (OC); Términos de pago, Proveedor/fabricante y Pagar a (RP); Descripción, Tamaño, Material y Acabado (spec). En los campos de una línea, Enter ya no envía el formulario. Los saltos de línea se respetan al imprimir (`white-space:pre-wrap` en los dos formatos). Como la plataforma hace `campo.type="text"` en varios sitios, los textarea fingen ser de texto (`Object.defineProperty`) para no romper nada.
- **Lupa en la previsualización A4** (`a4-preview.js`): barra con 🔍− / porcentaje / 🔍+ / «Ajustar», del 50 % al 250 % de 25 en 25, con desplazamiento lateral. No afecta al PDF y no sale impresa.
- **«Partes» del requerimiento de pago**: los cuatro campos (proveedor/fabricante, pagar a, dirección fiscal y contacto) se llenan con la OC elegida y **no se editan** (`rp-formulario.js`). Si la OC no trae un dato, el campo queda vacío, deja de ser obligatorio y muestra un aviso en rojo debajo.
- **Nombres**: «Generar nueva factura» → **«Generar nuevo requerimiento»**, su botón → «Generar requerimiento», la vista previa → «Previsualización del requerimiento» y el mensaje → «Requerimiento de pago generado». «Total de la solicitud» no cambió: sale con el monto por defecto, es editable y conserva su aviso en rojo.

### Tanda 5 de la actualización 3 (18-sep noche, sin commit)
- **Botones renombrados** (solo el texto; la función es la misma): «Realizar revisión» → **«Cambio de spec»**, **«Cambio de orden»**, **«Cambio de requerimiento»**. Los títulos de las ventanas siguen diciendo «Revisión…».
- **Spec cerrado = solo «Cambio de spec»** (antes era al revés): un spec abierto se **edita** (Editar/Duplicar, sin «Cambio»); cuando las OC usan toda su cantidad queda cerrado y solo se puede hacer «Cambio de spec». El motor lo exige: `revise-spec` rechaza specs no cerrados y `edit-spec` rechaza los cerrados. Un spec sin «Cantidad» nunca se cierra, así que siempre se edita.
- **Cambiar o editar un spec NO cambia las OC ya emitidas:** cada ítem de OC guarda los datos del spec que imprime (`item.specSnapshot`: código, código de producto, imagen, nombre, medida, material, descripción, unidad, color) al emitir la OC (`withSnapshots` en `new-order`) y, para OC anteriores, justo antes de editar o cambiar el spec (`freezeSpecInOrders`). El formato de la OC y el reporte de OC usan esos datos guardados. Un «Cambio de orden» conserva lo guardado de cada ítem (solo toma los datos del spec si se agrega un ítem nuevo).
- **Cambio de orden con más cantidad que la del spec:** sigue el aviso en rojo, pero ya no bloquea: el texto agrega «En un cambio de orden se permite: puedes guardarlo igual» (`aplicarTopeCantidad`, variable `enCambio`). En la OC nueva sigue bloqueando.
- **Formatos A4 (OC, spec y RP):** el bloque entre asteriscos muestra el **motivo de cada cambio** (en la OC solo salía el motivo general antiguo, que ahora va vacío) y una línea «Values changed in Revision N are shown in blue». Los **valores cambiados en la última revisión se pintan en azul** (`.rev-mark`, celeste sobre los recuadros marrones) en el mismo formato: helpers `lastChanges`, `changed`, `mark` en `revision-block.js`, usados por `purchase-order-template.js`, `technical-sheet-template.js` y `payment-request-template.js`.
- **Total de la OC tras un cambio:** `revise-order` actualizaba `amountValue` pero no `amount` (el total en texto), y la lista y el reporte de RP mostraban el total anterior. Ahora `amount` se recalcula en cada cambio. Las OC ya cambiadas antes de esta versión se corrigen en su próximo cambio (el reporte de RP ya usa `amountValue`).
- **Reportes siempre con la última versión:** el botón de reportes lee los datos guardados en ese momento (`runtime.renderCurrentRoute()`), no los de la última vez que se dibujó la pantalla.
- **Reporte de RP:** los comentarios van en **INVOICE NOTE** (antes en HPG COMMENTS, que queda vacío). Los campos propios del pago se agregan ahí como «Other payment lines: …».
- **Registro del pago:** «Monto pendiente a cancelar» se calcula solo (monto a pagar del RP − valor pagado, mínimo 0) y no se edita; se muestra debajo el monto a pagar del RP. Botón **«Agregar campo al pago»** (título + monto), guardado en `paymentExtras` (`register-payment` en `access-runtime.js`). **No** se restan del pendiente (pendiente de confirmar con Datnya).
- Probado en la demo: spec con cantidad 2 → OC por 2 → spec cerrado con solo «Cambio de spec»; cambio de spec (nombre y medida) → la OC sigue con los datos anteriores; ficha técnica con valores en azul y motivos; cambio de orden a 5 y luego 6 unidades (aviso rojo, se guarda, total 9,000 actualizado); OC con motivos y azul; reporte de OC con 6 unidades y 9,000; cambio de requerimiento 300 → 320 y reporte de RP con 320 al instante; registro del pago 300 de 470 → pendiente 170 y campo «Comisión bancaria»; INVOICE NOTE con los comentarios; sin errores en la consola.

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
- **Separador de miles en los formularios:** los campos de monto son numéricos y no pueden mostrar comas, así que `enmascararMonto` (en `app.js`) pone encima una capa con el monto formateado mientras el campo no se edita. El valor real no cambia: ningún cálculo ni envío se entera. **Cuidado:** el estilo de la capa se copia con la capa apagada; si se copia con ella encendida, hereda el color transparente del campo y el monto se vuelve invisible (pasó el 17-sep y se corrigió el mismo día). Se aplica a los campos que reconoce `isMoneyInput` (costos, flete, CIF, impuesto, ajustes, montos de solicitud y de pago). El formulario de solicitud de pago usa campos de texto con símbolo de moneda (otro mecanismo, anterior)
- Los campos de monto ya no usan `step=0.10`, que hacía que el navegador rechazara montos con centavos

### Otros
- 19 monedas (Latinoamérica + dólar + euro). Sol y dólar se guardan con símbolo; el resto con código ISO
- Previsualizaciones en A4 real (794px) escaladas para caber
- **Los cuadros emergentes no se cierran al hacer clic fuera**, solo con Cerrar/Cancelar/X
- Usuarios cliente: sin interruptores de acceso, un solo proyecto, alta automática en la tarjeta de equipo
- **El cliente descarga sus OC:** botón «Descargar» en su historial y «Descargar PDF» dentro de la vista. Antes el botón de la vista existía pero respondía «no autorizado» porque la impresión exigía rol admin o trabajador. Ahora el cliente puede imprimir solo las OC que tiene permiso de ver (se comprueba con la política `preview-order`)
- **Pie de página de la ficha técnica:** quedaba a media hoja porque la regla genérica `.spec-preview footer{margin-top:1.5rem}` le ganaba a `.hpg-ts-footer{margin-top:auto}`. Se reforzó el selector
- **Registro de acceso de clientes (Herramientas):** lo escribe el servidor al iniciar sesión cada cliente (nombre, cargo, proyectos y fecha/hora). Botón rojo **«Vaciar registro»** arriba a la derecha, solo para administradores: pide confirmación en una ventana al centro de la pantalla («¿Estás seguro…?», con la cantidad de registros) y, si falla, muestra el motivo en rojo sin borrar nada. Los trabajadores con acceso a la herramienta ven el registro pero no el botón

---

## 7. Pendientes reales

### 🟡 La traducción automática cambia palabras dentro de nombres
`presentation.js` traduce el texto de la pantalla palabra por palabra; por eso un usuario llamado «Rosa Cliente» aparece como «Rosa Client» en la lista de usuarios (en la base de datos el nombre está bien). Pasa igual en Vercel. Otros casos vistos el 18-sep con la pantalla en inglés: el desplegable de OC del requerimiento de pago («PO-2026-001 - Supplier Andino») y la ficha del proveedor bajo el campo de proveedor de la OC. Pendiente de consultar con Datnya si se corrige.

### ✅ Permisos de proyectos iguales para todos (resuelto en la actualización 2, 18-sep)
**Qué pasaba:** los permisos de proyectos (a qué proyectos entra cada trabajador y cada cliente) se guardan en el servidor, en la membresía de cada usuario (`local_project_ids` y `project_scope` de `vaak_user_company_memberships`), y cada navegador arma con eso `projectMemberships` y `clientProjectLinks` (`syncRemoteUsers` de `access-runtime.js`). Pero **solo el administrador recibía la lista de usuarios**: los trabajadores veían permisos viejos o incompletos, y ningún navegador se enteraba de un cambio hecho por otro administrador hasta recargar.

**Cómo quedó:** `/api/auth/session` entrega el directorio a administradores **y trabajadores** (los clientes no lo reciben). `staging-bridge.js` vuelve a leer la sesión cada 60 s y al volver a la pestaña; si cambió algún usuario, rol o proyecto, lo aplica sin recargar (si hay un formulario abierto o alguien está escribiendo, espera a que termine). Probado con dos navegadores: el trabajador vio su nuevo proyecto en 10 s. «Agregar miembro al equipo del cliente» (operación `add-team-member`; hoy sin botón visible, los clientes se asignan en Gestión de usuarios) también guarda el proyecto en la membresía del servidor. `clientOrderAuthorizations` no se crea en ninguna parte (solo se filtra): no hay nada que compartir.

**No hace falta** meter esas colecciones en `COLLECTIONS`: la fuente de verdad es la membresía del servidor, que además es la que usa `vaak_estado_para_miembro` para filtrar lo que ve un cliente.

### 🟡 Proyectos con datos borrados
Un bug corregido el 17-sep (commit `2f33b09b`) borraba razón social, dirección fiscal, dirección de almacén, ciudad y país al guardar la tarjeta "Áreas del proyecto". Ya no ocurre, pero **lo ya borrado sigue borrado**. Se puede recuperar del historial de `vaak_company_data_history`. Falta que Datnya identifique qué proyectos quedaron afectados.

### 🟡 Eliminar proyecto: pendiente de prueba en producción
El fallo reportado el 17-sep no se pudo reproducir en local, ni siquiera simulando la sincronización. Se corrigió la causa más probable (ver sección 6). Falta que Datnya lo pruebe con un proyecto de prueba que tenga un cliente vinculado. El borrado del cliente en Supabase (`VAAKRemoteUsers.remove`) solo existe en producción y no se pudo probar en local.

### 🟡 Conversión fija dólar ↔ sol al cambiar la moneda del primer ítem
En la nueva OC, si se cambia a mano la moneda del primer ítem entre $ y S/, el costo se convierte con un tipo de cambio fijo de 3.75 (`USD_TO_PEN` en `app.js`). Es anterior a estos cambios y no se ha consultado con Datnya si debe mantenerse.

### 🔵 Traslado al hosting oficial del cliente — DECIDIDO: PHP + MySQL (18-sep)
**Hosting del cliente:** Perú Hosting (hostingperu.com.pe), «Plan Avanzado», compartido con cPanel. Según el proveedor: **Node.js solo en planes VPS**, base de datos **MySQL 8.0**, PHP 8.2 (5.7 a 8.4), FTP; no mencionan SSH ni Git. **El cliente no cambiará de plan** y exige que los datos queden **dentro de su hosting**.

**Decisión:** reescribir la parte de servidor (las rutas `/api/*`, hoy en Next.js + Supabase) en **PHP 8.2 + MySQL 8.0**, con **las mismas direcciones y respuestas**, para que la interfaz (`staging/public/prototype/`) casi no cambie. Se quitan Supabase y Next.js.

Lo que debe reproducirse (inventario hecho el 18-sep, 14 rutas):
- Inicio y cierre de sesión, sesión actual, protección CSRF (cookie `vaak-csrf` + cabecera `x-vaak-csrf`), bloqueo por intentos fallidos.
- Usuarios: listar, crear, editar, deshabilitar, eliminar; nunca dejar a la empresa sin administrador activo.
- `/api/data`: documento compartido con control de concurrencia por `revision` (409 si otro guardó antes), historial de las últimas 150 versiones y filtrado para clientes (solo sus proyectos).
- `/api/data/assets`: imágenes identificadas por su SHA-256.
- Foto de perfil, presencia (conectado ahora), salud del servicio.
- **No se usan** y no se migran: `/api/storage/sign`, `/api/tracking/[token]` y las tablas antiguas del diseño inicial (proyectos, OC, specs como tablas separadas, etc.). Todo vive en `vaak_company_data`.
- Las contraseñas de Supabase son bcrypt: PHP las valida con `password_verify`, así que **los usuarios conservan su contraseña**.
- La recuperación de contraseña hoy solo atiende enlaces enviados desde el panel de Supabase; en la versión PHP el administrador cambia la contraseña desde «Editar usuario».

Plan por etapas: ver el mensaje del 18-sep y, cuando se apruebe, esta sección se actualizará con el avance.

### 🟢 `VAAK_RELEASE_ID` en Vercel
Cosmético. `/api/health` devuelve `releaseId: "local"` porque la variable se perdió al sacar `.env.local` del repositorio. Se arregla agregándola en el panel de Vercel.

---

## 8. Cómo trabaja Datnya

- **Responde siempre en español**, claro y sin tecnicismos.
- Los botones deben mostrar **animación de carga**; los errores deben decir **el motivo, en rojo**.
- Pide **confirmación** antes de acciones sensibles (cambio de rol, cambio de código de proyecto).
- **Si algo no queda claro, pregúntale antes de implementar.** Lo dice explícitamente y lo agradece.
- Quiere ver todo funcionando **primero en PRUEBA (`staging.hpgilatam.com`)**; solo con su visto bueno se publica en el OFICIAL (`plataforma.hpgilatam.com`).
- **Cada vez que se hace algo nuevo hay que actualizar este documento**, en el mismo commit. Lo pidió explícitamente y lo repite: es la forma de que un modelo nuevo retome sin perder contexto.

### Notas técnicas para no repetir errores ya cometidos

- `app.js` está minificado. Para editarlo, escribe un script de parche con anclas de texto exactas que verifique que hay **exactamente una** coincidencia antes de tocar nada.
- En `String.replace()`, la secuencia `$'` es un comodín. **Usa siempre una función como reemplazo** (`.replace(a, () => b)`), o destrozarás el archivo.
- Valida con `node --check <archivo>` después de cada edición.
- Tras crear, editar o eliminar usuarios, `directory()` del puente vuelve a emitir `vaak:session` con la lista nueva. Antes la sincronización compartida seguía usando la lista del inicio de sesión y podía volver a mostrar localmente usuarios ya eliminados
- Para reproducir problemas de sincronización sin tocar producción: una demo con `shared-sync.js` activo y `/api/data` simulado en memoria, abriendo dos orígenes (`localhost` y `127.0.0.1`) como dos navegadores distintos
- En la vista de pruebas en segundo plano `requestAnimationFrame` no se ejecuta: para lógica que debe correr sí o sí, usa `setTimeout`.
- `access-runtime.js`, `money-utils.js` y `staging-bridge.js` mezclan saltos de línea Windows (CRLF) y Unix (LF). Un ancla que cruce un salto de línea puede no coincidir: prefiere anclas dentro de una sola línea.
- El hook de `git-lfs` falla con un error de memoria después de cada commit. Es ruido, el commit se creó bien.

---

## 9. Historial

- **2 sep:** última actualización de `HANDOFF/` (59 documentos, ya obsoletos)
- **15 sep:** usuarios conectados a Supabase Auth
- **16 sep:** foto de perfil, presencia, campos de proyecto, datos compartidos entre usuarios
- **17 sep:** todo lo de la sección 6 (términos, revisiones, impuestos, monedas, A4, rubros, clientes, Tax ID, equipo del cliente automático, colores en los PDF, requerimiento de pago)
- **17 sep (tarde):** registro del pago, reporte de requerimientos de pago, revisiones numeradas desde 1, cierre de specs consumidos, códigos reales en el Excel de OC
- **17 sep (noche):** motivo por cada cambio en las revisiones, status del documento, alerta de monto/moneda en la solicitud, «Pagar a:», montos con formato moneda, dirección fiscal automática, sin columna PAYABLE TO, descarga de OC para el cliente, pie de la ficha técnica
- **17 sep (cierre):** tres decimales, separador de miles en formularios, filas de la OC con datos reales del spec y su moneda, terms con texto largo, moneda y unidad en los Excel, tracking aleatorio en todos los casos, rediseño de las tarjetas de specs y solicitudes
- **17 sep (cierre, 2):** una sola moneda por OC
- **17 sep (cierre, 3):** eliminar proyecto completo (con clientes) y robusto; confirmación de eliminar OC con su número
- **18 sep:** guía práctica de uso (PDF y Word); corrección de montos invisibles en los campos; el enlace de Vercel queda como entorno de prueba; **decisión y plan aprobado para trasladar la plataforma al hosting del cliente con PHP + MySQL** (sección 0)
- **18 sep (actualización 2):** nada queda solo en la computadora de un usuario (borradores de OC y avisos descartados compartidos; registro de accesos escrito por el servidor, con botón «Vaciar registro» y confirmación en el centro de la pantalla); permisos de proyectos iguales para todos (directorio también para trabajadores y relectura cada 60 s). Probado en local con dos navegadores; pendiente publicar en PRUEBA y, con visto bueno, en OFICIAL
- **18 sep (cierre):** plataforma OFICIAL instalada en `plataforma.hpgilatam.com` (base `wwwhpgilatam_vaakoficial`, administradora Datnya); no se migran datos (todo lo de Vercel era de prueba); reglas de trabajo PRUEBA → OFICIAL al inicio del documento
- **18 sep (noche):** en el hosting la carpeta corre PHP 8.2 pero sin pdo_mysql ni mbstring → el servidor pasa a mysqli (`nucleo/bd.php`) y reemplazos de mbstring; ZIP subido y extraído en `staging.hpgilatam.com/public`
- **18 sep (noche, 2):** actualización 3 — dirección del proveedor automática en la OC (BILL TO sigue siendo la del hotel), saldo de la OC en cada requerimiento de pago con número de OC en grande, aviso al pasarse (también en revisiones) y PO BALANCE / PO ALERT en el Excel. Actualización 2 confirmada en PRUEBA
- **18 sep (noche, 3):** actualización 3, tanda 2 (sin commit, pedido de Datnya): áreas por proyecto con «Ver áreas», área del spec filtrada, contacto del proyecto vinculado al equipo del cliente, título editable del valor CIF, «Especificado por» fijo
- **18 sep (noche, 4):** tanda 3 (sin commit): rubro del spec filtrado, unidad de medida en desplegable, borradores de OC restaurados completos, formularios que ya no vencen, PDF de la OC con márgenes y pie en todas las hojas, firmas compactas y texto justificado
- **18 sep (noche, 5):** tanda 4 (sin commit): pie de página con aviso en otros navegadores, requerimiento de pago con partes desde la OC, referencia solo con número, desglose con conceptos propios y monto a pagar sumado, «pagar a» bloqueado, formato A4 sin conceptos vacíos y PAYMENT TERMS en una línea, OC junto a la fecha en la tarjeta
- **18 sep (noche, 6):** tanda 5 (sin commit): botones «Cambio de…», spec cerrado solo con «Cambio de spec», OC con los datos del spec congelados, cambio de orden con más cantidad permitido, motivos y valores en azul en los tres formatos, reportes siempre al día, INVOICE NOTE, pendiente automático y campos propios en el registro del pago
- **20 sep (tarde):** actualización 5 — PDF sin el encabezado de Chrome, cambio de orden con todos los campos, términos de pago del RP desde la OC, montos que ya no se ven dobles, un cambio = un motivo y avisos que no se apilan
- **20 sep:** actualización 4 — «Preparado por» fijo, borradores sin pantallazo desordenado, márgenes y pie del PDF corregidos de raíz, condiciones enteras en una hoja, campos de varias líneas con Enter, lupa en la previsualización, «Partes» del RP bloqueadas y renombrado del formulario de requerimiento
- **19 sep:** oficial en internet con candado; actualizaciones 2 y 3 publicadas en PRUEBA y en OFICIAL; GitHub al día; copia de seguridad diaria preparada y probada (sin instalar)
- **18 sep (tarde):** subdominio de prueba confirmado (`staging.hpgilatam.com`); etapa 2 del traslado: servidor PHP + MySQL construido en `servidor-php/` y probado en local con la plataforma real (45 pruebas de rutas + recorrido en el navegador con administrador, trabajador y cliente)

Para el detalle de cualquier cambio, los mensajes de commit son extensos y explican el porqué:

```bash
git log --since=2026-09-15
```
