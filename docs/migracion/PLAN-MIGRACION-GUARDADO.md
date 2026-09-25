# Plan de la migración del guardado (25-sep-2026)

**Objetivo de Datnya:** poder registrar **5.000 specs y 5.000 órdenes de compra por proyecto**,
con 10 proyectos, sin que la plataforma deje de guardar.

**Condición innegociable:** **no se puede perder ni un dato** de los que ya están cargados.

---

## 1. Por qué hace falta

Hoy toda la empresa vive en **un solo documento JSON** (`vaak_company_data`). El navegador se
trae ese documento entero, lo guarda en `localStorage` y lo vuelve a enviar completo en cada
guardado. Eso pone tres techos:

| Techo | Dónde | Cuánto aguanta |
| --- | --- | --- |
| Tamaño del documento | servidor (`VAAK_MAX_ESTADO`) | 8 MB |
| Memoria de PHP al procesarlo | servidor | ~10 veces el tamaño del documento |
| Copia del navegador | `localStorage` | 5 a 10 MB según el navegador |

Medido con datos reales: un spec pesa ~520 bytes y una OC ~3,7 KB. El objetivo son unos
**211 MB**. No entra por ninguno de los tres lados: hay que cambiar **dónde** se guarda cada
registro y **cuánto** viaja en cada pantalla.

## 2. Las tres etapas

Cada etapa deja la plataforma funcionando y se publica por separado.

### Etapa 1 — Cada registro en su propia fila (sin tocar ninguna pantalla)

- Tabla nueva `vaak_company_records`: **una fila por spec, por orden de compra y por
  requerimiento de pago**, con su JSON completo.
- `PUT /api/data` guarda esos registros como filas y deja el documento solo con lo demás
  (proyectos, proveedores, usuarios, catálogos, objetivos).
- `GET /api/data` vuelve a armar exactamente el mismo estado de siempre.
- **La interfaz no cambia en nada.** Ni una pantalla, ni un campo, ni un botón.

**Qué se gana:** el documento deja de crecer con los registros, así que **el guardado ya no
falla nunca** por tamaño, y cada registro pasa a tener su fila propia (la base de todo lo que
sigue). **Qué NO se gana todavía:** el navegador sigue trayéndose todo, así que el techo real
sigue estando en los 5.000 specs y 1.000 OC de hoy.

### Etapa 2 — La app deja de traerse y mandar todo

- Rutas nuevas para pedir registros **por páginas y con búsqueda en el servidor**.
- La página del proyecto pide **solo los 5 últimos**; el cuadro «Ver todos…» pide de a 40,
  buscando y filtrando en el servidor. (Las pantallas ya están hechas así desde la
  actualización 14: solo cambia de dónde sacan los datos.)
- El navegador deja de guardar los registros en `localStorage`: solo guarda lo pequeño.

**Aquí es donde se llega a los 5.000 por proyecto.**

### Etapa 3 — Lo que hoy recorre todos los registros

Pasa al servidor: los reportes de Excel, el saldo de cada OC frente a sus requerimientos, la
numeración de OC y de requerimientos, el tope de cantidad por spec, el spec «cerrado» y el
filtrado por rol (portal del cliente y trabajadores).

## 3. Cómo se garantiza que no se pierde nada

1. **Se copia, no se mueve.** El documento original queda **intacto** hasta que la copia esté
   verificada, y su historial de 150 versiones sigue en `vaak_company_data_history`.
2. **Verificación campo por campo.** Terminada la copia, el servidor compara **cada registro**
   con el original (mismo id, mismos campos, mismo texto). Si uno solo no coincide, **la
   migración se deshace sola** (transacción) y no cambia nada.
3. **Respaldo descargado antes de empezar**, hecho por Datnya desde el cPanel.
4. **Ensayo previo con los datos reales** en la plataforma de PRUEBA (decisión del 25-sep-2026):
   se copia la base de la oficial a la de prueba y ahí se ensaya la migración completa.
5. **Vuelta atrás en minutos:** como el documento original sigue ahí, deshacer es volver a
   publicar el ZIP anterior.
6. **Horario sin gente trabajando** para el cambio en la oficial (decisión del 25-sep-2026).

## 4. Tabla nueva

```sql
CREATE TABLE vaak_company_records (
  company_id CHAR(36)     NOT NULL,
  kind       VARCHAR(16)  NOT NULL,   -- spec | order | invoice
  id         VARCHAR(120) NOT NULL,   -- el id del propio registro
  project_id VARCHAR(120) NOT NULL DEFAULT '',
  created_at VARCHAR(40)  NOT NULL DEFAULT '',  -- el del registro, para ordenar
  updated_at DATETIME(3)  NOT NULL,
  data       LONGTEXT     NOT NULL,   -- el registro completo, tal cual
  PRIMARY KEY (company_id, kind, id),
  KEY vaak_records_listado (company_id, kind, project_id, created_at)
);
```

Un solo camino de código para los tres tipos: menos sitios donde equivocarse.

## 5. Qué NO se toca

Pantallas, formularios, campos, cálculos, permisos, PDFs, Excel, revisiones con motivo,
numeración, portal del cliente. Todo eso está descrito campo por campo en
[`docs/campos/`](../campos/README.md) y esos documentos son la lista de comprobación: al
terminar cada etapa, todo lo que dicen tiene que seguir funcionando igual.

## 6. Cómo se comprueba cada etapa

- `bash servidor-php/pruebas/probar.sh` completo en verde (41 comprobaciones de seguridad y los
  11 pasos de pantalla).
- Paso nuevo de migración: se arma un documento con miles de registros, se migra, y se compara
  el estado devuelto con el original **byte a byte**.
- Prueba de volumen: 5.000 specs y 2.000 OC guardados y leídos sin error.

## 7. Cómo se ejecuta la etapa 1

La migración **no se hace con comandos**: la plataforma trae un botón. En **Herramientas →
Configuración del sistema** aparece, solo para el administrador, la tarjeta **«Guardado de la
plataforma»**, con la cuenta de cuántos registros hay en filas y cuántos siguen en el documento, y
dos botones: **«Pasar los registros a su propia fila»** y **«Volver atrás»**. Los dos preguntan
antes, comprueban solos y avisan en claro si algo no coincidió (`migracion-guardado.js`).

### Ensayo en la plataforma de PRUEBA (decidido el 25-sep-2026)

1. **Respaldo de la oficial.** cPanel → **phpMyAdmin** → base `wwwhpgilatam_vaakoficial` →
   pestaña **Exportar** → formato **SQL** (si pesa mucho, compresión **gzip**) → **Continuar**, y
   se guarda el archivo en la computadora de Datnya.
2. **Copiar esos datos a PRUEBA.** En phpMyAdmin, base `wwwhpgilatam_vaakprueba`: marcar todas
   sus tablas → **Eliminar** (para dejarla vacía) → pestaña **Importar** → elegir el archivo del
   paso 1 → **Continuar**.
3. **Publicar el paquete nuevo en PRUEBA**: subir y extraer el ZIP en
   `/staging.hpgilatam.com/public`. (`nucleo/config.php` no viene en el ZIP, así que la conexión
   de prueba se conserva.)
4. **Crear la tabla nueva**: phpMyAdmin → base de prueba → **Importar** →
   `servidor-php/sql/actualizacion-3-registros.sql`.
5. **Entrar a PRUEBA como administrador** → Herramientas → Configuración del sistema → tarjeta
   «Guardado de la plataforma» → comprobar los números → **«Pasar los registros a su propia
   fila»**.
6. **Revisar con calma**: proyectos, specs, órdenes de compra, requerimientos, reportes de Excel,
   PDFs y el portal del cliente.
7. Si algo no cuadra: **«Volver atrás»** en la misma tarjeta y se avisa.

### En la plataforma OFICIAL (en horario sin gente trabajando)

Respaldo nuevo del día → subir el ZIP a `/plataforma.hpgilatam.com` → importar
`actualizacion-3-registros.sql` → pulsar «Pasar los registros a su propia fila» → revisar.
**Vuelta atrás:** el mismo botón «Volver atrás» deja todo como estaba; si además se quiere volver
a la versión anterior de la plataforma, primero se pulsa «Volver atrás» y después se sube el ZIP
anterior.

## 8. Estado

| Etapa | Estado |
| --- | --- |
| 1 — registros en filas | en desarrollo (25-sep-2026) |
| 2 — páginas y búsqueda en el servidor | pendiente |
| 3 — reportes, saldos y numeración en el servidor | pendiente |
