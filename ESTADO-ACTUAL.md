# VAAK — Estado actual de la plataforma

> **Si eres un modelo de IA que acaba de llegar a este proyecto: lee este documento completo antes de tocar nada.**
> Es la única fuente de verdad sobre el estado de la plataforma. La carpeta `HANDOFF/` es histórica y está desactualizada desde el 2 de septiembre de 2026; no la uses para entender el estado actual.

**Última actualización:** 18 de septiembre de 2026
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

### 1. Todo cambio va primero a PRUEBA y solo después al OFICIAL
Orden obligatorio, sin excepciones:
1. Datnya pide el cambio.
2. Se hace **en el repositorio** (`staging/public/prototype/` para la interfaz, `servidor-php/` para el servidor) y se prueba **en local** (sección «Servidor PHP» más abajo).
3. Commit + push a `main`, con este documento actualizado en el mismo commit.
4. Se publica en **PRUEBA** (`staging.hpgilatam.com`).
5. **Datnya lo revisa en PRUEBA** y da el visto bueno.
6. Recién entonces se publica **exactamente lo mismo** en el **OFICIAL** (`plataforma.hpgilatam.com`).

**Prohibido:** probar cambios en el OFICIAL; editar archivos a mano en el cPanel (el código vive en GitHub y lo editado a mano se pierde en la siguiente publicación); publicar en el OFICIAL algo que Datnya no revisó en PRUEBA.

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
| 2 | Todo guardado en el hosting: borradores de OC y avisos descartados compartidos; registro de accesos de clientes en el servidor con botón «Vaciar registro»; permisos de proyectos iguales para todos (ver sección 7) | `actualizacion-2-registro-accesos.sql` (crea `vaak_client_access_log`) | ⏳ | ⏳ (solo después del visto bueno en PRUEBA) |

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

**Proyecto en curso: trasladar la plataforma al hosting oficial del cliente.** Aprobado por Datnya el 18-sep-2026.

La plataforma ya está terminada y probada en el entorno de prueba (Vercel + Supabase). Ahora hay que llevarla al hosting del cliente, que **no puede ejecutar Node.js** y solo ofrece **PHP + MySQL**. Por eso la parte de servidor se reescribe en PHP. Detalles técnicos y el inventario de lo que hay que reproducir: sección 7, «Traslado al hosting oficial».

### Etapas y avance

| # | Etapa | Quién | Estado |
|---|---|---|---|
| 1 | Preparar el hosting: subdominio **oficial** y subdominio de **prueba**, una base de datos MySQL para cada uno | Datnya, guiada | 🟡 **Subdominio de prueba confirmado (18-sep): `staging.hpgilatam.com`**, carpeta `/staging.hpgilatam.com/public`, responde por HTTPS y está vacía (solo `cgi-bin`). El dominio principal del cliente es `hpgilatam.com` (su web, en `/public_html` — **no tocar**); también existe `website.hpgilatam.com` (no es nuestro). **Base de datos de prueba creada (18-sep):** `wwwhpgilatam_vaakprueba`, usuario `wwwhpgilatam_vaak` con todos los privilegios (la contraseña la guarda Datnya; nunca va al chat ni al repositorio). Prefijo de la cuenta cPanel: `wwwhpgilatam_`. El cPanel está en español/inglés mezclado (el asistente se llama «Database Wizard»). **PHP:** la cuenta entera está en **PHP 7.3** (selector de CloudLinux, «Seleccionar versión de PHP»), y eso lo usa también la web del cliente: **no cambiarlo**. Nuestra carpeta pide PHP 8.2 sola con una línea en `servidor-php/publico/.htaccess` (`AddHandler application/x-httpd-alt-php82___lsphp .php`); **confirmado: la carpeta corre PHP 8.2.28** (LiteSpeed, `lsphp`). Pero la carpeta **solo carga las extensiones por defecto** (mysqli, mysqlnd, openssl, json…), **no las que se marquen en «Seleccionar versión de PHP» para 8.2** (se probó: marcar mbstring/pdo_mysql ahí no tiene efecto). Por eso el servidor **no usa PDO ni mbstring**: `nucleo/bd.php` da una capa mínima tipo PDO sobre **mysqli**, y `arranque.php` trae reemplazos de `mb_strtolower`/`mb_strlen` si falta mbstring. Probado en local con un PHP igual al del hosting (solo mysqli + openssl): las 45 pruebas bien y usuarios con acentos y mayúsculas. ⚠️ **En «Seleccionar versión de PHP» nunca pulsar «Aplicar»**: cambia la versión de toda la cuenta (la web del cliente, hpgilatam.com, usa PHP 7.3.33). Nota: la web que Datnya ve como «del cliente» también puede ser **hpginternational.com**, que está en **otro servidor** (IIS, 77.72.82.81) y nada del cPanel la afecta. Falta: definir el oficial (gratis si es subdominio de hpgilatam.com, p. ej. `plataforma.hpgilatam.com`; un dominio nuevo hay que comprarlo) |
| 2 | Construir el servidor PHP 8.2 + MySQL 8.0 con **las mismas rutas y respuestas** que `staging/app/api/*`, y probarlo completo en local | Claude | 🟢 Construido y probado en local (ver «Servidor PHP» abajo). Falta solo subirlo (etapa 3) |
| 3 | Subirlo al subdominio de prueba con una copia de los datos; Datnya lo revisa | Claude + Datnya | 🟡 **En curso** — ver «Dónde quedamos exactamente» justo debajo |
| 4 | ~~Trasladar los datos de Supabase~~ | — | ⛔ **No hace falta (decidido 18-sep):** Datnya confirmó que **todo lo que hay en Vercel/Supabase es de prueba** (proyectos, proveedores, usuarios). El cliente llenará sus datos reales en la plataforma oficial. No se copia nada |
| 5 | Publicar en el dominio oficial en un momento de baja actividad (≈1 hora sin usar la plataforma para la copia final) | Claude + Datnya | ⏳ |
| 6 | Publicación automática desde GitHub por FTP (prueba y oficial), retirar Vercel, actualizar este documento | Claude + Datnya | ⏳ |

### 📍 Dónde quedamos exactamente (18-sep, noche)
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
| `payment-request-template.js` | Formato del requerimiento de pago (solicitud de pago) |
| `reports.js` | Reportes Excel de OC y de requerimientos de pago (estilos en `assets/reports/*.xml`) |
| `technical-sheet-template.js` | Formato de la ficha técnica del spec |
| `money-utils.js` | Dinero y **catálogo de 19 monedas** |
| `presentation.js` | Traductor automático es/en de nodos de texto |

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
`presentation.js` traduce el texto de la pantalla palabra por palabra; por eso un usuario llamado «Rosa Cliente» aparece como «Rosa Client» en la lista de usuarios (en la base de datos el nombre está bien). Pasa igual en Vercel. Pendiente de consultar con Datnya si se corrige.

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
- **18 sep (tarde):** subdominio de prueba confirmado (`staging.hpgilatam.com`); etapa 2 del traslado: servidor PHP + MySQL construido en `servidor-php/` y probado en local con la plataforma real (45 pruebas de rutas + recorrido en el navegador con administrador, trabajador y cliente)

Para el detalle de cualquier cambio, los mensajes de commit son extensos y explican el porqué:

```bash
git log --since=2026-09-15
```
