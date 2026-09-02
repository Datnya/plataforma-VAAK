---
artifact_type: ENTREGA
phase: "ui_access"
ref: "VAAK-UI-ACCESS-4-A"
from: Codex
to: human
status: implemented_local
blocking: false
created_at: "2026-09-01"
---

# ENTREGA — Reconstrucción fiel y control de accesos

Implementación autorizada completada únicamente en `prototype/`. No hubo deploy ni cambios en staging.

## Resultado

- Se reconstruyeron Login, Dashboard, Herramientas, Equipo, detalle de proyecto, Usuarios, Proveedores, Specs, Historial de OC y Configuración con las capas visuales aprobadas.
- Gestión de usuarios mantiene `Editar`, `Editar accesos` y habilitar/deshabilitar como acciones separadas.
- El editor muestra exactamente siete permisos para Worker/Client; Admin es inmutable y conserva acceso total, incluida Configuración.
- Alcance de proyectos admite selección explícita o `Todos los proyectos actuales y futuros`.
- La sesión es independiente por pestaña y los cambios de acceso se propagan inmediatamente mediante el STORE compartido.
- El formulario de OC conserva moneda, ítems dinámicos, previsualización y datos al volver.

## Verificación

- `node --check` en los cuatro scripts principales: PASS.
- `access-control.test.js`: PASS.
- `access-runtime.test.js`: PASS.
- `access-acceptance.test.js`: PASS.
- Prueba visual local Admin/Worker: al retirar Equipo al Worker, su pestaña abierta salió inmediatamente de Equipo y volvió a Panel principal; al restaurarlo, la navegación reapareció.
- La suite de evidencia 3-C no se usa como gate visual porque captura la interfaz regresiva sustituida.

## Límite aceptado

El `app.js` pre-3-C byte-equivalente no estaba disponible. La humana autorizó una reconstrucción fiel basada en estilos, catálogos, capturas y comportamiento verificable.
