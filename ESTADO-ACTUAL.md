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
| `purchase-order-template.js` | Formato imprimible de la OC |
| `payment-request-template.js` | Formato de la factura |
| `technical-sheet-template.js` | Formato de la ficha técnica del spec |
| `money-utils.js` | Dinero y **catálogo de 19 monedas** |
| `presentation.js` | Traductor automático es/en de nodos de texto |

### ⚠️ Dos trampas que te van a morder

**1. Al editar `index.html` sube el `?v=N`.** Si no, los navegadores sirven la versión vieja y parecerá que tu cambio no funcionó.

**2. En producción, los usuarios NO pasan por el motor local.** `staging-bridge.js` intercepta el formulario de usuarios y lo envía a `/api/admin/users` (Supabase). El handler `new-user` de `access-runtime.js` **no se ejecuta en producción**, solo en la demo local. Si escribes lógica en ese handler, funcionará en tu demo y fallará en producción. Ya pasó una vez con el alta de clientes en la tarjeta de equipo. Lo que dependa de usuarios debe **deducirse** de la lista de usuarios que llega del servidor, no escribirse en el momento de crearlos.

**3. Los PDF se generan con `window.print()`.** Chrome descarta los fondos de color al imprimir salvo que el CSS los pida con `print-color-adjust: exact`. Sin esa regla los formatos salen casi en blanco. Ya está puesta en los tres `*-reference.css`; si creas un formato nuevo, ponla también.

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
- **Revisiones:** el botón "Realizar revisión" está en la tarjeta de seguimiento de cada OC (dentro del proyecto), junto a Actualizar estado / Ver orden / Descargar. Crea Rev. 2, 3… con registro de qué cambió, por qué, quién y cuándo. El PDF lo imprime entre líneas de asteriscos. "Ver versiones" permite abrir cualquier versión anterior
- IGV fijo 18%; IVA y VAT con porcentaje editable según el país
- Descuentos y recargos manuales ilimitados (concepto + suma/resta + monto)
- Las líneas de impuesto y CIF desaparecen si están en cero
- La columna IMAGE aparece solo si algún spec tiene imagen
- Los specs ofrecidos son **solo los del proyecto**, y heredan cantidad, precio y moneda
- En el formulario de spec, «Proveedor / fuente» es un desplegable de los proveedores registrados; «Área» es un desplegable de los 65 rubros
- La ficha técnica compone la cantidad con la unidad (ej. «5 EACH») a partir de los campos «Cantidad» y «Unidad de medida». Existía un tercer campo, «Cantidad pedida», que repetía ambos y mandaba sobre ellos: se eliminó
- En la OC no se puede pedir más cantidad de la registrada en el spec: avisa en rojo y no deja emitir
- Contacto del proyecto configurable en Configuración del sistema, editable por documento

### Catálogo de rubros
**65 rubros:** 40 OS&E + 25 FF&E, agrupados y con código. Se administran en Configuración del sistema y alimentan: campo de spec, formulario de OC, y categorías de proveedor.

### Gestión de usuarios
Los usuarios conectados ahora (punto verde) se muestran primero. El reordenamiento vive en `staging-bridge.js`, dentro de `paintPresence`, porque la presencia solo la conoce el puente. En la demo local no hay presencia, así que ahí no se reordena.

### Requerimiento de pago
La sección financiera del proyecto se llama «Requerimiento de pago» y su botón «Emisión de nueva solicitud de pago». El resto de esa sección no cambió.

### Otros
- 19 monedas (Latinoamérica + dólar + euro). Sol y dólar se guardan con símbolo; el resto con código ISO
- Previsualizaciones en A4 real (794px) escaladas para caber
- **Los cuadros emergentes no se cierran al hacer clic fuera**, solo con Cerrar/Cancelar/X
- Usuarios cliente: sin interruptores de acceso, un solo proyecto, alta automática en la tarjeta de equipo

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
- El hook de `git-lfs` falla con un error de memoria después de cada commit. Es ruido, el commit se creó bien.

---

## 9. Historial

- **2 sep:** última actualización de `HANDOFF/` (59 documentos, ya obsoletos)
- **15 sep:** usuarios conectados a Supabase Auth
- **16 sep:** foto de perfil, presencia, campos de proyecto, datos compartidos entre usuarios
- **17 sep:** todo lo de la sección 6 (términos, revisiones, impuestos, monedas, A4, rubros, clientes, Tax ID, equipo del cliente automático, colores en los PDF, requerimiento de pago)

Para el detalle de cualquier cambio, los mensajes de commit son extensos y explican el porqué:

```bash
git log --since=2026-09-15
```
