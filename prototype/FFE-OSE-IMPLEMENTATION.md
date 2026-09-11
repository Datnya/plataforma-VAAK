# FF&E y OS&E — Lógica de equipos en VAAK

## Conceptos

### FF&E (Furniture, Fixtures & Equipment)
Equipo encargado de la adquisición de **mobiliario, accesorios fijos y equipamiento** del proyecto hotelero/inmobiliario. Incluye: muebles, iluminación, alfombras, cortinas, arte decorativo, equipos de cocina, electrodomésticos, etc.

### OS&E (Operating Supplies & Equipment)
Equipo encargado de la adquisición de **suministros operativos y equipamiento menor**. Incluye: blancos (sábanas, toallas), amenities, utensilios, cristalería, vajilla, productos de limpieza, uniformes, artículos de papelería, etc.

---

## Implementación en la plataforma

### 1. Asignación de equipo a usuarios trabajadores
- **Campo**: `team` en el objeto de usuario (`'FFE'` o `'OSE'`)
- **Formulario de nuevo usuario**: Cuando el tipo de usuario es `Worker`, aparece un campo desplegable para seleccionar el equipo: `FF&E` o `OS&E`
- **Formulario de edición de usuario**: El mismo campo aparece para editar el equipo de un trabajador existente
- **Tabla de gestión de usuarios**: Se muestra una columna `Equipo` entre `Tipo de usuario` y `Cargo`, con pills visuales para `FF&E` y `OS&E`
- **Admin y Client**: No tienen equipo asignado; el campo solo aparece para rol `Worker`

### 2. Órdenes de compra (OC) por equipo
- **Campo en formulario de OC**: Al crear una nueva OC, se muestra un campo desplegable obligatorio para seleccionar el tipo de OC: `FF&E` u `OS&E`
- **Campo almacenado**: `ocTeam` en el objeto de orden (`'FFE'` o `'OSE'`)
- **Cualquier trabajador o admin** puede crear OC de cualquier tipo, independientemente de su equipo asignado

### 3. Numeración separada
- **FF&E**: Prefijo `FFE-` → `FFE-0001`, `FFE-0002`, ...
- **OS&E**: Prefijo `OSE-` → `OSE-0001`, `OSE-0002`, ...
- Los contadores son **independientes**: la numeración de FF&E no afecta la de OS&E
- El cálculo se hace contando las OC existentes de cada tipo y sumando 1

### 4. Filtrado en historial de órdenes
- Se agrega un filtro desplegable en la vista de historial de órdenes: `Todos` / `FF&E` / `OS&E`
- El filtro funciona junto al buscador de texto existente

---

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `app.js` línea ~20 (función `users`) | Columna "Equipo" en tabla de usuarios |
| `app.js` línea ~45 (función `openAuthorizedOperation`, user-editor) | Campo "Equipo" en formulario nuevo/editar usuario |
| `app.js` línea ~49 (función `openAuthorizedOperation`, order-editor) | Campo "Tipo de OC" (FF&E/OS&E) en formulario de nueva OC |
| `access-runtime.js` línea ~28 (`new-user` commit) | Guardar campo `team` del usuario |
| `access-runtime.js` línea ~29 (`edit-user` commit) | Guardar campo `team` del usuario |
| `access-runtime.js` línea ~35 (`new-order` commit) | Numeración separada por equipo (`FFE-XXXX` / `OSE-XXXX`) y guardar `ocTeam` |
| `app.js` (historial de órdenes) | Filtro por equipo FF&E/OS&E |
| `refinements.css` | Estilos para pills de equipo |

---

## Formato del número de OC

```
FFE-0001   ← primera OC del equipo FF&E
FFE-0002   ← segunda OC del equipo FF&E
OSE-0001   ← primera OC del equipo OS&E
OSE-0002   ← segunda OC del equipo OS&E
```

El prefijo puede cambiar en el futuro (ej: `08-` para FF&E y `01-` para OS&E). Para cambiarlo, modificar la línea del `commit` de `new-order` en `access-runtime.js`.

---

## Datos en localStorage

```json
{
  "users": [
    { "id": "u1", "name": "Morgan", "role": "Worker", "team": "FFE", ... },
    { "id": "u2", "name": "Laura", "role": "Worker", "team": "OSE", ... }
  ],
  "orders": [
    { "id": "o1", "number": "FFE-0001", "ocTeam": "FFE", ... },
    { "id": "o2", "number": "OSE-0001", "ocTeam": "OSE", ... }
  ]
}
```
