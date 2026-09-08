# Guía de funcionalidades — Prototipo VAAK

> Documento de referencia para que cualquier IA o desarrollador pueda entender rápidamente el contexto, las secciones, herramientas y funcionalidades implementadas en el prototipo interactivo de la plataforma VAAK.

**Última actualización:** 2026-09-08

---

## 1. Información general

- **Tecnología:** Vanilla JS SPA (sin frameworks), HTML, CSS
- **Persistencia:** `localStorage` (clave principal: `vaak-local-v8`)
- **Servidor de desarrollo:** `npx serve prototype -l 4173` → `http://localhost:4173`
- **Archivos principales:**
  - `app.js` — Lógica principal de la aplicación
  - `refinements.css` — Estilos y layout
  - `access-control.js` — Sistema ACL (permisos, secciones, roles)
  - `access-runtime.js` — Motor de acciones protegidas (open/commit)
  - `access-test-fixtures.js` — Datos ficticios de demostración

---

## 2. Cuentas de demostración

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Admin | `admin.vaak` | `VAAKdemo!26` |
| Worker | `worker.vaak` | `VAAKdemo!26` |
| Client | `client.vaak` | `VAAKdemo!26` |
| Client 2 | `client2.vaak` | `VAAKdemo!26` |

---

## 3. Navegación principal

La barra superior contiene:
- **Logo VAAK** — Clic regresa al panel principal (home)
- **Panel principal** — Vista de proyectos
- **Herramientas** — Solo Admin: gestión de usuarios, proveedores, configuración, historial de OC, registro de acceso, presentación
- **Equipo** — Objetivos del equipo
- **Notificaciones** — Campana con badge que muestra cantidad de notificaciones no leídas; cada notificación tiene botón de eliminar (icono papelera) que persiste en `vaak-dismissed-notifs`
- **Foto de perfil** — Botón para cambiar foto
- **Cerrar sesión**

---

## 4. Panel principal (Home)

### Proyectos
- Tarjetas de proyecto con imagen, nombre, descripción y estado
- **Estados de proyecto:** Activo (verde), En standby (naranja), Deshabilitado (gris/rojo)
- **Filtro de proyectos:** Botón con icono que abre un dropdown para filtrar por estado (Todos, Activos, En standby, Deshabilitados)
- **Ordenamiento:** Los proyectos se ordenan automáticamente: activos primero, luego standby, luego deshabilitados
- **Nuevo proyecto:** Botón "＋ Nuevo proyecto" con formulario que incluye campo de código de proyecto editable
- **Tarjeta deshabilitada:** Se muestra con opacidad reducida (0.55) y texto "Deshabilitado" en rojo/negrita
- **Tarjeta standby:** Se muestra con opacidad reducida (0.75) y texto "En standby" en naranja

---

## 5. Vista de proyecto

Al hacer clic en una tarjeta de proyecto se abre su detalle con:

### 5.1 Cabecera
- Nombre del proyecto con título proporcionado
- Badge de estado (Activo/En standby/Deshabilitado) — Solo el Admin puede cambiar el estado mediante un modal con las 3 opciones y descripciones
- Código de proyecto (ID)

### 5.2 Banner/Carrusel de imágenes
- Imagen del proyecto con controles de navegación (‹ ›)
- Contador de imágenes
- Botón de editar imágenes (solo Admin)

### 5.3 Tarjetas de datos (3 columnas)

#### Datos generales
- Razón social, código del proyecto (editable inline), dirección fiscal, dirección de almacén, ciudad/país
- El código del proyecto se puede editar directamente en el campo de texto

#### Áreas del proyecto
- N° de habitaciones, N° de residencias, N° de áreas comunes

#### Equipo del cliente
- Lista de miembros con avatar, nombre, cargo, teléfono
- Botón para agregar miembro (solo Admin)
- Botón × para eliminar miembro (solo Admin)

### 5.4 Gestión del proyecto

#### Specs del proyecto
- Buscador por nombre, código o rubro
- Filtro por rubro (dropdown con todas las categorías)
- Tarjetas de spec con imagen, código, nombre, rubro, monto
- Botones: Editar, Ficha técnica
- Botón "Agregar nuevo spec"

#### Órdenes de compra
- Botón "Generar nueva orden de compra"
- Botón "Ver borradores" con badge de cantidad
- Filtros por estado: Todas, Aprobada, Anulada, Pendiente
- **Tracking cards** de cada OC con información de estado
- **Botón "Anular"** en órdenes aprobadas — Abre modal con campo obligatorio de motivo de anulación
- Órdenes anuladas muestran: quién anuló, fecha y hora, y botón "Motivo" para ver la razón completa

### 5.5 Zona de riesgo
- Solo Admin: botón para eliminar proyecto permanentemente

---

## 6. Herramientas (solo Admin)

### 6.1 Gestión de usuarios
- Tabla con columnas: nombre, email, tipo de usuario, equipo (FF&E/OS&E), cargo, estado
- Botón "Crear nuevo usuario"
- Editor de acceso por usuario con toggles de secciones
- **Workers:** Tienen acceso pre-habilitado (no toggleable) a Órdenes y Proveedores
- **Permiso void-orders:** Permiso configurable para que los workers puedan anular OC

### 6.2 Gestión de proveedores
- Tabla de proveedores con buscador
- Editor de proveedor con: RUC, razón social, contacto, dirección, teléfono, email, rubros
- **Rubros del proveedor:** Lista en columna única con checkboxes alineados a la izquierda
- Cada rubro tiene botón de eliminar (×)
- Botón "Agregar rubro" abre modal estilizado (no prompt del navegador) con campo de nombre

### 6.3 Configuración del sistema
- **Rubros de órdenes de compra:** Tabla colapsable con nombre, código y área de cada rubro
- Botón "Agregar rubro" abre modal con campos: Nombre, Código, Área (dropdown con todas las áreas registradas)
- Botón de eliminar (×) por cada rubro personalizado

### 6.4 Historial de órdenes de compra
- Tabla con columnas: N° OC, Proyecto, Proveedor, Monto, Estado, Fecha, **Motivo de anulación**, **Anulado por**
- Motivo de anulación: texto clicable (truncado a 30 caracteres) que abre modal con el texto completo
- Anulado por: muestra nombre del usuario, fecha y hora de anulación

### 6.5 Registro de acceso de clientes
- Historial de login de clientes con fecha, hora, nombre, cargo, proyecto vinculado
- Filtros por fecha y búsqueda por texto

### 6.6 Presentación
- Generación de presentaciones del proyecto

---

## 7. Equipo — Objetivos del equipo

### Vista principal
- Métricas: Objetivos activos, Pendientes, En proceso, Completados
- Filtros: Buscador, filtro por rol (Trabajadores/Administradores), filtro por estado
- Tabla con columnas: Objetivo, Asignado a, Rol, Estado, Progreso, Vence, Última actualización, Acciones

### Asignar objetivo (solo Admin)
- Formulario con campos:
  - Objetivo (texto, obligatorio)
  - Descripción (textarea)
  - **Asignado a:** Dropdown desplegable con checkboxes múltiples para seleccionar uno o varios usuarios, con opción "Seleccionar todos"
  - Fecha de vencimiento
  - Referencia
- Al asignar a múltiples usuarios, se crea una copia del objetivo para cada usuario seleccionado

### Editar objetivo
- Mismo formulario con campo de estado adicional: Pendiente (0%), En proceso (50%), Completado (100%)
- Los asignados actuales aparecen pre-seleccionados en los checkboxes

### Estado inline
- Admin y el usuario asignado pueden cambiar el estado directamente desde el dropdown en la tabla

### Alertas de vencimiento
- **Banner visual:** Cuando hay objetivos que vencen hoy o mañana, se muestra un banner amarillo/dorado en la parte superior de la tabla con la lista de objetivos próximos a vencer
- Admin ve todos los objetivos próximos a vencer (con nombre del asignado); el worker ve solo los suyos
- La fila del objetivo en la tabla también se resalta en rojo cuando vence hoy o mañana (clase `team-due-urgent`)
- **Notificaciones:** La campana también muestra badge con cantidad de objetivos próximos a vencer

### Sistema de emails de recordatorio (BACKEND-READY)
- Función `getUpcomingDeadlines(state)` — Identifica todos los objetivos que vencen hoy o mañana, con datos del asignado (nombre, email)
- Función `prepareDeadlineEmails(state)` — Genera los objetos de email listos para envío: destinatario, asunto, cuerpo del mensaje
- **Formato del email:**
  - Asunto: "⚠ Alerta VAAK — Objetivo próximo a vencer"
  - Cuerpo: Saludo personalizado, nombre del objetivo, fecha de vencimiento, estado (hoy/mañana), llamada a acción
- **Integración backend:** Cuando exista el backend Laravel, reemplazar el `console.log` en `prepareDeadlineEmails` por una llamada API `POST /api/deadline-reminders` que envíe los emails vía SMTP

### Eliminar objetivo
- Solo disponible para objetivos completados
- Modal de confirmación

---

## 8. Órdenes de compra

### Formulario de nueva OC
- Campos: proyecto, tipo (FF&E/OS&E), proveedor (dropdown), contacto (dropdown), moneda (PEN/USD), dirección de almacén
- **Numeración automática separada:** FFE-XXXX / OSE-XXXX
- **Rubros organizados por área** con checkboxes
- Ítems de la OC con: spec, cantidad, precio unitario, subtotal automático
- **Conversión USD/PEN** con tipo de cambio configurable
- **Borradores:** Se pueden guardar y retomar borradores de OC (persistidos en `vaak-oc-drafts`)

### Anulación de OC
- Botón "Anular" disponible en OC aprobadas (tanto en tracking de proyecto como en historial)
- Requiere campo obligatorio de motivo/razón de anulación
- Almacena: `voidReason`, `voidedBy` (usuario), `voidedAt` (fecha y hora)
- Visible tanto en el tracking del proyecto como en el historial general de órdenes

---

## 9. Sistema de permisos (ACL)

### Roles
- **Admin:** Acceso completo a todas las secciones y herramientas
- **Worker:** Acceso a proyectos asignados, órdenes (pre-habilitado), proveedores (pre-habilitado). Permisos configurables: void-orders
- **Client:** Acceso limitado a reportes y historial de OC de su proyecto vinculado

### Secciones configurables
- `section.orders` — Órdenes de compra (pre-habilitado para Workers)
- `section.suppliers` — Proveedores (pre-habilitado para Workers)
- `section.specs` — Specs del proyecto
- `section.team` — Equipo del proyecto
- `permission.void-orders` — Permiso para anular órdenes (configurable por Admin)

### Funcionamiento
- Admin puede toggle on/off cada sección para cada Worker/Client
- Las secciones `orders` y `suppliers` están siempre habilitadas para Workers (no se pueden desactivar)
- El sistema usa `access-runtime.js` con patrón open/commit para todas las acciones protegidas

---

## 10. Notificaciones

- Badge en la campana muestra cantidad de notificaciones no leídas
- Al abrir el panel de notificaciones, se ven las notificaciones con botón de eliminar (icono papelera)
- Las notificaciones eliminadas se persisten en `vaak-dismissed-notifs` en localStorage
- El badge se actualiza en tiempo real al eliminar notificaciones

---

## 11. Almacenamiento local (localStorage)

| Clave | Contenido |
|-------|-----------|
| `vaak-local-v8` | Estado principal: proyectos, usuarios, órdenes, specs, proveedores, tareas |
| `vaak-session-v6` | Sesión actual del usuario |
| `vaak-oc-drafts` | Borradores de órdenes de compra |
| `vaak-custom-oc-rubros` | Rubros personalizados de OC |
| `vaak-dismissed-notifs` | IDs de notificaciones eliminadas |
| `vaak-client-access-log` | Registro de acceso de clientes |

---

## 12. Archivos del prototipo

| Archivo | Función |
|---------|---------|
| `index.html` | Punto de entrada HTML |
| `app.js` | Lógica principal: vistas, handlers, renderizado |
| `styles.css` | Estilos base |
| `refinements.css` | Estilos adicionales, responsive, componentes |
| `access-control.js` | Definición de permisos, secciones, roles, ceilings |
| `access-runtime.js` | Motor de acciones open/commit, validación de permisos |
| `access-test-fixtures.js` | Datos ficticios para demostración |
| `reports.js` | Lógica de reportes |
| `presentation.js` | Generación de presentaciones |
| `sunat-proxy.js` | Proxy para consultas RUC a SUNAT (requiere token) |
| `FFE-OSE-IMPLEMENTATION.md` | Documentación de la lógica FF&E/OS&E |
| `VAAK-PROTOTYPE-GUIDE.md` | Este documento |
